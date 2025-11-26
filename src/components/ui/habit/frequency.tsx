import React, { useMemo, useState } from 'react';
import type { FrequencyType, FrequencyConfig } from '@/app/types';

type FrequencyValue = { type: FrequencyType; config?: FrequencyConfig };

type FrequencySelectProps = {
  value: FrequencyValue;
  onChange: (v: FrequencyValue) => void;
  className?: string;
  periodStart?: string | null;
  periodEnd?: string | null; 
};

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
    // inclusive difference
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
    const startDay = s.getDay(); // 0..6
    const days: number[] = [];
    for (let i = 0; i < Math.min(periodLength, 7); i++) {
      days.push((startDay + i) % 7);
    }
    // ensure unique & sorted
    return Array.from(new Set(days)).sort((a, b) => a - b);
  }

  function setType(type: FrequencyType) {
    setWarning(null);
    const defaultConfig: FrequencyConfig = (
      type === 'weekly-multi' ? { days: getDefaultDaysForPeriod() } :
      type === 'monthly' ? { dayOfMonth: 1 } :
      type === 'daily' ? { interval: 1 } : {}
    );
    onChange({ type, config: defaultConfig });
  }

  function toggleWeekday(day: number) {
    setWarning(null);
    const days = ((value.config as { days?: number[] })?.days ?? []) as number[];
    const has = days.includes(day);
    const next = has ? days.filter(d => d !== day) : [...days, day];
    // dedupe & sort
    const nextUnique = Array.from(new Set(next)).sort((a, b) => a - b);
    if (nextUnique.length > maxSelectableDays) {
      setWarning(`La période est de ${periodLength} jour(s) — vous ne pouvez sélectionner que jusqu'à ${maxSelectableDays} jour(s).`);
      return;
    }
    onChange({ type: 'weekly-multi', config: { days: nextUnique } });
  }

  function toggleSingleWeekday(day: number) {
    setWarning(null);
    // single weekday unaffected by max selectable, but warn if period <1? not necessary
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

    // single-weekday (weekly) use same button UI but only one can be active
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
      <label className="block text-sm font-medium mb-1">Fréquence</label>
      <select
        className="w-full border rounded px-3 py-2 text-foreground bg-background"
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

      {value.type === 'monthly' && (
        <div className="mt-2 flex gap-2 items-center">
          <label className="text-sm">Jour du mois</label>
          <input
            type="number"
            min={1}
            max={31}
            className="border rounded px-2 py-1 w-20"
            value={(value.config as any)?.dayOfMonth ?? ''}
            onChange={(e) => onChange({ type: 'monthly', config: { dayOfMonth: Number(e.target.value) } })}
          />
        </div>
      )}

      {warning && <p className="text-xs text-amber-600 mt-2">{warning}</p>}
    </div>
  );
}