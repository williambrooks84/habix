import { useEffect, useState } from "react";
import { DarkIcon, LightIcon } from "@/components/ui/icons";
import { getInitialTheme, toggleTheme, applyTheme } from "@/app/lib/theme-toggle";

export type Theme = "light" | "dark";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const initial = getInitialTheme();
    applyTheme(initial); 
    setTheme(initial);
  }, []);

  if (!theme) return null;

  function handleToggle() {
    if (!theme) return;
    const next = toggleTheme(theme);
    setTheme(next);
  }

  return (
    <button
      onClick={handleToggle}
      aria-pressed={theme === "dark"}
      className="rounded-md p-2 hover:bg-muted/10"
      title={theme === "dark" ? "Passer en clair" : "Passer en sombre"}
    >
      {theme === "dark" ? <DarkIcon /> : <LightIcon />}
    </button>
  );
}
