import mongoose, { Schema, Document } from 'mongoose';

/**
 * ProjectApplication Model
 * Handles freelancer applications to client projects
 * Separate from Application model which handles teacher applications to guardian posts
 */
export interface IProjectApplication extends Document {
  applicationId: string; // Unique application ID
  projectId: string; // Reference to Project ID (string format)
  projectTitle: string; // Project title for easy reference
  freelancerId: string; // Freelancer ID (string format like "FRL-xxxxx")
  freelancerName: string;
  freelancerEmail: string;
  freelancerPhone?: string;
  freelancerSkills: string[];
  freelancerExperience: string;
  
  // Application details
  coverLetter: string;
  proposedRate?: number;
  estimatedDuration?: string;
  
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'withdrawal-requested';
  appliedAt: Date;
  
  // Response from client/admin
  responseNote?: string;
  respondedAt?: Date;
  respondedBy?: string; // Client/Admin ID
  
  // Withdrawal
  withdrawalRequestedAt?: Date;
  withdrawalRequestedBy?: string; // Freelancer ID who requested
  withdrawalNote?: string;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

const ProjectApplicationSchema: Schema = new Schema({
  applicationId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  projectId: { 
    type: String,
    required: true,
    index: true 
  },
  projectTitle: {
    type: String,
    required: true
  },
  freelancerId: { 
    type: String, 
    required: true,
    index: true 
  },
  freelancerName: { 
    type: String, 
    required: true 
  },
  freelancerEmail: { 
    type: String, 
    required: true,
    index: true 
  },
  freelancerPhone: {
    type: String
  },
  freelancerSkills: {
    type: [String],
    default: []
  },
  freelancerExperience: {
    type: String,
    required: true
  },
  
  // Application details
  coverLetter: { 
    type: String,
    required: true,
    maxlength: 2000 
  },
  proposedRate: {
    type: Number,
    min: 0
  },
  estimatedDuration: {
    type: String
  },
  
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected', 'withdrawn', 'withdrawal-requested'], 
    default: 'pending',
    index: true 
  },
  appliedAt: { 
    type: Date, 
    default: Date.now 
  },
  
  // Response
  responseNote: { 
    type: String,
    maxlength: 500 
  },
  respondedAt: { 
    type: Date 
  },
  respondedBy: { 
    type: String 
  },
  
  // Withdrawal
  withdrawalRequestedAt: { 
    type: Date 
  },
  withdrawalRequestedBy: {
    type: String
  },
  withdrawalNote: { 
    type: String,
    maxlength: 500 
  },
}, {
  timestamps: true,
  collection: 'projectapplications'
});

// Indexes for efficient queries
ProjectApplicationSchema.index({ projectId: 1, freelancerId: 1 }, { unique: true }); // Prevent duplicate applications
ProjectApplicationSchema.index({ projectId: 1, status: 1 });
ProjectApplicationSchema.index({ freelancerId: 1, status: 1 });
ProjectApplicationSchema.index({ appliedAt: -1 });

// Ensure latest schema in dev
if (mongoose.models?.ProjectApplication) {
  try {
    mongoose.deleteModel('ProjectApplication');
  } catch (e) {
    console.log(e);
  }
}

export default mongoose.models?.ProjectApplication || mongoose.model<IProjectApplication>('ProjectApplication', ProjectApplicationSchema);
