"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const [mounted, setMounted] = React.useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect runs only on the client, so we know we're safely mounted
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="relative inline-flex h-9 w-[68px] items-center rounded-full border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#10140d] p-1 opacity-0">
      </div>
    );
  }

  return (
    <div className="relative inline-flex h-9 items-center rounded-full border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#10140d] p-1 transition-colors">
      <button
        onClick={() => setTheme("light")}
        className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
          theme === "light" ? "text-blue-600 bg-neutral-100 dark:bg-transparent" : "text-neutral-500 hover:text-neutral-900 dark:text-[#a2b591] dark:hover:text-white"
        }`}
      >
        <Sun className="h-4 w-4" />
        <span className="sr-only">Light</span>
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
          theme === "dark" || !theme ? "text-[#f4f3ed] bg-[#2c471c]" : "text-neutral-500 hover:text-neutral-900"
        }`}
      >
        <Moon className="h-4 w-4" />
        <span className="sr-only">Dark</span>
      </button>
      
      {/* Sliding background pill */}
      <div 
        className={`absolute left-1 top-1 h-7 w-7 rounded-full bg-neutral-100 dark:bg-[#3f612d] transition-transform duration-300 ${
          theme === "dark" || !theme ? "translate-x-7" : "translate-x-0"
        }`}
      ></div>
    </div>
  );
}
