"use client";

import { useMemo, useState } from "react";
import { Plus, RotateCcw } from "lucide-react";
import { Guard } from "@/components/Guard";
import { ScheduleGrid } from "@/components/ScheduleGrid";
import { CampusMap } from "@/components/CampusMap";
import { MeetingModal } from "@/components/MeetingModal";
import { AddSectionModal } from "@/components/AddSectionModal";
import { useApp } from "@/lib/context";
import { MAJORS } from "@/lib/majors";
import { DAY_LABEL, DAY_ORDER, conflictingIds } from "@/lib/time";
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
  const { state, setMeetings, resetSeed } = useApp();
  const [selectedDays, setSelectedDays] = useState<DayCode[]>(ALL_DAYS);
  const [editing, setEditing] = useState<Meeting | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const major = MAJORS.find((m) => m.id === state.majorId);
  const clashes = useMemo(() => conflictingIds(state.meetings), [state.meetings]);

  function toggleDay(day: DayCode) {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : DAY_ORDER.filter((d) => prev.includes(d) || d === day),
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-cardinal">Fall 2026 · Beyer Loop</p>
          <h1 className="text-2xl font-semibold tracking-tight">Weekly planner</h1>
          <p className="max-w-2xl text-sm text-ink-muted">
            Cluster walks from Friley: mornings at Carver / Coover / Hoover, CHEM lecture in the afternoon at Troxel,
            avoid scattering labs across campus. {major ? `Major: ${major.name}.` : ""}
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
            onClick={resetSeed}
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-ink hover:bg-stone-50"
          >
            <RotateCcw className="h-4 w-4" />
            Reset Beyer Loop
          </button>
        </div>
      </div>

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
            single day is a numbered walk; multiple days merge with day-colored dashed routes. LIB 1600 §10 is online
            and stays off the map.
          </p>
        </div>
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
