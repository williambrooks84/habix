"use client"

import { Button } from "@/components/ui/button"
import { AdminToggleProps } from "@/types/ui"

export default function Toggle({
  value,
  onChange,
}: AdminToggleProps) {
  return (
    <div className="flex gap-2 justify-center">
      <Button
        variant={value === "users" ? "primary" : "transparent"}
        size="small"
        onClick={() => onChange("users")}
      >
        Utilisateurs
      </Button>
      <Button
        variant={value === "habits" ? "primary" : "transparent"}
        size="small"
        onClick={() => onChange("habits")}
      >
        Habitudes
      </Button>
    </div>
  )
}