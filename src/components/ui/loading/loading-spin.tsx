import React from "react";
import clsx from "clsx";
import { LoadingSpinProps } from "@/types/ui";

export default function LoadingSpin({ size, className, "aria-label": ariaLabel }: LoadingSpinProps) {
  const style: React.CSSProperties = { width: size, height: size };
  return (
    <span
      role="status"
      aria-live="polite"
      aria-label={ariaLabel ?? "Chargement"}
      className={clsx("inline-block align-middle", className)}
      style={style}
    >
      <span
        className="block w-full h-full animate-spin rounded-full border-4 border-primary border-t-transparent"
      />
      <span className="sr-only">{ariaLabel ?? "Chargement"}</span>
    </span>
  );
}