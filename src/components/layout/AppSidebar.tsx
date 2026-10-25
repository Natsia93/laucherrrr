"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Presentation,
  Calendar,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Menu,
  X,
  Workflow,
  LogOut,
  Settings,
  LayoutDashboard,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "./SidebarContext";
import { authClient } from "@/lib/auth-client";
import { LogoutConfirmModal } from "./LogoutConfirmModal";

import {
  AnimatedOverviewIcon,
  AnimatedCompassIcon,
  AnimatedDeckIcon,
  AnimatedCalendarIcon,
  AnimatedSlackIcon,
  AnimatedWorkflowIcon,
  AnimatedSettingsIcon,
  AnimatedLogoutIcon,
} from "@/components/ui/animated-icons/SidebarAnimatedIcons";
import { SidebarChatHistory } from "./SidebarChatHistory";

export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  {
    title: "Overview",
    href: "/overview",
    icon: AnimatedOverviewIcon,
  },
  {
    title: "LLM Mode",
    href: "/dashboard",
    icon: AnimatedCompassIcon,
  },
  {
    title: "Deck Generator",
    href: "/decks",
    icon: AnimatedDeckIcon,
  },
  {
    title: "Google Calendar",
    href: "/integrations/calendar",
    icon: AnimatedCalendarIcon,
  },
  {
    title: "Slack Workspace",
    href: "/slack",
    icon: AnimatedSlackIcon,
  },
  {
    title: "Launcher Automation",
    href: "/automation",
    icon: AnimatedWorkflowIcon,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: AnimatedSettingsIcon,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { collapsed, toggleCollapsed, mobileOpen, setMobileOpen, isMoodPending } = useSidebar();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const handleOpen = () => setShowLogoutModal(true);
    window.addEventListener("open_logout_modal", handleOpen);
    return () => window.removeEventListener("open_logout_modal", handleOpen);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("user_daily_mood");
        sessionStorage.removeItem("user_mood_checked_session");
        sessionStorage.removeItem("overview_charts_animated");
        document.cookie = "better-auth.session_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "better-auth.session_data=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
      await authClient.signOut();
    } catch (err) {
      console.error("SignOut error:", err);
    } finally {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
      setMobileOpen(false);
      if (typeof window !== "undefined") {
        window.location.href = "/login?loggedOut=true";
      } else {
        router.push("/login?loggedOut=true");
      }
    }
  };

  return (
    <>
      {/* Mobile Toggle Button (Clean icon only, no wrapper box or shadow) */}
      <div className="lg:hidden fixed top-3 left-4 z-50">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="p-1 text-neutral-800 dark:text-neutral-200 hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer select-none focus:outline-none"
          aria-label="Open sidebar"
        >
          <Menu className="w-6 h-6 stroke-[2]" />
        </button>
      </div>

      {/* Mobile Backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-50"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container: Vibrant Bright Yellow in Light Mode, Sleek Dark in Dark Mode */}
      <aside
        className={`group/sidebar fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-gradient-to-b from-[#FFE54C] via-[#FFDE3C] to-[#FCD526] dark:bg-none dark:from-transparent dark:to-transparent dark:bg-[#0d0d0d] border-r-0 dark:border-r dark:border-neutral-800/90 transition-[width] duration-300 ease-in-out select-none
          ${collapsed ? "w-[70px]" : "w-[238px]"}
          ${mobileOpen ? "translate-x-0 w-[255px]" : "-translate-x-full lg:translate-x-0"}
          ${isMoodPending ? "pointer-events-none select-none" : ""}
        `}
      >
        {/* Sidebar Header: Clean Logo & Brand aligned perfectly with Navbar height (h-14) */}
        <div
          className={`h-14 flex items-center border-b border-black/10 dark:border-neutral-800/80 ${
            collapsed && !mobileOpen ? "justify-center px-2" : "justify-between px-5"
          }`}
        >
          {(!collapsed || mobileOpen) ? (
            <Link href="/overview" className="flex items-center gap-2.5 group overflow-hidden py-1" title="Launcher OS">
              <div className="relative w-6 h-6 shrink-0">
                <Image
                  src="/logo/Logo_revou.png"
                  alt="RevoU Logo"
                  fill
                  sizes="24px"
                  className="object-contain"
                  priority
                />
              </div>
              <span className="font-lora font-medium text-[20px] text-neutral-950 dark:text-white tracking-tight truncate">
                Launcher OS
              </span>
            </Link>
          ) : (
            <button
              onClick={toggleCollapsed}
              className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-black/10 dark:hover:bg-neutral-800 text-neutral-900/80 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer"
              title="Expand sidebar"
            >
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}

          {/* Desktop Collapse Toggle */}
          {(!collapsed || mobileOpen) && (
            <button
              onClick={toggleCollapsed}
              className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg hover:bg-black/10 dark:hover:bg-neutral-800 text-neutral-900/70 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer"
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}

          {/* Mobile Close Button */}
          {mobileOpen && (
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg text-neutral-900 hover:bg-black/10 dark:text-neutral-300"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation List & Chats with hover-only scrollbar */}
        <div className="flex-1 overflow-y-auto px-3 pt-5 pb-2 space-y-1.5 [scrollbar-width:none] group-hover/sidebar:[scrollbar-width:thin] [scrollbar-color:transparent_transparent] group-hover/sidebar:[scrollbar-color:rgba(150,150,150,0.3)_transparent] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-transparent group-hover/sidebar:[&::-webkit-scrollbar-thumb]:bg-black/20 dark:group-hover/sidebar:[&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full">
          {MAIN_NAV_ITEMS.map((item, itemIdx) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href) || (item.href === "/slack" && pathname.startsWith("/integrations/slack"));

            return (
              <Link
                key={itemIdx}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`group relative flex items-center gap-3 px-3 py-2 rounded-lg text-[14px] leading-snug transition-all duration-150 ${
                  isActive
                    ? "bg-[#FFE853] dark:bg-[#212121] border border-[#E5BC10] dark:border-white/[0.07] text-neutral-950 dark:text-neutral-100 font-medium shadow-xs dark:shadow-none"
                    : "text-neutral-950/85 hover:text-neutral-950 hover:bg-[#FFE853]/50 dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-[#1a1a1a] font-normal border border-transparent"
                } ${collapsed && !mobileOpen ? "justify-center px-0 py-2" : ""}`}
                title={collapsed && !mobileOpen ? item.title : undefined}
              >
                <Icon
                  className={`w-4.5 h-4.5 shrink-0 transition-colors ${
                    isActive
                      ? "text-neutral-950 dark:text-neutral-100 stroke-[2]"
                      : "text-neutral-900/70 group-hover:text-neutral-950 dark:text-neutral-400 dark:group-hover:text-neutral-200 stroke-[1.8]"
                  }`}
                />

                {(!collapsed || mobileOpen) && (
                  <span className="truncate">{item.title}</span>
                )}
              </Link>
            );
          })}

          {/* Collapsible and scrollable chat history dropdown ala Kimi.ai */}
          <SidebarChatHistory
            collapsed={collapsed}
            mobileOpen={mobileOpen}
            onCloseMobile={() => setMobileOpen(false)}
          />
        </div>

        {/* Sidebar Footer / Logout Button */}
        <div className="p-3 border-t border-black/10 dark:border-neutral-800/80">
          {(!collapsed || mobileOpen) ? (
            <button
              type="button"
              onClick={() => setShowLogoutModal(true)}
              className="group w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-neutral-950/85 hover:text-red-700 hover:bg-black/10 dark:text-neutral-300 dark:hover:text-red-400 dark:hover:bg-white/5 transition-all cursor-pointer active:scale-98"
              title="Sign Out"
            >
              <AnimatedLogoutIcon size={16} className="text-neutral-900 group-hover:text-red-700 dark:text-neutral-300 dark:group-hover:text-red-400 transition-colors" />
              <span>Logout</span>
            </button>
          ) : (
            <div className="flex justify-center py-1">
              <button
                type="button"
                onClick={() => setShowLogoutModal(true)}
                className="group flex items-center justify-center w-10 h-10 rounded-lg text-neutral-950/85 hover:text-red-700 hover:bg-black/10 dark:text-neutral-300 dark:hover:text-red-400 dark:hover:bg-white/5 transition-all cursor-pointer active:scale-95"
                title="Logout"
              >
                <AnimatedLogoutIcon size={18} className="text-neutral-900 group-hover:text-red-700 dark:text-neutral-300 dark:group-hover:text-red-400 transition-colors" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Logout Confirmation Modal with MoodCheck frosted glass blur & spring animation */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => !isLoggingOut && setShowLogoutModal(false)}
        onConfirm={handleLogout}
        isLoading={isLoggingOut}
      />
    </>
  );
}
