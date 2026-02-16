export const formatMonth = (date: Date) =>
    date.toLocaleString("default", { month: "long", year: "numeric" });

export const formatDay = (date: Date) =>
    date.toLocaleString("default", { weekday: "short" });

export const formatDate = (date: Date) => date.getDate();

export const formatTimeRange = (start: string, end?: string) => {
    const s = new Date(start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (!end) return s;
    const e = new Date(end).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return `${s} - ${e}`;
};

export function getWeekRange(date: Date) {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay());
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    return `${start.getDate()}–${end.getDate()} ${start.toLocaleString("default", { month: "short" })}`;
}
