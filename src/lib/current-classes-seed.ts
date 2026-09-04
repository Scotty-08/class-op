import currentClassesExport from "../../data/isu/current-classes.json";
import { meetingsFromWorkdayExport, type WorkdayCurrentExport } from "./workday-current";
import type { Meeting } from "./types";

/** Scott's Fall 2026 Workday Current Classes — default registered schedule. */
export const CURRENT_CLASSES_EXPORT = currentClassesExport as WorkdayCurrentExport;

export function currentClassesSeed(): Meeting[] {
  return meetingsFromWorkdayExport(CURRENT_CLASSES_EXPORT);
}

/** Unique course codes currently registered (e.g. "COMS 3090"). */
export function currentRegisteredCourseCodes(): string[] {
  const codes = new Set<string>();
  for (const c of CURRENT_CLASSES_EXPORT.classes) {
    if (c.course) codes.add(c.course.trim().toUpperCase());
  }
  return [...codes];
}
