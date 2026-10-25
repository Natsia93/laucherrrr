"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function OverviewFeatureCards() {
  return (
    <div className="w-full">
      {/* ── Storyboarded Keyframe Animations (Synchronized 7-Second Loops) ── */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* ── CARD 1: LLM MODE ANIMATIONS (Type -> Send -> AI Generate) ── */
        @keyframes c1CursorMove {
          0% { transform: translate(175px, 105px); opacity: 0; }
          6% { opacity: 1; }
          12% { transform: translate(40px, 88px) scale(1); opacity: 1; }
          16% { transform: translate(40px, 88px) scale(0.85); opacity: 1; }
          20% { transform: translate(40px, 88px) scale(1); opacity: 1; }
          28% { transform: translate(182px, 88px) scale(1); opacity: 1; }
          32% { transform: translate(182px, 88px) scale(0.82); opacity: 1; }
          36% { transform: translate(182px, 88px) scale(1); opacity: 0.8; }
          40%, 100% { transform: translate(182px, 88px); opacity: 0; }
        }
        @keyframes c1PromptText {
          0%, 16% { width: 0px; opacity: 0; }
          20% { width: 25px; opacity: 1; }
          28% { width: 85px; opacity: 1; }
          33% { width: 85px; opacity: 1; }
          36%, 100% { width: 0px; opacity: 0; }
        }
        @keyframes c1SendPulse {
          0%, 31% { transform: scale(1); }
          33% { transform: scale(1.25); }
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
          58% { width: 100px; opacity: 1; }
          88% { opacity: 1; }
          95%, 100% { width: 0px; opacity: 0; }
        }
        @keyframes c1AiLine2 {
          0%, 58% { width: 0px; opacity: 0; }
          68% { width: 80px; opacity: 1; }
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

        /* ── CARD 2: DECK GENERATOR ANIMATIONS (Click -> Build Slides -> Select & Export) ── */
        @keyframes c2CursorMove {
          0% { transform: translate(180px, 105px); opacity: 0; }
          6% { opacity: 1; }
          12% { transform: translate(175px, 86px) scale(1); opacity: 1; }
          16% { transform: translate(175px, 86px) scale(0.82); opacity: 1; }
          20% { transform: translate(175px, 86px) scale(1); opacity: 0.8; }
          26%, 100% { opacity: 0; }
        }
        @keyframes c2WandBurst {
          0%, 15% { transform: scale(0); opacity: 0; }
          18% { transform: scale(1.4); opacity: 1; }
          25%, 100% { transform: scale(2); opacity: 0; }
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

        /* ── CARD 3: CALENDAR ANIMATIONS (Sync Spin -> Event Lands -> Timeline Track) ── */
        @keyframes c3SyncSpin {
          0%, 8% { transform: rotate(0deg); }
          22% { transform: rotate(360deg); }
          28%, 100% { transform: rotate(360deg); }
        }
        @keyframes c3EventDrop {
          0%, 20% { transform: translateY(-22px) scale(0.85); opacity: 0; }
          27% { transform: translateY(2px) scale(1.05); opacity: 1; }
          32% { transform: translateY(0) scale(1); opacity: 1; }
          88% { opacity: 1; }
          95%, 100% { transform: translateY(-6px); opacity: 0; }
        }
        @keyframes c3TimelineTrack {
          0%, 28% { transform: translateY(0px); }
          40% { transform: translateY(14px); }
          60% { transform: translateY(26px); }
          78%, 88% { transform: translateY(32px); }
          95%, 100% { transform: translateY(0px); opacity: 0; }
        }
        @keyframes c3BeaconPulse {
          0% { transform: scale(1); opacity: 0.9; }
          60%, 100% { transform: scale(2.6); opacity: 0; }
        }
        @keyframes c3CheckPop {
          0%, 62% { transform: scale(0); opacity: 0; }
          68% { transform: scale(1.25); opacity: 1; }
          72% { transform: scale(1); opacity: 1; }
          88% { opacity: 1; }
          95%, 100% { transform: scale(0); opacity: 0; }
        }

        /* ── CARD 4: AUTOMATION ANIMATIONS (Trigger -> Flow -> Process -> Action) ── */
        @keyframes c4Node1Pulse {
          0%, 8% { transform: scale(1); }
          12% { transform: scale(1.08); filter: drop-shadow(0 0 6px rgba(245, 158, 11, 0.6)); }
          16%, 100% { transform: scale(1); }
        }
        @keyframes c4DashTravel1 {
          0%, 12% { stroke-dashoffset: 60; opacity: 0.2; }
          16% { opacity: 1; }
          32% { stroke-dashoffset: 0; opacity: 1; }
          38%, 100% { stroke-dashoffset: 0; opacity: 0.3; }
        }
        @keyframes c4Packet1 {
          0%, 14% { transform: translate(56px, 46px); opacity: 0; }
          16% { opacity: 1; }
          23% { transform: translate(76px, 58px); opacity: 1; }
          30% { transform: translate(96px, 72px); opacity: 1; }
          32%, 100% { transform: translate(96px, 72px); opacity: 0; }
        }
        @keyframes c4Node2Pulse {
          0%, 28% { transform: scale(1); }
          34% { transform: scale(1.1); filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.7)); }
          42% { transform: scale(1); }
          100% { transform: scale(1); }
        }
        @keyframes c4DashTravel2 {
          0%, 42% { stroke-dashoffset: 60; opacity: 0.2; }
          46% { opacity: 1; }
          60% { stroke-dashoffset: 0; opacity: 1; }
          66%, 100% { stroke-dashoffset: 0; opacity: 0.3; }
        }
        @keyframes c4Packet2 {
          0%, 44% { transform: translate(148px, 72px); opacity: 0; }
          46% { opacity: 1; }
          52% { transform: translate(160px, 58px); opacity: 1; }
          58% { transform: translate(172px, 46px); opacity: 1; }
          60%, 100% { transform: translate(172px, 46px); opacity: 0; }
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 items-stretch">
        
        {/* ══════════════════════════════════════════════════════════
         * CARD 1: LLM MODE (Story: Cursor -> Type -> Send -> AI Stream)
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

              {/* SVG Narrative Micro-Video Animation */}
              <div className="relative z-10 w-full max-w-[210px] transition-transform duration-300 group-hover:scale-[1.04]">
                <svg viewBox="0 0 210 115" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto drop-shadow-xs">
                  {/* Outer Window */}
                  <rect x="2" y="2" width="206" height="111" rx="8" className="fill-white dark:fill-[#181818] stroke-neutral-300/90 dark:stroke-neutral-700/80" strokeWidth="1.2" />
                  
                  {/* Window Bar with 3 Dots */}
                  <line x1="2" y1="20" x2="208" y2="20" className="stroke-neutral-200 dark:stroke-neutral-800" strokeWidth="1" />
                  <circle cx="10" cy="11" r="2.2" className="fill-neutral-300 dark:fill-neutral-600" />
                  <circle cx="17" cy="11" r="2.2" className="fill-neutral-300 dark:fill-neutral-600" />
                  <circle cx="24" cy="11" r="2.2" className="fill-neutral-300 dark:fill-neutral-600" />

                  {/* Mode Pill Badges Top Bar */}
                  <rect x="135" y="6" width="65" height="9" rx="4.5" className="fill-neutral-100 dark:fill-neutral-800 stroke-neutral-200 dark:stroke-neutral-700" strokeWidth="0.8" />
                  <circle cx="142" cy="10.5" r="2" className="fill-emerald-500" />
                  <rect x="148" y="9.5" width="46" height="2" rx="1" className="fill-neutral-400 dark:fill-neutral-500" />

                  {/* ── STAGE 2: User Chat Bubble (Pops in after typing) ── */}
                  <g style={{ transformOrigin: "155px 33px", animation: "c1UserBubble 7s cubic-bezier(0.16, 1, 0.3, 1) infinite" }}>
                    <rect x="110" y="25" width="88" height="17" rx="8" className="fill-[#FFE54C]/40 dark:fill-[#262626] stroke-[#E5BC10]/60 dark:stroke-neutral-700" strokeWidth="1" />
                    <rect x="120" y="32" width="55" height="3" rx="1.5" className="fill-neutral-800 dark:fill-neutral-200" />
                    <rect x="178" y="32" width="12" height="3" rx="1.5" className="fill-[#E5BC10]" />
                  </g>

                  {/* ── STAGE 3: AI Response Generation (Slides up & lines stream in) ── */}
                  <g style={{ transformOrigin: "20px 58px", animation: "c1AiResponse 7s cubic-bezier(0.16, 1, 0.3, 1) infinite" }}>
                    {/* AI Avatar */}
                    <circle cx="18" cy="56" r="6" className="fill-[#FFE54C] stroke-[#E5BC10]" strokeWidth="1" />
                    <path d="M18 53.5 L18.8 55.2 L20.5 56 L18.8 56.8 L18 58.5 L17.2 56.8 L15.5 56 L17.2 55.2 Z" className="fill-neutral-950" />

                    {/* AI Bubble Container */}
                    <rect x="29" y="47" width="168" height="28" rx="6" className="fill-neutral-50/90 dark:fill-neutral-800/50 stroke-neutral-200 dark:stroke-neutral-700/80" strokeWidth="1" />
                    
                    {/* Animated Streaming Text Lines */}
                    <rect x="37" y="54" height="4" rx="2" className="fill-neutral-800 dark:fill-neutral-100" style={{ animation: "c1AiLine1 7s ease-out infinite" }} />
                    <rect x="37" y="62" height="3.5" rx="1.7" className="fill-neutral-400 dark:fill-neutral-400" style={{ animation: "c1AiLine2 7s ease-out infinite" }} />

                    {/* AI Action/Result Badge Pop */}
                    <g style={{ transformOrigin: "175px 60px", animation: "c1AiBadge 7s cubic-bezier(0.34, 1.56, 0.64, 1) infinite" }}>
                      <circle cx="178" cy="61" r="5" className="fill-emerald-500" />
                      <path d="M176 61 L177.5 62.5 L180.5 59.5" stroke="white" strokeWidth="1" strokeLinecap="round" />
                    </g>
                  </g>

                  {/* ── STAGE 1: Bottom Prompt Box with Animated Typing ── */}
                  <rect x="12" y="82" width="186" height="22" rx="11" className="fill-neutral-50 dark:fill-neutral-900 stroke-neutral-300 dark:stroke-neutral-700" strokeWidth="1" />
                  
                  {/* Left Sparkle Pill */}
                  <circle cx="23" cy="93" r="4.5" className="fill-[#FFE54C]/30 stroke-[#E5BC10]" strokeWidth="0.8" />
                  <path d="M23 90.5 L23.6 92 L25 93 L23.6 94 L23 95.5 L22.4 94 L21 93 L22.4 92 Z" className="fill-[#E5BC10]" />

                  {/* Typing Text Line (Expands then sends) */}
                  <rect x="34" y="91.5" height="3" rx="1.5" className="fill-neutral-600 dark:fill-neutral-300" style={{ animation: "c1PromptText 7s linear infinite" }} />

                  {/* Send Button (Scales on click) */}
                  <g style={{ transformOrigin: "185px 93px", animation: "c1SendPulse 7s ease-in-out infinite" }}>
                    <circle cx="185" cy="93" r="6" className="fill-neutral-900 dark:fill-neutral-100" />
                    <path d="M185 96 L185 90 M183 92 L185 90 L187 92" stroke="currentColor" className="text-white dark:text-neutral-900" strokeWidth="1" strokeLinecap="round" />
                  </g>

                  {/* ── Pointer Cursor (Glides in, clicks, types, clicks send) ── */}
                  <g style={{ animation: "c1CursorMove 7s cubic-bezier(0.25, 1, 0.5, 1) infinite" }}>
                    <path d="M0 0 L0 11 L3 8.5 L6.5 14 L8.5 13 L5 7.5 L8.5 7.5 Z" className="fill-neutral-900 dark:fill-white stroke-white dark:stroke-neutral-900 drop-shadow-md" strokeWidth="0.8" />
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
         * CARD 2: DECK GENERATOR (Story: Click Magic -> Slide Builds -> Bounding Box -> PPTX)
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

              {/* SVG Narrative Micro-Video Animation */}
              <div className="relative z-10 w-full max-w-[210px] transition-transform duration-300 group-hover:scale-[1.04]">
                <svg viewBox="0 0 210 115" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto drop-shadow-xs">
                  {/* Presentation 16:9 Canvas Frame */}
                  <rect x="2" y="2" width="206" height="111" rx="8" className="fill-white dark:fill-[#171717] stroke-neutral-300/90 dark:stroke-neutral-700/80" strokeWidth="1.2" />
                  
                  {/* Window Bar */}
                  <line x1="2" y1="20" x2="208" y2="20" className="stroke-neutral-200 dark:stroke-neutral-800" strokeWidth="1" />
                  <circle cx="10" cy="11" r="2.2" className="fill-neutral-300 dark:fill-neutral-600" />
                  <circle cx="17" cy="11" r="2.2" className="fill-neutral-300 dark:fill-neutral-600" />
                  <circle cx="24" cy="11" r="2.2" className="fill-neutral-300 dark:fill-neutral-600" />

                  {/* ── STAGE 2: Slide Title Bar Slides In ── */}
                  <g style={{ animation: "c2HeaderSlide 7s cubic-bezier(0.16, 1, 0.3, 1) infinite" }}>
                    <rect x="14" y="26" width="30" height="7" rx="3.5" className="fill-purple-500/20 stroke-purple-500" strokeWidth="0.8" />
                    <rect x="50" y="27" width="60" height="5" rx="2.5" className="fill-neutral-800 dark:fill-neutral-200" />
                  </g>

                  {/* ── STAGE 2.1: Column 1 Wireframe Card Slides In ── */}
                  <g style={{ animation: "c2Col1Slide 7s cubic-bezier(0.16, 1, 0.3, 1) infinite" }}>
                    <rect x="14" y="38" width="80" height="38" rx="5" className="fill-purple-50/50 dark:fill-purple-950/20 stroke-purple-200 dark:stroke-purple-800/80" strokeWidth="1" />
                    <rect x="22" y="45" width="40" height="4" rx="2" className="fill-purple-700 dark:fill-purple-300" />
                    <rect x="22" y="53" width="64" height="3" rx="1.5" className="fill-purple-400/80 dark:fill-purple-500" />
                    <rect x="22" y="59" width="52" height="3" rx="1.5" className="fill-purple-400/60 dark:fill-purple-600" />
                  </g>

                  {/* ── STAGE 2.2: Column 2 Wireframe Card Slides In ── */}
                  <g style={{ animation: "c2Col2Slide 7s cubic-bezier(0.16, 1, 0.3, 1) infinite" }}>
                    <rect x="102" y="38" width="94" height="38" rx="5" className="fill-neutral-50 dark:fill-neutral-800/40 stroke-neutral-200 dark:stroke-neutral-700/80" strokeWidth="1" />
                    <rect x="110" y="45" width="45" height="4" rx="2" className="fill-neutral-700 dark:fill-neutral-300" />
                    <rect x="110" y="53" width="76" height="3" rx="1.5" className="fill-neutral-400 dark:fill-neutral-500" />
                    <rect x="110" y="59" width="62" height="3" rx="1.5" className="fill-neutral-400/80 dark:fill-neutral-600" />
                  </g>

                  {/* ── STAGE 3: Bounding Box Selection Snaps on Slide (Exact ngodingpakeai style) ── */}
                  <g style={{ transformOrigin: "148px 57px", animation: "c2BoundingBox 7s cubic-bezier(0.34, 1.56, 0.64, 1) infinite" }}>
                    <rect x="100" y="36" width="98" height="42" rx="6" className="stroke-purple-500 dark:stroke-purple-400 anim-line-flow shadow-lg" strokeWidth="1.2" />
                    
                    {/* 4 Corner Resize Handles */}
                    <g style={{ transformOrigin: "148px 57px", animation: "c2Handles 7s cubic-bezier(0.34, 1.56, 0.64, 1) infinite" }}>
                      <rect x="98" y="34" width="4.5" height="4.5" rx="1" className="fill-purple-600 stroke-white" strokeWidth="0.8" />
                      <rect x="195.5" y="34" width="4.5" height="4.5" rx="1" className="fill-purple-600 stroke-white" strokeWidth="0.8" />
                      <rect x="98" y="75.5" width="4.5" height="4.5" rx="1" className="fill-purple-600 stroke-white" strokeWidth="0.8" />
                      <rect x="195.5" y="75.5" width="4.5" height="4.5" rx="1" className="fill-purple-600 stroke-white" strokeWidth="0.8" />
                    </g>
                  </g>

                  {/* ── STAGE 4: Export PPTX Floating Badge ── */}
                  <g style={{ transformOrigin: "170px 72px", animation: "c2ExportPill 7s cubic-bezier(0.34, 1.56, 0.64, 1) infinite" }}>
                    <rect x="150" y="65" width="40" height="13" rx="5" className="fill-purple-600 shadow-md" />
                    <rect x="156" y="70" width="16" height="3" rx="1.5" className="fill-white" />
                    <circle cx="182" cy="71.5" r="3" className="fill-white/30" />
                    <path d="M181 71.5 L182 72.5 L183.5 70.5" stroke="white" strokeWidth="0.8" strokeLinecap="round" />
                  </g>

                  {/* Bottom Purple Magic Prompt Bar */}
                  <rect x="14" y="83" width="182" height="21" rx="10.5" className="fill-neutral-50 dark:fill-neutral-900 stroke-neutral-300 dark:stroke-neutral-700" strokeWidth="1" />
                  
                  {/* Magic Wand Spark Burst */}
                  <g style={{ transformOrigin: "175px 93px", animation: "c2WandBurst 7s ease-out infinite" }}>
                    <circle cx="175" cy="93" r="6" className="fill-purple-500/40" />
                  </g>

                  {/* Sparkle Icon */}
                  <circle cx="25" cy="93.5" r="4.5" className="fill-purple-500/20 stroke-purple-500" strokeWidth="0.8" />
                  <path d="M25 91 L25.6 92.5 L27 93.5 L25.6 94.5 L25 96 L24.4 94.5 L23 93.5 L24.4 92.5 Z" className="fill-purple-500" />
                  <rect x="36" y="92" width="70" height="3" rx="1.5" className="fill-neutral-400 dark:fill-neutral-500" />
                  
                  {/* Purple Trigger Button */}
                  <circle cx="175" cy="93.5" r="6" className="fill-purple-600" />
                  <path d="M173.5 93.5 L176.5 93.5 M175 92 L175 95" stroke="white" strokeWidth="1.2" strokeLinecap="round" />

                  {/* ── STAGE 1: Pointer Cursor (Clicks Magic Button) ── */}
                  <g style={{ animation: "c2CursorMove 7s cubic-bezier(0.25, 1, 0.5, 1) infinite" }}>
                    <path d="M0 0 L0 11 L3 8.5 L6.5 14 L8.5 13 L5 7.5 L8.5 7.5 Z" className="fill-neutral-900 dark:fill-white stroke-white dark:stroke-neutral-900 drop-shadow-md" strokeWidth="0.8" />
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
         * CARD 3: GOOGLE CALENDAR (Story: Sync Spin -> Event Lands -> Timeline Travels -> Done)
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

              {/* SVG Narrative Micro-Video Animation */}
              <div className="relative z-10 w-full max-w-[210px] transition-transform duration-300 group-hover:scale-[1.04]">
                <svg viewBox="0 0 210 115" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto drop-shadow-xs">
                  {/* Calendar Window Frame */}
                  <rect x="2" y="2" width="206" height="111" rx="8" className="fill-white dark:fill-[#181818] stroke-neutral-300/90 dark:stroke-neutral-700/80" strokeWidth="1.2" />
                  
                  {/* Window Bar */}
                  <line x1="2" y1="20" x2="208" y2="20" className="stroke-neutral-200 dark:stroke-neutral-800" strokeWidth="1" />
                  
                  {/* Today Badge */}
                  <rect x="10" y="6" width="24" height="9" rx="3" className="fill-[#FFE54C] stroke-[#E5BC10]" strokeWidth="0.8" />
                  <rect x="15" y="9.5" width="14" height="2" rx="1" className="fill-neutral-950" />
                  
                  <rect x="40" y="8" width="40" height="5" rx="2" className="fill-neutral-400 dark:fill-neutral-600" />
                  
                  {/* ── STAGE 1: Real-time Spinning Sync Icon ── */}
                  <g style={{ transformOrigin: "190px 10.5px", animation: "c3SyncSpin 7s cubic-bezier(0.4, 0, 0.2, 1) infinite" }}>
                    <circle cx="190" cy="10.5" r="4" className="stroke-emerald-500 fill-none" strokeWidth="1" strokeDasharray="16 6" />
                  </g>

                  {/* 5 Column Grid Lines */}
                  <line x1="44" y1="20" x2="44" y2="113" className="stroke-neutral-100 dark:stroke-neutral-800/80" strokeWidth="1" />
                  <line x1="86" y1="20" x2="86" y2="113" className="stroke-neutral-100 dark:stroke-neutral-800/80" strokeWidth="1" />
                  <line x1="128" y1="20" x2="128" y2="113" className="stroke-neutral-100 dark:stroke-neutral-800/80" strokeWidth="1" />
                  <line x1="170" y1="20" x2="170" y2="113" className="stroke-neutral-100 dark:stroke-neutral-800/80" strokeWidth="1" />

                  {/* Day Header Wireframe Bars */}
                  <rect x="18" y="26" width="14" height="3" rx="1.5" className="fill-neutral-300 dark:fill-neutral-700" />
                  <rect x="60" y="26" width="14" height="3" rx="1.5" className="fill-neutral-300 dark:fill-neutral-700" />
                  <rect x="100" y="25" width="18" height="5" rx="2.5" className="fill-[#FFE54C] stroke-[#E5BC10]" strokeWidth="0.8" />
                  <rect x="144" y="26" width="14" height="3" rx="1.5" className="fill-neutral-300 dark:fill-neutral-700" />
                  <rect x="184" y="26" width="14" height="3" rx="1.5" className="fill-neutral-300 dark:fill-neutral-700" />

                  {/* Static Schedule Event 1 (Left Column) */}
                  <rect x="8" y="38" width="32" height="22" rx="4" className="fill-purple-50 dark:fill-purple-950/30 stroke-purple-300 dark:stroke-purple-800" strokeWidth="1" />
                  <rect x="12" y="44" width="16" height="3" rx="1.5" className="fill-purple-700 dark:fill-purple-300" />
                  <rect x="12" y="50" width="22" height="2.5" rx="1" className="fill-purple-400" />

                  {/* Static Schedule Event 3 (Right Column) */}
                  <rect x="132" y="44" width="34" height="20" rx="4" className="fill-blue-50 dark:fill-blue-950/30 stroke-blue-300 dark:stroke-blue-800" strokeWidth="1" />
                  <rect x="136" y="50" width="20" height="3" rx="1.5" className="fill-blue-700 dark:fill-blue-300" />
                  <rect x="136" y="56" width="16" height="2.5" rx="1" className="fill-blue-400" />

                  {/* ── STAGE 2: New Real-Time Meeting Event Lands into Wednesday slot ── */}
                  <g style={{ transformOrigin: "107px 50px", animation: "c3EventDrop 7s cubic-bezier(0.34, 1.56, 0.64, 1) infinite" }}>
                    <rect x="88" y="36" width="38" height="34" rx="4" className="fill-emerald-50 dark:fill-emerald-950/40 stroke-emerald-400 dark:stroke-emerald-600 shadow-md" strokeWidth="1.2" />
                    
                    {/* Live Meet Camera Indicator (Pulsing ring) */}
                    <circle cx="96" cy="44" r="3.5" className="fill-emerald-500" />
                    <circle cx="96" cy="44" r="5.5" className="stroke-emerald-500" strokeWidth="0.8" style={{ animation: "c3BeaconPulse 2s ease-out infinite" }} />
                    <rect x="103" y="43" width="18" height="3" rx="1.5" className="fill-emerald-800 dark:fill-emerald-200" />
                    <rect x="94" y="51" width="26" height="2.5" rx="1" className="fill-emerald-500/80" />
                    <rect x="94" y="57" width="20" height="2.5" rx="1" className="fill-emerald-400/60" />

                    {/* ── STAGE 4: Completion Checkmark Badge ── */}
                    <g style={{ transformOrigin: "120px 65px", animation: "c3CheckPop 7s cubic-bezier(0.34, 1.56, 0.64, 1) infinite" }}>
                      <circle cx="120" cy="65" r="4.5" className="fill-emerald-500 shadow-xs" />
                      <path d="M118 65 L119.5 66.5 L122 63.5" stroke="white" strokeWidth="0.9" strokeLinecap="round" />
                    </g>
                  </g>

                  {/* ── STAGE 3: Timeline Yellow Line Moves Downward ── */}
                  <g style={{ animation: "c3TimelineTrack 7s linear infinite" }}>
                    <line x1="4" y1="48" x2="206" y2="48" className="stroke-[#FFE500]" strokeWidth="1.5" />
                    <circle cx="60" cy="48" r="3" className="fill-[#FFE500]" />
                    <rect x="68" y="43" width="30" height="10" rx="3" className="fill-neutral-900 dark:fill-white shadow-xs" />
                    <rect x="73" y="47" width="20" height="2" rx="1" className="fill-white dark:fill-neutral-900" />
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
         * CARD 4: LAUNCHER AUTOMATION (Story: Webhook Fires -> Packet Flows -> AI Processes -> Action)
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

              {/* SVG Narrative Micro-Video Animation */}
              <div className="relative z-10 w-full max-w-[210px] transition-transform duration-300 group-hover:scale-[1.04]">
                <svg viewBox="0 0 210 115" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto drop-shadow-xs">
                  {/* Canvas Window Frame */}
                  <rect x="2" y="2" width="206" height="111" rx="8" className="fill-white dark:fill-[#181818] stroke-neutral-300/90 dark:stroke-neutral-700/80" strokeWidth="1.2" />
                  
                  {/* Window Bar */}
                  <line x1="2" y1="20" x2="208" y2="20" className="stroke-neutral-200 dark:stroke-neutral-800" strokeWidth="1" />
                  <circle cx="10" cy="11" r="2.2" className="fill-neutral-300 dark:fill-neutral-600" />
                  <circle cx="17" cy="11" r="2.2" className="fill-neutral-300 dark:fill-neutral-600" />
                  <circle cx="24" cy="11" r="2.2" className="fill-neutral-300 dark:fill-neutral-600" />

                  {/* Flow Connection Lines (Dashed curved pipes) */}
                  <path
                    d="M58 46 C76 46, 76 72, 96 72"
                    className="stroke-amber-400 dark:stroke-amber-500"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                    style={{ animation: "c4DashTravel1 7s ease-out infinite" }}
                  />
                  <path
                    d="M148 72 C162 72, 162 46, 172 46"
                    className="stroke-blue-400 dark:stroke-blue-500"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                    style={{ animation: "c4DashTravel2 7s ease-out infinite" }}
                  />

                  {/* ── STAGE 1: Node 1 Trigger Fires (Lightning Bolt) ── */}
                  <g style={{ transformOrigin: "34px 46px", animation: "c4Node1Pulse 7s ease-in-out infinite" }}>
                    <rect x="10" y="32" width="48" height="28" rx="6" className="fill-amber-50/90 dark:fill-amber-950/40 stroke-amber-400 dark:stroke-amber-500" strokeWidth="1.4" />
                    <circle cx="20" cy="46" r="4.5" className="fill-amber-500/20 stroke-amber-500" strokeWidth="1" />
                    <path d="M20 43 L18.8 46 L21 46 L19.8 49" stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    <rect x="29" y="42" width="22" height="3.5" rx="1.5" className="fill-amber-900 dark:fill-amber-200" />
                    <rect x="29" y="48" width="16" height="2.5" rx="1" className="fill-amber-500" />
                    <circle cx="58" cy="46" r="3" className="fill-amber-500 stroke-white dark:stroke-[#181818]" strokeWidth="1.2" />
                  </g>

                  {/* ── STAGE 1.5: Glowing Packet 1 Travels to Node 2 ── */}
                  <g style={{ animation: "c4Packet1 7s ease-out infinite" }}>
                    <circle cx="0" cy="0" r="3.5" className="fill-amber-400 shadow-lg" />
                  </g>

                  {/* ── STAGE 2: Node 2 AI Router Processes (Glows & Sparkles) ── */}
                  <g style={{ transformOrigin: "122px 72px", animation: "c4Node2Pulse 7s ease-in-out infinite" }}>
                    <rect x="96" y="56" width="52" height="32" rx="6" className="fill-blue-50/90 dark:fill-blue-950/40 stroke-blue-500 dark:stroke-blue-400 shadow-md" strokeWidth="1.5" />
                    <circle cx="96" cy="72" r="3" className="fill-blue-500 stroke-white dark:stroke-[#181818]" strokeWidth="1.2" />
                    <circle cx="109" cy="72" r="5" className="fill-blue-500" />
                    <path d="M109 69.5 L109.8 71.2 L111.5 72 L109.8 72.8 L109 74.5 L108.2 72.8 L106.5 72 L108.2 71.2 Z" fill="white" />
                    <rect x="118" y="68" width="22" height="3.5" rx="1.5" className="fill-blue-950 dark:fill-blue-100" />
                    <rect x="118" y="74" width="16" height="2.5" rx="1" className="fill-blue-500" />
                    <circle cx="148" cy="72" r="3" className="fill-blue-500 stroke-white dark:stroke-[#181818]" strokeWidth="1.2" />
                  </g>

                  {/* ── STAGE 2.5: Glowing Packet 2 Travels to Action Node ── */}
                  <g style={{ animation: "c4Packet2 7s ease-out infinite" }}>
                    <circle cx="0" cy="0" r="3.5" className="fill-blue-400 shadow-lg" />
                  </g>

                  {/* ── STAGE 3: Node 3 Action Fires (Checkmark Pop) ── */}
                  <g style={{ transformOrigin: "187px 46px", animation: "c4Node3Pulse 7s ease-in-out infinite" }}>
                    <circle cx="172" cy="46" r="3" className="fill-emerald-500 stroke-white dark:stroke-[#181818]" strokeWidth="1.2" />
                    <rect x="172" y="32" width="30" height="28" rx="6" className="fill-emerald-50/90 dark:fill-emerald-950/30 stroke-emerald-400 dark:stroke-emerald-500 shadow-md" strokeWidth="1.4" />
                    <circle cx="187" cy="46" r="5" className="fill-emerald-500" />
                    <path d="M185 46 L186.5 47.5 L189 44.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </g>

                  {/* ── STAGE 4: Pipeline Execution Status Pill ── */}
                  <g style={{ transformOrigin: "42px 96px", animation: "c4SuccessBadge 7s cubic-bezier(0.34, 1.56, 0.64, 1) infinite" }}>
                    <rect x="12" y="90" width="65" height="13" rx="4" className="fill-emerald-50 dark:fill-emerald-950/40 stroke-emerald-400/80" strokeWidth="0.8" />
                    <circle cx="19" cy="96.5" r="2.5" className="fill-emerald-500" />
                    <rect x="25" y="95" width="22" height="3" rx="1.5" className="fill-emerald-700 dark:fill-emerald-300" />
                    <rect x="51" y="95" width="18" height="3" rx="1.5" className="fill-emerald-500/80" />
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
