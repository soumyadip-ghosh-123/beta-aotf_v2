import { useMemo } from "react";
import { formatDate } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { useCalendar } from "@/calendar/contexts/calendar-context";

import { Badge } from "@/components/ui/(calender)/badge";
import { Button } from "@heroui/button";

import { getEventsCount, navigateDate, rangeText } from "@/calendar/helpers";

import type { IEvent } from "@/calendar/interfaces";
import type { TCalendarView } from "@/calendar/types";

interface IProps {
  view: TCalendarView;
  events: IEvent[];
}

export function DateNavigator({ view, events }: IProps) {
  const { selectedDate, setSelectedDate } = useCalendar();

  const safeDate =
    selectedDate instanceof Date && !isNaN(selectedDate.getTime())
      ? selectedDate
      : new Date();

  const month = formatDate(safeDate, "MMMM");
  const year = safeDate.getFullYear();

  const eventCount = useMemo(
    () => getEventsCount(events ?? [], safeDate, view),
    [events, safeDate, view]
  );

  const handlePrevious = () =>
    setSelectedDate(navigateDate(safeDate, view, "previous"));

  const handleNext = () =>
    setSelectedDate(navigateDate(safeDate, view, "next"));

  return (
    <div className="space-y-0.5">
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold">
          {month} {year}
        </span>
        <Badge variant="outline" className="px-1.5">
          {eventCount} events
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        <Button
          isIconOnly
          color="primary"
          variant="solid"
          className="size-6.5 px-0 [&_svg]:size-4.5"
          onClick={handlePrevious}
        >
          <ChevronLeft />
        </Button>

        <p className="text-sm text-muted-foreground">
          {rangeText(view, safeDate)}
        </p>

        <Button
          isIconOnly
          color="primary"
          variant="solid"
          className="size-6.5 px-0 [&_svg]:size-4.5"
          onClick={handleNext}
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
