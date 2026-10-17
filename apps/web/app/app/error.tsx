'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function AppSegmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Academic Hub Navigation Error]:', error);
  }, [error]);

  return (
    <div className="w-full py-12 px-4 flex items-center justify-center">
      <Card className="max-w-lg w-full p-8 text-center flex flex-col items-center gap-5 border-danger-border/40 shadow-md">
        <div className="w-12 h-12 rounded-2xl bg-danger-surface border border-danger-border flex items-center justify-center text-danger-text">
          <AlertCircle className="w-6 h-6" />
        </div>

        <div className="flex flex-col gap-1.5">
          <h2 className="font-heading font-extrabold text-lg text-text-primary">
            Halaman Ini Belum Dapat Ditampilkan
          </h2>
          <p className="text-xs text-text-muted leading-relaxed max-w-sm">
            Terjadi kendala saat mengambil data akademik. Sidebar navigasi tetap aktif, Anda dapat mencoba memuat ulang atau membuka menu lainnya.
          </p>
          {error.digest && (
            <span className="text-[10px] font-mono text-text-muted/60 mt-1">
              Error Digest: {error.digest}
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 w-full justify-center">
          <Button
            variant="primary"
            size="sm"
            className="w-full sm:w-auto gap-2 text-xs font-bold"
            onClick={() => reset()}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Coba Lagi</span>
          </Button>

          <Link href="/app" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto gap-2 text-xs"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Kembali ke Beranda</span>
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
