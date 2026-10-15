"use client";

import dynamic from "next/dynamic";
import React from "react";
import { AppShell } from "@/components/layout/AppShell";

const AgenticVisionStudio = dynamic(
  () => import("@/components/agentic-vision/AgenticVisionStudio").then((m) => m.AgenticVisionStudio),
  {
    ssr: false,
    loading: () => (
      <div className="w-full min-h-[500px] flex items-center justify-center text-neutral-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-7 h-7 border-2 border-[#FFE54C] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono tracking-wide text-neutral-500 dark:text-neutral-400">
            Initializing Launcher OS Agentic Vision...
          </span>
        </div>
      </div>
    ),
  }
);

export default function AgenticVisionPage() {
  return (
    <AppShell>
      <AgenticVisionStudio />
    </AppShell>
  );
}
