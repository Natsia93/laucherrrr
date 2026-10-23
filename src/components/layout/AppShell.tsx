"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { SidebarProvider, useSidebar } from "./SidebarContext";

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
}

function AppShellInner({
  children,
  headerActions,
}: AppShellProps) {
  const { collapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-[#faf9f6] dark:bg-[#090909] text-neutral-900 dark:text-neutral-100 font-sans antialiased selection:bg-[#ffd100]/40 selection:text-neutral-950 transition-colors duration-200 relative">
      {/* Top Header Background Image with Smooth Bottom Fade */}
      <div
        className={`absolute top-0 inset-x-0 h-[360px] pointer-events-none select-none z-0 overflow-hidden transition-[padding] duration-300 ${
          collapsed ? "lg:pl-[70px]" : "lg:pl-[238px]"
        }`}
      >
        <div className="relative w-full h-full">
          <Image
            src="/bg-hero.jpg"
            alt="Interior Background"
            fill
            sizes="100vw"
            priority
            className="object-cover object-center opacity-15 dark:opacity-5 grayscale contrast-100"
          />
          {/* Smooth Fade mask from top image to white/dark background */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#faf9f6]/30 via-[#faf9f6]/85 to-[#faf9f6] dark:from-[#090909]/40 dark:via-[#090909]/90 dark:to-[#090909]" />
        </div>
      </div>

      {/* Subtle Warm Yellow Gradient Aura in Bottom-Right Corner */}
      <div
        className="fixed bottom-0 right-0 w-[420px] h-[420px] sm:w-[600px] sm:h-[600px] pointer-events-none select-none z-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -bottom-24 -right-24 w-[500px] h-[500px] sm:w-[680px] sm:h-[680px] rounded-full bg-gradient-to-tl from-[#FFD100]/22 via-[#FFE500]/8 to-transparent blur-3xl dark:from-[#FFE500]/12 dark:via-[#FFD100]/3 dark:to-transparent" />
      </div>

      {/* Persistent Sidebar */}
      <AppSidebar />

      {/* Main Wrapper with dynamic sidebar left offset on desktop */}
      <div
        className={`flex flex-col min-h-screen transition-[padding] duration-200 relative ${
          collapsed ? "lg:pl-[70px]" : "lg:pl-[238px]"
        }`}
      >
        <AppHeader actions={headerActions} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6 relative overflow-x-hidden pb-28 sm:pb-8">
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.15,
              ease: "easeOut",
            }}
            className="w-full space-y-6"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

export function AppShell(props: AppShellProps) {
  return <AppShellInner {...props} />;
}
