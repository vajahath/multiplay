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
 * Selects the next question from ACTIVE facts only.
 * Heavily prioritizes the weakest facts to drive them to mastery faster.
 */
export function selectNextQuestion(facts: Fact[], enabledTables: number[], maxFactor: number): Question {
    // Only pick from ACTIVE facts (not LOCKED, not MASTERED)
    const activeFacts = facts.filter(f =>
        f.status === 'ACTIVE' &&
        (enabledTables.includes(f.factors[0]) || enabledTables.includes(f.factors[1])) &&
        f.factors[0] <= maxFactor &&
        f.factors[1] <= maxFactor
    );

    if (activeFacts.length === 0) {
        // Fallback to any eligible fact
        const fallback = facts.find(f =>
            f.status !== 'LOCKED' &&
            (enabledTables.includes(f.factors[0]) || enabledTables.includes(f.factors[1])) &&
            f.factors[0] <= maxFactor && f.factors[1] <= maxFactor
        );
        if (!fallback) throw new Error("No facts available for the selected tables.");
        return {
            id: fallback.id,
            factors: fallback.factors,
            timeoutMs: GameConfig.TIME_THRESHOLD_SLOW
        };
    }

    // Sort by confidence (lowest first) - focus on weakest
    const sortedByConfidence = [...activeFacts].sort((a, b) => a.confidence - b.confidence);

    const roll = Math.random() * 100;
    let selected: Fact;

    // 80% chance: Pick from the 3 weakest facts (intense focus!)
    if (roll < 80 && sortedByConfidence.length > 0) {
        const weakest = sortedByConfidence.slice(0, Math.min(3, sortedByConfidence.length));
        selected = weakest[Math.floor(Math.random() * weakest.length)];
    } else {
        // 20% chance: Pick any active fact (variety)
        selected = sortedByConfidence[Math.floor(Math.random() * sortedByConfidence.length)];
    }

    return {
        id: selected.id,
        factors: selected.factors,
        timeoutMs: GameConfig.TIME_THRESHOLD_SLOW
    };
}
