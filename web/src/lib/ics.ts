import type { Slot } from "./types";

// 2026-10-20T14:00:00.000Z → 20261020T140000Z
const icsDate = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

export function downloadIcs(slot: Slot, title = "Coaching session") {
  const start = new Date(slot.starts_at);
  const end = new Date(start.getTime() + slot.duration_min * 60_000);

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Scheduler//EN",
    "BEGIN:VEVENT",
    `UID:${slot.id}@scheduler`,
    `DTSTAMP:${icsDate(new Date())}`,
    `DTSTART:${icsDate(start)}`,
    `DTEND:${icsDate(end)}`,
    `SUMMARY:${title}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  const url = URL.createObjectURL(new Blob([lines.join("\r\n")], { type: "text/calendar" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "booking.ics";
  link.click();
  URL.revokeObjectURL(url);
}