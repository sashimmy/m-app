"use client";

import Link from "next/link";
import { getGroups } from "@/lib/data";
import { Card } from "@/components/ui";

export default function GroupsIndex() {
  const groups = getGroups();
  return (
    <div className="p-5 md:p-8 max-w-5xl mx-auto space-y-5">
      <header>
        <h1 className="text-3xl md:text-4xl font-bold font-display">Groups</h1>
        <p className="text-ink-soft">Pick a group to open its climate report.</p>
      </header>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {groups.map((g) => (
          <Link key={g.id} href={`/groups/${g.id}`}>
            <Card className="hover:border-teal/50 transition-colors">
              <div className="text-xs font-bold text-teal-dark uppercase tracking-wider">Group {g.id}</div>
              <div className="font-bold font-display text-lg mt-0.5">{g.name.split(" · ")[1]}</div>
              <div className="text-xs text-ink-mute mt-1">{g.lead} · {g.meeting}</div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
