import { FactsDB, SettingsDB, clearAllData, deleteDatabase } from '../lib/db/database';
import type { Fact } from './types';

export const Storage = {
    async getAllFacts(): Promise<Fact[]> {
        return FactsDB.getAll();
    },

    async saveFacts(facts: Fact[]): Promise<void> {
        return FactsDB.saveMany(facts);
    },

    async updateFact(fact: Fact): Promise<void> {
        return FactsDB.update(fact);
    },

    async getSetting<T>(key: string): Promise<T | undefined> {
        return SettingsDB.get<T>(key);
    },

    async setSetting<T>(key: string, value: T): Promise<void> {
        return SettingsDB.set(key, value);
    },

    async clearAll(): Promise<void> {
        return clearAllData();
    },

    async deleteDatabase(): Promise<void> {
        return deleteDatabase();
    }
};

