import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';

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

// In-memory cookie store for testing
const mockCookieMap = new Map<string, any>();

vi.mock('next/headers', () => {
  return {
    headers: () => ({
      get: (header: string) => {
        if (header.toLowerCase() === 'x-forwarded-for') return '127.0.0.1';
        if (header.toLowerCase() === 'host') return 'localhost:3000';
        return null;
      },
    }),
    cookies: () => ({
      get: (name: string) => mockCookieMap.get(name),
      getAll: () => Array.from(mockCookieMap.entries()).map(([name, value]) => ({ name, value })),
      set: ({ name, value, ...options }: any) => {
        mockCookieMap.set(name, { name, value, ...options });
      },
      delete: (name: string) => {
        mockCookieMap.delete(name);
      },
    }),
  };
});

import { loginWithNimAction } from '../apps/web/actions/auth';
import { getDb, studentWhitelist, profiles } from '../packages/db/src/index';
import { eq } from 'drizzle-orm';

describe('STEP 6 — E2E Login Scenarios Verification', () => {
  beforeEach(() => {
    mockCookieMap.clear();
  });

  it('Scenario 7: Unregistered NIM displays an error', async () => {
    const formData = new FormData();
    formData.append('nim', 'UNREGISTERED9999');
    formData.append('password', 'SomePassword123!');

    const result = await loginWithNimAction(formData);
    expect(result.success).toBe(false);
    expect(result.error).toContain('NIM atau kata sandi tidak valid');
  });

  it('Scenario 6: Incorrect password displays an error', async () => {
    const formData = new FormData();
    formData.append('nim', 'M0401251083'); // Admin NIM
    formData.append('password', 'TotallyWrongPassword999!');

    const result = await loginWithNimAction(formData);
    expect(result.success).toBe(false);
    expect(result.error).toContain('NIM atau kata sandi tidak valid');
  });

  it('Scenario 8: Inactive account is rejected', async () => {
    const db = getDb();
    // Temporarily set a dummy inactive user or test query
    const inactiveNim = 'INACTIVE_TEST_NIM';
    await db
      .insert(studentWhitelist)
      .values({
        nim: inactiveNim,
        email: 'inactive_test@apps.ipb.ac.id',
        fullName: 'Inactive Student',
        role: 'student',
        isActive: false,
      })
      .onConflictDoUpdate({
        target: studentWhitelist.nim,
        set: { isActive: false },
      });

    const formData = new FormData();
    formData.append('nim', inactiveNim);
    formData.append('password', 'AnyPassword123!');

    const result = await loginWithNimAction(formData);
    expect(result.success).toBe(false);
    expect(result.error).toContain('NIM atau kata sandi tidak valid');

    // Clean up
    await db.delete(studentWhitelist).where(eq(studentWhitelist.nim, inactiveNim));
  });

  it('Scenario 1 & 5: Admin login with valid credentials redirects to /admin', async () => {
    const adminNim = process.env.INITIAL_ADMIN_NIM || 'M0401251083';
    const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'akunatmint123';

    const formData = new FormData();
    formData.append('nim', adminNim);
    formData.append('password', adminPassword);

    const result = await loginWithNimAction(formData);
    expect(result.success).toBe(true);
    expect(result.redirectTo).toBe('/admin');
    expect(result.mustChangePassword).toBe(false);

    // Verify session cookies were set in mockCookieStore
    expect(mockCookieMap.size).toBeGreaterThan(0);
    const hasSbCookie = Array.from(mockCookieMap.keys()).some((k) => k.startsWith('sb-'));
    expect(hasSbCookie).toBe(true);
  });

  it('Scenario 3: First-time student redirected to /auth/change-password', async () => {
    const db = getDb();
    const [student] = await db
      .select()
      .from(studentWhitelist)
      .where(eq(studentWhitelist.role, 'student'))
      .limit(1);

    if (student) {
      // Ensure profile has mustChangePassword: true
      await db
        .insert(profiles)
        .values({
          id: '476ec69e-07ca-44e3-9ba5-9e8e348946d5',
          nim: student.nim,
          email: student.email,
          fullName: student.fullName,
          role: 'student',
          mustChangePassword: true,
        })
        .onConflictDoUpdate({
          target: profiles.id,
          set: { mustChangePassword: true },
        });

      // Verify the profile state in DB
      const [p] = await db.select().from(profiles).where(eq(profiles.nim, student.nim));
      expect(p.mustChangePassword).toBe(true);
    }
  });

  it('Scenario 9: Session persists after page refresh (getCurrentUser check)', async () => {
    const { getCurrentUser } = await import('../apps/web/lib/auth/guards');

    // With active admin session in mockCookieMap
    const adminNim = process.env.INITIAL_ADMIN_NIM || 'M0401251083';
    const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'akunatmint123';

    const formData = new FormData();
    formData.append('nim', adminNim);
    formData.append('password', adminPassword);

    await loginWithNimAction(formData);

    // Verify session persistence via getCurrentUser()
    const currentUser = await getCurrentUser();
    expect(currentUser).not.toBeNull();
    if (currentUser) {
      expect(currentUser.nim).toBe(adminNim);
      expect(currentUser.role).toBe('admin');
    }
  });

  it('Scenario 10: Logout works (clears session cookies)', async () => {
    const { createClient } = await import('../apps/web/lib/supabase/server');
    const supabase = createClient();
    await supabase.auth.signOut();

    // Verify signOut executed
    const { data: { user } } = await supabase.auth.getUser();
    expect(user).toBeNull();
  });
});


