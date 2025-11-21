"use client";

import React from "react";
import clsx from "clsx";

export type HabitListItem = {
  id: number | string;
  name: string;
  Icon?: React.ComponentType<{ className?: string }>;
  subtitle?: string;
  onClick?: (id: number | string) => void;
};

type Props = {
  items: HabitListItem[];
  className?: string;
};

export default function HabitList({ items, className }: Props) {
  if (!items || items.length === 0) {
    return <p className="text-sm text-muted-foreground">Aucune habitude.</p>;
  }

  return (
    <ul className={clsx("space-y-2", className)} role="list">
      {items.map((item) => {
        const Icon = item.Icon ?? (() => <span className="w-6 h-6 inline-block rounded bg-gray-200" />);
        return (
          <li key={String(item.id)}>
            <button
              type="button"
              onClick={() => item.onClick?.(item.id)}
              className="w-full flex items-center gap-3 p-3 rounded-lg border border-transparent hover:bg-muted transition-colors text-left"
            >
              <span className="flex-shrink-0">
                <Icon className="w-6 h-6" />
              </span>

              <span className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">{item.name}</div>
                {item.subtitle && <div className="text-xs text-muted-foreground truncate">{item.subtitle}</div>}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}