"use client"

import { CartesianGrid, Line, LineChart, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import React from "react";
import { StreakChartProps } from "@/types/ui";
import { isScheduledOnDate, occurrencesBetween } from "@/app/lib/recurrence";
import type { FrequencyType } from "@/app/types";
import { parseYMD, formatYMD } from "@/app/lib/date-utils";


function StreakChartTooltipContent({ active, payload }: any) {
    if (!active || !payload?.length) return null;
    const item = payload[0];
    const value = item?.value;
    const date = item?.payload?.date;
    const d = typeof date === 'string' ? parseYMD(date) : new Date(date);
    const formatted = date ? d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : date;
    return (
        <div className="rounded-md border bg-background px-3 py-2 text-xs shadow-md">
            <div className="font-medium text-foreground">
                {formatted}
            </div>
            <div className="text-muted-foreground">
                {value === 1 ? `Complété` : "Non complété"}
            </div>
        </div>
    );
}

const MemoizedStreakChartTooltipContent = React.memo(StreakChartTooltipContent);

function CustomDot(props: any) {
    const { cx, cy } = props;
    if (cx == null || cy == null) return null;
    return <circle cx={cx} cy={cy} r={3} fill="var(--primary)" stroke="none" />;
}

const MemoizedCustomDot = React.memo(CustomDot);

function calculateStreaks(completedDays: string[]) {
    if (!completedDays.length) return { current: 0, previous: 0 };
    
    const sorted = [...completedDays].sort((a, b) => parseYMD(b).getTime() - parseYMD(a).getTime());

    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < sorted.length; i++) {
        const date = parseYMD(sorted[i]);
        date.setHours(0, 0, 0, 0);
        const expectedDate = new Date(today);
        expectedDate.setDate(today.getDate() - currentStreak);
        
        if (date.getTime() === expectedDate.getTime()) {
            currentStreak++;
        } else {
            break;
        }
    }
    
    let previousStreak = 0;
    let tempStreak = 0;
    const allSorted = [...completedDays].sort((a, b) => parseYMD(a).getTime() - parseYMD(b).getTime());
    
    for (let i = 0; i < allSorted.length; i++) {
        if (i === 0) {
            tempStreak = 1;
        } else {
            const prev = parseYMD(allSorted[i - 1]);
            const curr = parseYMD(allSorted[i]);
            const diffDays = Math.floor((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
                tempStreak++;
            } else {
                if (tempStreak > currentStreak) {
                    previousStreak = Math.max(previousStreak, tempStreak);
                }
                tempStreak = 1;
            }
        }
    }
    
    if (tempStreak > currentStreak) {
        previousStreak = Math.max(previousStreak, tempStreak);
    }
    
    return { current: currentStreak, previous: previousStreak };
}

function calculateScheduledStreaks(
    completedDays: string[],
    frequencyType?: string | null,
    frequencyConfig?: any,
    periodStart?: string | null,
    periodEnd?: string | null,
) {
    if (!frequencyType) return calculateStreaks(completedDays);

    const completedSet = new Set(completedDays);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const periodStartDate = periodStart ? parseYMD(periodStart) : null;
    const periodEndDate = periodEnd ? parseYMD(periodEnd) : null;
    const end = periodEndDate && periodEndDate < today ? periodEndDate : today;

    let start: Date | null = periodStartDate ? new Date(periodStartDate) : null;
    if (!start) {
        if (completedDays.length) {
            const earliest = completedDays.reduce((min, d) => (parseYMD(d) < parseYMD(min) ? d : min), completedDays[0]);
            start = parseYMD(earliest);
        } else {
            start = new Date(end);
        }
    }
    start.setHours(0, 0, 0, 0);

    if (start > end) return { current: 0, previous: 0 };

    const scheduled = occurrencesBetween(
        frequencyType as FrequencyType,
        frequencyConfig,
        start,
        end,
        periodStartDate,
        periodEndDate
    );

    if (!scheduled.length) return { current: 0, previous: 0 };

    let current = 0;
    for (let i = scheduled.length - 1; i >= 0; i--) {
        const ymd = formatYMD(scheduled[i]);
        if (completedSet.has(ymd)) current++;
        else break;
    }

    let best = 0;
    let tmp = 0;
    for (let i = 0; i < scheduled.length; i++) {
        const ymd = formatYMD(scheduled[i]);
        if (completedSet.has(ymd)) {
            tmp++;
            if (tmp > best) best = tmp;
        } else {
            tmp = 0;
        }
    }

    return { current, previous: best };
}

export function StreakChart({ completedDays, periodStart, periodEnd, frequencyType, frequencyConfig }: StreakChartProps) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { days, streaks } = React.useMemo(() => {
        const startDate = periodStart ? parseYMD(periodStart) : new Date(today.getTime() - 13 * 24 * 60 * 60 * 1000);
        startDate.setHours(0, 0, 0, 0);

        let endDate = new Date(today);
        if (periodEnd) {
            const pEnd = parseYMD(periodEnd);
            pEnd.setHours(0, 0, 0, 0);
            endDate = pEnd < today ? pEnd : today;
        }

        const periodStartDate = periodStart ? parseYMD(periodStart) : null;
        const periodEndDate = periodEnd ? parseYMD(periodEnd) : null;

        const rawCount = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const dayCount = Math.max(0, Math.min(rawCount, 30));

        const allDays = Array.from({ length: dayCount }, (_, i) => {
            const d = new Date(startDate);
            d.setDate(startDate.getDate() + i);
            d.setHours(0, 0, 0, 0);
            return d;
        });

        const daysData = allDays
            .filter(d => {
                if (!frequencyType) return true;
                return isScheduledOnDate(frequencyType as FrequencyType, frequencyConfig, d, periodStartDate, periodEndDate);
            })
            .map(d => {
                const ymd = formatYMD(d);
                return {
                    date: ymd,
                    completed: completedDays.includes(ymd) ? 1 : 0,
                };
            });
        
        const streaksData = calculateScheduledStreaks(
            completedDays,
            frequencyType,
            frequencyConfig,
            periodStart,
            periodEnd
        );
        
        return { days: daysData, streaks: streaksData };
    }, [completedDays, periodStart, periodEnd, frequencyType, frequencyConfig]);
    
    return (
        <div className="w-full space-y-4">
            <div className="flex gap-6 items-center px-2">
                <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Streak actuel</span>
                    <span className="text-3xl font-bold text-primary">{streaks.current}</span>
                    <span className="text-xs text-muted-foreground">
                        {streaks.current === 0 ? 'jours' : streaks.current === 1 ? 'jour' : 'jours'}
                    </span>
                </div>
                {streaks.previous > 0 && (
                    <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Meilleur streak</span>
                        <span className="text-2xl font-semibold text-foreground/70">{streaks.previous}</span>
                        <span className="text-xs text-muted-foreground">
                            {streaks.previous === 1 ? 'jour' : 'jours'}
                        </span>
                    </div>
                )}
            </div>
            
            <div 
                onFocus={(e) => e.preventDefault()}
                onMouseDown={(e) => e.preventDefault()}
            >
                <ResponsiveContainer width="100%" height={140}>
                    <LineChart
                        data={days}
                        margin={{ left: 8, right: 8, top: 16, bottom: 16 }}
                        style={{ outline: 'none' }}
                    >
                        <CartesianGrid vertical={false} stroke="none" />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={20}
                            tickFormatter={(value) => {
                                const date = parseYMD(String(value));
                                return date.toLocaleDateString("fr-FR", {
                                    day: "numeric",
                                    month: "numeric"
                                });
                            }}
                        />
                        <YAxis
                            type="number"
                            domain={[0, 1]}
                            ticks={[1]}
                            tickLine={false}
                            axisLine={false}
                            tick={false}
                            width={0}
                        />
                        <ReferenceLine y={1} stroke="#d1d5db" strokeWidth={1} />
                        <Tooltip content={<MemoizedStreakChartTooltipContent />} cursor={false} />
                        <Line
                            dataKey="completed"
                            type="monotone"
                            stroke="var(--primary)"
                            strokeWidth={2}
                            dot={<MemoizedCustomDot />}
                            activeDot={false}
                            isAnimationActive={true}
                            animationDuration={300}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export const MemoizedStreakChart = React.memo(StreakChart);
