"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useData } from "@/lib/data-context";
import { getGroups, getStudents, cycleMix, regulatedShare } from "@/lib/data";
import { Button, Card, Chip, SectionTitle, Stat } from "@/components/ui";
import { CycleMixCard, WeeklyTrendCard } from "@/components/Charts";
import { Printer } from "lucide-react";

const OUTCOMES = [
  { key: "relationships", label: "Better relationships", value: 0.84 },
  { key: "ability", label: "Positive perception of ability", value: 0.81 },
  { key: "learning", label: "Positive attitudes about learning", value: 0.79 },
  { key: "aggression", label: "Decrease in aggressive behavior", value: 0.86 },
];

export default function DirectorHome() {
  const { logs } = useData();
  const students = getStudents();
  const groups = getGroups();
  const cycles = useMemo(() => cycleMix(logs), [logs]);
  const regShareC1 = regulatedShare(logs.filter((l) => l.cycle === 1));
  const regShareC4 = regulatedShare(logs.filter((l) => l.cycle === 4));
  const growth = regShareC4 - regShareC1;

  return (
    <div className="p-5 md:p-8 max-w-6xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-teal-dark">Hi, Demarcus</div>
          <h1 className="text-3xl md:text-4xl font-bold font-display mt-1">Program dashboard</h1>
          <p className="text-ink-soft mt-1">
            4 groups, {students.length} students, 36-week cycles. Export-ready for funders.
          </p>
        </div>
        <Button variant="secondary" onClick={() => window.print()}>
          <Printer size={16} /> Print / Save PDF
        </Button>
      </header>

      <div className="grid sm:grid-cols-4 gap-4">
        <Stat label="Students" value={students.length} />
        <Stat label="Groups" value={groups.length} />
        <Stat
          label="Regulated share · C4"
          value={`${Math.round(regShareC4 * 100)}%`}
          tone="good"
        />
        <Stat
          label="Growth · C1 → C4"
          value={`${growth >= 0 ? "+" : ""}${Math.round(growth * 100)}%`}
          tone={growth >= 0 ? "good" : "warn"}
          hint="More regulated moments"
        />
      </div>

      <Card>
        <SectionTitle kicker="80% outcome targets" >
          M-PACK commitments
        </SectionTitle>
        <ul className="grid md:grid-cols-2 gap-3">
          {OUTCOMES.map((o) => (
            <li key={o.key} className="p-4 rounded-2xl bg-cream border border-line">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{o.label}</div>
                <Chip color={o.value >= 0.8 ? "teal" : "peach"}>
                  {Math.round(o.value * 100)}%
                </Chip>
              </div>
              <div className="mt-2 h-2 rounded-full bg-white overflow-hidden">
                <div
                  className="h-full"
                  style={{
                    width: `${o.value * 100}%`,
                    background: o.value >= 0.8 ? "var(--teal)" : "var(--peach)",
                  }}
                />
                <div
                  className="h-[2px] -mt-[2px] bg-coral/60"
                  style={{ marginLeft: "80%", width: "1px" }}
                />
              </div>
              <div className="text-[11px] text-ink-mute mt-1">Target 80% · dashed line</div>
            </li>
          ))}
        </ul>
        <p className="text-[11px] text-ink-mute mt-3">
          Some targets will combine behavior logs with brief surveys; this prototype illustrates the shape.
        </p>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <CycleMixCard logs={logs} />
        <WeeklyTrendCard logs={logs} />
      </div>

      <Card>
        <SectionTitle kicker="All groups">Group progress</SectionTitle>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {groups.map((g) => {
            const gl = logs.filter((l) => students.find((s) => s.id === l.studentId)?.group === g.id);
            const share = Math.round(regulatedShare(gl) * 100);
            return (
              <Link
                key={g.id}
                href={`/groups/${g.id}`}
                className="rounded-2xl bg-white border border-line p-4 hover:bg-teal-50 transition-colors block"
              >
                <div className="text-xs font-bold text-teal-dark uppercase tracking-wider">Group {g.id}</div>
                <div className="font-bold font-display text-lg mt-0.5">{g.name.split(" · ")[1]}</div>
                <div className="text-xs text-ink-mute mt-1">{g.lead} · {g.meeting}</div>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-cream">
                    <div className="h-full rounded-full bg-teal" style={{ width: `${share}%` }} />
                  </div>
                  <span className="text-xs font-bold">{share}%</span>
                </div>
                <div className="text-[10px] text-ink-mute mt-1">Regulated share</div>
              </Link>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
