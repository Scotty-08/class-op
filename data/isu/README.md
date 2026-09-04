# ISU section data

- `current-classes.json` — **default** registered schedule: Scott's Fall 2026 Workday Current Classes export (COMS 3190, COMS 3090, CPRE 3100, EE 2300). Also mirrored under `public/data/isu/` for static fetch.
- `workday-current-classes-demo.json` — older Beyer Loop–shaped Workday export (optional Y1 demo).
- `fall-2026-y1-sections.json` — public Schedule of Classes API dump for Y1 CPRE courses.

Building codes in Current Classes: SCIENCE, PEARSON, CARVER, COOVER, FOODSCI (plus online / empty-day meetings with null building).

Home base for walk scoring: 212 Beyer Ct, Ames 50012.

Import path: Demo Workday loads `current-classes.json` by default; planner can import JSON or optionally “Load Y1 demo seed” (Beyer Loop).
