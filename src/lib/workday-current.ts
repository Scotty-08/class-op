import { BUILDING_BY_ID, BUILDINGS } from "./buildings";
import { uid } from "./time";
import type { DayCode, Meeting, MeetingFormat } from "./types";

/** Confirmed Workday Current Classes export shape (static / localStorage). */
export type WorkdayCurrentClass = {
  course: string;
  section: string;
  title: string;
  format?: string;
  delivery?: string;
  credits?: string | number;
  days?: string[] | string;
  start?: string | null;
  end?: string | null;
  building?: string | null;
  buildingName?: string | null;
  room?: string | null;
  instructor?: string | null;
  sectionId?: string | null;
  status?: string | null;
};

export type WorkdayCurrentExport = {
  source?: string;
  academicPeriodId?: string;
  term?: string;
  exportedAt?: string;
  homeBase?:
    | string
    | {
        address?: string;
        lat?: number;
        lon?: number;
      };
  student?: string;
  program?: string;
  enrolledCredits?: number;
  loadStatus?: string;
  workdayPath?: string;
  classes: WorkdayCurrentClass[];
};

const COURSE_COLORS = [
  "#2563eb",
  "#16a34a",
  "#7c3aed",
  "#dc2626",
  "#0d9488",
  "#64748b",
  "#c2410c",
  "#db2777",
  "#0891b2",
  "#4f46e5",
];

/** Map Workday / Schedule-of-Classes building codes → Class OP building ids. */
const BUILDING_CODE_ALIASES: Record<string, string> = {
  CARVER: "carver",
  CVR: "carver",
  COOVER: "coover",
  COOV: "coover",
  TROXEL: "troxel",
  TRXL: "troxel",
  GILMAN: "gilman",
  GIL: "gilman",
  HACH: "hach",
  HOOVER: "hoover",
  HOOV: "hoover",
  MARSTON: "marston",
  MARS: "marston",
  PEARSON: "pearson",
  PEAR: "pearson",
  PARKS: "parks",
  LIBRARY: "parks",
  ROSS: "ross",
  FRILEY: "friley",
  BEYER: "friley",
  SCIENCE: "science",
  SCI: "science",
  FOODSCI: "foodsci",
  FOODSC: "foodsci",
  FOOD: "foodsci",
  ONLINE: "online",
  WEB: "online",
  ARR: "online",
  ARRANGED: "online",
};

function normalizeKey(raw: string): string {
  return raw
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function resolveBuildingId(
  building?: string | null,
  buildingName?: string | null,
  delivery?: string | null,
): string {
  const deliveryLower = (delivery ?? "").toLowerCase();
  if (deliveryLower.includes("online") || deliveryLower.includes("web")) {
    return "online";
  }

  const candidates = [building, buildingName].filter(Boolean) as string[];
  for (const raw of candidates) {
    const key = normalizeKey(raw);
    if (!key) continue;

    // Exact code alias (CARVER, COOVER, …)
    const compact = key.replace(/\s+/g, "");
    if (BUILDING_CODE_ALIASES[compact]) return BUILDING_CODE_ALIASES[compact];
    // First token (e.g. "CARVER HALL" → CARVER)
    const first = key.split(" ")[0];
    if (BUILDING_CODE_ALIASES[first]) return BUILDING_CODE_ALIASES[first];

    // Match known building id / name / short
    const lower = raw.trim().toLowerCase();
    if (lower === "online") return "online";
    if (BUILDING_BY_ID[lower]) return lower;
    for (const b of BUILDINGS) {
      if (b.id === lower || b.name.toLowerCase() === lower || b.short.toLowerCase() === lower) {
        return b.id;
      }
      if (b.name.toLowerCase().includes(lower) || lower.includes(b.short.toLowerCase())) {
        return b.id;
      }
    }
  }

  return "online";
}

function parseDays(days?: string[] | string | null): DayCode[] {
  if (!days) return [];
  const raw = Array.isArray(days) ? days.join("") : String(days);
  const upper = raw.toUpperCase().replace(/[^MTWRF]/g, "");
  const out: DayCode[] = [];
  for (const ch of upper) {
    if ((ch === "M" || ch === "T" || ch === "W" || ch === "R" || ch === "F") && !out.includes(ch)) {
      out.push(ch);
    }
  }
  return out;
}

function parseFormat(format?: string | null, delivery?: string | null): MeetingFormat {
  const f = (format ?? "").toLowerCase();
  const d = (delivery ?? "").toLowerCase();
  if (f.includes("lab") || f === "laboratory") return "Laboratory";
  if (f.includes("disc") || f.includes("recit")) return "Discussion";
  if (f.includes("online") || d.includes("online") || d.includes("web")) return "Online";
  if (f.includes("lec") || f === "lecture") return "Lecture";
  if (!f && (d.includes("online") || d.includes("web"))) return "Online";
  if (!f) return "Lecture";
  return "Other";
}

function colorForCourse(course: string, index: number): string {
  let hash = 0;
  for (let i = 0; i < course.length; i++) hash = (hash * 31 + course.charCodeAt(i)) | 0;
  return COURSE_COLORS[Math.abs(hash + index) % COURSE_COLORS.length];
}

export function workdayClassToMeeting(c: WorkdayCurrentClass, index: number): Meeting {
  const buildingId = resolveBuildingId(c.building, c.buildingName, c.delivery);
  const days = parseDays(c.days);
  const format = parseFormat(c.format, c.delivery);
  const online = buildingId === "online" || format === "Online" || days.length === 0;
  const credits =
    c.credits == null ? undefined : typeof c.credits === "number" ? String(c.credits) : String(c.credits);

  const notesParts: string[] = [];
  if (c.instructor) notesParts.push(c.instructor);
  if (c.status) notesParts.push(c.status);
  if (c.sectionId) notesParts.push(`sectionId ${c.sectionId}`);

  return {
    id: uid(`wd-${c.course}-${c.section || index}`),
    course: c.course,
    title: c.title || c.course,
    section: c.section || String(index + 1),
    format: online && format === "Lecture" ? "Online" : format,
    days: online && !days.length ? [] : days,
    start: online && !c.start ? null : c.start ?? null,
    end: online && !c.end ? null : c.end ?? null,
    buildingId,
    room: c.room ?? undefined,
    color: colorForCourse(c.course, index),
    credits,
    online: online || undefined,
    notes: notesParts.length ? notesParts.join(" · ") : undefined,
  };
}

export function meetingsFromWorkdayExport(data: WorkdayCurrentExport): Meeting[] {
  if (!data || !Array.isArray(data.classes)) {
    throw new Error("Workday export must include a classes[] array");
  }
  return data.classes.map((c, i) => workdayClassToMeeting(c, i));
}

export function parseWorkdayCurrentJson(raw: string): WorkdayCurrentExport {
  const parsed = JSON.parse(raw) as WorkdayCurrentExport;
  if (!parsed || !Array.isArray(parsed.classes)) {
    throw new Error("JSON must be a Workday Current Classes export with classes[]");
  }
  return parsed;
}

/** localStorage key for an imported Workday Current Classes JSON blob. */
export const WORKDAY_IMPORT_KEY = "class-op-workday-current";

export function saveWorkdayImport(data: WorkdayCurrentExport): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(WORKDAY_IMPORT_KEY, JSON.stringify(data));
}

export function loadWorkdayImport(): WorkdayCurrentExport | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(WORKDAY_IMPORT_KEY);
    if (!raw) return null;
    return parseWorkdayCurrentJson(raw);
  } catch {
    return null;
  }
}

export function clearWorkdayImport(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(WORKDAY_IMPORT_KEY);
}
