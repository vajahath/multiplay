import { GameConfig } from './game-config';
import type { Fact, Question } from './types';

/**
 * Calculates the change in confidence based on performance.
 * 
 * TIERED FLUENCY SYSTEM:
 * - Slow (>6s):   +10%, capped at 70%  — Learning the fact
 * - Normal (3-6s): +20%, capped at 85% — Building speed  
 * - Fast (<3s):   +30%, no cap         — True fluency, can reach 95% mastery
 * 
 * This ensures "Mastered" truly means instant recall, not just understanding.
 */
export function calculateConfidenceUpdate(
    currentConfidence: number,
    isCorrect: boolean,
    timeTaken: number
): { newConfidence: number; delta: number } {
    let delta = 0;
    let confidenceCap: number | null = null; // No cap by default

    if (isCorrect) {
        if (timeTaken < GameConfig.TIME_THRESHOLD_FAST) {
            // Fast and correct - big boost, NO CAP!
            delta = GameConfig.CONFIDENCE_BOOST_FAST;
            // Fast answers can reach full mastery
        } else if (timeTaken < GameConfig.TIME_THRESHOLD_SLOW) {
            // Normal speed - good boost, but capped at 85%
            delta = GameConfig.CONFIDENCE_BOOST_NORMAL;
            confidenceCap = GameConfig.NORMAL_CONFIDENCE_CAP;
        } else {
            // Slow but correct - small boost, capped at 70%
            delta = GameConfig.CONFIDENCE_DECAY_SLOW;
            confidenceCap = GameConfig.SLOW_CONFIDENCE_CAP;
        }
    } else {
        delta = GameConfig.CONFIDENCE_PENALTY_WRONG;
    }

    let newConfidence = Math.max(0.0, Math.min(1.0, currentConfidence + delta));

    // Apply fluency cap if applicable
    if (confidenceCap !== null && newConfidence > confidenceCap) {
        newConfidence = confidenceCap;
    }

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

/**
 * Adaptive Table Progression System
 * 
 * Checks if the user has mastered enough facts in their current tables
 * to warrant automatically unlocking a new table.
 * 
 * Strategy:
 * 1. Calculate total facts available from currently enabled tables
 * 2. Calculate how many of those are MASTERED
 * 3. If mastery rate >= threshold, find the next table in the unlock order
 * 4. Return the table to unlock, or null if none needed
 */
export function checkAdaptiveTableProgression(
    facts: Fact[],
    enabledTables: number[],
    maxFactor: number
): number | null {
    // Get facts that belong to currently enabled tables
    const currentTableFacts = facts.filter(f =>
        (enabledTables.includes(f.factors[0]) || enabledTables.includes(f.factors[1])) &&
        f.factors[0] <= maxFactor &&
        f.factors[1] <= maxFactor &&
        f.status !== 'LOCKED'
    );

    if (currentTableFacts.length === 0) {
        return null;
    }

    // Count mastered facts
    const masteredCount = currentTableFacts.filter(f => f.status === 'MASTERED').length;
    const masteryRate = masteredCount / currentTableFacts.length;

    // Check if we've hit the threshold
    if (masteryRate < GameConfig.AUTO_UNLOCK_MASTERY_THRESHOLD) {
        return null;
    }

    // Find the next table to unlock based on pedagogical order
    const unlockOrder = GameConfig.TABLE_UNLOCK_ORDER;

    for (const table of unlockOrder) {
        if (!enabledTables.includes(table) && table <= maxFactor) {
            // Found a table that's in our unlock order but not yet enabled
            return table;
        }
    }

    // All tables are already enabled
    return null;
}
