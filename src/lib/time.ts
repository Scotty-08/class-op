import type { DayCode, Meeting } from "./types";

export const DAY_LABEL: Record<DayCode, string> = {
  M: "Mon",
  T: "Tue",
  W: "Wed",
  R: "Thu",
  F: "Fri",
};

export const DAY_ORDER: DayCode[] = ["M", "T", "W", "R", "F"];

export function parseHHMM(s: string | null | undefined): number | null {
  if (!s) return null;
  const m = s.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}

export function formatClock(hhmm: string | null): string {
  const mins = parseHHMM(hhmm);
  if (mins == null) return "—";
  let h = Math.floor(mins / 60);
  const m = mins % 60;
  const ap = h >= 12 ? "p" : "a";
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${h}:${String(m).padStart(2, "0")}${ap}`;
}

export function formatRange(start: string | null, end: string | null): string {
  if (!start && !end) return "Online / arranged";
  return `${formatClock(start)}–${formatClock(end)}`;
}

export function formatDays(days: DayCode[]): string {
  if (!days.length) return "—";
  const s = days.join("");
  if (s === "MWF") return "MWF";
  if (s === "TR") return "TR";
  if (s === "MTWRF") return "MTWRF";
  return days.map((d) => DAY_LABEL[d]).join("/");
}

export const GRID_START = 7 * 60 + 30; // 7:30a
export const GRID_END = 21 * 60 + 15; // 9:15p
export const HOUR_PX = 56;

export function minutesToY(mins: number): number {
  return ((mins - GRID_START) / 60) * HOUR_PX;
}

export function durationPx(start: string | null, end: string | null): number {
  const a = parseHHMM(start);
  const b = parseHHMM(end);
  if (a == null || b == null) return HOUR_PX;
  return Math.max(24, ((b - a) / 60) * HOUR_PX);
}

export function meetingsConflict(a: Meeting, b: Meeting): boolean {
  if (a.id === b.id) return false;
  if (a.online || b.online || !a.start || !a.end || !b.start || !b.end) return false;
  const share = a.days.some((d) => b.days.includes(d));
  if (!share) return false;
  const as = parseHHMM(a.start)!;
  const ae = parseHHMM(a.end)!;
  const bs = parseHHMM(b.start)!;
  const be = parseHHMM(b.end)!;
  return as < be && bs < ae;
}

export function conflictingIds(meetings: Meeting[]): Set<string> {
  const ids = new Set<string>();
  for (let i = 0; i < meetings.length; i++) {
    for (let j = i + 1; j < meetings.length; j++) {
      if (meetingsConflict(meetings[i], meetings[j])) {
        ids.add(meetings[i].id);
        ids.add(meetings[j].id);
      }
    }
  }
  return ids;
}

export function uid(prefix = "m"): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}
