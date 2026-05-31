import { NextResponse } from "next/server";
import { listSubjects, createSubject } from "@/lib/services/adminOptions.service";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import Admin from "@/lib/models/Admin";
import { logActivity } from "@/lib/admin/logActivity";
import dbConnect from "@/lib/db";

export async function GET() {
  const subjects = await listSubjects();
  return NextResponse.json({ subjects });
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const currentAdmin = await Admin.findOne({ clerkId: userId }).lean();
    if (!currentAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const schema = z.object({ key: z.string().min(1), label: z.string().min(1) });
    const data = schema.parse(body);
    const subject = await createSubject(data);

    await logActivity({
      admin: currentAdmin as any,
      action: "CREATE_SUBJECT",
      module: "ADMIN_MGMT",
      targetType: "Subject",
      targetId: subject._id as any,
      targetRefId: subject.key,
      metadata: { label: subject.label },
    });

    return NextResponse.json({ subject });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
