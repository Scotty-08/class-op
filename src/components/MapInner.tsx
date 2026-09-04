"use client";

import { useMemo } from "react";
import { MapContainer, Marker, Polyline, Popup, TileLayer, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { BUILDING_BY_ID, BUILDINGS, HOME, ROUTES } from "@/lib/buildings";
import type { MapMode, Meeting } from "@/lib/types";

type Props = { meetings: Meeting[]; mode: MapMode };

function pinIcon(color: string, glyph: string, home = false) {
  const size = home ? 34 : 28;
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
    "><span style="transform:rotate(45deg);color:white;font-size:${home ? 14 : 11}px;font-weight:700;line-height:1">${glyph}</span></div></div>`,
  });
}

function meetingsForBuilding(meetings: Meeting[], buildingId: string) {
  return meetings.filter((m) => m.buildingId === buildingId);
}

function visibleBuildings(mode: MapMode, meetings: Meeting[]) {
  const used = new Set(meetings.filter((m) => m.buildingId !== "online").map((m) => m.buildingId));
  used.add("friley");
  return BUILDINGS.filter((b) => used.has(b.id) || b.id === "friley" || b.id === "ross");
}

export default function MapInner({ meetings, mode }: Props) {
  const routes = useMemo(() => {
    if (mode === "mwf") {
      return [
        { pts: ROUTES.morningMwf, color: "#2563eb", label: "MWF morning · Carver" },
        { pts: ROUTES.morningWedBranch, color: "#0d9488", label: "Wed branch · Hoover / Coover" },
        { pts: ROUTES.afternoonEnglChem, color: "#dc2626", label: "MWF afternoon · Pearson → Troxel" },
      ];
    }
    if (mode === "tr") {
      return [
        { pts: ROUTES.trCoover, color: "#16a34a", label: "TR morning · Coover (CPRE)" },
        { pts: ROUTES.trCarver, color: "#0ea5e9", label: "Thu disc · Carver (MATH)" },
        { pts: ROUTES.trChem, color: "#e11d48", label: "Tue CHEM · Gilman / Hach" },
      ];
    }
    return [
      { pts: ROUTES.morningMwf, color: "#2563eb", label: "Morning cluster" },
      { pts: ROUTES.morningWedBranch, color: "#0d9488", label: "Wed Hoover / Coover" },
      { pts: ROUTES.afternoonChemDirect, color: "#dc2626", label: "Afternoon CHEM" },
      { pts: ROUTES.trCoover, color: "#16a34a", label: "TR Coover" },
      { pts: ROUTES.trChem, color: "#e11d48", label: "Tue Gilman / Hach" },
    ];
  }, [mode]);

  const pins = visibleBuildings(mode, meetings);

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
            key={r.label}
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
        {pins.map((b) => {
          const here = meetingsForBuilding(meetings, b.id);
          const isHome = b.id === "friley";
          const glyph = isHome ? "⌂" : b.short.slice(0, 1);
          return (
            <Marker
              key={b.id}
              position={[b.lat, b.lon]}
              icon={pinIcon(b.color, glyph, isHome)}
              zIndexOffset={isHome ? 500 : 0}
            >
              <Popup>
                <div className="min-w-[180px] text-[13px]">
                  <div className="font-semibold text-stone-900">{isHome ? "212 Beyer Ct · Friley Hall" : b.name}</div>
                  <div className="text-stone-500">
                    {isHome ? "Home base" : `~${b.walkMin} min walk from Friley`}
                  </div>
                  {here.length ? (
                    <ul className="mt-2 space-y-1">
                      {here.map((m) => (
                        <li key={m.id} className="border-l-2 pl-2" style={{ borderColor: m.color }}>
                          <span className="font-medium">{m.course}</span>{" "}
                          <span className="text-stone-500">
                            {m.format} {m.section}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-1 text-stone-400">No class here this week.</p>
                  )}
                </div>
              </Popup>
              <Tooltip direction="top" offset={[0, -28]} opacity={1} permanent={false}>
                {isHome ? "Friley (home)" : `${b.short}${here[0] ? " · " + here[0].course : ""}`}
              </Tooltip>
            </Marker>
          );
        })}
      </MapContainer>

      <div className="pointer-events-none absolute left-3 top-3 max-w-[220px] space-y-1.5">
        {calloutsForMode(mode, meetings).map((c) => (
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
      </div>

      <div className="pointer-events-none absolute bottom-3 left-3 rounded-xl bg-white/92 px-3 py-2 text-[11px] text-stone-600 shadow-card backdrop-blur">
        <div className="mb-1 font-semibold text-stone-800">
          {mode === "mwf" ? "MWF walks" : mode === "tr" ? "TR walks" : "Overview"}
        </div>
        <LegendDot color="#f97316" label="Friley home" />
        {mode === "tr" ? (
          <>
            <LegendDot color="#16a34a" dashed label="Beyer → Coover" />
            <LegendDot color="#0ea5e9" dashed label="Beyer → Carver" />
            <LegendDot color="#e11d48" dashed label="Beyer → Gilman/Hach" />
          </>
        ) : (
          <>
            <LegendDot color="#2563eb" dashed label="Morning cluster" />
            <LegendDot color="#dc2626" dashed label="Afternoon CHEM" />
            {mode === "mwf" ? <LegendDot color="#0d9488" dashed label="Wed Hoover/Coover" /> : null}
          </>
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

function calloutsForMode(mode: MapMode, meetings: Meeting[]) {
  const find = (course: string, format?: string) =>
    meetings.find((m) => m.course === course && (!format || m.format === format));

  const walk = (id: string) => {
    const b = BUILDING_BY_ID[id];
    return b ? `~${b.walkMin} min` : "";
  };

  if (mode === "tr") {
    const cpre = find("CPRE 1850", "Lecture");
    const math = find("MATH 1650", "Discussion");
    const chem = find("CHEM 1670", "Discussion");
    return [
      cpre && {
        color: "#16a34a",
        title: "CPRE 1850 Lec 01",
        detail: `TR 8:50–9:40a · Coover ${walk("coover")}`,
      },
      math && {
        color: "#0ea5e9",
        title: "MATH 1650 disc",
        detail: `Thu ${math.start ?? ""} · Carver ${walk("carver")}`,
      },
      chem && {
        color: "#e11d48",
        title: "CHEM 1670 disc + lab",
        detail: `Tue · Gilman/Hach ${walk("gilman")}`,
      },
    ].filter(Boolean) as { color: string; title: string; detail: string }[];
  }

  const math = find("MATH 1650", "Lecture");
  const engl = find("ENGL 1500");
  const chem = find("CHEM 1670", "Lecture");
  const engr = find("ENGR 1010");
  const lab = find("CPRE 1850", "Laboratory");
  return [
    math && {
      color: "#2563eb",
      title: "MATH 1650 Lec 01",
      detail: `MWF 8:50–9:40a · Carver ${walk("carver")}`,
    },
    engr &&
      mode !== "overview" && {
        color: "#0d9488",
        title: "ENGR 1010 §03",
        detail: `Wed 8:50a · Hoover ${walk("hoover")}`,
      },
    lab &&
      mode !== "overview" && {
        color: "#16a34a",
        title: "CPRE 1850 Lab A",
        detail: `Wed 12:05–2:00 · Coover ${walk("coover")}`,
      },
    engl && {
      color: "#7c3aed",
      title: "ENGL 1500 §11",
      detail: `MWF 2:15–3:05p · Pearson ${walk("pearson")}`,
    },
    chem && {
      color: "#dc2626",
      title: "CHEM 1670 Lec 04",
      detail: `MWF 3:20–4:10p · Troxel ${walk("troxel")}`,
    },
  ].filter(Boolean) as { color: string; title: string; detail: string }[];
}
