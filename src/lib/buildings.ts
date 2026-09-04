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
