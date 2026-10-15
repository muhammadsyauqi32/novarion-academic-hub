'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { BrandLogo } from '@/components/BrandLogo';
import { ShieldCheck, Info, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();
      const redirectUrl = `${window.location.origin}/auth/callback`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
      }
    } catch (err) {
      setErrorMessage(String(err));
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-border/80 p-8 flex flex-col gap-6">
          <div className="flex flex-col items-center text-center gap-2">
            <BrandLogo size="lg" />
            <h1 className="font-heading font-extrabold text-2xl text-text-primary tracking-tight mt-3">
              Selamat Datang Kembali
            </h1>
            <p className="text-xs text-text-muted max-w-xs">
              Masuk menggunakan akun Google kampusmu untuk mengakses kalender akademik dan materi kuliah.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-danger-surface border border-danger-border flex items-start gap-2.5 text-xs text-danger-text">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Button
              variant="dark"
              size="lg"
              className="w-full font-semibold gap-3"
              isLoading={isLoading}
              onClick={handleGoogleLogin}
            >
              {/* Google G Logo SVG */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                />
              </svg>
              <span>Masuk dengan Google</span>
            </Button>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-soft border border-border flex items-start gap-2.5 text-xs text-text-muted">
            <Info className="w-4 h-4 text-teal-deep shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-text-primary">Akses Terbatas Whitelist</span>
              <span>
                Hanya mahasiswa dan pengurus yang alamat emailnya telah didaftarkan dalam whitelist angkatan yang dapat masuk.
              </span>
            </div>
          </div>

          <div className="text-center pt-2 border-t border-border/60">
            <p className="text-[11px] text-text-muted">
              Emailmu belum terdaftar? Hubungi{' '}
              <span className="text-teal-deep font-semibold underline cursor-pointer">
                Admin Angkatan
              </span>{' '}
              untuk verifikasi NIM.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
