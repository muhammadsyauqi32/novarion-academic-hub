import * as dotenv from 'dotenv';
import { getDb } from './client';
import { studentWhitelist, academicTerms, reminderRules } from './schema/index';
import { eq } from 'drizzle-orm';

dotenv.config({ path: '../../.env' });

async function runSeed() {
  console.log('🌱 Menjalankan seed Novarion Academic Hub...');

  const db = getDb();

  const adminEmail = process.env.INITIAL_ADMIN_EMAIL || 'admin.angkatan@kampus.ac.id';
  const adminNim = process.env.INITIAL_ADMIN_NIM || '10241001';
  const adminName = process.env.INITIAL_ADMIN_NAME || 'Administrator Angkatan';

  // 1. Seed Whitelist Admin Pertama
  console.log(`Checking admin whitelist: ${adminEmail} (${adminNim})...`);
  const existingAdmin = await db
    .select()
    .from(studentWhitelist)
    .where(eq(studentWhitelist.email, adminEmail))
    .limit(1);

  if (existingAdmin.length === 0) {
    await db.insert(studentWhitelist).values({
      nim: adminNim,
      email: adminEmail,
      fullName: adminName,
      role: 'admin',
      isActive: true,
    });
    console.log(`✅ Admin pertama berhasil ditambahkan ke whitelist: ${adminEmail}`);
  } else {
    console.log(`ℹ️ Admin whitelist sudah ada: ${adminEmail}`);
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
