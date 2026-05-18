"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { MultiMacroRing } from "@/components/features/macros/multi-macro-ring";
import {
  COLLAPSE_GRID,
  COLLAPSE_INNER,
  collapseInnerClass,
} from "@/lib/collapse-transition";
import { COMPACT_MACRO_RING_PX } from "@/lib/macro-ring-layout";
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
  /** 0–1 while pull-to-refresh dragging/loading — previews kcal bar + rings. */
  pullPreviewProgress?: number;
}

const EXPANDED_RING = 200;
const COUNTUP_MS = 3000;
const EXPANDED_RING_FILL_MS = COUNTUP_MS;
const EXPANDED_RING_STAGGER_MS = 0;

function useCountUpOnChange(target: number, durationMs: number) {
  const [value, setValue] = useState(target);
  const frameRef = useRef<number | null>(null);
  const fromRef = useRef(target);
  const firstRef = useRef(true);

  useEffect(() => {
    if (firstRef.current) {
      firstRef.current = false;
      fromRef.current = target;
      setValue(target);
      return;
    }
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    const start = performance.now();
    const from = fromRef.current;
    const ease = (t: number) => 1 - Math.pow(1 - t, 10);
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const v = from + (target - from) * ease(t);
      setValue(v);
      fromRef.current = v;
      if (t < 1) frameRef.current = requestAnimationFrame(tick);
      else fromRef.current = target;
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [target, durationMs]);

  return value;
}

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
    key: "kcal" as const,
    label: "Calorías",
    unit: "kcal",
    color: "var(--macro-kcal)",
    track: "var(--macro-kcal-tint)",
  },
  {
    key: "protein_g" as const,
    label: "Proteína",
    unit: "g",
    color: "var(--macro-pro)",
    track: "var(--macro-pro-tint)",
  },
  {
    key: "carbs_g" as const,
    label: "Carbohidratos",
    unit: "g",
    color: "var(--macro-car)",
    track: "var(--macro-car-tint)",
  },
  {
    key: "fat_g" as const,
    label: "Grasa",
    unit: "g",
    color: "var(--macro-fat)",
    track: "var(--macro-fat-tint)",
  },
] as const;

export function DailyMacroSummary({
  summary,
  goal,
  pullPreviewProgress,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  const animatedKcal = useCountUpOnChange(summary.kcal, COUNTUP_MS);
  const animatedRemaining = useCountUpOnChange(
    Math.max(0, (goal?.kcal ?? 0) - summary.kcal),
    COUNTUP_MS
  );
  const animatedProtein = useCountUpOnChange(summary.protein_g, COUNTUP_MS);
  const animatedCarbs = useCountUpOnChange(summary.carbs_g, COUNTUP_MS);
  const animatedFat = useCountUpOnChange(summary.fat_g, COUNTUP_MS);
  const animatedValues: Record<(typeof COMPACT_MACROS)[number]["key"], number> =
    {
      kcal: animatedKcal,
      protein_g: animatedProtein,
      carbs_g: animatedCarbs,
      fat_g: animatedFat,
    };

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

  const fmt = (n: number) => Math.round(n).toLocaleString("es-ES");
  const kcalPct = Math.min(100, (animatedKcal / goal.kcal) * 100);
  const isPullPreview = pullPreviewProgress !== undefined;
  const displayKcalPct = isPullPreview
    ? kcalPct * pullPreviewProgress
    : kcalPct;
  return (
    <SummaryCard className="macro-summary-card overflow-hidden">
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
          className="macro-ring-slot shrink-0"
          style={{
            width: COMPACT_MACRO_RING_PX,
            height: COMPACT_MACRO_RING_PX,
          }}
        >
          <MultiMacroRing
            totals={summary}
            target={goal}
            size={COMPACT_MACRO_RING_PX}
            compact
            previewProgress={pullPreviewProgress}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-1">
            <span className="num text-foreground text-[22px] leading-none font-bold tracking-tight tabular-nums">
              {fmt(animatedKcal)}
            </span>
            <span className="text-muted-foreground num pb-0.5 text-xs font-medium">
              / {fmt(goal.kcal)} kcal
            </span>
          </div>
          <p className="text-muted-foreground mt-1 flex flex-wrap items-baseline gap-x-1.5 text-xs">
            <span>
              <span className="num text-foreground font-semibold tabular-nums">
                {fmt(animatedRemaining)}
              </span>{" "}
              kcal restantes
            </span>
            <span className="text-muted-foreground/80 num text-[11px] font-medium tabular-nums">
              · {Math.round((animatedKcal / goal.kcal) * 100)}% del objetivo
            </span>
          </p>
          <div
            className="mt-2 h-1 overflow-hidden rounded-full"
            style={{ background: "var(--macro-kcal-tint)" }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${displayKcalPct}%`,
                background: "var(--macro-kcal)",
                transition: isPullPreview ? "width 0.14s ease-out" : undefined,
              }}
            />
          </div>
          <div className="mt-2 grid grid-cols-4 gap-1">
            {COMPACT_MACROS.map(({ key, short, color }) => (
              <MacroChip
                key={key}
                short={short}
                value={animatedValues[key]}
                color={color}
                isKcal={key === "kcal"}
              />
            ))}
          </div>
        </div>

        <ChevronDown
          className={cn(
            "text-muted-foreground size-5 shrink-0 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]",
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
            <div className="flex items-center gap-5">
              <div
                className="shrink-0"
                style={{ width: EXPANDED_RING, height: EXPANDED_RING }}
              >
                <MultiMacroRing
                  key={expanded ? "expanded-open" : "expanded-closed"}
                  totals={summary}
                  target={goal}
                  size={EXPANDED_RING}
                  animateIn={expanded}
                  fillMs={EXPANDED_RING_FILL_MS}
                  staggerMs={EXPANDED_RING_STAGGER_MS}
                  previewProgress={pullPreviewProgress}
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-3">
                <div>
                  <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
                    Consumidas
                  </p>
                  <p className="num text-foreground mt-0.5 text-[22px] leading-none font-bold tracking-tight tabular-nums">
                    {fmt(animatedKcal)}
                    <span className="text-muted-foreground ml-1 text-[11px] font-medium">
                      kcal
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
                    Restantes
                  </p>
                  <p className="num text-foreground mt-0.5 text-[22px] leading-none font-bold tracking-tight tabular-nums">
                    {fmt(animatedRemaining)}
                    <span className="text-muted-foreground ml-1 text-[11px] font-medium">
                      kcal
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="border-border/80 mt-4 grid gap-3 border-t pt-4">
              {LEGENDS.map(({ key, label, unit, color, track }) => (
                <MacroLegend
                  key={key}
                  label={label}
                  value={summary[key]}
                  target={goal[key]}
                  unit={unit}
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
  color,
  isKcal = false,
}: {
  short: string;
  value: number;
  color: string;
  isKcal?: boolean;
}) {
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
      <span className="num text-foreground text-[11px] leading-none font-bold tabular-nums">
        {isKcal ? Math.round(value).toLocaleString("es-ES") : Math.round(value)}
        {unit}
      </span>
    </span>
  );
}

function MacroLegend({
  label,
  value,
  target,
  unit,
  color,
  track,
}: {
  label: string;
  value: number;
  target: number;
  unit: string;
  color: string;
  track: string;
}) {
  const animated = useCountUpOnChange(value, COUNTUP_MS);
  const pct = Math.max(0, Math.min(1, animated / (target || 1)));
  const fmtNum = (n: number) => Math.round(n).toLocaleString("es-ES");
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
          <span className="text-foreground font-semibold tabular-nums">
            {fmtNum(animated)}
          </span>
          <span className="mx-1">/</span>
          {fmtNum(target)} {unit}
        </span>
      </div>
      <div
        className="h-[5px] overflow-hidden rounded-full"
        style={{ background: track }}
      >
        <div
          className="h-full rounded-full"
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
