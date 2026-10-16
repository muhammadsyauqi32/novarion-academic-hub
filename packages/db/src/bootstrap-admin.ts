import * as dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });
import { provisionUser, generateSecureTempPassword } from './auth-provisioning';

async function bootstrapAdmin() {
  console.log('================================================================');
  console.log('🚀 NOVARION ACADEMIC HUB — BOOTSTRAP INITIAL ADMINISTRATOR');
  console.log('================================================================\n');

  const adminEmail = process.env.INITIAL_ADMIN_EMAIL || 'admin.angkatan@kampus.ac.id';
  const adminNim = process.env.INITIAL_ADMIN_NIM || '10241001';
  const adminName = process.env.INITIAL_ADMIN_NAME || 'Administrator Angkatan';
  const envPassword = process.env.INITIAL_ADMIN_PASSWORD;

  const passwordToUse = envPassword || generateSecureTempPassword();
  const mustChangePassword = !envPassword;

  console.log(`Mengonfigurasi Administrator Utama:`);
  console.log(`- Nama Lengkap : ${adminName}`);
  console.log(`- NIM          : ${adminNim}`);
  console.log(`- Email Kampus : ${adminEmail}`);

  try {
    const result = await provisionUser({
      nim: adminNim,
      email: adminEmail,
      fullName: adminName,
      role: 'admin',
      password: passwordToUse,
      mustChangePassword,
      isActive: true,
    });

    console.log('\n✅ Admin berhasil di-bootstrap dengan sukses!');
    console.log('----------------------------------------------------------------');
    console.log(`User ID (Auth)        : ${result.id}`);
    console.log(`NIM (Untuk Login)     : ${result.nim}`);
    console.log(`Password              : ${passwordToUse}`);
    console.log(`Wajib Ganti Password  : ${mustChangePassword ? 'YA (pada login pertama)' : 'TIDAK'}`);
    console.log('----------------------------------------------------------------');
    console.log('⚠️  SIMPAN KATA SANDI INI DENGAN AMAN. JANGAN KOMIT KE REPOSITORY.\n');

    process.exit(0);
  } catch (err) {
    console.error('\n❌ Gagal mem-bootstrap admin:', err);
    process.exit(1);
  }
}

bootstrapAdmin();
