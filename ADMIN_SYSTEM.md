# AOTF Admin System Documentation

## Overview

The AOTF admin system provides a complete role-based access control (RBAC) system for managing the platform. It includes three admin roles with different permission levels, automated security features, and comprehensive audit logging.

## Admin Roles

### 1. Super Admin (`super_admin`)
- **Full system access**
- Can create, manage, and terminate all admins
- Can reset any admin's password
- Can unlock locked admin accounts
- Can change admin usernames and permissions
- Full access to all platform features
- Can view audit logs

### 2. Sub-Superadmin (`admin`)
- Can manage **support admins only** (not other sub-superadmins)
- Can view, edit permissions, and deactivate support admins
- **Cannot** create new admins
- **Cannot** reset passwords (superadmin only)
- Full access to content management (posts, jobs)
- All support permissions included
- Can view audit logs

### 3. Support (`moderator`)
- Handles customer enquiries and feedbacks
- Updates enquiry status
- Calls applicants/guardians for feedback and payments
- Handles customer issues
- **No** access to admin management
- **No** access to user management
- Limited to customer support features

## Setup Instructions

### 1. Environment Variables

Ensure these variables are set in your `.env.local`:

```bash
# Clerk Configuration
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# MongoDB
MONGODB_URI=mongodb://...

# Resend Email (for admin notifications)
RESEND_API_KEY=re_...
EMAIL_FROM="AOTF Admin <noreply@yourdomain.com>"

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Clerk Configuration

Your Clerk instance should have:
- ✅ **Username authentication** enabled
- ✅ **Password authentication** enabled
- ✅ **Email** enabled (for notifications)
- ✅ **Webhook** configured to point to `/api/v1/webhooks/clerk`

**Important:** No changes needed to current Clerk configuration. The same Clerk instance is used for both regular users and admins, differentiated by metadata.

### 3. Create Superadmin

Run the seeding script to create the initial superadmin:

```bash
# Option 1: Using tsx (recommended)
npm i -D tsx
npx tsx scripts/seed-superadmin.ts

# Option 2: Using ts-node
npm i -D ts-node
node --loader ts-node/esm scripts/seed-superadmin.ts
```

**Output will include:**
```
═══════════════════════════════════════════════════════
🎉 SUPERADMIN CREATED SUCCESSFULLY!
═══════════════════════════════════════════════════════

📧 Email:     aotf21@gmail.com
👤 Username:  superadmin
🔑 Password:  [Generated Password]

═══════════════════════════════════════════════════════
```

**⚠️ IMPORTANT:** Save the generated password immediately! It won't be shown again.

### 4. First Login

1. Navigate to `/admin/login`
2. Sign in with the superadmin credentials
3. Access the admin dashboard at `/admin`

## Features

### 🔐 Security Features

#### 1. Failed Login Protection
- After **5 failed login attempts**, admin accounts are automatically locked
- Locked admins cannot log in
- Only superadmin can unlock accounts
- Email notification sent when account is locked

#### 2. Forced Password Change
- New admins must change their temporary password on first login
- After unlock, admins must reset their password
- After superadmin resets password, admin must set a new one

#### 3. Account Lockout
Manual lockout by superadmin also available for security purposes

### 📧 Email Notifications

Admins receive emails for:
- **Account creation** (with temporary password)
- **Password reset** by superadmin
- **Account locked** (5 failed attempts)
- **Account unlocked** by superadmin

### 📊 Audit Logging

All admin actions are logged with:
- Admin who performed the action
- Action type (create, update, deactivate, etc.)
- Target (which admin/user was affected)
- Timestamp
- IP address and user agent
- Before/after changes for updates

View audit logs at `/api/v1/admin/audit-logs`

## API Endpoints

### Admin Management

```
POST   /api/v1/admin/admins              - Create new admin (superadmin only)
GET    /api/v1/admin/admins              - List all admins
GET    /api/v1/admin/admins/[id]         - Get admin details
PATCH  /api/v1/admin/admins/[id]         - Update admin permissions
POST   /api/v1/admin/admins/[id]/deactivate    - Deactivate admin
POST   /api/v1/admin/admins/[id]/reactivate    - Reactivate admin
POST   /api/v1/admin/admins/[id]/terminate     - Terminate admin (superadmin only)
POST   /api/v1/admin/admins/[id]/reset-password - Reset password (superadmin only)
POST   /api/v1/admin/admins/[id]/unlock        - Unlock account (superadmin only)
GET    /api/v1/admin/audit-logs          - Get audit logs
```

### Example: Create Admin

```typescript
POST /api/v1/admin/admins
Content-Type: application/json
Authorization: Bearer [Clerk token]

{
  "username": "johndoe",
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "moderator"  // or "admin"
}
```

Response:
```json
{
  "success": true,
  "admin": {
    "_id": "...",
    "username": "johndoe",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "moderator",
    "isActive": true,
    "createdAt": "2026-03-08T..."
  }
}
```

## Permission Matrix

| Permission | Super Admin | Sub-Superadmin | Support |
|-----------|-------------|----------------|---------|
| Manage Users (block/unblock) | ✅ | ❌ | ❌ |
| Create Posts (Tuition/Job) | ✅ | ✅ | ❌ |
| Edit Posts | ✅ | ✅ | ❌ |
| Delete Posts | ✅ | ✅ | ❌ |
| Handle Enquiries | ✅ | ✅ | ✅ |
| Handle Feedbacks | ✅ | ✅ | ✅ |
| Update Enquiry Status | ✅ | ✅ | ✅ |
| Call Applicants | ✅ | ✅ | ✅ |
| Process Refunds | ✅ | ❌ | ❌ |
| View Analytics | ✅ | ❌ | ❌ |
| Export Data | ✅ | ❌ | ❌ |
| **Admin Management** |  |  |  |
| Create Admins | ✅ | ❌ | ❌ |
| Edit Admins | ✅ | ✅ (support only) | ❌ |
| Deactivate Admins | ✅ | ✅ (support only) | ❌ |
| Terminate Admins | ✅ | ❌ | ❌ |
| Reset Passwords | ✅ | ❌ | ❌ |
| Unlock Accounts | ✅ | ❌ | ❌ |
| View Audit Logs | ✅ | ✅ | ❌ |

## Models

### Admin Model
```typescript
{
  clerkId: string;          // Clerk user ID
  username: string;         // Admin username (locked)
  email: string;            // Admin email (locked)
  name: string;             // Full name
  role: "super_admin" | "admin" | "moderator";
  permissions: {
    // Object with all permission flags
  };
  isActive: boolean;        // Active/deactivated
  isLocked: boolean;        // Locked due to failed attempts
  lockedAt: Date | null;
  failedLoginAttempts: number;
  lastFailedLoginAt: Date | null;
  requirePasswordChange: boolean;
  createdBy: ObjectId | null;
  terminatedBy: ObjectId | null;
  terminatedAt: Date | null;
}
```

### Login Attempt Model
```typescript
{
  clerkId: string;
  email: string;
  username: string;
  success: boolean;
  ipAddress: string;
  userAgent: string;
  failureReason: string | null;
  createdAt: Date;          // Auto-expires after 30 days
}
```

### Audit Log Model
```typescript
{
  adminId: ObjectId;        // Admin who performed action
  adminClerkId: string;
  adminUsername: string;
  action: string;           // e.g., "admin.created", "admin.password_reset"
  targetType: string;       // "Admin", "User", "Post", etc.
  targetId: string;
  targetIdentifier: string; // username, email, or readable identifier
  details: object;          // Action-specific details
  changes: object;          // Before/after for updates
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
}
```

## Database Collections

- `admins` - Admin users
- `loginattempts` - Login attempt history (auto-expires after 30 days)
- `auditlogs` - Admin action audit trail
- `users` - Regular users (separate from admins)

## Routes

### Public Routes
- `/admin/login` - Admin sign-in page
- `/admin/change-password` - Password change page (protected but accessible with auth)

### Protected Admin Routes
- `/admin` - Admin dashboard home
- `/admin/enquiries` - Enquiry management
- `/admin/feedbacks` - Feedback management
- `/admin/tuitions` - Tuition post management
- `/admin/jobs` - Job post management
- `/admin/users` - User management
- `/admin/settings` - Admin management & settings

## Middleware Protection

The `proxy.ts` file enforces:
1. Admin-only access to `/admin/*` routes
2. Checks for locked accounts → redirects to login with error
3. Checks for deactivated accounts → redirects to login with error
4. Forces password change → redirects to `/admin/change-password`
5. Prevents non-admins from accessing admin routes

## Troubleshooting

### Superadmin Already Exists
If you run the seeding script again:
```
⚠️  Superadmin already exists:
   Username: superadmin
   Email: aotf21@gmail.com
   ...
✨ Seeding skipped - superadmin already exists
```

### Account Locked
- Contact superadmin
- Superadmin uses unlock API endpoint or UI
- After unlock, you'll need to reset your password

### Cannot Create Admin
- Must be logged in as superadmin
- Check your role and permissions
- Verify Clerk API key is set correctly

### Email Not Sending
- Verify `RESEND_API_KEY` is set and valid
- Check `EMAIL_FROM` is configured
- Ensure From email is verified in Resend dashboard

## Next Steps

1. ✅ Run seeding script to create superadmin
2. ✅ Login at `/admin/login`
3. ✅ Create additional admins via API or build admin UI
4. 🔲 Build admin management UI in `/admin/settings`
5. 🔲 Integrate permission checks in existing admin pages
6. 🔲 Build audit log viewer UI
7. 🔲 Test all permission scenarios

## Notes

- Email and username are **locked** for admins (cannot be changed by self)
- Superadmin can change usernames via API
- All admin/user separation is done via `publicMetadata.isAdmin` flag
- Same Clerk instance for both users and admins (cost-effective)
- Webhooks automatically route to correct model based on metadata

## Support

For issues or questions:
1. Check audit logs for admin actions
2. Verify environment variables
3. Check Clerk dashboard for user status
4. Review proxy.ts logs for access denials
