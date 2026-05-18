"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { MultiMacroRing } from "@/components/features/macros/multi-macro-ring";
import {
  COLLAPSE_GRID,
  COLLAPSE_INNER,
  collapseInnerClass,
} from "@/lib/collapse-transition";
import { cn } from "@/lib/utils";

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

const COMPACT_RING = 52;
const EXPANDED_RING = 200;

const COMPACT_MACROS = [
  {
    key: "kcal" as const,
    short: "kcal",
    color: "var(--macro-kcal)",
    track: "var(--macro-kcal-tint)",
  },
  {
    key: "protein_g" as const,
    short: "P",
    color: "var(--macro-pro)",
    track: "var(--macro-pro-tint)",
  },
  {
    key: "carbs_g" as const,
    short: "C",
    color: "var(--macro-car)",
    track: "var(--macro-car-tint)",
  },
  {
    key: "fat_g" as const,
    short: "G",
    color: "var(--macro-fat)",
    track: "var(--macro-fat-tint)",
  },
] as const;

const LEGENDS = [
  {
    key: "protein_g" as const,
    label: "Proteína",
    color: "var(--macro-pro)",
    track: "var(--macro-pro-tint)",
  },
  {
    key: "carbs_g" as const,
    label: "Carbohidratos",
    color: "var(--macro-car)",
    track: "var(--macro-car-tint)",
  },
  {
    key: "fat_g" as const,
    label: "Grasa",
    color: "var(--macro-fat)",
    track: "var(--macro-fat-tint)",
  },
] as const;

export function DailyMacroSummary({ summary, goal }: Props) {
  const [expanded, setExpanded] = useState(false);

  if (!goal) {
    return (
      <SummaryCard className="px-4 py-4 text-center">
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
  const kcalPct = Math.min(100, Math.round((summary.kcal / goal.kcal) * 100));

  return (
    <SummaryCard className="overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((o) => !o)}
        className="hover:bg-muted/40 flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors outline-none"
        aria-expanded={expanded}
        aria-label={
          expanded ? "Ocultar detalle de macros" : "Ver detalle de macros"
        }
      >
        <div
          className="shrink-0"
          style={{ width: COMPACT_RING, height: COMPACT_RING }}
        >
          <MultiMacroRing
            totals={summary}
            target={goal}
            size={COMPACT_RING}
            compact
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-1">
            <span className="num text-foreground text-[22px] leading-none font-bold tracking-tight">
              {fmt(summary.kcal)}
            </span>
            <span className="text-muted-foreground num pb-0.5 text-xs font-medium">
              / {fmt(goal.kcal)} kcal
            </span>
          </div>
          <p className="text-muted-foreground mt-1 flex flex-wrap items-baseline gap-x-1.5 text-xs">
            <span>
              <span className="num text-foreground font-semibold">
                {fmt(remaining)}
              </span>{" "}
              kcal restantes
            </span>
            <span className="text-muted-foreground/80 num text-[11px] font-medium">
              · {kcalPct}% del objetivo
            </span>
          </p>
          <div
            className="mt-2 h-1 overflow-hidden rounded-full"
            style={{ background: "var(--macro-kcal-tint)" }}
          >
            <div
              className="h-full rounded-full transition-[width] duration-500 ease-out"
              style={{
                width: `${kcalPct}%`,
                background: "var(--macro-kcal)",
              }}
            />
          </div>
          <div className="mt-2 grid grid-cols-4 gap-1">
            {COMPACT_MACROS.map(({ key, short, color }) => (
              <MacroChip
                key={key}
                short={short}
                value={summary[key]}
                target={goal[key]}
                color={color}
                isKcal={key === "kcal"}
              />
            ))}
          </div>
        </div>

        <ChevronDown
          className={cn(
            "text-muted-foreground size-5 shrink-0 transition-transform duration-350 ease-[cubic-bezier(0.32,0.72,0,1)]",
            expanded && "rotate-180"
          )}
          aria-hidden
        />
      </button>

      <div
        className={cn(
          COLLAPSE_GRID,
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className={cn(COLLAPSE_INNER, collapseInnerClass(expanded))}>
          <div className="border-border border-t px-[18px] pt-4 pb-4">
            <div
              className="relative mx-auto flex justify-center"
              style={{ width: EXPANDED_RING, height: EXPANDED_RING }}
            >
              <MultiMacroRing
                totals={summary}
                target={goal}
                size={EXPANDED_RING}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-muted-foreground mb-1 text-[9.5px] font-medium tracking-widest uppercase">
                  Calorías
                </span>
                <span className="num text-foreground text-[34px] leading-none font-bold tracking-tight">
                  {fmt(summary.kcal)}
                </span>
              </div>
            </div>

            <div className="text-muted-foreground mt-3 flex justify-center gap-1.5 text-xs">
              <span>Restante</span>
              <span className="num text-foreground font-semibold">
                {fmt(remaining)} kcal
              </span>
            </div>

            <div className="border-border/80 mt-4 grid gap-3 border-t pt-4">
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
          </div>
        </div>
      </div>
    </SummaryCard>
  );
}

function MacroChip({
  short,
  value,
  target,
  color,
  isKcal = false,
}: {
  short: string;
  value: number;
  target: number;
  color: string;
  isKcal?: boolean;
}) {
  const pct = Math.min(100, Math.round((value / (target || 1)) * 100));
  const unit = isKcal ? "" : "g";

  return (
    <span className="bg-muted/50 border-border/60 flex min-w-0 flex-col items-center gap-0.5 rounded-md border px-1 py-1">
      <span className="inline-flex items-center gap-0.5">
        <span
          className="size-1.5 shrink-0 rounded-full"
          style={{ background: color }}
          aria-hidden
        />
        <span className="text-muted-foreground text-[9px] font-semibold tracking-wide uppercase">
          {short}
        </span>
      </span>
      <span className="num text-foreground text-[11px] leading-none font-bold">
        {isKcal ? Math.round(value).toLocaleString("es-ES") : Math.round(value)}
        {unit}
      </span>
      <span className="text-muted-foreground/70 num text-[9px] leading-none">
        {pct}%
      </span>
    </span>
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
        <span className="text-accent-foreground inline-flex items-center gap-1.5 text-[12.5px] font-semibold">
          <span
            className="size-[7px] rounded-sm"
            style={{ background: color }}
          />
          {label}
        </span>
        <span className="num text-muted-foreground text-xs">
          <span className="text-foreground font-semibold">
            {Math.round(value)}
          </span>
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
    <section
      className={cn(
        "border-border bg-card shadow-app-1 rounded-[22px] border",
        className
      )}
    >
      {children}
    </section>
  );
}
