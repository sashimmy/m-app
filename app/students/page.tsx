"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { getStudents } from "@/lib/data";
import { useRole } from "@/lib/role-context";
import { Avatar, Card, Chip } from "@/components/ui";
import type { Group } from "@/lib/types";

export default function StudentsPage() {
  const { role } = useRole();
  const [q, setQ] = useState("");
  const [group, setGroup] = useState<Group | "all">("all");

  const students = useMemo(() => {
    const term = q.toLowerCase();
    return getStudents().filter(
      (s) =>
        (group === "all" || s.group === group) &&
        (!term || `${s.firstName} ${s.lastInitial}`.toLowerCase().includes(term))
    );
  }, [q, group]);

  const showAce = role !== "teacher" && role !== "parent";

  return (
    <div className="p-5 md:p-8 max-w-6xl mx-auto space-y-5">
      <header>
        <h1 className="text-3xl md:text-4xl font-bold font-display">Students</h1>
        <p className="text-ink-soft">Demo seed · 36 students across four groups.</p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-white rounded-full border border-line px-3 h-10 flex-1 max-w-xs">
          <Search size={16} className="text-ink-mute" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Find a student"
            className="bg-transparent outline-none text-sm w-full"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "A", "B", "C", "D"] as const).map((g) => (
            <Chip
              key={g}
              color="neutral"
              onClick={() => setGroup(g)}
              active={group === g}
            >
              {g === "all" ? "All groups" : `Group ${g}`}
            </Chip>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {students.map((s) => (
          <Link
            key={s.id}
            href={`/students/${s.id}`}
            className="block"
          >
            <Card className="hover:border-teal/50 transition-colors p-4">
              <div className="flex items-center gap-3">
                <Avatar firstName={s.firstName} lastInitial={s.lastInitial} hue={s.photoHue} />
                <div className="min-w-0">
                  <div className="font-bold font-display truncate">{s.firstName} {s.lastInitial}.</div>
                  <div className="text-xs text-ink-mute">
                    Group {s.group} · age {s.age}
                    {showAce && <> · ACE {s.aceScore}</>}
                  </div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {s.strengths.slice(0, 2).map((st) => (
                  <Chip key={st} color="peach" className="text-[10px]">{st}</Chip>
                ))}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
