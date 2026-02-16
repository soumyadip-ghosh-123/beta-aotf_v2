import { groupAgenda } from "./groupEvents";
import MonthHeader from "./MonthHeader";
import WeekHeader from "./WeekHeader";
import DayRow from "./DayRow";
import { AgendaEvent } from "./types";

export default function AgendaView({ events }: { events: AgendaEvent[] }) {
  const data = groupAgenda(events);

  return (
    <div className="max-w-xl mx-auto p-2 space-y-4">
      {Object.entries(data).map(([month, weeks]: any) => (
        <div key={month} className="mb-15">
          <MonthHeader label={month} />

          {Object.entries(weeks).map(([week, days]: any) => (
            <div key={week}>
              <WeekHeader label={week} />
              <div className="space-y-5 mt-2">
                {Object.entries(days).map(([day, events]: any) => (
                  <DayRow key={day} date={day} events={events} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
