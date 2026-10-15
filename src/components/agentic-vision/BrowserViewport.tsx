"use client";

import React, { useState } from "react";
import { 
  RotateCw, 
  Lock, 
  ArrowLeft, 
  ArrowRight, 
  Zap,
  Monitor
} from "lucide-react";
import { ViewportState, BrowserTab, SearchResultItem } from "./types";

interface BrowserViewportProps {
  viewport: ViewportState;
  tabs: BrowserTab[];
  activeTabId: string;
  onSelectTab: (tabId: string) => void;
  onNavigateUrl: (url: string) => void;
  onSearchQuery: (query: string) => void;
  onClickResult: (result: SearchResultItem, index: number) => void;
  onRefreshRealScreen?: () => void;
  onCaptureOnDemandScreenshot?: () => void;
  onOpenRealGoogle?: () => void;
  onTestCursor?: () => void;
  iframeRef?: React.RefObject<HTMLIFrameElement | null>;
}

export function BrowserViewport({
  viewport,
  tabs,
  activeTabId,
  onSelectTab,
  onNavigateUrl,
  onSearchQuery,
  onClickResult,
  onRefreshRealScreen,
  onTestCursor,
}: BrowserViewportProps) {
  const [feedKey, setFeedKey] = useState(Date.now());
  const [feedError, setFeedError] = useState(false);

  // Auto-refresh feed whenever URL changes
  React.useEffect(() => {
    setFeedKey(Date.now());
    setFeedError(false);
  }, [viewport.currentUrl]);

  // Auto-retry connection if temporary error occurs
  React.useEffect(() => {
    if (feedError) {
      const timer = setTimeout(() => {
        setFeedError(false);
        setFeedKey(Date.now());
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [feedError]);

  const handleRefresh = () => {
    setFeedKey(Date.now());
    setFeedError(false);
    if (onRefreshRealScreen) onRefreshRealScreen();
  };

  const feedUrl = `/api/agentic-vision/feed?t=${feedKey}`;

  return (
    <div className="flex-1 w-full h-full bg-[#0a0a0a] select-none overflow-hidden relative flex flex-col font-sans">
      {/* ── BROWSER CHROME TOOLBAR ── */}
      <div className="h-11 px-3 bg-white dark:bg-[#18181b] border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3 shrink-0 z-20">
        <div className="flex items-center gap-1.5 text-neutral-500">
          <button 
            onClick={() => onNavigateUrl("https://www.google.com")}
            className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
            title="Buka Beranda Google Asli"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button 
            className="p-1.5 opacity-40 rounded-lg text-neutral-400"
            disabled
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <button 
            onClick={handleRefresh}
            className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
            title="Muat Ulang Tampilan Tab Chrome"
          >
            <RotateCw className={`w-3.5 h-3.5 ${viewport.isLoading ? "animate-spin text-[#4285F4]" : ""}`} />
          </button>
        </div>

        {/* Address Bar (Menampilkan URL Asli Google Chrome) */}
        <div className="flex-1 max-w-xl mx-auto flex items-center gap-2 px-3.5 py-1.5 bg-neutral-100 dark:bg-[#27272a] rounded-full text-xs text-neutral-700 dark:text-neutral-300 transition-all border border-transparent">
          <Lock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span className="truncate flex-1 font-mono text-[11px] select-all">
            {viewport.currentUrl || "https://www.google.com"}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
            Tab Asli
          </span>
        </div>

        {/* Status Kontrol Kanan */}
        <div className="flex items-center gap-2">
          {onTestCursor && (
            <button
              onClick={onTestCursor}
              className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Uji simulasi gerak kursor AI di Google Chrome"
            >
              <Zap className="w-3 h-3 text-amber-500" />
              <span className="hidden sm:inline">Test Kursor</span>
            </button>
          )}
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono text-[11px] font-bold border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            LIVE CHROME
          </span>
        </div>
      </div>

      {/* ── VIEWPORT: STREAM ASLI GOOGLE CHROME (100% REAL BROWSER) ── */}
      <div className="flex-1 w-full h-full overflow-y-auto bg-neutral-900 flex items-start justify-center relative">
        <div className="w-full relative min-h-full flex items-center justify-center">
          {!feedError ? (
            <img
              key={feedKey}
              src={feedUrl}
              alt="Google Chrome Tab Asli Real-Time"
              className="w-full h-auto object-contain select-none block"
              onError={() => {
                console.warn("Feed error, trying screenshot fallback");
                setFeedError(true);
              }}
            />
          ) : viewport.realScreenshotSrc ? (
            <img
              src={viewport.realScreenshotSrc}
              alt="Google Chrome Tab Asli Snapshot"
              className="w-full h-auto object-contain select-none block"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-3 text-neutral-400 my-auto min-h-[450px]">
              <div className="w-12 h-12 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-center text-[#FFE500]">
                <Monitor className="w-6 h-6 animate-pulse" />
              </div>
              <h4 className="text-sm font-bold text-neutral-200">
                Menghubungkan ke Tab Google Chrome Asli...
              </h4>
              <p className="text-xs text-neutral-500 max-w-sm">
                Streaming visual Chrome DevTools Protocol aktif tanpa jeda.
              </p>
              <button
                onClick={handleRefresh}
                className="px-3.5 py-1.5 rounded-xl bg-[#FFE500] text-neutral-950 text-xs font-bold hover:bg-[#ebd300] transition-colors cursor-pointer"
              >
                Muat Ulang Layar
              </button>
            </div>
          )}

          {/* AI Active Typing Banner */}
          {viewport.searchQuery && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-neutral-950/90 backdrop-blur-md border border-[#FFE500]/40 rounded-full px-4 py-1.5 shadow-2xl flex items-center gap-2 pointer-events-none">
              <span className="w-2 h-2 rounded-full bg-[#FFE500] animate-ping" />
              <span className="text-xs font-mono text-neutral-200">
                Mengetik: <strong className="text-[#FFE500]">{viewport.searchQuery}</strong>
              </span>
            </div>
          )}

          {/* AI Ghost Cursor Overlay */}
          {viewport.cursor.visible && (
            <div
              style={{
                position: "absolute",
                left: typeof viewport.cursor.x === "number" ? `${viewport.cursor.x}px` : viewport.cursor.x,
                top: typeof viewport.cursor.y === "number" ? `${viewport.cursor.y}px` : viewport.cursor.y,
                transform: "translate(-4px, -4px)",
                pointerEvents: "none",
                zIndex: 99999,
                transition: "left 0.45s cubic-bezier(0.2, 0.9, 0.3, 1), top 0.45s cubic-bezier(0.2, 0.9, 0.3, 1)",
              }}
            >
              <div className="relative flex items-start">
                <svg
                  width="38"
                  height="38"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`transition-transform duration-150 ${viewport.cursor.isClicking ? "scale-90" : "scale-100"}`}
                >
                  <path
                    d="M5.8 3.5C5.35 3.5 5 3.9 5 4.45V19.8C5 20.45 5.75 20.85 6.3 20.45L10.6 16.5C10.9 16.25 11.3 16.1 11.7 16.1H17.8C18.45 16.1 18.85 15.35 18.45 14.8L6.7 3.75C6.45 3.55 6.15 3.5 5.8 3.5Z"
                    fill="#18181b"
                    stroke="#FFFFFF"
                    strokeWidth="2.2"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                </svg>

                {viewport.cursor.isClicking && (
                  <span className="absolute -top-2.5 -left-2.5 w-14 h-14 rounded-full border-2 border-white/80 animate-ping opacity-90" />
                )}

                {viewport.cursor.label && (
                  <div className="absolute left-9 top-1 whitespace-nowrap bg-neutral-900/90 text-white text-[11px] font-semibold px-2 py-0.5 rounded shadow-lg border border-neutral-700 pointer-events-none">
                    {viewport.cursor.label}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
