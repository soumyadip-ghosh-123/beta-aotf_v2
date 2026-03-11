import mongoose, { Schema, Document, Model, models } from "mongoose";

export interface IRenownedTeacher extends Document {
  name: string;
  designation: string;
  image: string;
  quote: string;
  order: number;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RenownedTeacherSchema = new Schema<IRenownedTeacher>(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    designation: { type: String, required: true, trim: true, maxlength: 200 },
    image: { type: String, required: true, trim: true },
    quote: { type: String, required: true, trim: true, maxlength: 500 },
    order: { type: Number, required: true, default: 0 },
    isVisible: { type: Boolean, required: true, default: true },
  },
  {
    timestamps: true,
    collection: "renowned_teachers",
  },
);

RenownedTeacherSchema.index({ order: 1 });
RenownedTeacherSchema.index({ isVisible: 1, order: 1 });

const RenownedTeacher: Model<IRenownedTeacher> =
  models.RenownedTeacher ||
  mongoose.model<IRenownedTeacher>("RenownedTeacher", RenownedTeacherSchema);

export default RenownedTeacher;
