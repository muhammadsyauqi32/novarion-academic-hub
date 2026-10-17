'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { BrandLogo } from '@/components/BrandLogo';
import { AlertCircle, RotateCcw, LogIn } from 'lucide-react';

export default function ChangePasswordError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[ChangePassword ErrorBoundary]:', error);
  }, [error]);

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-canvas">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-border/80 p-8 flex flex-col items-center text-center gap-6">
          <BrandLogo size="lg" />

          <div className="w-12 h-12 rounded-2xl bg-danger-surface border border-danger-border flex items-center justify-center text-danger-text mt-2">
            <AlertCircle className="w-6 h-6" />
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="font-heading font-extrabold text-xl text-text-primary">
              Gagal Memuat Formulir Kata Sandi
            </h1>
            <p className="text-xs text-text-muted leading-relaxed">
              Sesi akun Anda mungkin telah kadaluarsa atau membutuhkan verifikasi ulang. Silakan coba lagi atau masuk kembali dengan NIM Anda.
            </p>
            {error.digest && (
              <span className="text-[10px] font-mono text-text-muted/60 mt-1">
                Ref: {error.digest}
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full pt-2">
            <Button
              variant="primary"
              size="md"
              className="w-full font-bold gap-2 text-xs"
              onClick={() => reset()}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Coba Lagi</span>
            </Button>

            <Button
              variant="secondary"
              size="md"
              className="w-full font-semibold gap-2 text-xs"
              onClick={() => {
                window.location.assign('/login');
              }}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Masuk Kembali</span>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
