import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import dns from 'node:dns';

if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

import { getDb, studentWhitelist, profiles } from '../packages/db/src/index';
import { createClient } from '@supabase/supabase-js';

// Load .env
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  });
}

describe('Login Diagnostic & Timing Test', () => {
  it('should measure database connection and whitelist lookup latency', async () => {
    console.log('--- TEST 1: DATABASE QUERY LATENCY ---');
    const t0 = performance.now();
    const db = getDb();
    const students = await db.select().from(studentWhitelist).limit(5);
    const dbDuration = performance.now() - t0;
    console.log(`[Diagnostic] DB Whitelist lookup duration: ${dbDuration.toFixed(2)}ms`);
    console.log(`[Diagnostic] Retrieved ${students.length} students from studentWhitelist`);
    students.forEach((s) => {
      console.log(`  - NIM: ${s.nim}, Role: ${s.role}, Active: ${s.isActive}, Email: ${s.email}`);
    });

    expect(students.length).toBeGreaterThan(0);
    expect(dbDuration).toBeLessThan(5000); // Should resolve within 5s
  });

  it('should test Supabase Auth signInWithPassword and measure response time', async () => {
    console.log('--- TEST 2: SUPABASE AUTH LATENCY ---');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    expect(supabaseUrl).toBeDefined();
    expect(supabaseAnonKey).toBeDefined();

    const db = getDb();
    const [admin] = await db.select().from(studentWhitelist).limit(1);
    expect(admin).toBeDefined();

    const supabase = createClient(supabaseUrl!, supabaseAnonKey!);
    const t0 = performance.now();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: admin.email,
      password: process.env.INITIAL_ADMIN_PASSWORD || 'akunatmint123',
    });
    const authDuration = performance.now() - t0;
    console.log(`[Diagnostic] Supabase Auth signInWithPassword duration: ${authDuration.toFixed(2)}ms`);
    console.log(`[Diagnostic] Auth status: ${error ? 'ERROR: ' + error.message : 'SUCCESS'}`);

    if (data?.user) {
      console.log(`[Diagnostic] User ID: ${data.user.id}, Role: ${data.user.role}`);
    }

    // Auth should not hang indefinitely!
    expect(authDuration).toBeLessThan(15000);
  }, 30000);

  it('should verify profile exists and check query latency', async () => {
    console.log('--- TEST 3: PROFILES TABLE LOOKUP ---');
    const db = getDb();
    const t0 = performance.now();
    const allProfiles = await db.select().from(profiles).limit(5);
    const profileDuration = performance.now() - t0;
    console.log(`[Diagnostic] Profiles lookup duration: ${profileDuration.toFixed(2)}ms, found: ${allProfiles.length}`);
    allProfiles.forEach((p) => {
      console.log(`  - Profile ID: ${p.id}, NIM: ${p.nim}, Role: ${p.role}, MustChangePassword: ${p.mustChangePassword}`);
    });
    expect(profileDuration).toBeLessThan(5000);
  });
});

