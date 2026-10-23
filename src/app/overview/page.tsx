"use client";

import React, { useEffect } from "react";
import { useTheme } from "next-themes";
import { AppShell } from "@/components/layout/AppShell";

// Modular Overview Components
import { GreetingHeader } from "@/components/overview/GreetingHeader";
import { CreditsUsageCard } from "@/components/overview/CreditsUsageCard";
import { OverviewAnalyticsCharts } from "@/components/overview/OverviewAnalyticsCharts";
import { OverviewToDoList } from "@/components/overview/OverviewToDoList";
import { OverviewScratchpad } from "@/components/overview/OverviewScratchpad";
import { OverviewAgenda } from "@/components/overview/OverviewAgenda";

export default function OverviewPage() {
  const { setTheme } = useTheme();

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

  return (
    <AppShell>
      <div className="max-w-[1200px] mx-auto px-2 sm:px-4 lg:px-6 space-y-6 pb-12">
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
