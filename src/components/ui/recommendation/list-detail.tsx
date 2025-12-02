import React from "react";
import { RecommendationListDetailProps } from "@/types/ui";

export default function RecommendationListDetail({ title, content }: RecommendationListDetailProps) {
  return (
    <div className={`flex flex-col`}>
      <h3 className="text-primary text-base">{title}</h3>
      <span className="text-sm text-foreground">{content}</span>
    </div>
  );
}