/**
 * Database Manager
 * 
 * Handles IndexedDB initialization, migrations, and provides a clean API for data operations.
 * This replaces the simple idb-keyval approach with a full-featured migration system.
 */

import { CURRENT_SCHEMA_VERSION, DB_NAME, STORES, SCHEMA_MIGRATIONS } from './schema';
import type { Fact } from '../../worker/types';

let dbInstance: IDBDatabase | null = null;
let dbInitPromise: Promise<IDBDatabase> | null = null;

/**
 * Opens the database with migrations
 */
function openDatabase(): Promise<IDBDatabase> {
    if (dbInstance) {
        return Promise.resolve(dbInstance);
    }

    if (dbInitPromise) {
        return dbInitPromise;
    }

    dbInitPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, CURRENT_SCHEMA_VERSION);

        request.onerror = () => {
            console.error('Failed to open database:', request.error);
            reject(request.error);
        };

        request.onsuccess = () => {
            dbInstance = request.result;
            console.log(`Database opened successfully at version ${dbInstance.version}`);
            resolve(dbInstance);
        };

        request.onupgradeneeded = (event) => {
            const db = request.result;
            const transaction = request.transaction!;
            const oldVersion = event.oldVersion;
            const newVersion = event.newVersion || CURRENT_SCHEMA_VERSION;

            console.log(`Upgrading database from version ${oldVersion} to ${newVersion}`);

            // Run all migrations from oldVersion + 1 to newVersion
            for (const migration of SCHEMA_MIGRATIONS) {
                if (migration.version > oldVersion && migration.version <= newVersion) {
                    console.log(`Running migration v${migration.version}: ${migration.description}`);
                    migration.migrate(db, transaction);
                }
            }
        };

        request.onblocked = () => {
            console.warn('Database upgrade blocked. Please close other tabs with this app.');
        };
    });

    return dbInitPromise;
}

/**
 * Gets the database instance
 */
async function getDB(): Promise<IDBDatabase> {
    return openDatabase();
}

/**
 * Database operations for Facts
 */
export const FactsDB = {
    async getAll(): Promise<Fact[]> {
        const db = await getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORES.FACTS, 'readonly');
            const store = transaction.objectStore(STORES.FACTS);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    },

    async saveMany(facts: Fact[]): Promise<void> {
        const db = await getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORES.FACTS, 'readwrite');
            const store = transaction.objectStore(STORES.FACTS);

            facts.forEach(fact => store.put(fact));

            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    },

    async update(fact: Fact): Promise<void> {
        const db = await getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORES.FACTS, 'readwrite');
            const store = transaction.objectStore(STORES.FACTS);
            const request = store.put(fact);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },

    async clear(): Promise<void> {
        const db = await getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORES.FACTS, 'readwrite');
            const store = transaction.objectStore(STORES.FACTS);
            const request = store.clear();

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },
};

/**
 * Database operations for Settings
 */
export const SettingsDB = {
    async get<T>(key: string): Promise<T | undefined> {
        const db = await getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORES.SETTINGS, 'readonly');
            const store = transaction.objectStore(STORES.SETTINGS);
            const request = store.get(key);

            request.onsuccess = () => resolve(request.result as T | undefined);
            request.onerror = () => reject(request.error);
        });
    },

    async set<T>(key: string, value: T): Promise<void> {
        const db = await getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORES.SETTINGS, 'readwrite');
            const store = transaction.objectStore(STORES.SETTINGS);
            const request = store.put(value, key);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },

    async clear(): Promise<void> {
        const db = await getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORES.SETTINGS, 'readwrite');
            const store = transaction.objectStore(STORES.SETTINGS);
            const request = store.clear();

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },
};

/**
 * Database operations for Meta (schema info, etc.)
 */
export const MetaDB = {
    async get<T>(key: string): Promise<T | undefined> {
        const db = await getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORES.META, 'readonly');
            const store = transaction.objectStore(STORES.META);
            const request = store.get(key);

            request.onsuccess = () => resolve(request.result as T | undefined);
            request.onerror = () => reject(request.error);
        });
    },

    async set<T>(key: string, value: T): Promise<void> {
        const db = await getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORES.META, 'readwrite');
            const store = transaction.objectStore(STORES.META);
            const request = store.put(value, key);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },
};

/**
 * Clear all data from the database (for reset functionality)
 */
export async function clearAllData(): Promise<void> {
    await FactsDB.clear();
    await SettingsDB.clear();
    console.log('All user data cleared');
}

/**
 * Delete and recreate the entire database (nuclear option)
 */
export async function deleteDatabase(): Promise<void> {
    // Close existing connection
    if (dbInstance) {
        dbInstance.close();
        dbInstance = null;
    }
    dbInitPromise = null;

    return new Promise((resolve, reject) => {
        const request = indexedDB.deleteDatabase(DB_NAME);
        request.onsuccess = () => {
            console.log('Database deleted successfully');
            resolve();
        };
        request.onerror = () => reject(request.error);
        request.onblocked = () => {
            console.warn('Database deletion blocked');
            reject(new Error('Database deletion blocked'));
        };
    });
}

/**
 * Get current schema version from the database
 */
export async function getSchemaVersion(): Promise<number> {
    const db = await getDB();
    return db.version;
}

/**
 * Initialize the database (call this early in app startup)
 */
export async function initDatabase(): Promise<void> {
    await getDB();
}
