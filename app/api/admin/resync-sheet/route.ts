import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Admin from "@/lib/models/Admin";
import PostLedger, { type IPostLedger } from "@/lib/models/PostLedger";
import { getGoogleSheetsClient } from "@/lib/googleSheets";
import { postLedgerToSheetRowValues } from "@/lib/services/postLedger.service";

const SHEET_TAB_NAME = "PostLedger";

function toRowIndexFromDataRowOffset(offsetFromRow2: number): number {
  // Header row is 1; data starts at row 2.
  return 2 + offsetFromRow2;
}

function sortBySerialNumberNullsLast(ledgers: IPostLedger[]): IPostLedger[] {
  return [...ledgers].sort((a, b) => {
    const aSN = a.serialNumber ?? Number.MAX_SAFE_INTEGER;
    const bSN = b.serialNumber ?? Number.MAX_SAFE_INTEGER;
    return aSN - bSN;
  });
}

/**
 * POST /api/admin/resync-sheet
 * Clears `PostLedger` sheet from row 2 downward and rewrites rows from scratch.
 */
export async function POST(req: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const metadata = sessionClaims?.publicMetadata as Record<string, unknown>;
    if (metadata?.isAdmin !== true) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();

    const currentAdmin = await Admin.findOne({ clerkId: userId }).lean();
    if (!currentAdmin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    // Only admin clerk roles (exclude support admins).
    if (currentAdmin.role === "support_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    if (!spreadsheetId) {
      return NextResponse.json(
        { error: "Missing env var: GOOGLE_SHEET_ID" },
        { status: 500 },
      );
    }

    const sheets = await getGoogleSheetsClient();

    const ledgers = await PostLedger.find({})
      .sort({ serialNumber: 1 })
      .exec();

    const sortedLedgers = sortBySerialNumberNullsLast(ledgers);

    // 1) Clear sheet from row 2 downward.
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: `${SHEET_TAB_NAME}!A2:T`,
    });

    // 2) Rewrite all rows from scratch.
    const CHUNK_SIZE = 500;
    const valuesRows = sortedLedgers.map((l) => postLedgerToSheetRowValues(l));

    const startRow = 2;
    for (let i = 0; i < valuesRows.length; i += CHUNK_SIZE) {
      const chunk = valuesRows.slice(i, i + CHUNK_SIZE);
      const chunkStartRow = startRow + i;
      const chunkEndRow = chunkStartRow + chunk.length - 1;
      const range = `${SHEET_TAB_NAME}!A${chunkStartRow}:T${chunkEndRow}`;

      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        requestBody: {
          valueInputOption: "USER_ENTERED",
          data: [
            {
              range,
              values: chunk,
            },
          ],
        },
      });
    }

    // 3) Reset sheetRowIndex in DB to match new positions.
    const ops: Parameters<typeof PostLedger.bulkWrite>[0] =
      sortedLedgers.map((ledger, idx) => ({
        updateOne: {
          filter: { postId: ledger.postId },
          update: { $set: { sheetRowIndex: toRowIndexFromDataRowOffset(idx) } },
        },
      }));

    const BULK_CHUNK = 500;
    for (let i = 0; i < ops.length; i += BULK_CHUNK) {
      const chunkOps = ops.slice(i, i + BULK_CHUNK);
      await PostLedger.bulkWrite(chunkOps);
    }

    return NextResponse.json({ success: true, totalSynced: sortedLedgers.length });
  } catch (err) {
    console.error("[POST /api/admin/resync-sheet] Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

