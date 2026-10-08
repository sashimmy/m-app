import type {
  BehaviorLog,
  BehaviorType,
  ContextTag,
  Group,
  Intensity,
  Student,
  GroupInfo,
} from "@/lib/types";

const FIRST_NAMES = [
  "Jamal", "Aisha", "Marcus", "Keisha", "Darius", "Zion", "Imani", "Elijah",
  "Nia", "Malik", "Jordan", "Amara", "Terrell", "Latoya", "Deshawn", "Kennedy",
  "Tyrese", "Sade", "Andre", "Jalen", "Monique", "Tyrone", "Ebony", "Devin",
  "Shanice", "Isaiah", "Precious", "Carlos", "Maya", "Jasmine", "Antoine",
  "Destiny", "Rashad", "Alicia", "Trevon", "Brianna",
];

const LAST_INITIALS = ["B","C","D","F","G","H","J","K","L","M","P","R","S","T","W"];

const STRENGTHS_POOL = [
  "Kind to younger kids", "Patient", "Great storyteller", "Natural leader",
  "Creative problem solver", "Strong artist", "Loves to read", "Big-hearted",
  "Great listener", "Resilient", "Caring friend", "Funny", "Observant",
  "Dependable", "Curious", "Determined",
];
const INTERESTS_POOL = [
  "Basketball", "Drawing", "Music", "Video games", "Soccer",
  "Dance", "Cooking", "LEGO", "Science experiments", "Comics",
  "Robotics", "Church choir", "Skateboarding", "Hair styling",
];
const CARING_POOL = ["Mom", "Grandma", "Dad", "Auntie", "Older brother", "Pastor", "Coach"];

export const GROUPS: GroupInfo[] = [
  { id: "A", name: "Group A · Rising Stars", meeting: "Mon · 3–5 PM", lead: "Ms. Carter" },
  { id: "B", name: "Group B · Trailblazers", meeting: "Tue · 3–5 PM", lead: "Mr. Reyes" },
  { id: "C", name: "Group C · Changemakers", meeting: "Wed · 3–5 PM", lead: "Ms. Harper" },
  { id: "D", name: "Group D · Builders", meeting: "Thu · 5–7 PM", lead: "Mr. Jenkins" },
];

// Deterministic PRNG so seed is stable between renders
function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function pickN<T>(rng: () => number, arr: T[], n: number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  for (let i = 0; i < n && copy.length; i++) {
    const idx = Math.floor(rng() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}

function makeStudents(): Student[] {
  const rng = mulberry32(42);
  const groups: Group[] = ["A", "B", "C", "D"];
  const students: Student[] = [];
  for (let i = 0; i < 36; i++) {
    const first = FIRST_NAMES[i % FIRST_NAMES.length];
    const last = LAST_INITIALS[i % LAST_INITIALS.length];
    const age = 7 + Math.floor(rng() * 11); // 7..17
    const group = groups[i % 4];
    // ACE distribution 1..7, weighted
    const aceWeights = [0, 2, 3, 4, 5, 4, 3, 2, 1, 0, 0];
    let roll = rng() * aceWeights.reduce((a, b) => a + b, 0);
    let ace = 1;
    for (let k = 0; k < aceWeights.length; k++) {
      roll -= aceWeights[k];
      if (roll <= 0) { ace = k; break; }
    }
    students.push({
      id: `s-${i + 1}`,
      firstName: first,
      lastInitial: last,
      age,
      group,
      enrollment: pick(rng, ["afterschool", "classroom", "summer"] as const),
      aceScore: Math.max(1, ace),
      strengths: pickN(rng, STRENGTHS_POOL, 3),
      interests: pickN(rng, INTERESTS_POOL, 2),
      caringAdults: pickN(rng, CARING_POOL, 2),
      notes: "",
      parentId: i < 6 ? `p-${i + 1}` : undefined,
      photoHue: Math.floor(rng() * 360),
    });
  }

  // Mul-T inspired student: Marcus T., age 10, Group A, strong strengths, caring mom
  students[0] = {
    ...students[0],
    firstName: "Marcus",
    lastInitial: "T",
    age: 10,
    group: "A",
    enrollment: "afterschool",
    aceScore: 4,
    strengths: ["Loves to read", "Kind to younger kids", "Resilient"],
    interests: ["Drawing", "Basketball"],
    caringAdults: ["Mom", "Older brother"],
    notes: "Lives with Mom and older brother. Mom works evenings; grandma helps.",
    parentId: "p-1",
    photoHue: 24,
  };
  return students;
}

function makeLogs(students: Student[]): BehaviorLog[] {
  const rng = mulberry32(7);
  const logs: BehaviorLog[] = [];
  const types: BehaviorType[] = ["fight", "flight", "freeze", "regulated"];
  const contexts: ContextTag[] = [
    "classroom", "transition", "lunch", "group", "arrival", "dismissal", "other",
  ];
  const intensities: Intensity[] = ["low", "medium", "high"];
  const adults = ["Ms. Carter", "Mr. Reyes", "Ms. Harper", "Mr. Jenkins", "Demarcus C."];

  // 36 weeks total (4 cycles of 9). Start date = today - 36*7 days
  const start = new Date();
  start.setDate(start.getDate() - 36 * 7);
  start.setHours(9, 0, 0, 0);

  for (const s of students) {
    // Trend: by cycle, regulated share grows, fight/flight/freeze shrink
    for (let cycle = 1 as 1 | 2 | 3 | 4; cycle <= 4; cycle = (cycle + 1) as 1 | 2 | 3 | 4) {
      for (let week = 1; week <= 9; week++) {
        // Count logs this week: 2..6
        const count = 2 + Math.floor(rng() * 5);
        for (let n = 0; n < count; n++) {
          // Weight by cycle to show growth
          const regWeight = 1 + cycle * 1.5;
          const fightW = Math.max(0.4, 2.2 - cycle * 0.4);
          const flightW = Math.max(0.4, 1.8 - cycle * 0.3);
          const freezeW = Math.max(0.4, 2.0 - cycle * 0.35);
          const total = regWeight + fightW + flightW + freezeW;
          let r = rng() * total;
          let type: BehaviorType = "regulated";
          if ((r -= regWeight) > 0) {
            if ((r -= fightW) <= 0) type = "fight";
            else if ((r -= flightW) <= 0) type = "flight";
            else type = "freeze";
          }
          const weekIdx = (cycle - 1) * 9 + (week - 1);
          const dayOffset = weekIdx * 7 + Math.floor(rng() * 5);
          const hour = 8 + Math.floor(rng() * 10);
          const date = new Date(start);
          date.setDate(start.getDate() + dayOffset);
          date.setHours(hour, Math.floor(rng() * 60), 0, 0);
          logs.push({
            id: `l-${s.id}-${cycle}-${week}-${n}`,
            studentId: s.id,
            type,
            intensity: pick(rng, intensities),
            context: pick(rng, contexts),
            note: rng() < 0.1 ? "Needed a quiet moment then rejoined." : undefined,
            at: date.toISOString(),
            cycle,
            week,
            loggedBy: pick(rng, adults),
          });
        }
      }
    }
  }
  return logs;
}

export const seedStudents: Student[] = makeStudents();
export const seedLogs: BehaviorLog[] = makeLogs(seedStudents);
