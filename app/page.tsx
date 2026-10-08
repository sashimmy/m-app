"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROLE_HOME, useRole } from "@/lib/role-context";

export default function RootPage() {
  const router = useRouter();
  const { role } = useRole();
  useEffect(() => {
    router.replace(ROLE_HOME[role]);
  }, [role, router]);
  return (
    <div className="p-8 text-ink-mute">Loading…</div>
  );
}
