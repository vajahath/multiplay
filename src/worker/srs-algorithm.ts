import { GameConfig } from './game-config';
import type { Fact, Question } from './types';

/**
 * Calculates the change in confidence based on performance.
 */
export function calculateConfidenceUpdate(
    currentConfidence: number,
    isCorrect: boolean,
    timeTaken: number
): { newConfidence: number; delta: number } {
    let delta = 0;

    if (isCorrect) {
        if (timeTaken < GameConfig.TIME_THRESHOLD_FAST) {
            // Fast and correct - big boost!
            delta = GameConfig.CONFIDENCE_BOOST_FAST;
        } else if (timeTaken < GameConfig.TIME_THRESHOLD_SLOW) {
            // Normal speed - good boost
            delta = GameConfig.CONFIDENCE_BOOST_NORMAL;
        } else {
            // Slow but correct - small boost (still positive!)
            delta = GameConfig.CONFIDENCE_DECAY_SLOW;
        }
    } else {
        delta = GameConfig.CONFIDENCE_PENALTY_WRONG;
    }

    const newConfidence = Math.max(0.0, Math.min(1.0, currentConfidence + delta));
    return { newConfidence, delta: newConfidence - currentConfidence };
}

/**
 * Selects the next question using a weighted probability distribution.
 * 
 * The algorithm categorizes facts into three pools:
 * 1. WEAK POOL: The N lowest-confidence ACTIVE facts (intensive drilling)
 * 2. MASTERED POOL: Facts that have been mastered (reinforcement)
 * 3. LEARNING POOL: Remaining ACTIVE facts not in weak pool (variety)
 * 
 * Selection weights are configurable via GameConfig.
 */
export function selectNextQuestion(facts: Fact[], enabledTables: number[], maxFactor: number): Question {
    // Helper to check if a fact is eligible based on current settings
    const isEligible = (f: Fact) =>
        (enabledTables.includes(f.factors[0]) || enabledTables.includes(f.factors[1])) &&
        f.factors[0] <= maxFactor &&
        f.factors[1] <= maxFactor;

    // Categorize facts into pools
    const activeFacts = facts.filter(f => f.status === 'ACTIVE' && isEligible(f));
    const masteredFacts = facts.filter(f => f.status === 'MASTERED' && isEligible(f));

    // Sort active facts by confidence (lowest first)
    const sortedActive = [...activeFacts].sort((a, b) => a.confidence - b.confidence);

    // Create the pools
    const weakPool = sortedActive.slice(0, Math.min(GameConfig.WEAK_POOL_SIZE, sortedActive.length));
    const learningPool = sortedActive.slice(GameConfig.WEAK_POOL_SIZE); // Remaining active facts

    // Fallback if no facts available
    if (activeFacts.length === 0 && masteredFacts.length === 0) {
        const fallback = facts.find(f => f.status !== 'LOCKED' && isEligible(f));
        if (!fallback) throw new Error("No facts available for the selected tables.");
        return {
            id: fallback.id,
            factors: fallback.factors,
            timeoutMs: GameConfig.TIME_THRESHOLD_SLOW
        };
    }

    // Roll the dice (0-100)
    const roll = Math.random() * 100;
    let selected: Fact | undefined;

    // Calculate cumulative thresholds
    const weakThreshold = GameConfig.WEIGHT_WEAK_ITEMS;
    const masteredThreshold = weakThreshold + GameConfig.WEIGHT_MASTERED_REVIEW;
    // learningThreshold would be 100

    if (roll < weakThreshold && weakPool.length > 0) {
        // 60%: Pick from weak pool (lowest confidence items)
        selected = weakPool[Math.floor(Math.random() * weakPool.length)];
    } else if (roll < masteredThreshold && masteredFacts.length > 0) {
        // 20%: Pick from mastered pool (reinforcement)
        // Optionally sort by time since last practice, but random is fine for now
        selected = masteredFacts[Math.floor(Math.random() * masteredFacts.length)];
    } else if (learningPool.length > 0) {
        // 20%: Pick from learning pool (variety)
        // This pool is already sorted by confidence, so lower confidence items are first
        selected = learningPool[Math.floor(Math.random() * learningPool.length)];
    }

    // Final fallback: if selected pool was empty, pick from any available
    if (!selected) {
        const allAvailable = [...activeFacts, ...masteredFacts];
        if (allAvailable.length === 0) {
            throw new Error("No facts available for the selected tables.");
        }
        selected = allAvailable[Math.floor(Math.random() * allAvailable.length)];
    }

    return {
        id: selected.id,
        factors: selected.factors,
        timeoutMs: GameConfig.TIME_THRESHOLD_SLOW
    };
}


