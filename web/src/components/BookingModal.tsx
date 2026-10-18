import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { bookSlot } from "../lib/api";
import { formatDay, formatRange } from "../lib/dates";
import type { Slot } from "../lib/types";

const schema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(100, "That name is too long"),
  // zod 4 marks .email() as deprecated, but it still works (z.email() is the new form)
  email: z.string().email("Enter a valid email"),
});
type FormValues = z.infer<typeof schema>;

type Props = { slot: Slot; onClose: () => void };

export default function BookingModal({ slot, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  // This component only exists while a slot is selected, so open the native modal on mount
  useEffect(() => {
    if (!dialogRef.current?.open) dialogRef.current?.showModal();
  }, []);

  const onSubmit = async (values: FormValues) => {
    setError(null);
    try {
      await bookSlot(slot.id, values.name, values.email);
      navigate("/confirmed", { state: { slot, name: values.name } });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      // Success or failure, reload the list so it shows the true state
      queryClient.invalidateQueries({ queryKey: ["slots"] });
    }
  };

  return (
    // onClose fires on Esc and on dialog.close(), and tells the page to unmount us
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="m-auto w-full max-w-md rounded-xl p-6 backdrop:bg-black/50"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <h2 className="text-lg font-semibold">Book this time</h2>
        <p className="text-sm text-gray-600">
          {formatDay(slot.starts_at)} · {formatRange(slot)}
        </p>

        <label className="block text-sm">
          Your name
          <input {...register("name")} autoComplete="name" className="mt-1 w-full rounded border p-2" />
          {errors.name && <span className="text-red-600">{errors.name.message}</span>}
        </label>

        <label className="block text-sm">
          Email
          <input type="email" {...register("email")} autoComplete="email" className="mt-1 w-full rounded border p-2" />
          {errors.email && <span className="text-red-600">{errors.email.message}</span>}
        </label>

        {error && (
          <p role="alert" className="rounded bg-red-50 p-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="rounded-lg border px-4 py-2"
          >
            Close
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-white disabled:opacity-50"
          >
            {isSubmitting ? "Booking…" : "Confirm booking"}
          </button>
        </div>
      </form>
    </dialog>
  );
}