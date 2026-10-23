"use client";

import React from "react";
import Link from "next/link";
import { LayoutDashboard, Bot, Calendar, Workflow } from "lucide-react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

export function MobileBottomNav() {
  const pathname = usePathname();
  
  // Don't show on workspace or auth screens
  if (pathname.startsWith("/workspace") || pathname === "/login" || pathname === "/register" || pathname === "/") return null;

  const navItems = [
    { label: "Overview", href: "/overview", icon: LayoutDashboard },
    { label: "AI Docs", href: "/dashboard", icon: Bot },
    { label: "Calendar", href: "/integrations/calendar", icon: Calendar },
    { label: "Automations", href: "/automation", icon: Workflow },
  ];

  return (
    <div className="md:hidden fixed bottom-4 left-0 right-0 z-[100] px-4 pointer-events-none flex justify-center">
      <motion.div 
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 26 }}
        className="bg-white/95 dark:bg-[#141414]/95 backdrop-blur-xl border border-neutral-200/90 dark:border-neutral-800 rounded-2xl p-1.5 flex items-center gap-1 shadow-2xl pointer-events-auto"
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <button className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
                isActive 
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-semibold' 
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}>
                <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.4px]' : 'stroke-[1.8]'}`} />
                <span className="text-[10px] tracking-tight">{item.label}</span>
              </button>
            </Link>
          );
        })}
      </motion.div>
    </div>
  );
}

