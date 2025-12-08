import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EventBase } from "@/types";

interface EventFilterProps {
  events: Pick<EventBase, "id" | "name">[];
  selectedEventId: string | null;
  onEventChange: (eventId: string | null) => void;
}

export default function EventFilter({ events, selectedEventId, onEventChange }: EventFilterProps) {
  return (
    <Select
      value={selectedEventId || "all"}
      onValueChange={(value) => onEventChange(value === "all" ? null : value)}
    >
      <SelectTrigger className="w-full sm:w-[280px]">
        <SelectValue placeholder="Select event" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Events</SelectItem>
        {events.map((event) => (
          <SelectItem key={event.id} value={event.id}>
            {event.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
