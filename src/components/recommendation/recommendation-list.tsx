"use client";

import React, { useEffect, useState } from "react";
import clsx from "clsx";
import { RecommendationProps } from "@/types/ui";
import RecommendationListDetail from "../ui/recommendation/list-detail";

export default function RecommendationList({ items, className }: RecommendationProps) {
  const [Items, setItems] = useState(items ?? []);

  useEffect(() => {
    setItems(items ?? []);
  }, [items]);

  return (
    <>
      <ul className={clsx("flex flex-wrap md:flex-col justify-center gap-6", className)} role="list">
        {Items.map((item) => {
          return (
            <li key={item.id} className="w-full max-w-md mx-auto">
              <div
                className="flex flex-col items-center justify-center rounded-xl border-2 border-primary px-4 py-3 gap-2 w-full"
              >
                <RecommendationListDetail id={item.id} title={item.title} content={item.content} />
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}