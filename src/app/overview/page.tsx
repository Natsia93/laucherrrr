"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { AppShell } from "@/components/layout/AppShell";

import dynamic from "next/dynamic";

// Modular Overview Components
import { GreetingHeader } from "@/components/overview/GreetingHeader";
import { CreditsUsageCard } from "@/components/overview/CreditsUsageCard";
import { OverviewToDoList } from "@/components/overview/OverviewToDoList";
import { OverviewScratchpad } from "@/components/overview/OverviewScratchpad";
import { OverviewAgenda } from "@/components/overview/OverviewAgenda";

const OverviewAnalyticsCharts = dynamic(
  () =>
    import("@/components/overview/OverviewAnalyticsCharts").then(
      (m) => m.OverviewAnalyticsCharts
    ),
  {
    ssr: false,
    loading: () => (
      <div className="p-6 bg-white dark:bg-[#121212] border border-neutral-200/80 dark:border-neutral-800 rounded-xl shadow-xs flex flex-col justify-between h-[275px] min-h-[275px] animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-5 w-36 bg-neutral-200/70 dark:bg-neutral-800 rounded"></div>
          <div className="h-3 w-20 bg-neutral-100 dark:bg-neutral-800/60 rounded"></div>
        </div>
        <div className="h-[185px] w-full flex items-end gap-3 pt-6 pb-2">
          {[40, 65, 30, 80, 50, 90, 45].map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div
                className="w-full bg-neutral-100 dark:bg-neutral-800/80 rounded-t-sm"
                style={{ height: `${h}%` }}
              ></div>
              <div className="h-3 w-6 bg-neutral-200/60 dark:bg-neutral-800/50 rounded-xs"></div>
            </div>
          ))}
        </div>
      </div>
    ),
  }
);

import { WifiOff } from "lucide-react";

export default function OverviewPage() {
  const { setTheme } = useTheme();
  const [isOffline, setIsOffline] = useState(false);

  // Enforce light mode on every fresh session / login entry
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hasInitialized = sessionStorage.getItem("launcher_overview_theme_initialized");
    if (!hasInitialized) {
      setTheme("light");
      localStorage.setItem("theme", "light");
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      sessionStorage.setItem("launcher_overview_theme_initialized", "true");
    }
  }, [setTheme]);

  // Detect offline / poor connectivity
  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsOffline(!navigator.onLine);

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <AppShell>
      <div className="max-w-[1200px] mx-auto px-2 sm:px-4 lg:px-6 space-y-6 pb-28 sm:pb-12">
        {/* OFFLINE RESILIENCE BANNER */}
        {isOffline && (
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs sm:text-sm font-medium">
            <WifiOff className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>Koneksi internet terputus. Dashboard tetap aktif menggunakan data cache lokal.</span>
          </div>
        )}

        {/* 1. CLEAN GREETING & HEADER */}
        <GreetingHeader />

        {/* 2. TOP ROW: CREDITS USAGE + 7-DAY USAGE CHART */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <CreditsUsageCard />
          <OverviewAnalyticsCharts />
        </div>

        {/* 3. BOTTOM ROW: 3 EQUAL COLUMNS (Jadwal -> To-Do List -> Catatan) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {/* PALING KIRI: Agenda & Jadwal */}
          <OverviewAgenda />

          {/* TENGAH: Daftar Tugas & Fokus */}
          <OverviewToDoList />

          {/* PALING KANAN: Scratchpad & Catatan */}
          <OverviewScratchpad />
        </div>
      </div>
    </AppShell>
  );
}
