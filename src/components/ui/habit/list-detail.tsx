import React from "react";
import { ListDetailProps } from "@/types/ui";

export default function ListDetail({ title, children }: ListDetailProps) {
  return (
    <div className={`flex flex-col`}>
      <h3 className="text-primary text-base">{title}</h3>
      <span className="text-sm text-foreground">{children}</span>
    </div>
  );
}