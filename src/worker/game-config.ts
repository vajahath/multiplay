export const GameConfig = {
    // PRACTICE SET - Control how many facts are active at once
    ACTIVE_SET_SIZE: 15,           // Only 8 facts practicing at a time

    // PROGRESSION
    UNLOCK_THRESHOLD: 0.70,
    INITIAL_CONFIDENCE: 0.0,
    MASTERED_THRESHOLD: 0.85,      // Easier to master (was 0.90)

    // TIMING (ms)
    TIME_THRESHOLD_FAST: 3000,
    TIME_THRESHOLD_SLOW: 6000,

    // CONFIDENCE SCORING - More aggressive!
    CONFIDENCE_BOOST_FAST: 0.35,   // +35% for fast correct (was 0.25) - Master in ~3 fast answers
    CONFIDENCE_BOOST_NORMAL: 0.25, // +25% for normal speed correct
    CONFIDENCE_DECAY_SLOW: 0.10,   // +10% even for slow correct (still progress!)
    CONFIDENCE_PENALTY_WRONG: -0.25, // -25% penalty for wrong (was -0.20)

    // DEFAULT SETTINGS
    DEFAULT_ENABLED_TABLES: [1, 2, 5, 10],
    DEFAULT_MAX_FACTOR: 10,
    DEFAULT_ROUND_LENGTH: 10,
};
