import { Storage, setStorageProfileId, getStorageProfileId } from './storage';
import { GameConfig } from './game-config';
import { calculateConfidenceUpdate, selectNextQuestion, checkAdaptiveTableProgression } from './srs-algorithm';
import { migrateLegacyData } from '../lib/db/migrate-legacy';
import type { Fact, Question, AnswerResult } from './types';

export class GameEngine {
    private facts: Map<string, Fact> = new Map();
    private enabledTables: number[] = GameConfig.DEFAULT_ENABLED_TABLES;
    private maxFactor: number = GameConfig.DEFAULT_MAX_FACTOR;
    private roundLength: number = GameConfig.DEFAULT_ROUND_LENGTH;
    private bestStreak: number = 0;
    private answerCount: number = 0;

    /**
     * Initializes the engine, loading facts from storage or generating defaults.
     * @param profileId - The profile ID to scope all data operations
     */
    async init(profileId: string): Promise<void> {
        // CRITICAL: Set the profile ID for storage operations FIRST
        setStorageProfileId(profileId);

        // Migrate any data from old idb-keyval stores
        await migrateLegacyData();

        let savedFacts = await Storage.getAllFacts();

        if (savedFacts.length === 0) {
            savedFacts = this.generateInitialFacts();
            await Storage.saveFacts(savedFacts);
        }

        this.facts.clear();
        savedFacts.forEach(f => this.facts.set(f.id, f));

        this.enabledTables = await Storage.getSetting<number[]>('enabledTables') || GameConfig.DEFAULT_ENABLED_TABLES;
        this.maxFactor = await Storage.getSetting<number>('maxFactor') || GameConfig.DEFAULT_MAX_FACTOR;
        this.roundLength = await Storage.getSetting<number>('roundLength') || GameConfig.DEFAULT_ROUND_LENGTH;
        this.bestStreak = await Storage.getSetting<number>('bestStreak') || 0;
    }

    private generateInitialFacts(): Fact[] {
        const facts: Fact[] = [];
        for (let i = 0; i <= 12; i++) {
            for (let j = 0; j <= 12; j++) {
                const id = `${i}x${j}`;
                // Start ALL as LOCKED - we'll unlock a controlled set
                facts.push({
                    id,
                    factors: [i, j],
                    confidence: GameConfig.INITIAL_CONFIDENCE,
                    latencyAvg: 0,
                    lastPracticed: 0,
                    status: 'LOCKED'
                });
            }
        }
        return facts;
    }

    /**
     * Ensures we have exactly ACTIVE_SET_SIZE facts in practice.
     * Prioritizes easy facts (0s, 1s, 10s) first, then progresses to harder ones.
     */
    private async ensureActiveSetSize(): Promise<void> {
        const eligibleFacts = Array.from(this.facts.values()).filter(f =>
            (this.enabledTables.includes(f.factors[0]) || this.enabledTables.includes(f.factors[1])) &&
            f.factors[0] <= this.maxFactor &&
            f.factors[1] <= this.maxFactor
        );

        const activeFacts = eligibleFacts.filter(f => f.status === 'ACTIVE');
        const lockedFacts = eligibleFacts.filter(f => f.status === 'LOCKED');

        // Sort locked facts by difficulty (0s, 1s, 10s first, then by product)
        lockedFacts.sort((a, b) => {
            const aEasy = [0, 1, 10].includes(a.factors[0]) || [0, 1, 10].includes(a.factors[1]);
            const bEasy = [0, 1, 10].includes(b.factors[0]) || [0, 1, 10].includes(b.factors[1]);
            if (aEasy && !bEasy) return -1;
            if (!aEasy && bEasy) return 1;
            return (a.factors[0] * a.factors[1]) - (b.factors[0] * b.factors[1]);
        });

        // Unlock facts until we have ACTIVE_SET_SIZE
        const slotsNeeded = GameConfig.ACTIVE_SET_SIZE - activeFacts.length;
        for (let i = 0; i < slotsNeeded && i < lockedFacts.length; i++) {
            lockedFacts[i].status = 'ACTIVE';
            lockedFacts[i].confidence = GameConfig.INITIAL_CONFIDENCE;
            await Storage.updateFact(lockedFacts[i]);
        }
    }

    /**
     * Gets the next question based on the SRS algorithm.
     */
    async getNextQuestion(): Promise<Question> {
        await this.ensureActiveSetSize();
        const factsList = Array.from(this.facts.values());
        return selectNextQuestion(factsList, this.enabledTables, this.maxFactor);
    }

    /**
     * Processes a user's answer and updates the internal state.
     */
    async submitAnswer(questionId: string, answer: number, timeTaken: number): Promise<AnswerResult> {
        const fact = this.facts.get(questionId);
        if (!fact) throw new Error('Fact not found');

        const correctAnswer = fact.factors[0] * fact.factors[1];
        const isCorrect = answer === correctAnswer;

        const { newConfidence, delta } = calculateConfidenceUpdate(fact.confidence, isCorrect, timeTaken);

        fact.confidence = newConfidence;
        // Moving average for latency
        fact.latencyAvg = fact.latencyAvg === 0 ? timeTaken : (fact.latencyAvg * 0.7 + timeTaken * 0.3);
        fact.lastPracticed = Date.now();

        let isMasteredEvent = false;
        if (fact.status === 'ACTIVE' && fact.confidence >= GameConfig.MASTERED_THRESHOLD) {
            fact.status = 'MASTERED';
            isMasteredEvent = true;
        }

        await Storage.updateFact(fact);

        this.answerCount++;
        if (this.answerCount % 5 === 0) {
            await this.checkProgression();
        }

        return {
            isCorrect,
            correctAnswer,
            timeTaken,
            newConfidence,
            deltaConfidence: delta,
            isMasteredEvent
        };
    }

    /**
     * Called periodically to maintain the active practice set.
     * When a fact is mastered, ensureActiveSetSize will fill the slot.
     * Also checks if we should auto-unlock a new table based on mastery progress.
     */
    private async checkProgression() {
        await this.ensureActiveSetSize();

        // Check adaptive table progression
        const newTable = checkAdaptiveTableProgression(
            Array.from(this.facts.values()),
            this.enabledTables,
            this.maxFactor
        );

        if (newTable !== null && !this.enabledTables.includes(newTable)) {
            this.enabledTables = [...this.enabledTables, newTable];
            await Storage.setSetting('enabledTables', this.enabledTables);
        }
    }

    /**
     * Public method to check and apply table progression.
     * Returns the newly unlocked table number, or null if none was unlocked.
     * Useful for UI notifications at round end.
     */
    async checkAndApplyTableProgression(): Promise<number | null> {
        await this.ensureActiveSetSize();

        const newTable = checkAdaptiveTableProgression(
            Array.from(this.facts.values()),
            this.enabledTables,
            this.maxFactor
        );

        if (newTable !== null && !this.enabledTables.includes(newTable)) {
            this.enabledTables = [...this.enabledTables, newTable];
            await Storage.setSetting('enabledTables', this.enabledTables);
            return newTable;
        }

        return null;
    }

    async setEnabledTables(tables: number[]): Promise<void> {
        this.enabledTables = tables;
        await Storage.setSetting('enabledTables', tables);
    }

    async getEnabledTables(): Promise<number[]> {
        return this.enabledTables;
    }

    async setMaxFactor(value: number): Promise<void> {
        this.maxFactor = value;
        await Storage.setSetting('maxFactor', value);
    }

    async getMaxFactor(): Promise<number> {
        return this.maxFactor;
    }

    async setRoundLength(value: number): Promise<void> {
        this.roundLength = value;
        await Storage.setSetting('roundLength', value);
    }

    async getRoundLength(): Promise<number> {
        return this.roundLength;
    }

    async setBestStreak(value: number): Promise<void> {
        this.bestStreak = value;
        await Storage.setSetting('bestStreak', value);
    }

    async getBestStreak(): Promise<number> {
        return this.bestStreak;
    }

    async getAllFacts(): Promise<Fact[]> {
        return Array.from(this.facts.values());
    }

    /**
     * Resets all user progress - clears facts and settings, then reinitializes.
     * Uses the currently set profile ID.
     */
    async resetProgress(): Promise<void> {
        // Get currentProfileId from storage module
        const currentProfileId = getStorageProfileId();

        await Storage.clearAll();
        this.facts.clear();
        this.enabledTables = GameConfig.DEFAULT_ENABLED_TABLES;
        this.maxFactor = GameConfig.DEFAULT_MAX_FACTOR;
        this.roundLength = GameConfig.DEFAULT_ROUND_LENGTH;
        this.bestStreak = 0;
        this.answerCount = 0;
        await this.init(currentProfileId);
    }
}

