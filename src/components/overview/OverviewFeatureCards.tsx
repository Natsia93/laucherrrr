"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export function OverviewFeatureCards() {
  return (
    <div className="w-full">
      {/* ── Storyboarded Keyframe Animations (Synchronized 7-Second Loops) ── */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* ── CARD 1: LLM MODE ANIMATIONS ── */
        @keyframes c1CursorMove {
          0% { transform: translate(210px, 115px); opacity: 0; }
          6% { opacity: 1; }
          12% { transform: translate(50px, 98px) scale(1); opacity: 1; }
          16% { transform: translate(50px, 98px) scale(0.85); opacity: 1; }
          20% { transform: translate(50px, 98px) scale(1); opacity: 1; }
          28% { transform: translate(210px, 98px) scale(1); opacity: 1; }
          32% { transform: translate(210px, 98px) scale(0.82); opacity: 1; }
          36% { transform: translate(210px, 98px) scale(1); opacity: 0.8; }
          40%, 100% { transform: translate(210px, 98px); opacity: 0; }
        }
        @keyframes c1PromptText {
          0%, 16% { width: 0px; opacity: 0; }
          20% { width: 35px; opacity: 1; }
          28% { width: 110px; opacity: 1; }
          33% { width: 110px; opacity: 1; }
          36%, 100% { width: 0px; opacity: 0; }
        }
        @keyframes c1SendPulse {
          0%, 31% { transform: scale(1); }
          33% { transform: scale(1.28); }
          37%, 100% { transform: scale(1); }
        }
        @keyframes c1UserBubble {
          0%, 35% { transform: translateY(8px) scale(0.9); opacity: 0; }
          40% { transform: translateY(0) scale(1); opacity: 1; }
          88% { transform: translateY(0) scale(1); opacity: 1; }
          95%, 100% { transform: translateY(-4px) scale(0.95); opacity: 0; }
        }
        @keyframes c1AiResponse {
          0%, 45% { transform: translateY(8px) scale(0.95); opacity: 0; }
          50% { transform: translateY(0) scale(1); opacity: 1; }
          88% { transform: translateY(0) scale(1); opacity: 1; }
          95%, 100% { transform: translateY(-4px) scale(0.95); opacity: 0; }
        }
        @keyframes c1AiLine1 {
          0%, 50% { width: 0px; opacity: 0; }
          58% { width: 120px; opacity: 1; }
          88% { opacity: 1; }
          95%, 100% { width: 0px; opacity: 0; }
        }
        @keyframes c1AiLine2 {
          0%, 58% { width: 0px; opacity: 0; }
          68% { width: 95px; opacity: 1; }
          88% { opacity: 1; }
          95%, 100% { width: 0px; opacity: 0; }
        }
        @keyframes c1AiBadge {
          0%, 68% { transform: scale(0); opacity: 0; }
          74% { transform: scale(1.15); opacity: 1; }
          78% { transform: scale(1); opacity: 1; }
          88% { opacity: 1; }
          95%, 100% { transform: scale(0.8); opacity: 0; }
        }

        /* ── CARD 2: DECK GENERATOR ANIMATIONS ── */
        @keyframes c2CursorMove {
          0% { transform: translate(210px, 115px); opacity: 0; }
          6% { opacity: 1; }
          12% { transform: translate(204px, 96px) scale(1); opacity: 1; }
          16% { transform: translate(204px, 96px) scale(0.82); opacity: 1; }
          20% { transform: translate(204px, 96px) scale(1); opacity: 0.8; }
          26%, 100% { opacity: 0; }
        }
        @keyframes c2WandBurst {
          0%, 15% { transform: scale(0); opacity: 0; }
          18% { transform: scale(1.4); opacity: 1; }
          25%, 100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes c2HeaderSlide {
          0%, 20% { transform: translateX(-15px); opacity: 0; }
          28% { transform: translateX(0); opacity: 1; }
          88% { opacity: 1; }
          95%, 100% { transform: translateX(10px); opacity: 0; }
        }
        @keyframes c2Col1Slide {
          0%, 28% { transform: translateY(12px); opacity: 0; }
          36% { transform: translateY(0); opacity: 1; }
          88% { opacity: 1; }
          95%, 100% { transform: translateY(-8px); opacity: 0; }
        }
        @keyframes c2Col2Slide {
          0%, 36% { transform: translateY(12px); opacity: 0; }
          44% { transform: translateY(0); opacity: 1; }
          88% { opacity: 1; }
          95%, 100% { transform: translateY(-8px); opacity: 0; }
        }
        @keyframes c2BoundingBox {
          0%, 48% { transform: scale(0.9); opacity: 0; }
          54% { transform: scale(1.04); opacity: 1; }
          58% { transform: scale(1); opacity: 1; }
          88% { opacity: 1; }
          95%, 100% { transform: scale(0.9); opacity: 0; }
        }
        @keyframes c2Handles {
          0%, 55% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.3); opacity: 1; }
          64% { transform: scale(1); opacity: 1; }
          88% { opacity: 1; }
          95%, 100% { transform: scale(0); opacity: 0; }
        }
        @keyframes c2ExportPill {
          0%, 65% { transform: translateY(6px) scale(0.8); opacity: 0; }
          71% { transform: translateY(0) scale(1.1); opacity: 1; }
          75% { transform: translateY(0) scale(1); opacity: 1; }
          88% { opacity: 1; }
          95%, 100% { transform: translateY(-4px); opacity: 0; }
        }

        /* ── CARD 3: AUTOMATION ANIMATIONS ── */
        @keyframes c4Node1Pulse {
          0%, 8% { transform: scale(1); }
          12% { transform: scale(1.08); filter: drop-shadow(0 0 6px rgba(245, 158, 11, 0.6)); }
          16%, 100% { transform: scale(1); }
        }
        @keyframes c4DashTravel1 {
          0%, 12% { stroke-dashoffset: 70; opacity: 0.2; }
          16% { opacity: 1; }
          32% { stroke-dashoffset: 0; opacity: 1; }
          38%, 100% { stroke-dashoffset: 0; opacity: 0.3; }
        }
        @keyframes c4Packet1 {
          0%, 14% { transform: translate(66px, 48px); opacity: 0; }
          16% { opacity: 1; }
          23% { transform: translate(88px, 60px); opacity: 1; }
          30% { transform: translate(110px, 74px); opacity: 1; }
          32%, 100% { transform: translate(110px, 74px); opacity: 0; }
        }
        @keyframes c4Node2Pulse {
          0%, 28% { transform: scale(1); }
          34% { transform: scale(1.1); filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.7)); }
          42% { transform: scale(1); }
          100% { transform: scale(1); }
        }
        @keyframes c4DashTravel2 {
          0%, 42% { stroke-dashoffset: 70; opacity: 0.2; }
          46% { opacity: 1; }
          60% { stroke-dashoffset: 0; opacity: 1; }
          66%, 100% { stroke-dashoffset: 0; opacity: 0.3; }
        }
        @keyframes c4Packet2 {
          0%, 44% { transform: translate(168px, 74px); opacity: 0; }
          46% { opacity: 1; }
          52% { transform: translate(182px, 60px); opacity: 1; }
          58% { transform: translate(196px, 48px); opacity: 1; }
          60%, 100% { transform: translate(196px, 48px); opacity: 0; }
        }
        @keyframes c4Node3Pulse {
          0%, 56% { transform: scale(1); }
          62% { transform: scale(1.1); filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.7)); }
          68%, 100% { transform: scale(1); }
        }
        @keyframes c4SuccessBadge {
          0%, 65% { transform: translateY(6px); opacity: 0; }
          71% { transform: translateY(0); opacity: 1; }
          88% { opacity: 1; }
          95%, 100% { transform: translateY(-4px); opacity: 0; }
        }

        /* Continuous SVG Dash Running Line */
        @keyframes continuousDash {
          from { stroke-dashoffset: 30; }
          to { stroke-dashoffset: 0; }
        }
        .anim-line-flow {
          stroke-dasharray: 4 3;
          animation: continuousDash 1s linear infinite;
        }
      `}} />

      {/* 3-Column Responsive Grid (More spacious, larger SVG viewports) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 items-stretch">
        
        {/* ══════════════════════════════════════════════════════════
         * CARD 1: LLM MODE (Clean, No-Dots, High-Fidelity Micro-Demo)
         * ══════════════════════════════════════════════════════════ */}
        <Link href="/dashboard" className="group block h-full" title="LLM Mode">
          <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full h-52 sm:h-56 rounded-2xl overflow-hidden bg-white dark:bg-[#121212] border border-neutral-200/90 dark:border-neutral-800 hover:border-neutral-400/80 dark:hover:border-neutral-700 shadow-xs hover:shadow-xl transition-all duration-300 flex items-center justify-center p-3 select-none"
          >
            {/* Badge Indicator */}
            <div className="absolute top-3.5 right-3.5 z-10">
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase bg-[#FFDE3C] text-neutral-950 shadow-2xs">
                AI CORE
              </span>
            </div>

            {/* SVG Narrative Micro-Video Animation */}
            <div className="relative z-10 w-full max-w-[275px] sm:max-w-[290px] transition-transform duration-300 group-hover:scale-[1.03]">
              <svg viewBox="0 0 240 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto drop-shadow-xs">
                {/* Outer Window */}
                <rect x="2" y="2" width="236" height="116" rx="9" className="fill-white dark:fill-[#181818] stroke-neutral-300/90 dark:stroke-neutral-700/80" strokeWidth="1.2" />
                
                {/* Window Bar with 3 Dots */}
                <line x1="2" y1="21" x2="238" y2="21" className="stroke-neutral-200 dark:stroke-neutral-800" strokeWidth="1" />
                <circle cx="12" cy="11.5" r="2.4" className="fill-neutral-300 dark:fill-neutral-600" />
                <circle cx="19.5" cy="11.5" r="2.4" className="fill-neutral-300 dark:fill-neutral-600" />
                <circle cx="27" cy="11.5" r="2.4" className="fill-neutral-300 dark:fill-neutral-600" />

                {/* Mode Pill Badges Top Bar */}
                <rect x="156" y="6.5" width="70" height="9" rx="4.5" className="fill-neutral-100 dark:fill-neutral-800 stroke-neutral-200 dark:stroke-neutral-700" strokeWidth="0.8" />
                <circle cx="163" cy="11" r="2" className="fill-emerald-500" />
                <rect x="170" y="10" width="50" height="2" rx="1" className="fill-neutral-400 dark:fill-neutral-500" />

                {/* ── STAGE 2: User Chat Bubble (Pops in after typing) ── */}
                <g style={{ transformOrigin: "180px 34px", animation: "c1UserBubble 7s cubic-bezier(0.16, 1, 0.3, 1) infinite" }}>
                  <rect x="128" y="26" width="100" height="17" rx="8" className="fill-[#FFE54C]/40 dark:fill-[#262626] stroke-[#E5BC10]/60 dark:stroke-neutral-700" strokeWidth="1" />
                  <rect x="138" y="33" width="62" height="3" rx="1.5" className="fill-neutral-800 dark:fill-neutral-200" />
                  <rect x="206" y="33" width="14" height="3" rx="1.5" className="fill-[#E5BC10]" />
                </g>

                {/* ── STAGE 3: AI Response Generation (Slides up & lines stream in) ── */}
                <g style={{ transformOrigin: "20px 60px", animation: "c1AiResponse 7s cubic-bezier(0.16, 1, 0.3, 1) infinite" }}>
                  {/* AI Avatar */}
                  <circle cx="19" cy="58" r="7" className="fill-[#FFE54C] stroke-[#E5BC10]" strokeWidth="1" />
                  <path d="M19 55 L19.9 57 L22 58 L19.9 59 L19 61 L18.1 59 L16 58 L18.1 57 Z" className="fill-neutral-950" />

                  {/* AI Bubble Container */}
                  <rect x="31" y="48" width="197" height="30" rx="7" className="fill-neutral-50/90 dark:fill-neutral-800/50 stroke-neutral-200 dark:stroke-neutral-700/80" strokeWidth="1" />
                  
                  {/* Animated Streaming Text Lines */}
                  <rect x="40" y="56" height="4" rx="2" className="fill-neutral-800 dark:fill-neutral-100" style={{ animation: "c1AiLine1 7s ease-out infinite" }} />
                  <rect x="40" y="65" height="3.5" rx="1.7" className="fill-neutral-400 dark:fill-neutral-400" style={{ animation: "c1AiLine2 7s ease-out infinite" }} />

                  {/* AI Action/Result Badge Pop */}
                  <g style={{ transformOrigin: "212px 62px", animation: "c1AiBadge 7s cubic-bezier(0.34, 1.56, 0.64, 1) infinite" }}>
                    <circle cx="215" cy="63" r="5.5" className="fill-emerald-500" />
                    <path d="M213 63 L214.5 64.5 L217.5 61.5" stroke="white" strokeWidth="1" strokeLinecap="round" />
                  </g>
                </g>

                {/* ── STAGE 1: Bottom Prompt Box with Animated Typing ── */}
                <rect x="12" y="86" width="216" height="23" rx="11.5" className="fill-neutral-50 dark:fill-neutral-900 stroke-neutral-300 dark:stroke-neutral-700" strokeWidth="1" />
                
                {/* Left Sparkle Pill */}
                <circle cx="25" cy="97.5" r="5" className="fill-[#FFE54C]/30 stroke-[#E5BC10]" strokeWidth="0.8" />
                <path d="M25 94.5 L25.7 96.2 L27.2 97.5 L25.7 98.8 L25 100.5 L24.3 98.8 L22.8 97.5 L24.3 96.2 Z" className="fill-[#E5BC10]" />

                {/* Typing Text Line (Expands then sends) */}
                <rect x="38" y="96" height="3" rx="1.5" className="fill-neutral-600 dark:fill-neutral-300" style={{ animation: "c1PromptText 7s linear infinite" }} />

                {/* Send Button (Scales on click) */}
                <g style={{ transformOrigin: "213px 97.5px", animation: "c1SendPulse 7s ease-in-out infinite" }}>
                  <circle cx="213" cy="97.5" r="6.5" className="fill-neutral-900 dark:fill-neutral-100" />
                  <path d="M213 100.5 L213 94.5 M210.8 96.5 L213 94.5 L215.2 96.5" stroke="currentColor" className="text-white dark:text-neutral-900" strokeWidth="1.1" strokeLinecap="round" />
                </g>

                {/* ── Pointer Cursor (Glides in, clicks, types, clicks send) ── */}
                <g style={{ animation: "c1CursorMove 7s cubic-bezier(0.25, 1, 0.5, 1) infinite" }}>
                  <path d="M0 0 L0 12 L3.5 9.5 L7.5 15.5 L9.5 14.5 L5.5 8.5 L9.5 8.5 Z" className="fill-neutral-900 dark:fill-white stroke-white dark:stroke-neutral-900 drop-shadow-md" strokeWidth="0.9" />
                </g>
              </svg>
            </div>
          </motion.div>
        </Link>

        {/* ══════════════════════════════════════════════════════════
         * CARD 2: DECK GENERATOR (Clean, No-Dots, High-Fidelity Micro-Demo)
         * ══════════════════════════════════════════════════════════ */}
        <Link href="/decks" className="group block h-full" title="Deck Generator">
          <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full h-52 sm:h-56 rounded-2xl overflow-hidden bg-white dark:bg-[#121212] border border-neutral-200/90 dark:border-neutral-800 hover:border-neutral-400/80 dark:hover:border-neutral-700 shadow-xs hover:shadow-xl transition-all duration-300 flex items-center justify-center p-3 select-none"
          >
            {/* Badge Indicator */}
            <div className="absolute top-3.5 right-3.5 z-10">
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase bg-purple-600 text-white shadow-2xs">
                SLIDES
              </span>
            </div>

            {/* SVG Narrative Micro-Video Animation */}
            <div className="relative z-10 w-full max-w-[275px] sm:max-w-[290px] transition-transform duration-300 group-hover:scale-[1.03]">
              <svg viewBox="0 0 240 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto drop-shadow-xs">
                {/* Presentation 16:9 Canvas Frame */}
                <rect x="2" y="2" width="236" height="116" rx="9" className="fill-white dark:fill-[#171717] stroke-neutral-300/90 dark:stroke-neutral-700/80" strokeWidth="1.2" />
                
                {/* Window Bar */}
                <line x1="2" y1="21" x2="238" y2="21" className="stroke-neutral-200 dark:stroke-neutral-800" strokeWidth="1" />
                <circle cx="12" cy="11.5" r="2.4" className="fill-neutral-300 dark:fill-neutral-600" />
                <circle cx="19.5" cy="11.5" r="2.4" className="fill-neutral-300 dark:fill-neutral-600" />
                <circle cx="27" cy="11.5" r="2.4" className="fill-neutral-300 dark:fill-neutral-600" />

                {/* ── STAGE 2: Slide Title Bar Slides In ── */}
                <g style={{ animation: "c2HeaderSlide 7s cubic-bezier(0.16, 1, 0.3, 1) infinite" }}>
                  <rect x="14" y="27" width="34" height="7.5" rx="3.75" className="fill-purple-500/20 stroke-purple-500" strokeWidth="0.8" />
                  <rect x="54" y="28.5" width="70" height="5" rx="2.5" className="fill-neutral-800 dark:fill-neutral-200" />
                </g>

                {/* ── STAGE 2.1: Column 1 Wireframe Card Slides In ── */}
                <g style={{ animation: "c2Col1Slide 7s cubic-bezier(0.16, 1, 0.3, 1) infinite" }}>
                  <rect x="14" y="39" width="92" height="40" rx="5" className="fill-purple-50/50 dark:fill-purple-950/20 stroke-purple-200 dark:stroke-purple-800/80" strokeWidth="1" />
                  <rect x="23" y="46.5" width="45" height="4" rx="2" className="fill-purple-700 dark:fill-purple-300" />
                  <rect x="23" y="55" width="74" height="3" rx="1.5" className="fill-purple-400/80 dark:fill-purple-500" />
                  <rect x="23" y="62" width="60" height="3" rx="1.5" className="fill-purple-400/60 dark:fill-purple-600" />
                </g>

                {/* ── STAGE 2.2: Column 2 Wireframe Card Slides In ── */}
                <g style={{ animation: "c2Col2Slide 7s cubic-bezier(0.16, 1, 0.3, 1) infinite" }}>
                  <rect x="114" y="39" width="112" height="40" rx="5" className="fill-neutral-50 dark:fill-neutral-800/40 stroke-neutral-200 dark:stroke-neutral-700/80" strokeWidth="1" />
                  <rect x="123" y="46.5" width="55" height="4" rx="2" className="fill-neutral-700 dark:fill-neutral-300" />
                  <rect x="123" y="55" width="92" height="3" rx="1.5" className="fill-neutral-400 dark:fill-neutral-500" />
                  <rect x="123" y="62" width="75" height="3" rx="1.5" className="fill-neutral-400/80 dark:fill-neutral-600" />
                </g>

                {/* ── STAGE 3: Bounding Box Selection Snaps on Slide (Exact ngodingpakeai style) ── */}
                <g style={{ transformOrigin: "170px 59px", animation: "c2BoundingBox 7s cubic-bezier(0.34, 1.56, 0.64, 1) infinite" }}>
                  <rect x="111" y="37" width="118" height="44" rx="6" className="stroke-purple-500 dark:stroke-purple-400 anim-line-flow shadow-lg" strokeWidth="1.3" />
                  
                  {/* 4 Corner Resize Handles */}
                  <g style={{ transformOrigin: "170px 59px", animation: "c2Handles 7s cubic-bezier(0.34, 1.56, 0.64, 1) infinite" }}>
                    <rect x="109" y="35" width="5" height="5" rx="1" className="fill-purple-600 stroke-white" strokeWidth="0.8" />
                    <rect x="226.5" y="35" width="5" height="5" rx="1" className="fill-purple-600 stroke-white" strokeWidth="0.8" />
                    <rect x="109" y="78.5" width="5" height="5" rx="1" className="fill-purple-600 stroke-white" strokeWidth="0.8" />
                    <rect x="226.5" y="78.5" width="5" height="5" rx="1" className="fill-purple-600 stroke-white" strokeWidth="0.8" />
                  </g>
                </g>

                {/* ── STAGE 4: Export PPTX Floating Badge ── */}
                <g style={{ transformOrigin: "196px 74px", animation: "c2ExportPill 7s cubic-bezier(0.34, 1.56, 0.64, 1) infinite" }}>
                  <rect x="174" y="67" width="46" height="14" rx="5" className="fill-purple-600 shadow-md" />
                  <rect x="181" y="72.5" width="18" height="3" rx="1.5" className="fill-white" />
                  <circle cx="211" cy="74" r="3.2" className="fill-white/30" />
                  <path d="M210 74 L211 75 L212.5 73" stroke="white" strokeWidth="0.9" strokeLinecap="round" />
                </g>

                {/* Bottom Purple Magic Prompt Bar */}
                <rect x="12" y="86" width="216" height="23" rx="11.5" className="fill-neutral-50 dark:fill-neutral-900 stroke-neutral-300 dark:stroke-neutral-700" strokeWidth="1" />
                
                {/* Magic Wand Spark Burst */}
                <g style={{ transformOrigin: "207px 97.5px", animation: "c2WandBurst 7s ease-out infinite" }}>
                  <circle cx="207" cy="97.5" r="7" className="fill-purple-500/40" />
                </g>

                {/* Sparkle Icon */}
                <circle cx="25" cy="97.5" r="5" className="fill-purple-500/20 stroke-purple-500" strokeWidth="0.8" />
                <path d="M25 94.5 L25.7 96.2 L27.2 97.5 L25.7 98.8 L25 100.5 L24.3 98.8 L22.8 97.5 L24.3 96.2 Z" className="fill-purple-500" />
                <rect x="38" y="96" width="85" height="3" rx="1.5" className="fill-neutral-400 dark:fill-neutral-500" />
                
                {/* Purple Trigger Button */}
                <circle cx="207" cy="97.5" r="6.5" className="fill-purple-600" />
                <path d="M205.5 97.5 L208.5 97.5 M207 96 L207 99" stroke="white" strokeWidth="1.2" strokeLinecap="round" />

                {/* ── STAGE 1: Pointer Cursor (Clicks Magic Button) ── */}
                <g style={{ animation: "c2CursorMove 7s cubic-bezier(0.25, 1, 0.5, 1) infinite" }}>
                  <path d="M0 0 L0 12 L3.5 9.5 L7.5 15.5 L9.5 14.5 L5.5 8.5 L9.5 8.5 Z" className="fill-neutral-900 dark:fill-white stroke-white dark:stroke-neutral-900 drop-shadow-md" strokeWidth="0.9" />
                </g>
              </svg>
            </div>
          </motion.div>
        </Link>

        {/* ══════════════════════════════════════════════════════════
         * CARD 3: LAUNCHER AUTOMATION (Clean, No-Dots, High-Fidelity Micro-Demo)
         * ══════════════════════════════════════════════════════════ */}
        <Link href="/automation" className="group block h-full" title="Launcher Automation">
          <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full h-52 sm:h-56 rounded-2xl overflow-hidden bg-white dark:bg-[#121212] border border-neutral-200/90 dark:border-neutral-800 hover:border-neutral-400/80 dark:hover:border-neutral-700 shadow-xs hover:shadow-xl transition-all duration-300 flex items-center justify-center p-3 select-none"
          >
            {/* Badge Indicator */}
            <div className="absolute top-3.5 right-3.5 z-10">
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase bg-blue-600 text-white shadow-2xs">
                WORKFLOW
              </span>
            </div>

            {/* SVG Narrative Micro-Video Animation */}
            <div className="relative z-10 w-full max-w-[275px] sm:max-w-[290px] transition-transform duration-300 group-hover:scale-[1.03]">
              <svg viewBox="0 0 240 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto drop-shadow-xs">
                {/* Canvas Window Frame */}
                <rect x="2" y="2" width="236" height="116" rx="9" className="fill-white dark:fill-[#181818] stroke-neutral-300/90 dark:stroke-neutral-700/80" strokeWidth="1.2" />
                
                {/* Window Bar */}
                <line x1="2" y1="21" x2="238" y2="21" className="stroke-neutral-200 dark:stroke-neutral-800" strokeWidth="1" />
                <circle cx="12" cy="11.5" r="2.4" className="fill-neutral-300 dark:fill-neutral-600" />
                <circle cx="19.5" cy="11.5" r="2.4" className="fill-neutral-300 dark:fill-neutral-600" />
                <circle cx="27" cy="11.5" r="2.4" className="fill-neutral-300 dark:fill-neutral-600" />

                {/* Flow Connection Lines (Dashed curved pipes) */}
                <path
                  d="M66 48 C88 48, 88 74, 110 74"
                  className="stroke-amber-400 dark:stroke-amber-500"
                  strokeWidth="1.6"
                  strokeDasharray="4 3"
                  style={{ animation: "c4DashTravel1 7s ease-out infinite" }}
                />
                <path
                  d="M168 74 C184 74, 184 48, 196 48"
                  className="stroke-blue-400 dark:stroke-blue-500"
                  strokeWidth="1.6"
                  strokeDasharray="4 3"
                  style={{ animation: "c4DashTravel2 7s ease-out infinite" }}
                />

                {/* ── STAGE 1: Node 1 Trigger Fires (Lightning Bolt) ── */}
                <g style={{ transformOrigin: "39px 48px", animation: "c4Node1Pulse 7s ease-in-out infinite" }}>
                  <rect x="12" y="33" width="54" height="30" rx="6" className="fill-amber-50/90 dark:fill-amber-950/40 stroke-amber-400 dark:stroke-amber-500" strokeWidth="1.4" />
                  <circle cx="23" cy="48" r="5" className="fill-amber-500/20 stroke-amber-500" strokeWidth="1" />
                  <path d="M23 45 L21.8 48 L24 48 L22.8 51" stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  <rect x="33" y="44" width="24" height="3.5" rx="1.5" className="fill-amber-900 dark:fill-amber-200" />
                  <rect x="33" y="50" width="18" height="2.5" rx="1" className="fill-amber-500" />
                  <circle cx="66" cy="48" r="3" className="fill-amber-500 stroke-white dark:stroke-[#181818]" strokeWidth="1.2" />
                </g>

                {/* ── STAGE 1.5: Glowing Packet 1 Travels to Node 2 ── */}
                <g style={{ animation: "c4Packet1 7s ease-out infinite" }}>
                  <circle cx="0" cy="0" r="3.5" className="fill-amber-400 shadow-lg" />
                </g>

                {/* ── STAGE 2: Node 2 AI Router Processes (Glows & Sparkles) ── */}
                <g style={{ transformOrigin: "139px 74px", animation: "c4Node2Pulse 7s ease-in-out infinite" }}>
                  <rect x="110" y="58" width="58" height="32" rx="6" className="fill-blue-50/90 dark:fill-blue-950/40 stroke-blue-500 dark:stroke-blue-400 shadow-md" strokeWidth="1.5" />
                  <circle cx="110" cy="74" r="3" className="fill-blue-500 stroke-white dark:stroke-[#181818]" strokeWidth="1.2" />
                  <circle cx="124" cy="74" r="5" className="fill-blue-500" />
                  <path d="M124 71.5 L124.8 73.2 L126.5 74 L124.8 74.8 L124 76.5 L123.2 74.8 L121.5 74 L123.2 73.2 Z" fill="white" />
                  <rect x="134" y="70" width="26" height="3.5" rx="1.5" className="fill-blue-950 dark:fill-blue-100" />
                  <rect x="134" y="76" width="18" height="2.5" rx="1" className="fill-blue-500" />
                  <circle cx="168" cy="74" r="3" className="fill-blue-500 stroke-white dark:stroke-[#181818]" strokeWidth="1.2" />
                </g>

                {/* ── STAGE 2.5: Glowing Packet 2 Travels to Action Node ── */}
                <g style={{ animation: "c4Packet2 7s ease-out infinite" }}>
                  <circle cx="0" cy="0" r="3.5" className="fill-blue-400 shadow-lg" />
                </g>

                {/* ── STAGE 3: Node 3 Action Fires (Checkmark Pop) ── */}
                <g style={{ transformOrigin: "213px 48px", animation: "c4Node3Pulse 7s ease-in-out infinite" }}>
                  <circle cx="196" cy="48" r="3" className="fill-emerald-500 stroke-white dark:stroke-[#181818]" strokeWidth="1.2" />
                  <rect x="196" y="33" width="34" height="30" rx="6" className="fill-emerald-50/90 dark:fill-emerald-950/30 stroke-emerald-400 dark:stroke-emerald-500 shadow-md" strokeWidth="1.4" />
                  <circle cx="213" cy="48" r="5" className="fill-emerald-500" />
                  <path d="M211 48 L212.5 49.5 L215 46.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </g>

                {/* ── STAGE 4: Pipeline Execution Status Pill ── */}
                <g style={{ transformOrigin: "46px 98px", animation: "c4SuccessBadge 7s cubic-bezier(0.34, 1.56, 0.64, 1) infinite" }}>
                  <rect x="12" y="92" width="70" height="14" rx="4.5" className="fill-emerald-50 dark:fill-emerald-950/40 stroke-emerald-400/80" strokeWidth="0.8" />
                  <circle cx="20" cy="99" r="2.5" className="fill-emerald-500" />
                  <rect x="27" y="97.5" width="25" height="3" rx="1.5" className="fill-emerald-700 dark:fill-emerald-300" />
                  <rect x="56" y="97.5" width="20" height="3" rx="1.5" className="fill-emerald-500/80" />
                </g>
              </svg>
            </div>
          </motion.div>
        </Link>

      </div>
    </div>
  );
}
