"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Plus, RotateCcw, Upload, Route } from "lucide-react";
import { Guard } from "@/components/Guard";
import { ScheduleGrid } from "@/components/ScheduleGrid";
import { CampusMap } from "@/components/CampusMap";
import { MeetingModal } from "@/components/MeetingModal";
import { AddSectionModal } from "@/components/AddSectionModal";
import { useApp } from "@/lib/context";
import { MAJORS } from "@/lib/majors";
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
  const { state, setMeetings, resetSeed, importWorkdayExport } = useApp();
  const [selectedDays, setSelectedDays] = useState<DayCode[]>(ALL_DAYS);
  const [editing, setEditing] = useState<Meeting | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importOk, setImportOk] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const major = MAJORS.find((m) => m.id === state.majorId);
  const clashes = useMemo(() => conflictingIds(state.meetings), [state.meetings]);
  const isDemo = state.scheduleSource !== "import";

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

  async function loadBundledDemoExport() {
    setImportError(null);
    setImportOk(null);
    try {
      const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
      const res = await fetch(`${base}/data/isu/workday-current-classes-demo.json`);
      if (!res.ok) throw new Error(`Fetch failed (${res.status})`);
      const data = parseWorkdayCurrentJson(await res.text());
      importWorkdayExport(data);
      setImportOk("Loaded bundled Workday Current Classes demo export onto the map.");
    } catch (e) {
      setImportError(e instanceof Error ? e.message : "Could not load demo export");
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-cardinal">
            {isDemo ? "Demo · registered Fall 2026 · Beyer Loop" : "Imported · Workday Current Classes"}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">Map my registered classes</h1>
          <p className="max-w-2xl text-sm text-ink-muted">
            Primary view: meetings you already registered for, on a day-checkbox campus map from Friley / 212 Beyer Ct.
            {major ? ` ${major.name}` : ""}
            {state.yearLevel ? ` · ${YEAR_LABELS[state.yearLevel]}` : ""}.
            {isDemo
              ? " Seed is simulated registered sections until live Workday SSO reads My Classes."
              : " Buildings mapped from Workday codes (CARVER → carver, etc.)."}
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
            onClick={resetSeed}
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-ink hover:bg-stone-50"
          >
            <RotateCcw className="h-4 w-4" />
            Reset Beyer Loop demo
          </button>
        </div>
      </div>

      {isDemo ? (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          <strong className="font-semibold">Demo registered schedule</strong> — not live Workday. Beyer Loop Fall Y1
          sections are labeled as simulated Current Classes. You can also{" "}
          <button type="button" className="font-semibold underline" onClick={loadBundledDemoExport}>
            load the bundled Workday JSON shape
          </button>{" "}
          or import your own export.
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
            <CampusMap meetings={state.meetings} selectedDays={selectedDays} />
          </div>
          <p className="text-[11px] text-ink-muted">
            Orange pin = 212 Beyer Ct / Friley Hall (42.02381, -93.65076). Check days to compose one Leaflet map —
            single day is a numbered walk; multiple days merge with day-colored dashed routes. Online sections stay off
            the map.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-stone-200 bg-paper-card p-4 sm:flex sm:items-center sm:justify-between sm:gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Secondary</p>
          <p className="mt-1 text-sm text-ink">
            Remaining CPRE courses (2026–27 template) for future-term walk optimization — not the first screen after
            login.
          </p>
        </div>
        <Link
          href="/roadmap"
          className="mt-3 inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-stone-50 sm:mt-0"
        >
          <Route className="h-4 w-4 text-cardinal" />
          View remaining roadmap
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
