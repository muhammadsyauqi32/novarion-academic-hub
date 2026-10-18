import React from 'react';
import Link from 'next/link';
import { ArrowRight, LockKeyhole } from 'lucide-react';

export function AcademicHubCtaSection() {
  return (
    <section className="w-full bg-[#41C2A1] py-14 md:py-20 border-b border-[#112A24]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-10 rounded-xs bg-[#EAEAB7] border-2 border-[#112A24] shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col gap-2 max-w-xl">
            <div className="flex items-center gap-2 text-xs font-mono text-[#112A24] font-black uppercase tracking-wider">
              <LockKeyhole className="w-3.5 h-3.5" />
              <span>PORTAL MAHASISWA STATISTIKA 62</span>
            </div>
            <h3 className="font-heading font-black text-2xl sm:text-3xl text-[#112A24] tracking-tight">
              Akses Ruang Kerja Akademik & Kalender Perkuliahan
            </h3>
            <p className="text-xs sm:text-sm text-[#112A24]/85 leading-relaxed font-sans font-medium">
              Masuk menggunakan NIM dan kata sandi akun untuk melihat jadwal kuliah, sinkronisasi tugas pribadi, dan repositori materi angkatan.
            </p>
          </div>

          <Link href="/login" className="shrink-0 w-full sm:w-auto">
            <button className="w-full sm:w-auto px-7 py-3 rounded-xs bg-[#112A24] text-[#EAEAB7] font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#FFAE5D] hover:text-[#112A24] transition-colors flex items-center justify-center gap-2 shadow-sm border border-[#112A24]">
              <span>Masuk ke Academic Hub</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
