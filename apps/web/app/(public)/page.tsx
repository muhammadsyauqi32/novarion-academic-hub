import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { LandingInteractivePreview } from '@/components/LandingInteractivePreview';
import { 
  Calendar, 
  FolderDown, 
  BellRing, 
  BookOpen, 
  CheckSquare, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  Users,
  Layers,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Lock,
  Smartphone,
  ChevronDown
} from 'lucide-react';

export default function LandingPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'Novarion Academic Hub',
    url: 'https://novarion.web.id',
    description:
      'Platform terpadu angkatan statistika: kalender akademik, akses file materi, dan reminder deadline WhatsApp otomatis berbiaya Rp0.',
    keywords: 'Statistika, Kalender Akademik, Reminder WhatsApp, Mahasiswa',
    inLanguage: 'id-ID',
  };

  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 1. HERO SECTION (EXPRESSIVE, COHORT-CENTRIC & NOT AI SLOP) */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 px-4 sm:px-6 max-w-6xl mx-auto w-full">
        {/* Soft atmospheric gradient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-brand-mint-soft/30 via-brand-cream/20 to-brand-primary/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="flex flex-col items-center text-center max-w-3xl mx-auto gap-6">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-mint-soft/80 text-teal-deep text-xs font-bold border border-brand-primary/30 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-teal-deep" />
            <span>Academic Life, Made Better!</span>
            <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse ml-1" />
          </div>

          {/* Main Title */}
          <h1 className="font-heading font-black text-4xl sm:text-6xl text-text-primary tracking-tight leading-[1.12]">
            Satu Angkatan. <br />
            <span className="text-teal-deep">Satu Ruang Terpadu.</span>
          </h1>

          {/* Tagline */}
          <p className="text-base sm:text-lg text-text-muted max-w-2xl leading-relaxed">
            Selamat datang di rumah akademik kita. Agenda perkuliahan, akses file materi, dan pengingat deadline WhatsApp tepat waktu dalam satu ekosistem yang rapi dan bebas distraksi.
          </p>

          {/* Dual Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link href="/login">
              <Button variant="primary" size="lg" className="shadow-md text-sm font-bold">
                <span>Masuk ke Novarion Hub</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
            <a href="#fitur">
              <Button variant="secondary" size="lg" className="text-sm font-semibold">
                Jelajahi Fitur Angkatan
              </Button>
            </a>
          </div>

          {/* Value Highlights */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-semibold text-text-muted">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-deep" />
              <span>Khusus Mahasiswa & NIM Terdaftar</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#9E5507]" />
              <span>Reminder H-7, H-3, H-1, & T-3 Jam</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-deep" />
              <span>100% Bebas Biaya Langganan (Rp0)</span>
            </div>
          </div>
        </div>

        {/* Interactive Workspace Preview */}
        <div className="mt-12 sm:mt-16 w-full">
          <LandingInteractivePreview />
        </div>
      </section>

      {/* 2. PROBLEM VS SOLUTION STRIP (KENAPA NOVARION?) */}
      <section className="w-full bg-surface border-y border-border py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex flex-col gap-10">
          <div className="text-center max-w-2xl mx-auto">
            <Badge variant="primary" size="sm" className="mb-2">Transformasi Nyata</Badge>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-text-primary tracking-tight">
              Mengapa Angkatan Kita Membutuhkan Hub Ini?
            </h2>
            <p className="text-xs sm:text-sm text-text-muted mt-2">
              Mengakhiri kebiasaan saling bertanya tugas yang menumpuk di chat WhatsApp dan link Google Drive yang tercecer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Box Kiri: Realita Sebelum Novarion */}
            <div className="p-6 rounded-2xl bg-danger-surface/40 border border-danger-border flex flex-col gap-4">
              <div className="flex items-center gap-2 text-danger-text font-bold text-sm">
                <XCircle className="w-4 h-4" />
                <span>Sebelum Ada Novarion Academic Hub</span>
              </div>
              <ul className="space-y-3 text-xs text-text-muted">
                <li className="flex items-start gap-2.5">
                  <span className="text-danger-text font-bold">•</span>
                  <span>Pengumuman tugas dan deadline penting tenggelam oleh ratusan chat obrolan santai di grup angkatan.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-danger-text font-bold">•</span>
                  <span>Link Google Drive materi perkuliahan tercecer di berbagai deskripsi grup yang berbeda-beda.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-danger-text font-bold">•</span>
                  <span>Mahasiswa kerap lupa batas waktu tugas hingga menit-menit terakhir sebelum portal pengumpulan ditutup.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-danger-text font-bold">•</span>
                  <span>Perubahan jadwal kuliah dari dosen sering simpang siur dan menimbulkan kebingungan massal.</span>
                </li>
              </ul>
            </div>

            {/* Box Kanan: Solusi Novarion */}
            <div className="p-6 rounded-2xl bg-brand-mint-soft/30 border border-brand-primary/40 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-teal-deep font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>Dengan Novarion Academic Hub</span>
              </div>
              <ul className="space-y-3 text-xs text-text-primary">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-deep shrink-0 mt-0.5" />
                  <span><strong>Bot WhatsApp Otomatis:</strong> Notifikasi terjadwal pada 08.00 WIB untuk H-7, H-3, H-1, dan darurat T-3 jam.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-deep shrink-0 mt-0.5" />
                  <span><strong>Bank Materi Terverifikasi:</strong> Modul praktikum dan PPT dosen tersusun rapi per semester dan mata kuliah.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-deep shrink-0 mt-0.5" />
                  <span><strong>Checklist Tugas Pribadi:</strong> Tandai progres belajarmu sendiri secara rahasia tanpa takut terlewat.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-deep shrink-0 mt-0.5" />
                  <span><strong>Kalender Akademik Resmi:</strong> Jadwal diverifikasi pengurus dan dapat diakses kapan saja dari HP maupun laptop.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3. BENTO GRID FEATURES SHOWCASE */}
      <section id="fitur" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Badge variant="primary" size="sm" className="mb-2">Fitur Unggulan</Badge>
          <h2 className="font-heading font-black text-3xl sm:text-4xl text-text-primary tracking-tight">
            Dirancang Sesuai Ritme Kuliah Statistika
          </h2>
          <p className="text-xs sm:text-sm text-text-muted mt-2">
            Setiap fitur dibangun dengan mempertimbangkan alur tugas praktikum, ujian, dan koordinasi angkatan.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Kalender (Wide 2 Cols) */}
          <div className="md:col-span-2 p-7 rounded-2xl bg-surface border border-border shadow-xs flex flex-col justify-between hover:border-brand-primary/40 transition-colors">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-brand-mint-soft text-teal-deep flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-lg text-text-primary">
                Kalender Akademik Fleksibel (Google Calendar Style)
              </h3>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                Tampilan kisi kalender bulanan interaktif. Klik tanggal manapun untuk melihat daftar tugas, kuis, jadwal praktikum R/Python, atau langsung mengajukan perubahan jadwal kelas.
              </p>
            </div>

            <div className="mt-5 p-4 rounded-xl bg-surface-soft border border-border/80 flex items-center justify-between text-xs">
              <span className="font-semibold text-text-primary">Dukungan Waktu Resmi:</span>
              <Badge variant="mint" size="sm">Waktu Indonesia Barat (WIB)</Badge>
            </div>
          </div>

          {/* Card 2: WhatsApp Reminder */}
          <div className="p-7 rounded-2xl bg-surface border border-border shadow-xs flex flex-col justify-between hover:border-brand-primary/40 transition-colors">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#FFF4E5] text-[#B54708] flex items-center justify-center">
                <BellRing className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-lg text-text-primary">
                Bot Pengingat WhatsApp
              </h3>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                Bekerja otomatis dengan 4 interval pengingat wajib (H-7, H-3, H-1, T-3 Jam) langsung ke grup WhatsApp kelas atau angkatan.
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-border flex items-center gap-2 text-xs text-text-muted">
              <Smartphone className="w-4 h-4 text-teal-deep" />
              <span>Langsung di HP tanpa install aplikasi tambahan</span>
            </div>
          </div>

          {/* Card 3: Bank Materi */}
          <div className="p-7 rounded-2xl bg-surface border border-border shadow-xs flex flex-col justify-between hover:border-brand-primary/40 transition-colors">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-brand-cream text-text-primary flex items-center justify-center">
                <FolderDown className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-lg text-text-primary">
                Bank Materi Perkuliahan
              </h3>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                Kompilasi slide kuliah, buku rujukan, modul praktikum, dan bank latihan soal yang diunggah resmi oleh pengurus.
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-border flex items-center gap-2 text-xs text-text-muted">
              <Lock className="w-4 h-4 text-teal-deep" />
              <span>Penyimpanan aman via Supabase Storage</span>
            </div>
          </div>

          {/* Card 4: Checklist Tugas Saya */}
          <div className="p-7 rounded-2xl bg-surface border border-border shadow-xs flex flex-col justify-between hover:border-brand-primary/40 transition-colors">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-surface-soft text-teal-deep flex items-center justify-center">
                <CheckSquare className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-lg text-text-primary">
                Checklist Tugas Pribadi
              </h3>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                Buat to-do list pribadi dan tandai tugas selesai. Data checklist bersifat rahasia dan hanya dapat diakses oleh akun Anda sendiri.
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-border flex items-center gap-2 text-xs text-text-muted">
              <CheckCircle2 className="w-4 h-4 text-success-text" />
              <span>Privasi penuh & Row Level Security (RLS)</span>
            </div>
          </div>

          {/* Card 5: Knowledge Hub */}
          <div className="p-7 rounded-2xl bg-surface border border-border shadow-xs flex flex-col justify-between hover:border-brand-primary/40 transition-colors">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-brand-primary/20 text-teal-deep flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-lg text-text-primary">
                Knowledge Hub & Panduan
              </h3>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                Kumpulan FAQ akademik seputar KRS, panduan setup RStudio/Jupyter, dan tautan portal universitas yang dapat dicari instan.
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-border flex items-center gap-2 text-xs text-text-muted">
              <HelpCircle className="w-4 h-4 text-teal-deep" />
              <span>Pusat informasi 24/7 tanpa menunggu jam kerja</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CARA BERGABUNG (3 LANGKAH) */}
      <section id="cara-kerja" className="py-16 bg-surface-soft/60 border-y border-border px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex flex-col gap-10">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-text-primary tracking-tight">
              Masuk dan Mulai dalam 3 Langkah
            </h2>
            <p className="text-xs text-text-muted mt-2">
              Tidak perlu registrasi umum yang rumit. Akun mahasiswa telah dipersiapkan dari whitelist resmi angkatan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <Card className="p-6 flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-primary text-text-primary font-heading font-black text-sm flex items-center justify-center shadow-xs">
                1
              </div>
              <h3 className="font-heading font-bold text-sm text-text-primary">Masuk Menggunakan NIM</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Gunakan NIM universitas dan kata sandi sementara yang dibagikan oleh pengurus angkatan.
              </p>
            </Card>

            <Card className="p-6 flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-primary text-text-primary font-heading font-black text-sm flex items-center justify-center shadow-xs">
                2
              </div>
              <h3 className="font-heading font-bold text-sm text-text-primary">Ganti Kata Sandi Pribadi</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Pada login pertama, sistem mewajibkan pembuatan kata sandi baru demi keamanan akun Anda.
              </p>
            </Card>

            <Card className="p-6 flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-primary text-text-primary font-heading font-black text-sm flex items-center justify-center shadow-xs">
                3
              </div>
              <h3 className="font-heading font-bold text-sm text-text-primary">Nikmati Kuliah yang Teratur</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Buka kalender, unduh materi, atur checklist tugas, dan terima pengingat otomatis di grup WhatsApp.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* 5. TENTANG IDENTITAS ANGKATAN */}
      <section id="identitas" className="py-20 px-4 sm:px-6 max-w-4xl mx-auto w-full text-center">
        <div className="p-8 sm:p-12 rounded-3xl bg-brand-mint-soft/30 border border-brand-primary/30 flex flex-col items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-teal-deep text-white flex items-center justify-center font-black text-lg">
            NV
          </div>
          <h2 className="font-heading font-black text-2xl sm:text-3xl text-text-primary">
            Dibangun Dari Kita, Untuk Kita
          </h2>
          <p className="text-xs sm:text-sm text-text-muted max-w-xl leading-relaxed">
            Novarion Academic Hub lahir dari semangat kebersamaan angkatan statistika. Tidak ada biaya langganan, tidak ada iklan mengganggu. Hanya ruang bersama yang fungsional, andal, dan siap mendukung kelancaran studi kita hingga wisuda.
          </p>
          <div className="pt-3">
            <Link href="/login">
              <Button variant="primary" size="lg" className="shadow-md text-sm font-bold">
                Masuk ke Workspace Mahasiswa
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
