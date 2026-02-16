import { AgendaEvent } from "./types";
import { formatMonth, getWeekRange } from "./dateUtils";

export function groupAgenda(events: AgendaEvent[]) {
    const sorted = [...events].sort(
        (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
    );

    const result: any = {};

    sorted.forEach(event => {
        const date = new Date(event.start);
        const month = formatMonth(date);
        const week = getWeekRange(date);
        const day = date.toISOString().split("T")[0];

        if (!result[month]) result[month] = {};
        if (!result[month][week]) result[month][week] = {};
        if (!result[month][week][day]) result[month][week][day] = [];

        result[month][week][day].push(event);
    });

    return result;
}
