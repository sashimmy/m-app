"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Role } from "@/lib/types";

interface RoleCtx {
  role: Role;
  setRole: (r: Role) => void;
  parentChildId: string; // which child the parent user represents
}

const Ctx = createContext<RoleCtx | null>(null);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<Role>("teacher");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("mapp:role") as Role | null;
      if (saved) setRoleState(saved);
    } catch {}
  }, []);

  function setRole(r: Role) {
    setRoleState(r);
    try { localStorage.setItem("mapp:role", r); } catch {}
  }

  return (
    <Ctx.Provider value={{ role, setRole, parentChildId: "s-1" }}>
      {children}
    </Ctx.Provider>
  );
}

export function useRole() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useRole outside provider");
  return v;
}

export const ROLE_LABEL: Record<Role, string> = {
  teacher: "Teacher",
  counselor: "Counselor",
  director: "Program Director",
  parent: "Parent",
};

export const ROLE_HOME: Record<Role, string> = {
  teacher: "/teacher",
  counselor: "/counselor",
  director: "/director",
  parent: "/parent",
};
