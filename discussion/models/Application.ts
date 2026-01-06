import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IApplication extends Document {
  postId: Types.ObjectId;
  teacherId: Types.ObjectId;
  status: 'pending' | 'approved' | 'declined' | 'completed' | 'withdrawal-requested' | 'withdrawn' | 'DC' | 'GC';
  appliedAt: Date;
  declineReason?: string; // Reason for decline (manual or auto)
  autoDeclined?: boolean; // Flag to indicate if auto-declined
  withdrawalRequestedAt?: Date;
  withdrawalRequestedBy?: string; // teacherId who requested
  withdrawalApprovedAt?: Date;
  withdrawalApprovedBy?: string; // adminId who approved
  withdrawalRejectedAt?: Date;
  withdrawalRejectedBy?: string; // adminId who rejected
  withdrawalNote?: string; // Note from teacher explaining withdrawal
}

const ApplicationSchema: Schema = new Schema({
  postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  teacherId: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'declined', 'completed', 'withdrawal-requested', 'withdrawn', 'DC', 'GC'],
    default: 'pending'
  },
  appliedAt: { type: Date, default: Date.now },
  declineReason: { type: String },
  autoDeclined: { type: Boolean, default: false },
  withdrawalRequestedAt: { type: Date },
  withdrawalRequestedBy: { type: String },
  withdrawalApprovedAt: { type: Date },
  withdrawalApprovedBy: { type: String },
  withdrawalRejectedAt: { type: Date },
  withdrawalRejectedBy: { type: String },
  withdrawalNote: { type: String, maxlength: 500 },
});

// Ensure latest schema in dev
if (mongoose.models?.Application) {
  try {
    mongoose.deleteModel('Application');
  } catch (e) {
    console.log(e);
  }
}

export default mongoose.models.Application || mongoose.model<IApplication>('Application', ApplicationSchema);
