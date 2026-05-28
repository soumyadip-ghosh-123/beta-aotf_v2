import mongoose from "mongoose";
import CalendarEvent from "../lib/models/CalendarEvent";

async function run() {
  try {
    const monthStart = new Date("2026-04-30T18:30:00.000Z");
    const monthEnd = new Date("2026-05-31T18:29:59.999Z");
    const query = { startAt: { $gte: monthStart, $lte: monthEnd } };
    
    console.log("Testing CalendarEvent.find with query:", query);
    
    // We don't need to connect to DB to get a query object and let Mongoose cast it
    const q = CalendarEvent.find(query);
    q.cast(CalendarEvent);
    console.log("Cast successful:", q.getFilter());
  } catch (e) {
    console.error("Cast error:", e);
  }
}

run();
