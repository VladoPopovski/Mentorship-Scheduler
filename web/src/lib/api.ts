import { supabase } from "./supabase";
import { formatDay, formatRange } from "./dates";
import type { Slot } from "./types";

export async function listSlots(): Promise<Slot[]> {
  const { data, error } = await supabase
    .from("slots")
    .select("*")
    .gte("starts_at", new Date().toISOString()) // hide past slots
    .order("starts_at", { ascending: true });
  if (error) throw error;
  return data as Slot[];
}

export async function createSlot(startsAt: Date, durationMin: number): Promise<void> {
  const { error } = await supabase
    .from("slots")
    .insert({ starts_at: startsAt.toISOString(), duration_min: durationMin });
  if (error) {
    // 23505 = unique violation: a slot already starts at this time
    if (error.code === "23505") throw new Error("You already have a slot at that time.");
    throw new Error("Couldn't create the slot. Please try again.");
  }
}

export async function bookSlot(slotId: string, name: string, email: string): Promise<void> {
  const { error } = await supabase.rpc("book_slot", {
    p_slot_id: slotId, // parameter names must match the SQL function exactly
    p_name: name,
    p_email: email,
  });
  if (error) {
    if (error.message.includes("SLOT_TAKEN")) {
      throw new Error("Sorry, that slot was just taken. Please pick another.");
    }
    throw new Error("Couldn't complete the booking. Please try again.");
  }
}

// Used in Phase 7. Never throws: the booking is already saved, so the AI is a bonus.
export async function getConfirmationMessage(name: string, slot: Slot): Promise<string> {
  const fallback = `You're booked, ${name}! Looking forward to seeing you.`;
  try {
    const { data, error } = await supabase.functions.invoke("confirmation-message", {
      body: {
        name,
        when: `${formatDay(slot.starts_at)}, ${formatRange(slot)}`,
        durationMin: slot.duration_min,
      },
    });
    return error || !data?.message ? fallback : (data.message as string);
  } catch {
    return fallback;
  }
}