import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Admin from "@/lib/models/Admin";
import AdminLedger, { type IAdminLedger } from "@/lib/models/AdminLedger";
import { getGoogleSheetsClient } from "@/lib/googleSheets";
import {
  adminLedgerToSheetRowValues,
  ADMINS_TAB,
  ADMINS_HEADERS,
} from "@/lib/services/adminLedger.service";

function toRowIndexFromDataRowOffset(offsetFromRow2: number): number {
  return 2 + offsetFromRow2;
}

/**
 * POST /api/admin/resync-sheet/admins
 * Clears the `Admins` sheet from row 1, rewrites headers, then bulk-syncs
 * all AdminLedger rows. Triggered manually by a super/sub-super admin.
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

    const ledgers = await AdminLedger.find({})
      .sort({ joiningDate: 1 })
      .exec();

    // 1) Clear sheet from row 1
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: `${ADMINS_TAB}!A1:K`,
    });

    // 2) Write header row
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${ADMINS_TAB}!A1:K1`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [ADMINS_HEADERS] },
    });

    // 3) Write data rows in chunks
    const CHUNK_SIZE = 500;
    const valuesRows = ledgers.map((l) => adminLedgerToSheetRowValues(l));
    const startRow = 2;

    for (let i = 0; i < valuesRows.length; i += CHUNK_SIZE) {
      const chunk = valuesRows.slice(i, i + CHUNK_SIZE);
      const chunkStartRow = startRow + i;
      const chunkEndRow = chunkStartRow + chunk.length - 1;
      const range = `${ADMINS_TAB}!A${chunkStartRow}:K${chunkEndRow}`;

      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        requestBody: {
          valueInputOption: "USER_ENTERED",
          data: [{ range, values: chunk }],
        },
      });
    }

    // 4) Reset sheetRowIndex in DB
    const ops: Parameters<typeof AdminLedger.bulkWrite>[0] = ledgers.map(
      (ledger, idx) => ({
        updateOne: {
          filter: { clerkId: ledger.clerkId },
          update: { $set: { sheetRowIndex: toRowIndexFromDataRowOffset(idx) } },
        },
      }),
    );

    const BULK_CHUNK = 500;
    for (let i = 0; i < ops.length; i += BULK_CHUNK) {
      await AdminLedger.bulkWrite(ops.slice(i, i + BULK_CHUNK));
    }

    return NextResponse.json({ success: true, totalSynced: ledgers.length });
  } catch (err) {
    console.error("[POST /api/admin/resync-sheet/admins] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
