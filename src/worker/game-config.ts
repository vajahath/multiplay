export const GameConfig = {
    // PRACTICE SET - Control how many facts are active at once
    ACTIVE_SET_SIZE: 15,           // Only 15 facts practicing at a time

    // PROGRESSION
    UNLOCK_THRESHOLD: 0.70,
    INITIAL_CONFIDENCE: 0.0,
    MASTERED_THRESHOLD: 0.95,      // True fluency required (95%)

    // TIMING (ms)
    TIME_THRESHOLD_FAST: 3000,     // Under 3s = Fast (fluent recall)
    TIME_THRESHOLD_SLOW: 6000,     // Over 6s = Slow (still calculating)

    // CONFIDENCE SCORING
    CONFIDENCE_BOOST_FAST: 0.30,   // +30% for fast correct
    CONFIDENCE_BOOST_NORMAL: 0.20, // +20% for normal speed correct
    CONFIDENCE_DECAY_SLOW: 0.10,   // +10% for slow correct
    CONFIDENCE_PENALTY_WRONG: -0.40, // -40% penalty for wrong

    // FLUENCY GATES - Each speed tier has a maximum confidence ceiling
    // To reach mastery, you MUST answer fast (<3s)
    SLOW_CONFIDENCE_CAP: 0.70,     // Slow answers cap at 70%
    NORMAL_CONFIDENCE_CAP: 0.85,   // Normal speed answers cap at 85%
    // Fast answers have no cap - can reach 95% mastery

    // QUESTION SELECTION WEIGHTS (must sum to 100)
    // Controls the probability distribution for selecting the next question
    WEIGHT_WEAK_ITEMS: 60,         // 60% chance: Pick from weakest confidence items (intensive drilling)
    WEIGHT_MASTERED_REVIEW: 20,    // 20% chance: Pick from mastered items (reinforcement to prevent decay)
    WEIGHT_LEARNING_VARIETY: 20,   // 20% chance: Pick from remaining learning set (variety)

    // How many "weakest" items to consider for the weak pool
    WEAK_POOL_SIZE: 5,

    // DEFAULT SETTINGS
    DEFAULT_ENABLED_TABLES: [1, 2, 5, 10],
    DEFAULT_MAX_FACTOR: 10,
    DEFAULT_ROUND_LENGTH: 10,
};

