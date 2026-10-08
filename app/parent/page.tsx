"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Sparkles, Heart } from "lucide-react";
import { useData } from "@/lib/data-context";
import { getStudent, getLogsForStudent, cycleComparison, regulatedShare } from "@/lib/data";
import { useRole } from "@/lib/role-context";
import { Avatar, Card, Chip, SectionTitle, Stat } from "@/components/ui";

const PLAIN_LABEL: Record<string, { label: string; desc: string }> = {
  fight: { label: "Big reactions", desc: "Loud, strong, or quick to push back" },
  flight: { label: "Pulling away", desc: "Needs space or steps outside the group" },
  freeze: { label: "Shutting down", desc: "Goes quiet when things feel like a lot" },
  regulated: { label: "In the zone", desc: "Steady, calm, present" },
};

export default function ParentHome() {
  const { logs } = useData();
  const { parentChildId } = useRole();
  const child = getStudent(parentChildId);
  const sLogs = useMemo(() => (child ? getLogsForStudent(child.id, logs) : []), [child, logs]);
  const cmp = useMemo(() => cycleComparison(sLogs), [sLogs]);

  if (!child) {
    return <div className="p-8 text-ink-mute">Child not found.</div>;
  }

  const regC4 = regulatedShare(sLogs.filter((l) => l.cycle === 4));
  const regC3 = regulatedShare(sLogs.filter((l) => l.cycle === 3));
  const diff = Math.round((regC4 - regC3) * 100);

  return (
    <div className="p-5 md:p-8 max-w-3xl mx-auto space-y-6">
      <header className="flex items-center gap-4">
        <Avatar firstName={child.firstName} lastInitial={child.lastInitial} hue={child.photoHue} size={64} />
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-teal-dark">Welcome</div>
          <h1 className="text-3xl font-bold font-display">
            {child.firstName} is growing.
          </h1>
          <p className="text-ink-soft">Group {child.group} · age {child.age}</p>
        </div>
      </header>

      {/* Strengths first — no ACE score shown */}
      <Card className="bg-gradient-to-br from-white to-peach-50">
        <SectionTitle kicker="What we see" >
          <span className="flex items-center gap-2"><Heart size={18} className="text-coral" /> Strengths</span>
        </SectionTitle>
        <div className="flex flex-wrap gap-2">
          {child.strengths.map((s) => (
            <Chip key={s} color="peach" className="text-sm py-1.5 px-3">{s}</Chip>
          ))}
        </div>
        <p className="text-sm text-ink-soft mt-4">
          <strong>{child.firstName}</strong> loves {child.interests.join(" and ")}. Caring adults in {child.firstName}&apos;s corner: {child.caringAdults.join(", ")}.
        </p>
      </Card>

      <div className="grid sm:grid-cols-2 gap-4">
        <Stat
          label="In the zone (this cycle)"
          value={`${Math.round(regC4 * 100)}%`}
          tone="good"
          hint="Calm, steady moments logged"
        />
        <Stat
          label="Change from last cycle"
          value={`${diff >= 0 ? "+" : ""}${diff}%`}
          tone={diff >= 0 ? "good" : "warn"}
          hint="More calm moments is a win"
        />
      </div>

      <Card>
        <SectionTitle kicker="Growth highlight">
          {cmp.diff.regulated > 0
            ? `${child.firstName} had more "in the zone" moments this cycle`
            : `${child.firstName} is working through a bumpier stretch`}
        </SectionTitle>
        <p className="text-sm text-ink-soft">
          {cmp.diff.regulated > 0 ? (
            <>Teachers noticed {child.firstName} settling faster after transitions and leaning on {child.strengths[0].toLowerCase()}.</>
          ) : (
            <>Teachers are noticing more big moments. The team is pairing {child.firstName} with a trusted adult and extra reset time.</>
          )}
        </p>
      </Card>

      <Card>
        <SectionTitle kicker="Try at home" >
          <span className="flex items-center gap-2"><Sparkles size={18} className="text-teal-dark" /> One small thing</span>
        </SectionTitle>
        <h4 className="font-bold font-display text-lg">A 5-minute &quot;good things&quot; swap</h4>
        <p className="text-sm text-ink-soft mt-2">
          At dinner or bedtime, each person shares one thing that felt good today. Keep it short and warm.
          You will hear patterns about what helps {child.firstName} most.
        </p>
      </Card>

      <Card>
        <SectionTitle kicker="How we describe moments" >Plain-language key</SectionTitle>
        <ul className="grid sm:grid-cols-2 gap-2 text-sm">
          {(["regulated", "fight", "flight", "freeze"] as const).map((k) => (
            <li key={k} className="flex items-start gap-2 p-2.5 rounded-xl bg-cream border border-line">
              <div className="font-bold">{PLAIN_LABEL[k].label}</div>
              <div className="text-ink-mute">· {PLAIN_LABEL[k].desc}</div>
            </li>
          ))}
        </ul>
      </Card>

      <p className="text-xs text-ink-mute">
        <Link href="/parent/child" className="underline hover:text-teal-dark">See more about {child.firstName}</Link>
      </p>
    </div>
  );
}
