import crypto from "crypto";
import postgres from "postgres";
import { getDb } from "./client";
import { studentWhitelist, profiles } from "./schema/index";
import { eq } from "drizzle-orm";
import { UserRole } from "@novarion/shared";

export interface ProvisionUserOptions {
  nim: string;
  email: string;
  fullName: string;
  role?: UserRole;
  password?: string;
  mustChangePassword?: boolean;
  isActive?: boolean;
}

export interface ProvisionUserResult {
  id: string;
  nim: string;
  email: string;
  fullName: string;
  role: UserRole;
  temporaryPassword?: string;
  mustChangePassword: boolean;
}

/**
 * Membuat password sementara acak dan unik yang aman serta mudah dibaca.
 * Format: Nvrn-<8 karakter hex acak>
 */
export function generateSecureTempPassword(): string {
  const randomHex = crypto.randomBytes(4).toString("hex").toUpperCase();
  const special = ["!", "@", "#", "$"][crypto.randomInt(0, 4)];
  return `Nvrn-${randomHex}${special}`;
}

// Testing Password
export function getDefaultStudentPassword(): string {
  const password = process.env.DEFAULT_STUDENT_PASSWORD;

  if (!password || password.length < 12) {
    throw new Error("DEFAULT_STUDENT_PASSWORD wajib diisi minimal 12 karakter");
  }

  return password;
}

function getRawSql() {
  const connStr = process.env.DATABASE_URL;
  if (!connStr) {
    throw new Error("DATABASE_URL is not set.");
  }
  return postgres(connStr);
}

/**
 * Menyinkronkan dan mem-provision akun di auth.users, auth.identities, student_whitelist, dan profiles
 */
export async function provisionUser(options: ProvisionUserOptions): Promise<ProvisionUserResult> {
  const sql = getRawSql();
  const db = getDb();

  const nim = options.nim.trim();
  const email = options.email.trim().toLowerCase();
  const fullName = options.fullName.trim();
  const role: UserRole = options.role || "student";
  const isActive = options.isActive ?? true;

  const isGeneratedPassword = !options.password;
  const rawPassword = options.password || generateSecureTempPassword();
  const mustChangePassword = options.mustChangePassword ?? isGeneratedPassword;

  try {
    // 1. Cek apakah user sudah terdaftar di auth.users berdasarkan email
    const existingUsers = await sql`
      SELECT id, email, encrypted_password FROM auth.users WHERE email = ${email} LIMIT 1;
    `;

    let userId: string;

    const userMetadata = { full_name: fullName, nim, role };
    const appMetadata = { provider: "email", providers: ["email"] };

    if (existingUsers.length > 0) {
      userId = existingUsers[0].id;
      // Perbarui password di auth.users
      await sql`
        UPDATE auth.users
        SET 
          encrypted_password = crypt(${rawPassword}, gen_salt('bf', 10)),
          email_confirmed_at = COALESCE(email_confirmed_at, now()),
          raw_user_meta_data = ${sql.json(userMetadata)},
          raw_app_meta_data = ${sql.json(appMetadata)},
          updated_at = now()
        WHERE id = ${userId}::uuid;
      `;
    } else {
      // Buat akun baru di auth.users sesuai spesifikasi GoTrue Supabase Auth
      const [newUser] = await sql`
        INSERT INTO auth.users (
          instance_id,
          id,
          aud,
          role,
          email,
          encrypted_password,
          email_confirmed_at,
          recovery_token,
          recovery_sent_at,
          email_change_token_new,
          email_change,
          email_change_sent_at,
          email_change_token_current,
          phone_change,
          phone_change_token,
          phone_change_sent_at,
          reauthentication_token,
          confirmation_token,
          confirmation_sent_at,
          raw_app_meta_data,
          raw_user_meta_data,
          is_super_admin,
          is_sso_user,
          is_anonymous,
          created_at,
          updated_at
        ) VALUES (
          '00000000-0000-0000-0000-000000000000',
          gen_random_uuid(),
          'authenticated',
          'authenticated',
          ${email},
          crypt(${rawPassword}, gen_salt('bf', 10)),
          now(),
          '',
          null,
          '',
          '',
          null,
          '',
          '',
          '',
          null,
          '',
          '',
          null,
          ${sql.json(appMetadata)},
          ${sql.json(userMetadata)},
          false,
          false,
          false,
          now(),
          now()
        )
        RETURNING id;
      `;
      userId = newUser.id;

      const identityObj = { sub: userId, email };

      // Buat identitas email di auth.identities
      await sql`
        INSERT INTO auth.identities (
          id,
          user_id,
          identity_data,
          provider,
          provider_id,
          last_sign_in_at,
          created_at,
          updated_at
        ) VALUES (
          gen_random_uuid(),
          ${userId}::uuid,
          ${sql.json(identityObj)},
          'email',
          ${userId}::text,
          now(),
          now(),
          now()
        )
        ON CONFLICT (provider, provider_id) DO NOTHING;
      `;
    }

    // 2. Sinkronkan ke student_whitelist
    const existingWl = await db.select().from(studentWhitelist).where(eq(studentWhitelist.nim, nim)).limit(1);

    if (existingWl.length === 0) {
      await db.insert(studentWhitelist).values({
        nim,
        email,
        fullName,
        role,
        isActive,
      });
    } else {
      await db
        .update(studentWhitelist)
        .set({
          email,
          fullName,
          role,
          isActive,
          updatedAt: new Date(),
        })
        .where(eq(studentWhitelist.nim, nim));
    }

    // 3. Sinkronkan ke public.profiles
    const existingProf = await db.select().from(profiles).where(eq(profiles.id, userId)).limit(1);

    if (existingProf.length === 0) {
      await db.insert(profiles).values({
        id: userId,
        nim,
        email,
        fullName,
        role,
        mustChangePassword,
      });
    } else {
      await db
        .update(profiles)
        .set({
          nim,
          email,
          fullName,
          role,
          mustChangePassword,
          updatedAt: new Date(),
        })
        .where(eq(profiles.id, userId));
    }

    return {
      id: userId,
      nim,
      email,
      fullName,
      role,
      temporaryPassword: isGeneratedPassword ? rawPassword : undefined,
      mustChangePassword,
    };
  } finally {
    await sql.end();
  }
}

/**
 * Mereset password mahasiswa oleh admin. Menghasilkan password sementara baru dan mengaktifkan must_change_password.
 */
export async function resetUserPassword(nimOrUserId: string, newPassword?: string): Promise<{ temporaryPassword: string }> {
  const sql = getRawSql();
  const db = getDb();
  const tempPassword = newPassword || generateSecureTempPassword();

  try {
    // Cari user di profiles atau studentWhitelist
    let userRow: { id: string; email: string } | null = null;

    const byId = await db.select().from(profiles).where(eq(profiles.id, nimOrUserId)).limit(1);
    if (byId.length > 0) {
      userRow = { id: byId[0].id, email: byId[0].email };
    } else {
      const byNim = await db.select().from(studentWhitelist).where(eq(studentWhitelist.nim, nimOrUserId)).limit(1);
      if (byNim.length > 0) {
        const p = await db.select().from(profiles).where(eq(profiles.nim, byNim[0].nim)).limit(1);
        if (p.length > 0) {
          userRow = { id: p[0].id, email: p[0].email };
        }
      }
    }

    if (!userRow) {
      throw new Error(`Pengguna dengan identitas '${nimOrUserId}' tidak ditemukan.`);
    }

    // Perbarui password di auth.users
    await sql`
      UPDATE auth.users
      SET 
        encrypted_password = crypt(${tempPassword}, gen_salt('bf', 10)),
        updated_at = now()
      WHERE id = ${userRow.id}::uuid;
    `;

    // Pasang must_change_password = true
    await db
      .update(profiles)
      .set({
        mustChangePassword: true,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, userRow.id));

    return { temporaryPassword: tempPassword };
  } finally {
    await sql.end();
  }
}

/**
 * Mengubah password sendiri oleh mahasiswa/admin (mematikan must_change_password).
 */
export async function updateUserPassword(userId: string, newPassword: string): Promise<void> {
  const sql = getRawSql();
  const db = getDb();

  try {
    await sql`
      UPDATE auth.users
      SET 
        encrypted_password = crypt(${newPassword}, gen_salt('bf', 10)),
        updated_at = now()
      WHERE id = ${userId}::uuid;
    `;

    await db
      .update(profiles)
      .set({
        mustChangePassword: false,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, userId));
  } finally {
    await sql.end();
  }
}

/**
 * Verifikasi password saat ini terhadap hash di auth.users
 */
export async function verifyUserPassword(userId: string, currentPassword: string): Promise<boolean> {
  const sql = getRawSql();
  try {
    const res = await sql`
      SELECT (encrypted_password = crypt(${currentPassword}, encrypted_password)) AS is_match
      FROM auth.users
      WHERE id = ${userId}::uuid
      LIMIT 1;
    `;

    if (res.length === 0) return false;
    return !!res[0].is_match;
  } finally {
    await sql.end();
  }
}
