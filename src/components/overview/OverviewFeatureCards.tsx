"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function OverviewFeatureCards() {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
            Launcher Features
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-normal">
            Akses cepat ke ekosistem kecerdasan dan otomasi Launcher OS
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 items-stretch">
        {/* ── CARD 1: LLM MODE ── */}
        <Link href="/dashboard" className="group block h-full">
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="h-full flex flex-col justify-between p-4.5 sm:p-5 rounded-2xl bg-white dark:bg-[#121212] border border-neutral-200/90 dark:border-neutral-800 hover:border-neutral-400/80 dark:hover:border-neutral-700 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            {/* Visual Canvas Area */}
            <div className="relative w-full h-36 sm:h-40 rounded-xl overflow-hidden bg-neutral-50/80 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800/80 flex items-center justify-center p-2 mb-4 select-none">
              {/* Blueprint Grid */}
              <div
                className="absolute inset-0 opacity-45 dark:opacity-25 pointer-events-none"
                style={{
                  backgroundImage: "radial-gradient(#9ca3af 1px, transparent 1px)",
                  backgroundSize: "14px 14px",
                }}
              />

              {/* Badge */}
              <div className="absolute top-2.5 right-2.5 z-10">
                <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold tracking-wide uppercase bg-[#FF4500] text-white shadow-2xs">
                  CORE AI
                </span>
              </div>

              {/* Interactive Vector SVG Mockup */}
              <div className="relative z-10 w-full max-w-[210px] transition-transform duration-300 group-hover:scale-[1.04]">
                <svg
                  viewBox="0 0 210 115"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-auto drop-shadow-xs"
                >
                  {/* Window Container */}
                  <rect
                    x="1"
                    y="1"
                    width="208"
                    height="113"
                    rx="8"
                    className="fill-white dark:fill-[#181818] stroke-neutral-300/90 dark:stroke-neutral-700/80"
                    strokeWidth="1.2"
                  />
                  {/* Top Bar */}
                  <line
                    x1="1"
                    y1="20"
                    x2="209"
                    y2="20"
                    className="stroke-neutral-200 dark:stroke-neutral-800"
                    strokeWidth="1"
                  />
                  <circle cx="10" cy="10" r="2.2" className="fill-neutral-300 dark:fill-neutral-600" />
                  <circle cx="17" cy="10" r="2.2" className="fill-neutral-300 dark:fill-neutral-600" />
                  <circle cx="24" cy="10" r="2.2" className="fill-neutral-300 dark:fill-neutral-600" />
                  {/* Model Pill */}
                  <rect
                    x="125"
                    y="4"
                    width="75"
                    height="12"
                    rx="6"
                    className="fill-neutral-100 dark:fill-neutral-800/80 stroke-neutral-200 dark:stroke-neutral-700"
                    strokeWidth="0.8"
                  />
                  <circle cx="132" cy="10" r="2" className="fill-emerald-500 animate-pulse" />
                  <text
                    x="138"
                    y="12.5"
                    className="fill-neutral-500 dark:fill-neutral-400 font-mono text-[7.5px]"
                  >
                    Deep Reasoning
                  </text>

                  {/* User Bubble (Right) */}
                  <rect
                    x="95"
                    y="27"
                    width="103"
                    height="16"
                    rx="6"
                    className="fill-[#FFE54C]/40 dark:fill-[#262626] stroke-[#E5BC10]/60 dark:stroke-neutral-700"
                    strokeWidth="1"
                  />
                  <text
                    x="103"
                    y="38"
                    className="fill-neutral-800 dark:fill-neutral-200 font-sans text-[8px] font-medium"
                  >
                    Buat strategi AI Q4...
                  </text>

                  {/* AI Response Bubble (Left) */}
                  <circle cx="18" cy="58" r="7" className="fill-[#FFE54C] dark:fill-[#FFDE3C]" />
                  <path
                    d="M18 54.5 L19.2 57 L21.7 58 L19.2 59 L18 61.5 L16.8 59 L14.3 58 L16.8 57 Z"
                    className="fill-neutral-950"
                  />

                  <rect
                    x="30"
                    y="50"
                    width="168"
                    height="28"
                    rx="6"
                    className="fill-neutral-50 dark:fill-neutral-800/40 stroke-neutral-200/90 dark:stroke-neutral-700/60"
                    strokeWidth="1"
                  />
                  <rect
                    x="38"
                    y="57"
                    width="135"
                    height="4"
                    rx="2"
                    className="fill-neutral-700 dark:fill-neutral-300"
                  />
                  <rect
                    x="38"
                    y="65"
                    width="105"
                    height="4"
                    rx="2"
                    className="fill-neutral-400 dark:fill-neutral-500"
                  />

                  {/* Bottom Prompt Bar with Star */}
                  <rect
                    x="10"
                    y="86"
                    width="190"
                    height="20"
                    rx="10"
                    className="fill-neutral-50 dark:fill-neutral-900 stroke-neutral-300 dark:stroke-neutral-700 transition-colors duration-300 group-hover:stroke-[#E5BC10]"
                    strokeWidth="1"
                  />
                  <circle cx="21" cy="96" r="3.5" className="fill-[#FFE54C] dark:fill-[#FFDE3C]" />
                  <text
                    x="30"
                    y="98.5"
                    className="fill-neutral-400 dark:fill-neutral-500 font-sans text-[8px]"
                  >
                    Tanya apapun atau attach file...
                  </text>
                  <circle cx="190" cy="96" r="6" className="fill-neutral-900 dark:fill-neutral-100" />
                  <path
                    d="M190 99 L190 93 M188 95 L190 93 L192 95"
                    stroke="currentColor"
                    className="text-white dark:text-neutral-900"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
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

        {/* ── CARD 2: DECK GENERATOR ── */}
        <Link href="/decks" className="group block h-full">
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="h-full flex flex-col justify-between p-4.5 sm:p-5 rounded-2xl bg-white dark:bg-[#121212] border border-neutral-200/90 dark:border-neutral-800 hover:border-neutral-400/80 dark:hover:border-neutral-700 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            {/* Visual Canvas Area */}
            <div className="relative w-full h-36 sm:h-40 rounded-xl overflow-hidden bg-neutral-50/80 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800/80 flex items-center justify-center p-2 mb-4 select-none">
              {/* Blueprint Grid */}
              <div
                className="absolute inset-0 opacity-45 dark:opacity-25 pointer-events-none"
                style={{
                  backgroundImage: "radial-gradient(#9ca3af 1px, transparent 1px)",
                  backgroundSize: "14px 14px",
                }}
              />

              {/* Badge */}
              <div className="absolute top-2.5 right-2.5 z-10">
                <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold tracking-wide uppercase bg-purple-600 text-white shadow-2xs">
                  SLIDES
                </span>
              </div>

              {/* Interactive Vector SVG Mockup (Presentation 16:9 Deck) */}
              <div className="relative z-10 w-full max-w-[210px] transition-transform duration-300 group-hover:scale-[1.04]">
                <svg
                  viewBox="0 0 210 115"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-auto drop-shadow-xs"
                >
                  {/* Presentation 16:9 Canvas */}
                  <rect
                    x="8"
                    y="8"
                    width="194"
                    height="100"
                    rx="8"
                    className="fill-white dark:fill-[#171717] stroke-neutral-300/90 dark:stroke-neutral-700"
                    strokeWidth="1.2"
                  />
                  {/* Canvas Top Bar */}
                  <line
                    x1="8"
                    y1="24"
                    x2="202"
                    y2="24"
                    className="stroke-neutral-200 dark:stroke-neutral-800"
                    strokeWidth="1"
                  />
                  <circle cx="17" cy="16" r="2" className="fill-neutral-300 dark:fill-neutral-600" />
                  <circle cx="23" cy="16" r="2" className="fill-neutral-300 dark:fill-neutral-600" />
                  <circle cx="29" cy="16" r="2" className="fill-neutral-300 dark:fill-neutral-600" />
                  <text
                    x="37"
                    y="18.5"
                    className="fill-neutral-400 dark:fill-neutral-500 font-sans text-[7.5px] font-medium"
                  >
                    Deck Preview • 16:9 HD
                  </text>

                  {/* Slide Title Tag */}
                  <rect
                    x="18"
                    y="32"
                    width="62"
                    height="7"
                    rx="3.5"
                    className="fill-purple-500/20 stroke-purple-500"
                    strokeWidth="1"
                  />
                  <text
                    x="23"
                    y="37.5"
                    className="fill-purple-600 dark:fill-purple-400 font-sans text-[6.5px] font-bold tracking-wider"
                  >
                    KEY TAKEAWAYS
                  </text>

                  {/* Slide Main Heading Line */}
                  <rect
                    x="18"
                    y="43"
                    width="110"
                    height="6"
                    rx="2"
                    className="fill-neutral-800 dark:fill-neutral-100"
                  />

                  {/* 3 Executive Metric Column Cards */}
                  <rect
                    x="18"
                    y="55"
                    width="36"
                    height="42"
                    rx="5"
                    className="fill-purple-50 dark:fill-purple-950/20 stroke-purple-200 dark:stroke-purple-900/60 transition-all duration-300 group-hover:stroke-purple-500"
                    strokeWidth="1"
                  />
                  <circle cx="28" cy="65" r="4" className="fill-purple-500/20 stroke-purple-500" strokeWidth="0.8" />
                  <rect x="23" y="73" width="26" height="3" rx="1.5" className="fill-purple-900 dark:fill-purple-200" />
                  <rect x="23" y="79" width="18" height="2.5" rx="1.2" className="fill-purple-400/80" />

                  <rect
                    x="58"
                    y="55"
                    width="36"
                    height="42"
                    rx="5"
                    className="fill-neutral-50 dark:fill-neutral-800/40 stroke-neutral-200 dark:stroke-neutral-700"
                    strokeWidth="1"
                  />
                  <circle cx="68" cy="65" r="4" className="fill-neutral-200 dark:fill-neutral-700" strokeWidth="0.8" />
                  <rect x="63" y="73" width="26" height="3" rx="1.5" className="fill-neutral-700 dark:fill-neutral-300" />
                  <rect x="63" y="79" width="18" height="2.5" rx="1.2" className="fill-neutral-400 dark:fill-neutral-500" />

                  {/* Floating Selection Box with Resize Corner Handles (Figma / Canvas style) */}
                  <g className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
                    <rect
                      x="100"
                      y="48"
                      width="92"
                      height="52"
                      rx="6"
                      className="fill-white/95 dark:fill-[#202020] stroke-purple-500 dark:stroke-purple-400 shadow-md"
                      strokeWidth="1.2"
                      strokeDasharray="3 3"
                    />
                    {/* Bounding box handles */}
                    <rect x="98" y="46" width="4" height="4" className="fill-purple-500" />
                    <rect x="190" y="46" width="4" height="4" className="fill-purple-500" />
                    <rect x="98" y="98" width="4" height="4" className="fill-purple-500" />
                    <rect x="190" y="98" width="4" height="4" className="fill-purple-500" />

                    <rect x="108" y="58" width="55" height="5" rx="2" className="fill-neutral-900 dark:fill-neutral-100" />
                    <rect x="108" y="67" width="76" height="3" rx="1.5" className="fill-neutral-400 dark:fill-neutral-500" />
                    <rect x="108" y="73" width="68" height="3" rx="1.5" className="fill-neutral-400 dark:fill-neutral-500" />
                    <rect x="108" y="82" width="35" height="10" rx="4" className="fill-purple-600" />
                    <text x="114" y="89.5" className="fill-white font-sans text-[6.5px] font-bold">
                      .PPTX
                    </text>
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

        {/* ── CARD 3: GOOGLE CALENDAR ── */}
        <Link href="/integrations/calendar" className="group block h-full">
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="h-full flex flex-col justify-between p-4.5 sm:p-5 rounded-2xl bg-white dark:bg-[#121212] border border-neutral-200/90 dark:border-neutral-800 hover:border-neutral-400/80 dark:hover:border-neutral-700 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            {/* Visual Canvas Area */}
            <div className="relative w-full h-36 sm:h-40 rounded-xl overflow-hidden bg-neutral-50/80 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800/80 flex items-center justify-center p-2 mb-4 select-none">
              {/* Blueprint Grid */}
              <div
                className="absolute inset-0 opacity-45 dark:opacity-25 pointer-events-none"
                style={{
                  backgroundImage: "radial-gradient(#9ca3af 1px, transparent 1px)",
                  backgroundSize: "14px 14px",
                }}
              />

              {/* Badge */}
              <div className="absolute top-2.5 right-2.5 z-10">
                <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold tracking-wide uppercase bg-emerald-600 text-white shadow-2xs">
                  REALTIME
                </span>
              </div>

              {/* Interactive Vector SVG Mockup (Calendar Grid) */}
              <div className="relative z-10 w-full max-w-[210px] transition-transform duration-300 group-hover:scale-[1.04]">
                <svg
                  viewBox="0 0 210 115"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-auto drop-shadow-xs"
                >
                  {/* Calendar Container */}
                  <rect
                    x="2"
                    y="2"
                    width="206"
                    height="111"
                    rx="8"
                    className="fill-white dark:fill-[#181818] stroke-neutral-300/90 dark:stroke-neutral-700/80"
                    strokeWidth="1.2"
                  />
                  {/* Calendar Header */}
                  <line
                    x1="2"
                    y1="24"
                    x2="208"
                    y2="24"
                    className="stroke-neutral-200 dark:stroke-neutral-800"
                    strokeWidth="1"
                  />
                  <rect
                    x="10"
                    y="7"
                    width="32"
                    height="11"
                    rx="4"
                    className="fill-[#FFE54C] stroke-[#E5BC10]"
                    strokeWidth="0.8"
                  />
                  <text
                    x="16"
                    y="15.5"
                    className="fill-neutral-950 font-sans text-[7.5px] font-bold"
                  >
                    Today
                  </text>
                  <text
                    x="50"
                    y="15.5"
                    className="fill-neutral-800 dark:fill-neutral-200 font-sans text-[9px] font-bold tracking-tight"
                  >
                    October 2026
                  </text>

                  {/* Days of Week Header */}
                  <text x="24" y="34" className="fill-neutral-400 font-mono text-[7px]">MON</text>
                  <text x="64" y="34" className="fill-neutral-400 font-mono text-[7px]">TUE</text>
                  <text x="104" y="34" className="fill-emerald-600 dark:fill-emerald-400 font-mono text-[7px] font-bold">WED</text>
                  <text x="144" y="34" className="fill-neutral-400 font-mono text-[7px]">THU</text>
                  <text x="184" y="34" className="fill-neutral-400 font-mono text-[7px]">FRI</text>

                  {/* Date Indicators */}
                  <text x="26" y="46" className="fill-neutral-700 dark:fill-neutral-300 font-sans text-[8.5px]">23</text>
                  <text x="66" y="46" className="fill-neutral-700 dark:fill-neutral-300 font-sans text-[8.5px]">24</text>
                  {/* Today Highlight Circle */}
                  <circle cx="108" cy="43.5" r="7.5" className="fill-[#FFE54C] dark:fill-[#FFE500]" />
                  <text x="103.5" y="46.5" className="fill-neutral-950 font-sans text-[8.5px] font-bold">25</text>
                  <text x="146" y="46" className="fill-neutral-700 dark:fill-neutral-300 font-sans text-[8.5px]">26</text>
                  <text x="186" y="46" className="fill-neutral-700 dark:fill-neutral-300 font-sans text-[8.5px]">27</text>

                  {/* Schedule Cards Flow */}
                  <g className="transition-transform duration-300 group-hover:-translate-y-0.5">
                    {/* Event 1: Meeting (Purple) */}
                    <rect
                      x="10"
                      y="56"
                      width="58"
                      height="21"
                      rx="4"
                      className="fill-purple-50 dark:fill-purple-950/30 stroke-purple-200 dark:stroke-purple-800"
                      strokeWidth="0.8"
                    />
                    <circle cx="17" cy="66.5" r="2.5" className="fill-purple-500" />
                    <text x="23" y="65" className="fill-purple-900 dark:fill-purple-200 font-sans text-[6.5px] font-bold">
                      RevoU Sync
                    </text>
                    <text x="23" y="72" className="fill-purple-500 dark:fill-purple-400 font-sans text-[5.5px]">
                      09:00 - 10:00
                    </text>

                    {/* Event 2: Active Meet (Emerald) */}
                    <rect
                      x="74"
                      y="56"
                      width="66"
                      height="21"
                      rx="4"
                      className="fill-emerald-50 dark:fill-emerald-950/30 stroke-emerald-300 dark:stroke-emerald-700 shadow-2xs"
                      strokeWidth="1"
                    />
                    <rect x="76" y="58" width="3" height="17" rx="1.5" className="fill-emerald-500" />
                    <text x="83" y="65" className="fill-emerald-950 dark:fill-emerald-200 font-sans text-[6.5px] font-bold">
                      1on1 Mentoring
                    </text>
                    <text x="83" y="72" className="fill-emerald-600 dark:fill-emerald-400 font-sans text-[5.5px]">
                      Google Meet • Live
                    </text>

                    {/* Event 3: Review (Blue) */}
                    <rect
                      x="146"
                      y="56"
                      width="54"
                      height="21"
                      rx="4"
                      className="fill-blue-50 dark:fill-blue-950/30 stroke-blue-200 dark:stroke-blue-800"
                      strokeWidth="0.8"
                    />
                    <circle cx="153" cy="66.5" r="2.5" className="fill-blue-500" />
                    <text x="159" y="65" className="fill-blue-900 dark:fill-blue-200 font-sans text-[6.5px] font-bold">
                      Task Review
                    </text>
                    <text x="159" y="72" className="fill-blue-500 dark:fill-blue-400 font-sans text-[5.5px]">
                      14:00 - 15:30
                    </text>
                  </g>

                  {/* Horizontal Time Tracker Red Indicator Line */}
                  <g className="transition-opacity duration-300">
                    <line
                      x1="6"
                      y1="89"
                      x2="204"
                      y2="89"
                      className="stroke-[#FFE500] dark:stroke-[#FFE500]"
                      strokeWidth="1.2"
                    />
                    <circle cx="12" cy="89" r="3" className="fill-[#FFE500]" />
                    <rect
                      x="20"
                      y="83"
                      width="60"
                      height="12"
                      rx="4"
                      className="fill-neutral-900 dark:fill-white"
                    />
                    <text
                      x="26"
                      y="91.5"
                      className="fill-white dark:fill-neutral-900 font-mono text-[6.5px] font-bold"
                    >
                      LIVE TIMELINE
                    </text>
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

        {/* ── CARD 4: LAUNCHER AUTOMATION ── */}
        <Link href="/automation" className="group block h-full">
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="h-full flex flex-col justify-between p-4.5 sm:p-5 rounded-2xl bg-white dark:bg-[#121212] border border-neutral-200/90 dark:border-neutral-800 hover:border-neutral-400/80 dark:hover:border-neutral-700 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            {/* Visual Canvas Area */}
            <div className="relative w-full h-36 sm:h-40 rounded-xl overflow-hidden bg-neutral-50/80 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800/80 flex items-center justify-center p-2 mb-4 select-none">
              {/* Blueprint Grid */}
              <div
                className="absolute inset-0 opacity-45 dark:opacity-25 pointer-events-none"
                style={{
                  backgroundImage: "radial-gradient(#9ca3af 1px, transparent 1px)",
                  backgroundSize: "14px 14px",
                }}
              />

              {/* Badge */}
              <div className="absolute top-2.5 right-2.5 z-10">
                <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold tracking-wide uppercase bg-blue-600 text-white shadow-2xs">
                  WORKFLOW
                </span>
              </div>

              {/* Interactive Vector SVG Mockup (Node Automation Flow) */}
              <div className="relative z-10 w-full max-w-[210px] transition-transform duration-300 group-hover:scale-[1.04]">
                <svg
                  viewBox="0 0 210 115"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-auto drop-shadow-xs"
                >
                  {/* Canvas Frame */}
                  <rect
                    x="2"
                    y="2"
                    width="206"
                    height="111"
                    rx="8"
                    className="fill-white dark:fill-[#181818] stroke-neutral-300/90 dark:stroke-neutral-700/80"
                    strokeWidth="1.2"
                  />

                  {/* Flow Connection Lines (Animated Dashed Curves) */}
                  <path
                    d="M60 40 C75 40, 75 75, 95 75"
                    className="stroke-blue-500/80 dark:stroke-blue-400/80"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                  />
                  <path
                    d="M145 75 C160 75, 160 40, 175 40"
                    className="stroke-emerald-500/80 dark:stroke-emerald-400/80"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                  />

                  {/* Node 1: Trigger Node (Left) */}
                  <g className="transition-transform duration-300 group-hover:-translate-y-1">
                    <rect
                      x="10"
                      y="26"
                      width="50"
                      height="28"
                      rx="6"
                      className="fill-amber-50 dark:fill-amber-950/30 stroke-amber-400 dark:stroke-amber-600"
                      strokeWidth="1.2"
                    />
                    <circle cx="21" cy="40" r="5" className="fill-amber-500/20 stroke-amber-500" strokeWidth="1" />
                    <path d="M21 37 L20 40 L22 40 L21 43" stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round" />
                    <text x="30" y="38" className="fill-amber-900 dark:fill-amber-200 font-sans text-[6.5px] font-bold">
                      Webhook
                    </text>
                    <text x="30" y="45" className="fill-amber-600 dark:fill-amber-400 font-mono text-[5.5px]">
                      On Event
                    </text>
                  </g>

                  {/* Node 2: AI Processor Node (Center) */}
                  <g className="transition-transform duration-300 group-hover:scale-105">
                    <rect
                      x="82"
                      y="60"
                      width="64"
                      height="32"
                      rx="6"
                      className="fill-blue-50 dark:fill-blue-950/40 stroke-blue-500 dark:stroke-blue-400 shadow-xs"
                      strokeWidth="1.5"
                    />
                    <circle cx="95" cy="76" r="6" className="fill-blue-500" />
                    <path
                      d="M95 73 L96 75.5 L98.5 76 L96 76.5 L95 79 L94 76.5 L91.5 76 L94 75.5 Z"
                      fill="white"
                    />
                    <text x="105" y="73" className="fill-blue-950 dark:fill-blue-100 font-sans text-[7.5px] font-bold">
                      AI Router
                    </text>
                    <text x="105" y="82" className="fill-blue-600 dark:fill-blue-400 font-mono text-[6px]">
                      Prompt &amp; Filter
                    </text>
                  </g>

                  {/* Node 3: Action Node (Right) */}
                  <g className="transition-transform duration-300 group-hover:-translate-y-1">
                    <rect
                      x="160"
                      y="26"
                      width="44"
                      height="28"
                      rx="6"
                      className="fill-emerald-50 dark:fill-emerald-950/30 stroke-emerald-400 dark:stroke-emerald-600"
                      strokeWidth="1.2"
                    />
                    <circle cx="170" cy="40" r="5" className="fill-emerald-500/20 stroke-emerald-500" strokeWidth="1" />
                    <path d="M168 40 L170 42 L173 38" stroke="#10B981" strokeWidth="1.2" strokeLinecap="round" />
                    <text x="178" y="38" className="fill-emerald-900 dark:fill-emerald-200 font-sans text-[6.5px] font-bold">
                      Action
                    </text>
                    <text x="178" y="45" className="fill-emerald-600 dark:fill-emerald-400 font-mono text-[5.5px]">
                      Trigger
                    </text>
                  </g>

                  {/* Running Status Badge Bottom */}
                  <rect
                    x="10"
                    y="88"
                    width="62"
                    height="14"
                    rx="4"
                    className="fill-neutral-100 dark:fill-neutral-800/80 stroke-neutral-200 dark:stroke-neutral-700"
                    strokeWidth="0.8"
                  />
                  <circle cx="17" cy="95" r="2.5" className="fill-emerald-500 animate-ping opacity-75" />
                  <circle cx="17" cy="95" r="2.5" className="fill-emerald-500" />
                  <text
                    x="23"
                    y="98"
                    className="fill-neutral-700 dark:fill-neutral-300 font-mono text-[6.5px] font-medium"
                  >
                    STATUS: READY
                  </text>
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
