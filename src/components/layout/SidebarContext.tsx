"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface SidebarContextType {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  toggleCollapsed: () => void;
  mobileOpen: boolean;
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isMoodPending: boolean;
  setIsMoodPending: React.Dispatch<React.SetStateAction<boolean>>;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMoodPending, setIsMoodPending] = useState<boolean>(false);

  // Sync state from client storage on mount to avoid hydration mismatch
  useEffect(() => {
    try {
      const saved = localStorage.getItem("sidebar_collapsed");
      if (saved !== null) {
        setCollapsed(saved === "true");
      }
      const moodChecked = sessionStorage.getItem("user_mood_checked_session");
      setIsMoodPending(moodChecked !== "true");
    } catch {
      // ignore
    }

    const handleMoodChanged = () => {
      setTimeout(() => {
        setIsMoodPending(false);
      }, 350);
    };

    window.addEventListener("user_mood_changed", handleMoodChanged);
    return () => window.removeEventListener("user_mood_changed", handleMoodChanged);
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("sidebar_collapsed", String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  return (
    <SidebarContext.Provider
      value={{
        collapsed,
        setCollapsed,
        toggleCollapsed,
        mobileOpen,
        setMobileOpen,
        isMoodPending,
        setIsMoodPending,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

const defaultSidebarContext: SidebarContextType = {
  collapsed: false,
  setCollapsed: () => {},
  toggleCollapsed: () => {},
  mobileOpen: false,
  setMobileOpen: () => {},
  isMoodPending: false,
  setIsMoodPending: () => {},
};

export function useSidebar() {
  const context = useContext(SidebarContext);
  return context || defaultSidebarContext;
}
