import { NextResponse } from "next/server";
import { z } from "zod";
import { deleteSubjectById, updateSubjectById } from "@/lib/services/adminOptions.service";

const schema = z.object({ key: z.string().min(1), label: z.string().min(1) });

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await req.json();
    const data = schema.parse(body);
    const { id } = await params;
    const subject = await updateSubjectById(id, data);
    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }
    return NextResponse.json({ subject });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const subject = await deleteSubjectById(id);
  if (!subject) {
    return NextResponse.json({ error: "Subject not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
