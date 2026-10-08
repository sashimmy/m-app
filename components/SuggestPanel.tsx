"use client";

import { useState } from "react";
import { Sparkles, ThumbsUp, ThumbsDown, Check } from "lucide-react";
import { Button, Card, SectionTitle, Chip } from "@/components/ui";
import type { Suggestion } from "@/lib/types";
import { useData } from "@/lib/data-context";

interface Props {
  mode: "student" | "group";
  payload: Record<string, unknown>;
  subjectId: string; // studentId or groupId
}

export function SuggestPanel({ mode, payload, subjectId }: Props) {
  const { addFeedback } = useData();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [source, setSource] = useState<"ai" | "fallback" | null>(null);

  async function run() {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/suggest", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mode, payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Could not get suggestions");
      setSuggestions(data.suggestions);
      setSource(data.source);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="bg-gradient-to-br from-white to-teal-50">
      <SectionTitle kicker="Ideas to try">
        {mode === "student" ? "Supportive strategies" : "Group climate ideas"}
      </SectionTitle>

      {suggestions.length === 0 && !loading && (
        <div className="text-sm text-ink-soft">
          <p className="mb-4">
            Based on de-identified data only (age band, group, behavior counts, contexts, strengths). Framed as supportive strategies, never diagnoses.
          </p>
          <Button onClick={run} variant="primary">
            <Sparkles size={16} /> Suggest ideas
          </Button>
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-teal-dark text-sm">
          <Sparkles className="animate-pulse" size={18} /> Thinking of a few supportive ideas…
        </div>
      )}

      {error && (
        <div className="text-sm text-coral bg-coral-50 border border-coral/20 rounded-xl p-3 mb-3">
          {error}
          <div className="mt-2">
            <Button size="sm" variant="secondary" onClick={run}>Try again</Button>
          </div>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="space-y-3">
          {source === "fallback" && (
            <div className="text-xs text-ink-mute bg-peach-50 border border-peach/40 rounded-xl p-2 px-3">
              Showing offline fallback ideas. Set <code>ANTHROPIC_API_KEY</code> to enable live suggestions.
            </div>
          )}
          {suggestions.map((s, i) => (
            <SuggestionCard
              key={i} s={s}
              onFeedback={(outcome) => {
                addFeedback({
                  title: s.title,
                  outcome,
                  studentId: mode === "student" ? subjectId : undefined,
                  groupId: mode === "group" ? subjectId : undefined,
                });
              }}
            />
          ))}
          <p className="text-[11px] text-ink-mute leading-snug pt-2">
            Ideas to try, not clinical advice. Use professional judgment. If you have any concern about harm, contact a counselor or appropriate professional right away.
          </p>
        </div>
      )}
    </Card>
  );
}

function SuggestionCard({
  s, onFeedback,
}: { s: Suggestion; onFeedback: (o: "helpful" | "not-helpful" | "tried") => void }) {
  const [marked, setMarked] = useState<string | null>(null);
  return (
    <div className="bg-white rounded-2xl border border-line p-4">
      <div className="flex items-center justify-between gap-2">
        <h4 className="font-bold font-display text-lg">{s.title}</h4>
        <Chip color="peach">{s.whoCanHelp}</Chip>
      </div>
      <p className="text-sm text-ink-soft mt-1.5">{s.why}</p>
      <ol className="mt-3 space-y-1.5 text-sm list-decimal pl-5">
        {s.steps.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ol>
      <div className="mt-4 flex items-center gap-2">
        <FeedbackBtn label="Helpful" icon={<ThumbsUp size={14} />}
          onClick={() => { onFeedback("helpful"); setMarked("helpful"); }}
          active={marked === "helpful"} />
        <FeedbackBtn label="Not helpful" icon={<ThumbsDown size={14} />}
          onClick={() => { onFeedback("not-helpful"); setMarked("not-helpful"); }}
          active={marked === "not-helpful"} />
        <FeedbackBtn label="Tried it" icon={<Check size={14} />}
          onClick={() => { onFeedback("tried"); setMarked("tried"); }}
          active={marked === "tried"} />
      </div>
    </div>
  );
}

function FeedbackBtn({
  label, icon, onClick, active,
}: { label: string; icon: React.ReactNode; onClick: () => void; active: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 h-8 rounded-full text-xs font-semibold border transition-colors ${
        active ? "bg-teal text-white border-teal" : "bg-white text-ink-soft border-line hover:bg-teal-50"
      }`}
    >
      {icon} {label}
    </button>
  );
}
