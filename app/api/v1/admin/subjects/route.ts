import { NextResponse } from "next/server";
import { listSubjects, createSubject } from "@/lib/services/adminOptions.service";
import { z } from "zod";

export async function GET() {
  const subjects = await listSubjects();
  return NextResponse.json({ subjects });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const schema = z.object({ key: z.string().min(1), label: z.string().min(1) });
    const data = schema.parse(body);
    const subject = await createSubject(data);
    return NextResponse.json({ subject });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
