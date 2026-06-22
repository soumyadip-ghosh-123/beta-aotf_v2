/**
 * Seeds User + Profile (+ OnboardingDetails for migrated users) in the NEW
 * MongoDB from a Clerk user object. Mirrors app/api/v1/webhooks/clerk/route.ts.
 *
 * @param {import("mongodb").Db} db
 * @param {import("@clerk/backend").User} clerkUser
 * @returns {Promise<{ action: "created" | "updated" | "skipped"; reason?: string }>}
 */
export async function seedClerkUserInMongo(db, clerkUser) {
  const metadata = clerkUser.publicMetadata ?? {};

  if (metadata.isAdmin === true) {
    return { action: "skipped", reason: "admin" };
  }

  const clerkId = clerkUser.id;
  const usersCol = db.collection("users");
  const profilesCol = db.collection("profiles");
  const onboardingCol = db.collection("onboardingdetails");

  let username = clerkUser.username?.toLowerCase().trim();
  if (!username) {
    const primaryEmail =
      clerkUser.emailAddresses?.find(
        (e) => e.id === clerkUser.primaryEmailAddressId,
      )?.emailAddress ??
      clerkUser.emailAddresses?.[0]?.emailAddress ??
      "";

    const localPart = primaryEmail
      .split("@")[0]
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 15);

    const suffix = clerkId.replace("user_", "").slice(-8);
    username = `${localPart || "user"}${suffix}`;
  }

  const legacyPlan =
    typeof metadata.legacyPlan === "string" ? metadata.legacyPlan : null;
  const role =
    metadata.role === "teacher_candidate" || legacyPlan === "teacher_candidate"
      ? "teacher_candidate"
      : "teacher";
  const planCurrent = role;

  const accountHolderName =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ").trim() ||
    null;
  const avatarUrl = clerkUser.imageUrl || null;
  const now = new Date();

  let userDoc = await usersCol.findOne({
    $or: [{ clerkId }, { username }],
  });

  let action = "updated";

  if (userDoc) {
    await usersCol.updateOne(
      { _id: userDoc._id },
      { $set: { clerkId, status: "active", updatedAt: now } },
    );
  } else {
    const insertResult = await usersCol.insertOne({
      clerkId,
      username,
      role,
      plan: {
        current: planCurrent,
        hasTuitionAccess: false,
        hasCandidateAccess: false,
        activatedAt: null,
      },
      onboardingCompleted: metadata.onboardingCompleted === true,
      status: "active",
      registrationPaymentId: null,
      deletionWarningEmailSentAt: null,
      createdAt: now,
      updatedAt: now,
    });
    userDoc = { _id: insertResult.insertedId };
    action = "created";
  }

  const profileDoc = await profilesCol.findOne({
    $or: [{ clerkId }, { username }],
  });

  if (profileDoc) {
    const profileUpdate = {
      clerkId,
      userId: userDoc._id,
      updatedAt: now,
    };
    if (avatarUrl) profileUpdate.avatarUrl = avatarUrl;
    if (!profileDoc.displayName && accountHolderName) {
      profileUpdate.displayName = accountHolderName;
    }
    await profilesCol.updateOne({ _id: profileDoc._id }, { $set: profileUpdate });
  } else {
    await profilesCol.insertOne({
      userId: userDoc._id,
      clerkId,
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
      phone: null,
      whatsapp: null,
      address: null,
      teachingExp: null,
      jobExp: null,
      qualification: null,
      board: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  const isMigratedLegacy =
    metadata.migratedFromLegacy === true &&
    metadata.registrationFeeStatus === "paid";

  if (isMigratedLegacy) {
    await onboardingCol.updateOne(
      { $or: [{ clerkId }, { userId: userDoc._id }] },
      {
        $set: { clerkId, updatedAt: now },
        $setOnInsert: {
          userId: userDoc._id,
          phone: null,
          whatsapp: null,
          address: null,
          teachingExp: null,
          jobExp: null,
          qualification: null,
          board: null,
          plan: legacyPlan ?? planCurrent,
          status: "incomplete",
          expiresAt: null,
          createdAt: now,
        },
      },
      { upsert: true },
    );
  }

  return { action };
}
