import fs from 'node:fs';
import path from 'node:path';
import postgres from 'postgres';

// load .env
const envPath = path.resolve(__dirname, '../../../.env');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) process.env[key] = val;
      }
    }
  }
}

async function run() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('DATABASE_URL is not set in environment or .env');
    process.exit(1);
  }

  const sql = postgres(dbUrl, { max: 1, prepare: false });
  const migrationPath = path.resolve(__dirname, '../migrations/0003_overhaul_cms_permissions_agenda_color.sql');
  
  if (!fs.existsSync(migrationPath)) {
    console.error(`Migration file not found at: ${migrationPath}`);
    process.exit(1);
  }

  const migrationSql = fs.readFileSync(migrationPath, 'utf8');

  console.log('Running migration 0003_overhaul_cms_permissions_agenda_color.sql...');
  await sql.unsafe(migrationSql);
  
  // Sinkronkan tracking tabel Drizzle migrations
  try {
    await sql.unsafe(`
      CREATE SCHEMA IF NOT EXISTS "drizzle";
      CREATE TABLE IF NOT EXISTS "drizzle"."__drizzle_migrations" (
        id SERIAL PRIMARY KEY,
        hash text NOT NULL,
        created_at bigint
      );
      INSERT INTO "drizzle"."__drizzle_migrations" (hash, created_at)
      SELECT '0003_overhaul_cms_permissions_agenda_color', ${Date.now()}
      WHERE NOT EXISTS (
        SELECT 1 FROM "drizzle"."__drizzle_migrations" 
        WHERE hash = '0003_overhaul_cms_permissions_agenda_color'
      );
    `);
    console.log('✅ Drizzle migration tracking synchronized!');
  } catch (trackingErr) {
    console.warn('⚠️ Note: Could not record in drizzle.__drizzle_migrations, falling back smoothly:', trackingErr);
  }

  console.log('✅ Migration 0003 executed successfully!');
  await sql.end();
  process.exit(0);
}

run().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
