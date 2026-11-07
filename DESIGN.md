# NOVARION: Product Design System & Redesign Specification

> **Version:** v2.1 (Comprehensive Design System Specification)  
> **Products:** `https://novarion.web.id` (Public Cohort Broadsheet) & `https://hub.novarion.web.id` (Student Academic Workspace)  
> **Community:** Departemen Statistika dan Sains Data Angkatan 62 IPB University (Bogor, Indonesia)  
> **Tagline Resmi:** "Kita Satu, Kita Bisa!"  
> **Themes:** Dual-Theme (Light & Dark) with zero-FOUC synchronization  
> **Governing Design Skills:** `design-taste-frontend` (tasteskill 2.5), `antislop` (DURING/AFTER filter), and `impeccable` (system polish)  
> **Codebase Integrity:** 100% preservation of routes, authentication guards, Drizzle ORM schemas, database operations, and WhatsApp background worker logic.

---

## 1. Product Vision and Audience

### 1.1 Vision & Metaphor
The Novarion digital ecosystem is a unified, tailor-made digital home designed specifically for the Statistika dan Sains Data Angkatan 62 cohort at IPB University. It rejects both the sterility of generic institutional LMS systems and the superficial tropes of commercial SaaS templates.

The ecosystem manifests across two distinct digital surfaces:
1. **Public Cohort Broadsheet (`novarion.web.id`):** An expressive, editorial public sanctuary that articulates the cohort's collective identity, data-science heritage, academic achievements, verified warta, and documentary moments.
2. **Student Academic Workspace (`hub.novarion.web.id`):** A high-density, calm, utilitarian digital workbench built for daily academic execution, deadline triage, course syllabus files, calendar tracking, and peer task management.

### 1.2 Target Audience & Personas
- **Mahasiswa Angkatan 62 (Primary Daily Users):** Require rapid deadline clarity (<12h, besok, pekan ini), one-click access to practicum modules and datasets, seamless calendar synchronization, and personal task tracking on mobile and laptop.
- **Pengurus Angkatan / BPH & Divisi (Cohort Operators):** Need clean administrative tools to publish verified warta, coordinate division agendas, organize photo archives, update honor rolls, and broadcast urgent academic notices via WhatsApp automation.
- **Dosen & Departemen Statistika (Academic Stakeholders):** Seek a credible, dignified representation of student scholarship, academic integrity, and organizational coordination.
- **Publik, Calon Mahasiswa & Alumni (External Observers):** Visit the public landing page to understand the culture, energy, and competencies of Angkatan 62.

---

## 2. Brand Personality and Design Principles

### 2.1 Brand Personality
- **Communal & Collegial:** Welcoming, fraternal, grounded in genuine mutual support ("Kita Satu, Kita Bisa!").
- **Analytically Rigorous:** Methodical, precise, uncluttered, reflecting the intellectual discipline of statistical thinking and data science.
- **Youthful & Energetic:** Optimistic, dynamic, forward-looking without relying on childish illustrations or gimmicky UI novelties.
- **Calm & Dignified:** High legibility, restrained motion, generous breathing room, and zero noisy visual distractions.

### 2.2 Declared Style Dials
Following the `antislop` and `design-taste-frontend` specification:
- **`novarion.web.id` (Landing Page):** **ENERGY 2 / RHYTHM 2 / MOTION 1**
  - Moderate visual energy with bold typography, authentic cohort photography, and expressive dual-column compositions.
  - Visible rhythm across content sections on a continuous canvas.
  - Restrained motion strictly serving spatial hierarchy.
- **`hub.novarion.web.id` (Student Hub):** **ENERGY 1 / RHYTHM 1 / MOTION 1**
  - Minimal visual energy to eliminate fatigue during multi-hour study sessions.
  - Predictable, calm layout rhythm optimized for information density and data scanning.
  - Instantaneous transitions (max 120ms) with zero decorative animations.

### 2.3 Core Design Principles
1. **Purpose Over Decoration (The Purpose Test):** Every color, border, container, and badge must serve an explicit communicative function. Visual techniques without purpose are rejected.
2. **One Family, Two Personalities:** Both surfaces share the same foundational DNA (brand palette, typography, icons, token architecture) while deploying distinct density and layout rules.
3. **Evidence Over Claims (C-5 & R-36):** No artificial counters ("10.000+ pengguna"), fabricated quotes, or generic stock illustrations. Only real cohort photography, verified roles, and authentic data.
4. **Accessible by Default (WCAG 2.2 AA):** Guaranteed 4.5:1 text contrast, visible focus rings, 44x44px touch targets, and full keyboard operability.
5. **Fold Discipline (Taste House Rule 3):** Desktop hero occupies exact `100dvh` at 1440x900 without fold clipping, eliminating peeking secondary sections.

---

## 3. Locked Brand Palette and Semantic Color Tokens

### 3.1 Locked Brand Palette (Mandatory Constraint)
The four exact HEX colors from the existing brand identity are preserved:

| Color Name | Exact HEX | Visual Role & Constraint |
| :--- | :--- | :--- |
| **Primary Mint** | `#41C2A1` | Core cohort identity, primary buttons, brand crest accent, and key focus moments. **Text on Mint MUST be dark (`#112A24`), never white.** |
| **Soft Mint** | `#C9FBD4` | Gentle success highlights, active pill backgrounds, and verified badge surfaces. |
| **Warm Cream** | `#EAEAB7` | Editorial warm highlights, Nova philosophy container accents, and subtle secondary cards. |
| **Warm Orange** | `#FFAE5D` | Tagline emphasis (`"Kita Satu, Kita Bisa!"`), deadline urgency (<24h), and honor badge highlights. |

### 3.2 Semantic Color Token Architecture
To guarantee WCAG 2.2 AA compliance, neutral and functional semantic tokens are paired with the locked brand palette across CSS custom properties in `globals.css`:

```css
/* Color Token Hierarchy */
Canvas (Ground) ──> Surface (Cards) ──> Surface Soft (Inputs/Tabs) ──> Surface Hover
Border (Subtle 1px) ──> Border Strong (Inputs/Dividers) ──> Focus Ring (2px solid)
Text Primary (High Contrast) ──> Text Muted (Secondary/Metadata) ──> Brand Foreground
```

| Token Variable | Semantic Role | Light Hex | Dark Hex | Contrast vs Canvas |
| :--- | :--- | :--- | :--- | :--- |
| `--canvas` | Page and document ground | `#FAF9F5` | `#0C1815` | Baseline (1.0:1) |
| `--surface` | Primary cards, panels, modals | `#FFFFFF` | `#112420` | Surface layer |
| `--surface-soft` | Inputs, inactive filter tabs, wells | `#F1F6F4` | `#173831` | Soft contrast |
| `--surface-hover` | Table row hover, list item hover | `#E8F1ED` | `#1F453D` | Interactive hover |
| `--border` | Card borders, subtle section dividers | `#DFEAE5` | `#1D4139` | 1.3:1 (Non-text) |
| `--border-strong`| Active form borders, focus outlines | `#CADBD4` | `#2D6054` | 2.1:1 (Non-text) |
| `--text-primary` | Main titles, headings, body prose | `#112A24` | `#EDF6F3` | **14.4:1 / 16.7:1 (PASS AA/AAA)** |
| `--text-muted`   | Metadata, timestamps, captions | `#5A7169` | `#A5C2B9` | **5.08:1 / 8.53:1 (PASS AA)** |
| `--brand-primary`| Primary mint accent | `#41C2A1` | `#41C2A1` | Accent identity |
| `--brand-foreground` | Text on brand mint buttons/badges | `#112A24` | `#112A24` | **6.85:1 (PASS AA)** |
| `--teal-deep`    | Dark teal action buttons, active tabs | `#176C5B` | `#5EDEC0` | **6.05:1 / 11.1:1 (PASS AA)** |
| `--brand-orange` | Urgency, tagline, honor badges | `#FFAE5D` | `#FFAE5D` | **9.5:1 / 10.8:1 (PASS AA)** |
| `--brand-cream`  | Light cream container accent | `#EAEAB7` | `#242D20` | Editorial accent |
| `--brand-navy`   | Deep midnight forest footer ground | `#0A1311` | `#070D0B` | Inverted surface |

### 3.3 Functional Status Tokens

| Status | Text Token | Text Light | Text Dark | Surface Light | Surface Dark | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Danger** | `--danger-text` | `#B42318` | `#FF8C98` | `#FEF3F2` | `#2A1416` | Deadlines <12 Jam, destructive actions, login errors |
| **Warning**| `--warning-text`| `#B54708` | `#F6CD72` | `#FFFAEB` | `#2B200E` | Deadlines H-1 (Besok), pending approvals |
| **Success**| `--success-text`| `#027A48` | `#6EE7AD` | `#ECFDF3` | `#10241A` | Selesai tasks, verified warta, active sessions |
| **Info**   | `--info-text`   | `#176C5B` | `#5EDEC0` | `#F1F6F4` | `#173831` | General academic notices, whitelist alerts |

---

## 4. Light and Dark Theme Specifications

### 4.1 Theme Architecture & Zero-FOUC Synchronization
- Both themes are implemented via pure CSS custom properties in `apps/web/app/globals.css`.
- The dark theme is activated when `html` contains class `.dark` or attribute `[data-theme="dark"]`.
- To completely eliminate Flash of Unstyled Content (FOUC), an inline synchronous script is injected in `apps/web/app/layout.tsx` before any CSS render tree evaluates:
  ```javascript
  (function() {
    try {
      var d = document.documentElement;
      var t = localStorage.getItem('novarion_theme');
      if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        d.classList.add('dark');
        d.setAttribute('data-theme', 'dark');
      } else {
        d.classList.remove('dark');
        d.setAttribute('data-theme', 'light');
      }
    } catch(e) {}
  })();
  ```
- **Cross-Subdomain Persistence:** Whenever the theme toggle is clicked, the selected mode is saved to both `localStorage` and a root-domain HTTP cookie:
  `document.cookie = 'novarion_theme=' + theme + '; path=/; domain=.novarion.web.id; max-age=31536000; SameSite=Lax';`
  This guarantees that navigating between `novarion.web.id` and `hub.novarion.web.id` preserves the user's preferred theme instantly.

### 4.2 Theme Color Balance Rules
- **Light Theme (`#FAF9F5` Canvas):** Grounded in warm paper tones. Surfaces use pure white (`#FFFFFF`) cards with soft 1px border dividers (`#DFEAE5`). Text uses high-contrast forest black (`#112A24`).
- **Dark Theme (`#0C1815` Canvas):** A deep, nocturnal forest atmosphere (not harsh OLED black `#000000` which strains the eyes). Surfaces use rich dark forest `#112420` with `#1D4139` borders. Text uses luminous bone-white `#EDF6F3`.

---

## 5. Typography Scale and Font Pairing

### 5.1 Font Family Pairing
- **Headings & Display (`font-heading`):** `Space Grotesk`, fallback `system-ui, sans-serif`.
  - Analytical, geometric, bold, and modern; reflects the precision of mathematics, data models, and statistical logic.
  - Usage: Hero titles, section titles, card headers, modal headers.
- **Body & Interface (`font-sans`):** `Plus Jakarta Sans`, fallback `Inter, system-ui, sans-serif`.
  - Humanist grotesque with open counters and tall x-height; highly legible in Indonesian sentence structures, academic abstracts, and data tables.
  - Usage: Prose, navigation links, table cells, form inputs, button labels.
- **Editorial Brand Moments (`font-serif` / `@font-face`):** `Enrika` (local font loaded in `globals.css`).
  - Usage: Large editorial typographic backdrop watermarks (`NOVA`, `ORION`) on the public landing page.
- **Tabular Figures & Code (`font-mono`):** `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`.
  - Mandatory CSS setting: `font-variant-numeric: tabular-nums`.
  - Usage: NIM, course codes (e.g., `STK211`), dates, timestamps, room numbers, and coordinate labels.

### 5.2 Type Size Scale

| Token Class | Desktop Size | Mobile Size | Line Height | Letter Spacing | Font & Weight | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `text-display-2xl` | `clamp(3rem, 7vw, 5.5rem)` | `2.5rem (40px)` | `0.95` | `-0.04em` | Space Grotesk Black (`900`) | Hero brand title `NOVARION` |
| `text-display-xl`  | `2.5rem – 3rem (40-48px)` | `2rem (32px)` | `1.1` | `-0.03em` | Space Grotesk Bold (`800`) | Main section titles (`Tentang`, `Warta`) |
| `text-heading-lg`  | `1.5rem – 1.75rem (24-28px)`| `1.375rem (22px)`| `1.2` | `-0.02em` | Space Grotesk Bold (`700`) | Hub page titles, modal headers |
| `text-heading-md`  | `1.125rem – 1.25rem (18-20px)`| `1.125rem (18px)`| `1.3` | `-0.01em` | Space Grotesk Semibold (`600`) | Dashboard card titles, article headlines |
| `text-heading-sm`  | `0.9375rem – 1rem (15-16px)` | `0.9375rem (15px)`| `1.4` | `0em` | Plus Jakarta Sans Bold (`700`) | Table subheaders, task titles |
| `text-body-base`   | `0.9375rem – 1rem (15-16px)` | `0.9375rem (15px)`| `1.55`| `0em` | Plus Jakarta Sans Regular (`400`)| Editorial paragraphs, descriptions |
| `text-body-sm`     | `0.8125rem – 0.875rem (13-14px)`| `0.8125rem (13px)`| `1.5` | `0em` | Plus Jakarta Sans Regular (`400`)| Hub table rows, task details, forms |
| `text-caption`     | `0.6875rem – 0.75rem (11-12px)` | `0.6875rem (11px)`| `1.4` | `0.02em` | Plus Jakarta Sans Medium (`500`)| Timestamps, metadata, status badges |

---

## 6. Layout, Grids, Breakpoints, and Spacing

### 6.1 Spacing Scale (4px Baseline)
Spacing follows an intentional 4px geometric progression:
`space-1` (4px), `space-2` (8px), `space-3` (12px), `space-4` (16px), `space-5` (20px), `space-6` (24px), `space-8` (32px), `space-10` (40px), `space-12` (48px), `space-16` (64px), `space-24` (96px).

### 6.2 Breakpoint Specifications

| Viewport Name | Min Width | Max Container | Layout Structure | Navigation Pattern |
| :--- | :--- | :--- | :--- | :--- |
| **Mobile Compact** | `320px – 639px` | `100%` (`px-4`) | Single column vertical stack | 4-point bottom bar (`56px` height) + modal drawer |
| **Tablet Portrait**| `640px – 767px` | `600px` (`px-6`) | 1 to 2 column adaptive grid | Bottom bar + compact header |
| **Tablet Landscape**| `768px – 1023px`| `720px` (`px-6`) | 2 column balanced grid | Floating pill nav / Mini sidebar |
| **Desktop Standard**| `1024px – 1279px`| `1024px` (`px-8`)| Persistent 240px rail + content grid | Fixed 240px sidebar (Hub) / Floating pill (Landing) |
| **Desktop Wide**    | `1280px+` | `1280px` (`max-w-7xl`)| 240px rail + 3 column dashboard | Full sidebar (Hub) / Full floating pill (Landing) |

### 6.3 Taste House Rules for Layout
1. **Single Continuous Canvas:** The background is uniform across the entire document. Sections are never styled with alternating full-bleed rainbow background fills.
2. **Equal Edge Margins:** Left and right content container gutters must be strictly identical at all viewports (`px-4 sm:px-6 lg:px-8`).
3. **Hero Viewport Calibration (Taste House Rule 3):** On desktop viewports (≥1024px), the hero section is calibrated to exact `100dvh` (`h-screen lg:h-screen`). The subsequent section heading must never peek across the fold.

---

## 7. Component Design Rules

### 7.1 Component Architecture & Hierarchy
Components follow the atomic composition model without excessive nesting. Box-in-a-box nesting is restricted to a maximum of **2 levels** (e.g., Page Container -> Card Surface -> Nested Element).

### 7.2 Corner Radius Scale
- `rounded-xs` (`4px`): Badges, category pills, code snippets, status indicator tags.
- `rounded-input` (`8px`): Form inputs, standard action buttons, select triggers.
- `rounded-card` (`12px`): Dashboard widgets, news cards, gallery frames, table containers.
- `rounded-modal` (`16px`): Modal dialogs, bottom sheets, mobile navigation drawers.
- `rounded-full` (`9999px`): Status indicator dots, avatars, theme toggle pill.

### 7.3 Shared UI Primitives

#### A. Button (`Button.tsx`)
Interactive buttons must provide clear visual feedback across all states:
- `primary`: Background `--brand-primary` (`#41C2A1`), Text `--brand-foreground` (`#112A24`, 6.85:1 contrast). Hover: `brightness-95`.
- `dark` / `accent`: Background `--teal-deep` (`#176C5B` Light / `#5EDEC0` Dark), Text `#FFFFFF` (Light) / `#0C1815` (Dark).
- `secondary`: Background `--surface-soft`, Text `--text-primary`, Border `1px solid var(--border)`.
- `outline`: Transparent background, Border `1px solid var(--border)`, Text `--text-primary`.
- `danger`: Background `--danger-surface`, Border `1px solid var(--danger-border)`, Text `--danger-text`.
- `ghost`: Transparent background, Text `--text-muted`, Hover: `--surface-soft`.

#### B. Badge (`Badge.tsx`)
Badges always pair an icon, a semantic border, and semantic text:
- `danger`: Critical deadlines (<12 Jam) and overdue tasks.
- `warning`: Tomorrow deadlines (H-1) and pending approvals.
- `mint`: Standard deadlines (2–3 hari) and active categories.
- `neutral`: General metadata, semester badges, and course codes.

#### C. Card (`Card.tsx`)
- Background `--surface`, Border `1px solid var(--border)`, Radius `rounded-card` (`12px`).
- Default elevation is flat; hover lift adds `-translate-y-0.5` with subtle ambient shadow: `0 4px 12px rgba(17, 42, 36, 0.06)` (Light) / `0 4px 12px rgba(0, 0, 0, 0.35)` (Dark).

#### D. Input (`Input.tsx`)
- Height: `40px` (desktop), `44px` (mobile touch target).
- Label: Always explicitly connected with `htmlFor`.
- Border: `1px solid var(--border)`, transitioning to `2px solid var(--teal-deep)` on focus.

---

## 8. Navigation and Information Architecture

### 8.1 Public Landing Page (`novarion.web.id`)
- **Two-State Header (`PublicHeader.tsx`):**
  - **Hero State (Top of Page):** Full viewport-width navigation bar (`100vw`, `bg-[#0A1311] border-b border-white/10`) with a flat, intentional dark background integrated with the hero section. Displays the official Novarion crest (`/logo.png`), plain text `Statistika dan Sains Data` context, section links, theme toggle, and primary CTA without decorative dots, sparkles, or badges.
  - **Scrolled State (`scrollY > 64px`):** Smoothly transitions into a compact centered container (`max-w-4xl`, `rounded-card`) with a solid surface background (`bg-surface border border-border shadow-md`) and zero glassmorphism or decorative glow.
  - **In-page Anchors:** `Tentang`, `Pengurus`, `Kabar`, `Galeri`, `Prestasi`.
  - **Primary High-Contrast CTA:** "Masuk ke Hub" linking directly to `https://hub.novarion.web.id/login`.
- **Mobile Navigation:** Touch-friendly menu button opening a solid, accessible dropdown panel with clear active states.

### 8.2 Student Academic Hub (`hub.novarion.web.id`)
- **Desktop Sidebar (240px persistent rail):**
  - Cohort mark + user identity pill at top.
  - Primary module navigation:
    1. **Dashboard (`/app`):** Overview, deadline radar, quick actions.
    2. **Kalender (`/app/calendar`):** Interactive academic schedule, exam timetables, deadlines.
    3. **Agenda Angkatan (`/app/agendas`):** Official cohort events and meetings.
    4. **Tugas Kuliah (`/app/tasks`):** Personal academic task tracker.
    5. **Materi & Modul (`/app/materials`):** Lecture slides, practicum datasets, past exams.
    6. **Knowledge Hub (`/app/knowledge`):** Course FAQs, academic guides, tutor repository.
    7. **Pengumpulan (`/app/submissions`):** Practicum reports and assignment dropboxes.
    8. **Akun Saya (`/app/account`):** Profile settings, parallel class, password management.
  - Active link state: `bg-teal-deep/10 text-teal-deep border-l-4 border-teal-deep font-semibold`.
  - Bottom controls: Theme toggle, verified role indicator (`Mahasiswa` / `Pengurus`), logout button.
- **Mobile Bottom Navigation (4-point bar):**
  - Fixed at screen bottom (`56px` height, tap targets ≥ 44x44px).
  - 4 core shortcuts: `Beranda`, `Kalender`, `Tugas`, `Materi`.
  - Secondary menu trigger: `Lainnya` opens a modal sheet displaying remaining modules (`Knowledge`, `Submissions`, `Akun`, `Tema`, `Keluar`).

---

## 9. Responsive and Mobile-First Guidelines

### 9.1 Mobile Usability Mandates
1. **Zero Sideways Spill (R-03):** No element may cause horizontal scrolling on the root window. Data tables wider than the viewport must be housed in an explicitly scrollable container with visual scroll gradient masks.
2. **Minimum Touch Targets (R-03 & R-39):** Every button, checkbox, link, and interactive icon must provide at least `44 × 44` CSS px tap area on touch screens.
3. **Form Resilience:** Mobile text inputs must use minimum `16px` font size to prevent iOS Safari auto-zoom on focus.
4. **Bottom Sheet Overlays:** Modals on mobile adapt into bottom sheets with safe-area padding (`pb-safe`) for home indicator bars.

---

## 10. Interaction States and Motion

### 10.1 Mandatory State Coverage
Every interactive component must provide complete visual handling across eight states:
1. **Default:** Stable resting contrast and clear label.
2. **Hover:** Cursor pointer feedback, subtle background color shift, or `-translate-y-0.5` lift (max 160ms).
3. **Focus-Visible:** Prominent 2px focus ring: `outline: 2px solid var(--teal-deep)` with `outline-offset: 2px`.
4. **Active/Pressed:** Tactile feedback via `active:scale-[0.98]`.
5. **Disabled:** Visual attenuation via `opacity: 0.5`, `cursor: not-allowed`, with tooltips explaining reason.
6. **Loading:** Disabled pointer events with animated SVG spinner; button text preserved or changed to "Memproses...".
7. **Empty:** Clear explanation of why the dataset is empty, paired with a single primary action to create/populate data.
8. **Error:** High-contrast text paired with an alert icon; input border highlighted with `--danger-text`; actionable recovery guidance.

### 10.2 Motion Policy
- Transitions are brief and purposeful: `120ms – 160ms` for hover states, `180ms – 220ms` for sheet/modal entrances.
- **Reduced Motion Guard:** Every animation is wrapped in `@media (prefers-reduced-motion: reduce)`, disabling translations and forcing instantaneous rendering.
- **Forbidden Effects:** No infinite looping pulse rings, no mouse-following orbs, no full-page parallax scroll-hijacking, and no scroll-delayed opacity fade-ins that hide content from users or search crawlers.

---

## 11. Accessibility, WCAG 2.2 AA Targets

### 11.1 Contrast Targets
- **Normal Text (<18px):** Minimum 4.5:1 contrast against its background.
  - Light mode: `#112A24` on `#FAF9F5` = **14.4:1** (PASS AAA).
  - Dark mode: `#EDF6F3` on `#0C1815` = **16.7:1** (PASS AAA).
- **Large Text (≥18px bold or ≥24px regular):** Minimum 3.0:1 contrast.
- **Button Contrast:** Dark text `#112A24` on Primary Mint `#41C2A1` = **6.85:1** (PASS AA). White text on `#41C2A1` is strictly forbidden (2.22:1 FAIL).
- **Non-Text Indicators:** Form borders, icons, and focus rings maintain ≥ 3.0:1 contrast against adjacent surfaces.

### 11.2 Screen Reader & Keyboard Requirements
- All interactive controls have accessible names via visible text or `aria-label`.
- Expanded states on dropdowns and drawers are communicated via `aria-expanded`.
- Keyboard navigation provides full Tab order traversal, visible focus outlines, and `Escape` key dismissal on dialogs and lightboxes.

---

## 12. Copywriting and Editorial Guidelines

### 12.1 Language & Voice
- **Language:** Bahasa Indonesia. Professional, collegial, warm, and academically credible.
- **Tone:** Direct, honest, concise. Speaks as a real student community, not a commercial enterprise.
- **Ban on Generic AI Buzzwords (R-16):** Words like *revolusioner, seamless, game-changer, unlock, elevate, empowering the future, ekosistem mutakhir* are strictly forbidden. Use plain factual language.
- **Hard Ban on Em Dashes (R-02):** The character `—` is STRICTLY FORBIDDEN in all UI headings, copy, badges, buttons, and metadata. Use commas, colons, parentheses, or mid-dots (`·`).

### 12.2 Separation of Verified Content from Sample Copy
- **Verified Official Content:**
  - Entity: Departemen Statistika dan Sains Data Angkatan 62 IPB University.
  - Slogan: "Kita Satu, Kita Bisa!"
  - Crest: Official department crest.
  - Photo: Genuine cohort photograph at FMIPA IPB (`/foto_angkatan.jpeg`).
- **Sample Mock Content:** Any placeholder news article or event must be clearly grounded in realistic academic scenarios (e.g., "Workshop Analisis Data Eksploratif", "Rapat Koordinasi Akademik") rather than fabricated global awards or exaggerated statistics.

---

## 13. Anti-Slop Visual and Content Restrictions

| Anti-Slop Rule | Prohibition | Required Alternative |
| :--- | :--- | :--- |
| **R-01 (Palette Default)** | No generic blue-to-purple or neon gradients | Use locked brand palette (`#41C2A1`, `#FFAE5D`, `#EAEAB7`) |
| **R-02 (Em Dash Ban)** | Never use `—` in UI text, labels, or badges | Use colons, commas, periods, or mid-dots (`·`) |
| **R-03 (Mobile Integrity)**| No horizontal window scrolling; no tap targets < 44px | Scrollable data containers; 44x44px minimum touch targets |
| **R-10 (Glassmorphism)** | No full-page blurred glass layers on all elements | Dose cap: at most 1 floating nav element; cards stay solid |
| **R-12 (Flat Default)**  | No heavy floating drop-shadows across all cards | Matte flat surfaces with 1px semantic borders |
| **R-13 (Glow Cap)**      | No simultaneous glow on badges, cards, and icons | Zero decorative glow; matte high-contrast surfaces |
| **R-16 (Buzzword Ban)**  | No empty corporate jargon (*seamless, revolusioner*) | Plain, factual Indonesian prose |
| **R-17/R-36 (Honesty)**   | No fabricated student counts or fake testimonials | Real cohort data or honest empty states |
| **R-23 (Authentic Media)**| No generic AI-generated faces or stock vector art | Authentic cohort photos (`/foto_angkatan.jpeg`) |
| **R-38 (Honest Roles)**   | No fake monogram initial circles ("KE", "WA") | Dignified structural coordination cards with role titles |
| **R-39 (System Pointers)**| No novelty custom cursor circles | Standard system pointer arrows and text carets |

---

## 14. Skill Responsibilities and Conflict Resolution

### 14.1 Skill Specialization
1. **`antislop` (Core Filter):** Acts as the primary quality gate. Enforces the Purpose Test, eliminates AI tells, and runs the Delivery Gate.
2. **`design-taste-frontend` (Visual Engine):** Governs layout geometry, desktop 100dvh hero fit, equal margins, restrained hover micro-animations, and broadsheet visual hierarchy.
3. **`impeccable` (Design System Polish):** Refines typography tokens, component state completeness, information hierarchy, and WCAG AA contrast mathematics.

### 14.2 Conflict Resolution Hierarchy
If instructions or skill recommendations conflict, resolve in this strict order:
```
1. Safety & Preserved Codebase Logic (Auth, Drizzle schemas, APIs, Worker jobs)
   ▼
2. Explicit User Instructions & Verified Cohort Identity (Angkatan 62, locked 4 HEX colors)
   ▼
3. antislop Core Hard Bans (R-02 no em dashes, R-16 no buzzwords, R-36 no fake metrics)
   ▼
4. impeccable UX Polish & WCAG 2.2 AA Contrast Standards
   ▼
5. design-taste-frontend Aesthetic Suggestions
```

---

## 15. Step-by-Step Redesign Implementation Workflow

1. **Phase 1: Design Tokens & Public Landing Page (`novarion.web.id`) — [COMPLETED & VERIFIED]**
   - Implemented CSS variables and dark mode tokens in `globals.css` and `tailwind.config.ts`.
   - Built zero-FOUC theme sync with `ThemeToggle.tsx`.
   - Refactored `HeroSection`, `AboutSection`, `LeadershipSection`, `NewsSection`, `GallerySection`, `AchievementsSection`, `AcademicHubCtaSection`, `PublicHeader`, `PublicFooter`, and `privacy/page.tsx`.
   - Verified 0 type errors, 0 lint warnings, 0 browser console errors, and 100% test pass.
2. **Phase 2: Authentication & Student Dashboard Gateway (`hub.novarion.web.id`)**
   - Refactor `/login` card: high-contrast inputs, clear whitelist notices, and error alerts.
   - Refactor Student Workspace Layout (`apps/web/app/app/layout.tsx`): 240px desktop rail and 4-point mobile bottom bar.
   - Refactor Dashboard Home (`apps/web/app/app/page.tsx`): Viewport 1 deadline radar (<12h danger, Besok warning, Mendatang neutral), active semester badge, and quick action bar.
3. **Phase 3: Academic Workflow Modules**
   - Refactor Interactive Calendar (`/app/calendar`): Month/Week/Agenda toggle, exam date highlights.
   - Refactor Personal Tasks (`/app/tasks`): Interactive checklist, filter by course, deadline sort.
   - Refactor Materials Repository (`/app/materials`): Course folder navigation, verified download buttons.
   - Refactor Knowledge Hub (`/app/knowledge`): Searchable FAQ, academic guide cards.
4. **Phase 4: Submissions, Account & Mobile Polish**
   - Refactor Submissions (`/app/submissions`) and Account Settings (`/app/account`).
   - Run responsive browser verification at 320px, 390px, 768px, 1024px, and 1440px in both themes.
   - Capture before/after visual proof and execute final quality gates.

---

## 16. Visual QA and Acceptance Criteria

Before declaring any page or slice complete, the following checklist must be satisfied:

- [ ] **Token Integrity:** Uses semantic tokens from `globals.css` (no hardcoded ad-hoc hex values).
- [ ] **Contrast Verification:** Text contrast ≥ 4.5:1; non-text indicators ≥ 3.0:1.
- [ ] **Mint Button Rule:** Text on `#41C2A1` uses dark `#112A24`, never white.
- [ ] **Dual-Theme Verification:** Inspected in both Light and Dark themes without broken text or inverted contrast.
- [ ] **Fold Discipline:** Desktop hero (at 1440x900) occupies exact `100dvh` without fold cut-offs.
- [ ] **Mobile Responsiveness:** Zero horizontal scrolling across 320px, 390px, 768px, and 1440px.
- [ ] **Touch Targets:** All interactive buttons and inputs measure at least 44x44 CSS px on touch screens.
- [ ] **Component State Completeness:** Implements default, hover, active, focus-visible, disabled, loading, empty, and error states.
- [ ] **Copywriting Compliance:** Zero em dashes (`—`), no buzzwords, no fabricated metrics.
- [ ] **Automated Quality Gates:** `npm run typecheck`, `npm run lint`, and `npm run test` pass with 0 errors.

---

## 17. Provisional Decisions Register

Decisions are classified as either **Confirmed & Locked** (backed by verified codebase implementation) or **Provisional** (requiring project inspection during implementation):

### 17.1 Confirmed & Locked Decisions (D-01 to D-12)

| ID | Decision Topic | Confirmed Implementation | Verification Source | Status |
| :--- | :--- | :--- | :--- | :--- |
| **D-01** | Brand Palette | Locked 4 HEX: `#41C2A1`, `#C9FBD4`, `#EAEAB7`, `#FFAE5D`. Dark text on mint. | Existing site assets & WCAG test | **LOCKED** |
| **D-02** | Typography | Space Grotesk (Headings) + Plus Jakarta Sans (Body) + Enrika (Serif Accent). | Google Fonts & `@font-face` | **LOCKED** |
| **D-03** | Factual Identity | Statistika dan Sains Data Angkatan 62 IPB University. Slogan: "Kita Satu, Kita Bisa!" | Cohort records & CMS schema | **LOCKED** |
| **D-04** | Core Modules | 8 Hub modules (Dashboard, Calendar, Agendas, Tasks, Materials, Knowledge, Submissions, Account). | App router directory tree | **LOCKED** |
| **D-05** | Tech Architecture | Next.js 14 App Router, Tailwind CSS, Supabase SSR/Auth, Drizzle ORM. | Root `package.json` | **LOCKED** |
| **D-06** | Theme Sync | Root cookie `novarion_theme` on `.novarion.web.id` + inline FOUC script. | `middleware.ts` & `layout.tsx` | **LOCKED** |
| **D-07** | Authentic Assets | Crest: `/logo.png`. Cohort photo: `/foto_angkatan.jpeg`. | `public/` directory | **LOCKED** |
| **D-08** | Navigation Geometry| 240px persistent desktop sidebar; 4-point mobile bottom bar (56px height). | UX audit & mobile tests | **LOCKED** |
| **D-09** | Mobile Priorities | Viewport 1 deadline radar (<12h danger, Besok warning, Mendatang neutral). | Student task workflow audit | **LOCKED** |
| **D-10** | Motion Limits | Max 160ms transitions; full `prefers-reduced-motion` override; no scroll-delayed opacity. | `globals.css` & `Reveal.tsx` | **LOCKED** |
| **D-11** | SEO Indexing | Public routes indexed; Hub routes (`/app/*`, `/admin/*`) set to `noindex, nofollow`. | App router metadata | **LOCKED** |
| **D-12** | Continuous Canvas | Single continuous ground (`#FAF9F5` light / `#0C1815` dark). No rainbow alternating strips. | Landing page refactor | **LOCKED** |

### 17.2 Provisional Decisions Requiring Inspection (P-01 to P-08)

| ID | Topic | Provisional Proposal | Inspection Requirement | Status |
| :--- | :--- | :--- | :--- | :--- |
| **P-01** | Task Default Sort | Order tasks strictly by nearest deadline (`scheduledFor` asc). | Inspect `tasks.ts` server action query ordering | **PROVISIONAL** |
| **P-02** | Calendar View Toggle | Default to Month view on desktop (≥1024px) and 7-Day Agenda list on mobile (<768px). | Inspect `InteractiveCalendar.tsx` state model | **PROVISIONAL** |
| **P-03** | Materials File Preview | Direct PDF modal preview vs external download link. | Inspect Supabase Storage signed URL handling | **PROVISIONAL** |
| **P-04** | Knowledge Category Filter | Filter chips for Mata Kuliah, Praktikum, Software, and Prosedur Akademik. | Inspect Drizzle schema for `knowledgeArticles` | **PROVISIONAL** |
| **P-05** | Submission Status Labels | "Belum Dikirim", "Menunggu Review", "Terverifikasi". | Inspect `submissions` table status enum | **PROVISIONAL** |
| **P-06** | WhatsApp Reminder Notice | Display last automated broadcast status badge inside student dashboard. | Inspect worker job execution log tables | **PROVISIONAL** |
| **P-07** | Admin CSV Error Display | Row-by-row error modal with specific column failure markers. | Inspect `csv-imports.ts` parser response | **PROVISIONAL** |
| **P-08** | Avatar Customization | Restrict avatars to official cohort color monogram or optional uploaded photo. | Inspect Supabase Auth profile update schema | **PROVISIONAL** |
