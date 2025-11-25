import React from 'react';

type Props = {
  percent: number; // 0..1
  size?: number;
  strokeWidth?: number;
  className?: string;
  showLabel?: boolean;
};

export default function ProgressCircle({ percent, size = 44, strokeWidth = 4, className, showLabel = false }: Props) {
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, percent));
  const dashoffset = c * (1 - clamped);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={className}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke="var(--muted-foreground)"
        strokeWidth={strokeWidth}
        fill="none"
        className="opacity-20"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke="var(--primary)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={c}
        strokeDashoffset={dashoffset}
        style={{ transition: 'stroke-dashoffset 350ms ease' }}
      />
      {showLabel && (
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize={12} fill="currentColor">
          {Math.round(clamped * 100)}%
        </text>
      )}
    </svg>
  );
}