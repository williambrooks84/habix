import React, { useMemo, useState } from 'react';
import type { FrequencyType, FrequencyConfig } from '@/app/types';
import { FrequencySelectProps } from '@/types/ui';


const WEEKDAY_LABELS = ['dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam'];

function parseDateSafe(s?: string | null) {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

export default function FrequencySelect({
  value,
  onChange,
  className,
  periodStart,
  periodEnd,
}: FrequencySelectProps) {
  const [warning, setWarning] = useState<string | null>(null);

  const periodLength = useMemo(() => {
    const s = parseDateSafe(periodStart);
    const e = parseDateSafe(periodEnd);
    if (!s || !e) return null;
    const msPerDay = 1000 * 60 * 60 * 24;
    const diff = Math.floor((e.setHours(0,0,0,0) - s.setHours(0,0,0,0)) / msPerDay) + 1;
    return diff > 0 ? diff : null;
  }, [periodStart, periodEnd]);

  const maxSelectableDays = useMemo(() => {
    if (periodLength && periodLength < 7) return periodLength;
    return 7;
  }, [periodLength]);

  function getDefaultDaysForPeriod() {
    const s = parseDateSafe(periodStart);
    if (!s || !periodLength) return [1, 2, 3, 4, 5];
    const startDay = s.getDay();
    const days: number[] = [];
    for (let i = 0; i < Math.min(periodLength, 7); i++) {
      days.push((startDay + i) % 7);
    }
    return Array.from(new Set(days)).sort((a, b) => a - b);
  }

  function setType(type: FrequencyType) {
    setWarning(null);
    const defaultConfig: FrequencyConfig = (
      type === 'weekly-multi' ? { days: getDefaultDaysForPeriod() } :
      type === 'monthly' ? { dayOfMonth: 1 } :
      type === 'monthly-multi' ? { dates: [1, 15] } :
      type === 'daily' ? { interval: 1 } : {}
    );
    onChange({ type, config: defaultConfig });
  }

  function toggleMonthDate(dayNum: number) {
    setWarning(null);
    const dates = ((value.config as { dates?: number[] })?.dates ?? []) as number[];
    const has = dates.includes(dayNum);
    const next = has ? dates.filter(d => d !== dayNum) : [...dates, dayNum];
    const nextUnique = Array.from(new Set(next)).sort((a, b) => a - b);
    onChange({ type: 'monthly-multi', config: { dates: nextUnique } });
  }

  function setSingleMonthDate(dayNum: number) {
    setWarning(null);
    const current = (value.config as any)?.dayOfMonth;
    if (current === dayNum) {
      onChange({ type: 'monthly', config: {} });
    } else {
      onChange({ type: 'monthly', config: { dayOfMonth: dayNum } });
    }
  }

  const renderMonthDatePicker = (multi = false) => {
    const selectedDates = multi ? ((value.config as { dates?: number[] })?.dates ?? []) : [];
    const selectedSingle = (value.config as any)?.dayOfMonth ?? null;
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    return (
      <div className="mt-2">
        <div className="grid grid-cols-7 gap-1">
          {days.map((d) => {
            const checked = multi ? selectedDates.includes(d) : selectedSingle === d;
            return (
              <button
                key={d}
                type="button"
                onClick={() => (multi ? toggleMonthDate(d) : setSingleMonthDate(d))}
                className={`py-1 rounded ${checked ? 'bg-primary text-foreground' : 'bg-transparent border'}`}
                aria-pressed={checked}
                aria-label={`Jour ${d}`}
              >
                {d}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground mt-1">Sélectionnez le(s) jour(s) du mois</p>
      </div>
    );
  }

  function toggleWeekday(day: number) {
    setWarning(null);
    const days = ((value.config as { days?: number[] })?.days ?? []) as number[];
    const has = days.includes(day);
    const next = has ? days.filter(d => d !== day) : [...days, day];
    const nextUnique = Array.from(new Set(next)).sort((a, b) => a - b);
    if (nextUnique.length > maxSelectableDays) {
      setWarning(`La période est de ${periodLength} jour(s) — vous ne pouvez sélectionner que jusqu'à ${maxSelectableDays} jour(s).`);
      return;
    }
    onChange({ type: 'weekly-multi', config: { days: nextUnique } });
  }

  function toggleSingleWeekday(day: number) {
    setWarning(null);
    const currentDay = (value.config as any)?.day;
    if (currentDay === day) {
      onChange({ type: 'weekly', config: {} });
    } else {
      onChange({ type: 'weekly', config: { day } });
    }
  }

  const renderWeekdaySelector = (multi = false) => {
    if (multi) {
      const selectedDays = ((value.config as { days?: number[] })?.days) ?? [];
      return (
        <>
          <div className="mt-2 grid grid-cols-7 gap-1">
            {WEEKDAY_LABELS.map((lbl, i) => {
              const checked = selectedDays.includes(i);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggleWeekday(i)}
                  className={`py-1 rounded ${checked ? 'bg-primary text-foreground' : 'bg-transparent border'}`}
                  aria-pressed={checked}
                  aria-label={`Jour ${lbl}`}
                >
                  {lbl}
                </button>
              );
            })}
          </div>
          {periodLength && periodLength < 7 && (
            <p className="text-xs text-muted-foreground mt-1">
              Période: {periodLength} jour(s) — maximum {maxSelectableDays} jour(s) sélectionnables
            </p>
          )}
        </>
      );
    }

    return (
      <div className="mt-2 grid grid-cols-7 gap-1">
        {WEEKDAY_LABELS.map((lbl, i) => {
          const selected = (value.config as any)?.day === i;
          return (
            <button
              key={i}
              type="button"
              onClick={() => toggleSingleWeekday(i)}
              className={`py-1 rounded ${selected ? 'bg-primary text-foreground' : 'bg-transparent border'}`}
              aria-pressed={selected}
              aria-label={`Jour ${lbl}`}
            >
              {lbl}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className={className}>
      <label htmlFor="frequency" className="block text-sm font-medium mb-1">Fréquence</label>
      <select
        id="frequency"
        className="w-full border-3 border-foreground rounded-3xl px-3 py-2 text-foreground bg-background"
        value={value.type}
        onChange={(e) => setType(e.target.value as FrequencyType)}
        aria-label="Choisir la fréquence"
      >
        <option value="daily">Tous les jours</option>
        <option value="weekly">1 fois par semaine</option>
        <option value="weekly-multi">Plusieurs jours par semaine</option>
        <option value="monthly">1 fois par mois</option>
        <option value="monthly-multi">Plusieurs fois par mois</option>
      </select>
      {(value.type === 'weekly' || value.type === 'weekly-multi') &&
        renderWeekdaySelector(value.type === 'weekly-multi')
      }
      {value.type === 'monthly' && renderMonthDatePicker(false)}
      {value.type === 'monthly-multi' && renderMonthDatePicker(true)}
      {warning && <p className="text-xs text-amber-600 mt-2">{warning}</p>}
    </div>
  );
}