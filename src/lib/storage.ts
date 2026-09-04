import { currentClassesSeed } from "./current-classes-seed";
import { DEFAULT_HOME, isValidHome } from "./buildings";
import type {
  AppState,
  HomeLocation,
  Meeting,
  PlanningMode,
  ScheduleSource,
  YearLevel,
} from "./types";

export const STORAGE_KEY = "class-op-v1";

export const EMPTY_STATE: AppState = {
  email: null,
  workdayDemo: false,
  majorId: null,
  planSlug: null,
  planOption: null,
  yearLevel: null,
  completedCourseIds: [],
  selectedPlanCourseIds: [],
  planningMode: null,
  meetings: [],
  scheduleSource: "demo",
  home: { ...DEFAULT_HOME },
  commuteOffCampus: false,
  walkStartLotId: null,
  homeSetupDone: false,
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

function parsePlanningMode(v: unknown): PlanningMode {
  if (v === "semester" || v === "forward") return v;
  return null;
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
      planSlug: typeof parsed.planSlug === "string" ? parsed.planSlug : null,
      planOption: typeof parsed.planOption === "string" ? parsed.planOption : null,
      yearLevel: parseYear(parsed.yearLevel),
      completedCourseIds: Array.isArray(parsed.completedCourseIds)
        ? (parsed.completedCourseIds as string[])
        : [],
      selectedPlanCourseIds: Array.isArray(parsed.selectedPlanCourseIds)
        ? (parsed.selectedPlanCourseIds as string[])
        : [],
      planningMode: parsePlanningMode(parsed.planningMode),
      meetings: Array.isArray(parsed.meetings) ? (parsed.meetings as Meeting[]) : [],
      scheduleSource: parseSource(parsed.scheduleSource),
      home: parseHome(parsed.home),
      commuteOffCampus: Boolean(parsed.commuteOffCampus),
      walkStartLotId:
        typeof parsed.walkStartLotId === "string" && parsed.walkStartLotId.trim()
          ? parsed.walkStartLotId.trim()
          : null,
      // Returning sessions that already picked a major keep map access without re-prompt.
      homeSetupDone:
        typeof parsed.homeSetupDone === "boolean"
          ? parsed.homeSetupDone
          : Boolean(parsed.majorId),
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
    planSlug: prev.planSlug,
    planOption: prev.planOption,
    yearLevel: prev.yearLevel,
    completedCourseIds: prev.completedCourseIds,
    selectedPlanCourseIds: prev.selectedPlanCourseIds ?? [],
    planningMode: prev.planningMode ?? null,
    meetings: currentClassesSeed(),
    scheduleSource: "current",
    home: prev.home ?? { ...DEFAULT_HOME },
    commuteOffCampus: prev.commuteOffCampus ?? false,
    walkStartLotId: prev.walkStartLotId ?? null,
    homeSetupDone: prev.homeSetupDone ?? Boolean(prev.majorId),
  };
  saveState(next);
  return next;
}

export function signOut(): void {
  localStorage.removeItem(STORAGE_KEY);
}
