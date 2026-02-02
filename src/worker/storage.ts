import { createStore, get, set, values, setMany, del } from 'idb-keyval';
import type { Fact } from './types';

const factsStore = createStore('MultiFlowDB-Facts', 'facts');
const settingsStore = createStore('MultiFlowDB-Settings', 'settings');

export const Storage = {
    async getAllFacts(): Promise<Fact[]> {
        return values(factsStore);
    },

    async saveFacts(facts: Fact[]): Promise<void> {
        const entries: [string, Fact][] = facts.map(f => [f.id, f]);
        return setMany(entries, factsStore);
    },

    async updateFact(fact: Fact): Promise<void> {
        return set(fact.id, fact, factsStore);
    },

    async getSetting<T>(key: string): Promise<T | undefined> {
        return get(key, settingsStore);
    },

    async setSetting<T>(key: string, value: T): Promise<void> {
        return set(key, value, settingsStore);
    },

    async clearAll(): Promise<void> {
        // Note: idb-keyval doesn't have a clearStore, but we can delete the DB if needed
        // or just leave it for now.
    }
};
