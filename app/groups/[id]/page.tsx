"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Printer, ArrowLeft } from "lucide-react";
import { useData } from "@/lib/data-context";
import {
  getGroups, getStudentsInGroup, getLogsForGroup,
  regulatedShare, contextHeat, cycleComparison,
} from "@/lib/data";
import { Avatar, Button, Card, Chip, SectionTitle, Stat } from "@/components/ui";
import { BehaviorMixCard, CycleMixCard, WeeklyTrendCard, ContextHeatCard } from "@/components/Charts";
import { SuggestPanel } from "@/components/SuggestPanel";
import type { Group } from "@/lib/types";

export default function GroupReportPage({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const groupId = id as Group;
  const group = getGroups().find((g) => g.id === groupId);
  if (!group) notFound();

  const { logs } = useData();
  const students = getStudentsInGroup(groupId);
  const gLogs = useMemo(() => getLogsForGroup(groupId, logs), [groupId, logs]);
  const regShare = regulatedShare(gLogs);
  const top = contextHeat(gLogs).sort((a, b) => b.count - a.count)[0];
  const cmp = cycleComparison(gLogs);

  const payload = {
    group: groupId,
    students: students.length,
    cycleCounts: {
      fight: gLogs.filter((l) => l.type === "fight").length,
      flight: gLogs.filter((l) => l.type === "flight").length,
      freeze: gLogs.filter((l) => l.type === "freeze").length,
      regulated: gLogs.filter((l) => l.type === "regulated").length,
    },
    topContexts: contextHeat(gLogs).sort((a, b) => b.count - a.count).slice(0, 3).map((c) => c.context),
  };

  return (
    <div className="p-5 md:p-8 max-w-5xl mx-auto space-y-6">
      <Link href="/counselor" className="no-print inline-flex items-center gap-1 text-sm text-teal-dark font-semibold hover:underline">
        <ArrowLeft size={14} /> Back
      </Link>

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-teal-dark">Group Climate Report</div>
          <h1 className="text-3xl md:text-4xl font-bold font-display">{group.name}</h1>
          <p className="text-ink-soft">
            Social toxicology · {group.lead} · {group.meeting}
          </p>
        </div>
        <Button className="no-print" variant="secondary" onClick={() => window.print()}>
          <Printer size={16} /> Print / Save PDF
        </Button>
      </header>

      <div className="grid sm:grid-cols-4 gap-4">
        <Stat label="Students" value={students.length} />
        <Stat label="Logged moments" value={gLogs.length} />
        <Stat
          label="Regulated share"
          value={`${Math.round(regShare * 100)}%`}
          tone="good"
        />
        <Stat label="Top context" value={top ? top.context : "—"} hint="Where most moments show up" />
      </div>

      <Card>
        <SectionTitle kicker="Cycle 4 vs Cycle 3">Group shift</SectionTitle>
        <ul className="grid sm:grid-cols-4 gap-2 text-sm">
          {(["regulated", "fight", "flight", "freeze"] as const).map((k) => {
            const v = cmp.diff[k];
            const good = (k === "regulated" && v > 0) || (k !== "regulated" && v < 0);
            return (
              <li key={k} className="flex items-center justify-between p-3 rounded-xl bg-cream border border-line">
                <span className="font-semibold capitalize">{k}</span>
                <Chip color={good ? "teal" : v === 0 ? "neutral" : "coral"}>
                  {v > 0 ? "+" : ""}{v}
                </Chip>
              </li>
            );
          })}
        </ul>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <BehaviorMixCard logs={gLogs} />
        <ContextHeatCard logs={gLogs} />
      </div>

      <CycleMixCard logs={gLogs} />
      <WeeklyTrendCard logs={gLogs} />

      <Card>
        <SectionTitle kicker="Who&apos;s in this group">{students.length} students</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {students.map((s) => (
            <Link
              key={s.id}
              href={`/students/${s.id}`}
              className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-cream border border-line hover:bg-teal-50 text-sm no-print"
            >
              <Avatar firstName={s.firstName} lastInitial={s.lastInitial} hue={s.photoHue} size={24} />
              {s.firstName} {s.lastInitial}.
            </Link>
          ))}
        </div>
      </Card>

      <SuggestPanel mode="group" subjectId={groupId} payload={payload} />

      <footer className="text-xs text-ink-mute pt-4 border-t border-line">
        Generated from demo data. Ideas to try, not clinical advice.
      </footer>
    </div>
  );
}
