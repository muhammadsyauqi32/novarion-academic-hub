import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index';
import dns from 'node:dns';

// Fix dual-stack IPv6 DNS resolution latency/timeout on Windows & cloud environments
if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

const globalForDb = globalThis as unknown as {
  _postgresClient?: ReturnType<typeof postgres>;
  _drizzleDb?: ReturnType<typeof drizzle<typeof schema>>;
};


export function getDb(connectionString?: string) {
  if (globalForDb._drizzleDb) return globalForDb._drizzleDb;

  const connStr = connectionString || process.env.DATABASE_URL;
  if (!connStr) {
    throw new Error('DATABASE_URL is not set. Please provide connection string or set environment variable.');
  }

  const maxConnections = process.env.DB_MAX_CONNECTIONS ? parseInt(process.env.DB_MAX_CONNECTIONS, 10) : 10;
  const client = globalForDb._postgresClient || postgres(connStr, {
    max: maxConnections,
    idle_timeout: 20,
    connect_timeout: 10,
    max_lifetime: 60 * 30, // 30 minutes
    prepare: false, // Wajib false untuk kompatibilitas Supabase PgBouncer Pooler (Port 6543)
  });

  const dbInstance = drizzle(client, { schema });
  globalForDb._postgresClient = client;
  globalForDb._drizzleDb = dbInstance;

  return dbInstance;
}

export { schema };
export * from './schema/index';
