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
    <div className="md:hidden fixed bottom-6 left-0 right-0 z-[100] px-4 pointer-events-none">
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 20 }}
        className="bg-white/80 dark:bg-[#10140d]/80 backdrop-blur-lg border border-[#dcdad1] dark:border-[#3f612d]/30 rounded-full p-2 flex items-center justify-around shadow-2xl max-w-[280px] mx-auto pointer-events-auto"
      >
        <Link href="/dashboard" className="flex-1">
          <button className={`w-full flex flex-col items-center gap-1 py-1 transition-colors ${isDashboard ? 'text-[#4d7537] dark:text-[#f4f3ed]' : 'text-neutral-500 dark:text-[#a2b591] hover:text-[#4d7537]'}`}>
            <Folder className={`w-5 h-5 ${isDashboard ? 'stroke-[2.5px]' : ''}`} />
            <span className={`text-[10px] font-sans ${isDashboard ? 'font-bold' : 'font-medium'}`}>Penyimpanan</span>
          </button>
        </Link>
        <div className="w-px h-8 bg-neutral-200 dark:bg-[#3f612d]/20"></div>
        <Link href="/" className="flex-1">
          <button className={`w-full flex flex-col items-center gap-1 py-1 transition-colors ${isGenerate ? 'text-[#4d7537] dark:text-[#f4f3ed]' : 'text-neutral-500 dark:text-[#a2b591] hover:text-[#4d7537]'}`}>
            <Sparkles className={`w-5 h-5 ${isGenerate ? 'stroke-[2.5px]' : ''}`} />
            <span className={`text-[10px] font-sans ${isGenerate ? 'font-bold' : 'font-medium'}`}>Generate</span>
          </button>
        </Link>
      </motion.div>
    </div>
  );
}
