"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { BUILDINGS } from "@/lib/buildings";
import { DAY_ORDER } from "@/lib/time";
import type { DayCode, Meeting, MeetingFormat } from "@/lib/types";

const FORMATS: MeetingFormat[] = ["Lecture", "Discussion", "Laboratory", "Online", "Other"];

export function MeetingModal({
  meeting,
  onClose,
  onSave,
  onDelete,
}: {
  meeting: Meeting;
  onClose: () => void;
  onSave: (m: Meeting) => void;
  onDelete: (id: string) => void;
}) {
  const [draft, setDraft] = useState<Meeting>(meeting);

  useEffect(() => {
    setDraft(meeting);
  }, [meeting]);

  function toggleDay(d: DayCode) {
    setDraft((s) => ({
      ...s,
      days: s.days.includes(d) ? s.days.filter((x) => x !== d) : [...DAY_ORDER.filter((x) => [...s.days, d].includes(x))],
    }));
  }

  const online = draft.format === "Online" || draft.buildingId === "online";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/40 p-3 sm:items-center">
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink">Edit meeting</h2>
            <p className="text-xs text-ink-muted">Changes stay in this browser (localStorage).</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 hover:bg-stone-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Course">
            <input
              className="input"
              value={draft.course}
              onChange={(e) => setDraft({ ...draft, course: e.target.value })}
            />
          </Field>
          <Field label="Section">
            <input
              className="input"
              value={draft.section}
              onChange={(e) => setDraft({ ...draft, section: e.target.value })}
            />
          </Field>
          <Field label="Title" className="sm:col-span-2">
            <input
              className="input"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
          </Field>
          <Field label="Format">
            <select
              className="input"
              value={draft.format}
              onChange={(e) => {
                const format = e.target.value as MeetingFormat;
                setDraft({
                  ...draft,
                  format,
                  online: format === "Online",
                  buildingId: format === "Online" ? "online" : draft.buildingId === "online" ? "carver" : draft.buildingId,
                });
              }}
            >
              {FORMATS.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </Field>
          <Field label="Building">
            <select
              className="input"
              value={draft.buildingId}
              onChange={(e) => setDraft({ ...draft, buildingId: e.target.value, online: e.target.value === "online" })}
            >
              <option value="online">Online / arranged</option>
              {BUILDINGS.filter((b) => b.id !== "friley").map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} (~{b.walkMin} min)
                </option>
              ))}
            </select>
          </Field>
          <Field label="Room">
            <input
              className="input"
              value={draft.room ?? ""}
              onChange={(e) => setDraft({ ...draft, room: e.target.value })}
            />
          </Field>
          <Field label="Color">
            <input
              type="color"
              className="h-10 w-full cursor-pointer rounded-lg border border-stone-200"
              value={draft.color}
              onChange={(e) => setDraft({ ...draft, color: e.target.value })}
            />
          </Field>
          <Field label="Start">
            <input
              type="time"
              className="input"
              value={draft.start ?? ""}
              disabled={online}
              onChange={(e) => setDraft({ ...draft, start: e.target.value || null })}
            />
          </Field>
          <Field label="End">
            <input
              type="time"
              className="input"
              value={draft.end ?? ""}
              disabled={online}
              onChange={(e) => setDraft({ ...draft, end: e.target.value || null })}
            />
          </Field>
          <div className="sm:col-span-2">
            <div className="mb-1 text-xs font-medium text-ink-muted">Days</div>
            <div className="flex flex-wrap gap-1.5">
              {DAY_ORDER.map((d) => {
                const on = draft.days.includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDay(d)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                      on ? "bg-ink text-white" : "bg-stone-100 text-ink-muted"
                    }`}
                  >
                    {d === "R" ? "Thu" : d === "T" ? "Tue" : d}
                  </button>
                );
              })}
            </div>
          </div>
          <Field label="Notes" className="sm:col-span-2">
            <textarea
              className="input min-h-[72px]"
              value={draft.notes ?? ""}
              onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
            />
          </Field>
        </div>
        <div className="mt-5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => onDelete(draft.id)}
            className="text-sm font-medium text-cardinal hover:underline"
          >
            Remove block
          </button>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="rounded-xl px-3 py-2 text-sm text-ink-muted hover:bg-stone-100">
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onSave({ ...draft, online })}
              className="rounded-xl bg-cardinal px-4 py-2 text-sm font-semibold text-white hover:bg-cardinal-dark"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-xs font-medium text-ink-muted">{label}</span>
      {children}
    </label>
  );
}
