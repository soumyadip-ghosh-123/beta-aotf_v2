import { formatDay, formatDate } from "./dateUtils";
import EventPill from "./EventPill";

export default function DayRow({
  date,
  events,
}: {
  date: string;
  events: any[];
}) {
  const d = new Date(date);

  return (
    <div className="flex gap-4">
      <div className="w-14 text-center">
        <div className="text-sm text-gray-500">{formatDay(d)}</div>
        <div className="text-2xl font-semibold">{formatDate(d)}</div>
      </div>

      <div className="flex-1 flex flex-col gap-3">
        {events.map((ev) => (
          <EventPill key={ev.id} event={ev} />
        ))}
      </div>
    </div>
  );
}
