import { readFileSync, writeFileSync } from "fs";

const raw = JSON.parse(readFileSync("/workspace/isu-cpre/fall-y1-sections.json", "utf8"));

function toMinutes(t) {
  const m = t.trim().match(/^(\d{1,2}):(\d{2})\s*([AP]M)$/i);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const ap = m[3].toUpperCase();
  if (ap === "PM" && h !== 12) h += 12;
  if (ap === "AM" && h === 12) h = 0;
  return h * 60 + min;
}

function toHHMM(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function parseDaysTimes(s) {
  if (!s) return { days: [], start: null, end: null, online: true, raw: s };
  const lower = s.toLowerCase();
  if (lower.includes("arranged") || lower.includes("online")) {
    return { days: [], start: null, end: null, online: true, raw: s };
  }
  const parts = s.split("|").map((x) => x.trim());
  const daysPart = parts[0] || "";
  const timePart = parts[1] || parts[0];
  const days = [];
  const compact = daysPart.replace(/\s+/g, "").toUpperCase();
  for (const ch of compact) {
    if ("MTWRF".includes(ch)) days.push(ch);
  }
  const tm = timePart.match(/(\d{1,2}:\d{2}\s*[AP]M)\s*-\s*(\d{1,2}:\d{2}\s*[AP]M)/i);
  if (!tm) return { days, start: null, end: null, online: false, raw: s };
  const a = toMinutes(tm[1]);
  const b = toMinutes(tm[2]);
  return {
    days,
    start: a == null ? null : toHHMM(a),
    end: b == null ? null : toHHMM(b),
    online: false,
    raw: s,
  };
}

function inferBuilding(course, format, delivery, parsed) {
  const d = (delivery || "").toLowerCase();
  if (parsed.online || d.includes("online")) return "online";
  if (course.startsWith("MATH")) return "carver";
  if (course.startsWith("CPRE")) return "coover";
  if (course.startsWith("ENGL")) return "pearson";
  if (course.startsWith("ENGR")) return "hoover";
  if (course.startsWith("LIB")) return "parks";
  if (course.startsWith("CHEM")) {
    if (format === "Laboratory") return "hach";
    if (format === "Lecture") return "troxel";
    return "gilman";
  }
  return "unknown";
}

const COLOR = {
  MATH: "#2563eb",
  CPRE: "#16a34a",
  ENGL: "#7c3aed",
  CHEM: "#dc2626",
  ENGR: "#0d9488",
  LIB: "#64748b",
};

const sections = [];
for (const [course, list] of Object.entries(raw.courses || {})) {
  const prefix = course.split(" ")[0];
  for (const row of list) {
    const parsed = parseDaysTimes(row.days_times);
    sections.push({
      course: row.course,
      title: row.title,
      section: row.section,
      format: row.format,
      days_times: row.days_times,
      delivery: row.delivery,
      credits: row.credits,
      openSeats: row.openSeats,
      status: row.status,
      days: parsed.days,
      start: parsed.start,
      end: parsed.end,
      online: parsed.online,
      buildingId: inferBuilding(row.course, row.format, row.delivery, parsed),
      color: COLOR[prefix] || "#44403c",
    });
  }
}

const out = {
  term: raw.term,
  source: raw.source,
  homeBase: raw.homeBase,
  note: "Trimmed from api.classes.iastate.edu Fall 2026 dump. Buildings inferred (not in public API).",
  sections,
};
writeFileSync("/workspace/class-op-app/src/data/catalog.json", JSON.stringify(out));
console.log("sections", sections.length, "bytes", JSON.stringify(out).length);
