import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameEngine } from './engine';
import { Storage } from './storage';

// Mock Storage as it uses IndexedDB which isn't available in node environment easily without JSDOM or similar
vi.mock('./storage', () => ({
    Storage: {
        getAllFacts: vi.fn().mockResolvedValue([]),
        saveFacts: vi.fn(),
        updateFact: vi.fn(),
        getSetting: vi.fn().mockResolvedValue(null),
        setSetting: vi.fn(),
    }
}));

describe('GameEngine', () => {
    let engine: GameEngine;

    beforeEach(async () => {
        vi.clearAllMocks();
        engine = new GameEngine();
        await engine.init();
    });

    it('should initialize with 169 facts if storage is empty', async () => {
        expect(Storage.saveFacts).toHaveBeenCalled();
        const calls = (Storage.saveFacts as any).mock.calls;
        expect(calls[0][0].length).toBe(169);
    });

    it('should generate a question', async () => {
        const question = await engine.getNextQuestion();
        expect(question).toHaveProperty('id');
        expect(question).toHaveProperty('factors');
    });

    it('should process a correct answer', async () => {
        const question = await engine.getNextQuestion();
        const [a, b] = question.factors;
        const result = await engine.submitAnswer(question.id, a * b, 1000);

        expect(result.isCorrect).toBe(true);
        expect(result.newConfidence).toBeGreaterThan(0);
    });

    it('should process an incorrect answer', async () => {
        const question = await engine.getNextQuestion();
        const result = await engine.submitAnswer(question.id, -1, 1000);

        expect(result.isCorrect).toBe(false);
        expect(result.deltaConfidence).toBeLessThanOrEqual(0);
    });
});
