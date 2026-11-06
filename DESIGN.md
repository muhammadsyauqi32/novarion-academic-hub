# NOVARION — Product Design System & Redesign Contract

> **Status:** v1.0 · Implementation-ready baseline with explicitly provisional decisions  
> **Products:** `https://novarion.web.id` (public cohort landing page) and `https://hub.novarion.web.id` (student dashboard)  
> **Audience:** Students in one university program cohort; public visitors on the landing page  
> **Themes:** Light + dark  
> **Redesign scope:** Full frontend visual/UX rework is allowed; preserve working behavior, data and integrations until a separately approved migration  
> **Design agents:** Google Antigravity with `design-taste-frontend` + Anti Slop (`antislop`, `antislop-ui`, `antislop-human`, `antislop-layoutmobile`, `antislop-copywriting`)

## 0. Source of truth, assumptions and operating rules

### Verified from the project brief
- Novarion consists of **two related surfaces**: a public program-cohort website (`novarion.web.id`) and a student dashboard (`hub.novarion.web.id`).
- Primary community is **students**; both light and dark themes must be supported.
- A full frontend redesign is desired. Existing business logic and production functionality must not regress.
- No approved brand system, reference site, codebase inventory, screenshots, official logo, content model, or exact features have yet been supplied.

### Not verified / provisional (**P**)
All design tokens, proposed page sections, information architecture, font choices, colors, layout geometry, component inventory, and product capabilities marked **P** are **proposals**, not statements about the deployed websites. In particular, **do not invent** the cohort's year, statistics, members, courses, events, academic schedule, community slogans, student identities or photographs.

**Critical first action:** inspect BOTH local applications and capture screenshots before changing code. Compare live and local environments when permitted. Record existing tokens, dependencies, branding, features, routes, data sources and accessibility issues. Update this document's provisional sections with confirmed decisions, including design owner sign-off for major changes.

**Priority if instructions conflict:** safety and preserved function > observed product requirements > explicit user decisions > this DESIGN.md > Taste aesthetic suggestions. Apply Anti Slop as a quality filter, never as a replacement for product identity. Never let aesthetic references silently override usability or factual accuracy.

## 1. Product identity and experience principles

**Novarion is a shared home for a cohort, not an anonymous SaaS template.** The public site communicates who the community is and gives clear paths to verified public resources. The Hub is a practical, focused workspace for students.

**Experience attributes:** communal, credible, youthful without childishness, organized, warm, accessible, and calm. Distinctive details should emerge from the cohort's actual visual identity, language and content—not fake dashboards, inflated metrics, excessive gradients or meaningless badges.

### Non-negotiable principles
1. **People and purpose over decoration:** a visitor should understand the cohort and next action rapidly; Hub users should finish tasks without visual friction.
2. **One family, two personalities:** common identity (logo, semantic palette, typography and interaction language), but different information density and layout rules.
3. **Hierarchy from content:** purposeful headings, clear groupings, labels, and an evident primary action per view.
4. **Authenticity:** no fabricated student portraits, academic results, dates, testimonials, social proof or decorative fake product UI.
5. **Quiet polish:** meaningful transitions and high-quality details; default to no animation rather than gratuitous motion.
6. **Accessible by default:** contrast, keyboard, reduced motion, labels, error recovery, readable mobile layout.
7. **Maintainable:** shared tokens, composable components, design QA, and measurable acceptance criteria.

## 2. Surface-specific design direction

### A. `novarion.web.id` — Cohort landing page
**Design direction (P):** contemporary editorial community website. Open, energetic typography; clear introductory message; authentic photos/illustration only when rights and provenance are confirmed; crisp sections with intentional whitespace. Less dashboard UI, more narrative and belonging.

**Potential information architecture (P; validate content before creating sections):**
- Header: identity, minimal navigation, an obvious entrance to Hub (if intended for public display).
- Hero: cohort name, one factual concise statement, one primary action, one secondary action when helpful.
- Community/about: verified description of the cohort/program and its purpose.
- Activities or highlights: *only if real, current, and approved content exists*.
- Useful destinations: verified student resources and/or links, role-appropriate.
- Footer: official links, legal/credit info, contact route if verified.

**Avoid:** generic SaaS statistics, 3–6 near-identical feature cards per section, huge empty hero with abstract blobs, unverified membership counts, faux terminal screenshots, placeholder testimonials, decorative 3D with no community relevance.

**Geometry (P):** desktop content max-width `1200px`; side gutters `clamp(20px, 4vw, 64px)`; generous but content-dependent vertical spacing; sections are *not required* to occupy one screen if it harms readability. Header can be sticky only when it does not obscure anchor targets.

### B. `hub.novarion.web.id` — Student dashboard
**Design direction (P):** efficient student workspace; calm, systematic, information-forward. Shared Novarion identity but denser and more utilitarian than the landing page.

**Information architecture:** **DO NOT assume features**. Inventory implemented modules, top tasks and navigation before deciding sidebar/top-nav. Examples of possible patterns, *not authorized feature requests*: task lists, schedules, resources, announcements, profile/settings.

**Interaction priorities:**
- Locate the user's top tasks in the first viewport without decorative clutter.
- Clear active navigation, breadcrumbs when hierarchy warrants, and consistent page titles.
- Use tables for dense comparison, lists for feeds/tasks, cards only where distinct grouping improves comprehension.
- Filters, sorting, pagination, search and data states must be complete *where those controls already exist or are approved*.
- Critical actions provide feedback and error recovery; destructive actions require appropriate confirmation.
- Sensitive student data never appears on public pages or in shared screenshots.

**Geometry (P):** app main area max-width `1440px` where practical; desktop rail `240px` expanded, `64px` collapsed only if useful; mobile navigation must be explicitly designed, not simply a shrunken desktop sidebar. Do not impose these widths if existing app workflows need another arrangement.

### Cross-surface bridge
- Cohesive shared identity; public site may be expressive, Hub should be restrained.
- Hub link must go to the correct origin; authentication/authorization remain unchanged.
- Use the same shared color semantics, font family and interaction states when feasible.
- Do not merge two deployments or rewrite cross-origin auth/session settings as part of visual redesign.

## 3. Design tokens — initial system (**P**, verify before locking)

The following is a starting **proposal**, intentionally neutral with a restrained blue-teal accent. If the real Novarion brand has an established color/logo, prefer its accessible adaptation. Tokens should be implemented as CSS custom properties (or mapped 1:1 to the project's design token system). Do **not** hardcode these values across components.

### 3.1 Colors — semantic, accessible-first

| Token | Light | Dark | Usage |
|---|---|---|---|
| `--bg` | `#F8FAFC` | `#0B1118` | Application/page canvas |
| `--surface` | `#FFFFFF` | `#121C27` | Main panels and interactive surfaces |
| `--surface-subtle` | `#F0F4F7` | `#192633` | Secondary surface |
| `--text` | `#17212D` | `#EDF4F8` | Primary content |
| `--text-muted` | `#526273` | `#AABCCA` | Secondary information |
| `--border` | `#D9E2E8` | `#30414F` | Dividers and outlines |
| `--brand` | `#155E75` | `#67D3E4` | Accent in text, active controls, emphasis |
| `--brand-foreground` | `#FFFFFF` | `#09212C` | Text on brand-filled surfaces |
| `--focus` | `#167D9C` | `#83E2F0` | Focus indication |
| `--success` | `#176A48` | `#6EE7AD` | Success state; not color-only |
| `--warning` | `#8A5500` | `#F6CD72` | Caution state |
| `--danger` | `#B42336` | `#FF8C98` | Error/destructive state |

**Color guidance:** keep most surfaces neutral; brand color signifies identity and action. Never use warning/success/destructive colors as mere decoration. Test every real foreground/background pairing against WCAG thresholds, including hover, disabled, selected and data visualization. Do not assume this draft table passes every possible pairing. For filled action buttons on dark themes, always pair with the specified foreground token.

### 3.2 Type (P)
- Suggested primary family: `Inter`, with `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` fallback. Prefer existing licensed/locally provisioned font if more brand-appropriate.
- Suggested editorial accent for landing headings: **none initially**; introduce a second typeface only with explicit visual direction and tested multilingual glyph coverage.
- Body: `16px / 1.55` standard; dense Hub data can use `14px / 1.5` where legible.
- Type scale: `12, 14, 16, 18, 22, 28, 36, 48, 64` px; use `clamp()` for fluid display sizes on landing.
- Suggested weights: 400 regular, 500 medium, 600 semibold, 700 bold. Avoid mixed random font weights.
- Headings: concise, sentence case, controlled line length; responsive wrapping tested with long Indonesian text.
- Content text max line length `65–75ch` where appropriate; do not constrain dense tables or dashboards to editorial line widths.
- Use tabular numerals in dates, counters and numerical tables.

### 3.3 Spacing, radius, borders, shadows (P)
- Spacing base `4px`. Allowed scale: `4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64 / 80 / 96` px.
- Landing section padding: `clamp(56px, 8vw, 112px)` with actual content determining final dimensions.
- Hub layout gap: usually `16–24px`; control-to-label gap `4–8px`.
- Radius: `6px` small controls, `10px` input/button, `14px` panels; full-pill only for chips with appropriate meaning.
- Borders: `1px` semantic border, not every card by default.
- Shadows: none on routine Hub panels unless elevation conveys a layer; low-contrast elevation for popovers/dialogs only.
- Container geometry: consistent alignments across header, hero and major content; avoid arbitrarily alternating margins.

### 3.4 CSS token reference (P)

```css
:root {
  color-scheme: light;
  --bg: #F8FAFC;
  --surface: #FFFFFF;
  --surface-subtle: #F0F4F7;
  --text: #17212D;
  --text-muted: #526273;
  --border: #D9E2E8;
  --brand: #155E75;
  --brand-foreground: #FFFFFF;
  --focus: #167D9C;
  --success: #176A48;
  --warning: #8A5500;
  --danger: #B42336;
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
  --space-24: 96px;
}
[data-theme="dark"] {
  color-scheme: dark;
  --bg: #0B1118;
  --surface: #121C27;
  --surface-subtle: #192633;
  --text: #EDF4F8;
  --text-muted: #AABCCA;
  --border: #30414F;
  --brand: #67D3E4;
  --brand-foreground: #09212C;
  --focus: #83E2F0;
  --success: #6EE7AD;
  --warning: #F6CD72;
  --danger: #FF8C98;
}
```

**Implementation note:** if the existing stack uses Tailwind/shadcn/theme providers, map tokens into its native semantic layer rather than adding a competing theme system. `data-theme` is an illustrative selector, not a required migration. If both apps live in separate repositories, keep the canonical token values synchronized with a shared source or documented versioning.

## 4. Responsive contract

**Test widths:** `390`, `768`, `1024`, `1440` CSS pixels at minimum, plus `320`px stress test. These are QA test sizes, **not** automatic media-query breakpoints. Choose CSS breakpoints according to actual content failure, not device names.

| Context | Landing | Hub |
|---|---|---|
| Narrow/mobile | One dominant reading column; navigation opens a proper menu; real content visible without sideways scrolling | Content-first workspace, explicit mobile navigation, controls and data tables with intentional adaptations |
| Tablet | Adapt composition (not just scale); typography remains readable | Evaluate navigation compression and tables; preserve task completion |
| Desktop | Deliberate editorial composition and aligned sections | Efficient density, clear hierarchy, usable whitespace |

Rules:
- No unintentional horizontal viewport scroll, including at 320px. A legitimately wide data table may scroll **within its labeled container**.
- Touch targets at least `24 × 24` CSS px per WCAG 2.2 AA minimum (with exceptions), preferably `44 × 44` for primary touch interactions.
- Every form remains usable at 200% zoom and with browser text resizing; avoid fixed-height content containers that clip text.
- Respect safe areas for fixed mobile navigation; dialogs must fit viewport and support internal scroll.
- Audit long names, lengthy Indonesian copy, invalid user inputs and zero-data views.

## 5. Component contracts and interaction states

### Core shared components
- **Navigation:** visible active state; meaningful accessible names; keyboard reachable; menu closes predictably; no hidden destinations.
- **Buttons:** primary / secondary / quiet / destructive variants only when semantic purpose is distinct. Label actions clearly (`Masuk ke Hub`, `Simpan perubahan`, etc.), no generic `Click here`.
- **Inputs:** always paired with visible labels; helpful examples and validation; required indication; errors linked to fields; no placeholder-only labels.
- **Links:** differentiate by context, underline in editorial text when appropriate; external destination indicators only where they add value.
- **Alerts/toasts:** clear status and next step; avoid ephemeral only-channel feedback for serious errors; use polite live-region announcements where required.
- **Dialogs:** focus moves in and returns to initiator; Escape and explicit close provided unless action semantics require otherwise; destructive confirmations specify consequences.
- **Tabs/filters:** semantic roles and visible selected state; URL sync when needed for persistent navigation.
- **Cards:** containers for a *meaningful unit*, not a default for every text item. Limit nesting.
- **Icons:** convey recognisable action or meaning; use a consistent icon family, stroke and size; not random decorative sparkles.
- **Images:** verify ownership, licensing, attribution and accuracy. Provide informative alt text, decorative images use empty alt. Optimize responsibly.

### Mandatory states (where relevant)
Each interactive or data-bearing component must explicitly handle **default, hover, focus-visible, active/pressed, selected, disabled, loading, empty, error and success**. Not every state applies to every component; document exceptions.

- **Loading:** skeletons only when structurally helpful; avoid fake progress percentages; maintain page stability.
- **Empty:** explain why it is empty and one useful next step; no invented activity.
- **Error:** state what failed in plain Indonesian, how to retry, and whether work was retained.
- **Success:** confirm action succinctly; do not overwrite unsaved input unexpectedly.
- **Disabled:** explain why when user is likely to be confused.
- **Form submission:** prevent unintended duplicate submissions; preserve user inputs on recoverable failure.

### Hub-specific data patterns
- Numbers and dates follow Indonesian locale where applicable (`id-ID`), while data models and APIs keep existing formats.
- Tables need useful column headings, accessible sort feedback, empty state, overflow strategy and readable mobile treatment.
- Never use color alone to indicate status; pair text/icon.
- Avoid decorative analytics cards unless metrics are real, authorized and useful.
- Do not expose unauthorized student personal data or leak protected resources in previews.

## 6. Accessibility baseline — WCAG 2.2 AA target

- Text normal contrast ≥ `4.5:1`; large text ≥ `3:1`; meaningful UI component boundaries and indicators ≥ `3:1` where applicable.
- Keyboard-only operation across navigation, forms, overlays and all critical actions. Visible `:focus-visible` indicator.
- Use semantic headings (one logical `h1` per page), lists, buttons and links with correct accessible names.
- Respect `prefers-reduced-motion`; never require animation to understand a feature.
- Image alternatives appropriate to content; captions/transcripts for meaningful media where applicable.
- Error identification, accessible instructions and screen-reader announcements for dynamic updates.
- Skip link for navigation-heavy pages; logical focus and reading order.
- Test with automated a11y tools **and** manual keyboard flows; automated PASS alone is insufficient.

## 7. Motion and visual effects

- Motion communicates change of state, not status or “futurism.”
- Suggested durations (P): hover `120–180ms`, panel transitions `180–260ms`, dialogs `180–240ms`. Prefer `transform`/`opacity`; avoid layout thrashing.
- Disable nonessential motion for reduced-motion preferences.
- No parallax, shader, cursor tracking, scroll hijacking, WebGL or rotating effects by default. For public landing only, propose a measured effect if it supports real brand storytelling, has an accessible fallback and is explicitly approved.
- Hub must remain fast and stable under constrained networks and low-power devices.

## 8. Content, voice and imagery

**Primary language (P):** Bahasa Indonesia. Secondary language or bilingual UI only if actual audience/content requirements demand it.

**Tone:** collegial, clear, concise, human, inclusive; friendly without forced slang or hype. Use accurate academic/cohort terms as confirmed by maintainers.

**Do:** specific labels and factual messages, e.g. `Lihat informasi angkatan`, `Masuk ke Hub`, `Belum ada informasi yang ditampilkan` (when true).

**Do not:** `Next-generation student ecosystem`, vague “revolutionary platform”, fabricated metrics (`10.000+ pengguna`), fake testimonials, generic “empowering the future” copy, AI-stock student portraits presented as real people, or lorem ipsum in shipped screens.

**Photography/art (P):** favor authorized real cohort documentation and official program assets. Any curated stock or illustration must be clearly appropriate, licensed, credited as required, and not represented as factual documentation of Novarion.

## 9. Architecture and engineering constraints

- Perform a repo and dependency inventory before touching files. Follow existing framework conventions; do not switch React/Next/Vue/Tailwind/etc. merely for aesthetics.
- Create or adapt a canonical token layer and reusable shared primitives; avoid duplicate button/card/nav implementations per page.
- Preserve route semantics, APIs, backend, database schemas, session/auth, analytics, SEO metadata, redirects, environment variables and deployment configuration unless separately approved.
- Keep public and private content boundaries explicit between domains. No sample passwords, secrets or realistic student records in screenshots/source.
- Maintain crawlability, semantic page titles, and metadata on public pages; prevent accidental exposure/indexing of private Hub routes as appropriate.
- No dependency addition without rationale, bundle impact and maintenance consideration.
- Prefer progressive enhancement and resilient fallbacks; fonts/images must not block essential content.
- Maintain existing test suite; add regression coverage for changes to navigation and key user journeys.

## 10. Taste Skill × Anti Slop orchestration

### Roles
- **`design-taste-frontend` = Design author:** derive an intentional visual concept; typography, page compositions, authentic assets, controlled interactions, consistent systems. Its one-screen-per-section starter defaults are **not mandatory** for Novarion; adapt to actual content, especially Hub.
- **Anti Slop core + `antislop-ui` = Design critic / release filter:** reject unmotivated clichés, invented content, excessive decoration, low-quality composition. Use official Delivery Gate.
- **`antislop-copywriting` = Copy QA:** fact checks and rejects vague generated prose.
- **`antislop-human` = Usability/a11y QA:** readable contrast, focus, states, navigation.
- **`antislop-layoutmobile` = Responsive QA:** mobile and cross-breakpoint reflow.
- **`antislop-code` (optional) = Comment hygiene:** do not allow it to remove valuable explanations.

### Invocation protocol
1. **Anti Slop AFTER** on the **existing site**: inventory and audit; no edits. Rank issues by severity, frequency, confidence and effort.
2. **Taste Skill**: produce **two design-direction proposals** sharing one identity but with appropriate distinctions for landing vs Hub. Include type, palette, screen sketches and tradeoffs. Mark unsupported decisions provisional.
3. **Owner checkpoint:** approve direction and update this `DESIGN.md` with exact decisions. Do not begin mass refactor before sign-off.
4. **Implementation:** Taste guides redesign incrementally, while Anti Slop runs in **DURING** for proposed changes. If a filter flags a problem, resolve it without contradicting the signed-off direction unless an explicit accessibility/functional issue requires it.
5. **Review:** Anti Slop AFTER audit of the completed slice; run its Delivery Gate, browser QA and functional regressions.
6. **Iterate:** move to next slice only when the current slice's acceptance criteria are met.

**Conflict rule:** Treat Anti Slop findings as concrete review feedback and Taste recommendations as design options. Neither should invent features or override user constraints. If recommendations conflict, choose the option with better task usability and evidence, log the decision and ask for approval only when product identity/requirements change.

## 11. Redesign workflow (mandatory gates)

### Gate 0 — Protect existing product
- Create branch/backup and clean baseline commit before UI changes.
- Record deploy URLs/environments, routes, authenticated and unauthenticated flows, component inventory, screenshots and test results.
- Determine whether both surfaces are one repository/monorepo or separate repositories. Do not assume.
- Verify ownership of logos, existing assets and fonts.

### Gate 1 — Audit (no code edits)
Deliver `AUDIT.md` or equivalent with:
- URL/route, screenshot reference, observed issue, impact, category, severity (`P0` blocker / `P1` major / `P2` polish), recommendation and evidence.
- Explicit IA, content, auth and API inventory; flag unknowns.
- Baselines: responsiveness, keyboard navigation, contrast, load/performance, lint/build/tests.
- A prioritized sequence of pages/components; **do not fake test results**.

### Gate 2 — Design proposal (approval required)
- Present two coherent directions for both surfaces. Include token mapping and mobile treatment.
- Compare tradeoffs for student use, content reality, readability, build complexity.
- Update this `DESIGN.md`: replace approved provisional values and list unresolved items.
- Obtain user approval of the chosen direction before broad implementation.

### Gate 3 — Prototype slice
- First implement shared foundations (tokens, theme plumbing, typography, primitives) in the existing stack, then one representative public section and one high-traffic Hub page **that actually exists**.
- Preserve old behavior and feature parity; show before/after screenshots.
- Check mobile, keyboard, all common states and performance.

### Gate 4 — Incremental rollout
- Landing: header/navigation → hero → verified content sections → footer → responsive polish.
- Hub: navigation/shell → high-frequency screens → forms/tables → error/empty/loading states → preferences/settings as applicable.
- Migrate route-by-route or feature-flag when warranted; no big-bang rewrite by default.
- Cross-check shared tokens and interaction consistency across domains.

### Gate 5 — Release quality bar
All must be satisfied or documented as an explicit blocker:
- Existing critical journeys still pass (auth, navigation, authorized data access, saves, etc. **where present**).
- No severe contrast, keyboard, label, focus trap, overflow or responsive regressions.
- No fake content, undefined placeholders, broken images or invalid links.
- Theme toggling works in both themes; verified preference persistence and no flash of wrong theme **if supported by project requirements**.
- Build/lint/tests are run and results recorded. Performance benchmarked against baseline, with regressions investigated.
- Anti Slop Delivery Gate shows PASS or documented owner-approved exception for a subjective rule; accessibility and functional blockers cannot be waived by aesthetics alone.
- Real browser screenshots at `390`, `768`, `1024`, `1440`, with long-content and reduced-motion checks.

## 12. Definition of Done (per page)

- [ ] Primary user task and page audience documented.
- [ ] Uses shared tokens and approved design direction.
- [ ] Hierarchy and alignment verified against screenshots.
- [ ] All applicable states implemented (loading/empty/error/etc.).
- [ ] Accessible labels, focus, contrast, semantics and keyboard flow checked.
- [ ] Responsive at 320/390/768/1024/1440; no accidental overflow.
- [ ] Works with realistic/authorized content; long strings tested.
- [ ] Existing data/API/auth behavior preserved.
- [ ] Build, lint and applicable tests run; results reported honestly.
- [ ] Anti Slop Delivery Gate findings resolved or documented.
- [ ] Before/after comparison, touched files and residual issues recorded.

## 13. Decisions awaiting verification

| ID | Pending decision | Provisional default | How to verify |
|---|---|---|---|
| D-01 | Official Novarion brand colors/logo | Blue-teal + neutral tokens above | Inspect official assets, existing site and owner input |
| D-02 | Font licensing and brand typography | Inter/system | Inspect current fonts; compare 2 approved typographic options |
| D-03 | Landing sections & factual copy | Only verified content | Inventory current site and cohort materials |
| D-04 | Hub modules and user roles | Preserve existing IA/features | Route/data/auth inventory with user flows |
| D-05 | App technology and shared component strategy | Keep existing stack | Inspect both repositories and manifests |
| D-06 | Theme synchronization across domains | Independent preference unless existing SSO/shared preference | Inspect auth/storage/CSP and UX expectations |
| D-07 | Assets/photos and permissions | No fabricated imagery | Confirm licenses and cohort photo permissions |
| D-08 | Layout navigation (Hub) | Current proven pattern first | Observe primary tasks and navigation depth |
| D-09 | Mobile-first priorities | Core student tasks and CTA | Usage analytics or representative student testing |
| D-10 | Motion personality | Minimal by default | Design direction approval and reduced-motion QA |
| D-11 | Public/private SEO and metadata | Preserve existing access policies | Inspect deployment/robots/auth requirements |
| D-12 | Performance targets | No deterioration from measured baseline | Capture real-device/Lighthouse metrics |

**Do not silently convert provisional into approved.** Record decision, rationale, date and owner after verification.

## 14. Antigravity kickoff prompt

Copy this into a **new Antigravity agent conversation**, with the existing workspace opened and Taste + Anti Slop installed:

```text
Read DESIGN.md in full and treat it as the product design contract for BOTH Novarion surfaces: novarion.web.id (public cohort landing) and hub.novarion.web.id (student dashboard).

Use design-taste-frontend as the design author and Anti Slop (core/UI/human/layoutmobile/copywriting) as the quality filter. Start in Anti Slop AFTER mode for the existing sites.

PHASE 1 ONLY — NO CODE CHANGES:
1. Inventory the actual repository/repositories, framework, routes, assets, styles, authenticated user journeys, APIs, theme handling, and deployed/local behavior.
2. Inspect the real UI in a browser and capture baseline screenshots for representative desktop/mobile views of BOTH surfaces. If an origin or private route is inaccessible, say so and inspect the local project; do not guess.
3. Compare each page to DESIGN.md, explicitly distinguishing confirmed observations from provisional assumptions.
4. Produce prioritized AUDIT.md and two cohesive visual directions (public landing and Hub are related but not identical).
5. Propose concrete updates to DESIGN.md (approved tokens, typography, layout, references) and a safe incremental implementation plan.
6. STOP and wait for my approval before a major redesign or any code changes.

AFTER I APPROVE:
- Protect a baseline commit, implement shared foundations, redesign one representative route at a time, preserve all business logic and backend behavior.
- Use Taste during implementation and Anti Slop DURING as a release-quality filter.
- Verify real browser screenshots at 390/768/1024/1440, keyboard, dark/light, states, tests/build, and Anti Slop Delivery Gate.
- Give me before/after screenshots, actual test results and a concise list of changed files. Never claim tests you did not run.
```

---

**Maintainer reminder:** This document is deliberately concrete yet adaptable. It is a starting contract, not proof of the currently deployed Novarion visual identity. Refine it from observed product evidence before broad implementation.
