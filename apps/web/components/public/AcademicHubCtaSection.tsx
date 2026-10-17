import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/Button';
import { ArrowRight, LockKeyhole } from 'lucide-react';

export function AcademicHubCtaSection() {
  return (
    <section className="py-12 md:py-16 px-4 sm:px-6 max-w-7xl mx-auto w-full border-t border-border/80">
      <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex flex-col gap-1.5 max-w-xl">
          <div className="flex items-center gap-2 text-[11px] font-mono text-teal-deep font-bold uppercase tracking-wider">
            <LockKeyhole className="w-3.5 h-3.5" />
            <span>PORTAL MAHASISWA STATISTIKA 62</span>
          </div>
          <h3 className="font-heading font-bold text-xl text-text-primary tracking-tight">
            Akses Ruang Kerja Akademik & Kalender Perkuliahan
          </h3>
          <p className="text-xs text-text-muted leading-relaxed font-sans">
            Masuk menggunakan NIM dan kata sandi akun untuk melihat jadwal kuliah, sinkronisasi tugas pribadi, dan repositori materi angkatan.
          </p>
        </div>

        <Link href="/login" className="shrink-0 w-full sm:w-auto">
          <Button variant="primary" size="md" className="w-full sm:w-auto font-bold text-xs gap-2 px-6">
            <span>Masuk ke Academic Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
