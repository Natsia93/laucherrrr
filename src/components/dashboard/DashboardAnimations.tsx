"use client";

import { motion } from "framer-motion";
import React from "react";

export function DashboardContainer({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
      }}
      className="space-y-8"
    >
      {children}
    </motion.div>
  );
}

export function DashboardFadeIn({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export function DashboardTableRow({ children, index, className }: { children: React.ReactNode, index: number, className?: string }) {
  return (
    <motion.tr
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 6, transition: { duration: 0.15 } }}
      transition={{ delay: 0.05 * index, duration: 0.25 }}
      layout
      className={`border-b border-neutral-100 dark:border-[#3f612d]/20 hover:bg-neutral-50 dark:hover:bg-[#1a2315]/40 transition-colors group ${className || ""}`}
    >
      {children}
    </motion.tr>
  );
}
