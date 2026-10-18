import { formatRange } from "../lib/dates";
import type { Slot } from "../lib/types";

type Props = { slot: Slot; onBook?: (slot: Slot) => void };

export default function SlotRow({ slot, onBook }: Props) {
  const booked = slot.status === "booked";

  return (
    <li
      className={`flex items-center justify-between rounded-lg border p-3 ${
        booked ? "bg-gray-100 text-gray-400" : "bg-white"
      }`}
    >
      <div>
        <span className="font-medium">{formatRange(slot)}</span>
        <span className="ml-2 text-sm">{slot.duration_min} min</span>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={`rounded-full px-2 py-0.5 text-xs ${
            booked ? "bg-gray-200" : "bg-green-100 text-green-800"
          }`}
        >
          {booked ? "Booked" : "Open"}
        </span>
        {/* The Book button only appears if the page passed onBook, and only on open slots */}
        {!booked && onBook && (
          <button
            onClick={() => onBook(slot)}
            className="rounded-lg bg-indigo-600 px-3 py-1 text-sm text-white"
          >
            Book
          </button>
        )}
      </div>
    </li>
  );
}