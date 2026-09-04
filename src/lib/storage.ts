import { currentClassesSeed } from "./current-classes-seed";
import { DEFAULT_HOME, isValidHome } from "./buildings";
import type { AppState, HomeLocation, Meeting, ScheduleSource, YearLevel } from "./types";

export const STORAGE_KEY = "class-op-v1";

export const EMPTY_STATE: AppState = {
  email: null,
  workdayDemo: false,
  majorId: null,
  yearLevel: null,
  completedCourseIds: [],
  meetings: [],
  scheduleSource: "demo",
  home: { ...DEFAULT_HOME },
  commuteOffCampus: false,
  walkStartLotId: null,
};

function parseYear(v: unknown): YearLevel | null {
  if (v === 1 || v === 2 || v === 3 || v === 4) return v;
  if (v === "1" || v === "2" || v === "3" || v === "4") return Number(v) as YearLevel;
  return null;
}

function parseSource(v: unknown): ScheduleSource {
  if (v === "import") return "import";
  if (v === "current") return "current";
  return "demo";
}

function parseHome(v: unknown): HomeLocation {
  if (isValidHome(v)) {
    return { label: v.label.trim(), lat: v.lat, lon: v.lon };
  }
  return { ...DEFAULT_HOME };
}

export function loadState(): AppState {
  if (typeof window === "undefined") return EMPTY_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STATE;
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return {
      email: parsed.email ?? null,
      workdayDemo: Boolean(parsed.workdayDemo),
      majorId: parsed.majorId ?? null,
      yearLevel: parseYear(parsed.yearLevel),
      completedCourseIds: Array.isArray(parsed.completedCourseIds)
        ? (parsed.completedCourseIds as string[])
        : [],
      meetings: Array.isArray(parsed.meetings) ? (parsed.meetings as Meeting[]) : [],
      scheduleSource: parseSource(parsed.scheduleSource),
      home: parseHome(parsed.home),
      commuteOffCampus: Boolean(parsed.commuteOffCampus),
      walkStartLotId:
        typeof parsed.walkStartLotId === "string" && parsed.walkStartLotId.trim()
          ? parsed.walkStartLotId.trim()
          : null,
    };
  } catch {
    return EMPTY_STATE;
  }
}

export function saveState(state: AppState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function connectDemoWorkday(email: string): AppState {
  const prev = loadState();
  const next: AppState = {
    email,
    workdayDemo: true,
    majorId: prev.majorId,
    yearLevel: prev.yearLevel,
    completedCourseIds: prev.completedCourseIds,
    meetings: currentClassesSeed(),
    scheduleSource: "current",
    home: prev.home ?? { ...DEFAULT_HOME },
    commuteOffCampus: prev.commuteOffCampus ?? false,
    walkStartLotId: prev.walkStartLotId ?? null,
  };
  saveState(next);
  return next;
}

export function signOut(): void {
  localStorage.removeItem(STORAGE_KEY);
}
