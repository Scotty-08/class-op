"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Plus, RotateCcw, Upload, Route, RefreshCw } from "lucide-react";
import { Guard } from "@/components/Guard";
import { ScheduleGrid } from "@/components/ScheduleGrid";
import { CampusMap } from "@/components/CampusMap";
import { HomeBaseCard } from "@/components/HomeBaseCard";
import { MeetingModal } from "@/components/MeetingModal";
import { AddSectionModal } from "@/components/AddSectionModal";
import { useApp } from "@/lib/context";
import { DEFAULT_HOME, resolveWalkStart } from "@/lib/buildings";
import { getMajor } from "@/lib/majors";
import { YEAR_LABELS } from "@/lib/cpre-roadmap";
import { DAY_LABEL, DAY_ORDER, conflictingIds } from "@/lib/time";
import { parseWorkdayCurrentJson } from "@/lib/workday-current";
import type { DayCode, Meeting } from "@/lib/types";

const ALL_DAYS: DayCode[] = [...DAY_ORDER];

export default function PlannerPage() {
  return (
    <Guard need="major">
      <PlannerInner />
    </Guard>
  );
}

function PlannerInner() {
  const { state, setMeetings, loadY1DemoSeed, loadCurrentClasses, importWorkdayExport } = useApp();
  const [selectedDays, setSelectedDays] = useState<DayCode[]>(ALL_DAYS);
  const [editing, setEditing] = useState<Meeting | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importOk, setImportOk] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const major = getMajor(state.majorId);
  const clashes = useMemo(() => conflictingIds(state.meetings), [state.meetings]);
  const walkStart = useMemo(
    () =>
      resolveWalkStart({
        home: state.home ?? DEFAULT_HOME,
        commuteOffCampus: state.commuteOffCampus,
        walkStartLotId: state.walkStartLotId,
      }),
    [state.home, state.commuteOffCampus, state.walkStartLotId],
  );
  const isCurrent = state.scheduleSource === "current";
  const isDemoY1 = state.scheduleSource === "demo";
  const isImport = state.scheduleSource === "import";

  function toggleDay(day: DayCode) {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : DAY_ORDER.filter((d) => prev.includes(d) || d === day),
    );
  }

  async function onPickFile(file: File | null) {
    setImportError(null);
    setImportOk(null);
    if (!file) return;
    try {
      const text = await file.text();
      const data = parseWorkdayCurrentJson(text);
      importWorkdayExport(data);
      setImportOk(`Imported ${data.classes.length} registered section${data.classes.length === 1 ? "" : "s"} from Workday JSON.`);
    } catch (e) {
      setImportError(e instanceof Error ? e.message : "Could not parse Workday JSON");
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-cardinal">
            {isImport
              ? "Imported · Workday Current Classes"
              : isDemoY1
                ? "Optional · Y1 Beyer Loop demo seed"
                : "Current Classes · Fall 2026 registered"}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">Map my registered classes</h1>
          <p className="max-w-2xl text-sm text-ink-muted">
            Registered meetings on a day-checkbox campus map from your home base (default Friley / 212 Beyer Ct).
            {major ? ` ${major.name}` : ""}
            {state.yearLevel ? ` · ${YEAR_LABELS[state.yearLevel]}` : ""}.
            {isCurrent
              ? " Default seed is Workday Current Classes (SCIENCE, PEARSON, CARVER, COOVER, FOODSCI). Online / empty-day meetings stay in the list only."
              : isDemoY1
                ? " Optional Y1 demo — not the primary registered schedule."
                : " Buildings mapped from Workday codes."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-ink px-3 py-2 text-sm font-semibold text-white hover:bg-stone-800"
          >
            <Plus className="h-4 w-4" />
            Add section
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-ink hover:bg-stone-50"
          >
            <Upload className="h-4 w-4" />
            Import Workday JSON
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
          />
          <button
            type="button"
            onClick={() => {
              loadCurrentClasses();
              setImportOk("Restored Fall 2026 Current Classes on the map.");
              setImportError(null);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-ink hover:bg-stone-50"
          >
            <RefreshCw className="h-4 w-4" />
            Reload Current Classes
          </button>
          <button
            type="button"
            onClick={() => {
              loadY1DemoSeed();
              setImportOk("Loaded optional Y1 Beyer Loop demo seed.");
              setImportError(null);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-stone-300 bg-stone-50 px-3 py-2 text-sm font-medium text-ink-muted hover:bg-stone-100"
          >
            <RotateCcw className="h-4 w-4" />
            Load Y1 demo seed
          </button>
        </div>
      </div>

      {isCurrent ? (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-950">
          <strong className="font-semibold">Workday Current Classes</strong> — COMS 3190 · COMS 3090 · CPRE 3100 · EE
          2300. Empty-day / online sections (COMS 3090-A, CPRE 3100-A) stay on the schedule grid but skip map pins.
        </div>
      ) : null}
      {isDemoY1 ? (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          <strong className="font-semibold">Optional Y1 demo</strong> — Beyer Loop Fall Y1 seed. Use{" "}
          <button type="button" className="font-semibold underline" onClick={loadCurrentClasses}>
            Reload Current Classes
          </button>{" "}
          for the primary registered schedule.
        </div>
      ) : null}

      {importError ? (
        <div className="mb-4 rounded-xl border border-cardinal/30 bg-cardinal-soft px-3 py-2 text-sm text-cardinal-dark">
          {importError}
        </div>
      ) : null}
      {importOk ? (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          {importOk}
        </div>
      ) : null}

      {clashes.size ? (
        <div className="mb-4 rounded-xl border border-yellow-300 bg-yellow-50 px-3 py-2 text-sm text-yellow-950">
          Overlap on the grid (gold outline). Two meetings share a day and time — edit or drop one to clear the clash.
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <ScheduleGrid meetings={state.meetings} onSelect={setEditing} />
        <div className="flex min-h-[480px] flex-col gap-3">
          <HomeBaseCard />
          <div className="rounded-xl border border-stone-200 bg-white p-2">
            <div className="mb-1.5 flex items-center justify-between px-1">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                Campus map days
              </span>
              <div className="flex gap-1.5 text-[11px]">
                <button
                  type="button"
                  className="font-medium text-cardinal hover:underline"
                  onClick={() => setSelectedDays(ALL_DAYS)}
                >
                  All
                </button>
                <span className="text-stone-300">·</span>
                <button
                  type="button"
                  className="font-medium text-ink-muted hover:underline"
                  onClick={() => setSelectedDays([])}
                >
                  None
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {DAY_ORDER.map((d) => {
                const on = selectedDays.includes(d);
                return (
                  <label
                    key={d}
                    className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm font-medium transition ${
                      on
                        ? "border-ink bg-ink text-white"
                        : "border-stone-200 bg-white text-ink-muted hover:bg-stone-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={on}
                      onChange={() => toggleDay(d)}
                    />
                    {DAY_LABEL[d]}
                  </label>
                );
              })}
            </div>
          </div>
          <div className="min-h-[420px] flex-1">
            <CampusMap meetings={state.meetings} selectedDays={selectedDays} home={walkStart.start} usingLot={walkStart.usingLot} />
          </div>
          <p className="text-[11px] text-ink-muted">
            Orange pin = walk-start (home on campus, or your ISU commuter lot when off-campus). Online / empty-day
            meetings stay off the map. Buildings include Science Hall and Food Sciences from the Current Classes export.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-stone-200 bg-paper-card p-4 sm:flex sm:items-center sm:justify-between sm:gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">View my plan</p>
          <p className="mt-1 text-sm text-ink">
            {major?.hasPlan
              ? `${major.name} catalog plan — pick this semester or plan from your year.`
              : "No catalog plan yet — Current Classes stay on the map."}
          </p>
        </div>
        <Link
          href="/roadmap"
          className="mt-3 inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-stone-50 sm:mt-0"
        >
          <Route className="h-4 w-4 text-cardinal" />
          View my plan
        </Link>
      </div>

      {editing ? (
        <MeetingModal
          meeting={editing}
          onClose={() => setEditing(null)}
          onSave={(m) => {
            setMeetings((prev) => prev.map((x) => (x.id === m.id ? m : x)));
            setEditing(null);
          }}
          onDelete={(id) => {
            setMeetings((prev) => prev.filter((x) => x.id !== id));
            setEditing(null);
          }}
        />
      ) : null}
      {addOpen ? (
        <AddSectionModal
          onClose={() => setAddOpen(false)}
          onAdd={(m) => {
            setMeetings((prev) => [...prev, m]);
            setAddOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}
