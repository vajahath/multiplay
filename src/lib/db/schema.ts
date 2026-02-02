/**
 * IDB Schema & Migration System
 * 
 * This module provides a versioned schema system for IndexedDB with automatic migrations.
 * Each schema version should have a corresponding migration function.
 */

export interface SchemaVersion {
  version: number;
  description: string;
  migrate: (db: IDBDatabase, transaction: IDBTransaction) => void;
}

// Current schema version - increment this when making breaking changes
export const CURRENT_SCHEMA_VERSION = 2;

// Database name
export const DB_NAME = 'MultiplayDB';

// Object store names
export const STORES = {
  FACTS: 'facts',
  SETTINGS: 'settings',
  META: 'meta',
  PROFILES: 'profiles',
} as const;

/**
 * Schema migrations
 * Each migration upgrades from the previous version to the current version.
 * The migrate function receives the database and transaction to perform the upgrade.
 */
export const SCHEMA_MIGRATIONS: SchemaVersion[] = [
  {
    version: 1,
    description: 'Initial schema with facts, settings, and meta stores',
    migrate: (db: IDBDatabase) => {
      // Create facts store with id as key path
      if (!db.objectStoreNames.contains(STORES.FACTS)) {
        const factsStore = db.createObjectStore(STORES.FACTS, { keyPath: 'id' });
        factsStore.createIndex('status', 'status', { unique: false });
        factsStore.createIndex('lastPracticed', 'lastPracticed', { unique: false });
      }

      // Create settings store (key-value)
      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        db.createObjectStore(STORES.SETTINGS);
      }

      // Create meta store for schema version tracking
      if (!db.objectStoreNames.contains(STORES.META)) {
        db.createObjectStore(STORES.META);
      }
    },
  },
  {
    version: 2,
    description: 'Add profiles store for multi-user support',
    migrate: (db: IDBDatabase) => {
      // Create profiles store with id as key path
      if (!db.objectStoreNames.contains(STORES.PROFILES)) {
        db.createObjectStore(STORES.PROFILES, { keyPath: 'id' });
      }

      // Add profileId index to facts for better querying
      // Note: Can't modify existing store indexes in same transaction easily,
      // so we'll handle profile scoping via key prefixes in the app layer
    },
  },
];

/**
 * Get the migration for a specific version
 */
export function getMigration(version: number): SchemaVersion | undefined {
  return SCHEMA_MIGRATIONS.find(m => m.version === version);
}

