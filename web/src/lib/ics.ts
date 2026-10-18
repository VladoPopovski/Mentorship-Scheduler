import type { Slot } from "./types";

// 2026-10-20T14:00:00.000Z → 20261020T140000Z
const icsDate = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

function slotTimes(slot: Slot) {
  const start = new Date(slot.starts_at);
  const end = new Date(start.getTime() + slot.duration_min * 60_000);
  return { start, end };
}

export function downloadIcs(slot: Slot, title = "Coaching session") {
  const { start, end } = slotTimes(slot);

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Scheduler//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${slot.id}@scheduler`,
    `DTSTAMP:${icsDate(new Date())}`,
    `DTSTART:${icsDate(start)}`,
    `DTEND:${icsDate(end)}`,
    `SUMMARY:${title}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  // Every line, including the last one, must end with CRLF
  const content = lines.join("\r\n") + "\r\n";
  const url = URL.createObjectURL(new Blob([content], { type: "text/calendar;charset=utf-8" }));

  const link = document.createElement("a");
  link.href = url;
  link.download = "booking.ics";
  document.body.appendChild(link); // some mobile browsers ignore clicks on detached links
  link.click();
  document.body.removeChild(link);

  // Revoking right away can cancel the download on phones, so wait
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

// A plain link that works on any device, with no file involved
export function googleCalendarUrl(slot: Slot, title = "Coaching session") {
  const { start, end } = slotTimes(slot);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${icsDate(start)}/${icsDate(end)}`,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}