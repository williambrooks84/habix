"use client";
import React, { useEffect, useState } from 'react';
import ProgressCircle from '../ui/habit/progress-circle';
import { pickIconByName } from '@/app/lib/pick-icon-by-name';
import { TodayHabitItem } from '@/app/lib/definitions';

export default function TodayHabits() {
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
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          console.error('mark complete failed', res.status, text);
          throw new Error('Failed to mark complete');
        }
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
      }
      // refresh without showing the full-page loader for a smoother experience
      await load({ suppressSpinner: true });
    } catch (err) {
      console.error('toggle error', err);
      setItems((prev) => prev.map(i => i.id === h.id ? { ...i, doneToday: h.doneToday, completed: h.completed } : i));
    } finally {
      setPendingIds((s) => s.filter(x => x !== h.id));
    }
  }

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="grid grid-cols-2 gap-3">
      {items.filter(i => i.scheduledToday).map(h => {
        const percent = h.target > 0 ? Math.min(1, h.completed / h.target) : (h.doneToday ? 1 : 0);
        return (
          <div key={h.id} className="flex flex-col items-center p-3 bg-card rounded">
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
                        center={isPending ? <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /> : <div className="w-6 h-6 text-primary flex items-center justify-center"><Icon /></div>}
                        title={h.name}
                        subtitle={`${h.completed}/${h.target} this period`}
                      />
                    );
                  } catch (e) {
                    const isPending = pendingIds.includes(h.id);
                    return (
                      <ProgressCircle
                        percent={h.frequencyType === 'daily' ? (h.doneToday ? 1 : 0) : percent}
                        size={64}
                        showLabel={false}
                        center={isPending ? <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /> : undefined}
                        title={h.name}
                        subtitle={`${h.completed}/${h.target} this period`}
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