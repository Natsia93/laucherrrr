"use client";

import * as React from "react";
import { flushSync } from "react-dom";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const [mounted, setMounted] = React.useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect runs only on the client, so we know we're safely mounted
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeChange = (newTheme: "light" | "dark") => {
    if (theme === newTheme) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (
      !prefersReducedMotion &&
      typeof document !== "undefined" &&
      "startViewTransition" in document &&
      typeof (document as any).startViewTransition === "function"
    ) {
      document.documentElement.classList.add("theme-transitioning");

      const transition = (document as any).startViewTransition(() => {
        flushSync(() => {
          setTheme(newTheme);
        });
      });

      transition.finished.finally(() => {
        document.documentElement.classList.remove("theme-transitioning");
      });
    } else {
      setTheme(newTheme);
    }
  };

  if (!mounted) {
    return (
      <div className="relative inline-flex h-9 w-[68px] items-center rounded-full border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#10140d] p-1 opacity-0">
      </div>
    );
  }

  return (
    <div className="relative inline-flex h-9 items-center rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141414] p-1 transition-colors">
      <button
        type="button"
        onClick={() => handleThemeChange("light")}
        className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
          theme === "light" ? "text-amber-500 font-bold" : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
        }`}
      >
        <Sun className="h-4 w-4" />
        <span className="sr-only">Light</span>
      </button>
      <button
        type="button"
        onClick={() => handleThemeChange("dark")}
        className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
          theme === "dark" ? "text-[#ffd100] font-bold" : "text-neutral-500 hover:text-neutral-900"
        }`}
      >
        <Moon className="h-4 w-4" />
        <span className="sr-only">Dark</span>
      </button>
      
      {/* Sliding background pill */}
      <div 
        className={`absolute left-1 top-1 h-7 w-7 rounded-full bg-neutral-100 dark:bg-neutral-800 transition-transform duration-300 ${
          theme === "dark" ? "translate-x-7" : "translate-x-0"
        }`}
      ></div>
    </div>
  );
}
