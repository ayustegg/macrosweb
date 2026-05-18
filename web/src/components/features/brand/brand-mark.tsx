interface Props {
  size?: number;
}

/** Four-color segmented ring — app logo from the prototype. */
export function BrandMark({ size = 28 }: Props) {
  const stroke = Math.max(3, size * 0.18);
  const r = size / 2 - stroke / 2;
  const circumference = 2 * Math.PI * r;
  const seg = circumference / 4;
  const gap = Math.max(2, circumference * 0.012);
  const colors = [
    "var(--macro-kcal)",
    "var(--macro-pro)",
    "var(--macro-car)",
    "var(--macro-fat)",
  ];

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="block shrink-0"
      aria-hidden
    >
      <g transform={`rotate(-45 ${size / 2} ${size / 2})`}>
        {colors.map((c, i) => (
          <circle
            key={c}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={c}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${seg - gap} ${circumference - seg + gap}`}
            strokeDashoffset={-seg * i}
          />
        ))}
      </g>
    </svg>
  );
}
