import { NextResponse } from "next/server";
import { startOfMonth, endOfMonth } from "date-fns";
import dbConnect from "@/lib/db";
import CalendarEvent from "@/lib/models/CalendarEvent";
import type { IEvent } from "@/calendar/interfaces";
import type { TEventColor } from "@/calendar/types";
import mongoose from "mongoose";

async function getNewEvents(monthStart: Date, monthEnd: Date): Promise<IEvent[]> {
  const docs = await CalendarEvent.find({
    startAt: mongoose.trusted({ $gte: monthStart, $lte: monthEnd }),
  })
    .sort({ startAt: 1 })
    .lean();

  return docs.map((doc) => ({
    id: doc._id.toString(),
    startDate: doc.startAt.toISOString(),
    endDate: doc.endAt.toISOString(),
    title: doc.title,
    color: doc.color as TEventColor,
    description: doc.description,
    user: {
      id: doc.owner.adminId ?? "system",
      name: doc.owner.adminName ?? "System",
      picturePath: null,
    },
    category: doc.category,
    sourceId: doc.source.sourceId,
  }));
}

export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get("month");
    const refDate = monthParam ? new Date(`${monthParam}-01`) : new Date();
    const monthStart = startOfMonth(refDate);
    const monthEnd = endOfMonth(refDate);

    const events = await getNewEvents(monthStart, monthEnd);
    return NextResponse.json({ events });
  } catch (err) {
    console.error("[calendar-events] Error:", err);
    return NextResponse.json({ events: [], error: String(err) }, { status: 500 });
  }
}
