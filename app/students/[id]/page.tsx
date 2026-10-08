"use client";

import { use, useMemo, useState } from "react";
import { notFound } from "next/navigation";
import { Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useData } from "@/lib/data-context";
import { getStudent, getLogsForStudent, cycleComparison, BEHAVIOR_LABEL } from "@/lib/data";
import { useRole } from "@/lib/role-context";
import { Avatar, Button, Card, Chip, SectionTitle, Stat } from "@/components/ui";
import {
  BehaviorMixCard, CycleMixCard, WeeklyTrendCard,
  ContextHeatCard, HourHeatmapCard,
} from "@/components/Charts";
import { SuggestPanel } from "@/components/SuggestPanel";
import { QuickLogSheet } from "@/components/QuickLogSheet";
import { formatRelative } from "@/lib/utils";

type Tab = "overview" | "behavior" | "interventions" | "notes";

export default function StudentProfilePage({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const student = getStudent(id);
  if (!student) notFound();

  const { logs, feedback } = useData();
  const { role } = useRole();
  const [tab, setTab] = useState<Tab>("overview");
  const [quickOpen, setQuickOpen] = useState(false);

  const sLogs = useMemo(() => getLogsForStudent(student.id, logs), [student.id, logs]);
  const cmp = useMemo(() => cycleComparison(sLogs), [sLogs]);
  const sFeedback = feedback.filter((f) => f.studentId === student.id);

  const showAce = role !== "teacher" && role !== "parent";

  const payload = {
    ageBand: `${Math.floor(student.age / 3) * 3}-${Math.floor(student.age / 3) * 3 + 2}`,
    group: student.group,
    strengths: student.strengths,
    interests: student.interests,
    recentCounts: {
      fight: sLogs.filter((l) => l.cycle === 4 && l.type === "fight").length,
      flight: sLogs.filter((l) => l.cycle === 4 && l.type === "flight").length,
      freeze: sLogs.filter((l) => l.cycle === 4 && l.type === "freeze").length,
      regulated: sLogs.filter((l) => l.cycle === 4 && l.type === "regulated").length,
    },
    topContexts: Object.entries(
      sLogs.reduce<Record<string, number>>((acc, l) => {
        acc[l.context] = (acc[l.context] ?? 0) + 1;
        return acc;
      }, {})
    ).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([c]) => c),
  };

  return (
    <div className="p-5 md:p-8 max-w-5xl mx-auto space-y-6">
      <Link href="/students" className="inline-flex items-center gap-1 text-sm text-teal-dark font-semibold hover:underline">
        <ArrowLeft size={14} /> All students
      </Link>

      {/* Header */}
      <Card className="flex flex-col md:flex-row md:items-center gap-5">
        <Avatar firstName={student.firstName} lastInitial={student.lastInitial} hue={student.photoHue} size={72} />
        <div className="flex-1">
          <h1 className="text-3xl font-bold font-display">
            {student.firstName} {student.lastInitial}.
          </h1>
          <div className="text-ink-mute mt-1 flex flex-wrap items-center gap-2 text-sm">
            <span>Age {student.age}</span><span>·</span>
            <span>Group {student.group}</span><span>·</span>
            <span className="capitalize">{student.enrollment}</span>
            {showAce && (
              <>
                <span>·</span>
                <Chip color="navy">ACE {student.aceScore}</Chip>
              </>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {student.strengths.map((s) => <Chip key={s} color="peach">{s}</Chip>)}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="coral" onClick={() => setQuickOpen(true)}>
            <Plus size={16} /> Quick Log
          </Button>
        </div>
      </Card>

      {showAce && (
        <div className="text-xs text-ink-mute bg-navy-50 border border-navy/15 rounded-xl p-3">
          <strong>About ACE scores:</strong> The ACE questionnaire was designed for research, not screening individuals.
          Higher counts are <em>associated with</em> stress responses — not destiny. Caring adults and strengths are protective.
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-line overflow-x-auto">
        {(["overview", "behavior", "interventions", "notes"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-bold capitalize border-b-2 -mb-px transition-colors ${
              tab === t ? "border-teal text-teal-dark" : "border-transparent text-ink-mute hover:text-ink"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-3 gap-4">
            <Stat label="Logged moments" value={sLogs.length} />
            <Stat
              label="Regulated · Cycle 4"
              value={`${sLogs.filter((l) => l.cycle === 4).length ? Math.round(sLogs.filter((l) => l.cycle === 4 && l.type === "regulated").length / sLogs.filter((l) => l.cycle === 4).length * 100) : 0}%`}
              tone="good"
            />
            <Stat
              label="Change · C3 → C4"
              value={`${cmp.diff.regulated >= 0 ? "+" : ""}${cmp.diff.regulated}`}
              tone={cmp.diff.regulated >= 0 ? "good" : "warn"}
              hint="More regulated moments"
            />
          </div>

          <Card>
            <SectionTitle kicker="Cycle 4 vs Cycle 3">What&apos;s shifting</SectionTitle>
            <ul className="grid sm:grid-cols-2 gap-2 text-sm">
              {(["regulated", "fight", "flight", "freeze"] as const).map((k) => {
                const v = cmp.diff[k];
                const good = (k === "regulated" && v > 0) || (k !== "regulated" && v < 0);
                return (
                  <li key={k} className="flex items-center justify-between p-3 rounded-xl bg-cream border border-line">
                    <span className="font-semibold capitalize">{BEHAVIOR_LABEL[k]}</span>
                    <Chip color={good ? "teal" : v === 0 ? "neutral" : "coral"}>
                      {v > 0 ? "+" : ""}{v}
                    </Chip>
                  </li>
                );
              })}
            </ul>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <BehaviorMixCard logs={sLogs} />
            <ContextHeatCard logs={sLogs} />
          </div>

          <SuggestPanel mode="student" subjectId={student.id} payload={payload} />
        </div>
      )}

      {tab === "behavior" && (
        <div className="space-y-6">
          <WeeklyTrendCard logs={sLogs} />
          <CycleMixCard logs={sLogs} />
          <HourHeatmapCard logs={sLogs} />
          <Card>
            <SectionTitle kicker="Latest">Recent entries</SectionTitle>
            <ul className="divide-y divide-line">
              {[...sLogs].sort((a, b) => +new Date(b.at) - +new Date(a.at)).slice(0, 10).map((l) => (
                <li key={l.id} className="py-2 flex items-center gap-3 text-sm">
                  <Chip color={l.type === "regulated" ? "teal" : l.type === "fight" ? "coral" : l.type === "flight" ? "peach" : "navy"}>
                    {l.type}
                  </Chip>
                  <span className="text-ink-mute capitalize">{l.context}</span>
                  <span className="text-ink-mute text-xs">· intensity {l.intensity}</span>
                  <span className="ml-auto text-ink-mute text-xs">{formatRelative(l.at)}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {tab === "interventions" && (
        <div className="space-y-6">
          <SuggestPanel mode="student" subjectId={student.id} payload={payload} />
          <Card>
            <SectionTitle kicker="History">What&apos;s been tried</SectionTitle>
            {sFeedback.length === 0 ? (
              <p className="text-sm text-ink-mute">No feedback yet. Mark an idea Tried, Helpful, or Not helpful to build a shared record.</p>
            ) : (
              <ul className="divide-y divide-line">
                {sFeedback.map((f) => (
                  <li key={f.id} className="py-2 flex items-center gap-3 text-sm">
                    <Chip color={f.outcome === "helpful" ? "teal" : f.outcome === "tried" ? "peach" : "coral"}>
                      {f.outcome}
                    </Chip>
                    <span className="font-semibold">{f.title}</span>
                    <span className="ml-auto text-ink-mute text-xs">{formatRelative(f.at)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}

      {tab === "notes" && (
        <Card>
          <SectionTitle kicker="Context" >Caring adults and notes</SectionTitle>
          <div className="flex flex-wrap gap-2 mb-3">
            {student.caringAdults.map((a) => <Chip key={a} color="teal">{a}</Chip>)}
          </div>
          <p className="text-sm text-ink-soft">{student.notes || "No notes added yet."}</p>
        </Card>
      )}

      <QuickLogSheet open={quickOpen} onClose={() => setQuickOpen(false)} studentId={student.id} />
    </div>
  );
}
