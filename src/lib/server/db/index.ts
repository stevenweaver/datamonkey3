import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { env } from '$env/dynamic/private';

// Default to in-memory database if DATABASE_URL is not set
// This will allow the app to run in environments where a file-based DB is not possible
const dbUrl = env.DATABASE_URL || ':memory:';
const client = new Database(dbUrl);

export const db = drizzle(client);
