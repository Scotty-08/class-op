"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, MapPin, RotateCcw } from "lucide-react";
import { Guard } from "@/components/Guard";
import { useApp } from "@/lib/context";
import { MAJORS } from "@/lib/majors";
import { currentRegisteredCourseCodes } from "@/lib/current-classes-seed";
import {
  CPRE_CATALOG_YEAR,
  CPRE_ELECTIVES_NOTE,
  CPRE_ROADMAP,
  CPRE_TOTAL_CREDITS,
  YEAR_LABELS,
  formatCredits,
  remainingSemesters,
  registeredTemplateCodes,
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
  const registeredCodes = useMemo(() => {
    const fromMeetings = state.meetings.map((m) => m.course);
    const codes = fromMeetings.length ? fromMeetings : currentRegisteredCourseCodes();
    return registeredTemplateCodes(codes);
  }, [state.meetings]);
  const remaining = useMemo(() => remainingSemesters(done), [done]);
  const allCourses = useMemo(() => CPRE_ROADMAP.flatMap((s) => s.courses), []);

  function toggleCourse(id: string) {
    const next = new Set(done);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setCompletedCourseIds([...next]);
  }

  function resetToYear() {
    const y = (state.yearLevel ?? 3) as YearLevel;
    setYearLevel(y);
  }

  function startYear1() {
    setYearLevel(1);
  }

  if (!isCpre) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-xs font-semibold uppercase tracking-wide text-cardinal">View my plan</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Roadmap</h1>
        <p className="mt-3 text-sm text-ink-muted">
          A semester-by-semester plan is wired for Computer Engineering first.{" "}
          {major ? `${major.name} ` : "This major "}comes later. Map your registered Current Classes on the planner in
          the meantime.
        </p>
        <Link
          href="/planner"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cardinal px-4 py-2.5 text-sm font-semibold text-white hover:bg-cardinal-dark"
        >
          <MapPin className="h-4 w-4" />
          Map registered classes
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-cardinal">View my plan</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">CPRE {CPRE_CATALOG_YEAR} roadmap</h1>
          <p className="mt-2 max-w-2xl text-sm text-ink-muted">
            Computer Engineering sample ({CPRE_TOTAL_CREDITS} cr). Current Classes from Workday are highlighted as{" "}
            <strong className="font-semibold text-ink">in progress</strong>; earlier template courses count as
            completed for this preview.
          </p>
          {state.yearLevel ? (
            <p className="mt-2 text-xs text-ink-muted">
              Standing: <span className="font-medium text-ink">{YEAR_LABELS[state.yearLevel]}</span>
              {" · "}
              {remaining.length} semester{remaining.length === 1 ? "" : "s"} with remaining slots
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

      <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs leading-relaxed text-emerald-950">
        Current Classes on the map: COMS 3090, EE 2300, CPRE 3100 (plus COMS 3190 elective / UI). Prior-year cores before
        those terms are marked complete. Not live Workday Academic Progress.
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
                    {registeredCodes.has(c.code.trim().toUpperCase()) ? (
                      <span className="ml-1.5 rounded-full bg-cardinal px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                        Current
                      </span>
                    ) : null}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="mt-6 text-xs text-ink-muted">{CPRE_ELECTIVES_NOTE}</p>

      {/* Full plan with current term highlight */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {CPRE_ROADMAP.map((sem) => {
          const hasCurrent = sem.courses.some((c) =>
            registeredCodes.has(c.code.trim().toUpperCase()),
          );
          return (
            <article
              key={sem.id}
              className={`rounded-2xl border p-4 shadow-card ${
                hasCurrent
                  ? "border-cardinal bg-cardinal-soft/40 ring-2 ring-cardinal/30"
                  : "border-stone-200 bg-paper-card"
              }`}
            >
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="text-base font-semibold text-ink">
                  {sem.label}
                  {hasCurrent ? (
                    <span className="ml-2 rounded-full bg-cardinal px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                      Current term
                    </span>
                  ) : null}
                </h2>
                <span className="text-xs font-medium text-ink-muted">{sem.credits} cr</span>
              </div>
              <ul className="mt-3 space-y-2">
                {sem.courses.map((c) => {
                  const isDone = done.has(c.id);
                  const isNow = registeredCodes.has(c.code.trim().toUpperCase());
                  return (
                    <li
                      key={c.id}
                      className={`flex items-start justify-between gap-2 text-sm ${
                        isDone && !isNow ? "opacity-50" : ""
                      }`}
                    >
                      <div>
                        <div className="font-medium text-ink">
                          {c.code}
                          {isNow ? (
                            <span className="ml-1.5 rounded-full bg-cardinal px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                              Registered
                            </span>
                          ) : null}
                          {isDone && !isNow ? (
                            <span className="ml-1.5 rounded-full bg-stone-200 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-ink-muted">
                              Done
                            </span>
                          ) : null}
                          {c.newCore ? (
                            <span className="ml-1.5 rounded-full bg-ink px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
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
                  );
                })}
              </ul>
              {hasCurrent ? (
                <Link
                  href="/planner"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cardinal px-3 py-2 text-xs font-semibold text-white hover:bg-cardinal-dark"
                >
                  Map this term&apos;s registered classes
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}
