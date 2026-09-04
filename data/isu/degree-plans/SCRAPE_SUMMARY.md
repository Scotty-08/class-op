# ISU Soar-in-4 / Multi-year Degree Plans — Scrape Summary

- Source index: https://catalog.iastate.edu/planofstudy/
- Majors list: https://catalog.iastate.edu/collegescurricula/
- Programs linked from planofstudy index: **165**
- Unique catalog pages fetched: **109** (0 fetch errors)
- Plan records written: **185** (index-derived ok: **164**, failed: **1**, extra option grids: **20**)
- Index success rate: **99.4%** (164/165)
- Undergraduate majors listed: **137**
- Majors with no obvious Soar-in-4 plan match: **22**

## Counts by college

| College | Total | OK | Failed |
|---------|------:|---:|-------:|
| College of Agriculture and Life Sciences | 45 | 45 | 0 |
| College of Design | 10 | 10 | 0 |
| College of Engineering | 22 | 22 | 0 |
| College of Health and Human Sciences | 32 | 32 | 0 |
| College of Liberal Arts and Sciences | 64 | 63 | 1 |
| Ivy College of Business | 12 | 12 | 0 |

## Electives

- Elective categories with on-page (or fetched) course options: **44**
- Elective categories with approved-list links but no extracted courses: **3**
- Many plans name elective *slots* in the semester grid (e.g. Technical Elective) even when the approved course list lives off-catalog or is prose-only.

### Electives that primarily link off-page / approved lists

- **Industrial Engineering, B.S.** — Humanities Electives: [department approved list.](https://www.imse.iastate.edu/files/2023/08/Elective_List_23-24.pdf)
- **Software Engineering, B.S.** — International Perspectives: [General Education Electives](http://www.se.iastate.edu/academics)
- **Software Engineering, B.S.** — International Perspectives: [General Education Electives](http://www.se.iastate.edu/academics)

## Failed / incomplete plans

- Speech Communication, B.A. (no_grid) — catalog page has no `table.sc_plangrid` under a four-year plan section (link appears stale; related Theatre entry says “See Performing Arts”).

## Undergraduate majors without a matched Soar-in-4 index entry

- Agricultural Communication, B.S.
- Animal Enterprise and Innovation, B.S.
- Art History, B.A.
- Athletic Training
- Biomedical Engineering, B.S.
- Business Administration, B.B.A.
- Digital Storytelling, B.A.
- Digital and Precision Agriculture, B.S.
- Early Childcare Education and Programming, B.S.
- Education Studies, B.S.
- Game Design, B.S.
- Integrated Health Sciences, B.S.
- Interdisciplinary Studies, B.A., B.S.
- Classical Studies
- U.S. Latino/a Studies
- Liberal Studies, B.L.S.
- Nursing, B.S.N., Accelerated
- Nursing, B.S.N. (College of Agriculture and Life Sciences)
- Nursing, B.S.N. (College of Health and Human Sciences)
- Sports Media and Communication, B.A.

## Output files

- `index.json` — program index
- `plans/<slug>.json` — per-program semester grids + electives
- `all_plans.json` — combined array
- `majors_list.json` — undergraduate majors from collegescurricula
- `scrape_isu_plans.py` / `run_catalog.py` — scraper
