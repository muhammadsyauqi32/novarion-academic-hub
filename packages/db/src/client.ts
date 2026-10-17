import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index';

let client: ReturnType<typeof postgres> | null = null;
let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb(connectionString?: string) {
  if (dbInstance) return dbInstance;

  const connStr = connectionString || process.env.DATABASE_URL;
  if (!connStr) {
    throw new Error('DATABASE_URL is not set. Please provide connection string or set environment variable.');
  }

  client = postgres(connStr, {
    max: process.env.NODE_ENV === 'production' ? 1 : 5,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false, // Wajib false untuk kompatibilitas Supabase PgBouncer Pooler (Port 6543)
  });

  dbInstance = drizzle(client, { schema });
  return dbInstance;
}

export { schema };
export * from './schema/index';
