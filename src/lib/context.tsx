"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { completedIdsForYear } from "./cpre-roadmap";
import { EMPTY_STATE, loadState, saveState, signOut as clearStorage } from "./storage";
import { beyerLoopSeed } from "./seed-schedule";
import {
  clearWorkdayImport,
  meetingsFromWorkdayExport,
  saveWorkdayImport,
  type WorkdayCurrentExport,
} from "./workday-current";
import type { AppState, Meeting, YearLevel } from "./types";

type Ctx = {
  ready: boolean;
  state: AppState;
  setEmail: (email: string) => void;
  connectDemo: () => void;
  setMajor: (majorId: string) => void;
  setYearLevel: (year: YearLevel) => void;
  setProfile: (majorId: string, yearLevel: YearLevel) => void;
  setCompletedCourseIds: (ids: string[]) => void;
  setMeetings: (meetings: Meeting[] | ((prev: Meeting[]) => Meeting[])) => void;
  importWorkdayExport: (data: WorkdayCurrentExport) => void;
  resetSeed: () => void;
  signOut: () => void;
  /** Demo completed ids: explicit checklist, else inferred from year. */
  effectiveCompletedIds: string[];
};

const AppCtx = createContext<Ctx | null>(null);

function commit(next: AppState) {
  saveState(next);
  return next;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<AppState>(EMPTY_STATE);

  useEffect(() => {
    setState(loadState());
    setReady(true);
  }, []);

  const setEmail = useCallback((email: string) => {
    setState((s) => commit({ ...s, email }));
  }, []);

  const connectDemo = useCallback(() => {
    setState((s) =>
      commit({
        ...s,
        workdayDemo: true,
        // Simulated registered Fall 2026 sections (Beyer Loop) until live Workday SSO.
        meetings: s.scheduleSource === "import" && s.meetings.length ? s.meetings : beyerLoopSeed(),
        scheduleSource: s.scheduleSource === "import" && s.meetings.length ? "import" : "demo",
      }),
    );
  }, []);

  const setMajor = useCallback((majorId: string) => {
    setState((s) => commit({ ...s, majorId }));
  }, []);

  const setYearLevel = useCallback((yearLevel: YearLevel) => {
    setState((s) =>
      commit({
        ...s,
        yearLevel,
        completedCourseIds: completedIdsForYear(yearLevel),
      }),
    );
  }, []);

  const setProfile = useCallback((majorId: string, yearLevel: YearLevel) => {
    setState((s) =>
      commit({
        ...s,
        majorId,
        yearLevel,
        completedCourseIds:
          s.completedCourseIds.length && s.yearLevel === yearLevel
            ? s.completedCourseIds
            : completedIdsForYear(yearLevel),
        meetings: s.meetings.length ? s.meetings : beyerLoopSeed(),
        scheduleSource: s.meetings.length ? s.scheduleSource : "demo",
      }),
    );
  }, []);

  const setCompletedCourseIds = useCallback((completedCourseIds: string[]) => {
    setState((s) => commit({ ...s, completedCourseIds }));
  }, []);

  const setMeetings = useCallback(
    (meetings: Meeting[] | ((prev: Meeting[]) => Meeting[])) => {
      setState((s) =>
        commit({
          ...s,
          meetings: typeof meetings === "function" ? meetings(s.meetings) : meetings,
        }),
      );
    },
    [],
  );

  const importWorkdayExport = useCallback((data: WorkdayCurrentExport) => {
    const meetings = meetingsFromWorkdayExport(data);
    saveWorkdayImport(data);
    setState((s) =>
      commit({
        ...s,
        workdayDemo: true,
        meetings,
        scheduleSource: "import",
      }),
    );
  }, []);

  const resetSeed = useCallback(() => {
    clearWorkdayImport();
    setState((s) =>
      commit({
        ...s,
        meetings: beyerLoopSeed(),
        scheduleSource: "demo",
      }),
    );
  }, []);

  const signOut = useCallback(() => {
    clearStorage();
    clearWorkdayImport();
    setState(EMPTY_STATE);
  }, []);

  const effectiveCompletedIds = useMemo(() => {
    if (state.completedCourseIds.length) return state.completedCourseIds;
    if (state.yearLevel) return completedIdsForYear(state.yearLevel);
    return [];
  }, [state.completedCourseIds, state.yearLevel]);

  const value = useMemo(
    () => ({
      ready,
      state,
      setEmail,
      connectDemo,
      setMajor,
      setYearLevel,
      setProfile,
      setCompletedCourseIds,
      setMeetings,
      importWorkdayExport,
      resetSeed,
      signOut,
      effectiveCompletedIds,
    }),
    [
      ready,
      state,
      setEmail,
      connectDemo,
      setMajor,
      setYearLevel,
      setProfile,
      setCompletedCourseIds,
      setMeetings,
      importWorkdayExport,
      resetSeed,
      signOut,
      effectiveCompletedIds,
    ],
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}
