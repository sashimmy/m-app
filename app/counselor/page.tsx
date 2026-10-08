"use client";

import Link from "next/link";
import { useMemo } from "react";
import { TrendingUp, Users as UsersIcon, FileText } from "lucide-react";
import { useData } from "@/lib/data-context";
import { getGroups, getStudents, studentsRising } from "@/lib/data";
import { Avatar, Card, Chip, SectionTitle, Stat } from "@/components/ui";

export default function CounselorHome() {
  const { logs } = useData();
  const students = getStudents();
  const risers = useMemo(() => studentsRising(students, logs).slice(0, 6), [students, logs]);
  const highAce = students
    .filter((s) => s.aceScore >= 4)
    .sort((a, b) => b.aceScore - a.aceScore)
    .slice(0, 4);

  return (
    <div className="p-5 md:p-8 max-w-6xl mx-auto space-y-6">
      <header>
        <div className="text-[11px] font-bold uppercase tracking-wider text-teal-dark">Hi, Mr. Reyes</div>
        <h1 className="text-3xl md:text-4xl font-bold font-display mt-1">Referral queue</h1>
        <p className="text-ink-soft mt-1">
          Full student profiles and group reports in one place. Risk is described, not destiny.
        </p>
      </header>

      <div className="grid sm:grid-cols-3 gap-4">
        <Stat label="Open referrals" value={risers.filter((r) => r.delta > 2).length} />
        <Stat label="Students watched" value={students.length} />
        <Stat label="Groups" value={getGroups().length} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <SectionTitle kicker="Rising counts" >
            <span className="flex items-center gap-2"><TrendingUp size={18} className="text-teal-dark" /> Attention this week</span>
          </SectionTitle>
          <ul className="divide-y divide-line">
            {risers.map(({ student: s, delta }) => (
              <li key={s.id} className="py-3 flex items-center gap-3">
                <Avatar firstName={s.firstName} lastInitial={s.lastInitial} hue={s.photoHue} />
                <div className="flex-1 min-w-0">
                  <Link href={`/students/${s.id}`} className="font-bold hover:underline">
                    {s.firstName} {s.lastInitial}.
                  </Link>
                  <div className="text-xs text-ink-mute">
                    Group {s.group} · age {s.age} · ACE {s.aceScore}
                  </div>
                </div>
                {delta > 2 ? <Chip color="coral">+{delta} rising</Chip>
                  : delta > 0 ? <Chip color="peach">+{delta}</Chip>
                  : <Chip color="teal">Steady</Chip>}
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <SectionTitle kicker="Context" >
            Students with higher ACE counts
          </SectionTitle>
          <p className="text-xs text-ink-mute mb-3">
            Higher ACE counts are <strong>associated with</strong> stress responses. They are not destiny.
            Strengths and caring adults are protective.
          </p>
          <ul className="divide-y divide-line">
            {highAce.map((s) => (
              <li key={s.id} className="py-3 flex items-center gap-3">
                <Avatar firstName={s.firstName} lastInitial={s.lastInitial} hue={s.photoHue} />
                <div className="flex-1 min-w-0">
                  <Link href={`/students/${s.id}`} className="font-bold hover:underline">
                    {s.firstName} {s.lastInitial}.
                  </Link>
                  <div className="text-xs text-ink-mute">
                    Group {s.group} · caring: {s.caringAdults.join(", ")}
                  </div>
                </div>
                <Chip color="navy">ACE {s.aceScore}</Chip>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card>
        <SectionTitle kicker="Group reports">
          <span className="flex items-center gap-2"><FileText size={18} className="text-teal-dark" /> Recent group climate</span>
        </SectionTitle>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {getGroups().map((g) => (
            <Link
              key={g.id}
              href={`/groups/${g.id}`}
              className="rounded-2xl bg-cream border border-line p-4 hover:bg-teal-50 transition-colors"
            >
              <div className="text-xs font-bold text-teal-dark uppercase tracking-wider">Group {g.id}</div>
              <div className="font-bold font-display text-lg mt-0.5">{g.name.split(" · ")[1]}</div>
              <div className="text-xs text-ink-mute mt-1">{g.meeting}</div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
