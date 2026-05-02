# PG Manager — Project Context

> Living reference for what this project is, how it's structured, and the design system it uses.
> Last refreshed: 2026-05-02

## 1. What this project is

**PG Manager** (also branded **TrustCircle** in UI/logo) is a single-page React web app that lets a **PG (Paying Guest accommodation) owner** manage their lodging business from one dashboard.

The product is targeted at the Indian PG market — currency is ₹ (INR), tenants are Indian names, addresses are Indian cities (Bangalore is the demo data anchor), phone numbers are +91, and rents are in the ₹7K–₹11K/month range.

A "PG owner" can:
- Manage one or more **PG facilities** (each with name, type — gents/ladies/coed, address, amenities)
- Manage **rooms** in each PG (number, floor, type — single/double/shared, rent, status — vacant/occupied/reserved/maintenance, amenities)
- Manage **tenants** (book a room, drawer-based add flow)
- Track **maintenance tickets** (categories: plumbing, electrical, furniture, cleaning, other; priorities: high/medium/low; statuses: open/in_progress/resolved/closed)
- Track **transactions** — rent payments + expenses (UPI / Bank Transfer / Cash)
- View **notifications**
- Edit **profile** and **settings**

Auth is currently **mocked** — login uses `setToken('mock-token')` and any credentials with `password.length >= 6` succeed. There is also a real-backend code path (`https://pg-maintenance.onrender.com`) but `USE_MOCK = true` in `src/lib/api.js` causes any 401/network failure to fall back to mock data, so the UI works offline against `src/lib/mockData.js`.

A separate `server/mock.js` (Node http server, port 3001, no Express) implements the same mock endpoints for local dev — Vite proxies `/api/*` to it.

## 2. Tech stack

| Layer | Choice |
|---|---|
| Build tool | **Vite 8** (`@vitejs/plugin-react`) |
| Framework | **React 19** |
| Language | Mixed — `.tsx` files but most are essentially JS-with-types-off (e.g. `App.tsx` uses no types). `tsconfig.json` exists. |
| Routing | `react-router-dom` v7 (`BrowserRouter`, `Routes`, `Route`) |
| Styling | **Tailwind CSS v4** via `@tailwindcss/vite` plugin (no `tailwind.config.js` — theme is defined in CSS via `@theme {}`) |
| UI primitives | **shadcn/ui** ("new-york" style, neutral base, CSS variables) on top of Radix UI |
| Animation | **framer-motion** v12 |
| Icons | **lucide-react** (project standard — no other icon set) |
| Forms | Native `<input>` + manual state (no react-hook-form) |
| Toasts | `sonner` + a custom `Toast.tsx` wrapper |
| Class merging | `clsx` + `tailwind-merge` exposed as `cn()` in `@/lib/utils` |
| Variants | `class-variance-authority` (cva) |
| Tests | `vitest` + `@testing-library/react` + `happy-dom` (setup at `src/test/setup.js`) |
| E2E | `@playwright/test` (configured but not heavily used) |

### Path aliases
- `@/` → `./src/`
- `@/components`, `@/components/ui`, `@/lib`, `@/lib/utils`, `@/hooks` (per `components.json`)

### Dev workflow
- `npm run dev` — Vite dev server. Proxies `/api` → `http://localhost:3001`.
- `node server/mock.js` — runs the mock backend (login: `pgowner@test.com` / `pgowner123`).
- `npm run build` / `npm run preview` / `npm run lint` / `npm test`

## 3. Repository layout

```
d:/PG/
├── public/                 favicon, login-hero.png, logo.png, icons.svg
├── server/mock.js          standalone Node http mock backend (port 3001)
├── src/
│   ├── main.tsx            React root; imports index.css; <StrictMode>
│   ├── App.tsx             BrowserRouter + ToastProvider + CommandPalette + AnimatePresence routes
│   ├── index.css           Tailwind v4 entry + @theme tokens + base styles
│   ├── assets/             static imports
│   ├── styles/             (legacy/extra)
│   ├── context/            (empty)
│   ├── hooks/
│   │   └── use-mobile.ts
│   ├── lib/
│   │   ├── api.js          fetch wrapper with mock-data fallback (USE_MOCK = true)
│   │   ├── animations.js   framer-motion variants (page, stagger, drawer, modal, toast, sidebar...)
│   │   ├── mockData.js     MOCK_USER, MOCK_PGS, MOCK_TENANTS, MOCK_NOTICES, MOCK_TICKETS, MOCK_ROOMS, MOCK_AMENITIES
│   │   └── utils.ts        cn() helper (clsx + tailwind-merge)
│   ├── components/
│   │   ├── MainLayout.tsx       sidebar + header shell, persists collapse state
│   │   ├── Sidebar.tsx          collapsible nav with sections (OVERVIEW / MANAGE / SETTINGS)
│   │   ├── Header.tsx           breadcrumbs, search-as-button (opens command palette), notif bell, user menu
│   │   ├── AddTenantDrawer.tsx
│   │   ├── BookRoomModal.tsx
│   │   ├── RoomDetailsModal.tsx
│   │   ├── NewTicketModal.tsx
│   │   ├── RecordPaymentModal.tsx
│   │   ├── AddExpenseModal.tsx
│   │   └── ui/                  reusable primitives (see §6)
│   └── pages/
│       ├── AuthPage.tsx        split panel login/signup with hero image
│       ├── Dashboard.tsx       stat cards + mini-metrics + recent tenants + tickets + activity + room status
│       ├── MyPGs.tsx           list of owned PGs
│       ├── AddPG.tsx / EditPG.tsx
│       ├── Tenants.tsx
│       ├── Rooms.tsx
│       ├── Maintenance.tsx     tickets
│       ├── Transactions.tsx
│       ├── Notifications.tsx
│       ├── Profile.tsx
│       ├── Settings.tsx
│       └── Inquiries.tsx       (legacy, route is commented out — kept for reference)
```

## 4. Routing map (`src/App.tsx`)

Public:
- `/auth` and `/` → `AuthPage` (no MainLayout)

App (wrapped in `<MainLayout>` → sidebar + content area):
- `/dashboard`, `/pgs`, `/pg/add`, `/pg/edit/:id`
- `/tenants`, `/rooms`, `/maintenance`, `/transactions`
- `/profile`, `/settings`, `/notifications`

Inquiries route is intentionally commented out — feature was removed but file kept.

Every route is wrapped in `<AnimatedPage>` + `<AnimatePresence mode="wait">` using `pageVariants` (fade + slide-up).

Global overlays mounted at the top: `<ToastProvider>` and `<CommandPalette>` (opens via Cmd/Ctrl+K and a custom `open-command-palette` window event).

## 5. Data layer

`src/lib/api.js` is the single API entry point. Notable behavior:

- `apiRequest(path, options)` — JSON fetch.
  - On `401` or any thrown error, returns `getMockFallback(path)` instead of throwing (because `USE_MOCK = true`). This means **the UI never sees backend errors during dev** — it silently falls back to fixtures from `mockData.js`.
- `apiFormRequest` — for `application/x-www-form-urlencoded` (used by `/auth/login`).
- `setToken / clearToken` — stores JWT in `localStorage` under `pg_manager_token`.
- `unwrapData(payload, fallback)` — normalizes `{ data: ... }` envelopes.

Endpoints used (mock + real share the same paths):
- `POST /api/v1/auth/login`, `POST /api/v1/auth/register`, `GET /api/v1/auth/me`
- `GET/POST /api/v1/pg-facilities/`, `GET /api/v1/pg-facilities/:id`
- `GET /api/v1/tenants/`
- `GET /api/v1/rooms/`
- `GET /api/v1/tickets/my`
- `GET /api/v1/notices/`
- `GET /api/v1/amenities/`

## 6. Reusable UI components (`src/components/ui/`)

shadcn-derived (lower-case files, Radix-based):
- `dialog.tsx`, `sheet.tsx`, `dropdown-menu.tsx`, `tooltip.tsx`, `avatar.tsx`, `input.tsx`, `label.tsx`, `separator.tsx`, `table.tsx`, `sidebar.tsx`

Project primitives (Pascal-case files):
- **Button** — cva variants: `default | destructive | outline | secondary | ghost | link | primary (alias) | danger (alias)`. Sizes: `default | sm | md | lg | icon`. Supports `asChild` (Slot) and a legacy `icon` prop.
- **Card** — `rounded-xl border border-border bg-card shadow-sm`. Subparts: CardHeader/Title/Description/Content/Footer.
- **Badge** — variants: `default | secondary | destructive | outline | success | warning | info | neutral`. Has a `dot` prop. `BADGE_MAP` exports semantic mappings (`Occupied → destructive`, `Vacant → success`, `Paid → success`, `Pending → warning`, etc.).
- **DataTable** — full-featured: search, sortable columns, client-side pagination (`Rows per page`), loading skeleton, empty state, row hover/click. **Note:** uses hardcoded hex colors (`#E5E7EB`, `#10B981`, `#F9FAFB`...) rather than design tokens — predates the token system.
- **Drawer** — right-side slide-in.
- **Loader** — spinner.
- **Skeleton** — shimmer placeholder.
- **Toast** — wraps `sonner` with `ToastProvider`.
- **EmptyState**, **ConfirmModal**, **Select**, **CommandPalette**.

## 7. Design system

The product is branded **TrustCircle** — a green/cream professional look.

### 7.1 Theme source of truth

All design tokens live in `src/index.css` inside a Tailwind v4 `@theme {}` block. There is **no `tailwind.config.js`** — Tailwind v4 reads the `@theme` directives directly. `components.json` declares "neutral" base color and `cssVariables: true`.

### 7.2 Color palette

**Brand green** (also exposed as `--color-mint-*` aliases for back-compat):
| Token | Hex |
|---|---|
| `brand-50` | `#EEFBF4` |
| `brand-100` | `#D5F5E3` |
| `brand-200` | `#A8E6C3` |
| `brand-300` | `#6FD19E` |
| `brand-400` | `#3DBF7E` |
| `brand-500` | `#1C6C41` ← **primary brand color** |
| `brand-600` | `#155331` |
| `brand-700` | `#104027` |
| `brand-800` | `#0C2E1C` |
| `brand-900` | `#071D12` |

**Semantic tokens** (light theme, hardcoded — there is no dark mode):
| Token | Value |
|---|---|
| `--color-background` | `#F8F5F0` (warm cream — main canvas) |
| `--color-foreground` | `#111827` |
| `--color-card` | `#FFFFFF` |
| `--color-popover` | `#FFFFFF` |
| `--color-primary` | `#1C6C41` (= brand-500) |
| `--color-primary-foreground` | `#FFFFFF` |
| `--color-secondary` | `#F3F4F6` |
| `--color-muted` | `#F3F4F6` |
| `--color-muted-foreground` | `#6B7280` |
| `--color-accent` | `#F3F4F6` |
| `--color-destructive` | `#EF4444` |
| `--color-border` | `#E5E7EB` |
| `--color-input` | `#E5E7EB` |
| `--color-ring` | `#1C6C41` |
| `--color-sidebar` | `#FFFFFF` |
| `--color-sidebar-accent` | `rgba(28,108,65,0.08)` (brand at 8%) |
| Chart colors | `#1C6C41 / #2E90FA / #F79009 / #B692F6 / #F472B6` |

**Pastel chip palette** used in pages for PG/category tags (NOT in `@theme`, hardcoded inline):
- Green: `bg-[#DCEEDF] text-[#1C6C41]` (default, "Sunrise PG", "rent")
- Amber: `bg-[#FCF1DC] text-[#B45309]` ("Cozy Living PG", "maintenance")
- Pink: `bg-[#FBE5F0] text-[#BE185D]`
- Purple: `bg-[#E8E1F5] text-[#6D28D9]` ("deposit")
- Coral: `bg-[#FBE5E0] text-[#A04D3A]` ("expense")

### 7.3 Typography
- **Sans / display:** `Manrope` (400, 500, 600, 700 — loaded from Google Fonts in `index.css`)
- **Mono:** `JetBrains Mono`
- Body: 14px default; common sizes: `text-[10.5px]` (eyebrow labels uppercase), `text-[11px]–[13px]` (meta), `text-sm` (14px body), `text-base–text-2xl` for stats. Tabular nums (`tabular-nums`) used for numbers.

### 7.4 Radius & elevation
- `--radius: 0.625rem` (10px). Variants: `--radius-sm | -md | -lg | -xl`.
- Cards: `rounded-xl` (12px) with `shadow-sm`.
- Most modals/drawers: `rounded-2xl` or `rounded-[10px]`.
- Inputs: `rounded-md` to `rounded-[10px]` (h-9 to h-[42px]).
- Header height: `--header-height: 60px` (actual header in code uses `h-[72px]` — slight inconsistency).

### 7.5 Layout
- **MainLayout** is full-height (`h-screen flex overflow-hidden bg-[#F8F5F0]`) with a fixed sidebar offsetting the content via `marginLeft`.
- Sidebar widths from `sidebarVariants`: `expanded: 240px` / `collapsed: 64px`. State persisted to `localStorage` key `pg_sidebar_collapsed`.
- Content max-width `1280px`, centered. Padding: `px-6 pt-6 pb-3` mobile / `px-10 pt-10 pb-3` desktop.
- Header: 72px tall white bar with breadcrumbs, search-button (Cmd+K), notif bell, user menu.

### 7.6 Sidebar nav structure
Three sections (uppercase 10.5px section labels, brand-green 3px left bar on the active item, badge pills with brand-green bg, collapsed mode shows tooltips and badge dots):
- **OVERVIEW** — Dashboard, Notifications
- **MANAGE** — My PGs, Tenants, Rooms, Maintenance, Transactions
- **SETTINGS** — Profile, Settings

Logo at top: `/logo.png` (TrustCircle wordmark, 24px tall).

### 7.7 Motion (`src/lib/animations.js`)
All page transitions, drawers, modals, toasts go through pre-defined framer-motion variants:
- `pageVariants` — opacity + 12px y, 220ms in / 160ms out, custom cubic-bezier `[0.25, 0.1, 0.25, 1]`
- `staggerContainer` — `staggerChildren: 0.06`
- `fadeUp`, `fadeIn`, `cardHover` (lifts card 2px on hover)
- `drawerVariants` — slide-from-right, spring `damping: 30 / stiffness: 300`
- `modalVariants` — fade + scale 0.95→1, 180ms
- `backdropVariants` — opacity 200ms
- `toastVariants` — slide-from-right spring
- `sidebarVariants` — width 240↔64
- `commandPaletteVariants` — fade + scale 0.96

### 7.8 Iconography
Always **lucide-react**. Common sizes: 14px (inline meta), 15–16px (buttons), 18–22px (nav). `[&_svg]:size-4` is the Button default.

### 7.9 Custom UI details
- **Custom scrollbars** (in `index.css`): 10px wide, brand-green thumb on cream track with 2px cream border for a "pill" effect; thin `scrollbar-width` on Firefox.
- **Focus ring**: `outline: 2px solid var(--color-ring)` with 2px offset on `:focus-visible`.
- **Avatar fallback**: gradient `from-[#1C6C41] to-[#3DBF7E]` circle with white initial — used in sidebar bottom + header.

### 7.10 Status & semantic conventions
- **Ticket priority** — high: red, medium: amber, low: brand-400 green.
- **Ticket category tones** — plumbing: blue, electrical: orange, furniture: purple, cleaning: brand green, other: muted.
- **Timeline dots** — ticket: red, tenant: brand-green, general: muted.
- **Status badges** — open: destructive, in_progress: warning, resolved/paid/responded: success, closed/new: neutral/info.
- Currency formatted as `₹X.XK` for thousands, full `₹X,XXX` for line items, with `tabular-nums`.

## 8. Important conventions / gotchas

- **File extensions are misleading**: most `.tsx` files don't actually use TypeScript types — they're effectively JS in TSX-named files. Do not add types unprompted.
- **Mock-first**: every fetch is wrapped to return mock data on failure. Don't add error UI for network errors during dev — the user expects it to "just work" against fixtures.
- **No global state library** — pages fetch their own data via `useEffect`. There is no Redux/Zustand/Context for app data. The empty `src/context/` folder exists but isn't used.
- **DataTable uses hardcoded hex colors**, not theme tokens. The rest of the app uses tokens (`bg-card`, `text-muted-foreground`, `text-primary`). When refactoring DataTable, prefer tokens; when matching its style elsewhere, you'll see hex values.
- **Brand color appears in two forms** in code: tokenized (`text-primary`, `bg-primary/15`) and hardcoded (`bg-[#1C6C41]`). Both are valid — the hex form is common in `Sidebar.tsx`, `Header.tsx`, `AuthPage.tsx`, and pastel-chip palettes.
- **Page transitions wrap every route** — avoid adding `<motion.div>` outermost in pages or you'll double-animate.
- **Cmd/Ctrl+K** opens the command palette via a global window event — preserve that contract if adding new search affordances.
- **Sidebar collapse state** persisted under `pg_sidebar_collapsed` (string `"true"/"false"`). Both `MainLayout` and `Sidebar` read this independently.
- **Currency, dates, names are India-localized**. Don't introduce $/USD or US-style date formatting.
- All dates in mock data are in **2026** (the project's "current" year per global instructions).

## 9. Things that are stubbed / partial

- Auth has no real backend wired up — it just sets a fake token and routes to `/dashboard`.
- Notification badge counts (`notifications: 3, inquiries: 5, maintenance: 2`) are hardcoded in `Sidebar.tsx`.
- Inquiries page exists but its route is commented out.
- Revenue/Due-this-week/Avg-rent on Dashboard are computed from `tenants.length × 8500` — there is no payments API.
- `server/mock.js` has only GET endpoints + login/register; POSTs other than auth/PG echo back the body without persistence.
