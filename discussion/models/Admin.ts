import mongoose, { Schema, Document } from "mongoose";
import crypto from "node:crypto";

export interface IAdmin extends Document {
  email: string;
  password: string;
  name: string;
  role: "super_admin" | "support_admin";
  permissions: {
    dashboard: boolean;
    calender: boolean;
    tuitions: boolean;
    jobs: boolean;
    users: boolean;
    enquiries: boolean;
    payments: boolean;
    ads: boolean;
    invoices: boolean;
  };
  isActive: boolean;
  sessionVersion: number;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  hasPermission(permission: keyof IAdmin["permissions"]): boolean;
  invalidateSession(): Promise<void>;
}

export interface IAdminModel extends mongoose.Model<IAdmin> {
  findByEmail(email: string): Promise<IAdmin | null>;
}

// Validation functions
function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const AdminSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: validateEmail,
        message: "Please provide a valid email address",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    role: {
      type: String,
      enum: ["super_admin", "support_admin"],
      default: "support_admin",
      required: true,
    },
    permissions: {
      dashboard: {
        type: Boolean,
        default: true,
      },
      posts: {
        type: Boolean,
        default: false,
      },
      payments: {
        type: Boolean,
        default: false,
      },
      applications: {
        type: Boolean,
        default: false,
      },
      guardians: {
        type: Boolean,
        default: false,
      },
      teachers: {
        type: Boolean,
        default: false,
      },
      ads: {
        type: Boolean,
        default: false,
      },
      invoices: {
        type: Boolean,
        default: false,
      },
      notifications: {
        type: Boolean,
        default: false,
      },
      settings: {
        type: Boolean,
        default: false,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sessionVersion: {
      type: Number,
      default: 1,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
AdminSchema.pre("save", async function () {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) {
    return;
  }

  try {
    // Create a SHA-256 hash of the password
    const hash = crypto.createHash("sha256");
    hash.update(this.password as string);
    this.password = hash.digest("hex");
  } catch (error) {
    throw error;
  }
});

// Method to compare passwords
AdminSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  try {
    const hash = crypto.createHash("sha256");
    hash.update(candidatePassword);
    const hashedCandidate = hash.digest("hex");
    return hashedCandidate === this.password;
  } catch (error) {
    console.error("Password comparison error:", error);
    return false;
  }
};

// Static method to find by email
AdminSchema.statics.findByEmail = async function (
  email: string
): Promise<IAdmin | null> {
  return this.findOne({ email: email.toLowerCase() });
};

// Instance method to check if admin has specific permission
AdminSchema.methods.hasPermission = function (
  permission: keyof IAdmin["permissions"]
): boolean {
  // Super admin has all permissions
  if (this.role === "super_admin") {
    return true;
  }
  // Check specific permission for other roles
  return this.permissions[permission] === true;
};

// Instance method to invalidate all sessions
AdminSchema.methods.invalidateSession = async function (): Promise<void> {
  this.sessionVersion = (this.sessionVersion || 1) + 1;
  await this.save();
};

// Ensure we don't create multiple models during hot reload in development
const Admin =
  (mongoose.models?.Admin as IAdminModel) ||
  mongoose.model<IAdmin, IAdminModel>("Admin", AdminSchema);

export default Admin;
