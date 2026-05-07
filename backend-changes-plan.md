# Backend Changes Plan — driven by frontend requirements

> Working tree: `d:/pg-maintenance` (cloned from `github.com/PandyaYog/pg-maintenance`)
> Frontend: `d:/PG`
> Drafted: 2026-05-07

## A. Backend architecture (preserve)

```
app/
├── api/
│   ├── deps.py                  # get_db(), get_current_user()
│   └── v1/
│       ├── api.py               # APIRouter aggregator
│       └── endpoints/<domain>.py
├── core/
│   ├── config.py                # Settings (pydantic-settings)
│   ├── db.py                    # SQLAlchemy engine + SessionLocal
│   └── security.py              # JWT + bcrypt
├── models/<domain>.py           # SQLAlchemy Mapped declarative
├── schemas/<domain>.py          # Pydantic v2
├── services/<domain>.py         # Business logic (Service class with @staticmethod)
└── utils/
alembic/
├── env.py                       # imports app.models.Base + settings.DATABASE_URL
└── versions/                    # 13 migrations so far
main.py                          # FastAPI app + CORS + SessionMiddleware
```

**Conventions to follow:**
- One Service class per domain, methods are `@staticmethod`, take `db: Session` first.
- Router methods always have `current_user: User = Depends(deps.get_current_user)`.
- Owner-scoped queries always join `pg_facilities` and check `owner_id`.
- Soft delete via `is_deleted = True` flag; queries always filter `is_deleted == False`.
- Schemas: `XBase` → `XCreate(XBase)` / `XUpdate(BaseModel, all-optional)` / `XResponse(XBase + ids/timestamps + ConfigDict(from_attributes=True))`.

---

## B. Backend changes — what needs to be added/modified

### B.1 — New: Users domain (CRUD beyond `/auth`)

**Why:** frontend Tenants table needs name/email/phone (which live on User), tenant lookup, Profile edit.

**Files to add:**
- `app/api/v1/endpoints/user.py` (new)
- `app/services/user.py` — extend (currently has only `get_user_by_email`, `create_user`)
- `app/schemas/user.py` — add `UserUpdate`

**New endpoints:**
| Method | Path | Body | Returns | Access |
|---|---|---|---|---|
| GET | `/api/v1/users/` | — | `UserResponse[]` | owner only — list owner's tenants' users |
| GET | `/api/v1/users/{id}` | — | `UserResponse` | self OR owner of a PG the user is in |
| PATCH | `/api/v1/users/me` | `UserUpdate` | `UserResponse` | self only |
| PATCH | `/api/v1/users/{id}` | `UserUpdate` | `UserResponse` | self only |

**`UserUpdate` schema:**
```python
class UserUpdate(BaseSchema):
    full_name: str | None = None
    phone_number: str | None = None
    profile_picture_url: str | None = None
```

Register in `app/api/v1/api.py`: `api_router.include_router(user.router, prefix="/users", tags=["users"])`.

---

### B.2 — Tenant: nested user + onboarding fields

**Why:** frontend `Tenants.tsx` needs name/email/phone; `AddTenantDrawer` collects guardian info, ID proofs, workplace.

**Migration: add columns to `tenants` table:**

| Column | Type | Nullable | Reason |
|---|---|---|---|
| `aadhar_no` | `String(12)` | yes | AddTenantDrawer step 2 |
| `pan_no` | `String(10)` | yes | AddTenantDrawer step 2 |
| `id_proof_url` | `String` | yes | uploaded ID document |
| `guardian_name` | `String(100)` | yes | AddTenantDrawer step 3 |
| `guardian_phone` | `String(20)` | yes | AddTenantDrawer step 3 |
| `guardian_relation` | `String(20)` | yes | AddTenantDrawer step 3 |
| `workplace` | `String(200)` | yes | AddTenantDrawer step 4 |
| `occupation` | `String(100)` | yes | optional |
| `emergency_contact_name` | `String(100)` | yes | derived from guardian if not set |
| `emergency_contact_phone` | `String(20)` | yes | derived from guardian if not set |

**Schema: `TenantResponse` to embed the user:**

```python
class TenantResponse(TenantBase):
    id: uuid.UUID
    is_deleted: bool
    created_at: datetime
    updated_at: datetime
    # NEW
    aadhar_no: str | None = None
    pan_no: str | None = None
    id_proof_url: str | None = None
    guardian_name: str | None = None
    guardian_phone: str | None = None
    guardian_relation: str | None = None
    workplace: str | None = None
    occupation: str | None = None
    user: UserResponse | None = None     # nested via SQLAlchemy joinedload

    model_config = ConfigDict(from_attributes=True)
```

**Service change (`TenantService.get_tenants`, `get_tenant_by_id`):** add `joinedload(Tenant.user)` so SQLAlchemy populates `tenant.user` automatically. Also add a `user` relationship on the Tenant model:

```python
# in models/tenant.py
from sqlalchemy.orm import relationship
class Tenant(Base):
    ...
    user: Mapped["User"] = relationship("User", lazy="joined")
```

---

### B.3 — Tenant onboarding: combined create flow

**Why:** `AddTenantDrawer` collects user info (name, email, phone) AND tenant info (room, rent, deposit, ID proofs) in one wizard. Frontend would otherwise need 2 sequential POSTs with brittle error handling.

**Add new endpoint:**

| Method | Path | Body | Returns |
|---|---|---|---|
| POST | `/api/v1/tenants/onboard` | `TenantOnboard` | `TenantResponse` |

**New schema `TenantOnboard`:**
```python
class TenantOnboardUser(BaseSchema):
    email: EmailStr
    full_name: str
    phone_number: str | None = None
    password: str = Field(default="changeme123", min_length=6)  # owner sets temp password

class TenantOnboard(BaseSchema):
    user: TenantOnboardUser
    pg_id: uuid.UUID
    room_id: uuid.UUID | None = None
    move_in_date: date
    monthly_rent: float = Field(..., ge=0)
    security_deposit: float = Field(..., ge=0)
    aadhar_no: str | None = None
    pan_no: str | None = None
    id_proof_url: str | None = None
    guardian_name: str | None = None
    guardian_phone: str | None = None
    guardian_relation: str | None = None
    workplace: str | None = None
```

Service method `TenantService.onboard_tenant` does it transactionally: register user (role=tenant) → create tenant linked to that user.

---

### B.4 — Room: floor + status enum + amenities

**Why:** frontend Rooms.tsx has `floor`, `type` (single/double/shared), `status` (vacant/occupied/maintenance/reserved), `amenities[]`. Backend has only `room_sharing`, `is_ac`, `capacity`, `current_occupancy`, `is_active`.

**Migration: add columns to `rooms`:**

| Column | Type | Nullable | Default | Reason |
|---|---|---|---|---|
| `floor` | `Integer` | yes | — | Rooms.tsx shows "Floor X" |
| `status` | `String(20)` | no | `"available"` | `'available'` / `'occupied'` / `'maintenance'` / `'reserved'` (derived from current_occupancy can stay alongside) |
| `notes` | `Text` | yes | — | optional |

**New many-to-many `room_amenities`** — like `pg_amenities`:

```python
class RoomAmenity(Base):
    __tablename__ = "room_amenities"
    room_id: Mapped[UUID] = mapped_column(ForeignKey("rooms.id", ondelete="CASCADE"), primary_key=True)
    amenity_id: Mapped[UUID] = mapped_column(ForeignKey("amenities.id", ondelete="CASCADE"), primary_key=True)
```

Plus:
```python
class Room(Base):
    ...
    amenities: Mapped[list] = relationship("Amenity", secondary="room_amenities", lazy="selectin")
```

**Updated schemas (`RoomBase`, `RoomCreate`, `RoomUpdate`, `RoomResponse`):**
```python
class RoomBase(BaseModel):
    pg_id: uuid.UUID
    room_number: str = Field(..., min_length=1, max_length=20)
    room_sharing: str
    is_ac: bool = False
    floor: int | None = Field(None, ge=0, le=50)        # NEW
    status: str = Field("available", pattern="^(available|occupied|maintenance|reserved)$")  # NEW
    capacity: int = Field(..., ge=1, le=10)
    current_occupancy: int = Field(0, ge=0)
    monthly_rent_per_head: float = Field(..., ge=0)
    notes: str | None = None  # NEW
    is_active: bool = True
```

**Service auto-update for `status`:** in `TenantService.create_tenant/update/delete`, after changing `current_occupancy`, set `room.status = 'occupied' if current >= capacity else 'available'`. But preserve manually-set `'maintenance'` / `'reserved'` (don't overwrite).

**New endpoints (mirror amenity pattern):**

| Method | Path | Body | Returns |
|---|---|---|---|
| POST | `/api/v1/amenities/room/{room_id}` | `{amenity_id}` | `RoomResponse` |
| DELETE | `/api/v1/amenities/room/{room_id}/{amenity_id}` | — | — |

---

### B.5 — Tickets: allow owner-created tickets, expand categories

**Why:** Owner files tickets in current frontend (no tenant flow built). Categories `internet`, `carpenter` referenced in NewTicketModal don't exist in backend enum.

**Migration:** rename column `tenant_id` to `created_by_tenant_id` (or add `created_by_user_id: UUID` and make `tenant_id` optional). Simplest: **make `tenant_id` nullable**.

```python
# models/maintenance_ticket.py
tenant_id: Mapped[uuid.UUID | None] = mapped_column(
    ForeignKey("tenants.id", ondelete="SET NULL"), nullable=True
)
created_by_user_id: Mapped[uuid.UUID] = mapped_column(  # NEW
    ForeignKey("users.id", ondelete="SET NULL"), nullable=True
)
```

**Schema: `TicketCategory` enum extension:**
```python
class TicketCategory(str, Enum):
    PLUMBING = "plumbing"
    ELECTRICAL = "electrical"
    FURNITURE = "furniture"
    CLEANING = "cleaning"
    INTERNET = "internet"     # NEW
    CARPENTRY = "carpentry"   # NEW (renamed from frontend's "carpenter")
    APPLIANCE = "appliance"   # NEW
    OTHER = "other"
```

**Service / endpoint update:**
- Drop the `if current_user.role != "tenant"` gate on `create_ticket`. Allow owners and tenants both. If owner creates, `tenant_id` may be None.
- Add `GET /tickets/` (list-all-for-current-user-as-owner) returning all tickets across owner's PGs.

---

### B.6 — Transactions: stricter typing

**Why:** frontend uses transaction `type` for rent/deposit only. Mixing in "expense" rows is wrong (those go to `/expenses/`).

**Schema: enum on `type`:**
```python
class TransactionType(str, Enum):
    RENT = "rent"
    DEPOSIT = "deposit"
    UTILITY = "utility"
    FINE = "fine"
    FOOD = "food"
    REFUND = "refund"
    OTHER = "other"

class TransactionStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"           # frontend uses "paid", backend used "completed". Standardize on "paid"
    FAILED = "failed"
    CANCELLED = "cancelled"

class PaymentMethod(str, Enum):
    UPI = "upi"
    CASH = "cash"
    BANK = "bank"
    CARD = "card"
    CHEQUE = "cheque"
```

**Migration / data migration note:** existing transactions with `status='completed'` become `'paid'`. Either rename in a migration, or keep both as accepted values for backward compat (recommend: rename).

**Add reference field for UPI/UTR:**
```python
# models/transaction.py
reference_number: Mapped[str | None] = mapped_column(String, nullable=True)  # NEW
```
(Frontend RecordPaymentModal has "Reference No" input.)

---

### B.7 — Expenses: enum + payment_method

**Why:** frontend AddExpenseModal has Method (UPI/Bank/Cash/Card) and a Vendor field — neither exists on `Expense`.

**Migration: add columns:**
```python
# models/expense.py
payment_method: Mapped[str | None] = mapped_column(String, nullable=True)  # NEW
vendor: Mapped[str | None] = mapped_column(String, nullable=True)         # NEW
```

**Schema:** add to `ExpenseBase` etc. Add enum for category:
```python
class ExpenseCategory(str, Enum):
    ELECTRICITY = "electricity"
    WATER = "water"
    INTERNET = "internet"
    MAINTENANCE = "maintenance"
    STAFF = "staff"
    SUPPLIES = "supplies"
    REPAIR = "repair"
    OTHER = "other"
```

---

### B.8 — File uploads (NEW domain)

**Why:** frontend has multiple "Upload" affordances (PG photos, room photos, profile picture, ticket photos, ID proof, receipts). All currently dead.

**Approach: simple local-disk MVP**, can swap to S3 later. Use FastAPI's `UploadFile`, save under `uploads/<owner_id>/<uuid>.ext`, expose at `/uploads/<filename>` static mount.

**Files to add:**
- `app/api/v1/endpoints/upload.py`
- `app/services/upload.py`

**Endpoints:**
| Method | Path | Body | Returns |
|---|---|---|---|
| POST | `/api/v1/uploads/` | `multipart/form-data: file, kind=("profile"\|"pg"\|"room"\|"ticket"\|"id_proof"\|"receipt")` | `{url: string, filename: string}` |
| DELETE | `/api/v1/uploads/{filename}` | — | — |

Mount static dir in `main.py`:
```python
from fastapi.staticfiles import StaticFiles
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
```

Add `python-multipart` to requirements (already present, v0.0.26 ✓).

---

### B.9 — Owner notification feed (NEW domain)

**Why:** frontend Header bell + Notifications.tsx show events to the owner (new tickets, payments, etc.) — distinct from `/notices/` which is owner→tenant.

**New model `Notification`:**
```python
# models/notification.py
class Notification(Base):
    __tablename__ = "notifications"
    id: Mapped[UUID] = ...
    user_id: Mapped[UUID] = ForeignKey("users.id", ondelete="CASCADE")  # recipient
    title: Mapped[str]
    body: Mapped[str | None]
    # 'ticket', 'payment', 'tenant', 'system'
    kind: Mapped[str]
    # link to source entity
    related_entity_type: Mapped[str | None]
    related_entity_id: Mapped[UUID | None]
    is_read: Mapped[bool] = default=False
    created_at, updated_at
```

**Endpoints:**
| Method | Path | Returns |
|---|---|---|
| GET | `/api/v1/notifications/` | `NotificationResponse[]` (current user's) |
| GET | `/api/v1/notifications/unread-count` | `{count: int}` |
| PATCH | `/api/v1/notifications/{id}/read` | mark read |
| PATCH | `/api/v1/notifications/read-all` | mark all read |
| DELETE | `/api/v1/notifications/{id}` | — |

**Auto-emit notifications** from existing services (in same DB transaction):
- `MaintenanceTicketService.create_ticket` → emit notification to PG owner (`kind='ticket'`).
- `TransactionService.create_transaction` (status=paid) → emit notification to owner.
- `TenantService.create_tenant` → emit notification to owner.

Helper: `app/services/notification.py` with `NotificationService.emit(db, user_id, kind, title, body, related_*)`.

---

### B.10 — Pagination + search + sort

**Why:** frontend tables (Tenants, Transactions, Tickets) will be paginated server-side once data scales. Frontend already has a `useTablePageSize` hook.

**Add reusable schema:**
```python
# schemas/pagination.py
from typing import Generic, TypeVar
T = TypeVar("T")

class Page(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    page_size: int
    total_pages: int
```

**Update list endpoints** (`tenants`, `transactions`, `expenses`, `tickets/pg`, `rooms`) to accept `?page=1&page_size=20&search=&sort=field&order=asc`. Return `Page[XResponse]` instead of bare list.

**Phasing note:** breaking change. Either keep old endpoints returning `list[X]` AND add `/paginated` variants, OR ship new schema and update frontend together. Recommend the latter since we're updating both.

---

### B.11 — PG type enum

**Why:** PG `type` is currently free string. Frontend constrains to Boys/Girls/Coed/Mixed.

**Schema:**
```python
class PGType(str, Enum):
    GENTS = "gents"
    LADIES = "ladies"
    COED = "coed"

class PGFacilityBase(BaseModel):
    ...
    type: PGType
    ...
```

(Frontend should map `Boys → gents`, `Girls → ladies`, `Mixed/Coed → coed` and stop using "Mixed".)

---

### B.12 — Bed identifier (optional)

Frontend BookRoomModal has a "Bed A/B/C" select that has no backend equivalent. Two options:
- **(A)** Drop "Bed" from frontend (capacity tracks count, not identity).
- **(B)** Add `bed_label` column to `tenants` table.

Recommend (A) for v1 — simpler. If later needed, add (B).

---

## C. Frontend changes

### C.1 — Split Transactions into 2 pages

**New file:** `src/pages/Expenses.tsx` (copy structure from Transactions.tsx, point at `/api/v1/expenses/`).

**Update Transactions.tsx:**
- Remove "Add Expense" button (move to Expenses page)
- Remove `expense` from type filter
- Stats cards: Total Collected (paid this month), Pending Dues (count + sum), This Month (sum)
- Type column: rent, deposit, utility, fine, food, refund

**Expenses.tsx:**
- "Add Expense" button → opens `AddExpenseModal`
- Stats cards: Total Expenses MTD, By Category (top 3), Last Month Comparison
- Columns: Vendor, Category, Amount, Date, Method, Description

**Sidebar.tsx:** add "Expenses" route under MANAGE section.

### C.2 — Wire `lib/api.js` to real backend

```js
const DEFAULT_API_BASE_URL = "https://pg-maintenance.onrender.com";
const USE_MOCK = false;
```

Replace mock-fallback with proper 401 redirect to `/auth`.

### C.3 — Page-by-page wiring

| Page | Action |
|---|---|
| AuthPage | Already form-urlencoded for login. Add `role: 'owner'` in register payload. |
| Dashboard | Replace mock stats with real: `/pg-facilities/` + selected-PG `/tenants/` + `/rooms/` + `/tickets/pg/{id}` + `/billing/status/{id}` |
| MyPGs | Use `/pg-facilities/`. Tenant/room counts via aggregate (need new `/pg-facilities/{id}/stats` endpoint OR client-side N+1) |
| AddPG, EditPG | Use `PGFacilityCreate/Update`. Drop `owner_phone`/`owner_email`/`total_rooms` (move to `/users/me`). Fetch amenities from `/amenities/` and post links via `/amenities/pg/{id}`. |
| Tenants | Use `/tenants/?pg_id=` (returns nested `user` after B.2). |
| AddTenantDrawer | Submit to `/tenants/onboard` (after B.3). |
| Rooms | Use `/rooms/?pg_id=`. Adjust to use `room_sharing`, `monthly_rent_per_head`, `floor`, `status`, `is_ac`. Fetch room amenities via `/amenities/room/{id}`. |
| BookRoomModal | `PATCH /tenants/{id}` (assign room) or trigger `/tenants/onboard` for new tenant. Drop "Bed select" (per B.12). |
| RoomDetailsModal | Use `/rooms/{id}` + `/tenants/?pg_id=` filter by `room_id`. Tenant `user` info already nested. |
| Maintenance | Use `/tickets/pg/{pg_id}`. Drop tenant-only restriction (per B.5). |
| NewTicketModal | `POST /tickets/` from owner perspective. New categories work after B.5. |
| Transactions | `/transactions/?pg_id=`. Keep type filter to rent/deposit/utility/fine/food. |
| Expenses (new) | `/expenses/?pg_id=`. |
| RecordPaymentModal | `POST /transactions/` with `status='paid'`. Send `reference_number`. |
| AddExpenseModal | `POST /expenses/` with `payment_method`, `vendor`. |
| Notifications | `GET /notifications/` (after B.9). |
| Header bell | `GET /notifications/unread-count` polling or via WebSocket later. |
| Profile | `GET /auth/me` + `PATCH /users/me` (after B.1). |

### C.4 — Add upload affordances

Once B.8 is in place:
- AddPG / EditPG: PG photo upload field.
- AddTenantDrawer step 1: profile photo upload → `kind=profile` → store URL in `User.profile_picture_url` (need `PATCH /users/{id}`).
- AddTenantDrawer step 2: ID proof upload → `kind=id_proof` → store URL in `Tenant.id_proof_url`.
- NewTicketModal: photo attachment → `kind=ticket` → store URL on a future `Ticket.photo_urls[]` (TBD).
- RoomDetailsModal: room photos.

---

## D. Phasing strategy

### Phase 0 — Frontend split (no backend dependency)
1. Create `src/pages/Expenses.tsx`
2. Update `Transactions.tsx` (remove expense)
3. Add Expenses route in Sidebar + App.tsx

### Phase 1 — Backend additions: Users domain + Tenant nested user
1. B.1 — Users CRUD
2. B.2 — Tenant onboarding fields + nested user

### Phase 2 — Tenant onboarding flow
3. B.3 — `POST /tenants/onboard`

### Phase 3 — Room model + ticket/expense/transaction enrichment
4. B.4 — Room floor/status/amenities
5. B.5 — Ticket category expansion + owner can create
6. B.6 — Transaction enums + reference_number
7. B.7 — Expense payment_method + vendor + category enum
8. B.11 — PG type enum

### Phase 4 — Uploads + Notifications
9. B.8 — File upload endpoint
10. B.9 — Notification model + auto-emit + endpoints

### Phase 5 — Pagination
11. B.10 — Page schema + update list endpoints + frontend pages

### Phase 6 — Wire frontend to real backend
12. C.2 — Switch base URL + USE_MOCK=false
13. C.3 — Page-by-page wiring

### Phase 7 — Verify
14. Run backend locally (`docker-compose up db && alembic upgrade head && uvicorn main:app --reload`)
15. Run frontend (`npm run dev`)
16. Smoke test every flow

---

## E. Risk register

| Risk | Mitigation |
|---|---|
| Dropping "Mixed" PG type breaks existing rows in DB | Migration data-fix: `UPDATE pg_facilities SET type='coed' WHERE type='Mixed'` |
| `transaction.status='completed'` rename to `'paid'` | Migration: `UPDATE transactions SET status='paid' WHERE status='completed'` |
| Frontend assumes endpoints return bare arrays; pagination breaks them | Phase 5 ships frontend updates simultaneously |
| File upload local-disk doesn't work on Render's ephemeral filesystem | Use Render persistent disk OR plan S3 swap before deploy |
| Backend deployed at onrender — local changes not auto-deployed | User must `git push` after I commit locally; deploy via Render's auto-deploy |
| Adding non-null columns without defaults on existing tables breaks migration | All new columns set `nullable=True` OR provide `server_default` |
| Pydantic v2 nested `UserResponse` in `TenantResponse` — circular import risk | Use forward-ref + `model_rebuild()` like `PGFacilityResponse` does for amenities |
| Existing tickets have `tenant_id` set; making nullable is fine, but service queries must guard against None | Update queries; preserve back-compat by treating None as "owner-filed" |

---

## F. Open questions / decisions needed from you

1. **Backend deploy target:** the live URL is `pg-maintenance.onrender.com`. Should I push my changes to a new branch so you can review on GitHub and merge, or just commit locally and you handle deploy?
2. **Bed identifier:** drop from BookRoomModal (recommended) or add `bed_label` to backend?
3. **PG type values:** OK with just `gents | ladies | coed` (drop "Mixed"; map "Mixed" → "coed" in migration)?
4. **Transaction status:** rename `'completed'` → `'paid'` (cleaner, matches frontend) or keep both?
5. **File uploads MVP:** local-disk under `uploads/` for now (won't survive Render redeploys) vs immediately wire S3?
6. **Pagination:** ship as breaking change in Phase 5 or keep old list endpoints alongside new paginated ones?
7. **Tenant password during onboarding:** owner sets a default password and tenant resets later, OR send invite email? For MVP recommend default-password approach.
