import AgendaView from "@/components/calendar/AgendaView";
import { agendaEvents } from "@/components/calendar/sampleData";

const page = () => {
  return (
    <div className="w-full">
      {/* <Calendar /> */}
      <AgendaView events={agendaEvents} />
    </div>
  );
};

export default page;
