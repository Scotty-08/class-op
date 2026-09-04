"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, MapPin, RotateCcw } from "lucide-react";
import { Guard } from "@/components/Guard";
import { useApp } from "@/lib/context";
import { MAJORS } from "@/lib/majors";
import {
  BEYER_LOOP_COURSE_CODES,
  CPRE_CATALOG_YEAR,
  CPRE_ELECTIVES_NOTE,
  CPRE_ROADMAP,
  CPRE_TOTAL_CREDITS,
  YEAR_LABELS,
  completedIdsForYear,
  formatCredits,
  remainingSemesters,
} from "@/lib/cpre-roadmap";
import type { YearLevel } from "@/lib/types";

export default function RoadmapPage() {
  return (
    <Guard need="major">
      <RoadmapInner />
    </Guard>
  );
}

function RoadmapInner() {
  const { state, setCompletedCourseIds, setYearLevel, effectiveCompletedIds } = useApp();
  const major = MAJORS.find((m) => m.id === state.majorId);
  const isCpre = state.majorId === "cpre";
  const [checklistOpen, setChecklistOpen] = useState(false);

  const done = useMemo(() => new Set(effectiveCompletedIds), [effectiveCompletedIds]);
  const remaining = useMemo(() => remainingSemesters(done), [done]);
  const allCourses = useMemo(() => CPRE_ROADMAP.flatMap((s) => s.courses), []);

  function toggleCourse(id: string) {
    const next = new Set(done);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setCompletedCourseIds([...next]);
  }

  function resetToYear() {
    const y = (state.yearLevel ?? 1) as YearLevel;
    setYearLevel(y);
  }

  function startYear1() {
    setYearLevel(1);
  }

  if (!isCpre) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-xs font-semibold uppercase tracking-wide text-cardinal">Secondary · remaining plan</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Roadmap</h1>
        <p className="mt-3 text-sm text-ink-muted">
          A semester-by-semester remaining roadmap is wired for Computer Engineering first.{" "}
          {major ? `${major.name} ` : "This major "}comes later. Map your Demo registered classes on the planner in the
          meantime.
        </p>
        <Link
          href="/planner"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cardinal px-4 py-2.5 text-sm font-semibold text-white hover:bg-cardinal-dark"
        >
          <MapPin className="h-4 w-4" />
          Back to registered map
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-cardinal">Secondary · remaining plan</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">CPRE roadmap</h1>
          <p className="mt-2 max-w-2xl text-sm text-ink-muted">
            {CPRE_CATALOG_YEAR} Computer Engineering sample ({CPRE_TOTAL_CREDITS} cr). Shows{" "}
            <strong className="font-semibold text-ink">remaining</strong> semesters after demo progress — not live
            Workday Academic Progress. Primary flow stays on the map of registered classes.
          </p>
          {state.yearLevel ? (
            <p className="mt-2 text-xs text-ink-muted">
              Standing: <span className="font-medium text-ink">{YEAR_LABELS[state.yearLevel]}</span>
              {" · "}
              {remaining.length} semester{remaining.length === 1 ? "" : "s"} left on this plan
            </p>
          ) : null}
        </div>
        <Link
          href="/planner"
          className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white hover:bg-stone-800"
        >
          <MapPin className="h-4 w-4" />
          Map registered classes
        </Link>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-950">
        Demo Workday ≠ live Academic Progress. Treating year standing (and optional checklist) as completed coursework
        for this preview. Beyer Loop seed (
        {BEYER_LOOP_COURSE_CODES.join(", ")}) is your <em>registered</em> Fall 2026 demo week on the planner — not
        marked complete unless you check it off here.
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={startYear1}
          className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-ink hover:bg-stone-50"
        >
          I&apos;m starting Year 1
        </button>
        <button
          type="button"
          onClick={resetToYear}
          className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-ink hover:bg-stone-50"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset to year standing
        </button>
        <button
          type="button"
          onClick={() => setChecklistOpen((v) => !v)}
          className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-ink hover:bg-stone-50"
        >
          {checklistOpen ? "Hide" : "Edit"} completed checklist
        </button>
      </div>

      {checklistOpen ? (
        <div className="mt-4 max-h-72 overflow-y-auto rounded-2xl border border-stone-200 bg-paper-card p-4">
          <p className="mb-3 text-xs text-ink-muted">
            Toggle courses you&apos;ve already finished. Diff vs the 8-semester template drives the cards below.
          </p>
          <ul className="space-y-1.5">
            {allCourses.map((c) => (
              <li key={c.id}>
                <label className="flex cursor-pointer items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={done.has(c.id)}
                    onChange={() => toggleCourse(c.id)}
                  />
                  <span>
                    <span className="font-medium text-ink">{c.code}</span>
                    <span className="text-ink-muted"> · {c.title}</span>
                    <span className="text-ink-muted"> ({formatCredits(c.credits)})</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="mt-6 text-xs text-ink-muted">{CPRE_ELECTIVES_NOTE}</p>

      {!remaining.length ? (
        <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-6 text-sm text-ink-muted">
          No remaining template courses with the current checklist — every slot is marked complete.
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {remaining.map((sem) => (
            <article
              key={sem.id}
              className="rounded-2xl border border-stone-200 bg-paper-card p-4 shadow-card"
            >
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="text-base font-semibold text-ink">{sem.label}</h2>
                <span className="text-xs font-medium text-ink-muted">{sem.credits} cr</span>
              </div>
              <ul className="mt-3 space-y-2">
                {sem.courses.map((c) => (
                  <li key={c.id} className="flex items-start justify-between gap-2 text-sm">
                    <div>
                      <div className="font-medium text-ink">
                        {c.code}
                        {c.newCore ? (
                          <span className="ml-1.5 rounded-full bg-cardinal px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                            New 26–27
                          </span>
                        ) : null}
                        {c.elective ? (
                          <span className="ml-1.5 rounded-full bg-stone-200 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-ink-muted">
                            Elective
                          </span>
                        ) : null}
                      </div>
                      <div className="text-xs text-ink-muted">{c.title}</div>
                      {c.notes ? <div className="text-[11px] text-ink-muted">{c.notes}</div> : null}
                    </div>
                    <span className="shrink-0 text-xs font-semibold text-ink">{formatCredits(c.credits)}</span>
                  </li>
                ))}
              </ul>
              {sem.id === "y1-fall" ? (
                <Link
                  href="/planner"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cardinal px-3 py-2 text-xs font-semibold text-white hover:bg-cardinal-dark"
                >
                  Build this term&apos;s schedule
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
