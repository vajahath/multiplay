import { engine } from './gameEngine';
import type { Question, AnswerResult, Fact } from '../../worker/types';

class GameStore {
    currentQuestion = $state<Question | null>(null);
    isInitializing = $state(true);
    isAnswering = $state(false);
    lastResult = $state<AnswerResult | null>(null);
    allFacts = $state<Fact[]>([]);
    enabledTables = $state<number[]>([]);
    maxFactor = $state(10);
    roundLength = $state(10);
    bestStreak = $state(0);
    currentProfileId = $state<string>('');

    /**
     * Initialize the game with a specific profile
     */
    async init(profileId: string) {
        this.isInitializing = true;
        this.currentProfileId = profileId;

        // Pass profileId to engine - it runs in a worker and will set storage profile ID there
        await engine.init(profileId);
        this.enabledTables = await engine.getEnabledTables();
        this.maxFactor = await engine.getMaxFactor();
        this.roundLength = await engine.getRoundLength();
        this.bestStreak = await engine.getBestStreak();
        await this.refreshFacts();
        await this.nextQuestion();
        this.isInitializing = false;
    }

    /**
     * Switch to a different profile
     */
    async switchProfile(profileId: string) {
        this.isInitializing = true;
        this.currentProfileId = profileId;

        // Reinitialize with new profile data
        await engine.init(profileId);
        this.enabledTables = await engine.getEnabledTables();
        this.maxFactor = await engine.getMaxFactor();
        this.roundLength = await engine.getRoundLength();
        this.bestStreak = await engine.getBestStreak();
        await this.refreshFacts();
        await this.nextQuestion();
        this.isInitializing = false;
    }

    async nextQuestion() {
        this.currentQuestion = await engine.getNextQuestion();
        this.isAnswering = false;
    }

    async submitAnswer(answer: number, timeTaken: number) {
        if (!this.currentQuestion || this.isAnswering) return;

        this.isAnswering = true;
        const result = await engine.submitAnswer(this.currentQuestion.id, answer, timeTaken);
        this.lastResult = result;

        await this.refreshFacts();
        return result;
    }

    async refreshFacts() {
        this.allFacts = await engine.getAllFacts();
    }

    async setEnabledTables(tables: number[]) {
        await engine.setEnabledTables(tables);
        this.enabledTables = tables;
        await this.nextQuestion(); // Refresh question for new tables
    }

    async setMaxFactor(value: number) {
        await engine.setMaxFactor(value);
        this.maxFactor = value;
        await this.nextQuestion();
    }

    async setRoundLength(value: number) {
        await engine.setRoundLength(value);
        this.roundLength = value;
    }

    async setBestStreak(value: number) {
        await engine.setBestStreak(value);
        this.bestStreak = value;
    }

    async resetProgress() {
        this.isInitializing = true;
        await engine.resetProgress();
        this.enabledTables = await engine.getEnabledTables();
        this.maxFactor = await engine.getMaxFactor();
        this.roundLength = await engine.getRoundLength();
        this.bestStreak = await engine.getBestStreak();
        await this.refreshFacts();
        await this.nextQuestion();
        this.isInitializing = false;
    }
}

export const game = new GameStore();

