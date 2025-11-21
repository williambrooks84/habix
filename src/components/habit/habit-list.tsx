"use client";

import React from "react";
import clsx from "clsx";
import { HabitProps } from "@/types/ui";

export default function HabitList({ items, className }: HabitProps) {
  return (
    <ul className={clsx("space-y-2", className)} role="list">
      {items.map((item) => {
        const Icon = item.Icon!;
        return (
          <li key={String(item.id)}>
            <div
              className="w-full flex items-center gap-3 p-3"
            >
              <span className="flex-shrink-0">
                <Icon className="w-6 h-6" />
              </span>

              <span className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">{item.name}</div>
                {item.subtitle && <div className="text-xs text-muted-foreground truncate">{item.subtitle}</div>}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}