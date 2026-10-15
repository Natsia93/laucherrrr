"use client";

import React, { useMemo, useState, useEffect } from "react";
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

// 7-day base data (Monday to Sunday)
const BASE_WEEK_DATA = [
  { dayKey: "mon", name: "Mon", fullDay: "Monday", baseUsage: 22 },
  { dayKey: "tue", name: "Tue", fullDay: "Tuesday", baseUsage: 28 },
  { dayKey: "wed", name: "Wed", fullDay: "Wednesday", baseUsage: 18 },
  { dayKey: "thu", name: "Thu", fullDay: "Thursday", baseUsage: 25 },
  { dayKey: "fri", name: "Fri", fullDay: "Friday", baseUsage: 30 },
  { dayKey: "sat", name: "Sat", fullDay: "Saturday", baseUsage: 12 },
  { dayKey: "sun", name: "Sun", fullDay: "Sunday", baseUsage: 8 },
];

export function OverviewAnalyticsCharts() {
  const [currentDayIndex, setCurrentDayIndex] = useState(2); // Default Wednesday (Wed = 2)
  const [hasUnlocked, setHasUnlocked] = useState(true);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  // Real-time calculation of current day in week (0 = Monday ... 6 = Sunday)
  useEffect(() => {
    const calculateTodayIndex = () => {
      const now = new Date();
      const jsDay = now.getDay(); // 0 = Sunday, 1 = Monday, ... 6 = Saturday
      // Convert to 0 = Monday ... 6 = Sunday
      const mappedIndex = jsDay === 0 ? 6 : jsDay - 1;
      setCurrentDayIndex(mappedIndex);
    };

    calculateTodayIndex();
    const interval = setInterval(calculateTodayIndex, 60000);
    return () => clearInterval(interval);
  }, []);

  // Control animation: only animate once after mood modal is submitted
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

  // Compute 7-day usage array based on current day index
  const weekChartData: DayUsageData[] = useMemo(() => {
    return BASE_WEEK_DATA.map((item, index) => {
      const isToday = index === currentDayIndex;
      const isFuture = index > currentDayIndex;

      return {
        dayKey: item.dayKey,
        name: item.name,
        fullDay: item.fullDay,
        usage: !hasUnlocked || isFuture ? 0 : item.baseUsage,
        isToday,
        isFuture,
      };
    });
  }, [currentDayIndex, hasUnlocked]);

  // Total usage accumulated for the active days in the current week
  const totalWeeklyUsage = useMemo(() => {
    return weekChartData.reduce((acc, item) => acc + item.usage, 0);
  }, [weekChartData]);

  return (
    <Card className="p-6 bg-white dark:bg-[#121212] border-neutral-200/80 dark:border-neutral-800 rounded-xl shadow-xs flex flex-col justify-between h-[275px] min-h-[275px]">
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-neutral-950 dark:text-white tracking-tight">
          Daily Activity (7 Days)
        </h3>
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
                        {data.isFuture ? "0 Credits (No Activity Yet)" : `${data.usage} Credits Used`}
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
