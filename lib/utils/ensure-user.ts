/**
 * ensureUserRecord
 *
 * Looks up the User (and Profile) by clerkId. If the documents don't exist
 * yet — e.g. the Clerk `user.created` webhook hasn't been delivered — this
 * function fetches the account details from the Clerk API and creates the
 * records on-demand, mirroring exactly what the webhook handler does.
 *
 * Returns the User document, or throws if creation fails.
 */

import { clerkClient } from "@clerk/nextjs/server";
import User from "@/lib/models/User";
import Profile from "@/lib/models/Profile";
import type { IUser } from "@/lib/models/User";

function deriveUsername(
  clerkId: string,
  emailAddresses: { id: string; emailAddress: string }[],
  primaryEmailAddressId: string | null,
  username: string | null,
): string {
  const raw = username?.toLowerCase().trim();
  if (raw) return raw;

  const primaryEmail =
    (
      emailAddresses.find((e) => e.id === primaryEmailAddressId) ??
      emailAddresses[0]
    )?.emailAddress ?? "";

  const localPart = primaryEmail
    .split("@")[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 15);

  const suffix = clerkId.replace("user_", "").slice(-8);
  return `${localPart || "user"}${suffix}`;
}

export async function ensureUserRecord(clerkId: string): Promise<IUser> {
  // Fast path: User already exists
  const existing = await User.findOne({ clerkId });
  if (existing) return existing;

  // Slow path: fetch from Clerk and create records
  const client = await clerkClient();
  const clerkUser = await client.users.getUser(clerkId);

  const username = deriveUsername(
    clerkId,
    clerkUser.emailAddresses.map((e) => ({
      id: e.id,
      emailAddress: e.emailAddress,
    })),
    clerkUser.primaryEmailAddressId,
    clerkUser.username ?? null,
  );

  const accountHolderName = clerkUser.fullName?.trim() || null;
  const avatarUrl = clerkUser.imageUrl || null;

  // Upsert User (handles races and re-runs gracefully)
  const user = await User.findOneAndUpdate(
    { $or: [{ clerkId }, { username }] },
    {
      $setOnInsert: {
        clerkId,
        username,
        role: "teacher",
        plan: {
          current: "teacher",
          hasTuitionAccess: false,
          hasCandidateAccess: false,
          activatedAt: null,
        },
        onboardingCompleted: false,
        status: "active",
        registrationPaymentId: null,
      },
    },
    { new: true, upsert: true },
  );

  // Upsert Profile
  await Profile.findOneAndUpdate(
    { $or: [{ clerkId }, { username }] },
    {
      $set: { clerkId, userId: user._id },
      $setOnInsert: {
        username,
        displayName: accountHolderName,
        bio: null,
        avatarUrl,
        location: null,
        websiteUrl: null,
        socialLinks: {},
        subjects: [],
        experience: null,
        isPublic: true,
      },
    },
    { new: true, upsert: true },
  );

  console.log(`[ensure-user] Self-healed User+Profile for ${clerkId}`);
  return user;
}
