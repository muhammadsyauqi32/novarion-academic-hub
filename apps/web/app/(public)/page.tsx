import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
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
  Layers
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* 1. HERO SECTION (EXPRESSIVE HYBRID BRANDING) */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 px-4 sm:px-6 max-w-6xl mx-auto w-full">
        {/* Background decorative playful circles */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-brand-mint-soft/40 via-brand-cream/30 to-brand-primary/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Copy & Actions */}
          <div className="lg:col-span-7 flex flex-col items-start gap-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-mint-soft text-text-primary text-xs font-semibold border border-brand-primary/30 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-teal-deep" />
              <span>Academic Life, Made Better!</span>
            </div>

            <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl text-text-primary tracking-tight leading-[1.12]">
              One batch, <br className="hidden sm:inline" />
              <span className="text-teal-deep">one space.</span>
            </h1>

            <p className="text-base sm:text-lg text-text-muted max-w-xl leading-relaxed">
              Semua agenda perkuliahan, akses file materi, dan pengingat deadline WhatsApp tepat waktu dalam satu ekosistem terpadu untuk angkatan kita.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link href="/login">
                <Button variant="primary" size="lg" className="shadow-md">
                  <span>Masuk ke Novarion</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <a href="#fitur">
                <Button variant="secondary" size="lg">
                  Pelajari Fitur
                </Button>
              </a>
            </div>

            <div className="flex items-center gap-6 pt-4 text-xs font-medium text-text-muted">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-deep" />
                <span>Khusus Angkatan Terdaftar</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#9E5507]" />
                <span>Reminder H-7, H-3, H-1, T-3 Jam</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Object (Playful Hybrid Calendar Object) */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-[360px] sm:max-w-[400px]">
              {/* Decorative Geometric Backdrop */}
              <div className="absolute -top-4 -right-4 w-28 h-28 bg-brand-cream rounded-full -z-10 opacity-70" />
              <div className="absolute -bottom-6 -left-6 w-36 h-36 bg-brand-mint-soft rounded-3xl -rotate-6 -z-10" />

              {/* Central Stylized Calendar Object */}
              <div className="bg-surface rounded-2xl border-2 border-border p-6 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-brand-orange" />
                    <div className="w-3 h-3 rounded-full bg-brand-primary" />
                    <div className="w-3 h-3 rounded-full bg-teal-deep" />
                  </div>
                  <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
                    Kalender Akademik
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="p-3 rounded-xl bg-brand-mint-soft/50 border border-brand-primary/30 flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-teal-deep uppercase">Praktikum</span>
                      <p className="text-xs font-bold text-text-primary">Analisis Regresi Terapan</p>
                      <p className="text-[11px] text-text-muted">Batas: Jumat, 23:59 WIB</p>
                    </div>
                    <Badge variant="orange" size="sm">H-1</Badge>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-soft border border-border flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-text-muted uppercase">Tugas Bersama</span>
                      <p className="text-xs font-bold text-text-primary">Komputasi Statistika</p>
                      <p className="text-[11px] text-text-muted">Batas: Senin Depan</p>
                    </div>
                    <Badge variant="mint" size="sm">H-3</Badge>
                  </div>
                </div>

                {/* Floating Reminder WhatsApp Sticker */}
                <div className="absolute -bottom-2 right-4 translate-y-1/2 bg-surface border border-border shadow-lg rounded-xl p-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-teal-deep text-white flex items-center justify-center font-bold text-xs">
                    WA
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] font-bold text-text-primary">Grup WhatsApp Angkatan</p>
                    <p className="text-[10px] text-text-muted">Pengingat otomatis H-7 s/d T-3 jam</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TAGLINE STRIP */}
      <section className="w-full bg-brand-mint-soft/60 border-y border-brand-primary/20 py-4 px-4 overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-around gap-4 text-xs sm:text-sm font-semibold text-teal-deep">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-deep" />
            100% Bebas Biaya Langganan (Rp0)
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-deep" />
            Autentikasi NIM + Whitelist Terverifikasi
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-deep" />
            Empat Pengingat Wajib: H-7, H-3, H-1 & T-3 Jam
          </span>
        </div>
      </section>

      {/* 3. FITUR UTAMA (LIMA MODUL MVP) */}
      <section id="fitur" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge variant="primary" size="md" className="mb-3">Modul Inti</Badge>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-text-primary tracking-tight">
            Dirancang Sesuai Kebutuhan Nyata Kuliah
          </h2>
          <p className="text-sm sm:text-base text-text-muted mt-3">
            Bukan sekadar pengumuman biasa. Novarion menghubungkan agenda resmi dengan grup kelas dan manajemen tugas pribadi tiap mahasiswa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <Card className="hover:border-brand-primary/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-brand-mint-soft text-teal-deep flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-text-primary mb-2">Kalender Akademik</h3>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              Jadwal kuliah, kuis, ujian, dan praktikum berdasarkan cakupan angkatan, mata kuliah, maupun kelas paralel yang kamu ambil.
            </p>
          </Card>

          {/* Feature 2 */}
          <Card className="hover:border-brand-primary/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-brand-cream text-text-primary flex items-center justify-center mb-4">
              <FolderDown className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-text-primary mb-2">Akses File Materi</h3>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              Kompilasi modul, PPT dosen, dan bank latihan resmi tanpa perlu mengacak-acak riwayat chat lama di grup.
            </p>
          </Card>

          {/* Feature 3 */}
          <Card className="hover:border-brand-primary/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-brand-orange/20 text-[#9E5507] flex items-center justify-center mb-4">
              <BellRing className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-text-primary mb-2">Reminder WhatsApp Grup</h3>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              Bot khusus mengirimkan notifikasi H-7, H-3, H-1 pada pukul 08.00 WIB dan pengingat mendesak tepat 3 jam sebelum deadline.
            </p>
          </Card>

          {/* Feature 4 */}
          <Card className="hover:border-brand-primary/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-surface-soft text-teal-deep flex items-center justify-center mb-4">
              <CheckSquare className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-text-primary mb-2">Tugas & Checklist Saya</h3>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              Kelola tugas pribadi dan tandai tugas kuliah bersama sebagai selesai untuk melacak progres belajarmu secara rahasia.
            </p>
          </Card>

          {/* Feature 5 */}
          <Card className="hover:border-brand-primary/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-brand-primary/20 text-teal-deep flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-text-primary mb-2">Knowledge Hub</h3>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              FAQ akademik, panduan praktikum, dan tautan penting yang dapat dicari secara instan tanpa menunggu jam kerja pengurus.
            </p>
          </Card>

          {/* Feature 6 */}
          <Card className="hover:border-brand-primary/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-surface-soft text-text-muted flex items-center justify-center mb-4">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-text-primary mb-2">Pengajuan Mahasiswa</h3>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              Tahu info jadwal atau perubahan dosen lebih awal? Ajukan langsung untuk diverifikasi oleh admin angkatan.
            </p>
          </Card>
        </div>
      </section>

      {/* 4. CARA KERJA (3 LANGKAH) */}
      <section id="cara-kerja" className="py-16 bg-surface border-y border-border px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-text-primary tracking-tight">
              Mudah Digunakan dalam 3 Langkah
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-primary text-text-primary font-heading font-extrabold text-base flex items-center justify-center shadow-sm">
                1
              </div>
              <h4 className="font-heading font-bold text-base text-text-primary">Masuk dengan NIM</h4>
              <p className="text-xs text-text-muted max-w-xs">
                Gunakan NIM dan kata sandi yang telah terdaftar dalam whitelist angkatan.
              </p>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-primary text-text-primary font-heading font-extrabold text-base flex items-center justify-center shadow-sm">
                2
              </div>
              <h4 className="font-heading font-bold text-base text-text-primary">Atur Jadwal & Tugas</h4>
              <p className="text-xs text-text-muted max-w-xs">
                Periksa kalender akademik, checklist tugas yang selesai, dan dapatkan materi kuliahmu.
              </p>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-primary text-text-primary font-heading font-extrabold text-base flex items-center justify-center shadow-sm">
                3
              </div>
              <h4 className="font-heading font-bold text-base text-text-primary">Terima Pengingat Otomatis</h4>
              <p className="text-xs text-text-muted max-w-xs">
                Dapatkan notifikasi deadline di grup WhatsApp tanpa khawatir ada tugas yang terlewat.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TENTANG ANGKATAN / IDENTITAS */}
      <section id="identitas" className="py-20 px-4 sm:px-6 max-w-4xl mx-auto w-full text-center">
        <div className="p-8 sm:p-12 rounded-3xl bg-brand-mint-soft/30 border border-brand-primary/20 flex flex-col items-center gap-5">
          <Users className="w-10 h-10 text-teal-deep" />
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-text-primary">
            Dibangun dari Kita, untuk Kita
          </h2>
          <p className="text-sm sm:text-base text-text-muted max-w-xl leading-relaxed">
            Novarion Academic Hub lahir dari kebutuhan bersama akan koordinasi perkuliahan yang rapi, transparan, dan tidak bergantung pada pesan chat yang menumpuk.
          </p>
          <div className="pt-2">
            <Link href="/login">
              <Button variant="primary" size="lg">
                Masuk ke Workspace Sekarang
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
