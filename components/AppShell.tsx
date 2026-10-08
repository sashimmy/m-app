"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home, Users, LineChart, Baby, HeartHandshake, ChevronDown, Plus,
} from "lucide-react";
import { useEffect, useState } from "react";
import { ROLE_HOME, ROLE_LABEL, useRole } from "@/lib/role-context";
import type { Role } from "@/lib/types";
import { Logo } from "@/components/Logo";
import { QuickLogSheet } from "@/components/QuickLogSheet";
import { cn } from "@/lib/utils";

const NAV_BY_ROLE: Record<Role, { href: string; label: string; icon: React.ElementType }[]> = {
  teacher: [
    { href: "/teacher", label: "Home", icon: Home },
    { href: "/students", label: "Students", icon: Users },
    { href: "/groups/A", label: "My group", icon: HeartHandshake },
  ],
  counselor: [
    { href: "/counselor", label: "Home", icon: Home },
    { href: "/students", label: "Students", icon: Users },
    { href: "/groups/A", label: "Groups", icon: HeartHandshake },
  ],
  director: [
    { href: "/director", label: "Home", icon: Home },
    { href: "/students", label: "Students", icon: Users },
    { href: "/groups/A", label: "Groups", icon: LineChart },
  ],
  parent: [
    { href: "/parent", label: "Home", icon: Home },
    { href: "/parent/child", label: "My child", icon: Baby },
  ],
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { role } = useRole();
  const [quickOpen, setQuickOpen] = useState(false);
  const nav = NAV_BY_ROLE[role];

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <div className="flex-1 flex">
        {/* Side nav on md+ */}
        <aside className="hidden md:flex w-56 shrink-0 border-r border-line bg-white/60 flex-col p-3 gap-1 sticky top-16 self-start h-[calc(100vh-4rem)]">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors",
                  active
                    ? "bg-teal text-white shadow-sm"
                    : "text-ink-soft hover:bg-teal-50"
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
          {role !== "parent" && (
            <button
              onClick={() => setQuickOpen(true)}
              className="mt-3 flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold bg-coral text-white hover:bg-coral/90 shadow-sm"
            >
              <Plus size={18} /> Quick Log
            </button>
          )}
          <div className="mt-auto text-[11px] text-ink-mute leading-snug px-2 pt-6">
            Ideas to try, not clinical advice.<br/>Use professional judgment.
          </div>
        </aside>
        <main className="flex-1 min-w-0 pb-28 md:pb-10">{children}</main>
      </div>

      {/* Bottom nav on mobile */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-line z-40">
        <div className="flex items-stretch justify-around relative">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex-1 flex flex-col items-center gap-0.5 py-2 text-xs",
                  active ? "text-teal font-bold" : "text-ink-mute"
                )}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            );
          })}
          {role !== "parent" && (
            <button
              onClick={() => setQuickOpen(true)}
              className="absolute -top-6 right-4 w-14 h-14 rounded-full bg-coral text-white flex items-center justify-center shadow-lg"
              aria-label="Quick Log"
            >
              <Plus size={26} />
            </button>
          )}
        </div>
      </nav>

      <QuickLogSheet open={quickOpen} onClose={() => setQuickOpen(false)} />
    </div>
  );
}

function TopBar() {
  const { role, setRole } = useRole();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const close = () => setOpen(false);
    if (open) document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);

  function pick(r: Role) {
    setRole(r);
    setOpen(false);
    router.push(ROLE_HOME[r]);
  }

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-line">
      <div className="h-16 px-4 md:px-6 flex items-center gap-3 max-w-[1400px] mx-auto">
        <Link href={ROLE_HOME[role]} className="flex items-center gap-2.5 font-display font-bold">
          <Logo />
          <span className="text-lg">M-app</span>
        </Link>
        <span className="hidden sm:inline-flex ml-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-peach-50 text-coral border border-peach/50">
          Demo data · do not enter real student info
        </span>

        <div className="ml-auto relative">
          <button
            onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
            className="flex items-center gap-2 pl-3 pr-2 h-10 rounded-full bg-teal-50 text-teal-dark font-semibold text-sm border border-teal/20 hover:bg-teal/10"
          >
            <span className="hidden xs:inline">Viewing as</span>
            <span className="font-bold">{ROLE_LABEL[role]}</span>
            <ChevronDown size={16} />
          </button>
          {open && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-line p-1.5 z-40"
            >
              {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
                <button
                  key={r}
                  onClick={() => pick(r)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-xl text-sm font-semibold hover:bg-teal-50",
                    r === role && "bg-teal-50 text-teal-dark"
                  )}
                >
                  {ROLE_LABEL[r]}
                  <div className="text-xs text-ink-mute font-normal">
                    {r === "teacher" && "Classroom view, Quick Log"}
                    {r === "counselor" && "Referral queue, full profiles"}
                    {r === "director" && "Org dashboard, outcomes"}
                    {r === "parent" && "Your child's growth"}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
