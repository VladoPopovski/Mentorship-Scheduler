import { useState } from "react";
import { Link } from "react-router-dom";
import BookingModal from "../components/BookingModal";
import SlotList from "../components/SlotList";
import type { Slot } from "../lib/types";

export default function BookPage() {
  const [selected, setSelected] = useState<Slot | null>(null);

  return (
    <main className="mx-auto max-w-2xl p-6">
      <Link to="/" className="text-sm text-indigo-600">← Home</Link>
      <h1 className="my-4 text-2xl font-bold">Pick a time</h1>

      <SlotList onBook={setSelected} />

      {selected && <BookingModal slot={selected} onClose={() => setSelected(null)} />}
    </main>
  );
}