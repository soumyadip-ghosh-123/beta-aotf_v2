import Subject from "@/lib/models/Subject";
import Source from "@/lib/models/Source";

export async function listSubjects() {
  return Subject.find().sort({ label: 1 }).lean();
}

export async function createSubject({ key, label }: { key: string; label: string }) {
  const doc = await Subject.create({ key, label });
  return doc.toObject();
}

export async function updateSubjectById(id: string, { key, label }: { key: string; label: string }) {
  const doc = await Subject.findByIdAndUpdate(
    id,
    { key, label },
    { new: true, runValidators: true },
  ).lean();
  return doc;
}

export async function deleteSubjectById(id: string) {
  return Subject.findByIdAndDelete(id).lean();
}

export async function listSources() {
  return Source.find().sort({ label: 1 }).lean();
}

export async function createSource({ key, label }: { key: string; label: string }) {
  const doc = await Source.create({ key, label });
  return doc.toObject();
}

export async function updateSourceById(id: string, { key, label }: { key: string; label: string }) {
  const doc = await Source.findByIdAndUpdate(
    id,
    { key, label },
    { new: true, runValidators: true },
  ).lean();
  return doc;
}

export async function deleteSourceById(id: string) {
  return Source.findByIdAndDelete(id).lean();
}
