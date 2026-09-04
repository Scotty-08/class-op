"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, CalendarRange, GraduationCap, MapPin, Search } from "lucide-react";
import { Guard } from "@/components/Guard";
import { useApp } from "@/lib/context";
import {
  DEFAULT_MAJOR_ID,
  DEFAULT_PLAN_SLUG,
  getMajor,
  majorsByCollege,
  planCountReady,
  type Major,
  type MajorOption,
} from "@/lib/majors";
import { YEAR_LABELS } from "@/lib/cpre-roadmap";
import type { PlanningMode, YearLevel } from "@/lib/types";

const YEARS: YearLevel[] = [1, 2, 3, 4];

export default function MajorPage() {
  return (
    <Guard need="workday">
      <MajorInner />
    </Guard>
  );
}

function MajorInner() {
  const { state, setProfile, setPlanningMode, setYearLevel } = useApp();
  const router = useRouter();
  const [picked, setPicked] = useState(state.majorId ?? DEFAULT_MAJOR_ID);
  const [planSlug, setPlanSlug] = useState<string | null>(state.planSlug ?? DEFAULT_PLAN_SLUG);
  const [year, setYear] = useState<YearLevel | null>(state.yearLevel);
  const [dest, setDest] = useState<"planner" | "roadmap" | null>(null);
  const [query, setQuery] = useState("");
  const [saveNote, setSaveNote] = useState(false);

  const selected = getMajor(picked);
  const groups = useMemo(() => majorsByCollege(), []);
  const readyCount = planCountReady();

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map(({ college, majors }) => ({
        college,
        majors: majors.filter(
          (m) =>
            m.name.toLowerCase().includes(q) ||
            m.college.toLowerCase().includes(q) ||
            m.blurb.toLowerCase().includes(q) ||
            m.options.some((o) => o.label.toLowerCase().includes(q)),
        ),
      }))
      .filter((g) => g.majors.length > 0);
  }, [groups, query]);

  useEffect(() => {
    if (!selected) return;
    if (selected.planSlug && !selected.options.some((o) => o.slug === planSlug)) {
      setPlanSlug(selected.planSlug);
    }
    if (!selected.hasPlan) setPlanSlug(null);
  }, [selected, planSlug]);

  useEffect(() => {
    if (dest && state.majorId) {
      // Home/living comes after major, before plan/map.
      router.push(`/home/?next=${dest}`);
    }
  }, [dest, state.majorId, router]);

  function chooseMajor(id: string) {
    setPicked(id);
    const m = getMajor(id);
    setPlanSlug(m?.planSlug ?? null);
  }

  function saveProfile(mode: PlanningMode, yearOverride?: YearLevel | null) {
    const opt = selected?.options.find((o) => o.slug === planSlug);
    const y = yearOverride !== undefined ? yearOverride : year;
    setProfile({
      majorId: picked,
      planSlug: planSlug ?? selected?.planSlug ?? null,
      planOption: opt?.option ?? null,
      yearLevel: y ?? undefined,
    });
    setPlanningMode(mode);
    if (y) setYearLevel(y);
    setSaveNote(true);
  }

  /** This semester — catalog plan with current-term focus, then map. */
  function goThisSemester() {
    saveProfile("semester");
    setDest("roadmap");
  }

  /** From year — remaining plan from class standing. */
  function goFromYear() {
    const y = year ?? 3;
    setYear(y);
    saveProfile("forward", y);
    setDest("roadmap");
  }

  function goMap() {
    saveProfile(state.planningMode ?? "semester");
    setDest("planner");
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-wide text-cardinal">Step 3 · Major</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">Pick your major</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-muted">
        Search the ISU undergrad majors list. When a Soar-in-4 catalog plan exists we load it next — pick an option if
        your major has more than one grid. Then choose <strong className="font-medium text-ink">this semester</strong>{" "}
        or <strong className="font-medium text-ink">from your year</strong>. Saved in this browser only.
      </p>

      <section className="mt-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-ink">Major</h2>
            <p className="mt-1 text-xs text-ink-muted">
              From <code className="text-[11px]">majors_list.json</code>
              {" · "}
              {readyCount} majors with catalog plans · others show &ldquo;no catalog plan yet&rdquo;
            </p>
          </div>
          {selected ? (
            <div className="rounded-xl border border-gold bg-gold-soft px-3 py-2 text-xs text-ink">
              <span className="font-semibold">{selected.name}</span>
              {selected.hasPlan ? (
                <span className="ml-2 rounded-full bg-cardinal px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                  Plan ready
                </span>
              ) : (
                <span className="ml-2 text-ink-muted">No catalog plan yet</span>
              )}
            </div>
          ) : null}
        </div>

        <label className="relative mt-3 block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search majors, options, or colleges…"
            className="w-full rounded-2xl border border-stone-200 bg-white py-3 pl-10 pr-4 text-sm text-ink shadow-sm outline-none ring-gold placeholder:text-ink-muted focus:border-gold focus:ring-2"
          />
        </label>

        <div className="mt-3 max-h-[22rem] space-y-4 overflow-y-auto rounded-2xl border border-stone-200 bg-paper-card p-3">
          {filteredGroups.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-ink-muted">No majors match &ldquo;{query}&rdquo;.</p>
          ) : (
            filteredGroups.map(({ college, majors }) => (
              <div key={college}>
                <h3 className="sticky top-0 z-10 bg-paper-card/95 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-muted backdrop-blur">
                  {college}
                </h3>
                <ul className="mt-1 space-y-1">
                  {majors.map((m) => (
                    <MajorRow key={m.id} major={m} selected={picked === m.id} onSelect={chooseMajor} />
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      </section>

      {selected && selected.options.length > 1 ? (
        <section className="mt-6">
          <h2 className="text-sm font-semibold text-ink">Option / concentration</h2>
          <p className="mt-1 text-xs text-ink-muted">
            {selected.name} has {selected.options.length} catalog grids — pick the one that matches your program.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {selected.options.map((o) => (
              <OptionCard
                key={o.slug}
                option={o}
                selected={planSlug === o.slug}
                onSelect={() => setPlanSlug(o.slug)}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-8 rounded-2xl border border-stone-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-ink">Class standing</h2>
        <p className="mt-1 text-xs text-ink-muted">
          Used for the <em>from my year</em> path. Optional for this-semester / map — CPRE can infer from Current
          Classes.
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

      <div className="mt-8 space-y-3">
        <p className="text-xs text-ink-muted">
          {saveNote
            ? "Saved in this browser for quick return."
            : "Pick a plan path — this semester (current term) or from your year (remaining roadmap)."}
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={goThisSemester}
            className="flex items-start gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-4 text-left transition hover:border-gold hover:bg-gold-soft/40"
          >
            <CalendarRange className="mt-0.5 h-5 w-5 shrink-0 text-cardinal" />
            <span>
              <span className="block text-sm font-semibold text-ink">This semester</span>
              <span className="mt-0.5 block text-xs text-ink-muted">
                Open the catalog plan with your current term highlighted, then map registered Current Classes.
              </span>
            </span>
          </button>
          <button
            type="button"
            onClick={goFromYear}
            className="flex items-start gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-4 text-left transition hover:border-gold hover:bg-gold-soft/40"
          >
            <GraduationCap className="mt-0.5 h-5 w-5 shrink-0 text-cardinal" />
            <span>
              <span className="block text-sm font-semibold text-ink">
                From my year{year ? ` (Y${year})` : ""}
              </span>
              <span className="mt-0.5 block text-xs text-ink-muted">
                Mark earlier years complete and walk the remaining catalog semesters from your standing.
              </span>
            </span>
          </button>
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={goMap}
            className="inline-flex items-center gap-2 rounded-xl bg-cardinal px-5 py-2.5 text-sm font-semibold text-white hover:bg-cardinal-dark"
          >
            <MapPin className="h-4 w-4" />
            Map registered classes
          </button>
        </div>
      </div>
    </div>
  );
}

function MajorRow({
  major,
  selected,
  onSelect,
}: {
  major: Major;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(major.id)}
        className={`flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition ${
          selected
            ? "border-gold bg-gold-soft shadow-sm ring-2 ring-gold"
            : "border-transparent hover:border-stone-200 hover:bg-white"
        }`}
      >
        <span
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
            selected ? "border-cardinal bg-cardinal text-white" : "border-stone-300 bg-white text-transparent"
          }`}
        >
          <Check className="h-3 w-3" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-ink">{major.name}</span>
            {major.hasPlan ? (
              <span className="rounded-full bg-cardinal px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                Ready
              </span>
            ) : null}
            {major.options.length > 1 ? (
              <span className="rounded-full bg-stone-200 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-ink-muted">
                {major.options.length} options
              </span>
            ) : null}
          </span>
          <span className="mt-0.5 block text-[11px] leading-snug text-ink-muted">{major.blurb}</span>
        </span>
      </button>
    </li>
  );
}

function OptionCard({
  option,
  selected,
  onSelect,
}: {
  option: MajorOption;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`rounded-2xl border px-4 py-3 text-left transition ${
        selected
          ? "border-gold bg-gold-soft shadow-card ring-2 ring-gold"
          : "border-stone-200 bg-white hover:border-stone-400"
      }`}
    >
      <div className="text-sm font-semibold text-ink">{option.label}</div>
      <div className="mt-0.5 text-[11px] text-ink-muted">
        {option.totalCredits != null ? `${option.totalCredits} cr` : "Catalog plan"}
        {option.displayName !== option.label ? ` · ${option.displayName}` : ""}
      </div>
    </button>
  );
}
