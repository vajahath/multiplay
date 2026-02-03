export type FactStatus = 'LOCKED' | 'ACTIVE' | 'MASTERED';

export interface Fact {
    id: string;                // Primary Key (e.g., "3x7")
    factors: [number, number]; // [3, 7]
    confidence: number;        // 0.0 to 1.0 (Float)
    latencyAvg: number;        // ms
    lastPracticed: number;     // Unix Timestamp
    status: FactStatus;
}

export interface Question {
    id: string;
    factors: [number, number];
    timeoutMs: number;         // Visual hint for timer duration
}

export interface AnswerResult {
    isCorrect: boolean;
    correctAnswer: number;
    timeTaken: number;
    newConfidence: number;
    deltaConfidence: number;   // How much did it change? (+0.05, -0.1)
    isMasteredEvent: boolean;  // Did this specific answer trigger MASTERED status?
    isDemasteredEvent: boolean; // Did this specific answer cause loss of MASTERED status?
}

export interface RoundSummary {
    totalQuestions: number;
    correctCount: number;
    avgTime: number;
    accuracy: number;
    stars: 1 | 2 | 3;
}

export interface GameState {
    currentQuestion: Question | null;
    enabledTables: number[];
    maxFactor: number;
    roundLength: number;
    bestStreak: number;
    stats: {
        totalCorrect: number;
        totalAttempted: number;
    }
}
