import * as dotenv from 'dotenv';
import { getDb } from './client';
import { academicTerms, reminderRules } from './schema/index';
import { provisionUser, generateSecureTempPassword } from './auth-provisioning';
import { eq } from 'drizzle-orm';

dotenv.config({ path: '../../.env' });

async function runSeed() {
  console.log('🌱 Menjalankan seed Novarion Academic Hub...');

  const db = getDb();

  const adminEmail = process.env.INITIAL_ADMIN_EMAIL || 'admin.angkatan@kampus.ac.id';
  const adminNim = process.env.INITIAL_ADMIN_NIM || '10241001';
  const adminName = process.env.INITIAL_ADMIN_NAME || 'Administrator Angkatan';
  const envPassword = process.env.INITIAL_ADMIN_PASSWORD;

  // 1. Provision Admin Pertama (Auth + Whitelist + Profiles)
  console.log(`Checking & provisioning admin: ${adminEmail} (${adminNim})...`);
  const adminPassword = envPassword || generateSecureTempPassword();
  const adminResult = await provisionUser({
    nim: adminNim,
    email: adminEmail,
    fullName: adminName,
    role: 'admin',
    password: adminPassword,
    mustChangePassword: !envPassword,
    isActive: true,
  });
  console.log(`✅ Admin pertama siap: ${adminEmail} (NIM: ${adminNim})`);
  if (!envPassword) {
    console.log(`🔑 Password sementara admin: ${adminPassword}`);
  }

  // 2. Seed Default Reminder Rules (Empat Pemicu Wajib)
  const rules = [
    { triggerType: 'h_7', description: 'Pukul 08.00 WIB, 7 hari sebelum deadline' },
    { triggerType: 'h_3', description: 'Pukul 08.00 WIB, 3 hari sebelum deadline' },
    { triggerType: 'h_1', description: 'Pukul 08.00 WIB, 1 hari sebelum deadline' },
    { triggerType: 't_minus_3h', description: 'Tepat 3 jam sebelum waktu deadline presisi' },
  ];

  for (const rule of rules) {
    const existingRule = await db
      .select()
      .from(reminderRules)
      .where(eq(reminderRules.triggerType, rule.triggerType))
      .limit(1);

    if (existingRule.length === 0) {
      await db.insert(reminderRules).values({
        triggerType: rule.triggerType,
        description: rule.description,
        isActive: true,
      });
      console.log(`✅ Reminder rule terdaftar: ${rule.triggerType}`);
    }
  }

  // 3. Seed Default Academic Term
  const defaultTermCode = '2026-GANJIL';
  const existingTerm = await db
    .select()
    .from(academicTerms)
    .where(eq(academicTerms.code, defaultTermCode))
    .limit(1);

  if (existingTerm.length === 0) {
    await db.insert(academicTerms).values({
      code: defaultTermCode,
      name: 'Semester Ganjil 2026/2027',
      startDate: '2026-09-01',
      endDate: '2027-01-31',
      isActive: true,
    });
    console.log(`✅ Default Semester aktif dibuat: ${defaultTermCode}`);
  }

  console.log('🎉 Seed selesai dengan sukses!');
  process.exit(0);
}

runSeed().catch((err) => {
  console.error('❌ Gagal menjalankan seed:', err);
  process.exit(1);
});
