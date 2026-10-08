"use client";

import {
  Bar, BarChart, CartesianGrid, Legend, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis, Cell,
} from "recharts";
import type { BehaviorLog } from "@/lib/types";
import {
  BEHAVIOR_COLOR, BEHAVIOR_LABEL,
  behaviorMix, contextHeat, cycleMix, hourHeatmap, weeklyTrend,
} from "@/lib/data";
import { Card, SectionTitle } from "@/components/ui";

const COLORS = ["var(--teal)", "var(--peach)", "var(--navy)", "var(--coral)"];

export function BehaviorMixCard({ logs }: { logs: BehaviorLog[] }) {
  const mix = behaviorMix(logs);
  const data = (["regulated", "fight", "flight", "freeze"] as const).map((k) => ({
    name: BEHAVIOR_LABEL[k],
    value: mix[k],
    key: k,
  }));
  const total = data.reduce((a, b) => a + b.value, 0);

  return (
    <Card>
      <SectionTitle kicker="Behavior mix">All logged moments</SectionTitle>
      <div className="flex items-center gap-4">
        <div className="w-40 h-40 shrink-0">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data} dataKey="value" nameKey="name"
                innerRadius={46} outerRadius={70} paddingAngle={2}
              >
                {data.map((d) => (
                  <Cell key={d.key} fill={BEHAVIOR_COLOR[d.key]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="flex-1 space-y-2 text-sm">
          {data.map((d) => (
            <li key={d.key} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-sm"
                style={{ background: BEHAVIOR_COLOR[d.key] }}
                aria-hidden="true"
              />
              <span className="font-semibold">{d.name}</span>
              <span className="ml-auto text-ink-mute">
                {d.value} · {total ? Math.round((d.value / total) * 100) : 0}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

export function CycleMixCard({ logs }: { logs: BehaviorLog[] }) {
  const data = cycleMix(logs).map((d) => ({
    name: `Cycle ${d.cycle}`,
    Fight: d.fight,
    Flight: d.flight,
    Freeze: d.freeze,
    Regulated: d.regulated,
  }));
  return (
    <Card>
      <SectionTitle kicker="9-week cycles">Behavior per cycle</SectionTitle>
      <div className="h-64">
        <ResponsiveContainer>
          <BarChart data={data} barCategoryGap={28}>
            <CartesianGrid stroke="#eadfca" strokeDasharray="2 4" vertical={false} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="Regulated" fill="var(--teal)" radius={[8, 8, 0, 0]} />
            <Bar dataKey="Fight" fill="var(--coral)" radius={[8, 8, 0, 0]} />
            <Bar dataKey="Flight" fill="var(--peach)" radius={[8, 8, 0, 0]} />
            <Bar dataKey="Freeze" fill="var(--navy)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export function WeeklyTrendCard({ logs }: { logs: BehaviorLog[] }) {
  const data = weeklyTrend(logs);
  return (
    <Card>
      <SectionTitle kicker="36-week trend">Weekly rhythm</SectionTitle>
      <div className="h-56">
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid stroke="#eadfca" strokeDasharray="2 4" vertical={false} />
            <XAxis
              dataKey="label" tickLine={false} axisLine={false}
              interval={5} fontSize={11}
            />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip />
            <Line type="monotone" dataKey="regulated" stroke="var(--teal)" strokeWidth={2.5} dot={false} name="Regulated" />
            <Line type="monotone" dataKey="fight" stroke="var(--coral)" strokeWidth={2} dot={false} name="Fight" />
            <Line type="monotone" dataKey="flight" stroke="var(--peach)" strokeWidth={2} dot={false} name="Flight" />
            <Line type="monotone" dataKey="freeze" stroke="var(--navy)" strokeWidth={2} dot={false} name="Freeze" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export function ContextHeatCard({ logs }: { logs: BehaviorLog[] }) {
  const data = contextHeat(logs);
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <Card>
      <SectionTitle kicker="Where it shows up">Context mix</SectionTitle>
      <ul className="space-y-2">
        {data.map((d) => (
          <li key={d.context} className="flex items-center gap-3 text-sm">
            <span className="w-20 capitalize font-semibold shrink-0">{d.context}</span>
            <div className="flex-1 h-3 rounded-full bg-cream overflow-hidden relative">
              <div
                className="h-full bg-teal/80"
                style={{ width: `${(d.count / max) * 100}%` }}
              />
              <div
                className="absolute inset-y-0 left-0 h-full bg-coral/60"
                style={{ width: `${((d.count - d.count * d.regulatedShare) / max) * 100}%` }}
                aria-hidden="true"
              />
            </div>
            <span className="w-16 text-right text-ink-mute">{d.count}</span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-ink-mute mt-3">
        Teal = regulated share of context. Coral = other behaviors.
      </p>
    </Card>
  );
}

export function HourHeatmapCard({ logs }: { logs: BehaviorLog[] }) {
  const data = hourHeatmap(logs);
  const max = Math.max(1, ...data.map((d) => d.total));
  return (
    <Card>
      <SectionTitle kicker="Time of day">When moments happen</SectionTitle>
      <div className="grid grid-cols-11 gap-1">
        {data.map((h) => {
          const intensity = h.total / max;
          const regShare = h.total ? h.regulated / h.total : 0;
          return (
            <div key={h.hour} className="text-center">
              <div
                className="aspect-square rounded-lg flex items-end justify-center text-[10px] font-bold"
                style={{
                  background: `color-mix(in oklab, var(--teal) ${Math.round(regShare * 100)}%, var(--coral) ${Math.round((1 - regShare) * 100)}%)`,
                  opacity: 0.25 + intensity * 0.75,
                  color: intensity > 0.5 ? "white" : "var(--ink)",
                }}
                title={`${h.label}: ${h.total} moments, ${Math.round(regShare*100)}% regulated`}
              >
                {h.total}
              </div>
              <div className="text-[10px] text-ink-mute mt-0.5">{h.hour}</div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
