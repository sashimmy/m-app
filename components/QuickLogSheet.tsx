"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Check } from "lucide-react";
import { getStudents } from "@/lib/data";
import { useData } from "@/lib/data-context";
import { Avatar, Button, Chip } from "@/components/ui";
import type {
  BehaviorLog, BehaviorType, ContextTag, Intensity,
} from "@/lib/types";

const BEHAVIORS: { key: BehaviorType; label: string; sub: string; color: "coral" | "peach" | "navy" | "teal"; icon: string }[] = [
  { key: "fight", label: "Fight", sub: "Big reactions", color: "coral", icon: "⚡" },
  { key: "flight", label: "Flight", sub: "Pulling away", color: "peach", icon: "🏃" },
  { key: "freeze", label: "Freeze", sub: "Shutting down", color: "navy", icon: "🧊" },
  { key: "regulated", label: "Regulated", sub: "Positive moment", color: "teal", icon: "🌟" },
];

const CONTEXTS: { key: ContextTag; label: string }[] = [
  { key: "classroom", label: "Classroom" },
  { key: "transition", label: "Transition" },
  { key: "lunch", label: "Lunch" },
  { key: "group", label: "Group activity" },
  { key: "arrival", label: "Arrival" },
  { key: "dismissal", label: "Dismissal" },
  { key: "other", label: "Other" },
];

const INTENSITIES: Intensity[] = ["low", "medium", "high"];

export function QuickLogSheet({
  open, onClose, studentId,
}: { open: boolean; onClose: () => void; studentId?: string }) {
  const { addLog } = useData();
  const [student, setStudent] = useState(studentId ?? "");
  const [type, setType] = useState<BehaviorType | "">("");
  const [intensity, setIntensity] = useState<Intensity>("medium");
  const [context, setContext] = useState<ContextTag | "">("");
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (open) {
      setStudent(studentId ?? "");
      setType(""); setContext(""); setNote(""); setIntensity("medium"); setSaved(false); setQuery("");
    }
  }, [open, studentId]);

  const students = useMemo(() => {
    const q = query.toLowerCase();
    return getStudents()
      .filter((s) => !q || `${s.firstName} ${s.lastInitial}`.toLowerCase().includes(q))
      .slice(0, 10);
  }, [query]);

  if (!open) return null;

  const canSave = student && type && context;

  function save() {
    if (!canSave) return;
    const now = new Date();
    // Place log in the current cycle/week relative to a 36-week horizon
    const log: Omit<BehaviorLog, "id"> = {
      studentId: student,
      type: type as BehaviorType,
      intensity,
      context: context as ContextTag,
      note: note || undefined,
      at: now.toISOString(),
      cycle: 4,
      week: 9,
      loggedBy: "You",
    };
    addLog(log);
    setSaved(true);
    setTimeout(onClose, 900);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white w-full md:max-w-xl md:rounded-3xl rounded-t-3xl shadow-2xl p-5 md:p-7 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-teal-dark">Quick Log</div>
            <h3 className="text-2xl font-bold font-display">What did you notice?</h3>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-teal-50 flex items-center justify-center"
            aria-label="Close"
          >
            <X />
          </button>
        </div>

        {/* Student picker */}
        <label className="block text-xs font-bold uppercase tracking-wider text-ink-mute mb-1.5">
          Student
        </label>
        {!student ? (
          <>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a first name"
              className="w-full h-11 rounded-xl border border-line px-3 bg-cream text-sm"
            />
            <div className="mt-2 flex flex-wrap gap-2 max-h-40 overflow-y-auto">
              {students.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStudent(s.id)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-line hover:bg-teal-50 text-sm"
                >
                  <Avatar firstName={s.firstName} lastInitial={s.lastInitial} hue={s.photoHue} size={22} />
                  {s.firstName} {s.lastInitial}.
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 p-2 rounded-xl bg-teal-50 border border-teal/20">
            {(() => {
              const s = getStudents().find((x) => x.id === student)!;
              return (
                <>
                  <Avatar firstName={s.firstName} lastInitial={s.lastInitial} hue={s.photoHue} size={32} />
                  <div className="font-semibold">{s.firstName} {s.lastInitial}.</div>
                  <div className="text-xs text-ink-mute">Group {s.group} · age {s.age}</div>
                  <button
                    className="ml-auto text-xs font-bold text-teal-dark hover:underline"
                    onClick={() => setStudent("")}
                  >Change</button>
                </>
              );
            })()}
          </div>
        )}

        {/* Behavior type */}
        <label className="block text-xs font-bold uppercase tracking-wider text-ink-mute mt-5 mb-2">
          What happened
        </label>
        <div className="grid grid-cols-2 gap-2">
          {BEHAVIORS.map((b) => {
            const active = type === b.key;
            return (
              <button
                key={b.key}
                onClick={() => setType(b.key)}
                className={`text-left p-3 rounded-2xl border-2 transition-colors ${
                  active
                    ? "border-teal bg-teal-50"
                    : "border-line bg-white hover:border-teal/40"
                }`}
                aria-pressed={active}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl" aria-hidden="true">{b.icon}</span>
                  <div className="font-bold">{b.label}</div>
                </div>
                <div className="text-xs text-ink-mute mt-0.5">{b.sub}</div>
              </button>
            );
          })}
        </div>

        {/* Intensity */}
        <label className="block text-xs font-bold uppercase tracking-wider text-ink-mute mt-5 mb-2">
          Intensity
        </label>
        <div className="flex gap-2">
          {INTENSITIES.map((i) => (
            <Chip
              key={i}
              onClick={() => setIntensity(i)}
              active={intensity === i}
              color="neutral"
              className="capitalize"
            >
              {i}
            </Chip>
          ))}
        </div>

        {/* Context */}
        <label className="block text-xs font-bold uppercase tracking-wider text-ink-mute mt-5 mb-2">
          Where
        </label>
        <div className="flex flex-wrap gap-2">
          {CONTEXTS.map((c) => (
            <Chip
              key={c.key}
              onClick={() => setContext(c.key)}
              active={context === c.key}
              color="neutral"
            >
              {c.label}
            </Chip>
          ))}
        </div>

        {/* Note */}
        <label className="block text-xs font-bold uppercase tracking-wider text-ink-mute mt-5 mb-1.5">
          Note (optional)
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="One short line, kind and specific."
          className="w-full rounded-xl border border-line px-3 py-2 bg-cream text-sm"
        />

        <div className="mt-6 flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={!canSave} variant="coral" size="lg">
            {saved ? <><Check size={18} /> Saved</> : "Save moment"}
          </Button>
        </div>
      </div>
    </div>
  );
}
