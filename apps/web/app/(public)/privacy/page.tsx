import React from 'react';
import { Card } from '@/components/Card';

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-16">
      <div className="mb-8">
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-text-primary tracking-tight">
          Kebijakan Privasi & Transparansi Data
        </h1>
        <p className="text-sm text-text-muted mt-2">
          Terakhir diperbarui: Oktober 2026 • Novarion Academic Hub V3
        </p>
      </div>

      <Card className="p-8 sm:p-10 space-y-6 text-sm text-text-primary/90 leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-heading font-bold text-lg text-text-primary">1. Pendahuluan</h2>
          <p className="text-text-muted">
            Novarion Academic Hub V3 adalah inisiatif mandiri berskala angkatan mahasiswa yang ditujukan untuk mengorganisasi informasi akademik, jadwal perkuliahan, dan pengingat deadline. Layanan ini dijalankan menggunakan infrastruktur open-source dan paket gratis tanpa model bisnis berbayar atau monetisasi komersial.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading font-bold text-lg text-text-primary">2. Data yang Dikumpulkan</h2>
          <ul className="list-disc list-inside text-text-muted space-y-1">
            <li><span className="font-semibold text-text-primary">Identitas Akademik:</span> Nomor Induk Mahasiswa (NIM), Nama Lengkap, dan Kelas Paralel yang diimpor pengurus angkatan.</li>
            <li><span className="font-semibold text-text-primary">Autentikasi Google:</span> Alamat email terverifikasi untuk mencocokkan identitas pada whitelist.</li>
            <li><span className="font-semibold text-text-primary">Aktivitas Personal:</span> Catatan tugas pribadi (`todo`/`done`) yang hanya dapat diakses oleh pemilik akun sendiri.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading font-bold text-lg text-text-primary">3. Notifikasi WhatsApp & Gateway Tidak Resmi</h2>
          <p className="text-text-muted">
            Pengingat deadline dikirimkan ke grup WhatsApp resmi angkatan dan grup kelas yang telah disetujui oleh pengurus. Sistem menggunakan library integrasi reverse-engineered (`@whiskeysockets/baileys`). Kami tidak memantau, menyimpan, atau menyalin isi obrolan personal maupun percakapan di luar pengumuman akademik resmi.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading font-bold text-lg text-text-primary">4. Penyimpanan & Keamanan</h2>
          <p className="text-text-muted">
            Data akademik disimpan di Supabase PostgreSQL dengan proteksi Row-Level Security (RLS). Kunci sesi integrasi dienkripsi dengan standar AES-256-GCM pada level server. Jika seorang mahasiswa ditarik keanggotaannya, data pribadi tidak lagi dapat diakses publik.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading font-bold text-lg text-text-primary">5. Kontak Pengelola</h2>
          <p className="text-text-muted">
            Pertanyaan mengenai koreksi data NIM, perubahan email kampus, atau penolakan pengiriman pesan grup dapat disampaikan langsung kepada tim admin angkatan melalui kanal komunikasi resmi program studi.
          </p>
        </section>
      </Card>
    </div>
  );
}
