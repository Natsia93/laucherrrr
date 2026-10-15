"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check, X, Sparkles, Layers, Cpu, Database, Globe } from "lucide-react";

function safeString(val: any, fallback = ""): string {
  if (val === null || val === undefined) return fallback;
  if (typeof val === "string") return val;
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  if (typeof val === "object") {
    if (val.title && val.description) return `${val.title}: ${val.description}`;
    if (val.title) return String(val.title);
    if (val.text) return String(val.text);
    if (val.description) return String(val.description);
    if (val.label) return String(val.label);
    if (val.value !== undefined) return String(val.value);
    if (val.name) return String(val.name);
    try {
      return JSON.stringify(val);
    } catch {
      return fallback;
    }
  }
  return String(val);
}

/* ───────────────────────────────────────────────────
 * 1. Connected Flow Diagram with Directional Arrows
 * ─────────────────────────────────────────────────── */
export interface FlowNode {
  title: string;
  subtitle?: string;
  tag?: string;
}

export function FlowDiagram({
  nodes,
  primaryColor = "#FFDE3C",
  isPresentation = false,
}: {
  nodes?: FlowNode[];
  primaryColor?: string;
  isPresentation?: boolean;
}) {
  if (!nodes || nodes.length === 0) {
    return null;
  }

  const items = nodes;

  return (
    <div className="w-full flex items-center justify-between gap-1.5 sm:gap-3 overflow-x-auto py-2">
      {items.map((node, i) => (
        <React.Fragment key={i}>
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35, delay: i * 0.1, ease: "easeOut" }}
            className="flex-1 min-w-[90px] sm:min-w-[120px] bg-white dark:bg-[#181818] border border-neutral-200 dark:border-neutral-800 rounded-md p-3 sm:p-4 relative flex flex-col justify-between shadow-2xs"
          >
            {/* Top Tag */}
            <div className="flex items-center justify-between mb-1.5">
              <span
                className="text-[10px] sm:text-[11px] font-sf font-sans font-bold px-2 py-0.5 rounded-full tracking-tight tabular-nums"
                style={{ backgroundColor: `${primaryColor}30`, color: primaryColor === "#FFDE3C" ? "#854D0E" : primaryColor }}
              >
                {node.tag || `0${i + 1}`}
              </span>
            </div>

            {/* Node Title & Subtitle */}
            <h4 className={`${isPresentation ? "text-base" : "text-xs sm:text-sm"} font-bold text-neutral-900 dark:text-white leading-tight`}>
              {node.title}
            </h4>
            {node.subtitle && (
              <p className={`${isPresentation ? "text-xs" : "text-[10px] sm:text-[11px]"} text-neutral-500 dark:text-neutral-400 mt-1 leading-snug`}>
                {node.subtitle}
              </p>
            )}
          </motion.div>

          {/* Directional Arrow between cards */}
          {i < items.length - 1 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: i * 0.1 + 0.05 }}
              className="shrink-0 text-neutral-400 dark:text-neutral-600 flex items-center justify-center"
            >
              <ArrowRight className={`${isPresentation ? "w-5 h-5" : "w-3.5 h-3.5"}`} style={{ color: primaryColor === "#FFDE3C" ? "#E5BC10" : primaryColor }} />
            </motion.div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ───────────────────────────────────────────────────
 * 2. Executive Comparison Table Matrix
 * ─────────────────────────────────────────────────── */
export interface TableRow {
  feature?: string;
  current?: string | boolean;
  proposed?: string | boolean;
  cells?: Array<string | boolean>;
  [key: string]: unknown;
}

export function ComparisonTable({
  rows,
  headers,
  primaryColor = "#FFDE3C",
  isPresentation = false,
}: {
  rows?: TableRow[];
  headers?: string[];
  primaryColor?: string;
  isPresentation?: boolean;
}) {
  if (!rows || rows.length === 0) {
    return null;
  }

  const items = rows;

  // Detect custom multi-column table if headers are explicitly provided or cells array exists
  const hasCustomHeaders = headers && headers.length > 0;
  const isMultiCol = hasCustomHeaders || (items[0]?.cells && items[0].cells.length > 0);

  const tableHeaders = hasCustomHeaders
    ? headers
    : isMultiCol && items[0]?.cells
    ? items[0].cells.map((_, i) => `Column ${i + 1}`)
    : ["Dimension", "Current State", "Target State"];

  const renderCellContent = (val: unknown, isLastCol: boolean = false) => {
    if (typeof val === "boolean") {
      return val ? (
        <span
          className="inline-flex items-center justify-center w-5 h-5 rounded-full text-neutral-950"
          style={{ backgroundColor: primaryColor }}
        >
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        </span>
      ) : (
        <X className="w-4 h-4 mx-auto text-neutral-400" />
      );
    }
    const str = String(val || "");

    // RAG badge highlighting
    if (/\b(?:GREEN|HIJAU)\b/i.test(str)) {
      return (
        <div className="flex items-center gap-1.5 justify-center flex-wrap">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {str.replace(/\b(?:GREEN|HIJAU)\b/i, "").replace(/[→\-\*]/g, "").trim() || "GREEN"}
          </span>
        </div>
      );
    }
    if (/\b(?:AMBER|KUNING|YELLOW)\b/i.test(str)) {
      return (
        <div className="flex items-center gap-1.5 justify-center flex-wrap">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            {str.replace(/\b(?:AMBER|KUNING|YELLOW)\b/i, "").replace(/[→\-\*]/g, "").trim() || "AMBER"}
          </span>
        </div>
      );
    }
    if (/\b(?:RED|MERAH)\b/i.test(str)) {
      return (
        <div className="flex items-center gap-1.5 justify-center flex-wrap">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            {str.replace(/\b(?:RED|MERAH)\b/i, "").replace(/[→\-\*]/g, "").trim() || "RED"}
          </span>
        </div>
      );
    }

    if (isLastCol && !hasCustomHeaders) {
      return (
        <span
          className="px-2 py-0.5 rounded text-neutral-950 font-semibold"
          style={{ backgroundColor: `${primaryColor}40` }}
        >
          {str}
        </span>
      );
    }

    return <span className="leading-snug">{str}</span>;
  };

  return (
    <div className="w-full max-h-[190px] sm:max-h-[230px] flex-1 min-h-0 overflow-y-auto rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-[#151515]/95 shadow-xs scrollbar-thin">
      <table className="w-full text-left border-collapse text-[11px] sm:text-xs">
        <thead>
          <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/90 dark:bg-neutral-900/70 sticky top-0 z-10 backdrop-blur-xs">
            {tableHeaders.map((hdr, i) => (
              <th
                key={i}
                className={`p-1.5 sm:p-2 font-bold uppercase tracking-wider ${
                  i === 0 ? "text-neutral-700 dark:text-neutral-200" : "text-center text-neutral-500 dark:text-neutral-400"
                } ${isPresentation ? "text-xs" : "text-[10px] sm:text-[11px]"}`}
                style={i === tableHeaders.length - 1 && !hasCustomHeaders ? { color: primaryColor === "#FFDE3C" ? "#B45309" : primaryColor } : undefined}
              >
                {hdr}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
          {items.map((row, idx) => (
            <motion.tr
              key={idx}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.05, ease: "easeOut" }}
              className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/30 transition-colors"
            >
              {isMultiCol && row.cells ? (
                row.cells.map((cellVal, cIdx) => (
                  <td
                    key={cIdx}
                    className={`p-2.5 sm:p-3 ${cIdx === 0 ? "font-semibold text-neutral-900 dark:text-white" : "text-center text-neutral-700 dark:text-neutral-300"}`}
                  >
                    {renderCellContent(cellVal, cIdx === row.cells!.length - 1)}
                  </td>
                ))
              ) : (
                <>
                  <td className="p-2.5 sm:p-3 font-semibold text-neutral-800 dark:text-neutral-200">
                    {row.feature || ""}
                  </td>
                  <td className="p-2.5 sm:p-3 text-center text-neutral-600 dark:text-neutral-400">
                    {renderCellContent(row.current)}
                  </td>
                  <td className="p-2.5 sm:p-3 text-center font-bold text-neutral-950 dark:text-white">
                    {renderCellContent(row.proposed, true)}
                  </td>
                </>
              )}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ───────────────────────────────────────────────────
 * 3. Quarterly Milestone Timeline
 * ─────────────────────────────────────────────────── */
export interface MilestoneNode {
  quarter: string;
  title: string;
  description: string;
  status?: "done" | "active" | "planned";
}

export function MilestoneTimeline({
  milestones,
  primaryColor = "#FFDE3C",
  isPresentation = false,
}: {
  milestones?: MilestoneNode[];
  primaryColor?: string;
  isPresentation?: boolean;
}) {
  if (!milestones || milestones.length === 0) return null;
  const items = milestones;

  return (
    <div className="w-full relative py-2">
      {/* Horizontal Rail Line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="absolute top-[28px] left-[5%] right-[5%] h-0.5 bg-neutral-200 dark:bg-neutral-800 origin-left"
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10">
        {items.map((m, idx) => {
          const isActive = m.status === "active";
          const isDone = m.status === "done";

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.1, ease: "easeOut" }}
              className="flex flex-col items-center text-center"
            >
              {/* Timeline Node Dot */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center mb-2.5 transition-all shadow-xs ${
                  isActive
                    ? "ring-4 ring-amber-400/30"
                    : isDone
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                    : "bg-white dark:bg-neutral-900 border-2 border-neutral-300 dark:border-neutral-700"
                }`}
                style={{ backgroundColor: isActive ? primaryColor : undefined }}
              >
                {isDone ? (
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-neutral-600 dark:bg-neutral-400" />
                )}
              </div>

              {/* Quarter Badge */}
              <span className="text-[10px] sm:text-[11px] font-sf font-sans font-bold uppercase tracking-wider text-neutral-500 mb-1">
                {m.quarter}
              </span>

              {/* Title & Description */}
              <h5 className={`${isPresentation ? "text-sm sm:text-base" : "text-xs sm:text-[13px]"} font-bold text-neutral-900 dark:text-white leading-tight mb-1`}>
                {m.title}
              </h5>
              <p className={`${isPresentation ? "text-xs" : "text-[10px] sm:text-[11px]"} text-neutral-500 dark:text-neutral-400 leading-snug max-w-[170px]`}>
                {m.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────
 * 4. 3-Tier Layer / Architecture Stack
 * ─────────────────────────────────────────────────── */
export function ArchitectureStack({
  layers,
  primaryColor = "#FFDE3C",
  isPresentation = false,
}: {
  layers?: Array<{ icon?: any; name: string; detail?: string; color?: string }>;
  primaryColor?: string;
  isPresentation?: boolean;
}) {
  if (!layers || layers.length === 0) return null;

  return (
    <div className="w-full flex flex-col gap-2 sm:gap-2.5">
      {layers.map((l, i) => {
        const Icon = l.icon || Globe;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: i * 0.1, ease: "easeOut" }}
            className="flex items-center gap-3 p-3 sm:p-3.5 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161616] shadow-2xs"
          >
            <div
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-md flex items-center justify-center shrink-0 text-neutral-950"
              style={{ backgroundColor: l.color }}
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h5 className={`${isPresentation ? "text-sm sm:text-base" : "text-xs sm:text-sm"} font-bold text-neutral-900 dark:text-white leading-tight`}>
                {l.name}
              </h5>
              <p className={`${isPresentation ? "text-xs" : "text-[10px] sm:text-[11px]"} text-neutral-500 dark:text-neutral-400 leading-snug mt-0.5`}>
                {l.detail}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ───────────────────────────────────────────────────
 * 5. 2x2 Quadrant Matrix (Impact vs Effort / Gartner)
 * ─────────────────────────────────────────────────── */
export interface QuadrantItem {
  title: string;
  subtitle?: string;
  tag?: string;
}

export interface QuadrantData {
  q1?: QuadrantItem[]; // High Impact, Low Effort (Quick Wins)
  q2?: QuadrantItem[]; // High Impact, High Effort (Major Bets)
  q3?: QuadrantItem[]; // Low Impact, Low Effort (Fill-ins)
  q4?: QuadrantItem[]; // Low Impact, High Effort (Deprioritize)
  xAxisLabel?: string;
  yAxisLabel?: string;
}

export function QuadrantMatrix({
  data,
  primaryColor = "#FFDE3C",
  isPresentation = false,
}: {
  data?: QuadrantData;
  primaryColor?: string;
  isPresentation?: boolean;
}) {
  if (!data || (!data.q1?.length && !data.q2?.length && !data.q3?.length && !data.q4?.length)) return null;
  const matrix = data;

  const quadrants = [
    { title: "Quick Wins", badge: "High Impact • Low Effort", items: matrix.q1 || [], bg: "bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200" },
    { title: "Major Strategic Bets", badge: "High Impact • High Effort", items: matrix.q2 || [], bg: "bg-blue-500/10 border-blue-500/30 text-blue-900 dark:text-blue-200" },
    { title: "Fill-In Tasks", badge: "Low Impact • Low Effort", items: matrix.q3 || [], bg: "bg-neutral-500/10 border-neutral-500/20 text-neutral-800 dark:text-neutral-300" },
    { title: "Deprioritize / Avoid", badge: "Low Impact • High Effort", items: matrix.q4 || [], bg: "bg-rose-500/10 border-rose-500/20 text-rose-900 dark:text-rose-300" },
  ];

  return (
    <div className="w-full h-full flex flex-col justify-center">
      <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full">
        {quadrants.map((quad, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, delay: idx * 0.08, ease: "easeOut" }}
            className={`rounded-md border p-2.5 sm:p-3 flex flex-col justify-between min-h-[90px] sm:min-h-[110px] ${quad.bg}`}
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className={`${isPresentation ? "text-xs" : "text-[10px] sm:text-[11px]"} font-bold uppercase tracking-wider`}>
                  {quad.title}
                </span>
                <span className="text-[9px] opacity-75 hidden sm:inline-block font-sf font-semibold">
                  {quad.badge}
                </span>
              </div>

              <div className="space-y-1 sm:space-y-1.5 mt-1.5">
                {quad.items.map((item, itemIdx) => (
                  <motion.div
                    key={itemIdx}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: idx * 0.08 + itemIdx * 0.05 }}
                    className="bg-white/80 dark:bg-black/40 rounded px-2 py-1 border border-black/5 dark:border-white/10"
                  >
                    <div className={`${isPresentation ? "text-xs sm:text-sm" : "text-[11px] sm:text-xs"} font-semibold text-neutral-900 dark:text-white leading-tight`}>
                      {item.title}
                    </div>
                    {item.subtitle && (
                      <div className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate">
                        {item.subtitle}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────
 * 6. Conversion / Pipeline Funnel Diagram
 * ─────────────────────────────────────────────────── */
export interface FunnelStage {
  label: string;
  value: string;
  rate?: string;
  subtext?: string;
}

export function FunnelDiagram({
  stages,
  primaryColor = "#FFDE3C",
  isPresentation = false,
}: {
  stages?: FunnelStage[];
  primaryColor?: string;
  isPresentation?: boolean;
}) {
  if (!stages || stages.length === 0) return null;
  const items = stages;
  const widthPercentages = ["w-full", "w-[85%]", "w-[70%]", "w-[55%]"];

  return (
    <div className="w-full flex flex-col items-center gap-1.5 sm:gap-2 py-1">
      {items.map((stage, i) => {
        const widthClass = widthPercentages[i] || "w-[50%]";
        const isFirst = i === 0;
        const isLast = i === items.length - 1;

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, scaleX: 0.85 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.35, delay: i * 0.08, ease: "easeOut" }}
            className={`${widthClass} transition-all duration-300 rounded-md border border-neutral-200 dark:border-neutral-800 p-2 sm:p-2.5 flex items-center justify-between shadow-2xs`}
            style={{
              backgroundColor: isLast
                ? `${primaryColor}20`
                : isFirst
                ? "rgba(255, 255, 255, 0.9)"
                : undefined,
              borderColor: isLast ? primaryColor : undefined,
            }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-sf font-sans font-bold shrink-0 text-neutral-950 tabular-nums"
                style={{ backgroundColor: isLast ? primaryColor : "#E5E5E5" }}
              >
                0{i + 1}
              </span>
              <div className="min-w-0">
                <h5 className={`${isPresentation ? "text-sm" : "text-xs"} font-bold text-neutral-900 dark:text-white truncate font-sf`}>
                  {stage.label}
                </h5>
                {stage.subtext && (
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate hidden sm:block font-sf">
                    {stage.subtext}
                  </p>
                )}
              </div>
            </div>

            <div className="text-right shrink-0 pl-2">
              <span className={`${isPresentation ? "text-sm sm:text-base" : "text-xs sm:text-sm"} font-extrabold text-neutral-900 dark:text-white tabular-nums font-sf`}>
                {stage.value}
              </span>
              {stage.rate && (
                <span className="block text-[9px] sm:text-[10px] font-sf font-sans text-emerald-600 dark:text-emerald-400 font-bold tabular-nums">
                  {stage.rate}
                </span>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ───────────────────────────────────────────────────
 * 7. Continuous Cycle / Loop Flywheel
 * ─────────────────────────────────────────────────── */
export interface CycleNode {
  title: string;
  description?: string;
  icon?: string;
}

export function CycleLoop({
  nodes,
  primaryColor = "#FFDE3C",
  isPresentation = false,
}: {
  nodes?: CycleNode[];
  primaryColor?: string;
  isPresentation?: boolean;
}) {
  if (!nodes || nodes.length === 0) {
    return null;
  }

  const items = nodes;

  return (
    <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 py-2">
      {items.map((node, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, delay: i * 0.09, ease: "easeOut" }}
          className="relative bg-white dark:bg-[#181818] border border-neutral-200 dark:border-neutral-800 rounded-md p-3 flex flex-col justify-between shadow-2xs group hover:border-neutral-400 dark:hover:border-neutral-600 transition-all"
        >
          {/* Top Stage Indicator */}
          <div className="flex items-center justify-between mb-2">
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-sf font-sans font-bold text-neutral-950 tabular-nums"
              style={{ backgroundColor: primaryColor }}
            >
              {i + 1}
            </span>
            {i < items.length - 1 ? (
              <span className="text-neutral-400 text-xs font-sf font-bold">→</span>
            ) : (
              <span className="text-amber-500 text-xs font-sf font-bold">↺ Loop</span>
            )}
          </div>

          <div>
            <h5 className={`${isPresentation ? "text-sm sm:text-base" : "text-xs sm:text-[13px]"} font-bold text-neutral-900 dark:text-white leading-tight`}>
              {node.title}
            </h5>
            {node.description && (
              <p className={`${isPresentation ? "text-xs" : "text-[10px] sm:text-[11px]"} text-neutral-500 dark:text-neutral-400 mt-1 leading-snug`}>
                {node.description}
              </p>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ───────────────────────────────────────────────────
 * 8. Alternating Chevron Process Arrow Bar
 * ─────────────────────────────────────────────────── */
export interface ChevronStep {
  title: string;
  percentage?: string;
  description?: string;
  position?: "top" | "bottom";
}

export function ChevronProcessBar({
  steps,
  primaryColor = "#FFDE3C",
  isPresentation = false,
}: {
  steps?: ChevronStep[];
  primaryColor?: string;
  isPresentation?: boolean;
}) {
  if (!steps || steps.length === 0) return null;
  const items = steps;

  return (
    <div className="w-full flex flex-col justify-center py-2">
      {/* Top Percentage Callouts */}
      <div className="grid grid-cols-5 gap-1 mb-2">
        {items.map((step, i) => (
          <div key={i} className="text-center px-1">
            {step.position === "top" && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.08 }}
                className="flex flex-col items-center"
              >
                <span className={`${isPresentation ? "text-2xl" : "text-sm sm:text-base"} font-black text-neutral-900 dark:text-white`}>
                  {step.percentage}
                </span>
                <p className={`${isPresentation ? "text-xs" : "text-[9px]"} text-neutral-500 truncate max-w-full`}>
                  {step.description}
                </p>
              </motion.div>
            )}
          </div>
        ))}
      </div>

      {/* Connected Chevron Shape Chain */}
      <div className="w-full flex items-center h-8 sm:h-10">
        {items.map((step, i) => {
          const isYellow = i % 2 === 0;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: i * 0.08, ease: "easeOut" }}
              className="flex-1 h-full flex items-center justify-center relative font-bold text-[10px] sm:text-xs transition-transform hover:scale-[1.02]"
              style={{
                backgroundColor: isYellow ? primaryColor : "#181818",
                color: isYellow ? "#111111" : "#FFFFFF",
                clipPath:
                  i === 0
                    ? "polygon(0% 0%, 88% 0%, 100% 50%, 88% 100%, 0% 100%)"
                    : i === items.length - 1
                    ? "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 12% 50%)"
                    : "polygon(0% 0%, 88% 0%, 100% 50%, 88% 100%, 0% 100%, 12% 50%)",
                marginLeft: i > 0 ? "-6px" : "0",
                zIndex: items.length - i,
              }}
            >
              <span className="truncate px-3 font-sf font-bold">{step.title}</span>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom Percentage Callouts */}
      <div className="grid grid-cols-5 gap-1 mt-2">
        {items.map((step, i) => (
          <div key={i} className="text-center px-1">
            {step.position === "bottom" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.08 }}
                className="flex flex-col items-center"
              >
                <span className={`${isPresentation ? "text-2xl" : "text-sm sm:text-base"} font-black text-neutral-900 dark:text-white`}>
                  {step.percentage}
                </span>
                <p className={`${isPresentation ? "text-xs" : "text-[9px]"} text-neutral-500 truncate max-w-full`}>
                  {step.description}
                </p>
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────
 * 9. Dual Circular Gauge Rings
 * ─────────────────────────────────────────────────── */
export interface GaugeRingItem {
  percentage: number;
  title: string;
  description: string;
}

export function GaugeRings({
  gauges,
  primaryColor = "#FFDE3C",
  isPresentation = false,
}: {
  gauges?: GaugeRingItem[];
  primaryColor?: string;
  isPresentation?: boolean;
}) {
  if (!gauges || gauges.length === 0) return null;
  const items = gauges;
  const isMulti = items.length > 2;
  const radius = 38;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className={`w-full grid ${isMulti ? "grid-cols-2 gap-2.5 sm:gap-3" : items.length === 1 ? "grid-cols-1 max-w-sm mx-auto" : "grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"} py-1`}>
      {items.slice(0, 4).map((gauge, i) => {
        const strokeDashoffset = circumference - (gauge.percentage / 100) * circumference;

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, delay: i * 0.08, ease: "easeOut" }}
            className={`flex items-center gap-3 ${isMulti ? "p-2.5 sm:p-3" : "p-3 sm:p-4"} rounded-xl border border-neutral-200/90 dark:border-neutral-800 bg-white/95 dark:bg-[#161616]/95 shadow-2xs overflow-hidden`}
          >
            {/* SVG Radial Gauge */}
            <div className={`relative ${isMulti ? "w-12 h-12 sm:w-14 sm:h-14" : "w-16 h-16 sm:w-20 sm:h-20"} shrink-0 flex items-center justify-center`}>
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="stroke-neutral-200 dark:stroke-neutral-800"
                  strokeWidth="10"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  stroke={primaryColor}
                  strokeWidth="10"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`${isMulti ? "text-xs sm:text-sm" : isPresentation ? "text-lg" : "text-sm sm:text-base"} font-black text-neutral-950 dark:text-white tabular-nums`}>
                  {gauge.percentage}%
                </span>
              </div>
            </div>

            {/* Description Details */}
            <div className="min-w-0 flex-1">
              <h5 className={`${isMulti ? "text-xs" : isPresentation ? "text-base" : "text-xs sm:text-sm"} font-bold text-neutral-950 dark:text-white leading-snug line-clamp-1`}>
                {gauge.title}
              </h5>
              <p className={`${isMulti ? "text-[9px] sm:text-[10px]" : isPresentation ? "text-xs" : "text-[10px] sm:text-[11px]"} text-neutral-500 dark:text-neutral-400 mt-0.5 leading-snug line-clamp-2`}>
                {gauge.description}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ───────────────────────────────────────────────────
 * 10. Ascending Diagonal Trajectory Line
 * ─────────────────────────────────────────────────── */
export interface TrajectoryNode {
  percentage: string;
  title: string;
  description?: string;
}

export function AscendingTrajectory({
  nodes,
  primaryColor = "#FFDE3C",
  isPresentation = false,
}: {
  nodes?: TrajectoryNode[];
  primaryColor?: string;
  isPresentation?: boolean;
}) {
  if (!nodes || nodes.length === 0) {
    return null;
  }

  const items = nodes;

  return (
    <div className="w-full relative h-[180px] sm:h-[220px] flex items-center justify-between px-4">
      {/* Background Ascending Diagonal Line */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
        <line x1="5%" y1="85%" x2="95%" y2="15%" stroke="#E5E7EB" strokeWidth="2" strokeDasharray="4 4" />
      </svg>

      <div className="w-full flex items-end justify-between relative z-10">
        {items.map((node, i) => {
          const heights = ["mb-0", "mb-10 sm:mb-14", "mb-20 sm:mb-28"];
          const heightClass = heights[i] || "mb-0";

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.12, ease: "easeOut" }}
              className={`flex flex-col items-center ${heightClass} transition-all`}
            >
              <div
                className="rounded-md p-2 sm:p-3 shadow-xs border border-neutral-200 dark:border-neutral-800 flex items-center gap-2"
                style={{ backgroundColor: primaryColor }}
              >
                <span className={`${isPresentation ? "text-xl sm:text-2xl" : "text-sm sm:text-base"} font-black text-neutral-950`}>
                  {node.percentage}
                </span>
                <div className="text-left border-l border-neutral-900/20 pl-2">
                  <div className="text-[10px] font-bold text-neutral-950 leading-tight">{node.title}</div>
                  {node.description && (
                    <div className="text-[8px] text-neutral-800/80 truncate max-w-[90px]">{node.description}</div>
                  )}
                </div>
              </div>
              <div className="w-3 h-3 rounded-full bg-neutral-900 dark:bg-white mt-2 ring-4 ring-amber-400/30" />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────
 * 11. Vertical Progress Rows
 * ─────────────────────────────────────────────────── */
export interface VerticalProgressItem {
  title: string;
  percentage: number;
  description?: string;
  tag?: string;
}

export function VerticalProgressStack({
  items,
  primaryColor = "#FFDE3C",
  isPresentation = false,
}: {
  items?: VerticalProgressItem[];
  primaryColor?: string;
  isPresentation?: boolean;
}) {
  if (!items || items.length === 0) return null;
  const list = items;

  return (
    <div className="w-full flex flex-col gap-3 py-1">
      {list.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: i * 0.1, ease: "easeOut" }}
          className="flex items-center gap-3"
        >
          <span
            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-sf font-sans font-bold shrink-0 text-neutral-950 tabular-nums"
            style={{ backgroundColor: primaryColor }}
          >
            {item.tag || `0${i + 1}`}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h5 className={`${isPresentation ? "text-sm" : "text-xs font-bold"} text-neutral-900 dark:text-white truncate font-sf`}>
                {item.title}
              </h5>
              <span className="text-[10px] font-sf font-sans font-bold text-neutral-500 tabular-nums">{item.percentage}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.percentage}%` }}
                transition={{ duration: 0.8, delay: i * 0.1 + 0.1, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ backgroundColor: primaryColor }}
              />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ───────────────────────────────────────────────────
 * 12. Bubble Cluster Diagram (3 Intersecting Circular Nodes)
 * ─────────────────────────────────────────────────── */
export interface BubbleNode {
  title: string;
  percentage: number;
  color?: "yellow" | "black";
  description?: string;
}

export function BubbleClusterDiagram({
  nodes,
  primaryColor = "#FFE500",
  isPresentation = false,
}: {
  nodes?: BubbleNode[];
  primaryColor?: string;
  isPresentation?: boolean;
}) {
  if (!nodes || nodes.length < 3) {
    return null;
  }

  const items = nodes;

  return (
    <div className="w-full h-full flex items-center justify-center p-2 sm:p-4 font-sf overflow-hidden">
      <div className="relative w-full max-w-[640px] h-[230px] sm:h-[260px] flex items-center justify-center">
        {/* Circle 1 - Top Left Primary */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="absolute left-[30%] sm:left-[32%] top-[6%] w-22 h-22 sm:w-26 sm:h-26 rounded-full flex items-center justify-center text-center p-2 shadow-sm z-10"
          style={{ backgroundColor: primaryColor }}
        >
          <span className="text-[10px] sm:text-xs font-black text-neutral-950 font-sf leading-tight line-clamp-3">
            {items[0].title}
          </span>
        </motion.div>

        {/* Leader Line & Callout for Circle 1 (Top Right) */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="absolute left-[54%] sm:left-[56%] top-[8%] flex items-center gap-2.5 z-20"
        >
          <div className="w-6 sm:w-10 h-[1.5px] bg-neutral-300 dark:bg-neutral-700 shrink-0" />
          <span className={`${isPresentation ? "text-xl sm:text-2xl" : "text-base sm:text-lg"} font-black text-neutral-950 dark:text-white font-sf tabular-nums shrink-0`}>
            {items[0].percentage}%
          </span>
          {items[0].description && (
            <span className="text-[9px] sm:text-[10px] text-neutral-500 dark:text-neutral-400 max-w-[130px] sm:max-w-[150px] line-clamp-2 leading-tight">
              {items[0].description}
            </span>
          )}
        </motion.div>

        {/* Circle 2 - Center Dark/Black */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="absolute left-[38%] sm:left-[40%] top-[24%] w-26 h-26 sm:w-30 sm:h-30 rounded-full bg-[#18181B] text-white flex items-center justify-center text-center p-2.5 shadow-md z-20 border border-neutral-700/50"
        >
          <span className="text-[11px] sm:text-xs font-black font-sf leading-tight line-clamp-3">
            {items[1].title}
          </span>
        </motion.div>

        {/* Leader Line & Callout for Circle 2 (Middle Left) */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="absolute right-[64%] sm:right-[65%] top-[34%] flex items-center gap-2.5 z-20"
        >
          {items[1].description && (
            <span className="text-[9px] sm:text-[10px] text-neutral-500 dark:text-neutral-400 max-w-[130px] sm:max-w-[150px] text-right line-clamp-2 leading-tight">
              {items[1].description}
            </span>
          )}
          <span className={`${isPresentation ? "text-xl sm:text-2xl" : "text-base sm:text-lg"} font-black text-neutral-950 dark:text-white font-sf tabular-nums shrink-0`}>
            {items[1].percentage}%
          </span>
          <div className="w-6 sm:w-10 h-[1.5px] bg-neutral-300 dark:bg-neutral-700 shrink-0" />
        </motion.div>

        {/* Circle 3 - Large Bottom Right Primary */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="absolute left-[46%] sm:left-[48%] top-[42%] w-28 h-28 sm:w-34 sm:h-34 rounded-full flex items-center justify-center text-center p-3 shadow-lg z-10"
          style={{ backgroundColor: primaryColor }}
        >
          <span className="text-xs sm:text-sm font-black text-neutral-950 font-sf leading-tight line-clamp-3">
            {items[2].title}
          </span>
        </motion.div>

        {/* Leader Line & Callout for Circle 3 (Bottom Right) */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="absolute left-[64%] sm:left-[66%] bottom-[8%] flex items-center gap-2.5 z-20"
        >
          <div className="w-6 sm:w-10 h-[1.5px] bg-neutral-300 dark:bg-neutral-700 shrink-0" />
          <span className={`${isPresentation ? "text-xl sm:text-2xl" : "text-base sm:text-lg"} font-black text-neutral-950 dark:text-white font-sf tabular-nums shrink-0`}>
            {items[2].percentage}%
          </span>
          {items[2].description && (
            <span className="text-[9px] sm:text-[10px] text-neutral-500 dark:text-neutral-400 max-w-[130px] sm:max-w-[150px] line-clamp-2 leading-tight">
              {items[2].description}
            </span>
          )}
        </motion.div>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────
 * 13. Vertical Connected Rings Chain with Right Rows
 * ─────────────────────────────────────────────────── */
export interface ConnectedRingItem {
  percentage: number;
  title: string;
  description: string;
}

export function ConnectedVerticalRings({
  rings,
  primaryColor = "#FFE500",
  isPresentation = false,
}: {
  rings?: ConnectedRingItem[];
  primaryColor?: string;
  isPresentation?: boolean;
}) {
  if (!rings || rings.length === 0) return null;
  const items = rings;

  return (
    <div className="w-full flex items-center py-2 font-sf">
      <div className="flex-1 flex flex-col gap-3 relative">
        {/* Continuous Vertical Connecting Line */}
        <div
          className="absolute left-[34px] sm:left-[39px] top-6 bottom-6 w-1 rounded-full z-0"
          style={{ backgroundColor: `${primaryColor}60` }}
        />

        {items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: i * 0.1, ease: "easeOut" }}
            className="flex items-center gap-3 sm:gap-4 relative z-10"
          >
            {/* Ring Circle */}
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white dark:bg-neutral-900 border-4 flex items-center justify-center shrink-0 shadow-sm"
              style={{ borderColor: primaryColor }}
            >
              <span className={`${isPresentation ? "text-base sm:text-lg" : "text-xs sm:text-sm"} font-extrabold text-neutral-900 dark:text-white font-sf`}>
                {item.percentage}%
              </span>
            </div>

            {/* Horizontal Connector Line */}
            <div className="w-4 sm:w-8 h-[2px] bg-neutral-300 dark:bg-neutral-700 shrink-0" />

            {/* Right Text Content Row */}
            <div className="flex-1 min-w-0 bg-neutral-50/80 dark:bg-neutral-900/60 p-2.5 sm:p-3 rounded-lg border border-neutral-100 dark:border-neutral-800">
              <h5 className={`${isPresentation ? "text-base" : "text-xs sm:text-sm"} font-bold text-neutral-900 dark:text-white leading-tight font-sf`}>
                {item.title}
              </h5>
              <p className={`${isPresentation ? "text-xs" : "text-[10px] sm:text-[11px]"} text-neutral-500 dark:text-neutral-400 mt-1 leading-snug line-clamp-2`}>
                {item.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────
 * 14. Horizontal Milestone Bar with Columns Underneath
 * ─────────────────────────────────────────────────── */
export interface HorizontalMilestone {
  percentage: string;
  title: string;
  description: string;
}

export function HorizontalMilestonesBar({
  milestones,
  primaryColor = "#FFE500",
  isPresentation = false,
}: {
  milestones?: HorizontalMilestone[];
  primaryColor?: string;
  isPresentation?: boolean;
}) {
  if (!milestones || milestones.length === 0) return null;
  const items = milestones;

  return (
    <div className="w-full flex flex-col justify-center py-3 font-sf">
      {/* Continuous Horizontal Gradient Milestone Bar */}
      <div
        className="w-full h-9 sm:h-11 rounded-lg grid grid-cols-4 items-center shadow-xs overflow-hidden"
        style={{
          background: `linear-gradient(90deg, ${primaryColor} 0%, #FFF59D 100%)`,
        }}
      >
        {items.map((m, i) => (
          <div key={i} className="text-center font-extrabold text-neutral-950 text-xs sm:text-sm border-r last:border-r-0 border-neutral-900/10">
            {m.percentage}
          </div>
        ))}
      </div>

      {/* 4 Process Columns Directly Underneath */}
      <div className="grid grid-cols-4 gap-3 sm:gap-4 mt-4">
        {items.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.08 }}
            className="flex flex-col"
          >
            <h5 className={`${isPresentation ? "text-sm sm:text-base" : "text-[11px] sm:text-xs"} font-bold text-neutral-900 dark:text-white leading-tight font-sf`}>
              {m.title}
            </h5>
            <p className={`${isPresentation ? "text-xs" : "text-[9px] sm:text-[10px]"} text-neutral-500 dark:text-neutral-400 mt-1 leading-snug line-clamp-3`}>
              {m.description}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────
 * 15. Split Metric Hero (Left Glowing Card + Right Progress List)
 * ─────────────────────────────────────────────────── */
export interface SplitMetricItem {
  title: string;
  percentage: number;
  description?: string;
  tag?: string;
}

export function SplitMetricHero({
  metricBox,
  items,
  primaryColor = "#FFE500",
  isPresentation = false,
}: {
  metricBox?: { value: string; label?: string; description?: string };
  items?: SplitMetricItem[];
  primaryColor?: string;
  isPresentation?: boolean;
}) {
  if (!items || items.length === 0) return null;
  const activeMetric = metricBox || {
    value: items[0]?.percentage ? `${items[0].percentage}%` : "100%",
    description: items[0]?.description || items[0]?.title || "",
  };
  const activeItems = items;

  return (
    <div className="w-full flex items-center gap-4 sm:gap-6 py-2 font-sf">
      {/* Left Column: Yellow Rounded Metric Box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-[38%] sm:w-[35%] rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-sm"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, #FFF9C4 100%)`,
        }}
      >
        <div className="w-6 h-6 rounded-md bg-neutral-950 text-white flex items-center justify-center text-[10px] font-bold mb-3">
          ⚡
        </div>
        <div>
          <span className={`${isPresentation ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"} font-black text-neutral-950 tracking-tight leading-none block font-sf`}>
            {activeMetric.value}
          </span>
          <p className={`${isPresentation ? "text-xs" : "text-[10px] sm:text-[11px]"} text-neutral-800 font-medium mt-2 leading-snug font-sf`}>
            {activeMetric.description}
          </p>
        </div>
      </motion.div>

      {/* Thin Vertical Dividing Line */}
      <div className="w-[1.5px] self-stretch bg-neutral-200 dark:bg-neutral-800" />

      {/* Right Column: 3 Numbered Progress Rows */}
      <div className="flex-1 flex flex-col gap-3">
        {activeItems.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: i * 0.1 }}
            className="flex items-start gap-3"
          >
            {/* Circular Yellow Tag */}
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-sf font-sans font-bold shrink-0 text-neutral-950 mt-0.5 tabular-nums"
              style={{ backgroundColor: primaryColor }}
            >
              {item.tag || `0${i + 1}.`}
            </span>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h5 className={`${isPresentation ? "text-sm" : "text-xs"} font-bold text-neutral-900 dark:text-white truncate font-sf`}>
                  {item.title}
                </h5>
                <span className="text-[10px] font-sf font-sans font-bold text-neutral-500 shrink-0 tabular-nums">{item.percentage}%</span>
              </div>
              {item.description && (
                <p className="text-[10px] text-neutral-500 line-clamp-1 mt-0.5 leading-tight">
                  {item.description}
                </p>
              )}
              {/* Active Progress Bar */}
              <div className="w-full h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-800 mt-1.5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.percentage}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1 + 0.1, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: primaryColor }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────
 * 16. Curved Triangular Cycle Loop with Arrow Arcs
 * ─────────────────────────────────────────────────── */
export function CurvedCycleLoop({
  nodes,
  primaryColor = "#FFE500",
  isPresentation = false,
}: {
  nodes?: Array<{ percentage?: string; title: string; description?: string }>;
  primaryColor?: string;
  isPresentation?: boolean;
}) {
  if (!nodes || nodes.length < 3) {
    return null;
  }

  const items = nodes;

  return (
    <div className="w-full h-full flex items-center justify-center p-2 font-sf">
      <div className="relative w-[320px] sm:w-[380px] h-[220px] sm:h-[260px] flex items-center justify-center">
        {/* SVG Curved Directional Arrow Arcs (Clockwise) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 380 260">
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#181818" />
            </marker>
          </defs>
          {/* Top to Bottom Right Arc */}
          <path d="M 230 65 Q 310 110 290 150" fill="none" stroke="#181818" strokeWidth="2.5" markerEnd="url(#arrow)" />
          {/* Bottom Right to Bottom Left Arc */}
          <path d="M 250 200 Q 190 235 150 200" fill="none" stroke="#181818" strokeWidth="2.5" markerEnd="url(#arrow)" />
          {/* Bottom Left to Top Arc */}
          <path d="M 120 150 Q 110 90 170 65" fill="none" stroke="#181818" strokeWidth="2.5" markerEnd="url(#arrow)" />
        </svg>

        {/* Node 1: Top Center Yellow Circle */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="absolute top-[8px] left-[165px] -translate-x-1/2 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center shadow-md z-10"
          style={{ backgroundColor: primaryColor }}
        >
          <span className="text-xs sm:text-sm font-extrabold text-neutral-950 font-sf">{items[0].percentage || "38%"}</span>
        </motion.div>
        {/* Label Node 1 (Right of Top Circle) */}
        <div className="absolute top-[12px] left-[225px] max-w-[130px]">
          <div className="text-[10px] sm:text-[11px] font-bold text-neutral-900 dark:text-white leading-tight">{items[0].title}</div>
          <div className="text-[8px] sm:text-[9px] text-neutral-500 line-clamp-1">{items[0].description}</div>
        </div>

        {/* Node 2: Bottom Right Yellow Circle */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="absolute bottom-[20px] right-[45px] w-18 h-18 sm:w-22 sm:h-22 rounded-full flex items-center justify-center shadow-md z-10"
          style={{ backgroundColor: primaryColor }}
        >
          <span className="text-xs sm:text-sm font-extrabold text-neutral-950 font-sf">{items[1].percentage || "55%"}</span>
        </motion.div>
        {/* Label Node 2 (Right of Circle 2) */}
        <div className="absolute bottom-[28px] right-[10px] translate-x-full max-w-[110px] hidden sm:block">
          <div className="text-[10px] sm:text-[11px] font-bold text-neutral-900 dark:text-white leading-tight">{items[1].title}</div>
          <div className="text-[8px] sm:text-[9px] text-neutral-500 line-clamp-1">{items[1].description}</div>
        </div>

        {/* Node 3: Bottom Left Large Yellow Circle with Black Border */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="absolute bottom-[10px] left-[55px] w-22 h-22 sm:w-28 sm:h-28 rounded-full border-3 border-neutral-950 flex items-center justify-center shadow-md z-10"
          style={{ backgroundColor: primaryColor }}
        >
          <span className="text-sm sm:text-base font-extrabold text-neutral-950 font-sf">{items[2].percentage || "90%"}</span>
        </motion.div>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────
 * 17. Asymmetric Matrix with Staggered Stat Cards
 * ─────────────────────────────────────────────────── */
export function AsymmetricMatrixGrid({
  items,
  primaryColor = "#FFE500",
  isPresentation = false,
}: {
  items?: Array<{ stat: string; text: string }>;
  primaryColor?: string;
  isPresentation?: boolean;
}) {
  if (!items || items.length === 0) return null;
  const activeItems = items;

  return (
    <div className="w-full flex flex-col gap-2.5 py-1 font-sf">
      {/* Row 1: Stat on Left, Card on Right */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-3"
      >
        <div className="w-[30%] text-center">
          <span className={`${isPresentation ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"} font-black text-neutral-950 dark:text-white font-sf`}>
            {activeItems[0].stat}
          </span>
        </div>
        <div
          className="flex-1 rounded-lg p-2.5 sm:p-3 text-[10px] sm:text-xs font-medium text-neutral-900 shadow-2xs leading-snug"
          style={{ backgroundColor: primaryColor }}
        >
          {activeItems[0].text}
        </div>
      </motion.div>

      {/* Row 2: Card on Left, Stat on Right */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.08 }}
        className="flex items-center gap-3"
      >
        <div
          className="flex-1 rounded-lg p-2.5 sm:p-3 text-[10px] sm:text-xs font-medium text-neutral-900 shadow-2xs leading-snug"
          style={{ backgroundColor: primaryColor }}
        >
          {activeItems[1].text}
        </div>
        <div className="w-[30%] text-center">
          <span className={`${isPresentation ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"} font-black text-neutral-950 dark:text-white font-sf`}>
            {activeItems[1].stat}
          </span>
        </div>
      </motion.div>

      {/* Row 3: Stat on Left, Card on Right */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.16 }}
        className="flex items-center gap-3"
      >
        <div className="w-[30%] text-center">
          <span className={`${isPresentation ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"} font-black text-neutral-950 dark:text-white font-sf`}>
            {activeItems[2].stat}
          </span>
        </div>
        <div
          className="flex-1 rounded-lg p-2.5 sm:p-3 text-[10px] sm:text-xs font-medium text-neutral-900 shadow-2xs leading-snug"
          style={{ backgroundColor: primaryColor }}
        >
          {activeItems[2].text}
        </div>
      </motion.div>
    </div>
  );
}
