"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function OverviewFeatureCards() {
  return (
    <div className="w-full">
      {/* Embedded CSS Animations for Buttery-Smooth Vector Motion */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes strokeDash {
          0% { stroke-dashoffset: 40; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes flowPulse {
          0%, 100% { opacity: 0.3; transform: scale(0.96); }
          50% { opacity: 1; transform: scale(1.04); }
        }
        @keyframes floatSubtle {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-3px); }
        }
        @keyframes floatAlt {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(3px); }
        }
        @keyframes popPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.12); }
        }
        @keyframes cursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes scanline {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(120%); }
        }
        @keyframes beaconPing {
          0% { transform: scale(1); opacity: 0.8; }
          70%, 100% { transform: scale(2.2); opacity: 0; }
        }
        .anim-dash {
          stroke-dasharray: 6 4;
          animation: strokeDash 1.4s linear infinite;
        }
        .anim-dash-fast {
          stroke-dasharray: 4 3;
          animation: strokeDash 0.9s linear infinite;
        }
        .anim-float {
          animation: floatSubtle 4s ease-in-out infinite;
        }
        .anim-float-alt {
          animation: floatAlt 4.5s ease-in-out infinite;
        }
        .anim-pulse-slow {
          animation: flowPulse 2.8s ease-in-out infinite;
        }
        .anim-cursor {
          animation: cursorBlink 0.9s steps(2, start) infinite;
        }
        .anim-handle {
          animation: popPulse 2.2s ease-in-out infinite;
        }
        .anim-beacon {
          transform-origin: center;
          animation: beaconPing 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 items-stretch">
        
        {/* ══════════════════════════════════════════════════════════
         * CARD 1: LLM MODE (Abstract AI Chat & Prompt Studio)
         * ══════════════════════════════════════════════════════════ */}
        <Link href="/dashboard" className="group block h-full">
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="h-full flex flex-col justify-between p-4.5 sm:p-5 rounded-2xl bg-white dark:bg-[#121212] border border-neutral-200/90 dark:border-neutral-800 hover:border-neutral-400/80 dark:hover:border-neutral-700 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            {/* Visual Canvas Area with Blueprint Grid */}
            <div className="relative w-full h-36 sm:h-40 rounded-xl overflow-hidden bg-neutral-50/80 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800/80 flex items-center justify-center p-2 mb-4 select-none">
              <div
                className="absolute inset-0 opacity-45 dark:opacity-25 pointer-events-none"
                style={{
                  backgroundImage: "radial-gradient(#9ca3af 1px, transparent 1px)",
                  backgroundSize: "14px 14px",
                }}
              />

              {/* Badge */}
              <div className="absolute top-2.5 right-2.5 z-10">
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase bg-[#FFDE3C] text-neutral-950 shadow-2xs">
                  AI CORE
                </span>
              </div>

              {/* Pure Vector Abstract Wireframe Illustration */}
              <div className="relative z-10 w-full max-w-[210px] transition-transform duration-300 group-hover:scale-[1.04]">
                <svg viewBox="0 0 210 115" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto drop-shadow-xs">
                  {/* Outer Window */}
                  <rect x="2" y="2" width="206" height="111" rx="8" className="fill-white dark:fill-[#181818] stroke-neutral-300/90 dark:stroke-neutral-700/80" strokeWidth="1.2" />
                  
                  {/* Window Bar */}
                  <line x1="2" y1="20" x2="208" y2="20" className="stroke-neutral-200 dark:stroke-neutral-800" strokeWidth="1" />
                  <circle cx="10" cy="11" r="2.2" className="fill-neutral-300 dark:fill-neutral-600" />
                  <circle cx="17" cy="11" r="2.2" className="fill-neutral-300 dark:fill-neutral-600" />
                  <circle cx="24" cy="11" r="2.2" className="fill-neutral-300 dark:fill-neutral-600" />

                  {/* Top Tool Icons Row (Abstract like AndalAI on ngodingpakeai) */}
                  <g className="anim-float">
                    <rect x="74" y="5" width="13" height="11" rx="3" className="fill-neutral-100 dark:fill-neutral-800 stroke-neutral-300 dark:stroke-neutral-700" strokeWidth="0.8" />
                    <circle cx="80.5" cy="10.5" r="2" className="fill-neutral-400 dark:fill-neutral-500" />

                    <rect x="91" y="5" width="15" height="11" rx="3" className="fill-[#FFE54C]/20 dark:fill-[#FFE54C]/10 stroke-[#E5BC10]" strokeWidth="1" />
                    <path d="M98.5 8 L99.5 10 L101.5 10.5 L99.5 11 L98.5 13 L97.5 11 L95.5 10.5 L97.5 10 Z" className="fill-[#E5BC10]" />

                    <rect x="110" y="5" width="13" height="11" rx="3" className="fill-neutral-100 dark:fill-neutral-800 stroke-neutral-300 dark:stroke-neutral-700" strokeWidth="0.8" />
                    <line x1="116.5" y1="8" x2="116.5" y2="13" className="stroke-neutral-400 dark:stroke-neutral-500" strokeWidth="1" strokeLinecap="round" />
                    <line x1="114" y1="10.5" x2="119" y2="10.5" className="stroke-neutral-400 dark:stroke-neutral-500" strokeWidth="1" strokeLinecap="round" />

                    <rect x="127" y="5" width="13" height="11" rx="3" className="fill-neutral-100 dark:fill-neutral-800 stroke-neutral-300 dark:stroke-neutral-700" strokeWidth="0.8" />
                    <circle cx="133.5" cy="10.5" r="2" className="stroke-neutral-400 dark:stroke-neutral-500" strokeWidth="0.8" />
                  </g>

                  {/* Highlighted Prompt Input Box (Orange/Yellow Border with Skeleton text lines) */}
                  <g className="anim-pulse-slow">
                    <rect x="14" y="27" width="182" height="26" rx="6" className="fill-neutral-50/80 dark:fill-neutral-900/80 stroke-[#FFDE3C] dark:stroke-[#E5BC10]" strokeWidth="1.2" />
                    {/* Skeleton Text Bar 1 */}
                    <rect x="24" y="34" width="70" height="4" rx="2" className="fill-neutral-700 dark:fill-neutral-200" />
                    {/* Skeleton Text Bar 2 */}
                    <rect x="24" y="42" width="115" height="3" rx="1.5" className="fill-neutral-400 dark:fill-neutral-500" />
                    {/* Blinking Typing Cursor */}
                    <rect x="142" y="41" width="2" height="5" rx="1" className="fill-[#E5BC10] anim-cursor" />
                  </g>

                  {/* AI Response Card Wireframe (Bottom Area) */}
                  <g className="anim-float-alt">
                    <rect x="14" y="60" width="182" height="44" rx="6" className="fill-neutral-50/70 dark:fill-[#202020]/70 stroke-neutral-200 dark:stroke-neutral-800" strokeWidth="1" />
                    
                    {/* AI Avatar with Breathing Ping Ring */}
                    <circle cx="28" cy="74" r="7" className="fill-[#FFDE3C] anim-beacon" />
                    <circle cx="28" cy="74" r="6" className="fill-[#FFE54C] stroke-[#E5BC10]" strokeWidth="1" />
                    <path d="M28 71.5 L28.8 73.2 L30.5 74 L28.8 74.8 L28 76.5 L27.2 74.8 L25.5 74 L27.2 73.2 Z" className="fill-neutral-950" />

                    {/* Skeleton Response Lines */}
                    <rect x="42" y="68" width="110" height="4.5" rx="2" className="fill-neutral-800 dark:fill-neutral-200" />
                    <rect x="42" y="76" width="140" height="3.5" rx="1.5" className="fill-neutral-400 dark:fill-neutral-500" />
                    <rect x="42" y="83" width="95" height="3.5" rx="1.5" className="fill-neutral-400/80 dark:fill-neutral-600" />

                    {/* Action Pill Badge Bottom Right */}
                    <rect x="156" y="88" width="32" height="11" rx="4" className="fill-neutral-200/90 dark:fill-neutral-800" />
                    <rect x="162" y="92.5" width="20" height="2.5" rx="1" className="fill-neutral-500 dark:fill-neutral-400" />
                  </g>
                </svg>
              </div>
            </div>

            {/* Content Area */}
            <div className="space-y-1.5">
              <h3 className="text-[15.5px] font-bold text-neutral-900 dark:text-white tracking-tight flex items-center justify-between">
                <span>LLM Mode</span>
                <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-950 dark:group-hover:text-white transition-transform duration-200 group-hover:translate-x-1" />
              </h3>
              <p className="text-[12.5px] text-neutral-500 dark:text-neutral-400 leading-relaxed font-normal">
                Multi-model reasoning, riset kurikulum, dan chat pintar tanpa batas token.
              </p>
            </div>
          </motion.div>
        </Link>

        {/* ══════════════════════════════════════════════════════════
         * CARD 2: DECK GENERATOR (Canvas Wireframe & Selection Box)
         * ══════════════════════════════════════════════════════════ */}
        <Link href="/decks" className="group block h-full">
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="h-full flex flex-col justify-between p-4.5 sm:p-5 rounded-2xl bg-white dark:bg-[#121212] border border-neutral-200/90 dark:border-neutral-800 hover:border-neutral-400/80 dark:hover:border-neutral-700 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            {/* Visual Canvas Area */}
            <div className="relative w-full h-36 sm:h-40 rounded-xl overflow-hidden bg-neutral-50/80 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800/80 flex items-center justify-center p-2 mb-4 select-none">
              <div
                className="absolute inset-0 opacity-45 dark:opacity-25 pointer-events-none"
                style={{
                  backgroundImage: "radial-gradient(#9ca3af 1px, transparent 1px)",
                  backgroundSize: "14px 14px",
                }}
              />

              {/* Badge */}
              <div className="absolute top-2.5 right-2.5 z-10">
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase bg-purple-600 text-white shadow-2xs">
                  SLIDES
                </span>
              </div>

              {/* Pure Vector Abstract Wireframe Illustration */}
              <div className="relative z-10 w-full max-w-[210px] transition-transform duration-300 group-hover:scale-[1.04]">
                <svg viewBox="0 0 210 115" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto drop-shadow-xs">
                  {/* Background 16:9 Slide Canvas */}
                  <rect x="2" y="2" width="206" height="111" rx="8" className="fill-white dark:fill-[#171717] stroke-neutral-300/90 dark:stroke-neutral-700/80" strokeWidth="1.2" />
                  
                  {/* Window Bar */}
                  <line x1="2" y1="20" x2="208" y2="20" className="stroke-neutral-200 dark:stroke-neutral-800" strokeWidth="1" />
                  <circle cx="10" cy="11" r="2.2" className="fill-neutral-300 dark:fill-neutral-600" />
                  <circle cx="17" cy="11" r="2.2" className="fill-neutral-300 dark:fill-neutral-600" />
                  <circle cx="24" cy="11" r="2.2" className="fill-neutral-300 dark:fill-neutral-600" />

                  {/* Top Slide Header Elements */}
                  <rect x="42" y="7" width="28" height="7" rx="3" className="fill-purple-500/20 stroke-purple-500" strokeWidth="0.8" />
                  <rect x="76" y="8" width="48" height="5" rx="2" className="fill-neutral-300 dark:fill-neutral-700" />

                  {/* Left Slide Content Card (Wireframe Layout) */}
                  <g className="anim-float">
                    <rect x="14" y="30" width="80" height="42" rx="5" className="fill-purple-50/60 dark:fill-purple-950/20 stroke-purple-300 dark:stroke-purple-800/80" strokeWidth="1" />
                    <rect x="22" y="38" width="38" height="5" rx="2" className="fill-purple-700 dark:fill-purple-300" />
                    <rect x="22" y="47" width="62" height="3" rx="1.5" className="fill-purple-400/80 dark:fill-purple-500" />
                    <rect x="22" y="53" width="50" height="3" rx="1.5" className="fill-purple-400/60 dark:fill-purple-600" />
                    <circle cx="78" cy="60" r="4" className="fill-purple-500/20 stroke-purple-500" strokeWidth="0.8" />
                  </g>

                  {/* Floating Bounding Box Selection (Exact Match with "Bikin Plan" on ngodingpakeai) */}
                  <g className="anim-float-alt">
                    <rect x="104" y="26" width="92" height="52" rx="5" className="fill-white/95 dark:fill-[#222222] stroke-purple-500 dark:stroke-purple-400 anim-dash shadow-md" strokeWidth="1.2" />
                    
                    {/* 4 Corner Resize Handles (Square Selection Handles) */}
                    <rect x="101" y="23" width="5" height="5" rx="1" className="fill-purple-600 anim-handle" />
                    <rect x="193" y="23" width="5" height="5" rx="1" className="fill-purple-600 anim-handle" />
                    <rect x="101" y="75" width="5" height="5" rx="1" className="fill-purple-600 anim-handle" />
                    <rect x="193" y="75" width="5" height="5" rx="1" className="fill-purple-600 anim-handle" />

                    {/* Inner Card Skeleton Items */}
                    <rect x="114" y="36" width="46" height="5" rx="2" className="fill-neutral-800 dark:fill-neutral-200" />
                    <rect x="114" y="45" width="70" height="3.5" rx="1.5" className="fill-neutral-400 dark:fill-neutral-500" />
                    <rect x="114" y="52" width="60" height="3.5" rx="1.5" className="fill-neutral-400/80 dark:fill-neutral-600" />

                    {/* Interactive Export Pill */}
                    <rect x="114" y="62" width="34" height="9" rx="4" className="fill-purple-600" />
                    <rect x="122" y="65.5" width="18" height="2" rx="1" className="fill-white" />
                  </g>

                  {/* Bottom Purple Interactive Pill Bar (like DesainPakeAI searchbar) */}
                  <g className="anim-pulse-slow">
                    <rect x="14" y="85" width="182" height="19" rx="9.5" className="fill-neutral-50 dark:fill-neutral-900 stroke-neutral-300 dark:stroke-neutral-700" strokeWidth="1" />
                    {/* Sparkle icon */}
                    <path d="M25 94.5 L26 92.5 L28 92 L26 91.5 L25 89.5 L24 91.5 L22 92 L24 92.5 Z" className="fill-purple-500" />
                    <rect x="34" y="93" width="85" height="3" rx="1.5" className="fill-neutral-400 dark:fill-neutral-500" />
                    {/* Circle Arrow Button */}
                    <circle cx="185" cy="94.5" r="5.5" className="fill-purple-600" />
                    <path d="M185 97 L185 92 M183 94 L185 92 L187 94" stroke="white" strokeWidth="1" strokeLinecap="round" />
                  </g>
                </svg>
              </div>
            </div>

            {/* Content Area */}
            <div className="space-y-1.5">
              <h3 className="text-[15.5px] font-bold text-neutral-900 dark:text-white tracking-tight flex items-center justify-between">
                <span>Deck Generator</span>
                <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-950 dark:group-hover:text-white transition-transform duration-200 group-hover:translate-x-1" />
              </h3>
              <p className="text-[12.5px] text-neutral-500 dark:text-neutral-400 leading-relaxed font-normal">
                Ubah ide, silabus, dan catatan jadi slide presentasi profesional standar ITB × RevoU.
              </p>
            </div>
          </motion.div>
        </Link>

        {/* ══════════════════════════════════════════════════════════
         * CARD 3: GOOGLE CALENDAR (Schedule Grid & Live Flow Timeline)
         * ══════════════════════════════════════════════════════════ */}
        <Link href="/integrations/calendar" className="group block h-full">
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="h-full flex flex-col justify-between p-4.5 sm:p-5 rounded-2xl bg-white dark:bg-[#121212] border border-neutral-200/90 dark:border-neutral-800 hover:border-neutral-400/80 dark:hover:border-neutral-700 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            {/* Visual Canvas Area */}
            <div className="relative w-full h-36 sm:h-40 rounded-xl overflow-hidden bg-neutral-50/80 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800/80 flex items-center justify-center p-2 mb-4 select-none">
              <div
                className="absolute inset-0 opacity-45 dark:opacity-25 pointer-events-none"
                style={{
                  backgroundImage: "radial-gradient(#9ca3af 1px, transparent 1px)",
                  backgroundSize: "14px 14px",
                }}
              />

              {/* Badge */}
              <div className="absolute top-2.5 right-2.5 z-10">
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase bg-emerald-600 text-white shadow-2xs">
                  REALTIME
                </span>
              </div>

              {/* Pure Vector Abstract Wireframe Illustration */}
              <div className="relative z-10 w-full max-w-[210px] transition-transform duration-300 group-hover:scale-[1.04]">
                <svg viewBox="0 0 210 115" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto drop-shadow-xs">
                  {/* Calendar Window Frame */}
                  <rect x="2" y="2" width="206" height="111" rx="8" className="fill-white dark:fill-[#181818] stroke-neutral-300/90 dark:stroke-neutral-700/80" strokeWidth="1.2" />
                  
                  {/* Window Bar */}
                  <line x1="2" y1="20" x2="208" y2="20" className="stroke-neutral-200 dark:stroke-neutral-800" strokeWidth="1" />
                  <rect x="10" y="6" width="26" height="9" rx="3" className="fill-[#FFE54C] stroke-[#E5BC10]" strokeWidth="0.8" />
                  <circle cx="16" cy="10.5" r="1.5" className="fill-neutral-950" />
                  <rect x="20" y="9.5" width="10" height="2" rx="1" className="fill-neutral-950" />
                  
                  <rect x="44" y="8" width="40" height="5" rx="2" className="fill-neutral-400 dark:fill-neutral-600" />
                  
                  {/* Sync Status Badge Top Right */}
                  <g className="anim-pulse-slow">
                    <circle cx="190" cy="10.5" r="3" className="fill-emerald-500" />
                    <circle cx="190" cy="10.5" r="5" className="stroke-emerald-500 anim-beacon" strokeWidth="0.8" />
                  </g>

                  {/* 5 Column Grid Separators */}
                  <line x1="44" y1="20" x2="44" y2="113" className="stroke-neutral-100 dark:stroke-neutral-800/80" strokeWidth="1" />
                  <line x1="86" y1="20" x2="86" y2="113" className="stroke-neutral-100 dark:stroke-neutral-800/80" strokeWidth="1" />
                  <line x1="128" y1="20" x2="128" y2="113" className="stroke-neutral-100 dark:stroke-neutral-800/80" strokeWidth="1" />
                  <line x1="170" y1="20" x2="170" y2="113" className="stroke-neutral-100 dark:stroke-neutral-800/80" strokeWidth="1" />

                  {/* Day Header Wireframe Pills */}
                  <rect x="18" y="26" width="14" height="3" rx="1.5" className="fill-neutral-300 dark:fill-neutral-700" />
                  <rect x="60" y="26" width="14" height="3" rx="1.5" className="fill-neutral-300 dark:fill-neutral-700" />
                  
                  {/* Today Highlight Indicator Pill */}
                  <rect x="100" y="25" width="18" height="5" rx="2.5" className="fill-[#FFE54C] stroke-[#E5BC10]" strokeWidth="0.8" />
                  
                  <rect x="144" y="26" width="14" height="3" rx="1.5" className="fill-neutral-300 dark:fill-neutral-700" />
                  <rect x="184" y="26" width="14" height="3" rx="1.5" className="fill-neutral-300 dark:fill-neutral-700" />

                  {/* Calendar Event Wireframe Blocks (Animated Flow) */}
                  <g className="anim-float">
                    {/* Event Pill 1: Purple Sync Block */}
                    <rect x="8" y="38" width="32" height="24" rx="4" className="fill-purple-50 dark:fill-purple-950/30 stroke-purple-300 dark:stroke-purple-800" strokeWidth="1" />
                    <rect x="12" y="44" width="18" height="3" rx="1.5" className="fill-purple-700 dark:fill-purple-300" />
                    <rect x="12" y="50" width="24" height="2.5" rx="1" className="fill-purple-400" />

                    {/* Event Pill 2: Emerald Active Meeting Block */}
                    <rect x="90" y="36" width="34" height="32" rx="4" className="fill-emerald-50 dark:fill-emerald-950/40 stroke-emerald-400 dark:stroke-emerald-600 shadow-xs" strokeWidth="1.2" />
                    <circle cx="97" cy="44" r="2.5" className="fill-emerald-500" />
                    <rect x="103" y="43" width="17" height="3" rx="1.5" className="fill-emerald-800 dark:fill-emerald-200" />
                    <rect x="94" y="51" width="26" height="2.5" rx="1" className="fill-emerald-500/80" />
                    <rect x="94" y="56" width="20" height="2.5" rx="1" className="fill-emerald-400/60" />

                    {/* Event Pill 3: Blue Task Block */}
                    <rect x="132" y="46" width="34" height="22" rx="4" className="fill-blue-50 dark:fill-blue-950/30 stroke-blue-300 dark:stroke-blue-800" strokeWidth="1" />
                    <rect x="136" y="52" width="22" height="3" rx="1.5" className="fill-blue-700 dark:fill-blue-300" />
                    <rect x="136" y="58" width="16" height="2.5" rx="1" className="fill-blue-400" />
                  </g>

                  {/* Animated Horizontal Live Timeline Bar with Glowing Flow Dot */}
                  <g className="anim-pulse-slow">
                    <line x1="4" y1="84" x2="206" y2="84" className="stroke-[#FFE54C] dark:stroke-[#FFE500]" strokeWidth="1.5" />
                    {/* Glowing Beacon */}
                    <circle cx="74" cy="84" r="6" className="fill-[#FFE54C] anim-beacon" />
                    <circle cx="74" cy="84" r="3.5" className="fill-[#FFE54C] stroke-[#E5BC10]" strokeWidth="1" />
                    
                    {/* Time Capsule Pill */}
                    <rect x="84" y="78" width="46" height="12" rx="4" className="fill-neutral-900 dark:fill-white" />
                    <rect x="91" y="82.5" width="32" height="3" rx="1.5" className="fill-white dark:fill-neutral-900" />
                  </g>
                </svg>
              </div>
            </div>

            {/* Content Area */}
            <div className="space-y-1.5">
              <h3 className="text-[15.5px] font-bold text-neutral-900 dark:text-white tracking-tight flex items-center justify-between">
                <span>Google Calendar</span>
                <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-950 dark:group-hover:text-white transition-transform duration-200 group-hover:translate-x-1" />
              </h3>
              <p className="text-[12.5px] text-neutral-500 dark:text-neutral-400 leading-relaxed font-normal">
                Sinkronisasi agenda, meeting Google Meet, dan jadwal harian secara real-time.
              </p>
            </div>
          </motion.div>
        </Link>

        {/* ══════════════════════════════════════════════════════════
         * CARD 4: LAUNCHER AUTOMATION (Node Graph & Flowing Connectors)
         * ══════════════════════════════════════════════════════════ */}
        <Link href="/automation" className="group block h-full">
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="h-full flex flex-col justify-between p-4.5 sm:p-5 rounded-2xl bg-white dark:bg-[#121212] border border-neutral-200/90 dark:border-neutral-800 hover:border-neutral-400/80 dark:hover:border-neutral-700 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            {/* Visual Canvas Area */}
            <div className="relative w-full h-36 sm:h-40 rounded-xl overflow-hidden bg-neutral-50/80 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800/80 flex items-center justify-center p-2 mb-4 select-none">
              <div
                className="absolute inset-0 opacity-45 dark:opacity-25 pointer-events-none"
                style={{
                  backgroundImage: "radial-gradient(#9ca3af 1px, transparent 1px)",
                  backgroundSize: "14px 14px",
                }}
              />

              {/* Badge */}
              <div className="absolute top-2.5 right-2.5 z-10">
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase bg-blue-600 text-white shadow-2xs">
                  WORKFLOW
                </span>
              </div>

              {/* Pure Vector Abstract Wireframe Illustration */}
              <div className="relative z-10 w-full max-w-[210px] transition-transform duration-300 group-hover:scale-[1.04]">
                <svg viewBox="0 0 210 115" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto drop-shadow-xs">
                  {/* Canvas Window Frame */}
                  <rect x="2" y="2" width="206" height="111" rx="8" className="fill-white dark:fill-[#181818] stroke-neutral-300/90 dark:stroke-neutral-700/80" strokeWidth="1.2" />
                  
                  {/* Window Bar */}
                  <line x1="2" y1="20" x2="208" y2="20" className="stroke-neutral-200 dark:stroke-neutral-800" strokeWidth="1" />
                  <circle cx="10" cy="11" r="2.2" className="fill-neutral-300 dark:fill-neutral-600" />
                  <circle cx="17" cy="11" r="2.2" className="fill-neutral-300 dark:fill-neutral-600" />
                  <circle cx="24" cy="11" r="2.2" className="fill-neutral-300 dark:fill-neutral-600" />

                  {/* Top Status Capsule */}
                  <g className="anim-pulse-slow">
                    <rect x="146" y="5" width="52" height="11" rx="4" className="fill-emerald-50 dark:fill-emerald-950/30 stroke-emerald-400" strokeWidth="0.8" />
                    <circle cx="153" cy="10.5" r="2" className="fill-emerald-500 anim-beacon" />
                    <circle cx="153" cy="10.5" r="1.5" className="fill-emerald-500" />
                    <rect x="159" y="9" width="32" height="3" rx="1.5" className="fill-emerald-700 dark:fill-emerald-300" />
                  </g>

                  {/* Flow Connection Lines (Animated Continuous Dashed Curves) */}
                  <path
                    d="M58 46 C76 46, 76 74, 96 74"
                    className="stroke-amber-400 dark:stroke-amber-500 anim-dash-fast"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                  <path
                    d="M148 74 C162 74, 162 46, 172 46"
                    className="stroke-blue-400 dark:stroke-blue-500 anim-dash-fast"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />

                  {/* Node 1: Trigger Node (Left) */}
                  <g className="anim-float">
                    <rect x="10" y="32" width="48" height="28" rx="6" className="fill-amber-50/90 dark:fill-amber-950/30 stroke-amber-400 dark:stroke-amber-500" strokeWidth="1.4" />
                    <circle cx="20" cy="46" r="4.5" className="fill-amber-500/20 stroke-amber-500" strokeWidth="1" />
                    <path d="M20 43 L18.8 46 L21 46 L19.8 49" stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    <rect x="29" y="42" width="22" height="3.5" rx="1.5" className="fill-amber-900 dark:fill-amber-200" />
                    <rect x="29" y="48" width="16" height="2.5" rx="1" className="fill-amber-500" />
                    {/* Connector Output Port */}
                    <circle cx="58" cy="46" r="3" className="fill-amber-500 stroke-white dark:stroke-[#181818]" strokeWidth="1.2" />
                  </g>

                  {/* Node 2: AI Processor Node (Center) */}
                  <g className="anim-float-alt">
                    <rect x="96" y="58" width="52" height="32" rx="6" className="fill-blue-50/90 dark:fill-blue-950/40 stroke-blue-500 dark:stroke-blue-400 shadow-xs" strokeWidth="1.5" />
                    {/* Connector Input Port */}
                    <circle cx="96" cy="74" r="3" className="fill-blue-500 stroke-white dark:stroke-[#181818]" strokeWidth="1.2" />
                    
                    <circle cx="109" cy="74" r="5" className="fill-blue-500" />
                    <path d="M109 71.5 L109.8 73.2 L111.5 74 L109.8 74.8 L109 76.5 L108.2 74.8 L106.5 74 L108.2 73.2 Z" fill="white" />
                    <rect x="118" y="70" width="22" height="3.5" rx="1.5" className="fill-blue-950 dark:fill-blue-100" />
                    <rect x="118" y="76" width="16" height="2.5" rx="1" className="fill-blue-500" />
                    {/* Connector Output Port */}
                    <circle cx="148" cy="74" r="3" className="fill-blue-500 stroke-white dark:stroke-[#181818]" strokeWidth="1.2" />
                  </g>

                  {/* Node 3: Action Node (Right) */}
                  <g className="anim-float">
                    {/* Connector Input Port */}
                    <circle cx="172" cy="46" r="3" className="fill-emerald-500 stroke-white dark:stroke-[#181818]" strokeWidth="1.2" />
                    <rect x="172" y="32" width="30" height="28" rx="6" className="fill-emerald-50/90 dark:fill-emerald-950/30 stroke-emerald-400 dark:stroke-emerald-500" strokeWidth="1.4" />
                    <circle cx="187" cy="46" r="5" className="fill-emerald-500" />
                    <path d="M185 46 L186.5 47.5 L189 44.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </g>

                  {/* Bottom Pipeline Status Pill */}
                  <g className="anim-pulse-slow">
                    <rect x="12" y="90" width="60" height="13" rx="4" className="fill-neutral-100 dark:fill-neutral-800 stroke-neutral-200 dark:stroke-neutral-700" strokeWidth="0.8" />
                    <circle cx="19" cy="96.5" r="2" className="fill-emerald-500" />
                    <rect x="25" y="95" width="40" height="3" rx="1.5" className="fill-neutral-500 dark:fill-neutral-400" />
                  </g>
                </svg>
              </div>
            </div>

            {/* Content Area */}
            <div className="space-y-1.5">
              <h3 className="text-[15.5px] font-bold text-neutral-900 dark:text-white tracking-tight flex items-center justify-between">
                <span>Launcher Automation</span>
                <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-950 dark:group-hover:text-white transition-transform duration-200 group-hover:translate-x-1" />
              </h3>
              <p className="text-[12.5px] text-neutral-500 dark:text-neutral-400 leading-relaxed font-normal">
                Visual node builder untuk otomasi proses bisnis, webhook, dan eksekusi AI multi-step.
              </p>
            </div>
          </motion.div>
        </Link>

      </div>
    </div>
  );
}
