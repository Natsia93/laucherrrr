"use client";

import * as React from "react";
import { flushSync } from "react-dom";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

let hasHydrated = false;

export function ThemeToggle() {
  const [mounted, setMounted] = React.useState(hasHydrated);
  const { theme, setTheme, resolvedTheme } = useTheme();

  // useEffect runs only on the client, so we know we're safely mounted
  React.useEffect(() => {
    hasHydrated = true;
    setMounted(true);
  }, []);

  const currentTheme = theme || resolvedTheme || "light";

  const handleThemeChange = (newTheme: "light" | "dark") => {
    if (currentTheme === newTheme) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const docWithTransition = typeof document !== "undefined"
      ? (document as unknown as {
          startViewTransition?: (callback: () => void) => { finished: Promise<void> };
        })
      : null;

    if (
      !prefersReducedMotion &&
      docWithTransition &&
      typeof docWithTransition.startViewTransition === "function"
    ) {
      document.documentElement.classList.add("theme-transitioning");

      const transition = docWithTransition.startViewTransition(() => {
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
      <div
        suppressHydrationWarning
        className="relative inline-flex h-9 items-center rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141414] p-1"
      >
        <div className="flex h-7 w-7 items-center justify-center text-neutral-400">
          <Sun className="h-4 w-4" />
        </div>
        <div className="flex h-7 w-7 items-center justify-center text-neutral-400">
          <Moon className="h-4 w-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative inline-flex h-9 items-center rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141414] p-1 transition-colors">
      <button
        type="button"
        onClick={() => handleThemeChange("light")}
        className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
          currentTheme === "light" ? "text-amber-500 font-bold" : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
        }`}
      >
        <Sun className="h-4 w-4" />
        <span className="sr-only">Light</span>
      </button>
      <button
        type="button"
        onClick={() => handleThemeChange("dark")}
        className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
          currentTheme === "dark" ? "text-[#ffd100] font-bold" : "text-neutral-500 hover:text-neutral-900"
        }`}
      >
        <Moon className="h-4 w-4" />
        <span className="sr-only">Dark</span>
      </button>
      
      {/* Sliding background pill */}
      <div 
        className={`absolute left-1 top-1 h-7 w-7 rounded-full bg-neutral-100 dark:bg-neutral-800 transition-transform duration-300 ${
          currentTheme === "dark" ? "translate-x-7" : "translate-x-0"
        }`}
      ></div>
    </div>
  );
}
