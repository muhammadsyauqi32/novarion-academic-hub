'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { BrandLogo } from '@/components/BrandLogo';
import { Input } from '@/components/Input';
import { loginWithNimAction } from '@/actions/auth';
import { ShieldCheck, Info, AlertCircle, LogIn, Eye, EyeOff, Hash } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [nim, setNim] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    try {
      const result = await loginWithNimAction(formData);

      if (!result.success) {
        setErrorMessage(result.error || 'NIM atau kata sandi tidak valid.');
        setIsLoading(false);
        return;
      }

      if (result.redirectTo) {
        window.location.href = result.redirectTo;
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : String(err));
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-border/80 p-8 flex flex-col gap-6">
          <div className="flex flex-col items-center text-center gap-2">
            <BrandLogo size="lg" />
            <h1 className="font-heading font-extrabold text-2xl text-text-primary tracking-tight mt-3">
              Selamat Datang
            </h1>
            <p className="text-xs text-text-muted max-w-xs">
              Masuk menggunakan NIM dan kata sandi Anda untuk mengakses kalender akademik dan materi kuliah.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-danger-surface border border-danger-border flex items-start gap-2.5 text-xs text-danger-text">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <Input
                name="nim"
                label="Nomor Induk Mahasiswa (NIM)"
                placeholder="Contoh: M0401251083"
                value={nim}
                onChange={(e) => setNim(e.target.value)}
                autoComplete="username"
                required
              />
            </div>

            <div className="relative">
              <Input
                name="password"
                type={showPassword ? 'text' : 'password'}
                label="Kata Sandi"
                placeholder="Masukkan kata sandi akun"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-[29px] text-text-muted hover:text-text-primary transition-colors"
                aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <Button
              variant="primary"
              size="lg"
              type="submit"
              className="w-full font-bold gap-2 mt-2"
              isLoading={isLoading}
              disabled={!nim.trim() || !password}
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk Sekarang</span>
            </Button>
          </form>

          <div className="p-3.5 rounded-xl bg-surface-soft border border-border flex items-start gap-2.5 text-xs text-text-muted">
            <Info className="w-4 h-4 text-teal-deep shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-text-primary">Akses Terbatas Whitelist</span>
              <span>
                Hanya mahasiswa dan pengurus yang NIM-nya telah didaftarkan dalam whitelist angkatan yang dapat masuk.
              </span>
            </div>
          </div>

          <div className="text-center pt-2 border-t border-border/60">
            <p className="text-[11px] text-text-muted">
              Belum memiliki kata sandi atau lupa akses? Hubungi{' '}
              <span className="text-teal-deep font-semibold underline cursor-pointer">
                Admin Angkatan
              </span>{' '}
              untuk verifikasi NIM dan penerbitan akses baru.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
