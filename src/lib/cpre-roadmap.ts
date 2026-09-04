/** Computer Engineering B.S. 2026–27 sample plan (127 cr). Workday-style 4-digit course IDs. */

export type RoadmapCourse = {
  /** Stable id for checklist / completion, e.g. "CHEM_1670" or "GEN_ED_Y2S" */
  id: string;
  code: string;
  title: string;
  credits: number | "R";
  notes?: string;
  /** Elective / choice slots */
  elective?: boolean;
  /** Brand-new core in 2026–27 */
  newCore?: boolean;
};

export type RoadmapSemester = {
  id: string;
  year: 1 | 2 | 3 | 4;
  term: "Fall" | "Spring";
  label: string;
  credits: number;
  courses: RoadmapCourse[];
};

export const CPRE_CATALOG_YEAR = "2026–27";
export const CPRE_TOTAL_CREDITS = 127;

export const CPRE_ELECTIVES_NOTE =
  "CPRE technical electives 14 cr + Technical electives 6 cr + gen eds (U.S. Cultures 3 + International Perspectives 3, ≥3 cr at 3000+). No P/NP. Min GPA 2.00 Basic Program and Core.";

export const CPRE_ROADMAP: RoadmapSemester[] = [
  {
    id: "y1-fall",
    year: 1,
    term: "Fall",
    label: "Year 1 · Fall",
    credits: 15,
    courses: [
      {
        id: "CHEM_1670",
        code: "CHEM 1670",
        title: "General Chemistry for Engineering Students",
        credits: 4,
        notes: "Or CHEM 1770",
      },
      {
        id: "CPRE_1850",
        code: "CPRE 1850",
        title: "Introduction to Computer Engineering and Problem Solving I",
        credits: 3,
      },
      {
        id: "MATH_1650",
        code: "MATH 1650",
        title: "Calculus I",
        credits: 4,
      },
      {
        id: "ENGL_1500",
        code: "ENGL 1500",
        title: "Critical Thinking and Communication",
        credits: 3,
        notes: "C or better",
      },
      {
        id: "LIB_1600",
        code: "LIB 1600",
        title: "Introduction to College Level Research",
        credits: 1,
      },
      {
        id: "ENGR_1010",
        code: "ENGR 1010",
        title: "Engineering Orientation",
        credits: "R",
      },
    ],
  },
  {
    id: "y1-spring",
    year: 1,
    term: "Spring",
    label: "Year 1 · Spring",
    credits: 16,
    courses: [
      {
        id: "COMS_2270",
        code: "COMS 2270",
        title: "Object-oriented Programming",
        credits: 4,
      },
      {
        id: "MATH_1660",
        code: "MATH 1660",
        title: "Calculus II",
        credits: 4,
      },
      {
        id: "PHYS_2310",
        code: "PHYS 2310",
        title: "Introduction to Classical Physics I",
        credits: 4,
      },
      {
        id: "PHYS_2310L",
        code: "PHYS 2310L",
        title: "Introduction to Classical Physics I Laboratory",
        credits: 1,
      },
      {
        id: "ENGL_2500",
        code: "ENGL 2500",
        title: "Written, Oral, Visual, and Electronic Composition",
        credits: 3,
        notes: "C or better",
      },
      {
        id: "CPRE_1660",
        code: "CPRE 1660",
        title: "Professional Programs Orientation",
        credits: "R",
      },
    ],
  },
  {
    id: "y2-fall",
    year: 2,
    term: "Fall",
    label: "Year 2 · Fall",
    credits: 15,
    courses: [
      {
        id: "CPRE_2810",
        code: "CPRE 2810",
        title: "Digital Logic",
        credits: 4,
      },
      {
        id: "COMS_2280",
        code: "COMS 2280",
        title: "Introduction to Data Structures",
        credits: 3,
      },
      {
        id: "EE_2010",
        code: "EE 2010",
        title: "Electric Circuits",
        credits: 4,
      },
      {
        id: "MATH_2670",
        code: "MATH 2670",
        title: "Elementary Differential Equations and Laplace Transforms",
        credits: 4,
      },
    ],
  },
  {
    id: "y2-spring",
    year: 2,
    term: "Spring",
    label: "Year 2 · Spring",
    credits: 17,
    courses: [
      {
        id: "CPRE_2880",
        code: "CPRE 2880",
        title: "Embedded Systems I: Introduction",
        credits: 4,
      },
      {
        id: "EE_2300",
        code: "EE 2300",
        title: "Electronic Circuits and Systems",
        credits: 4,
      },
      {
        id: "MATH_2070",
        code: "MATH 2070",
        title: "Matrices and Linear Algebra",
        credits: 3,
      },
      {
        id: "COMS_3090",
        code: "COMS 3090",
        title: "Software Development Practices",
        credits: 3,
      },
      {
        id: "GEN_ED_Y2S",
        code: "Gen Ed",
        title: "General Education Elective",
        credits: 3,
        elective: true,
      },
    ],
  },
  {
    id: "y3-fall",
    year: 3,
    term: "Fall",
    label: "Year 3 · Fall",
    credits: 16,
    courses: [
      {
        id: "CPRE_3810",
        code: "CPRE 3810",
        title: "Computer Organization and Assembly Level Programming",
        credits: 4,
      },
      {
        id: "CPRE_3100",
        code: "CPRE 3100",
        title: "Theoretical Foundations of Computer Engineering",
        credits: 3,
      },
      {
        id: "CPRE_2320",
        code: "CPRE 2320",
        title: "Professional and Ethical Issues in Electrical and Computer Engineering",
        credits: 3,
      },
      {
        id: "GEN_ED_Y3F",
        code: "Gen Ed",
        title: "General Education Elective",
        credits: 3,
        elective: true,
      },
      {
        id: "TECH_ELEC_Y3F",
        code: "Tech Elective",
        title: "Technical Elective",
        credits: 3,
        elective: true,
      },
    ],
  },
  {
    id: "y3-spring",
    year: 3,
    term: "Spring",
    label: "Year 3 · Spring",
    credits: 17,
    courses: [
      {
        id: "CPRE_3080",
        code: "CPRE 3080",
        title: "Operating Systems: Principles and Practice",
        credits: 4,
      },
      {
        id: "CPRE_3250",
        code: "CPRE 3250",
        title: "Machine Learning for Electrical Computer and Cybersecurity Engineering",
        credits: 4,
        newCore: true,
        notes: "New core 2026–27",
      },
      {
        id: "COMS_3110",
        code: "COMS 3110",
        title: "Introduction to the Design and Analysis of Algorithms",
        credits: 3,
      },
      {
        id: "ENGL_3140",
        code: "ENGL 3140",
        title: "Technical Communication",
        credits: 3,
        notes: "Or ENGL 3090 · C or better",
      },
      {
        id: "GEN_ED_Y3S",
        code: "Gen Ed",
        title: "General Education Elective",
        credits: 3,
        elective: true,
      },
    ],
  },
  {
    id: "y4-fall",
    year: 4,
    term: "Fall",
    label: "Year 4 · Fall",
    credits: 16,
    courses: [
      {
        id: "CPRE_4910",
        code: "CPRE 4910",
        title: "Senior Design Project I and Professionalism",
        credits: 3,
      },
      {
        id: "CPRE_4940",
        code: "CPRE 4940",
        title: "Portfolio Assessment",
        credits: "R",
      },
      {
        id: "STAT_3030",
        code: "STAT 3030",
        title: "Probability and Statistics for Computer Science",
        credits: 3,
      },
      {
        id: "CPRE_ELEC_Y4F",
        code: "CPRE Electives",
        title: "Computer Engineering Technical Electives",
        credits: 7,
        elective: true,
      },
      {
        id: "GEN_ED_Y4F",
        code: "Gen Ed",
        title: "General Education Elective",
        credits: 3,
        elective: true,
      },
    ],
  },
  {
    id: "y4-spring",
    year: 4,
    term: "Spring",
    label: "Year 4 · Spring",
    credits: 15,
    courses: [
      {
        id: "CPRE_4920",
        code: "CPRE 4920",
        title: "Senior Design Project II",
        credits: 2,
      },
      {
        id: "CPRE_ELEC_Y4S",
        code: "CPRE Electives",
        title: "Computer Engineering Technical Electives",
        credits: 7,
        elective: true,
      },
      {
        id: "TECH_ELEC_Y4S",
        code: "Tech Elective",
        title: "Technical Elective",
        credits: 3,
        elective: true,
      },
      {
        id: "GEN_ED_Y4S",
        code: "Gen Ed",
        title: "General Education Elective",
        credits: 3,
        elective: true,
      },
    ],
  },
];

export const YEAR_LABELS: Record<1 | 2 | 3 | 4, string> = {
  1: "Year 1 · Freshman",
  2: "Year 2 · Sophomore",
  3: "Year 3 · Junior",
  4: "Year 4 · Senior",
};

/** Course ids from semesters strictly before the selected year (demo Academic Progress). */
export function completedIdsForYear(yearLevel: 1 | 2 | 3 | 4): string[] {
  const ids: string[] = [];
  for (const sem of CPRE_ROADMAP) {
    if (sem.year < yearLevel) {
      for (const c of sem.courses) ids.push(c.id);
    }
  }
  return ids;
}

export function remainingSemesters(
  completedIds: Set<string> | string[],
): RoadmapSemester[] {
  const done = completedIds instanceof Set ? completedIds : new Set(completedIds);
  return CPRE_ROADMAP.map((sem) => {
    const courses = sem.courses.filter((c) => !done.has(c.id));
    if (!courses.length) return null;
    const credits = courses.reduce<number>(
      (sum, c) => sum + (typeof c.credits === "number" ? c.credits : 0),
      0,
    );
    return { ...sem, courses, credits };
  }).filter((s): s is RoadmapSemester => s !== null);
}

export function formatCredits(c: number | "R"): string {
  return c === "R" ? "R" : String(c);
}

/** Y1 Fall course codes used by the Beyer Loop demo registered schedule. */
export const BEYER_LOOP_COURSE_CODES = [
  "CHEM 1670",
  "CPRE 1850",
  "MATH 1650",
  "ENGL 1500",
  "LIB 1600",
  "ENGR 1010",
] as const;
