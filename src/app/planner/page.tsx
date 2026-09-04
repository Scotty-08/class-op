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
import { conflictingIds } from "@/lib/time";
import type { MapMode, Meeting } from "@/lib/types";

export default function PlannerPage() {
  return (
    <Guard need="major">
      <PlannerInner />
    </Guard>
  );
}

function PlannerInner() {
  const { state, setMeetings, resetSeed } = useApp();
  const [mode, setMode] = useState<MapMode>("overview");
  const [editing, setEditing] = useState<Meeting | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const major = MAJORS.find((m) => m.id === state.majorId);
  const clashes = useMemo(() => conflictingIds(state.meetings), [state.meetings]);

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
          Overlap on the grid (gold outline). The seed keeps ENGR 1010 §03 and MATH 1650 Lec 01 both at Wed 8:50a —
          typical Beyer Loop vs ECpE orientation collision. Edit or drop one.
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <ScheduleGrid meetings={state.meetings} onSelect={setEditing} />
        <div className="flex min-h-[480px] flex-col gap-3">
          <div className="flex rounded-xl border border-stone-200 bg-white p-1 text-sm">
            {(["overview", "mwf", "tr"] as MapMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`flex-1 rounded-lg py-1.5 font-medium capitalize ${
                  mode === m ? "bg-ink text-white" : "text-ink-muted hover:bg-stone-50"
                }`}
              >
                {m === "mwf" ? "MWF" : m === "tr" ? "TR" : "Overview"}
              </button>
            ))}
          </div>
          <div className="min-h-[420px] flex-1">
            <CampusMap meetings={state.meetings} mode={mode} />
          </div>
          <p className="text-[11px] text-ink-muted">
            Orange pin = 212 Beyer Ct / Friley Hall (42.02381, -93.65076). Dashed routes are schematic walks on real OSM
            tiles — not GPS traces. LIB 1600 §10 is online and optional on the map.
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
