# Design System & Creative Direction — Hybrid Theme

> **Status:** Final & Locked Baseline  
> **Source of Truth:** MASTER_PROMPT.md V3.2 (Section 10A & 10D)

---

## 1. Filosofi Arah Visual: HYBRID

Aplikasi menerapkan konsep desain **Hybrid**:
1. **Beranda Publik (`/`) — Ekspresif**: Berkarakter angkatan, hangat, modern, menggunakan bentuk geometrik halus dan aksen warna cerah untuk menyambut mahasiswa baru dan publik.
2. **Workspace Mahasiswa (`/app/*`) — Bersih & Produktif**: Kanvas terang (`#F8FBF9`), kartu bernuansa rapi, fokus pada kalender, daftar tenggat waktu, dan tugas tanpa distraksi visual berlebihan.
3. **Workspace Admin (`/admin/*`) — Fungsional & Utilitarian**: Layout berorientasi operasi data, tabel berdensitas tinggi, indikator status yang jelas, serta kontrol WhatsApp & reminder yang presisi.

---

## 2. Palet Warna Resmi & Semantic Tokens

### 2.1 Empat Warna Brand Utama (Terkunci)
| Token | Hex Resmi | Penerapan UX | Kontras Teks yang Diwajibkan |
|---|---|---|---|
| `--brand-primary` | `#41C2A1` | Tombol utama, aksen hero, badge prioritas | **Wajib teks gelap (`#203B34`)**. Dilarang teks putih kecil (rasio hanya ~2.22:1). |
| `--brand-mint-soft` | `#C9FBD4` | Surface latar kartu positif, hari kalender aktif | Teks gelap (`#203B34`). |
| `--brand-cream` | `#EAEAB7` | Kartu pengumuman/catatan akademik | Teks gelap (`#203B34`). |
| `--brand-orange` | `#FFAE5D` | Deadline mendesak (H-1 / T-3 Jam), badge warning | Teks gelap (`#203B34`). Bukan untuk status error sistem. |

### 2.2 Token Netral Pendamping & Semantik
```css
:root {
  /* Brand Tokens */
  --brand-primary: #41C2A1;
  --brand-mint-soft: #C9FBD4;
  --brand-cream: #EAEAB7;
  --brand-orange: #FFAE5D;

  /* Surface & Canvas */
  --canvas: #F8FBF9;
  --surface: #FFFFFF;
  --surface-soft: #F1F7F3;
  --border: #E2ECE8;

  /* Typography Colors */
  --text-primary: #203B34;
  --text-muted: #63756F;
  --teal-deep: #176C5B; /* Untuk button gelap, focus ring, link kontras tinggi (6.3:1) */

  /* Semantic Status Colors */
  --danger-surface: #FEF3F2;
  --danger-border: #FECDCA;
  --danger-text: #B42318;

  --warning-surface: #FFFAEB;
  --warning-border: #FEDF89;
  --warning-text: #B54708;

  --success-surface: #ECFDF3;
  --success-border: #A6F4C5;
  --success-text: #027A48;
}
```

---

## 3. Tipografi, Bentuk, & Komponen UI

- **Heading & Branding**: `Plus Jakarta Sans` (Google Fonts via `next/font`), sans-serif fallback (weight: 600, 700, 800).
- **Body & Controls**: `Inter` atau system-ui (weight: 400, 500, 600).
- **Radius**: Cards: `14px` (`rounded-xl`), Inputs/Buttons: `10px` (`rounded-lg`), Modals: `16px` (`rounded-2xl`).
- **Ikon**: `lucide-react` (garis konsisten 1.75px–2px, bukan emoji acak).
- **Aksesibilitas (WCAG AA)**: Target sentuh minimal 44×44px di mobile; indikator fokus jelas dengan `--teal-deep`; label form eksplisit terhubung `htmlFor`.
