/**
 * ISU degree-plans package (data/isu/degree-plans).
 * Static-export friendly:
 * - CPRE (+ Aerospace) imported at build time
 * - Other plans fetched from public/data/isu/degree-plans/plans/{slug}.json
 * - majors_list + plans-manifest drive picker / availability
 */

import type { RoadmapCourse, RoadmapSemester } from "./cpre-roadmap";
import { CPRE_ROADMAP } from "./cpre-roadmap";
import cprePlanJson from "../../data/isu/degree-plans/plans/computer-engineering-b-s.json";
import aerePlanJson from "../../data/isu/degree-plans/plans/aerospace-engineering-b-s.json";
import plansManifestJson from "../../data/isu/degree-plans/plans-manifest.json";

export type DegreePlanCourse = {
  code: string | null;
  title: string | null;
  credits: number | "R" | null;
  kind?: string;
  electiveBucket?: string | null;
  notes?: string | string[] | null;
};

export type DegreePlanSemester = {
  termLabel: string;
  yearLabel?: string | null;
  term: string;
  credits: number | null;
  courses: DegreePlanCourse[];
};

export type DegreePlan = {
  major: string;
  option?: string | null;
  degree?: string | null;
  college: string;
  catalogYear?: string | null;
  planYears?: number | null;
  totalCredits?: number | null;
  sourceUrl?: string | null;
  displayName?: string | null;
  semesters: DegreePlanSemester[];
  electiveBuckets?: { name: string; credits?: number | null; notes?: string | null }[];
  notes?: string | string[] | null;
};

export type PlanManifestEntry = {
  slug: string;
  major: string;
  option?: string | null;
  degree?: string | null;
  college: string;
  catalogYear?: string | null;
  planYears?: number | null;
  totalCredits?: number | null;
  sourceUrl?: string | null;
  displayName?: string;
  semesterCount?: number;
  electiveBucketCount?: number;
};

export const PLANS_MANIFEST = plansManifestJson as PlanManifestEntry[];

/** Preferred static samples (always in the JS bundle). */
export const STATIC_PLAN_SLUGS = ["computer-engineering-b-s", "aerospace-engineering-b-s"] as const;
export type StaticPlanSlug = (typeof STATIC_PLAN_SLUGS)[number];

const STATIC_PLANS: Record<StaticPlanSlug, DegreePlan> = {
  "computer-engineering-b-s": cprePlanJson as unknown as DegreePlan,
  "aerospace-engineering-b-s": aerePlanJson as unknown as DegreePlan,
};

/** Legacy / short major ids → plan slug. */
export const MAJOR_ID_TO_PLAN_SLUG: Record<string, string> = {
  cpre: "computer-engineering-b-s",
  "computer-engineering-b-s": "computer-engineering-b-s",
  aere: "aerospace-engineering-b-s",
  "aerospace-engineering-b-s": "aerospace-engineering-b-s",
  ee: "electrical-engineering-b-s",
  cybe: "cyber-security-engineering-b-s",
  se: "software-engineering-b-s-engineering",
  me: "mechanical-engineering-b-s",
  ce: "civil-engineering-b-s-general-program",
  che: "chemical-engineering-b-s",
  ie: "industrial-engineering-b-s",
  mats: "materials-engineering-b-s",
  "con-e": "construction-engineering-b-s-building-emphasis",
  coms: "computer-science-b-a-b-s",
};

/** Alias for majors.ts default-option hints. */
export const LEGACY_MAJOR_HINTS = MAJOR_ID_TO_PLAN_SLUG;

const MANIFEST_BY_SLUG = new Map(PLANS_MANIFEST.map((e) => [e.slug, e]));

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

export function publicPlanUrl(slug: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  return `${base}/data/isu/degree-plans/plans/${slug}.json`;
}

export function planSlugForMajorId(majorId: string | null | undefined): string | null {
  if (!majorId) return null;
  const mapped = MAJOR_ID_TO_PLAN_SLUG[majorId];
  if (mapped && MANIFEST_BY_SLUG.has(mapped)) return mapped;
  if (MANIFEST_BY_SLUG.has(majorId)) return majorId;
  return mapped ?? null;
}

/** Resolve best plan slug for a majors_list display name. */
export function resolvePlanSlugForMajorName(name: string, majorId?: string): string | null {
  if (majorId) {
    const fromId = planSlugForMajorId(majorId);
    if (fromId) return fromId;
  }
  const stripped = name
    .replace(/\s*\([^)]*\)\s*$/g, "")
    .replace(/,\s*B\.A\.,\s*B\.S\.\s*$/i, "")
    .replace(/,\s*B\.S\.\s*$/i, "")
    .replace(/,\s*B\.A\.\s*$/i, "")
    .replace(/,\s*B\.B\.A\.\s*$/i, "")
    .replace(/,\s*B\.F\.A\.\s*$/i, "")
    .replace(/,\s*B\.Arch\.?\s*$/i, "")
    .replace(/,\s*B\.L\.A\.?\s*$/i, "")
    .replace(/,\s*B\.Mus\.?\s*$/i, "")
    .trim();
  const hits = MANIFEST_BY_MAJOR.get(normKey(stripped)) ?? [];
  if (!hits.length) {
    const n = normKey(name);
    const byDisplay = PLANS_MANIFEST.find((e) => normKey(e.displayName || "") === n);
    if (byDisplay) return byDisplay.slug;
    return null;
  }
  const preferred =
    hits.find((h) => !h.option && (h.degree === "B.S." || !h.degree)) ||
    hits.find((h) => !h.option) ||
    hits[0];
  return preferred.slug;
}

export function hasPlanFile(majorId: string | null | undefined, majorName?: string): boolean {
  if (majorId && planSlugForMajorId(majorId)) return true;
  if (majorName && resolvePlanSlugForMajorName(majorName, majorId ?? undefined)) return true;
  return false;
}

export function getManifestEntry(slug: string | null | undefined): PlanManifestEntry | undefined {
  if (!slug) return undefined;
  return MANIFEST_BY_SLUG.get(slug);
}

export function optionLabel(entry: PlanManifestEntry): string {
  if (entry.option) return entry.option;
  if (entry.degree) return entry.degree;
  return "Standard plan";
}

/** Sync access when slug is known (static bundle only). */
export function getStaticDegreePlan(slug: string | null | undefined): DegreePlan | null {
  if (!slug) return null;
  if ((STATIC_PLAN_SLUGS as readonly string[]).includes(slug)) {
    return STATIC_PLANS[slug as StaticPlanSlug];
  }
  return null;
}

/** Sync access for statically bundled plans (CPRE preferred path). */
export function getDegreePlan(majorId: string | null | undefined): DegreePlan | null {
  const slug = planSlugForMajorId(majorId);
  return getStaticDegreePlan(slug);
}

const fetchCache = new Map<string, Promise<DegreePlan | null>>();

async function fetchPlanJson(slug: string): Promise<DegreePlan | null> {
  let pending = fetchCache.get(slug);
  if (!pending) {
    pending = (async () => {
      try {
        const res = await fetch(publicPlanUrl(slug));
        if (!res.ok) return null;
        return (await res.json()) as DegreePlan;
      } catch {
        return null;
      }
    })();
    fetchCache.set(slug, pending);
  }
  return pending;
}

/** Load a plan by explicit slug (preferred when profile stores planSlug). */
export async function loadDegreePlanBySlug(slug: string | null | undefined): Promise<DegreePlan | null> {
  if (!slug) return null;
  const staticPlan = getStaticDegreePlan(slug);
  if (staticPlan) return staticPlan;
  return fetchPlanJson(slug);
}

/** Load plan JSON: static import for CPRE/Aerospace, else fetch from public/. */
export async function loadDegreePlan(
  majorId: string | null | undefined,
  majorName?: string,
): Promise<{ plan: DegreePlan | null; slug: string | null }> {
  const slug =
    planSlugForMajorId(majorId) ||
    (majorName ? resolvePlanSlugForMajorName(majorName, majorId ?? undefined) : null);
  if (!slug) return { plan: null, slug: null };
  return { plan: await loadDegreePlanBySlug(slug), slug };
}

const CPRE_TITLE_BY_CODE = (() => {
  const map = new Map<string, { title: string; notes?: string; newCore?: boolean }>();
  for (const sem of CPRE_ROADMAP) {
    for (const c of sem.courses) {
      map.set(c.code.trim().toUpperCase(), {
        title: c.title,
        notes: c.notes,
        newCore: c.newCore,
      });
    }
  }
  return map;
})();

function parseYear(yearLabel: string | null | undefined, termLabel: string, index: number): 1 | 2 | 3 | 4 {
  const s = `${yearLabel ?? ""} ${termLabel}`.toLowerCase();
  if (/first|freshman|\by1\b|year\s*1\b/.test(s)) return 1;
  if (/second|sophomore|\by2\b|year\s*2\b/.test(s)) return 2;
  if (/third|junior|\by3\b|year\s*3\b/.test(s)) return 3;
  if (/fourth|senior|\by4\b|year\s*4\b/.test(s)) return 4;
  return Math.min(4, Math.floor(index / 2) + 1) as 1 | 2 | 3 | 4;
}

function parseTerm(term: string, termLabel: string): "Fall" | "Spring" {
  const s = `${term} ${termLabel}`.toLowerCase();
  if (s.includes("spring")) return "Spring";
  return "Fall";
}

function courseId(code: string | null, electiveBucket: string | null | undefined, semId: string, idx: number): string {
  if (code && code.trim()) return code.trim().toUpperCase().replace(/\s+/g, "_");
  const bucket = (electiveBucket || "elective").toUpperCase().replace(/[^A-Z0-9]+/g, "_");
  return `${semId}_${bucket}_${idx}`;
}

/** Convert a Class OP degree-plan JSON into roadmap semester cards. */
export function degreePlanToRoadmap(plan: DegreePlan, majorId?: string | null): RoadmapSemester[] {
  const enrichCpre =
    majorId === "cpre" || plan.major.toLowerCase().includes("computer engineering");
  const usedIds = new Map<string, number>();
  return plan.semesters.map((sem, i) => {
    const year = parseYear(sem.yearLabel, sem.termLabel, i);
    const term = parseTerm(sem.term, sem.termLabel);
    const id = `y${year}-${term.toLowerCase()}-${i}`;
    const courses: RoadmapCourse[] = sem.courses.map((c, j) => {
      const code = c.code?.trim() || c.electiveBucket || "Elective";
      const elective = c.kind === "elective" || !c.code;
      const enrich = enrichCpre && c.code ? CPRE_TITLE_BY_CODE.get(c.code.trim().toUpperCase()) : undefined;
      let credits: number | "R";
      if (c.credits === "R") credits = "R";
      else if (typeof c.credits === "number") credits = c.credits;
      else credits = 0;
      let rid = courseId(c.code, c.electiveBucket, id, j);
      const n = usedIds.get(rid) ?? 0;
      usedIds.set(rid, n + 1);
      if (n > 0) rid = `${rid}__${n}`;
      const rawNotes = Array.isArray(c.notes) ? c.notes.join(" ") : c.notes || undefined;
      return {
        id: rid,
        code,
        title: c.title || enrich?.title || (elective ? c.electiveBucket || "Elective" : code),
        credits,
        notes: rawNotes || enrich?.notes,
        elective,
        newCore: enrich?.newCore,
      };
    });
    const credits =
      typeof sem.credits === "number"
        ? sem.credits
        : courses.reduce<number>((sum, c) => sum + (typeof c.credits === "number" ? c.credits : 0), 0);
    return {
      id,
      year,
      term,
      label: sem.termLabel || `Year ${year} · ${term}`,
      credits,
      courses,
    };
  });
}

/** Course ids in semesters strictly before the chosen year (for forward planning). */
export function completedIdsBeforeYear(roadmap: RoadmapSemester[], year: 1 | 2 | 3 | 4): string[] {
  return roadmap.filter((s) => s.year < year).flatMap((s) => s.courses.map((c) => c.id));
}

/** Semesters at/after year with incomplete courses. */
export function remainingFromYear(
  roadmap: RoadmapSemester[],
  done: Set<string>,
  fromYear: 1 | 2 | 3 | 4,
): RoadmapSemester[] {
  return roadmap
    .filter((sem) => sem.year >= fromYear)
    .map((sem) => {
      const courses = sem.courses.filter((c) => !done.has(c.id));
      if (!courses.length) return null;
      const credits = courses.reduce<number>(
        (sum, c) => sum + (typeof c.credits === "number" ? c.credits : 0),
        0,
      );
      return { ...sem, courses, credits };
    })
    .filter((s): s is RoadmapSemester => s !== null);
}

export function formatCatalogYear(raw: string | null | undefined): string {
  if (!raw) return "";
  return raw.replace(/(\d{4})-(\d{2})/, "$1–$2");
}

export function electivesNoteFromPlan(plan: DegreePlan): string | null {
  const buckets = plan.electiveBuckets?.filter((b) => b.notes || (b.credits != null && b.credits > 0));
  if (!buckets?.length) {
    if (Array.isArray(plan.notes)) return plan.notes.join(" ") || null;
    return plan.notes ?? null;
  }
  return buckets
    .map((b) => {
      const cr = b.credits != null ? `${b.credits} cr` : "";
      const note = b.notes ? ` — ${b.notes}` : "";
      return `${b.name}${cr ? ` (${cr})` : ""}${note}`;
    })
    .join(" ");
}
