import { clerkClient } from "@clerk/nextjs/server";
import mongoose from "mongoose";
import Admin from "@/lib/models/Admin";

export interface AdminAuthorSummary {
  name: string;
  avatarUrl: string | null;
}

async function fetchClerkAvatarMap(
  clerkIds: string[],
): Promise<Map<string, string | null>> {
  const uniqueClerkIds = Array.from(new Set(clerkIds.filter(Boolean)));

  if (uniqueClerkIds.length === 0) {
    return new Map();
  }

  const client = await clerkClient();
  const avatarEntries = await Promise.allSettled(
    uniqueClerkIds.map(async (clerkId) => {
      const user = await client.users.getUser(clerkId);
      return [clerkId, user.imageUrl ?? null] as const;
    }),
  );

  const avatarMap = new Map<string, string | null>();

  for (const entry of avatarEntries) {
    if (entry.status === "fulfilled") {
      avatarMap.set(entry.value[0], entry.value[1]);
    }
  }

  return avatarMap;
}

export async function getAdminAuthorsByClerkIds(
  clerkIds: string[],
): Promise<Map<string, AdminAuthorSummary>> {
  const uniqueClerkIds = Array.from(new Set(clerkIds.filter(Boolean)));

  if (uniqueClerkIds.length === 0) {
    return new Map();
  }

  const admins = await Admin.find(
    { clerkId: mongoose.trusted({ $in: uniqueClerkIds }) },
    { clerkId: 1, name: 1 },
  ).lean<Array<{ clerkId: string; name?: string | null }>>();

  const adminNameMap = new Map(
    admins.map((admin) => [admin.clerkId, admin.name?.trim() || "Admin"]),
  );
  const avatarMap = await fetchClerkAvatarMap(uniqueClerkIds);

  return new Map(
    uniqueClerkIds.map((clerkId) => [
      clerkId,
      {
        name: adminNameMap.get(clerkId) ?? "Admin",
        avatarUrl: avatarMap.get(clerkId) ?? null,
      },
    ]),
  );
}

export async function getAdminAuthorsByAdminIds(
  adminIds: Array<mongoose.Types.ObjectId | string | null | undefined>,
): Promise<Map<string, AdminAuthorSummary>> {  const uniqueAdminIds = Array.from(
    new Set(adminIds.map((adminId) => adminId?.toString())),
  ).filter((adminId): adminId is string => Boolean(adminId));

  if (uniqueAdminIds.length === 0) {
    return new Map();
  }

  const objectIds = uniqueAdminIds
    .filter((adminId) => mongoose.Types.ObjectId.isValid(adminId))
    .map((adminId) => new mongoose.Types.ObjectId(adminId));

  if (objectIds.length === 0) {
    return new Map();
  }

  const admins = await Admin.find(
    { _id: mongoose.trusted({ $in: objectIds }) },
    { _id: 1, clerkId: 1, name: 1 },
  ).lean<
    Array<{
      _id: mongoose.Types.ObjectId;
      clerkId?: string | null;
      name?: string | null;
    }>
  >();

  const avatarMap = await fetchClerkAvatarMap(
    admins
      .map((admin) => admin.clerkId)
      .filter((clerkId): clerkId is string => Boolean(clerkId)),
  );

  return new Map(
    admins.map((admin) => [
      String(admin._id),
      {
        name: admin.name?.trim() || "Admin",
        avatarUrl: admin.clerkId
          ? (avatarMap.get(admin.clerkId) ?? null)
          : null,
      },
    ]),
  );
}
