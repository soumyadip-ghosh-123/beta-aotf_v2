import mongoose, { Schema, Document } from 'mongoose';

export interface IPost extends Document {
  postId: string;
  enquiryId?: string[];
  // userId: string;
  // name?: string;
  guardianName?: string;
  // email?: string;
  // phone?: string;
  guardianPhone?: string;
  subject: string;
  class: string;
  board?: 1 | 2 | 3 | 4 | 5 | 6;
  preferredTime?: string;
  preferredDays?: string[];
  frequencyPerWeek: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  classType: 1 | 2 | 3 ;
  location?: string;
  monthlyBudget?: number;
  notes?: string;
  status: 1 | 2 | 3 | 4;
  createdAt: Date;
  updatedAt: Date;
  applicants: mongoose.Types.ObjectId[];
  editedAt?: Date;
  editedByUserId?: string; // fetch role from userid
  editedByName?: string;
}

const PostSchema: Schema = new Schema({
  postId: { type: String, required: true, unique: true, index: true },
  guardianId: { type: String, index: true }, // Index for efficient guardian-based queries
  // userId: { type: String, required: true },
  // name: { type: String },
  guardianName: { type: String },
  email: { type: String, index: true },
  phone: { type: String },
  guardianPhone: { type: String },
  subject: { type: String, required: true },
  className: { type: String, required: true },
  board: { type: String, enum: ['CBSE', 'ICSE', 'IB', 'WB-Bengali version', 'ISC', 'WB-English Version'] },
  preferredTime: { type: String },
  preferredDays: { type: [String], default: [] },
  frequencyPerWeek: { type: String, enum: ['once', 'twice', 'thrice', 'four', 'five'], required: true },
  classType: { type: String, enum: ['online', 'in-person', 'both'], required: true },
  location: { type: String },
  monthlyBudget: { type: Number },
  notes: { type: String },
  status: { type: String, enum: ['open', 'matched', 'closed', 'hold', 'cancelled'], default: 'open' },
  applicants: [{ type: Schema.Types.ObjectId, ref: 'Teacher', default: [] }],
  editedBy: { type: String, enum: ['guardian', 'admin', 'teacher'] },
  editedAt: { type: Date },
  editedByUserId: { type: String },
  editedByName: { type: String },
}, {
  timestamps: true,
  versionKey: '__v'
});

// Ensure latest schema in dev by deleting precompiled model
if (mongoose.models.Post) {
  try {
    mongoose.deleteModel('Post');
  } catch { }
}

export default mongoose.model<IPost>('Post', PostSchema);