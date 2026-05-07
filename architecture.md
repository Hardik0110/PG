# Architecture Diagrams

Visual companion to `context.md`. All diagrams are ASCII so they render in any terminal,
GitHub viewer, or LLM context.

---

## 1. Provider stack (what wraps what at runtime)

```
┌──────────────────────────────────────────────────────────────────────┐
│ <BrowserRouter>                                  ← react-router-dom  │
│  └── <DataProvider port={httpAdapter}>           ← src/data/         │
│       │                                                              │
│       │  Inside DataProvider:                                        │
│       │    new QueryClient({                                         │
│       │      defaultOptions: { queries: { staleTime: 30s } }         │
│       │    })                                                        │
│       │                                                              │
│       │  Hooks reading from this layer:                              │
│       │    useResource, useAggregate, useRepo, useMutation           │
│       │    useCurrentUser (via useQuery)                             │
│       │                                                              │
│       └── <FeedbackProvider>                     ← components/       │
│            │                                                         │
│            │  Inside:                                                │
│            │    <ToastProvider>                  ← components/ui/    │
│            │      ↳ exposes useToast()                               │
│            │    <ConfirmModal stack/>            ← components/ui/    │
│            │      ↳ promise-based confirm dialog                     │
│            │                                                         │
│            │  Public API: useFeedback() →                            │
│            │    { toast, confirm, error }                            │
│            │                                                         │
│            ├── <CommandPalette/>                  ← Cmd+K modal      │
│            └── <AppRoutes/>                                          │
│                  │                                                   │
│                  ├── /auth        → <AuthPage/>                      │
│                  └── (protected)                                     │
│                       └── <MainLayout>                               │
│                            ├── <Sidebar/>     ← desktop nav          │
│                            ├── <Header/>      ← mobile chrome        │
│                            └── <main>                                │
│                                  └── <PageComponent/>                │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 2. Data layer (Ports & Adapters)

```
                      pages / hooks
                           │
                           ▼
                ┌──────────────────────┐
                │     useDataPort()    │  ← React context lookup
                └──────────┬───────────┘
                           ▼
                ┌──────────────────────┐
                │      DataPort        │  ← src/data/port.ts (interface)
                │                      │
                │  list(resource, p?)  │
                │  get (resource, id)  │
                │  create(resource, b) │
                │  update(resource,id) │
                │  remove(resource,id) │
                └─────────┬────────────┘
                          │
            ┌─────────────┴─────────────┐
            ▼                           ▼
   ┌─────────────────┐          ┌─────────────────┐
   │  httpAdapter    │          │  memoryAdapter  │
   │  (production)   │          │  (tests)        │
   ├─────────────────┤          ├─────────────────┤
   │ delegates to    │          │ in-memory Map   │
   │ apiRequest()    │          │ keyed by        │
   │ in lib/api.js   │          │ resource name.  │
   │                 │          │ No network.     │
   │ unwrapData()    │          │ crypto.UUID()   │
   │ normalizes shape│          │ for created ids.│
   └────────┬────────┘          └─────────────────┘
            ▼
       fetch() ──► Render API
```

`Resource` is a string union: `'pgs' | 'rooms' | 'tenants' | 'transactions' |
'expenses' | 'tickets' | 'amenities' | 'notifications'`. Adding a resource means
adding it here AND adding a `RESOURCE_BASE` URL entry in `httpAdapter.ts`.

---

## 3. State boundaries

```
┌────────────────────────────────────────────────────────────┐
│                     SERVER STATE                           │
│                  (TanStack Query)                          │
│                                                            │
│  Belongs here: anything fetched from the backend.          │
│                                                            │
│  Cache key shape:  ['rooms', 'list', { pgId: 'xyz' }]      │
│                                                            │
│  Stale time:       30s default                             │
│  Invalidation:     useRepo(...).create/update/remove       │
│                    auto-invalidates all queries with the   │
│                    matching resource prefix.               │
│                                                            │
│  Read API:   useResource('rooms', { pgId, joinPg, ... })   │
│              useAggregate(['rooms','tenants','tickets'])   │
│  Write API:  useRepo('rooms').create/update/remove         │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│                     CLIENT STATE                           │
│                       (Zustand)                            │
│                                                            │
│  Belongs here: cross-page state owned only by the browser. │
│                                                            │
│  store/auth-store.ts                                       │
│    - token  (persisted to localStorage 'pg_manager_auth')  │
│    - setToken / clearToken / isAuthenticated               │
│                                                            │
│  store/ui-store.ts                                         │
│    - sidebarCollapsed   (persisted)                        │
│    - mobileSidebarOpen  (transient)                        │
│                                                            │
│  Non-React access (e.g., from lib/api.js):                 │
│    getAuthToken() / setAuthToken() / clearAuthToken()      │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│                   COMPONENT STATE                          │
│                      (useState)                            │
│                                                            │
│  Belongs here: ephemeral UI-only state local to one        │
│  component (filters, modal-form draft inputs, hover, ...). │
│                                                            │
│  NEVER: cache server responses with useState. Use          │
│  useResource and let TanStack manage it.                   │
└────────────────────────────────────────────────────────────┘
```

---

## 4. Sequence: "Owner deletes a room"

```
┌────────┐    ┌──────────┐  ┌────────────┐   ┌──────────┐  ┌─────────┐  ┌─────────┐
│ Owner  │    │ PGRooms  │  │ useFeedback│   │ DataPort │  │ api.js  │  │ Backend │
└───┬────┘    └────┬─────┘  └─────┬──────┘   └────┬─────┘  └────┬────┘  └────┬────┘
    │ click trash  │              │                │             │            │
    ├─────────────▶│              │                │             │            │
    │              │ confirm({})  │                │             │            │
    │              ├─────────────▶│                │             │            │
    │              │              │ render dialog  │             │            │
    │              │              │ await resolve  │             │            │
    │  click       │              │                │             │            │
    │  Confirm     │              │                │             │            │
    ├──────────────┼─────────────▶│                │             │            │
    │              │              │ resolve(true)  │             │            │
    │              │◀─────────────┤                │             │            │
    │              │ fb.error(    │                │             │            │
    │              │  apiRequest( │                │             │            │
    │              │    DELETE))  │                │             │            │
    │              ├──────────────┼───────────────▶│             │            │
    │              │              │                │ fetch DELETE │            │
    │              │              │                ├────────────▶│            │
    │              │              │                │             ├──204 NC───▶│
    │              │              │                │             │◀─────────┤ │
    │              │              │ resolved       │             │            │
    │              │◀─────────────┼────────────────┤             │            │
    │              │ toast.success("Room deleted") │             │            │
    │              │ remove row from local state    │             │            │
    │              │ (TanStack will refetch on next mount/focus)  │            │
```

---

## 5. Sequence: "User logs in"

```
┌──────┐  ┌──────────┐  ┌─────────────┐  ┌──────────────┐  ┌────────┐
│ User │  │ AuthPage │  │ apiFormReq  │  │ auth-store   │  │ Backend│
└──┬───┘  └────┬─────┘  └──────┬──────┘  └──────┬───────┘  └───┬────┘
   │ submit   │                │                │              │
   ├─────────▶│                │                │              │
   │          │ POST /auth/    │                │              │
   │          │ login (form)   │                │              │
   │          ├───────────────▶│                │              │
   │          │                │ fetch          │              │
   │          │                ├───────────────────────────────▶
   │          │                │   200 {access_token, ...}     │
   │          │                │◀──────────────────────────────┤
   │          │ {access_token} │                │              │
   │          │◀───────────────┤                │              │
   │          │ setToken(t)                     │              │
   │          ├────────────────────────────────▶│              │
   │          │                │                │ persist to   │
   │          │                │                │ localStorage │
   │          │                │                │ key:         │
   │          │                │                │ 'pg_manager_auth'│
   │          │                │                │              │
   │          │ navigate('/dashboard')          │              │
   │          │                │                │              │
   │          │ next render: useCurrentUser     │              │
   │          │ → useQuery /auth/me             │              │
   │          │ → header shows real name+email  │              │
```

---

## 6. Resource ⇄ types ⇄ constants ⇄ adapter mapping

A new resource is wired up in **four** places:

```
┌─────────────────────────────────────────────────────────────────────┐
│  Domain concept: "Tenant"                                           │
└─────────────────────────────────────────────────────────────────────┘
                              │
   ┌──────────────────────────┼──────────────────────┐
   │                          │                      │
   ▼                          ▼                      ▼
src/types/             src/data/port.ts      src/constants/options.ts
tenant.ts                                    + colors.ts
   │
   │ exports             Resource enum:        Option<T>[] for each
   │ Tenant interface    'tenants'             dropdown the page uses
   │ + nested types
                            │
                            ▼
                    src/data/httpAdapter.ts
                    RESOURCE_BASE map:
                    tenants: '/api/v1/tenants/'
                            │
                            ▼
                    src/data/memoryAdapter.ts
                    seed['tenants'] = []
                            │
                            ▼
                    Pages call useResource('tenants', { pgId, ... })
```

---

## 7. Build & deploy pipeline

```
   developer machine            CI / Vercel             deployed app
   ─────────────────             ───────────              ────────────
   git commit                   npm ci                   /index.html
        │                          │                      ↑
        │ husky pre-commit         ▼                      │
        ├─ lint-staged            vite build              │ static
        ├─ npm test               (Vite outputs           │ assets
        │  (81 vitest tests)        dist/)                │ from dist/
        │                          │                      │
        ▼                          ▼                      │
   git push origin main        deploy /dist               │
                                   │                      │
                                   └──────────────────────┘

   Backend (separate):
   git push to PandyaYog/pg-maintenance → Render auto-deploys
   FastAPI app to https://pg-maintenance.onrender.com
   Frontend's vite.config.js proxies /api → that URL.
```

---

## 8. Theming layers

```
┌────────────────────────────────────────────────────────────────┐
│  src/index.css                                                 │
│    @theme {                                                    │
│      --text-fluid-base: clamp(...);                            │
│      --spacing-fluid-md: clamp(...);                           │
│      --color-brand-500: #1C6C41;                               │
│      ...                                                       │
│    }                                                           │
│  Tailwind v4 generates utility classes from these tokens.      │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│  src/constants/colors.ts                                       │
│    Domain → chip-class maps. Always reference Tailwind classes,│
│    never raw hex (so theme tokens flow through).               │
│                                                                │
│  ROOM_THEME[deriveRoomStatus(...)]                             │
│  TRANSACTION_TYPE_CHIP[tx.type]                                │
│  EXPENSE_CATEGORY_CHIP[e.category]                             │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                  Components use the maps directly
                  → no inline color literals in pages.
```

---

## 9. Conventions cheat-sheet

```
DO                                        DON'T
────────────────────────────────────      ──────────────────────────────────
useResource('rooms', { pgId })            useState([]) + useEffect+fetch
useFeedback().confirm({...})              window.confirm('Delete?')
useFeedback().error(promise, msg)         try/catch + console.error
formatCurrency(amt)                       new Intl.NumberFormat(...)
deriveRoomStatus(raw, count, cap)         inline ternary on raw status string
ROUTES.PG_EDIT(id)                        `/pg/edit/${id}`
TRANSACTION_TYPE_CHIP[tx.type]            inline color object in component
import { Tenant } from '../types'         redefining the same shape locally
Zustand store for cross-page state        prop-drilling + lifting state
TanStack for server state                 useState mirroring server data
```

---

## 10. When in doubt

1. Open `context.md` § 11 ("Where to start when adding a feature").
2. Skim the file in `src/<area>/` that is closest to what you're building.
3. If you're tempted to write a helper that already feels familiar, search
   `src/lib/`, `src/hooks/`, and `src/data/` first — it might already exist.
