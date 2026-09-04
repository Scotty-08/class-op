# ISU section data

Fall 2026 Year-1 Computer Engineering starter sections from the public Schedule of Classes API (`https://api.classes.iastate.edu`).

- `fall-2026-y1-sections.json` — all sections for CHEM 1670/1770, CPRE 1850, MATH 1650, ENGL 1500, LIB 1600, ENGR 1010
- `workday-current-classes-demo.json` — confirmed Workday **Current Classes** export shape (`classes[]` with building codes like CARVER / COOVER / TROXEL). Demo content mirrors the Beyer Loop seed; live SSO will replace this.
- `building` / `room` are null in the public feed; Workday Current Classes export includes building codes/names
- Home base for walk scoring: 212 Beyer Ct, Ames 50012

Regenerate SoC dump: POST `/api/courses/search` with `academicPeriodId: ACADEMIC_PERIOD-2026Fall`.

Import path in the app: planner “Import Workday JSON” (file picker or paste) → `meetingsFromWorkdayExport` → campus map. Also stored under localStorage key `class-op-workday-current`.
