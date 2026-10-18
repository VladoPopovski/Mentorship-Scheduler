import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-6 p-6 text-center">
      <h1 className="text-3xl font-bold">Book a session</h1>
      <p className="text-gray-600">Publish your availability, or pick a time that works for you.</p>
      <div className="flex w-full flex-col gap-3 sm:flex-row">
        <Link to="/host" className="flex-1 rounded-xl bg-indigo-600 p-4 font-semibold text-white">
          I'm hosting
        </Link>
        <Link to="/book" className="flex-1 rounded-xl border p-4 font-semibold">
          I want to book
        </Link>
      </div>
    </main>
  );
}