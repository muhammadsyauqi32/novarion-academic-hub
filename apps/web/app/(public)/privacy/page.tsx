import React from 'react';
import type { Metadata } from 'next';
import { Card } from '@/components/Card';

export const metadata: Metadata = {
  title: 'Kebijakan Privasi & Transparansi Data',
  description:
    'Kebijakan privasi dan transparansi data Novarion Academic Hub: perlindungan data NIM, enkripsi sesi, dan isolasi catatan pribadi.',
  alternates: {
    canonical: 'https://novarion.web.id/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <div className="w-full bg-canvas min-h-screen py-24 md:py-32 transition-colors duration-200">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="mb-8 flex flex-col gap-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-deep dark:text-brand-primary">
            Transparansi Data Mahasiswa
          </span>
          <h1 className="font-heading font-black text-3xl sm:text-4xl text-text-primary tracking-tight">
            Kebijakan Privasi &amp; Tata Kelola Data
          </h1>
          <p className="text-xs sm:text-sm text-text-muted">
            Terakhir diperbarui: November 2026 / Novarion Academic Hub Angkatan 62
          </p>
        </div>

        <Card className="p-8 sm:p-10 space-y-6 text-sm text-text-primary/90 leading-relaxed shadow-xs">
          <section className="space-y-2">
            <h2 className="font-heading font-bold text-base text-text-primary">1. Pendahuluan</h2>
            <p className="text-text-muted">
              Novarion Academic Hub adalah inisiatif mandiri berskala angkatan mahasiswa yang ditujukan untuk mengorganisasi informasi akademik, jadwal perkuliahan, dan pengingat tenggat waktu. Layanan ini dijalankan menggunakan infrastruktur komputasi berbiaya efisien tanpa model bisnis komersial.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-heading font-bold text-base text-text-primary">2. Data yang Dikelola</h2>
            <ul className="list-disc list-inside text-text-muted space-y-1">
              <li><span className="font-semibold text-text-primary">Identitas Akademik:</span> Nomor Induk Mahasiswa (NIM), Nama Lengkap, dan Kelas Paralel yang diimpor pengurus angkatan.</li>
              <li><span className="font-semibold text-text-primary">Autentikasi Akun:</span> Alamat email kampus dan NIM terdaftar untuk mencocokkan identitas pada daftar izin (whitelist).</li>
              <li><span className="font-semibold text-text-primary">Aktivitas Personal:</span> Catatan tugas pribadi yang hanya dapat diakses oleh pemilik akun sendiri.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="font-heading font-bold text-base text-text-primary">3. Notifikasi WhatsApp Mahasiswa</h2>
            <p className="text-text-muted">
              Pengingat tenggat waktu dikirimkan ke grup WhatsApp resmi angkatan dan grup kelas yang telah disetujui oleh pengurus. Kami tidak memantau, menyimpan, atau menyalin isi percakapan personal di luar pesan agenda akademik resmi.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-heading font-bold text-base text-text-primary">4. Penyimpanan & Keamanan</h2>
            <p className="text-text-muted">
              Data akademik disimpan di PostgreSQL dengan proteksi Row-Level Security (RLS). Kunci sesi integrasi dienkripsi dengan standar aman pada level server. Jika status keanggotaan mahasiswa dinonaktifkan, akses langsung ditutup seketika.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-heading font-bold text-base text-text-primary">5. Kontak Pengelola</h2>
            <p className="text-text-muted">
              Pertanyaan mengenai koreksi data NIM, perubahan email kampus, atau penolakan pengiriman notifikasi grup dapat disampaikan langsung kepada tim admin angkatan melalui kanal komunikasi resmi program studi Statistika dan Sains Data IPB University.
            </p>
          </section>
        </Card>
      </div>
    </div>
  );
}
