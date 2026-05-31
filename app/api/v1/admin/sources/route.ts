import { NextResponse } from "next/server";
import { listSources, createSource } from "@/lib/services/adminOptions.service";
import { z } from "zod";

export async function GET() {
  const sources = await listSources();
  return NextResponse.json({ sources });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const schema = z.object({ key: z.string().min(1), label: z.string().min(1) });
    const data = schema.parse(body);
    const source = await createSource(data);
    return NextResponse.json({ source });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
