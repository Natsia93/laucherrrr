"use client";

import React from "react";
// Static elements proxy to eliminate individual element entrance animations when viewing or navigating slides
const motion = {
  div: React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { [key: string]: any }>(
    ({ initial, animate, exit, transition, whileHover, whileTap, ...props }, ref) => (
      <div ref={ref} {...props} />
    )
  ),
  tr: React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement> & { [key: string]: any }>(
    ({ initial, animate, exit, transition, whileHover, whileTap, ...props }, ref) => (
      <tr ref={ref} {...props} />
    )
  ),
  span: React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement> & { [key: string]: any }>(
    ({ initial, animate, exit, transition, whileHover, whileTap, ...props }, ref) => (
      <span ref={ref} {...props} />
    )
  ),
  p: React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement> & { [key: string]: any }>(
    ({ initial, animate, exit, transition, whileHover, whileTap, ...props }, ref) => (
      <p ref={ref} {...props} />
    )
  ),
  h1: React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement> & { [key: string]: any }>(
    ({ initial, animate, exit, transition, whileHover, whileTap, ...props }, ref) => (
      <h1 ref={ref} {...props} />
    )
  ),
  h2: React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement> & { [key: string]: any }>(
    ({ initial, animate, exit, transition, whileHover, whileTap, ...props }, ref) => (
      <h2 ref={ref} {...props} />
    )
  ),
  h3: React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement> & { [key: string]: any }>(
    ({ initial, animate, exit, transition, whileHover, whileTap, ...props }, ref) => (
      <h3 ref={ref} {...props} />
    )
  ),
  h4: React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement> & { [key: string]: any }>(
    ({ initial, animate, exit, transition, whileHover, whileTap, ...props }, ref) => (
      <h4 ref={ref} {...props} />
    )
  ),
  h5: React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement> & { [key: string]: any }>(
    ({ initial, animate, exit, transition, whileHover, whileTap, ...props }, ref) => (
      <h5 ref={ref} {...props} />
    )
  ),
};
motion.div.displayName = "StaticMotionDiv";
motion.tr.displayName = "StaticMotionTr";
motion.span.displayName = "StaticMotionSpan";
motion.p.displayName = "StaticMotionP";
motion.h1.displayName = "StaticMotionH1";
motion.h2.displayName = "StaticMotionH2";
motion.h3.displayName = "StaticMotionH3";
motion.h4.displayName = "StaticMotionH4";
motion.h5.displayName = "StaticMotionH5";

import { ArrowRight, Check, X, Sparkles, Layers, Cpu, Database, Globe, AlertTriangle } from "lucide-react";

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
            className="flex-1 min-w-[90px] sm:min-w-[120px] bg-white dark:bg-[#181818] border border-neutral-200 dark:border-neutral-800 rounded-md p-3 sm:p-4 relative flex flex-col justify-between"
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
    <div className={`w-full flex-1 min-h-0 overflow-hidden rounded-md border border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-[#151515]/95 shadow-2xs flex flex-col ${isPresentation ? "my-auto justify-center" : ""}`}>
      <table className={`w-full text-left border-collapse ${isPresentation ? "text-xs sm:text-sm lg:text-[15px] h-full" : "text-[11px] sm:text-xs"}`}>
        <thead>
          <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/90 dark:bg-neutral-900/70 sticky top-0 z-10 backdrop-blur-xs">
            {tableHeaders.map((hdr, i) => (
              <th
                key={i}
                className={`font-bold uppercase tracking-wider ${
                  i === 0 ? "text-neutral-700 dark:text-neutral-200" : "text-center text-neutral-500 dark:text-neutral-400"
                } ${isPresentation ? "text-xs sm:text-sm lg:text-sm p-3 sm:p-4" : "p-1.5 sm:p-2 text-[10px] sm:text-[11px]"}`}
                style={i === tableHeaders.length - 1 && !hasCustomHeaders ? { color: primaryColor === "#FFDE3C" ? "#B45309" : primaryColor } : undefined}
              >
                {hdr}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={`divide-y divide-neutral-100 dark:divide-neutral-800/80 ${isPresentation ? "divide-y-2" : ""}`}>
          {items.slice(0, 5).map((row, idx) => (
            <motion.tr
              key={idx}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.05, ease: "easeOut" }}
              className={`hover:bg-neutral-50/50 dark:hover:bg-neutral-900/30 transition-colors ${isPresentation ? "min-h-[48px]" : ""}`}
            >
              {isMultiCol && row.cells ? (
                row.cells.map((cellVal, cIdx) => (
                  <td
                    key={cIdx}
                    className={`${isPresentation ? "p-3 sm:p-4 lg:p-4.5" : "p-1.5 sm:p-2"} ${cIdx === 0 ? "font-semibold text-neutral-900 dark:text-white" : "text-center text-neutral-700 dark:text-neutral-300"}`}
                  >
                    {renderCellContent(cellVal, cIdx === row.cells!.length - 1)}
                  </td>
                ))
              ) : (
                <>
                  <td className={`${isPresentation ? "p-3 sm:p-4 lg:p-4.5" : "p-1.5 sm:p-2"} font-semibold text-neutral-800 dark:text-neutral-200`}>
                    {row.feature || ""}
                  </td>
                  <td className={`${isPresentation ? "p-3 sm:p-4 lg:p-4.5" : "p-1.5 sm:p-2"} text-center text-neutral-600 dark:text-neutral-400`}>
                    {renderCellContent(row.current)}
                  </td>
                  <td className={`${isPresentation ? "p-3 sm:p-4 lg:p-4.5" : "p-1.5 sm:p-2"} text-center font-bold text-neutral-950 dark:text-white`}>
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
                className={`w-6 h-6 rounded-full flex items-center justify-center mb-2.5 transition-all ${
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
            className="flex items-center gap-3 p-3 sm:p-3.5 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161616]"
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

export interface QuadrantItem {
  title: string;
  subtitle?: string;
}

export interface QuadrantData {
  q1?: QuadrantItem[];
  q2?: QuadrantItem[];
  q3?: QuadrantItem[];
  q4?: QuadrantItem[];
  yAxisTop?: string;
  yAxisBottom?: string;
  xAxisLeft?: string;
  xAxisRight?: string;
}

export function QuadrantMatrix({
  data,
  primaryColor = "#005AAB",
  accentColor = "#FFDD3C",
  isPresentation = false,
}: {
  data?: QuadrantData;
  primaryColor?: string;
  accentColor?: string;
  isPresentation?: boolean;
}) {
  const matrix = data || {};
  const q1Items = matrix.q1 && matrix.q1.length > 0 ? matrix.q1 : [{ title: "Human judgment only", subtitle: "You decide. AI may inform, but does not drive the call." }];
  const q2Items = matrix.q2 && matrix.q2.length > 0 ? matrix.q2 : [{ title: "Augment with AI", subtitle: "AI proposes. You stress-test it, decide and own the reasoning." }];
  const q3Items = matrix.q3 && matrix.q3.length > 0 ? matrix.q3 : [{ title: "Automate with caution", subtitle: "Automate the routine, but sample and audit the results." }];
  const q4Items = matrix.q4 && matrix.q4.length > 0 ? matrix.q4 : [{ title: "Delegate to AI", subtitle: "AI decides within rules you set. You monitor and audit." }];

  // 4 Asymmetric Executive Quadrants matching Slide 3 Pattern:
  // Q1 (Top-Left): Solid Primary Blue with Yellow Lead
  // Q2 (Top-Right): Solid Accent Yellow with Dark Text
  // Q3 (Bottom-Left): Light Bordered Card
  // Q4 (Bottom-Right): Blue Bordered Card
  const qList = [
    {
      items: q1Items,
      defaultTitle: "High Stakes & Direct Action",
      style: {
        container: "bg-[#005AAB] text-white border border-[#005AAB] shadow-xs",
        title: "text-[#FFDD3C] font-bold",
        desc: "text-white/90 font-medium",
      },
    },
    {
      items: q2Items,
      defaultTitle: "Augment with Strategy",
      style: {
        container: "bg-[#FFDD3C] text-neutral-950 border border-[#E5C310] shadow-xs",
        title: "text-neutral-950 font-bold",
        desc: "text-neutral-800 font-medium",
      },
    },
    {
      items: q3Items,
      defaultTitle: "Automate with Caution",
      style: {
        container: "bg-white dark:bg-[#161616] text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-800 shadow-2xs",
        title: "text-neutral-900 dark:text-white font-bold",
        desc: "text-neutral-600 dark:text-neutral-400 font-normal",
      },
    },
    {
      items: q4Items,
      defaultTitle: "Delegate & Supervise",
      style: {
        container: "bg-white dark:bg-[#161616] text-neutral-900 dark:text-neutral-100 border-2 border-[#005AAB] shadow-2xs",
        title: "text-[#005AAB] dark:text-[#60A5FA] font-bold",
        desc: "text-neutral-600 dark:text-neutral-400 font-normal",
      },
    },
  ];

  const yTop = matrix.yAxisTop || "High stakes";
  const yBottom = matrix.yAxisBottom || "Low stakes";
  const xLeft = matrix.xAxisLeft || "Low data richness";
  const xRight = matrix.xAxisRight || "High data richness";

  return (
    <div className="w-full flex-1 flex flex-col justify-center my-auto relative pl-6 pb-6 pt-2 pr-2">
      {/* Y-Axis Arrow and Labels */}
      <div className="absolute left-0 top-0 bottom-6 w-5 flex flex-col justify-between items-center text-[10px] sm:text-[11px] font-bold text-[#005AAB] dark:text-[#60A5FA] select-none">
        <span className="text-center leading-tight tracking-tight">{yTop}</span>
        <div className="w-0.5 flex-1 my-1 bg-[#005AAB] relative flex items-start justify-center">
          <div className="w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-b-[6px] border-b-[#005AAB] absolute -top-1" />
        </div>
        <span className="text-center leading-tight tracking-tight text-neutral-500">{yBottom}</span>
      </div>

      {/* 2x2 Quadrant Grid */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 w-full h-full">
        {qList.map((q, idx) => {
          const first = q.items[0];
          const title = first?.title || q.defaultTitle;
          const desc = first?.subtitle || q.items.slice(1).map(it => it.title).join(". ") || "";

          return (
            <div
              key={idx}
              className={`rounded-lg p-3 sm:p-4.5 flex flex-col justify-between min-h-[95px] sm:min-h-[125px] transition-transform hover:scale-[1.008] ${q.style.container}`}
            >
              <div>
                <h5 className={`${isPresentation ? "text-sm sm:text-base lg:text-lg" : "text-xs sm:text-[13.5px]"} ${q.style.title} leading-tight mb-1 tracking-tight`}>
                  {title}
                </h5>
                {desc && (
                  <p className={`${isPresentation ? "text-xs sm:text-sm" : "text-[10.5px] sm:text-xs"} ${q.style.desc} leading-relaxed mt-1`}>
                    {desc}
                  </p>
                )}
              </div>

              {q.items.length > 1 && !first?.subtitle && (
                <div className="space-y-1 mt-2 pt-1 border-t border-black/10 dark:border-white/10">
                  {q.items.slice(1, 3).map((it, iIdx) => (
                    <div key={iIdx} className="text-[10px] sm:text-[11px] opacity-90 truncate flex items-center gap-1.5">
                      <span>•</span>
                      <span>{it.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* X-Axis Arrow and Labels */}
      <div className="absolute left-6 right-0 bottom-0 h-5 flex items-center justify-between text-[10px] sm:text-[11px] font-bold select-none">
        <span className="text-neutral-500">{xLeft}</span>
        <div className="flex-1 mx-3 h-0.5 bg-[#005AAB] relative flex items-center justify-end">
          <div className="w-0 h-0 border-t-[3.5px] border-t-transparent border-b-[3.5px] border-b-transparent border-l-[6px] border-l-[#005AAB] absolute -right-1" />
        </div>
        <span className="text-[#005AAB] dark:text-[#60A5FA]">{xRight}</span>
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
            className={`${widthClass} transition-all duration-300 rounded-md border border-neutral-200 dark:border-neutral-800 p-2 sm:p-2.5 flex items-center justify-between`}
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
          className="relative bg-white dark:bg-[#181818] border border-neutral-200 dark:border-neutral-800 rounded-md p-3 flex flex-col justify-between group hover:border-neutral-400 dark:hover:border-neutral-600 transition-all"
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
  pill?: string;
  pillType?: "blue" | "yellow" | "neutral" | "danger";
}

export function ChevronProcessBar({
  steps,
  primaryColor = "#005AAB",
  accentColor = "#FFDD3C",
  keyInsight,
  isPresentation = false,
}: {
  steps?: ChevronStep[];
  primaryColor?: string;
  accentColor?: string;
  keyInsight?: string;
  isPresentation?: boolean;
}) {
  if (!steps || steps.length === 0) return null;
  const items = steps;

  // Determine if this is the modern ITB multi-part cycle layout with descriptions below
  const hasBottomDetails = items.some((s) => s.description || s.pill);

  return (
    <div className="w-full flex flex-col justify-center my-auto py-1">
      {/* Top Percentage Callouts (Legacy compatibility if position: top) */}
      {!hasBottomDetails && (
        <div className="grid grid-cols-5 gap-1 mb-2">
          {items.map((step, i) => (
            <div key={i} className="text-center px-1">
              {step.position === "top" && (
                <div className="flex flex-col items-center">
                  <span className={`${isPresentation ? "text-2xl" : "text-sm sm:text-base"} font-black text-neutral-900 dark:text-white`}>
                    {step.percentage}
                  </span>
                  <p className={`${isPresentation ? "text-xs" : "text-[9px]"} text-neutral-500 truncate max-w-full`}>
                    {step.description}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Connected Chevron Shape Chain (Alternating Accent Yellow & Deep Blue) */}
      <div className={`w-full flex items-center ${isPresentation ? "h-11 sm:h-14" : "h-9 sm:h-10"}`}>
        {items.map((step, i) => {
          const isYellow = i % 2 === 0;
          const bg = isYellow ? accentColor : primaryColor;
          const textColor = isYellow ? "#111111" : "#FFFFFF";

          return (
            <div
              key={i}
              className={`flex-1 h-full flex items-center justify-center relative font-bold ${
                isPresentation ? "text-xs sm:text-sm lg:text-[15px]" : "text-[10px] sm:text-xs"
              } transition-transform hover:scale-[1.01]`}
              style={{
                backgroundColor: bg,
                color: textColor,
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
              <span className="truncate px-2 sm:px-3 font-bold tracking-tight">
                {step.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* Under-Chevron Step Descriptions & Status Pills (Slide 1 Pattern) */}
      {hasBottomDetails ? (
        <div className={`grid grid-cols-${items.length} gap-2 sm:gap-3.5 mt-2.5 sm:mt-3`}>
          {items.map((step, i) => (
            <div key={i} className="flex flex-col justify-start items-start text-left px-1">
              {step.description && (
                <p className={`text-neutral-700 dark:text-neutral-300 ${
                  isPresentation ? "text-xs sm:text-sm leading-relaxed" : "text-[10px] sm:text-[11px] leading-snug"
                } line-clamp-3 font-normal`}>
                  {step.description}
                </p>
              )}
              {step.pill && (
                <div className="mt-2">
                  <span className={`inline-block px-2.5 py-1 rounded-full font-semibold ${
                    isPresentation ? "text-[11px] sm:text-xs" : "text-[9.5px] sm:text-[10px]"
                  } ${
                    step.pillType === "neutral"
                      ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700"
                      : "bg-[#005AAB] text-white shadow-2xs"
                  }`}>
                    {step.pill}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Legacy Bottom Percentage Callouts */
        <div className="grid grid-cols-5 gap-1 mt-2">
          {items.map((step, i) => (
            <div key={i} className="text-center px-1">
              {step.position === "bottom" && (
                <div className="flex flex-col items-center">
                  <span className={`${isPresentation ? "text-2xl" : "text-sm sm:text-base"} font-black text-neutral-900 dark:text-white`}>
                    {step.percentage}
                  </span>
                  <p className={`${isPresentation ? "text-xs" : "text-[9px]"} text-neutral-500 truncate max-w-full`}>
                    {step.description}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Full-Width Key Insight Bar (Slide 1 Bottom Pattern) */}
      {keyInsight && (
        <div className={`w-full mt-3 sm:mt-4 rounded-md overflow-hidden flex items-stretch border border-neutral-200/80 dark:border-neutral-800 shadow-2xs`} style={{ backgroundColor: primaryColor }}>
          <div className="w-2 sm:w-2.5 shrink-0" style={{ backgroundColor: accentColor }} />
          <div className={`p-2.5 sm:p-3 text-white font-medium ${
            isPresentation ? "text-xs sm:text-sm lg:text-[15px]" : "text-[11px] sm:text-xs"
          } leading-snug`}>
            <strong className="font-bold mr-1.5" style={{ color: accentColor }}>Key insight:</strong>
            <span>{keyInsight}</span>
          </div>
        </div>
      )}
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
            className={`flex items-center gap-3 ${isMulti ? "p-2.5 sm:p-3" : "p-3 sm:p-4"} rounded-md border border-neutral-200/90 dark:border-neutral-800 bg-white/95 dark:bg-[#161616]/95 overflow-hidden`}
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
                className="rounded-md p-2 sm:p-3 border border-neutral-200 dark:border-neutral-800 flex items-center gap-2"
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
              <div
                className="h-full rounded-full"
                style={{ backgroundColor: primaryColor, width: `${item.percentage}%` }}
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
          className="absolute left-[30%] sm:left-[32%] top-[6%] w-22 h-22 sm:w-26 sm:h-26 rounded-full flex items-center justify-center text-center p-2 z-10"
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
          className="absolute left-[38%] sm:left-[40%] top-[24%] w-26 h-26 sm:w-30 sm:h-30 rounded-full bg-[#18181B] text-white flex items-center justify-center text-center p-2.5 z-20 border border-neutral-700/50"
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
          className="absolute left-[46%] sm:left-[48%] top-[42%] w-28 h-28 sm:w-34 sm:h-34 rounded-full flex items-center justify-center text-center p-3 z-10"
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
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white dark:bg-neutral-900 border-4 flex items-center justify-center shrink-0"
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
        className="w-full h-9 sm:h-11 rounded-lg grid grid-cols-4 items-center overflow-hidden"
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
        className="w-[38%] sm:w-[35%] rounded-md p-4 sm:p-5 flex flex-col justify-between"
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
                <div
                  className="h-full rounded-full"
                  style={{ backgroundColor: primaryColor, width: `${item.percentage}%` }}
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
          className="absolute top-[8px] left-[165px] -translate-x-1/2 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center z-10"
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
          className="absolute bottom-[20px] right-[45px] w-18 h-18 sm:w-22 sm:h-22 rounded-full flex items-center justify-center z-10"
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
          className="absolute bottom-[10px] left-[55px] w-22 h-22 sm:w-28 sm:h-28 rounded-full border-3 border-neutral-950 flex items-center justify-center z-10"
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
          className="flex-1 rounded-lg p-2.5 sm:p-3 text-[10px] sm:text-xs font-medium text-neutral-900 leading-snug"
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
          className="flex-1 rounded-lg p-2.5 sm:p-3 text-[10px] sm:text-xs font-medium text-neutral-900 leading-snug"
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
          className="flex-1 rounded-lg p-2.5 sm:p-3 text-[10px] sm:text-xs font-medium text-neutral-900 leading-snug"
          style={{ backgroundColor: primaryColor }}
        >
          {activeItems[2].text}
        </div>
      </motion.div>
    </div>
  );
}

/* ───────────────────────────────────────────────────
 * 15. Executive Insight Bar & Note Box Primitives
 * ─────────────────────────────────────────────────── */
export function InsightBar({
  text,
  leadIn = "Wawasan kunci:",
  primaryColor = "#005AAB",
  accentColor = "#FFDD3C",
  isPresentation = false,
}: {
  text: string;
  leadIn?: string;
  primaryColor?: string;
  accentColor?: string;
  isPresentation?: boolean;
}) {
  if (!text) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`w-full rounded-md flex items-center overflow-hidden shrink-0 ${
        isPresentation ? "p-4 sm:p-5 text-sm sm:text-base" : "py-2 px-3 sm:px-3.5 text-[11px] sm:text-xs"
      }`}
      style={{
        backgroundColor: primaryColor,
        borderLeft: `10px solid ${accentColor}`,
        color: "#FFFFFF",
      }}
    >
      <p className="leading-snug font-normal line-clamp-2">
        {leadIn && <strong className="font-bold mr-1.5 text-white">{leadIn}</strong>}
        {text}
      </p>
    </motion.div>
  );
}

export function NoteBox({
  text,
  leadIn = "Catatan:",
  bgColor = "#FFEC8E",
  textColor = "#272525",
  isPresentation = false,
}: {
  text: string;
  leadIn?: string;
  bgColor?: string;
  textColor?: string;
  isPresentation?: boolean;
}) {
  if (!text) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`w-full rounded-lg flex items-center overflow-hidden shrink-0 ${
        isPresentation ? "p-3.5 sm:p-4 text-xs sm:text-sm" : "py-1.5 px-3 text-[10.5px] sm:text-[11.5px]"
      }`}
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <p className="leading-snug font-normal line-clamp-2">
        {leadIn && <strong className="font-bold mr-1.5">{leadIn}</strong>}
        {text}
      </p>
    </motion.div>
  );
}

/* ───────────────────────────────────────────────────
 * 16. Paired Rows (Problem / Weak → Arrow → Solution / Fix)
 * ─────────────────────────────────────────────────── */
export interface PairedRowItem {
  left: string;
  right: string;
  leftLead?: string;
  rightLead?: string;
}

export function PairedRows({
  items,
  leftHeader,
  rightHeader,
  primaryColor = "#005AAB",
  isPresentation = false,
}: {
  items: PairedRowItem[];
  leftHeader?: string;
  rightHeader?: string;
  primaryColor?: string;
  isPresentation?: boolean;
}) {
  if (!items || items.length === 0) return null;

  // Auto-detect language if headers are not explicitly provided
  const sampleText = items
    .map((r) => `${r.left || ""} ${r.right || ""} ${r.leftLead || ""} ${r.rightLead || ""}`)
    .join(" ");
  const isEnglish = /\b(the|and|for|our|with|from|action|outcome|strategy|strategic|market|value|approach|problem|solution|system|model|impact|growth|result|deliver|health|risk|care|data|platform)\b/i.test(sampleText);
  const hasActionOutcome = /\b(?:strategic\s*action|action|mandat|inisiatif)\b/i.test(sampleText);

  const defaultLeft = isEnglish
    ? hasActionOutcome ? "STRATEGIC ACTION" : "CHALLENGE"
    : "MASALAH";
  const defaultRight = isEnglish
    ? hasActionOutcome ? "TANGIBLE OUTCOME" : "SOLUTION"
    : "PERBAIKAN";

  const resolvedLeftHeader = leftHeader || defaultLeft;
  const resolvedRightHeader = rightHeader || defaultRight;

  return (
    <div className={`w-full flex flex-col ${isPresentation ? "gap-3 sm:gap-4.5" : "gap-1.5 sm:gap-2.5"} my-auto max-h-full overflow-hidden`}>
      {/* Header Tags with safe vertical spacing */}
      {(resolvedLeftHeader || resolvedRightHeader) && (
        <div className={`flex items-center gap-3 sm:gap-4 px-1 mb-1 font-bold tracking-widest uppercase ${
          isPresentation ? "text-xs sm:text-sm lg:text-[15px]" : "text-[10px] sm:text-[11px]"
        } text-neutral-500`}>
          <div className="flex-1">{resolvedLeftHeader}</div>
          <div className="w-6 sm:w-8 shrink-0 text-center opacity-0">→</div>
          <div className="flex-1" style={{ color: primaryColor }}>{resolvedRightHeader}</div>
        </div>
      )}

      {/* Rows with strict height constraint and overflow prevention */}
      {items.slice(0, 3).map((row, i) => (
        <div
          key={i}
          className={`flex items-center gap-2.5 sm:gap-4 w-full min-h-0`}
        >
          {/* Left Problem Box (Neutral Wash) */}
          <div className={`flex-1 rounded-lg bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-700/80 ${
            isPresentation
              ? "py-3 sm:py-4 px-4 sm:px-5 text-xs sm:text-sm lg:text-[15px]"
              : "py-2 sm:py-2.5 px-3.5 text-[11px] sm:text-xs"
          } text-neutral-800 dark:text-neutral-200 font-medium leading-relaxed line-clamp-2 overflow-hidden shadow-2xs`}>
            {row.leftLead && <strong className="font-bold text-neutral-950 dark:text-white mr-1.5">{row.leftLead}</strong>}
            {row.left}
          </div>

          {/* Directional Arrow */}
          <div className={`shrink-0 flex items-center justify-center font-bold ${
            isPresentation ? "text-xl sm:text-2xl lg:text-3xl" : "text-base sm:text-xl"
          }`} style={{ color: primaryColor }}>
            →
          </div>

          {/* Right Fix Box (Solid Primary Brand) */}
          <div
            className={`flex-1 rounded-lg ${
              isPresentation
                ? "py-3 sm:py-4 px-4 sm:px-5 text-xs sm:text-sm lg:text-[15px]"
                : "py-2 sm:py-2.5 px-3.5 text-[11px] sm:text-xs"
            } font-semibold leading-relaxed text-white line-clamp-2 overflow-hidden shadow-2xs`}
            style={{ backgroundColor: primaryColor }}
          >
            {row.rightLead && <strong className="font-bold text-white mr-1.5">{row.rightLead}</strong>}
            {row.right}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ───────────────────────────────────────────────────
 * 17. Horizontal Stack Cards (Alternating Palette Roles)
 * ─────────────────────────────────────────────────── */
export interface StackCardItem {
  title: string;
  tag?: string;
  description: string;
}

export function HorizontalStackCards({
  cards,
  primaryColor = "#005AAB",
  secondaryColor = "#FFDD3C",
  isPresentation = false,
}: {
  cards: StackCardItem[];
  primaryColor?: string;
  secondaryColor?: string;
  isPresentation?: boolean;
}) {
  if (!cards || cards.length === 0) return null;

  return (
    <div className="w-full flex flex-col gap-1.5 sm:gap-2 my-auto max-h-full overflow-hidden">
      {cards.slice(0, 3).map((card, i) => {
        // Alternating colors: even = secondary (Golden Yellow), odd = primary (Deep Blue)
        const isPrimary = i % 2 === 1;
        const cardBg = isPrimary ? primaryColor : secondaryColor;
        const textColor = isPrimary ? "#FFFFFF" : "#272525";
        const tagColor = isPrimary ? secondaryColor : primaryColor;

        return (
          <div
            key={i}
            className={`w-full rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-3 overflow-hidden ${
              isPresentation ? "py-3 sm:py-3.5 px-4 sm:px-5" : "py-1.5 sm:py-2 px-3 sm:px-3.5"
            }`}
            style={{ backgroundColor: cardBg, color: textColor }}
          >
            {/* Left Title & Tag */}
            <div className="sm:w-[32%] shrink-0 flex flex-col justify-center gap-0.5">
              <h3 className={`font-extrabold leading-tight line-clamp-1 ${isPresentation ? "text-base sm:text-lg" : "text-xs sm:text-[13px]"}`}>
                {card.title}
              </h3>
              {card.tag && (
                <span
                  className="text-[8.5px] sm:text-[9.5px] font-bold uppercase tracking-wider leading-none"
                  style={{ color: tagColor }}
                >
                  {card.tag}
                </span>
              )}
            </div>

            {/* Right Description with safe line-clamp */}
            <div className="flex-1 min-w-0">
              <p className={`leading-snug font-normal opacity-95 line-clamp-2 ${isPresentation ? "text-xs sm:text-sm" : "text-[10.5px] sm:text-[11.5px]"}`}>
                {card.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ───────────────────────────────────────────────────
 * 18. Connected Rail Stepper (Continuous Track Line)
 * ─────────────────────────────────────────────────── */
export interface RailStepItem {
  stepNumber?: number | string;
  title: string;
  description?: string;
}

export function ConnectedRailStepper({
  steps,
  primaryColor = "#005AAB",
  secondaryColor = "#FFDD3C",
  isPresentation = false,
}: {
  steps: RailStepItem[];
  primaryColor?: string;
  secondaryColor?: string;
  isPresentation?: boolean;
}) {
  if (!steps || steps.length === 0) return null;
  const count = steps.length;

  return (
    <div className="w-full flex items-start justify-between relative my-auto gap-1 sm:gap-2">
      {steps.map((step, i) => {
        const isPrimary = i % 2 === 1;
        const circleBg = isPrimary ? primaryColor : secondaryColor;
        const circleText = isPrimary ? secondaryColor : primaryColor;
        const num = step.stepNumber || i + 1;

        return (
          <div key={i} className="flex-1 flex flex-col items-center text-center relative z-10 min-w-0">
            {/* Continuous Rail Line Behind */}
            <div className="w-full flex items-center justify-center relative mb-3">
              {/* Left track connector */}
              <div
                className={`flex-1 h-1.5 ${i === 0 ? "opacity-0" : ""}`}
                style={{ backgroundColor: primaryColor }}
              />
              {/* Center Circle Node */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
                className={`shrink-0 rounded-full flex items-center justify-center font-black ${
                  isPresentation ? "w-14 h-14 sm:w-16 sm:h-16 text-xl sm:text-2xl" : "w-9 h-9 sm:w-11 sm:h-11 text-sm sm:text-base"
                }`}
                style={{ backgroundColor: circleBg, color: circleText }}
              >
                {num}
              </motion.div>
              {/* Right track connector */}
              <div
                className={`flex-1 h-1.5 ${i === count - 1 ? "opacity-0" : ""}`}
                style={{ backgroundColor: primaryColor }}
              />
            </div>

            {/* Title & Description */}
            <h4 className={`font-bold text-neutral-900 dark:text-white leading-snug px-1 ${
              isPresentation ? "text-base sm:text-lg" : "text-xs sm:text-sm"
            }`}>
              {step.title}
            </h4>
            {step.description && (
              <p className={`text-neutral-600 dark:text-neutral-400 mt-1 leading-snug px-1 line-clamp-3 ${
                isPresentation ? "text-xs sm:text-sm" : "text-[10px] sm:text-xs"
              }`}>
                {step.description}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ───────────────────────────────────────────────────
 * 19. Ascending Intensity Columns (Progressive Height Levels)
 * ─────────────────────────────────────────────────── */
export interface AscendingColumnItem {
  levelNumber?: string | number;
  title: string;
  description?: string;
  tag?: string;
}

export function AscendingColumns({
  levels,
  primaryColor = "#005AAB",
  secondaryColor = "#FFDD3C",
  isPresentation = false,
}: {
  levels: AscendingColumnItem[];
  primaryColor?: string;
  secondaryColor?: string;
  isPresentation?: boolean;
}) {
  if (!levels || levels.length === 0) return null;
  const count = levels.length;

  return (
    <div className="w-full flex items-end justify-between gap-3 sm:gap-4 my-auto h-full max-h-[360px] sm:max-h-[460px]">
      {levels.map((lvl, i) => {
        // Height scales progressively from 55% to 100%
        const minHeightPct = 50;
        const heightPct = minHeightPct + ((100 - minHeightPct) / (count - 1 || 1)) * i;
        
        // Color transition: Level 1 = secondary, middle = softer shades, highest = deep primary
        const isHighest = i === count - 1;
        const isLowest = i === 0;
        const colBg = isLowest ? secondaryColor : isHighest ? primaryColor : `${primaryColor}${Math.round((0.4 + i * 0.2) * 255).toString(16)}`;
        const textColor = isHighest ? "#FFFFFF" : "#272525";

        return (
          <div
            key={i}
            className={`flex-1 rounded-md flex flex-col justify-start p-3.5 sm:p-5 overflow-hidden ${
              isPresentation ? "gap-2" : "gap-1"
            }`}
            style={{ backgroundColor: colBg, color: textColor, height: `${heightPct}%` }}
          >
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider opacity-85">
              {lvl.tag || `LEVEL ${i + 1}`}
            </span>
            <h3 className={`font-extrabold leading-tight ${isPresentation ? "text-xl sm:text-2xl" : "text-sm sm:text-base"}`}>
              {lvl.title}
            </h3>
            {lvl.description && (
              <p className={`leading-snug opacity-90 mt-1 line-clamp-4 ${isPresentation ? "text-xs sm:text-sm" : "text-[10px] sm:text-xs"}`}>
                {lvl.description}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ───────────────────────────────────────────────────
 * 20. Executive 2-Column Checklist
 * ─────────────────────────────────────────────────── */
export function ExecutiveChecklist({
  items,
  badgeLabel = "CHECKLIST",
  primaryColor = "#005AAB",
  isPresentation = false,
}: {
  items: string[];
  badgeLabel?: string;
  primaryColor?: string;
  isPresentation?: boolean;
}) {
  if (!items || items.length === 0) return null;

  // Split items into 2 balanced columns
  const half = Math.ceil(items.length / 2);
  const col1 = items.slice(0, half);
  const col2 = items.slice(half);

  return (
    <div className="w-full flex flex-col my-auto gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 w-full">
        {/* Column 1 */}
        <div className="flex flex-col gap-2.5 sm:gap-3.5">
          {col1.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              className="flex items-center gap-3 pb-2.5 sm:pb-3 border-b border-blue-100 dark:border-neutral-800"
            >
              <div
                className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg shrink-0 flex items-center justify-center border-2"
                style={{ borderColor: primaryColor }}
              >
                <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" style={{ color: primaryColor }} />
              </div>
              <span className={`font-medium text-neutral-800 dark:text-neutral-200 leading-snug ${
                isPresentation ? "text-base sm:text-lg" : "text-xs sm:text-sm"
              }`}>
                {item}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Column 2 */}
        <div className="flex flex-col gap-2.5 sm:gap-3.5">
          {col2.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: (half + i) * 0.06 }}
              className="flex items-center gap-3 pb-2.5 sm:pb-3 border-b border-blue-100 dark:border-neutral-800"
            >
              <div
                className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg shrink-0 flex items-center justify-center border-2"
                style={{ borderColor: primaryColor }}
              >
                <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" style={{ color: primaryColor }} />
              </div>
              <span className={`font-medium text-neutral-800 dark:text-neutral-200 leading-snug ${
                isPresentation ? "text-base sm:text-lg" : "text-xs sm:text-sm"
              }`}>
                {item}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────
 * 21. Section Divider Banner (Full-Bleed Stage Header)
 * ─────────────────────────────────────────────────── */
export function SectionDivider({
  partLabel = "BAGIAN 1",
  title,
  subtitle,
  primaryColor = "#005AAB",
  accentColor = "#FFDD3C",
  isPresentation = false,
  transparentBg = false,
}: {
  partLabel?: string;
  title: string;
  subtitle?: string;
  primaryColor?: string;
  accentColor?: string;
  isPresentation?: boolean;
  transparentBg?: boolean;
}) {
  return (
    <div
      className="w-full h-full flex flex-col justify-center items-start p-[8%] sm:p-[10%] relative overflow-hidden"
      style={{
        background: transparentBg ? "transparent" : `linear-gradient(150deg, ${primaryColor} 0%, #007AE8 100%)`,
        color: "#FFFFFF",
      }}
    >
      {/* Yellow bottom accent bar (only if not transparentBg, since template already includes it) */}
      {!transparentBg && (
        <div
          className="absolute left-0 bottom-0 right-0 h-3"
          style={{ backgroundColor: accentColor }}
        />
      )}

      {/* Short Yellow Accent Bar Top */}
      <div
        className="w-24 sm:w-32 h-2.5 sm:h-3 rounded-full mb-3"
        style={{ backgroundColor: accentColor }}
      />

      {/* Part Label */}
      {partLabel && (
        <span
          className="text-xs sm:text-sm font-extrabold uppercase tracking-widest mb-3"
          style={{ color: accentColor }}
        >
          {partLabel}
        </span>
      )}

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`font-black text-white leading-tight tracking-tight ${
          isPresentation ? "text-4xl sm:text-6xl" : "text-2xl sm:text-4xl"
        }`}
      >
        {title}
      </motion.h1>

      {/* Subtitle */}
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className={`text-white/90 font-normal mt-3 max-w-3xl leading-relaxed ${
            isPresentation ? "text-lg sm:text-2xl" : "text-xs sm:text-base"
          }`}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}

/* ───────────────────────────────────────────────────
 * 22. Closing Action Slide (Action Plan + Contact Strip)
 * ─────────────────────────────────────────────────── */
export function ClosingAction({
  tag = "LANGKAH BERIKUTNYA",
  title,
  subtitle,
  actions,
  contactText = "Insiden atau pertanyaan: [kontak tim keamanan]",
  primaryColor = "#005AAB",
  accentColor = "#FFDD3C",
  isPresentation = false,
  transparentBg = false,
}: {
  tag?: string;
  title: string;
  subtitle?: string;
  actions: string[];
  contactText?: string;
  primaryColor?: string;
  accentColor?: string;
  isPresentation?: boolean;
  transparentBg?: boolean;
}) {
  return (
    <div className={`w-full h-full flex flex-col justify-between relative overflow-hidden ${transparentBg ? "bg-transparent" : "bg-white dark:bg-[#111114]"}`}>
      {/* Top 75% Primary Gradient Area */}
      <div
        className="w-full flex-1 p-[6%] sm:p-[7%] flex flex-col justify-center items-start relative"
        style={{
          background: transparentBg ? "transparent" : `linear-gradient(150deg, ${primaryColor} 0%, #007AE8 100%)`,
          color: "#FFFFFF",
        }}
      >
        {/* Accent Tag */}
        {tag && (
          <span
            className="px-4 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2.5"
            style={{ backgroundColor: accentColor, color: "#272525" }}
          >
            {tag}
          </span>
        )}

        <h1 className={`font-black text-white leading-tight tracking-tight ${
          isPresentation ? "text-3xl sm:text-5xl" : "text-xl sm:text-3xl"
        }`}>
          {title}
        </h1>

        {subtitle && (
          <p className={`text-white/90 font-normal mt-1.5 mb-4 ${
            isPresentation ? "text-base sm:text-xl" : "text-xs sm:text-sm"
          }`}>
            {subtitle}
          </p>
        )}

        {/* Action List Items (Ordered) */}
        {actions && actions.length > 0 && (
          <div className="flex flex-col gap-2 sm:gap-2.5 w-full max-w-3xl">
            {actions.map((act, i) => (
              <div key={i} className="flex items-start gap-2.5 text-white/95 leading-snug">
                <span className="font-bold opacity-80">{i + 1}.</span>
                <span className={`font-medium ${isPresentation ? "text-base sm:text-lg" : "text-xs sm:text-sm"}`}>
                  {act}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Dividing Yellow Line (only if not transparentBg, since closing-deck.png already has it) */}
        {!transparentBg && (
          <div
            className="absolute left-0 bottom-0 right-0 h-2"
            style={{ backgroundColor: accentColor }}
          />
        )}
      </div>

      {/* Bottom 25% Clean Contact / Reminder Band */}
      {contactText && (
        <div className={`h-14 sm:h-16 px-[6%] sm:px-[7%] flex items-center text-xs sm:text-sm font-semibold ${transparentBg ? "bg-transparent text-neutral-800" : "text-neutral-600 dark:text-neutral-400"}`}>
          {contactText}
        </div>
      )}
    </div>
  );
}

/* ───────────────────────────────────────────────────
 * 23. Formula Hero with Split Factors & Massive Stat Box (Slide 2 Pattern)
 * ─────────────────────────────────────────────────── */
export interface FormulaHeroProps {
  formulaLabel?: string;
  formula: string;
  formulaSubtext?: string;
  factors?: Array<{
    title: string;
    description: string;
  }>;
  statBox?: {
    value: string;
    description: string;
    source?: string;
  };
  primaryColor?: string;
  accentColor?: string;
  isPresentation?: boolean;
}

export function FormulaHeroSplit({
  formulaLabel = "THE FORMULA",
  formula,
  formulaSubtext,
  factors = [],
  statBox,
  primaryColor = "#005AAB",
  accentColor = "#FFDD3C",
  isPresentation = false,
}: FormulaHeroProps) {
  return (
    <div className="w-full flex-1 flex flex-col justify-between my-auto gap-3 sm:gap-4 overflow-hidden">
      {/* Top Hero Formula Banner */}
      <div
        className="w-full rounded-lg p-3.5 sm:p-5 shadow-xs flex flex-col justify-center"
        style={{ backgroundColor: primaryColor }}
      >
        <span
          className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest mb-1 block"
          style={{ color: accentColor }}
        >
          {formulaLabel}
        </span>
        <h3 className={`text-lg sm:text-2xl lg:text-[28px] font-black text-white leading-tight tracking-tight`}>
          {formula}
        </h3>
        {formulaSubtext && (
          <p className="text-white/85 text-xs sm:text-[13px] mt-1 font-medium leading-relaxed">
            {formulaSubtext}
          </p>
        )}
      </div>

      {/* Bottom Split Row: 3 Factor Columns Left + 1 Big Accent Stat Card Right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-stretch flex-1">
        {/* Left Factor Columns (8 of 12 cols if statBox exists, else 12) */}
        <div className={`${statBox ? "md:col-span-8" : "md:col-span-12"} grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 items-stretch`}>
          {factors.slice(0, 3).map((f, idx) => (
            <div
              key={idx}
              className="p-3 sm:p-3.5 rounded-lg bg-neutral-50/80 dark:bg-neutral-900/50 border border-neutral-200/80 dark:border-neutral-800 flex flex-col justify-start"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                  style={{
                    backgroundColor: idx % 2 === 0 ? primaryColor : accentColor,
                    color: idx % 2 === 0 ? "#FFFFFF" : "#111111",
                  }}
                >
                  {idx + 1}
                </span>
                <span className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100 leading-tight">
                  {f.title}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-neutral-600 dark:text-neutral-400 font-normal leading-relaxed line-clamp-3">
                {f.description}
              </p>
            </div>
          ))}
        </div>

        {/* Right Big Accent Stat Box (4 of 12 cols) */}
        {statBox && (
          <div
            className="md:col-span-4 rounded-lg p-4 sm:p-5 flex flex-col justify-center items-center text-center shadow-xs border border-[#E5C310]"
            style={{ backgroundColor: accentColor, color: "#111111" }}
          >
            <span className={`${isPresentation ? "text-4xl sm:text-6xl" : "text-3xl sm:text-5xl"} font-black tracking-tight leading-none mb-1.5`}>
              {statBox.value}
            </span>
            <p className="text-xs sm:text-[13px] font-semibold leading-snug max-w-[220px]">
              {statBox.description}
            </p>
            {statBox.source && (
              <span className="text-[9.5px] sm:text-[10px] font-medium opacity-75 italic mt-2">
                {statBox.source}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────
 * 24. Tree Comparison Cards with Top Callout & Bottom Quote Strip (Slide 4 Pattern)
 * ─────────────────────────────────────────────────── */
export interface TreeCardItem {
  title: string;
  description: string;
  rootNode: string;
  childNodes: [string, string];
}

export interface TreeComparisonProps {
  topCallout?: {
    stat?: string;
    label?: string;
    note?: string;
  };
  cards: TreeCardItem[];
  bottomTakeaway?: string;
  primaryColor?: string;
  accentColor?: string;
  isPresentation?: boolean;
}

export function TreeComparisonCards({
  topCallout,
  cards = [],
  bottomTakeaway,
  primaryColor = "#005AAB",
  accentColor = "#FFDD3C",
  isPresentation = false,
}: TreeComparisonProps) {
  return (
    <div className="w-full flex-1 flex flex-col justify-between my-auto gap-3 sm:gap-4 overflow-hidden">
      {/* Top Compact Stat Callout Banner */}
      {topCallout && (topCallout.stat || topCallout.note) && (
        <div className="flex items-center gap-3 sm:gap-4">
          {topCallout.stat && (
            <div
              className="px-3.5 py-1.5 rounded-lg flex items-center gap-2 shadow-2xs shrink-0"
              style={{ backgroundColor: accentColor, color: "#111111" }}
            >
              <span className="text-sm sm:text-base font-black">{topCallout.stat}</span>
              {topCallout.label && (
                <span className="text-[10px] sm:text-[11px] font-semibold leading-tight">{topCallout.label}</span>
              )}
            </div>
          )}
          {topCallout.note && (
            <p className="text-xs sm:text-sm font-semibold text-neutral-800 dark:text-neutral-200 leading-snug">
              {topCallout.note}
            </p>
          )}
        </div>
      )}

      {/* 3 Diagram Cards with Visual Tree / Node Branches inside */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 items-stretch flex-1">
        {cards.slice(0, 3).map((c, i) => (
          <div
            key={i}
            className="rounded-lg border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#161616] p-3.5 sm:p-4 flex flex-col justify-between shadow-2xs hover:border-neutral-400 dark:hover:border-neutral-700 transition-colors"
          >
            <div>
              <h5 className="text-xs sm:text-sm font-bold text-[#005AAB] dark:text-[#60A5FA] mb-3">
                {c.title}
              </h5>

              {/* Mini Flow Tree Diagram inside Card */}
              <div className="flex flex-col items-center my-2 select-none">
                {/* Root Node */}
                <div
                  className="px-3 py-1 rounded text-[10.5px] sm:text-xs font-bold text-white shadow-2xs text-center"
                  style={{ backgroundColor: primaryColor }}
                >
                  {c.rootNode || "Core Driver"}
                </div>

                {/* Branching SVG Connector Line */}
                <svg className="w-24 h-4 my-0.5 text-neutral-400" viewBox="0 0 100 20" fill="none">
                  <path d="M 50 0 L 50 10 L 20 10 L 20 20 M 50 10 L 80 10 L 80 20" stroke="currentColor" strokeWidth="1.5" />
                </svg>

                {/* 2 Child Nodes */}
                <div className="flex items-center justify-between w-full gap-2">
                  <div
                    className="flex-1 py-1 px-1.5 rounded text-[10px] font-bold text-center truncate shadow-2xs"
                    style={{
                      backgroundColor: i % 2 === 0 ? accentColor : "#E2E8F0",
                      color: "#111111",
                    }}
                  >
                    {c.childNodes?.[0] || "Branch A"}
                  </div>
                  <div
                    className="flex-1 py-1 px-1.5 rounded text-[10px] font-bold text-center truncate shadow-2xs"
                    style={{
                      backgroundColor: i % 2 === 0 ? accentColor : "#E2E8F0",
                      color: "#111111",
                    }}
                  >
                    {c.childNodes?.[1] || "Branch B"}
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[10.5px] sm:text-xs text-neutral-600 dark:text-neutral-400 font-normal leading-relaxed mt-2.5 pt-2 border-t border-neutral-100 dark:border-neutral-800 line-clamp-3">
              {c.description}
            </p>
          </div>
        ))}
      </div>

      {/* Bottom Takeaway Quote Strip with Vertical Yellow Bar Accent */}
      {bottomTakeaway && (
        <div className="flex items-stretch gap-2.5 mt-1">
          <div className="w-1.5 rounded-full shrink-0" style={{ backgroundColor: accentColor }} />
          <p className="text-[11px] sm:text-xs text-neutral-700 dark:text-neutral-300 font-medium leading-relaxed">
            {bottomTakeaway}
          </p>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────────────────────────────────
 * 25. Split Case Study with Data Tiles & 3-Line Exercise (Slide 5 Pattern)
 * ─────────────────────────────────────────────────── */
export interface CaseStudyExerciseProps {
  situationTitle?: string;
  situationText: string;
  dataMetrics?: Array<{
    value: string;
    label: string;
  }>;
  twistBox?: string;
  exerciseTitle?: string;
  exerciseLines?: string[];
  primaryColor?: string;
  accentColor?: string;
  isPresentation?: boolean;
}

export function CaseStudyExercise({
  situationTitle = "SITUATION",
  situationText,
  dataMetrics = [],
  twistBox,
  exerciseTitle = "WHAT TO WRITE · 3 LINES",
  exerciseLines = [],
  primaryColor = "#005AAB",
  accentColor = "#FFDD3C",
  isPresentation = false,
}: CaseStudyExerciseProps) {
  return (
    <div className="w-full flex-1 grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 my-auto items-stretch overflow-hidden">
      {/* Left Column (7 of 12 cols): Scenario + Data Tiles + Twist Warning */}
      <div className="md:col-span-7 flex flex-col justify-between gap-2.5">
        {/* Situation Block */}
        <div className="p-3 sm:p-3.5 rounded-lg bg-neutral-100/80 dark:bg-neutral-850/70 border border-neutral-200/70 dark:border-neutral-800">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-500 block mb-1">
            {situationTitle}
          </span>
          <p className="text-[11.5px] sm:text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed font-normal">
            {situationText}
          </p>
        </div>

        {/* Data Metric Tiles */}
        {dataMetrics && dataMetrics.length > 0 && (
          <div className={`grid grid-cols-${Math.min(dataMetrics.length, 3)} gap-2`}>
            {dataMetrics.slice(0, 3).map((m, mIdx) => (
              <div
                key={mIdx}
                className="p-2 sm:p-2.5 rounded-lg bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-900/40 flex flex-col justify-center"
              >
                <span className="text-base sm:text-lg font-black text-[#005AAB] dark:text-[#60A5FA] leading-tight">
                  {m.value}
                </span>
                <span className="text-[10px] text-neutral-600 dark:text-neutral-400 font-medium leading-tight mt-0.5">
                  {m.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Yellow Warning Twist Box */}
        {twistBox && (
          <div
            className="p-2.5 sm:p-3 rounded-lg flex items-center gap-2.5 text-xs font-semibold shadow-2xs border border-[#E5C310]"
            style={{ backgroundColor: accentColor, color: "#111111" }}
          >
            <AlertTriangle className="w-4 h-4 shrink-0 text-neutral-950" />
            <div className="leading-snug">
              <strong className="font-extrabold mr-1">Twist:</strong>
              <span>{twistBox}</span>
            </div>
          </div>
        )}
      </div>

      {/* Right Column (5 of 12 cols): 3-Line Exercise Sheet with Dashed Dividers */}
      <div className="md:col-span-5 rounded-lg border-2 border-[#005AAB] p-3.5 sm:p-4 bg-white dark:bg-[#161616] shadow-2xs flex flex-col justify-between">
        <span className="text-[10.5px] sm:text-xs font-bold uppercase tracking-wider text-[#005AAB] dark:text-[#60A5FA] block pb-2 border-b border-neutral-100 dark:border-neutral-800">
          {exerciseTitle}
        </span>

        <div className="space-y-2.5 sm:space-y-3.5 my-auto py-2 divide-y divide-dashed divide-neutral-200 dark:divide-neutral-800">
          {(exerciseLines.length > 0 ? exerciseLines : [
            "Which AIDM mode fits the monthly replacement queue? Why?",
            "Which part of the decision must stay Override, and why?",
            "One escalation rule the AI must follow.",
          ]).slice(0, 3).map((line, idx) => (
            <div key={idx} className={`flex items-start gap-2.5 ${idx > 0 ? "pt-2.5 sm:pt-3.5" : ""}`}>
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10.5px] font-bold text-neutral-950 shrink-0 mt-0.5"
                style={{ backgroundColor: accentColor }}
              >
                {idx + 1}
              </span>
              <p className="text-[11px] sm:text-xs font-medium text-neutral-800 dark:text-neutral-200 leading-snug">
                {line}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────
 * 26. Strategic Pyramid Hierarchy (McKinsey 3-Tier Apex)
 * ─────────────────────────────────────────────────── */
export interface PyramidTier {
  level: string; // e.g. "Tier 3 · Apex", "Tier 2 · Core Pillars", "Tier 1 · Foundation"
  title: string;
  description?: string;
  items?: string[];
  tag?: string;
}

export function PyramidHierarchy({
  tiers = [],
  primaryColor = "#005AAB",
  accentColor = "#FFDD3C",
  isPresentation = false,
}: {
  tiers?: PyramidTier[];
  primaryColor?: string;
  accentColor?: string;
  isPresentation?: boolean;
}) {
  const items: PyramidTier[] = tiers.length > 0 ? tiers : [
    {
      level: "Apex · Strategic Vision",
      title: "Sustainable Market Leadership & 35% Operating Margin",
      description: "Unified corporate North Star driving all capital allocation and executive accountability",
      tag: "GOAL",
    },
    {
      level: "Pillars · Core Strategic Thrusts",
      title: "Autonomous Decision Pipelines & Real-Time Customer 360",
      description: "Compress decision latency from 14 days to 4 hours across business units",
      items: ["Continuous Risk Scoring", "Self-Optimizing Logistics", "Algorithmic Pricing"],
      tag: "STRATEGY",
    },
    {
      level: "Foundation · Enabling Capabilities",
      title: "Enterprise Data Fabric, Strict Governance & Cross-Functional Squads",
      description: "Single source of truth with 99.9% uptime SLA and zero-trust security architecture",
      items: ["Zero-Trust Infrastructure", "Modern Data Lake", "Cross-Functional Pods"],
      tag: "FOUNDATION",
    },
  ];

  return (
    <div className="w-full flex-1 flex flex-col justify-between my-auto gap-3 overflow-hidden py-1">
      {/* Tier 3: Apex Peak */}
      <div className="flex justify-center w-full">
        <div
          className="w-full max-w-xl rounded-lg p-3 sm:p-4 text-center shadow-xs border border-[#005AAB]"
          style={{ backgroundColor: primaryColor, color: "#FFFFFF" }}
        >
          <span
            className="text-[9.5px] sm:text-[10px] font-extrabold uppercase tracking-widest block mb-0.5"
            style={{ color: accentColor }}
          >
            {items[0]?.level || "TIER 3 · APEX VISION"}
          </span>
          <h4 className="text-sm sm:text-base font-black leading-tight">
            {items[0]?.title}
          </h4>
          {items[0]?.description && (
            <p className="text-[11px] sm:text-xs text-white/85 font-normal mt-1 leading-snug">
              {items[0]?.description}
            </p>
          )}
        </div>
      </div>

      {/* Tier 2: Mid-Level Strategic Thrusts */}
      <div className="flex justify-center w-full">
        <div
          className="w-full max-w-3xl rounded-lg p-3 sm:p-3.5 shadow-xs border border-[#E5C310] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
          style={{ backgroundColor: accentColor, color: "#111111" }}
        >
          <div className="flex-1">
            <span className="text-[9.5px] sm:text-[10px] font-extrabold uppercase tracking-wider opacity-80 block mb-0.5">
              {items[1]?.level || "TIER 2 · STRATEGIC PILLARS"}
            </span>
            <h5 className="text-xs sm:text-sm font-bold leading-tight">
              {items[1]?.title}
            </h5>
            {items[1]?.description && (
              <p className="text-[10.5px] sm:text-[11.5px] font-normal opacity-90 mt-0.5 leading-snug">
                {items[1]?.description}
              </p>
            )}
          </div>
          {items[1]?.items && items[1].items.length > 0 && (
            <div className="flex flex-wrap gap-1.5 shrink-0 sm:max-w-[280px]">
              {items[1].items.map((it, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-neutral-900 text-white text-[9.5px] font-bold"
                >
                  {it}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tier 1: Foundation Base */}
      <div className="flex justify-center w-full">
        <div className="w-full rounded-lg p-3 sm:p-3.5 bg-neutral-50/90 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shadow-2xs">
          <div className="flex-1">
            <span className="text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-0.5">
              {items[2]?.level || "TIER 1 · FOUNDATION & ENABLERS"}
            </span>
            <h5 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100 leading-tight">
              {items[2]?.title}
            </h5>
            {items[2]?.description && (
              <p className="text-[10.5px] sm:text-[11.5px] text-neutral-600 dark:text-neutral-400 font-normal mt-0.5 leading-snug">
                {items[2]?.description}
              </p>
            )}
          </div>
          {items[2]?.items && items[2].items.length > 0 && (
            <div className="flex flex-wrap gap-1.5 shrink-0 sm:max-w-[340px]">
              {items[2].items.map((it, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-neutral-200/80 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-[9.5px] font-semibold border border-neutral-300/60 dark:border-neutral-700"
                >
                  {it}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────
 * 27. Transformation Delta Bridge (As-Is → Catalyst → To-Be)
 * ─────────────────────────────────────────────────── */
export interface TransformationProps {
  asIs: {
    title: string;
    points: string[];
    tag?: string;
  };
  catalyst: {
    title: string;
    description: string;
    metricChange?: string;
  };
  toBe: {
    title: string;
    points: string[];
    tag?: string;
  };
  primaryColor?: string;
  accentColor?: string;
  isPresentation?: boolean;
}

export function TransformationBridge({
  asIs,
  catalyst,
  toBe,
  primaryColor = "#005AAB",
  accentColor = "#FFDD3C",
  isPresentation = false,
}: TransformationProps) {
  const currentAsIs = asIs || {
    title: "Legacy Operating Model",
    tag: "CURRENT FRICTION (AS-IS)",
    points: [
      "Fragmented data silos across 5 business units",
      "Manual 10-day approval cycles per transaction",
      "Reactive incident response with high error margin",
    ],
  };

  const currentCatalyst = catalyst || {
    title: "AI & Decision Fabric Engine",
    description: "Centralized intelligence layer standardizing policy enforcement & automated verification",
    metricChange: "70% Faster Cycle",
  };

  const currentToBe = toBe || {
    title: "Autonomous Target State",
    tag: "TARGET OUTCOME (TO-BE)",
    points: [
      "Unified telemetry and real-time executive visibility",
      "Sub-hour autonomous execution with human-in-the-loop",
      "Proactive risk mitigation and 99.9% compliance audit",
    ],
  };

  return (
    <div className="w-full flex-1 grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 my-auto items-stretch overflow-hidden py-1">
      {/* Left Panel: As-Is State (4 of 12 cols) */}
      <div className="md:col-span-4 rounded-lg bg-neutral-50/90 dark:bg-neutral-900/50 border border-neutral-200/80 dark:border-neutral-800 p-3.5 sm:p-4 flex flex-col justify-between shadow-2xs">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 block mb-1">
            {currentAsIs.tag || "CURRENT (AS-IS)"}
          </span>
          <h4 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-2.5">
            {currentAsIs.title}
          </h4>
          <ul className="space-y-1.5">
            {currentAsIs.points.map((pt, i) => (
              <li key={i} className="text-[11px] sm:text-xs text-neutral-600 dark:text-neutral-400 flex items-start gap-1.5 leading-snug">
                <span className="text-rose-500 font-bold shrink-0">✕</span>
                <span>{pt}</span>
              </li>
            ))}
          </ul>
        </div>
        <span className="text-[9.5px] font-medium text-neutral-400 italic mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
          Status Quo Baseline
        </span>
      </div>

      {/* Center Panel: Catalyst / Transformation Engine (4 of 12 cols) */}
      <div
        className="md:col-span-4 rounded-lg p-3.5 sm:p-4 flex flex-col justify-between text-center shadow-xs border border-[#005AAB] relative"
        style={{ backgroundColor: primaryColor, color: "#FFFFFF" }}
      >
        <span
          className="text-[9.5px] sm:text-[10px] font-extrabold uppercase tracking-widest block"
          style={{ color: accentColor }}
        >
          TRANSFORMATION CATALYST
        </span>
        <div className="my-auto py-2">
          <h4 className="text-sm sm:text-base font-black leading-tight mb-1.5">
            {currentCatalyst.title}
          </h4>
          <p className="text-[11px] sm:text-xs text-white/85 leading-relaxed font-medium">
            {currentCatalyst.description}
          </p>
        </div>
        {currentCatalyst.metricChange && (
          <div
            className="rounded-md py-1.5 px-3 mx-auto text-xs font-black tracking-wide"
            style={{ backgroundColor: accentColor, color: "#111111" }}
          >
            {currentCatalyst.metricChange}
          </div>
        )}
      </div>

      {/* Right Panel: To-Be State (4 of 12 cols) */}
      <div className="md:col-span-4 rounded-lg bg-blue-50/40 dark:bg-blue-950/20 border-2 border-[#005AAB] p-3.5 sm:p-4 flex flex-col justify-between shadow-2xs">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#005AAB] dark:text-[#60A5FA] block mb-1">
            {currentToBe.tag || "TARGET OUTCOME (TO-BE)"}
          </span>
          <h4 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-2.5">
            {currentToBe.title}
          </h4>
          <ul className="space-y-1.5">
            {currentToBe.points.map((pt, i) => (
              <li key={i} className="text-[11px] sm:text-xs text-neutral-700 dark:text-neutral-300 flex items-start gap-1.5 leading-snug">
                <span className="text-[#005AAB] dark:text-[#60A5FA] font-bold shrink-0">✓</span>
                <span>{pt}</span>
              </li>
            ))}
          </ul>
        </div>
        <span className="text-[9.5px] font-bold text-[#005AAB] dark:text-[#60A5FA] mt-3 pt-2 border-t border-blue-100 dark:border-blue-900/40">
          Target State Benchmark
        </span>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────
 * 28. Radial Hub & Ecosystem (Core Mandate + 4 Domain Orbit Cards)
 * ─────────────────────────────────────────────────── */
export interface HubSatellite {
  title: string;
  description: string;
  metric?: string;
  tag?: string;
}

export function RadialHubEcosystem({
  coreHubTitle = "Core Governance & Control",
  coreHubSub = "Single Orchestration Spine",
  satellites = [],
  primaryColor = "#005AAB",
  accentColor = "#FFDD3C",
  isPresentation = false,
}: {
  coreHubTitle?: string;
  coreHubSub?: string;
  satellites?: HubSatellite[];
  primaryColor?: string;
  accentColor?: string;
  isPresentation?: boolean;
}) {
  const cards: HubSatellite[] = satellites.length > 0 ? satellites : [
    { title: "Legal & Regulatory", description: "Continuous compliance audit across global standards", metric: "100% Audit", tag: "COMPLIANCE" },
    { title: "Risk & Resilience", description: "Automated threat detection and disaster failover", metric: "99.9% Uptime", tag: "SECURITY" },
    { title: "Capital & Revenue", description: "Predictive ROI modeling for every resource shift", metric: "+24% Margin", tag: "FINANCE" },
    { title: "Talent & Culture", description: "Empowered squads operating with clear algorithmic rails", metric: "4x Velocity", tag: "OPERATIONS" },
  ];

  return (
    <div className="w-full flex-1 flex flex-col justify-center my-auto gap-3 overflow-hidden py-1">
      {/* 2 Top Satellites */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {cards.slice(0, 2).map((sat, i) => (
          <div
            key={i}
            className="rounded-lg p-3 sm:p-3.5 bg-neutral-50/80 dark:bg-neutral-900/50 border border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between gap-3 shadow-2xs"
          >
            <div>
              {sat.tag && (
                <span className="text-[9.5px] font-bold uppercase tracking-wider text-[#005AAB] dark:text-[#60A5FA] block mb-0.5">
                  {sat.tag}
                </span>
              )}
              <h5 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100 leading-tight">
                {sat.title}
              </h5>
              <p className="text-[10.5px] sm:text-[11.5px] text-neutral-600 dark:text-neutral-400 leading-snug mt-0.5">
                {sat.description}
              </p>
            </div>
            {sat.metric && (
              <span
                className="px-2 py-1 rounded-md text-[10.5px] font-black shrink-0"
                style={{ backgroundColor: accentColor, color: "#111111" }}
              >
                {sat.metric}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Central Connecting Core Hub */}
      <div className="flex justify-center w-full">
        <div
          className="w-full max-w-lg rounded-full py-2.5 px-6 shadow-xs border-2 border-[#005AAB] flex items-center justify-between gap-4"
          style={{ backgroundColor: primaryColor, color: "#FFFFFF" }}
        >
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full animate-pulse shrink-0"
              style={{ backgroundColor: accentColor }}
            />
            <span className="text-xs sm:text-sm font-black tracking-wide">
              {coreHubTitle}
            </span>
          </div>
          <span className="text-[10px] sm:text-[11px] font-medium text-white/80 shrink-0">
            {coreHubSub}
          </span>
        </div>
      </div>

      {/* 2 Bottom Satellites */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {cards.slice(2, 4).map((sat, i) => (
          <div
            key={i}
            className="rounded-lg p-3 sm:p-3.5 bg-neutral-50/80 dark:bg-neutral-900/50 border border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between gap-3 shadow-2xs"
          >
            <div>
              {sat.tag && (
                <span className="text-[9.5px] font-bold uppercase tracking-wider text-[#005AAB] dark:text-[#60A5FA] block mb-0.5">
                  {sat.tag}
                </span>
              )}
              <h5 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100 leading-tight">
                {sat.title}
              </h5>
              <p className="text-[10.5px] sm:text-[11.5px] text-neutral-600 dark:text-neutral-400 leading-snug mt-0.5">
                {sat.description}
              </p>
            </div>
            {sat.metric && (
              <span
                className="px-2 py-1 rounded-md text-[10.5px] font-black shrink-0"
                style={{ backgroundColor: accentColor, color: "#111111" }}
              >
                {sat.metric}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────
 * 28. Split Case Comparison (Official ITB Split Template Layout)
 * Left Blue Panel (33%): Yellow Bar + White Action Title + Yellow Subtitle
 * Right White Panel (67%): Before AI Card (Grey) → Arrow → After AI Card (Blue) + Bottom Insight Bar
 * ─────────────────────────────────────────────────── */
export function SplitCaseComparison({
  title,
  subtitle,
  badge,
  beforeTitle = "BEFORE AI",
  beforeItems = [],
  beforeText,
  afterTitle = "AFTER AI",
  afterItems = [],
  afterText,
  insightText = "Key insight: AI didn't replace the leader. It changed what the leader decides.",
  isPresentation = false,
  fontTitleClass = "",
}: {
  title: string;
  subtitle?: string;
  badge?: string;
  beforeTitle?: string;
  beforeItems?: string[];
  beforeText?: string;
  afterTitle?: string;
  afterItems?: string[];
  afterText?: string;
  insightText?: string;
  isPresentation?: boolean;
  fontTitleClass?: string;
}) {
  return (
    <div className="w-full h-full flex flex-row relative select-none overflow-hidden bg-transparent">
      {/* Left Blue Panel (~33% width, sits directly over laptop graphic) */}
      <div className="w-[33%] sm:w-[32%] h-full pt-[13%] sm:pt-[15%] pl-[5%] sm:pl-[6%] pr-3 sm:pr-4 flex flex-col justify-start relative z-10">
        {/* Yellow accent bar 140x12px */}
        <div className="w-16 sm:w-24 h-2 sm:h-2.5 bg-[#FFDD3C] rounded-full mb-3 shrink-0" />

        {/* Title: 700 Bold, White text */}
        <h1
          className={`font-bold text-white ${fontTitleClass} leading-[1.18] tracking-tight line-clamp-3 ${
            isPresentation ? "text-2xl sm:text-3xl lg:text-4xl" : "text-xl sm:text-2xl lg:text-[28px]"
          }`}
        >
          {title}
        </h1>

        {/* Subtitle: 600 Semibold, Golden Yellow */}
        {subtitle && (
          <p
            className={`font-semibold text-[#FFDD3C] mt-2 sm:mt-2.5 leading-snug line-clamp-2 ${
              isPresentation ? "text-sm sm:text-base lg:text-lg" : "text-xs sm:text-sm lg:text-[15px]"
            }`}
          >
            {subtitle}
          </p>
        )}

        {/* Optional Badge */}
        {badge && !badge.toUpperCase().includes("0") && (
          <span className="mt-3 inline-block self-start text-[9.5px] sm:text-[10px] font-bold text-white/90 uppercase tracking-widest px-2.5 py-1 rounded bg-white/10">
            {badge}
          </span>
        )}
      </div>

      {/* Right White Panel (~67% width, sits on the clean white area) */}
      <div className="w-[67%] sm:w-[68%] h-full pt-[8%] sm:pt-[9%] pr-[5%] sm:pr-[6%] pl-4 sm:pl-6 pb-[12%] sm:pb-[14%] flex flex-col justify-center gap-3 sm:gap-4 relative z-10">
        {/* Two Comparison Cards: Before vs After */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-h-0">
          {/* Card 1: BEFORE AI (Light Grey #F1F1F1) */}
          <div className="flex-1 h-full rounded-2xl bg-[#F1F1F1] dark:bg-neutral-800/80 p-3.5 sm:p-4.5 flex flex-col justify-start overflow-hidden border border-neutral-200/50 dark:border-neutral-700/50">
            <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-[#595959] dark:text-neutral-400 mb-2 block">
              {beforeTitle}
            </span>
            <div className="space-y-1.5 text-xs sm:text-[13px] text-[#272525] dark:text-neutral-200 leading-relaxed overflow-y-auto">
              {beforeItems && beforeItems.length > 0 ? (
                beforeItems.map((item, idx) => (
                  <p key={idx} className="leading-snug">{item}</p>
                ))
              ) : (
                <p className="leading-snug">
                  {beforeText || "Rule-based dispatch and human coordination across hundreds of concurrent requests. Bottleneck: human bandwidth caps matching quality."}
                </p>
              )}
            </div>
          </div>

          {/* Blue Arrow */}
          <div className="text-[#005AAB] font-black text-xl sm:text-2xl shrink-0 px-1">
            →
          </div>

          {/* Card 2: AFTER AI (Solid Deep Blue #005AAB with Yellow Top Accent) */}
          <div className="flex-1 h-full rounded-2xl bg-[#005AAB] text-white p-3.5 sm:p-4.5 flex flex-col justify-start overflow-hidden relative shadow-sm">
            <div className="w-8 sm:w-10 h-1 bg-[#FFDD3C] rounded-full mb-2 shrink-0" />
            <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-[#FFDD3C] mb-2 block">
              {afterTitle}
            </span>
            <div className="space-y-1.5 text-xs sm:text-[13px] text-white/95 leading-relaxed overflow-y-auto">
              {afterItems && afterItems.length > 0 ? (
                afterItems.map((item, idx) => (
                  <p key={idx} className="leading-snug font-medium">{item}</p>
                ))
              ) : (
                <p className="leading-snug font-medium">
                  {afterText || "ML allocation optimises several objectives at once with real-time feedback loops. Leaders set pricing logic, fairness guardrails and escalation rules."}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Full-Width Key Insight Bar */}
        <div className="w-full bg-[#005AAB] border-l-[8px] sm:border-l-[12px] border-[#FFDD3C] rounded-xl px-4 py-2.5 sm:py-3 text-white text-xs sm:text-[13px] font-medium leading-snug shrink-0 shadow-xs">
          <span className="font-extrabold text-[#FFDD3C] mr-1.5">Key insight:</span>
          <span>{insightText}</span>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────
 * 29. Split Profile Slide (Facilitator / Speaker Bio Layout)
 * Left Blue Panel (33%): Name + Role on blue
 * Right White Panel (67%): Circular Photo + Speaker Profile Label + Role + Bio
 * ─────────────────────────────────────────────────── */
export function SplitProfileSlide({
  title,
  subtitle = "Facilitator",
  badge,
  tag = "SPEAKER PROFILE",
  roleOrg,
  bio,
  photoUrl,
  isPresentation = false,
  fontTitleClass = "",
}: {
  title: string;
  subtitle?: string;
  badge?: string;
  tag?: string;
  roleOrg?: string;
  bio?: string;
  photoUrl?: string;
  isPresentation?: boolean;
  fontTitleClass?: string;
}) {
  return (
    <div className="w-full h-full flex flex-row relative select-none overflow-hidden bg-transparent">
      {/* Left Blue Panel (~33% width) */}
      <div className="w-[33%] sm:w-[32%] h-full pt-[13%] sm:pt-[15%] pl-[5%] sm:pl-[6%] pr-3 sm:pr-4 flex flex-col justify-start relative z-10">
        <div className="w-16 sm:w-24 h-2 sm:h-2.5 bg-[#FFDD3C] rounded-full mb-3 shrink-0" />
        <h1
          className={`font-bold text-white ${fontTitleClass} leading-[1.18] tracking-tight line-clamp-3 ${
            isPresentation ? "text-2xl sm:text-3xl lg:text-4xl" : "text-xl sm:text-2xl lg:text-[28px]"
          }`}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className={`font-semibold text-[#FFDD3C] mt-2 sm:mt-2.5 leading-snug line-clamp-2 ${
              isPresentation ? "text-sm sm:text-base lg:text-lg" : "text-xs sm:text-sm lg:text-[15px]"
            }`}
          >
            {subtitle}
          </p>
        )}
        {badge && !badge.toUpperCase().includes("0") && (
          <span className="mt-3 inline-block self-start text-[9.5px] sm:text-[10px] font-bold text-white/90 uppercase tracking-widest px-2.5 py-1 rounded bg-white/10">
            {badge}
          </span>
        )}
      </div>

      {/* Right White Panel (~67% width) */}
      <div className="w-[67%] sm:w-[68%] h-full pt-[8%] sm:pt-[9%] pr-[5%] sm:pr-[6%] pl-4 sm:pl-6 pb-[12%] sm:pb-[14%] flex items-center gap-6 sm:gap-8 relative z-10">
        {/* Circle Photo */}
        <div className="w-28 sm:w-36 h-28 sm:h-36 rounded-full border-4 border-[#005AAB] flex items-center justify-center bg-[#EAF2FB] text-[#005AAB] font-bold text-xs sm:text-sm shrink-0 overflow-hidden shadow-xs">
          {photoUrl ? (
            <img src={photoUrl} alt={title} className="w-full h-full object-cover" />
          ) : (
            <span>[Photo]</span>
          )}
        </div>

        {/* Bio Details */}
        <div className="flex-1 space-y-2">
          <span className="text-xs sm:text-sm font-bold text-[#005AAB] tracking-widest uppercase block">
            {tag}
          </span>
          <h3 className="text-base sm:text-lg font-bold text-[#272525]">
            {roleOrg || "[Role and organization]"}
          </h3>
          <p className="text-xs sm:text-sm text-[#595959] leading-relaxed line-clamp-5">
            {bio || "[Short bio: expertise, research focus, industry experience]"}
          </p>
        </div>
      </div>
    </div>
  );
}
