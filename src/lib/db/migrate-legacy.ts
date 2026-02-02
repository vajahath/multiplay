/**
 * Legacy Data Migration
 * 
 * Migrates data from the old idb-keyval stores to the new versioned database.
 * This runs once on startup and cleans up the old stores after migration.
 */

import { FactsDB, SettingsDB, MetaDB } from './database';
import type { Fact } from '../../worker/types';

const MIGRATION_KEY = 'legacy_migration_complete';

/**
 * Check if we've already migrated legacy data
 */
async function isMigrated(): Promise<boolean> {
    const migrated = await MetaDB.get<boolean>(MIGRATION_KEY);
    return migrated === true;
}

/**
 * Mark migration as complete
 */
async function markMigrated(): Promise<void> {
    await MetaDB.set(MIGRATION_KEY, true);
}

/**
 * Read data from old idb-keyval stores
 */
async function readLegacyStore<T>(dbName: string, storeName: string): Promise<T[]> {
    return new Promise((resolve) => {
        const request = indexedDB.open(dbName, 1);

        request.onerror = () => {
            console.log(`No legacy database found: ${dbName}`);
            resolve([]);
        };

        request.onsuccess = () => {
            const db = request.result;

            if (!db.objectStoreNames.contains(storeName)) {
                db.close();
                resolve([]);
                return;
            }

            try {
                const transaction = db.transaction(storeName, 'readonly');
                const store = transaction.objectStore(storeName);
                const getAllRequest = store.getAll();

                getAllRequest.onsuccess = () => {
                    db.close();
                    resolve(getAllRequest.result || []);
                };

                getAllRequest.onerror = () => {
                    db.close();
                    resolve([]);
                };
            } catch {
                db.close();
                resolve([]);
            }
        };

        request.onupgradeneeded = () => {
            // Database doesn't exist, abort
            request.transaction?.abort();
            resolve([]);
        };
    });
}

/**
 * Read a specific key from old idb-keyval store
 */
async function readLegacySetting<T>(dbName: string, storeName: string, key: string): Promise<T | undefined> {
    return new Promise((resolve) => {
        const request = indexedDB.open(dbName, 1);

        request.onerror = () => resolve(undefined);

        request.onsuccess = () => {
            const db = request.result;

            if (!db.objectStoreNames.contains(storeName)) {
                db.close();
                resolve(undefined);
                return;
            }

            try {
                const transaction = db.transaction(storeName, 'readonly');
                const store = transaction.objectStore(storeName);
                const getRequest = store.get(key);

                getRequest.onsuccess = () => {
                    db.close();
                    resolve(getRequest.result as T | undefined);
                };

                getRequest.onerror = () => {
                    db.close();
                    resolve(undefined);
                };
            } catch {
                db.close();
                resolve(undefined);
            }
        };

        request.onupgradeneeded = () => {
            request.transaction?.abort();
            resolve(undefined);
        };
    });
}

/**
 * Delete old idb-keyval databases after migration
 */
async function deleteLegacyDatabases(): Promise<void> {
    const legacyDbs = ['MultiFlowDB-Facts', 'MultiFlowDB-Settings'];

    for (const dbName of legacyDbs) {
        try {
            await new Promise<void>((resolve, reject) => {
                const request = indexedDB.deleteDatabase(dbName);
                request.onsuccess = () => {
                    console.log(`Deleted legacy database: ${dbName}`);
                    resolve();
                };
                request.onerror = () => reject(request.error);
                request.onblocked = () => {
                    console.warn(`Legacy database deletion blocked: ${dbName}`);
                    resolve(); // Don't fail migration if we can't delete
                };
            });
        } catch (error) {
            console.warn(`Failed to delete legacy database ${dbName}:`, error);
        }
    }
}

/**
 * Migrate all data from legacy stores to new database
 */
export async function migrateLegacyData(): Promise<void> {
    // Check if already migrated
    if (await isMigrated()) {
        console.log('Legacy migration already complete');
        return;
    }

    console.log('Checking for legacy data to migrate...');

    try {
        // Migrate facts
        const legacyFacts = await readLegacyStore<Fact>('MultiFlowDB-Facts', 'facts');
        if (legacyFacts.length > 0) {
            console.log(`Migrating ${legacyFacts.length} facts from legacy database...`);
            await FactsDB.saveMany(legacyFacts);
        }

        // Migrate settings
        const settingsToMigrate = ['enabledTables', 'maxFactor', 'roundLength', 'bestStreak'];
        for (const key of settingsToMigrate) {
            const value = await readLegacySetting<unknown>('MultiFlowDB-Settings', 'settings', key);
            if (value !== undefined) {
                console.log(`Migrating setting: ${key}`);
                await SettingsDB.set(key, value);
            }
        }

        // Mark as migrated
        await markMigrated();
        console.log('Legacy data migration complete');

        // Clean up old databases
        await deleteLegacyDatabases();

    } catch (error) {
        console.error('Legacy migration failed:', error);
        // Don't throw - the app should continue working even if migration fails
    }
}
