import dbConnect from "@/lib/db";
import { InternalError, NotFoundError } from "@/lib/errors";
import Post, { type IPost } from "@/lib/models/Post";
import User from "@/lib/models/User";
import Profile from "@/lib/models/Profile";
import PostLedger, {
  type IPostLedger,
  type IPostLedgerStatusHistoryEntry,
  type IPostLedgerStudent,
  type PostLedgerStatus,
  type PaymentStatus,
} from "@/lib/models/PostLedger";
import { getGoogleSheetsClient } from "@/lib/googleSheets";

// Note: we use explicit interfaces for lean snapshots.

interface IUserSnapshot {
  clerkId: string;
  username: string;
}

interface IProfileSnapshot {
  clerkId: string;
  displayName?: string | null;
  phone?: string | null;
}

interface IPostLedgerUpsertData {
  serialNumber: number | null;
  postId: string;
  postCreatedAt: Date;
  enquiryId: string | null;
  guardianName: string;
  guardianPhone: string;
  students: IPostLedgerStudent[];
  classType: string;
  location: string;
  monthlyBudget: number;
  notes: string | null;
  postStatus: PostLedgerStatus;
  assignedTeacherId: string | null;
  assignedTeacherName: string | null;
  assignedTeacherPhone: string | null;
  assignedAt: Date | null;
  processedByAdminClerkId: string | null;
  paymentStatus: PaymentStatus;
  paymentDate: Date | null;
  paymentAmount: number | null;
  lastUpdatedAt: Date;
  sheetRowIndex: number | null;
  statusHistory: IPostLedgerStatusHistoryEntry[];
  teacherChangeCount: number;
}

function mapPostStatus(postStatus: IPost["status"]): PostLedgerStatus {
  switch (postStatus) {
    case "matched":
      return "assigned";
    case "closed":
    case "cancelled":
      return "closed";
    case "open":
    case "hold":
    default:
      return "open";
  }
}

function getProcessedByAdminClerkId(post: IPost): string | null {
  return post.updatedByAdminClerkId ?? post.createdByAdminClerkId ?? null;
}

function formatDateIST(date: Date | null | undefined): string {
  if (!date) return "";

  // Enforce IST and output `DD/MM/YYYY HH:mm`.
  const dtf = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = dtf.formatToParts(date);
  const getPart = (type: string) => parts.find((p) => p.type === type)?.value;

  const day = getPart("day") ?? "";
  const month = getPart("month") ?? "";
  const year = getPart("year") ?? "";
  const hour = getPart("hour") ?? "";
  const minute = getPart("minute") ?? "";

  return `${day}/${month}/${year} ${hour}:${minute}`;
}

export function postLedgerToSheetRowValues(
  ledger: IPostLedger,
): (string | number)[] {
  return [
    // A: Serial No
    ledger.serialNumber ?? "",

    // B: Post ID
    ledger.postId,

    // C: Post Created At
    formatDateIST(ledger.postCreatedAt),

    // D: Enquiry ID
    ledger.enquiryId ?? "",

    // E: Guardian Name
    ledger.guardianName,

    // F: Guardian Phone
    ledger.guardianPhone,

    // G: Class Type
    ledger.classType,

    // H: Location
    ledger.location,

    // I: Monthly Budget
    ledger.monthlyBudget,

    // J: Post Status
    ledger.postStatus,

    // K: Assigned Teacher Name
    ledger.assignedTeacherName ?? "",

    // L: Assigned Teacher Phone
    ledger.assignedTeacherPhone ?? "",

    // M: Assigned At
    formatDateIST(ledger.assignedAt),

    // N: Processed By (Admin ID)
    ledger.processedByAdminClerkId ?? "",

    // O: Payment Status
    ledger.paymentStatus,

    // P: Payment Date
    formatDateIST(ledger.paymentDate),

    // Q: Payment Amount
    ledger.paymentAmount ?? "",

    // R: Notes
    ledger.notes ?? "",

    // S: Teacher Change Count
    ledger.teacherChangeCount,

    // T: Last Updated At
    formatDateIST(ledger.lastUpdatedAt),
  ];
}

function parseRowNumberFromA1Range(updatedRange: string | undefined): number | null {
  if (!updatedRange) return null;

  // Expected examples:
  // - `PostLedger!A5:T5`
  // - `PostLedger!A5:A5` (rare)
  const tail = updatedRange.split(":").at(-1);
  const match = tail?.match(/(\d+)\s*$/);
  if (!match) return null;
  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function syncPostLedgerRowToSheet(ledger: IPostLedger): Promise<void> {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    if (!spreadsheetId) {
      console.error("[syncPostLedgerRowToSheet] Missing env var: GOOGLE_SHEET_ID");
      return;
    }

    const sheets = await getGoogleSheetsClient();
    const rowValues = postLedgerToSheetRowValues(ledger);

    const isAppend = ledger.sheetRowIndex === null || ledger.sheetRowIndex === undefined;

    if (isAppend) {
      const appendResponse = await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: "PostLedger!A:T",
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [rowValues],
        },
        insertDataOption: "INSERT_ROWS",
      });

      const updatedRange = appendResponse.data.updates?.updatedRange;

      if (!updatedRange) {
        console.error("Missing updatedRange");
        return;
      }

      const newRowIndex = parseRowNumberFromA1Range(updatedRange);

      if (!newRowIndex) {
        console.error(
          "[syncPostLedgerRowToSheet] Could not parse updatedRange for append:",
          updatedRange,
        );
        return;
      }

      await PostLedger.updateOne(
        { postId: ledger.postId },
        { $set: { sheetRowIndex: newRowIndex } },
      ).exec();

      return;
    }

    const rowIndex = ledger.sheetRowIndex;
    const range = `PostLedger!A${rowIndex}:T${rowIndex}`;

    // Update exactly that row in place.
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: "USER_ENTERED",
        data: [
          {
            range,
            values: [rowValues],
          },
        ],
      },
    });
  } catch (err) {
    console.error(
      "[syncPostLedgerRowToSheet] Error syncing to Google Sheet for postId:",
      ledger.postId,
      err,
    );
  }
}

export async function upsertPostLedger(postId: string): Promise<IPostLedger> {
  await dbConnect();

  const post = await Post.findOne({ postId }).lean<IPost>();
  if (!post) {
    throw new NotFoundError("Post");
  }

  const assignedTeacherId: string | null = post.matchedTeacherClerkId ?? null;
  const postLedgerStatus = mapPostStatus(post.status);
  const processedByAdminClerkId = getProcessedByAdminClerkId(post);

  const existingLedger = await PostLedger.findOne({ postId }).lean<IPostLedger>();

  const teacherChangeCountBase = existingLedger?.teacherChangeCount ?? 0;
  const assignedTeacherIdPrev: string | null = existingLedger?.assignedTeacherId ?? null;
  const teacherChangeCount =
    assignedTeacherIdPrev &&
    assignedTeacherId &&
    assignedTeacherIdPrev !== assignedTeacherId
      ? teacherChangeCountBase + 1
      : teacherChangeCountBase;

  // Preserve payment fields if a ledger already exists.
  const paymentStatus: PaymentStatus =
    existingLedger?.paymentStatus ?? "unpaid";
  const paymentDate: Date | null = existingLedger?.paymentDate ?? null;
  const paymentAmount: number | null = existingLedger?.paymentAmount ?? null;

  const sheetRowIndex: number | null = existingLedger?.sheetRowIndex ?? null;

  const statusHistoryBase: IPostLedgerStatusHistoryEntry[] =
    existingLedger?.statusHistory ?? [];

  const lastStatusEntry = statusHistoryBase.at(-1) ?? null;
  const shouldAppendStatus =
    !lastStatusEntry || lastStatusEntry.status !== postLedgerStatus;

  const statusHistory: IPostLedgerStatusHistoryEntry[] = shouldAppendStatus
    ? [
        ...statusHistoryBase,
        {
          status: postLedgerStatus,
          changedAt: new Date(),
          changedByClerkId: processedByAdminClerkId,
        },
      ]
    : statusHistoryBase;

  // Denormalized teacher snapshot at assignment time.
  let assignedTeacherName: string | null = existingLedger?.assignedTeacherName ?? null;
  let assignedTeacherPhone: string | null = existingLedger?.assignedTeacherPhone ?? null;
  if (assignedTeacherId) {
    const isSameTeacherAsExisting =
      existingLedger?.assignedTeacherId === assignedTeacherId;

    const [teacherUser, teacherProfile] = await Promise.all([
      User.findOne({ clerkId: assignedTeacherId }).lean<IUserSnapshot>(),
      Profile.findOne({ clerkId: assignedTeacherId }).lean<IProfileSnapshot>(),
    ]);

    assignedTeacherName = isSameTeacherAsExisting
      ? existingLedger?.assignedTeacherName ?? null
      : teacherProfile?.displayName?.trim() ||
        teacherUser?.username?.trim() ||
        null;

    assignedTeacherPhone = isSameTeacherAsExisting
      ? existingLedger?.assignedTeacherPhone ?? null
      : teacherProfile?.phone?.trim() || null;
  }

  // assignedAt semantics: keep the first assignedAt once we have one.
  let assignedAt: Date | null =
    existingLedger?.assignedAt ?? null;
  if (assignedTeacherId) {
    assignedAt = existingLedger?.assignedAt ?? new Date();
  } else {
    assignedAt = existingLedger?.assignedAt ?? null;
  }

  // Serial number assignment only when missing.
  const serialNumber: number | null =
    existingLedger?.serialNumber ?? null;
  const serialNumberFinal: number | null =
    serialNumber === null || serialNumber === undefined
      ? (await PostLedger.countDocuments()) + 1
      : serialNumber;

  const ledgerData: IPostLedgerUpsertData = {
    serialNumber: serialNumberFinal,
    postId: post.postId,
    postCreatedAt: post.createdAt,
    enquiryId: post.enquiryId ? post.enquiryId.toString() : null,
    guardianName: post.guardianName,
    guardianPhone: post.guardianPhone,
    students: post.students as IPostLedgerStudent[],
    classType: post.classType,
    location: post.location,
    monthlyBudget: post.monthlyBudget,
    notes: post.notes ?? null,
    postStatus: postLedgerStatus,

    assignedTeacherId,
    assignedTeacherName,
    assignedTeacherPhone,
    assignedAt,

    processedByAdminClerkId,

    paymentStatus,
    paymentDate,
    paymentAmount,

    lastUpdatedAt: new Date(),
    sheetRowIndex,

    statusHistory,
    teacherChangeCount,
  };

  const upserted = await PostLedger.findOneAndUpdate(
    { postId },
    { $set: ledgerData },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    },
  ).exec();

  if (!upserted) {
    throw new InternalError("Failed to upsert PostLedger");
  }

  // Fire-and-forget: keep the API response snappy.
  syncPostLedgerRowToSheet(upserted).catch((err) =>
    console.error("Sheet sync failed:", err),
  );

  return upserted;
}

