import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ShieldX, ArrowLeft, Mail } from 'lucide-react';

export default function InvalidAccountPage() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-danger-border p-8 flex flex-col items-center text-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-danger-surface border border-danger-border text-danger-text flex items-center justify-center">
            <ShieldX className="w-7 h-7" />
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="font-heading font-extrabold text-2xl text-text-primary tracking-tight">
              Akses Dibatasi
            </h1>
            <p className="text-sm text-text-muted">
              Akun Google yang kamu gunakan berhasil diautentikasi, namun <span className="font-semibold text-text-primary">belum terdaftar</span> di dalam whitelist mahasiswa angkatan.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface-soft border border-border text-xs text-text-muted text-left w-full space-y-2">
            <div className="flex items-start gap-2">
              <span className="font-bold text-text-primary">1.</span>
              <span>Pastikan kamu masuk menggunakan email resmi kampus yang kamu gunakan saat registrasi angkatan.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-text-primary">2.</span>
              <span>Jika kamu anggota resmi namun belum bisa masuk, segera laporkan NIM dan emailmu kepada pengurus.</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full pt-2">
            <Link href="/login" className="flex-1">
              <Button variant="outline" size="md" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                <span>Ganti Akun</span>
              </Button>
            </Link>
            <a
              href="mailto:admin.angkatan@kampus.ac.id?subject=Permohonan%20Aktivasi%20Whitelist%20Novarion"
              className="flex-1"
            >
              <Button variant="dark" size="md" className="w-full">
                <Mail className="w-4 h-4 mr-1.5" />
                <span>Hubungi Admin</span>
              </Button>
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}
