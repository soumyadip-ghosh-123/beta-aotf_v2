import mongoose, { Schema, Document, Model, models } from "mongoose";

// ─── Category + visibility enums ────────────────────────────────────────────

export const CALENDAR_EVENT_CATEGORIES = [
  "tuition",
  "job",
  "enquiry",
  "feedback",
  "reminder",
] as const;

export const CALENDAR_EVENT_SOURCE_TYPES = [
  "application",
  "enquiry",
  "feedback",
  "todo",
] as const;

export const CALENDAR_EVENT_VISIBILITIES = ["admin", "system"] as const;

export type CalendarEventCategory =
  (typeof CALENDAR_EVENT_CATEGORIES)[number];
export type CalendarEventSourceType =
  (typeof CALENDAR_EVENT_SOURCE_TYPES)[number];
export type CalendarEventVisibility =
  (typeof CALENDAR_EVENT_VISIBILITIES)[number];

// ─── Sub-document interfaces ─────────────────────────────────────────────────

export interface ICalendarEventSource {
  type: CalendarEventSourceType;
  /** Renamed from `collection` — that name is reserved by Mongoose and corrupts schema path resolution */
  collectionName: string;
  sourceId: string; // stringified ObjectId or public ID
  sourceUpdatedAt: Date;
}

export interface ICalendarEventOwner {
  adminId: string | null;
  adminName: string | null;
}

export interface ICalendarEventRef {
  label: string | null;
  meta: Record<string, unknown>;
}

// ─── Main document interface ─────────────────────────────────────────────────

export interface ICalendarEvent extends Document {
  /** Unique deterministic key — e.g. "application:<_id>:tuition", "enquiry:<_id>" */
  eventKey: string;
  source: ICalendarEventSource;
  title: string;
  description: string;
  category: CalendarEventCategory;
  /** Normalised UI status label, e.g. "Demo Confirmation" */
  status: string;
  /** Original status string from the source document */
  rawStatus: string;
  /** UI colour token */
  color: string;
  startAt: Date;
  endAt: Date;
  allDay: boolean;
  owner: ICalendarEventOwner;
  ref: ICalendarEventRef;
  /** Primarily for reminder/todo events */
  isDone: boolean;
  visibility: CalendarEventVisibility;
  lastSyncedAt: Date;
  /** Bumped whenever the mapping logic changes to support incremental re-sync */
  syncVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Sub-document schemas ─────────────────────────────────────────────────────

const CalendarEventSourceSchema = new Schema<ICalendarEventSource>(
  {
    type: { type: String, enum: CALENDAR_EVENT_SOURCE_TYPES, required: true },
    collectionName: { type: String, required: true },
    sourceId: { type: String, required: true },
    sourceUpdatedAt: { type: Date, required: true },
  },
  { _id: false },
);

const CalendarEventOwnerSchema = new Schema<ICalendarEventOwner>(
  {
    adminId: { type: String, default: null },
    adminName: { type: String, default: null },
  },
  { _id: false },
);

const CalendarEventRefSchema = new Schema<ICalendarEventRef>(
  {
    label: { type: String, default: null },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false },
);

// ─── Main schema ──────────────────────────────────────────────────────────────

const CalendarEventSchema = new Schema<ICalendarEvent>(
  {
    eventKey: { type: String, required: true },
    source: { type: CalendarEventSourceSchema, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true, default: "" },
    category: {
      type: String,
      enum: CALENDAR_EVENT_CATEGORIES,
      required: true,
    },
    status: { type: String, required: true },
    rawStatus: { type: String, required: true },
    color: { type: String, required: true },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    allDay: { type: Boolean, required: true, default: false },
    owner: { type: CalendarEventOwnerSchema, required: true },
    ref: { type: CalendarEventRefSchema, required: true },
    isDone: { type: Boolean, required: true, default: false },
    visibility: {
      type: String,
      enum: CALENDAR_EVENT_VISIBILITIES,
      required: true,
      default: "admin",
    },
    lastSyncedAt: { type: Date, required: true },
    syncVersion: { type: Number, required: true, default: 1 },
  },
  {
    timestamps: true,
    collection: "calendar_events",
  },
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

// Primary unique lookup key
CalendarEventSchema.index({ eventKey: 1 }, { unique: true });

// Date-range queries (main read path)
CalendarEventSchema.index({ startAt: 1 });
CalendarEventSchema.index({ endAt: 1 });

// Admin-scoped view
CalendarEventSchema.index({ "owner.adminId": 1, startAt: 1 });

// Category-scoped view
CalendarEventSchema.index({ category: 1, startAt: 1 });

// Status-scoped view
CalendarEventSchema.index({ status: 1, startAt: 1 });

// Source lookup (for upsert by source doc)
CalendarEventSchema.index({ "source.type": 1, "source.sourceId": 1 });

// Maintenance / re-sync
CalendarEventSchema.index({ lastSyncedAt: 1 });
CalendarEventSchema.index({ syncVersion: 1 });

// ─── Model ───────────────────────────────────────────────────────────────────

const CalendarEvent: Model<ICalendarEvent> =
  models.CalendarEvent ||
  mongoose.model<ICalendarEvent>("CalendarEvent", CalendarEventSchema);

export default CalendarEvent;
