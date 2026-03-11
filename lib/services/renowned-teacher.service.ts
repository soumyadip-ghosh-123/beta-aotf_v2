import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import RenownedTeacher, {
  type IRenownedTeacher,
} from "@/lib/models/RenownedTeacher";
import { NotFoundError } from "@/lib/errors";
import type {
  CreateRenownedTeacherInput,
  UpdateRenownedTeacherInput,
} from "@/lib/validations/renowned-teacher";

export async function listRenownedTeachers(
  visibleOnly = false,
): Promise<IRenownedTeacher[]> {
  await dbConnect();
  const filter = visibleOnly ? { isVisible: true } : {};
  return RenownedTeacher.find(filter).sort({ order: 1, createdAt: 1 }).lean<
    IRenownedTeacher[]
  >();
}

export async function getRenownedTeacherById(
  id: string,
): Promise<IRenownedTeacher> {
  await dbConnect();
  if (!mongoose.Types.ObjectId.isValid(id)) throw new NotFoundError("RenownedTeacher");
  const doc = await RenownedTeacher.findById(id).lean<IRenownedTeacher>();
  if (!doc) throw new NotFoundError("RenownedTeacher");
  return doc;
}

export async function createRenownedTeacher(
  input: CreateRenownedTeacherInput,
): Promise<IRenownedTeacher> {
  await dbConnect();
  return RenownedTeacher.create(input);
}

export async function updateRenownedTeacher(
  id: string,
  input: UpdateRenownedTeacherInput,
): Promise<IRenownedTeacher> {
  await dbConnect();
  if (!mongoose.Types.ObjectId.isValid(id)) throw new NotFoundError("RenownedTeacher");
  const doc = await RenownedTeacher.findByIdAndUpdate(id, input, {
    new: true,
    runValidators: true,
  }).lean<IRenownedTeacher>();
  if (!doc) throw new NotFoundError("RenownedTeacher");
  return doc;
}

export async function deleteRenownedTeacher(id: string): Promise<void> {
  await dbConnect();
  if (!mongoose.Types.ObjectId.isValid(id)) throw new NotFoundError("RenownedTeacher");
  const result = await RenownedTeacher.findByIdAndDelete(id);
  if (!result) throw new NotFoundError("RenownedTeacher");
}
