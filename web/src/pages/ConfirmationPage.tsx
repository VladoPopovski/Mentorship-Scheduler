import { Link, Navigate, useLocation } from "react-router-dom";
import { formatDay, formatRange } from "../lib/dates";
import type { Slot } from "../lib/types";

export default function ConfirmationPage() {
  const state = useLocation().state as { slot: Slot; name: string } | null;
  if (!state) return <Navigate to="/book" replace />; // opened directly, nothing to show

  const { slot, name } = state;
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="text-5xl">🎉</div>
      <h1 className="text-2xl font-bold">You're booked, {name}!</h1>
      <p className="text-gray-700">
        {formatDay(slot.starts_at)} · {formatRange(slot)} · {slot.duration_min} min
      </p>
      <Link to="/book" className="rounded-lg border px-4 py-2">Back to slots</Link>
    </main>
  );
}