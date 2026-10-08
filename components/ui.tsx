"use client";
import { cn } from "@/lib/utils";
import type { HTMLAttributes, ButtonHTMLAttributes } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn(
        "card bg-white rounded-2xl shadow-[0_2px_12px_rgba(31,45,51,0.04)] border border-line p-5",
        className
      )}
    />
  );
}

export function SectionTitle({
  children, kicker, className,
}: { children: React.ReactNode; kicker?: string; className?: string }) {
  return (
    <div className={cn("flex items-end justify-between mb-3", className)}>
      <div>
        {kicker && <div className="text-[11px] font-bold uppercase tracking-wider text-teal-dark">{kicker}</div>}
        <h2 className="text-xl font-bold font-display">{children}</h2>
      </div>
    </div>
  );
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "coral";
  size?: "sm" | "md" | "lg";
};

export function Button({
  variant = "primary", size = "md", className, ...props
}: BtnProps) {
  const base = "inline-flex items-center justify-center gap-2 font-bold rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
  };
  const variants = {
    primary: "bg-teal text-white hover:bg-teal-dark shadow-sm",
    secondary: "bg-white border border-line text-ink hover:bg-teal-50",
    coral: "bg-coral text-white hover:bg-coral/90 shadow-sm",
    ghost: "text-teal-dark hover:bg-teal-50",
  };
  return <button {...props} className={cn(base, sizes[size], variants[variant], className)} />;
}

export function Chip({
  children, color = "teal", className, onClick, active,
}: {
  children: React.ReactNode;
  color?: "teal" | "peach" | "coral" | "navy" | "neutral";
  className?: string;
  onClick?: () => void;
  active?: boolean;
}) {
  const colors = {
    teal: "bg-teal-50 text-teal-dark border-teal/20",
    peach: "bg-peach-50 text-coral border-peach/40",
    coral: "bg-coral-50 text-coral border-coral/30",
    navy: "bg-navy-50 text-navy border-navy/20",
    neutral: "bg-white text-ink-soft border-line",
  }[color];
  const activeCls = active ? "ring-2 ring-teal/60 ring-offset-2 ring-offset-cream" : "";
  const Comp = onClick ? "button" : "span";
  return (
    <Comp
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border",
        colors, activeCls, onClick && "hover:brightness-95", className
      )}
    >
      {children}
    </Comp>
  );
}

export function Stat({
  label, value, hint, tone = "default",
}: {
  label: string; value: React.ReactNode; hint?: React.ReactNode;
  tone?: "default" | "good" | "warn";
}) {
  const toneCls = {
    default: "text-ink",
    good: "text-teal-dark",
    warn: "text-coral",
  }[tone];
  return (
    <Card className="p-4">
      <div className="text-xs font-semibold text-ink-mute uppercase tracking-wider">{label}</div>
      <div className={cn("text-3xl font-bold font-display mt-1", toneCls)}>{value}</div>
      {hint && <div className="text-xs text-ink-soft mt-1">{hint}</div>}
    </Card>
  );
}

export function Avatar({
  firstName, lastInitial, hue = 200, size = 40,
}: { firstName: string; lastInitial: string; hue?: number; size?: number }) {
  const bg = `hsl(${hue}, 60%, 85%)`;
  const fg = `hsl(${hue}, 60%, 28%)`;
  return (
    <div
      aria-hidden="true"
      className="rounded-full flex items-center justify-center font-bold font-display shrink-0"
      style={{ background: bg, color: fg, width: size, height: size, fontSize: size * 0.42 }}
    >
      {firstName[0]}{lastInitial}
    </div>
  );
}

export function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  return (
    <div
      role="status"
      className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 bg-ink text-white px-4 py-3 rounded-full shadow-xl z-50 text-sm font-semibold flex items-center gap-2 animate-in"
      onAnimationEnd={() => setTimeout(onDone, 1600)}
    >
      {message}
    </div>
  );
}
