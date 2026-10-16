import React from 'react';
import { requireAuth } from '@/lib/auth/guards';
import { Card } from '@/components/Card';
import { BrandLogo } from '@/components/BrandLogo';
import { ShieldAlert, KeyRound } from 'lucide-react';
import { ChangePasswordForm } from './ChangePasswordForm';

export default async function ChangePasswordPage() {
  const user = await requireAuth({ allowPasswordChange: true });

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <Card className="shadow-xl border-border/80 p-8 flex flex-col gap-6">
          <div className="flex flex-col items-center text-center gap-2">
            <BrandLogo size="lg" />
            <div className="flex items-center gap-2 mt-3">
              <KeyRound className="w-5 h-5 text-teal-deep" />
              <h1 className="font-heading font-extrabold text-2xl text-text-primary tracking-tight">
                {user.mustChangePassword ? 'Aktivasi Kata Sandi Baru' : 'Ubah Kata Sandi'}
              </h1>
            </div>
            <p className="text-xs text-text-muted max-w-sm">
              {user.mustChangePassword
                ? `Halo ${user.fullName}, ini adalah login pertama atau akses Anda baru saja direset. Silakan buat kata sandi baru pribadi Anda untuk melanjutkan.`
                : `Perbarui kata sandi akun ${user.fullName} (${user.nim}) untuk menjaga keamanan data akademik Anda.`}
            </p>
          </div>

          {user.mustChangePassword && (
            <div className="p-3.5 rounded-xl bg-accent-orange/15 border border-accent-orange/30 flex items-start gap-2.5 text-xs text-text-primary">
              <ShieldAlert className="w-4 h-4 text-accent-orange shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-text-primary">Tindakan Wajib Diperlukan</span>
                <span className="text-text-muted">
                  Kata sandi sementara dari admin hanya berlaku sekali. Anda harus menetapkan kata sandi baru sebelum dapat mengakses dashboard akademik.
                </span>
              </div>
            </div>
          )}

          <ChangePasswordForm mustChangePassword={user.mustChangePassword} />
        </Card>
      </div>
    </div>
  );
}
