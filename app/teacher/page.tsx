"use client";

import Link from "next/link";
import { Plus, Users as UsersIcon, Sparkles, Clock } from "lucide-react";
import { useMemo, useState } from "react";
import { useData } from "@/lib/data-context";
import { getStudents, studentsRising, regulatedShare } from "@/lib/data";
import { Avatar, Button, Card, Chip, SectionTitle, Stat } from "@/components/ui";
import { QuickLogSheet } from "@/components/QuickLogSheet";
import { formatRelative } from "@/lib/utils";

export default function TeacherHome() {
  const { logs } = useData();
  const [quickOpen, setQuickOpen] = useState(false);
  const [targetId, setTargetId] = useState<string | undefined>(undefined);

  const students = getStudents().filter((s) => s.group === "A");
  const recent = useMemo(
    () => [...logs].sort((a, b) => +new Date(b.at) - +new Date(a.at)).slice(0, 5),
    [logs]
  );
  const risers = useMemo(() => studentsRising(students, logs).slice(0, 3), [students, logs]);
  const todayCount = logs.filter((l) => {
    const d = new Date(l.at);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).length;

  return (
    <div className="p-5 md:p-8 max-w-6xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-teal-dark">Hi, Ms. Carter</div>
          <h1 className="text-3xl md:text-4xl font-bold font-display mt-1">Group A today</h1>
          <p className="text-ink-soft mt-1">A gentle noticing can change a child&apos;s day. Log it in a few taps.</p>
        </div>
        <Button variant="coral" size="lg" onClick={() => { setTargetId(undefined); setQuickOpen(true); }}>
          <Plus size={18} /> Quick Log
        </Button>
      </header>

      <div className="grid sm:grid-cols-3 gap-4">
        <Stat label="Students in group" value={students.length} />
        <Stat label="Logged today" value={todayCount} tone="good" hint="You and your team" />
        <Stat
          label="This week"
          value={`${Math.round(regulatedShare(logs.filter((l) => l.cycle === 4 && l.week === 9)) * 100)}%`}
          tone="good"
          hint="Regulated moments"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <SectionTitle kicker="Students" >Check in on</SectionTitle>
          <ul className="divide-y divide-line">
            {risers.map(({ student: s, delta }) => (
              <li key={s.id} className="py-3 flex items-center gap-3">
                <Avatar firstName={s.firstName} lastInitial={s.lastInitial} hue={s.photoHue} />
                <div className="flex-1 min-w-0">
                  <Link href={`/students/${s.id}`} className="font-bold hover:underline">
                    {s.firstName} {s.lastInitial}.
                  </Link>
                  <div className="text-xs text-ink-mute">Group {s.group} · age {s.age} · {s.strengths[0]}</div>
                </div>
                {delta > 0 ? (
                  <Chip color="peach">+{delta} rising</Chip>
                ) : (
                  <Chip color="teal">Steady</Chip>
                )}
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => { setTargetId(s.id); setQuickOpen(true); }}
                >
                  <Plus size={14} /> Log
                </Button>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <SectionTitle kicker="Try this today">
            <span className="flex items-center gap-2"><Sparkles size={18} className="text-teal-dark" /> One idea</span>
          </SectionTitle>
          <h4 className="font-bold text-lg font-display">A 2-minute reset ritual</h4>
          <p className="text-sm text-ink-soft mt-1.5">
            Short, predictable breaks help a child&apos;s nervous system settle before they can learn.
          </p>
          <ol className="mt-3 text-sm space-y-1.5 list-decimal pl-5">
            <li>Offer a quiet corner with a specific chair.</li>
            <li>Set a 2-minute visual timer.</li>
            <li>Invite back warmly: &quot;Ready to try again?&quot;</li>
          </ol>
          <div className="text-[11px] text-ink-mute mt-4">Ideas to try, not clinical advice.</div>
        </Card>
      </div>

      <Card>
        <SectionTitle kicker="Last few moments">
          <span className="flex items-center gap-2"><Clock size={18} className="text-teal-dark" /> Recent activity</span>
        </SectionTitle>
        <ul className="divide-y divide-line">
          {recent.map((l) => {
            const s = getStudents().find((x) => x.id === l.studentId)!;
            return (
              <li key={l.id} className="py-2 flex items-center gap-3 text-sm">
                <Avatar firstName={s.firstName} lastInitial={s.lastInitial} hue={s.photoHue} size={30} />
                <span className="font-semibold">{s.firstName} {s.lastInitial}.</span>
                <Chip color={l.type === "regulated" ? "teal" : l.type === "fight" ? "coral" : l.type === "flight" ? "peach" : "navy"}>
                  {l.type}
                </Chip>
                <span className="text-ink-mute">in {l.context}</span>
                <span className="ml-auto text-ink-mute text-xs">{formatRelative(l.at)}</span>
              </li>
            );
          })}
        </ul>
      </Card>

      <QuickLogSheet open={quickOpen} onClose={() => setQuickOpen(false)} studentId={targetId} />
    </div>
  );
}
