import { NextRequest, NextResponse } from "next/server";

// ─── Sample records (used until Teacher/User model is ready) ──────────────────

const SAMPLE_RECORDS: Record<string, {
  role: "teacher" | "candidate";
  name: string;
  photo: string;
  designation?: string;
  qualification?: string;
  subjects?: string[];
  employeeId: string;
  phone: string;
  email: string;
  joinDate: string;
  expiryDate: string;
  isVerified: boolean;
  plan?: string;
  status: "active" | "expired" | "suspended";
}> = {
  "AOTF-T-2024-0042": {
    role: "teacher",
    name: "Somnath Roy",
    photo: "https://i.pravatar.cc/150?u=a04258114e29026708c",
    designation: "Senior Physics Faculty",
    qualification: "M.Sc in Physics — Jadavpur University",
    subjects: ["Physics", "Mathematics", "Chemistry"],
    employeeId: "AOTF-T-2024-0042",
    phone: "+91 94567-38901",
    email: "soumyadip@example.com",
    joinDate: "Jan 2024",
    expiryDate: "Dec 2026",
    isVerified: true,
    status: "active",
  },
  "AOTF-C-2025-0118": {
    role: "candidate",
    name: "Somnath Roy",
    photo: "https://i.pravatar.cc/150?u=a04258114e29026708c",
    designation: "Aspiring Educator",
    qualification: "M.Sc in Physics — Jadavpur University",
    subjects: ["Physics", "Mathematics"],
    employeeId: "AOTF-C-2025-0118",
    phone: "+91 94567-38901",
    email: "soumyadip@example.com",
    joinDate: "Mar 2025",
    expiryDate: "Mar 2026",
    isVerified: true,
    plan: "premium",
    status: "active",
  },
  "AOTF-T-2023-0007": {
    role: "teacher",
    name: "Ananya Mukherjee",
    photo: "https://i.pravatar.cc/150?u=ananya007",
    designation: "Mathematics Head",
    qualification: "M.Sc in Mathematics — IIT Kharagpur",
    subjects: ["Mathematics", "Statistics"],
    employeeId: "AOTF-T-2023-0007",
    phone: "+91 98765-12345",
    email: "ananya@example.com",
    joinDate: "Aug 2023",
    expiryDate: "Aug 2024",
    isVerified: true,
    status: "expired",
  },
};

// ─── GET /api/v1/verify/[id] ─────────────────────────────────────────────────

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);

  // TODO: When Teacher/User model exists, query DB here:
  // const person = await TeacherService.findByEmployeeId(decodedId);

  const person = SAMPLE_RECORDS[decodedId];

  if (!person) {
    return NextResponse.json(
      { success: false, error: "ID not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    person,
    _sampleData: true, // indicates this is sample data — remove when DB is connected
  });
}
