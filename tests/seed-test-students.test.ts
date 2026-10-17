import { describe, it, expect } from 'vitest';
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

import { getDb, studentWhitelist, profiles, getSupabaseAdmin } from '../packages/db/src/index';
import { eq } from 'drizzle-orm';
import { createClient } from '@supabase/supabase-js';

describe('Seed Test Students', () => {
  it('should reset M04012510001 password and provision TEST001 and TEST002', async () => {
    const supabaseAdmin = getSupabaseAdmin();
    const db = getDb();
    const defaultPwd = process.env.DEFAULT_STUDENT_PASSWORD || 'testing123';

    // 1. Reset password for existing student Dummy Nova (M04012510001, nova@apps.ipb.ac.id)
    const [novaProf] = await db.select().from(profiles).where(eq(profiles.nim, 'M04012510001')).limit(1);
    if (novaProf) {
      console.log('Resetting password for M04012510001 in Supabase Auth...');
      const { error: resetErr } = await supabaseAdmin.auth.admin.updateUserById(novaProf.id, {
        password: defaultPwd,
      });
      if (resetErr) {
        console.error('Failed to reset Nova password:', resetErr);
      } else {
        console.log(`✅ Password for M04012510001 successfully set to "${defaultPwd}"`);
      }
    }

    // 2. Helper to provision test account if not exists
    const testAccounts = [
      {
        nim: 'TEST001',
        email: 'test001@apps.ipb.ac.id',
        fullName: 'Mahasiswa Uji Satu',
        mustChangePassword: false, // Ready to directly access /app
      },
      {
        nim: 'TEST002',
        email: 'test002@apps.ipb.ac.id',
        fullName: 'Mahasiswa Uji Dua',
        mustChangePassword: true, // For testing mandatory password change flow
      },
    ];

    for (const acc of testAccounts) {
      console.log(`Checking ${acc.nim}...`);
      // Check in Supabase Auth
      const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
      let authUser = users.find((u) => u.email === acc.email);

      if (!authUser) {
        console.log(`Creating ${acc.email} in Supabase Auth...`);
        const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
          email: acc.email,
          password: defaultPwd,
          email_confirm: true,
          user_metadata: { full_name: acc.fullName, nim: acc.nim, role: 'student' },
        });

        if (createErr || !created.user) {
          console.error(`Failed to create ${acc.nim} in Supabase Auth:`, createErr);
          continue;
        }
        authUser = created.user;
      } else {
        console.log(`Updating password for ${acc.email} in Supabase Auth...`);
        await supabaseAdmin.auth.admin.updateUserById(authUser.id, {
          password: defaultPwd,
        });
      }

      // Upsert into studentWhitelist
      await db
        .insert(studentWhitelist)
        .values({
          nim: acc.nim,
          email: acc.email,
          fullName: acc.fullName,
          role: 'student',
          isActive: true,
        })
        .onConflictDoUpdate({
          target: studentWhitelist.nim,
          set: {
            email: acc.email,
            fullName: acc.fullName,
            role: 'student',
            isActive: true,
          },
        });

      // Upsert into profiles
      await db
        .insert(profiles)
        .values({
          id: authUser.id,
          nim: acc.nim,
          email: acc.email,
          fullName: acc.fullName,
          role: 'student',
          mustChangePassword: acc.mustChangePassword,
        })
        .onConflictDoUpdate({
          target: profiles.id,
          set: {
            nim: acc.nim,
            email: acc.email,
            fullName: acc.fullName,
            role: 'student',
            mustChangePassword: acc.mustChangePassword,
          },
        });

      console.log(`✅ ${acc.nim} provisioned successfully with password "${defaultPwd}" (mustChangePassword: ${acc.mustChangePassword})`);
    }

    // 3. Verify signInWithPassword for all 3 student accounts!
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    for (const email of ['nova@apps.ipb.ac.id', 'test001@apps.ipb.ac.id', 'test002@apps.ipb.ac.id']) {
      const { data, error } = await client.auth.signInWithPassword({
        email,
        password: defaultPwd,
      });
      console.log(`Verification for ${email}: ${error ? 'FAILED (' + error.message + ')' : 'SUCCESS (ID: ' + data.user?.id + ')'}`);
      expect(error).toBeNull();
      expect(data.user).toBeDefined();
    }
  }, 45000);
});
