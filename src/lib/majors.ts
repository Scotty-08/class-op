export type Major = {
  id: string;
  name: string;
  college: string;
  blurb: string;
};

export const MAJORS: Major[] = [
  {
    id: "cpre",
    name: "Computer Engineering B.S.",
    college: "College of Engineering · ECpE",
    blurb: "127 cr · CPRE 1850 in the Basic Program · 2026–27 catalog",
  },
  {
    id: "ee",
    name: "Electrical Engineering B.S.",
    college: "College of Engineering · ECpE",
    blurb: "Shares Coover / Hoover with CprE · Basic Program overlap",
  },
  {
    id: "cybe",
    name: "Cyber Security Engineering B.S.",
    college: "College of Engineering · ECpE",
    blurb: "ENGR 1010 ECpE sections · adjacent to CprE core",
  },
  {
    id: "se",
    name: "Software Engineering B.S.",
    college: "College of Engineering",
    blurb: "Calc / chem / ENGL year-one cluster similar to CprE",
  },
  {
    id: "coms",
    name: "Computer Science B.S.",
    college: "College of Liberal Arts and Sciences",
    blurb: "Not engineering Basic Program; listed for comparison",
  },
  {
    id: "me",
    name: "Mechanical Engineering B.S.",
    college: "College of Engineering",
    blurb: "Hoover / Black Engineering cluster · same Y1 math/chem",
  },
  {
    id: "aere",
    name: "Aerospace Engineering B.S.",
    college: "College of Engineering",
    blurb: "Howe Hall cluster · MATH 1650 + CHEM 1670 typical Y1",
  },
  {
    id: "ce",
    name: "Civil Engineering B.S.",
    college: "College of Engineering",
    blurb: "Town / Pearson area · same engineering Basic Program",
  },
  {
    id: "che",
    name: "Chemical Engineering B.S.",
    college: "College of Engineering",
    blurb: "Sweeney / Gilman chemistry corridor",
  },
  {
    id: "ie",
    name: "Industrial Engineering B.S.",
    college: "College of Engineering",
    blurb: "Industrial Education / Black · Y1 calc + chem",
  },
  {
    id: "mats",
    name: "Materials Engineering B.S.",
    college: "College of Engineering",
    blurb: "Gilman / Hoover neighborhood",
  },
  {
    id: "con-e",
    name: "Construction Engineering B.S.",
    college: "College of Engineering",
    blurb: "Town Engineering · engineering orientation sections",
  },
];

export const DEFAULT_MAJOR_ID = "cpre";
