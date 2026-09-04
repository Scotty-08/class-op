"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Guard } from "@/components/Guard";
import { useApp } from "@/lib/context";
import { DEFAULT_MAJOR_ID, MAJORS } from "@/lib/majors";

export default function MajorPage() {
  return (
    <Guard need="workday">
      <MajorInner />
    </Guard>
  );
}

function MajorInner() {
  const { state, setMajor } = useApp();
  const router = useRouter();
  const [picked, setPicked] = useState(state.majorId ?? DEFAULT_MAJOR_ID);
  const [goPlanner, setGoPlanner] = useState(false);

  useEffect(() => {
    if (goPlanner && state.majorId) router.push("/planner");
  }, [goPlanner, state.majorId, router]);

  function continueOn() {
    setMajor(picked);
    setGoPlanner(true);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-wide text-cardinal">Step 3 of 3</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">Choose your major</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-muted">
        Required before the planner. Computer Engineering B.S. is highlighted — that is the catalog the Beyer Loop seed
        is built from (127 cr, 2026–27).
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={continueOn}
          className="rounded-xl bg-cardinal px-5 py-2.5 text-sm font-semibold text-white hover:bg-cardinal-dark"
        >
          Open planner
        </button>
      </div>
    </div>
  );
}
