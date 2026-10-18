import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { createSlot } from "../lib/api";

const schema = z
  .object({
    date: z.string().min(1, "Pick a date"),
    time: z.string().min(1, "Pick a start time"),
    duration: z.enum(["15", "30", "45", "60"]),
  })
  // Joining date and time with "T" gives e.g. 2026-10-20T14:00, read as local time
  .refine((v) => new Date(`${v.date}T${v.time}`) > new Date(), {
    message: "The slot must be in the future",
    path: ["time"], // show the error under the time field
  });

type FormValues = z.infer<typeof schema>;

export default function SlotForm() {
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);
  const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD, used as the date picker's min

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { duration: "30" },
  });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      await createSlot(new Date(`${values.date}T${values.time}`), Number(values.duration));
      await queryClient.invalidateQueries({ queryKey: ["slots"] }); // refresh the list
      reset({ date: values.date, time: "", duration: values.duration });
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "Something went wrong.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mb-8 space-y-4 rounded-xl border bg-white p-4">
      <h2 className="font-semibold">Add a time slot</h2>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block text-sm">
          Date
          <input type="date" min={today} {...register("date")} className="mt-1 w-full rounded border p-2" />
          {errors.date && <span className="text-red-600">{errors.date.message}</span>}
        </label>

        <label className="block text-sm">
          Start time
          <input type="time" {...register("time")} className="mt-1 w-full rounded border p-2" />
          {errors.time && <span className="text-red-600">{errors.time.message}</span>}
        </label>

        <label className="block text-sm">
          Duration
          <select {...register("duration")} className="mt-1 w-full rounded border p-2">
            <option value="15">15 min</option>
            <option value="30">30 min</option>
            <option value="45">45 min</option>
            <option value="60">60 min</option>
          </select>
        </label>
      </div>

      {serverError && (
        <p role="alert" className="text-sm text-red-600">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-white disabled:opacity-50"
      >
        {isSubmitting ? "Adding…" : "Add slot"}
      </button>
    </form>
  );
}