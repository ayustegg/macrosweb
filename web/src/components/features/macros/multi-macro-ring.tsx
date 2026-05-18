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
];

/** Four concentric Apple Watch–style rings: kcal → protein → carbs → fat. */
export function MultiMacroRing({
  totals,
  target,
  size = 212,
  compact = false,
}: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const ringCount = RINGS.length;

  const maxR = cx - (compact ? 2 : 6);
  const minR = compact ? 5 : 28;
  const step = (maxR - minR) / (ringCount - 1);

  const stroke = compact ? Math.max(3.5, Math.min(5, step * 0.72)) : 11;
  const gap = compact ? 1.5 : 4;

  /** Even spacing so all 4 rings fit in compact (52px); fixed step overflows inner radii. */
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
    >
      {RINGS.map(({ key, color, track }, i) => {
        const v = totals[key];
        const t = target[key] || 1;
        const r = radiusForRing(i);
        if (r < stroke / 2) return null;
        const C = 2 * Math.PI * r;
        const pct = Math.max(0, Math.min(1.6, v / t));
        const dash = C * Math.min(pct, 1);
        const over = pct > 1;

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
              strokeDasharray={`${dash} ${C - dash + 1}`}
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
                strokeDasharray={`${C * (pct - 1)} ${C - C * (pct - 1) + 1}`}
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}
