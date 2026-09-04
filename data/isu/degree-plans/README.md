# ISU degree plans — Class OP schema

- Plans: 185
- Source: catalog.iastate.edu Soar-in-4 / multi-year grids
- Course IDs: 4-digit Workday style (e.g. MATH 1650)
- Schema: major, option, degree, college, catalogYear, planYears, totalCredits, sourceUrl, semesters[], electiveBuckets[]

## Files
- `all_plans.class-op.json` — full package
- `index.class-op.json` — lightweight index
- `plans/*.json` — per-program
- `majors_list.json` — all undergrad majors from collegescurricula
- `SCRAPE_SUMMARY.md` — scrape stats / gaps

## Gaps for Workday review
- Speech Communication, B.A. missing grid
- ~22 majors on majors list without Soar-in-4 match
- Many electiveBuckets are named slots only; approved lists often off-catalog
- catalogYear defaulted to 2025-26 where not scraped from page


See FINALIZE_FINDINGS.md for Workday spot-check fixes (CPRE).
