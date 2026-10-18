import { useSlots } from "../hooks/useSlots";
import { formatDay, groupByDay, timeZone } from "../lib/dates";
import type { Slot } from "../lib/types";
import SlotRow from "./SlotRow";

type Props = { onBook?: (slot: Slot) => void };

export default function SlotList({ onBook }: Props) {
  const { data: slots, isLoading, error } = useSlots();

  if (isLoading) return <p className="text-gray-500">Loading slots…</p>;
  if (error) return <p className="text-red-600">Couldn't load slots. Try refreshing.</p>;
  if (!slots || slots.length === 0) return <p className="text-gray-500">No upcoming slots yet.</p>;

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">Times shown in your time zone ({timeZone})</p>
      {groupByDay(slots).map(([day, daySlots]) => (
        <section key={day}>
          <h3 className="mb-2 font-semibold">{formatDay(daySlots[0].starts_at)}</h3>
          <ul className="space-y-2">
            {daySlots.map((slot) => (
              <SlotRow key={slot.id} slot={slot} onBook={onBook} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}