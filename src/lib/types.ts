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
export type ScheduleSource = "demo" | "import";

export type AppState = {
  email: string | null;
  workdayDemo: boolean;
  majorId: string | null;
  /** Class standing used for demo remaining-roadmap (not live Workday Academic Progress). */
  yearLevel: YearLevel | null;
  /** Explicit completed course ids; when empty, derived from yearLevel. */
  completedCourseIds: string[];
  meetings: Meeting[];
  /** demo = Beyer Loop seed; import = Workday Current Classes JSON. */
  scheduleSource: ScheduleSource;
};

/** @deprecated Prefer selectedDays: DayCode[] on CampusMap. */
export type MapMode = "overview" | "mwf" | "tr";
