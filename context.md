# PG Manager — Project Context

> Living single-source-of-truth for this codebase. Optimized to be read by an LLM landing
> in the repo with zero prior knowledge: where things live, how they connect, and which
> file does what. Last refreshed: 2026-05-07.

---

## 1. What the project is

**PG Manager** (UI/logo brand: **TrustCircle**) is a single-page React web app that lets
the **owner** of an Indian Paying-Guest accommodation business manage their properties,
rooms, tenants, payments, expenses and maintenance tickets from one dashboard.

- **Currency**: ₹ (INR), formatted en-IN.
- **Auth**: JWT bearer tokens; backend issues at `/api/v1/auth/login`.
- **Two repos**:
  - **Frontend** (this repo): `github.com/Hardik0110/PG`.
  - **Backend**: `github.com/PandyaYog/pg-maintenance` → FastAPI on Render at
    `https://pg-maintenance.onrender.com` (free tier, sleeps on idle).

---

## 2. Tech stack

| Concern | Choice |
|---|---|
| Framework | React 19 + Vite 8, TypeScript (strict: false, allowJs: true) |
| Routing | react-router-dom 7 |
| Server state | **TanStack Query 5** (cache, dedupe, polling, invalidation) |
| Client state | **Zustand 5** (auth token, sidebar collapsed) |
| Styling | Tailwind v4 with `@theme` tokens (no `tailwind.config.js`); shadcn/ui new-york style under `components/ui/` |
| Animations | framer-motion 12 |
| Icons | lucide-react |
| Tests | Vitest 4 + @testing-library/react + happy-dom |
| Lint | ESLint flat config + typescript-eslint + react-hooks rules |
| Hooks | Husky pre-commit → lint-staged + `npm test` |
| Duplicate detection | jscpd (`npm run dup`) |
| HTTP | native `fetch` wrapped in `lib/api.js` |

---

## 3. Architecture diagram

```
                      ┌────────────────────────────────────────────────┐
                      │                  main.tsx                      │
                      │                     │                          │
                      │                     ▼                          │
                      │             <BrowserRouter>                    │
                      │                     │                          │
                      │                     ▼                          │
                      │            ┌──────────────┐                    │
                      │            │  <App />     │                    │
                      │            └──────┬───────┘                    │
                      │                   ▼                            │
                      │  ┌──────────────────────────────────────┐      │
                      │  │  <DataProvider port={httpAdapter}>   │ ◄──── TanStack QueryClient
                      │  │   <FeedbackProvider>                 │      │   (data/DataProvider)
                      │  │     <ToastProvider>                  │      │
                      │  │      <ConfirmModal stack/>           │      │
                      │  │      <CommandPalette/>               │      │
                      │  │      <AppRoutes/> ────────┐          │      │
                      │  │   </FeedbackProvider>     │          │      │
                      │  │  </DataProvider>          │          │      │
                      │  └───────────────────────────┼──────────┘      │
                      │                              ▼                 │
                      │                        ┌───────────┐           │
                      │                        │ <Routes/> │           │
                      │                        └─────┬─────┘           │
                      │                              ▼                 │
                      │             ┌────────────────────────────┐     │
                      │             │  <MainLayout> on every     │     │
                      │             │   protected route          │     │
                      │             │                            │     │
                      │             │  ┌──────────┬───────────┐  │     │
                      │             │  │ Sidebar  │  Header   │  │     │
                      │             │  └──────────┴───────────┘  │     │
                      │             │  ┌──────────────────────┐  │     │
                      │             │  │  <PageComponent/>    │  │     │
                      │             │  │   (src/pages/*.tsx)  │  │     │
                      │             │  └──────────────────────┘  │     │
                      │             └────────────────────────────┘     │
                      └────────────────────────────────────────────────┘

   Pages call hooks ┐
                    ▼
   ┌────────────────────────────────────────────────────────────────────┐
   │                       Cross-cutting hooks                          │
   │                                                                    │
   │  data/hooks.ts ──► useResource('rooms', { pgId })  ◄── TanStack    │
   │                    useAggregate(['rooms','tenants','tickets'])     │
   │                    useRepo('rooms').create/update/remove           │
   │                    useMutation(fn)                                 │
   │                                                                    │
   │  hooks/use-current-user      → /api/v1/auth/me (TanStack-cached)   │
   │  hooks/use-lookups            → wraps useResource for shared lookups│
   │  hooks/use-paginated-filtered-list  → table state                  │
   │  hooks/use-resource-modal     → add/edit modal state               │
   │  hooks/use-table-page-size    → viewport-adaptive page size        │
   │  hooks/use-responsive         → mobile/tablet/desktop tiers        │
   │                                                                    │
   │  components/FeedbackProvider  → useFeedback(): toast/confirm/error │
   │                                                                    │
   │  store/auth-store             → token (Zustand persist)            │
   │  store/ui-store               → sidebarCollapsed (Zustand persist) │
   └────────────────────────────────────────────────────────────────────┘
                    │
                    ▼ (data layer)
   ┌────────────────────────────────────────────────────────────────────┐
   │                           DataPort                                 │
   │  (src/data/port.ts — interface: list/get/create/update/remove)     │
   │                                                                    │
   │   ┌─────────────────────────┐  ┌────────────────────────────────┐  │
   │   │  httpAdapter            │  │  memoryAdapter                 │  │
   │   │  (production)           │  │  (tests + Storybook seed)      │  │
   │   │                         │  │                                │  │
   │   │  → lib/api.js apiRequest│  │  → in-memory Map per resource  │  │
   │   │  → /api/v1/* endpoints  │  │  → no network                  │  │
   │   └────────────┬────────────┘  └────────────────────────────────┘  │
   └────────────────┼───────────────────────────────────────────────────┘
                    ▼
            FastAPI backend
        (pg-maintenance.onrender.com)
```

---

## 4. Directory tree (annotated)

Only `src/` is shown. Top-level configs (`vite.config.js`, `tsconfig.json`, `eslint.config.js`,
`package.json`, `.husky/pre-commit`, `.jscpd.json`, `.gitignore`) do what their names say.

```
src/
├── main.tsx                  # Vite entry. Mounts <App/> into #root.
├── App.tsx                   # Routes + provider stack (Data, Feedback, CommandPalette).
│
├── pages/                    # Route components — one per visible URL.
│   ├── AuthPage.tsx          #  /auth        — login + register form.
│   ├── Dashboard.tsx         #  /dashboard   — KPI cards + recent activity.
│   ├── MyPGs.tsx             #  /pgs         — list of owner's PGs (delete here).
│   ├── AddPG.tsx             #  /pg/add      — 3-step wizard: basics → amenities → rooms.
│   ├── EditPG.tsx            #  /pg/edit/:id — edit PG basics; "Manage Rooms" jumps to PGRooms.
│   ├── PGRooms.tsx           #  /pg/:id/rooms — room CRUD scoped to ONE PG.
│   ├── Rooms.tsx             #  /rooms       — global rooms table across all PGs.
│   ├── Tenants.tsx           #  /tenants     — tenants table + AddTenantDrawer.
│   ├── Maintenance.tsx       #  /maintenance — tickets across PGs + NewTicketModal.
│   ├── Transactions.tsx      #  /transactions — payment ledger + RecordPaymentModal.
│   ├── Expenses.tsx          #  /expenses    — expense ledger + AddExpenseModal.
│   ├── Notifications.tsx     #  /notifications.
│   ├── Profile.tsx           #  /profile     — PATCH /api/v1/users/me.
│   ├── Settings.tsx          #  /settings    — local UI prefs.
│   └── Inquiries.tsx         # legacy, route currently unmounted.
│
├── components/               # App-level composite components.
│   ├── MainLayout.tsx        # Sidebar + Header chrome wrapping every protected route.
│   ├── Sidebar.tsx           # Desktop nav + collapsed state from useUIStore.
│   ├── Header.tsx            # Mobile-only chrome (notification bell + Cmd+K trigger).
│   ├── FeedbackProvider.tsx  # Provides useFeedback(): toast/confirm/error. Wraps ToastProvider.
│   ├── StatCards.tsx         # Semantic stat-card grid used by Dashboard.
│   │
│   ├── AddTenantDrawer.tsx   # 4-step tenant onboard drawer, posts /tenants/onboard.
│   ├── RoomFormModal.tsx     # Room add/edit modal with amenity picker.
│   ├── RecordPaymentModal.tsx# Payment entry → POST /transactions/.
│   ├── AddExpenseModal.tsx   # Expense entry → POST /expenses/.
│   ├── NewTicketModal.tsx    # Maintenance ticket → POST /tickets/.
│   ├── BookRoomModal.tsx     # (legacy) book a room from /rooms grid.
│   ├── RoomDetailsModal.tsx  # Read-only room detail from /rooms grid.
│   │
│   └── ui/                   # shadcn/ui primitives (don't edit unless adding new one).
│       ├── Toast.tsx         # ToastProvider (used inside FeedbackProvider).
│       ├── ConfirmModal.tsx  # Used inside FeedbackProvider for confirm().
│       ├── Pagination.tsx    # Page navigation widget.
│       ├── DataTable.tsx     # Generic table primitive.
│       ├── Select.tsx        # Custom Select used in filter bars.
│       ├── CommandPalette.tsx# Cmd+K palette mounted at App root.
│       ├── Badge.tsx         # Semantic Badge with BADGE_MAP variants.
│       ├── Loader.tsx, EmptyState.tsx, Skeleton.tsx, Drawer.tsx, ...
│       └── (radix-ui-wrapping primitives: avatar, dialog, dropdown-menu, ...)
│
├── data/                     # Server-state data layer (Ports & Adapters over TanStack).
│   ├── port.ts               # DataPort interface + Resource string union.
│   ├── httpAdapter.ts        # Production adapter — wraps lib/api.js.
│   ├── memoryAdapter.ts      # In-memory adapter for tests/Storybook.
│   ├── DataProvider.tsx      # React context + QueryClient. Wraps the app.
│   ├── hooks.ts              # useResource / useAggregate / useRepo / useMutation.
│   ├── index.ts              # Barrel: import from '../data'.
│   └── __tests__/useResource.test.tsx   # Boundary tests via memoryAdapter.
│
├── store/                    # Client state (Zustand).
│   ├── auth-store.ts         # token (persisted, key 'pg_manager_auth') + non-React getters.
│   ├── ui-store.ts           # sidebarCollapsed + mobileSidebarOpen.
│   └── index.ts              # Barrel.
│
├── hooks/                    # Reusable custom hooks (in-process).
│   ├── use-current-user.ts   # Wraps useQuery on /api/v1/auth/me. Provides {displayName,email,initial}.
│   ├── use-lookups.ts        # Wraps useResource for shared modal lookup data.
│   ├── use-paginated-filtered-list.ts  # data + filter + search + page → render-ready slice.
│   ├── use-resource-modal.ts # Manages add/edit modal open + initial item.
│   ├── use-table-page-size.ts# Computes page size from viewport.
│   ├── use-responsive.ts     # isMobile/isTablet/isDesktop via window.matchMedia.
│   └── use-mobile.ts         # Single mobile breakpoint hook.
│
├── lib/                      # Pure utilities (no React).
│   ├── api.js                # fetch wrapper. setToken/clearToken delegate to auth-store.
│   ├── animations.ts         # All framer-motion Variants (typed).
│   ├── coerce.ts             # toNumber, toIsoDate, toStringSafe.
│   ├── format.ts             # formatCurrency (cached Intl.NumberFormat), formatCompact, formatDate, formatRelative.
│   ├── status.ts             # deriveRoomStatus / derivePaymentStatus / deriveTicketStatus + theme maps.
│   │                         #   Aliases legacy values: 'vacant'→'available', 'success'→'paid', 'done'→'resolved'.
│   ├── amenities.ts          # BUILDING_AMENITY_NAMES / ROOM_AMENITY_NAMES + syncAmenities helper.
│   ├── utils.ts              # cn() Tailwind class merger (shadcn).
│   ├── mockData.js           # Fallback fixtures used when VITE_USE_MOCK=true.
│   └── __tests__/            # Unit tests for the pure helpers.
│
├── types/                    # Domain TS types — no runtime code.
│   ├── common.ts             # Timestamps, UUID, SoftDeletable.
│   ├── user.ts, pg.ts, amenity.ts, room.ts, tenant.ts, transaction.ts,
│   │   expense.ts, ticket.ts, notification.ts
│   └── index.ts              # Barrel: import type {...} from '../types'.
│
├── constants/                # Magic-string-free single sources of truth.
│   ├── routes.ts             # ROUTES map + API path map (with param-builders).
│   ├── options.ts            # Typed Option<T>[] arrays for every dropdown.
│   ├── colors.ts             # Tailwind chip-class maps keyed by domain enums.
│   └── index.ts              # Barrel.
│
└── test/setup.js             # Vitest setup (jest-dom matchers).
```

---

## 5. Key dataflow walkthroughs

### 5.1 "User opens /pg/:id/rooms"

1. Router renders `<MainLayout><PGRooms/></MainLayout>`.
2. `MainLayout` reads `useUIStore` for sidebar collapsed state.
3. `PGRooms.tsx` calls `apiRequest('/api/v1/rooms/?pg_id=...')` directly today; the
   target architecture is `useResource('rooms', { pgId })`.
4. `useResource` → `useDataPort()` → `httpAdapter` → `lib/api.js apiRequest` →
   `getAuthToken()` from `store/auth-store` → adds `Authorization: Bearer`.
5. Backend response normalized through `unwrapData`; rows enriched with `pgName` from
   the `useResource('pgs')` join automatically.
6. Page renders cards with `ROOM_THEME[deriveRoomStatus(...)]` from `lib/status`.
7. "Delete" → `useFeedback().confirm({...})` → `apiRequest('...', {method:'DELETE'})` →
   `useFeedback().error(promise, fallback, success)` shows toast + handles error.

### 5.2 "Login flow"

1. `AuthPage` POSTs `/api/v1/auth/login` (form-urlencoded via `apiFormRequest`).
2. On success, `setToken(data.access_token)` → delegates to `auth-store`'s `setAuthToken`.
3. Zustand's `persist` middleware writes `{state:{token:...}}` to `localStorage` key
   `pg_manager_auth`. Legacy raw-string `pg_manager_token` is auto-migrated on first read.
4. Navigate to `/dashboard`. `useCurrentUser` (TanStack) fetches `/api/v1/auth/me`;
   Sidebar + Header show real name/email.

### 5.3 "Add PG (3-step wizard)" — staged commits

1. Step 1 (Basics) → `POST /api/v1/pg/` → save `pgId` in component state.
2. Step 2 (Building amenities) → for each selected: `syncAmenities('pg', pgId, {add:[...]})`
   from `lib/amenities`. Failures surface via `useFeedback().toast.warning`.
3. Step 3 (Rooms) → repeated `RoomFormModal` opens; each `POST /api/v1/rooms/` then
   per-amenity `syncAmenities('room', roomId, {add:[...]})`.
4. Finish → `navigate('/pg/:id/rooms')`. If the user bails between steps, the PG plus any
   committed amenities/rooms remain in the backend (intentional: "I made a PG and quit"
   is a better failure mode than total loss).

---

## 6. Testing

- `npm test` (Vitest, `vitest run`) — 81 tests across 6 files, all green.
  - `lib/__tests__/*` — pure helper unit tests (status, format, coerce, amenities).
  - `hooks/__tests__/use-paginated-filtered-list.test.ts` — pagination hook.
  - `data/__tests__/useResource.test.tsx` — boundary tests of `useResource`/`useRepo`/
    `useAggregate` via `<DataProvider port={memoryAdapter(seed)}>`.
- `.gitignore` excludes `src/test/` and `__tests__/` so test files stay local.

---

## 7. Tooling commands

| Command | Effect |
|---|---|
| `npm run dev` | Vite dev server (port 5173). Proxies `/api/*` to the deployed backend. |
| `npm run build` | Production build into `dist/`. |
| `npm test` | Run all Vitest tests once. |
| `npm run test:watch` | Watch mode. |
| `npm run lint` | ESLint everything. |
| `npm run dup` | jscpd duplicate-code report (HTML at `.jscpd-report/`). |
| Husky pre-commit | Runs `lint-staged` + `npm test` before each commit. |

Override the API target locally:
```sh
VITE_API_PROXY=http://localhost:8000 npm run dev
```

Use mocked data (no backend needed):
```sh
VITE_USE_MOCK=true npm run dev
```

---

## 8. Conventions

- **Imports**: relative within a directory; `@/` alias also configured. Pages typically
  import from barrels: `'../data'`, `'../types'`, `'../constants'`.
- **No CSS modules** — Tailwind classes inline. Theme tokens in `src/index.css` `@theme`.
- **Server state lives in TanStack Query** (via `useResource`/`useAggregate`); never use
  `useState` to cache server responses.
- **Client state lives in Zustand stores** (`auth-store`, `ui-store`); add new stores
  only for genuinely cross-page client state.
- **Errors surface through `useFeedback`** — never `window.confirm`, `alert`, or raw
  `console.error` in catch blocks. Use `fb.confirm(...)`, `fb.error(promise, fallback)`,
  `fb.toast.success(msg)`.
- **Status derivation** through `lib/status` (never inline ternaries) so backend term
  drift (e.g. `vacant` vs `available`) is patched in one place.
- **Currency / dates** through `lib/format` so locale + Intl caching are shared.
- **New code lives in `.ts`/`.tsx`**; legacy `.js` files (`api.js`, `mockData.js`) are
  not blocked but new code should be typed.

---

## 9. Backend reference (read-only from this repo)

- Source: `d:/pg-maintenance` → `github.com/PandyaYog/pg-maintenance`.
- FastAPI + SQLAlchemy 2 + Postgres + Alembic.
- Layered: `app/api/v1/endpoints/*` (route handlers) → `app/services/*` (business logic) →
  `app/models/*` (SQLAlchemy models) ↔ `app/schemas/*` (Pydantic v2 DTOs).
- Auth dep: `app/api/deps.py` exports `get_current_user`, `require_role`, `require_owner`,
  `verify_pg_ownership`. New endpoints/services should reuse these instead of inlining
  role checks.
- Tests: `pytest` with in-memory SQLite (`tests/conftest.py` patches PG UUID/ARRAY types).

---

## 10. Known followups (intentional debt)

- `EditPG.tsx` saves only basic fields — phone/email/totalRooms inputs are unused; amenity
  toggles aren't synced.
- `Rooms.tsx` "Add Room" button is a no-op; `BookRoomModal` has hardcoded names.
- `Sidebar.tsx` shows hardcoded `badges = {notifications: 0, maintenance: 0}` — not yet live.
- 6 modals share ~150 lines of backdrop/header markup (jscpd flagged); future
  `<ModalShell>` extraction.
- Backend endpoints lack pagination, refresh-token rotation, OAuth CSRF state.

---

## 11. Where to start when adding a feature

| Adding... | Touch these files |
|---|---|
| A new page + route | `src/pages/Foo.tsx` + register in `src/App.tsx` + add to `src/constants/routes.ts` |
| A new resource end-to-end | extend `Resource` in `src/data/port.ts`, add `RESOURCE_BASE` entry in `httpAdapter.ts`, add `src/types/foo.ts` + barrel export, then call `useResource('foo')` from pages |
| A new modal | `src/components/FooModal.tsx`, drive open state via `useResourceModal()`, fetch lookups via `useLookups()` |
| A new pure helper | `src/lib/foo.ts` + `src/lib/__tests__/foo.test.ts` |
| A new domain enum/option set | `src/types/foo.ts` for the type, `src/constants/options.ts` for the dropdown |
| A new color theme map | `src/constants/colors.ts` |

When in doubt, read the file at the suggested path; the conventions above are followed
consistently across the codebase.
