# AOTF Admin Management System — Implementation Prompt

> **Project**: Art of Teaching Foundation (AOTF)  
> **Stack**: Next.js (App Router), TypeScript, MongoDB/Mongoose, Clerk (auth only)  
> **Scope**: Full admin RBAC system with invite flow, activity logging, and pay metrics  
> **Email**: Resend via `contact@aotf.in`  

---

## 1. Context & Architecture Decisions

### What this system is

AOTF is a single-tenant platform connecting guardians/tutors with teachers. This system manages **AOTF's own internal staff** (6–7 admins across different locations), not end users. It is NOT a multi-tenant SaaS — there is one AOTF instance.

### Auth split (critical)

| Concern | Owner |
|---|---|
| Identity, sessions, JWT, login/logout | **Clerk** |
| Who is an admin, their role, status | **MongoDB** (`AdminUser`) |
| What each role is allowed to do | **MongoDB** (`AdminRole`) |
| Activity tracking, diffs, pay metrics | **MongoDB** (`AdminActivityLog`) |
| Pending invites, tokens | **MongoDB** (`AdminInvite`) |

Clerk's `publicMetadata` on each user stores **only one field**: `{ aotfRole: "CRM" }` — a cached echo of their MongoDB role. This allows fast middleware checks without a DB round-trip on every request. **MongoDB is always the source of truth.** If they ever diverge, MongoDB wins.

### Do NOT use Clerk Organizations

Clerk Orgs is designed for multi-tenant SaaS where end users own separate workspaces. It adds abstraction overhead with no benefit here. All role/permission logic lives in MongoDB.

---

## 2. Role Hierarchy

```
FOUNDER        (level 0) — exactly 1, hardcoded — Soumyadip
  └── SUPER_ADMIN   (level 1) — 1 or more allowed — Poulomi + future
        ├── CRM     (level 2) — Customer Relationship Manager
        └── FRM     (level 2) — Faculty Relationship Manager
              └── [future roles at level 3+, data-driven]
```

### Hierarchy enforcement rules

- A user can only invite/terminate/change roles of users **strictly below** their own level.
- `FOUNDER` (level 0) can manage everyone including `SUPER_ADMIN`.
- `SUPER_ADMIN` (level 1) can manage `CRM`, `FRM`, and future level 2+ roles, but **not** other `SUPER_ADMIN`s.
- Only `FOUNDER` can assign or revoke `SUPER_ADMIN` status.
- `FOUNDER` count is strictly capped at 1. No API should ever allow creating a second `FOUNDER`.

---

## 3. Mongoose Models

Create all models in `src/models/admin/`. Each file exports a default Mongoose model with the schema and TypeScript interface.

### 3.1 `AdminRole` — role definitions and permission scopes

```ts
// src/models/admin/AdminRole.ts

interface IAdminRole {
  name: string                // "FOUNDER" | "SUPER_ADMIN" | "CRM" | "FRM"
  displayName: string         // "Customer Relationship Manager"
  level: number               // 0 = founder, 1 = superadmin, 2 = crm/frm
  permissions: string[]       // array of permission strings (see Section 5)
  isSystemRole: boolean       // true = cannot be deleted or renamed at runtime
  createdAt: Date
  updatedAt: Date
}
```

Index on `name` (unique).

---

### 3.2 `AdminUser` — core admin record

```ts
// src/models/admin/AdminUser.ts

interface IAdminUser {
  clerkUserId: string         // from Clerk, used as lookup key
  email: string
  name: string
  role: string                // references AdminRole.name
  status: 'INVITED' | 'ACTIVE' | 'SUSPENDED' | 'TERMINATED'
  invitedBy: ObjectId         // ref: AdminUser
  invitedAt: Date
  activatedAt?: Date
  terminatedAt?: Date
  terminatedBy?: ObjectId     // ref: AdminUser
  location: {
    city?: string
    timezone?: string         // IANA timezone string e.g. "Asia/Kolkata"
  }
  metadata?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}
```

Indexes:
- `clerkUserId` unique
- `role` (for aggregation queries)
- `status`

---

### 3.3 `AdminInvite` — token-based invite state

```ts
// src/models/admin/AdminInvite.ts

interface IAdminInvite {
  token: string               // UUID v4, used in invite URL
  email: string
  assignedRole: string        // role to assign on acceptance
  invitedBy: ObjectId         // ref: AdminUser
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED'
  expiresAt: Date             // createdAt + 72 hours
  acceptedAt?: Date
  createdAt: Date
}
```

Index on `token` (unique), `email`, `status`.

---

### 3.4 `AdminActivityLog` — full-diff audit trail

```ts
// src/models/admin/AdminActivityLog.ts

interface IAdminActivityLog {
  adminId: ObjectId           // ref: AdminUser
  adminRole: string           // snapshot of role at time of action
  action: string              // e.g. "tutor:add", "application:approve"
  module: 'CRM' | 'FRM' | 'COMMS' | 'CALENDAR' | 'LEDGER' | 'ADMIN_MGMT'
  targetType: string          // "Tutor" | "Candidate" | "AdminUser" | "CalendarEvent" | "LedgerEntry"
  targetId: ObjectId
  targetSnapshot?: unknown    // optional: human-readable label of target at time of action
  diff: {
    before: unknown           // document state before the action (null for creates)
    after: unknown            // document state after the action (null for deletes)
  }
  metadata?: {
    ipAddress?: string
    userAgent?: string
    [key: string]: unknown
  }
  createdAt: Date
}
```

Indexes:
- `{ adminId: 1, createdAt: -1 }` — for per-admin metrics queries
- `{ module: 1, createdAt: -1 }` — for per-module breakdowns
- `{ adminRole: 1, action: 1 }` — for pay calculation aggregations

---

## 4. Permission Strings

All permission strings follow the format `resource:action`. Define them as a typed const object in `src/lib/admin/permissions.ts` and export for use across the codebase.

```ts
export const PERMISSIONS = {
  // CRM module
  TUTOR_ADD:              'tutor:add',
  TUTOR_REMOVE:           'tutor:remove',
  CANDIDATE_ADD:          'candidate:add',
  CANDIDATE_REMOVE:       'candidate:remove',
  APPLICATION_APPROVE:    'application:approve',
  APPLICATION_REJECT:     'application:reject',

  // COMMS module
  COMMUNICATION_SEND:     'communication:send',    // WhatsApp or email

  // FRM module
  FACULTY_ADD:            'faculty:add',
  FACULTY_REMOVE:         'faculty:remove',
  FACULTY_APPROVE:        'faculty:approve',

  // CALENDAR module
  CALENDAR_CREATE:        'calendar:create',
  CALENDAR_EDIT:          'calendar:edit',

  // LEDGER module
  LEDGER_ENTRY:           'ledger:entry',

  // ADMIN_MGMT module — SuperAdmin + Founder only
  ADMIN_INVITE:           'admin:invite',
  ADMIN_TERMINATE:        'admin:terminate',
  ADMIN_ROLE_CHANGE:      'admin:role_change',
  ADMIN_VIEW_METRICS:     'admin:view_metrics',

  // Founder-only
  SUPERADMIN_MANAGE:      'superadmin:manage',
} as const

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS]
```

### Default permission matrix (seed data)

| Permission | FOUNDER | SUPER_ADMIN | CRM | FRM |
|---|:---:|:---:|:---:|:---:|
| `tutor:add` | ✅ | ✅ | ✅ | ❌ |
| `tutor:remove` | ✅ | ✅ | ✅ | ❌ |
| `candidate:add` | ✅ | ✅ | ✅ | ❌ |
| `candidate:remove` | ✅ | ✅ | ✅ | ❌ |
| `application:approve` | ✅ | ✅ | ✅ | ❌ |
| `application:reject` | ✅ | ✅ | ✅ | ❌ |
| `communication:send` | ✅ | ✅ | ✅ | ✅ |
| `faculty:add` | ✅ | ✅ | ❌ | ✅ |
| `faculty:remove` | ✅ | ✅ | ❌ | ✅ |
| `faculty:approve` | ✅ | ✅ | ❌ | ✅ |
| `calendar:create` | ✅ | ✅ | ✅ | ✅ |
| `calendar:edit` | ✅ | ✅ | ✅ | ✅ |
| `ledger:entry` | ✅ | ✅ | ❌ | ❌ |
| `admin:invite` | ✅ | ✅ | ❌ | ❌ |
| `admin:terminate` | ✅ | ✅ | ❌ | ❌ |
| `admin:role_change` | ✅ | ✅ | ❌ | ❌ |
| `admin:view_metrics` | ✅ | ✅ | ❌ | ❌ |
| `superadmin:manage` | ✅ | ❌ | ❌ | ❌ |

---

## 5. Seed Script

Create `src/scripts/seedAdminSystem.ts`. This script is **idempotent** — safe to run multiple times without duplicating data.

### What it must do

1. Upsert all 4 `AdminRole` documents (FOUNDER, SUPER_ADMIN, CRM, FRM) with their permission arrays and `isSystemRole: true`.
2. Upsert `AdminUser` for **Soumyadip** as FOUNDER — use his actual Clerk user ID, fetched via Clerk backend SDK or passed as an env var `FOUNDER_CLERK_USER_ID`.
3. Upsert `AdminUser` for **Poulomi** as SUPER_ADMIN — use `SUPERADMIN_CLERK_USER_ID` env var.
4. Patch Clerk `publicMetadata` for both users: `{ aotfRole: "FOUNDER" }` and `{ aotfRole: "SUPER_ADMIN" }`.
5. Log a summary of what was created vs. already existed.

Run via: `npx ts-node src/scripts/seedAdminSystem.ts`

---

## 6. RBAC Middleware

Create `src/lib/admin/requirePermission.ts`. This is a **Next.js App Router** compatible helper — it returns a function usable inside route handlers.

### Logic

```
1. Call auth() from @clerk/nextjs/server — get userId
2. Look up AdminUser where clerkUserId === userId
3. If not found or status !== 'ACTIVE' → return 403
4. Look up AdminRole where name === admin.role
5. Check that ALL required permission strings are in role.permissions
6. If check fails → return 403 with { error: 'Insufficient permissions', required: [...] }
7. If check passes → attach admin doc to request context and call next
```

### Usage pattern

```ts
// In a route handler:
export async function POST(req: Request) {
  const { admin, error } = await requirePermission('tutor:add')(req)
  if (error) return error   // already a NextResponse 403

  // proceed with handler logic
  // admin is the full AdminUser document
}
```

Also export a `getAdminFromRequest(req)` helper that just resolves the admin doc without permission checking, for use in pages that need admin identity but not gating.

---

## 7. Activity Logging

Create `src/lib/admin/logActivity.ts`.

### Interface

```ts
interface LogActivityParams {
  admin: IAdminUser
  action: string              // use PERMISSIONS constants
  module: IAdminActivityLog['module']
  targetType: string
  targetId: ObjectId
  before?: unknown
  after?: unknown
  metadata?: Record<string, unknown>
}

export async function logActivity(params: LogActivityParams): Promise<void>
```

### Rules

- Always fire after the primary DB write succeeds, never before.
- Use try/catch internally — a logging failure must never crash the main operation. Log the error to console but swallow it.
- Snapshot `admin.role` at call time — this preserves historical accuracy even if the admin's role changes later.
- `before` should be the full document state before mutation (fetched before the write). `after` should be the saved document state. For creates, `before` is `null`. For deletes, `after` is `null`.

### Integration requirement

Every API route that performs a mutation must call `logActivity` at the end. This is non-negotiable for pay metric accuracy. Add a comment `// ACTIVITY LOG` above each call so it's easy to audit.

---

## 8. Invite Flow

### 8.1 `POST /api/admin/invite`

**Permission required**: `admin:invite`

**Hierarchy check**: Inviter's role level must be strictly lower (numerically) than the assigned role's level. SUPER_ADMIN (level 1) cannot invite another SUPER_ADMIN (level 1). Only FOUNDER (level 0) can invite SUPER_ADMIN.

**Request body**:
```ts
{
  email: string
  assignedRole: string      // "CRM" | "FRM" | "SUPER_ADMIN" (founder only for last)
  name: string              // invitee's display name
}
```

**Steps**:
1. Validate request body.
2. Check no active `AdminUser` already exists with this email.
3. Check no `PENDING` `AdminInvite` already exists for this email.
4. Generate UUID token.
5. Create `AdminInvite` doc with `expiresAt = now + 72h`.
6. Send invite email via Resend from `contact@aotf.in` with the link: `https://aotf.in/admin/join?token=<uuid>`.
7. Log activity: action `admin:invite`, targetType `"AdminInvite"`.
8. Return `{ success: true, inviteId }`.

**Email template** (Resend): Include inviter's name, assigned role display name, the join link, and expiry time. Keep it clean and professional.

---

### 8.2 `GET /api/admin/join?token=<uuid>` — validate invite (public, no auth required)

**Steps**:
1. Look up `AdminInvite` by token.
2. If not found → 404.
3. If status !== `PENDING` → 410 Gone with reason (`ACCEPTED`, `EXPIRED`, `REVOKED`).
4. If `expiresAt < now` → update status to `EXPIRED` → return 410.
5. Return `{ email, assignedRole, inviterName, expiresAt }` — enough for the join page UI to display context.

---

### 8.3 `POST /api/admin/join` — complete onboarding after Clerk sign-up

This is called by the frontend **after** the user has completed Clerk sign-up/sign-in on the join page.

**Request body**:
```ts
{
  token: string
  clerkUserId: string       // from Clerk session after sign-up
}
```

**Steps**:
1. Re-validate token (same checks as GET above).
2. Confirm `clerkUserId` matches a real Clerk user (use Clerk backend SDK `clerkClient.users.getUser(clerkUserId)`).
3. Confirm Clerk user's email matches `AdminInvite.email`.
4. Create `AdminUser` doc with `status: 'ACTIVE'`, `activatedAt: now`, `role: invite.assignedRole`.
5. Patch Clerk user's `publicMetadata`: `{ aotfRole: invite.assignedRole }`.
6. Update `AdminInvite.status` to `ACCEPTED`, set `acceptedAt`.
7. Log activity: action `admin:role_change` (initial assignment), module `ADMIN_MGMT`.
8. Return `{ success: true }`. Frontend redirects to admin dashboard.

---

### 8.4 Join page UI

Create `src/app/admin/join/page.tsx`.

- On load, call `GET /api/admin/join?token=` — display invite context (role, inviter, expiry) or an error state.
- If valid: show a "Accept & Create Account" button that opens Clerk's `<SignUp>` component (or redirects to Clerk-hosted sign-up with return URL).
- After Clerk sign-up completes and session is established, automatically call `POST /api/admin/join` with the token and Clerk user ID.
- On success, redirect to `/admin/dashboard`.

---

## 9. Role Management APIs

### `PATCH /api/admin/users/:adminUserId/role`

**Permission required**: `admin:role_change`  
**Additional check**: Actor's level < target's current level AND actor's level < new role's level.

**Request body**: `{ newRole: string }`

**Steps**:
1. Fetch target `AdminUser`.
2. Hierarchy check (see above).
3. Special check: if `newRole === 'SUPER_ADMIN'`, actor must have `superadmin:manage` permission (FOUNDER only).
4. Update `AdminUser.role`.
5. Patch Clerk `publicMetadata` for target user: `{ aotfRole: newRole }`.
6. Log activity with full diff (`before: { role: oldRole }`, `after: { role: newRole }`).

---

### `POST /api/admin/users/:adminUserId/terminate`

**Permission required**: `admin:terminate`  
**Additional check**: Actor's level < target's level. SUPER_ADMIN cannot terminate another SUPER_ADMIN.

**Steps**:
1. Fetch target `AdminUser` — must be `ACTIVE` or `SUSPENDED`.
2. Hierarchy check.
3. Update `AdminUser.status` to `TERMINATED`, set `terminatedAt`, `terminatedBy`.
4. Revoke all active Clerk sessions for target user: `clerkClient.users.deleteUser` is too destructive — use `clerkClient.sessions.revokeSession` for all sessions, then update `publicMetadata: { aotfRole: null, terminated: true }`.
5. Revoke any `PENDING` invites sent by this admin.
6. Log activity: action `admin:terminate`, module `ADMIN_MGMT`.

---

### `GET /api/admin/users`

**Permission required**: `admin:view_metrics` (reuse this — both metrics and user listing need same gate)

Returns all `AdminUser` docs. Filter by status, role as query params. Populate `invitedBy` name. FOUNDER sees all. SUPER_ADMIN sees only level 2+ users.

---

## 10. Pay Metrics API

### `GET /api/admin/metrics`

**Permission required**: `admin:view_metrics`

**Query params**:
```
adminId?     — filter to one admin (FOUNDER/SUPERADMIN can query any; others get 403)
from         — ISO date string
to           — ISO date string
module?      — filter to one module
```

**Aggregation pipeline** (MongoDB):

```js
[
  { $match: { adminId, createdAt: { $gte: from, $lte: to }, ...(module && { module }) } },
  {
    $group: {
      _id: { module: '$module', action: '$action' },
      count: { $sum: 1 },
      lastPerformed: { $max: '$createdAt' }
    }
  },
  {
    $group: {
      _id: '$_id.module',
      actions: { $push: { action: '$_id.action', count: '$count', lastPerformed: '$lastPerformed' } },
      totalActions: { $sum: '$count' }
    }
  },
  { $sort: { _id: 1 } }
]
```

**Response shape**:
```ts
{
  adminId: string
  adminName: string
  adminRole: string
  period: { from: string, to: string }
  summary: {
    totalActions: number
    byModule: Array<{
      module: string
      totalActions: number
      actions: Array<{ action: string, count: number, lastPerformed: string }>
    }>
  }
}
```

FOUNDER sees metrics for any admin. SUPER_ADMIN sees metrics only for admins below their level. CRM/FRM cannot access this endpoint.

---

## 11. File & Folder Structure

```
src/
├── models/
│   └── admin/
│       ├── AdminRole.ts
│       ├── AdminUser.ts
│       ├── AdminInvite.ts
│       └── AdminActivityLog.ts
│
├── lib/
│   └── admin/
│       ├── permissions.ts        // PERMISSIONS const, Permission type
│       ├── requirePermission.ts  // RBAC middleware
│       ├── logActivity.ts        // activity log helper
│       └── hierarchyCheck.ts    // shared util: canActor(actor).manage(target)
│
├── app/
│   └── api/
│       └── admin/
│           ├── invite/
│           │   └── route.ts      // POST /api/admin/invite
│           ├── join/
│           │   └── route.ts      // GET + POST /api/admin/join
│           ├── users/
│           │   ├── route.ts      // GET /api/admin/users
│           │   └── [adminUserId]/
│           │       ├── role/
│           │       │   └── route.ts   // PATCH role
│           │       └── terminate/
│           │           └── route.ts   // POST terminate
│           └── metrics/
│               └── route.ts     // GET /api/admin/metrics
│
├── app/
│   └── admin/
│       └── join/
│           └── page.tsx          // invite acceptance page
│
└── scripts/
    └── seedAdminSystem.ts        // idempotent seed script
```

---

## 12. Environment Variables Required

```env
# Clerk
CLERK_SECRET_KEY=

# Seed script
FOUNDER_CLERK_USER_ID=          # Soumyadip's Clerk user ID
SUPERADMIN_CLERK_USER_ID=       # Poulomi's Clerk user ID

# MongoDB (already present in AOTF)
MONGODB_URI=

# Resend (already present in AOTF)
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=https://aotf.in
```

---

## 13. Future-Proofing Notes

- **New roles**: Insert a new `AdminRole` doc with the right `level` integer and permissions array. Zero code changes needed. Use levels with gaps (10, 20, 30) if you want insertion room later without re-seeding.
- **New permissions**: Add a string to the `PERMISSIONS` const and add it to the relevant role's `permissions` array in the DB.
- **Geo/location tracking**: `AdminUser.location.timezone` is already in the schema. Use it to add timezone-aware breakdowns to the metrics API later.
- **Multiple locations**: The metrics API's `adminId` filter already supports per-admin querying — perfect for a distributed team dashboard.
- **Suspension (not just termination)**: `AdminUser.status` already has `SUSPENDED`. Implement a `PATCH /api/admin/users/:id/suspend` endpoint that sets status to SUSPENDED and revokes Clerk sessions but doesn't mark `terminatedAt`, allowing reinstatement.
- **Audit log UI**: `AdminActivityLog` stores full diffs — a timeline view per admin is a straightforward read from this collection.
- **Pay calculation**: The metrics API returns raw counts per action. Apply a rate card (e.g. ₹X per `tutor:add`, ₹Y per `application:approve`) in a separate calculation layer outside this system — the data is already structured for it.

---

## 14. Implementation Order

Build in this exact sequence to avoid dependency issues:

1. **Models** — `AdminRole`, `AdminUser`, `AdminInvite`, `AdminActivityLog`
2. **`permissions.ts`** — permission const and types
3. **`hierarchyCheck.ts`** — shared actor/target level comparison util
4. **`requirePermission.ts`** — RBAC middleware
5. **`logActivity.ts`** — logging helper
6. **Seed script** — roles + Soumyadip + Poulomi
7. **Invite API** — `POST /api/admin/invite`
8. **Join API** — `GET` and `POST /api/admin/join`
9. **Join page** — `app/admin/join/page.tsx`
10. **Role change + terminate APIs**
11. **Users list API**
12. **Metrics API**
13. **Wire `logActivity` into all existing AOTF mutation routes** (calendar, ledger, etc.)

---

*Generated for AOTF — internal use only. Stack: Next.js App Router · TypeScript · MongoDB/Mongoose · Clerk · Resend*
