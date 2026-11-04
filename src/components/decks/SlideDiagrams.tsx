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
    <div className="w-full flex items-center justify-between gap-1.5 sm:gap-3 overflow-hidden scrollbar-none py-2">
      {items.map((node, i) => (
        <React.Fragment key={i}>
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35, delay: i * 0.1, ease: "easeOut" }}
            className="flex-1 min-w-[90px] sm:min-w-[120px] bg-white border border-neutral-200 rounded-md p-3 sm:p-4 relative flex flex-col justify-between"
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
            <h4 className={`${isPresentation ? "text-base" : "text-xs sm:text-sm"} font-bold text-neutral-900 leading-tight`}>
              {node.title}
            </h4>
            {node.subtitle && (
              <p className={`${isPresentation ? "text-xs" : "text-[10px] sm:text-[11px]"} text-neutral-500 mt-1 leading-snug`}>
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
              className="shrink-0 text-neutral-400 flex items-center justify-center"
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
  primaryColor = "#005AAB",
  isPresentation = false,
  isUIDeck = false,
  isBinusDeck = false,
}: {
  rows?: TableRow[];
  headers?: string[];
  primaryColor?: string;
  isPresentation?: boolean;
  isUIDeck?: boolean;
  isBinusDeck?: boolean;
}) {
  if (!rows || rows.length === 0) {
    return null;
  }

  const items = rows;
  const isUI = isUIDeck || primaryColor === "#FEDE3B" || primaryColor === "#FFDE3C";
  const isBinus = isBinusDeck || primaryColor === "#174A7F";

  // Detect custom multi-column table if headers are explicitly provided or cells array exists
  const hasCustomHeaders = headers && headers.length > 0;
  const isMultiCol = hasCustomHeaders || (items[0]?.cells && items[0].cells.length > 0);

  const tableHeaders = hasCustomHeaders
    ? headers
    : isMultiCol && items[0]?.cells
    ? items[0].cells.map((_, i) => `Column ${i + 1}`)
    : ["Dimension", "Current State", "Target State"];

  // Clean, downgraded cell content without SaaS neon pulse or flashy gradients
  const renderCellContent = (val: unknown, isLastCol: boolean = false) => {
    if (typeof val === "boolean") {
      return val ? (
        <span
          className={`inline-flex items-center justify-center w-5 h-5 rounded-full ${
            isUI ? "bg-[#FEDE3B] text-neutral-950" : isBinus ? "bg-[#23A3E7] text-white" : "bg-[#005AAB] text-white"
          }`}
        >
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        </span>
      ) : (
        <X className="w-4 h-4 mx-auto text-[#9A9A9A]" />
      );
    }
    const str = String(val || "");

    // Clean status badge formatting per ITB design rules (No emoji, no neon pulse):
    // OK / Green = Light Blue #EAF2FB + Deep Blue #005AAB text
    if (/\b(?:GREEN|HIJAU|OK|PASS|LOW|RENDAH)\b/i.test(str)) {
      const cleanLabel = str.replace(/[→\-\*]/g, "").trim();
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] sm:text-xs font-bold bg-[#EAF2FB] text-[#005AAB] border border-[#9FB8D6]">
          {cleanLabel}
        </span>
      );
    }
    // Risk / Amber = Yellow #FFEC8E / #FFDD3C + Text #272525
    if (/\b(?:AMBER|KUNING|YELLOW|RISK|PARTIAL|MEDIUM|SEDANG)\b/i.test(str)) {
      const cleanLabel = str.replace(/[→\-\*]/g, "").trim();
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] sm:text-xs font-bold bg-[#FFEC8E] text-[#272525] border border-[#FFDD3C]">
          {cleanLabel}
        </span>
      );
    }
    // Wrong / Red = Deep Blue + White text, or clean neutral tag (Fail = dark outline)
    if (/\b(?:RED|MERAH|WRONG|FAIL|HIGH|TINGGI)\b/i.test(str)) {
      const cleanLabel = str.replace(/[→\-\*]/g, "").trim();
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] sm:text-xs font-bold bg-[#005AAB] text-white">
          {cleanLabel}
        </span>
      );
    }

    if (isLastCol && !hasCustomHeaders) {
      return (
        <span
          className={`px-2 py-0.5 rounded font-bold ${
            isUI
              ? "bg-[#FEDE3B] text-neutral-950"
              : isBinus
              ? "bg-[#EAF2FB] text-[#018ED5]"
              : "bg-[#FFF6CC] text-[#005AAB] border border-[#FFEC8E]"
          }`}
        >
          {str}
        </span>
      );
    }

    return <span className="leading-snug text-[#272525]">{str}</span>;
  };

  return (
    <div className={`w-full flex-1 min-h-0 overflow-hidden rounded-lg border-[1.5px] ${
      isUI
        ? "border-[#FEDE3B]"
        : isBinus
        ? "border-[#23A3E7]"
        : "border-[#9FB8D6]"
    } bg-white flex flex-col shadow-none ${isPresentation ? "my-auto justify-center" : ""}`}>
      <table className={`w-full text-left border-collapse ${isPresentation ? "text-xs sm:text-sm lg:text-[14px]" : "text-[11px] sm:text-xs"}`}>
        <thead>
          <tr className={`${
            isUI
              ? "bg-gradient-to-b from-[#FFF58A] via-[#FEDE3B] to-[#F5C400] text-neutral-950 border-b border-[#D8A700]/50"
              : isBinus
              ? "bg-[#174A7F] text-white"
              : "bg-[#005AAB] text-white"
          } sticky top-0 z-10`}>
            {tableHeaders.map((hdr, i) => (
              <th
                key={i}
                className={`font-bold uppercase tracking-wider ${
                  isUI ? "text-neutral-950" : "text-white"
                } ${
                  i === 0 ? "text-left" : "text-center"
                } ${isPresentation ? "p-2.5 sm:p-3 lg:p-3.5 text-xs sm:text-sm" : "p-1.5 sm:p-2 text-[10px] sm:text-[11px]"}`}
              >
                <span>{hdr}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={`divide-y ${isUI ? "divide-neutral-200" : "divide-[#D6E4F5]"}`}>
          {items.slice(0, 6).map((row, idx) => {
            // ITB Rule §6: alternate #EAF2FB / white body rows
            const isStriped = isUI ? idx % 2 === 1 : idx % 2 === 0;
            const rowBg = isUI
              ? (isStriped ? "bg-[#FFFDF5]" : "bg-white")
              : isBinus
              ? (isStriped ? "bg-[#F0F6FC]" : "bg-white")
              : (isStriped ? "bg-[#EAF2FB]" : "bg-white");

            return (
              <tr
                key={idx}
                className={`${rowBg} ${isUI ? "hover:bg-[#FFFDE8]" : "hover:bg-[#D6E4F5]/35"} transition-colors`}
              >
                {isMultiCol && row.cells ? (
                  row.cells.map((cellVal, cIdx) => (
                    <td
                      key={cIdx}
                      className={`${isPresentation ? "p-2 sm:p-2.5 lg:p-3" : "p-1.5 sm:p-2"} ${
                        cIdx === 0 ? "font-bold text-[#272525]" : "text-center text-[#272525]"
                      }`}
                    >
                      {renderCellContent(cellVal, cIdx === row.cells!.length - 1)}
                    </td>
                  ))
                ) : (
                  <>
                    <td className={`${isPresentation ? "p-2 sm:p-2.5 lg:p-3" : "p-1.5 sm:p-2"} font-bold text-[#272525]`}>
                      {row.feature || ""}
                    </td>
                    <td className={`${isPresentation ? "p-2 sm:p-2.5 lg:p-3" : "p-1.5 sm:p-2"} text-center text-[#595959]`}>
                      {renderCellContent(row.current)}
                    </td>
                    <td className={`${isPresentation ? "p-2 sm:p-2.5 lg:p-3" : "p-1.5 sm:p-2"} text-center font-bold text-[#272525]`}>
                      {renderCellContent(row.proposed, true)}
                    </td>
                  </>
                )}
              </tr>
            );
          })}
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
        className="absolute top-[28px] left-[5%] right-[5%] h-0.5 bg-neutral-200 origin-left"
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
                    ? "bg-neutral-900 text-white"
                    : "bg-white border-2 border-neutral-300"
                }`}
                style={{ backgroundColor: isActive ? primaryColor : undefined }}
              >
                {isDone ? (
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-neutral-600" />
                )}
              </div>

              {/* Quarter Badge */}
              <span className="text-[10px] sm:text-[11px] font-sf font-sans font-bold uppercase tracking-wider text-neutral-500 mb-1">
                {m.quarter}
              </span>

              {/* Title & Description */}
              <h5 className={`${isPresentation ? "text-sm sm:text-base" : "text-xs sm:text-[13px]"} font-bold text-neutral-900 leading-tight mb-1`}>
                {m.title}
              </h5>
              <p className={`${isPresentation ? "text-xs" : "text-[10px] sm:text-[11px]"} text-neutral-500 leading-snug max-w-[170px]`}>
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
            className="flex items-center gap-3 p-3 sm:p-3.5 rounded-md border border-neutral-200 bg-white"
          >
            <div
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-md flex items-center justify-center shrink-0 text-neutral-950"
              style={{ backgroundColor: l.color }}
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h5 className={`${isPresentation ? "text-sm sm:text-base" : "text-xs sm:text-sm"} font-bold text-neutral-900 leading-tight`}>
                {l.name}
              </h5>
              <p className={`${isPresentation ? "text-xs" : "text-[10px] sm:text-[11px]"} text-neutral-500 leading-snug mt-0.5`}>
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
        container: "bg-white text-neutral-900 border border-neutral-200 shadow-2xs",
        title: "text-neutral-900 font-bold",
        desc: "text-neutral-600 font-normal",
      },
    },
    {
      items: q4Items,
      defaultTitle: "Delegate & Supervise",
      style: {
        container: "bg-white text-neutral-900 border-2 border-[#005AAB] shadow-2xs",
        title: "text-[#005AAB] font-bold",
        desc: "text-neutral-600 font-normal",
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
      <div className="absolute left-0 top-0 bottom-6 w-5 flex flex-col justify-between items-center text-[10px] sm:text-[11px] font-bold text-[#005AAB] select-none">
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
                <div className="space-y-1 mt-2 pt-1 border-t border-black/10">
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
        <span className="text-[#005AAB]">{xRight}</span>
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
            className={`${widthClass} transition-all duration-300 rounded-md border border-neutral-200 p-2 sm:p-2.5 flex items-center justify-between`}
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
                <h5 className={`${isPresentation ? "text-sm" : "text-xs"} font-bold text-neutral-900 truncate font-sf`}>
                  {stage.label}
                </h5>
                {stage.subtext && (
                  <p className="text-[10px] text-neutral-500 truncate hidden sm:block font-sf">
                    {stage.subtext}
                  </p>
                )}
              </div>
            </div>

            <div className="text-right shrink-0 pl-2">
              <span className={`${isPresentation ? "text-sm sm:text-base" : "text-xs sm:text-sm"} font-extrabold text-neutral-900 tabular-nums font-sf`}>
                {stage.value}
              </span>
              {stage.rate && (
                <span className="block text-[9px] sm:text-[10px] font-sf font-sans text-emerald-600 font-bold tabular-nums">
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
          className="relative bg-white border border-neutral-200 rounded-md p-3 flex flex-col justify-between group hover:border-neutral-400:border-neutral-600 transition-all"
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
            <h5 className={`${isPresentation ? "text-sm sm:text-base" : "text-xs sm:text-[13px]"} font-bold text-neutral-900 leading-tight`}>
              {node.title}
            </h5>
            {node.description && (
              <p className={`${isPresentation ? "text-xs" : "text-[10px] sm:text-[11px]"} text-neutral-500 mt-1 leading-snug`}>
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
                  <span className={`${isPresentation ? "text-2xl" : "text-sm sm:text-base"} font-black text-neutral-900`}>
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
                <p className={`text-neutral-700 ${
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
                      ? "bg-neutral-100 text-neutral-600 border border-neutral-200"
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
                  <span className={`${isPresentation ? "text-2xl" : "text-sm sm:text-base"} font-black text-neutral-900`}>
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
        <div className={`w-full mt-3 sm:mt-4 rounded-md overflow-hidden flex items-stretch border border-neutral-200/80 shadow-2xs`} style={{ backgroundColor: primaryColor }}>
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
            className={`flex items-center gap-3 ${isMulti ? "p-2.5 sm:p-3" : "p-3 sm:p-4"} rounded-md border border-neutral-200/90 bg-white/95 overflow-hidden`}
          >
            {/* SVG Radial Gauge */}
            <div className={`relative ${isMulti ? "w-12 h-12 sm:w-14 sm:h-14" : "w-16 h-16 sm:w-20 sm:h-20"} shrink-0 flex items-center justify-center`}>
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="stroke-neutral-200"
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
                <span className={`${isMulti ? "text-xs sm:text-sm" : isPresentation ? "text-lg" : "text-sm sm:text-base"} font-black text-neutral-950 tabular-nums`}>
                  {gauge.percentage}%
                </span>
              </div>
            </div>

            {/* Description Details */}
            <div className="min-w-0 flex-1">
              <h5 className={`${isMulti ? "text-xs" : isPresentation ? "text-base" : "text-xs sm:text-sm"} font-bold text-neutral-950 leading-snug line-clamp-1`}>
                {gauge.title}
              </h5>
              <p className={`${isMulti ? "text-[9px] sm:text-[10px]" : isPresentation ? "text-xs" : "text-[10px] sm:text-[11px]"} text-neutral-500 mt-0.5 leading-snug line-clamp-2`}>
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
                className="rounded-md p-2 sm:p-3 border border-neutral-200 flex items-center gap-2"
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
              <div className="w-3 h-3 rounded-full bg-neutral-900 mt-2 ring-4 ring-amber-400/30" />
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
              <h5 className={`${isPresentation ? "text-sm" : "text-xs font-bold"} text-neutral-900 truncate font-sf`}>
                {item.title}
              </h5>
              <span className="text-[10px] font-sf font-sans font-bold text-neutral-500 tabular-nums">{item.percentage}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-neutral-200 overflow-hidden">
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
          <div className="w-6 sm:w-10 h-[1.5px] bg-neutral-300 shrink-0" />
          <span className={`${isPresentation ? "text-xl sm:text-2xl" : "text-base sm:text-lg"} font-black text-neutral-950 font-sf tabular-nums shrink-0`}>
            {items[0].percentage}%
          </span>
          {items[0].description && (
            <span className="text-[9px] sm:text-[10px] text-neutral-500 max-w-[130px] sm:max-w-[150px] line-clamp-2 leading-tight">
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
            <span className="text-[9px] sm:text-[10px] text-neutral-500 max-w-[130px] sm:max-w-[150px] text-right line-clamp-2 leading-tight">
              {items[1].description}
            </span>
          )}
          <span className={`${isPresentation ? "text-xl sm:text-2xl" : "text-base sm:text-lg"} font-black text-neutral-950 font-sf tabular-nums shrink-0`}>
            {items[1].percentage}%
          </span>
          <div className="w-6 sm:w-10 h-[1.5px] bg-neutral-300 shrink-0" />
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
          <div className="w-6 sm:w-10 h-[1.5px] bg-neutral-300 shrink-0" />
          <span className={`${isPresentation ? "text-xl sm:text-2xl" : "text-base sm:text-lg"} font-black text-neutral-950 font-sf tabular-nums shrink-0`}>
            {items[2].percentage}%
          </span>
          {items[2].description && (
            <span className="text-[9px] sm:text-[10px] text-neutral-500 max-w-[130px] sm:max-w-[150px] line-clamp-2 leading-tight">
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
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white border-4 flex items-center justify-center shrink-0"
              style={{ borderColor: primaryColor }}
            >
              <span className={`${isPresentation ? "text-base sm:text-lg" : "text-xs sm:text-sm"} font-extrabold text-neutral-900 font-sf`}>
                {item.percentage}%
              </span>
            </div>

            {/* Horizontal Connector Line */}
            <div className="w-4 sm:w-8 h-[2px] bg-neutral-300 shrink-0" />

            {/* Right Text Content Row */}
            <div className="flex-1 min-w-0 bg-neutral-50/80 p-2.5 sm:p-3 rounded-lg border border-neutral-100">
              <h5 className={`${isPresentation ? "text-base" : "text-xs sm:text-sm"} font-bold text-neutral-900 leading-tight font-sf`}>
                {item.title}
              </h5>
              <p className={`${isPresentation ? "text-xs" : "text-[10px] sm:text-[11px]"} text-neutral-500 mt-1 leading-snug line-clamp-2`}>
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
            <h5 className={`${isPresentation ? "text-sm sm:text-base" : "text-[11px] sm:text-xs"} font-bold text-neutral-900 leading-tight font-sf`}>
              {m.title}
            </h5>
            <p className={`${isPresentation ? "text-xs" : "text-[9px] sm:text-[10px]"} text-neutral-500 mt-1 leading-snug line-clamp-3`}>
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
      <div className="w-[1.5px] self-stretch bg-neutral-200" />

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
                <h5 className={`${isPresentation ? "text-sm" : "text-xs"} font-bold text-neutral-900 truncate font-sf`}>
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
              <div className="w-full h-1.5 rounded-full bg-neutral-200 mt-1.5 overflow-hidden">
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
          <div className="text-[10px] sm:text-[11px] font-bold text-neutral-900 leading-tight">{items[0].title}</div>
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
          <div className="text-[10px] sm:text-[11px] font-bold text-neutral-900 leading-tight">{items[1].title}</div>
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
          <span className={`${isPresentation ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"} font-black text-neutral-950 font-sf`}>
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
          <span className={`${isPresentation ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"} font-black text-neutral-950 font-sf`}>
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
          <span className={`${isPresentation ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"} font-black text-neutral-950 font-sf`}>
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
        isPresentation ? "p-2.5 sm:p-3.5 text-xs sm:text-sm" : "py-1.5 px-3 text-[10.5px] sm:text-xs"
      }`}
      style={{
        backgroundColor: primaryColor,
        borderLeft: `6px solid ${accentColor}`,
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
          <div className={`flex-1 rounded-lg bg-neutral-100 border border-neutral-200/80 ${
            isPresentation
              ? "py-3 sm:py-4 px-4 sm:px-5 text-xs sm:text-sm lg:text-[15px]"
              : "py-2 sm:py-2.5 px-3.5 text-[11px] sm:text-xs"
          } text-neutral-800 font-medium leading-relaxed line-clamp-2 overflow-hidden shadow-2xs`}>
            {row.leftLead && <strong className="font-bold text-neutral-950 mr-1.5">{row.leftLead}</strong>}
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
            <div className="w-full flex items-center justify-center relative mb-1.5 sm:mb-2">
              {/* Left track connector */}
              <div
                className={`flex-1 h-1 sm:h-1.5 ${i === 0 ? "opacity-0" : ""}`}
                style={{ backgroundColor: primaryColor }}
              />
              {/* Center Circle Node */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
                className={`shrink-0 rounded-full flex items-center justify-center font-black ${
                  isPresentation ? "w-11 h-11 sm:w-12 sm:h-12 text-base sm:text-lg" : "w-8 h-8 sm:w-9 sm:h-9 text-xs sm:text-sm"
                }`}
                style={{ backgroundColor: circleBg, color: circleText }}
              >
                {num}
              </motion.div>
              {/* Right track connector */}
              <div
                className={`flex-1 h-1 sm:h-1.5 ${i === count - 1 ? "opacity-0" : ""}`}
                style={{ backgroundColor: primaryColor }}
              />
            </div>

            {/* Title & Description */}
            <h4 className={`font-bold text-neutral-900 leading-tight px-1 line-clamp-2 ${
              isPresentation ? "text-xs sm:text-sm" : "text-[11px] sm:text-xs"
            }`}>
              {step.title}
            </h4>
            {step.description && (
              <p className={`text-neutral-600 mt-0.5 leading-snug px-1 line-clamp-2 ${
                isPresentation ? "text-[11px] sm:text-xs" : "text-[9.5px] sm:text-[10.5px]"
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
  badgeLabel = "EXERCISE 1",
  primaryColor = "#005AAB",
  isPresentation = false,
  isUIDeck = false,
  isBinusDeck = false,
}: {
  items: string[];
  badgeLabel?: string;
  primaryColor?: string;
  isPresentation?: boolean;
  isUIDeck?: boolean;
  isBinusDeck?: boolean;
}) {
  if (!items || items.length === 0) return null;

  const isUI = isUIDeck || primaryColor === "#FEDE3B" || primaryColor === "#FFDE3C";
  const isBinus = isBinusDeck || primaryColor === "#174A7F";
  const isCompact = items.length >= 5;

  return (
    <div className="w-full my-auto flex flex-col justify-center min-h-0 overflow-hidden">
      {/* Outer Card: Clean 2px border in ITB Deep Blue #005AAB, BINUS Sky Blue, or UI Yellow. No drop shadows. */}
      <div className={`w-full rounded-lg border-[2px] ${
        isUI
          ? "border-[#FEDE3B] shadow-[0_4px_20px_rgba(254,222,59,0.18)]"
          : isBinus
          ? "border-[#23A3E7] shadow-[0_4px_20px_rgba(35,163,231,0.14)]"
          : "border-[#005AAB]"
      } bg-white overflow-hidden flex flex-col`}>
        {/* Header Strip: Glossy Yellow in UI, Deep Blue in BINUS, Solid ITB Deep Blue in ITB */}
        <div className={`relative px-4 sm:px-6 ${isCompact ? "py-1.5 sm:py-2" : "py-2 sm:py-2.5"} ${
          isUI
            ? "bg-gradient-to-b from-[#FFF58A] via-[#FEDE3B] to-[#F5C400] text-neutral-950 border-b border-[#D8A700]/50 shadow-xs"
            : isBinus
            ? "bg-gradient-to-r from-[#174A7F] via-[#1E5F9E] to-[#23A3E7] text-white"
            : "bg-[#005AAB] text-white"
        } flex items-center justify-between overflow-hidden`}>
          {/* Subtle glossy glass sheen overlay on the top half of the header in UI mode */}
          {isUI && (
            <div className="absolute inset-x-0 top-0 h-1/2 pointer-events-none bg-gradient-to-b from-white/75 via-white/25 to-transparent" />
          )}

          {/* Left: Exercise / Checklist Title in Uppercase Bold */}
          <span className={`font-black text-xs sm:text-sm lg:text-[15px] uppercase tracking-wider relative z-10 ${
            isUI ? "text-neutral-950 drop-shadow-[0_1px_0_rgba(255,255,255,0.8)]" : "text-white"
          }`}>
            {badgeLabel}
          </span>

          {/* Right: Pair / Participant fill-in blank */}
          <div className={`flex items-center gap-1.5 text-xs sm:text-sm ${
            isUI ? "text-neutral-950 font-black" : "text-[#FFDD3C] font-bold"
          } relative z-10`}>
            <span className={isUI ? "text-neutral-950" : "text-[#FFDD3C]"}>Pair:</span>
            <span className={`inline-block w-14 sm:w-20 border-b-[2px] ${
              isUI ? "border-neutral-950/70" : "border-[#FFDD3C]"
            } transform translate-y-[-1px]`} />
          </div>
        </div>

        {/* Rows List: Ruled rows with rounded checkbox pills and index markers */}
        <div className={`divide-y ${isUI ? "divide-neutral-200" : isBinus ? "divide-[#E6EDF8]" : "divide-[#D6E4F5]"} bg-white`}>
          {items.slice(0, 6).map((item, i) => {
            const indexLabel = `1.${i + 1}`;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.04 }}
                className={`${isCompact ? "px-3.5 sm:px-5 py-1.5 sm:py-2" : "px-4 sm:px-6 py-2.5 sm:py-3"} flex items-center justify-between gap-3 sm:gap-4 ${
                  isUI ? "hover:bg-[#FFFDE8]" : "hover:bg-[#EAF2FB]/50"
                } transition-colors`}
              >
                <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
                  {/* Clean Rounded Checkbox Pill in ITB Deep Blue #005AAB */}
                  <div className={`${
                    isCompact ? "w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-[5px] sm:rounded-[6px]" : "w-6 h-6 sm:w-6.5 sm:h-6.5 rounded-[7px] sm:rounded-[8px]"
                  } border-[2px] ${
                    isUI
                      ? "border-neutral-900 bg-gradient-to-b from-white to-[#FFFCEB] shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.06)] hover:border-[#D8A700]"
                      : isBinus
                      ? "border-[#23A3E7] bg-white hover:border-[#174A7F]"
                      : "border-[#005AAB] bg-white hover:border-[#003E78]"
                  } shrink-0 flex items-center justify-center cursor-pointer transition-colors`} />

                  {/* Row Text */}
                  <span className={`font-normal text-[#272525] ${
                    isCompact
                      ? "text-[11px] sm:text-[12px] lg:text-[13px] leading-snug line-clamp-2"
                      : (isPresentation ? "text-xs sm:text-sm lg:text-[15px] leading-snug" : "text-[11.5px] sm:text-xs leading-snug")
                  } line-clamp-2`}>
                    {item}
                  </span>
                </div>

                {/* Right Item Identifier Pill */}
                <div className="shrink-0 text-right">
                  <span className={`text-[10px] sm:text-[11.5px] font-black font-mono tracking-tight px-1.5 py-0.5 rounded ${
                    isUI
                      ? "text-neutral-950 bg-amber-400/20"
                      : isBinus
                      ? "text-[#018ED5] bg-[#EAF2FB] font-semibold"
                      : "text-[#005AAB] bg-[#EAF2FB] font-bold"
                  }`}>
                    {indexLabel}
                  </span>
                </div>
              </motion.div>
            );
          })}
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
  isDarkBg = true,
}: {
  partLabel?: string;
  title: string;
  subtitle?: string;
  primaryColor?: string;
  accentColor?: string;
  isPresentation?: boolean;
  transparentBg?: boolean;
  isDarkBg?: boolean;
}) {
  const isLight = transparentBg && !isDarkBg;
  const titleColor = isLight ? "#000000" : "#FFFFFF";
  const subtitleColor = isLight ? "text-neutral-900 font-medium" : "text-white/90 font-normal";
  const barColor = isLight ? "#000000" : accentColor;
  const labelColor = isLight ? "#000000" : accentColor;

  return (
    <div
      className="w-full h-full flex flex-col justify-center items-start px-[7%] sm:px-[9%] py-[8%] sm:py-[10%] relative overflow-hidden select-none"
      style={{
        background: transparentBg ? "transparent" : `linear-gradient(150deg, ${primaryColor} 0%, #007AE8 100%)`,
        color: titleColor,
      }}
    >
      {/* Bottom accent bar */}
      <div
        className="absolute left-0 bottom-0 right-0 h-1 sm:h-1.5 z-10"
        style={{ backgroundColor: barColor }}
      />

      <div className="my-auto max-w-4xl flex flex-col items-start z-10">
        {/* Short Accent Bar Top */}
        <div
          className="w-12 sm:w-16 h-1.5 sm:h-2 rounded-sm mb-3.5"
          style={{ backgroundColor: barColor }}
        />

        {/* Part or Break Label */}
        {partLabel && (
          <span
            className="text-xs sm:text-sm font-bold uppercase tracking-wider mb-2.5"
            style={{ color: labelColor }}
          >
            {partLabel}
          </span>
        )}

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={`font-bold leading-tight tracking-tight ${
            isPresentation ? "text-4xl sm:text-6xl lg:text-7xl" : "text-2xl sm:text-4xl lg:text-5xl"
          }`}
          style={{ color: titleColor }}
        >
          {title}
        </motion.h1>

        {/* Subtitle / Reflection question */}
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className={`mt-2.5 max-w-3xl leading-relaxed ${subtitleColor} ${
              isPresentation ? "text-lg sm:text-2xl" : "text-sm sm:text-lg"
            }`}
          >
            {subtitle}
          </motion.p>
        )}
      </div>
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
  contactText,
  primaryColor = "#005AAB",
  accentColor = "#FFDD3C",
  isPresentation = false,
  transparentBg = false,
  isDarkBg = false,
  isUIDeck = false,
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
  isDarkBg?: boolean;
  isUIDeck?: boolean;
}) {
  // Sanitize contactText: per ITB rules §11, facilitator directions and bracketed placeholders
  // like [Facilitator Name], [kontak...], [date/time] must NEVER appear on the visual slide canvas.
  const isCleanContact =
    contactText &&
    !contactText.includes("[") &&
    !contactText.includes("]") &&
    !/facilitator|narasumber|pembicara/i.test(contactText);

  // Dedicated layout for UI × RevoU closing deck:
  // ui-deck/closing-deck.webp has a top ~31% yellow banner (y: 0–330px) and a bottom white content canvas.
  // The title and subtitle belong directly in the yellow banner with bold black typography.
  if (isUIDeck && transparentBg) {
    return (
      <div className="w-full h-full flex flex-col justify-between relative overflow-hidden bg-transparent select-text">
        {/* Top ~31% Yellow Header Band: Title and Subtitle placed directly on the yellow canvas */}
        <div className="w-full h-[31%] px-[6%] sm:px-[7%] pt-3.5 sm:pt-5 pb-2 flex flex-col justify-center items-start relative shrink-0">
          {tag && (
            <span className="px-3 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider mb-1 bg-black text-[#FEDE3B] shadow-2xs">
              {tag}
            </span>
          )}

          <h1
            className={`font-black leading-tight tracking-tight text-black line-clamp-2 ${
              isPresentation ? "text-3xl sm:text-5xl" : "text-xl sm:text-3xl"
            }`}
            style={{ color: "#000000" }}
          >
            {title}
          </h1>

          {subtitle && (
            <p
              className={`font-medium text-neutral-900/85 mt-1 line-clamp-1 ${
                isPresentation ? "text-base sm:text-lg" : "text-xs sm:text-sm"
              }`}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* Lower White Content Area: Action List Items */}
        <div className="w-full flex-1 px-[6%] sm:px-[7%] pt-5 sm:pt-7 pb-2 flex flex-col justify-start items-start">
          {actions && actions.length > 0 && (
            <div className="flex flex-col gap-2.5 sm:gap-3.5 w-full max-w-3xl">
              {actions.map((act, i) => (
                <div key={i} className="flex items-start gap-3 text-neutral-900 leading-snug">
                  <span className="w-6 h-6 rounded-md bg-[#FEDE3B] text-black font-extrabold flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-2xs border border-neutral-300/40">
                    {i + 1}
                  </span>
                  <span className={`font-semibold text-neutral-900 ${isPresentation ? "text-base sm:text-lg" : "text-xs sm:text-sm"}`}>
                    {act}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Clean Contact / Reminder Band */}
        {isCleanContact && (
          <div className="h-12 sm:h-14 px-[6%] sm:px-[7%] flex items-center text-xs sm:text-sm font-semibold text-neutral-700">
            {contactText}
          </div>
        )}
      </div>
    );
  }

  const titleTextColor = isDarkBg ? "#FFFFFF" : "#000000";
  const subtitleTextColor = isDarkBg ? "text-white/90" : "text-neutral-700";
  const actionTextColor = isDarkBg ? "text-white/95" : "text-neutral-800";

  return (
    <div className={`w-full h-full flex flex-col justify-between relative overflow-hidden ${transparentBg ? "bg-transparent" : "bg-white"}`}>
      {/* Top 75% Primary Area */}
      <div
        className="w-full flex-1 p-[6%] sm:p-[7%] flex flex-col justify-center items-start relative"
        style={{
          background: transparentBg ? "transparent" : (isDarkBg ? `linear-gradient(150deg, ${primaryColor} 0%, #005AAB 100%)` : "transparent"),
        }}
      >
        {/* Accent Tag */}
        {tag && (
          <span
            className="px-4 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2.5 shadow-2xs"
            style={{ backgroundColor: accentColor || "#FEDE3B", color: "#000000" }}
          >
            {tag}
          </span>
        )}

        <h1
          className={`font-black leading-tight tracking-tight ${
            isPresentation ? "text-3xl sm:text-5xl" : "text-xl sm:text-3xl"
          }`}
          style={{ color: titleTextColor }}
        >
          {title}
        </h1>

        {subtitle && (
          <p className={`font-normal mt-1.5 mb-4 ${subtitleTextColor} ${
            isPresentation ? "text-base sm:text-xl" : "text-xs sm:text-sm"
          }`}>
            {subtitle}
          </p>
        )}

        {/* Action List Items (Ordered) */}
        {actions && actions.length > 0 && (
          <div className="flex flex-col gap-2 sm:gap-2.5 w-full max-w-3xl">
            {actions.map((act, i) => (
              <div key={i} className={`flex items-start gap-2.5 ${actionTextColor} leading-snug`}>
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

      {/* Bottom Clean Contact / Reminder Band (only if clean public contact, never facilitator scripts) */}
      {isCleanContact && (
        <div className={`h-12 sm:h-14 px-[6%] sm:px-[7%] flex items-center text-xs sm:text-sm font-semibold ${transparentBg ? "bg-transparent text-neutral-800" : "text-neutral-600"}`}>
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
              className="p-3 sm:p-3.5 rounded-lg bg-neutral-50/80 border border-neutral-200/80 flex flex-col justify-start"
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
                <span className="text-xs sm:text-sm font-bold text-neutral-900 leading-tight">
                  {f.title}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-neutral-600 font-normal leading-relaxed line-clamp-3">
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
  // Root decision question
  const rootQuestion = topCallout?.note || topCallout?.label || "What is one point?";

  const displayCards = cards.slice(0, 3);
  const cardCount = Math.max(displayCards.length, 1);

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center my-auto py-2 sm:py-4 select-none">
      {/* 1. Root Decision Box (Deep Royal Blue with rounded corners) */}
      <div className="relative z-10">
        <div
          className="px-6 sm:px-10 py-3 sm:py-3.5 rounded-[10px] text-white font-bold text-xs sm:text-sm lg:text-base text-center shadow-[0_4px_14px_rgba(0,90,171,0.18)]"
          style={{ backgroundColor: primaryColor }}
        >
          {rootQuestion}
        </div>
      </div>

      {/* 2. Orthogonal Decision Tree Connector Lines */}
      <div className="w-full max-w-4xl h-10 sm:h-12 relative flex justify-center">
        {/* Vertical line down from Root */}
        <div className="w-[2.5px] h-5 sm:h-6 bg-[#005AAB]" />

        {/* Horizontal connector spanning across child columns */}
        {cardCount > 1 && (
          <div
            className="absolute top-5 sm:top-6 h-[2.5px] bg-[#005AAB]"
            style={{
              left: cardCount === 3 ? "16.66%" : "25%",
              right: cardCount === 3 ? "16.66%" : "25%",
            }}
          />
        )}

        {/* 3 Vertical Drops going straight down to each card */}
        {cardCount === 3 ? (
          <>
            <div className="absolute top-5 sm:top-6 left-[16.66%] w-[2.5px] h-5 sm:h-6 bg-[#005AAB]" />
            <div className="absolute top-5 sm:top-6 left-1/2 -translate-x-1/2 w-[2.5px] h-5 sm:h-6 bg-[#005AAB]" />
            <div className="absolute top-5 sm:top-6 right-[16.66%] w-[2.5px] h-5 sm:h-6 bg-[#005AAB]" />
          </>
        ) : cardCount === 2 ? (
          <>
            <div className="absolute top-5 sm:top-6 left-[25%] w-[2.5px] h-5 sm:h-6 bg-[#005AAB]" />
            <div className="absolute top-5 sm:top-6 right-[25%] w-[2.5px] h-5 sm:h-6 bg-[#005AAB]" />
          </>
        ) : null}
      </div>

      {/* 3. Three Decision Branch Cards with Yellow / Blue Bottom Pill Banners */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-stretch">
        {displayCards.map((c, i) => {
          // Alternating color pattern: Yellow -> Blue -> Yellow
          const isYellow = i % 2 === 0;
          const borderColor = isYellow ? "#FFDD3C" : "#005AAB";
          const bannerBg = isYellow ? "#FFDD3C" : "#005AAB";
          const bannerTextColor = isYellow ? "#272525" : "#FFFFFF";
          const bannerLabel = c.title || c.rootNode || `Outcome ${i + 1}`;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.06 }}
              className="rounded-lg bg-white p-4 sm:p-5 flex flex-col justify-between shadow-[0_4px_16px_rgba(0,0,0,0.04)]"
              style={{
                border: `2px solid ${borderColor}`,
              }}
            >
              {/* Card Body Description / Question */}
              <div className="min-h-[64px] sm:min-h-[80px] flex items-center">
                <p className="text-xs sm:text-sm text-[#272525] font-normal leading-relaxed">
                  {c.description || (c.childNodes ? c.childNodes.join(" · ") : "Condition details")}
                </p>
              </div>

              {/* Bottom Result Pill / Banner */}
              <div className="mt-3 pt-2">
                <div
                  className="w-full py-2 sm:py-2.5 px-3 rounded-[10px] text-center font-bold text-xs sm:text-sm lg:text-base tracking-tight shadow-xs"
                  style={{
                    backgroundColor: bannerBg,
                    color: bannerTextColor,
                  }}
                >
                  {bannerLabel}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
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
        <div className="p-3 sm:p-3.5 rounded-lg bg-neutral-100/80 border border-neutral-200/70">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-500 block mb-1">
            {situationTitle}
          </span>
          <p className="text-[11.5px] sm:text-xs text-neutral-800 leading-relaxed font-normal">
            {situationText}
          </p>
        </div>

        {/* Data Metric Tiles */}
        {dataMetrics && dataMetrics.length > 0 && (
          <div className={`grid grid-cols-${Math.min(dataMetrics.length, 3)} gap-2`}>
            {dataMetrics.slice(0, 3).map((m, mIdx) => (
              <div
                key={mIdx}
                className="p-2 sm:p-2.5 rounded-lg bg-blue-50/60 border border-blue-200/50 flex flex-col justify-center"
              >
                <span className="text-base sm:text-lg font-black text-[#005AAB] leading-tight">
                  {m.value}
                </span>
                <span className="text-[10px] text-neutral-600 font-medium leading-tight mt-0.5">
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
      <div className="md:col-span-5 rounded-lg border-2 border-[#005AAB] p-3.5 sm:p-4 bg-white shadow-2xs flex flex-col justify-between">
        <span className="text-[10.5px] sm:text-xs font-bold uppercase tracking-wider text-[#005AAB] block pb-2 border-b border-neutral-100">
          {exerciseTitle}
        </span>

        <div className="space-y-2.5 sm:space-y-3.5 my-auto py-2 divide-y divide-dashed divide-neutral-200">
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
              <p className="text-[11px] sm:text-xs font-medium text-neutral-800 leading-snug">
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
    <div className="w-full flex-1 flex flex-col justify-center my-auto gap-1.5 sm:gap-2 overflow-hidden py-0.5">
      {/* Tier 3: Apex Peak */}
      <div className="flex justify-center w-full">
        <div
          className="w-full max-w-lg rounded-lg p-2 sm:p-2.5 text-center shadow-xs border border-[#005AAB]"
          style={{ backgroundColor: primaryColor, color: "#FFFFFF" }}
        >
          <span
            className="text-[9px] sm:text-[9.5px] font-extrabold uppercase tracking-widest block mb-0.5"
            style={{ color: accentColor }}
          >
            {items[0]?.level || "TIER 3 · APEX VISION"}
          </span>
          <h4 className="text-xs sm:text-[13.5px] font-bold leading-tight line-clamp-1">
            {items[0]?.title}
          </h4>
          {items[0]?.description && (
            <p className="text-[10px] sm:text-[11px] text-white/90 font-normal mt-0.5 leading-tight line-clamp-2">
              {items[0]?.description}
            </p>
          )}
        </div>
      </div>

      {/* Tier 2: Mid-Level Strategic Thrusts */}
      <div className="flex justify-center w-full">
        <div
          className="w-full max-w-2xl rounded-lg p-2 sm:p-2.5 shadow-xs border border-[#E5C310] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5"
          style={{ backgroundColor: accentColor, color: "#111111" }}
        >
          <div className="flex-1 min-w-0">
            <span className="text-[9px] sm:text-[9.5px] font-extrabold uppercase tracking-wider opacity-80 block mb-0.5">
              {items[1]?.level || "TIER 2 · STRATEGIC PILLARS"}
            </span>
            <h5 className="text-xs sm:text-[13px] font-bold leading-tight line-clamp-1">
              {items[1]?.title}
            </h5>
            {items[1]?.description && (
              <p className="text-[10px] sm:text-[11px] font-normal opacity-90 mt-0.5 leading-tight line-clamp-2">
                {items[1]?.description}
              </p>
            )}
          </div>
          {items[1]?.items && items[1].items.length > 0 && (
            <div className="flex flex-wrap gap-1 shrink-0 sm:max-w-[260px]">
              {items[1].items.map((it, idx) => (
                <span
                  key={idx}
                  className="px-1.5 py-0.5 rounded bg-neutral-900 text-white text-[9px] font-bold truncate max-w-[120px]"
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
        <div className="w-full max-w-3xl rounded-lg p-2 sm:p-2.5 bg-neutral-50/90 border border-neutral-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 shadow-2xs">
          <div className="flex-1 min-w-0">
            <span className="text-[9px] sm:text-[9.5px] font-bold uppercase tracking-wider text-neutral-500 block mb-0.5">
              {items[2]?.level || "TIER 1 · FOUNDATION & ENABLERS"}
            </span>
            <h5 className="text-xs sm:text-[13px] font-bold text-neutral-900 leading-tight line-clamp-1">
              {items[2]?.title}
            </h5>
            {items[2]?.description && (
              <p className="text-[10px] sm:text-[11px] text-neutral-600 font-normal mt-0.5 leading-tight line-clamp-2">
                {items[2]?.description}
              </p>
            )}
          </div>
          {items[2]?.items && items[2].items.length > 0 && (
            <div className="flex flex-wrap gap-1 shrink-0 sm:max-w-[280px]">
              {items[2].items.map((it, idx) => (
                <span
                  key={idx}
                  className="px-1.5 py-0.5 rounded bg-neutral-200/80 text-neutral-800 text-[9px] font-semibold border border-neutral-300/60 truncate max-w-[130px]"
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
      <div className="md:col-span-4 rounded-lg bg-neutral-50/90 border border-neutral-200/80 p-3.5 sm:p-4 flex flex-col justify-between shadow-2xs">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 block mb-1">
            {currentAsIs.tag || "CURRENT (AS-IS)"}
          </span>
          <h4 className="text-xs sm:text-sm font-bold text-neutral-900 mb-2.5">
            {currentAsIs.title}
          </h4>
          <ul className="space-y-1.5">
            {currentAsIs.points.map((pt, i) => (
              <li key={i} className="text-[11px] sm:text-xs text-neutral-600 flex items-start gap-1.5 leading-snug">
                <span className="text-rose-500 font-bold shrink-0">✕</span>
                <span>{pt}</span>
              </li>
            ))}
          </ul>
        </div>
        <span className="text-[9.5px] font-medium text-neutral-400 italic mt-3 pt-2 border-t border-neutral-100">
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
      <div className="md:col-span-4 rounded-lg bg-blue-50/40 border-2 border-[#005AAB] p-3.5 sm:p-4 flex flex-col justify-between shadow-2xs">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#005AAB] block mb-1">
            {currentToBe.tag || "TARGET OUTCOME (TO-BE)"}
          </span>
          <h4 className="text-xs sm:text-sm font-bold text-neutral-900 mb-2.5">
            {currentToBe.title}
          </h4>
          <ul className="space-y-1.5">
            {currentToBe.points.map((pt, i) => (
              <li key={i} className="text-[11px] sm:text-xs text-neutral-700 flex items-start gap-1.5 leading-snug">
                <span className="text-[#005AAB] font-bold shrink-0">✓</span>
                <span>{pt}</span>
              </li>
            ))}
          </ul>
        </div>
        <span className="text-[9.5px] font-bold text-[#005AAB] mt-3 pt-2 border-t border-blue-100">
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
            className="rounded-lg p-3 sm:p-3.5 bg-neutral-50/80 border border-neutral-200/80 flex items-center justify-between gap-3 shadow-2xs"
          >
            <div>
              {sat.tag && (
                <span className="text-[9.5px] font-bold uppercase tracking-wider text-[#005AAB] block mb-0.5">
                  {sat.tag}
                </span>
              )}
              <h5 className="text-xs sm:text-sm font-bold text-neutral-900 leading-tight">
                {sat.title}
              </h5>
              <p className="text-[10.5px] sm:text-[11.5px] text-neutral-600 leading-snug mt-0.5">
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
            className="rounded-lg p-3 sm:p-3.5 bg-neutral-50/80 border border-neutral-200/80 flex items-center justify-between gap-3 shadow-2xs"
          >
            <div>
              {sat.tag && (
                <span className="text-[9.5px] font-bold uppercase tracking-wider text-[#005AAB] block mb-0.5">
                  {sat.tag}
                </span>
              )}
              <h5 className="text-xs sm:text-sm font-bold text-neutral-900 leading-tight">
                {sat.title}
              </h5>
              <p className="text-[10.5px] sm:text-[11.5px] text-neutral-600 leading-snug mt-0.5">
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
  isUIDeck = false,
  isBinusDeck = false,
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
  isUIDeck?: boolean;
  isBinusDeck?: boolean;
}) {
  const isFinanceOrUI = isUIDeck || /universitas\s*indonesia|ui\s*×\s*revou|\bui\b|makara/i.test(`${title} ${subtitle || ""} ${insightText} ${afterTitle}`);
  const isBinus = !isUIDeck && (isBinusDeck || /binus|bina\s*nusantara/i.test(`${title} ${subtitle || ""} ${insightText} ${afterTitle}`));
  const card2Bg = isFinanceOrUI ? "bg-neutral-950 text-white" : isBinus ? "bg-[#23A3E7] text-white" : "bg-[#005AAB] text-white";
  const accentColor = isFinanceOrUI ? "#FEDE3B" : isBinus ? "#FFDE3D" : "#FFDD3C";
  const arrowColor = isFinanceOrUI ? "text-neutral-950" : isBinus ? "text-[#23A3E7]" : "text-[#005AAB]";
  const insightBg = isFinanceOrUI ? "bg-neutral-950" : isBinus ? "bg-[#174A7F]" : "bg-[#005AAB]";

  const leftBgColor = isFinanceOrUI ? "#000000" : isBinus ? "#174A7F" : "#005AAB";

  return (
    <div className="w-full h-full flex flex-row relative select-none overflow-hidden bg-white">
      {/* Left Split Panel (~33% width) with Institution Dark Background */}
      <div
        className="w-[33%] sm:w-[32%] h-full pt-[13%] sm:pt-[15%] pl-[5%] sm:pl-[6%] pr-3 sm:pr-4 flex flex-col justify-start relative z-10 shadow-sm"
        style={{ backgroundColor: leftBgColor }}
      >
        {/* Yellow accent bar */}
        <div className="w-16 sm:w-24 h-2 sm:h-2.5 rounded-full mb-3 shrink-0" style={{ backgroundColor: accentColor }} />

        {/* Title: 700 Bold, White text */}
        <h1
          className={`font-bold text-white ${fontTitleClass} leading-[1.18] tracking-tight line-clamp-3 ${
            isPresentation ? "text-2xl sm:text-3xl lg:text-4xl" : "text-xl sm:text-2xl lg:text-[28px]"
          }`}
        >
          {title}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p
            className={`font-semibold mt-2 sm:mt-2.5 leading-snug line-clamp-2 ${
              isPresentation ? "text-sm sm:text-base lg:text-lg" : "text-xs sm:text-sm lg:text-[15px]"
            }`}
            style={{ color: accentColor }}
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

      {/* Right White Panel (~67% width) */}
      <div className="w-[67%] sm:w-[68%] h-full pt-[8%] sm:pt-[9%] pr-[5%] sm:pr-[6%] pl-4 sm:pl-6 pb-[12%] sm:pb-[14%] flex flex-col justify-center gap-3 sm:gap-4 relative z-10 bg-white">
        {/* Two Comparison Cards: Before vs After */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-h-0">
          {/* Card 1: BEFORE AI (Light Grey) */}
          <div className="flex-1 h-full rounded-lg bg-[#F1F1F1] p-3.5 sm:p-4.5 flex flex-col justify-start overflow-hidden border border-neutral-200/50">
            <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-[#595959] mb-2 block">
              {beforeTitle}
            </span>
            <div className="space-y-1.5 text-xs sm:text-[13px] text-[#272525] leading-relaxed overflow-hidden scrollbar-none">
              {beforeItems && beforeItems.length > 0 ? (
                beforeItems.map((item, idx) => (
                  <p key={idx} className="leading-snug line-clamp-3 sm:line-clamp-4">{item}</p>
                ))
              ) : (
                <p className="leading-snug line-clamp-4 sm:line-clamp-5">
                  {beforeText || "Rule-based dispatch and human coordination across hundreds of concurrent requests. Bottleneck: human bandwidth caps matching quality."}
                </p>
              )}
            </div>
          </div>

          {/* Arrow */}
          <div className={`${arrowColor} font-black text-xl sm:text-2xl shrink-0 px-1`}>
            →
          </div>

          {/* Card 2: AFTER AI (Solid Black in UI, Solid Deep Blue in ITB) */}
          <div className={`flex-1 h-full rounded-lg ${card2Bg} p-3.5 sm:p-4.5 flex flex-col justify-start overflow-hidden relative shadow-sm`}>
            <div className="w-8 sm:w-10 h-1 rounded-full mb-2 shrink-0" style={{ backgroundColor: accentColor }} />
            <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider mb-2 block" style={{ color: accentColor }}>
              {afterTitle}
            </span>
            <div className="space-y-1.5 text-xs sm:text-[13px] text-white/95 leading-relaxed overflow-hidden scrollbar-none">
              {afterItems && afterItems.length > 0 ? (
                afterItems.map((item, idx) => (
                  <p key={idx} className="leading-snug font-medium line-clamp-3 sm:line-clamp-4">{item}</p>
                ))
              ) : (
                <p className="leading-snug font-medium line-clamp-4 sm:line-clamp-5">
                  {afterText || "ML allocation optimises several objectives at once with real-time feedback loops. Leaders set pricing logic, fairness guardrails and escalation rules."}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Full-Width Key Insight Bar */}
        <div className={`w-full ${insightBg} border-l-[8px] sm:border-l-[12px] rounded-md px-4 py-2.5 sm:py-3 text-white text-xs sm:text-[13px] font-medium leading-snug shrink-0 shadow-xs`} style={{ borderLeftColor: accentColor }}>
          <span className="font-extrabold mr-1.5" style={{ color: accentColor }}>Key insight:</span>
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
  isUIDeck = false,
  isBinusDeck = false,
  transparentBg = false,
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
  isUIDeck?: boolean;
  isBinusDeck?: boolean;
  transparentBg?: boolean;
}) {
  const isFinanceOrUI = isUIDeck || /universitas\s*indonesia|ui\s*×\s*revou|\bui\b|makara/i.test(`${title} ${subtitle || ""} ${tag}`);
  const isBinus = !isUIDeck && (isBinusDeck || /binus|bina\s*nusantara/i.test(`${title} ${subtitle || ""} ${tag}`));
  const accentColor = isFinanceOrUI ? "#FEDE3B" : isBinus ? "#FFDE3D" : "#FFDD3C";
  const photoBorder = isFinanceOrUI
    ? "border-[#FEDE3B] bg-[#FFFDF5] text-neutral-900"
    : isBinus
    ? "border-[#23A3E7] bg-[#EAF5FC] text-[#174A7F]"
    : "border-[#005AAB] bg-[#EAF2FB] text-[#005AAB]";
  const tagColor = isFinanceOrUI ? "text-neutral-950 font-black" : isBinus ? "text-[#018ED5] font-black" : "text-[#005AAB]";

  const leftBgColor = transparentBg ? "transparent" : (isFinanceOrUI ? "#000000" : isBinus ? "#174A7F" : "#005AAB");

  return (
    <div className={`w-full h-full flex flex-row relative select-none overflow-hidden ${transparentBg ? "bg-transparent" : "bg-white"}`}>
      {/* Left Split Panel (~33% width) with Institution Dark Background */}
      <div
        className={`w-[33%] sm:w-[32%] h-full pt-[13%] sm:pt-[15%] pl-[5%] sm:pl-[6%] pr-3 sm:pr-4 flex flex-col justify-start relative z-10 ${transparentBg ? "" : "shadow-sm"}`}
        style={transparentBg ? undefined : { backgroundColor: leftBgColor }}
      >
        <div className="w-16 sm:w-24 h-2 sm:h-2.5 rounded-full mb-3 shrink-0" style={{ backgroundColor: accentColor }} />
        <h1
          className={`font-bold text-white ${fontTitleClass} leading-[1.18] tracking-tight line-clamp-3 ${
            isPresentation ? "text-2xl sm:text-3xl lg:text-4xl" : "text-xl sm:text-2xl lg:text-[28px]"
          }`}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className={`font-semibold mt-2 sm:mt-2.5 leading-snug line-clamp-2 ${
              isPresentation ? "text-sm sm:text-base lg:text-lg" : "text-xs sm:text-sm lg:text-[15px]"
            }`}
            style={{ color: accentColor }}
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

      {/* Right Content Panel (~67% width) */}
      <div className={`w-[67%] sm:w-[68%] h-full pt-[8%] sm:pt-[9%] pr-[5%] sm:pr-[6%] pl-4 sm:pl-6 pb-[12%] sm:pb-[14%] flex items-center gap-6 sm:gap-8 relative z-10 ${transparentBg ? "bg-transparent" : "bg-white"}`}>
        {/* Circle Photo */}
        <div className={`w-28 sm:w-36 h-28 sm:h-36 rounded-full border-4 ${photoBorder} flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 overflow-hidden shadow-xs`}>
          {photoUrl ? (
            <img src={photoUrl} alt={title} className="w-full h-full object-cover" />
          ) : (
            <span>[Photo]</span>
          )}
        </div>

        {/* Bio Details */}
        <div className="flex-1 space-y-2">
          <span className={`text-xs sm:text-sm font-bold ${tagColor} tracking-widest uppercase block`}>
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

/* ───────────────────────────────────────────────────
 * 31. Control Chart Worked Example (RevoU / Claude Statistical Process Control)
 * ─────────────────────────────────────────────────── */
export interface ControlChartWorkedExampleProps {
  bigStat?: {
    value: string;
    label: string;
  };
  baselineBox?: {
    title?: string;
    centreText?: string;
    limitsText?: string;
  };
  incidentBox?: {
    title?: string;
    incidents?: Array<{ date: string; value: string; reason: string }>;
  };
  chartData?: {
    baselineLabel?: string;
    uclLabel?: string;
    centreLabel?: string;
    lclLabel?: string;
    timePoints?: string[];
    outliers?: Array<{ label: string; date: string; value: string; xPercent: number; yPercent: number }>;
  };
  isPresentation?: boolean;
}

export function ControlChartWorkedExample({
  bigStat = { value: "40,000", label: "top-ups a day" },
  baselineBox = {
    title: "JULY BASELINE",
    centreText: "Centre 97.26%",
    limitsText: "Limits 96.30% – 98.22%",
  },
  incidentBox = {
    title: "BELOW THE LOWER LIMIT",
    incidents: [
      { date: "14 Aug", value: "94.1%", reason: "payment-gateway outage (logged)" },
      { date: "26 Sep", value: "95.8%", reason: "partner-bank maintenance (logged)" },
    ],
  },
  chartData = {
    baselineLabel: "July baseline",
    uclLabel: "UCL",
    centreLabel: "Centre",
    lclLabel: "LCL",
    timePoints: ["1 Jul", "1 Aug", "1 Sep", "1 Oct"],
    outliers: [
      { label: "14 Aug · 94.1%", date: "14 Aug", value: "94.1%", xPercent: 37, yPercent: 78 },
      { label: "26 Sep · 95.8%", date: "26 Sep", value: "95.8%", xPercent: 72, yPercent: 48 },
    ],
  },
  isPresentation = false,
}: ControlChartWorkedExampleProps) {
  return (
    <div className="w-full flex-1 grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-8 items-center my-auto">
      {/* Left Column (7 of 12 cols): Native Control Chart (XmR / p-chart) */}
      <div className="md:col-span-7 flex flex-col justify-center h-full">
        <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] max-h-[360px] bg-transparent">
          {/* Shaded Baseline Region (e.g. July baseline) */}
          <div className="absolute top-0 bottom-6 left-[16%] w-[20%] bg-[#EBF3FB] rounded-t-sm flex flex-col items-center pt-1.5">
            <span className="text-[11px] sm:text-xs font-semibold text-[#005AAB]">
              {chartData.baselineLabel || "July baseline"}
            </span>
          </div>

          {/* Left Y-Axis Labels */}
          <div className="absolute top-0 bottom-6 left-0 w-[14%] flex flex-col justify-between text-right pr-2 text-xs font-bold text-[#005AAB] select-none">
            <span className="translate-y-2">{chartData.uclLabel || "UCL"}</span>
            <span>{chartData.centreLabel || "Centre"}</span>
            <span className="-translate-y-2">{chartData.lclLabel || "LCL"}</span>
          </div>

          {/* Upper Control Limit (UCL) - Dashed Blue */}
          <div className="absolute top-[18%] left-[15%] right-0 border-b-[2px] border-dashed border-[#005AAB]" />

          {/* Centre Line - Solid Deep Blue */}
          <div className="absolute top-[50%] left-[15%] right-0 border-b-[2.5px] border-solid border-[#005AAB]" />

          {/* Lower Control Limit (LCL) - Dashed Blue */}
          <div className="absolute top-[82%] left-[15%] right-0 border-b-[2px] border-dashed border-[#005AAB]" />

          {/* Outlier Data Points (Yellow Glow Dots with Black Core) */}
          {chartData.outliers?.map((pt, idx) => (
            <div
              key={idx}
              className="absolute flex items-center gap-2 -translate-y-1/2 z-10"
              style={{ left: `${pt.xPercent}%`, top: `${pt.yPercent}%` }}
            >
              {/* Point Dot */}
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#FFDD3C] border-[3px] border-[#1F2937] shrink-0 shadow-xs" />
              {/* Point Label */}
              <span className="text-[11px] sm:text-xs font-bold text-neutral-900 whitespace-nowrap bg-white/80 px-1 py-0.5 rounded">
                {pt.label}
              </span>
            </div>
          ))}

          {/* Bottom X-Axis Solid Line */}
          <div className="absolute bottom-6 left-[15%] right-0 border-b-[2px] border-neutral-700" />

          {/* Bottom X-Axis Time Labels */}
          <div className="absolute bottom-0 left-[15%] right-0 flex justify-between text-[11px] sm:text-xs text-neutral-600 font-medium select-none pt-1">
            {chartData.timePoints?.map((tp, idx) => (
              <span key={idx}>{tp}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column (5 of 12 cols): 3 Stacked Cards */}
      <div className="md:col-span-5 flex flex-col gap-3 sm:gap-4 justify-center">
        {/* 1. Yellow Big Stat Card */}
        <div className="rounded-lg bg-[#FFDD3C] p-4 sm:p-5 text-center flex flex-col justify-center items-center shadow-xs">
          <span className="text-3xl sm:text-4xl lg:text-[42px] font-black text-neutral-950 tracking-tight leading-none">
            {bigStat.value}
          </span>
          <span className="text-xs sm:text-sm font-semibold text-neutral-900 mt-1">
            {bigStat.label}
          </span>
        </div>

        {/* 2. White Card with Thin Blue Border (Baseline Limits) */}
        <div className="rounded-lg border-[2px] border-[#005AAB] bg-white p-3.5 sm:p-4 shadow-xs">
          <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-[#005AAB] block mb-1">
            {baselineBox.title || "JULY BASELINE"}
          </span>
          <p className="text-xs sm:text-sm font-medium text-neutral-800 leading-snug">
            {baselineBox.centreText}
          </p>
          <p className="text-xs sm:text-sm font-medium text-neutral-800 leading-snug">
            {baselineBox.limitsText}
          </p>
        </div>

        {/* 3. Solid Deep Blue Card (Incidents Below Lower Limit) */}
        <div className="rounded-lg bg-[#005AAB] p-3.5 sm:p-4 text-white shadow-xs">
          <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-[#FFDD3C] block mb-1.5">
            {incidentBox.title || "BELOW THE LOWER LIMIT"}
          </span>
          <div className="space-y-1.5 text-xs sm:text-sm leading-snug">
            {incidentBox.incidents?.map((inc, i) => (
              <p key={i}>
                <strong className="text-white font-bold">{inc.date} · {inc.value}:</strong>{" "}
                <span className="text-blue-100">{inc.reason}</span>
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────
 * 32. Machine Learning Pipeline Slide (3-Stage Hands-on Pipeline)
 * ─────────────────────────────────────────────────── */
export interface MLPipelineSlideProps {
  steps?: Array<{ stepNumber: number; title: string; color?: "yellow" | "blue" }>;
  tableData?: {
    tag?: string;
    headers?: string[];
    rows?: Array<{ input: string; output: string }>;
  };
  modelData?: {
    description?: string;
    rootNode?: string;
    leftBranchLabel?: string;
    rightBranchLabel?: string;
    leftChildNode?: string;
    rightChildNode?: string;
    leafYellowNode?: string;
  };
  inferenceData?: {
    inputLabel?: string;
    inputText?: string;
    outputLabel?: string;
    outputText?: string;
  };
  bottomNote?: string;
  isPresentation?: boolean;
}

export function MLPipelineSlide({
  steps = [
    { stepNumber: 1, title: "Data Preparation", color: "yellow" },
    { stepNumber: 2, title: "Build the AI Model", color: "blue" },
    { stepNumber: 3, title: "Run the AI Model", color: "yellow" },
  ],
  tableData = {
    tag: "TRAINING DATA",
    headers: ["Text Input", "Label Output"],
    rows: [
      { input: "Terima kasih informasinya", output: "NON SPAM" },
      { input: "Jumat jangan lupa jam 8 di PVJ, tempat biasa ya", output: "NON SPAM" },
      { input: "Jangan kehabisan, diskon tiket nonton bareng, akses di https://...", output: "SPAM" },
      { input: "...", output: "" },
    ],
  },
  modelData = {
    description: "Learn/extract pattern from data using a Machine Learning/Deep Learning algorithm. Model type: symbolic (decision tree).",
    rootNode: "diskon",
    leftBranchLabel: "ya",
    rightBranchLabel: "tidak",
    leftChildNode: "pulsa",
    rightChildNode: "beli...",
    leafYellowNode: "spam",
  },
  inferenceData = {
    inputLabel: "INPUT",
    inputText: "tersedia diskon pulsa 50% hanya di https://...",
    outputLabel: "OUTPUT",
    outputText: "SPAM",
  },
  bottomNote = "Note: If the data is incorrect (or of poor quality), the AI model will also learn incorrect patterns and produce incorrect outputs.",
  isPresentation = false,
}: MLPipelineSlideProps) {
  return (
    <div className="w-full flex-1 flex flex-col justify-between py-1 my-auto">
      {/* 3-Step Chevron Header Bar */}
      <div className="w-full flex items-center h-10 sm:h-12 mb-4 sm:mb-6">
        {steps.map((st, i) => {
          const isYellow = st.color === "yellow" || i % 2 === 0;
          const bg = isYellow ? "#FFDD3C" : "#005AAB";
          const textColor = isYellow ? "#111111" : "#FFFFFF";

          return (
            <div
              key={i}
              className={`flex-1 h-full flex items-center justify-center font-bold relative ${
                isPresentation ? "text-sm sm:text-base" : "text-xs sm:text-sm"
              }`}
              style={{
                backgroundColor: bg,
                color: textColor,
                clipPath:
                  i === 0
                    ? "polygon(0% 0%, calc(100% - 14px) 0%, 100% 50%, calc(100% - 14px) 100%, 0% 100%)"
                    : i === steps.length - 1
                    ? "polygon(0% 0%, calc(100% - 14px) 0%, 100% 50%, calc(100% - 14px) 100%, 0% 100%, 14px 50%)"
                    : "polygon(0% 0%, calc(100% - 14px) 0%, 100% 50%, calc(100% - 14px) 100%, 0% 100%, 14px 50%)",
              }}
            >
              <span className="truncate px-4">
                {st.stepNumber} · {st.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* 3 Columns Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 items-start flex-1 min-h-0 mb-4">
        {/* Column 1: Training Data Table */}
        <div className="flex flex-col h-full">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#005AAB] mb-1.5">
            {tableData.tag || "TRAINING DATA"}
          </span>
          <div className="rounded-md border border-neutral-200 overflow-hidden bg-white shadow-2xs">
            <table className="w-full text-left text-xs sm:text-[13px] border-collapse">
              <thead>
                <tr className="bg-[#005AAB] text-white">
                  <th className="py-2 px-3 font-semibold border-r border-blue-600">
                    {tableData.headers?.[0] || "Text Input"}
                  </th>
                  <th className="py-2 px-3 font-semibold whitespace-nowrap">
                    {tableData.headers?.[1] || "Label Output"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {tableData.rows?.map((row, rIdx) => (
                  <tr key={rIdx} className={rIdx % 2 === 1 ? "bg-neutral-50/60" : "bg-white"}>
                    <td className="py-2 px-3 text-neutral-800 leading-snug border-r border-neutral-200">
                      {row.input}
                    </td>
                    <td className="py-2 px-3 font-medium text-neutral-700 whitespace-nowrap">
                      {row.output}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Column 2: Build the AI Model (Decision Tree Diagram) */}
        <div className="flex flex-col h-full justify-between">
          <p className="text-xs sm:text-[13px] text-neutral-600 leading-relaxed mb-3">
            {modelData.description}
          </p>

          {/* Mini Decision Tree Diagram */}
          <div className="my-auto flex flex-col items-center justify-center py-2">
            {/* Root Node */}
            <div className="px-4 py-1 rounded-md bg-[#005AAB] text-white font-bold text-xs shadow-xs">
              {modelData.rootNode || "diskon"}
            </div>

            {/* Tree Branch SVG */}
            <svg className="w-48 h-8 text-neutral-400" viewBox="0 0 192 32" fill="none">
              <path d="M96 0 V10 L44 24 V32" stroke="#005AAB" strokeWidth="2" />
              <path d="M96 0 V10 L148 24 V32" stroke="#005AAB" strokeWidth="2" />
              <text x="60" y="14" fill="#555" fontSize="10" fontWeight="bold">
                {modelData.leftBranchLabel || "ya"}
              </text>
              <text x="120" y="14" fill="#555" fontSize="10" fontWeight="bold">
                {modelData.rightBranchLabel || "tidak"}
              </text>
            </svg>

            {/* Level 2 Nodes */}
            <div className="w-full flex justify-around items-center px-2">
              {/* Left Child Branch: Pulsa */}
              <div className="flex flex-col items-center">
                <div className="px-3 py-1 rounded-md bg-[#005AAB] text-white font-bold text-xs shadow-xs">
                  {modelData.leftChildNode || "pulsa"}
                </div>
                {/* Branch to leaves */}
                <svg className="w-24 h-6 text-neutral-400" viewBox="0 0 96 24" fill="none">
                  <path d="M48 0 V8 L20 18 V24" stroke="#005AAB" strokeWidth="2" />
                  <path d="M48 0 V8 L76 18 V24" stroke="#005AAB" strokeWidth="2" />
                </svg>
                <div className="flex gap-3 items-center">
                  <span className="px-2.5 py-0.5 rounded-sm bg-[#FFDD3C] text-neutral-900 font-bold text-[11px] shadow-2xs">
                    {modelData.leafYellowNode || "spam"}
                  </span>
                  <span className="text-neutral-400 text-xs font-bold">....</span>
                </div>
              </div>

              {/* Right Child Node */}
              <div className="px-3 py-1 rounded-md bg-neutral-100 border border-neutral-300 text-neutral-600 font-medium text-xs">
                {modelData.rightChildNode || "beli..."}
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Run the AI Model (Input & Output Cards) */}
        <div className="flex flex-col h-full justify-center space-y-3">
          {/* Input Card: White with Deep Blue border */}
          <div className="rounded-lg border-2 border-[#005AAB] p-3 sm:p-3.5 bg-white shadow-xs">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#005AAB] block mb-1">
              {inferenceData.inputLabel || "INPUT"}
            </span>
            <p className="text-xs sm:text-[13px] font-semibold text-neutral-900 leading-snug">
              {inferenceData.inputText}
            </p>
          </div>

          {/* Down Arrow Indicator */}
          <div className="text-center text-[#005AAB] text-lg font-bold leading-none select-none">
            ↓
          </div>

          {/* Output Card: Solid Deep Blue with Yellow Header */}
          <div className="rounded-lg bg-[#005AAB] p-3.5 sm:p-4 text-white shadow-xs">
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-[#FFDD3C] block mb-1">
              {inferenceData.outputLabel || "OUTPUT"}
            </span>
            <p className="text-xl sm:text-2xl font-black text-white tracking-wide">
              {inferenceData.outputText}
            </p>
          </div>
        </div>
      </div>

      {/* Full-Width Note Callout Banner at Bottom */}
      {bottomNote && (
        <div className="w-full rounded-md bg-[#005AAB] text-white p-2.5 sm:p-3 flex items-center gap-3 relative overflow-hidden shadow-2xs">
          <div className="w-1.5 self-stretch bg-[#FFDD3C] rounded-full shrink-0" />
          <p className="text-xs sm:text-[13px] leading-snug font-normal">
            <strong className="font-bold text-[#FFDD3C]">Note:</strong> {bottomNote.replace(/^Note:\s*/i, "")}
          </p>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────────────────────────────────
 * 33. LLM Token Prediction & Generation Slide
 * ─────────────────────────────────────────────────── */
export interface LLMGenerationSlideProps {
  overviewText?: string;
  tokens?: string[];
  probabilities?: Array<{ word: string; pct: number; isTop?: boolean }>;
  promptText?: string;
  answerText?: string;
  tagPill?: string;
  isPresentation?: boolean;
}

export function LLMGenerationSlide({
  overviewText = "AI guesses an output word based on the previous words. LLM (Large Language Model): ChatGPT, Gemini, etc.",
  tokens = ["<s>", "Golden", "Indonesia", "2045", "...", "</s>"],
  probabilities = [
    { word: "2045", pct: 20, isTop: true },
    { word: "Emas", pct: 15 },
    { word: "term", pct: 14 },
    { word: "vision", pct: 10 },
    { word: "transform", pct: 8 },
  ],
  promptText = '"Write about Golden Indonesia 2045"',
  answerText = "Golden Indonesia 2045 (Indonesia Emas 2045) is Indonesia's long-term national vision to transform the country into a sovereign, advanced, prosperous, and sustainable nation by 2045, coinciding with the 100th anniversary of Indonesia's independence. The vision is embedded in Indonesia's National Long-Term Development Plan (RPJPN) 2025–2045.",
  tagPill = "Stochastic Parrot",
  isPresentation = false,
}: LLMGenerationSlideProps) {
  const maxPct = Math.max(...probabilities.map((p) => p.pct), 20);

  return (
    <div className="w-full flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center my-auto py-2">
      {/* Left Column (cols 1-6): Token Prediction & Probability Distribution */}
      <div className="md:col-span-6 flex flex-col justify-between h-full space-y-4">
        {/* Overview text */}
        <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
          {overviewText}
        </p>

        {/* Token Sequence Chain */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 select-none">
          {tokens.map((tok, i) => {
            const isSpecial = tok.startsWith("<") && tok.endsWith(">");
            return (
              <React.Fragment key={i}>
                <span
                  className={`px-2.5 py-1 rounded-md text-xs sm:text-[13px] font-semibold transition-all ${
                    isSpecial
                      ? "bg-[#005AAB] text-white"
                      : "bg-white border border-neutral-300 text-neutral-800 shadow-2xs"
                  }`}
                >
                  {tok}
                </span>
                {i < tokens.length - 1 && (
                  <span className="text-neutral-400 font-bold text-xs">→</span>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Next-Word Probability Bar Chart */}
        <div className="flex flex-col pt-1">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#005AAB] mb-2.5">
            NEXT-WORD PROBABILITIES AFTER &quot;GOLDEN INDONESIA&quot;
          </span>
          <div className="space-y-2">
            {probabilities.map((item, pIdx) => {
              const widthPct = Math.round((item.pct / maxPct) * 100);
              const isTop = item.isTop ?? pIdx === 0;

              return (
                <div key={pIdx} className="flex items-center gap-3 text-xs sm:text-sm">
                  <span
                    className={`w-20 text-right truncate font-medium ${
                      isTop ? "text-neutral-900 font-bold" : "text-neutral-600"
                    }`}
                  >
                    {item.word}
                  </span>

                  {/* Horizontal Bar */}
                  <div className="flex-1 bg-neutral-100 rounded-xs h-4 overflow-hidden relative">
                    <div
                      className={`h-full rounded-xs transition-all duration-500 ${
                        isTop ? "bg-[#005AAB]" : "bg-[#93BBE5]"
                      }`}
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>

                  <span
                    className={`w-10 text-left font-bold ${
                      isTop ? "text-neutral-900" : "text-neutral-500"
                    }`}
                  >
                    {item.pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Column (cols 7-12): Prompt & LLM Answer */}
      <div className="md:col-span-6 flex flex-col justify-center space-y-4">
        {/* Prompt Card: White with Deep Blue border */}
        <div className="rounded-lg border-2 border-[#005AAB] p-3.5 sm:p-4 bg-white shadow-xs">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#005AAB] block mb-1.5">
            PROMPT
          </span>
          <p className="text-xs sm:text-sm font-semibold text-neutral-800 leading-snug">
            {promptText}
          </p>
        </div>

        {/* LLM Answer Card: Soft Light Gray Background */}
        <div className="rounded-lg bg-[#F4F6F9] p-4 sm:p-5 border border-neutral-200/60 shadow-xs">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-500 block mb-2">
            LLM ANSWER
          </span>
          <p className="text-xs sm:text-[13px] text-neutral-800 leading-relaxed font-normal">
            {answerText}
          </p>
        </div>

        {/* Tag Pill (e.g. Stochastic Parrot) */}
        {tagPill && (
          <div className="pt-1">
            <span className="inline-block px-3.5 py-1 rounded-full bg-[#FFDD3C] text-neutral-950 font-bold text-xs tracking-wide shadow-2xs">
              {tagPill}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────
 * 34. Hands-On Case Worksheet Slide (3 Need Cards + Exercise Table + TWIST)
 * ─────────────────────────────────────────────────── */
export interface CaseWorksheetSlideProps {
  needCards?: Array<{
    tag: string;
    team: string;
    description: string;
    color?: "yellow" | "blue";
  }>;
  taskInstruction?: string;
  tableHeaders?: string[];
  tableRows?: Array<{
    need: string;
    systemType?: string;
    failureRisk?: string;
    humanInTheLoop?: string;
  }>;
  twistBadge?: string;
  twistPrompt?: string;
  isPresentation?: boolean;
}

export function CaseWorksheetSlide({
  needCards = [
    {
      tag: "NEED 1",
      team: "Call centre",
      description: '3,000 calls a week asking "When will my power come back?" and "What documents do I need for a new connection?"',
      color: "yellow",
    },
    {
      tag: "NEED 2",
      team: "Asset team",
      description: "Early warning on which transformers are likely to fail in the next 3 months",
      color: "blue",
    },
    {
      tag: "NEED 3",
      team: "Operations",
      description: "Dispatch repair crews automatically for small, routine outages",
      color: "yellow",
    },
  ],
  taskInstruction = "Task: for each need, choose the system type (LLM alone / RAG knowledge assistant / copilot / predictive non-GenAI model / agentic workflow), name the main failure risk and where a human must stay in the loop. Then read the TWIST and write your reply to the vendor.",
  tableHeaders = ["Need", "System type", "Main failure risk", "Human-in-the-loop where"],
  tableRows = [
    { need: "1 · Call centre" },
    { need: "2 · Asset team" },
    { need: "3 · Operations" },
  ],
  twistBadge = "TWIST: [to be added]",
  twistPrompt = "Reply to the vendor (2–3 sentences): ...",
  isPresentation = false,
}: CaseWorksheetSlideProps) {
  return (
    <div className="w-full flex-1 flex flex-col justify-between py-1 my-auto space-y-3.5">
      {/* 3 Need Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4 items-stretch">
        {needCards.map((card, i) => {
          const isBlue = card.color === "blue" || i === 1;

          return (
            <div
              key={i}
              className={`rounded-lg p-3.5 sm:p-4 flex flex-col justify-between transition-all ${
                isBlue
                  ? "bg-[#005AAB] text-white shadow-xs"
                  : "bg-[#FFDD3C] text-neutral-900 shadow-2xs"
              }`}
            >
              <div>
                <span
                  className={`text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider block mb-1 ${
                    isBlue ? "text-[#FFDD3C]" : "text-neutral-800"
                  }`}
                >
                  {card.tag}
                </span>
                <h4
                  className={`text-xs sm:text-sm font-bold block mb-1 ${
                    isBlue ? "text-white" : "text-neutral-950"
                  }`}
                >
                  {card.team}
                </h4>
              </div>
              <p
                className={`text-[11px] sm:text-xs leading-snug ${
                  isBlue ? "text-blue-100" : "text-neutral-900"
                }`}
              >
                {card.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Task Instruction Line */}
      {taskInstruction && (
        <p className="text-[11px] sm:text-xs text-neutral-800 font-medium leading-relaxed">
          <strong className="font-bold text-neutral-950">Task:</strong> {taskInstruction.replace(/^Task:\s*/i, "")}
        </p>
      )}

      {/* 4-Column Worksheet Table */}
      <div className="rounded-md border border-neutral-200 overflow-hidden bg-white shadow-2xs">
        <table className="w-full text-left text-xs sm:text-[13px] border-collapse">
          <thead>
            <tr className="bg-[#005AAB] text-white">
              {tableHeaders.map((head, hIdx) => (
                <th
                  key={hIdx}
                  className={`py-2 px-3 font-semibold ${
                    hIdx < tableHeaders.length - 1 ? "border-r border-blue-600" : ""
                  } ${hIdx === 0 ? "w-[22%]" : "w-[26%]"}`}
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {tableRows.map((row, rIdx) => {
              const isSoftBlueRow = rIdx % 2 === 0;

              return (
                <tr
                  key={rIdx}
                  className={isSoftBlueRow ? "bg-[#EBF3FB]/75" : "bg-white"}
                >
                  <td className="py-2.5 px-3 font-medium text-neutral-900 border-r border-neutral-200 whitespace-nowrap">
                    {row.need}
                  </td>
                  <td className="py-2.5 px-3 text-neutral-700 border-r border-neutral-200">
                    {row.systemType || ""}
                  </td>
                  <td className="py-2.5 px-3 text-neutral-700 border-r border-neutral-200">
                    {row.failureRisk || ""}
                  </td>
                  <td className="py-2.5 px-3 text-neutral-700">
                    {row.humanInTheLoop || ""}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Bottom TWIST Callout & Dotted Participant Line */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center gap-3">
          <span className="px-3 py-0.5 rounded-sm bg-[#FFDD3C] text-neutral-950 font-bold text-xs uppercase tracking-wider shrink-0 shadow-2xs">
            {twistBadge}
          </span>
          <span className="text-xs sm:text-[13px] text-neutral-700 font-medium">
            {twistPrompt}
          </span>
        </div>
        <div className="w-full border-b border-dashed border-blue-300 h-2" />
      </div>
    </div>
  );
}
