"use client";

import React from "react";
import dynamic from "next/dynamic";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useSidebar } from "./SidebarContext";

const LivePresenceStack = dynamic(
  () => import("./LivePresenceStack").then((mod) => mod.LivePresenceStack),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center -space-x-2.5 p-0.5">
        <div className="w-10 h-10 rounded-full border-[1.5px] border-white dark:border-[#141414] bg-neutral-200/60 dark:bg-neutral-800/60 animate-pulse" />
      </div>
    ),
  }
);

interface AppHeaderProps {
  actions?: React.ReactNode;
}

export function AppHeader({ actions }: AppHeaderProps) {
  const { isMoodPending } = useSidebar();

  return (
    <header
      className={`sticky top-0 z-40 h-14 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800/80 px-4 lg:px-8 flex items-center justify-between gap-4 ${
        isMoodPending ? "pointer-events-none select-none" : ""
      }`}
    >
      {/* Left spacer for mobile hamburger alignment */}
      <div className="flex items-center pl-12 lg:pl-0" />

      {/* Right: Live Presence Collaborators, Theme Toggle & Contextual Actions */}
      <div className="flex items-center gap-3">
        <LivePresenceStack />
        <ThemeToggle />
        {actions}
      </div>
    </header>
  );
}
