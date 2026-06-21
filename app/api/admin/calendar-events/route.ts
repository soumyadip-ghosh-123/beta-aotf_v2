import { handleApiError } from "@/lib/api-utils";
import { NextResponse } from "next/server";
import { startOfMonth, endOfMonth, startOfDay, endOfDay } from "date-fns";
import dbConnect from "@/lib/db";
import CalendarEvent from "@/lib/models/CalendarEvent";
import type { IEvent } from "@/calendar/interfaces";
import type { TEventColor } from "@/calendar/types";
import mongoose from "mongoose";

async function getEventsInRange(startDate: Date, endDate: Date): Promise<IEvent[]> {
  const docs = await CalendarEvent.find({
    startAt: mongoose.trusted({ $lte: endDate }),
    endAt: mongoose.trusted({ $gte: startDate }),
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
    const dateParam = searchParams.get("date");
    const monthParam = searchParams.get("month");
    const refDate = dateParam
      ? new Date(dateParam)
      : monthParam
        ? new Date(`${monthParam}-01`)
        : new Date();

    const startDate = dateParam ? startOfDay(refDate) : startOfMonth(refDate);
    const endDate = dateParam ? endOfDay(refDate) : endOfMonth(refDate);

    const events = await getEventsInRange(startDate, endDate);
    return NextResponse.json({ events });
  } catch (error) {
    return handleApiError(error, "GET /api/admin/calendar-events", { legacyAdminShape: true });
  }
}
