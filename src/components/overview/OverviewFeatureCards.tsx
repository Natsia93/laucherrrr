"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export function OverviewFeatureCards() {
  return (
    <div className="w-full">
      {/* ── Storyboarded Keyframe Animations (Synchronized 7-Second Loops) ── */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* ══════════════════════════════════════════════════════════
         * CARD 1: LLM MODE (Apple Minimalist AI Chat & Shift)
         * ══════════════════════════════════════════════════════════ */
        @keyframes c1CursorTrack {
          0% { transform: translate(210px, 130px); opacity: 0; }
          6% { opacity: 1; }
          12% { transform: translate(45px, 114px) scale(1); opacity: 1; }
          16% { transform: translate(45px, 114px) scale(0.85); opacity: 1; }
          20% { transform: translate(45px, 114px) scale(1); opacity: 1; }
          28% { transform: translate(214px, 114px) scale(1); opacity: 1; }
          32% { transform: translate(214px, 114px) scale(0.82); opacity: 1; }
          36% { transform: translate(214px, 114px) scale(1); opacity: 0.8; }
          40%, 100% { transform: translate(214px, 114px); opacity: 0; }
        }
        @keyframes c1TypingPrompt {
          0%, 16% { width: 0px; opacity: 0; }
          20% { width: 35px; opacity: 1; }
          28% { width: 115px; opacity: 1; }
          33% { width: 115px; opacity: 1; }
          36%, 100% { width: 0px; opacity: 0; }
        }
        @keyframes c1SendClick {
          0%, 31% { transform: scale(1); }
          33% { transform: scale(1.22); }
          37%, 100% { transform: scale(1); }
        }
        @keyframes c1ChatThreadShift {
          0%, 35% { transform: translateY(0px); }
          42%, 88% { transform: translateY(-16px); }
          95%, 100% { transform: translateY(0px); }
        }
        @keyframes c1UserQuery {
          0%, 35% { transform: translateY(10px) scale(0.95); opacity: 0; }
          40% { transform: translateY(0) scale(1); opacity: 1; }
          88% { opacity: 1; }
          95%, 100% { opacity: 0; }
        }
        @keyframes c1AiBubble {
          0%, 46% { transform: translateY(8px); opacity: 0; }
          52% { transform: translateY(0); opacity: 1; }
          88% { opacity: 1; }
          95%, 100% { opacity: 0; }
        }
        @keyframes c1StreamLine1 {
          0%, 52% { width: 0px; opacity: 0; }
          60% { width: 135px; opacity: 1; }
          88% { opacity: 1; }
          95%, 100% { width: 0px; opacity: 0; }
        }
        @keyframes c1StreamLine2 {
          0%, 60% { width: 0px; opacity: 0; }
          70% { width: 110px; opacity: 1; }
          88% { opacity: 1; }
          95%, 100% { width: 0px; opacity: 0; }
        }
        @keyframes c1ResultCard {
          0%, 68% { transform: scale(0.95); opacity: 0; }
          74% { transform: scale(1); opacity: 1; }
          88% { opacity: 1; }
          95%, 100% { opacity: 0; }
        }

        /* ══════════════════════════════════════════════════════════
         * CARD 2: DECK GENERATOR (Clean Keynote / Minimal Slide Shift)
         * ══════════════════════════════════════════════════════════ */
        @keyframes c2CursorSlide {
          0% { transform: translate(190px, 130px); opacity: 0; }
          6% { opacity: 1; }
          12% { transform: translate(25px, 43px) scale(1); opacity: 1; }
          16% { transform: translate(25px, 43px) scale(0.85); opacity: 1; }
          20% { transform: translate(25px, 43px) scale(1); opacity: 1; }
          26%, 100% { opacity: 0; }
        }
        @keyframes c2ThumbHighlight {
          0%, 14% { stroke: rgba(140, 140, 140, 0.25); }
          16%, 88% { stroke: #a1a1aa; }
          95%, 100% { stroke: rgba(140, 140, 140, 0.25); }
        }
        @keyframes c2SlideShift {
          0%, 15% { transform: translateX(25px); opacity: 0; }
          24% { transform: translateX(0); opacity: 1; }
          88% { transform: translateX(0); opacity: 1; }
          95%, 100% { transform: translateX(-25px); opacity: 0; }
        }
        @keyframes c2SlideHeader {
          0%, 22% { transform: translateX(-12px); opacity: 0; }
          30% { transform: translateX(0); opacity: 1; }
          88% { opacity: 1; }
          95%, 100% { opacity: 0; }
        }
        @keyframes c2Col1Reveal {
          0%, 30% { transform: translateY(12px); opacity: 0; }
          38% { transform: translateY(0); opacity: 1; }
          88% { opacity: 1; }
          95%, 100% { opacity: 0; }
        }
        @keyframes c2Col2Reveal {
          0%, 38% { transform: translateY(12px); opacity: 0; }
          46% { transform: translateY(0); opacity: 1; }
          88% { opacity: 1; }
          95%, 100% { opacity: 0; }
        }
        @keyframes c2SelectBounding {
          0%, 50% { transform: scale(0.95); opacity: 0; }
          56% { transform: scale(1.02); opacity: 1; }
          60% { transform: scale(1); opacity: 1; }
          88% { opacity: 1; }
          95%, 100% { opacity: 0; }
        }
        @keyframes c2HandlesPop {
          0%, 56% { transform: scale(0); opacity: 0; }
          62% { transform: scale(1.2); opacity: 1; }
          66% { transform: scale(1); opacity: 1; }
          88% { opacity: 1; }
          95%, 100% { opacity: 0; }
        }
        @keyframes c2PptxPill {
          0%, 66% { transform: translateY(6px); opacity: 0; }
          72% { transform: translateY(0); opacity: 1; }
          88% { opacity: 1; }
          95%, 100% { opacity: 0; }
        }

        /* ══════════════════════════════════════════════════════════
         * CARD 3: AUTOMATION (Multi-Branch Canvas Pan & Soft Gray)
         * ══════════════════════════════════════════════════════════ */
        @keyframes c3CanvasPan {
          0%, 25% { transform: translateX(0px); }
          40%, 85% { transform: translateX(-56px); }
          95%, 100% { transform: translateX(0px); }
        }
        @keyframes c3TriggerPulse {
          0%, 8% { transform: scale(1); }
          12% { transform: scale(1.05); }
          16%, 100% { transform: scale(1); }
        }
        @keyframes c3PacketA {
          0%, 12% { transform: translate(54px, 66px); opacity: 0; }
          16% { opacity: 1; }
          32% { transform: translate(105px, 66px); opacity: 1; }
          34%, 100% { transform: translate(105px, 66px); opacity: 0; }
        }
        @keyframes c3AiRouterPulse {
          0%, 30% { transform: scale(1); }
          36% { transform: scale(1.06); }
          42%, 100% { transform: scale(1); }
        }
        @keyframes c3PacketBranchTop {
          0%, 42% { transform: translate(162px, 66px); opacity: 0; }
          45% { opacity: 1; }
          58% { transform: translate(218px, 44px); opacity: 1; }
          60%, 100% { transform: translate(218px, 44px); opacity: 0; }
        }
        @keyframes c3PacketBranchBottom {
          0%, 42% { transform: translate(162px, 66px); opacity: 0; }
          45% { opacity: 1; }
          58% { transform: translate(218px, 88px); opacity: 1; }
          60%, 100% { transform: translate(218px, 88px); opacity: 0; }
        }
        @keyframes c3ActionTopPulse {
          0%, 56% { transform: scale(1); }
          62% { transform: scale(1.06); }
          68%, 100% { transform: scale(1); }
        }
        @keyframes c3ActionBottomPulse {
          0%, 56% { transform: scale(1); }
          62% { transform: scale(1.06); }
          68%, 100% { transform: scale(1); }
        }
        @keyframes c3ExecutionStatus {
          0%, 64% { transform: translateY(6px); opacity: 0; }
          70% { transform: translateY(0); opacity: 1; }
          88% { opacity: 1; }
          95%, 100% { opacity: 0; }
        }

        /* Continuous SVG Dash Running Line */
        @keyframes dashCycle {
          from { stroke-dashoffset: 24; }
          to { stroke-dashoffset: 0; }
        }
        .anim-wire-flow {
          stroke-dasharray: 4 3;
          animation: dashCycle 1.2s linear infinite;
        }
      `}} />

      {/* 3-Column Responsive Grid (Elevated, Crisp Apple/Linear Aesthetic in Light & Dark Mode) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3 items-stretch">
        
        {/* ══════════════════════════════════════════════════════════
         * CARD 1: LLM MODE (Apple Minimalist AI Chat & Shift)
         * ══════════════════════════════════════════════════════════ */}
        <Link href="/dashboard" className="group block h-full" title="LLM Mode">
          <motion.div
            whileHover={{ y: -3, scale: 1.01 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full h-56 sm:h-60 rounded-xl overflow-hidden bg-white dark:bg-[#121212] border border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-400/80 dark:hover:border-neutral-700 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-xl transition-all duration-300 flex items-center justify-center p-2 sm:p-2.5 select-none"
          >
            {/* Apple Brand Style Clean Title */}
            <div className="absolute top-3 left-4 z-10 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 dark:bg-neutral-500" />
              <span className="text-[13px] font-medium font-inter tracking-tight text-neutral-700 dark:text-neutral-400 group-hover:text-neutral-950 dark:group-hover:text-neutral-200 transition-colors duration-200">
                LLM Mode
              </span>
            </div>

            {/* SVG Narrative Micro-Video Animation */}
            <div className="relative z-10 w-full max-w-[340px] sm:max-w-[370px] pt-4 transition-transform duration-300 group-hover:scale-[1.02]">
              <svg viewBox="0 0 240 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto drop-shadow-xs">
                {/* Outer Window (Crisp Pure White in Light Mode, Dark in Dark Mode) */}
                <rect x="2" y="2" width="236" height="136" rx="6" className="fill-white dark:fill-[#171717] stroke-neutral-200/90 dark:stroke-neutral-800 shadow-xs" strokeWidth="1.2" />
                
                {/* Window Bar with 3 Dots */}
                <line x1="2" y1="21" x2="238" y2="21" className="stroke-neutral-100 dark:stroke-neutral-800" strokeWidth="1" />
                <circle cx="12" cy="11.5" r="2.4" className="fill-neutral-300 dark:fill-neutral-700" />
                <circle cx="19.5" cy="11.5" r="2.4" className="fill-neutral-300 dark:fill-neutral-700" />
                <circle cx="27" cy="11.5" r="2.4" className="fill-neutral-300 dark:fill-neutral-700" />

                {/* Model Pill */}
                <rect x="160" y="6.5" width="66" height="9" rx="4.5" className="fill-neutral-100 dark:fill-neutral-800/80 stroke-neutral-200/80 dark:stroke-neutral-700/60" strokeWidth="0.8" />
                <circle cx="167" cy="11" r="1.8" className="fill-neutral-500 dark:fill-neutral-500" />
                <rect x="173" y="10" width="46" height="2" rx="1" className="fill-neutral-500 dark:fill-neutral-500" />

                {/* Defs with Screen ClipPath */}
                <defs>
                  <clipPath id="c1ChatViewClip">
                    <rect x="3" y="21.5" width="234" height="84" />
                  </clipPath>
                </defs>

                {/* ── CHAT THREAD (Clipped & High-Contrast in Light Mode) ── */}
                <g clipPath="url(#c1ChatViewClip)">
                  <g style={{ animation: "c1ChatThreadShift 7s cubic-bezier(0.16, 1, 0.3, 1) infinite" }}>
                    {/* User Query Bubble (Crisp Dark Charcoal in Light Mode, Elevated in Dark Mode) */}
                    <g style={{ animation: "c1UserQuery 7s cubic-bezier(0.16, 1, 0.3, 1) infinite" }}>
                      <rect x="115" y="44" width="112" height="19" rx="9.5" className="fill-neutral-900 dark:fill-[#242424] stroke-neutral-800 dark:stroke-neutral-700" strokeWidth="1" />
                      <rect x="127" y="52" width="76" height="3" rx="1.5" className="fill-neutral-100 dark:fill-neutral-400" />
                      <circle cx="215" cy="53.5" r="2.5" className="fill-neutral-400 dark:fill-neutral-500" />
                    </g>

                    {/* AI Response Card (Crisp White Card with subtle border in Light Mode) */}
                    <g style={{ animation: "c1AiBubble 7s cubic-bezier(0.16, 1, 0.3, 1) infinite" }}>
                      <circle cx="18" cy="78" r="6.5" className="fill-neutral-900 dark:fill-neutral-800 stroke-neutral-800 dark:stroke-neutral-700" strokeWidth="1" />
                      <path d="M18 75.5 L18.8 77.2 L20.5 78 L18.8 78.8 L18 80.5 L17.2 78.8 L15.5 78 L17.2 77.2 Z" className="fill-white dark:fill-neutral-400" />

                      <rect x="29" y="70" width="199" height="33" rx="6" className="fill-white dark:fill-[#1e1e1e] stroke-neutral-200/90 dark:stroke-neutral-800 shadow-xs" strokeWidth="1" />
                      
                      {/* Streaming Text Lines (Crisp high-contrast in light mode) */}
                      <rect x="38" y="77" height="3.5" rx="1.7" className="fill-neutral-900 dark:fill-neutral-300" style={{ animation: "c1StreamLine1 7s ease-out infinite" }} />
                      <rect x="38" y="85" height="3" rx="1.5" className="fill-neutral-500 dark:fill-neutral-500" style={{ animation: "c1StreamLine2 7s ease-out infinite" }} />

                      {/* Result Code / Summary Box */}
                      <g style={{ animation: "c1ResultCard 7s ease-out infinite" }}>
                        <rect x="38" y="92" width="96" height="7.5" rx="3" className="fill-neutral-100 dark:fill-neutral-800/80 stroke-neutral-200/50 dark:stroke-transparent" strokeWidth="0.5" />
                        <rect x="44" y="95" width="60" height="2" rx="1" className="fill-neutral-700 dark:fill-neutral-400" />
                        <circle cx="216" cy="78" r="4.5" className="fill-neutral-100 dark:fill-neutral-800 stroke-neutral-200 dark:stroke-neutral-700" strokeWidth="0.8" />
                        <path d="M214.5 78 L215.5 79 L217.5 77" stroke="currentColor" className="text-neutral-900 dark:text-neutral-400" strokeWidth="0.9" strokeLinecap="round" />
                      </g>
                    </g>
                  </g>
                </g>

                {/* ── BOTTOM PROMPT INPUT BAR (Crisp White Floating Bar) ── */}
                <rect x="12" y="106" width="216" height="23" rx="11.5" className="fill-white dark:fill-[#202020] stroke-neutral-200/90 dark:stroke-neutral-700/80 shadow-xs" strokeWidth="1" />
                
                {/* Search / Prompt Icon */}
                <circle cx="24" cy="117.5" r="4.5" className="fill-neutral-100 dark:fill-neutral-800" />
                <path d="M24 115 L24.6 116.5 L26 117.5 L24.6 118.5 L24 120 L23.4 118.5 L22 117.5 L23.4 116.5 Z" className="fill-neutral-800 dark:fill-neutral-400" />

                {/* Typing Prompt Line */}
                <rect x="36" y="116" height="3" rx="1.5" className="fill-neutral-800 dark:fill-neutral-400" style={{ animation: "c1TypingPrompt 7s linear infinite" }} />

                {/* Send Button (Crisp Black Circle in Light Mode) */}
                <g style={{ transformOrigin: "214px 117.5px", animation: "c1SendClick 7s ease-in-out infinite" }}>
                  <circle cx="214" cy="117.5" r="6.5" className="fill-neutral-900 dark:fill-neutral-400" />
                  <path d="M214 120.5 L214 114.5 M211.8 116.5 L214 114.5 L216.2 116.5" stroke="currentColor" className="text-white dark:text-neutral-900" strokeWidth="1.1" strokeLinecap="round" />
                </g>

                {/* ── Pointer Cursor ── */}
                <g style={{ animation: "c1CursorTrack 7s cubic-bezier(0.25, 1, 0.5, 1) infinite" }}>
                  <path d="M0 0 L0 12 L3.5 9.5 L7.5 15.5 L9.5 14.5 L5.5 8.5 L9.5 8.5 Z" className="fill-neutral-800 dark:fill-neutral-400 stroke-white dark:stroke-neutral-800 drop-shadow-xs" strokeWidth="0.8" />
                </g>
              </svg>
            </div>
          </motion.div>
        </Link>

        {/* ══════════════════════════════════════════════════════════
         * CARD 2: DECK GENERATOR (Clean Keynote / Minimal Slide Shift)
         * ══════════════════════════════════════════════════════════ */}
        <Link href="/decks" className="group block h-full" title="Deck Generator">
          <motion.div
            whileHover={{ y: -3, scale: 1.01 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full h-56 sm:h-60 rounded-xl overflow-hidden bg-white dark:bg-[#121212] border border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-400/80 dark:hover:border-neutral-700 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-xl transition-all duration-300 flex items-center justify-center p-2 sm:p-2.5 select-none"
          >
            {/* Apple Brand Style Clean Title */}
            <div className="absolute top-3 left-4 z-10 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 dark:bg-neutral-500" />
              <span className="text-[13px] font-medium font-inter tracking-tight text-neutral-700 dark:text-neutral-400 group-hover:text-neutral-950 dark:group-hover:text-neutral-200 transition-colors duration-200">
                Deck Generator
              </span>
            </div>

            {/* SVG Narrative Micro-Video Animation: Keynote / Pitch Workspace */}
            <div className="relative z-10 w-full max-w-[340px] sm:max-w-[370px] pt-4 transition-transform duration-300 group-hover:scale-[1.02]">
              <svg viewBox="0 0 240 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto drop-shadow-xs">
                {/* Slide Studio Frame (Clean Crisp White in Light Mode) */}
                <rect x="2" y="2" width="236" height="136" rx="6" className="fill-white dark:fill-[#171717] stroke-neutral-200/90 dark:stroke-neutral-800 shadow-xs" strokeWidth="1.2" />
                
                {/* Top Workspace Toolbar */}
                <line x1="2" y1="21" x2="238" y2="21" className="stroke-neutral-100 dark:stroke-neutral-800" strokeWidth="1" />
                <circle cx="12" cy="11.5" r="2.4" className="fill-neutral-300 dark:fill-neutral-700" />
                <circle cx="19.5" cy="11.5" r="2.4" className="fill-neutral-300 dark:fill-neutral-700" />
                <circle cx="27" cy="11.5" r="2.4" className="fill-neutral-300 dark:fill-neutral-700" />

                {/* Slide Ratio Tag */}
                <rect x="42" y="6.5" width="44" height="9" rx="4.5" className="fill-neutral-100 dark:fill-neutral-800 stroke-neutral-200/80 dark:stroke-neutral-700/60" strokeWidth="0.8" />
                <rect x="48" y="10" width="32" height="2" rx="1" className="fill-neutral-600 dark:fill-neutral-400" />

                {/* Slide Counter on Top Right */}
                <rect x="194" y="6.5" width="32" height="9" rx="4.5" className="fill-neutral-100 dark:fill-neutral-800" />
                <rect x="200" y="10" width="20" height="2" rx="1" className="fill-neutral-600 dark:fill-neutral-500" />

                {/* ── LEFT FILMSTRIP: Thumbnail Slides ── */}
                <g>
                  <rect x="6" y="25" width="36" height="106" rx="5" className="fill-neutral-50/90 dark:fill-neutral-900/60 stroke-neutral-200/50 dark:stroke-transparent" strokeWidth="0.5" />
                  
                  {/* Thumbnail 01 (Crisp Active Thumbnail) */}
                  <rect x="9" y="29" width="30" height="28" rx="3.5" className="fill-white dark:fill-[#222222] stroke-neutral-900 dark:stroke-neutral-500 shadow-xs" strokeWidth="1.2" style={{ animation: "c2ThumbHighlight 7s ease-in-out infinite" }} />
                  <rect x="13" y="35" width="16" height="2.5" rx="1" className="fill-neutral-900 dark:fill-neutral-300" />
                  <rect x="13" y="41" width="22" height="2" rx="1" className="fill-neutral-200 dark:fill-neutral-600" />
                  <rect x="13" y="46" width="18" height="2" rx="1" className="fill-neutral-200 dark:fill-neutral-600" />

                  {/* Thumbnail 02 */}
                  <rect x="9" y="63" width="30" height="28" rx="3.5" className="fill-white dark:fill-[#1a1a1a] stroke-neutral-200 dark:stroke-neutral-800" strokeWidth="0.8" />
                  <rect x="13" y="69" width="14" height="2.5" rx="1" className="fill-neutral-400 dark:fill-neutral-500" />
                  <rect x="13" y="75" width="22" height="2" rx="1" className="fill-neutral-200 dark:fill-neutral-700" />

                  {/* Thumbnail 03 */}
                  <rect x="9" y="97" width="30" height="28" rx="3.5" className="fill-white dark:fill-[#1a1a1a] stroke-neutral-200 dark:stroke-neutral-800" strokeWidth="0.8" />
                  <rect x="13" y="103" width="18" height="2.5" rx="1" className="fill-neutral-400 dark:fill-neutral-500" />
                  <rect x="13" y="109" width="20" height="2" rx="1" className="fill-neutral-200 dark:fill-neutral-700" />
                </g>

                {/* ── MAIN 16:9 SLIDE CANVAS (Crisp White Board with Delicate Shadow) ── */}
                <g style={{ animation: "c2SlideShift 7s cubic-bezier(0.16, 1, 0.3, 1) infinite" }}>
                  {/* Canvas Board */}
                  <rect x="48" y="26" width="184" height="104" rx="6" className="fill-white dark:fill-[#1d1d1d] stroke-neutral-200/90 dark:stroke-neutral-800 shadow-xs" strokeWidth="1" />

                  {/* Slide Title Header */}
                  <g style={{ animation: "c2SlideHeader 7s cubic-bezier(0.16, 1, 0.3, 1) infinite" }}>
                    <rect x="58" y="33" width="34" height="7" rx="3.5" className="fill-neutral-100 dark:fill-neutral-800 stroke-neutral-200 dark:stroke-neutral-700" strokeWidth="0.8" />
                    <rect x="98" y="34.5" width="70" height="4.5" rx="2" className="fill-neutral-900 dark:fill-neutral-300" />
                  </g>

                  {/* Slide Column 1: Chart & Metric Card (Crisp High-Contrast Bars in Light Mode) */}
                  <g style={{ animation: "c2Col1Reveal 7s cubic-bezier(0.16, 1, 0.3, 1) infinite" }}>
                    <rect x="58" y="45" width="60" height="74" rx="5" className="fill-white dark:fill-[#242424] stroke-neutral-200/80 dark:stroke-neutral-700/80 shadow-xs" strokeWidth="0.9" />
                    <rect x="65" y="53" width="32" height="3.5" rx="1.5" className="fill-neutral-900 dark:fill-neutral-300" />
                    
                    {/* High-Contrast Crisp Bar Chart (Peak bar in dark charcoal) */}
                    <rect x="65" y="96" width="6" height="16" rx="1.5" className="fill-neutral-200 dark:fill-neutral-600" />
                    <rect x="74" y="84" width="6" height="28" rx="1.5" className="fill-neutral-300 dark:fill-neutral-500" />
                    <rect x="83" y="72" width="6" height="40" rx="1.5" className="fill-neutral-900 dark:fill-neutral-300" />
                    <rect x="92" y="88" width="6" height="24" rx="1.5" className="fill-neutral-400 dark:fill-neutral-500" />
                    <rect x="101" y="100" width="6" height="12" rx="1.5" className="fill-neutral-200 dark:fill-neutral-600" />
                  </g>

                  {/* Slide Column 2: Structured Points */}
                  <g style={{ animation: "c2Col2Reveal 7s cubic-bezier(0.16, 1, 0.3, 1) infinite" }}>
                    <rect x="124" y="45" width="98" height="74" rx="5" className="fill-white dark:fill-[#242424] stroke-neutral-200/80 dark:stroke-neutral-700/80 shadow-xs" strokeWidth="0.9" />
                    <rect x="132" y="53" width="48" height="3.5" rx="1.5" className="fill-neutral-900 dark:fill-neutral-300" />
                    
                    <circle cx="135" cy="67" r="1.8" className="fill-neutral-700 dark:fill-neutral-500" />
                    <rect x="141" y="65.5" width="68" height="3" rx="1.5" className="fill-neutral-400 dark:fill-neutral-500" />
                    
                    <circle cx="135" cy="79" r="1.8" className="fill-neutral-700 dark:fill-neutral-500" />
                    <rect x="141" y="77.5" width="58" height="3" rx="1.5" className="fill-neutral-400 dark:fill-neutral-500" />
                    
                    <circle cx="135" cy="91" r="1.8" className="fill-neutral-700 dark:fill-neutral-500" />
                    <rect x="141" y="89.5" width="64" height="3" rx="1.5" className="fill-neutral-400 dark:fill-neutral-500" />
                    
                    <circle cx="135" cy="103" r="1.8" className="fill-neutral-700 dark:fill-neutral-500" />
                    <rect x="141" y="101.5" width="48" height="3" rx="1.5" className="fill-neutral-400 dark:fill-neutral-500" />
                  </g>

                  {/* ── Selection Box (Crisp Charcoal Outline in Light Mode) ── */}
                  <g style={{ transformOrigin: "173px 82px", animation: "c2SelectBounding 7s cubic-bezier(0.34, 1.56, 0.64, 1) infinite" }}>
                    <rect x="122" y="43" width="102" height="78" rx="6" className="stroke-neutral-900 dark:stroke-neutral-400 anim-wire-flow" strokeWidth="1.2" />
                    
                    {/* 4 Corner Handles */}
                    <g style={{ transformOrigin: "173px 82px", animation: "c2HandlesPop 7s cubic-bezier(0.34, 1.56, 0.64, 1) infinite" }}>
                      <rect x="120" y="41" width="4.5" height="4.5" rx="1" className="fill-neutral-900 dark:fill-neutral-300 stroke-white dark:stroke-neutral-800" strokeWidth="0.8" />
                      <rect x="221.5" y="41" width="4.5" height="4.5" rx="1" className="fill-neutral-900 dark:fill-neutral-300 stroke-white dark:stroke-neutral-800" strokeWidth="0.8" />
                      <rect x="120" y="118.5" width="4.5" height="4.5" rx="1" className="fill-neutral-900 dark:fill-neutral-300 stroke-white dark:stroke-neutral-800" strokeWidth="0.8" />
                      <rect x="221.5" y="118.5" width="4.5" height="4.5" rx="1" className="fill-neutral-900 dark:fill-neutral-300 stroke-white dark:stroke-neutral-800" strokeWidth="0.8" />
                    </g>
                  </g>

                  {/* ── Export PPTX Pill (Sleek Dark Pill in Light Mode) ── */}
                  <g style={{ transformOrigin: "198px 105px", animation: "c2PptxPill 7s cubic-bezier(0.34, 1.56, 0.64, 1) infinite" }}>
                    <rect x="178" y="98" width="44" height="15" rx="5" className="fill-neutral-900 dark:fill-neutral-300 shadow-sm" />
                    <rect x="184" y="103.5" width="18" height="3" rx="1.5" className="fill-white dark:fill-neutral-900" />
                    <circle cx="213" cy="105.5" r="3" className="fill-white/30 dark:fill-neutral-900/20" />
                    <path d="M211.5 105.5 L212.5 106.5 L214.5 104.5" stroke="currentColor" className="text-white dark:text-neutral-900" strokeWidth="0.9" strokeLinecap="round" />
                  </g>
                </g>

                {/* ── Pointer Cursor ── */}
                <g style={{ animation: "c2CursorSlide 7s cubic-bezier(0.25, 1, 0.5, 1) infinite" }}>
                  <path d="M0 0 L0 12 L3.5 9.5 L7.5 15.5 L9.5 14.5 L5.5 8.5 L9.5 8.5 Z" className="fill-neutral-800 dark:fill-neutral-400 stroke-white dark:stroke-neutral-800 drop-shadow-xs" strokeWidth="0.8" />
                </g>
              </svg>
            </div>
          </motion.div>
        </Link>

        {/* ══════════════════════════════════════════════════════════
         * CARD 3: AUTOMATION (Multi-Branch Canvas Pan & Soft Gray)
         * ══════════════════════════════════════════════════════════ */}
        <Link href="/automation" className="group block h-full" title="Launcher Automation">
          <motion.div
            whileHover={{ y: -3, scale: 1.01 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full h-56 sm:h-60 rounded-xl overflow-hidden bg-white dark:bg-[#121212] border border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-400/80 dark:hover:border-neutral-700 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-xl transition-all duration-300 flex items-center justify-center p-2 sm:p-2.5 select-none"
          >
            {/* Apple Brand Style Clean Title */}
            <div className="absolute top-3 left-4 z-10 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 dark:bg-neutral-500" />
              <span className="text-[13px] font-medium font-inter tracking-tight text-neutral-700 dark:text-neutral-400 group-hover:text-neutral-950 dark:group-hover:text-neutral-200 transition-colors duration-200">
                Launcher Automation
              </span>
            </div>

            {/* SVG Narrative Micro-Video Animation */}
            <div className="relative z-10 w-full max-w-[340px] sm:max-w-[370px] pt-4 transition-transform duration-300 group-hover:scale-[1.02]">
              <svg viewBox="0 0 240 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto drop-shadow-xs">
                {/* Canvas Outer Frame (Crisp Pure White in Light Mode) */}
                <rect x="2" y="2" width="236" height="136" rx="6" className="fill-white dark:fill-[#171717] stroke-neutral-200/90 dark:stroke-neutral-800 shadow-xs" strokeWidth="1.2" />
                
                {/* Window Bar */}
                <line x1="2" y1="21" x2="238" y2="21" className="stroke-neutral-100 dark:stroke-neutral-800" strokeWidth="1" />
                <circle cx="12" cy="11.5" r="2.4" className="fill-neutral-300 dark:fill-neutral-700" />
                <circle cx="19.5" cy="11.5" r="2.4" className="fill-neutral-300 dark:fill-neutral-700" />
                <circle cx="27" cy="11.5" r="2.4" className="fill-neutral-300 dark:fill-neutral-700" />

                {/* ── PANNING CANVAS GROUP ── */}
                <g style={{ animation: "c3CanvasPan 7s cubic-bezier(0.4, 0, 0.2, 1) infinite" }}>
                  
                  {/* Connecting Cables */}
                  <path d="M54 66 L105 66" className="stroke-neutral-300 dark:stroke-neutral-700 anim-wire-flow" strokeWidth="1.5" />
                  <path d="M162 66 C185 66, 188 44, 218 44" className="stroke-neutral-300 dark:stroke-neutral-700 anim-wire-flow" strokeWidth="1.5" />
                  <path d="M162 66 C185 66, 188 88, 218 88" className="stroke-neutral-300 dark:stroke-neutral-700 anim-wire-flow" strokeWidth="1.5" />

                  {/* ── NODE 1: Trigger Node (Crisp White Floating Card) ── */}
                  <g style={{ transformOrigin: "30px 66px", animation: "c3TriggerPulse 7s ease-in-out infinite" }}>
                    <rect x="8" y="45" width="46" height="42" rx="6" className="fill-white dark:fill-[#222222] stroke-neutral-200/90 dark:stroke-neutral-700 shadow-xs" strokeWidth="1.2" />
                    <rect x="14" y="52" width="18" height="3" rx="1.5" className="fill-neutral-900 dark:fill-neutral-300" />
                    
                    <circle cx="20" cy="68" r="6" className="fill-neutral-100 dark:fill-neutral-800 stroke-neutral-200 dark:stroke-neutral-600" strokeWidth="0.8" />
                    <path d="M20 64.5 L18.8 68 L21.2 68 L20 71.5" stroke="currentColor" className="text-neutral-900 dark:text-neutral-300" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    
                    <rect x="29" y="67" width="18" height="2.5" rx="1" className="fill-neutral-400 dark:fill-neutral-500" />
                    <circle cx="54" cy="66" r="3" className="fill-neutral-700 dark:fill-neutral-500 stroke-white dark:stroke-[#171717]" strokeWidth="1" />
                  </g>

                  {/* Energy Packet 1 */}
                  <g style={{ animation: "c3PacketA 7s ease-out infinite" }}>
                    <circle cx="0" cy="0" r="3.2" className="fill-neutral-900 dark:fill-neutral-300" />
                  </g>

                  {/* ── NODE 2: AI Processor & Router Node (✦) ── */}
                  <g style={{ transformOrigin: "133px 66px", animation: "c3AiRouterPulse 7s ease-in-out infinite" }}>
                    <rect x="105" y="42" width="57" height="48" rx="6" className="fill-white dark:fill-[#222222] stroke-neutral-200/90 dark:stroke-neutral-600 shadow-xs" strokeWidth="1.3" />
                    <circle cx="105" cy="66" r="3" className="fill-neutral-700 dark:fill-neutral-500 stroke-white dark:stroke-[#171717]" strokeWidth="1" />
                    
                    <rect x="114" y="50" width="26" height="3" rx="1.5" className="fill-neutral-900 dark:fill-neutral-300" />
                    
                    <circle cx="123" cy="68" r="6" className="fill-neutral-100 dark:fill-neutral-800 stroke-neutral-200 dark:stroke-neutral-600" strokeWidth="0.8" />
                    <path d="M123 65.5 L123.8 67.2 L125.5 68 L123.8 68.8 L123 70.5 L122.2 68.8 L120.5 68 L122.2 67.2 Z" className="fill-neutral-900 dark:fill-neutral-300" />
                    
                    <rect x="133" y="64" width="22" height="2.5" rx="1" className="fill-neutral-400 dark:fill-neutral-500" />
                    <rect x="133" y="70" width="16" height="2" rx="1" className="fill-neutral-300 dark:fill-neutral-600" />
                    
                    <circle cx="162" cy="66" r="3" className="fill-neutral-700 dark:fill-neutral-500 stroke-white dark:stroke-[#171717]" strokeWidth="1" />
                  </g>

                  {/* Energy Packets Splitting into Branches */}
                  <g style={{ animation: "c3PacketBranchTop 7s ease-out infinite" }}>
                    <circle cx="0" cy="0" r="3.2" className="fill-neutral-900 dark:fill-neutral-300" />
                  </g>
                  <g style={{ animation: "c3PacketBranchBottom 7s ease-out infinite" }}>
                    <circle cx="0" cy="0" r="3.2" className="fill-neutral-900 dark:fill-neutral-300" />
                  </g>

                  {/* ── BRANCH NODE 3A: Action Top (Notification / Webhook) ── */}
                  <g style={{ transformOrigin: "238px 44px", animation: "c3ActionTopPulse 7s ease-in-out infinite" }}>
                    <circle cx="218" cy="44" r="3" className="fill-neutral-700 dark:fill-neutral-500 stroke-white dark:stroke-[#171717]" strokeWidth="1" />
                    <rect x="218" y="27" width="48" height="34" rx="5" className="fill-white dark:fill-[#222222] stroke-neutral-200/90 dark:stroke-neutral-700 shadow-xs" strokeWidth="1.2" />
                    <rect x="224" y="33" width="20" height="2.5" rx="1" className="fill-neutral-900 dark:fill-neutral-300" />
                    <circle cx="230" cy="48" r="5" className="fill-neutral-100 dark:fill-neutral-800" />
                    <path d="M228.5 48 L229.5 49 L232 46.5" stroke="currentColor" className="text-neutral-900 dark:text-neutral-300" strokeWidth="1" strokeLinecap="round" />
                    <rect x="238" y="47" width="18" height="2" rx="1" className="fill-neutral-400 dark:fill-neutral-500" />
                  </g>

                  {/* ── BRANCH NODE 3B: Action Bottom (Database / Storage) ── */}
                  <g style={{ transformOrigin: "238px 88px", animation: "c3ActionBottomPulse 7s ease-in-out infinite" }}>
                    <circle cx="218" cy="88" r="3" className="fill-neutral-700 dark:fill-neutral-500 stroke-white dark:stroke-[#171717]" strokeWidth="1" />
                    <rect x="218" y="71" width="48" height="34" rx="5" className="fill-white dark:fill-[#222222] stroke-neutral-200/90 dark:stroke-neutral-700 shadow-xs" strokeWidth="1.2" />
                    <rect x="224" y="77" width="22" height="2.5" rx="1" className="fill-neutral-900 dark:fill-neutral-300" />
                    <circle cx="230" cy="92" r="5" className="fill-neutral-100 dark:fill-neutral-800" />
                    <path d="M228.5 92 L229.5 93 L232 90.5" stroke="currentColor" className="text-neutral-900 dark:text-neutral-300" strokeWidth="1" strokeLinecap="round" />
                    <rect x="238" y="91" width="16" height="2" rx="1" className="fill-neutral-400 dark:fill-neutral-500" />
                  </g>

                </g>

                {/* ── Execution Status Pill (Crisp Floating White Pill in Light Mode) ── */}
                <g style={{ animation: "c3ExecutionStatus 7s cubic-bezier(0.34, 1.56, 0.64, 1) infinite" }}>
                  <rect x="12" y="110" width="80" height="16" rx="5" className="fill-white dark:fill-[#222222] stroke-neutral-200/90 dark:stroke-neutral-700/80 shadow-xs" strokeWidth="0.8" />
                  <circle cx="20" cy="118" r="2.5" className="fill-neutral-900 dark:fill-neutral-400" />
                  <rect x="28" y="116.5" width="36" height="3" rx="1.5" className="fill-neutral-900 dark:fill-neutral-300" />
                  <rect x="68" y="116.5" width="18" height="3" rx="1.5" className="fill-neutral-400 dark:fill-neutral-500" />
                </g>
              </svg>
            </div>
          </motion.div>
        </Link>

      </div>
    </div>
  );
}
