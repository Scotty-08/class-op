"use client";

import { useEffect, useMemo, useState } from "react";
import { Home, Loader2 } from "lucide-react";
import {
  COMMUTER_LOTS,
  DEFAULT_HOME,
  HOME_QUICK_PICKS,
  geocodeHomeQuery,
  isHomeOnCampus,
  needsCommuterLot,
  resolveWalkStart,
} from "@/lib/buildings";
import { useApp } from "@/lib/context";
import type { HomeLocation } from "@/lib/types";

export function HomeBaseCard() {
  const { state, setHome, setCommuteOffCampus, setWalkStartLotId } = useApp();
  const home = state.home ?? DEFAULT_HOME;
  const [draft, setDraft] = useState(home.label);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setDraft(home.label);
  }, [home.label]);

  const walk = useMemo(
    () =>
      resolveWalkStart({
        home,
        commuteOffCampus: state.commuteOffCampus,
        walkStartLotId: state.walkStartLotId,
      }),
    [home, state.commuteOffCampus, state.walkStartLotId],
  );

  const offCampusHint = needsCommuterLot({
    home,
    commuteOffCampus: state.commuteOffCampus,
  });

  async function saveQuery(raw: string) {
    setError(null);
    setOk(null);
    const q = raw.trim();
    if (!q) {
      setError("Enter a street address, building name, or campus landmark.");
      return;
    }
    setBusy(true);
    try {
      const next = await geocodeHomeQuery(q);
      setHome(next);
      setDraft(next.label);
      if (!isHomeOnCampus(next)) {
        setCommuteOffCampus(true);
        setOk(
          `Home set to ${next.label} (off campus). Pick a commuter lot below for map walk-start.`,
        );
      } else {
        setOk(`Home base set to ${next.label}. Map routes and walk times updated.`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not resolve home location.");
    } finally {
      setBusy(false);
    }
  }

  function pickBuilding(id: string) {
    const b = HOME_QUICK_PICKS.find((x) => x.id === id);
    if (!b) return;
    const next: HomeLocation =
      b.id === "friley"
        ? { ...DEFAULT_HOME }
        : { label: b.name, lat: b.lat, lon: b.lon };
    setHome(next);
    setDraft(next.label);
    setCommuteOffCampus(false);
    setError(null);
    setOk(`Home base set to ${next.label}. Map routes and walk times updated.`);
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-3">
      <div className="mb-2 flex items-center gap-2">
        <Home className="h-4 w-4 text-cardinal" />
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
            Home base
          </div>
          <div className="text-xs text-ink-muted">
            Profile home · map starts from{" "}
            <span className="font-medium text-ink">{walk.start.label}</span>
            {walk.usingLot ? " (lot)" : ""}
          </div>
        </div>
      </div>

      <form
        className="flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void saveQuery(draft);
        }}
      >
        <input
          type="text"
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            setError(null);
            setOk(null);
          }}
          placeholder="Address, building, or landmark (Ames)"
          className="min-w-[12rem] flex-1 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-ink outline-none focus:border-stone-400 focus:bg-white"
          aria-label="Home base location"
          disabled={busy}
        />
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-3 py-2 text-sm font-semibold text-white hover:bg-stone-800 disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Save
        </button>
      </form>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {HOME_QUICK_PICKS.map((b) => {
          const active =
            Math.abs(home.lat - b.lat) < 1e-5 && Math.abs(home.lon - b.lon) < 1e-5;
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => pickBuilding(b.id)}
              disabled={busy}
              className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
                active
                  ? "border-ink bg-ink text-white"
                  : "border-stone-200 bg-stone-50 text-ink-muted hover:bg-stone-100"
              }`}
            >
              {b.id === "friley" ? "Friley" : b.short}
            </button>
          );
        })}
      </div>

      <label className="mt-3 flex cursor-pointer items-start gap-2 text-xs text-ink">
        <input
          type="checkbox"
          className="mt-0.5"
          checked={Boolean(state.commuteOffCampus)}
          onChange={(e) => setCommuteOffCampus(e.target.checked)}
        />
        <span>
          I commute / live off campus
          <span className="block text-ink-muted">
            Map walk-start uses an ISU commuter lot instead of home coords.
          </span>
        </span>
      </label>

      {offCampusHint ? (
        <div className="mt-2">
          <label className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
            Walk-start lot
          </label>
          <select
            className="mt-1 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-ink"
            value={state.walkStartLotId ?? ""}
            onChange={(e) => setWalkStartLotId(e.target.value || null)}
          >
            <option value="">Select a lot…</option>
            {COMMUTER_LOTS.map((lot) => (
              <option key={lot.id} value={lot.id}>
                {lot.short} — {lot.edge}
              </option>
            ))}
          </select>
          {!state.walkStartLotId ? (
            <p className="mt-1 text-[11px] text-amber-700">
              Choose a lot so routes re-anchor from campus parking (map stays on last good start until then).
            </p>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <p className="mt-2 text-xs text-cardinal" role="alert">
          {error}
        </p>
      ) : null}
      {ok ? (
        <p className="mt-2 text-xs text-emerald-700" role="status">
          {ok}
        </p>
      ) : null}
    </div>
  );
}
