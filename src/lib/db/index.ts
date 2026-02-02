/**
 * Database Module
 * 
 * Re-exports all database functionality for clean imports.
 */

export {
    FactsDB,
    SettingsDB,
    MetaDB,
    ProfilesDB,
    clearAllData,
    deleteDatabase,
    initDatabase,
    getSchemaVersion,
    type ProfileRecord,
} from './database';

export { CURRENT_SCHEMA_VERSION, DB_NAME, STORES } from './schema';

export { migrateLegacyData } from './migrate-legacy';
