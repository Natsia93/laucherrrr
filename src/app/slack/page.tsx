"use client";

import dynamic from "next/dynamic";
import React from "react";

const SlackStudio = dynamic(
  () => import("@/components/slack/SlackStudio").then((m) => m.SlackStudio),
  {
    ssr: false,
    loading: () => (
      <div className="w-screen h-screen flex items-center justify-center bg-[#faf9f6] dark:bg-[#090909] text-neutral-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-neutral-400 dark:border-neutral-600 border-t-transparent dark:border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono tracking-wide text-neutral-500 dark:text-neutral-400">
            Loading Launcher OS Slack Workspace...
          </span>
        </div>
      </div>
    ),
  }
);

export default function SlackPage() {
  return <SlackStudio />;
}
