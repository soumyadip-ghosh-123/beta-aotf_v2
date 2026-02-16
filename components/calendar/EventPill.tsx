import { formatTimeRange } from "./dateUtils";
import { AgendaEvent } from "./types";

export default function EventPill({ event }: { event: AgendaEvent }) {
  return (
    <div
      className="rounded-lg px-3 py-2 text-white w-full"
      style={{ background: event.color || "#4F9D94" }}
    >
      <div className="font-medium">{event.title}</div>
      {event.end && (
        <div className="text-sm opacity-90">
          {formatTimeRange(event.start, event.end)}
        </div>
      )}
    </div>
  );
}
