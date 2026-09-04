import type { CommuterLot, HomeLocation } from "./types";
export type Building = {
  id: string;
  name: string;
  short: string;
  lat: number;
  lon: number;
  walkMin: number;
  color: string;
};

export const HOME = {
  id: "friley",
  name: "Friley Hall",
  short: "Friley / home",
  address: "212 Beyer Ct, Ames IA 50012",
  lat: 42.02381,
  lon: -93.65076,
  walkMin: 0,
  color: "#f97316",
};

export const BUILDINGS: Building[] = [
  {
    id: "friley",
    name: "Friley Hall",
    short: "Friley / home",
    lat: 42.02381,
    lon: -93.65076,
    walkMin: 0,
    color: "#f97316",
  },
  {
    id: "carver",
    name: "Carver Hall",
    short: "Carver",
    lat: 42.02525,
    lon: -93.64833,
    walkMin: 5,
    color: "#2563eb",
  },
  {
    id: "pearson",
    name: "Pearson Hall",
    short: "Pearson",
    lat: 42.02593,
    lon: -93.64987,
    walkMin: 5,
    color: "#7c3aed",
  },
  {
    id: "hoover",
    name: "Hoover Hall",
    short: "Hoover",
    lat: 42.02667,
    lon: -93.65116,
    walkMin: 6,
    color: "#0d9488",
  },
  {
    id: "marston",
    name: "Marston Hall",
    short: "Marston",
    lat: 42.02681,
    lon: -93.64986,
    walkMin: 7,
    color: "#0f766e",
  },
  {
    id: "parks",
    name: "Parks Library",
    short: "Parks Library",
    lat: 42.02809,
    lon: -93.64884,
    walkMin: 9,
    color: "#64748b",
  },
  {
    id: "coover",
    name: "Coover Hall",
    short: "Coover",
    lat: 42.02842,
    lon: -93.65096,
    walkMin: 9,
    color: "#16a34a",
  },
  {
    id: "gilman",
    name: "Gilman Hall",
    short: "Gilman",
    lat: 42.02942,
    lon: -93.64864,
    walkMin: 12,
    color: "#e11d48",
  },
  {
    id: "hach",
    name: "Hach Hall",
    short: "Hach",
    lat: 42.03015,
    lon: -93.64973,
    walkMin: 12,
    color: "#be123c",
  },
  {
    id: "ross",
    name: "Ross Hall",
    short: "Ross",
    lat: 42.0266,
    lon: -93.6442,
    walkMin: 11,
    color: "#a78bfa",
  },
  {
    id: "troxel",
    name: "Troxel Hall",
    short: "Troxel",
    lat: 42.0278,
    lon: -93.64406,
    walkMin: 12,
    color: "#dc2626",
  },
  {
    id: "science",
    name: "Science Hall",
    short: "Science",
    lat: 42.02931,
    lon: -93.64633,
    walkMin: 14,
    color: "#0369a1",
  },
  {
    id: "foodsci",
    name: "Food Sciences Building",
    short: "Food Sci",
    lat: 42.02689,
    lon: -93.64278,
    walkMin: 13,
    color: "#b45309",
  },
  {
    id: "mackay",
    name: "Mackay Hall",
    short: "Mackay",
    lat: 42.02859,
    lon: -93.64651,
    walkMin: 12,
    color: "#9333ea",
  },
  {
    id: "kildee",
    name: "Kildee Hall",
    short: "Kildee",
    lat: 42.02946,
    lon: -93.64416,
    walkMin: 14,
    color: "#ca8a04",
  },
  {
    id: "molbio",
    name: "Molecular Biology Building",
    short: "Mol Bio",
    lat: 42.03109,
    lon: -93.64971,
    walkMin: 15,
    color: "#059669",
  },
  {
    id: "physics",
    name: "Physics Hall",
    short: "Physics",
    lat: 42.02942,
    lon: -93.64738,
    walkMin: 13,
    color: "#0284c7",
  },
  {
    id: "curtiss",
    name: "Curtiss Hall",
    short: "Curtiss",
    lat: 42.02618,
    lon: -93.64478,
    walkMin: 11,
    color: "#65a30d",
  },
  {
    id: "hamilton",
    name: "Hamilton Hall",
    short: "Hamilton",
    lat: 42.0258,
    lon: -93.6475,
    walkMin: 8,
    color: "#db2777",
  },
  {
    id: "howe",
    name: "Howe Hall",
    short: "Howe",
    lat: 42.0270,
    lon: -93.6530,
    walkMin: 10,
    color: "#4f46e5",
  },
  {
    id: "forker",
    name: "Forker Building",
    short: "Forker",
    lat: 42.02679,
    lon: -93.64031,
    walkMin: 14,
    color: "#ea580c",
  },
  {
    id: "lagomarcino",
    name: "Lagomarcino Hall",
    short: "Lagomarcino",
    lat: 42.02984,
    lon: -93.64543,
    walkMin: 14,
    color: "#7c3aed",
  },
  {
    id: "town",
    name: "Town Engineering Building",
    short: "Town",
    lat: 42.0275,
    lon: -93.6532,
    walkMin: 10,
    color: "#0ea5e9",
  },
  {
    id: "sukup",
    name: "Sukup Hall",
    short: "Sukup",
    lat: 42.0279,
    lon: -93.6539,
    walkMin: 11,
    color: "#84cc16",
  },
  {
    id: "sictr",
    name: "Student Innovation Center",
    short: "SIC",
    lat: 42.0260,
    lon: -93.6504,
    walkMin: 7,
    color: "#f43f5e",
  },
  {
    id: "morrill",
    name: "Morrill Hall",
    short: "Morrill",
    lat: 42.02724,
    lon: -93.64804,
    walkMin: 9,
    color: "#78716c",
  },
  {
    id: "design",
    name: "College of Design",
    short: "Design",
    lat: 42.0246,
    lon: -93.6516,
    walkMin: 6,
    color: "#c026d3",
  },
  {
    id: "ehall",
    name: "East Hall",
    short: "East Hall",
    lat: 42.0265,
    lon: -93.6465,
    walkMin: 9,
    color: "#57534e",
  },
];

export const BUILDING_BY_ID = Object.fromEntries(
  BUILDINGS.map((b) => [b.id, b]),
) as Record<string, Building>;

export function walkLabel(buildingId: string): string {
  if (buildingId === "online") return "Online";
  const b = BUILDING_BY_ID[buildingId];
  if (!b) return "";
  if (b.walkMin === 0) return "Home";
  return `~${b.walkMin} min walk`;
}


export const DAY_ROUTE_COLORS: Record<"M" | "T" | "W" | "R" | "F", string> = {
  M: "#2563eb",
  T: "#16a34a",
  W: "#0d9488",
  R: "#6366f1",
  F: "#7c3aed",
};

/** Doglegged walk between two lat/lon points so routes read as campus walks. */
export function walkPath(
  a: [number, number],
  b: [number, number],
  bend = 0.35,
): [number, number][] {
  const midLat = (a[0] + b[0]) / 2;
  const midLon = (a[1] + b[1]) / 2;
  const dLat = b[0] - a[0];
  const dLon = b[1] - a[1];
  // Perpendicular nudge
  const nudgeLat = -dLon * bend * 0.35;
  const nudgeLon = dLat * bend * 0.35;
  return [a, [midLat + nudgeLat, midLon + nudgeLon], b];
}

export function chainWalk(
  points: [number, number][],
): [number, number][] {
  if (points.length < 2) return points;
  const out: [number, number][] = [points[0]];
  for (let i = 0; i < points.length - 1; i++) {
    const seg = walkPath(points[i], points[i + 1], 0.28 + (i % 3) * 0.08);
    out.push(...seg.slice(1));
  }
  return out;
}

/** Slightly doglegged paths so routes read as campus walks, not air-lines. */
export const ROUTES = {
  morningMwf: [
    [HOME.lat, HOME.lon],
    [42.02455, -93.64985],
    [42.02505, -93.6489],
    [42.02525, -93.64833],
  ] as [number, number][],
  morningWedBranch: [
    [42.02525, -93.64833],
    [42.0259, -93.6492],
    [42.02667, -93.65116],
    [42.0276, -93.65105],
    [42.02842, -93.65096],
  ] as [number, number][],
  afternoonEnglChem: [
    [HOME.lat, HOME.lon],
    [42.0247, -93.6502],
    [42.02593, -93.64987],
    [42.0264, -93.6478],
    [42.0267, -93.6454],
    [42.0278, -93.64406],
  ] as [number, number][],
  afternoonChemDirect: [
    [HOME.lat, HOME.lon],
    [42.0249, -93.6474],
    [42.0264, -93.6452],
    [42.0278, -93.64406],
  ] as [number, number][],
  trCoover: [
    [HOME.lat, HOME.lon],
    [42.0252, -93.65105],
    [42.0268, -93.6512],
    [42.02842, -93.65096],
  ] as [number, number][],
  trCarver: [
    [HOME.lat, HOME.lon],
    [42.0245, -93.6496],
    [42.02525, -93.64833],
  ] as [number, number][],
  trChem: [
    [HOME.lat, HOME.lon],
    [42.0256, -93.6494],
    [42.0274, -93.6489],
    [42.02942, -93.64864],
    [42.03015, -93.64973],
  ] as [number, number][],
};

/** Editable day-start / home base (persisted in AppState). */

export const DEFAULT_HOME: HomeLocation = {
  label: "212 Beyer Ct · Friley Hall",
  lat: HOME.lat,
  lon: HOME.lon,
};

export const HOME_QUICK_PICKS = BUILDINGS.filter((b) =>
  [
    "friley",
    "carver",
    "coover",
    "pearson",
    "hoover",
    "parks",
    "gilman",
    "hach",
    "marston",
    "science",
    "foodsci",
  ].includes(b.id),
);

const WALK_MPS = 80;
const CAMPUS_PATH_FACTOR = 1.25;

export function haversineMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
}

export function walkMinutesBetween(
  from: { lat: number; lon: number },
  to: { lat: number; lon: number },
): number {
  const m = haversineMeters(from.lat, from.lon, to.lat, to.lon);
  if (m < 40) return 0;
  return Math.max(1, Math.round((m * CAMPUS_PATH_FACTOR) / WALK_MPS));
}

export function walkLabelFromHome(buildingId: string, home: HomeLocation): string {
  if (buildingId === "online") return "Online";
  const b = BUILDING_BY_ID[buildingId];
  if (!b) return "";
  const mins = walkMinutesBetween(home, b);
  if (mins === 0) return "Home";
  return `~${mins} min walk`;
}

/** Match known campus buildings / landmarks without network. */
export function matchHomeQuery(query: string): HomeLocation | null {
  const q = query.trim().toLowerCase().replace(/\s+/g, " ");
  if (!q) return null;

  if (
    q.includes("beyer") ||
    q === "home" ||
    q === "home base" ||
    q.includes("212 beyer")
  ) {
    return { ...DEFAULT_HOME };
  }

  for (const b of BUILDINGS) {
    const name = b.name.toLowerCase();
    const short = b.short.toLowerCase();
    const id = b.id.toLowerCase();
    if (
      q === id ||
      q === name ||
      q === short ||
      name.includes(q) ||
      short.includes(q) ||
      q.includes(name) ||
      q.includes(short) ||
      q.includes(id)
    ) {
      const label = b.id === "friley" ? DEFAULT_HOME.label : b.name;
      return { label, lat: b.lat, lon: b.lon };
    }
  }
  return null;
}

/** Free-text geocode via Nominatim (Ames IA bias). */
export async function geocodeHomeQuery(query: string): Promise<HomeLocation> {
  const trimmed = query.trim();
  if (!trimmed) {
    throw new Error("Enter a street address, building name, or campus landmark.");
  }

  const local = matchHomeQuery(trimmed);
  if (local) return local;

  const biased = /ames/i.test(trimmed) ? trimmed : `${trimmed}, Ames, Iowa`;
  const url =
    "https://nominatim.openstreetmap.org/search?" +
    new URLSearchParams({
      q: biased,
      format: "json",
      limit: "1",
      countrycodes: "us",
    }).toString();

  let res: Response;
  try {
    res = await fetch(url, {
      headers: { Accept: "application/json" },
    });
  } catch {
    throw new Error("Could not reach geocoder. Try a campus building name (e.g. Coover, Carver).");
  }
  if (!res.ok) {
    throw new Error("Geocoder request failed. Try a known building name.");
  }
  const data = (await res.json()) as { lat: string; lon: string; display_name?: string }[];
  if (!Array.isArray(data) || !data.length) {
    throw new Error("No match found. Try a campus landmark or fuller address in Ames, IA.");
  }
  const lat = Number(data[0].lat);
  const lon = Number(data[0].lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    throw new Error("Invalid coordinates from geocoder.");
  }
  return {
    label: trimmed,
    lat,
    lon,
  };
}

/** Approximate ISU main-campus bounding box (Ames). */
export const ISU_CAMPUS_BBOX = {
  minLat: 42.0195,
  maxLat: 42.0348,
  minLon: -93.6588,
  maxLon: -93.6355,
};

export function isWithinCampus(lat: number, lon: number): boolean {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return false;
  const b = ISU_CAMPUS_BBOX;
  return lat >= b.minLat && lat <= b.maxLat && lon >= b.minLon && lon <= b.maxLon;
}

export function isHomeOnCampus(home: HomeLocation): boolean {
  return isWithinCampus(home.lat, home.lon);
}

/**
 * Real-ish ISU commuter lots near the campus edge.
 * Coords approximate lot centroids for walk-start routing (not survey-grade).
 */
export const COMMUTER_LOTS: CommuterLot[] = [
  {
    id: "lot29",
    name: "Lot 29 (Commuter)",
    short: "Lot 29",
    lat: 42.02555,
    lon: -93.65575,
    edge: "West · near Union Dr / Memorial Union",
  },
  {
    id: "lot50",
    name: "Lot 50 (Commuter)",
    short: "Lot 50",
    lat: 42.02115,
    lon: -93.64955,
    edge: "South · near Hilton Coliseum",
  },
  {
    id: "lot67",
    name: "Lot 67 (Commuter)",
    short: "Lot 67",
    lat: 42.03105,
    lon: -93.6564,
    edge: "Northwest campus edge",
  },
  {
    id: "lot1a",
    name: "Lot 1A (Commuter)",
    short: "Lot 1A",
    lat: 42.02405,
    lon: -93.6412,
    edge: "Southeast · near Lincoln Way",
  },
];

export const COMMUTER_LOT_BY_ID = Object.fromEntries(
  COMMUTER_LOTS.map((l) => [l.id, l]),
) as Record<string, (typeof COMMUTER_LOTS)[number]>;

export function needsCommuterLot(opts: {
  home: HomeLocation;
  commuteOffCampus: boolean;
}): boolean {
  return Boolean(opts.commuteOffCampus) || !isHomeOnCampus(opts.home);
}

/** Map walk-start: commuter lot when off-campus; otherwise profile home. */
export function resolveWalkStart(opts: {
  home: HomeLocation;
  commuteOffCampus: boolean;
  walkStartLotId: string | null;
}): {
  start: HomeLocation;
  usingLot: boolean;
  needsLot: boolean;
  lotId: string | null;
} {
  const home = isValidHome(opts.home) ? opts.home : { ...DEFAULT_HOME };
  const needsLot = needsCommuterLot({ home, commuteOffCampus: opts.commuteOffCampus });
  if (needsLot) {
    const lot = opts.walkStartLotId ? COMMUTER_LOT_BY_ID[opts.walkStartLotId] : undefined;
    if (lot) {
      return {
        start: { label: lot.name, lat: lot.lat, lon: lot.lon },
        usingLot: true,
        needsLot: true,
        lotId: lot.id,
      };
    }
    // Off-campus without a lot yet — keep map stable on default campus start.
    return {
      start: { ...DEFAULT_HOME },
      usingLot: false,
      needsLot: true,
      lotId: null,
    };
  }
  return { start: home, usingLot: false, needsLot: false, lotId: null };
}

export function isValidHome(h: unknown): h is HomeLocation {
  if (!h || typeof h !== "object") return false;
  const o = h as Record<string, unknown>;
  return (
    typeof o.label === "string" &&
    o.label.trim().length > 0 &&
    typeof o.lat === "number" &&
    typeof o.lon === "number" &&
    Number.isFinite(o.lat) &&
    Number.isFinite(o.lon) &&
    o.lat >= -90 &&
    o.lat <= 90 &&
    o.lon >= -180 &&
    o.lon <= 180
  );
}
