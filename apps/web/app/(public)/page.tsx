import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { LandingInteractivePreview } from '@/components/LandingInteractivePreview';
import { 
  Calendar, 
  FolderDown, 
  BellRing, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Lock, 
  Smartphone,
  Layers,
  Database,
  FileCheck2
} from 'lucide-react';

export default function LandingPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'Novarion Academic Hub',
    url: 'https://novarion.web.id',
    description:
      'Pusat informasi dan koordinasi akademik terpadu angkatan statistika: kalender perkuliahan interaktif, pengingat deadline WhatsApp terjadwal, dan repositori materi resmi.',
    keywords: 'Statistika, Kalender Akademik, Reminder WhatsApp, Mahasiswa, Modul Praktikum',
    inLanguage: 'id-ID',
  };

  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 1. HERO SECTION (EDITORIAL, MEMORABLE, RESTAINED TYPOGRAPHY) */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 px-4 sm:px-6 max-w-6xl mx-auto w-full">
        {/* Soft, intentional atmospheric glow utilizing brand colors (mint & cream) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[360px] bg-gradient-to-b from-[#C9FBD4]/40 via-[#EAEAB7]/20 to-transparent rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="flex flex-col items-center text-center max-w-3xl mx-auto gap-6">
          {/* Cohort Identity Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-soft border border-border text-teal-deep text-xs font-semibold tracking-wide shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#41C2A1]" />
            <span>Portal Koordinasi Resmi Angkatan Statistika</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-heading font-black text-3xl sm:text-5xl md:text-6xl text-text-primary tracking-tight leading-[1.12]">
            Semua Jadwal & Materi Kuliah. <br />
            <span className="text-teal-deep">Terkoordinasi di Satu Titik.</span>
          </h1>

          {/* Editorial Subtitle */}
          <p className="text-sm sm:text-base md:text-lg text-text-muted max-w-2xl leading-relaxed">
            Kalender akademik interaktif, pengingat otomatis WhatsApp ke grup kelas, dan arsip materi perkuliahan terstruktur. Dirancang khusus untuk mempermudah ritme belajar kita bersama.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <Link href="/login">
              <Button variant="primary" size="lg" className="shadow-xs text-xs sm:text-sm font-bold py-3 px-6">
                <span>Masuk ke Novarion Hub</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <a href="#fitur">
              <Button variant="secondary" size="lg" className="text-xs sm:text-sm font-semibold py-3 px-6">
                Jelajahi Fitur Angkatan
              </Button>
            </a>
          </div>

          {/* Value Anchors */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 text-xs text-text-muted font-medium w-full border-t border-border/60 mt-4">
            <div className="flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-deep shrink-0" />
              <span>Akses Khusus NIM</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Clock className="w-4 h-4 text-[#B54708] shrink-0" />
              <span>Pengingat WhatsApp H-7 s/d T-3</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <FileCheck2 className="w-4 h-4 text-teal-deep shrink-0" />
              <span>Bank Soal & Praktikum</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Lock className="w-4 h-4 text-text-muted shrink-0" />
              <span>Catatan Pribadi Aman</span>
            </div>
          </div>
        </div>

        {/* 2. INTERACTIVE WORKSPACE PREVIEW */}
        <div className="mt-12 sm:mt-16 w-full">
          <LandingInteractivePreview />
        </div>
      </section>

      {/* 3. CORE PILLARS SECTION (INTENTIONAL, COHESIVE, ART-DIRECTED) */}
      <section id="fitur" className="w-full bg-surface border-y border-border py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col gap-12">
          <div className="max-w-2xl">
            <Badge variant="mint" size="sm" className="mb-2.5">Arsitektur Ekosistem</Badge>
            <h2 className="font-heading font-black text-2xl sm:text-4xl text-text-primary tracking-tight">
              Tiga Pilar Pendukung Kelancaran Studi
            </h2>
            <p className="text-xs sm:text-sm text-text-muted mt-2 leading-relaxed">
              Setiap komponen dirancang menyelesaikan masalah nyata yang dihadapi mahasiswa statistika sehari-hari.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pilar 1 */}
            <div className="p-7 rounded-2xl bg-canvas border border-border shadow-2xs flex flex-col justify-between hover:border-teal-deep/40 transition-colors">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-deep flex items-center justify-center font-bold">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-bold text-lg text-text-primary">
                  Kalender Akademik Terintegrasi
                </h3>
                <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                  Tampilan Bulan, Minggu, dan Hari berbasis Waktu Indonesia Barat (WIB). Memisahkan tugas resmi angkatan, jadwal ujian, jadwal praktikum R/Python, dan catatan to-do pribadi secara teratur.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs text-text-muted">
                <span className="font-medium">Format: Google Calendar Style</span>
                <span className="text-teal-deep font-bold">WIB</span>
              </div>
            </div>

            {/* Pilar 2 */}
            <div className="p-7 rounded-2xl bg-canvas border border-border shadow-2xs flex flex-col justify-between hover:border-teal-deep/40 transition-colors">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#FFAE5D]/20 text-[#B54708] flex items-center justify-center font-bold">
                  <BellRing className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-bold text-lg text-text-primary">
                  Pengingat WhatsApp Otomatis
                </h3>
                <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                  Sistem bot bekerja mengirimkan pesan pengingat ke grup WhatsApp angkatan atau kelas paralel setiap pukul 08.00 WIB pada interval H-7, H-3, H-1, dan peringatan darurat T-3 jam sebelum deadline.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-border flex items-center gap-2 text-xs text-text-muted">
                <Smartphone className="w-4 h-4 text-teal-deep" />
                <span>Langsung di grup WhatsApp tanpa unduh aplikasi baru</span>
              </div>
            </div>

            {/* Pilar 3 */}
            <div className="p-7 rounded-2xl bg-canvas border border-border shadow-2xs flex flex-col justify-between hover:border-teal-deep/40 transition-colors">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#EAEAB7]/50 text-text-primary flex items-center justify-center font-bold">
                  <FolderDown className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-bold text-lg text-text-primary">
                  Repositori Materi Terstruktur
                </h3>
                <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                  Slide kuliah dosen, modul praktikum komputasi, diktat materi, dan bank soal terorganisir per semester dan mata kuliah. Bebas dari link Google Drive yang hilang atau izin akses tertutup.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-border flex items-center gap-2 text-xs text-text-muted">
                <Database className="w-4 h-4 text-teal-deep" />
                <span>Penyimpanan aman via Supabase Cloud Storage</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. REAL COMPARISON: SEBELUM VS SESUDAH NOVARION */}
      <section className="py-20 px-4 sm:px-6 max-w-5xl mx-auto w-full">
        <div className="text-center max-w-xl mx-auto mb-12">
          <Badge variant="neutral" size="sm" className="mb-2">Perbandingan Nyata</Badge>
          <h2 className="font-heading font-black text-2xl sm:text-3xl text-text-primary tracking-tight">
            Mengapa Angkatan Kita Membutuhkan Ini?
          </h2>
          <p className="text-xs sm:text-sm text-text-muted mt-2">
            Mengakhiri kebiasaan saling bertanya tugas yang menumpuk di chat WhatsApp dan link materi yang tercecer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Box Kiri: Realita Sebelum Novarion */}
          <div className="p-6 sm:p-7 rounded-2xl bg-danger-surface/40 border border-danger-border flex flex-col gap-4">
            <div className="flex items-center gap-2.5 text-danger-text font-bold text-sm">
              <XCircle className="w-4 h-4 shrink-0" />
              <span>Sebelum Ada Novarion Academic Hub</span>
            </div>
            <ul className="space-y-3 text-xs text-text-muted leading-relaxed">
              <li className="flex items-start gap-2.5">
                <span className="text-danger-text font-black">•</span>
                <span>Pengumuman tugas dan deadline penting tenggelam oleh ratusan obrolan di grup WhatsApp angkatan.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-danger-text font-black">•</span>
                <span>Link Google Drive materi kuliah tercecer di berbagai deskripsi grup yang berbeda-beda dan sering berganti.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-danger-text font-black">•</span>
                <span>Mahasiswa kerap lupa batas waktu tugas hingga menit-menit terakhir sebelum portal pengumpulan ditutup.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-danger-text font-black">•</span>
                <span>Perubahan jadwal kuliah atau ruang kelas dari dosen sering menimbulkan kebingungan massal.</span>
              </li>
            </ul>
          </div>

          {/* Box Kanan: Solusi Novarion */}
          <div className="p-6 sm:p-7 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex flex-col gap-4">
            <div className="flex items-center gap-2.5 text-teal-deep font-bold text-sm">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-teal-deep" />
              <span>Dengan Novarion Academic Hub</span>
            </div>
            <ul className="space-y-3 text-xs text-text-primary leading-relaxed">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-teal-deep shrink-0 mt-0.5" />
                <span><strong>Satu Kalender Terverifikasi:</strong> Semua jadwal kuliah, ujian, dan praktikum dipusatkan dan dapat dibuka kapan saja.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-teal-deep shrink-0 mt-0.5" />
                <span><strong>Arsip Materi Terstruktur:</strong> Modul praktikum dan materi kuliah tersusun rapi per semester dan mata kuliah.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-teal-deep shrink-0 mt-0.5" />
                <span><strong>Bot Pengingat Tepat Waktu:</strong> Pengingat otomatis di grup kelas pada H-7, H-3, H-1, dan T-3 jam.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-teal-deep shrink-0 mt-0.5" />
                <span><strong>Catatan & To-Do Pribadi:</strong> Tandai progres belajar secara rahasia dengan proteksi Row Level Security (RLS).</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 5. CARA KERJA (ALUR AKSES 3 LANGKAH) */}
      <section id="cara-kerja" className="py-20 bg-surface border-y border-border px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex flex-col gap-12">
          <div className="text-center max-w-xl mx-auto">
            <Badge variant="mint" size="sm" className="mb-2">Akses Cepat</Badge>
            <h2 className="font-heading font-black text-2xl sm:text-3xl text-text-primary tracking-tight">
              Mulai Belajar dalam 3 Langkah
            </h2>
            <p className="text-xs sm:text-sm text-text-muted mt-2">
              Tidak ada registrasi umum yang membingungkan. Akun mahasiswa dipersiapkan langsung dari whitelist resmi angkatan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-6 rounded-2xl bg-canvas border border-border flex flex-col items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#41C2A1] text-text-primary font-heading font-black text-sm flex items-center justify-center shadow-xs">
                1
              </div>
              <h3 className="font-heading font-bold text-sm text-text-primary">Masuk Menggunakan NIM</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Gunakan NIM resmi kampus dan kata sandi sementara yang dibagikan oleh pengurus angkatan.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-canvas border border-border flex flex-col items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#41C2A1] text-text-primary font-heading font-black text-sm flex items-center justify-center shadow-xs">
                2
              </div>
              <h3 className="font-heading font-bold text-sm text-text-primary">Ganti Kata Sandi Pribadi</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Pada login pertama, Anda akan otomatis diminta membuat kata sandi baru demi keamanan akun Anda.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-canvas border border-border flex flex-col items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#41C2A1] text-text-primary font-heading font-black text-sm flex items-center justify-center shadow-xs">
                3
              </div>
              <h3 className="font-heading font-bold text-sm text-text-primary">Akses Penuh Portal</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Buka kalender perkuliahan, unduh modul praktikum, buat catatan tugas pribadi, dan nikmati kuliah yang teratur.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. COHORT IDENTITY & CALL TO ACTION (MIDNIGHT NAVY ACCENT) */}
      <section id="identitas" className="py-20 px-4 sm:px-6 max-w-4xl mx-auto w-full">
        <div className="p-8 sm:p-14 rounded-3xl bg-[#0D1B2A] text-white flex flex-col items-center text-center gap-6 shadow-xl relative overflow-hidden">
          {/* Subtle brand ambient accents */}
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[#41C2A1]/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-[#FFAE5D]/20 blur-3xl pointer-events-none" />

          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#41C2A1] to-[#176C5B] text-white flex items-center justify-center font-heading font-black text-lg shadow-sm">
            NV
          </div>

          <div className="max-w-xl">
            <h2 className="font-heading font-black text-2xl sm:text-4xl text-white tracking-tight">
              Satu Angkatan, Satu Langkah Menuju Kelulusan Bersama.
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 mt-3 leading-relaxed">
              Novarion Academic Hub hadir sebagai inisiatif mandiri untuk mendukung perjalanan kuliah kita. Tanpa biaya langganan, tanpa iklan, dan sepenuhnya berorientasi pada kemudahan belajar kita.
            </p>
          </div>

          <div className="pt-2">
            <Link href="/login">
              <Button variant="primary" size="lg" className="font-bold text-xs sm:text-sm py-3 px-8 shadow-md">
                <span>Masuk ke Portal Akademik</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
