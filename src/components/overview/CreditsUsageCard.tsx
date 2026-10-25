"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useSpring } from "framer-motion";
import { Key, ArrowRight, Presentation, MessageSquare, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PROVIDER_NAMES: Record<string, string> = {
  deepseek: "DeepSeek",
  openai: "OpenAI",
  anthropic: "Claude (Anthropic)",
  gemini: "Google Gemini",
  groq: "Groq",
  openrouter: "OpenRouter",
};

export function CreditsUsageCard() {
  const [hasApiKey, setHasApiKey] = useState(false);
  const [provider, setProvider] = useState("deepseek");
  const [selectedModel, setSelectedModel] = useState("");
  const [totalGenerations, setTotalGenerations] = useState(0);
  const [totalDecks, setTotalDecks] = useState(0);
  const [totalChats, setTotalChats] = useState(0);
  const [displayCount, setDisplayCount] = useState(0);

  // Animated counter
  const springValue = useSpring(0, {
    stiffness: 45,
    damping: 15,
    duration: 1.4,
  });

  // Check BYOK API Key in localStorage
  useEffect(() => {
    const checkApiKey = () => {
      if (typeof window === "undefined") return;
      const activeProvider = localStorage.getItem("ai_provider") || "deepseek";
      setProvider(activeProvider);

      const storedKey =
        localStorage.getItem(`ai_key_${activeProvider}`) ||
        (activeProvider === "deepseek" ? localStorage.getItem("deepseek_api_key") : "") ||
        "";

      const storedModel =
        localStorage.getItem(`ai_model_${activeProvider}`) ||
        (activeProvider === "deepseek" ? localStorage.getItem("deepseek_selected_model") : "") ||
        "";

      setSelectedModel(storedModel);
      setHasApiKey(Boolean(storedKey && storedKey.trim().length > 0));
    };

    checkApiKey();
    window.addEventListener("storage", checkApiKey);
    return () => window.removeEventListener("storage", checkApiKey);
  }, []);

  // Instant render from local cache (0ms delay)
  useEffect(() => {
    try {
      const cachedTotal = localStorage.getItem("launcher_overview_total_generations");
      if (cachedTotal !== null) {
        const total = parseInt(cachedTotal, 10);
        if (!isNaN(total)) {
          setTotalGenerations(total);
          setDisplayCount(total);
          springValue.set(total);
        }
      }
      const cachedDecks = localStorage.getItem("launcher_overview_total_decks");
      if (cachedDecks !== null) {
        setTotalDecks(parseInt(cachedDecks, 10) || 0);
      }
      const cachedChats = localStorage.getItem("launcher_overview_total_chats");
      if (cachedChats !== null) {
        setTotalChats(parseInt(cachedChats, 10) || 0);
      }
    } catch {}
  }, [springValue]);

  // Fetch real activity stats (Decks + LLM Chats) with realtime listener & polling
  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      try {
        const res = await fetch("/api/user/activity-stats");
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && data) {
          const total = data.totalGenerations ?? 0;
          const decks = data.totalDecks ?? 0;
          const chats = data.totalChats ?? 0;

          setTotalGenerations(total);
          setTotalDecks(decks);
          setTotalChats(chats);
          springValue.set(total);

          try {
            localStorage.setItem("launcher_overview_total_generations", total.toString());
            localStorage.setItem("launcher_overview_total_decks", decks.toString());
            localStorage.setItem("launcher_overview_total_chats", chats.toString());
          } catch {}
        }
      } catch (err) {
        console.error("Error fetching activity stats:", err);
      }
    };

    fetchStats();

    // Realtime interval check every 10s
    const interval = setInterval(fetchStats, 10000);

    // Refresh instantly when user refocuses tab or completes activity
    window.addEventListener("focus", fetchStats);
    window.addEventListener("activity_updated", fetchStats);
    window.addEventListener("storage", fetchStats);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener("focus", fetchStats);
      window.removeEventListener("activity_updated", fetchStats);
      window.removeEventListener("storage", fetchStats);
    };
  }, [springValue]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      setDisplayCount(Math.round(latest));
    });
    return () => unsubscribe();
  }, [springValue]);

  // Radius & Gauge metrics (slightly fatter stroke 33px, radius 78, sharp butt cap)
  const radius = 78;
  const circumference = 2 * Math.PI * radius;
  const MAX_TARGET = 100;
  const percent = hasApiKey ? Math.min((totalGenerations / MAX_TARGET) * 100, 100) : 0;
  const offset = circumference - (percent / 100) * circumference;

  const providerLabel = PROVIDER_NAMES[provider] || provider.toUpperCase();

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-[#1c1c1c] via-[#141414] to-[#0d0d0d] text-white border-neutral-800 rounded-xl shadow-none p-5 sm:p-5.5 flex flex-col justify-between min-h-[275px] h-full">
      <div className="relative z-10 flex flex-col sm:flex-row items-center gap-5 sm:gap-7 w-full my-auto">
        {/* Activity Meter Dial - Enlarged Diameter, Slightly Fatter Stroke (33px) & Non-Rounded */}
        <div className="relative w-40 h-40 sm:w-[190px] sm:h-[190px] flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
            {/* Background Base Track */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              stroke="currentColor"
              strokeWidth="33"
              fill="transparent"
              className="text-white/10"
            />

            {/* Glowing Active Ring - Non-Rounded Butt Cap, Real-time 12/100 scale */}
            <motion.circle
              cx="100"
              cy="100"
              r={radius}
              stroke={hasApiKey ? "#FCD62C" : "#525252"}
              strokeWidth="33"
              fill="transparent"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ 
                strokeDashoffset: hasApiKey && totalGenerations > 0 ? offset : circumference 
              }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              strokeLinecap="butt"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-2">
            {hasApiKey ? (
              <>
                <span className="text-2xl sm:text-[32px] font-semibold text-white leading-none tracking-tight">
                  {displayCount}
                </span>
                <span className="text-[10.5px] sm:text-[11px] font-medium text-[#FCD62C] mt-1 tracking-normal">
                  Ai requests
                </span>
              </>
            ) : (
              <>
                <Key className="w-6 h-6 text-neutral-400 mb-1 stroke-[1.6]" />
                <span className="text-xs font-semibold text-neutral-300">
                  No Key Connected
                </span>
              </>
            )}
          </div>
        </div>

        {/* Info & Real Data */}
        <div className="flex-1 w-full space-y-2 text-center sm:text-left min-w-0">
          {hasApiKey ? (
            <>
              {/* Badge Status - Clean tanpa Unlimited Quota */}
              <div className="flex items-center justify-center sm:justify-start">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[11px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>BYOK • {providerLabel}</span>
                </span>
              </div>

              {/* Title */}
              <h4 className="text-base sm:text-lg font-semibold text-white tracking-tight leading-snug">
                Direct Provider Billing
              </h4>

              {/* Explanatory description */}
              <p className="text-xs text-neutral-400 leading-relaxed line-clamp-3">
                Connected directly via your {providerLabel} account. AI executions run with zero platform quota limits.
              </p>

              {/* Link to Settings */}
              <div className="pt-0.5">
                <Link
                  href="/settings"
                  className="inline-flex items-center gap-1.5 text-xs sm:text-[13px] font-semibold text-[#FCD62C] hover:text-[#ffe55c] transition-colors group cursor-pointer"
                >
                  <span>Manage API Key & Provider</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.2] transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-semibold">
                <span>Setup Required</span>
              </div>
              <h4 className="text-lg sm:text-xl font-medium text-white tracking-tight">
                Connect Your API Key
              </h4>
              <p className="text-xs sm:text-[13px] text-neutral-400 leading-relaxed max-w-sm">
                Launcher OS operates on a BYOK (Bring Your Own Key) model. Connect your API key in Settings to unlock all AI features without limits.
              </p>
              <div className="pt-1">
                <Link href="/settings">
                  <Button
                    size="sm"
                    className="h-8.5 bg-[#FFDE3C] hover:bg-[#ffe55c] text-neutral-950 font-bold text-xs px-3.5 rounded-[5px] shadow-none flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>Configure API Key</span>
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}

