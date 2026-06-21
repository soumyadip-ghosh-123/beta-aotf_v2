import { handleApiError } from "@/lib/api-utils";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Admin from "@/lib/models/Admin";
import PostLedger from "@/lib/models/PostLedger";
import { upsertPostLedger } from "@/lib/services/postLedger.service";
import { logActivity } from "@/lib/admin/logActivity";

/**
 * PATCH /api/admin/tuitions/[id]/starting-date
 *
 * Body: { startingDate: string (ISO) | null }
 *
 * Updates `PostLedger.startingDate` for the given post and triggers a
 * sheet row sync. Only callable by admins with canManagePosts permission.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      console.log("[starting-date] Unauthorized: no userId");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { id: postId } = await params;
    const currentAdmin = await Admin.findOne({ clerkId: userId }).lean();
    
    // If they aren't in the Admin collection, they are not an admin.
    if (!currentAdmin) {
      console.log("[starting-date] Admin not found for clerkId:", userId);
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!currentAdmin.isActive) {
      console.log("[starting-date] Admin is inactive:", userId);
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const permissions = currentAdmin.permissions as Record<string, boolean>;
    const isSuperOrAdmin = ["super_admin", "SUPER_ADMIN", "admin"].includes(currentAdmin.role);
    
    if (!permissions?.canManagePosts && !isSuperOrAdmin) {
      console.log("[starting-date] Forbidden: not super_admin and no canManagePosts");
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { startingDate } = body as { startingDate: string | null };

    const parsedDate: Date | null = startingDate ? new Date(startingDate) : null;

    // Update startingDate on the ledger directly (admin-entered field).
    const ledger = await PostLedger.findOneAndUpdate(
      { postId },
      { $set: { startingDate: parsedDate } },
      { new: true },
    ).exec();

    if (!ledger) {
      return NextResponse.json(
        { error: "PostLedger not found for this post" },
        { status: 404 },
      );
    }

    // Trigger a full ledger upsert to re-resolve all fields and sync the sheet.
    await upsertPostLedger(postId);

    try {
      await logActivity({
        admin: currentAdmin,
        action: "UPDATE_STARTING_DATE",
        module: "CRM",
        targetType: "PostLedger",
        targetId: ledger._id as any,
        targetRefId: postId,
        metadata: {
          startingDate: parsedDate ? parsedDate.toISOString() : null,
        },
      });
    } catch (e) {
      console.error("Failed to log UPDATE_STARTING_DATE", e);
    }

    return NextResponse.json({ success: true, startingDate: parsedDate });
  } catch (error) {
    return handleApiError(error, "PATCH /api/admin/tuitions/[id]/starting-date", { legacyAdminShape: true });
  }
}
