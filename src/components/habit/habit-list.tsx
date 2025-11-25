"use client";

import React from "react";
import clsx from "clsx";
import { HabitProps } from "@/types/ui";
import { parseISO, format, startOfToday } from "date-fns";
import { fr } from "date-fns/locale";

function formatIsoForUi(iso?: string | null) {
  if (!iso) return "";
  return format(parseISO(iso), "PPP", { locale: fr });
}

export default function HabitList({ items, className }: HabitProps) {
  return (
    <ul className={clsx("space-y-2", className)} role="list">
      {items.map((item) => {
        const Icon = item.Icon!;

        return (
          <li key={String(item.id)}>
            <div className="w-full flex items-center gap-3 p-3">
              <span className="flex-shrink-0">
                <Icon className="w-6 h-6" />
              </span>

              <span className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">{item.name}</div>
                {item.subtitle && (
                  <div className="text-xs text-muted-foreground truncate">{item.subtitle}</div>
                )}
                <p>{item.motivation}</p>

                <p className="text-sm text-muted-foreground">
                  {item.periodStart && item.periodEnd ? (
                    <>
                      Du {formatIsoForUi(item.periodStart)}{" "}→{" "}{formatIsoForUi(item.periodEnd)}
                    </>
                  ) : (
                    (() => {
                      const single = item.periodStart ?? item.periodEnd ?? null;
                      if (!single) return "";
                      try {
                        const d = parseISO(single);
                        const dDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
                        const today = startOfToday();
                        if (dDay < today) return `depuis ${format(d, "PPP", { locale: fr })}`;
                        return `A partir du ${format(d, "PPP", { locale: fr })}`;
                      } catch (e) {
                        return formatIsoForUi(single);
                      }
                    })()
                  )}
                </p>
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}