import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAdminNotification extends Document {
  type: 'withdrawal-request' | 'withdrawal-approved' | 'withdrawal-declined';
  applicationId: Types.ObjectId;
  
  // Teacher-specific fields (optional for freelancer withdrawals)
  teacherId?: Types.ObjectId;
  teacherName?: string;
  teacherCustomId?: string; // The teacher's custom ID (e.g., T001)
  postId?: Types.ObjectId;
  
  // Freelancer-specific fields (optional for teacher withdrawals)
  freelancerId?: string; // Freelancer custom ID (e.g., FRL-xxxxx)
  freelancerName?: string;
  projectId?: string; // Project custom ID (e.g., PRJ-xxxxx)
  
  // Common fields
  applicantType: 'teacher' | 'freelancer'; // To distinguish between teacher and freelancer withdrawals
  withdrawalNote?: string;
  status: 'pending' | 'approved' | 'declined';
  requestedAt: Date;
  processedAt?: Date; // When admin approved/declined
  processedBy?: string; // Admin ID who processed
  adminNote?: string; // Optional note from admin when processing
  createdAt: Date;
  read: boolean; // Track if notification has been read
}

const AdminNotificationSchema: Schema = new Schema({
  type: {
    type: String,
    enum: ['withdrawal-request', 'withdrawal-approved', 'withdrawal-declined'],
    required: true,
  },
  applicationId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  
  // Teacher-specific fields
  teacherId: {
    type: Schema.Types.ObjectId,
    ref: 'Teacher',
  },
  teacherName: {
    type: String,
  },
  teacherCustomId: {
    type: String,
  },
  postId: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
  },
  
  // Freelancer-specific fields
  freelancerId: {
    type: String,
  },
  freelancerName: {
    type: String,
  },
  projectId: {
    type: String,
  },
  
  // Common fields
  applicantType: {
    type: String,
    enum: ['teacher', 'freelancer'],
    required: true,
  },
  withdrawalNote: {
    type: String,
    maxlength: 500,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'declined'],
    required: true,
    default: 'pending',
  },
  requestedAt: {
    type: Date,
    required: true,
  },
  processedAt: {
    type: Date,
  },
  processedBy: {
    type: String,
  },
  adminNote: {
    type: String,
    maxlength: 500,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  read: {
    type: Boolean,
    default: false,
  },
});

// Index for faster queries
AdminNotificationSchema.index({ createdAt: -1 });
AdminNotificationSchema.index({ status: 1 });
AdminNotificationSchema.index({ read: 1 });

export default mongoose.models.AdminNotification || 
  mongoose.model<IAdminNotification>('AdminNotification', AdminNotificationSchema);
