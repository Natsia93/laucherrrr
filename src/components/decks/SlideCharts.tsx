"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export interface ChartDataPoint {
  name: string;
  value: number;
  secondary?: number;
  label?: string;
}

interface SlideChartProps {
  type: "bar" | "area" | "donut" | "radar";
  data?: ChartDataPoint[];
  primaryColor?: string;
  accentColor?: string;
  isPresentation?: boolean;
  isThumbnail?: boolean;
}

const DEFAULT_BAR_DATA: ChartDataPoint[] = [
  { name: "Q1", value: 45, secondary: 30 },
  { name: "Q2", value: 68, secondary: 42 },
  { name: "Q3", value: 94, secondary: 58 },
  { name: "Q4", value: 142, secondary: 85 },
];

const DEFAULT_AREA_DATA: ChartDataPoint[] = [
  { name: "Jan", value: 120 },
  { name: "Feb", value: 210 },
  { name: "Mar", value: 340 },
  { name: "Apr", value: 480 },
  { name: "May", value: 650 },
  { name: "Jun", value: 920 },
];

const DEFAULT_DONUT_DATA: ChartDataPoint[] = [
  { name: "Enterprise SaaS", value: 48 },
  { name: "Education & EdTech", value: 28 },
  { name: "Healthcare", value: 14 },
  { name: "Other Sectors", value: 10 },
];

const DEFAULT_RADAR_DATA: ChartDataPoint[] = [
  { name: "Velocity", value: 95 },
  { name: "Visual Polish", value: 92 },
  { name: "Cost ROI", value: 98 },
  { name: "Scalability", value: 85 },
  { name: "Usability", value: 90 },
  { name: "Security", value: 88 },
];

export function SlideChart({
  type,
  data,
  primaryColor = "#FFDE3C",
  accentColor = "#D97706",
  isPresentation = false,
  isThumbnail = false,
}: SlideChartProps) {
  const chartPrimary = primaryColor === "#FFDE3C" ? "#E5BC10" : primaryColor;
  const chartSecondary = accentColor || "#7C3AED";

  if (type === "bar") {
    const chartData = data && data.length > 0 ? data : DEFAULT_BAR_DATA;
    return (
      <div className="w-full h-full min-h-[180px] sm:min-h-[220px] flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
            <XAxis
              dataKey="name"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#171717",
                borderRadius: "8px",
                border: "1px solid #333333",
                color: "#FFFFFF",
                fontSize: "12px",
              }}
            />
            <Bar
              dataKey="value"
              fill={chartPrimary}
              radius={[4, 4, 0, 0]}
              isAnimationActive={false}
            />
            {chartData[0]?.secondary !== undefined && (
              <Bar
                dataKey="secondary"
                fill={chartSecondary}
                radius={[4, 4, 0, 0]}
                opacity={0.6}
                isAnimationActive={false}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === "area") {
    const chartData = data && data.length > 0 ? data : DEFAULT_AREA_DATA;
    return (
      <div className="w-full h-full min-h-[180px] sm:min-h-[220px] flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="slideAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartPrimary} stopOpacity={0.45} />
                <stop offset="95%" stopColor={chartPrimary} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
            <XAxis
              dataKey="name"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#171717",
                borderRadius: "8px",
                border: "1px solid #333333",
                color: "#FFFFFF",
                fontSize: "12px",
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={chartPrimary}
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#slideAreaGradient)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === "radar") {
    const radarData = data && data.length > 0 ? data : DEFAULT_RADAR_DATA;
    return (
      <div className="w-full h-full min-h-[180px] sm:min-h-[220px] flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="72%" data={radarData}>
            <PolarGrid stroke="#888888" strokeOpacity={0.25} />
            <PolarAngleAxis
              dataKey="name"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
            />
            <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#888888" strokeOpacity={0.2} fontSize={10} />
            <Radar
              name="Score"
              dataKey="value"
              stroke={chartPrimary}
              fill={chartPrimary}
              fillOpacity={0.4}
              isAnimationActive={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#171717",
                borderRadius: "8px",
                border: "1px solid #333333",
                color: "#FFFFFF",
                fontSize: "12px",
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Donut Chart
  const donutData = data && data.length > 0 ? data : DEFAULT_DONUT_DATA;
  const DONUT_COLORS = [chartPrimary, chartSecondary, "#059669", "#D97706", "#2563EB", "#EC4899"];

  return (
    <div className="w-full h-full flex flex-row items-center justify-center gap-6 sm:gap-10 px-2">
      <div className="w-[180px] sm:w-[220px] md:w-[240px] aspect-square shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={donutData}
              cx="50%"
              cy="50%"
              innerRadius="48%"
              outerRadius="82%"
              paddingAngle={4}
              dataKey="value"
              isAnimationActive={false}
            >
              {donutData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#171717",
                borderRadius: "8px",
                border: "1px solid #333333",
                color: "#FFFFFF",
                fontSize: "12px",
                padding: "8px 12px",
              }}
              formatter={(val: any) => [`${val}%`, "Percentage"]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Donut Legend */}
      <div className="flex flex-col gap-2 min-w-0 max-w-sm justify-center">
        {donutData.map((entry, index) => (
          <div
            key={`legend-${entry.name || 'entry'}-${index}`}
            className="flex items-center gap-2.5"
          >
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: DONUT_COLORS[index % DONUT_COLORS.length] }}
            />
            <span className="text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300 truncate max-w-[180px] sm:max-w-[240px]">
              {entry.name}
            </span>
            <span className="text-xs sm:text-sm font-bold ml-auto pl-3 tabular-nums text-neutral-900 dark:text-white">
              {entry.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
