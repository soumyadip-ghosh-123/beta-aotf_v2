import mongoose, { Schema, Document, Model, models } from "mongoose";

export interface ISubject extends Document {
  key: string;
  label: string;
  createdAt: Date;
  updatedAt: Date;
}

const SubjectSchema = new Schema<ISubject>(
  {
    key: { type: String, required: true, unique: true },
    label: { type: String, required: true },
  },
  { timestamps: true }
);

const Subject: Model<ISubject> = models.Subject || mongoose.model<ISubject>("Subject", SubjectSchema);

export default Subject;
