//Shadcn component

"use client";

import * as React from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ChartStat from "./chart-stat";
import { ChartTooltipContentProps } from "@/types/ui";
import { cn } from "@/app/lib/utils";

type ChartConfig = Record<string, { label: string; color: string }>;

function ChartContainer({ children, className }: React.PropsWithChildren<{ className?: string }>) {
  return (
    <figure
      className={cn("shadow-sm focus:outline-none focus:ring-0 focus:border-transparent", className)}
      onFocus={() => {
        try {
          const active = document.activeElement as HTMLElement | null;
          active?.blur();
        } catch {
          /* ignore */
        }
      }}
    >
      {children}
    </figure>
  );
}

function ChartTooltip(props: React.ComponentProps<typeof Tooltip>) {
  return <Tooltip cursor={false} {...props} />;
}

function ChartTooltipContent({
  active,
  payload,
  label,
  className,
  nameKey,
  valueFormatter,
  labelFormatter,
}: ChartTooltipContentProps) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  const value = item?.value;
  const name = item?.name ?? nameKey ?? "";
  return (
    <div className={cn("rounded-md border bg-background px-3 py-2 text-xs shadow-md", className)}>
      <div className="font-medium text-foreground">
        {labelFormatter ? labelFormatter(String(label)) : label}
      </div>
      <div className="text-muted-foreground">
        {(() => {
          if (valueFormatter) return valueFormatter(value, name);
          if (typeof value === "number") return `${value}% ce jour-là`;
          return value ?? null;
        })()}
      </div>
    </div>
  );
}

type CompletionPoint = {
  date: string;
  scheduled: number;
  completed: number;
  percentage: number;
};

const chartConfig = {
  completion: {
    label: "Taux de complétion",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export function ChartLineInteractive() {
  const [data, setData] = React.useState<CompletionPoint[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchData = React.useCallback(async () => {
    const controller = new AbortController();
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/habits/progress?days=7`, {
        credentials: "include",
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`Failed to load progress (${res.status})`);
      const json = await res.json();
      setData(Array.isArray(json?.days) ? json.days : []);
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      console.error("Failed to load completion chart", err);
      setError("Impossible de charger les données");
    } finally {
      setLoading(false);
    }
    return () => controller.abort();
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  React.useEffect(() => {
    const onChanged = (e: Event) => {
      try {
        fetchData();
      } catch (e) {
        /* ignore */
      }
    };
    window.addEventListener("habits:changed", onChanged as EventListener);
    return () => window.removeEventListener("habits:changed", onChanged as EventListener);
  }, [fetchData]);

  const latest = data.at(-1)?.percentage ?? 0;
  const average = data.length
    ? Number(
      (data.reduce((sum, item) => sum + item.percentage, 0) / data.length).toFixed(1)
    )
    : 0;

  function CustomDot(props: any) {
    const { cx, cy, payload, index } = props;
    if (cx == null || cy == null) return null;

    const total = data.length || 0;
    const maxLabels = total <= 7 ? total : 12;
    const step = total > maxLabels ? Math.ceil(total / maxLabels) : 1;
    const show = index % step === 0 || index === total - 1;
    if (!show) {
      return (
        <circle cx={cx} cy={cy} r={3} fill={chartConfig.completion.color} stroke="none" />
      );
    }

    const dateStr = (() => {
      try {
        return new Date(payload?.date).toLocaleDateString("fr-FR", {
          month: "short",
          day: "numeric",
        });
      } catch {
        return payload?.date ?? "";
      }
    })();

    const pct = typeof payload?.percentage === "number" ? `${payload.percentage.toFixed(0)}%` : "";

    return (
      <g>
        <circle cx={cx} cy={cy} r={3} fill={chartConfig.completion.color} stroke="none" />
        <text x={cx} y={cy - 10} fill={chartConfig.completion.color} fontSize={10} textAnchor="middle">
          {pct}
        </text>
        <text x={cx} y={cy + 20} fill="#8892a6" fontSize={9} textAnchor="middle">
          {dateStr}
        </text>
      </g>
    );
  }
  return (
    <article className="bg-background text-foreground py-4 sm:py-0" aria-labelledby="chart-heading">
      <h2 id="chart-heading" className="text-lg font-semibold text-foreground mb-3">Votre progression quotidienne</h2>
      <div className="flex flex-row text-center" role="region" aria-label="Stats rapides">
        <ChartStat label="Aujourd'hui" value={latest} />
        <ChartStat label="Cette semaine" value={average} />
      </div>
      <section className="text-sm text-muted-foreground " aria-labelledby="chart-heading">
        {error ? (
          <div className="flex h-[250px] w-full items-center justify-center text-sm text-muted-foreground">
            {error}
          </div>
        ) : loading ? (
          <div className="flex h-[250px] w-full items-center justify-center text-sm text-muted-foreground">
            Chargement des données…
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-[250px] w-full items-center justify-center text-sm text-muted-foreground">
            Aucune donnée disponible pour cette période.
          </div>
        ) : (
          <ChartContainer className="w-full h-[320px] min-h-[250px] min-w-0">
            <ResponsiveContainer width="100%" height={320}>
             <LineChart
               data={data}
               margin={{
                 left: 12,
                 right: 12,
               }}
             >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString("fr-FR", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                />
                <YAxis
                  dataKey="percentage"
                  tickLine={false}
                  axisLine={false}
                  width={40}
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      className="w-[160px]"
                      valueFormatter={(value) => `${value}% ce jour-là`}
                      labelFormatter={(value) => {
                        return new Date(value).toLocaleDateString("fr-FR", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        });
                      }}
                    />
                  }
                />
                <Line
                  dataKey="percentage"
                  type="monotone"
                  stroke={chartConfig.completion.color}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  dot={(props) => <CustomDot {...props} />}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </section>
    </article>
  );
}
