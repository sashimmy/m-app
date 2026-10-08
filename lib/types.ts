export type Role = "teacher" | "counselor" | "director" | "parent";

export type BehaviorType = "fight" | "flight" | "freeze" | "regulated";

export type Intensity = "low" | "medium" | "high";

export type ContextTag =
  | "classroom"
  | "transition"
  | "lunch"
  | "group"
  | "arrival"
  | "dismissal"
  | "other";

export type Group = "A" | "B" | "C" | "D";

export type EnrollmentType = "afterschool" | "classroom" | "summer";

export interface Student {
  id: string;
  firstName: string;
  lastInitial: string;
  age: number;
  group: Group;
  enrollment: EnrollmentType;
  aceScore: number; // 0..10
  strengths: string[];
  interests: string[];
  caringAdults: string[];
  notes: string;
  parentId?: string;
  photoHue: number; // 0..360 for avatar tint
}

export interface BehaviorLog {
  id: string;
  studentId: string;
  type: BehaviorType;
  intensity: Intensity;
  context: ContextTag;
  note?: string;
  // ISO datetime
  at: string;
  cycle: 1 | 2 | 3 | 4;
  week: number; // 1..9 within cycle
  loggedBy: string; // adult name
}

export interface InterventionFeedback {
  id: string;
  studentId?: string;
  groupId?: string;
  title: string;
  outcome: "helpful" | "not-helpful" | "tried";
  at: string;
}

export interface Suggestion {
  title: string;
  why: string;
  steps: string[];
  whoCanHelp: string;
}

export interface GroupInfo {
  id: Group;
  name: string;
  meeting: string;
  lead: string;
}
