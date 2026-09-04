"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { EMPTY_STATE, loadState, saveState, signOut as clearStorage } from "./storage";
import { beyerLoopSeed } from "./seed-schedule";
import type { AppState, Meeting } from "./types";

type Ctx = {
  ready: boolean;
  state: AppState;
  setEmail: (email: string) => void;
  connectDemo: () => void;
  setMajor: (majorId: string) => void;
  setMeetings: (meetings: Meeting[] | ((prev: Meeting[]) => Meeting[])) => void;
  resetSeed: () => void;
  signOut: () => void;
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
        meetings: beyerLoopSeed(),
      }),
    );
  }, []);

  const setMajor = useCallback((majorId: string) => {
    setState((s) => commit({ ...s, majorId }));
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

  const resetSeed = useCallback(() => {
    setState((s) => commit({ ...s, meetings: beyerLoopSeed() }));
  }, []);

  const signOut = useCallback(() => {
    clearStorage();
    setState(EMPTY_STATE);
  }, []);

  const value = useMemo(
    () => ({
      ready,
      state,
      setEmail,
      connectDemo,
      setMajor,
      setMeetings,
      resetSeed,
      signOut,
    }),
    [ready, state, setEmail, connectDemo, setMajor, setMeetings, resetSeed, signOut],
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}
