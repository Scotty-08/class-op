/**
 * Majors picker driven by data/isu/degree-plans/majors_list.json.
 * Plan availability + options come from plans-manifest.json (185 Soar-in-4 grids).
 */

import majorsListJson from "../../data/isu/degree-plans/majors_list.json";
import {
  LEGACY_MAJOR_HINTS,
  PLANS_MANIFEST,
  getManifestEntry,
  optionLabel,
  resolvePlanSlugForMajorName,
  type PlanManifestEntry,
} from "./degree-plans";

export type MajorOption = {
  slug: string;
  label: string;
  option: string | null;
  totalCredits: number | null;
  displayName: string;
};

export type Major = {
  id: string;
  name: string;
  college: string;
  blurb: string;
  /** Default / first plan slug when hasPlan. */
  planSlug: string | null;
  /** True when at least one semester plan file is loadable. */
  hasPlan: boolean;
  /** True when the major appears in the Soar-in-4 manifest. */
  inIndex: boolean;
  options: MajorOption[];
  href?: string;
};

type MajorsListEntry = {
  name: string;
  college: string;
  href?: string;
  source_url?: string;
};

const majorsList = majorsListJson as MajorsListEntry[];

/** Prefer short legacy ids for majors the app already stored / demoed. */
const LEGACY_ID_BY_NAME: Record<string, string> = {
  "Computer Engineering, B.S.": "cpre",
  "Aerospace Engineering, B.S.": "aere",
  "Electrical Engineering, B.S.": "ee",
  "Cyber Security Engineering, B.S.": "cybe",
  "Software Engineering, B.S. (College of Engineering)": "se",
  "Computer Science, B.A., B.S.": "coms",
  "Mechanical Engineering, B.S.": "me",
  "Civil Engineering, B.S.": "ce",
  "Chemical Engineering, B.S.": "che",
  "Industrial Engineering, B.S.": "ie",
  "Materials Engineering, B.S.": "mats",
  "Construction Engineering, B.S.": "con-e",
};

/** Junk / non-major rows occasionally present in the scraped majors list. */
const SKIP_NAMES = new Set([")", "See Undergraduate Secondary Majors"]);

function slugifyMajorName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/,/g, "")
    .replace(/\./g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function stripDegreeSuffix(name: string): string {
  return name
    .replace(/\s*\([^)]*\)\s*$/g, "")
    .replace(/,\s*B\.S\.\/M\.S\.\s*$/i, "")
    .replace(/,\s*B\.A\.,\s*B\.S\.\s*$/i, "")
    .replace(/,\s*B\.S\.\s*$/i, "")
    .replace(/,\s*B\.A\.\s*$/i, "")
    .replace(/,\s*B\.B\.A\.\s*$/i, "")
    .replace(/,\s*B\.F\.A\.\s*$/i, "")
    .replace(/,\s*B\.Arch\.?\s*$/i, "")
    .replace(/,\s*B\.L\.A\.?\s*$/i, "")
    .replace(/,\s*B\.Mus\.?\s*$/i, "")
    .trim();
}

function normKey(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

const MANIFEST_BY_MAJOR = (() => {
  const map = new Map<string, PlanManifestEntry[]>();
  for (const e of PLANS_MANIFEST) {
    const k = normKey(e.major);
    const list = map.get(k) ?? [];
    list.push(e);
    map.set(k, list);
  }
  return map;
})();

function findPlansForMajor(name: string, id: string): PlanManifestEntry[] {
  const fromResolve = resolvePlanSlugForMajorName(name, id);
  if (fromResolve) {
    const entry = getManifestEntry(fromResolve);
    const base = stripDegreeSuffix(name);
    const hits = MANIFEST_BY_MAJOR.get(normKey(base)) ?? [];
    if (hits.length) return hits;
    // Soft: all entries sharing the same major field as the resolved slug
    if (entry) {
      return PLANS_MANIFEST.filter((e) => normKey(e.major) === normKey(entry.major));
    }
  }
  const base = stripDegreeSuffix(name);
  const direct = MANIFEST_BY_MAJOR.get(normKey(base));
  if (direct?.length) return direct;
  const nk = normKey(base);
  for (const [key, list] of MANIFEST_BY_MAJOR) {
    if (nk.length > 4 && (nk.includes(key) || key.includes(nk))) return list;
  }
  return [];
}

function toOptions(hits: PlanManifestEntry[]): MajorOption[] {
  return hits.map((h) => ({
    slug: h.slug,
    label: optionLabel(h),
    option: h.option ?? null,
    totalCredits: h.totalCredits ?? null,
    displayName: h.displayName || `${h.major}${h.option ? ` — ${h.option}` : ""}`,
  }));
}

function blurbFor(planSlug: string | null, hits: PlanManifestEntry[]): string {
  if (planSlug === "computer-engineering-b-s") {
    return "127 cr · 2026–27 catalog plan ready";
  }
  if (hits.length) {
    const cr = hits.find((h) => h.totalCredits != null)?.totalCredits;
    if (hits.length > 1) {
      return cr != null
        ? `${cr} cr · ${hits.length} catalog options ready`
        : `${hits.length} catalog options ready`;
    }
    return cr != null ? `${cr} cr · catalog plan ready` : "Catalog plan ready";
  }
  return "Listed in ISU undergrad majors · no catalog plan yet";
}

function defaultSlugFor(id: string, hits: PlanManifestEntry[]): string | null {
  const legacy = LEGACY_MAJOR_HINTS[id];
  if (legacy && hits.some((h) => h.slug === legacy)) return legacy;
  const preferred =
    hits.find((h) => !h.option && (h.degree === "B.S." || !h.degree)) ||
    hits.find((h) => !h.option) ||
    hits[0];
  return preferred?.slug ?? null;
}

export const MAJORS: Major[] = majorsList
  .filter((entry) => entry.name && !SKIP_NAMES.has(entry.name.trim()))
  .map((entry) => {
    const id = LEGACY_ID_BY_NAME[entry.name] ?? slugifyMajorName(entry.name);
    const hits = findPlansForMajor(entry.name, id);
    const options = toOptions(hits);
    const planSlug = defaultSlugFor(id, hits);
    return {
      id,
      name: entry.name,
      college: entry.college,
      blurb: blurbFor(planSlug, hits),
      planSlug,
      hasPlan: hits.length > 0,
      inIndex: hits.length > 0,
      options,
      href: entry.href,
    };
  });

export function getMajor(id: string | null | undefined): Major | undefined {
  if (!id) return undefined;
  return MAJORS.find((m) => m.id === id);
}

export function majorsByCollege(): { college: string; majors: Major[] }[] {
  const map = new Map<string, Major[]>();
  for (const m of MAJORS) {
    const list = map.get(m.college) ?? [];
    list.push(m);
    map.set(m.college, list);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([college, majors]) => ({
      college,
      majors: majors.sort((a, b) => {
        if (a.hasPlan !== b.hasPlan) return a.hasPlan ? -1 : 1;
        if (a.id === "cpre") return -1;
        if (b.id === "cpre") return 1;
        return a.name.localeCompare(b.name);
      }),
    }));
}

export function planCountReady(): number {
  return MAJORS.filter((m) => m.hasPlan).length;
}

export const DEFAULT_MAJOR_ID = "cpre";
export const DEFAULT_PLAN_SLUG = "computer-engineering-b-s";
