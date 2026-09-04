import workdayRoomsFlat from "../../data/isu/workday-rooms.flat.json";
import { resolveBuildingId } from "./workday-current";

/** One section row from the Fall 2026 Workday rooms dump (flat). */
export type WorkdayRoomSection = {
  course: string;
  section: string;
  format?: string | null;
  days_times?: string | null;
  building?: string | null;
  room?: string | null;
  seats?: number | null;
  instructor?: string | null;
  delivery?: string | null;
};

export type WorkdayRoomsFlatExport = {
  source?: string;
  academicPeriodId?: string;
  term?: string;
  purpose?: string;
  homeBase?: string;
  sections: WorkdayRoomSection[];
};

export const WORKDAY_ROOMS_FLAT = workdayRoomsFlat as WorkdayRoomsFlatExport;

function sectionKey(course: string, section: string): string {
  return `${course.trim().toUpperCase()}::${section.trim().toUpperCase()}`;
}

const ROOM_BY_COURSE_SECTION: Map<string, WorkdayRoomSection> = (() => {
  const map = new Map<string, WorkdayRoomSection>();
  for (const s of WORKDAY_ROOMS_FLAT.sections ?? []) {
    if (!s?.course || s.section == null || s.section === "") continue;
    map.set(sectionKey(s.course, String(s.section)), s);
  }
  return map;
})();

/** Look up Workday room/building for a catalog course + section. */
export function lookupWorkdayRoom(
  course: string,
  section: string,
): WorkdayRoomSection | null {
  if (!course || section == null || section === "") return null;
  return ROOM_BY_COURSE_SECTION.get(sectionKey(course, String(section))) ?? null;
}

export type ResolvedSectionLocation = {
  buildingId: string;
  room?: string;
  workdayBuilding?: string | null;
  fromWorkdayRooms: boolean;
};

/**
 * Resolve Leaflet building id (+ room) for an add-section catalog row.
 * Prefer Workday rooms dump; fall back to catalog-inferred buildingId / online.
 */
export function resolveSectionLocation(opts: {
  course: string;
  section: string;
  catalogBuildingId?: string | null;
  online?: boolean | null;
  delivery?: string | null;
}): ResolvedSectionLocation {
  const hit = lookupWorkdayRoom(opts.course, opts.section);
  if (hit) {
    const buildingId = resolveBuildingId(hit.building, null, hit.delivery ?? opts.delivery);
    return {
      buildingId,
      room: hit.room ?? undefined,
      workdayBuilding: hit.building ?? null,
      fromWorkdayRooms: true,
    };
  }

  if (opts.online) {
    return { buildingId: "online", fromWorkdayRooms: false };
  }
  const fallback = opts.catalogBuildingId?.trim() || "online";
  return {
    buildingId: fallback,
    fromWorkdayRooms: false,
  };
}
