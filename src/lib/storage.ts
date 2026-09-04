import { beyerLoopSeed } from "./seed-schedule";
import type { AppState, Meeting } from "./types";

export const STORAGE_KEY = "class-op-v1";

export const EMPTY_STATE: AppState = {
  email: null,
  workdayDemo: false,
  majorId: null,
  meetings: [],
};

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
      meetings: Array.isArray(parsed.meetings) ? (parsed.meetings as Meeting[]) : [],
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
  const next: AppState = {
    email,
    workdayDemo: true,
    majorId: loadState().majorId,
    meetings: beyerLoopSeed(),
  };
  saveState(next);
  return next;
}

export function signOut(): void {
  localStorage.removeItem(STORAGE_KEY);
}
