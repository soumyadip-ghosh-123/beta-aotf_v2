import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Application from "@/lib/models/Application";
import Post from "@/lib/models/Post";
import Job from "@/lib/models/Job";
import Enquiry from "@/lib/models/Enquiry";
import Feedback from "@/lib/models/Feedback";
import Admin from "@/lib/models/Admin";
import TodoEvent from "@/lib/models/TodoEvent";
import type { IEvent, IUser } from "@/calendar/interfaces";
import type { TEventColor } from "@/calendar/types";

// ─── Status → label + color ───────────────────────────────────────────────

const TUITION_APP_STATUS: Record<string, { label: string; color: TEventColor }> = {
  applied:       { label: "Demo Reminder",      color: "blue"   },
  DC:            { label: "Demo Confirmation",  color: "yellow" },
  GC:            { label: "Guardian Confirmed", color: "orange" },
  approved:      { label: "Completed",          color: "green"  },
  decline:       { label: "Declined",           color: "red"    },
  auto_declined: { label: "Declined",           color: "red"    },
  withdrawn:     { label: "Withdrawn",          color: "gray"   },
};

const ENQ_STATUS: Record<string, { label: string; color: TEventColor }> = {
  new:         { label: "Pending",  color: "orange" },
  in_progress: { label: "Pending",  color: "yellow" },
  contacted:   { label: "Pending",  color: "blue"   },
  unreachable: { label: "Pending",  color: "red"    },
  resolved:    { label: "Resolved", color: "green"  },
  closed:      { label: "Resolved", color: "gray"   },
};

const FB_STATUS: Record<string, { label: string; color: TEventColor }> = {
  open:     { label: "Needs Review", color: "red"    },
  seen:     { label: "Under Review", color: "yellow" },
  resolved: { label: "Resolved",     color: "green"  },
};

const TODO_STATUS: Record<string, { label: string; color: TEventColor }> = {
  demo_reminder:      { label: "Demo Reminder",      color: "yellow" },
  demo_confirmation:  { label: "Demo Confirmation",  color: "blue"   },
  guardian_confirmed: { label: "Guardian Confirmed", color: "orange" },
  completed:          { label: "Completed",          color: "green"  },
  pending:            { label: "Pending",            color: "orange" },
  resolved:           { label: "Resolved",           color: "green"  },
  sent_to_company:    { label: "Sent to Company",    color: "blue"   },
  open:               { label: "Open",               color: "red"    },
  under_review:       { label: "Under Review",       color: "yellow" },
  action_taken:       { label: "Action Taken",       color: "purple" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────

const SYS: IUser = { id: "system", name: "System", picturePath: null };
let _id = 1;

function mkEvt(
  title: string,
  desc: string,
  color: TEventColor,
  date: Date,
  durMin = 60,
  user: IUser = SYS,
): IEvent {
  const start = isNaN(date.getTime()) ? new Date() : date;
  return {
    id: _id++,
    startDate: start.toISOString(),
    endDate: new Date(start.getTime() + durMin * 60_000).toISOString(),
    title,
    color,
    description: desc,
    user,
  };
}

// ─── GET /api/admin/calendar-events ──────────────────────────────────────

export async function GET() {
  try {
    await dbConnect();
    _id = 1;
    const events: IEvent[] = [];

    // ── Admin map ────────────────────────────────────────────────────────
    const admins = await Admin.find({ isActive: true, terminatedAt: null })
      .select("name _id clerkId")
      .lean();

    const adminById = new Map<string, IUser>();
    const adminByClerkId = new Map<string, IUser>();
    for (const a of admins as any[]) {
      const u: IUser = { id: a._id.toString(), name: a.name ?? "Admin", picturePath: null };
      adminById.set(a._id.toString(), u);
      if (a.clerkId) adminByClerkId.set(a.clerkId, u);
    }
    const byAdmin = (id?: string, clerk?: string): IUser =>
      (id && adminById.get(id)) || (clerk && adminByClerkId.get(clerk)) || SYS;

    // ── 1. ALL Applications — split by JS (avoids $exists sanitizeFilter) ─
    const allApps = await Application.find({})
      .sort({ updatedAt: -1 })
      .limit(1000)
      .lean() as any[];

    const tuitionApps = allApps.filter((a) => typeof a.postId === "string" && a.postId);
    const jobApps     = allApps.filter((a) => typeof a.jobIdPublic === "string" && a.jobIdPublic);

    // Build post lookup (one findOne per unique postId — avoids $in)
    const seenPosts = new Set<string>();
    const postMap = new Map<string, any>();
    for (const a of tuitionApps) {
      if (!seenPosts.has(a.postId)) {
        seenPosts.add(a.postId);
        const p = await Post.findOne({ postId: a.postId })
          .select("guardianName guardianPhone location postId")
          .lean();
        if (p) postMap.set(a.postId, p);
      }
    }

    // Build job lookup
    const seenJobs = new Set<string>();
    const jobMap = new Map<string, any>();
    for (const a of jobApps) {
      if (!seenJobs.has(a.jobIdPublic)) {
        seenJobs.add(a.jobIdPublic);
        const j = await Job.findOne({ jobId: a.jobIdPublic })
          .select("title clientName jobId")
          .lean();
        if (j) jobMap.set(a.jobIdPublic, j);
      }
    }

    // ── Tuition application events ────────────────────────────────────────
    for (const a of tuitionApps) {
      const st = TUITION_APP_STATUS[a.status] ?? { label: a.status, color: "blue" as TEventColor };
      const post = postMap.get(a.postId);
      const guardian = post
        ? `${(post as any).guardianName} · ${(post as any).guardianPhone} · ${(post as any).location}`
        : `Post: ${a.postId}`;

      // Use scheduled date for DC/GC, else fall back to updatedAt
      const rawDate =
        (a.status === "DC" && a.dcMeta?.scheduledDate) ||
        (a.status === "GC" && a.gcMeta?.scheduledDate) ||
        a.updatedAt ||
        new Date();

      const adminUser = byAdmin(
        a.dcMeta?.setByAdminId?.toString() ||
        a.gcMeta?.setByAdminId?.toString() ||
        a.approvalMeta?.approvedByAdminId?.toString(),
      );

      events.push(mkEvt(
        `📚 ${a.applicantSnapshot?.name ?? "Teacher"} — ${st.label}`,
        [
          `[Tuition Application]`,
          `Status: ${st.label}`,
          `Teacher: ${a.applicantSnapshot?.name ?? "—"}`,
          `Phone: ${a.applicantSnapshot?.phone ?? "—"}`,
          `Email: ${a.applicantSnapshot?.email ?? "—"}`,
          `Guardian: ${guardian}`,
          `Post ID: ${a.postId}`,
        ].join("\n"),
        st.color,
        new Date(rawDate),
        60,
        adminUser,
      ));
    }

    // ── Enquiry events ────────────────────────────────────────────────────
    const enquiries = await Enquiry.find({}).sort({ updatedAt: -1 }).limit(300).lean() as any[];
    for (const e of enquiries) {
      const st = ENQ_STATUS[e.currentStatus] ?? { label: e.currentStatus ?? "new", color: "orange" as TEventColor };
      const date = new Date(e.lastActionAt ?? e.updatedAt ?? Date.now());
      const adminUser = byAdmin(e.lastActionByAdminId?.toString());

      events.push(mkEvt(
        `📋 ${e.name} — ${st.label}`,
        [
          `[Enquiry]`,
          `Status: ${st.label}`,
          `Name: ${e.name}`,
          `Phone: ${e.phoneNumber}`,
          `Query: ${(e.query ?? "").slice(0, 120)}`,
          e.lastActionNote ? `Note: ${(e.lastActionNote as string).slice(0, 80)}` : "",
        ].filter(Boolean).join("\n"),
        st.color,
        date,
        30,
        adminUser,
      ));
    }

    // ── Job application events ────────────────────────────────────────────
    for (const a of jobApps) {
      const isForwarded = ["DC", "GC", "approved"].includes(a.status);
      const label = isForwarded ? "Sent to Company" : a.status === "applied" ? "Pending" : (TUITION_APP_STATUS[a.status]?.label ?? a.status);
      const color: TEventColor = isForwarded ? "blue" : a.status === "applied" ? "orange" : (TUITION_APP_STATUS[a.status]?.color ?? "blue");
      const job = jobMap.get(a.jobIdPublic);
      const jobInfo = job ? `${(job as any).title} @ ${(job as any).clientName}` : `Job: ${a.jobIdPublic}`;
      const adminUser = byAdmin(a.approvalMeta?.approvedByAdminId?.toString());

      events.push(mkEvt(
        `💼 ${a.applicantSnapshot?.name ?? "Applicant"} — ${label}`,
        [
          `[Job Application]`,
          `Status: ${label}`,
          `Applicant: ${a.applicantSnapshot?.name ?? "—"}`,
          `Phone: ${a.applicantSnapshot?.phone ?? "—"}`,
          `Email: ${a.applicantSnapshot?.email ?? "—"}`,
          `Job: ${jobInfo}`,
          `Job ID: ${a.jobIdPublic}`,
        ].join("\n"),
        color,
        new Date(a.updatedAt ?? Date.now()),
        60,
        adminUser,
      ));
    }

    // ── Feedback events ───────────────────────────────────────────────────
    const feedbacks = await Feedback.find({}).sort({ updatedAt: -1 }).limit(300).lean() as any[];
    for (const f of feedbacks) {
      const st = FB_STATUS[f.status] ?? { label: f.status ?? "open", color: "purple" as TEventColor };
      const date = new Date(f.handledAt ?? f.updatedAt ?? Date.now());
      const adminUser = byAdmin(f.handledByAdminId?.toString());

      events.push(mkEvt(
        `💬 ${f.userSnapshot?.name ?? "User"} — ${f.category} · ${st.label}`,
        [
          `[Feedback]`,
          `Status: ${st.label}`,
          `From: ${f.userSnapshot?.name ?? "—"} (${(f.userSnapshot?.role ?? "").replace("_", " ")})`,
          `Email: ${f.userSnapshot?.email ?? "—"}`,
          `Category: ${f.category}`,
          `Subject: ${f.subject}`,
          `Rating: ${f.rating ?? "N/A"}`,
          (f.message ?? "").slice(0, 100),
          f.adminNotes ? `Admin Notes: ${(f.adminNotes as string).slice(0, 60)}` : "",
        ].filter(Boolean).join("\n"),
        st.color,
        date,
        30,
        adminUser,
      ));
    }

    // ── Manual TodoEvent reminders ────────────────────────────────────────
    const todos = await TodoEvent.find({}).sort({ dueAt: 1 }).limit(500).lean() as any[];
    const catEmoji: Record<string, string> = { tuition: "📚", enquiry: "📋", job: "💼", feedback: "💬" };
    for (const t of todos) {
      const st = TODO_STATUS[t.status] ?? { label: t.status ?? "", color: "blue" as TEventColor };
      const color: TEventColor = t.isDone ? "gray" : st.color;
      const adminUser = byAdmin(t.handledByAdminId?.toString());
      const doneTag = t.isDone ? "✅ DONE · " : "";

      events.push(mkEvt(
        `${catEmoji[t.category] ?? "✅"} ${doneTag}${t.title}`,
        [
          `[Reminder · ${(t.category as string).toUpperCase()} — ${st.label}]`,
          t.note ?? "",
          t.refLabel ? `Ref: ${t.refLabel}` : "",
          `By: ${t.handledByAdminName ?? adminUser.name}`,
        ].filter(Boolean).join("\n"),
        color,
        new Date(t.dueAt),
        60,
        adminUser,
      ));
    }

    return NextResponse.json({ events });
  } catch (err) {
    console.error("[calendar-events] Error:", err);
    return NextResponse.json({ events: [], error: String(err) }, { status: 500 });
  }
}
