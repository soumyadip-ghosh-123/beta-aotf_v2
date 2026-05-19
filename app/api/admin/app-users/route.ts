import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Admin from "@/lib/models/Admin";
import Profile from "@/lib/models/Profile";
import User from "@/lib/models/User";

type UserFilter = {
  role?: string;
  status?: string;
  search?: string;
  limit?: string;
};

function normalizeText(value?: string | null) {
  return value?.trim().toLowerCase() ?? "";
}

export async function GET(req: Request) {
  await dbConnect();

  const { userId, sessionClaims } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let metadata = sessionClaims?.publicMetadata as Record<string, unknown> | undefined;
  if (metadata?.isAdmin !== true) {
    try {
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(userId);
      metadata = clerkUser.publicMetadata as Record<string, unknown> | undefined;
    } catch {
      // Ignore and fall back to DB lookup below.
    }
  }

  if (metadata?.isAdmin !== true) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const currentAdmin = await Admin.findOne({ clerkId: userId });
  if (!currentAdmin || !currentAdmin.isActive) {
    return NextResponse.json({ error: "Forbidden: admin not active" }, { status: 403 });
  }

  if (currentAdmin.role !== "super_admin" && !currentAdmin.permissions.canManageUsers) {
    return NextResponse.json(
      { error: "You don't have permission to view users" },
      { status: 403 },
    );
  }

  const { searchParams } = new URL(req.url);
  const filters: UserFilter = {
    role: searchParams.get("role") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    search: searchParams.get("search") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
  };

  // Map friendly role names sent by the frontend to the values stored in the DB.
  const roleMap: Record<string, string> = {
    candidate: "teacher_candidate",
    teacher: "teacher",
  };

  const query: Record<string, unknown> = {};
  if (filters.role && filters.role !== "all") {
    query.role = roleMap[filters.role] ?? filters.role;
  }
  if (filters.status && filters.status !== "all") query.status = filters.status;

  const limit = Math.min(Math.max(Number(filters.limit ?? 150) || 150, 1), 250);

  const users = await User.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  // NOTE: mongoose.set("sanitizeFilter", true) in db.ts strips any $-prefixed
  // operators from plain filter objects — including $in. To avoid this, we
  // fetch each user's profile with a plain equality match (findOne by exact
  // clerkId string) inside the per-user Promise.all instead of a bulk $in query.
  const client = await clerkClient();
  const userCards = await Promise.all(
    users.map(async (user) => {
      const clerkIdStr = String(user.clerkId);

      // Plain equality — no operators, so sanitizeFilter never interferes.
      const [profile, clerkUserResult] = await Promise.allSettled([
        Profile.findOne({ clerkId: clerkIdStr }).lean(),
        client.users.getUser(clerkIdStr),
      ]);

      const profileData = profile.status === "fulfilled" ? profile.value : null;
      const clerkData = clerkUserResult.status === "fulfilled" ? clerkUserResult.value : null;

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
  );

  const search = normalizeText(filters.search);
  const filteredUsers = search
    ? userCards.filter((user) => {
        return (
          normalizeText(user.name).includes(search) ||
          normalizeText(user.username).includes(search) ||
          normalizeText(user.email).includes(search) ||
          normalizeText(user.phone).includes(search) ||
          normalizeText(user.whatsapp).includes(search)
        );
      })
    : userCards;

  const summary = {
    total: filteredUsers.length,
    active: filteredUsers.filter((user) => user.status === "active").length,
    blocked: filteredUsers.filter((user) => user.status === "blocked").length,
    deleted: filteredUsers.filter((user) => user.status === "deleted").length,
    teachers: filteredUsers.filter((user) => user.role === "teacher").length,
    candidates: filteredUsers.filter((user) => user.role === "teacher_candidate").length,
  };

  return NextResponse.json({ users: filteredUsers, summary });
}