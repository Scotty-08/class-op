"use client";

import { conflictingIds, DAY_LABEL, DAY_ORDER, durationPx, formatRange, GRID_END, GRID_START, HOUR_PX, minutesToY, parseHHMM } from "@/lib/time";
import { BUILDING_BY_ID, walkLabel } from "@/lib/buildings";
import type { DayCode, Meeting } from "@/lib/types";

type Props = {
  meetings: Meeting[];
  onSelect: (m: Meeting) => void;
};

export function ScheduleGrid({ meetings, onSelect }: Props) {
  const hours: number[] = [];
  for (let t = GRID_START; t < GRID_END; t += 60) hours.push(t);
  const height = minutesToY(GRID_END);
  const conflicts = conflictingIds(meetings);
  const online = meetings.filter((m) => m.online || m.buildingId === "online" || !m.days.length);

  return (
    <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-paper-card shadow-card">
      <div className="min-w-[720px]">
        <div className="grid grid-cols-[56px_repeat(5,1fr)] border-b border-stone-200 bg-stone-50/80">
          <div />
          {DAY_ORDER.map((d) => (
            <div key={d} className="px-2 py-2 text-center text-xs font-semibold uppercase tracking-wide text-ink-muted">
              {DAY_LABEL[d]}
            </div>
          ))}
        </div>
        <div className="relative grid grid-cols-[56px_repeat(5,1fr)]" style={{ height }}>
          <div className="relative border-r border-stone-100">
            {hours.map((h) => (
              <div
                key={h}
                className="absolute right-1 -translate-y-2 text-[10px] text-stone-400"
                style={{ top: minutesToY(h) }}
              >
                {labelHour(h)}
              </div>
            ))}
          </div>
          {DAY_ORDER.map((day) => (
            <DayColumn
              key={day}
              day={day}
              meetings={meetings}
              conflicts={conflicts}
              height={height}
              hours={hours}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>
      {online.length ? (
        <div className="border-t border-stone-200 bg-stone-50 px-4 py-3">
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
            Online / arranged
          </div>
          <div className="flex flex-wrap gap-2">
            {online.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => onSelect(m)}
                className="rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-left text-xs hover:border-stone-400"
                style={{ borderLeftWidth: 3, borderLeftColor: m.color }}
              >
                <span className="font-semibold">{m.course}</span> §{m.section} · {m.title}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DayColumn({
  day,
  meetings,
  conflicts,
  height,
  hours,
  onSelect,
}: {
  day: DayCode;
  meetings: Meeting[];
  conflicts: Set<string>;
  height: number;
  hours: number[];
  onSelect: (m: Meeting) => void;
}) {
  const blocks = meetings.filter((m) => m.days.includes(day) && m.start && m.end);
  return (
    <div className="relative border-r border-stone-100 last:border-r-0" style={{ height }}>
      {hours.map((h) => (
        <div
          key={h}
          className="absolute inset-x-0 border-t border-stone-100"
          style={{ top: minutesToY(h) }}
        />
      ))}
      {blocks.map((m) => {
        const start = parseHHMM(m.start)!;
        const top = minutesToY(start);
        const h = durationPx(m.start, m.end);
        const clash = conflicts.has(m.id);
        const bldg = BUILDING_BY_ID[m.buildingId];
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => onSelect(m)}
            className="absolute inset-x-1 overflow-hidden rounded-lg px-1.5 py-1 text-left shadow-sm transition hover:brightness-95"
            style={{
              top,
              height: h,
              background: m.color,
              boxShadow: clash ? "0 0 0 2px #facc15" : undefined,
            }}
          >
            <div className="truncate text-[11px] font-semibold text-white">{m.course}</div>
            <div className="truncate text-[10px] text-white/90">
              {m.format === "Laboratory" ? "Lab" : m.format === "Discussion" ? "Disc" : m.format} {m.section}
            </div>
            {h > 40 ? (
              <div className="truncate text-[10px] text-white/80">
                {formatRange(m.start, m.end)}
                {bldg ? ` · ${bldg.short}` : ""}
              </div>
            ) : null}
            {h > 56 && bldg ? (
              <div className="truncate text-[10px] text-white/70">{walkLabel(m.buildingId)}</div>
            ) : null}
            {clash ? (
              <div className="mt-0.5 text-[9px] font-bold uppercase tracking-wide text-yellow-200">Overlap</div>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

function labelHour(mins: number): string {
  let h = Math.floor(mins / 60);
  const ap = h >= 12 ? "p" : "a";
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${h}${ap}`;
}
