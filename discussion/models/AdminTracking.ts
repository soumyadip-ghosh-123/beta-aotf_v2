import mongoose, { Schema, Document, Types, Model } from 'mongoose';

export interface IAdminAction {
  type: 'approval' | 'denial';
  applicationId: string;
  applicationType: 'teacher' | 'freelancer' | 'project';
  timestamp: Date;
  note?: string;
}

export interface IAdminTracking extends Document {
  adminId: Types.ObjectId;
  adminEmail: string;
  adminName: string;
  approvalCount: number;
  denialCount: number;
  actions: IAdminAction[];
  lastActionAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  getStatistics(): {
    totalActions: number;
    approvalCount: number;
    denialCount: number;
    approvalRate: string;
    lastActionAt?: Date;
    recentActions: IAdminAction[];
  };
}

export interface IAdminTrackingModel extends Model<IAdminTracking> {
  trackAction(
    adminId: string,
    adminEmail: string,
    adminName: string,
    actionType: 'approval' | 'denial',
    applicationId: string,
    applicationType: 'teacher' | 'freelancer' | 'project',
    note?: string
  ): Promise<IAdminTracking>;
}

const AdminTrackingSchema: Schema = new Schema(
  {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
      unique: true,
    },
    adminEmail: {
      type: String,
      required: true,
    },
    adminName: {
      type: String,
      required: true,
    },
    approvalCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    denialCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    actions: [
      {
        type: {
          type: String,
          enum: ['approval', 'denial'],
          required: true,
        },
        applicationId: {
          type: String,
          required: true,
        },
        applicationType: {
          type: String,
          enum: ['teacher', 'freelancer', 'project'],
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        note: {
          type: String,
        },
      },
    ],
    lastActionAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
AdminTrackingSchema.index({ adminId: 1 });
AdminTrackingSchema.index({ adminEmail: 1 });

// Static method to track admin action
AdminTrackingSchema.statics.trackAction = async function (
  adminId: string,
  adminEmail: string,
  adminName: string,
  actionType: 'approval' | 'denial',
  applicationId: string,
  applicationType: 'teacher' | 'freelancer' | 'project',
  note?: string
) {
  const tracking = await this.findOneAndUpdate(
    { adminId },
    {
      $inc: {
        [actionType === 'approval' ? 'approvalCount' : 'denialCount']: 1,
      },
      $push: {
        actions: {
          type: actionType,
          applicationId,
          applicationType,
          timestamp: new Date(),
          note,
        },
      },
      $set: {
        adminEmail,
        adminName,
        lastActionAt: new Date(),
      },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );

  return tracking;
};

// Method to get admin statistics
AdminTrackingSchema.methods.getStatistics = function () {
  return {
    totalActions: this.approvalCount + this.denialCount,
    approvalCount: this.approvalCount,
    denialCount: this.denialCount,
    approvalRate:
      this.approvalCount + this.denialCount > 0
        ? ((this.approvalCount / (this.approvalCount + this.denialCount)) * 100).toFixed(2) + '%'
        : 'N/A',
    lastActionAt: this.lastActionAt,
    recentActions: this.actions.slice(-10).reverse(), // Last 10 actions
  };
};

export default (mongoose.models.AdminTracking as IAdminTrackingModel) || 
  mongoose.model<IAdminTracking, IAdminTrackingModel>('AdminTracking', AdminTrackingSchema);
