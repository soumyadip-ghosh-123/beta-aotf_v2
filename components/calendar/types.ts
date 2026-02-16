export interface AgendaEvent {
    id: string;
    title: string;
    start: string; // ISO
    end?: string;
    color?: string;
}
