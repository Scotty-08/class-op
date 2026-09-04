# Workday finalize findings (Class OP)

## Spot-check: Computer Engineering, B.S.
- **Pass:** 4-digit Workday codes match live catalog; includes `CPRE 3250` + `STAT 3030` (2026–27 curriculum).
- **Fixes applied in finalized package:**
  - `catalogYear` 2025-26 → **2026-27**
  - Y4 Spring credits 12 → **15**; restored missing Gen Ed Elective (3)
  - Removed ghost elective `electiveBucket: "Required"` (CPRE 4940 “Required” column misparse)
  - `CPRE 4940` credits null → **R**
  - Normalized elective names to `General Education Elective` / `CPRE Elective` / `Technical Elective`
- Semester credit sum now **127**.

## Spot-check: Aerospace Engineering, B.S.
- 129 cr, 8 semesters, 4-digit codes look good.
- Uses “Freshman Fall/Spring” labels (fine; Class OP can map to year 1).

## Package-wide issues for Iowa State scrape follow-up
1. `catalogYear` often defaults to 2025-26 while some grids are already 2026–27 content.
2. 18 plans missing `degree` — wrong heading captured as major (accreditation notes, pre-professional sample titles).
3. Elective bucket naming inconsistent (singular/plural, Gen Ed vs General Education). Prefer stable Class OP names.
4. Course `title` fields are null — optional enrich from A–Z catalog later.
5. Known gaps: Speech Communication B.A.; ~22 majors_list entries without Soar-in-4.
6. Elective approved lists mostly empty — OK for v1; attach dept URLs when known.

## Class OP fold-in
Finalized package at `/workspace/isu-degree-plans/class-op-finalized/` → PR into `data/isu/degree-plans/`.
