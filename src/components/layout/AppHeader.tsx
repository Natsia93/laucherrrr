"use client";

import React from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useSidebar } from "./SidebarContext";

import { LivePresenceStack } from "./LivePresenceStack";

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

      {/* Right: Contextual Actions, Live Presence Collaborators & Theme Toggle */}
      <div className="flex items-center gap-3">
        {actions}
        <LivePresenceStack />
        <ThemeToggle />
      </div>
    </header>
  );
}
