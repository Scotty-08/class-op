"use client";

import { useMemo } from "react";
import { MapContainer, Marker, Polyline, Popup, TileLayer, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  BUILDING_BY_ID,
  DAY_ROUTE_COLORS,
  DEFAULT_HOME,
  chainWalk,
  walkMinutesBetween,
} from "@/lib/buildings";
import { DAY_LABEL, DAY_ORDER, formatRange, parseHHMM } from "@/lib/time";
import type { DayCode, HomeLocation, Meeting } from "@/lib/types";

type Props = {
  meetings: Meeting[];
  selectedDays: DayCode[];
  home?: HomeLocation;
  usingLot?: boolean;
};

type Stop = {
  meeting: Meeting;
  buildingId: string;
  lat: number;
  lon: number;
  order: number;
  day?: DayCode;
};

function pinIcon(color: string, glyph: string, home = false) {
  const size = home ? 34 : 30;
  return L.divIcon({
    className: "classop-pin",
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size + 4],
    html: `<div style="
      width:${size}px;height:${size}px;display:flex;align-items:flex-end;justify-content:center;
    "><div style="
      width:${size - 6}px;height:${size - 6}px;border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);background:${color};border:2px solid white;
      box-shadow:0 6px 14px rgba(0,0,0,.25);display:flex;align-items:center;justify-content:center;
    "><span style="transform:rotate(45deg);color:white;font-size:${home ? 14 : 12}px;font-weight:700;line-height:1">${glyph}</span></div></div>`,
  });
}

function isMappable(m: Meeting): boolean {
  return Boolean(m.buildingId && m.buildingId !== "online" && !m.online && BUILDING_BY_ID[m.buildingId]);
}

function meetingsOnDay(meetings: Meeting[], day: DayCode): Meeting[] {
  return meetings
    .filter((m) => isMappable(m) && m.days.includes(day))
    .sort((a, b) => (parseHHMM(a.start) ?? 0) - (parseHHMM(b.start) ?? 0));
}

function stopsForDay(meetings: Meeting[], day: DayCode): Stop[] {
  return meetingsOnDay(meetings, day).map((meeting, i) => {
    const b = BUILDING_BY_ID[meeting.buildingId];
    return {
      meeting,
      buildingId: meeting.buildingId,
      lat: b.lat,
      lon: b.lon,
      order: i + 1,
      day,
    };
  });
}

function routePointsForStops(stops: Stop[], home: HomeLocation): [number, number][] {
  if (!stops.length) return [];
  const pts: [number, number][] = [
    [home.lat, home.lon],
    ...stops.map((s) => [s.lat, s.lon] as [number, number]),
  ];
  return chainWalk(pts);
}

function homeShortLabel(home: HomeLocation): string {
  const label = home.label.trim();
  if (label.length <= 28) return label;
  return `${label.slice(0, 26)}…`;
}

export default function MapInner({
  meetings,
  selectedDays,
  home: homeProp,
  usingLot = false,
}: Props) {
  const home =
    homeProp && Number.isFinite(homeProp.lat) && Number.isFinite(homeProp.lon)
      ? homeProp
      : DEFAULT_HOME;

  const days = useMemo(
    () => DAY_ORDER.filter((d) => selectedDays.includes(d)),
    [selectedDays],
  );

  const singleDay = days.length === 1 ? days[0] : null;

  const filtered = useMemo(() => {
    if (!days.length) return [];
    return meetings.filter(
      (m) => isMappable(m) && m.days.some((d) => days.includes(d)),
    );
  }, [meetings, days]);

  const routes = useMemo(() => {
    if (!days.length) return [];
    if (singleDay) {
      const stops = stopsForDay(meetings, singleDay);
      if (!stops.length) return [];
      return [
        {
          key: `day-${singleDay}`,
          pts: routePointsForStops(stops, home),
          color: DAY_ROUTE_COLORS[singleDay],
          label: `${DAY_LABEL[singleDay]} route · ${usingLot ? "lot" : "home"} → ${stops.length} stop${stops.length === 1 ? "" : "s"}`,
        },
      ];
    }
    return days
      .map((day) => {
        const stops = stopsForDay(meetings, day);
        if (!stops.length) return null;
        return {
          key: `day-${day}`,
          pts: routePointsForStops(stops, home),
          color: DAY_ROUTE_COLORS[day],
          label: `${DAY_LABEL[day]} · ${stops.length} stop${stops.length === 1 ? "" : "s"}`,
        };
      })
      .filter(Boolean) as { key: string; pts: [number, number][]; color: string; label: string }[];
  }, [meetings, days, singleDay, home, usingLot]);

  const markers = useMemo(() => {
    if (!days.length) return [] as Stop[];
    if (singleDay) return stopsForDay(meetings, singleDay);
    const seen = new Set<string>();
    const out: Stop[] = [];
    for (const day of days) {
      for (const stop of stopsForDay(meetings, day)) {
        if (seen.has(stop.meeting.id)) continue;
        seen.add(stop.meeting.id);
        out.push({ ...stop, order: 0 });
      }
    }
    return out;
  }, [meetings, days, singleDay]);

  const callouts = useMemo(() => {
    if (!days.length) return [];
    if (singleDay) {
      return stopsForDay(meetings, singleDay).map((s) => {
        const b = BUILDING_BY_ID[s.buildingId];
        const mins = b ? walkMinutesBetween(home, b) : null;
        return {
          color: s.meeting.color,
          title: `${s.order}. ${s.meeting.course}`,
          detail: `${formatRange(s.meeting.start, s.meeting.end)} · ${b?.short ?? s.buildingId} · ~${mins ?? "?"} min`,
        };
      });
    }
    return days.map((day) => {
      const n = meetingsOnDay(meetings, day).length;
      return {
        color: DAY_ROUTE_COLORS[day],
        title: DAY_LABEL[day],
        detail: n ? `${n} class${n === 1 ? "" : "es"} on map` : "No on-campus classes",
      };
    });
  }, [meetings, days, singleDay, home]);

  if (!days.length) {
    return (
      <div className="flex h-full min-h-[420px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-6 text-center">
        <p className="text-sm font-semibold text-stone-800">Select days to compose the campus map</p>
        <p className="max-w-sm text-xs text-stone-500">
          Check Mon–Fri above. One day shows a numbered walk from your walk-start; multiple days merge onto one map with
          color-coded routes.
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[420px] overflow-hidden rounded-2xl border border-stone-200">
      <MapContainer
        center={[42.0266, -93.6482]}
        zoom={16}
        minZoom={15}
        maxZoom={18}
        className="h-full min-h-[420px] w-full"
        scrollWheelZoom
        attributionControl
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {routes.map((r) => (
          <Polyline
            key={r.key}
            positions={r.pts}
            pathOptions={{
              color: r.color,
              weight: 3.5,
              dashArray: "10 8",
              opacity: 0.9,
            }}
          >
            <Tooltip sticky>{r.label}</Tooltip>
          </Polyline>
        ))}

        <Marker
          position={[home.lat, home.lon]}
          icon={pinIcon("#f97316", usingLot ? "P" : "⌂", true)}
          zIndexOffset={500}
        >
          <Popup>
            <div className="min-w-[160px] text-[13px]">
              <div className="font-semibold text-stone-900">{home.label}</div>
              <div className="text-stone-500">
                {usingLot ? "Commuter lot · walk-start" : "Home base · walk-start"}
              </div>
            </div>
          </Popup>
          <Tooltip direction="top" offset={[0, -28]} opacity={1}>
            {homeShortLabel(home)} ({usingLot ? "lot" : "home"})
          </Tooltip>
        </Marker>

        {markers.map((s) => {
          const b = BUILDING_BY_ID[s.buildingId];
          const numbered = singleDay != null && s.order > 0;
          const glyph = numbered ? String(s.order) : (b?.short.slice(0, 1) ?? "?");
          const color = s.meeting.color;
          const mins = b ? walkMinutesBetween(home, b) : null;
          return (
            <Marker
              key={`${s.meeting.id}-${s.day ?? "x"}`}
              position={[s.lat, s.lon]}
              icon={pinIcon(color, glyph)}
              zIndexOffset={numbered ? 100 + s.order : 50}
            >
              <Popup>
                <div className="min-w-[190px] text-[13px]">
                  <div className="font-semibold text-stone-900">
                    {numbered ? `${s.order}. ` : ""}
                    {b?.name ?? s.buildingId}
                  </div>
                  <div className="text-stone-500">
                    {mins === 0
                      ? "At walk-start"
                      : `~${mins ?? "?"} min walk from ${usingLot ? "lot" : "home"}`}
                  </div>
                  <div className="mt-2 border-l-2 pl-2" style={{ borderColor: s.meeting.color }}>
                    <div className="font-medium">
                      {s.meeting.course}{" "}
                      <span className="font-normal text-stone-500">
                        {s.meeting.format} {s.meeting.section}
                      </span>
                    </div>
                    <div className="text-stone-600">{formatRange(s.meeting.start, s.meeting.end)}</div>
                    <div className="text-stone-500">
                      {s.meeting.days.map((d) => DAY_LABEL[d]).join("/")}
                    </div>
                  </div>
                </div>
              </Popup>
              <Tooltip direction="top" offset={[0, -28]} opacity={1}>
                {numbered
                  ? `${s.order}. ${b?.short} · ${s.meeting.course}`
                  : `${b?.short} · ${s.meeting.course}`}
              </Tooltip>
            </Marker>
          );
        })}
      </MapContainer>

      <div className="pointer-events-none absolute left-3 top-3 max-w-[240px] space-y-1.5">
        {callouts.map((c) => (
          <div
            key={c.title}
            className="pointer-events-auto rounded-xl border border-white/70 bg-white/92 px-2.5 py-1.5 shadow-card backdrop-blur"
          >
            <div className="flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: c.color }}>
              <span className="h-2 w-2 rounded-full" style={{ background: c.color }} />
              {c.title}
            </div>
            <div className="text-[11px] text-stone-600">{c.detail}</div>
          </div>
        ))}
        {!filtered.length ? (
          <div className="rounded-xl border border-white/70 bg-white/92 px-2.5 py-1.5 text-[11px] text-stone-600 shadow-card backdrop-blur">
            No on-campus classes for the selected days.
          </div>
        ) : null}
      </div>

      <div className="pointer-events-none absolute bottom-3 left-3 rounded-xl bg-white/92 px-3 py-2 text-[11px] text-stone-600 shadow-card backdrop-blur">
        <div className="mb-1 font-semibold text-stone-800">
          {singleDay
            ? `${DAY_LABEL[singleDay]} walk from ${homeShortLabel(home)}`
            : `Merged · ${days.map((d) => DAY_LABEL[d]).join(" + ")}`}
        </div>
        <LegendDot color="#f97316" label={usingLot ? "Commuter lot" : "Home base"} />
        {singleDay ? (
          <LegendDot color={DAY_ROUTE_COLORS[singleDay]} dashed label="Chronological route" />
        ) : (
          days.map((d) => (
            <LegendDot key={d} color={DAY_ROUTE_COLORS[d]} dashed label={DAY_LABEL[d]} />
          ))
        )}
        <div className="mt-1 text-[10px] text-stone-400">OpenStreetMap · real campus coords</div>
      </div>
    </div>
  );
}

function LegendDot({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="inline-block w-5"
        style={{
          borderTop: dashed ? `2.5px dashed ${color}` : `6px solid ${color}`,
          borderRadius: dashed ? 0 : 99,
          height: dashed ? 0 : 6,
        }}
      />
      {label}
    </div>
  );
}
