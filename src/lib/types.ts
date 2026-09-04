export type DayCode = "M" | "T" | "W" | "R" | "F";

export type MeetingFormat =
  | "Lecture"
  | "Discussion"
  | "Laboratory"
  | "Online"
  | "Other";

export type Meeting = {
  id: string;
  course: string;
  title: string;
  section: string;
  format: MeetingFormat;
  days: DayCode[];
  start: string | null;
  end: string | null;
  buildingId: string;
  room?: string;
  color: string;
  notes?: string;
  credits?: string;
  online?: boolean;
};

export type CatalogSection = {
  course: string;
  title: string;
  section: string;
  format: string;
  days_times: string;
  delivery: string;
  credits: string;
  openSeats: number;
  status: string;
  days: DayCode[];
  start: string | null;
  end: string | null;
  online: boolean;
  buildingId: string;
  color: string;
};

export type YearLevel = 1 | 2 | 3 | 4;

/** Where the primary map meetings came from. */
export type ScheduleSource = "demo" | "current" | "import";

/** Profile home address / building (not always the map walk-start). */
export type HomeLocation = {
  label: string;
  lat: number;
  lon: number;
};

/** ISU commuter lot used as walk-start when home is off-campus. */
export type CommuterLot = {
  id: string;
  name: string;
  short: string;
  lat: number;
  lon: number;
  /** Short campus-edge hint for the picker. */
  edge: string;
};

/** How the student continues after viewing the catalog plan. */
export type PlanningMode = "semester" | "forward" | null;

export type AppState = {
  email: string | null;
  workdayDemo: boolean;
  majorId: string | null;
  /** Selected plans/{slug}.json stem from the degree-plans package. */
  planSlug: string | null;
  /** Option label when the major has multiple grids; null for single-plan majors. */
  planOption: string | null;
  /** Class standing used for demo remaining-roadmap (not live Workday Academic Progress). */
  yearLevel: YearLevel | null;
  /** Explicit completed course ids; when empty, derived from yearLevel. */
  completedCourseIds: string[];
  /** Plan course ids the student marked as “taking this semester”. */
  selectedPlanCourseIds: string[];
  /** semester = map this term; forward = plan remaining years. */
  planningMode: PlanningMode;
  meetings: Meeting[];
  /** current = bundled Fall 2026 Current Classes; demo = Y1 Beyer Loop; import = user JSON. */
  scheduleSource: ScheduleSource;
  /** Editable home / profile location; defaults to Friley / 212 Beyer Ct. */
  home: HomeLocation;
  /** User checked “I commute / live off campus”. */
  commuteOffCampus: boolean;
  /** Selected ISU commuter lot id when off-campus; null until picked. */
  walkStartLotId: string | null;
  /** True after the dedicated home/living step (or migrated returning session). */
  homeSetupDone: boolean;
};

/** @deprecated Prefer selectedDays: DayCode[] on CampusMap. */
export type MapMode = "overview" | "mwf" | "tr";
