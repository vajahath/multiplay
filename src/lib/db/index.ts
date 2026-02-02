/**
 * Database Module
 * 
 * Re-exports all database functionality for clean imports.
 */

export {
    FactsDB,
    SettingsDB,
    MetaDB,
    clearAllData,
    deleteDatabase,
    initDatabase,
    getSchemaVersion
} from './database';

export { CURRENT_SCHEMA_VERSION, DB_NAME, STORES } from './schema';

export { migrateLegacyData } from './migrate-legacy';
