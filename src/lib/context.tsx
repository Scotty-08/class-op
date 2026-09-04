"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  completedIdsBeforeRegistered,
  completedIdsForYear,
  inferYearFromRegistered,
} from "./cpre-roadmap";
import { currentClassesSeed, currentRegisteredCourseCodes } from "./current-classes-seed";
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
  /** Major-first: pick major → load catalog plan + Current Classes map. Year optional. */
  setProfile: (majorId: string, yearLevel?: YearLevel | null) => void;
  setCompletedCourseIds: (ids: string[]) => void;
  setMeetings: (meetings: Meeting[] | ((prev: Meeting[]) => Meeting[])) => void;
  importWorkdayExport: (data: WorkdayCurrentExport) => void;
  /** Optional Y1 Beyer Loop demo seed — not the primary default. */
  loadY1DemoSeed: () => void;
  /** Restore bundled Fall 2026 Current Classes as registered schedule. */
  loadCurrentClasses: () => void;
  signOut: () => void;
  /** Demo completed ids: explicit checklist, else inferred from year / Current Classes. */
  effectiveCompletedIds: string[];
};

const AppCtx = createContext<Ctx | null>(null);

function commit(next: AppState) {
  saveState(next);
  return next;
}

function midCurriculumDefaults(majorId: string): {
  yearLevel: YearLevel;
  completedCourseIds: string[];
} {
  if (majorId === "cpre") {
    const codes = currentRegisteredCourseCodes();
    return {
      yearLevel: inferYearFromRegistered(codes),
      completedCourseIds: completedIdsBeforeRegistered(codes),
    };
  }
  return { yearLevel: 3, completedCourseIds: completedIdsForYear(3) };
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
    setState((s) => {
      const keepImport = s.scheduleSource === "import" && s.meetings.length > 0;
      return commit({
        ...s,
        workdayDemo: true,
        // Default registered schedule = Fall 2026 Current Classes (not Beyer Loop).
        meetings: keepImport ? s.meetings : currentClassesSeed(),
        scheduleSource: keepImport ? "import" : "current",
      });
    });
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

  const setProfile = useCallback((majorId: string, yearLevel?: YearLevel | null) => {
    setState((s) => {
      const defaults = midCurriculumDefaults(majorId);
      const year = yearLevel ?? s.yearLevel ?? defaults.yearLevel;
      const completed =
        s.completedCourseIds.length && s.yearLevel === year
          ? s.completedCourseIds
          : majorId === "cpre" && !yearLevel
            ? defaults.completedCourseIds
            : completedIdsForYear(year);
      const meetings = s.meetings.length ? s.meetings : currentClassesSeed();
      const scheduleSource = s.meetings.length
        ? s.scheduleSource
        : ("current" as const);
      return commit({
        ...s,
        majorId,
        yearLevel: year,
        completedCourseIds: completed,
        meetings,
        scheduleSource,
      });
    });
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

  const loadY1DemoSeed = useCallback(() => {
    clearWorkdayImport();
    setState((s) =>
      commit({
        ...s,
        meetings: beyerLoopSeed(),
        scheduleSource: "demo",
        yearLevel: 1,
        completedCourseIds: completedIdsForYear(1),
      }),
    );
  }, []);

  const loadCurrentClasses = useCallback(() => {
    clearWorkdayImport();
    const codes = currentRegisteredCourseCodes();
    setState((s) =>
      commit({
        ...s,
        meetings: currentClassesSeed(),
        scheduleSource: "current",
        yearLevel: s.majorId === "cpre" ? inferYearFromRegistered(codes) : s.yearLevel ?? 3,
        completedCourseIds:
          s.majorId === "cpre" ? completedIdsBeforeRegistered(codes) : s.completedCourseIds,
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
    if (state.scheduleSource === "current" || state.meetings.some((m) => m.course.startsWith("COMS") || m.course.startsWith("CPRE 3100") || m.course.startsWith("EE 2300"))) {
      return completedIdsBeforeRegistered(currentRegisteredCourseCodes());
    }
    if (state.yearLevel) return completedIdsForYear(state.yearLevel);
    return [];
  }, [state.completedCourseIds, state.yearLevel, state.scheduleSource, state.meetings]);

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
      loadY1DemoSeed,
      loadCurrentClasses,
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
      loadY1DemoSeed,
      loadCurrentClasses,
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
