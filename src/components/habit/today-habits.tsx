'use client';
import React, { useEffect, useState } from 'react';
import ProgressCircle from '../ui/habit/progress-circle';

type Item = {
  id: number;
  name: string;
  scheduledToday: boolean;
  target: number;
  completed: number;
  doneToday: boolean;
  frequencyType?: string;
};

export default function TodayHabits() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingIds, setPendingIds] = useState<Array<number>>([]);

  async function load() {
    setLoading(true);
    const res = await fetch('/api/habits/today');
    const json = await res.json();
    setItems(json.habits ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function toggleToday(h: Item) {
    console.log('TodayHabits: toggleToday', { id: h.id, doneToday: h.doneToday });
    // optimistic UI with safer functional updates and local date (avoid UTC shift)
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
        // mark complete
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
        // undo
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
      // Optionally refresh the single item counts by reloading list
      await load();
    } catch (err) {
      console.error('toggle error', err);
      // rollback optimistic
      setItems((prev) => prev.map(i => i.id === h.id ? { ...i, doneToday: h.doneToday, completed: h.completed } : i));
    } finally {
      setPendingIds((s) => s.filter(x => x !== h.id));
    }
  }

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="space-y-3">
      {items.filter(i => i.scheduledToday).map(h => {
        const percent = h.target > 0 ? Math.min(1, h.completed / h.target) : (h.doneToday ? 1 : 0);
        return (
          <div key={h.id} className="flex items-center justify-between p-3 bg-card rounded">
            <div className="flex-1">
              <div className="font-medium text-sm truncate">{h.name}</div>
              {h.frequencyType !== 'daily' && (
                <div className="text-xs text-muted-foreground">{h.completed}/{h.target} this period</div>
              )}
            </div>

            <div className="ml-3">
              <button
                onClick={() => toggleToday(h)}
                aria-pressed={h.doneToday}
                className="p-1"
                disabled={pendingIds.includes(h.id)}
              >
                <ProgressCircle percent={h.frequencyType === 'daily' ? (h.doneToday ? 1 : 0) : percent} size={44} showLabel={false} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}