import type { Slot } from "./types";

const timeFormat: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" };

// "02:00 PM – 02:30 PM"
export function formatRange(slot: Slot): string {
  const start = new Date(slot.starts_at);
  const end = new Date(start.getTime() + slot.duration_min * 60_000);
  return `${start.toLocaleTimeString([], timeFormat)} – ${end.toLocaleTimeString([], timeFormat)}`;
}

// "Tuesday, October 20"
export function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

// Slots arrive sorted, so the groups come out in date order
export function groupByDay(slots: Slot[]): [string, Slot[]][] {
  const groups: Record<string, Slot[]> = {};
  for (const slot of slots) {
    const day = new Date(slot.starts_at).toDateString();
    if (!groups[day]) groups[day] = [];
    groups[day].push(slot);
  }
  return Object.entries(groups);
}

export const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;