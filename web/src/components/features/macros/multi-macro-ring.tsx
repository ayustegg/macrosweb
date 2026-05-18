"use client";

import { useEffect, useState } from "react";

interface MacroTotals {
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

interface Props {
  totals: MacroTotals;
  target: MacroTotals;
  size?: number;
  compact?: boolean;
  /** Animate rings filling from empty on mount / replay. */
  animateIn?: boolean;
  /** Change to re-run fill animation (e.g. after pull-to-refresh). */
  replayKey?: number;
  /** 0–1 while pulling — scales ring fill as a live preview. */
  previewProgress?: number;
  fillMs?: number;
  staggerMs?: number;
}

const RINGS = [
  {
    key: "kcal" as const,
    color: "var(--macro-kcal)",
    track: "var(--macro-kcal-tint)",
  },
  {
    key: "protein_g" as const,
    color: "var(--macro-pro)",
    track: "var(--macro-pro-tint)",
  },
  {
    key: "carbs_g" as const,
    color: "var(--macro-car)",
    track: "var(--macro-car-tint)",
  },
  {
    key: "fat_g" as const,
    color: "var(--macro-fat)",
    track: "var(--macro-fat-tint)",
  },
] as const;

const RING_FILL_MS = 920;
const PULL_REPLAY_FILL_MS = 720;
const RING_STAGGER_MS = 110;
const RING_FILL_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Four concentric Apple Watch–style rings: kcal → protein → carbs → fat. */
export function MultiMacroRing({
  totals,
  target,
  size = 212,
  compact = false,
  animateIn = false,
  replayKey = 0,
  previewProgress,
  fillMs: fillMsProp,
  staggerMs: staggerMsProp,
}: Props) {
  const shouldAnimate = animateIn && !prefersReducedMotion();
  const [filled, setFilled] = useState(() => !shouldAnimate);
  const fillMs =
    fillMsProp ?? (replayKey > 0 ? PULL_REPLAY_FILL_MS : RING_FILL_MS);
  const staggerMs = staggerMsProp ?? RING_STAGGER_MS;
  const isPreview = previewProgress !== undefined;

  useEffect(() => {
    if (!shouldAnimate) return;

    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setFilled(true));
    });

    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [shouldAnimate, replayKey]);

  const cx = size / 2;
  const cy = size / 2;
  const ringCount = RINGS.length;

  const maxR = cx - (compact ? 2 : 6);
  const minR = compact ? 5 : 28;
  const step = (maxR - minR) / (ringCount - 1);

  const stroke = compact ? Math.max(3.5, Math.min(5, step * 0.72)) : 11;
  const gap = compact ? 1.5 : 4;

  const radiusForRing = (i: number) =>
    compact ? maxR - i * step : cx - stroke / 2 - i * (stroke + gap);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="block"
      role="img"
      aria-label="Progreso de macros del día"
      aria-busy={shouldAnimate && !filled}
    >
      {RINGS.map(({ key, color, track }, i) => {
        const v = totals[key];
        const t = target[key] || 1;
        const r = radiusForRing(i);
        if (r < stroke / 2) return null;

        const C = 2 * Math.PI * r;
        const pct = Math.max(0, Math.min(1.6, v / t));
        const fillRatio = Math.min(pct, 1);

        let displayRatio = fillRatio;
        if (shouldAnimate && !filled) {
          displayRatio = 0;
        } else if (isPreview) {
          displayRatio = fillRatio * previewProgress;
        }

        const targetOffset = C * (1 - displayRatio);
        const delay = shouldAnimate ? i * staggerMs : 0;
        const over = pct > 1 && !isPreview && (!shouldAnimate || filled);
        const overDelay = delay + fillMs;

        return (
          <g key={key} transform={`rotate(-90 ${cx} ${cy})`}>
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={track}
              strokeWidth={stroke}
            />
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={color}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={targetOffset}
              style={{
                transition: shouldAnimate
                  ? `stroke-dashoffset ${fillMs}ms ${RING_FILL_EASING} ${delay}ms`
                  : isPreview
                    ? "stroke-dashoffset 0.14s ease-out"
                    : undefined,
              }}
            />
            {over && (
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={color}
                strokeWidth={stroke}
                strokeLinecap="round"
                opacity={0.5}
                strokeDasharray={C}
                strokeDashoffset={C * (2 - pct)}
                style={{
                  transition: shouldAnimate
                    ? `stroke-dashoffset ${fillMs * 0.65}ms ${RING_FILL_EASING} ${overDelay}ms`
                    : undefined,
                }}
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}
