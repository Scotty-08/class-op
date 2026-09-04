"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import type { CatalogSection, Meeting } from "@/lib/types";
import { formatDays, formatRange, uid } from "@/lib/time";
import { BUILDING_BY_ID, walkLabel } from "@/lib/buildings";
import { resolveSectionLocation } from "@/lib/workday-rooms";
import catalog from "@/data/catalog.json";

export function AddSectionModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (m: Meeting) => void;
}) {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<CatalogSection[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    try {
      setRows((catalog as { sections: CatalogSection[] }).sections);
    } catch {
      setErr("Could not load the Fall 2026 section catalog.");
    }
  }, []);

  const filtered = useMemo(() => {
    if (!rows) return [];
    const s = q.trim().toLowerCase();
    const list = s
      ? rows.filter(
          (r) =>
            r.course.toLowerCase().includes(s) ||
            r.title.toLowerCase().includes(s) ||
            r.section.toLowerCase().includes(s) ||
            r.format.toLowerCase().includes(s),
        )
      : rows;
    return list.slice(0, 80);
  }, [rows, q]);

  function locationFor(row: CatalogSection) {
    return resolveSectionLocation({
      course: row.course,
      section: row.section,
      catalogBuildingId: row.buildingId,
      online: row.online,
      delivery: row.delivery,
    });
  }

  function add(row: CatalogSection) {
    const loc = locationFor(row);
    const online = loc.buildingId === "online" || Boolean(row.online);
    const format =
      row.format === "Lecture" ||
      row.format === "Discussion" ||
      row.format === "Laboratory"
        ? row.format
        : online
          ? "Online"
          : "Other";
    const buildingNote = loc.fromWorkdayRooms
      ? loc.workdayBuilding
        ? `Workday ${loc.workdayBuilding}${loc.room ? ` ${loc.room}` : ""}`
        : "Workday (no building / online)"
      : "Building inferred (no Workday room row)";
    onAdd({
      id: uid("cat"),
      course: row.course,
      title: row.title,
      section: row.section,
      format,
      days: row.days,
      start: row.start,
      end: row.end,
      buildingId: loc.buildingId,
      room: loc.room,
      color: row.color,
      credits: row.credits,
      online: online || undefined,
      notes: `${row.days_times} · ${row.status} · ${row.openSeats} open (classes.iastate.edu). ${buildingNote}.`,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/40 p-3 sm:items-center">
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-stone-100 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-ink">Add a Fall 2026 section</h2>
            <p className="text-xs text-ink-muted">
              Trimmed catalog from api.classes.iastate.edu. Buildings/rooms resolved from Workday
              rooms dump when available.
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 hover:bg-stone-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
            <input
              autoFocus
              className="input pl-9"
              placeholder="Search MATH 1650, CPRE, CHEM lab…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
          {err ? <p className="text-sm text-cardinal">{err}</p> : null}
          {!rows && !err ? <p className="text-sm text-ink-muted">Loading catalog…</p> : null}
          {rows ? (
            <ul className="divide-y divide-stone-100 rounded-xl border border-stone-200">
              {filtered.map((r, i) => {
                const loc = locationFor(r);
                const b = BUILDING_BY_ID[loc.buildingId];
                const place =
                  loc.buildingId === "online"
                    ? "Online / arranged"
                    : b
                      ? `${b.short}${loc.room ? ` ${loc.room}` : ""} (${walkLabel(loc.buildingId)})`
                      : loc.workdayBuilding || loc.buildingId;
                return (
                  <li key={`${r.course}-${r.section}-${r.format}-${i}`} className="flex items-center gap-3 px-3 py-2">
                    <div className="h-8 w-1 rounded-full" style={{ background: r.color }} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-ink">
                        {r.course} §{r.section}{" "}
                        <span className="font-normal text-ink-muted">{r.format}</span>
                      </div>
                      <div className="truncate text-xs text-ink-muted">
                        {r.online && loc.buildingId === "online"
                          ? "Online / arranged"
                          : `${formatDays(r.days)} ${formatRange(r.start, r.end)}`}
                        {` · ${place}`}
                        {" · "}
                        {r.status}
                        {typeof r.openSeats === "number" ? ` · ${r.openSeats} open` : ""}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => add(r)}
                      className="shrink-0 rounded-lg bg-ink px-2.5 py-1 text-xs font-semibold text-white hover:bg-stone-700"
                    >
                      Add
                    </button>
                  </li>
                );
              })}
              {filtered.length === 0 ? (
                <li className="px-3 py-6 text-center text-sm text-ink-muted">No matching sections.</li>
              ) : null}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  );
}
