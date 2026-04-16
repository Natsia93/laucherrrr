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
      initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export function DashboardTableRow({ children, index, className }: { children: React.ReactNode, index: number, className?: string }) {
  return (
    <motion.tr
      initial={{ opacity: 0, x: -10, filter: "blur(8px)" }}
      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, x: 10, filter: "blur(8px)", transition: { duration: 0.2 } }}
      transition={{ delay: 0.1 * index, duration: 0.4 }}
      layout
      className={`border-b border-neutral-100 dark:border-[#3f612d]/20 hover:bg-neutral-50 dark:hover:bg-[#1a2315]/40 transition-colors group ${className || ""}`}
    >
      {children}
    </motion.tr>
  );
}
