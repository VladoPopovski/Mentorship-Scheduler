import { Link } from "react-router-dom";
import SlotForm from "../components/SlotForm";
import SlotList from "../components/SlotList";

export default function HostPage() {
  return (
    <main className="mx-auto max-w-2xl p-6">
      <Link to="/" className="text-sm text-indigo-600">← Home</Link>
      <h1 className="my-4 text-2xl font-bold">Your availability</h1>
      <SlotForm />
      <SlotList />
    </main>
  );
}