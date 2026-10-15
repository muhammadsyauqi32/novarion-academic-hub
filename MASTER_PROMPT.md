# MASTER PROMPT — NOVARION ACADEMIC HUB V3.2 (HYBRID DESIGN)

> **Status:** Final untuk memulai implementasi MVP; arahan visual Hybrid sudah dikunci. Keberhasilan integrasi WhatsApp nyata tetap harus dibuktikan dengan pengujian.  
> **Prinsip utama:** produk yang benar-benar berjalan, aman, dapat dirawat, dan **tanpa langganan berbayar**.

## 0. INSTRUKSI UTAMA BAGI AI CODING AGENT

Kamu berperan sebagai **senior full-stack engineer, software architect, database engineer, security engineer, QA engineer, dan UI/UX designer**. Bangun aplikasi web nyata bernama **Novarion Academic Hub V3**, bukan landing page palsu atau sekumpulan mockup. Proyek dimulai **dari nol**. Kerjakan dalam tahapan kecil yang dapat dijalankan dan diuji.

Gunakan dokumen ini sebagai **source of truth**. Jangan memperluas fitur MVP, mengubah keputusan produk, mengganti provider, atau menjanjikan integrasi tanpa alasan yang jelas dan pengujian. Jika dokumentasi layanan telah berubah, periksa sumber resmi terbaru dan laporkan penyesuaian. Jangan mengarang endpoint, method, kuota gratis, hasil test, atau kemampuan WhatsApp.

**Jangan langsung membangun seluruh aplikasi dalam satu respons/commit.** Awali dengan rancangan, struktur proyek, migration, dan implementasi tahapan pertama. Setiap tahap harus memiliki kriteria penerimaan, bukti pengujian, dan laporan hasil.

## 1. PRODUK, PENGGUNA, DAN BATAS MVP

**Nama:** Novarion Academic Hub V3.  
**Pengguna:** satu program studi dan satu angkatan, sekitar **100–300 mahasiswa**, dengan admin angkatan.  
**Bentuk produk:** Academic Hub + identitas digital angkatan; antarmuka bahasa Indonesia, modern, mobile-first. **Arah visual wajib: HYBRID — beranda publik ekspresif, dashboard akademik minimalis, panel admin fungsional.**

### Lima modul inti yang WAJIB pada MVP

1. **Kalender Akademik** — agenda bersama berdasarkan cakupan akademik, pengajuan mahasiswa, verifikasi admin, kalender dan daftar.
2. **Akses File Materi** — admin bisa upload file atau menambahkan link eksternal; mahasiswa mengakses berdasarkan mata kuliah/kelas.
3. **Reminder Tugas/Deadline** — **H-7, H-3, H-1, dan tepat 3 jam sebelum deadline**.
4. **Integrasi Grup WhatsApp Otomatis** — pengiriman ke grup angkatan dan grup kelas/mata kuliah yang **sudah ada**, menggunakan **Baileys** dan server/worker persisten.
5. **Knowledge Hub** — FAQ, panduan, tautan penting, dan informasi akademik dengan pencarian serta filter.

### Fitur pendukung yang termasuk MVP

- Login menggunakan Google melalui Supabase Auth + whitelist NIM/email yang diimpor admin.
- Role **student** dan **admin**; otorisasi di server dan database.
- Impor data mahasiswa, mata kuliah, kelas, kelompok, dan keanggotaan dari CSV/hasil ekspor Google Sheets.
- Agenda pribadi dan checklist tugas (`todo`/`done`), termasuk status penyelesaian tugas bersama **per mahasiswa**.
- Admin dashboard, moderation, informasi identitas angkatan, pengaturan WhatsApp, riwayat pengiriman, dan audit log.

### Secara eksplisit DI LUAR MVP

- Chatbot AI, LLM API, tool calling, RAG, vector embeddings, dan chat history.
- Direktori sosial mahasiswa, galeri besar, gamifikasi, forum, pembayaran, dan aplikasi mobile native.
- Integrasi real-time otomatis dengan Google Sheets atau LMS jika perlu OAuth/scope/biaya/kerumitan tambahan. Impor CSV dari Sheets sudah memenuhi MVP.

Jangan membuat tabel, tombol, halaman, atau placeholder permanen untuk fitur yang ditunda. Namun, desainnya harus mudah diperluas kelak.

## 2. BATAS BIAYA: Rp0 LANGGANAN

**Wajib menggunakan software open-source dan paket gratis yang tersedia.** Tidak boleh menjadikan kartu kredit, langganan, layanan trial yang segera habis, upgrade otomatis, API WhatsApp resmi berbayar, ataupun penyewaan VPS sebagai prasyarat untuk membangun dan menguji MVP.

Pilihan awal:
- Next.js + TypeScript + Tailwind CSS, bisa dideploy di **Vercel Hobby hanya bila penggunaan mematuhi ketentuan personal/nonkomersial dan kuota**; sediakan alternatif self-host via Docker.
- **Supabase Free** untuk PostgreSQL, Auth, dan Storage, dengan pemeriksaan kuota terbaru.
- **Drizzle ORM** dan **Zod**.
- **Baileys** di service Node.js/TypeScript terpisah pada homelab/server milik sendiri yang selalu hidup; **Docker Compose**.
- Domain awal menggunakan subdomain hosting gratis; jangan wajibkan pembelian domain.
- File besar sebaiknya memakai tautan Google Drive; file kecil dapat memakai Supabase Storage.

Catat dengan jujur bahwa **Rp0 biaya langganan tidak sama dengan nol biaya listrik, internet, hardware, atau jaminan 24/7**. Jika kapasitas free tier habis atau layanan berhenti, sistem harus memberikan informasi jelas dan tidak melakukan upgrade otomatis. Jangan menganggap free tier cocok tanpa batas untuk produksi. Dokumentasikan opsi deployment alternatif.

## 3. STACK DAN ARSITEKTUR

- **Web:** Next.js App Router, TypeScript, Tailwind CSS, komponen accessible dan reusable.
- **Database:** PostgreSQL di Supabase; skema/migration menggunakan Drizzle.
- **Auth:** Supabase Auth (Google OAuth) dengan server-side session verification.
- **Validation:** Zod di semua input server.
- **Storage:** Supabase Storage untuk upload privat; link eksternal untuk Google Drive/sumber lain.
- **Scheduler/queue:** PostgreSQL-backed persistent reminder jobs; worker Node.js terpisah.
- **WhatsApp:** `@whiskeysockets/baileys` melalui `MessagingProvider` yang dapat diganti dan `MockMessagingProvider`.
- **Deployment:** web dan bot/worker dapat berjalan terpisah; worker tidak ditempatkan pada fungsi serverless berumur pendek.
- **Tooling:** ESLint, TypeScript strict, Vitest (atau setara), integration tests, Playwright untuk E2E penting; Docker Compose dan `.env.example`.

Web harus tetap dapat digunakan ketika server Baileys offline. Status pengingat dan koneksi tidak boleh dipalsukan.

### Cara komunikasi web–worker

Utamakan **database sebagai penghubung**, bukan membuka port publik homelab:
1. Next.js menulis agenda dan job ke PostgreSQL.
2. Worker outbound mengakses PostgreSQL dan WhatsApp.
3. Worker memperbarui status, koneksi, dan delivery logs.
4. Admin dashboard membaca status melalui endpoint terotorisasi.
5. QR pairing boleh dipublikasikan **sementara** melalui record/endpoint khusus admin dengan TTL pendek; hapus ketika kedaluwarsa/berhasil pairing. Jangan membocorkan QR, credential, atau service-role key.

## 4. ROLE, LOGIN, DAN WHITELIST

### Student

- Melihat agenda resmi untuk seluruh angkatan dan mata kuliah/kelas/kelompok yang diikutinya.
- Mengajukan agenda bersama; melihat status dan alasan review.
- Membuat/mengubah/menghapus agenda pribadi dan checklist tugas.
- Menandai tugas bersama sebagai selesai secara pribadi.
- Mengakses materi, FAQ, dan informasi yang relevan.

### Admin

- Menambah/memperbaiki data whitelist, mahasiswa, mata kuliah, kelas, kelompok, keanggotaan, dan impor.
- Membuat agenda resmi langsung; memverifikasi pengajuan, mengedit, dan membatalkan agenda dengan audit.
- Mengelola materi/Knowledge Hub.
- Melakukan pairing bot; mengatur grup tujuan, mengirim pesan tes, melihat antrean dan error, serta menonaktifkan seluruh pengiriman melalui kill switch.

**Login:** Google OAuth melalui Supabase Auth. Setelah sign-in, cocokkan **email terverifikasi** terhadap whitelist yang diimpor, kaitkan secara unik dengan NIM/identitas akademik, lalu beri akses aplikasi. Pengguna yang berhasil autentikasi Google tetapi tidak ada dalam whitelist **tidak boleh mendapatkan akses aplikasi**. Jangan percaya NIM, role, atau email yang dikirim klien sebagai bukti identitas. Sediakan alur admin untuk email berubah atau identitas ganda.

**Admin pertama** harus di-bootstrap lewat seed/script berizin khusus di lingkungan server; tidak boleh ada endpoint publik untuk mengangkat diri menjadi admin. Semua operasi admin dilindungi server authorization. Gunakan RLS yang sesuai model akses dan pahami bahwa service-role bypass RLS sehingga endpoint server wajib memvalidasi permission secara eksplisit.

## 5. STRUKTUR AKADEMIK DAN IMPOR

Dukung:
- Tahun akademik/semester.
- Mata kuliah dan kode mata kuliah.
- Penawaran mata kuliah pada semester tertentu.
- Kelas paralel.
- Kelompok praktikum/kelompok relevan.
- Keanggotaan mahasiswa dalam mata kuliah, kelas, dan kelompok.

Impor admin via CSV (termasuk CSV yang diekspor dari Google Sheets) harus memiliki template yang dapat diunduh, preview, mapping header, validasi NIM/email, deteksi duplikat, pelaporan kesalahan per baris, dan **upsert/idempotency**. Impor ulang file yang sama tidak boleh menggandakan data. Jangan wajibkan Google Sheet dibuat publik untuk impor data sensitif. Integrasi Sheets langsung boleh menjadi peningkatan kemudian, bukan prasyarat.

## 6. AGENDA AKADEMIK

Kategori minimal: `tugas`, `kuis`, `ujian`, `praktikum`, `kuliah`, `kegiatan`, `pengumuman`.

Scope penerima: `angkatan`, `mata_kuliah`, `kelas`, `kelompok`; **agenda pribadi terpisah**. Tampilkan hanya agenda yang relevan menurut keanggotaan dan status publikasinya.

Field penting: id, judul, deskripsi, kategori, scope + target akademik, waktu mulai opsional, deadline opsional, lokasi/tautan, referensi sumber, pembuat, status, versi, waktu dibuat/diperbarui.

### Workflow bersama

- Student submit → `pending` → admin `published` atau `rejected` (dengan alasan).
- `pending` / `rejected` tidak terlihat sebagai agenda resmi dan tidak dijadwalkan untuk reminder grup.
- Student yang ingin mengubah agenda `published` mengajukan **revisi** dengan approval; versi terpublikasi tetap terlihat sampai revisi disetujui.
- Admin boleh mengedit langsung tetapi aksi dan versi perubahan diaudit.
- Agenda `cancelled` tetap boleh terlihat sebagai informasi pembatalan, tetapi **tidak menghasilkan reminder deadline baru**.
- Ada pencarian/filter, indikasi agenda duplikat, dan validasi tanggal `end >= start` jika keduanya ada.
- Agenda tanpa deadline tidak mendapatkan reminder deadline.
- Jika hanya tanggal deadline diisi, default **23.59 WIB** dan tampilkan asumsinya jelas pada UI.

Simpan timestamp sebagai UTC; untuk interpretasi kalender, tanggal, jam, dan reminder gunakan `Asia/Jakarta`.

### Agenda pribadi & status tugas

- Agenda/tugas pribadi hanya terlihat oleh pemiliknya dan tidak dapat masuk grup WhatsApp.
- Minimal status `todo` dan `done`.
- Untuk agenda tugas bersama, simpan status selesai milik tiap mahasiswa di tabel terpisah; **tidak mengubah agenda resmi atau reminder grup**.

## 7. REMINDER — KEBIJAKAN FINAL (WAJIB)

**Empat reminder per agenda yang mempunyai deadline dan telah `published`:**

1. **H-7:** pukul **08.00 WIB**, tujuh hari kalender sebelum tanggal deadline.
2. **H-3:** pukul **08.00 WIB**, tiga hari kalender sebelum tanggal deadline.
3. **H-1:** pukul **08.00 WIB**, satu hari kalender sebelum tanggal deadline.
4. **T-3 JAM:** tepat **deadline dikurangi tiga jam** (jam presisi, termasuk bila tengah malam).

**Jangan mengganti empat reminder ini dengan Daily Digest.** H-7/H-3/H-1 boleh **digabung menjadi satu pesan ringkasan per grup pada pukul 08.00** jika banyak agenda mencapai tahap reminder pada hari yang sama; masing-masing agenda tetap harus memperoleh empat *logical triggers* yang valid. Pengingat T-3 jam harus tetap tepat waktu. Jangan otomatis memindahkan pengingat T-3 jam karena quiet hours; aturan quiet hours hanya opsi masa depan dan tidak boleh diam-diam melanggar jadwal.

Aturan:
- Jadwal dihitung setelah agenda dipublikasikan.
- Trigger yang waktunya sudah berlalu saat agenda baru dipublikasikan **dilewati**, bukan dikirim beruntun.
- Agenda yang diubah deadline/status/scope harus membatalkan atau menyesuaikan job mendatang secara transaksional.
- Jadwal dan deduplication harus memperhitungkan **agenda, revisi/deadline, tahap reminder, dan target grup**.
- Jika satu grup menerima berbagai scope, deduplikasi mencegah agenda sama berulang pada **grup yang sama** dalam batch yang sama.
- Jika grup tujuan tidak ditemukan/terpetakan, status `unroutable`, tampilkan peringatan admin, **jangan fallback ke grup lain sembarangan**.
- Ada retry exponential backoff untuk kegagalan sementara, pembatasan percobaan, lease/lock worker, dan pengelolaan job `unknown` ketika keberhasilan pengiriman tidak pasti. **Jangan menjanjikan exactly-once delivery jika provider tidak mendukung idempotency.** Hindari retry membabi buta atas hasil ambigu yang bisa memicu pesan ganda.
- Catat `queued`, `processing`, `submitted/sent-to-provider`, `failed`, `unknown`, `cancelled`, serta timestamp, error aman, provider message ID jika ada.
- Status `submitted` **bukan jaminan delivered/read**.
- Jangan mengirim reminder tugas pribadi ke grup; jangan mencantumkan data penyelesaian pribadi mahasiswa di pesan grup.

### Contoh

Deadline 30 Oktober 2026 23.59 WIB → H-7 23 Oktober 08.00; H-3 27 Oktober 08.00; H-1 29 Oktober 08.00; T-3 jam 30 Oktober 20.59 WIB.

### Template grup (ringkas)

`📚 NOVARION — PENGINGAT AKADEMIK`  
`[H-7/H-3/H-1 atau 3 JAM LAGI]`  
`Mata kuliah: ...`  
`Agenda: ...`  
`Deadline: [hari, tanggal, jam WIB]`  
`Detail: [tautan website]`

Pesan gabungan harus tetap mudah dibaca, mengurutkan deadline, dan membatasi panjang pesan secara wajar.

## 8. WHATSAPP GATEWAY — BAILEYS DAN SEKALI PAIRING

**Kebutuhan:** kirim otomatis ke **grup WhatsApp yang sudah ada**, yaitu grup utama angkatan dan grup kelas/mata kuliah, dengan satu akun pengirim khusus Novarion yang menjadi anggota grup tersebut atas izin pengelola grup.

**Library:** `@whiskeysockets/baileys` sebagai kandidat yang telah dipilih. Ini integrasi **tidak resmi**, berisiko putus akibat perubahan WhatsApp, pembatasan akun, dan tidak memiliki SLA. Jangan klaim bebas risiko. Tidak boleh menerapkan teknik menghindari deteksi atau pembatasan platform.

### Alur pairing

1. Admin membuka **Settings → WhatsApp Gateway**.
2. Jika belum terhubung, dashboard menampilkan QR dari worker **secara sementara dan hanya untuk admin**.
3. Admin memindai QR dari akun khusus Novarion **sekali saat pairing awal**.
4. Worker menyimpan **credentials DAN Signal keys** secara persisten dan terenkripsi; update auth state setiap kali berubah.
5. Setelah restart, worker memuat sesi yang masih valid dan **reconnect otomatis tanpa meminta QR ulang**.
6. Jika sesi logout/dicabut/tidak valid, tampilkan `requires_repair`, hentikan pengiriman, dan **baru** minta scan QR ulang.

Untuk produksi buat **SQL-backed AuthenticationState/SignalKeyStore** dengan persistensi atomik dan penyimpanan terenkripsi; gunakan `useMultiFileAuthState` **hanya untuk development atau prototipe lokal**, bukan penyimpanan produksi yang andal. Lindungi encryption key di server, jangan simpan di browser/repository/log. Pastikan hanya **satu** proses memegang sesi WhatsApp aktif, dan implementasikan health check, reconnect dengan backoff, dan Docker restart policy.

### Routing grup

- Bot mengambil daftar grup yang benar-benar bisa diakses akun yang terkoneksi.
- Admin memilih grup dan memetakan **JID** grup ke scope angkatan/mata kuliah/kelas/kelompok.
- Agenda angkatan → grup utama. Agenda mata kuliah/kelas/kelompok → hanya grup yang dipetakan sesuai scope (tidak otomatis dikirim ke grup utama).
- Jika satu JID digunakan oleh beberapa scope, jangan kirim agenda sama dua kali dalam satu window.
- Pengiriman hanya jika grup telah diizinkan admin grup dan pengaturan channel aktif.
- Tawarkan tombol **Test Message**, **Pause All Messaging**, **Resume**, serta daftar error dan riwayat.
- Jangan menjadikan invite link sebagai identitas grup yang valid tanpa verifikasi metadata provider.

### Keamanan dashboard

- Halaman pairing, daftar JID grup, QR, dan log integrasi hanya untuk admin.
- QR harus sementara, kedaluwarsa, dan dihapus setelah pairing.
- Tidak perlu membuka port WhatsApp bot secara publik; pekerja melakukan koneksi outbound. Untuk kontrol dashboard, gunakan job/perintah lewat backend yang terlindungi, bukan direct browser → port worker terbuka.
- Jangan melakukan sinkronisasi penuh atau menyimpan isi percakapan grup yang tidak dibutuhkan untuk reminder.
- Semua percobaan kirim mencatat audit tanpa mengekspos token/session key.

## 9. MATERI DAN KNOWLEDGE HUB

Hanya **admin** yang boleh membuat, mengedit, menerbitkan, mengarsipkan, atau menghapus materi dan FAQ.

Tipe konten:
- Materi PDF/PPT/dokumen yang di-upload.
- Tautan Google Drive, OneDrive, atau situs kelas.
- FAQ, panduan, ringkasan informasi resmi, link penting.

Setiap item memiliki: judul, deskripsi, kategori, sumber, mata kuliah/semester, target kelas/kelompok jika perlu, jenis file atau URL, status publikasi, timestamp, dan pembuat.

MVP mendukung pencarian berdasarkan **judul, kategori, deskripsi, mata kuliah, semester**. Upload pakai Supabase Storage privat dengan pembatasan ukuran/tipe sesuai kuota aktual dan signed URLs/akses terotorisasi. Link eksternal divalidasi dan diberi indikator bahwa akses mengikuti pengaturan file sumber. Materi besar direkomendasikan via link eksternal untuk menjaga kuota gratis. Jangan mengunggah materi yang tidak memiliki izin untuk dibagikan.

Boleh gunakan backend/tabel konten terpadu, tetapi berikan halaman **File Materi** dan **Knowledge Hub** yang navigasinya jelas berbeda. Jangan mengimplementasikan embedding/RAG sekarang.

## 10. IDENTITAS ANGKATAN DAN UI/UX

Halaman publik minimal: landing page Novarion, identitas/cerita singkat angkatan, logo/placeholder branding yang mudah diganti, tautan sosial, tombol login.

Halaman student: dashboard, kalender (bulan/minggu/daftar), detail agenda, pengajuan agenda, agenda pribadi/checklist, File Materi, Knowledge Hub, akun.

Halaman admin: dashboard, review agenda, manajemen agenda, impor roster/mata kuliah/kelas, manajemen materi/Knowledge Hub, WhatsApp gateway & group mapping, reminder logs, audit ringkas.

Gunakan **bahasa Indonesia**, mobile-first, accessible, kontras cukup, navigasi sederhana, loading/empty/error/success state, feedback validasi yang jelas. **Patuhi secara eksplisit design system dan arahan setiap halaman pada bagian 10A–10D.** Tidak ada dummy data permanen atau tombol palsu di produksi. Pisahkan seed data development dari produksi.

## 10A. CREATIVE DIRECTION — HYBRID (KEPUTUSAN FINAL)

**Arah visual resmi: `Expressive Landing Page + Clean Academic Dashboard`. Ini keputusan produk, bukan inspirasi opsional.**

Tujuan persepsi: website ini terasa seperti **rumah digital angkatan yang hidup** ketika diakses publik, lalu berubah menjadi **alat produktivitas yang tenang, cepat, jelas** ketika mahasiswa masuk. Admin membutuhkan UI utilitarian yang mempermudah operasi data dan troubleshooting, bukan landing page yang diulang.

| Area | Karakter | Elemen visual | Jangan lakukan |
|---|---|---|---|
| **Beranda publik** (`/`) | Ekspresif, ramah, berkarakter angkatan | Hero tipografi tebal, pola organik, bentuk dekoratif, empat warna brand, copy hangat | Animasi berat, carousel otomatis, landing generik SaaS, elemen yang terlihat seperti fitur palsu |
| **Login / akses** | Ringan, meyakinkan, konsisten | Brand header, kartu login ringkas, ilustrasi aksen kecil | Meminta NIM/password tambahan tanpa kebutuhan whitelist; hiasan mengganggu OAuth |
| **Workspace student** (`/app/*`) | Minimalis, terstruktur, produktif | Kanvas putih, whitespace, kalender sentral, cards sederhana, badge kontekstual | Hero raksasa di tiap halaman, kartu warna-warni di mana-mana, animasi berulang |
| **Workspace admin** (`/admin/*`) | Operasional, padat tetapi tetap nyaman | Tabel/filter, bulk actions bila relevan, indikator status, audit trail | Menghilangkan data penting demi estetika; pemakaian warna sebagai satu-satunya status |

**Aturan penting:** Hybrid **bukan** berarti membuat dua aplikasi/tema yang tidak konsisten. Keduanya memakai token, tipografi, ikon, komponen input, navigasi, dan pattern interaksi yang sama. Yang dibedakan adalah *intensitas ekspresi visual* dan kepadatan informasi. Public hero boleh dekoratif; aplikasi internal harus memprioritaskan isi.

### 10A.1 Palet resmi, semantik, dan kontras

**Empat warna brand yang tidak boleh diubah:**

| Token | Hex resmi | Fungsi yang disepakati |
|---|---|---|
| `brand-primary` | `#41C2A1` | Mint/teal utama; identitas, blok hero, highlight, tombol primer dengan teks gelap |
| `brand-mint-soft` | `#C9FBD4` | Surface informasi positif, hari kalender terpilih, background kartu lembut |
| `brand-cream` | `#EAEAB7` | Surface akademik, catatan, catatan visual dekoratif |
| `brand-orange` | `#FFAE5D` | Deadline mendesak, aksen perhatian, variasi ilustrasi (jangan untuk semua status) |

**Token netral pendamping yang direkomendasikan dan boleh disesuaikan bila lolos kontras:**

- `canvas` `#F8FBF9`; `surface` `#FFFFFF`; `surface-soft` `#F1F7F3`; `border` `#E2ECE8`.
- `text-primary` `#203B34`; `text-muted` `#63756F`; `text-inverse` `#FFFFFF` hanya di surface benar-benar gelap.
- `teal-deep` `#176C5B` untuk teks/link/tombol solid gelap, focus outline, atau elemen dengan tuntutan kontras.
- Status **error/danger** memerlukan token fungsional merah gelap yang aksesibel (mis. `#B42318` untuk teks dengan latar cerah), terpisah dari oranye brand. Status success/warning/info juga punya teks/ikon, bukan warna saja.

**Perhatian kontras yang sudah terukur (perkiraan WCAG):** teks putih di atas `#41C2A1` ~**2.22:1** (gagal untuk teks kecil); teks `#203B34` di atas `#41C2A1` ~**5.45:1** (lolos AA normal); `#176C5B` di atas putih ~**6.3:1**. Karena itu **jangan menggunakan teks putih kecil pada button mint primer**. Untuk button mint gunakan teks gelap; untuk button hijau gelap boleh teks putih setelah diuji. Pastikan rasio teks normal >=4.5:1, teks besar >=3:1, dan boundary/focus indikator relevan >=3:1. Uji juga hover, disabled, pressed, dan selected.

**Contoh tokens implementasi** (boleh mengikuti Tailwind v4 atau CSS variables, nama token dijaga konsisten):

```css
:root {
  --brand-primary: #41C2A1;
  --brand-mint-soft: #C9FBD4;
  --brand-cream: #EAEAB7;
  --brand-orange: #FFAE5D;
  --canvas: #F8FBF9;
  --surface: #FFFFFF;
  --surface-soft: #F1F7F3;
  --border: #E2ECE8;
  --text-primary: #203B34;
  --text-muted: #63756F;
  --teal-deep: #176C5B;
  --focus-ring: #176C5B;
}
```

Gunakan semantic token/class, **jangan menyebarkan literal hex ke puluhan komponen**. Keempat warna resmi harus tetap menjadi single source of truth. Pertahankan gaya light sebagai default MVP; dark mode bukan requirement dan tidak boleh memakan waktu MVP.

### 10A.2 Tipografi, ikon, bentuk, dan ritme

- **Heading/brand:** `Plus Jakarta Sans` (jika tersedia bebas melalui `next/font`) atau fallback sans lokal dengan bobot 700–800. **Body/UI:** `Inter` atau system-ui. Jangan membutuhkan font berbayar. Jika pemuatan font gagal, layout harus tetap baik.
- Skala desktop orientatif: display hero 48–72px, H1 halaman 28–32px, H2 20–24px, H3 16–18px; body 14–16px, caption 12–13px. Untuk mobile hero 34–44px, H1 24–28px. Jangan mengecilkan teks tabel penting sampai sulit dibaca.
- Gunakan spacing berbasis kelipatan 4px / 8px; container public max-width ~1180–1240px; konten aplikasi max-width yang nyaman tanpa membuat tabel terpotong.
- Radius: card 12–18px, input/button 8–12px, badge pill hanya jika cocok, modal 16px. Border halus 1px; bayangan ringan dan jarang.
- Ikon konsisten dari **Lucide** (SVG) atau set open-source seragam. Jangan mencampur emoji untuk semua ikon navigasi; emoji boleh sesekali di copy/empty state.
- Efek visual landing: bentuk lingkaran/flower-like/starburst, dotted orbit, sticker kecil, ilustrasi geometrik ringan. Bangun dengan CSS/SVG ringan tanpa meniru merek lain atau membeli aset.
- Animasi hanya kecil: hover/press/transition 120–220ms, reveal ringan bila tepat, skeleton saat loading. Hormati `prefers-reduced-motion`; hindari animasi yang menghalangi interaksi.
- Navigasi, button, search, select, combobox, tabs, form error, dialog, toast, status badge, file card, event card, kalender, tabel, pagination, dan empty state wajib konsisten lintas role.

### 10A.3 Logo, foto, dan identitas angkatan

**Logo resmi BELUM diberikan.** Gunakan **wordmark sementara `NOVARION`** dan, jika perlu, tanda `N` generik yang jelas hanya placeholder. Sediakan `public/branding/logo.svg` (hanya setelah aset resmi tersedia), `public/branding/logo-mark.svg`, dan konfigurasi brand yang dapat diganti tanpa mengubah layout. Bila aset belum tersedia, tampilkan wordmark teks; **jangan mengarang lambang resmi, tahun angkatan, maskot, tagline resmi, prestasi, atau angka statistik nyata**.

Copy alternatif landing boleh memakai: **"One batch, one space."**, **"Semua urusan akademik, satu tempat."**, atau **"Built for us, made to grow."** sebagai teks usulan, bukan identitas resmi yang diklaim sudah disepakati. Gunakan konten seed jelas berlabel ilustrasi di development; produksi harus memakai konten benar atau state belum tersedia. Galeri/direktori sosial tidak termasuk MVP.

## 10B. INFORMATION ARCHITECTURE & NAVIGATION

### 10B.1 Public layout

Header: wordmark kiri → tautan beranda/fitur/tentang (anchor sections yang nyata) → CTA `Masuk`. Pada mobile gunakan menu sederhana. Footer berisi identitas singkat, tautan sosial yang dikonfigurasi admin, tautan privasi, dan copyright yang tidak mengarang tahun pendirian.

Landing page **bukan dashboard publik**: jangan membocorkan jadwal khusus, daftar NIM, agenda pribadi, akses file privat, atau daftar grup. Teaser kalender menggunakan ilustrasi statis atau data publik yang memang diizinkan.

### 10B.2 Student app layout

- **Desktop ≥1024px:** sidebar kiri 220–252px (bisa collapse), topbar ringkas (judul/breadcrumb, search konteks bila ada, notifikasi, avatar), konten utama.
- **Tablet 768–1023px:** sidebar dipadatkan atau drawer; jangan memotong kalender/tabel.
- **Mobile <768px:** topbar ringkas + bottom navigation 4 titik prioritas: `Beranda`, `Kalender`, `Tugas`, `Materi`; `Lainnya` atau menu tambahan untuk `Knowledge Hub`, `Pengajuan Saya`, `Notifikasi`, `Pengaturan`. Batasi bottom nav menjadi maksimal lima item termasuk More. Area tombol ramah sentuh (target 44×44px jika memungkinkan).
- Desktop sidebar: `Dashboard`, `Kalender Akademik`, `Tugas Saya`, `File Materi`, `Knowledge Hub`, `Pengajuan Saya`; bagian akun berisi `Notifikasi` dan `Pengaturan`.
- Jangan menggandakan desktop sidebar apa adanya di mobile; perhatikan safe-area inset dan ruang untuk scroll konten.

### 10B.3 Admin layout

- Rute admin terpisah secara navigasi dengan penanda jelas `Admin Workspace` dan tindakan `Kembali ke aplikasi mahasiswa`.
- Sidebar admin: `Ringkasan`, `Pengajuan Agenda`, `Kelola Agenda`, `Data Akademik`, `Mahasiswa & Whitelist`, `Impor Data`, `Materi`, `Knowledge Hub`, `WhatsApp Gateway`, `Grup Tujuan`, `Antrean & Riwayat Reminder`, `Audit` (bisa dikelompokkan dalam section).
- Mobile admin memakai drawer dan tabel responsif atau stacked data cards, bukan bottom nav student yang membuat fungsi admin tersembunyi.
- Semua navigasi ditampilkan sesuai role; rute tetap terlindungi server-side.

### 10B.4 Standar route (boleh folder struktural berbeda asalkan semua view setara)

- Public: `/`, `/login`, `/privacy`.
- Student: `/app`, `/app/calendar`, `/app/agendas`, `/app/agendas/[id]`, `/app/agendas/new`, `/app/submissions`, `/app/tasks`, `/app/materials`, `/app/materials/[id]`, `/app/knowledge`, `/app/knowledge/[slug]`, `/app/notifications`, `/app/account`.
- Admin: `/admin`, `/admin/submissions`, `/admin/agendas`, `/admin/academics`, `/admin/students`, `/admin/imports`, `/admin/materials`, `/admin/knowledge`, `/admin/whatsapp`, `/admin/whatsapp/groups`, `/admin/reminders`, `/admin/audit`.
- Error screens: `404`, `403`, `auth/invalid-account`, `offline/error` atau state relevan. Jangan membuat placeholder route; buat view fungsional untuk route yang benar-benar diimplementasikan di tahap aktif.

## 10C. PAGE-BY-PAGE UI SPECIFICATION (WAJIB DIIKUTI)

Komposisi di bawah menjadi baseline wireframe yang boleh diadaptasi untuk mobile, **tidak boleh diganti desain generik dashboard SaaS**.

### PUBLIC / AUTH

**P01 — Landing Page `/` (EXPRESSIVE / PRIORITAS BRANDING)**
- Susunan: header + hero dua kolom desktop / stacked mobile → strip tagline ringan → tiga sampai lima feature cards → cara kerja 3 langkah → identitas/cerita singkat angkatan → CTA masuk → footer.
- Hero kiri: small eyebrow/capsule, heading 2–3 baris tebal (contoh "Academic life, made better!"), deskripsi 1–2 kalimat, CTA `Masuk ke Novarion`; kanan: ilustrasi **kalender akademik sebagai objek visual** plus satu-dua floating stickers deadline/file, bukan screenshot palsu produk siap pakai.
- Warna: hero `#C9FBD4` atau perpaduan mint-cream; satu aksen orange; bentuk geometrik playful; kontras tinggi. Hindari dekorasi yang menimpa copy.
- Kartu fitur mengutamakan `Kalender`, `Materi`, `Reminder WhatsApp`, `Knowledge Hub`, `Tugas Saya`; tautan membawa pengguna login untuk fitur privat.
- Jika WhatsApp gateway belum aktif, copy marketing tidak boleh mengatakan pesan sudah otomatis terkirim; gunakan "Dirancang untuk reminder grup" atau status akurat.

**P02 — Login `/login` (MINIMAL + BRAND ACCENT)**
- Dua kolom ilustrasi singkat + login panel pada desktop; satu kolom pada mobile. Card `Masuk dengan Google`, informasi bahwa akses terbatas untuk anggota whitelist, bantuan admin jika email belum terdaftar.
- States: loading OAuth, unauthorized/whitelist gagal, email berbeda dari data akademik, error provider. Jangan memunculkan klaim identitas akun secara publik.

**P03 — Tidak berhak akses `/auth/invalid-account` / `/403`**
- Tampilkan penjelasan singkat `Akun ini belum terdaftar sebagai anggota angkatan`, opsi keluar/ganti Google account, serta kanal bantuan resmi bila dikonfigurasi. Tidak tampilkan isi whitelist.

**P04 — Privasi `/privacy`**
- Layout artikel bersih: jenis data, tujuan, akses, notifikasi grup, penyimpanan file, risiko konektor tidak resmi (dengan bahasa mudah dipahami), kontak pengelola yang disediakan. Jangan buat klaim legal atau jaminan absolut yang belum dibuktikan.

### STUDENT WORKSPACE (CLEAN)

**S01 — Dashboard `/app`**
- Susunan desktop: sapaan singkat + informasi semester → hero kecil/mint **tidak lebih dari satu card** → ringkasan `Deadline pekan ini`, `Agenda mendatang`, `Tugas selesai` → 2 kolom kalender mini dan deadline terdekat → baris materi terbaru / pengajuan pending.
- Mobile: sapaan → deadline hari ini/terdekat → quick action → daftar 3–5 agenda → mini kalender / materi; tidak perlu menampilkan semua statistik sekaligus.
- CTA penting: `Lihat Kalender`, `Tambah Tugas`, `Ajukan Agenda`. Data selalu dari backend; tidak buat angka dummy produksi.

**S02 — Kalender Akademik `/app/calendar`**
- Toolbar `Hari ini` + navigasi tanggal + switch `Bulan/Minggu/Daftar` + filter kategori, semester, mata kuliah, kelas (hanya opsi yang berhak diakses).
- Desktop: grid bulan dengan chips event pendek dan overflow `+N lainnya`, panel samping/detail drawer saat event dipilih; mobile: agenda list yang terhubung ke date picker/minggu ringkas agar tidak terjepit.
- Agenda resmi vs pribadi dapat dibedakan dengan label/ikon/border dan legenda; jangan hanya warna. Deadline yang mendesak mendapat highlight orange terbatas. Semua waktu menampilkan WIB.

**S03 — Daftar Agenda `/app/agendas`**
- Search, filter `Mendatang/Selesai/Arsip` (sesuai model agenda), kategori, matkul, kelas; agenda card/list dengan judul, scope, deadline, status, sumber; sort deadline terdekat. Empty state mendorong melihat kalender/ajukan agenda.

**S04 — Detail Agenda `/app/agendas/[id]`**
- Judul, kategori, status publikasi untuk pengusul/admin, scope penerima, matkul/kelas, tanggal dan deadline WIB, lokasi/link, sumber resmi, deskripsi, histori revisi singkat bila berhak. Jika tugas bersama, kontrol `Tandai Selesai` yang hanya mengubah status per-user.
- Tombol aksi tergantung role/status, tidak menampilkan fitur edit global pada student lain. Pembatalan tampil jelas dan reminder tidak lagi digambarkan aktif.

**S05 — Ajukan Agenda `/app/agendas/new`**
- Form bertahap ringan (atau single-column terstruktur): `Informasi` → `Waktu & cakupan` → `Tinjau & kirim`. Input kategori, matkul, target kelas/kelompok, deadline/tanggal dan jam, deskripsi, sumber, tautan. Beri ringkasan target penerima dan preview waktu WIB.
- Validasi inline, indikator bahwa pengajuan **belum terpublikasi**; setelah submit tampilkan nomor/status `pending` dan link `Pengajuan Saya`.

**S06 — Pengajuan Saya `/app/submissions`**
- Daftar/tab `Menunggu`, `Disetujui`, `Ditolak`, `Revisi`; tampilkan alasan keputusan, tanggal, tautan ke agenda, dan opsi mengajukan revisi bila diizinkan. Jangan campur dengan task pribadi.

**S07 — Tugas Saya `/app/tasks`**
- Ringkasan progress tugas `selesai/total`, filter `Belum selesai/Selesai`, daftar tugas pribadi dan task bersama yang relevan dengan badge pembeda; quick add tugas pribadi, checkbox per-item, opsi ubah/hapus hanya tugas sendiri.
- Aksi `Selesai` untuk task bersama **tidak memengaruhi reminder WhatsApp grup**. Desain maksimal fokus pada penyelesaian tugas, bukan dekorasi.

**S08 — File Materi `/app/materials`**
- Search paling atas, filter matkul/semester/tipe file, optional toggle `Grid/List`; card folder per mata kuliah atau pengelompokan subjek, dengan judul, tipe PDF/PPT/LINK, sumber, tanggal update.
- Tampilan mobile satu kolom dan quick filter horizontal yang dapat di-scroll. Jangan menduga materi bisa diakses publik; cek permission server sebelum membuat URL.

**S09 — Detail Materi `/app/materials/[id]`**
- Breadcrumb mata kuliah, judul, sumber, update, deskripsi, badge file/tautan, tombol `Buka` atau `Unduh` hanya jika otorisasi valid. Preview PDF opsional bila praktis dan aman; jangan menjadikan PDF viewer wajib untuk semua format.
- External link dibuka dengan peringatan bahwa izin akses mengikuti pemilik sumber; broken link state yang jelas.

**S10 — Knowledge Hub `/app/knowledge`**
- Header/intro singkat + search menonjol, kategori `FAQ`, `Panduan`, `Tautan Penting`, `Pengumuman Referensi` + daftar artikel/accordion. Layout boleh lebih editorial daripada File Materi, tetapi tetap ringkas dan mudah dipindai.
- Pencarian dan filter harus benar-benar mencari data yang terpublikasi untuk user. Tidak ada chatbot input sebagai fitur MVP.

**S11 — Artikel / FAQ `/app/knowledge/[slug]`**
- Judul, kategori, sumber, waktu update, daftar isi bila panjang, konten rapi, link referensi. Jika referensi sudah tidak berlaku, tampilkan status `Diarsipkan` jika memang masih boleh diakses.

**S12 — Notifikasi `/app/notifications`**
- Daftar informasi dari aplikasi (pengajuan disetujui/ditolak, agenda berubah/dibatalkan, sistem relevan), timestamp, unread indicator, klik menuju konteks, mark read bila fitur diimplementasikan. **Jangan menampilkan delivery status grup sebagai notifikasi personal palsu.**

**S13 — Akun & Pengaturan `/app/account`**
- Profil read-only untuk NIM, email terverifikasi, kelas/matkul, dan informasi bantuan perubahan data melalui admin. Tombol logout jelas. Pengaturan MVP hanya yang benar-benar berfungsi; jangan tampilkan WhatsApp personal preference yang tidak dipakai dalam pengiriman grup.

### ADMIN WORKSPACE (OPERASIONAL)

**A01 — Dashboard Admin `/admin`**
- Baris status: `Pengajuan pending`, `Agenda mendatang`, `Pengiriman gagal`, `Status Baileys` → area actionable `Perlu ditinjau` dan `Masalah pengiriman terbaru` → tombol cepat impor/kelola data.
- Jika Baileys offline, tampilkan status nyata dengan timestamp terakhir, bukan status Connected semu. Tidak perlu hero dekoratif besar.

**A02 — Review Pengajuan `/admin/submissions`**
- Tabel/dense card dengan pengusul, mata kuliah, target penerima, deadline, waktu submit, status. Filter/sort; halaman detail atau panel review memperlihatkan perubahan dan sumber. Tombol `Setujui` dan `Tolak` dengan alasan penolakan wajib; confirmation pada tindakan yang berdampak luas.

**A03 — Kelola Agenda `/admin/agendas`**
- Daftar semua agenda menurut hak admin dengan filter status, kategori, kelas, matkul, semester; create direct publish, edit, cancel, lihat versi dan audit. Perubahan deadline/scope menampilkan pemberitahuan bahwa pekerjaan reminder akan disinkronkan.

**A04 — Struktur Akademik `/admin/academics`**
- Tab `Semester`, `Mata Kuliah`, `Kelas`, `Kelompok`, `Keanggotaan`; tabel/filter detail untuk CRUD terotorisasi; tampilkan jumlah anggota tanpa menebak. Relasi dan validasi harus mudah dicek sebelum mengaktifkan agenda untuk target tertentu.

**A05 — Mahasiswa & Whitelist `/admin/students`**
- Tabel mahasiswa dan email terverifikasi/terdaftar, NIM, kelas, status akun, filter dan pencarian. Aksi aman untuk koreksi identitas/keanggotaan, role melalui mekanisme tepercaya, dengan konfirmasi dan audit; jangan expose seluruh NIM/email ke student.

**A06 — Impor CSV `/admin/imports`**
- Stepper `Unduh template` → `Upload CSV` → `Preview & mapping kolom` → `Validasi & temuan duplikat` → `Konfirmasi impor` → `Laporan`. Tampilkan jumlah baris sukses/gagal, lokasi error per baris dan opsi download ringkasan kesalahan.
- Jangan diam-diam menimpa keanggotaan existing; preview jelas membedakan insert, update, skip, invalid.

**A07 — Kelola File Materi `/admin/materials`**
- CRUD materi + file upload atau URL eksternal, pilih semester/matkul/target, status draft/published/archived, batas file, preview publikasi, metadata sumber. Progress upload akurat; setelah upload gagal, jangan munculkan file seolah berhasil.

**A08 — Kelola Knowledge Hub `/admin/knowledge`**
- CRUD FAQ/panduan/tautan, editor sederhana, status publikasi, kategori/tag, sumber, preview sebagai mahasiswa. Konten draft/diarsipkan tidak bocor lewat student search.

**A09 — WhatsApp Gateway `/admin/whatsapp`**
- Header status + last connected/last attempt, tombol `Connect / Pair` saat diperlukan, QR **hanya saat sesi belum valid**, state `connected`, `connecting`, `disconnected`, `requires_repair`, `error`, dan panduan QR kedaluwarsa.
- Setelah sukses tampilkan `Terhubung` dan ringkasan koneksi, **bukan meminta scan QR tiap hari**. Sediakan `Pause All Messaging` sebagai aksi destruktif dengan konfirmasi; `Resume` terotorisasi. QR/JID/kredensial tidak pernah ada di student UI.

**A10 — Mapping Grup `/admin/whatsapp/groups`**
- Pilih dari grup aktual yang dapat diakses sesi Baileys; tampilkan nama grup (yang diperoleh dan diverifikasi), status izin, target academic scope, aktif/nonaktif, tombol `Kirim Pesan Tes` berkonfirmasi dan ber-rate-limit.
- Jika grup belum siap, tampilkan `Belum terpetakan` atau `Tidak dapat diakses`; larang penyimpanan route ambigu atau ke grup salah.

**A11 — Reminder Queue / Delivery Logs `/admin/reminders`**
- Ringkasan `Queued`, `Processing`, `Submitted`, `Failed`, `Unknown`, `Cancelled`; tabel dengan trigger H-7/H-3/H-1/T-3 jam, agenda, grup, jadwal WIB, percobaan, last error, provider ID bila tersedia.
- Fitur filter, detail percobaan, status terbaru; **bedakan submitted vs delivered** dan jelaskan outcome unknown. Hindari tombol retry buta untuk pesan yang mungkin telah terkirim; tampilkan aturan penanganan.

**A12 — Audit `/admin/audit`**
- Timeline/tabel tindakan admin penting: siapa, tindakan, entitas, timestamp, ringkasan perubahan; tampilkan seperlunya tanpa kredensial/session/QR. Hanya admin berhak.

### SYSTEM STATES / SHARED SCREENS

- **404:** pesan jelas, link kembali ke Beranda/Dashboard sesuai status login.
- **403:** jelaskan akses tidak diizinkan tanpa mengungkap konten privat.
- **Unauthorized/whitelist mismatch:** instruksi benar, tidak menampilkan daftar anggota.
- **Empty:** ilustrasi kecil sederhana + alasan + satu CTA nyata yang berizin.
- **Loading:** skeleton sesuai struktur (calendar/card/table), tidak menyebabkan layout shift parah.
- **Error:** pesan manusiawi + langkah pemulihan/refresh yang nyata, bukan toast "gagal" tanpa konteks.
- **Success/confirmation:** tampilkan hasil submit/approve/import/send test yang telah diakui backend, bukan optimisme sebelum selesai.

## 10D. COMPONENT CONTRACT, RESPONSIVENESS, DAN QUALITY GATES UI

### 10D.1 Komponen wajib dalam reusable UI library

1. `BrandLogo`, `PublicHeader`, `StudentSidebar`, `StudentBottomNav`, `AdminSidebar`, `PageHeader`, `Breadcrumb`.
2. `Button`, `IconButton`, `TextInput`, `Textarea`, `Select/Combobox`, `DateTimeInput` dengan zona WIB eksplisit, `Checkbox`, `Tabs`, `Dialog`, `Toast`, `Tooltip` bila perlu.
3. `StatCard`, `DeadlineBadge`, `AgendaCard`, `AgendaDetail`, `CalendarGrid`, `CalendarEventChip`, `FilterBar`, `EmptyState`, `ErrorState`, `Skeleton`.
4. `MaterialCard`, `KnowledgeCard`, `FileTypeBadge`, `StatusBadge`, `DataTable` dengan fallback stacked/mobile, `Pagination`.
5. `WhatsAppConnectionStatus`, `PairingQRPanel`, `GroupRouteTable`, `ReminderJobStatus`, `ImportStepper`, `CSVPreviewTable`.

**Komponen boleh digabung/diberi nama lain; tanggung jawab UX, aksesibilitas, dan konsistensi harus setara.** Jangan menambah dependency UI berbayar. Gunakan headless primitive open-source bila membantu, bukan membuat ulang dialog/combo box aksesibel secara tidak aman.

### 10D.2 Interaction dan visual constraints

- Semua tombol/CTA/tautan harus melakukan aksi yang benar-benar tersedia sesuai tahap, atau **tidak ditampilkan**. Jangan tambahkan dummy button, navigasi mati, fake statistics, atau progress palsu di produksi.
- Keyboard navigation, visible focus, label form yang terhubung, validasi berhubungan dengan field, `aria` relevan, dialog fokus yang benar; warna bukan satu-satunya indikator status.
- Tidak ada horizontal overflow di viewport lebar 360px (kecuali bagian tabel di dalam area scroll yang jelas). Test minimal di 360px, 390px, 768px, 1024px, 1440px.
- Kalender mobile tidak boleh dipaksa menjadi grid desktop yang tidak terbaca; gunakan list/ringkas saat perlu. Tabel admin panjang bisa menjadi stacked cards atau container horizontal scroll berlabel.
- Minimum tap target 44×44px bila feasible; navigasi bawah tidak menutupi tombol/daftar terakhir; dukung safe-area.
- Perubahan state bersifat optimistik **hanya jika aman**, dengan rollback pada gagal; jangan langsung menampilkan `WhatsApp sent` sebelum ada hasil provider.
- Teks antarmuka natural bahasa Indonesia, singkat, tidak terlalu gaul pada alur error/administrasi. Copy landing boleh lebih playful.
- Desain mobile pertama, lanjut tablet/desktop. UI production tidak menggunakan aset/logo palsu, gambar berlisensi tidak jelas, atau data siswa nyata untuk demo publik.

### 10D.3 Visual review/acceptance tiap fase

Sebelum menerapkan banyak halaman, bangun dan uji **tiga baseline view** yang mewakili karakter Hybrid:

1. **Public Landing** — ekspresif dengan empat warna resmi, hero, kartu fitur, identitas angkatan; tanpa mengklaim logo resmi telah tersedia.
2. **Student Dashboard** — minimalis: ringkasan deadline, mini kalender, tugas, materi; navigasi desktop dan mobile jelas.
3. **Admin Overview** — utilitarian: tabel/moderasi, status WhatsApp yang akurat, monitoring reminder.

Setelah baseline style disetujui dalam alur implementasi bertahap, turunkan komponen yang sama ke seluruh halaman. Untuk setiap layar yang diimplementasikan:

- Uji viewport mobile dan desktop, kontras status/button, keyboard focus, loading/error/empty/success.
- Buktikan bahwa CTA nyata dan backend/permission benar; screenshot boleh sebagai bukti visual jika lingkungan mendukung, bukan satu-satunya bukti fungsi.
- Tuliskan ringkas review kualitas visual, aksesibilitas, dan ketidaksesuaian terhadap spesifikasi.
- Pertahankan budget Rp0: Tailwind, icon open-source, SVG/CSS dekoratif ringan, tanpa aset/tema premium.

## 11. DATABASE DAN OTORISASI

Desain ERD relasional normal, indeks, foreign key, unique/check constraints, migration dan dokumentasi. Minimum domain:

- **Identitas:** `profiles`, `student_whitelist`.
- **Akademik:** `academic_terms`, `courses`, `course_offerings`, `class_sections`, `study_groups`, `enrollments`, `study_group_members`.
- **Agenda:** `agendas`, `agenda_targets`, `agenda_revisions`, `agenda_reviews`, `personal_tasks`, `shared_task_completions`.
- **Pengetahuan:** `knowledge_items`, `knowledge_assets`.
- **Messaging:** `whatsapp_connections`, `whatsapp_auth_state` (server-only, encrypted), `messaging_channels`, `channel_routes`.
- **Reminder:** `reminder_rules`, `reminder_jobs`, `reminder_delivery_attempts`.
- **Operasional:** `import_runs`, `audit_logs`, `app_notifications` jika diperlukan.

Nama/tabel boleh direvisi berdasarkan alasan normalisasi dan pola query, tetapi hubungan, indeks, keamanan, dan perilaku harus ekuivalen. Jangan memakai satu kolom polymorphic tanpa constraint yang membuat foreign key tidak bisa ditegakkan secara masuk akal. Jangan simpan kunci WhatsApp dalam tabel yang dapat dibaca client.

RLS wajib disusun untuk mencegah student membaca agenda pribadi orang lain, konten unpublished, daftar whitelist mentah, session keys, atau log admin. Jika Drizzle/backend memakai koneksi yang melewati RLS, lakukan cek actor dan scope pada **setiap** endpoint/server action. Semua perubahan penting di-audit.

## 12. BACKGROUND JOBS DAN KEANDALAN

- Scheduler mencari agenda yang telah dipublikasikan lalu menghasilkan pekerjaan reminder secara idempoten.
- Gunakan transaksi, indeks, unique keys, dan pola claim job aman terhadap worker paralel (`FOR UPDATE SKIP LOCKED` atau pendekatan setara).
- Sediakan recovery untuk job yang lease-nya kedaluwarsa, tanpa melakukan pengiriman ulang sembrono bila outcome ambigu.
- Cek ulang status agenda, revisi, scope, status grup, dan kill switch sesaat sebelum pengiriman.
- Saat server offline, log job yang terlewat. Jangan mengirim reminder yang sudah lewat atau sesudah deadline hanya karena bot baru online.
- Implementasikan monitoring koneksi, antrean tertunda, error berulang, penyimpanan session, serta UI peringatan admin.
- Bila worker gagal, website tetap bisa dipakai.

## 13. PRIVASI DAN KEAMANAN

- Semua rahasia pada `.env` server; `.env.example` berisi placeholder saja.
- Batasi ukuran upload, validasi MIME dan ekstensi secara aman, cegah path traversal, cek hak akses unduhan.
- Rate limit autentikasi sensitif, pengajuan agenda, upload, dan tombol test WhatsApp.
- Jangan log NIM/email/QR/session keys secara berlebihan.
- Persetujuan dan transparansi pengumuman bot di grup; kirim hanya ke grup dengan izin pengelola.
- Siapkan kebijakan dasar privasi, penghapusan akun, dan retensi log.
- Pembatalan akses seorang mahasiswa tidak boleh menghapus agenda resmi; dapat memisahkan/anonymize atribusi pribadi.
- Lakukan backup database terenkripsi terjadwal ke storage lokal yang diproteksi; dokumentasikan restore test. Backup bukan berarti Supabase Free menyediakan automated backups produksi.

## 14. TESTING MINIMUM (TIDAK BOLEH DILEWATI)

1. Email/NIM tanpa whitelist tidak bisa menggunakan aplikasi.
2. Student tidak bisa mengangkat diri jadi admin atau memanggil endpoint admin.
3. Student A tidak bisa membaca/menulis task pribadi student B.
4. Keanggotaan kelas/mata kuliah membatasi daftar agenda dan materi.
5. Impor CSV valid, mendeteksi duplikat, dan idempoten saat dijalankan ulang.
6. Agenda `pending/rejected` tidak dipublikasikan dan tidak memicu reminder grup.
7. Revisi pengajuan tidak mengubah versi resmi sebelum disetujui.
8. Reminder H-7/H-3/H-1 pukul 08.00 WIB dan T-3 jam presisi.
9. Job yang dibuat setelah waktu trigger tertentu melewati trigger itu tanpa mengirim catch-up massal.
10. Mengubah deadline, scope, atau membatalkan agenda menyinkronkan job.
11. Dua worker serentak tidak mengklaim job yang sama; state ambigu tidak otomatis di-retry buta.
12. Mapping grup tidak mengirim ke grup salah dan tidak menduplikasi pesan di JID sama.
13. Task pribadi atau status `done` tidak masuk pesan grup.
14. File privat tidak dapat diakses dengan URL tanpa hak yang sesuai.
15. Worker restart memulihkan session yang masih valid tanpa QR baru.
16. Sesi yang benar-benar revoked memunculkan `requires_repair`.
17. Kill switch menghentikan seluruh pengiriman.
18. Mock provider dapat menguji alur tanpa WhatsApp asli; uji staging ke grup kecil yang berizin membuktikan pengiriman nyata sebelum produksi.

Gunakan fake clock untuk pengujian deadline dan mock provider untuk pengujian job; jangan mengirim WhatsApp sungguhan dalam automated tests.

## 15. TAHAP IMPLEMENTASI DAN DELIVERABLE

**Tahap 0 — Audit, arsitektur & baseline UX:** karena repo mungkin kosong, verifikasi keadaan direktori. Tulis `docs/requirements.md`, `docs/architecture.md`, `docs/erd.md` (atau Mermaid ERD), `docs/permissions.md`, `docs/agenda-state-machine.md`, `docs/reminder-design.md`, `docs/whatsapp-risks.md`, dan roadmap konkret. Tambahkan `docs/design-system.md`, `docs/page-map.md`, dan representasi wireframe/layout untuk landing ekspresif, dashboard student minimalis, dan overview admin fungsional (gunakan sketsa tekstual/Mermaid jika tooling visual tidak tersedia).

**Tahap 1 — Foundation:** implementasikan tokens warna/typography, baseline UI reusable untuk public/student/admin, lalu buat Next.js, Tailwind, TypeScript strict, Drizzle, Supabase Auth, migration, seed admin aman, whitelist, Google OAuth integration, import CSV, struktur akademik, README, `.env.example`.

**Tahap 2 — Calendar:** form pengajuan, approval/rejection, kalender, scope akademik, revisi, pembatalan, personal task dan checklist.

**Tahap 3 — Materials & Knowledge Hub:** upload/link materi, FAQ, pencarian/filter, otorisasi, admin CRUD.

**Tahap 4 — Reminder Engine:** schema job, scheduler, format pesan, grouping H-7/H-3/H-1, T-3 jam, test concurrency, mock provider, dashboard monitoring.

**Tahap 5 — WhatsApp:** service Baileys terpisah, SQL-backed encrypted auth, pairing QR admin, daftar grup, mapping JID, test message, auto-reconnect, session recovery, Docker deployment, pengujian grup nyata berizin.

**Tahap 6 — Hardening & Launch:** security audit, E2E, visual regression/responsive/keyboard accessibility checks pada halaman MVP, load/smoke tests, backup/restore drill, UAT mahasiswa, deployment, dokumentasi operator.

**Mulai kajian Baileys dan risiko operasional sejak Tahap 0** agar blocker diketahui dini, meskipun implementasi gateway pada Tahap 5.

Pada akhir **setiap tahap**, laporkan (termasuk konsistensi implementasi design system untuk UI yang dikerjakan):
- Fitur dan file yang benar-benar dibuat.
- Migration/konfigurasi baru.
- Cara menjalankan dan menguji.
- Perintah test yang dijalankan beserta hasilnya.
- Pekerjaan tertunda, kekurangan, dan blocker.
- Tahap berikutnya.

## 16. DEFINITION OF DONE

MVP baru boleh dinyatakan **selesai** jika:
- Login + whitelist + role terbukti aman.
- Data mahasiswa/matkul/kelas/kelompok bisa diimpor.
- Kalender menampilkan agenda sesuai keanggotaan dan approval.
- Agenda pribadi serta checklist berfungsi.
- Materi dan Knowledge Hub berfungsi dengan akses yang benar.
- Landing page ekspresif, student workspace minimalis, dan admin workspace operasional konsisten dengan 4 warna resmi, responsive, dan accessible pada layar MVP.
- Reminder **H-7, H-3, H-1, T-3 jam** terjadwal akurat dan tidak spam.
- Bot dapat mengirim ke grup yang sudah ada dan sudah dipetakan, dengan izin, melalui hasil uji nyata.
- Session Baileys persisten melewati restart normal, QR ulang hanya untuk sesi yang hilang/invalid.
- Worker, logging, recovery, status error, dan kill switch bekerja.
- Security tests dan critical E2E tests lulus.
- Sistem berjalan dalam ketentuan biaya langganan Rp0 yang disepakati tanpa mengandalkan layanan trial berbayar.

Jika fitur web selesai namun integrasi WhatsApp belum terbukti, nyatakan **"Core Application Complete — WhatsApp Integration Pending/Blocked"**, bukan "MVP Complete". Jangan klaim reliable 24/7 bila server homelab belum siap/aktif terus-menerus.

## 17. TUGAS PERTAMA — MULAI SEKARANG

**JANGAN** membangun lima modul sekaligus. Kerjakan tugas pertama dengan urutan:

1. Audit isi repository/working directory. Jika kosong, nyatakan demikian tanpa mengarang kondisi proyek.
2. Tetapkan struktur monorepo atau project layout sederhana yang memisahkan Next.js app dan `apps/worker` Baileys; jelaskan pilihanmu.
3. Buat dokumentasi requirements, ERD, permission matrix, state machine agenda, reminder scheduling, **design system**, serta information architecture seluruh halaman sesuai bagian 10A–10D.
4. Buat pondasi Next.js + Tailwind + TypeScript strict + Drizzle + Supabase, `.env.example`, Docker Compose untuk worker (boleh stub executable tetapi tidak boleh mengaku WhatsApp sudah terhubung), README, **theme tokens dan app shells public/student/admin**. Boleh menggunakan desain data placeholder yang ditandai hanya di development.
5. Implementasikan **Tahap 1**: login Google + validasi whitelist + bootstrap admin + data akademik dasar + impor CSV, sejauh kredensial eksternal yang benar tersedia. Jika belum, buat adapter dan pengujian mock yang jujur.
6. Jalankan lint, typecheck, migration validation, dan unit/integration tests yang bisa dijalankan. Laporkan hasil faktual.
7. Berhenti setelah batas kerja tahap ini dan paparkan rencana Tahap 2 tanpa mengklaim tahap berikutnya sudah selesai.

**Utamakan keterbacaan, akurasi, permission, performa yang wajar untuk 100–300 mahasiswa, dan pengalaman pengguna yang nyata. Jangan melupakan prinsip Hybrid: public expressive, student clean, admin functional.**
