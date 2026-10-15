"use client";

import React, { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";
import { Card } from "@/components/ui/card";

export function CreditsUsageCard() {
  const [stats, setStats] = useState({
    creditsUsed: 0,
    creditsTotal: 120,
    creditsRemaining: 120,
  });
  const [hasUnlocked, setHasUnlocked] = useState(true);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [displayCount, setDisplayCount] = useState(0);

  const percent = stats.creditsTotal > 0
    ? Math.min((stats.creditsUsed / stats.creditsTotal) * 100, 100)
    : 0;

  // Prominent gauge settings
  const radius = 76;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  // Animated counter from 0 to creditsUsed
  const springValue = useSpring(0, {
    stiffness: 45,
    damping: 15,
    duration: 1.4,
  });

  useEffect(() => {
    let isMounted = true;
    fetch("/api/user/activity-stats")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data) {
          const used = data.creditsUsed ?? 0;
          const total = data.creditsTotal ?? 120;
          const remaining = data.creditsRemaining ?? Math.max(0, total - used);
          setStats({
            creditsUsed: used,
            creditsTotal: total,
            creditsRemaining: remaining,
          });
          springValue.set(used);
          setShouldAnimate(true);
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
    const handleMoodChanged = () => {
      setTimeout(() => {
        setHasUnlocked(true);
        setShouldAnimate(true);
        springValue.set(stats.creditsUsed);
        sessionStorage.setItem("overview_charts_animated", "true");
      }, 400);
    };

    window.addEventListener("user_mood_changed", handleMoodChanged);
    return () => window.removeEventListener("user_mood_changed", handleMoodChanged);
  }, [springValue, stats.creditsUsed]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      setDisplayCount(Math.round(latest));
    });
    return () => unsubscribe();
  }, [springValue]);

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-[#1c1c1c] via-[#141414] to-[#0d0d0d] text-white border-neutral-800 rounded-xl shadow-lg p-6 flex flex-col justify-center h-[275px] min-h-[275px]">
      {/* Main Content: Prominent Gauge + Clean Text */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 sm:gap-8 my-auto">
        {/* Circular Gauge */}
        <div className="relative w-48 h-48 sm:w-[215px] sm:h-[215px] flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
            {/* Background Track */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              stroke="currentColor"
              strokeWidth="28"
              fill="transparent"
              className="text-white/10"
            />
            {/* Animated or Static Yellow Donut Progress */}
            {shouldAnimate ? (
              <motion.circle
                cx="100"
                cy="100"
                r={radius}
                stroke="#FCD62C"
                strokeWidth="28"
                fill="transparent"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
                strokeLinecap="butt"
              />
            ) : hasUnlocked ? (
              <circle
                cx="100"
                cy="100"
                r={radius}
                stroke="#FCD62C"
                strokeWidth="28"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="butt"
              />
            ) : (
              <circle
                cx="100"
                cy="100"
                r={radius}
                stroke="#FCD62C"
                strokeWidth="28"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={circumference}
                strokeLinecap="butt"
              />
            )}
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl sm:text-[36px] font-medium text-white leading-none tracking-tight">
              {displayCount}
            </span>
            <span className="text-[11px] sm:text-xs font-normal text-neutral-400 mt-1.5">
              / {stats.creditsTotal} Credits
            </span>
          </div>
        </div>

        {/* Minimalist Info */}
        <div className="flex-1 w-full space-y-2 text-center sm:text-left">
          <h4 className="text-lg sm:text-xl font-medium text-white tracking-tight">
            {stats.creditsRemaining} Credits Available
          </h4>
          <p className="text-xs sm:text-[13px] text-neutral-400 leading-relaxed max-w-sm">
            Remaining credits can be used for automated slide deck generation & AI LLM reasoning.
          </p>
        </div>
      </div>
    </Card>
  );
}
