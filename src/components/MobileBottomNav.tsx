"use client";

import React from "react";
import Link from "next/link";
import { Folder, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

export function MobileBottomNav() {
  const pathname = usePathname();
  
  // Don't show on workspace as it has its own floating AI toggle
  if (pathname.startsWith("/workspace")) return null;
  // Don't show on login/register
  if (pathname === "/login" || pathname === "/register") return null;

  const isDashboard = pathname === "/dashboard";
  const isGenerate = pathname === "/";

  return (
    <div className="md:hidden fixed bottom-5 left-0 right-0 z-[100] px-4 pointer-events-none">
      <motion.div 
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 25 }}
        className="bg-white/90 dark:bg-[#0d110a]/90 backdrop-blur-md border border-[#dcdad1]/60 dark:border-[#3f612d]/30 rounded-2xl p-1.5 flex items-center justify-around shadow-xl max-w-[210px] mx-auto pointer-events-auto"
      >
        <Link href="/dashboard" className="flex-1">
          <button className={`w-full flex flex-col items-center gap-0.5 py-1 transition-colors ${isDashboard ? 'text-[#4d7537] dark:text-[#f4f3ed]' : 'text-neutral-400 dark:text-[#a2b591]/50 hover:text-[#4d7537]'}`}>
            <Folder className={`w-4 h-4 ${isDashboard ? 'stroke-[2.5px]' : ''}`} />
            <span className={`text-[9px] font-sans ${isDashboard ? 'font-semibold' : 'font-medium'}`}>Dokumen</span>
          </button>
        </Link>
        <div className="w-px h-6 bg-neutral-200 dark:bg-[#3f612d]/20 mx-1"></div>
        <Link href="/" className="flex-1">
          <button className={`w-full flex flex-col items-center gap-0.5 py-1 transition-colors ${isGenerate ? 'text-[#4d7537] dark:text-[#f4f3ed]' : 'text-neutral-400 dark:text-[#a2b591]/50 hover:text-[#4d7537]'}`}>
            <Sparkles className={`w-4 h-4 ${isGenerate ? 'stroke-[2.5px]' : ''}`} />
            <span className={`text-[9px] font-sans ${isGenerate ? 'font-semibold' : 'font-medium'}`}>Generate</span>
          </button>
        </Link>
      </motion.div>
    </div>
  );
}
