import React from "react";
import { useRouter } from "next/navigation";
import { RecommendationListDetailProps } from "@/types/ui";
import { Button } from "../button";

export default function RecommendationListDetail({ title, content }: RecommendationListDetailProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h3 className="text-primary text-base">{title}</h3>
        <span className="text-sm text-foreground">{content}</span>
      </div>
      <Button
        variant="primary"
        size="small"
        onClick={() => router.push(`/habit/create?name=${encodeURIComponent(title)}`)}
      >
        Utiliser cette recommandation
      </Button>
    </div>
  );
}