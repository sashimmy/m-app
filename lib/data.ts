import { seedLogs, seedStudents, GROUPS } from "@/data/seed";
import type {
  BehaviorLog,
  BehaviorType,
  Group,
  InterventionFeedback,
  Student,
} from "@/lib/types";

export function getStudents(): Student[] {
  return seedStudents;
}

export function getStudent(id: string): Student | undefined {
  return seedStudents.find((s) => s.id === id);
}

export function getGroups() {
  return GROUPS;
}

export function getStudentsInGroup(g: Group): Student[] {
  return seedStudents.filter((s) => s.group === g);
}

export function getLogsForStudent(id: string, logs: BehaviorLog[] = seedLogs) {
  return logs.filter((l) => l.studentId === id);
}

export function getLogsForGroup(g: Group, logs: BehaviorLog[] = seedLogs) {
  const ids = new Set(getStudentsInGroup(g).map((s) => s.id));
  return logs.filter((l) => ids.has(l.studentId));
}

export function getAllLogs(): BehaviorLog[] {
  return seedLogs;
}

// Aggregations ---------------------------------------------------------------

export function behaviorMix(logs: BehaviorLog[]) {
  const counts: Record<BehaviorType, number> = {
    fight: 0, flight: 0, freeze: 0, regulated: 0,
  };
  for (const l of logs) counts[l.type]++;
  return counts;
}

export function cycleMix(logs: BehaviorLog[]) {
  const out: {
    cycle: number;
    fight: number; flight: number; freeze: number; regulated: number;
  }[] = [1, 2, 3, 4].map((c) => ({
    cycle: c, fight: 0, flight: 0, freeze: 0, regulated: 0,
  }));
  for (const l of logs) {
    const row = out.find((r) => r.cycle === l.cycle)!;
    row[l.type]++;
  }
  return out;
}

export function weeklyTrend(logs: BehaviorLog[]) {
  // 36 weeks (cycle 1..4, week 1..9)
  const out: {
    weekIndex: number; label: string;
    fight: number; flight: number; freeze: number; regulated: number;
  }[] = [];
  for (let c = 1; c <= 4; c++) {
    for (let w = 1; w <= 9; w++) {
      out.push({
        weekIndex: (c - 1) * 9 + w,
        label: `C${c}·W${w}`,
        fight: 0, flight: 0, freeze: 0, regulated: 0,
      });
    }
  }
  for (const l of logs) {
    const idx = (l.cycle - 1) * 9 + l.week - 1;
    const row = out[idx];
    row[l.type]++;
  }
  return out;
}

export function contextHeat(logs: BehaviorLog[]) {
  const contexts = ["classroom", "transition", "lunch", "group", "arrival", "dismissal", "other"] as const;
  const result: { context: string; count: number; regulatedShare: number }[] = [];
  for (const c of contexts) {
    const inContext = logs.filter((l) => l.context === c);
    const reg = inContext.filter((l) => l.type === "regulated").length;
    result.push({
      context: c,
      count: inContext.length,
      regulatedShare: inContext.length ? reg / inContext.length : 0,
    });
  }
  return result;
}

export function regulatedShare(logs: BehaviorLog[]) {
  if (!logs.length) return 0;
  return logs.filter((l) => l.type === "regulated").length / logs.length;
}

export function cycleComparison(logs: BehaviorLog[]) {
  const cycles = cycleMix(logs);
  const current = cycles[cycles.length - 1];
  const prev = cycles[cycles.length - 2];
  const diff = {
    cycle: current.cycle,
    fight: current.fight - prev.fight,
    flight: current.flight - prev.flight,
    freeze: current.freeze - prev.freeze,
    regulated: current.regulated - prev.regulated,
  };
  return { current, prev, diff };
}

export function hourHeatmap(logs: BehaviorLog[]) {
  // Hour 8..18
  const hours = Array.from({ length: 11 }, (_, i) => i + 8);
  return hours.map((h) => {
    const atHour = logs.filter((l) => new Date(l.at).getHours() === h);
    return {
      hour: h,
      label: `${h}:00`,
      total: atHour.length,
      regulated: atHour.filter((l) => l.type === "regulated").length,
    };
  });
}

export const BEHAVIOR_LABEL: Record<BehaviorType, string> = {
  fight: "Fight",
  flight: "Flight",
  freeze: "Freeze",
  regulated: "Regulated",
};

export const BEHAVIOR_COLOR: Record<BehaviorType, string> = {
  fight: "var(--coral)",
  flight: "var(--peach)",
  freeze: "var(--navy)",
  regulated: "var(--teal)",
};

// Risers for counselor queue
export function studentsRising(students: Student[], logs: BehaviorLog[]) {
  return students
    .map((s) => {
      const sLogs = getLogsForStudent(s.id, logs);
      const c3 = sLogs.filter((l) => l.cycle === 3 && l.type !== "regulated").length;
      const c4 = sLogs.filter((l) => l.cycle === 4 && l.type !== "regulated").length;
      return { student: s, delta: c4 - c3, latest: c4 };
    })
    .sort((a, b) => b.delta - a.delta);
}

export function fallbackSuggestions(mode: "student" | "group") {
  if (mode === "student") {
    return [
      {
        title: "A 2-minute reset ritual",
        why: "Short, predictable breaks help a child's nervous system settle before they can learn.",
        steps: [
          "Offer a quiet corner with a specific chair or cushion.",
          "Set a 2-minute visual timer so the child knows it has an end.",
          "Invite them back with a warm, brief check-in: \"Ready to try again?\"",
        ],
        whoCanHelp: "Teacher",
      },
      {
        title: "Name it, then normalize it",
        why: "Labeling a feeling in plain language lowers its intensity and models self-awareness.",
        steps: [
          "Use one sentence: \"Looks like something felt big just now.\"",
          "Offer two choices: water or a quick walk together.",
          "Follow up at the end of the day with a strengths note.",
        ],
        whoCanHelp: "Counselor",
      },
      {
        title: "Lean into a known strength",
        why: "Grounding in competence rebuilds trust in the room.",
        steps: [
          "Pair the child with a smaller task tied to a known interest.",
          "Narrate what you notice working: \"You helped them figure it out.\"",
          "Note the win in the Interventions tab for the next adult.",
        ],
        whoCanHelp: "Teacher",
      },
    ];
  }
  return [
    {
      title: "Transitions with a shared signal",
      why: "Groups often spike at transitions. A shared signal makes the shift feel safer.",
      steps: [
        "Introduce a single visual or sound cue 2 minutes before transitions.",
        "Have students pair up to move together.",
        "Debrief at the end of the week: what felt smoother?",
      ],
      whoCanHelp: "Program lead",
    },
    {
      title: "Open with a regulated moment",
      why: "Starting with calm sets the tone for the hour and lifts the whole group.",
      steps: [
        "Begin each session with 60 seconds of breathing or stretching.",
        "Rotate who leads it.",
        "Log it as a group regulated moment.",
      ],
      whoCanHelp: "Teacher",
    },
    {
      title: "Celebrate growth across the cycle",
      why: "Public strengths recognition increases positive perception of ability.",
      steps: [
        "Pick one strength per student each cycle.",
        "Share aloud or in a note home.",
        "Invite families to add one strength they see.",
      ],
      whoCanHelp: "Program Director",
    },
  ];
}

export type { Student, BehaviorLog, InterventionFeedback };
