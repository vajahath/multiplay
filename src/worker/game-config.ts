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
    CONFIDENCE_BOOST_SLOW: 0.10,   // +10% for slow correct (learning facts)
    CONFIDENCE_PENALTY_SLOW: -0.15, // -15% penalty for slow answer on high-confidence facts (fluency regression)
    CONFIDENCE_PENALTY_WRONG: -0.40, // -40% penalty for wrong

    // FLUENCY GATES - Each speed tier has a maximum confidence ceiling
    // To reach mastery, you MUST answer fast (<3s)
    SLOW_CONFIDENCE_CAP: 0.70,     // Slow answers cap at 70%
    NORMAL_CONFIDENCE_CAP: 0.85,   // Normal speed answers cap at 85%
    // Fast answers have no cap - can reach 95% mastery

    // QUESTION SELECTION WEIGHTS (must sum to 100)
    // Controls the probability distribution for selecting the next question
    WEIGHT_WEAK_ITEMS: 50,         // 50% chance: Pick from weakest confidence items (intensive drilling)
    WEIGHT_MASTERED_REVIEW: 30,    // 30% chance: Pick from mastered items (reinforcement to prevent decay)
    WEIGHT_LEARNING_VARIETY: 20,   // 20% chance: Pick from remaining learning set (variety)

    // How many "weakest" items to consider for the weak pool
    WEAK_POOL_SIZE: 5,

    // DEFAULT SETTINGS
    DEFAULT_ENABLED_TABLES: [1, 2, 3, 5, 10],
    DEFAULT_MAX_FACTOR: 10,
    DEFAULT_ROUND_LENGTH: 10,

    // ADAPTIVE TABLE PROGRESSION
    // Tables ordered by pedagogical difficulty (not numerically)
    // Starter: Pattern-based tables kids learn first
    // Easy: Simple extensions (4 = double of 2, 11 has pattern)
    // Medium: Trickier but learnable (9 finger trick, 6 builds on 3)
    // Hard: Least patterned, most challenging
    TABLE_UNLOCK_ORDER: [1, 2, 3, 5, 10, 4, 11, 9, 6, 7, 8, 12, 0],

    // Minimum mastery percentage of current tables before auto-unlocking next
    AUTO_UNLOCK_MASTERY_THRESHOLD: 0.65, // 65% of current facts mastered
};

