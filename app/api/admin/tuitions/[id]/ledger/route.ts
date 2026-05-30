import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Admin from "@/lib/models/Admin";
import PostLedger from "@/lib/models/PostLedger";


/**
 * GET /api/admin/tuitions/[id]/ledger
 *
 * Returns the PostLedger document for a given post.
 * Used by the candidate page to pre-populate admin-entered fields
 * (e.g. startingDate, teacherHasBeenPaid, teacherPaymentDate).
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const currentAdmin = await Admin.findOne({ clerkId: userId }).lean();
    if (!currentAdmin || !currentAdmin.isActive) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }


    const { id: postId } = await params;
    const ledger = await PostLedger.findOne({ postId })
      .select("startingDate teacherHasBeenPaid teacherPaymentDate")
      .lean();

    if (!ledger) {
      return NextResponse.json({ error: "Ledger not found" }, { status: 404 });
    }

    return NextResponse.json(ledger);
  } catch (err) {
    console.error("[GET /api/admin/tuitions/[id]/ledger] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
