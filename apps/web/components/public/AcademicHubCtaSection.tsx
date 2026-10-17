import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/Button';
import { ArrowRight, ShieldCheck, Calendar, BellRing, FolderDown } from 'lucide-react';
import { COHORT_CONFIG } from '@/lib/config/cohort';

export function AcademicHubCtaSection() {
  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 max-w-6xl mx-auto w-full border-t border-border/60">
      <div className="relative p-8 sm:p-12 rounded-3xl bg-surface border border-border shadow-xs overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Soft background glow */}
        <div className="absolute -top-12 -right-12 w-80 h-80 bg-gradient-to-br from-[#41C2A1]/20 via-[#C9FBD4]/30 to-transparent rounded-full blur-2xl -z-10 pointer-events-none" />

        <div className="flex flex-col items-start gap-4 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-soft border border-border text-teal-deep text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Akses Khusus Mahasiswa Statistika 62</span>
          </div>

          <h2 className="font-heading font-black text-2xl sm:text-3xl md:text-4xl text-text-primary tracking-tight">
            Ruang Kerja Akademik & Reminder Kuliah
          </h2>

          <p className="text-sm text-text-muted leading-relaxed">
            Kalender terintegrasi, pengingat deadline WhatsApp terjadwal ke grup kelas, repositori modul praktikum, dan personal checklist angkatan.
          </p>

          <div className="grid grid-cols-3 gap-4 pt-2 text-xs text-text-muted font-medium w-full">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-teal-deep shrink-0" />
              <span>Jadwal Kuliah</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BellRing className="w-3.5 h-3.5 text-[#B54708] shrink-0" />
              <span>Notif WhatsApp</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FolderDown className="w-3.5 h-3.5 text-teal-deep shrink-0" />
              <span>File Materi</span>
            </div>
          </div>
        </div>

        <div className="shrink-0 flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <Link href="/login" className="w-full sm:w-auto">
            <Button variant="primary" size="lg" className="w-full sm:w-auto font-bold text-xs sm:text-sm py-3.5 px-7 shadow-xs">
              <span>Masuk ke Academic Hub</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
