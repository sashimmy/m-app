"use client";

import { useMemo } from "react";
import { useData } from "@/lib/data-context";
import { getStudent, getLogsForStudent } from "@/lib/data";
import { useRole } from "@/lib/role-context";
import { Avatar, Card, Chip, SectionTitle } from "@/components/ui";
import { WeeklyTrendCard, BehaviorMixCard } from "@/components/Charts";

export default function ParentChildPage() {
  const { logs } = useData();
  const { parentChildId } = useRole();
  const child = getStudent(parentChildId);
  const sLogs = useMemo(() => (child ? getLogsForStudent(child.id, logs) : []), [child, logs]);
  if (!child) return null;

  return (
    <div className="p-5 md:p-8 max-w-4xl mx-auto space-y-6">
      <header className="flex items-center gap-4">
        <Avatar firstName={child.firstName} lastInitial={child.lastInitial} hue={child.photoHue} size={56} />
        <div>
          <h1 className="text-3xl font-bold font-display">{child.firstName}&apos;s growth</h1>
          <p className="text-ink-soft">Group {child.group} · age {child.age}</p>
        </div>
      </header>

      <Card>
        <SectionTitle kicker="What we see" >Strengths and interests</SectionTitle>
        <div className="flex flex-wrap gap-2 mb-4">
          {child.strengths.map((s) => <Chip key={s} color="peach">{s}</Chip>)}
          {child.interests.map((s) => <Chip key={s} color="teal">{s}</Chip>)}
        </div>
        <p className="text-sm text-ink-soft">Caring adults: {child.caringAdults.join(", ")}.</p>
      </Card>

      <WeeklyTrendCard logs={sLogs} />
      <BehaviorMixCard logs={sLogs} />

      <p className="text-xs text-ink-mute">
        You are seeing a strengths-first view. Full behavior details are shared only with teachers and the counselor team.
      </p>
    </div>
  );
}
