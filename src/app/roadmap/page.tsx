"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, MapPin, RotateCcw } from "lucide-react";
import { Guard } from "@/components/Guard";
import { useApp } from "@/lib/context";
import { getMajor } from "@/lib/majors";
import { currentRegisteredCourseCodes } from "@/lib/current-classes-seed";
import {
  CPRE_ELECTIVES_NOTE,
  YEAR_LABELS,
  formatCredits,
  remainingSemesters,
  registeredTemplateCodes,
  type RoadmapSemester,
} from "@/lib/cpre-roadmap";
import {
  completedIdsBeforeYear,
  degreePlanToRoadmap,
  electivesNoteFromPlan,
  formatCatalogYear,
  getManifestEntry,
  hasPlanFile,
  loadDegreePlanBySlug,
  remainingFromYear,
  type DegreePlan,
} from "@/lib/degree-plans";
import type { YearLevel } from "@/lib/types";

export default function RoadmapPage() {
  return (
    <Guard need="home">
      <RoadmapInner />
    </Guard>
  );
}

function RoadmapInner() {
  const {
    state,
    setCompletedCourseIds,
    setYearLevel,
    setSelectedPlanCourseIds,
    effectiveCompletedIds,
  } = useApp();
  const major = getMajor(state.majorId);
  const planSlug = state.planSlug ?? major?.planSlug ?? null;
  const manifest = getManifestEntry(planSlug);
  const hasPlan = Boolean(planSlug) || hasPlanFile(state.majorId, major?.name);
  const isCpre = state.majorId === "cpre" || planSlug === "computer-engineering-b-s";
  const mode = state.planningMode;
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [degreePlan, setDegreePlan] = useState<DegreePlan | null>(null);
  const [loading, setLoading] = useState(hasPlan);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!planSlug) {
      setDegreePlan(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    loadDegreePlanBySlug(planSlug).then((plan) => {
      if (cancelled) return;
      setDegreePlan(plan);
      setLoading(false);
      if (!plan) setLoadError("Could not load plan JSON from the static export.");
    });
    return () => {
      cancelled = true;
    };
  }, [planSlug]);

  const roadmap: RoadmapSemester[] = useMemo(() => {
    if (!degreePlan) return [];
    return degreePlanToRoadmap(degreePlan, state.majorId);
  }, [degreePlan, state.majorId]);

  // When entering forward mode with a year, seed completed ids from earlier years once.
  useEffect(() => {
    if (mode !== "forward" || !roadmap.length || !state.yearLevel) return;
    if (state.completedCourseIds.length) return;
    const ids = completedIdsBeforeYear(roadmap, state.yearLevel);
    if (ids.length) setCompletedCourseIds(ids);
  }, [mode, roadmap, state.yearLevel, state.completedCourseIds.length, setCompletedCourseIds]);

  const done = useMemo(() => new Set(effectiveCompletedIds), [effectiveCompletedIds]);
  const selectedPlan = useMemo(
    () => new Set(state.selectedPlanCourseIds),
    [state.selectedPlanCourseIds],
  );

  const registeredCodes = useMemo(() => {
    const fromMeetings = state.meetings.map((m) => m.course);
    const codes = fromMeetings.length ? fromMeetings : currentRegisteredCourseCodes();
    if (isCpre) return registeredTemplateCodes(codes);
    const keys = new Set(codes.map((c) => c.trim().toUpperCase().replace(/[_\s]+/g, " ")));
    const out = new Set<string>();
    for (const sem of roadmap) {
      for (const c of sem.courses) {
        const k = c.code.trim().toUpperCase();
        if (keys.has(k)) out.add(k);
      }
    }
    return out;
  }, [state.meetings, isCpre, roadmap]);

  const remaining = useMemo(() => {
    if (mode === "forward" && state.yearLevel) {
      return remainingFromYear(roadmap, done, state.yearLevel);
    }
    if (!isCpre) {
      return roadmap
        .map((sem) => {
          const courses = sem.courses.filter((c) => !done.has(c.id));
          if (!courses.length) return null;
          const credits = courses.reduce<number>(
            (sum, c) => sum + (typeof c.credits === "number" ? c.credits : 0),
            0,
          );
          return { ...sem, courses, credits };
        })
        .filter((s): s is RoadmapSemester => s !== null);
    }
    return remainingSemesters(done);
  }, [done, isCpre, roadmap, mode, state.yearLevel]);

  const displaySemesters = mode === "forward" ? remaining : roadmap;
  const allCourses = useMemo(() => roadmap.flatMap((s) => s.courses), [roadmap]);

  function toggleCourse(id: string) {
    const next = new Set(done);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setCompletedCourseIds([...next]);
  }

  function toggleSelectedPlan(id: string) {
    const next = new Set(selectedPlan);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedPlanCourseIds([...next]);
  }

  function resetToYear() {
    const y = (state.yearLevel ?? 3) as YearLevel;
    setYearLevel(y);
    if (roadmap.length) setCompletedCourseIds(completedIdsBeforeYear(roadmap, y));
  }

  function startYear1() {
    setYearLevel(1);
    setCompletedCourseIds([]);
  }

  if (!hasPlan) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-xs font-semibold uppercase tracking-wide text-cardinal">View my plan</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">No catalog plan yet</h1>
        <p className="mt-3 text-sm text-ink-muted">
          {major ? (
            <>
              <strong className="font-semibold text-ink">{major.name}</strong> is on the ISU majors list, but a
              per-major plan file is not in the Soar-in-4 package yet.
            </>
          ) : (
            <>Pick a major with a ready plan, or map registered Current Classes on the planner.</>
          )}
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href="/major"
            className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:bg-stone-50"
          >
            Change major
          </Link>
          <Link
            href="/planner"
            className="inline-flex items-center gap-2 rounded-xl bg-cardinal px-4 py-2.5 text-sm font-semibold text-white hover:bg-cardinal-dark"
          >
            <MapPin className="h-4 w-4" />
            Map registered classes
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-sm text-ink-muted">Loading catalog plan…</p>
      </div>
    );
  }

  if (!degreePlan || loadError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Couldn’t load plan</h1>
        <p className="mt-2 text-sm text-ink-muted">
          {loadError || "Missing plan JSON."} Expected{" "}
          <code className="text-xs">public/data/isu/degree-plans/plans/{planSlug}.json</code>.
        </p>
        <Link href="/major" className="mt-4 inline-block text-sm font-semibold text-cardinal underline">
          Back to major picker
        </Link>
      </div>
    );
  }

  const catalogYear =
    formatCatalogYear(degreePlan.catalogYear || manifest?.catalogYear) || (isCpre ? "2026–27" : "");
  const totalCredits = degreePlan.totalCredits ?? manifest?.totalCredits;
  const electivesNote = isCpre ? CPRE_ELECTIVES_NOTE : electivesNoteFromPlan(degreePlan);
  const titleMajor =
    degreePlan.displayName ||
    manifest?.displayName ||
    `${degreePlan.major}${degreePlan.degree ? `, ${degreePlan.degree}` : ""}`;
  const modeLabel =
    mode === "forward"
      ? `From year${state.yearLevel ? ` · Y${state.yearLevel}` : ""}`
      : mode === "semester"
        ? "This semester"
        : "Catalog plan";

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-cardinal">{modeLabel}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            {isCpre ? `CPRE ${catalogYear} roadmap` : `${titleMajor}${catalogYear ? ` · ${catalogYear}` : ""}`}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-ink-muted">
            {titleMajor}
            {totalCredits != null ? ` sample (${totalCredits} cr)` : " sample plan"} from the degree-plans package.
            {mode === "forward" ? (
              <> Showing remaining semesters from your class standing.</>
            ) : mode === "semester" ? (
              <>
                {" "}
                Current term is highlighted; optionally mark plan courses you&apos;re taking this semester, then open
                the map.
              </>
            ) : isCpre ? (
              <>
                {" "}
                Current Classes from Workday are highlighted as{" "}
                <strong className="font-semibold text-ink">in progress</strong>.
              </>
            ) : (
              <> Map registered Current Classes anytime on the planner.</>
            )}
          </p>
          {state.yearLevel ? (
            <p className="mt-2 text-xs text-ink-muted">
              Standing: <span className="font-medium text-ink">{YEAR_LABELS[state.yearLevel]}</span>
              {remaining.length ? (
                <>
                  {" · "}
                  {remaining.length} semester{remaining.length === 1 ? "" : "s"} with remaining slots
                </>
              ) : null}
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

      <div className="mt-4 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs leading-relaxed text-ink-muted">
        Loaded from <code className="text-[10px]">plans/{planSlug}.json</code>
        {degreePlan.sourceUrl || manifest?.sourceUrl ? (
          <>
            {" · "}
            <a
              href={degreePlan.sourceUrl || manifest?.sourceUrl || "#"}
              className="text-cardinal underline"
              target="_blank"
              rel="noreferrer"
            >
              Catalog source
            </a>
          </>
        ) : null}
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
            Toggle courses you&apos;ve already finished. Diff vs the semester template drives the cards below.
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

      {electivesNote ? <p className="mt-6 text-xs text-ink-muted">{electivesNote}</p> : null}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {displaySemesters.map((sem) => {
          const hasCurrent = sem.courses.some((c) => registeredCodes.has(c.code.trim().toUpperCase()));
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
                  const isPicked = selectedPlan.has(c.id);
                  return (
                    <li
                      key={c.id}
                      className={`flex items-start justify-between gap-2 text-sm ${
                        isDone && !isNow ? "opacity-50" : ""
                      }`}
                    >
                      <div className="min-w-0">
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
                          {isPicked && mode === "semester" ? (
                            <span className="ml-1.5 rounded-full bg-gold px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-ink">
                              This sem
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
                        {mode === "semester" && !isDone ? (
                          <button
                            type="button"
                            onClick={() => toggleSelectedPlan(c.id)}
                            className="mt-1 text-[11px] font-medium text-cardinal hover:underline"
                          >
                            {isPicked ? "Unmark this semester" : "Mark for this semester"}
                          </button>
                        ) : null}
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
