import { addDays, isSameDay, startOfDay } from 'date-fns';
import type { FrequencyType, FrequencyConfig } from '@/app/types';

function weekdayNums(days?: number[]) {
  return (days ?? []).map(d => d % 7);
}

export function isScheduledOnDate(freqType: FrequencyType, config: any, date: Date, periodStart?: Date | null, periodEnd?: Date | null) {
  const d = startOfDay(date);
  if (periodStart && d < startOfDay(periodStart)) return false;
  if (periodEnd && d > startOfDay(periodEnd)) return false;

  if (freqType === 'daily') {
    const interval = (config?.interval ?? 1);
    if (periodStart) {
      const diffDays = Math.floor((d.getTime() - startOfDay(periodStart).getTime()) / (1000*60*60*24));
      return diffDays >= 0 && (diffDays % interval) === 0;
    }
    return true;
  }

  if (freqType === 'weekly') {
    const day = config?.day;
    if (typeof day !== 'number') return false;
    return d.getDay() === (day % 7);
  }

  if (freqType === 'weekly-multi') {
    const days = weekdayNums(config?.days);
    return days.includes(d.getDay());
  }

  if (freqType === 'monthly') {
    const dom = config?.dayOfMonth;
    if (!dom) return false;
    return d.getDate() === dom;
  }

  if ((freqType as any) === 'monthly-multi') {
    const dates = (config?.dates ?? [])
      .map((n: any) => Number(n))
      .filter((n: number) => !Number.isNaN(n) && n >= 1 && n <= 31);
    if (!dates.length) return false;
    return dates.includes(d.getDate());
  }

  return false;
}

export function occurrencesBetween(freqType: FrequencyType, config: any, from: Date, to: Date, periodStart?: Date | null, periodEnd?: Date | null) {
  const out: Date[] = [];
  const start = startOfDay(from);
  const end = startOfDay(to);
  for (let cur = start; cur <= end; cur = addDays(cur, 1)) {
    if (isScheduledOnDate(freqType, config, cur, periodStart, periodEnd)) out.push(new Date(cur));
  }
  return out;
}