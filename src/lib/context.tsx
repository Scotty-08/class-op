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
import { getMajor } from "./majors";
import type { AppState, HomeLocation, Meeting, PlanningMode, YearLevel } from "./types";

type ProfileOpts = {
  majorId: string;
  planSlug?: string | null;
  planOption?: string | null;
  yearLevel?: YearLevel | null;
};

type Ctx = {
  ready: boolean;
  state: AppState;
  setEmail: (email: string) => void;
  connectDemo: () => void;
  setMajor: (majorId: string) => void;
  setYearLevel: (year: YearLevel) => void;
  /** Major-first: pick major (+ optional plan option) → catalog plan + Current Classes map. */
  setProfile: (opts: ProfileOpts) => void;
  setCompletedCourseIds: (ids: string[]) => void;
  setSelectedPlanCourseIds: (ids: string[]) => void;
  setPlanningMode: (mode: PlanningMode) => void;
  setMeetings: (meetings: Meeting[] | ((prev: Meeting[]) => Meeting[])) => void;
  /** Persist profile home; map walk-start may use a commuter lot when off-campus. */
  setHome: (home: HomeLocation) => void;
  setCommuteOffCampus: (off: boolean) => void;
  setWalkStartLotId: (lotId: string | null) => void;
  setHomeSetupDone: (done: boolean) => void;
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

function resolvePlanMeta(
  majorId: string,
  planSlug?: string | null,
  planOption?: string | null,
): { planSlug: string | null; planOption: string | null } {
  const major = getMajor(majorId);
  if (!major) return { planSlug: planSlug ?? null, planOption: planOption ?? null };
  const slug = planSlug ?? major.planSlug;
  const opt =
    planOption !== undefined
      ? planOption
      : major.options.find((o) => o.slug === slug)?.option ??
        (major.options.length > 1 ? major.options[0]?.option ?? null : null);
  return { planSlug: slug ?? null, planOption: opt ?? null };
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
        meetings: keepImport ? s.meetings : currentClassesSeed(),
        scheduleSource: keepImport ? "import" : "current",
      });
    });
  }, []);

  const setMajor = useCallback((majorId: string) => {
    const meta = resolvePlanMeta(majorId);
    setState((s) => commit({ ...s, majorId, ...meta }));
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

  const setProfile = useCallback((opts: ProfileOpts) => {
    setState((s) => {
      const { majorId } = opts;
      const meta = resolvePlanMeta(majorId, opts.planSlug, opts.planOption);
      const defaults = midCurriculumDefaults(majorId);
      const year = opts.yearLevel ?? s.yearLevel ?? defaults.yearLevel;
      const completed =
        s.completedCourseIds.length && s.yearLevel === year && s.majorId === majorId
          ? s.completedCourseIds
          : majorId === "cpre" && opts.yearLevel == null
            ? defaults.completedCourseIds
            : completedIdsForYear(year);
      const meetings = s.meetings.length ? s.meetings : currentClassesSeed();
      const scheduleSource = s.meetings.length ? s.scheduleSource : ("current" as const);
      return commit({
        ...s,
        majorId,
        ...meta,
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

  const setSelectedPlanCourseIds = useCallback((selectedPlanCourseIds: string[]) => {
    setState((s) => commit({ ...s, selectedPlanCourseIds }));
  }, []);

  const setPlanningMode = useCallback((planningMode: PlanningMode) => {
    setState((s) => commit({ ...s, planningMode }));
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

  const setHome = useCallback((home: HomeLocation) => {
    setState((s) => commit({ ...s, home }));
  }, []);

  const setCommuteOffCampus = useCallback((commuteOffCampus: boolean) => {
    setState((s) => commit({ ...s, commuteOffCampus }));
  }, []);

  const setWalkStartLotId = useCallback((walkStartLotId: string | null) => {
    setState((s) => commit({ ...s, walkStartLotId }));
  }, []);

  const setHomeSetupDone = useCallback((homeSetupDone: boolean) => {
    setState((s) => commit({ ...s, homeSetupDone }));
  }, []);

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
    if (
      state.scheduleSource === "current" ||
      state.meetings.some(
        (m) =>
          m.course.startsWith("COMS") ||
          m.course.startsWith("CPRE 3100") ||
          m.course.startsWith("EE 2300"),
      )
    ) {
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
      setSelectedPlanCourseIds,
      setPlanningMode,
      setMeetings,
      setHome,
      setCommuteOffCampus,
      setWalkStartLotId,
      setHomeSetupDone,
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
      setSelectedPlanCourseIds,
      setPlanningMode,
      setMeetings,
      setHome,
      setCommuteOffCampus,
      setWalkStartLotId,
      setHomeSetupDone,
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
