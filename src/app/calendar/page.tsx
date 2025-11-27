import { CalendarHijri } from "@/components/ui/calendar/calendar";

export default function CalendarPage() {
    return (
        <div className="flex flex-col px-6 gap-8">
            <h1 className="text-2xl font-semibold text-foreground">Calendrier</h1>
            <CalendarHijri />
        </div>
    );
}   