"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useSpring } from "framer-motion";
import { Key, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PROVIDER_NAMES: Record<string, string> = {
  deepseek: "DeepSeek",
  openai: "OpenAI",
  anthropic: "Claude (Anthropic)",
  gemini: "Google Gemini",
};

export function CreditsUsageCard() {
  const [hasApiKey, setHasApiKey] = useState(false);
  const [provider, setProvider] = useState("deepseek");
  const [selectedModel, setSelectedModel] = useState("");
  const [totalGenerations, setTotalGenerations] = useState(0);
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

  // Fetch real activity stats
  useEffect(() => {
    let isMounted = true;
    fetch("/api/user/activity-stats")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data) {
          const total = data.totalGenerations ?? 0;
          setTotalGenerations(total);
          springValue.set(total);
        }
      })
      .catch((err) => {
        console.error("Error fetching activity stats:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [springValue]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      setDisplayCount(Math.round(latest));
    });
    return () => unsubscribe();
  }, [springValue]);

  // Radius for the circle gauge
  const radius = 76;
  const circumference = 2 * Math.PI * radius;
  // Dynamic offset based on generations (aesthetic progress arc)
  const percent = hasApiKey ? Math.min((totalGenerations / 50) * 100, 100) : 0;
  const offset = circumference - (percent / 100) * circumference;

  const providerLabel = PROVIDER_NAMES[provider] || provider.toUpperCase();

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-[#1c1c1c] via-[#141414] to-[#0d0d0d] text-white border-neutral-800 rounded-xl shadow-lg p-6 flex flex-col justify-center h-[275px] min-h-[275px]">
      <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 sm:gap-8 my-auto">
        {/* Circular Gauge / Status Dial */}
        <div className="relative w-44 h-44 sm:w-[195px] sm:h-[195px] flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
            {/* Background Track */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              stroke="currentColor"
              strokeWidth="24"
              fill="transparent"
              className="text-white/10"
            />

            {/* Glowing Accent Ring */}
            <motion.circle
              cx="100"
              cy="100"
              r={radius}
              stroke={hasApiKey ? "#FCD62C" : "#525252"}
              strokeWidth="24"
              fill="transparent"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: hasApiKey && totalGenerations > 0 ? offset : circumference }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
              strokeLinecap="round"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-2">
            {hasApiKey ? (
              <>
                <span className="text-3xl sm:text-[38px] font-bold text-white leading-none tracking-tight">
                  {displayCount}
                </span>
                <span className="text-[11px] sm:text-xs font-medium text-[#FCD62C] mt-1.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> AI Requests
                </span>
                <span className="text-[10px] text-neutral-400 mt-0.5 font-normal">
                  Unlimited BYOK
                </span>
              </>
            ) : (
              <>
                <Key className="w-8 h-8 text-neutral-400 mb-1.5 stroke-[1.6]" />
                <span className="text-[11px] font-semibold text-neutral-300">
                  Belum Ada Key
                </span>
              </>
            )}
          </div>
        </div>

        {/* Minimalist Info & Context */}
        <div className="flex-1 w-full space-y-3 text-center sm:text-left">
          {hasApiKey ? (
            <>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>BYOK Connected • {providerLabel}</span>
              </div>
              <h4 className="text-lg sm:text-xl font-medium text-white tracking-tight">
                Direct Provider Billing
              </h4>
              <p className="text-xs sm:text-[13px] text-neutral-400 leading-relaxed max-w-sm">
                Terhubung ke {providerLabel}{selectedModel ? ` (${selectedModel})` : ""}. Tidak ada batasan kuota platform—eksekusi AI langsung dari akun API Anda.
              </p>
              <div className="pt-1">
                <Link
                  href="/settings"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#FCD62C] hover:text-[#ffe55c] transition-colors"
                >
                  <span>Kelola API Key di Settings</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-semibold">
                <span>Setup Diperlukan</span>
              </div>
              <h4 className="text-lg sm:text-xl font-medium text-white tracking-tight">
                Hubungkan API Key Anda
              </h4>
              <p className="text-xs sm:text-[13px] text-neutral-400 leading-relaxed max-w-sm">
                Sistem Launcher OS menggunakan BYOK (Bring Your Own Key). Masukkan API Key Anda di Settings untuk membuka seluruh fitur AI.
              </p>
              <div className="pt-1">
                <Link href="/settings">
                  <Button
                    size="sm"
                    className="h-8.5 bg-[#FFDE3C] hover:bg-[#ffe55c] text-neutral-950 font-bold text-xs px-3.5 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>Pasang API Key</span>
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
