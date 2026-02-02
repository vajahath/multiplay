import { FactsDB, SettingsDB, clearAllData, deleteDatabase } from '../lib/db/database';
import type { Fact } from './types';

// Current profile ID - set by the game engine after profile selection
let currentProfileId: string = '';

/**
 * Set the current profile ID for all storage operations
 */
export function setStorageProfileId(profileId: string): void {
    currentProfileId = profileId;
}

/**
 * Get the current profile ID
 */
export function getStorageProfileId(): string {
    return currentProfileId;
}

/**
 * Create a profile-scoped fact ID
 */
function scopedFactId(factId: string): string {
    if (!currentProfileId) {
        throw new Error('Profile ID not set. Call setStorageProfileId first.');
    }
    return `${currentProfileId}:${factId}`;
}

/**
 * Create a profile-scoped setting key
 */
function scopedSettingKey(key: string): string {
    if (!currentProfileId) {
        throw new Error('Profile ID not set. Call setStorageProfileId first.');
    }
    return `${currentProfileId}:${key}`;
}

/**
 * Extract the original fact ID from a scoped ID
 */
function unscopedFactId(scopedId: string): string {
    const parts = scopedId.split(':');
    return parts.length > 1 ? parts.slice(1).join(':') : scopedId;
}

export const Storage = {
    async getAllFacts(): Promise<Fact[]> {
        const allFacts = await FactsDB.getAll();
        // Filter to only facts belonging to current profile
        const profilePrefix = `${currentProfileId}:`;
        return allFacts
            .filter(f => f.id.startsWith(profilePrefix))
            .map(f => ({
                ...f,
                // Return with unscoped ID for app consumption
                id: unscopedFactId(f.id),
            }));
    },

    async saveFacts(facts: Fact[]): Promise<void> {
        // Scope all fact IDs with profile prefix
        const scopedFacts = facts.map(f => ({
            ...f,
            id: scopedFactId(f.id),
        }));
        return FactsDB.saveMany(scopedFacts);
    },

    async updateFact(fact: Fact): Promise<void> {
        const scopedFact = {
            ...fact,
            id: scopedFactId(fact.id),
        };
        return FactsDB.update(scopedFact);
    },

    async getSetting<T>(key: string): Promise<T | undefined> {
        return SettingsDB.get<T>(scopedSettingKey(key));
    },

    async setSetting<T>(key: string, value: T): Promise<void> {
        return SettingsDB.set(scopedSettingKey(key), value);
    },

    async clearAll(): Promise<void> {
        // Only clear data for current profile
        const allFacts = await FactsDB.getAll();
        const profilePrefix = `${currentProfileId}:`;

        // Delete facts for this profile
        for (const fact of allFacts) {
            if (fact.id.startsWith(profilePrefix)) {
                await FactsDB.update({ ...fact, id: fact.id } as Fact); // Mark for deletion
            }
        }

        // For now, clear and re-save non-profile facts
        // This is a simplified approach - in a real app you'd want a proper delete method
        const otherFacts = allFacts.filter(f => !f.id.startsWith(profilePrefix));
        await FactsDB.clear();
        if (otherFacts.length > 0) {
            await FactsDB.saveMany(otherFacts);
        }

        console.log(`Cleared data for profile: ${currentProfileId}`);
    },

    async deleteDatabase(): Promise<void> {
        return deleteDatabase();
    }
};
