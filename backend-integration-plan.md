# Backend Integration Plan

> Source: `https://pg-maintenance.onrender.com/openapi.json` — FastAPI Project, v1.0.0
> 36 endpoints, 43 schemas. Bearer-token auth.
> Drafted: 2026-05-07

## 1. Endpoint inventory by domain

### 1.1 Auth (5 endpoints)
| Method | Path | Purpose | Body | Returns |
|---|---|---|---|---|
| POST | `/api/v1/auth/login` | Email/password login | `{username, password}` (form-urlencoded) | `Token` |
| POST | `/api/v1/auth/register` | Create user | `UserCreate` | `UserResponse` |
| GET | `/api/v1/auth/me` | Current user | — | `UserResponse` |
| GET | `/api/v1/auth/google/login` | Start Google OAuth | — | redirect |
| GET | `/api/v1/auth/google/callback` | OAuth callback | — | `Token` |

### 1.2 PG Facilities (5)
| Method | Path | Body | Returns |
|---|---|---|---|
| GET | `/api/v1/pg-facilities/` | — | `PGFacilityResponse[]` |
| POST | `/api/v1/pg-facilities/` | `PGFacilityCreate` | `PGFacilityResponse` |
| GET | `/api/v1/pg-facilities/{id}` | — | `PGFacilityResponse` |
| PATCH | `/api/v1/pg-facilities/{id}` | `PGFacilityUpdate` | `PGFacilityResponse` |
| DELETE | `/api/v1/pg-facilities/{id}` | — | — |

### 1.3 Amenities (4)
| Method | Path | Body | Returns |
|---|---|---|---|
| GET | `/api/v1/amenities/?category=` | — | `AmenityResponse[]` |
| POST | `/api/v1/amenities/` | `AmenityCreate` | `AmenityResponse` |
| POST | `/api/v1/amenities/pg/{pg_id}` | `{amenity_id}` | `PGFacilityResponse` (attach) |
| DELETE | `/api/v1/amenities/pg/{pg_id}/{amenity_id}` | — | — (detach) |

### 1.4 Rooms (5)
| Method | Path | Body | Returns |
|---|---|---|---|
| GET | `/api/v1/rooms/?pg_id=` | — | `RoomResponse[]` |
| POST | `/api/v1/rooms/` | `RoomCreate` | `RoomResponse` |
| GET | `/api/v1/rooms/{id}` | — | `RoomResponse` |
| PATCH | `/api/v1/rooms/{id}` | `RoomUpdate` | `RoomResponse` |
| DELETE | `/api/v1/rooms/{id}` | — | — |

### 1.5 Tenants (5)
| Method | Path | Body | Returns |
|---|---|---|---|
| GET | `/api/v1/tenants/?pg_id=&tenant_status=` | — | `TenantResponse[]` |
| POST | `/api/v1/tenants/` | `TenantCreate` (needs `user_id`) | `TenantResponse` |
| GET | `/api/v1/tenants/{id}` | — | `TenantResponse` |
| PATCH | `/api/v1/tenants/{id}` | `TenantUpdate` | `TenantResponse` |
| DELETE | `/api/v1/tenants/{id}` | — | — |

### 1.6 Tickets / Maintenance (5)
| Method | Path | Body | Returns |
|---|---|---|---|
| GET | `/api/v1/tickets/my?status=` | — | `TicketResponse[]` (current user's) |
| GET | `/api/v1/tickets/pg/{pg_id}?status=` | — | `TicketResponse[]` (whole PG) |
| POST | `/api/v1/tickets/` | `TicketCreate` (needs `tenant_id`) | `TicketResponse` |
| PATCH | `/api/v1/tickets/{id}` | `TicketUpdate` (status/priority only) | `TicketResponse` |
| DELETE | `/api/v1/tickets/{id}` | — | — |

### 1.7 Transactions (6)
Tenant payments only — rent, deposits, etc.
| Method | Path | Body | Returns |
|---|---|---|---|
| GET | `/api/v1/transactions/?pg_id=` | — | `TransactionResponse[]` |
| POST | `/api/v1/transactions/` | `TransactionCreate` | `TransactionResponse` |
| GET | `/api/v1/transactions/{id}` | — | `TransactionResponse` |
| GET | `/api/v1/transactions/tenant/{tenant_id}` | — | `TransactionResponse[]` |
| PATCH | `/api/v1/transactions/{id}` | `TransactionUpdate` | `TransactionResponse` |
| DELETE | `/api/v1/transactions/{id}` | — | — |

### 1.8 Expenses (5) — *PG-level operating expenses*
Distinct from Transactions. Owner's outgoing costs (electricity bills, repairs, staff salary, etc).
| Method | Path | Body | Returns |
|---|---|---|---|
| GET | `/api/v1/expenses/?pg_id=` | — | `ExpenseResponse[]` |
| POST | `/api/v1/expenses/` | `ExpenseCreate` | `ExpenseResponse` |
| GET | `/api/v1/expenses/{id}` | — | `ExpenseResponse` |
| PATCH | `/api/v1/expenses/{id}` | `ExpenseUpdate` | `ExpenseResponse` |
| DELETE | `/api/v1/expenses/{id}` | — | — |

### 1.9 Room Expenses / Split-bill (5) — *NEW FEATURE not in frontend yet*
Shared expense among roommates with per-tenant share tracking & settlement.
| Method | Path | Body | Returns |
|---|---|---|---|
| POST | `/api/v1/room-expenses/` | `RoomExpenseCreate` | `RoomExpenseResponse` |
| GET | `/api/v1/room-expenses/room/{room_id}` | — | `RoomExpenseResponse[]` |
| GET | `/api/v1/room-expenses/balances/{room_id}` | — | `RoomBalancesResponse` |
| PATCH | `/api/v1/room-expenses/settle/{share_id}` | — | mark paid |
| DELETE | `/api/v1/room-expenses/{id}` | — | — |

### 1.10 Notices (7) — *Owner-to-tenant announcements*
Different from current `Notifications.tsx` which is system-→-owner.
| Method | Path | Body | Returns |
|---|---|---|---|
| GET | `/api/v1/notices/` | — | `NoticeResponse[]` |
| POST | `/api/v1/notices/` | `NoticeCreate` | `NoticeResponse` |
| GET | `/api/v1/notices/{id}` | — | `NoticeResponse` |
| GET | `/api/v1/notices/pg/{pg_id}` | — | `NoticeResponse[]` |
| GET | `/api/v1/notices/room/{room_id}` | — | `NoticeResponse[]` |
| PATCH | `/api/v1/notices/{id}` | `NoticeUpdate` | `NoticeResponse` |
| DELETE | `/api/v1/notices/{id}` | — | — |

### 1.11 Billing (3) — *NEW MODULE not in frontend yet*
| Method | Path | Returns |
|---|---|---|
| GET | `/api/v1/billing/status/{pg_id}` | `PaymentStats` (total/paid/unpaid/partial) |
| GET | `/api/v1/billing/unpaid/{pg_id}` | `UnpaidTenant[]` |
| POST | `/api/v1/billing/remind/{tenant_id}` | sends reminder, returns `NoticeResponse` |

---

## 2. Frontend → Endpoint mapping

### 2.1 [AuthPage.tsx](src/pages/AuthPage.tsx)
| UI element | Endpoint | Notes |
|---|---|---|
| Login form (email + password) | `POST /auth/login` (form-urlencoded) | Already wired to mock; just point to real backend |
| Sign-up form (name, email, phone, password) | `POST /auth/register` (JSON `UserCreate`) | Currently fakes registration. **Add `role: 'owner'`** in payload |
| "Login with Google" button (NEW) | `GET /auth/google/login` | Not in frontend — add button |
| Token storage | `setToken()` from `lib/api.js` | Already working |
| First-load auth check | `GET /auth/me` | Already implemented but commented out |

### 2.2 [Dashboard.tsx](src/pages/Dashboard.tsx)
| UI element | Endpoint(s) | Notes |
|---|---|---|
| Stat cards (Tenants, Occupancy, Vacant, Tickets) | `GET /pg-facilities/`, `GET /tenants/?pg_id={selected}`, `GET /rooms/?pg_id={selected}`, `GET /tickets/pg/{pg_id}?status=open` | Aggregate counts client-side |
| Mini-metric "Revenue MTD" | `GET /transactions/?pg_id={selected}` then sum paid this month | |
| Mini-metric "Due this week" | `GET /billing/unpaid/{pg_id}` then filter `days_overdue ≤ 7` | |
| Mini-metric "Avg rent" | derive from `tenants[].monthly_rent` | |
| Mini-metric "Action needed" | high-priority tickets count + unpaid count | |
| Recent Tenants list | `GET /tenants/?pg_id=` sort by `move_in_date` desc | Need user info for names — see §3.1 |
| Open Tickets list | `GET /tickets/pg/{pg_id}?status=open` | filter by priority client-side |
| Recent Activity timeline | merge tickets + tenants by date | |
| Room status bars | `GET /rooms/?pg_id=` group by `is_active` + `current_occupancy` | "vacant" = `current_occupancy < capacity` |

### 2.3 [MyPGs.tsx](src/pages/MyPGs.tsx)
| UI element | Endpoint | Notes |
|---|---|---|
| PG cards list | `GET /pg-facilities/` | one-to-one |
| Tenant count chip | `GET /tenants/?pg_id={id}` per card OR derive from a single fetch | N+1 risk — see §4 |
| Room count chip | `GET /rooms/?pg_id={id}` per card | same |
| "Add New PG" button → `/pg/add` | navigates to AddPG | |
| "Manage Properties" button | navigates to `/rooms?pg_id={id}` | filter rooms by PG |
| Settings icon (per card) | navigates to `/pg/edit/{id}` | |

### 2.4 [AddPG.tsx](src/pages/AddPG.tsx) and [EditPG.tsx](src/pages/EditPG.tsx)
| UI field | API field | Notes |
|---|---|---|
| PG Name | `name` | required |
| Address | `address` | required |
| City | `city` | required |
| State | `state` | required |
| Pincode | `pincode` | **MISSING in frontend forms — add input** |
| Description | `description` | optional |
| PG Type (Boys/Girls/Mixed) | `type` (free string, but constrain to enum) | |
| Owner Phone, Owner Email | n/a — these belong to user, not PG | **Remove from PG form OR map to UserUpdate (no such endpoint exists)** |
| Total Rooms | n/a — derived from rooms table, not stored | **Remove from PG form** |
| Amenity checkboxes | `GET /amenities/` to fetch master list, then `POST /amenities/pg/{id}` per selected, `DELETE /amenities/pg/{id}/{aid}` per deselected | currently hardcoded in frontend; fetch from backend |
| Save | `POST /pg-facilities/` (create) or `PATCH /pg-facilities/{id}` (update) | |

### 2.5 [Tenants.tsx](src/pages/Tenants.tsx)
| UI element | Endpoint | Notes |
|---|---|---|
| Tenants table | `GET /tenants/?pg_id={filter}` | server-side PG filter |
| Search box | client-side filter on name/email/phone | (no backend search endpoint) |
| PG filter dropdown | client-side filter | |
| "Add Tenant" button | opens `AddTenantDrawer` | see §2.6 |
| Row click → tenant detail | `GET /tenants/{id}` + `GET /transactions/tenant/{id}` | (need detail page; not built yet) |
| Tenant name + email + phone columns | come from `User`, not `Tenant`. See §3.1 |
| PG chip | derive from `pg_id` lookup |
| Room column | `room_id` → `GET /rooms/{id}` lookup |
| Rent | `monthly_rent` |
| Move In | `move_in_date` |

### 2.6 [AddTenantDrawer.tsx](src/components/AddTenantDrawer.tsx)
**Currently 4-step wizard (Profile, ID Proof, Guardian, Workplace).**

| Step / field | Endpoint | Notes |
|---|---|---|
| Step 1: First/Last name, phone, email, blood group | `POST /auth/register` first → returns `user_id` | **2-step submit needed** |
| Step 2: Aadhar no, PAN no, ID upload | **NO BACKEND FIELDS** for these — see §4 |
| Step 3: Guardian name, relation, phone | **NO BACKEND FIELDS** | |
| Step 4: Workplace, move-in date, room, rent, deposit | `POST /tenants/` with `{user_id, pg_id, room_id, move_in_date, monthly_rent, security_deposit, status}` | |
| Final submit | sequential: register user → create tenant | |

### 2.7 [Rooms.tsx](src/pages/Rooms.tsx)
| UI element | Endpoint | Notes |
|---|---|---|
| Rooms grid | `GET /rooms/?pg_id={filter}` | |
| Vacant filter | client-side `current_occupancy < capacity` | |
| Tenant count badge | `GET /tenants/?pg_id={id}` map by `room_id` | |
| "Book Room" | opens `BookRoomModal` | see §2.8 |
| "View Details" | opens `RoomDetailsModal` | see §2.9 |
| Mismatched fields | frontend has `floor`, `type`, `amenities[]`; backend has `room_sharing`, `is_ac`, `capacity`, `current_occupancy` | **Big mismatch — see §3.3** |

### 2.8 [BookRoomModal.tsx](src/components/BookRoomModal.tsx)
| UI field | Endpoint | Notes |
|---|---|---|
| Existing Profile dropdown | `GET /tenants/?pg_id=&tenant_status=inactive` to list unassigned | OR a new endpoint for unassigned users |
| New Tenant inline form | open `AddTenantDrawer` instead | |
| Bed select | n/a — backend has `current_occupancy` count, no per-bed identity | **Remove or add bed_label field to backend** |
| Move-in date | `move_in_date` | |
| Monthly rent | `monthly_rent` | |
| Security deposit | `security_deposit` | |
| Submit | `PATCH /tenants/{id}` (assign room) OR `POST /tenants/` (new tenant + room) | |

### 2.9 [RoomDetailsModal.tsx](src/components/RoomDetailsModal.tsx)
| Block | Endpoint |
|---|---|
| Room meta (type/floor/rent) | `GET /rooms/{id}` |
| Occupant list | `GET /tenants/?pg_id=` filter by `room_id`, then merge with user info |
| Per-occupant phone/email | from `User` |

### 2.10 [Maintenance.tsx](src/pages/Maintenance.tsx)
| UI element | Endpoint | Notes |
|---|---|---|
| Tickets table | `GET /tickets/pg/{pg_id}?status=` | server filter by status |
| Category / priority filters | client-side | |
| "New Ticket" button | opens `NewTicketModal` | |
| Status change menu / drawer buttons | `PATCH /tickets/{id}` `{status: 'in_progress'}` etc. | |
| Tenant info inside ticket detail | join `tenant_id` → user | not currently shown |

### 2.11 [NewTicketModal.tsx](src/components/NewTicketModal.tsx)
| UI field | API field | Notes |
|---|---|---|
| Subject | `title` | |
| Category | `category` enum | **frontend has `internet`, `carpenter`; backend has only `plumbing/electrical/furniture/cleaning/other`** — drop unsupported or add to backend |
| Room | `room_id` | needs PG-scoped room lookup |
| Priority | `priority` enum (low/medium/high) | match |
| Description | `description` | |
| Attachment (photo) | **NO BACKEND SUPPORT** — drop or add upload endpoint | |
| `tenant_id` | not in form | **Backend requires this — but owner is creating ticket. Add `current_user_id` injection on backend OR make tenant_id optional** |

### 2.12 [Transactions.tsx](src/pages/Transactions.tsx)
| UI element | Endpoint | Notes |
|---|---|---|
| Transactions table | `GET /transactions/?pg_id=` | |
| PG/Month/Type filters | client-side | |
| "Total Collected" stat | sum of `status='paid'` | |
| "Pending Dues" stat | sum of `status='pending'` OR `GET /billing/unpaid/{pg_id}` |
| "This Month" stat | sum of current-month entries | |
| **Type column showing "expense"** | should NOT include backend Expenses (those are separate). Either: (a) merge `/transactions/` + `/expenses/` and tag, or (b) split into two pages | see §3.4 |
| Tenant name column | join `tenant_id` → user | |
| Room column | join via tenant → room | |
| PG chip | join via `pg_id` | |
| "Record Payment" | opens `RecordPaymentModal` | |
| "Add Expense" | opens `AddExpenseModal` | should hit `/expenses/`, not `/transactions/` |
| "Export CSV" | client-side (already works) | |

### 2.13 [RecordPaymentModal.tsx](src/components/RecordPaymentModal.tsx)
| UI field | API field |
|---|---|
| Tenant select | `tenant_id` |
| Payment Type | `type` (rent/deposit/utility/fine/food) |
| Amount | `amount` |
| Method (UPI/Cash/Bank/Card) | `payment_method` |
| Date | `transaction_date` |
| Reference No | `description` (or new field) |
| Send Receipt checkbox | **no backend support** — could trigger `POST /billing/remind/...` later |
| Submit | `POST /transactions/` `{pg_id, tenant_id, type, amount, transaction_date, status: 'paid', payment_method, description}` |

### 2.14 [AddExpenseModal.tsx](src/components/AddExpenseModal.tsx)
| UI field | API field |
|---|---|
| PG | `pg_id` |
| Category | `category` (free string — Maintenance/Salary/Utilities/Repair/etc) |
| Amount | `amount` |
| Date | `expense_date` |
| Vendor | append to `description` |
| Method | **not in `ExpenseCreate`** — drop or add field on backend |
| Submit | `POST /expenses/` (NOT `/transactions/`) |

### 2.15 [Notifications.tsx](src/pages/Notifications.tsx)
**Conceptual mismatch.** Backend `notices` is owner-→-tenant announcements, frontend page shows owner's own activity feed. Two options:
- **Repurpose** to show notices the owner has SENT (`GET /notices/`)
- **Keep** as activity feed but build it client-side from tickets/transactions/tenants
- Add a separate "Send Notice" page/dialog → `POST /notices/`

### 2.16 Header notification bell
| UI | Endpoint |
|---|---|
| Bell with unread badge | derive from new tickets + unpaid alerts (no specific endpoint) |
| Dropdown list | merge of recent tickets + payments + system events |

### 2.17 [Profile.tsx](src/pages/Profile.tsx)
- Show user info → `GET /auth/me`
- Edit name/phone/email → **NO PATCH endpoint exists** — need backend addition

### 2.18 [Settings.tsx](src/pages/Settings.tsx)
- Currently no backend hooks; could later support notification prefs etc.

---

## 3. Data-model mismatches (what needs reconciliation)

### 3.1 Tenant ↔ User join
**Problem:** `TenantResponse` has `user_id` but no embedded user. To show name/email/phone in the tenants table, frontend must look up users.

**Options:**
- (A) **Backend addition:** include nested `user: UserResponse` in `TenantResponse` (best UX)
- (B) Frontend fetches users alongside tenants (no list-users endpoint exists; only `/auth/me`)
- (C) Add `GET /users/` endpoint or `GET /users/{id}` for owner-scoped lookups

**Recommended:** Add nested user in `TenantResponse`.

### 3.2 PG → owner contact
Backend doesn't store owner phone/email on PG (it's on User). Frontend's EditPG form has these. **Remove from PG form** OR add owner-phone field to PG.

### 3.3 Room model mismatch
| Frontend field | Backend equivalent | Action |
|---|---|---|
| `roomNumber` | `room_number` | rename in frontend |
| `floor` | none | **Add to backend** OR drop from frontend |
| `type` (single/double/shared) | `room_sharing` (free string) | reconcile naming |
| `rent` | `monthly_rent_per_head` | rename |
| `status` (vacant/occupied/maintenance/reserved) | derived from `current_occupancy < capacity` AND `is_active` | **No "maintenance" or "reserved" states** — add `status` enum to backend OR drop from frontend |
| `amenities` per room | only PG-level amenities exist | **Add room-level amenities** OR drop |
| `is_ac` | not in frontend rooms | add as a chip |
| `capacity` / `current_occupancy` | not directly shown | display in card |

### 3.4 Transactions vs Expenses confusion
Frontend mixes both into one table with a `type: 'expense'` row. Backend separates them entirely.

**Decision needed:**
- (A) Keep merged view: fetch `/transactions/?pg_id=` AND `/expenses/?pg_id=`, tag client-side, show in same table.
- (B) Split into two routes: `/transactions` (rent in) and `/expenses` (operating out).

(A) preserves current UX; (B) is cleaner backend-aligned.

### 3.5 Ticket categories
Frontend has `internet`, `carpenter`. Backend enum has `plumbing/electrical/furniture/cleaning/other`.

**Action:** Drop `internet`/`carpenter` from frontend (map both to `electrical`/`furniture`) OR ask backend to add them.

### 3.6 Ticket creator (`tenant_id`)
Backend requires `tenant_id` on `TicketCreate` but the PG owner is the one filing tickets in the current frontend.

**Options:**
- (A) Backend treats the logged-in user as `tenant_id` if they're a tenant; for owner-created tickets, default to a "system" tenant or make `tenant_id` optional.
- (B) Frontend requires owner to select which tenant the ticket is on behalf of (UX is awkward).

### 3.7 PG status / soft-delete
Backend has `is_active` (visible) and `is_deleted` (soft delete). Frontend exposes neither. Consider adding "Archive PG" action.

---

## 4. Things missing in backend (recommended additions)

| Feature | Why | Suggested endpoint/field |
|---|---|---|
| **List users / search users** | needed for AddTenantDrawer "existing user" path & owner views | `GET /users/?role=tenant&search=` |
| **Update user** (name/email/phone) | Profile page edit | `PATCH /users/{id}` |
| **Nested user in TenantResponse** | avoid N+1 in tenants table | embed `user` field |
| **ID document storage (Aadhar, PAN, photo, ID upload)** | tenant onboarding wizard collects these | new `tenant_documents` model + upload endpoint |
| **Guardian / emergency contact** | tenant onboarding wizard | `guardian_name`, `guardian_phone`, `guardian_relation` on `Tenant` |
| **Workplace** | tenant onboarding | `workplace`, `occupation` on `Tenant` |
| **Room.floor** | rooms shown by floor in frontend | add `floor: int` |
| **Room.status enum** | "maintenance"/"reserved" states | add `status: 'available'|'occupied'|'maintenance'|'reserved'` |
| **Room amenities** (separate from PG amenities) | per-room AC/balcony etc. | many-to-many room↔amenity, or `room.features: list[string]` |
| **Bed identifier** | BookRoomModal allows selecting Bed A/B/C | `bed_label` on Tenant or per-bed record |
| **Image upload** (PG photos, room photos, tickets) | UI shows photo upload boxes | `POST /uploads/` with multipart, returns URL |
| **Notification feed** for owner | distinct from notices (which are owner→tenant) | `GET /notifications/` returning system events for the logged-in owner |
| **Pagination** on list endpoints | scaling | `?page=&page_size=` on tenants, transactions, tickets |
| **Search** on lists | tenants table has search box | `?search=` query param |
| **Sort** on lists | sortable table columns | `?sort=field&order=asc|desc` |
| **Bulk operations** | bulk-add rooms when adding a PG | `POST /rooms/bulk` |
| **Receipt / SMS sending** | RecordPaymentModal has "Send Receipt" checkbox | `POST /billing/receipt/{transaction_id}` |
| **PG enum for type** | currently free string | enum: `'gents'|'ladies'|'coed'` |
| **Move-out flow** | PATCH set `move_out_date` + status | already supported via `TenantUpdate`; UI flow needed |

---

## 5. Suggested implementation phasing

### Phase 1 — Wire what already works (no backend changes needed)
1. Replace mock-fallback in `src/lib/api.js`: set `USE_MOCK = false` after pointing baseUrl at the deployed backend.
2. AuthPage → real `/auth/login` (form-urlencoded) and `/auth/register`. Add `role: 'owner'` to register payload.
3. PG facilities list/create/edit/delete via `/pg-facilities/*`. Drop `owner_phone`/`owner_email`/`total_rooms` from form.
4. Rooms list/create/edit via `/rooms/*` with `pg_id` filter. Reconcile field names (room_number, room_sharing, monthly_rent_per_head, capacity, current_occupancy, is_ac).
5. Tickets list (`/tickets/pg/{pg_id}`) + status updates via PATCH.
6. Transactions list + create payment via `/transactions/*`.
7. Expenses split out: `AddExpenseModal` → `POST /expenses/` (separate from transactions).

### Phase 2 — Tenant flow with user creation
1. AddTenantDrawer: 2-step submit — `POST /auth/register` → grab user_id → `POST /tenants/`.
2. Tenants table: client-side join with users via per-row `GET /auth/me`-style endpoint, OR cache user lookups.
3. Decide whether to push backend for nested user in `TenantResponse`.

### Phase 3 — Backend additions before going further
Block on backend team:
- `GET /users/` and `GET /users/{id}`
- `PATCH /users/{id}` for Profile edit
- Nested user in `TenantResponse`
- Image upload endpoint
- Pagination + search on lists
- Field additions: `Room.floor`, `Room.status`, `Tenant.guardian_*`, `Tenant.aadhar_no`, `Tenant.pan_no`, `Tenant.workplace`

### Phase 4 — New features once Phase 3 lands
- Notices (owner → tenant): new "Send Notice" UI, list view, target by PG/room/tenant.
- Billing dashboard: payment status overview, unpaid tenant list, "Send Reminder" action.
- Room expenses (split-bill): new UI for shared bills.
- Profile editing.
- Pagination on Tenants/Transactions/Tickets tables (replace current dynamic page-size with server pages).
- Image uploads.

---

## 6. Quick wiring checklist for `lib/api.js`

```js
// flip these two lines once backend additions land
const DEFAULT_API_BASE_URL = "https://pg-maintenance.onrender.com";
const USE_MOCK = false;
```

Also:
- Login uses **form-urlencoded** (`/auth/login`) — current `apiFormRequest` already handles this.
- All other endpoints use **JSON** with `Authorization: Bearer <token>`.
- Token lives in `localStorage` under `pg_manager_token` (already implemented).
- 401 currently falls back to mock — once `USE_MOCK = false`, 401 should redirect to `/auth`.

---

## 7. Open questions for you / the backend team

1. **Tenant creation:** does it accept an inline `UserCreate` object, or must we always 2-call (register then tenant)?
2. **Tickets:** can owners create tickets on behalf of tenants? If yes, make `tenant_id` optional or default it to current user.
3. **PG type:** should `type` be a string enum on backend? What values?
4. **Rooms:** can `floor` and `status` be added? Are room-level amenities planned?
5. **Tenant documents:** is Aadhar/PAN storage planned, or should we drop those steps?
6. **Search/pagination/sort:** are these on the roadmap or expected client-side?
7. **Owner notification feed (distinct from notices):** is this planned, or should we keep building it client-side from existing data?
8. **PG photos / room photos / ticket attachments:** is there or will there be an upload endpoint? S3? Cloudinary?
