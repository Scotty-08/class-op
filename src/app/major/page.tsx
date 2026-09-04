"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";
import { Guard } from "@/components/Guard";
import { useApp } from "@/lib/context";
import { DEFAULT_MAJOR_ID, MAJORS } from "@/lib/majors";
import { YEAR_LABELS } from "@/lib/cpre-roadmap";
import type { YearLevel } from "@/lib/types";

const YEARS: YearLevel[] = [1, 2, 3, 4];

export default function MajorPage() {
  return (
    <Guard need="workday">
      <MajorInner />
    </Guard>
  );
}

function MajorInner() {
  const { state, setProfile } = useApp();
  const router = useRouter();
  const [picked, setPicked] = useState(state.majorId ?? DEFAULT_MAJOR_ID);
  const [year, setYear] = useState<YearLevel>(state.yearLevel ?? 1);
  const [goMap, setGoMap] = useState(false);

  useEffect(() => {
    if (goMap && state.majorId && state.yearLevel) router.push("/planner");
  }, [goMap, state.majorId, state.yearLevel, router]);

  function continueOn() {
    setProfile(picked, year);
    setGoMap(true);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-wide text-cardinal">Step 3 of 3</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">Year &amp; major</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-muted">
        Tell us where you are, then map the classes Demo Workday loaded as your registered Fall 2026 schedule. Remaining
        degree roadmap is optional — after the map.
      </p>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-ink">Class standing</h2>
        <p className="mt-1 text-xs text-ink-muted">
          Demo only — not live Workday Academic Progress. Year picks how many prior semesters count as completed on the
          roadmap.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-4">
          {YEARS.map((y) => {
            const on = year === y;
            return (
              <button
                key={y}
                type="button"
                onClick={() => setYear(y)}
                className={`rounded-2xl border px-3 py-3 text-left transition ${
                  on
                    ? "border-gold bg-gold-soft shadow-card ring-2 ring-gold"
                    : "border-stone-200 bg-paper-card hover:border-stone-400"
                }`}
              >
                <div className="text-lg font-semibold text-ink">Y{y}</div>
                <div className="text-[11px] text-ink-muted">{YEAR_LABELS[y]}</div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-ink">Major</h2>
        <p className="mt-1 text-xs text-ink-muted">
          Computer Engineering is fully wired (127 cr · 2026–27). Other majors are listed for later.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {MAJORS.map((m) => {
            const on = picked === m.id;
            const featured = m.id === DEFAULT_MAJOR_ID;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setPicked(m.id)}
                className={`rounded-2xl border p-4 text-left transition ${
                  on
                    ? "border-gold bg-gold-soft shadow-card ring-2 ring-gold"
                    : "border-stone-200 bg-paper-card hover:border-stone-400"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-semibold text-ink">{m.name}</div>
                  {featured ? (
                    <span className="rounded-full bg-cardinal px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                      CprE
                    </span>
                  ) : null}
                </div>
                <div className="mt-1 text-[11px] text-ink-muted">{m.college}</div>
                <p className="mt-2 text-xs leading-relaxed text-ink-muted">{m.blurb}</p>
              </button>
            );
          })}
        </div>
      </section>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-md text-xs text-ink-muted">
          Next: campus map of your <strong className="font-semibold text-ink">Demo registered</strong> sections (Beyer
          Loop seed until live Workday SSO).
        </p>
        <button
          type="button"
          onClick={continueOn}
          className="inline-flex items-center gap-2 rounded-xl bg-cardinal px-5 py-2.5 text-sm font-semibold text-white hover:bg-cardinal-dark"
        >
          <MapPin className="h-4 w-4" />
          Map my registered classes
        </button>
      </div>
    </div>
  );
}
