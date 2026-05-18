"use client";

import Link from "next/link";
import { MultiMacroRing } from "@/components/features/macros/multi-macro-ring";

interface Summary {
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

interface Goal {
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

interface Props {
  summary: Summary;
  goal: Goal | null;
}

const LEGENDS = [
  { key: "protein_g" as const, label: "Proteína", color: "var(--macro-pro)", track: "var(--macro-pro-tint)" },
  { key: "carbs_g" as const, label: "Carbohidratos", color: "var(--macro-car)", track: "var(--macro-car-tint)" },
  { key: "fat_g" as const, label: "Grasa", color: "var(--macro-fat)", track: "var(--macro-fat-tint)" },
];

export function DailyMacroSummary({ summary, goal }: Props) {
  if (!goal) {
    return (
      <SummaryCard className="px-4 py-6 text-center">
        <p className="text-muted-foreground text-sm">
          <Link
            href="/profile"
            className="text-foreground font-semibold underline underline-offset-2"
          >
            Configura tu objetivo
          </Link>
        </p>
      </SummaryCard>
    );
  }

  const remaining = Math.max(0, goal.kcal - summary.kcal);
  const fmt = (n: number) => Math.round(n).toLocaleString("es-ES");

  return (
    <SummaryCard className="px-[18px] pt-[22px] pb-4">
      <div className="relative mx-auto flex justify-center" style={{ width: 212, height: 212 }}>
        <MultiMacroRing totals={summary} target={goal} size={212} />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="mb-1.5 text-[9.5px] font-medium tracking-widest text-muted-foreground uppercase">
            Calorías
          </span>
          <span className="num text-[38px] leading-none font-bold tracking-tight text-foreground">
            {fmt(summary.kcal)}
          </span>
          <span className="num mt-1 text-[11px] text-muted-foreground">
            / {fmt(goal.kcal)} kcal
          </span>
        </div>
      </div>

      <div className="mt-1.5 flex justify-center gap-1.5 text-xs text-muted-foreground">
        <span>Restante</span>
        <span className="num font-semibold text-foreground">{fmt(remaining)} kcal</span>
      </div>

      <div className="mt-[18px] grid gap-3 border-t border-border/80 pt-4">
        {LEGENDS.map(({ key, label, color, track }) => (
          <MacroLegend
            key={key}
            label={label}
            value={summary[key]}
            target={goal[key]}
            color={color}
            track={track}
          />
        ))}
      </div>
    </SummaryCard>
  );
}

function MacroLegend({
  label,
  value,
  target,
  color,
  track,
}: {
  label: string;
  value: number;
  target: number;
  color: string;
  track: string;
}) {
  const pct = Math.max(0, Math.min(1, value / (target || 1)));
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-accent-foreground">
          <span className="size-[7px] rounded-sm" style={{ background: color }} />
          {label}
        </span>
        <span className="num text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{Math.round(value)}</span>
          <span className="mx-1">/</span>
          {target} g
        </span>
      </div>
      <div
        className="h-[5px] overflow-hidden rounded-full"
        style={{ background: track }}
      >
        <div
          className="h-full rounded-full transition-[width] duration-500 ease-out"
          style={{ width: `${pct * 100}%`, background: color }}
        />
      </div>
    </div>
  );
}

function SummaryCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[22px] border border-border bg-card shadow-app-1 ${className}`}
    >
      {children}
    </div>
  );
}
