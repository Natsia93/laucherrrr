"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card } from "@/components/ui/card";

interface DayUsageData {
  dayKey: string;
  name: string;
  fullDay: string;
  usage: number;
  isToday: boolean;
  isFuture: boolean;
}

const DEFAULT_DAYS: DayUsageData[] = [
  { dayKey: "mon", name: "Mon", fullDay: "Monday", usage: 0, isToday: false, isFuture: false },
  { dayKey: "tue", name: "Tue", fullDay: "Tuesday", usage: 0, isToday: false, isFuture: false },
  { dayKey: "wed", name: "Wed", fullDay: "Wednesday", usage: 0, isToday: false, isFuture: false },
  { dayKey: "thu", name: "Thu", fullDay: "Thursday", usage: 0, isToday: false, isFuture: false },
  { dayKey: "fri", name: "Fri", fullDay: "Friday", usage: 0, isToday: false, isFuture: false },
  { dayKey: "sat", name: "Sat", fullDay: "Saturday", usage: 0, isToday: false, isFuture: false },
  { dayKey: "sun", name: "Sun", fullDay: "Sunday", usage: 0, isToday: false, isFuture: false },
];

export function OverviewAnalyticsCharts() {
  const [weekChartData, setWeekChartData] = useState<DayUsageData[]>(DEFAULT_DAYS);
  const [hasUnlocked, setHasUnlocked] = useState(true);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  // Instant render from local cache (0ms delay)
  useEffect(() => {
    try {
      const cached = localStorage.getItem("launcher_overview_chart_cache");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setWeekChartData(parsed);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/user/activity-stats")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data?.weekData) {
          setWeekChartData(data.weekData);
          setShouldAnimate(true);
          try {
            localStorage.setItem("launcher_overview_chart_cache", JSON.stringify(data.weekData));
          } catch {}
        }
      })
      .catch((err) => {
        console.error("Error fetching week chart data:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Control animation after mood modal if any
  useEffect(() => {
    const handleMoodChanged = () => {
      setTimeout(() => {
        setHasUnlocked(true);
        setShouldAnimate(true);
      }, 400);
    };

    window.addEventListener("user_mood_changed", handleMoodChanged);
    return () => window.removeEventListener("user_mood_changed", handleMoodChanged);
  }, []);

  return (
    <Card className="p-6 bg-white dark:bg-[#121212] border-neutral-200/80 dark:border-neutral-800 rounded-xl shadow-xs flex flex-col justify-between h-[275px] min-h-[275px]">
      <div className="flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-semibold text-neutral-950 dark:text-white tracking-tight">
          Daily Activity (7 Days)
        </h3>
        <span className="text-[11px] text-neutral-400 font-normal">
          Senin – Minggu
        </span>
      </div>

      <div className="h-[185px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={weekChartData}
            margin={{ top: 10, right: 10, left: -24, bottom: 0 }}
            barCategoryGap="8%"
          >
            <XAxis
              dataKey="name"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: "rgba(0, 0, 0, 0.04)" }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as DayUsageData;
                  return (
                    <div className="bg-neutral-950 text-white dark:bg-neutral-800 text-xs p-2.5 rounded-xl shadow-xl border border-neutral-700">
                      <div className="flex items-center gap-1.5 font-bold">
                        <span>{data.fullDay}</span>
                        {data.isToday && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#FCD62C]/30 text-[#FCD62C]">
                            Today
                          </span>
                        )}
                        {data.isFuture && (
                          <span className="text-[10px] text-neutral-400 font-normal">
                            (Upcoming)
                          </span>
                        )}
                      </div>
                      <p className="text-[#FCD62C] font-bold mt-1">
                        {data.isFuture
                          ? "0 Requests (Upcoming)"
                          : `${data.usage} AI Requests`}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="usage"
              radius={[0, 0, 0, 0]}
              barSize={46}
              isAnimationActive={shouldAnimate}
              animationDuration={1200}
            >
              {weekChartData.map((entry) => (
                <Cell
                  key={`bar-${entry.dayKey}`}
                  fill={
                    entry.isFuture
                      ? "transparent"
                      : entry.isToday
                      ? "#FCD62C"
                      : "#EAB308"
                  }
                  className="hover:opacity-90 transition-opacity"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
