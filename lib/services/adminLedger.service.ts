import dbConnect from "@/lib/db";
import { InternalError, NotFoundError } from "@/lib/errors";
import Admin, { type IAdmin } from "@/lib/models/Admin";
import Enquiry from "@/lib/models/Enquiry";
import Post from "@/lib/models/Post";
import Job from "@/lib/models/Job";
import AdminLedger, { type IAdminLedger } from "@/lib/models/AdminLedger";
import { getGoogleSheetsClient, ensureTabExists } from "@/lib/googleSheets";

// ─── Constants ────────────────────────────────────────────────────────────────

export const ADMINS_TAB = "Admins";

export const ADMINS_HEADERS = [
  "Admin Name",      // A
  "Role",            // B
  "Joining Date",    // C
  "Permissions",     // D
  "Activity",        // E
  "Payment Done?",   // F
  "Payment Amount",  // G
  "Payment Date",    // H
  "Payment Remarks", // I
  "Resignation Date",// J
  "Is Active",       // K
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

import { formatDateIST } from "./postLedger.service";

/** Produce a short comma-separated string of truthy permission keys */
function buildPermissionsSummary(permissions: Record<string, boolean> | null | undefined): string {
  if (!permissions) return "";
  return Object.entries(permissions)
    .filter(([, val]) => val === true)
    .map(([key]) => key)
    .join(", ");
}

// ─── Sheet row mapper ─────────────────────────────────────────────────────────

export function adminLedgerToSheetRowValues(
  ledger: IAdminLedger,
): (string | number)[] {
  const activity = [
    ...ledger.activityEnquiryIds.map((id) => `ENQ:${id}`),
    ...ledger.activityTuitionIds.map((id) => `TUI:${id}`),
    ...ledger.activityJobIds.map((id) => `JOB:${id}`),
  ].join(", ");

  return [
    // A: Admin Name
    ledger.adminName,

    // B: Role
    ledger.role,

    // C: Joining Date
    formatDateIST(ledger.joiningDate),

    // D: Permissions summary
    ledger.permissionsSummary,

    // E: Activity
    activity,

    // F: Payment Done?
    ledger.paymentDone ? "YES" : "NO",

    // G: Payment Amount
    ledger.paymentAmount ?? "",

    // H: Payment Date
    formatDateIST(ledger.paymentDate),

    // I: Payment Remarks
    ledger.paymentRemarks ?? "",

    // J: Resignation Date
    formatDateIST(ledger.resignationDate),

    // K: Is Active
    ledger.isActive ? "YES" : "NO",
  ];
}

// ─── Sheet row index parser ───────────────────────────────────────────────────

function parseRowNumberFromA1Range(updatedRange: string | undefined): number | null {
  if (!updatedRange) return null;
  const tail = updatedRange.split(":").at(-1);
  const match = tail?.match(/(\d+)\s*$/);
  if (!match) return null;
  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
}

// ─── Sheet sync ───────────────────────────────────────────────────────────────

export async function syncAdminLedgerRowToSheet(ledger: IAdminLedger): Promise<void> {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    if (!spreadsheetId) {
      console.error("[syncAdminLedgerRowToSheet] Missing env var: GOOGLE_SHEET_ID");
      return;
    }

    const sheets = await getGoogleSheetsClient();
    await ensureTabExists(sheets, spreadsheetId, ADMINS_TAB, ADMINS_HEADERS);
    const rowValues = adminLedgerToSheetRowValues(ledger);
    const lastCol = "K";

    const isAppend = ledger.sheetRowIndex === null || ledger.sheetRowIndex === undefined;

    if (isAppend) {
      const appendResponse = await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${ADMINS_TAB}!A:${lastCol}`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [rowValues] },
        insertDataOption: "INSERT_ROWS",
      });

      const updatedRange = appendResponse.data.updates?.updatedRange;
      if (!updatedRange) {
        console.error("[syncAdminLedgerRowToSheet] Missing updatedRange");
        return;
      }

      const newRowIndex = parseRowNumberFromA1Range(updatedRange);
      if (!newRowIndex) {
        console.error("[syncAdminLedgerRowToSheet] Could not parse updatedRange:", updatedRange);
        return;
      }

      await AdminLedger.updateOne(
        { clerkId: ledger.clerkId },
        { $set: { sheetRowIndex: newRowIndex } },
      ).exec();

      return;
    }

    const rowIndex = ledger.sheetRowIndex;
    const range = `${ADMINS_TAB}!A${rowIndex}:${lastCol}${rowIndex}`;

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: "USER_ENTERED",
        data: [{ range, values: [rowValues] }],
      },
    });
  } catch (err) {
    console.error(
      "[syncAdminLedgerRowToSheet] Error syncing for clerkId:",
      ledger.clerkId,
      err,
    );
  }
}

// ─── Upsert AdminLedger ───────────────────────────────────────────────────────

export async function upsertAdminLedger(clerkId: string): Promise<IAdminLedger> {
  await dbConnect();

  const admin = await Admin.findOne({ clerkId }).lean<IAdmin>();
  if (!admin) {
    throw new NotFoundError("Admin");
  }

  const existingLedger = await AdminLedger.findOne({ clerkId }).lean<IAdminLedger>();

  // ─── Activity: gather enquiry / tuition / job IDs this admin has handled ──
  const [enquiriesHandled, tuitionsProcessed, jobsProcessed] = await Promise.all([
    Enquiry.find({ lastActionByAdminId: admin._id })
      .select("enquiryId")
      .lean<{ enquiryId: string }[]>(),
    Post.find({
      $or: [
        { createdByAdminClerkId: clerkId },
        { updatedByAdminClerkId: clerkId },
      ],
    })
      .select("postId")
      .lean<{ postId: string }[]>(),
    Job.find({
      $or: [
        { createdByAdminId: admin._id },
        { updatedByAdminId: admin._id },
      ],
    })
      .select("jobId")
      .lean<{ jobId: string }[]>(),
  ]);

  const activityEnquiryIds = enquiriesHandled.map((e) => e.enquiryId);
  const activityTuitionIds = tuitionsProcessed.map((p) => p.postId);
  const activityJobIds = jobsProcessed.map((j) => j.jobId);

  // Permissions summary
  const permissionsSummary = buildPermissionsSummary(
    admin.permissions as unknown as Record<string, boolean>,
  );

  // Preserve manually-entered payment fields
  const paymentDone: boolean = existingLedger?.paymentDone ?? false;
  const paymentAmount: number | null = existingLedger?.paymentAmount ?? null;
  const paymentRemarks: string | null = existingLedger?.paymentRemarks ?? null;
  const paymentDate: Date | null = existingLedger?.paymentDate ?? null;

  const sheetRowIndex: number | null = existingLedger?.sheetRowIndex ?? null;

  const ledgerData = {
    clerkId,
    adminObjectId: admin._id,
    adminName: admin.name,
    role: admin.role,
    joiningDate: (admin as unknown as { createdAt: Date }).createdAt,
    permissionsSummary,
    activityEnquiryIds,
    activityTuitionIds,
    activityJobIds,
    paymentDone,
    paymentAmount,
    paymentRemarks,
    paymentDate,
    resignationDate: admin.terminatedAt ?? null,
    isActive: admin.isActive,
    sheetRowIndex,
    lastUpdatedAt: new Date(),
  };

  const upserted = await AdminLedger.findOneAndUpdate(
    { clerkId },
    { $set: ledgerData },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    },
  ).exec();

  if (!upserted) {
    throw new InternalError("Failed to upsert AdminLedger");
  }

  // Fire-and-forget
  syncAdminLedgerRowToSheet(upserted).catch((err) =>
    console.error("[upsertAdminLedger] Sheet sync failed:", err),
  );

  return upserted;
}
