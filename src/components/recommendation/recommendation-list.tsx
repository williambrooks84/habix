"use client";

import React, { useEffect, useState } from "react";
import clsx from "clsx";
import { RecommendationProps } from "@/types/ui";

export default function RecommendationList({ items, className }: RecommendationProps) {
  const [Items, setItems] = useState(items ?? []);

  useEffect(() => {
    setItems(items ?? []);
  }, [items]);

  return (
    <>
      <ul className={clsx("flex flex-wrap md:flex-col justify-center gap-4 md:w-fit", className)} role="list">
        {Items.map((item) => {
          return (
            <li key={item.id} className="">
              <div
                className="flex flex-col items-center justify-center rounded-xl border-2 border-primary px-4 py-3 gap-2"
              >
                <span className="text-sm text-center font-medium text-primary break-words whitespace-normal">
                  {item.title}
                </span>
                <span className="text-xs text-foreground">{item.content}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}