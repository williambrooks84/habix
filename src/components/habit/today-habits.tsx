"use client";
import React, { useEffect, useState } from 'react';
import ProgressCircle from '../ui/habit/progress-circle';
import { ToggleSpin } from '../ui/ToggleSpin';
import { pickIconByName } from '@/app/lib/pick-icon-by-name';
import { TodayHabitItem } from '@/app/lib/definitions';
import { usePoints } from '@/components/wrappers/PointsContext';

export default function TodayHabits() {
  const { refreshPoints } = usePoints();
  const [items, setItems] = useState<TodayHabitItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingIds, setPendingIds] = useState<Array<number>>([]);

  async function load(options?: { suppressSpinner?: boolean }) {
    const { suppressSpinner = false } = options ?? {};
    if (!suppressSpinner) setLoading(true);
    const res = await fetch('/api/habits/today');
    const json = await res.json();
    setItems(json.habits ?? []);
    if (!suppressSpinner) setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function toggleToday(h: TodayHabitItem) {
    const localYMD = (d = new Date()) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    setPendingIds((s) => [...s, h.id]);
    setItems((prev) => prev.map(i => i.id === h.id ? { ...i, doneToday: !i.doneToday, completed: i.doneToday ? i.completed - 1 : i.completed + 1 } : i));
    try {
      if (!h.doneToday) {
        const res = await fetch(`/api/habits/${h.id}/complete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ runDate: localYMD() }),
          credentials: 'same-origin'
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          console.error('mark complete failed', res.status, text);
          throw new Error('Failed to mark complete');
        }
        try {
          const awarded = json?.pointsAwarded?.awardedBadges ?? json?.awardedBadges ?? [];
          if (Array.isArray(awarded) && awarded.length > 0) {
            window.dispatchEvent(new CustomEvent('badge:awarded', { detail: awarded }));
          }
        } catch { }
        refreshPoints();
      } else {
        const res = await fetch(`/api/habits/${h.id}/complete`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ runDate: localYMD() }),
          credentials: 'same-origin'
        });
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          console.error('undo complete failed', res.status, text);
          throw new Error('Failed to undo completion');
        }
        refreshPoints();
      }
      await load({ suppressSpinner: true });
      try {
        window.dispatchEvent(new CustomEvent("habits:changed", { detail: { date: localYMD(), habitId: h.id } }))
      } catch {
        /* ignore */
      }
    } catch (err) {
      console.error('toggle error', err);
      setItems((prev) => prev.map(i => i.id === h.id ? { ...i, doneToday: h.doneToday, completed: h.completed } : i));
    } finally {
      setPendingIds((s) => s.filter(x => x !== h.id));
    }
  }

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="flex flex-wrap justify-center gap-4">
      {items.filter(i => i.scheduledToday).map(h => {
        const percent = h.target > 0 ? Math.min(1, h.completed / h.target) : (h.doneToday ? 1 : 0);
        const subtitle = h.frequencyType === 'daily'
          ? (h.doneToday ? "Fait aujourd'hui" : <span className="text-destructive">À faire aujourd'hui</span>)
          : `${h.completed}/${h.target} cette semaine`;

        return (
          <div
            key={h.id}
            className="flex flex-col items-center p-3 bg-card rounded w-1/3 sm:w-1/2 lg:w-1/3 max-w-[240px] min-w-[140px]"
          >
            <div className="w-full flex items-center justify-center">
              <button
                onClick={() => toggleToday(h)}
                aria-pressed={h.doneToday}
                className="p-0"
                disabled={pendingIds.includes(h.id)}
              >
                {(() => {
                  try {
                    const Icon = pickIconByName((h as any).categoryName ?? h.name);
                    const isPending = pendingIds.includes(h.id);
                    return (
                      <ProgressCircle
                        percent={h.frequencyType === 'daily' ? (h.doneToday ? 1 : 0) : percent}
                        size={64}
                        showLabel={false}
                        color={(h as any).color ?? undefined}
                        center={isPending ? <ToggleSpin /> : <div className="w-6 h-6 text-primary flex items-center justify-center"><Icon /></div>}
                        title={h.name}
                        subtitle={subtitle}
                      />
                    );
                  } catch (e) {
                    const isPending = pendingIds.includes(h.id);
                    return (
                      <ProgressCircle
                        percent={h.frequencyType === 'daily' ? (h.doneToday ? 1 : 0) : percent}
                        size={64}
                        showLabel={false}
                        color={(h as any).color ?? undefined}
                        center={isPending ? <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /> : undefined}
                        title={h.name}
                        subtitle={subtitle}
                      />
                    );
                  }
                })()}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}