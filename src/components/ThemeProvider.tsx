"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

// Membungkam peringatan React 19 tentang tag script di lingkungan pengembangan
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === "string" && args[0].includes("Encountered a script tag")) {
      return;
    }
    originalError.apply(console, args);
  };
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if new browser session / fresh login
    const hasInitialized = sessionStorage.getItem("launcher_session_theme_set");
    if (!hasInitialized) {
      // Force default light mode on every fresh login / new session
      localStorage.setItem("theme", "light");
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      sessionStorage.setItem("launcher_session_theme_set", "true");
    }
  }, []);

  return (
    <NextThemesProvider {...props} defaultTheme="light" enableSystem={false}>
      {children}
    </NextThemesProvider>
  );
}
