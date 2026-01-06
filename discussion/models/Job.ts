import mongoose, { Schema, Document } from 'mongoose';

export interface IJob extends Document {
  jobId: string;

  // Client Details (Required)
  clientName: string;
  phoneNumber: string;

  // Company Details (Optional)
  companyName?: string;
  companyType?: string;

  // Job Details
  designation?: string;
  experience?: string;
  locationType: 'on-site' | 'remote' | 'hybrid';
  location?: string;
  gender: 'male' | 'female' | 'both' | 'all' | 'others';
  timing?: string;
  salary?: string;
  travel?: string;
  requiredQualification?: string;
  skillsRequired?: string;
  requirements?: string;

  status: 'open' | 'closed' | 'cancelled' | 'hold';
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema: Schema = new Schema({
  jobId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  // Client Details (Required)
  clientName: {
    type: String,
    required: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function (v: string) {
        return /^\d{10}$/.test(v);
      },
      message: 'Phone number must be exactly 10 digits'
    }
  },

  // Company Details (Optional)
  companyName: {
    type: String,
    trim: true
  },
  companyType: {
    type: String,
    trim: true
  },

  // Job Details
  designation: {
    type: String,
    trim: true
  },
  experience: {
    type: String,
    trim: true
  },
  locationType: {
    type: String,
    enum: ['on-site', 'remote', 'hybrid'],
    required: true
  },
  location: {
    type: String,
    trim: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'both', 'all', 'others'],
    required: true
  },
  timing: {
    type: String,
    trim: true
  },
  salary: {
    type: String,
    trim: true
  },
  travel: {
    type: String,
    trim: true
  },
  requiredQualification: {
    type: String,
    trim: true
  },
  skillsRequired: {
    type: String,
    trim: true
  },
  requirements: {
    type: String,
    trim: true
  },

  status: {
    type: String,
    enum: ['open', 'closed', 'cancelled', 'hold'],
    default: 'open'
  }
}, {
  timestamps: true,
  versionKey: '__v'
});

// Ensure latest schema in dev by deleting precompiled model
if (mongoose.models?.Job) {
  try {
    mongoose.deleteModel('Job');
  } catch (e) {
    console.log(e);
  }
}

export default mongoose.models?.Job || mongoose.model<IJob>('Job', JobSchema);
