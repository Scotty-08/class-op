"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Building2, Check, Home, MapPin, ParkingCircle } from "lucide-react";
import { Guard } from "@/components/Guard";
import { useApp } from "@/lib/context";
import {
  COMMUTER_LOTS,
  DEFAULT_HOME,
  HOME_QUICK_PICKS,
  geocodeHomeQuery,
  isHomeOnCampus,
  needsCommuterLot,
  resolveWalkStart,
} from "@/lib/buildings";
import { getMajor } from "@/lib/majors";
import type { HomeLocation } from "@/lib/types";

/** On-campus dorm / residence quick picks (official dorm list may arrive later). */
const DORM_PICKS = [
  {
    id: "friley",
    name: "Friley Hall",
    hint: "212 Beyer Ct · default demo home",
    home: { ...DEFAULT_HOME } as HomeLocation,
  },
];

export default function LivingPage() {
  return (
    <Guard need="major">
      <Suspense
        fallback={
          <div className="flex min-h-[50vh] items-center justify-center text-sm text-ink-muted">
            Loading…
          </div>
        }
      >
        <LivingInner />
      </Suspense>
    </Guard>
  );
}

function LivingInner() {
  const { state, setHome, setCommuteOffCampus, setWalkStartLotId, setHomeSetupDone } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const major = getMajor(state.majorId);
  const nextRaw = searchParams.get("next");
  const nextDest: "planner" | "roadmap" =
    nextRaw === "planner" || nextRaw === "roadmap"
      ? nextRaw
      : major?.hasPlan
        ? "roadmap"
        : "planner";

  const home = state.home ?? DEFAULT_HOME;
  const [mode, setMode] = useState<"on" | "off">(
    state.commuteOffCampus || !isHomeOnCampus(home) ? "off" : "on",
  );
  const [draft, setDraft] = useState(home.label);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [pickedDorm, setPickedDorm] = useState<string | null>(
    Math.abs(home.lat - DEFAULT_HOME.lat) < 1e-5 && Math.abs(home.lon - DEFAULT_HOME.lon) < 1e-5
      ? "friley"
      : null,
  );

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

  const needsLot = needsCommuterLot({
    home,
    commuteOffCampus: state.commuteOffCampus || mode === "off",
  });

  const canContinue = !needsLot || Boolean(state.walkStartLotId);

  function pickOnCampus() {
    setMode("on");
    setCommuteOffCampus(false);
    setError(null);
  }

  function pickOffCampus() {
    setMode("off");
    setCommuteOffCampus(true);
    setPickedDorm(null);
    setError(null);
  }

  function chooseDorm(id: string) {
    const d = DORM_PICKS.find((x) => x.id === id);
    if (!d) return;
    setHome(d.home);
    setDraft(d.home.label);
    setPickedDorm(id);
    setCommuteOffCampus(false);
    setMode("on");
    setError(null);
  }

  function chooseCampusBuilding(id: string) {
    const b = HOME_QUICK_PICKS.find((x) => x.id === id);
    if (!b) return;
    const next: HomeLocation =
      b.id === "friley" ? { ...DEFAULT_HOME } : { label: b.name, lat: b.lat, lon: b.lon };
    setHome(next);
    setDraft(next.label);
    setPickedDorm(b.id === "friley" ? "friley" : null);
    setCommuteOffCampus(false);
    setMode("on");
    setError(null);
  }

  async function saveAddress() {
    setError(null);
    const q = draft.trim();
    if (!q) {
      setError("Enter a street address, dorm, or campus landmark.");
      return;
    }
    setBusy(true);
    try {
      const next = await geocodeHomeQuery(q);
      setHome(next);
      setDraft(next.label);
      if (!isHomeOnCampus(next)) {
        setMode("off");
        setCommuteOffCampus(true);
        setPickedDorm(null);
      } else {
        setMode("on");
        setCommuteOffCampus(false);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not resolve location.");
    } finally {
      setBusy(false);
    }
  }

  function continueFlow() {
    if (!canContinue) {
      setError("Pick an ISU commuter lot so map walks start from campus parking.");
      return;
    }
    setHomeSetupDone(true);
    router.push(nextDest === "roadmap" ? "/roadmap" : "/planner");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-wide text-cardinal">Step 4 · Home &amp; living</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">Where do you live?</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-muted">
        Map routes and walk times start from your home base
        {major ? (
          <>
            {" "}
            · continuing after <strong className="font-medium text-ink">{major.name}</strong>
          </>
        ) : null}
        . Off-campus? We&apos;ll use an ISU commuter lot as the walk-start. You can edit this later on the planner.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={pickOnCampus}
          className={`rounded-2xl border p-4 text-left transition ${
            mode === "on"
              ? "border-gold bg-gold-soft shadow-card ring-2 ring-gold"
              : "border-stone-200 bg-white hover:border-stone-400"
          }`}
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Building2 className="h-4 w-4 text-cardinal" />
            On campus
          </div>
          <p className="mt-1.5 text-xs text-ink-muted">Dorm or campus building — walks start from that pin.</p>
        </button>
        <button
          type="button"
          onClick={pickOffCampus}
          className={`rounded-2xl border p-4 text-left transition ${
            mode === "off"
              ? "border-gold bg-gold-soft shadow-card ring-2 ring-gold"
              : "border-stone-200 bg-white hover:border-stone-400"
          }`}
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-ink">
            <ParkingCircle className="h-4 w-4 text-cardinal" />
            Off campus / commute
          </div>
          <p className="mt-1.5 text-xs text-ink-muted">Pick an ISU commuter lot as your campus walk-start.</p>
        </button>
      </div>

      {mode === "on" ? (
        <section className="mt-6">
          <h2 className="text-sm font-semibold text-ink">Dorm quick picks</h2>
          <p className="mt-1 text-xs text-ink-muted">
            Official ISU residence hall list may arrive later — Friley is the demo default for now.
          </p>
          <div className="mt-3 grid gap-2">
            {DORM_PICKS.map((d) => {
              const on = pickedDorm === d.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => chooseDorm(d.id)}
                  className={`flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                    on
                      ? "border-gold bg-gold-soft shadow-sm ring-2 ring-gold"
                      : "border-stone-200 bg-white hover:border-stone-400"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                      on ? "border-cardinal bg-cardinal text-white" : "border-stone-300 bg-white text-transparent"
                    }`}
                  >
                    <Check className="h-3 w-3" />
                  </span>
                  <span>
                    <span className="font-medium text-ink">{d.name}</span>
                    <span className="mt-0.5 block text-[11px] text-ink-muted">{d.hint}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <h3 className="mt-5 text-sm font-semibold text-ink">Or near a campus building</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {HOME_QUICK_PICKS.map((b) => {
              const active =
                Math.abs(home.lat - b.lat) < 1e-5 && Math.abs(home.lon - b.lon) < 1e-5;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => chooseCampusBuilding(b.id)}
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
        </section>
      ) : (
        <section className="mt-6 rounded-2xl border border-stone-200 bg-paper-card p-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
            <ParkingCircle className="h-4 w-4 text-cardinal" />
            ISU commuter lot (walk-start)
          </h2>
          <p className="mt-1 text-xs text-ink-muted">
            Home can stay off campus; the map re-anchors walks from the lot you park in.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {COMMUTER_LOTS.map((lot) => {
              const on = state.walkStartLotId === lot.id;
              return (
                <button
                  key={lot.id}
                  type="button"
                  onClick={() => setWalkStartLotId(lot.id)}
                  className={`rounded-xl border px-3 py-3 text-left transition ${
                    on
                      ? "border-gold bg-gold-soft ring-2 ring-gold"
                      : "border-stone-200 bg-white hover:border-stone-400"
                  }`}
                >
                  <div className="text-sm font-semibold text-ink">{lot.short}</div>
                  <div className="mt-0.5 text-[11px] text-ink-muted">{lot.edge}</div>
                </button>
              );
            })}
          </div>
          {!state.walkStartLotId ? (
            <p className="mt-2 text-xs text-amber-700">Select a lot to continue.</p>
          ) : null}
        </section>
      )}

      <section className="mt-6">
        <h2 className="text-sm font-semibold text-ink">Address / landmark (optional)</h2>
        <form
          className="mt-2 flex flex-wrap gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void saveAddress();
          }}
        >
          <input
            type="text"
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              setError(null);
            }}
            placeholder="Address, dorm, or landmark (Ames)"
            className="min-w-[12rem] flex-1 rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-gold focus:ring-2 focus:ring-gold"
            disabled={busy}
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:bg-stone-50 disabled:opacity-60"
          >
            {busy ? "Looking up…" : "Save address"}
          </button>
        </form>
      </section>

      <div className="mt-6 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs text-ink-muted">
        <Home className="mr-1.5 inline h-3.5 w-3.5 text-cardinal" />
        Map will start from{" "}
        <span className="font-semibold text-ink">{walk.start.label}</span>
        {walk.usingLot ? " (commuter lot)" : ""}.
      </div>

      {error ? (
        <p className="mt-3 text-xs text-cardinal" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => router.push("/major")}
          className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:bg-stone-50"
        >
          Back to major
        </button>
        <button
          type="button"
          onClick={continueFlow}
          disabled={!canContinue}
          className="inline-flex items-center gap-2 rounded-xl bg-cardinal px-5 py-2.5 text-sm font-semibold text-white hover:bg-cardinal-dark disabled:opacity-50"
        >
          <MapPin className="h-4 w-4" />
          {nextDest === "roadmap" ? "Continue to catalog plan" : "Continue to map"}
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
