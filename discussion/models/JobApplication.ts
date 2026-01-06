import mongoose, { Schema, Document } from 'mongoose';

/**
 * JobApplication Model
 * Handles user applications to job openings
 */
export interface IJobApplication extends Document {
    applicationId: string; // Unique application ID
    jobId: string; // Reference to Job ID
    jobDesignation: string; // Job title for easy reference

    // Applicant details
    applicantId: string; // User ID (freelancer or teacher)
    applicantName: string;
    applicantEmail: string;
    applicantPhone?: string;
    applicantType: 'freelancer' | 'teacher';

    // Application details
    coverLetter?: string;
    expectedSalary?: number;

    status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
    appliedAt: Date;

    // Response from admin
    responseNote?: string;
    respondedAt?: Date;
    respondedBy?: string;

    // Metadata
    createdAt: Date;
    updatedAt: Date;
}

const JobApplicationSchema: Schema = new Schema({
    applicationId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    jobId: {
        type: String,
        required: true,
        index: true
    },
    jobDesignation: {
        type: String,
        required: true
    },

    // Applicant details
    applicantId: {
        type: String,
        required: true,
        index: true
    },
    applicantName: {
        type: String,
        required: true
    },
    applicantEmail: {
        type: String,
        required: true,
        index: true
    },
    applicantPhone: {
        type: String
    },
    applicantType: {
        type: String,
        enum: ['freelancer', 'teacher'],
        required: true
    },

    // Application details
    coverLetter: {
        type: String,
        maxlength: 2000
    },
    expectedSalary: {
        type: Number,
        min: 0
    },

    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
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
}, {
    timestamps: true,
    collection: 'jobapplications'
});

// Indexes for efficient queries
JobApplicationSchema.index({ jobId: 1, applicantId: 1 }, { unique: true }); // Prevent duplicate applications
JobApplicationSchema.index({ jobId: 1, status: 1 });
JobApplicationSchema.index({ applicantId: 1, status: 1 });
JobApplicationSchema.index({ appliedAt: -1 });

// Ensure latest schema in dev
if (mongoose.models?.JobApplication) {
    try {
        mongoose.deleteModel('JobApplication');
    } catch (e) {
        console.log(e);
    }
}

export default mongoose.models?.JobApplication || mongoose.model<IJobApplication>('JobApplication', JobApplicationSchema);
