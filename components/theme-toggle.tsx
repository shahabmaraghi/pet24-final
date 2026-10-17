"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`flex h-10 w-10 items-center justify-center rounded-xl border-[1.5px] border-border bg-background text-foreground transition-colors hover:bg-accent hover:text-accent-foreground ${className}`}
      aria-label={isDark ? "روشن کردن حالت روز" : "روشن کردن حالت شب"}
      title={isDark ? "حالت روز" : "حالت شب"}
    >
      {!mounted ? (
        <span className="h-[18px] w-[18px] rounded-full bg-muted" aria-hidden />
      ) : isDark ? (
        <Sun className="h-[18px] w-[18px] text-primary" strokeWidth={1.7} />
      ) : (
        <Moon className="h-[18px] w-[18px] text-primary" strokeWidth={1.7} />
      )}
    </button>
  );
}
