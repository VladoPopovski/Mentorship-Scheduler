import { useEffect, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { getConfirmationMessage } from "../lib/api";
import { formatDay, formatRange } from "../lib/dates";
import { downloadIcs } from "../lib/ics";
import type { Slot } from "../lib/types";

type State = { slot: Slot; name: string };

export default function ConfirmationPage() {
  const state = useLocation().state as State | null;
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (state) getConfirmationMessage(state.name, state.slot).then(setMessage);
  }, [state]);

  if (!state) return <Navigate to="/book" replace />; // opened directly, nothing to show

  const { slot, name } = state;
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="text-5xl">🎉</div>
      <h1 className="text-2xl font-bold">You're booked, {name}!</h1>
      <p className="text-gray-700">
        {formatDay(slot.starts_at)} · {formatRange(slot)} · {slot.duration_min} min
      </p>

      <p className="min-h-12 text-gray-600">{message ?? "Writing your confirmation…"}</p>

      <div className="flex gap-3">
        <button onClick={() => downloadIcs(slot)} className="rounded-lg bg-indigo-600 px-4 py-2 text-white">
          Add to calendar
        </button>
        <Link to="/book" className="rounded-lg border px-4 py-2">Back to slots</Link>
      </div>
    </main>
  );
}