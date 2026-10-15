# Requirements Specification — Novarion Academic Hub V3

> **Source of Truth:** MASTER_PROMPT.md V3.2 (Hybrid Design)  
> **Status:** Baseline Requirements Approved  
> **Target Pengguna:** 1 Program Studi, 1 Angkatan (~100–300 mahasiswa) + Tim Admin Angkatan.

---

## 1. Visi Produk & Batas MVP

Novarion Academic Hub V3 adalah rumah digital dan pusat operasional akademik angkatan berbasis web. Memadukan identitas angkatan yang ekspresif di halaman publik dengan dashboard akademik minimalis, bersih, dan berorientasi produktivitas tinggi saat mahasiswa masuk.

### 1.1 Lima Modul Inti (WAJIB MVP)
1. **Kalender Akademik**
   - Agenda bersama berjenjang: Angkatan, Mata Kuliah, Kelas Paralel, dan Kelompok Praktikum.
   - Alur pengajuan mahasiswa (`pending`) dan kurasi admin (`published`/`rejected`).
   - Tampilan Kalender (Bulan, Minggu, Daftar) dan detail agenda.
2. **Akses File Materi**
   - File privat via Supabase Storage dan tautan eksternal (Google Drive / OneDrive).
   - Pengelompokan berbasis semester, mata kuliah, kelas.
   - Pengecekan otorisasi server sebelum pembuatan URL unduh.
3. **Engine Reminder Deadline (Kebijakan 4 Pemicu)**
   - **H-7**: Pukul 08.00 WIB (7 hari kalender sebelum tanggal deadline).
   - **H-3**: Pukul 08.00 WIB (3 hari kalender sebelum tanggal deadline).
   - **H-1**: Pukul 08.00 WIB (1 hari kalender sebelum tanggal deadline).
   - **T-3 JAM**: Tepat 3 jam sebelum waktu deadline presisi.
   - Pengelompokan pesan pagi (08.00 WIB) per grup tanpa menghilangkan 4 trigger logis.
4. **Integrasi WhatsApp Otomatis (Baileys)**
   - Pengiriman otomatis ke grup WhatsApp yang **sudah ada** (grup angkatan & grup kelas/matkul).
   - Menggunakan akun khusus Novarion yang telah diizinkan menjadi anggota grup.
   - Persistensi sesi berbasis database SQL terenkripsi (sekali scan QR, restart tanpa re-scan).
   - Worker independen, terpisah dari serverless web.
5. **Knowledge Hub**
   - FAQ akademik, panduan kuliah, link penting, dan pengumuman referensi.
   - Pencarian instan dan filter kategori.

### 1.2 Fitur Pendukung MVP
- Autentikasi Google via Supabase Auth dengan filter whitelist NIM/Email.
- Otorisasi berbasis peran ganda: `student` dan `admin`.
- Impor data CSV (mahasiswa, matkul, kelas, kelompok, enrollment) dengan validasi baris, deteksi duplikat, dan upsert idempoten.
- Agenda pribadi dan checklist tugas (`todo`/`done`), termasuk status checklist pribadi untuk agenda bersama.
- Admin dashboard: moderasi pengajuan, audit log, WhatsApp gateway control (kill switch, test message, status monitor).

### 1.3 Eksplisit di Luar MVP
- Chatbot AI, LLM API, prompt engineering, RAG, vector embeddings.
- Direktori sosial foto mahasiswa, galeri foto besar, forum diskusi, gamifikasi.
- Integrasi sinkronisasi live Google Sheets API atau LMS OAuth rumit.

---

## 2. Batas Biaya Rp0 Langganan

1. **Next.js + TypeScript + Tailwind CSS**: Deployable ke Vercel Hobby (personal/non-komersial) atau Self-host via Docker.
2. **Supabase Free Tier**: PostgreSQL, Auth (Google OAuth), Storage (<1GB). Penggunaan file besar dialihkan ke Google Drive link.
3. **Baileys Worker**: Dijalankan di homelab / VPS pribadi / server yang selalu aktif menggunakan Docker Compose tanpa biaya langganan API berbayar.
4. **Domain**: Subdomain gratis Vercel / Cloudflare Tunnel / DuckDNS.

---

## 3. Matriks Kriteria Penerimaan MVP
| Modul | Kriteria Lolos (Acceptance Criteria) |
|---|---|
| **Auth & Whitelist** | User hanya bisa mengakses aplikasi jika email Google terverifikasi ada dalam `student_whitelist`. Non-whitelist diarahkan ke `/auth/invalid-account` tanpa kebocoran data. |
| **Data Akademik** | Relasi semester -> matkul -> kelas -> kelompok terhubung utuh. Mahasiswa hanya melihat agenda sesuai enrollment mereka. |
| **Impor CSV** | File CSV yang diunggah ulang tidak menimbulkan duplikasi (idempoten) dan memberikan preview kesalahan per baris. |
| **Reminder** | 4 pemicu (H-7, H-3, H-1, T-3 Jam) dihitung tepat sesuai WIB. Trigger lampau saat publish dilewati. Cancel agenda membatalkan job tersisa. |
| **WhatsApp Worker** | Worker menyimpan auth state di PostgreSQL. Saat worker di-restart, koneksi Baileys tersambung ulang tanpa QR code baru. |
| **Aksesibilitas & UI** | Palet 4 warna brand resmi diterapkan konsisten. Kontras WCAG AA terpenuhi (tidak ada teks putih di atas `#41C2A1`). Responsif 360px–1440px. |
