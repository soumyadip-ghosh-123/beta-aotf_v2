import mongoose, { Schema, Document, Model, models } from "mongoose";

// ─── Enums ──────────────────────────────────────────────────────────────

export const EVENT_TYPES = [
  "Status_change",
  "auto_decline",
  "manual_decline",
  "approval",
  "withdrawal",
  "revert",
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export const ACTOR_TYPES = ["system", "admin", "guardian", "teacher"] as const;
export type ActorType = (typeof ACTOR_TYPES)[number];

// ─── Main Document: ApplicationEvent ────────────────────────────────────

export interface IApplicationEvent extends Document {
  applicationId: mongoose.Types.ObjectId;
  attemptNumber: number;
  postId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  eventType: EventType;
  fromStatus?: string;
  toStatus?: string;
  reason?: string;
  actorType: ActorType;
  actorId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const ApplicationEventSchema = new Schema<IApplicationEvent>(
  {
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },
    attemptNumber: { type: Number, required: true },
    postId: { type: Schema.Types.ObjectId, required: true },
    teacherId: { type: Schema.Types.ObjectId, required: true },
    eventType: {
      type: String,
      enum: EVENT_TYPES,
      required: true,
    },
    fromStatus: { type: String },
    toStatus: { type: String },
    reason: { type: String },
    actorType: {
      type: String,
      enum: ACTOR_TYPES,
      required: true,
    },
    actorId: { type: Schema.Types.ObjectId },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: "applicationEvents",
  },
);

const ApplicationEvent: Model<IApplicationEvent> =
  models.ApplicationEvent ||
  mongoose.model<IApplicationEvent>("ApplicationEvent", ApplicationEventSchema);

export default ApplicationEvent;
