# Anaphygon Portfolio — Development Skills & Convention Reference

> File ini adalah panduan teknis dan konvensi yang harus dipatuhi selama seluruh proses development.
> Setiap fitur baru, komponen, atau route harus mengikuti pola yang tertera di sini.
> "Langkah demi langkah" — tidak ada yang dibangun asal-asalan.

---

## Tech Stack

| Layer | Teknologi | Versi |
|---|---|---|
| Frontend Framework | React | 19.x |
| Fullstack Framework | TanStack Start | latest |
| Routing | TanStack Router (file-based) | latest |
| Server State | TanStack Query | latest |
| Styling | Tailwind CSS | v4 |
| Animation | Framer Motion | latest |
| Database | MySQL | 8.x |
| ORM | Drizzle ORM | latest |
| Auth | JWT (HTTP-only cookie) | — |
| Runtime | Node.js (Vinxi) | 20+ |
| Package Manager | npm / bun | — |
| Language | TypeScript (strict) | 5.x |

---

## Struktur Folder

```
anaphygon-portfolio/
├── src/
│   ├── routes/
│   │   ├── __root.tsx              # Root layout global
│   │   ├── index.tsx               # Entry point → redirect ke _public/index
│   │   ├── _public/                # Rute publik (no URL prefix)
│   │   │   └── index.tsx           # Landing page utama
│   │   ├── admin/                  # Rute admin (URL: /admin/*)
│   │   │   ├── route.tsx           # Admin layout + auth guard
│   │   │   ├── dashboard.tsx       # /admin/dashboard
│   │   │   ├── projects.tsx        # /admin/projects — CRUD
│   │   │   └── skills.tsx          # /admin/skills — CRUD Hard/Soft Skills
│   │   └── api/                    # Server API routes
│   │       ├── auth/
│   │       │   ├── login.ts        # POST /api/auth/login
│   │       │   ├── logout.ts       # POST /api/auth/logout
│   │       │   └── refresh.ts      # POST /api/auth/refresh
│   │       ├── projects/
│   │       │   ├── index.ts        # GET, POST /api/projects
│   │       │   └── $id.ts          # GET, PUT, DELETE /api/projects/:id
│   │       └── skills/
│   │           ├── index.ts        # GET, POST /api/skills
│   │           └── $id.ts          # GET, PUT, DELETE /api/skills/:id
│   │
│   ├── components/
│   │   ├── ui/                     # Komponen reusable murni (no business logic)
│   │   │   ├── MangaPanel.tsx      # Wrapper panel bergaya manga
│   │   │   ├── Button.tsx          # Button dengan varian manga
│   │   │   └── Input.tsx           # Form input styled
│   │   ├── animations/             # Komponen animasi Framer Motion
│   │   │   └── PopsicleSplit.tsx   # Animasi es krim patah (hero)
│   │   ├── layout/                 # Layout wrappers
│   │   │   ├── MangaGrid.tsx       # Asymmetrical manga grid container
│   │   │   └── Footer.tsx          # Contact footer panel
│   │   └── admin/                  # Komponen khusus dashboard admin
│   │       ├── Sidebar.tsx
│   │       └── DataTable.tsx
│   │
│   ├── lib/                        # Logika server-only (TIDAK boleh di-import di client)
│   │   ├── db.server.ts            # MySQL pool + Drizzle instance
│   │   ├── jwt.server.ts           # JWT generate/verify
│   │   └── auth.server.ts          # Server functions: loginFn, logoutFn, refreshTokenFn
│   │
│   ├── db/
│   │   ├── schema.ts               # Drizzle schema (single source of truth)
│   │   ├── migrations/             # Auto-generated oleh drizzle-kit
│   │   └── seed.ts                 # Data awal (admin user)
│   │
│   ├── hooks/                      # Custom React hooks (client-side)
│   │   └── useAuth.ts              # Hook untuk state autentikasi di client
│   │
│   ├── utils/                      # Helper functions murni (no side effects)
│   │   └── cn.ts                   # classnames/tailwind merge utility
│   │
│   └── styles/
│       └── app.css                 # Tailwind v4 entry + @theme variables
│
├── public/
│   ├── fonts/                      # Custom font files
│   ├── svg/                        # SVG statis (popsicle.svg, etc.)
│   └── images/projects/            # Screenshot/thumbnail proyek
│
├── app.config.ts                   # TanStack Start config
├── vite.config.ts                  # Vite + Tailwind + plugins
├── drizzle.config.ts               # Drizzle Kit config
├── tsconfig.json
├── .env                            # Secret (TIDAK di-commit)
├── .env.example                    # Template env
└── package.json
```

---

## Konvensi Kode

### Naming Convention

| Hal | Convention | Contoh |
|---|---|---|
| Komponen React | PascalCase | `MangaPanel.tsx` |
| File route | kebab-case / dollar prefix | `_public/index.tsx`, `$id.ts` |
| File server-only | suffix `.server.ts` | `db.server.ts` |
| Hooks | camelCase prefix `use` | `useAuth.ts` |
| Utils / helpers | camelCase | `cn.ts`, `formatDate.ts` |
| DB schema table | camelCase (Drizzle) | `hardSkills`, `projects` |
| CSS classes | Tailwind utility-first | no custom class kecuali `@layer components` |
| Variabel env | SCREAMING_SNAKE_CASE | `JWT_ACCESS_SECRET` |

### TypeScript Rules

- **Strict mode aktif** — tidak ada `any`, tidak ada `@ts-ignore` tanpa komentar jelas
- Selalu definisikan return type untuk server functions
- Gunakan `z` (Zod) untuk validasi input di API routes
- Export type/interface dari file schema sebagai single source of truth

### Import Alias

```typescript
// Gunakan alias ~ untuk src/
import { getDb } from '~/lib/db.server'
import { MangaPanel } from '~/components/ui/MangaPanel'
import type { Project } from '~/db/schema'
```

---

## Routing Convention (TanStack Start)

### Public Routes

```
src/routes/_public/index.tsx  →  URL: /
```

- `_public` = pathless layout (underscore prefix = tidak menambah URL segment)
- Semua section (Hero, About, Skills, Projects, Contact) ada di satu halaman (`index.tsx`)
- Gunakan scroll-based navigation bukan multi-page

### Admin Routes

```
src/routes/admin/route.tsx     →  Layout admin + auth guard
src/routes/admin/dashboard.tsx →  URL: /admin/dashboard
src/routes/admin/projects.tsx  →  URL: /admin/projects
src/routes/admin/skills.tsx    →  URL: /admin/skills
```

- Guard di `route.tsx` menggunakan `beforeLoad` + `redirect`
- Cek JWT dari HTTP-only cookie via server function
- Jangan taruh logika auth di client component

### API Routes

```
src/routes/api/projects/index.ts  →  GET /api/projects, POST /api/projects
src/routes/api/projects/$id.ts    →  GET, PUT, DELETE /api/projects/:id
```

---

## Database Schema (Drizzle + MySQL)

### Tabel

```typescript
// src/db/schema.ts

users          // Admin only: id, username, password_hash, created_at
projects       // id, title, description, tech_stack (JSON), image_url, repo_url, live_url, is_featured, order_index, created_at
hard_skills    // id, name, category (enum), proficiency (1-100), icon_url, order_index
soft_skills    // id, name, description, order_index
```

### Enum Values

```typescript
// hard_skills.category
type SkillCategory = 'Frontend' | 'Backend' | 'Mobile' | 'DevOps' | 'Database' | 'Other'
```

### Migration Workflow

```bash
# Generate migration setelah ubah schema
npx drizzle-kit generate

# Push ke database (dev)
npx drizzle-kit push

# Lihat studio
npx drizzle-kit studio
```

---

## Authentication Flow

```
Login → POST /api/auth/login
      → Server verifikasi credentials (bcrypt)
      → Generate access token (15m) + refresh token (7d)
      → Refresh token → HTTP-only cookie (Secure, SameSite=Strict)
      → Access token → response body (simpan di memory/state)

Request ke admin route → beforeLoad cek cookie via server function
      → Jika invalid → redirect('/')

Token refresh → POST /api/auth/refresh
             → Baca refresh token dari cookie
             → Return access token baru
```

---

## Design System

### Color Palette

```css
/* src/styles/app.css */
@theme {
  --color-manga-black: #111111;
  --color-manga-white: #FFFFFF;
  --color-manga-gray-light: #E5E5E5;
  --color-manga-gray-mid: #A3A3A3;
  --color-manga-gray-dark: #525252;
  --color-popsicle-blue: #BAE6FD;      /* Accent — gunakan sangat jarang */
  --color-popsicle-blue-deep: #7DD3FC;
}
```

### Manga Panel Component

```tsx
// Setiap section dibungkus MangaPanel
// Border: 2-4px solid #111111
// Gutter antar panel: gap-4 (16px) atau gap-6 (24px)
// Tidak ada rounded corner (manga = garis tegas)
```

### Responsive Strategy

| Breakpoint | Layout | Analogi |
|---|---|---|
| Mobile (< 768px) | flex-col, w-full panels | Webtoon / Manhwa scroll |
| Tablet (768-1024px) | 2-col grid, beberapa panel span 2 | Manga chapter transition |
| Desktop (> 1024px) | 12-col asymmetric grid, panels vary | Shonen Jump double page |

### Typography

```css
/* Heading (nama, section title) */
font-family: 'Inter', sans-serif; /* tajam, modern */
font-weight: 700-900;

/* Quote / filosofi */
font-family: 'Bangers' atau custom comic font; /* sparingly */

/* Body / deskripsi */
font-family: 'Inter', sans-serif;
font-weight: 400-500;
```

---

## Animasi — Popsicle Split

File: `src/components/animations/PopsicleSplit.tsx`

### Behavior

1. Website load → muncul full-screen loader dengan ilustrasi es krim batang ganda (SVG)
2. Setelah 1.5s atau user click/scroll → es krim "patah" ke dua sisi (left & right drift)
3. Transisi ke hero content dengan fade-in panel
4. Animasi dipisah total dari layout — `PopsicleSplit` adalah standalone component

### Framer Motion Pattern

```tsx
// Dua bagian (atas & bawah) punya motion.div terpisah
// Trigger: useEffect setelah mount + 1500ms delay, atau onScroll
// Exit: AnimatePresence wrapping loader
// Durasi: 0.8s ease-in-out
```

---

## State Management

- **Server state** (data dari DB): TanStack Query (`useQuery`, `useMutation`)
- **UI state** (modal, toggle): `useState` lokal — tidak perlu global store
- **Auth state**: custom `useAuth` hook yang wrap server function + in-memory token storage
- **Tidak menggunakan** Redux, Zustand, atau Jotai — scope proyek tidak memerlukan ini

---

## Environment Variables

```bash
# .env (jangan di-commit)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=anaphygon_portfolio

JWT_ACCESS_SECRET=          # min 32 chars random string
JWT_REFRESH_SECRET=         # min 32 chars random string, BERBEDA dari access

NODE_ENV=development
```

---

## Checklist Sebelum Development Tiap Fitur

- [ ] Apakah ada schema DB yang perlu diubah? → update `schema.ts` → generate migration
- [ ] Apakah ada API endpoint baru? → tambah di `src/routes/api/`
- [ ] Apakah endpoint butuh auth? → tambah middleware/guard
- [ ] Apakah ada komponen reusable? → taruh di `components/ui/`, bukan inline
- [ ] Apakah ada logic server-side? → file harus `.server.ts`
- [ ] Apakah responsive? → test mobile dulu, kemudian tablet, kemudian desktop
- [ ] Apakah TypeScript strict? → no `any`, no `@ts-ignore` tanpa reason

---

## Urutan Development (Roadmap)

### Phase 1 — Foundation
1. Init project TanStack Start + install semua dependencies
2. Setup Tailwind v4 + design tokens di `app.css`
3. Setup Drizzle ORM + koneksi MySQL + schema awal
4. Run migration + seed admin user
5. Buat `__root.tsx` dengan font dan global style

### Phase 2 — Public Portfolio
6. Buat `MangaPanel` component
7. Buat `MangaGrid` layout (responsive)
8. Buat `PopsicleSplit` animasi (hero loader)
9. Build Hero section
10. Build About panel
11. Build Hard Skills panel (grid proficiency)
12. Build Soft Skills panel
13. Build Projects grid (data dari DB via TanStack Query)
14. Build Contact/Footer panel
15. Scroll reveal animations (Framer Motion)

### Phase 3 — Admin Panel
16. Setup JWT auth (server functions)
17. Login page
18. Admin layout + route guard
19. Dashboard (stats ringkas)
20. CRUD Projects (form + table)
21. CRUD Hard Skills + Soft Skills

### Phase 4 — Polish & Deploy
22. SEO meta tags (TanStack Start `<Meta>`)
23. OG image
24. Performance audit
25. Deploy ke anaphygon.my.id

---

## Filosofi Development

> Seperti Jiraiya yang sabar mengajarkan Naruto satu teknik sebelum melanjutkan ke teknik berikutnya —
> selesaikan satu phase dengan bersih sebelum pindah ke phase berikutnya.
> Code yang bersih adalah tanda developer yang menghormati dirinya sendiri.

- **Satu hal dalam satu waktu** — jangan bangun admin panel sebelum public portfolio selesai
- **Tidak ada over-engineering** — mulai simple, kompleksitas hanya jika memang dibutuhkan
- **Modular** — setiap komponen bisa berdiri sendiri tanpa bergantung pada state global
- **Profesional** — inspirasinya anime, tapi hasilnya harus terlihat seperti agency portfolio kelas atas
