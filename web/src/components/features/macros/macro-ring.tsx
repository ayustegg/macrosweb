"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  value: number;
  target: number;
  color: string;
  label: string;
  unit: string;
  size?: number;
}

function computeStatus(value: number, target: number) {
  if (target <= 0) return "green";
  const ratio = value / target;
  if (ratio <= 1) return "green";
  if (ratio <= 1.1) return "amber";
  return "red";
}

const STATUS_COLORS = {
  green: { stroke: "#22c55e", track: "#bbf7d0" },
  amber: { stroke: "#f59e0b", track: "#fde68a" },
  red: { stroke: "#ef4444", track: "#fecaca" },
} as const;

export function MacroRing({
  value,
  target,
  color,
  label,
  unit,
  size = 120,
}: Props) {
  const radius = 50;
  const viewBox = 120;
  const circumference = 2 * Math.PI * radius;
  const ratio = target > 0 ? Math.min(value / target, 1) : 0;
  const offset = circumference * (1 - ratio);
  const [animatedOffset, setAnimatedOffset] = useState(circumference);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      requestAnimationFrame(() => {
        setAnimatedOffset(offset);
      });
    } else {
      setAnimatedOffset(offset);
    }
  }, [offset]);

  const status = computeStatus(value, target);
  const c = STATUS_COLORS[status];
  const displayValue = Math.round(value);
  const ariaLabel = `${displayValue} de ${Math.round(target)} ${unit}${label ? `, ${label}` : ""}`;

  return (
    <svg
      className="shrink-0"
      width={size}
      height={size}
      viewBox={`0 0 ${viewBox} ${viewBox}`}
      role="img"
      aria-label={ariaLabel}
    >
      {/* Track circle */}
      <circle
        cx={viewBox / 2}
        cy={viewBox / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={10}
        opacity={0.2}
      />

      {/* Progress arc */}
      <circle
        cx={viewBox / 2}
        cy={viewBox / 2}
        r={radius}
        fill="none"
        stroke={c.stroke}
        strokeWidth={10}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={animatedOffset}
        transform={`rotate(-90 ${viewBox / 2} ${viewBox / 2})`}
        style={{
          transition: "stroke-dashoffset 300ms ease-out",
        }}
      />

      {/* Value text */}
      <text
        x={viewBox / 2}
        y={viewBox / 2 - 6}
        textAnchor="middle"
        className="fill-foreground"
        style={{
          fontSize: "28px",
          fontWeight: 700,
          fontVariationSettings: "'wght' 700",
        }}
      >
        {displayValue}
      </text>

      {/* Target text */}
      <text
        x={viewBox / 2}
        y={viewBox / 2 + 16}
        textAnchor="middle"
        className="fill-muted-foreground"
        style={{ fontSize: "12px" }}
      >
        / {Math.round(target)} {unit}
      </text>
    </svg>
  );
}
