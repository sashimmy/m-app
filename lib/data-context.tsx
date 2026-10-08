"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { seedLogs } from "@/data/seed";
import type { BehaviorLog, InterventionFeedback } from "@/lib/types";

interface DataCtx {
  logs: BehaviorLog[];
  addLog: (l: Omit<BehaviorLog, "id">) => void;
  feedback: InterventionFeedback[];
  addFeedback: (f: Omit<InterventionFeedback, "id" | "at">) => void;
  reset: () => void;
}

const Ctx = createContext<DataCtx | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [logs, setLogs] = useState<BehaviorLog[]>(seedLogs);
  const [feedback, setFeedback] = useState<InterventionFeedback[]>([]);

  // Hydrate extras from localStorage
  useEffect(() => {
    try {
      const extraRaw = localStorage.getItem("mapp:logs");
      const fbRaw = localStorage.getItem("mapp:feedback");
      if (extraRaw) {
        const extra: BehaviorLog[] = JSON.parse(extraRaw);
        setLogs([...seedLogs, ...extra]);
      }
      if (fbRaw) setFeedback(JSON.parse(fbRaw));
    } catch {}
  }, []);

  function persistExtra(all: BehaviorLog[]) {
    const seedIds = new Set(seedLogs.map((l) => l.id));
    const extras = all.filter((l) => !seedIds.has(l.id));
    try { localStorage.setItem("mapp:logs", JSON.stringify(extras)); } catch {}
  }

  function addLog(l: Omit<BehaviorLog, "id">) {
    const entry: BehaviorLog = { ...l, id: `l-user-${Date.now()}` };
    const next = [...logs, entry];
    setLogs(next);
    persistExtra(next);
  }

  function addFeedback(f: Omit<InterventionFeedback, "id" | "at">) {
    const entry: InterventionFeedback = {
      ...f,
      id: `fb-${Date.now()}`,
      at: new Date().toISOString(),
    };
    const next = [...feedback, entry];
    setFeedback(next);
    try { localStorage.setItem("mapp:feedback", JSON.stringify(next)); } catch {}
  }

  function reset() {
    setLogs(seedLogs);
    setFeedback([]);
    try {
      localStorage.removeItem("mapp:logs");
      localStorage.removeItem("mapp:feedback");
    } catch {}
  }

  return (
    <Ctx.Provider value={{ logs, addLog, feedback, addFeedback, reset }}>
      {children}
    </Ctx.Provider>
  );
}

export function useData() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useData outside provider");
  return v;
}
