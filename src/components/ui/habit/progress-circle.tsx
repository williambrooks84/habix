import React from 'react';

type Props = {
  percent: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showLabel?: boolean;
  center?: React.ReactNode;
  title?: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
};

export default function ProgressCircle({ 
  percent, 
  size = 56, 
  strokeWidth = 4, 
  className, 
  showLabel = false, 
  center, 
  title, 
  subtitle 
}: Props) {
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, percent));
  const dashoffset = c * (1 - clamped);

  return (
    <div className={`inline-flex flex-col items-center ${className || ''}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            className="stroke-muted-foreground opacity-20 fill-none"
            strokeWidth={strokeWidth}
            transform={`rotate(90 ${size / 2} ${size / 2})`}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            className="stroke-primary fill-none stroke-linecap-round transition-all duration-350 ease-out"
            strokeWidth={strokeWidth}
            strokeDasharray={c}
            strokeDashoffset={dashoffset}
            transform={`rotate(90 ${size / 2} ${size / 2})`}
          />
        </svg>

        {center && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {center}
          </div>
        )}
        {showLabel && !center && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-xs font-medium">{Math.round(clamped * 100)}%</span>
          </div>
        )}
      </div>

      {(title || subtitle) && (
        <div className="mt-2 text-center">
          {title && <div className="text-sm font-medium">{title}</div>}
          {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
        </div>
      )}
    </div>
  );
}