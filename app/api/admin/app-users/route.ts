import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Admin from "@/lib/models/Admin";
import Profile from "@/lib/models/Profile";
import User from "@/lib/models/User";
import { isClerkAdmin } from "@/lib/migration/clerk-user-filters";
import { syncClerkAppUsers } from "@/lib/migration/sync-clerk-app-users";
import {
  createAppUser,
  type AdminCreateAppUserRole,
} from "@/lib/services/app-user.service";

type UserFilter = {
  role?: string;
  status?: string;
  search?: string;
  page?: string;
  limit?: string;
  bundle?: string;
  sync?: string;
};

type LeanUser = {
  _id: unknown;
  clerkId: string;
  username: string;
  role: string;
  status: string;
  onboardingCompleted: boolean;
  plan: unknown;
  createdAt: Date;
  updatedAt: Date;
};

const PAGE_SIZE = 10;

type AppUserDbRole = "teacher" | "teacher_candidate";

const roleMap: Record<string, AppUserDbRole> = {
  candidate: "teacher_candidate",
  teacher: "teacher",
};

function normalizeText(value?: string | null) {
  return value?.trim().toLowerCase() ?? "";
}

function toDbRole(role: string): AppUserDbRole {
  return roleMap[role] ?? (role as AppUserDbRole);
}

async function requireManageUsersAdmin(userId: string) {
  const { sessionClaims } = await auth();
  let metadata = sessionClaims?.publicMetadata as Record<string, unknown> | undefined;

  if (metadata?.isAdmin !== true) {
    try {
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(userId);
      metadata = clerkUser.publicMetadata as Record<string, unknown> | undefined;
    } catch {
      // Fall through to DB admin lookup.
    }
  }

  if (metadata?.isAdmin !== true) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  const currentAdmin = await Admin.findOne({ clerkId: userId });
  if (!currentAdmin || !currentAdmin.isActive) {
    return {
      error: NextResponse.json({ error: "Forbidden: admin not active" }, { status: 403 }),
    };
  }

  if (currentAdmin.role !== "super_admin" && !currentAdmin.permissions.canManageUsers) {
    return {
      error: NextResponse.json(
        { error: "You don't have permission to manage users" },
        { status: 403 },
      ),
    };
  }

  return { admin: currentAdmin };
}

function buildSummary(users: Array<{ role: string; status: string }>) {
  return {
    total: users.length,
    active: users.filter((user) => user.status === "active").length,
    blocked: users.filter((user) => user.status === "blocked").length,
    deleted: users.filter((user) => user.status === "deleted").length,
    teachers: users.filter((user) => user.role === "teacher").length,
    candidates: users.filter((user) => user.role === "teacher_candidate").length,
  };
}

async function getAdminClerkIds() {
  return new Set((await Admin.find({}).distinct("clerkId")).map(String));
}

function buildStatusQuery(status?: string) {
  const query: Record<string, unknown> = {};
  if (status && status !== "all") {
    query.status = status;
  }
  return query;
}

async function loadAppUsersForRole(
  dbRole: AppUserDbRole,
  statusQuery: Record<string, unknown>,
  adminClerkIds: Set<string>,
  search: string,
  options?: { sort?: boolean },
) {
  let query = User.find({ ...statusQuery, role: dbRole });
  if (options?.sort !== false) {
    query = query.sort({ createdAt: -1 });
  }

  const users = (await query.lean()) as LeanUser[];

  let appUsers = users.filter((user) => !adminClerkIds.has(String(user.clerkId)));

  if (!search) return appUsers;

  const clerkIdList = appUsers.map((user) => String(user.clerkId));
  const profiles = await Promise.all(
    clerkIdList.map((clerkId) => Profile.findOne({ clerkId }).lean()),
  );
  const profileByClerkId = new Map(
    profiles
      .filter((profile): profile is NonNullable<typeof profile> => profile !== null)
      .map((profile) => [String(profile.clerkId), profile]),
  );

  return appUsers.filter((user) => {
    const profileData = profileByClerkId.get(String(user.clerkId));
    return (
      normalizeText(user.username).includes(search) ||
      normalizeText(profileData?.displayName).includes(search) ||
      normalizeText(profileData?.phone).includes(search) ||
      normalizeText(profileData?.whatsapp).includes(search)
    );
  });
}

async function enrichUserPage(pageUsers: LeanUser[]) {
  const clerkIdList = pageUsers.map((user) => String(user.clerkId));
  const profiles = await Promise.all(
    clerkIdList.map((clerkId) => Profile.findOne({ clerkId }).lean()),
  );
  const profileByClerkId = new Map(
    profiles
      .filter((profile): profile is NonNullable<typeof profile> => profile !== null)
      .map((profile) => [String(profile.clerkId), profile]),
  );

  const client = await clerkClient();
  return (
    await Promise.all(
      pageUsers.map(async (user) => {
        const clerkIdStr = String(user.clerkId);
        const profileData = profileByClerkId.get(clerkIdStr) ?? null;

        let clerkData = null;
        try {
          clerkData = await client.users.getUser(clerkIdStr);
        } catch {
          // Fall back to MongoDB-only fields when Clerk is unavailable.
        }

        if (
          clerkData &&
          isClerkAdmin(clerkData.publicMetadata as Record<string, unknown>)
        ) {
          return null;
        }

        const email = clerkData?.primaryEmailAddress?.emailAddress ?? null;
        const displayName =
          profileData?.displayName ??
          clerkData?.fullName?.trim() ??
          clerkData?.username ??
          null;
        const avatarUrl = profileData?.avatarUrl ?? clerkData?.imageUrl ?? null;

        return {
          id: String(user._id),
          clerkId: clerkIdStr,
          username: user.username,
          name: displayName ?? user.username,
          email,
          phone: profileData?.phone ?? null,
          whatsapp: profileData?.whatsapp ?? null,
          role: user.role,
          status: user.status,
          onboardingCompleted: user.onboardingCompleted,
          plan: user.plan,
          avatarUrl,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          location: profileData?.location ?? null,
          qualification: profileData?.qualification ?? null,
          board: profileData?.board ?? null,
          profileUrl: `/u/${encodeURIComponent(user.username)}`,
          verifyUrl: `/verify/${encodeURIComponent(`AOTF-${user.role === "teacher_candidate" ? "C" : "T"}-${user.username.toUpperCase()}`)}`,
        };
      }),
    )
  ).filter((user): user is NonNullable<typeof user> => user !== null);
}

async function fetchRolePage(
  friendlyRole: "teacher" | "candidate",
  page: number,
  statusQuery: Record<string, unknown>,
  adminClerkIds: Set<string>,
  search: string,
) {
  const dbRole = toDbRole(friendlyRole);
  const matchedUsers = await loadAppUsersForRole(
    dbRole,
    statusQuery,
    adminClerkIds,
    search,
  );

  const limit = PAGE_SIZE;
  const total = matchedUsers.length;
  const totalPages = Math.max(Math.ceil(total / limit), 1);
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * limit;
  const pageUsers = matchedUsers.slice(start, start + limit);
  const users = await enrichUserPage(pageUsers);

  return {
    users,
    pagination: {
      page: safePage,
      limit,
      total,
      totalPages,
    },
  };
}

async function buildGlobalSummary(
  statusQuery: Record<string, unknown>,
  adminClerkIds: Set<string>,
  search: string,
) {
  const [teachers, candidates] = await Promise.all([
    loadAppUsersForRole("teacher", statusQuery, adminClerkIds, search, {
      sort: false,
    }),
    loadAppUsersForRole("teacher_candidate", statusQuery, adminClerkIds, search, {
      sort: false,
    }),
  ]);
  return buildSummary([...teachers, ...candidates]);
}

export async function POST(req: Request) {
  await dbConnect();

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const access = await requireManageUsersAdmin(userId);
  if (access.error) return access.error;

  const body = (await req.json().catch(() => ({}))) as {
    name?: string;
    email?: string;
    phone?: string;
    role?: AdminCreateAppUserRole;
  };

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const phone = body.phone?.trim() ?? "";
  const role = body.role ?? "teacher";

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }
  if (!phone) {
    return NextResponse.json({ error: "Phone is required" }, { status: 400 });
  }
  if (role !== "teacher" && role !== "candidate") {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const result = await createAppUser({ name, email, phone, role });
  if (!result.success) {
    const status = result.code === "duplicate_email" ? 409 : 400;
    return NextResponse.json({ error: result.error, code: result.code }, { status });
  }

  return NextResponse.json({ ok: true, user: result }, { status: 201 });
}

export async function GET(req: Request) {
  await dbConnect();

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const access = await requireManageUsersAdmin(userId);
  if (access.error) return access.error;

  const { searchParams } = new URL(req.url);
  const filters: UserFilter = {
    role: searchParams.get("role") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    search: searchParams.get("search") ?? undefined,
    page: searchParams.get("page") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
    bundle: searchParams.get("bundle") ?? undefined,
    sync: searchParams.get("sync") ?? undefined,
  };

  let syncResult = null;
  if (filters.sync === "1") {
    try {
      syncResult = await syncClerkAppUsers();
    } catch (err) {
      console.error("[app-users] Clerk sync failed:", err);
    }
  }

  const adminClerkIds = await getAdminClerkIds();
  const statusQuery = buildStatusQuery(filters.status);
  const search = normalizeText(filters.search);
  const summary = await buildGlobalSummary(statusQuery, adminClerkIds, search);

  if (filters.bundle === "1") {
    const [teacherPage, candidatePage] = await Promise.all([
      fetchRolePage("teacher", 1, statusQuery, adminClerkIds, search),
      fetchRolePage("candidate", 1, statusQuery, adminClerkIds, search),
    ]);

    return NextResponse.json({
      summary,
      byRole: {
        teacher: teacherPage,
        candidate: candidatePage,
      },
      sync: syncResult,
    });
  }

  const friendlyRole =
    filters.role === "candidate" ? "candidate" : "teacher";
  const page = Math.max(Number(filters.page ?? 1) || 1, 1);
  const rolePage = await fetchRolePage(
    friendlyRole,
    page,
    statusQuery,
    adminClerkIds,
    search,
  );

  return NextResponse.json({
    users: rolePage.users,
    summary,
    pagination: rolePage.pagination,
    sync: syncResult,
  });
}
