"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Play,
  Download,
  Share2,
  Maximize2,
  Minimize2,
  Layers,
  BarChart3,
  TrendingUp,
  Lightbulb,
  CheckCircle2,
  Plus,
  FileText,
  Lock,
  Paperclip,
  Check,
  Type,
  LayoutGrid,
  Paintbrush,
  Users,
  Target,
  Sliders,
  Clock,
  ArrowUpRight,
  Presentation,
  Image as ImageIcon,
  Upload,
  Video,
  Wand2,
  Grid,
  ChevronUp,
  ChevronDown,
  MessageSquare,
  RefreshCw,
  PenTool,
  PanelLeftClose,
  PanelLeftOpen,
  Copy,
  X,
  FileCode,
  Trash2,
  ArrowUp,
  ArrowDown,
  Edit3,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/layout/SidebarContext";
import { exportDeckToPptx } from "@/lib/deck-export";
import { SlideChart } from "@/components/decks/SlideCharts";
import {
  FlowDiagram,
  ComparisonTable,
  MilestoneTimeline,
  ArchitectureStack,
  QuadrantMatrix,
  FunnelDiagram,
  CycleLoop,
  ChevronProcessBar,
  GaugeRings,
  AscendingTrajectory,
  VerticalProgressStack,
  BubbleClusterDiagram,
  ConnectedVerticalRings,
  HorizontalMilestonesBar,
  SplitMetricHero,
  CurvedCycleLoop,
  AsymmetricMatrixGrid,
} from "@/components/decks/SlideDiagrams";
import { CloneStyleModal, type ClonedStyleResult } from "@/components/decks/CloneStyleModal";

/* ───────────────────────────────────────────────────
 * Types & Theme Presets
 * ─────────────────────────────────────────────────── */
interface SlideData {
  id: string;
  layout: SlideLayout;
  bgStyle?: "white" | "yellowGradient" | "boldYellow";
  title: string;
  subtitle?: string;
  badge?: string;
  category?: string;
  bullets?: string[];
  stats?: { value: string; label: string }[];
  description?: string;
  highlight?: string;
  processSteps?: { title: string; description: string }[];
  chartData?: Array<{ name: string; value: number; secondary?: number; label?: string }>;
  flowNodes?: Array<{ title: string; subtitle?: string; tag?: string }>;
  timelineMilestones?: Array<{ quarter: string; title: string; description: string; status?: "done" | "active" | "planned" }>;
  tableHeaders?: string[];
  tableRows?: Array<{ feature?: string; current?: string | boolean; proposed?: string | boolean; cells?: Array<string | boolean>; [key: string]: unknown }>;
  quadrantData?: {
    q1?: Array<{ title: string; subtitle?: string }>;
    q2?: Array<{ title: string; subtitle?: string }>;
    q3?: Array<{ title: string; subtitle?: string }>;
    q4?: Array<{ title: string; subtitle?: string }>;
  };
  funnelStages?: Array<{ label: string; value: string; rate?: string; subtext?: string }>;
  cycleNodes?: Array<{ title: string; description?: string; percentage?: string }>;
  chevronSteps?: Array<{ title: string; percentage?: string; description?: string; position?: "top" | "bottom" }>;
  gaugeItems?: Array<{ percentage: number; title: string; description: string }>;
  trajectoryNodes?: Array<{ percentage: string; title: string; description?: string }>;
  verticalProgressItems?: Array<{ title: string; percentage: number; description?: string; tag?: string }>;
  metricBox?: { value: string; label?: string; description?: string };
  horizontalMilestones?: Array<{ percentage: string; title: string; description: string }>;
  bubbleNodes?: Array<{ title: string; percentage: number; color?: "yellow" | "black"; description?: string }>;
  connectedRings?: Array<{ percentage: number; title: string; description: string }>;
  asymmetricCards?: Array<{ stat: string; text: string }>;
  cards?: Array<{
    title: string;
    subtitle?: string;
    description?: string;
    tag?: string;
    bullets?: string[];
    footer?: string;
    headerBg?: "yellow" | "black" | "gray";
    content?: string;
  }>;
  actionItems?: Array<{ verb?: string; text: string; tag?: string }>;
  pollOptions?: Array<{ label: string; text: string; isHighlighted?: boolean }>;
  bottomBanners?: Array<{ title: string; text: string; variant?: "yellow" | "black" | "gray" }>;
  calloutBox?: { title?: string; text: string; variant?: "yellow" | "black" | "accent" | "gray" };
  promptBox?: { label: string; prompt: string };
  quote?: { text: string; author?: string };
  topRightPill?: string;
  ctaText?: string;
  footer?: string;
  slideNumber?: string;
  imageUrl?: string;
}

type SlideLayout =
  | "title"
  | "hero"
  | "stats"
  | "bullets"
  | "process"
  | "twoColumn"
  | "bigNumber"
  | "chartBar"
  | "chartArea"
  | "chartDonut"
  | "chartRadar"
  | "flowDiagram"
  | "timeline"
  | "tableComparison"
  | "quadrantMatrix"
  | "funnel"
  | "cycleLoop"
  | "architecture"
  | "chevronProcess"
  | "gaugeRings"
  | "ascendingTrajectory"
  | "verticalProgress"
  | "splitMetric"
  | "horizontalMilestones"
  | "bubbleCluster"
  | "connectedRings"
  | "asymmetricMatrix"
  | "boldStatement"
  | "imageSplitMetric"
  | "boldImpact"
  | "cta"
  | "actionList"
  | "cardGrid"
  | "caseStudy"
  | "splitPoll"
  | "interactiveCase"
  | "breakSlide"
  | "keyInsight";

type ContentMode = "generate" | "summarize" | "preserve";
type BgStyle = "mixed" | "solid" | "dualtone" | "gradient" | "dark" | "warm";
type FontPairing = "editorial" | "modern" | "creative";
export type TitleFont = "sf-pro" | "bricolage" | "jakarta" | "outfit" | "lora" | "inter" | "red-hat" | "red-hat-display";
export type BodyFont = "sf-pro" | "inter" | "jakarta" | "outfit" | "red-hat" | "red-hat-display";
type LayoutMood = "executive" | "framework" | "data";

export const TITLE_FONTS: Array<{ id: TitleFont; name: string; tag: string }> = [
  { id: "sf-pro", name: "SF Pro Display", tag: "Apple Modern • Recommended" },
  { id: "red-hat", name: "Red Hat Display", tag: "ITB Academic Standard" },
  { id: "bricolage", name: "Bricolage Grotesque", tag: "Creative Neo • Bold" },
  { id: "jakarta", name: "Plus Jakarta Sans", tag: "Modern Geometric • Clean" },
  { id: "outfit", name: "Outfit", tag: "Tech Venture • Contemporary" },
  { id: "lora", name: "Lora Serif", tag: "Editorial Prestige • Classic" },
  { id: "inter", name: "Inter Display", tag: "Minimalist Tech • Crisp" },
];

export const BODY_FONTS: Array<{ id: BodyFont; name: string; tag: string }> = [
  { id: "sf-pro", name: "SF Pro Text", tag: "Apple Default • High Legibility" },
  { id: "red-hat", name: "Red Hat Display", tag: "ITB Academic Standard" },
  { id: "inter", name: "Inter Sans", tag: "Global UI Standard" },
  { id: "jakarta", name: "Plus Jakarta Sans", tag: "Modern Geometric" },
  { id: "outfit", name: "Outfit Sans", tag: "Contemporary Tech" },
];

export function getTitleFontClass(font: TitleFont = "sf-pro"): string {
  switch (font) {
    case "red-hat":
    case "red-hat-display":
      return "font-sans font-bold tracking-tight";
    case "bricolage":
      return "font-bricolage font-extrabold tracking-tight";
    case "jakarta":
      return "font-jakarta font-extrabold tracking-tight";
    case "outfit":
      return "font-outfit font-extrabold tracking-tight";
    case "lora":
      return "font-lora font-bold tracking-normal";
    case "inter":
      return "font-inter font-extrabold tracking-tight";
    case "sf-pro":
    default:
      return "font-sf font-sans font-extrabold tracking-tight";
  }
}

export function getBodyFontClass(font: BodyFont = "sf-pro"): string {
  switch (font) {
    case "red-hat":
    case "red-hat-display":
      return "font-sans";
    case "inter":
      return "font-inter";
    case "jakarta":
      return "font-jakarta";
    case "outfit":
      return "font-outfit";
    case "sf-pro":
    default:
      return "font-sf";
  }
}

/* ───────────────────────────────────────────────────
 * Standard .md Prompt Template & Auto-Detection Helpers
 * ─────────────────────────────────────────────────── */
export const STANDARD_MD_TEMPLATE = `#Headline: Transformasi Digital & Efisiensi Operasional 2025
#Subheadline: Peta Jalan Strategis Menuju Keunggulan Operasional dan Pertumbuhan Berkelanjutan
#Deskripsi: Inisiatif menyeluruh untuk mengintegrasikan otomatisasi sistem kerja modern, mempercepat kolaborasi lintas divisi, dan memaksimalkan nilai bagi klien.
#Visual: Title / Hero

-----

#Headline: Tantangan Utama & Hambatan Operasional
#Subheadline: Mengidentifikasi friksi dalam alur kerja konvensional saat ini
#Deskripsi: Analisis internal menemukan 3 hambatan utama yang memperlambat kecepatan eksekusi dan meningkatkan biaya operasional.
#Bullet:
- Proses persetujuan manual yang memakan waktu rata-rata 5-7 hari kerja
- Fragmentasi data antar divisi yang menyebabkan duplikasi pekerjaan
- Kurangnya visibilitas metrik kerja secara real-time untuk pengambilan keputusan
#Visual: Key Insights / Bullets

-----

#Headline: Solusi Terpadu: Pendekatan Dua Pilar
#Subheadline: Perbandingan arsitektur konvensional versus sistem terpadu modern
#Deskripsi: Mengganti alur kerja terfragmentasi dengan sistem terintegrasi yang memangkas waktu siklus hingga 70%.
#Bullet:
- Pilar 1: Otomatisasi Dokumen & Alur Kerja Mandiri
- Pilar 2: Pusat Data Terpadu & Dashboard Eksekutif Real-Time
#Visual: Two Column / Comparison

-----

#Headline: Tahapan Implementasi & Rollout 4 Fase
#Subheadline: Framework eksekusi terstruktur untuk memastikan adopsi tanpa gangguan
#Deskripsi: Pendekatan sistematis 4 fase yang memastikan pelatihan tim dan migrasi data berjalan mulus dan terkontrol.
#Bullet:
- Fase 1: Audit Kebutuhan & Standardisasi Sistem
- Fase 2: Integrasi Platform Inti & Uji Coba Pilot
- Fase 3: Pelatihan Menyeluruh & Implementasi Skala Penuh
- Fase 4: Optimasi Berkelanjutan & Review Kinerja
#Visual: Process / Workflow

-----

#Headline: Komitmen Eksekusi & Langkah Selanjutnya
#Subheadline: Bersama membangun masa depan organisasi yang lebih tangkas dan produktif
#Deskripsi: Tim kepemimpinan siap memulai fase audit perdana minggu depan dengan target penyelesaian pilot project dalam 30 hari.
#Visual: Bold Statement / CTA`;

export function extractDashSlideBlocks(text: string): string[] {
  if (!text || !text.trim()) return [];
  let blocks = text
    .split(/(?:^|\r?\n)\s*-{3,}[^\r\n]*\s*(?:\r?\n|$)/g)
    .map((b) => b.trim())
    .filter(Boolean);

  if (blocks.length > 1) {
    const first = blocks[0];
    const isFirstAnIntroPrompt =
      first.split("\n").length <= 3 &&
      !/#(?:Headline|Title|Slide|Deskripsi|Bullet|Stat|Visual)/i.test(first) &&
      (/(?:create|make|generate|buat|bikin|presentasi|presentation)\s+(?:a\s+)?(?:\d+[\s\-]?)?(?:slide|deck|presentation)/i.test(first) ||
       blocks.slice(1).some((b) => /#(?:Headline|Title)/i.test(b)));

    if (isFirstAnIntroPrompt) {
      blocks = blocks.slice(1);
    }
  }
  return blocks;
}

export function detectPromptSlideCount(text: string): {
  count: number | null;
  source: "dashes" | "numbered" | "explicit" | "none";
  label: string;
} {
  if (!text || !text.trim()) return { count: null, source: "none", label: "Auto Detect" };

  // 1. Check for explicit # Slide 1 or Slide 1: formats (Gamma outlines, executive markdown)
  const explicitSlideMatches = Array.from(text.matchAll(/(?:^|\n)\s*#*\s*Slide\s*\d+[^\n]*/gi));
  if (explicitSlideMatches.length >= 1) {
    return {
      count: explicitSlideMatches.length,
      source: "explicit",
      label: `${explicitSlideMatches.length} Slide (#Slide Outline)`,
    };
  }

  // 2. Check for '-----' delimiters (3 or more dashes on their own line)
  const dashBlocks = extractDashSlideBlocks(text);
  if (dashBlocks.length > 1 || (dashBlocks.length === 1 && /-{3,}/.test(text))) {
    return {
      count: dashBlocks.length,
      source: "dashes",
      label: `${dashBlocks.length} Slide (.md '-----')`,
    };
  }

  // 3. Check for numbered slide items (e.g. 1. Slide 1, 2. Slide 2 or 1. Slide 1 (Bar Chart): ...)
  const numberedSlideMatches = Array.from(
    text.matchAll(/(?:^|\n)\s*(\d+)[\.\)]\s*(?:Slide\s*\d+|Slide\b|\*\*Slide)/gi)
  );
  if (numberedSlideMatches.length >= 2) {
    return {
      count: numberedSlideMatches.length,
      source: "numbered",
      label: `${numberedSlideMatches.length} Slide (Numbered Prompt)`,
    };
  }

  // 4. Check for explicit text (e.g. 5-slide, 5 slides, 7 slide presentation)
  const explicitMatch = text.match(/(\d+)\s*[-_]?\s*(?:slide|slides)/i);
  if (explicitMatch && parseInt(explicitMatch[1], 10) > 0) {
    const num = parseInt(explicitMatch[1], 10);
    return {
      count: num,
      source: "explicit",
      label: `${num} Slide (Terdeteksi dalam Teks)`,
    };
  }

  return { count: null, source: "none", label: "Auto Detect" };
}

export interface ParsedSlideBreakdown {
  slideNumber: number;
  headline: string;
  subheadline?: string;
  visualLayout?: string;
  description?: string;
  stats?: string[];
  bullets?: string[];
  tableSummary?: string;
}

export function parsePromptBreakdown(text: string): ParsedSlideBreakdown[] {
  if (!text || !text.trim()) return [];

  // 1. Explicit #Slide 1..#Slide N or Gamma Outlines
  const explicitSlideMatches = Array.from(text.matchAll(/(?:^|\n)\s*#*\s*Slide\s*(\d+)[^\n]*/gi));
  if (explicitSlideMatches.length >= 1) {
    return explicitSlideMatches.map((m, idx) => {
      const startIndex = m.index! + m[0].length;
      const endIndex = idx + 1 < explicitSlideMatches.length ? explicitSlideMatches[idx + 1].index! : text.length;
      const headerLine = m[0].trim();
      const blockText = text.substring(startIndex, endIndex).trim();

      // Extract headline: title after Slide X: or top # line or Headline:
      const headerTitleMatch = headerLine.match(/Slide\s*\d+\s*[:·\-]\s*(.+)/i);
      const explicitHeadlineMatch = blockText.match(/(?:(?:\*\*|#)?\s*(?:Headline|Title):\s*(?:\*\*)?)\s*([^\n]+)/i);
      const topHeaderMatch = blockText.split("\n")[0]?.match(/^#\s+([^#\n]+)/);

      let headline = explicitHeadlineMatch
        ? explicitHeadlineMatch[1].trim()
        : headerTitleMatch
        ? headerTitleMatch[1].trim()
        : topHeaderMatch
        ? topHeaderMatch[1].trim()
        : `Slide ${idx + 1}`;
      headline = headline.replace(/^\*+|\*+$/g, "").trim();

      // Extract subheadline: ## Subtitle or Subtitle:
      const subheadlineMatch =
        blockText.match(/(?:(?:\*\*|#)?\s*(?:Subheadline|Subtitle):\s*(?:\*\*)?)\s*([^\n]+)/i) ||
        blockText.match(/(?:^|\n)\s*##\s+([^#\n]+)/);
      const subheadline = subheadlineMatch ? subheadlineMatch[1].replace(/^\*+|\*+$/g, "").trim() : undefined;

      // Extract visual layout hint: 🗒️ Note: or Visual: or Layout:
      const visualMatch = blockText.match(
        /(?:(?:\*\*|#)?\s*(?:🗒️\s*)?(?:Note|Visual\/Smart Layout Recommendation|Visual Recommendation|Visual|Layout|Catatan Desain|Rekomendasi Visual|Design Note)[^:]*:\s*(?:\*\*)?)\s*([^\n]+)/i
      );
      let visualLayout = visualMatch ? visualMatch[1].trim() : undefined;

      // Extract markdown table
      const tableLines = blockText
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.startsWith("|") && l.endsWith("|"));
      const tableSummary = tableLines.length >= 2 ? tableLines.join("\n") : undefined;
      if (tableSummary && !visualLayout) {
        visualLayout = "Comparison Table";
      }

      // Extract bullets
      const bullets = blockText
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => /^[•\-\*\+]\s+/.test(l) || /^\d+[\.\)]\s+/.test(l))
        .map((l) => l.replace(/^[•\-\*\+\d\.\)\s]+/, "").trim())
        .filter((l) => l.length > 0 && !l.startsWith("Note:") && !l.startsWith("Visual:"));

      // Extract narrative description
      const nonBullets = blockText
        .split("\n")
        .map((l) => l.trim())
        .filter(
          (l) =>
            l.length > 0 &&
            !l.startsWith("#") &&
            !/^[•\-\*\+]\s+/.test(l) &&
            !/^\d+[\.\)]\s+/.test(l) &&
            !l.startsWith("|") &&
            !/(?:🗒️|Note:|Visual:|Headline:|Subtitle:|Deskripsi:)/i.test(l)
        );
      const description = nonBullets.length > 0 ? nonBullets.join(" ") : undefined;

      return {
        slideNumber: idx + 1,
        headline,
        subheadline,
        visualLayout: visualLayout || (idx === 0 ? "Title / Executive Hero" : "Structured Layout"),
        description,
        bullets: bullets.length > 0 ? bullets : undefined,
        tableSummary,
      };
    });
  }

  // 2. Delimited by '-----' (3 or more dashes)
  const dashBlocks = extractDashSlideBlocks(text);
  if (dashBlocks.length > 1 || (dashBlocks.length === 1 && (/-{3,}/.test(text) || /#(?:Headline|Title|Visual|Deskripsi)/i.test(text)))) {
    return dashBlocks.map((block, idx) => {
      const headlineMatch = block.match(/#(?:Headline|Title):\s*([^\n]+)/i);
      const headline = headlineMatch
        ? headlineMatch[1].trim()
        : block.split("\n")[0]?.replace(/^#+\s*/, "").trim() || `Slide ${idx + 1}`;

      const subheadline = block.match(/#(?:Subheadline|Subtitle):\s*([^\n]+)/i)?.[1]?.trim();
      
      let visualLayout = block.match(/(?:#(?:Visual|Layout)|(?:🗒️\s*)?(?:Note|Design Note)):\s*([^\n]+)/i)?.[1]?.trim();
      if (!visualLayout) {
        if (/bar chart|barchart|clustered bar/i.test(block)) visualLayout = "Bar Chart Comparison";
        else if (/pie chart|donut/i.test(block)) visualLayout = "Pie / Donut Chart Breakdown";
        else if (/metric|kpi|stat|grid/i.test(block)) visualLayout = "Metrics & KPI Grid";
        else if (/roadmap|timeline/i.test(block)) visualLayout = "Strategic Roadmap Timeline";
        else if (/table|komparasi/i.test(block)) visualLayout = "Comparison Table";
        else if (/process|flow|working capital flow/i.test(block)) visualLayout = "Process & Flow Diagram";
        else visualLayout = idx === 0 ? "Title / Executive Hero" : "Visual Layout";
      }

      let description = block.match(/#(?:Deskripsi|Description):\s*([\s\S]*?)(?=(?:#(?:Headline|Subheadline|Visual|Stat|Metrik|Bullet|Tabel|Table)|$))/i)?.[1]?.trim();
      if (!description) {
        const nonHeaderLines = block
          .split("\n")
          .filter((l) => l.trim() && !l.startsWith("#") && !/^[•\-\*]\s+/.test(l.trim()));
        if (nonHeaderLines.length > 1) {
          description = nonHeaderLines.slice(1).join(" ").trim();
        }
      }

      const statMatch = block.match(/#(?:Stat|Metrik):\s*([^\n]+)/i)?.[1]?.trim();
      const stats = statMatch ? statMatch.split(/\|/).map((s) => s.trim()).filter(Boolean) : undefined;

      const bulletMatch = block.match(/#(?:Bullet|Bullets):\s*([^\n]+)/i)?.[1]?.trim();
      let bullets: string[] | undefined = bulletMatch
        ? bulletMatch.split(/\|/).map((b) => b.trim()).filter(Boolean)
        : undefined;
      if (!bullets) {
        const rawBullets = block
          .split("\n")
          .filter((l) => /^[•\-\*]\s+/.test(l.trim()))
          .map((l) => l.replace(/^[•\-\*]\s+/, "").trim());
        if (rawBullets.length > 0) bullets = rawBullets;
      }

      const tableMatch = block.match(/#(?:Tabel|Table):\s*([^\n]+)/i)?.[1]?.trim();

      return {
        slideNumber: idx + 1,
        headline,
        subheadline,
        visualLayout,
        description,
        stats,
        bullets,
        tableSummary: tableMatch,
      };
    });
  }

  // 3. Numbered list (e.g. 1. Slide 1 (Title): ..., 2. Slide 2 (Bar Chart): ...)
  const numberedPattern =
    /(?:^|\n)\s*(\d+)[\.\)]\s*(?:Slide\s*\d+[^:\n]*[:\-\.]\s*|(?:\*\*Slide\s*\d+\*\*[:\-\.]?\s*))?([^\n]+(?:\n(?!\d+[\.\)]\s*(?:Slide|\*\*Slide))[^\n]+)*)/gi;
  const matches = [...text.matchAll(numberedPattern)];
  if (matches.length >= 2) {
    return matches.map((m, idx) => {
      const fullText = m[0].trim();
      let visualLayout = "Structured Layout";
      if (/bar chart/i.test(fullText)) visualLayout = "Bar Chart Comparison";
      else if (/pie chart|donut/i.test(fullText)) visualLayout = "Pie / Donut Chart Breakdown";
      else if (/metrics grid|kpi|metric/i.test(fullText)) visualLayout = "Metrics & KPI Grid";
      else if (/roadmap|timeline|scaling plan/i.test(fullText)) visualLayout = "Strategic Roadmap Timeline";
      else if (/title|milestones summary/i.test(fullText) || idx === 0) visualLayout = "Title / Executive Hero";
      else if (/table|komparasi/i.test(fullText)) visualLayout = "Comparison Table";

      const parenMatch = fullText.match(/\(([^)]*(?:Chart|Grid|Roadmap|Timeline|Title|Table|Hero)[^)]*)\)/i);
      if (parenMatch && parenMatch[1]) visualLayout = parenMatch[1];

      let rawLine = m[2]?.trim() || fullText;
      let headline = rawLine.replace(/^\([^)]+\)\s*:?\s*/, "").split("\n")[0]?.trim();
      if (headline.length > 95) headline = headline.slice(0, 92) + "...";

      const statMatches = fullText.match(
        /\b(?:Q\d|CAC|LTV|CSAT|Retention|B2C|B2B|Bootcamp|[A-Za-z]+)\s*[:=]\s*[\$\d\.,%/\-]+/gi
      );

      return {
        slideNumber: idx + 1,
        headline: headline || `Slide ${idx + 1}`,
        subheadline: `Slide ${idx + 1} • ${visualLayout}`,
        visualLayout,
        description: fullText.length > 200 ? fullText.slice(0, 197) + "..." : fullText,
        stats: statMatches && statMatches.length > 0 ? statMatches : undefined,
      };
    });
  }

  // 4. Fallback: Split by paragraphs (preserve all paragraphs, no arbitrary cap)
  const paras = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  return paras.map((p, i) => ({
    slideNumber: i + 1,
    headline: p.split("\n")[0]?.replace(/^[#\s*•-]+/, "").trim() || `Slide ${i + 1}`,
    subheadline: `Slide ${i + 1} • Executive Narrative`,
    visualLayout: i === 0 ? "Title / Executive Hero" : "Structured Layout",
    description: p,
  }));
}

export const VISUAL_LAYOUT_OPTIONS = [
  { id: "Title / Executive Hero", label: "🏷️ Title / Executive Hero" },
  { id: "Bar Chart Comparison", label: "📊 Bar Chart Comparison" },
  { id: "Pie / Donut Chart Breakdown", label: "🥧 Pie / Donut Chart" },
  { id: "Metrics & KPI Grid", label: "📈 Metrics & KPI Grid" },
  { id: "Strategic Roadmap Timeline", label: "🗺️ Strategic Roadmap" },
  { id: "Comparison Table", label: "⚖️ Comparison Table" },
  { id: "Process & Flow Diagram", label: "🔄 Process & Flow" },
  { id: "Split Metric Hero", label: "⚡ Split Metric Hero" },
  { id: "Executive Narrative", label: "📄 Executive Narrative" },
];

export function formatBreakdownToMarkdown(cards: ParsedSlideBreakdown[]): string {
  return cards
    .map((c) => {
      const lines: string[] = [];
      lines.push(`# Slide ${c.slideNumber}: ${c.headline}`);
      if (c.subheadline) lines.push(`## ${c.subheadline}`);
      if (c.description) lines.push(c.description);
      if (c.bullets && c.bullets.length > 0) {
        c.bullets.forEach((b) => lines.push(`- ${b}`));
      }
      if (c.stats && c.stats.length > 0) {
        lines.push(`Stats: ${c.stats.join(" | ")}`);
      }
      if (c.tableSummary) lines.push(c.tableSummary);
      if (c.visualLayout) lines.push(`🗒️ Note: ${c.visualLayout}`);
      return lines.join("\n");
    })
    .join("\n\n---\n\n");
}

/* ───────────────────────────────────────────────────
 * Safe Text and Data Normalizers (Guaranteed Zero React Child Crash)
 * ─────────────────────────────────────────────────── */
export function safeString(val: any, fallback = ""): string {
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

export function mapVisualLayoutToLayout(val?: string): SlideLayout {
  if (!val) return "bullets";
  const lower = val.toLowerCase();
  if (lower.includes("hero") || lower.includes("cover") || lower.includes("title")) return "hero";
  if (lower.includes("two") || lower.includes("column") || lower.includes("split")) return "twoColumn";
  if (lower.includes("process") || lower.includes("step")) return "process";
  if (lower.includes("timeline") || lower.includes("roadmap")) return "timeline";
  if (lower.includes("table") || lower.includes("comparison")) return "tableComparison";
  if (lower.includes("flow") || lower.includes("diagram") || lower.includes("architecture")) return "flowDiagram";
  if (lower.includes("stat") || lower.includes("metric") || lower.includes("number")) return "stats";
  if (lower.includes("bold") || lower.includes("impact") || lower.includes("cta")) return "boldStatement";
  if (lower.includes("chart") || lower.includes("bar")) return "chartBar";
  if (lower.includes("donut") || lower.includes("pie")) return "chartDonut";
  if (lower.includes("insight") || lower.includes("quote")) return "keyInsight";
  return "bullets";
}

export function normalizeSlide(raw: any, index: number = 0): SlideData {
  if (!raw || typeof raw !== "object") {
    return {
      id: `slide-${index + 1}`,
      layout: "hero",
      title: `Slide ${index + 1}`,
    };
  }

  const validLayouts: SlideLayout[] = [
    "title", "hero", "stats", "bullets", "process", "twoColumn", "bigNumber",
    "chartBar", "chartArea", "chartDonut", "chartRadar", "flowDiagram", "timeline",
    "tableComparison", "quadrantMatrix", "funnel", "cycleLoop", "architecture",
    "chevronProcess", "gaugeRings", "ascendingTrajectory", "verticalProgress",
    "splitMetric", "horizontalMilestones", "bubbleCluster", "connectedRings",
    "asymmetricMatrix", "boldStatement", "imageSplitMetric", "boldImpact", "cta",
    "actionList", "cardGrid", "caseStudy", "splitPoll", "interactiveCase", "breakSlide", "keyInsight"
  ];
  let layout: SlideLayout = raw.layout || "bullets";
  if (!validLayouts.includes(layout)) {
    layout = raw.bullets?.length ? "bullets" : (raw.processSteps?.length ? "process" : "hero");
  }

  let bgStyle: SlideData["bgStyle"] = "white";
  if (raw.bgStyle === "boldYellow" || raw.bgStyle === "yellowGradient" || raw.bgStyle === "white") {
    bgStyle = raw.bgStyle;
  } else if (layout === "boldStatement" || layout === "boldImpact") {
    bgStyle = "boldYellow";
  } else if (layout === "imageSplitMetric") {
    bgStyle = "yellowGradient";
  }

  let bullets: string[] | undefined = undefined;
  if (Array.isArray(raw.bullets)) {
    bullets = raw.bullets.map((b: any) => safeString(b)).filter((s: string) => s.length > 0);
  }

  let processSteps: Array<{ title: string; description: string }> | undefined = undefined;
  if (Array.isArray(raw.processSteps)) {
    processSteps = raw.processSteps.map((s: any) => {
      if (typeof s === "string") return { title: s, description: "" };
      return {
        title: safeString(s?.title || s?.name || s?.step || "Step"),
        description: safeString(s?.description || s?.detail || s?.desc || ""),
      };
    });
  }

  let stats: Array<{ value: string; label: string }> | undefined = undefined;
  if (Array.isArray(raw.stats)) {
    stats = raw.stats.map((st: any) => {
      if (typeof st === "string") return { value: st, label: "" };
      return {
        value: safeString(st?.value ?? st?.stat ?? st?.val ?? ""),
        label: safeString(st?.label ?? st?.title ?? st?.text ?? ""),
      };
    });
  }

  let chartData: Array<{ name: string; value: number; secondary?: number; label?: string }> | undefined = undefined;
  if (Array.isArray(raw.chartData)) {
    chartData = raw.chartData.map((cd: any) => {
      const numVal = typeof cd?.value === "number" ? cd.value : parseFloat(String(cd?.value || 0)) || 0;
      const numSec = cd?.secondary !== undefined ? (typeof cd.secondary === "number" ? cd.secondary : parseFloat(String(cd.secondary || 0)) || 0) : undefined;
      return {
        name: safeString(cd?.name || cd?.label || "Metric"),
        value: numVal,
        secondary: numSec,
        label: cd?.label ? safeString(cd.label) : undefined,
      };
    });
  }

  let flowNodes: Array<{ title: string; subtitle?: string; tag?: string }> | undefined = undefined;
  if (Array.isArray(raw.flowNodes)) {
    flowNodes = raw.flowNodes.map((fn: any, i: number) => {
      if (typeof fn === "string") return { title: fn, tag: `0${i + 1}` };
      return {
        title: safeString(fn?.title || fn?.name || `Node 0${i + 1}`),
        subtitle: fn?.subtitle ? safeString(fn.subtitle) : (fn?.description ? safeString(fn.description) : undefined),
        tag: fn?.tag ? safeString(fn.tag) : `0${i + 1}`,
      };
    });
  }

  let timelineMilestones: Array<{ quarter: string; title: string; description: string; status?: "done" | "active" | "planned" }> | undefined = undefined;
  if (Array.isArray(raw.timelineMilestones)) {
    timelineMilestones = raw.timelineMilestones.map((tm: any, i: number) => ({
      quarter: safeString(tm?.quarter || tm?.phase || `Q${i + 1}`),
      title: safeString(tm?.title || tm?.name || "Milestone"),
      description: safeString(tm?.description || tm?.detail || ""),
      status: (tm?.status === "done" || tm?.status === "active" || tm?.status === "planned") ? tm.status : "planned",
    }));
  }

  let tableHeaders: string[] | undefined = undefined;
  if (Array.isArray(raw.tableHeaders)) {
    tableHeaders = raw.tableHeaders.map((h: any) => safeString(h));
  }

  let tableRows: SlideData["tableRows"] = undefined;
  if (Array.isArray(raw.tableRows) && raw.tableRows.length > 0) {
    tableRows = raw.tableRows.map((tr: any) => {
      let cells: Array<string | boolean> | undefined = undefined;
      if (Array.isArray(tr?.cells)) {
        cells = tr.cells.map((c: any) => (typeof c === "boolean" ? c : safeString(c ?? "")));
      }
      return {
        feature: tr?.feature ? safeString(tr.feature) : (cells?.[0] !== undefined ? String(cells[0]) : ""),
        current: tr?.current !== undefined ? (typeof tr.current === "boolean" ? tr.current : safeString(tr.current)) : (cells?.[1] !== undefined ? cells[1] : ""),
        proposed: tr?.proposed !== undefined ? (typeof tr.proposed === "boolean" ? tr.proposed : safeString(tr.proposed)) : (cells?.[2] !== undefined ? cells[2] : ""),
        cells,
      };
    });
  }

  let chevronSteps: Array<{ title: string; percentage?: string; description?: string; position?: "top" | "bottom" }> | undefined = undefined;
  if (Array.isArray(raw.chevronSteps)) {
    chevronSteps = raw.chevronSteps.map((cs: any, i: number) => ({
      title: safeString(cs?.title || `Step 0${i + 1}`),
      percentage: cs?.percentage ? safeString(cs.percentage) : `${(i + 1) * 20}%`,
      description: cs?.description ? safeString(cs.description) : "",
      position: cs?.position === "top" ? "top" : "bottom",
    }));
  }

  let gaugeItems: Array<{ percentage: number; title: string; description: string }> | undefined = undefined;
  if (Array.isArray(raw.gaugeItems)) {
    gaugeItems = raw.gaugeItems.map((gi: any) => ({
      percentage: typeof gi?.percentage === "number" ? gi.percentage : parseInt(String(gi?.percentage || 50), 10) || 50,
      title: safeString(gi?.title || "Efficiency"),
      description: safeString(gi?.description || ""),
    }));
  }

  let trajectoryNodes: Array<{ percentage: string; title: string; description?: string }> | undefined = undefined;
  if (Array.isArray(raw.trajectoryNodes)) {
    trajectoryNodes = raw.trajectoryNodes.map((tn: any, i: number) => ({
      percentage: safeString(tn?.percentage || `${70 + i * 10}%`),
      title: safeString(tn?.title || `Phase 0${i + 1}`),
      description: tn?.description ? safeString(tn.description) : undefined,
    }));
  }

  let verticalProgressItems: Array<{ title: string; percentage: number; description?: string; tag?: string }> | undefined = undefined;
  if (Array.isArray(raw.verticalProgressItems)) {
    verticalProgressItems = raw.verticalProgressItems.map((vp: any, i: number) => ({
      title: safeString(vp?.title || `Capability 0${i + 1}`),
      percentage: typeof vp?.percentage === "number" ? vp.percentage : parseInt(String(vp?.percentage || 60), 10) || 60,
      description: vp?.description ? safeString(vp.description) : undefined,
      tag: vp?.tag ? safeString(vp.tag) : `0${i + 1}.`,
    }));
  }

  let horizontalMilestones: Array<{ percentage: string; title: string; description: string }> | undefined = undefined;
  if (Array.isArray(raw.horizontalMilestones)) {
    horizontalMilestones = raw.horizontalMilestones.map((hm: any, i: number) => ({
      percentage: safeString(hm?.percentage || `${(i + 1) * 20}%`),
      title: safeString(hm?.title || `Process ${i + 1}`),
      description: safeString(hm?.description || ""),
    }));
  }

  let bubbleNodes: Array<{ title: string; percentage: number; color?: "yellow" | "black"; description?: string }> | undefined = undefined;
  if (Array.isArray(raw.bubbleNodes)) {
    bubbleNodes = raw.bubbleNodes.map((bn: any, i: number) => ({
      title: safeString(bn?.title || `Process ${String.fromCharCode(65 + i)}`),
      percentage: typeof bn?.percentage === "number" ? bn.percentage : parseInt(String(bn?.percentage || 30), 10) || 30,
      color: bn?.color === "black" ? "black" : "yellow",
      description: bn?.description ? safeString(bn.description) : undefined,
    }));
  }

  let connectedRings: Array<{ percentage: number; title: string; description: string }> | undefined = undefined;
  if (Array.isArray(raw.connectedRings)) {
    connectedRings = raw.connectedRings.map((cr: any, i: number) => ({
      percentage: typeof cr?.percentage === "number" ? cr.percentage : parseInt(String(cr?.percentage || 50), 10) || 50,
      title: safeString(cr?.title || `Project Process 0${i + 1}`),
      description: safeString(cr?.description || ""),
    }));
  }

  let asymmetricCards: Array<{ stat: string; text: string }> | undefined = undefined;
  if (Array.isArray(raw.asymmetricCards)) {
    asymmetricCards = raw.asymmetricCards.map((ac: any) => ({
      stat: safeString(ac?.stat || "70%"),
      text: safeString(ac?.text || ""),
    }));
  }

  let cards: SlideData["cards"] = undefined;
  if (Array.isArray(raw.cards)) {
    cards = raw.cards.map((c: any) => ({
      title: safeString(c?.title || ""),
      subtitle: c?.subtitle ? safeString(c.subtitle) : undefined,
      description: c?.description ? safeString(c.description) : undefined,
      tag: c?.tag ? safeString(c.tag) : undefined,
      bullets: Array.isArray(c?.bullets) ? c.bullets.map((b: any) => safeString(b)) : undefined,
      footer: c?.footer ? safeString(c.footer) : undefined,
      headerBg: c?.headerBg === "yellow" || c?.headerBg === "black" ? c.headerBg : "gray",
      content: c?.content ? safeString(c.content) : undefined,
    }));
  }

  let metricBox: { value: string; label?: string; description?: string } | undefined = undefined;
  if (raw.metricBox && typeof raw.metricBox === "object" && raw.metricBox.value) {
    metricBox = {
      value: safeString(raw.metricBox.value),
      label: raw.metricBox.label ? safeString(raw.metricBox.label) : undefined,
      description: raw.metricBox.description ? safeString(raw.metricBox.description) : undefined,
    };
  }

  // Sanitize & downgrade layouts if visual data is absent
  if (layout === "tableComparison") {
    const hasValidRows = tableRows && tableRows.length > 0 && tableRows.some((r) => (r.feature && r.feature.trim().length > 0) || (r.cells && r.cells.length > 0));
    if (!hasValidRows) {
      layout = bullets && bullets.length >= 2 ? "twoColumn" : "bullets";
    }
  } else if (layout === "flowDiagram") {
    if (!flowNodes || flowNodes.length < 2) {
      if (bullets && bullets.length >= 2) {
        layout = "process";
        processSteps = bullets.map((b, i) => {
          const parts = b.split(/:\s*|\s*-\s*/);
          return {
            title: parts[0] || `Step 0${i + 1}`,
            description: parts.length > 1 ? parts.slice(1).join(": ") : parts[0],
          };
        });
      } else {
        layout = "bullets";
      }
    }
  } else if (layout === "timeline") {
    if (!timelineMilestones || timelineMilestones.length < 2) {
      if (bullets && bullets.length >= 2) {
        layout = "process";
        processSteps = bullets.map((b, i) => {
          const parts = b.split(/:\s*|\s*-\s*/);
          return {
            title: parts[0] || `Phase 0${i + 1}`,
            description: parts.length > 1 ? parts.slice(1).join(": ") : parts[0],
          };
        });
      } else {
        layout = "bullets";
      }
    }
  } else if (layout === "process" || layout === "chevronProcess") {
    if (!processSteps || processSteps.length < 2) {
      if (bullets && bullets.length >= 2) {
        processSteps = bullets.map((b, i) => {
          const parts = b.split(/:\s*|\s*-\s*/);
          return {
            title: parts[0] || `Step 0${i + 1}`,
            description: parts.length > 1 ? parts.slice(1).join(": ") : parts[0],
          };
        });
      } else {
        layout = "bullets";
      }
    }
  } else if (layout === "stats") {
    const hasValidStats = stats && stats.length > 0 && stats.some((st) => st.value && st.value.trim().length > 0);
    if (!hasValidStats) {
      layout = "bullets";
    }
  } else if (layout.startsWith("chart")) {
    const hasValidChart = chartData && chartData.length >= 2 && chartData.some((cd) => cd.value > 0);
    if (!hasValidChart) {
      layout = stats && stats.length >= 1 ? "stats" : "bullets";
    }
  } else if (layout === "cardGrid" || layout === "caseStudy" || layout === "interactiveCase" || layout === "splitPoll") {
    if (!cards || cards.length < 2) {
      layout = bullets && bullets.length >= 2 ? "twoColumn" : "bullets";
    }
  }

  if (layout === "bullets" && (!bullets || bullets.length === 0) && processSteps && processSteps.length > 0) {
    bullets = processSteps.map((p) => p.description ? `${p.title}: ${p.description}` : p.title);
  }
  if (layout === "process" && (!processSteps || processSteps.length === 0) && bullets && bullets.length > 0) {
    processSteps = bullets.map((b) => ({ title: b, description: "" }));
  }

  return {
    id: raw.id || `slide-${index + 1}`,
    layout,
    bgStyle,
    title: safeString(raw.title || `Slide ${index + 1}`),
    subtitle: raw.subtitle ? safeString(raw.subtitle) : undefined,
    badge: raw.badge ? safeString(raw.badge) : undefined,
    category: raw.category ? safeString(raw.category) : undefined,
    description: raw.description ? safeString(raw.description) : undefined,
    highlight: raw.highlight ? safeString(raw.highlight) : undefined,
    bullets,
    processSteps,
    stats,
    chartData,
    flowNodes,
    timelineMilestones,
    tableHeaders,
    tableRows,
    quadrantData: raw.quadrantData,
    funnelStages: raw.funnelStages,
    cycleNodes: raw.cycleNodes,
    chevronSteps,
    gaugeItems,
    trajectoryNodes,
    verticalProgressItems,
    metricBox,
    horizontalMilestones,
    bubbleNodes,
    connectedRings,
    asymmetricCards,
    cards,
    actionItems: raw.actionItems,
    pollOptions: raw.pollOptions,
    bottomBanners: raw.bottomBanners,
    calloutBox: raw.calloutBox,
    promptBox: raw.promptBox,
    quote: raw.quote,
    topRightPill: raw.topRightPill ? safeString(raw.topRightPill) : undefined,
    ctaText: raw.ctaText ? safeString(raw.ctaText) : undefined,
    footer: raw.footer ? safeString(raw.footer) : undefined,
    slideNumber: raw.slideNumber ? safeString(raw.slideNumber) : undefined,
    imageUrl: raw.imageUrl ? safeString(raw.imageUrl) : undefined,
  };
}

interface ColorPalette {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  bgLight: string;
  bgDark: string;
  textPrimary: string;
  badgeBg: string;
}

const COLOR_PALETTES: ColorPalette[] = [
  {
    id: "launcher",
    name: "Launcher Signature",
    primary: "#FFDE3C",
    secondary: "#FFE54C",
    accent: "#F5C400",
    bgLight: "bg-white",
    bgDark: "dark:bg-[#0e0e0e]",
    textPrimary: "text-neutral-950",
    badgeBg: "bg-[#FFDE3C]",
  },
  {
    id: "silicon",
    name: "Silicon Monochrome",
    primary: "#171717",
    secondary: "#404040",
    accent: "#737373",
    bgLight: "bg-neutral-50",
    bgDark: "dark:bg-[#121212]",
    textPrimary: "text-neutral-950",
    badgeBg: "bg-neutral-900 text-white",
  },
  {
    id: "indigo",
    name: "Ocean Indigo",
    primary: "#4F46E5",
    secondary: "#6366F1",
    accent: "#60A5FA",
    bgLight: "bg-slate-50",
    bgDark: "dark:bg-[#0B0F19]",
    textPrimary: "text-indigo-950",
    badgeBg: "bg-indigo-600 text-white",
  },
  {
    id: "emerald",
    name: "Emerald Growth",
    primary: "#059669",
    secondary: "#10B981",
    accent: "#34D399",
    bgLight: "bg-emerald-50/40",
    bgDark: "dark:bg-[#06140E]",
    textPrimary: "text-emerald-950",
    badgeBg: "bg-emerald-600 text-white",
  },
  {
    id: "itb",
    name: "ITB × RevoU Leadership",
    primary: "#005AAB",
    secondary: "#FFDD3C",
    accent: "#FFEC8E",
    bgLight: "bg-white",
    bgDark: "dark:bg-[#00274D]",
    textPrimary: "text-[#272525]",
    badgeBg: "bg-[#005AAB] text-white",
  },
];

/* ───────────────────────────────────────────────────
 * Demo Slide Data (Overpowered Visual Archetypes)
 * ─────────────────────────────────────────────────── */
const DEMO_SLIDES: SlideData[] = [
  {
    id: "s1",
    layout: "hero",
    title: "Process Infographic & Framework",
    subtitle: "Transform Complex Workflows Into High-Impact Visual Stories",
    category: "Executive Strategy",
    badge: "2026 Edition",
  },
  {
    id: "s2",
    layout: "chartBar",
    title: "Quarterly Revenue & ARR Trajectory",
    subtitle: "Demonstrating 140% Year-over-Year Growth Across Core Segments",
    chartData: [
      { name: "Q1 2025", value: 35, secondary: 20 },
      { name: "Q2 2025", value: 65, secondary: 38 },
      { name: "Q3 2025", value: 98, secondary: 60 },
      { name: "Q4 2025", value: 145, secondary: 88 },
    ],
  },
  {
    id: "s3",
    layout: "flowDiagram",
    title: "4-Stage Intelligent Workflow Architecture",
    subtitle: "Connected End-to-End Execution from Raw Prompt to Native PPTX",
    flowNodes: [
      { title: "Input Ingestion", subtitle: "Notes & Raw Outlines", tag: "Step 01" },
      { title: "DeepSeek Engine", subtitle: "Launcher OS Semantic Parser", tag: "Step 02" },
      { title: "Visual Layouts", subtitle: "Charts, Flows & Tokens", tag: "Step 03" },
      { title: "Instant Export", subtitle: "Interactive & PPTX Native", tag: "Step 04" },
    ],
    description: "Every stage is governed by strict anti-hallucination rules and unified design token systems.",
  },
  {
    id: "s4",
    layout: "tableComparison",
    title: "Comparative Feature & Performance Matrix",
    subtitle: "Why Code-Driven Slide Engines Outperform Legacy Tools",
    tableRows: [
      { feature: "Generation Speed", current: "3-5 Minutes", proposed: "< 10 Seconds" },
      { feature: "Native PowerPoint Export (.pptx)", current: false, proposed: true },
      { feature: "Launcher OS Semantic Layout Matching", current: false, proposed: true },
      { feature: "Cost per Million Tokens", current: "$15.00+", proposed: "$0.14 (DeepSeek)" },
      { feature: "Interactive Presentation Mode", current: "Manual PDF only", proposed: "Fullscreen 16:9 Canvas" },
    ],
  },
  {
    id: "s5",
    layout: "timeline",
    title: "Strategic Milestone Roadmap 2026",
    subtitle: "Phased Deployment and Scale Targets",
    timelineMilestones: [
      { quarter: "Q1 2026", title: "Foundation & System", description: "Design token architecture & Launcher OS schema parsing.", status: "done" },
      { quarter: "Q2 2026", title: "AI Streaming Engine", description: "DeepSeek LLM prompt orchestration & real-time canvas.", status: "active" },
      { quarter: "Q3 2026", title: "Multi-Format Export", description: "PowerPoint .pptx, PDF vector layout, and team sharing.", status: "planned" },
      { quarter: "Q4 2026", title: "Global Enterprise Scale", description: "Multi-tenant workspaces & collaborative editing.", status: "planned" },
    ],
  },
  {
    id: "s6",
    layout: "chartDonut",
    title: "Industry Adoption & Market Distribution",
    subtitle: "High-Growth Sectors Driving The Highest Presentation ROI",
    chartData: [
      { name: "Enterprise SaaS", value: 45 },
      { name: "Education & EdTech", value: 25 },
      { name: "Healthcare & Biotech", value: 18 },
      { name: "Finance & Banking", value: 12 },
    ],
  },
  {
    id: "s7",
    layout: "twoColumn",
    title: "Before vs. After Visualization Impact",
    subtitle: "Measurable ROI from Visual Storytelling",
    stats: [
      { value: "35%", label: "Completion Rate (Before)" },
      { value: "88%", label: "Completion Rate (After)" },
    ],
    description: "By structuring complex text into clear visual flows, organizations see drastic improvements in executive comprehension and stakeholder alignment.",
  },
  {
    id: "s8",
    layout: "cta",
    title: "Ready to Transform Your Workflow?",
    subtitle: "Start Crafting Executive Presentations Today",
    description: "Build stunning decks that communicate clearly and inspire immediate action from stakeholders.",
    ctaText: "Launch With Launcher OS →",
  },
];

/* ───────────────────────────────────────────────────
 * Institutional Skills Context (e.g. template-ITB.md)
 * ─────────────────────────────────────────────────── */
interface AttachedSkill {
  id: string;
  name: string;
  title: string;
  content: string;
  badge?: string;
}

const ITB_SKILL_MD = `---
name: itb-deck-design-rules
description: Visual design rules for ITB × RevoU "Data-Driven & AI-Enabled Decision Making for Leaders" slide decks. Use this skill whenever generating, rebuilding, restyling or reviewing any deck, slide, module deck, mentoring deck or GAMMA SLIDE OUTLINE for the ITB program, or any RevoU × ITB partnership deck that should match it.
---

# ITB × RevoU Deck Design Rules

These rules keep every generated deck visually consistent, whatever the module or week. Follow them for every slide.

The guiding idea: **one visual identity, many layouts.** Fonts, colors, backgrounds and components never change. The layout of each slide is chosen from what that slide has to say.

---

## 1. Canvas
- 16:9, designed at 1920 × 1080 px. Minimum readable text size: 24 px. Keep ≤ 170 words per slide.

## 2. Typography
- One font family only: Red Hat Display (fallback: sans-serif). No second font.
- Titles are left-aligned, one line where possible. Action titles are full claims. NEVER end a title with a period!

## 3. Color Palette
- Deep Blue: #005AAB (Titles, primary cards, table headers, key messages, icons)
- Golden Yellow: #FFDD3C (Partner cards, accents, tags, HANDS-ON tag, highlights)
- Blue gradient: #005AAB → #007AE8
- Soft Yellow: #FFEC8E (Note boxes, highlighted cells, part tags)
- Pale yellow: #FFF6CC (Background band)
- Light blue: #EAF2FB (Table stripes, light rows)
- Light grey: #F1F1F1 (Context boxes, "weak/before" panels)
- Text: #272525 (All body text on light backgrounds)
- White: #FFFFFF (Text on blue; card fill)
- No emoji, no status colors (use words: OK / Risk / Wrong).

## 4. Components & Cards
- Rounded cards: radius 16–22 px, padding 22–36 px, no shadows.
- Prompt card: white card, 3 px Deep Blue border, small blue uppercase label ("PROMPT", "TEMPLATE"), prompt text in quotes, blanks as [bold bracketed placeholders] in blue.
- Note box: Soft Yellow #FFEC8E, radius 16, bold lead-in ("Note:", "Rule:", "Remember:").
- Insight bar: Deep Blue with 14 px yellow left edge, white text ("Key insight:").
- HANDS-ON tag: solid Golden Yellow pill beside title, meta line with timing ("10 minutes, squad").
- Speaker notes: mandatory 2–4 sentences executive speaking guidance.
`;

/* ───────────────────────────────────────────────────
 * Dummy Showcase Decks (16:9 Aspect Ratio)
 * ─────────────────────────────────────────────────── */
interface ShowcaseDeck {
  id: string;
  title: string;
  category: string;
  slidesCount: number;
  updatedAt: string;
  accentColor: string;
  layoutType: "hero" | "stats" | "split" | "grid" | "process" | "quote";
  sampleContent: string;
  image?: string;
  badge?: string;
}

const SHOWCASE_DECKS: ShowcaseDeck[] = [
  {
    id: "sc-itb",
    title: "Governance, Risk & Compliance for Data and AI Strategy",
    category: "ITB × RevoU Program",
    slidesCount: 10,
    updatedAt: "Skill Active",
    accentColor: "#005AAB",
    layoutType: "hero",
    image: "/ITB.png",
    badge: "ITB SKILL INSTALLED",
    sampleContent: `#Headline: Governance, Risk & Compliance for Data and AI Strategy
#Subheadline: Guardrails + Approvals + Auditability
#Description: Program Eksekutif ITB × RevoU: Data-Driven & AI-Enabled Decision Making for Leaders.
#Badge: ITB × REVOU
#SpeakerNotes: Sambut para eksekutif dan buka sesi modul ke-10 mengenai Governance, Risk & Compliance. Jelaskan bagaimana pengawasan AI menjadi pembeda utama organisasi resilient.
#Visual: Title / Hero

-----

#Headline: 3 Pilar Utama Tata Kelola AI & Data Tingkat Institusi
#Subheadline: Fondasi operasional untuk memitigasi risiko halusinasi dan kebocoran data
#Description: Setiap keputusan strategis harus melalui validasi guardrails terstruktur sebelum diaplikasikan ke ekosistem produksi.
#Bullet:
- Guardrails: Batasan keamanan parameter dan proteksi data sensitif organisasi
- Approvals: Jalur persetujuan bertingkat sebelum implementasi model ke produksi
- Auditability: Rekam jejak menyeluruh dan evaluasi performa model secara berkala
#SpeakerNotes: Berikan penekanan pada aspek auditability: AI tidak boleh dibiarkan mengambil keputusan tanpa jejak audit yang transparan.
#Visual: Key Insights / Bullets

-----

#Headline: Alur Kerja Validasi Keputusan Multi-Tahap
#Subheadline: Dari identifikasi masalah bisnis hingga audit pasca-implementasi
#Description: Metodologi 4 tahap standar industri untuk mengevaluasi rekomendasi sistem cerdas secara objektif.
#Bullet:
- Tahap 01: Problem Formulation & Hypothesis Framing
- Tahap 02: Deterministic Data Extraction & Verification
- Tahap 03: Multi-Model Adversarial Stress Testing
- Tahap 04: Policy Synthesis & Executive Board Sign-off
#SpeakerNotes: Alokasikan 8 menit untuk bedah kasus di tahap 3. Pastikan peserta memahami teknik adversarial challenge terhadap rekomendasi AI.
#Visual: Process / Workflow

-----

#Headline: [HANDS-ON] Eksekusi Audit Keputusan Menggunakan AI Prompt Card
#Subheadline: Format terstruktur untuk mengevaluasi risiko keputusan strategis divisi
#Description: Gunakan template prompt audit di bawah ini pada AI analitis untuk memetakan skenario terburuk dan asumsi tersembunyi.
#Bullet:
- PROMPT CARD: "Sebagai Chief Risk Officer, lakukan stress-test terhadap proposal [Nama Proposal] dengan asumsi penurunan pasar [X]% dan kenaikan biaya operasional [Y]%."
- Evaluasi Tingkat Risiko: Klasifikasikan temuan ke dalam status OK, Risk, atau Critical Failure
- Action Plan: Rumuskan langkah mitigasi sebelum presentasi di hadapan dewan pengawas
#Badge: HANDS-ON 10 MIN
#SpeakerNotes: Latihan squad 10 menit. Minta peserta mengisi placeholder bracket dengan kasus nyata dari unit kerja masing-masing.
#Visual: Two Column / Comparison`,
  },
  {
    id: "sc-2",
    title: "Q4 SaaS Strategy & Execution Pitch",
    category: "Strategy",
    slidesCount: 10,
    updatedAt: "2h ago",
    accentColor: "#4F46E5",
    layoutType: "stats",
    sampleContent: "Q4 SaaS Strategy & Execution Pitch\n• Market Expansion in APAC\n• Enterprise ARR Acceleration\n---\nKey Financial Metrics\n• $4.2M ARR (+140% YoY)\n• 118% Net Revenue Retention\n---\nGo-To-Market Milestones",
  },
  {
    id: "sc-3",
    title: "Product Design Systems at Scale",
    category: "Design",
    slidesCount: 6,
    updatedAt: "Yesterday",
    accentColor: "#059669",
    layoutType: "split",
    sampleContent: "Product Design Systems at Scale\n• Unified Design Tokens\n• Component Governance\n---\nImplementation Strategy\n• 40+ Core UI Components\n• Zero Figma-to-Code Drift",
  },
  {
    id: "sc-4",
    title: "Engineering Roadmap & Cloud Infra",
    category: "Engineering",
    slidesCount: 9,
    updatedAt: "2 days ago",
    accentColor: "#D97706",
    layoutType: "process",
    sampleContent: "Engineering Roadmap & Cloud Infra\n• Multi-region Kubernetes Cluster\n• Real-time Streaming Architecture\n---\nInfra Scalability Highlights\n• 99.99% Uptime SLA\n• <15ms Edge Latency",
  },
  {
    id: "sc-5",
    title: "Seed Round Investor Pitch Deck",
    category: "Fundraising",
    slidesCount: 12,
    updatedAt: "3 days ago",
    accentColor: "#7C3AED",
    layoutType: "grid",
    sampleContent: "Seed Round Investor Pitch Deck\n• The $120B Workflow Automation Market\n• Proprietary AI Agents Platform\n---\nTraction & User Metrics\n• 48k Active Monthly Users\n• $85k MRR organic growth",
  },
  {
    id: "sc-6",
    title: "Quarterly OKR & Performance Review",
    category: "Operations",
    slidesCount: 7,
    updatedAt: "5 days ago",
    accentColor: "#171717",
    layoutType: "quote",
    sampleContent: "Quarterly OKR & Performance Review\n• Team Productivity Highlights\n• Cross-functional Velocity\n---\nKey Results Accomplished\n• 12 Major Features Shipped\n• CSAT Score 4.9/5.0",
  },
];

/* ───────────────────────────────────────────────────
 * Showcase 16:9 Card (Supports Image Preview & Skeletons)
 * ─────────────────────────────────────────────────── */
function ShowcaseDeckCard({
  deck,
  onSelect,
}: {
  deck: ShowcaseDeck;
  onSelect: (deck: ShowcaseDeck) => void;
}) {
  if (deck.image) {
    return (
      <div
        onClick={() => onSelect(deck)}
        className="group w-full aspect-[16/9] rounded-md overflow-hidden relative cursor-pointer select-none transition-all hover:opacity-90"
      >
        <img
          src={deck.image}
          alt={deck.title}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      onClick={() => onSelect(deck)}
      className="group w-full aspect-[16/9] rounded-md bg-neutral-100 dark:bg-[#181818] border border-neutral-200/80 dark:border-neutral-800/80 p-3.5 sm:p-4 flex flex-col justify-between overflow-hidden relative hover:border-neutral-400 dark:hover:border-neutral-600 hover:bg-neutral-200/50 dark:hover:bg-[#1f1f1f] transition-all cursor-pointer select-none"
    >
      {/* Top Header Skeleton Line */}
      <div className="flex items-center justify-between">
        <div className="w-14 h-2 rounded bg-neutral-300 dark:bg-neutral-700" />
        <div className="w-8 h-2 rounded bg-neutral-200 dark:bg-neutral-800" />
      </div>

      {/* Center Layout Skeleton */}
      <div className="my-auto space-y-2">
        <div className="w-3/4 h-2.5 rounded bg-neutral-300 dark:bg-neutral-700" />
        <div className="w-1/2 h-2 rounded bg-neutral-200 dark:bg-neutral-800" />
      </div>

      {/* Bottom Footer Skeleton Line */}
      <div className="flex items-center justify-between">
        <div className="w-10 h-1.5 rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
          <div className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
          <div className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────
 * Curated Theme Presets
 * ─────────────────────────────────────────────────── */
interface ThemePreset {
  id: string;
  name: string;
  description: string;
  palette: ColorPalette;
  bgStyle: BgStyle;
  fontPairing: FontPairing;
  tag: string;
}

const THEME_PRESETS: ThemePreset[] = [
  {
    id: "launcher-signature",
    name: "Launcher Signature",
    description: "Signature Yellow • SF Pro Display",
    palette: COLOR_PALETTES[0],
    bgStyle: "mixed",
    fontPairing: "modern",
    tag: "SF Pro Modern",
  },
  {
    id: "silicon-mono",
    name: "Silicon Monochrome",
    description: "Charcoal & Pure White • Modern Tech",
    palette: COLOR_PALETTES[1],
    bgStyle: "solid",
    fontPairing: "modern",
    tag: "Minimalist",
  },
  {
    id: "ocean-indigo",
    name: "Ocean Indigo",
    description: "Tech Indigo & Royal Blue • Clean Canvas",
    palette: COLOR_PALETTES[2],
    bgStyle: "dualtone",
    fontPairing: "modern",
    tag: "Executive Indigo",
  },
  {
    id: "emerald-growth",
    name: "Emerald Growth",
    description: "Forest Green & Mint • Modern Sans",
    palette: COLOR_PALETTES[3],
    bgStyle: "gradient",
    fontPairing: "modern",
    tag: "Growth",
  },
];

/* ───────────────────────────────────────────────────
 * Slide Framing Components
 * ─────────────────────────────────────────────────── */
function SlideFrameHeader({
  badge,
  category,
  isDark = false,
  primaryColor = "#FFE500",
  rightPill,
}: {
  badge?: string;
  category?: string;
  isDark?: boolean;
  primaryColor?: string;
  rightPill?: string;
}) {
  const text = badge || category || "Process Infographic";
  return (
    <div className="w-full flex items-center justify-between mb-2 shrink-0">
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div
          className="w-4 h-4 rounded-sm flex items-center justify-center font-bold text-[9px] shadow-2xs"
          style={{ backgroundColor: primaryColor, color: "#111" }}
        >
          ⚡
        </div>
        <span className={`text-[10px] sm:text-[11px] font-semibold tracking-wider ${isDark ? "text-neutral-400" : "text-neutral-600 dark:text-neutral-400"} font-sf`}>
          {text}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {rightPill && (
          <span className={`text-[10px] sm:text-[11px] font-medium tracking-wide px-2.5 py-0.5 rounded-full border ${isDark ? "border-neutral-800 bg-neutral-900/80 text-neutral-300" : "border-neutral-200 bg-neutral-100/90 text-neutral-600 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-300"}`}>
            {rightPill}
          </span>
        )}
        <div className="flex items-center gap-1 opacity-40">
          <div className="w-1 h-1 rounded-full bg-current" />
          <div className="w-1 h-1 rounded-full bg-current" />
          <div className="w-1 h-1 rounded-full bg-current" />
        </div>
      </div>
    </div>
  );
}

function SlideFrameFooter({
  footer = "company.com",
  slideNumber,
  isDark = false,
}: {
  footer?: string;
  slideNumber?: string;
  isDark?: boolean;
}) {
  return (
    <div className={`w-full flex items-center justify-between pt-2 border-t ${isDark ? "border-neutral-800 text-neutral-500" : "border-neutral-200/60 dark:border-neutral-800 text-neutral-400"} text-[10px] sm:text-[11px] font-sf shrink-0 mt-auto tracking-normal`}>
      <span className="font-sf font-medium text-neutral-500">{footer}</span>
      {slideNumber && <span className="font-sf font-bold text-neutral-500 tabular-nums">{slideNumber}</span>}
    </div>
  );
}

function getContrastTextColor(hexColor?: string): string {
  if (!hexColor || !hexColor.startsWith("#")) return "#111111";
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 145 ? "#111111" : "#FFFFFF";
}

/* ───────────────────────────────────────────────────
 * Dynamic Slide Renderer
 * ─────────────────────────────────────────────────── */
function SlideRenderer({
  slide: rawSlide,
  isPresentation = false,
  isThumbnail = false,
  palette = COLOR_PALETTES[0],
  bgStyle = "solid",
  fontPairing = "modern",
  titleFont = "sf-pro",
  bodyFont = "sf-pro",
}: {
  slide: SlideData;
  isPresentation?: boolean;
  isThumbnail?: boolean;
  palette?: ColorPalette;
  bgStyle?: BgStyle;
  fontPairing?: FontPairing;
  titleFont?: TitleFont;
  bodyFont?: BodyFont;
}) {
  const slide = normalizeSlide(rawSlide);

  const baseFont = "text-xs sm:text-sm";
  const titleSize = "text-2xl sm:text-3xl";
  const subtitleSize = "text-sm sm:text-base";

  const effectiveTitleFont: TitleFont = titleFont || (fontPairing === "creative" ? "bricolage" : "sf-pro");
  const effectiveBodyFont: BodyFont = bodyFont || "sf-pro";

  const headingFontClass = getTitleFontClass(effectiveTitleFont);
  const bodyFontClass = getBodyFontClass(effectiveBodyFont);

  // Dual-Tone & Color Contrast Calculations
  const isDualTone = bgStyle === "dualtone";
  const isGradient = bgStyle === "gradient";
  const primaryTextColor = getContrastTextColor(palette.primary);
  const primaryMutedColor = primaryTextColor === "#FFFFFF" ? "rgba(255,255,255,0.75)" : "rgba(17,17,17,0.7)";

  // Dynamic Background classes & styles with slide.bgStyle override support
  let bgClasses = "bg-white dark:bg-neutral-950";
  const isBoldYellow = !isDualTone && !isGradient && (slide.bgStyle === "boldYellow" || slide.layout === "boldStatement" || slide.layout === "boldImpact");
  const isYellowGradient = !isDualTone && (slide.bgStyle === "yellowGradient" || slide.layout === "imageSplitMetric");
  const isDarkSlide = !isBoldYellow && !isYellowGradient && bgStyle === "dark";

  // Dynamic 2-Tone Gradient Style (White + Chosen Primary Color)
  let dynamicBgStyle: React.CSSProperties = {};
  const effectiveGradientColor = palette.primary || "#FFDE3C";
  if (isGradient) {
    if (slide.layout === "boldStatement" || slide.layout === "boldImpact" || slide.layout === "cta") {
      dynamicBgStyle = {
        background: `linear-gradient(135deg, ${effectiveGradientColor} 0%, ${effectiveGradientColor}ee 40%, #FFF5A5 100%)`,
      };
    } else if (slide.layout === "hero" || slide.layout === "title") {
      dynamicBgStyle = {
        background: `radial-gradient(ellipse 90% 70% at 90% -10%, ${effectiveGradientColor}60 0%, transparent 65%), radial-gradient(ellipse 70% 60% at 10% 100%, ${effectiveGradientColor}40 0%, transparent 60%), linear-gradient(145deg, #FFFFFF 0%, #FFFDF5 45%, #FFF9D0 100%)`,
      };
    } else {
      dynamicBgStyle = {
        background: `radial-gradient(ellipse 85% 65% at 88% 0%, ${effectiveGradientColor}45 0%, transparent 60%), radial-gradient(ellipse 65% 55% at 5% 100%, ${effectiveGradientColor}30 0%, transparent 60%), linear-gradient(145deg, #FFFFFF 0%, #FFFDF5 45%, #FFF8D2 100%)`,
      };
    }
  } else if (isYellowGradient) {
    dynamicBgStyle = {
      background: `radial-gradient(ellipse 85% 65% at 88% 0%, ${effectiveGradientColor}40 0%, transparent 60%), radial-gradient(ellipse 65% 55% at 5% 100%, ${effectiveGradientColor}25 0%, transparent 60%), linear-gradient(145deg, #FFFFFF 0%, #FFFDF7 50%, #FFF9D6 100%)`,
    };
  }

  if (isBoldYellow) {
    bgClasses = "bg-[#FFE500] text-neutral-950";
  } else if (isYellowGradient) {
    bgClasses = "text-neutral-950 dark:text-neutral-900";
  } else if (slide.bgStyle === "white") {
    bgClasses = "bg-white dark:bg-neutral-950";
  } else if (isDualTone) {
    bgClasses = "bg-white dark:bg-[#111114]";
  } else if (isGradient) {
    bgClasses = "text-neutral-950 dark:text-neutral-900";
  } else if (bgStyle === "dark") {
    bgClasses = "bg-[#0d0d0d] text-white";
  } else if (bgStyle === "warm") {
    bgClasses = "bg-[#FDFBF7] dark:bg-[#12110F]";
  }

  // Animation helper for elements
  const anim = (delay: number = 0) =>
    isThumbnail
      ? {}
      : {
          initial: { opacity: 0, y: 8 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.35, delay, ease: "easeOut" as const },
        };

  // Helper for dual-tone split layout container (always maintains 16:9 landscape proportion)
  const renderDualToneSplit = (
    leftContent: React.ReactNode,
    rightContent: React.ReactNode,
    leftWidth: string = "38%"
  ) => {
    const cleanWidth = leftWidth.includes("[")
      ? leftWidth.replace(/.*\[(.*)\].*/, "$1")
      : leftWidth;
    const computedWidth = cleanWidth.includes("%") || cleanWidth.includes("px") || cleanWidth.includes("vw")
      ? cleanWidth
      : "38%";

    return (
      <div className="w-full h-full flex flex-row relative overflow-hidden font-sf bg-white dark:bg-[#111114]">
        {/* Left Color-Blocked Primary Panel */}
        <div
          className="h-full p-[6%] flex flex-col justify-between shrink-0 relative z-10 shadow-sm overflow-hidden"
          style={{
            width: computedWidth,
            backgroundColor: palette.primary,
            color: primaryTextColor,
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest px-2.5 py-1 rounded-sm bg-black/15 dark:bg-white/15">
              {slide.badge || "MODULE"}
            </span>
            {slide.slideNumber && (
              <span className="text-base sm:text-lg font-mono font-black opacity-45">
                {String(slide.slideNumber).padStart(2, "0")}
              </span>
            )}
          </div>

          <div className="my-auto py-2">
            {leftContent}
          </div>

          <div className="text-[10px] sm:text-[11px] font-mono tracking-wider opacity-60 uppercase">
            {slide.category || slide.badge || ""}
          </div>
        </div>

        {/* Right Clean White Canvas Panel */}
        <div className="flex-1 h-full p-[6%] flex flex-col justify-between relative z-10 bg-white dark:bg-[#111114] overflow-hidden">
          <div className="flex-1 flex flex-col justify-center">
            {rightContent}
          </div>
          <SlideFrameFooter footer={slide.footer} slideNumber={slide.slideNumber} isDark={false} />
        </div>
      </div>
    );
  };

  switch (slide.layout) {
    /* ──── TITLE / HERO SLIDE ──── */
    case "title":
    case "hero":
      if (isDualTone) {
        return (
          <div className="w-full h-full flex flex-col md:flex-row relative overflow-hidden font-sf bg-white dark:bg-[#111114]">
            {/* Left 42% Primary Color Block */}
            <div
              className="w-full md:w-[42%] h-full p-[6%] flex flex-col justify-between shrink-0 relative z-10 shadow-sm"
              style={{ backgroundColor: palette.primary, color: primaryTextColor }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest px-2.5 py-1 rounded-sm bg-black/15 dark:bg-white/15">
                  {slide.badge || slide.highlight || "01"}
                </span>
                <span className="text-lg sm:text-xl font-mono font-black opacity-45">
                  {String(slide.slideNumber || 1).padStart(2, "0")}
                </span>
              </div>

              <div className="my-auto py-4">
                <motion.h1
                  {...anim(0.06)}
                  className={`text-2xl sm:text-4xl lg:text-5xl font-black ${headingFontClass} leading-[1.08] tracking-tight`}
                >
                  {safeString(slide.title)}
                </motion.h1>
              </div>

              <div className="text-[10px] sm:text-[11px] font-mono tracking-wider opacity-60 uppercase">
                {slide.category || "EXECUTIVE BRIEFING"}
              </div>
            </div>

            {/* Right 58% Secondary/White Canvas Block */}
            <div className="flex-1 h-full p-[6%] flex flex-col justify-between relative z-10 bg-neutral-50/50 dark:bg-[#151518]">
              <div className="flex items-center justify-end">
                {slide.highlight && (
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                    style={{
                      backgroundColor: palette.primary,
                      color: primaryTextColor,
                    }}
                  >
                    {safeString(slide.highlight)}
                  </span>
                )}
              </div>

              <div className="my-auto max-w-[95%] space-y-4">
                {slide.subtitle && (
                  <motion.p
                    {...anim(0.12)}
                    className="text-base sm:text-xl font-semibold text-neutral-800 dark:text-neutral-200 leading-relaxed font-sf"
                  >
                    {safeString(slide.subtitle)}
                  </motion.p>
                )}
                {slide.description && (
                  <motion.p
                    {...anim(0.18)}
                    className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-sf line-clamp-4"
                  >
                    {safeString(slide.description)}
                  </motion.p>
                )}
              </div>

              <SlideFrameFooter footer={slide.footer} slideNumber={slide.slideNumber} isDark={false} />
            </div>
          </div>
        );
      }

      return (
        <div
          className={`w-full h-full flex flex-col justify-between p-[7%] relative overflow-hidden font-sf ${bgClasses}`}
          style={dynamicBgStyle}
        >
          {/* Subtle Ambient Shapes */}
          <div
            className="absolute -top-[20%] -right-[15%] w-[50%] h-[65%] rounded-full opacity-20 blur-3xl pointer-events-none"
            style={{ backgroundColor: palette.primary }}
          />

          <SlideFrameHeader badge={slide.badge || slide.highlight || "PRESENTATION"} category={slide.category} isDark={isDarkSlide} primaryColor={palette.primary} />

          <div className="relative z-10 flex flex-col justify-center flex-1 max-w-[85%] my-auto">
            {slide.highlight && (
              <motion.span
                {...anim(0)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider w-fit mb-3 font-sf"
                style={{
                  backgroundColor: palette.id === "launcher" ? "#FFE500" : palette.primary,
                  color: "#111111",
                }}
              >
                {safeString(slide.highlight)}
              </motion.span>
            )}
            <motion.h1
              {...anim(0.06)}
              className="text-3xl sm:text-5xl font-black font-sf text-neutral-950 dark:text-white leading-[1.08] tracking-tight"
            >
              {safeString(slide.title)}
            </motion.h1>
            {slide.subtitle && (
              <motion.p
                {...anim(0.12)}
                className="text-sm sm:text-lg font-medium text-neutral-600 dark:text-neutral-400 mt-3 leading-relaxed font-sf"
              >
                {safeString(slide.subtitle)}
              </motion.p>
            )}
            {slide.description && (
              <motion.p
                {...anim(0.18)}
                className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-4 leading-relaxed line-clamp-3 font-sf"
              >
                {safeString(slide.description)}
              </motion.p>
            )}
          </div>

          <SlideFrameFooter footer={slide.footer} slideNumber={slide.slideNumber} isDark={isDarkSlide} />
        </div>
      );

    /* ──── STATS SLIDE ──── */
    case "stats":
      return (
        <div className={`w-full h-full ${bgClasses} flex flex-col justify-between p-[6%] sm:p-[7%] relative font-sans`} style={dynamicBgStyle}>
          <div className="mb-2">
            <SlideFrameHeader badge={slide.badge || "Key Metrics"} category={slide.category} isDark={isDarkSlide} primaryColor={palette.primary} />
            <motion.h2
              {...anim(0.06)}
              className={`text-2xl sm:text-3xl font-bold ${headingFontClass} text-neutral-950 dark:text-white leading-tight mt-1`}
            >
              {safeString(slide.title)}
            </motion.h2>
            {slide.subtitle && (
              <motion.p {...anim(0.12)} className="text-xs sm:text-sm text-neutral-500 mt-1">
                {safeString(slide.subtitle)}
              </motion.p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 my-auto">
            {slide.stats?.map((stat, i) => (
              <motion.div
                key={i}
                {...anim(0.15 + i * 0.08)}
                className="p-4 sm:p-5 rounded-xl border border-neutral-200/90 dark:border-neutral-800 bg-white/90 dark:bg-[#18181c] shadow-xs flex flex-col justify-between"
              >
                <span
                  className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-none font-sf"
                  style={{ color: palette.primary }}
                >
                  {safeString(stat?.value)}
                </span>
                <span className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 mt-2 font-medium leading-snug font-sf">
                  {safeString(stat?.label)}
                </span>
              </motion.div>
            ))}
          </div>

          <SlideFrameFooter footer={slide.footer} slideNumber={slide.slideNumber} isDark={isDarkSlide} />
        </div>
      );

    /* ──── PROCESS SLIDE ──── */
    case "process":
      const processItems = (slide.processSteps && slide.processSteps.length > 0)
        ? slide.processSteps
        : (slide.bullets && slide.bullets.length > 0)
        ? slide.bullets.map((b, idx) => {
            const parts = b.split(/:\s*|\s*-\s*/);
            return {
              title: parts[0] || `Pillar 0${idx + 1}`,
              description: parts.length > 1 ? parts.slice(1).join(": ") : parts[0],
            };
          })
        : [];

      return (
        <div className={`w-full h-full ${bgClasses} flex flex-col justify-between p-[6%] sm:p-[7%] relative font-sans`} style={dynamicBgStyle}>
          <div className="mb-2">
            <SlideFrameHeader badge={slide.badge || "Strategy Framework"} category={slide.category} isDark={isDarkSlide} primaryColor={palette.primary} />
            <motion.h2
              {...anim(0.06)}
              className={`text-2xl sm:text-3xl font-bold ${headingFontClass} text-neutral-950 dark:text-white leading-tight mt-1`}
            >
              {safeString(slide.title)}
            </motion.h2>
            {slide.subtitle && (
              <motion.p {...anim(0.12)} className="text-xs sm:text-sm text-neutral-500 mt-1">
                {safeString(slide.subtitle)}
              </motion.p>
            )}
          </div>

          <div className="my-auto flex flex-col justify-center gap-2.5">
            {processItems.map((step, i) => (
              <motion.div
                key={i}
                {...anim(0.1 + i * 0.08)}
                className="flex items-start gap-3 p-3 sm:p-3.5 rounded-xl border border-neutral-200/90 dark:border-neutral-800 bg-white/90 dark:bg-neutral-900/80 shadow-xs"
              >
                <div
                  className="shrink-0 w-7 h-7 text-[11px] font-bold rounded-lg text-neutral-950 flex items-center justify-center font-sf"
                  style={{ backgroundColor: palette.primary }}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white leading-tight">
                    {safeString(step?.title)}
                  </p>
                  {step?.description && step.description !== step.title && (
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-snug mt-0.5">
                      {safeString(step?.description)}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <SlideFrameFooter footer={slide.footer} slideNumber={slide.slideNumber} isDark={isDarkSlide} />
        </div>
      );

    /* ──── BULLETS SLIDE ──── */
    case "bullets": {
      const bulletsList = slide.bullets || [];
      const isDense = bulletsList.length >= 4;
      return (
        <div className={`w-full h-full ${bgClasses} flex p-[5%] sm:p-[6%] relative font-sans overflow-hidden`} style={dynamicBgStyle}>
          <div className="flex flex-col lg:flex-row gap-5 w-full h-full min-h-0 items-center justify-between">
            {/* Left Column: Title, Subtitle, Badge & Narrative Description */}
            <div className="w-full lg:w-[40%] flex flex-col justify-center min-w-0 max-h-full overflow-y-auto scrollbar-none">
              <motion.div
                {...anim(0)}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit mb-2"
                style={{ backgroundColor: palette.primary, color: "#111111" }}
              >
                <Lightbulb className="w-3 h-3" />
                <span>{slide.badge || "Key Insights"}</span>
              </motion.div>
              <motion.h2
                {...anim(0.06)}
                className={`text-xl sm:text-2xl lg:text-3xl font-bold ${headingFontClass} text-neutral-950 dark:text-white leading-tight`}
              >
                {safeString(slide.title)}
              </motion.h2>
              {slide.subtitle && (
                <motion.p {...anim(0.12)} className="text-xs sm:text-sm text-neutral-500 mt-1 leading-snug">
                  {safeString(slide.subtitle)}
                </motion.p>
              )}
              {slide.description && (
                <motion.div
                  {...anim(0.18)}
                  className="mt-3 p-2.5 sm:p-3 rounded-lg bg-neutral-100/80 dark:bg-neutral-900/60 border border-neutral-200/70 dark:border-neutral-800"
                >
                  <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    {safeString(slide.description)}
                  </p>
                </motion.div>
              )}
            </div>

            {/* Right Column: Structured Bullet Cards */}
            <div className={`w-full lg:w-[60%] flex flex-col justify-center ${isDense ? "gap-2 max-h-[340px] overflow-y-auto pr-1 scrollbar-thin" : "gap-2.5 max-h-full"} min-w-0`}>
              {bulletsList.map((bullet, i) => {
                const bulletStr = safeString(bullet);
                const colonIdx = bulletStr.indexOf(":");
                const hasLabel = colonIdx > 0 && colonIdx < 40;
                const label = hasLabel ? bulletStr.slice(0, colonIdx) : "";
                const content = hasLabel ? bulletStr.slice(colonIdx + 1).trim() : bulletStr;

                return (
                  <motion.div
                    key={i}
                    {...anim(0.12 + i * 0.05)}
                    className={`flex items-start gap-2.5 ${isDense ? "p-2 sm:p-2.5" : "p-3 sm:p-3.5"} rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/60 shadow-xs`}
                  >
                    <CheckCircle2
                      className="w-4 h-4 mt-0.5 shrink-0"
                      style={{ color: palette.primary }}
                    />
                    <div className="text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 leading-snug font-medium">
                      {hasLabel ? (
                        <>
                          <span className="font-bold text-neutral-950 dark:text-white">{label}: </span>
                          <span>{content}</span>
                        </>
                      ) : (
                        <span>{bulletStr}</span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    /* ──── TWO COLUMN SLIDE ──── */
    case "twoColumn":
      if (isDualTone) {
        return renderDualToneSplit(
          <div>
            <h2 className={`text-2xl sm:text-3xl font-extrabold ${headingFontClass} leading-tight`}>
              {safeString(slide.title)}
            </h2>
            {slide.subtitle && (
              <p className="text-xs sm:text-sm mt-3 opacity-80 leading-relaxed font-sf">
                {safeString(slide.subtitle)}
              </p>
            )}
          </div>,
          <div className="my-auto space-y-4">
            {slide.stats && slide.stats.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {slide.stats.map((stat, i) => (
                  <motion.div
                    key={i}
                    {...anim(0.1 + i * 0.1)}
                    className={`relative p-4 sm:p-5 rounded-lg border ${
                      i === 0
                        ? "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
                        : "bg-amber-50/50 dark:bg-neutral-900/90 border-amber-200/60 dark:border-neutral-700"
                    }`}
                  >
                    <TrendingUp className="w-4 h-4 text-neutral-400 mb-2" />
                    <div
                      className="text-2xl sm:text-3xl font-black tracking-tight"
                      style={{ color: i === 0 ? undefined : palette.primary }}
                    >
                      {safeString(stat?.value)}
                    </div>
                    <span className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1 block font-sf">
                      {safeString(stat?.label)}
                    </span>
                  </motion.div>
                ))}
              </div>
            ) : slide.bullets && slide.bullets.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {slide.bullets.slice(0, 4).map((bullet, i) => {
                  const parts = bullet.split(/:\s*|\s*-\s*/);
                  const bTitle = parts.length > 1 ? parts[0] : `Pillar 0${i + 1}`;
                  const bDesc = parts.length > 1 ? parts.slice(1).join(": ") : parts[0];
                  return (
                    <motion.div
                      key={i}
                      {...anim(0.1 + i * 0.08)}
                      className="p-4 rounded-xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xs flex flex-col justify-start gap-1.5"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-neutral-950 shrink-0"
                          style={{ backgroundColor: palette.primary }}
                        >
                          0{i + 1}
                        </span>
                        <span className="text-xs font-bold text-neutral-900 dark:text-white line-clamp-1">
                          {bTitle}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-sf">
                        {bDesc}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            ) : null}
            {slide.description && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-sf">
                {safeString(slide.description)}
              </p>
            )}
          </div>,
          "36%"
        );
      }

      return (
        <div className={`w-full h-full ${bgClasses} flex flex-col p-[6%] sm:p-[7%] relative font-sans`} style={dynamicBgStyle}>
          <div className="mb-3">
            <SlideFrameHeader badge={slide.badge || "Comparative Analysis"} category={slide.category} isDark={isDarkSlide} primaryColor={palette.primary} />
            <motion.h2
              {...anim(0.06)}
              className={`text-2xl sm:text-3xl font-bold ${headingFontClass} text-neutral-950 dark:text-white leading-tight mt-1`}
            >
              {safeString(slide.title)}
            </motion.h2>
            {slide.subtitle && (
              <motion.p {...anim(0.12)} className="text-xs sm:text-sm text-neutral-500 mt-1">
                {safeString(slide.subtitle)}
              </motion.p>
            )}
          </div>

          <div className="flex-1 flex items-center min-h-0">
            {slide.stats && slide.stats.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:gap-6 w-full">
                {slide.stats.map((stat, i) => (
                  <motion.div
                    key={i}
                    {...anim(0.1 + i * 0.1)}
                    className="relative p-4 sm:p-5 rounded-xl border border-neutral-200/90 dark:border-neutral-800 bg-white/90 dark:bg-neutral-900/80 shadow-xs"
                  >
                    <TrendingUp className="w-4 h-4 text-neutral-400 mb-2" />
                    <div
                      className="text-2xl sm:text-3xl font-bold tracking-tight"
                      style={{ color: i === 0 ? undefined : palette.primary }}
                    >
                      {safeString(stat?.value)}
                    </div>
                    <span className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1 block">{safeString(stat?.label)}</span>
                  </motion.div>
                ))}
              </div>
            ) : slide.bullets && slide.bullets.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:gap-5 w-full">
                {slide.bullets.slice(0, 4).map((bullet, i) => {
                  const parts = bullet.split(/:\s*|\s*-\s*/);
                  const bTitle = parts.length > 1 ? parts[0] : `Pillar 0${i + 1}`;
                  const bDesc = parts.length > 1 ? parts.slice(1).join(": ") : parts[0];
                  return (
                    <motion.div
                      key={i}
                      {...anim(0.1 + i * 0.08)}
                      className="p-4 sm:p-5 rounded-xl border border-neutral-200/90 dark:border-neutral-800 bg-white/90 dark:bg-neutral-900/80 shadow-xs flex flex-col justify-start gap-1.5"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold text-neutral-950 shrink-0"
                          style={{ backgroundColor: palette.primary }}
                        >
                          0{i + 1}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white leading-snug">
                          {bTitle}
                        </h4>
                      </div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-sf">
                        {bDesc}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            ) : slide.description ? (
              <motion.div {...anim(0.15)} className="w-full p-5 rounded-xl border border-neutral-200/90 dark:border-neutral-800 bg-white/90 dark:bg-neutral-900/80">
                <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed font-sf">
                  {safeString(slide.description)}
                </p>
              </motion.div>
            ) : null}
          </div>

          <SlideFrameFooter footer={slide.footer} slideNumber={slide.slideNumber} isDark={isDarkSlide} />
        </div>
      );

    /* ──── BIG NUMBER SLIDE ──── */
    case "bigNumber":
      if (isDualTone) {
        return renderDualToneSplit(
          <div>
            <h2 className={`text-2xl sm:text-3xl font-extrabold ${headingFontClass} leading-tight`}>
              {safeString(slide.title)}
            </h2>
          </div>,
          <div className="my-auto">
            {slide.highlight && (
              <motion.div
                {...anim(0.08)}
                className="text-5xl sm:text-7xl font-black tracking-tighter my-3 leading-none"
                style={{ color: palette.primary }}
              >
                {safeString(slide.highlight)}
              </motion.div>
            )}
            {slide.description && (
              <motion.p {...anim(0.16)} className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-[85%] leading-relaxed font-sf">
                {safeString(slide.description)}
              </motion.p>
            )}
          </div>,
          "w-[38%]"
        );
      }

      return (
        <div
          className="w-full h-full flex flex-col justify-center p-[8%] relative overflow-hidden font-sans"
          style={{ backgroundColor: palette.primary }}
        >
          <div className="absolute -bottom-[20%] -right-[15%] w-[50%] h-[65%] rounded-full bg-white/20" />

          <div className="relative z-10">
            <motion.h2
              {...anim(0)}
              className="text-base sm:text-lg font-semibold text-neutral-900 leading-tight"
            >
              {safeString(slide.title)}
            </motion.h2>
            {slide.highlight && (
              <motion.div
                {...anim(0.08)}
                className="text-5xl sm:text-7xl font-black text-neutral-950 tracking-tighter my-4 sm:my-6 leading-none"
              >
                {safeString(slide.highlight)}
              </motion.div>
            )}
            {slide.description && (
              <motion.p {...anim(0.16)} className="text-xs sm:text-sm text-neutral-900/80 max-w-[80%] leading-relaxed">
                {safeString(slide.description)}
              </motion.p>
            )}

            {slide.stats && slide.stats.length > 0 && (
              <div className="flex gap-6 mt-6">
                {slide.stats.map((stat, i) => (
                  <motion.div key={i} {...anim(0.2 + i * 0.08)}>
                    <div className="text-2xl sm:text-3xl font-bold text-neutral-950">
                      {safeString(stat?.value)}
                    </div>
                    <div className="text-xs text-neutral-900/70">{safeString(stat?.label)}</div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      );

    /* ──── BAR CHART SLIDE ──── */
    /* ──── BAR CHART SLIDE ──── */
    case "chartBar": {
      const hasNarrative = Boolean(slide.description || (slide.bullets && slide.bullets.length > 0) || (slide.stats && slide.stats.length > 0));
      return (
        <div className={`w-full h-full ${bgClasses} flex flex-col p-[6%] relative font-sans`} style={dynamicBgStyle}>
          {hasNarrative ? (
            <div className="flex flex-col lg:flex-row gap-6 w-full h-full min-h-0 items-center">
              {/* Left Column: Context, Narrative & Key Highlights */}
              <div className="w-full lg:w-[45%] flex flex-col justify-center min-w-0">
                {slide.badge && (
                  <span
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit mb-2"
                    style={{ backgroundColor: palette.primary, color: "#111111" }}
                  >
                    {slide.badge}
                  </span>
                )}
                <motion.h2
                  {...anim(0)}
                  className={`${isPresentation ? "text-2xl sm:text-3xl" : "text-base sm:text-xl"} font-bold ${headingFontClass} text-neutral-950 dark:text-white leading-tight`}
                >
                  {slide.title}
                </motion.h2>
                {slide.subtitle && (
                  <motion.p {...anim(0.06)} className={`${baseFont} text-neutral-500 text-xs sm:text-sm mt-1 leading-snug`}>
                    {slide.subtitle}
                  </motion.p>
                )}
                {slide.description && (
                  <motion.div
                    {...anim(0.12)}
                    className="mt-3 p-3 rounded-lg bg-neutral-100/80 dark:bg-neutral-900/60 border border-neutral-200/70 dark:border-neutral-800"
                  >
                    <p className={`${baseFont} text-neutral-700 dark:text-neutral-300 text-xs sm:text-sm leading-relaxed`}>
                      {slide.description}
                    </p>
                  </motion.div>
                )}
                {slide.bullets && slide.bullets.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    {slide.bullets.slice(0, 3).map((b, i) => (
                      <motion.div key={i} {...anim(0.16 + i * 0.05)} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: palette.primary }} />
                        <span className="text-xs text-neutral-700 dark:text-neutral-300 leading-snug">{b}</span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Clean Chart Container */}
              <div className="w-full lg:w-[55%] h-full min-h-0 flex items-center justify-center p-3 sm:p-4 rounded-xl bg-neutral-50/80 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800">
                <SlideChart type="bar" data={slide.chartData} primaryColor={palette.primary} accentColor={palette.accent} isPresentation={isPresentation} isThumbnail={isThumbnail} />
              </div>
            </div>
          ) : (
            <>
              <div className="mb-2 sm:mb-4">
                <motion.h2
                  {...anim(0)}
                  className={`${isPresentation ? "text-3xl" : "text-base sm:text-xl"} font-bold ${headingFontClass} text-neutral-950 dark:text-white leading-tight`}
                >
                  {slide.title}
                </motion.h2>
                {slide.subtitle && <motion.p {...anim(0.06)} className={`${baseFont} text-neutral-500 mt-0.5`}>{slide.subtitle}</motion.p>}
              </div>
              <div className="flex-1 flex items-center justify-center min-h-0">
                <SlideChart type="bar" data={slide.chartData} primaryColor={palette.primary} accentColor={palette.accent} isPresentation={isPresentation} isThumbnail={isThumbnail} />
              </div>
            </>
          )}
        </div>
      );
    }

    /* ──── AREA CHART SLIDE ──── */
    case "chartArea": {
      const hasNarrative = Boolean(slide.description || (slide.bullets && slide.bullets.length > 0) || (slide.stats && slide.stats.length > 0));
      return (
        <div className={`w-full h-full ${bgClasses} flex flex-col p-[6%] relative font-sans`} style={dynamicBgStyle}>
          {hasNarrative ? (
            <div className="flex flex-col lg:flex-row gap-6 w-full h-full min-h-0 items-center">
              <div className="w-full lg:w-[45%] flex flex-col justify-center min-w-0">
                {slide.badge && (
                  <span
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit mb-2"
                    style={{ backgroundColor: palette.primary, color: "#111111" }}
                  >
                    {slide.badge}
                  </span>
                )}
                <motion.h2
                  {...anim(0)}
                  className={`${isPresentation ? "text-2xl sm:text-3xl" : "text-base sm:text-xl"} font-bold ${headingFontClass} text-neutral-950 dark:text-white leading-tight`}
                >
                  {slide.title}
                </motion.h2>
                {slide.subtitle && (
                  <motion.p {...anim(0.06)} className={`${baseFont} text-neutral-500 text-xs sm:text-sm mt-1 leading-snug`}>
                    {slide.subtitle}
                  </motion.p>
                )}
                {slide.description && (
                  <motion.div
                    {...anim(0.12)}
                    className="mt-3 p-3 rounded-lg bg-neutral-100/80 dark:bg-neutral-900/60 border border-neutral-200/70 dark:border-neutral-800"
                  >
                    <p className={`${baseFont} text-neutral-700 dark:text-neutral-300 text-xs sm:text-sm leading-relaxed`}>
                      {slide.description}
                    </p>
                  </motion.div>
                )}
                {slide.bullets && slide.bullets.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    {slide.bullets.slice(0, 3).map((b, i) => (
                      <motion.div key={i} {...anim(0.16 + i * 0.05)} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: palette.primary }} />
                        <span className="text-xs text-neutral-700 dark:text-neutral-300 leading-snug">{b}</span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              <div className="w-full lg:w-[55%] h-full min-h-0 flex items-center justify-center p-3 sm:p-4 rounded-xl bg-neutral-50/80 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800">
                <SlideChart type="area" data={slide.chartData} primaryColor={palette.primary} accentColor={palette.accent} isPresentation={isPresentation} isThumbnail={isThumbnail} />
              </div>
            </div>
          ) : (
            <>
              <div className="mb-2 sm:mb-4">
                <motion.h2
                  {...anim(0)}
                  className={`${isPresentation ? "text-3xl" : "text-base sm:text-xl"} font-bold ${headingFontClass} text-neutral-950 dark:text-white leading-tight`}
                >
                  {slide.title}
                </motion.h2>
                {slide.subtitle && <motion.p {...anim(0.06)} className={`${baseFont} text-neutral-500 mt-0.5`}>{slide.subtitle}</motion.p>}
              </div>
              <div className="flex-1 flex items-center justify-center min-h-0">
                <SlideChart type="area" data={slide.chartData} primaryColor={palette.primary} accentColor={palette.accent} isPresentation={isPresentation} isThumbnail={isThumbnail} />
              </div>
            </>
          )}
        </div>
      );
    }

    /* ──── DONUT CHART SLIDE ──── */
    case "chartDonut": {
      const hasNarrative = Boolean(slide.description || (slide.bullets && slide.bullets.length > 0) || (slide.stats && slide.stats.length > 0));
      return (
        <div className={`w-full h-full ${bgClasses} flex flex-col p-[6%] relative font-sans`} style={dynamicBgStyle}>
          {hasNarrative ? (
            <div className="flex flex-col lg:flex-row gap-6 w-full h-full min-h-0 items-center">
              <div className="w-full lg:w-[45%] flex flex-col justify-center min-w-0">
                {slide.badge && (
                  <span
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit mb-2"
                    style={{ backgroundColor: palette.primary, color: "#111111" }}
                  >
                    {slide.badge}
                  </span>
                )}
                <motion.h2
                  {...anim(0)}
                  className={`${isPresentation ? "text-2xl sm:text-3xl" : "text-base sm:text-xl"} font-bold ${headingFontClass} text-neutral-950 dark:text-white leading-tight`}
                >
                  {slide.title}
                </motion.h2>
                {slide.subtitle && (
                  <motion.p {...anim(0.06)} className={`${baseFont} text-neutral-500 text-xs sm:text-sm mt-1 leading-snug`}>
                    {slide.subtitle}
                  </motion.p>
                )}
                {slide.description && (
                  <motion.div
                    {...anim(0.12)}
                    className="mt-3 p-3 rounded-lg bg-neutral-100/80 dark:bg-neutral-900/60 border border-neutral-200/70 dark:border-neutral-800"
                  >
                    <p className={`${baseFont} text-neutral-700 dark:text-neutral-300 text-xs sm:text-sm leading-relaxed`}>
                      {slide.description}
                    </p>
                  </motion.div>
                )}
                {slide.bullets && slide.bullets.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    {slide.bullets.slice(0, 3).map((b, i) => (
                      <motion.div key={i} {...anim(0.16 + i * 0.05)} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: palette.primary }} />
                        <span className="text-xs text-neutral-700 dark:text-neutral-300 leading-snug">{b}</span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              <div className="w-full lg:w-[55%] h-full min-h-0 flex items-center justify-center p-3 sm:p-4 rounded-xl bg-neutral-50/80 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800">
                <SlideChart type="donut" data={slide.chartData} primaryColor={palette.primary} accentColor={palette.accent} isPresentation={isPresentation} isThumbnail={isThumbnail} />
              </div>
            </div>
          ) : (
            <>
              <div className="mb-2 sm:mb-4">
                <motion.h2
                  {...anim(0)}
                  className={`${isPresentation ? "text-3xl" : "text-base sm:text-xl"} font-bold ${headingFontClass} text-neutral-950 dark:text-white leading-tight`}
                >
                  {slide.title}
                </motion.h2>
                {slide.subtitle && <motion.p {...anim(0.06)} className={`${baseFont} text-neutral-500 mt-0.5`}>{slide.subtitle}</motion.p>}
              </div>
              <div className="flex-1 flex items-center justify-center min-h-0">
                <SlideChart type="donut" data={slide.chartData} primaryColor={palette.primary} accentColor={palette.accent} isPresentation={isPresentation} isThumbnail={isThumbnail} />
              </div>
            </>
          )}
        </div>
      );
    }

    /* ──── FLOW DIAGRAM SLIDE ──── */
    case "flowDiagram":
      return (
        <div className={`w-full h-full ${bgClasses} flex flex-col p-[7%] relative font-sans justify-between`} style={dynamicBgStyle}>
          <div className="mb-2">
            <motion.h2
              {...anim(0)}
              className={`${isPresentation ? "text-3xl" : "text-base sm:text-xl"} font-bold ${headingFontClass} text-neutral-950 dark:text-white leading-tight`}
            >
              {slide.title}
            </motion.h2>
            {slide.subtitle && <motion.p {...anim(0.06)} className={`${baseFont} text-neutral-500 mt-0.5`}>{slide.subtitle}</motion.p>}
          </div>
          <div className="flex-1 flex items-center justify-center my-auto">
            <FlowDiagram nodes={slide.flowNodes} primaryColor={palette.primary} isPresentation={isPresentation} />
          </div>
          {slide.description && (
            <motion.p {...anim(0.2)} className={`${baseFont} text-neutral-500 text-center max-w-xl mx-auto mt-2 leading-relaxed`}>
              {slide.description}
            </motion.p>
          )}
        </div>
      );

    /* ──── COMPARISON TABLE MATRIX SLIDE ──── */
    case "tableComparison": {
      const hasRealTableRows = slide.tableRows && slide.tableRows.length > 0;
      const titleLen = safeString(slide.title).length;
      const titleClass = titleLen > 70
        ? "text-base sm:text-xl font-extrabold leading-snug line-clamp-2"
        : titleLen > 45
        ? "text-lg sm:text-2xl font-extrabold leading-tight line-clamp-2"
        : `text-2xl sm:text-3xl font-bold ${headingFontClass} leading-tight`;

      return (
        <div className={`w-full h-full ${bgClasses} flex flex-col justify-between p-[5%] sm:p-[6%] relative font-sf overflow-hidden`} style={dynamicBgStyle}>
          <div className="mb-1.5 shrink-0">
            <SlideFrameHeader badge={slide.badge || "Comparative Analysis"} category={slide.category} isDark={isDarkSlide} primaryColor={palette.primary} rightPill={slide.topRightPill} />
            <motion.h2
              {...anim(0.04)}
              className={`${titleClass} text-neutral-950 dark:text-white mt-0.5`}
            >
              {safeString(slide.title)}
            </motion.h2>
            {slide.subtitle && (
              <motion.p {...anim(0.08)} className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-2">
                {safeString(slide.subtitle)}
              </motion.p>
            )}
          </div>

          <div className="flex-1 flex flex-col justify-center my-auto w-full min-h-0 overflow-hidden">
            {hasRealTableRows ? (
              <ComparisonTable headers={slide.tableHeaders} rows={slide.tableRows} primaryColor={palette.primary} isPresentation={isPresentation} />
            ) : slide.bullets && slide.bullets.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3 my-auto">
                {slide.bullets.slice(0, 6).map((b, bIdx) => {
                  const parts = b.split(/:\s*|\s*-\s*|\s*\|\s*/);
                  const cardTitle = parts[0] || `Dimension 0${bIdx + 1}`;
                  const cardDesc = parts.length > 1 ? parts.slice(1).join(": ") : parts[0];
                  return (
                    <motion.div
                      key={bIdx}
                      {...anim(0.1 + bIdx * 0.05)}
                      className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/90 shadow-2xs flex flex-col justify-between"
                    >
                      <span className="font-extrabold text-xs sm:text-sm text-neutral-950 dark:text-white leading-tight">
                        {cardTitle}
                      </span>
                      {parts.length > 1 && (
                        <p className="text-[11px] sm:text-xs text-neutral-600 dark:text-neutral-400 mt-1.5 leading-snug">
                          {cardDesc}
                        </p>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            ) : slide.description ? (
              <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
                {safeString(slide.description)}
              </div>
            ) : null}
          </div>

          <SlideFrameFooter footer={slide.footer} slideNumber={slide.slideNumber} isDark={isDarkSlide} />
        </div>
      );
    }

    /* ──── MILESTONE TIMELINE SLIDE ──── */
    case "timeline": {
      const milestonesToUse = (slide.timelineMilestones && slide.timelineMilestones.length > 0)
        ? slide.timelineMilestones
        : (slide.bullets && slide.bullets.length > 0)
        ? slide.bullets.map((b, idx) => {
            const parts = b.split(/:\s*|\s*-\s*/);
            return {
              quarter: `Phase 0${idx + 1}`,
              title: parts[0] || `Phase 0${idx + 1}`,
              description: parts.length > 1 ? parts.slice(1).join(": ") : parts[0],
              status: (idx === 0 ? "done" : idx === 1 ? "active" : "planned") as "done" | "active" | "planned",
            };
          })
        : [
            { quarter: "Phase 01", title: "Assessment & Discovery", description: "Comprehensive audit, vulnerability mapping & baseline setup.", status: "done" as const },
            { quarter: "Phase 02", title: "Architecture & Controls", description: "Design resilient policy frameworks & automated monitoring.", status: "active" as const },
            { quarter: "Phase 03", title: "Multi-Tier Rollout", description: "Enterprise-wide deployment and team operational enablement.", status: "planned" as const },
            { quarter: "Phase 04", title: "Continuous Optimization", description: "Proactive threat intelligence & executive review reporting.", status: "planned" as const },
          ];

      return (
        <div className={`w-full h-full ${bgClasses} flex flex-col justify-between p-[6%] sm:p-[7%] relative font-sans`} style={dynamicBgStyle}>
          <div className="mb-2">
            <SlideFrameHeader badge={slide.badge || "Roadmap Timeline"} category={slide.category} isDark={isDarkSlide} primaryColor={palette.primary} />
            <motion.h2
              {...anim(0.06)}
              className={`text-2xl sm:text-3xl font-bold ${headingFontClass} text-neutral-950 dark:text-white leading-tight mt-1`}
            >
              {safeString(slide.title)}
            </motion.h2>
            {slide.subtitle && (
              <motion.p {...anim(0.12)} className="text-xs sm:text-sm text-neutral-500 mt-1">
                {safeString(slide.subtitle)}
              </motion.p>
            )}
          </div>

          <div className="flex-1 flex items-center justify-center my-auto w-full">
            <MilestoneTimeline milestones={milestonesToUse} primaryColor={palette.primary} isPresentation={isPresentation} />
          </div>

          <SlideFrameFooter footer={slide.footer} slideNumber={slide.slideNumber} isDark={isDarkSlide} />
        </div>
      );
    }

    /* ──── RADAR CHART SLIDE ──── */
    case "chartRadar": {
      const hasNarrative = Boolean(slide.description || (slide.bullets && slide.bullets.length > 0));
      return (
        <div className={`w-full h-full ${bgClasses} flex flex-col p-[6%] relative font-sans justify-between`} style={dynamicBgStyle}>
          {hasNarrative ? (
            <div className="flex flex-col lg:flex-row gap-6 w-full h-full min-h-0 items-center">
              <div className="w-full lg:w-[45%] flex flex-col justify-center min-w-0">
                <motion.h2
                  {...anim(0)}
                  className={`text-2xl sm:text-3xl font-bold ${headingFontClass} text-neutral-950 dark:text-white leading-tight`}
                >
                  {slide.title}
                </motion.h2>
                {slide.subtitle && <motion.p {...anim(0.06)} className="text-sm sm:text-base text-neutral-500 mt-0.5">{slide.subtitle}</motion.p>}
                {slide.description && (
                  <motion.div {...anim(0.12)} className="mt-3 p-3 rounded-lg bg-neutral-100/80 dark:bg-neutral-900/60 border border-neutral-200/70 dark:border-neutral-800">
                    <p className={`${baseFont} text-neutral-700 dark:text-neutral-300 text-xs sm:text-sm leading-relaxed`}>
                      {slide.description}
                    </p>
                  </motion.div>
                )}
              </div>
              <div className="w-full lg:w-[55%] h-full min-h-0 flex items-center justify-center p-3 sm:p-4 rounded-xl bg-neutral-50/80 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800">
                <SlideChart type="radar" data={slide.chartData} primaryColor={palette.primary} accentColor={palette.accent} isPresentation={isPresentation} isThumbnail={isThumbnail} />
              </div>
            </div>
          ) : (
            <>
              <div className="mb-2">
                <motion.h2
                  {...anim(0)}
                  className={`text-2xl sm:text-3xl font-bold ${headingFontClass} text-neutral-950 dark:text-white leading-tight`}
                >
                  {slide.title}
                </motion.h2>
                {slide.subtitle && <motion.p {...anim(0.06)} className="text-sm sm:text-base text-neutral-500 mt-0.5">{slide.subtitle}</motion.p>}
              </div>
              <div className="flex-1 flex items-center justify-center min-h-0">
                <SlideChart type="radar" data={slide.chartData} primaryColor={palette.primary} accentColor={palette.accent} isPresentation={isPresentation} isThumbnail={isThumbnail} />
              </div>
            </>
          )}
        </div>
      );
    }

    /* ──── QUADRANT MATRIX SLIDE ──── */
    case "quadrantMatrix":
      return (
        <div className={`w-full h-full ${bgClasses} flex flex-col p-[6%] relative font-sans justify-between`} style={dynamicBgStyle}>
          <div className="mb-2">
            <motion.h2
              {...anim(0)}
              className={`text-2xl sm:text-3xl font-bold ${headingFontClass} text-neutral-950 dark:text-white leading-tight`}
            >
              {slide.title}
            </motion.h2>
            {slide.subtitle && <motion.p {...anim(0.06)} className="text-sm sm:text-base text-neutral-500 mt-0.5">{slide.subtitle}</motion.p>}
          </div>
          <div className="flex-1 flex items-center justify-center">
            <QuadrantMatrix data={slide.quadrantData} primaryColor={palette.primary} isPresentation={isPresentation} />
          </div>
        </div>
      );

    /* ──── FUNNEL DIAGRAM SLIDE ──── */
    case "funnel":
      return (
        <div className={`w-full h-full ${bgClasses} flex flex-col p-[6%] relative font-sans justify-between`} style={dynamicBgStyle}>
          <div className="mb-2">
            <motion.h2
              {...anim(0)}
              className={`text-2xl sm:text-3xl font-bold ${headingFontClass} text-neutral-950 dark:text-white leading-tight`}
            >
              {slide.title}
            </motion.h2>
            {slide.subtitle && <motion.p {...anim(0.06)} className="text-sm sm:text-base text-neutral-500 mt-0.5">{slide.subtitle}</motion.p>}
          </div>
          <div className="flex-1 flex items-center justify-center">
            <FunnelDiagram stages={slide.funnelStages} primaryColor={palette.primary} isPresentation={isPresentation} />
          </div>
        </div>
      );

    /* ──── 12. CIRCULAR CYCLE LOOP WITH CURVED ARROWS ──── */
    case "cycleLoop":
      return (
        <div className={`w-full h-full ${bgClasses} flex flex-col p-[6%] relative font-sf justify-between`} style={dynamicBgStyle}>
          <SlideFrameHeader badge={slide.badge} category={slide.category} isDark={isDarkSlide} primaryColor={palette.primary} />
          
          <div className="flex-1 flex items-center gap-6 my-auto">
            {/* Left Column: Title & Big Stat */}
            <div className="w-[36%] flex flex-col justify-between">
              <div>
                <motion.h2 {...anim(0)} className={`text-2xl sm:text-3xl font-extrabold ${headingFontClass} text-neutral-950 dark:text-white leading-tight font-sf`}>
                  {slide.title}
                </motion.h2>
                {slide.subtitle && (
                  <h6 className="text-xs font-bold text-neutral-900 dark:text-white mt-2 font-sf">
                    {slide.subtitle}
                  </h6>
                )}
                {slide.description && (
                  <p className="text-[10px] sm:text-xs text-neutral-500 mt-1 font-sf leading-relaxed">
                    {slide.description}
                  </p>
                )}
              </div>
              {slide.stats?.[0]?.value && (
                <div className="mt-4">
                  <span className={`${isPresentation ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"} font-black text-neutral-950 dark:text-white font-sf block leading-none`}>
                    {slide.stats[0].value}
                  </span>
                  {slide.stats[0].label && (
                    <p className="text-[9px] text-neutral-400 mt-1 font-sf">
                      {slide.stats[0].label}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Triangular Cycle Loop with Curved Arcs or Step Cards */}
            <div className="flex-1 flex items-center justify-center">
              {slide.cycleNodes && slide.cycleNodes.length >= 3 ? (
                <CurvedCycleLoop nodes={slide.cycleNodes} primaryColor={palette.primary} isPresentation={isPresentation} />
              ) : (
                <div className="w-full flex flex-col gap-2 max-h-[260px] overflow-y-auto">
                  {(slide.bullets || []).map((b, bIdx) => (
                    <div key={bIdx} className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 text-black" style={{ backgroundColor: palette.primary }}>
                        {bIdx + 1}
                      </span>
                      <p className="text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 leading-snug">{safeString(b)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <SlideFrameFooter footer={slide.footer} slideNumber={slide.slideNumber} isDark={isDarkSlide} />
        </div>
      );

    /* ──── ARCHITECTURE STACK SLIDE ──── */
    case "architecture":
      return (
        <div className={`w-full h-full ${bgClasses} flex flex-col p-[6%] relative font-sf justify-between`} style={dynamicBgStyle}>
          <SlideFrameHeader badge={slide.badge} category={slide.category} isDark={isDarkSlide} primaryColor={palette.primary} />
          <div className="mb-2">
            <motion.h2
              {...anim(0)}
              className={`text-2xl sm:text-3xl font-bold ${headingFontClass} text-neutral-950 dark:text-white leading-tight`}>
              {slide.title}
            </motion.h2>
            {slide.subtitle && <motion.p {...anim(0.06)} className="text-sm sm:text-base text-neutral-500 mt-0.5">{slide.subtitle}</motion.p>}
          </div>
          <div className="flex-1 flex items-center justify-center">
            <ArchitectureStack primaryColor={palette.primary} isPresentation={isPresentation} />
          </div>
          {slide.description && (
            <motion.p {...anim(0.2)} className="text-xs sm:text-sm text-neutral-500 text-center max-w-xl mx-auto mt-2 leading-relaxed">
              {slide.description}
            </motion.p>
          )}
          <SlideFrameFooter footer={slide.footer} slideNumber={slide.slideNumber} isDark={isDarkSlide} />
        </div>
      );

    /* ──── 8. CHEVRON PROCESS ARROW BAR SLIDE ──── */
    case "chevronProcess":
      return (
        <div className={`w-full h-full ${bgClasses} flex flex-col p-[6%] relative font-sf justify-between`} style={dynamicBgStyle}>
          <SlideFrameHeader badge={slide.badge} category={slide.category} isDark={isDarkSlide} primaryColor={palette.primary} />
          <div className="mb-2">
            <motion.h2
              {...anim(0)}
              className={`text-2xl sm:text-3xl font-extrabold ${headingFontClass} text-neutral-950 dark:text-white leading-tight font-sf`}>
              {slide.title}
            </motion.h2>
            {slide.subtitle && <motion.p {...anim(0.06)} className="text-xs sm:text-sm text-neutral-500 mt-0.5 font-sf">{slide.subtitle}</motion.p>}
          </div>
          <div className="flex-1 flex items-center justify-center my-auto">
            <ChevronProcessBar steps={slide.chevronSteps} primaryColor={palette.primary} isPresentation={isPresentation} />
          </div>
          <SlideFrameFooter footer={slide.footer} slideNumber={slide.slideNumber} isDark={isDarkSlide} />
        </div>
      );

    /* ──── 9. DUAL GAUGE RINGS WITH SPLIT CARDS ──── */
    case "gaugeRings":
      return (
        <div className={`w-full h-full ${bgClasses} flex flex-col p-[6%] relative font-sf justify-between overflow-hidden`} style={dynamicBgStyle}>
          <SlideFrameHeader badge={slide.badge} category={slide.category} isDark={isDarkSlide} primaryColor={palette.primary} />
          <div className="flex-1 flex items-center gap-6 my-auto">
            {/* Left Column: Title, Subtitle, & Optional Cards */}
            <div className="w-[36%] flex flex-col justify-between py-1">
              <div>
                <motion.h2
                  {...anim(0)}
                  className={`text-2xl sm:text-3xl font-extrabold ${headingFontClass} text-neutral-950 dark:text-white leading-tight font-sf`}
                >
                  {slide.title}
                </motion.h2>
                {slide.subtitle && (
                  <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-2 font-sf leading-relaxed">
                    {slide.subtitle}
                  </p>
                )}
              </div>

              {slide.cards && slide.cards.length > 0 && (
                <div className="mt-3 flex flex-col gap-2">
                  {slide.cards.slice(0, 2).map((c, cIdx) => (
                    <div
                      key={cIdx}
                      className="rounded-lg p-2.5 text-[10px] sm:text-xs font-semibold text-neutral-950 leading-snug shadow-2xs flex items-start gap-2"
                      style={{ backgroundColor: palette.primary }}
                    >
                      <span className="font-bold shrink-0">⚡</span>
                      <span className="line-clamp-2">{c.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Thin Divider */}
            <div className="w-[1.5px] self-stretch bg-neutral-200 dark:bg-neutral-800" />

            {/* Right Column: Gauges */}
            <div className="flex-1 flex items-center justify-center">
              <GaugeRings gauges={slide.gaugeItems} primaryColor={palette.primary} isPresentation={isPresentation} />
            </div>
          </div>
          <SlideFrameFooter footer={slide.footer} slideNumber={slide.slideNumber} isDark={isDarkSlide} />
        </div>
      );

    /* ──── 4. ASCENDING TRAJECTORY SLIDE ──── */
    case "ascendingTrajectory":
      return (
        <div className={`w-full h-full ${bgClasses} flex flex-col p-[6%] relative font-sf justify-between`} style={dynamicBgStyle}>
          <SlideFrameHeader badge={slide.badge} category={slide.category} isDark={isDarkSlide} primaryColor={palette.primary} />
          <div className="mb-2">
            <motion.h2
              {...anim(0)}
              className={`text-2xl sm:text-3xl font-extrabold ${headingFontClass} text-neutral-950 dark:text-white leading-tight font-sf`}>
              {slide.title}
            </motion.h2>
            {slide.subtitle && <motion.p {...anim(0.06)} className="text-xs sm:text-sm text-neutral-500 mt-0.5 font-sf">{slide.subtitle}</motion.p>}
          </div>
          <div className="flex-1 flex items-center justify-center my-auto">
            <AscendingTrajectory nodes={slide.trajectoryNodes} primaryColor={palette.primary} isPresentation={isPresentation} />
          </div>
          <SlideFrameFooter footer={slide.footer} slideNumber={slide.slideNumber} isDark={isDarkSlide} />
        </div>
      );

    /* ──── VERTICAL PROGRESS STACK SLIDE ──── */
    case "verticalProgress":
      return (
        <div className={`w-full h-full ${bgClasses} flex flex-col p-[6%] relative font-sf justify-between`} style={dynamicBgStyle}>
          <SlideFrameHeader badge={slide.badge} category={slide.category} isDark={isDarkSlide} primaryColor={palette.primary} />
          <div className="mb-2">
            <motion.h2
              {...anim(0)}
              className={`text-2xl sm:text-3xl font-extrabold ${headingFontClass} text-neutral-950 dark:text-white leading-tight font-sf`}>
              {slide.title}
            </motion.h2>
            {slide.subtitle && <motion.p {...anim(0.06)} className="text-xs sm:text-sm text-neutral-500 mt-0.5 font-sf">{slide.subtitle}</motion.p>}
          </div>
          <div className="flex-1 flex items-center justify-center my-auto">
            <VerticalProgressStack items={slide.verticalProgressItems} primaryColor={palette.primary} isPresentation={isPresentation} />
          </div>
          <SlideFrameFooter footer={slide.footer} slideNumber={slide.slideNumber} isDark={isDarkSlide} />
        </div>
      );

    /* ──── 1. SPLIT METRIC HERO (LEFT GLOWING CARD + RIGHT NUMBERED ROWS) ──── */
    case "splitMetric":
      if (isDualTone) {
        return renderDualToneSplit(
          <div>
            <h2 className={`text-2xl sm:text-3xl font-extrabold ${headingFontClass} leading-tight`}>
              {slide.title}
            </h2>
            {slide.subtitle && (
              <p className="text-xs sm:text-sm mt-3 opacity-80 leading-relaxed font-sf">
                {slide.subtitle}
              </p>
            )}
          </div>,
          <div className="flex-1 flex items-center my-auto">
            <SplitMetricHero metricBox={slide.metricBox} items={slide.verticalProgressItems} primaryColor={palette.primary} isPresentation={isPresentation} />
          </div>,
          "35%"
        );
      }

      return (
        <div className={`w-full h-full ${bgClasses} flex flex-col p-[6%] relative font-sf justify-between`} style={dynamicBgStyle}>
          <SlideFrameHeader badge={slide.badge} category={slide.category} isDark={isDarkSlide} primaryColor={palette.primary} />
          
          <div className="mb-2">
            <motion.h2 {...anim(0)} className={`text-2xl sm:text-3xl font-extrabold ${headingFontClass} text-neutral-950 dark:text-white leading-tight font-sf`}>
              {slide.title}
            </motion.h2>
            {slide.subtitle && <motion.p {...anim(0.06)} className="text-xs sm:text-sm text-neutral-500 mt-0.5 font-sf">{slide.subtitle}</motion.p>}
          </div>

          <div className="flex-1 flex items-center my-auto">
            <SplitMetricHero metricBox={slide.metricBox} items={slide.verticalProgressItems} primaryColor={palette.primary} isPresentation={isPresentation} />
          </div>

          <SlideFrameFooter footer={slide.footer} slideNumber={slide.slideNumber} isDark={isDarkSlide} />
        </div>
      );

    /* ──── 2. HORIZONTAL MILESTONES BAR ──── */
    case "horizontalMilestones":
      return (
        <div className={`w-full h-full ${bgClasses} flex flex-col p-[6%] relative font-sf justify-between`} style={dynamicBgStyle}>
          <SlideFrameHeader badge={slide.badge} category={slide.category} isDark={isDarkSlide} primaryColor={palette.primary} />
          
          <div className="flex items-start justify-between gap-4 mb-2">
            <motion.h2 {...anim(0)} className={`text-2xl sm:text-3xl font-extrabold ${headingFontClass} text-neutral-950 dark:text-white leading-tight font-sf`}>
              {slide.title}
            </motion.h2>
            {slide.subtitle && (
              <motion.p {...anim(0.06)} className="text-xs text-neutral-500 max-w-xs text-right leading-relaxed font-sf">
                {slide.subtitle}
              </motion.p>
            )}
          </div>

          <div className="flex-1 flex items-center my-auto">
            <HorizontalMilestonesBar milestones={slide.horizontalMilestones} primaryColor={palette.primary} isPresentation={isPresentation} />
          </div>

          <SlideFrameFooter footer={slide.footer} slideNumber={slide.slideNumber} isDark={isDarkSlide} />
        </div>
      );

    /* ──── 3. BOLD STATEMENT / GET IN TOUCH ──── */
    case "boldStatement":
      if (isDualTone) {
        return renderDualToneSplit(
          <div>
            <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-black ${headingFontClass} leading-[1.1] tracking-tight`}>
              {slide.title}
            </h1>
          </div>,
          <div className="my-auto max-w-xl space-y-4">
            {slide.subtitle && (
              <p className="text-sm sm:text-base md:text-lg font-medium text-neutral-800 dark:text-neutral-200 leading-relaxed font-sf">
                {slide.subtitle}
              </p>
            )}
            {slide.ctaText && (
              <div className="pt-2">
                <span
                  className="px-6 py-2.5 rounded-full font-bold text-xs sm:text-sm inline-flex items-center gap-2 shadow-md font-sf cursor-pointer"
                  style={{ backgroundColor: palette.primary, color: primaryTextColor }}
                >
                  {slide.ctaText}
                </span>
              </div>
            )}
          </div>,
          "45%"
        );
      }

      if (isGradient) {
        return (
          <div
            className="w-full h-full flex flex-col p-[7%] relative font-sf justify-between"
            style={{
              background: `linear-gradient(135deg, ${palette.primary} 0%, ${palette.primary}CC 35%, #FFFFFF 90%)`,
              color: "#111111",
            }}
          >
            <SlideFrameHeader
              badge={slide.badge || "Process Infographic"}
              category={slide.category || "Impactful Business"}
              primaryColor="#111111"
            />
            
            <div className="flex-1 flex flex-col justify-center max-w-[85%]">
              <motion.h1
                {...anim(0.06)}
                className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] font-sf text-neutral-950"
              >
                {slide.title}
              </motion.h1>
              {slide.subtitle && (
                <motion.p
                  {...anim(0.12)}
                  className="text-sm sm:text-base font-medium mt-4 leading-relaxed font-sf max-w-lg text-neutral-800"
                >
                  {slide.subtitle}
                </motion.p>
              )}
              {slide.ctaText && (
                <motion.div {...anim(0.18)} className="mt-8">
                  <span
                    className="px-6 py-3 rounded-full font-bold text-xs sm:text-sm flex items-center gap-2.5 w-fit shadow-md transition-all font-sf cursor-pointer bg-neutral-950 text-white hover:bg-neutral-800"
                  >
                    {slide.ctaText} →
                  </span>
                </motion.div>
              )}
            </div>

            <SlideFrameFooter footer={slide.footer} slideNumber={slide.slideNumber} isDark={false} />
          </div>
        );
      }

      return (
        <div
          className="w-full h-full flex flex-col p-[7%] relative font-sf justify-between overflow-hidden"
          style={{ backgroundColor: palette.primary, color: primaryTextColor }}
        >
          <SlideFrameHeader
            badge={slide.badge || "Process Infographic"}
            category={slide.category || "Impactful Business"}
            primaryColor={primaryTextColor}
          />
          
          <div className="flex-1 flex flex-col justify-center max-w-[85%]">
            <motion.h1
              {...anim(0.06)}
              className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] font-sf"
              style={{ color: primaryTextColor }}
            >
              {slide.title}
            </motion.h1>
            {slide.subtitle && (
              <motion.p
                {...anim(0.12)}
                className="text-sm sm:text-base font-medium mt-4 leading-relaxed font-sf max-w-lg"
                style={{ color: primaryTextColor === "#111111" ? "rgba(17,17,17,0.8)" : "rgba(255,255,255,0.8)" }}
              >
                {slide.subtitle}
              </motion.p>
            )}
            {slide.ctaText && (
              <motion.div {...anim(0.18)} className="mt-8">
                <span
                  className="px-6 py-3 rounded-full font-bold text-xs sm:text-sm inline-flex items-center gap-2.5 w-fit shadow-md transition-all font-sf cursor-pointer"
                  style={{
                    backgroundColor: primaryTextColor === "#111111" ? "#111111" : "#FFFFFF",
                    color: primaryTextColor === "#111111" ? "#FFFFFF" : "#111111",
                  }}
                >
                  {slide.ctaText} →
                </span>
              </motion.div>
            )}
          </div>

          <SlideFrameFooter footer={slide.footer} slideNumber={slide.slideNumber} isDark={primaryTextColor === "#FFFFFF"} />
        </div>
      );

    /* ──── 5. BUBBLE CLUSTER (3 INTERSECTING CIRCLES) ──── */
    case "bubbleCluster":
      return (
        <div className={`w-full h-full ${bgClasses} flex flex-col p-[6%] relative font-sf justify-between`} style={dynamicBgStyle}>
          <SlideFrameHeader badge={slide.badge} category={slide.category} isDark={isDarkSlide} primaryColor={palette.primary} />
          
          <div className="mb-2">
            <motion.h2 {...anim(0)} className={`text-2xl sm:text-3xl font-extrabold ${headingFontClass} text-neutral-950 dark:text-white leading-tight font-sf`}>
              {slide.title}
            </motion.h2>
            {slide.subtitle && <motion.p {...anim(0.06)} className="text-xs sm:text-sm text-neutral-500 mt-0.5 font-sf">{slide.subtitle}</motion.p>}
          </div>

          <div className="flex-1 flex items-center justify-center my-auto">
            <BubbleClusterDiagram nodes={slide.bubbleNodes} primaryColor={palette.primary} isPresentation={isPresentation} />
          </div>

          <SlideFrameFooter footer={slide.footer} slideNumber={slide.slideNumber} isDark={isDarkSlide} />
        </div>
      );

    /* ──── 6. IMAGE SPLIT WITH YELLOW ACCENTS & METRICS ──── */
    case "imageSplitMetric":
      return (
        <div className="w-full h-full bg-white dark:bg-neutral-950 flex flex-col p-[6%] relative font-sf justify-between" style={dynamicBgStyle}>
          <SlideFrameHeader badge={slide.badge} category={slide.category} isDark={isDarkSlide} primaryColor={palette.primary} />
          
          <div className="flex-1 flex items-center gap-6 my-auto">
            {/* Left Card: Visual & Floating Box */}
            <div className="w-[38%] flex flex-col gap-3">
              <div className="relative w-full h-32 sm:h-40 rounded-xl overflow-hidden bg-neutral-200 dark:bg-neutral-800 shadow-sm border border-neutral-300/40">
                <Image
                  src={slide.imageUrl || "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80"}
                  alt="Presentation Visual"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="rounded-lg p-3 text-[10px] sm:text-xs text-neutral-900 font-medium leading-snug shadow-2xs" style={{ backgroundColor: palette.primary }}>
                {slide.description || "Visualize Every Process Clearly With Structured Steps And Engaging"}
              </div>
            </div>

            {/* Right Card: Headline & Stat */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <motion.h2 {...anim(0)} className={`text-2xl sm:text-3xl font-extrabold ${headingFontClass} text-neutral-950 dark:text-white leading-tight font-sf`}>
                  {slide.title}
                </motion.h2>
                {slide.highlight && (
                  <div className="mt-3 rounded-lg p-3 text-[10px] sm:text-xs text-neutral-900 font-medium leading-snug" style={{ backgroundColor: `${palette.primary}40` }}>
                    {slide.highlight}
                  </div>
                )}
              </div>

              {slide.stats && slide.stats[0] && (
                <div className="mt-4 flex items-baseline gap-3">
                  <span className={`${isPresentation ? "text-4xl sm:text-5xl" : "text-3xl sm:text-4xl"} font-black text-neutral-950 dark:text-white font-sf`}>
                    {slide.stats[0].value}
                  </span>
                  <span className="text-[10px] sm:text-xs text-neutral-500 max-w-[200px] leading-tight">
                    {slide.stats[0].label}
                  </span>
                </div>
              )}
            </div>
          </div>

          <SlideFrameFooter footer={slide.footer} slideNumber={slide.slideNumber} isDark={isDarkSlide} />
        </div>
      );

    /* ──── 7. BOLD IMPACT WITH MASSIVE STAT ──── */
    case "boldImpact":
      if (isDualTone) {
        return renderDualToneSplit(
          <div>
            <h2 className={`text-2xl sm:text-3xl font-extrabold ${headingFontClass} leading-tight`}>
              {slide.title}
            </h2>
            {slide.subtitle && (
              <p className="text-xs sm:text-sm mt-3 opacity-80 leading-relaxed font-sf">
                {slide.subtitle}
              </p>
            )}
          </div>,
          <div className="flex-1 flex items-center justify-between gap-6 my-auto">
            <div className="flex-1">
              <span
                className="text-4xl sm:text-6xl font-black font-sf leading-none block"
                style={{ color: palette.primary }}
              >
                {slide.stats?.[0]?.value || "+85%"}
              </span>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2 font-sf">
                {slide.stats?.[0]?.label || "Compounding acceleration across key execution metrics"}
              </p>
            </div>
            {slide.description && (
              <div className="w-[45%] rounded-xl p-4 bg-white dark:bg-[#18181c] border border-neutral-200/80 dark:border-neutral-800 shadow-sm">
                <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 leading-snug font-sf">
                  {slide.description}
                </p>
              </div>
            )}
          </div>,
          "38%"
        );
      }

      if (isGradient) {
        return (
          <div
            className="w-full h-full flex flex-col p-[6%] relative font-sf justify-between"
            style={{
              background: `linear-gradient(135deg, ${palette.primary} 0%, ${palette.primary}B3 30%, #FFFFFF 85%)`,
              color: "#111111",
            }}
          >
            <SlideFrameHeader
              badge={slide.badge || "Process Infographic"}
              category={slide.category || "Impactful Business"}
              primaryColor="#111111"
            />
            
            <div className="flex items-start justify-between gap-6 mb-4">
              <motion.h2
                {...anim(0)}
                className="text-2xl sm:text-4xl font-extrabold leading-tight font-sf flex-1 text-neutral-950"
              >
                {slide.title}
              </motion.h2>
              {slide.subtitle && (
                <p
                  className="text-xs max-w-xs leading-relaxed font-sf text-neutral-800"
                >
                  {slide.subtitle}
                </p>
              )}
            </div>

            <div className="flex-1 flex items-center justify-between gap-6 my-auto">
              {/* Left Big Stat */}
              <div className="flex-1">
                {slide.highlight && (
                  <p
                    className="text-xs font-semibold mb-1 font-sf text-neutral-800"
                  >
                    {slide.highlight}
                  </p>
                )}
                <span
                  className={`${isPresentation ? "text-5xl sm:text-6xl" : "text-4xl sm:text-5xl"} font-black font-sf leading-none block text-neutral-950`}
                >
                  {slide.stats?.[0]?.value || "+85%"}
                </span>
                <p
                  className="text-xs mt-1 font-sf text-neutral-700"
                >
                  {slide.stats?.[0]?.label || "Compounding acceleration across key execution metrics"}
                </p>
              </div>

              {/* Right Secondary/White Card */}
              <div
                className="w-[42%] rounded-xl p-4 shadow-sm bg-white/90 border border-neutral-200/80"
              >
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold mb-2 shadow-2xs bg-neutral-950 text-white"
                >
                  ⚡
                </div>
                <p className="text-xs font-semibold leading-snug font-sf text-neutral-800">
                  {slide.description || "Visualize Every Process Clearly With Structured Steps And Engaging"}
                </p>
              </div>
            </div>

            <SlideFrameFooter footer={slide.footer} slideNumber={slide.slideNumber} isDark={false} />
          </div>
        );
      }

      return (
        <div
          className="w-full h-full flex flex-col p-[6%] relative font-sf justify-between overflow-hidden"
          style={{ backgroundColor: palette.primary, color: primaryTextColor }}
        >
          <SlideFrameHeader
            badge={slide.badge || "Process Infographic"}
            category={slide.category || "Impactful Business"}
            primaryColor={primaryTextColor}
          />
          
          <div className="flex items-start justify-between gap-6 mb-4">
            <motion.h2
              {...anim(0)}
              className="text-2xl sm:text-4xl font-extrabold leading-tight font-sf flex-1"
              style={{ color: primaryTextColor }}
            >
              {slide.title}
            </motion.h2>
            {slide.subtitle && (
              <p
                className="text-xs max-w-xs leading-relaxed font-sf"
                style={{ color: primaryTextColor === "#111111" ? "rgba(17,17,17,0.75)" : "rgba(255,255,255,0.75)" }}
              >
                {slide.subtitle}
              </p>
            )}
          </div>

          <div className="flex-1 flex items-center justify-between gap-6 my-auto">
            {/* Left Big Stat */}
            <div className="flex-1">
              {slide.highlight && (
                <p
                  className="text-xs font-semibold mb-1 font-sf"
                  style={{ color: primaryTextColor === "#111111" ? "rgba(17,17,17,0.85)" : "rgba(255,255,255,0.85)" }}
                >
                  {slide.highlight}
                </p>
              )}
              <span
                className={`${isPresentation ? "text-5xl sm:text-6xl" : "text-4xl sm:text-5xl"} font-black font-sf leading-none block`}
                style={{ color: primaryTextColor }}
              >
                {slide.stats?.[0]?.value || "+85%"}
              </span>
              <p
                className="text-xs mt-1 font-sf"
                style={{ color: primaryTextColor === "#111111" ? "rgba(17,17,17,0.7)" : "rgba(255,255,255,0.7)" }}
              >
                {slide.stats?.[0]?.label || "Compounding acceleration across key execution metrics"}
              </p>
            </div>

            {/* Right Secondary/White Card */}
            <div
              className="w-[42%] rounded-xl p-4 shadow-sm bg-white/95 text-neutral-950 border border-neutral-200/80"
            >
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold mb-2 shadow-2xs bg-neutral-950 text-white"
              >
                ⚡
              </div>
              <p className="text-xs font-semibold leading-snug font-sf text-neutral-800">
                {slide.description || "Visualize Every Process Clearly With Structured Steps And Engaging"}
              </p>
            </div>
          </div>

          <SlideFrameFooter footer={slide.footer} slideNumber={slide.slideNumber} isDark={primaryTextColor === "#FFFFFF"} />
        </div>
      );

    /* ──── 10. ASYMMETRIC STAT MATRIX ──── */
    case "asymmetricMatrix":
      return (
        <div className={`w-full h-full ${bgClasses} flex flex-col p-[6%] relative font-sf justify-between`} style={dynamicBgStyle}>
          <SlideFrameHeader badge={slide.badge} category={slide.category} isDark={isDarkSlide} primaryColor={palette.primary} />
          
          <div className="flex-1 flex items-center gap-6 my-auto">
            {/* Left Matrix */}
            <div className="w-[62%]">
              <AsymmetricMatrixGrid items={slide.asymmetricCards} primaryColor={palette.primary} isPresentation={isPresentation} />
            </div>

            {/* Right Headline */}
            <div className="flex-1">
              <motion.h2 {...anim(0)} className={`text-2xl sm:text-4xl font-extrabold ${headingFontClass} text-neutral-950 dark:text-white leading-tight font-sf`}>
                {slide.title}
              </motion.h2>
              {slide.subtitle && (
                <motion.p {...anim(0.06)} className="text-xs sm:text-sm text-neutral-500 mt-2 font-sf leading-relaxed">
                  {slide.subtitle}
                </motion.p>
              )}
            </div>
          </div>

          <SlideFrameFooter footer={slide.footer} slideNumber={slide.slideNumber} isDark={isDarkSlide} />
        </div>
      );

    /* ──── 11. VERTICAL CONNECTED RINGS CHAIN ──── */
    case "connectedRings":
      return (
        <div className={`w-full h-full ${bgClasses} flex flex-col p-[6%] relative font-sf justify-between`} style={dynamicBgStyle}>
          <SlideFrameHeader badge={slide.badge} category={slide.category} isDark={isDarkSlide} primaryColor={palette.primary} />
          
          <div className="flex-1 flex items-center gap-6 my-auto">
            {/* Left Column: Title & Big Stat */}
            <div className="w-[38%] flex flex-col justify-between">
              <div>
                <motion.h2 {...anim(0)} className={`text-2xl sm:text-3xl font-extrabold ${headingFontClass} text-neutral-950 dark:text-white leading-tight font-sf`}>
                  {slide.title}
                </motion.h2>
                {slide.subtitle && (
                  <p className="text-xs text-neutral-500 mt-1 font-sf">
                    {slide.subtitle}
                  </p>
                )}
              </div>
              <div className="mt-6">
                <span className={`${isPresentation ? "text-4xl sm:text-5xl" : "text-3xl sm:text-4xl"} font-black text-neutral-950 dark:text-white font-sf block leading-none`}>
                  {slide.stats?.[0]?.value || "5729+"}
                </span>
                <p className="text-[10px] sm:text-xs text-neutral-500 mt-2 font-sf leading-tight">
                  {slide.stats?.[0]?.label || "Highlight Every Milestone Using Connected Readability"}
                </p>
              </div>
            </div>

            {/* Right Column: Connected Rings */}
            <div className="flex-1">
              <ConnectedVerticalRings rings={slide.connectedRings} primaryColor={palette.primary} isPresentation={isPresentation} />
            </div>
          </div>

          <SlideFrameFooter footer={slide.footer} slideNumber={slide.slideNumber} isDark={isDarkSlide} />
        </div>
      );

    /* ──── CTA SLIDE ──── */
    case "cta":
      if (isDualTone) {
        return renderDualToneSplit(
          <div>
            <h2 className={`text-2xl sm:text-4xl font-extrabold ${headingFontClass} leading-tight`}>
              {slide.title}
            </h2>
          </div>,
          <div className="my-auto max-w-xl space-y-4">
            {slide.subtitle && (
              <p className="text-base sm:text-lg text-neutral-700 dark:text-neutral-300 font-sf leading-relaxed">
                {slide.subtitle}
              </p>
            )}
            {slide.description && (
              <p className="text-xs sm:text-sm text-neutral-500 font-sf leading-relaxed">
                {slide.description}
              </p>
            )}
            {slide.ctaText && (
              <div className="pt-2">
                <span
                  className="px-6 py-2.5 rounded-full font-bold text-xs sm:text-sm inline-flex items-center gap-2 shadow-md font-sf cursor-pointer"
                  style={{ backgroundColor: palette.primary, color: primaryTextColor }}
                >
                  {slide.ctaText}
                </span>
              </div>
            )}
          </div>,
          "45%"
        );
      }

      return (
        <div className="w-full h-full bg-neutral-950 flex flex-col justify-center items-center text-center p-[10%] relative overflow-hidden font-sans text-white">
          <div
            className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[60%] h-[40%] rounded-full blur-3xl opacity-20"
            style={{ backgroundColor: palette.primary }}
          />

          <div className="relative z-10 flex flex-col items-center">
            <motion.h2
              {...anim(0)}
              className={`text-3xl sm:text-4xl font-bold ${headingFontClass} text-white leading-tight`}
            >
              {slide.title}
            </motion.h2>
            {slide.subtitle && (
              <motion.p {...anim(0.08)} className="text-sm sm:text-base text-neutral-400 mt-3 max-w-md">
                {slide.subtitle}
              </motion.p>
            )}
            {slide.description && (
              <motion.p {...anim(0.16)} className="text-xs sm:text-sm text-neutral-500 mt-3 max-w-sm leading-relaxed">
                {slide.description}
              </motion.p>
            )}
            {slide.ctaText && (
              <motion.div
                {...anim(0.24)}
                className="mt-6 px-6 py-2.5 sm:py-3 rounded-md text-neutral-950 font-bold text-sm sm:text-base flex items-center gap-2 shadow-lg"
                style={{ backgroundColor: palette.primary }}
              >
                {safeString(slide.ctaText)}
              </motion.div>
            )}
          </div>

          <motion.div {...anim(0.3)} className="absolute bottom-[8%] flex items-center gap-2 z-10">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-neutral-950"
              style={{ backgroundColor: palette.primary }}
            >
              <Layers className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs text-neutral-500">{slide.footer || ""}</span>
          </motion.div>
        </div>
      );

    /* ──── ACTION LIST / LEARNING OBJECTIVES SLIDE ──── */
    case "actionList":
      return (
        <div className={`w-full h-full ${bgClasses} flex flex-col justify-between p-[6%] sm:p-[7%] relative font-sf`} style={dynamicBgStyle}>
          <div>
            <SlideFrameHeader badge={slide.badge || "LEARNING OBJECTIVES"} category={slide.category} isDark={isDarkSlide} primaryColor={palette.primary} rightPill={slide.topRightPill} />
            <motion.h2 {...anim(0.04)} className={`text-2xl sm:text-4xl font-extrabold ${headingFontClass} text-neutral-950 dark:text-white leading-tight mt-1`}>
              {safeString(slide.title)}
            </motion.h2>
            {slide.subtitle && (
              <motion.p {...anim(0.08)} className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1 max-w-3xl">
                {safeString(slide.subtitle)}
              </motion.p>
            )}
          </div>

          <div className="flex-1 flex flex-col justify-center gap-2.5 sm:gap-3.5 my-auto pl-4 border-l-2 sm:border-l-4 border-[#FFE500]">
            {(slide.actionItems && slide.actionItems.length > 0
              ? slide.actionItems
              : (slide.bullets || []).map((b, idx) => {
                  const parts = b.split(/:\s*|\s*-\s*/);
                  return { verb: parts[0], text: parts.slice(1).join(": ") || parts[0], tag: idx === 3 ? "Built today · reused through the Capstone" : undefined };
                })
            ).map((item, idx) => (
              <motion.div
                key={idx}
                {...anim(0.12 + idx * 0.05)}
                className="flex items-center justify-between gap-3 p-2.5 sm:p-3 rounded-lg bg-neutral-50/70 dark:bg-neutral-900/40 border border-neutral-150 dark:border-neutral-800 shadow-2xs hover:bg-neutral-100/80 transition-colors"
              >
                <div className="flex items-start gap-2.5 sm:gap-3.5">
                  <span className="font-mono font-bold text-sm sm:text-base shrink-0 text-[#854D0E] dark:text-[#FACC15]">
                    {idx + 1}.
                  </span>
                  <div className="text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 font-sf leading-snug">
                    {item.verb && (
                      <strong className="font-extrabold text-[#854D0E] dark:text-[#FACC15] mr-1.5 uppercase tracking-wide">
                        {item.verb}
                      </strong>
                    )}
                    {item.text}
                  </div>
                </div>
                {item.tag && (
                  <span className="shrink-0 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-[#FFE500]/25 text-[#854D0E] dark:text-[#FACC15] border border-[#FFE500]/40">
                    {item.tag}
                  </span>
                )}
              </motion.div>
            ))}
          </div>

          <SlideFrameFooter footer={slide.footer} slideNumber={slide.slideNumber} isDark={isDarkSlide} />
        </div>
      );

    /* ──── 3-COLUMN CARD GRID (INSTRUMENT COMPARISON) ──── */
    case "cardGrid":
      const displayCards: Array<{
        title: string;
        tag?: string;
        bullets?: string[];
        description?: string;
        footer?: string;
      }> = slide.cards && slide.cards.length > 0
        ? slide.cards
        : (slide.bullets && slide.bullets.length > 0
            ? slide.bullets.map((b, i) => {
                const bulletStr = safeString(b);
                const colonIdx = bulletStr.indexOf(":");
                const title = colonIdx > 0 && colonIdx < 40 ? bulletStr.slice(0, colonIdx) : `Point ${i + 1}`;
                const body = colonIdx > 0 && colonIdx < 40 ? bulletStr.slice(colonIdx + 1).trim() : bulletStr;
                return { title, bullets: [body] };
              })
            : (slide.description ? [{ title: "Overview", bullets: [slide.description] }] : []));

      return (
        <div className={`w-full h-full ${bgClasses} flex flex-col justify-between p-[5%] sm:p-[6%] relative font-sf`} style={dynamicBgStyle}>
          <div>
            <SlideFrameHeader badge={slide.badge || "MULTI-INSTRUMENT COMPARISON"} category={slide.category} isDark={isDarkSlide} primaryColor={palette.primary} rightPill={slide.topRightPill} />
            <motion.h2 {...anim(0.04)} className={`text-xl sm:text-3xl font-extrabold ${headingFontClass} text-neutral-950 dark:text-white leading-tight mt-1`}>
              {safeString(slide.title)}
            </motion.h2>
            {slide.subtitle && (
              <motion.p {...anim(0.08)} className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                {safeString(slide.subtitle)}
              </motion.p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 my-auto items-stretch">
            {displayCards.map((card, cIdx) => (
              <motion.div
                key={cIdx}
                {...anim(0.1 + cIdx * 0.06)}
                className="flex flex-col justify-between rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm"
              >
                <div
                  className="px-3.5 py-2.5 font-extrabold text-xs sm:text-sm tracking-wide flex items-center justify-between"
                  style={{
                    backgroundColor: cIdx === 0 ? palette.primary : cIdx === 1 ? "#171717" : "#854D0E",
                    color: cIdx === 0 ? "#111111" : "#ffffff",
                  }}
                >
                  <span>{card.title}</span>
                  {card.tag && <span className="text-[10px] font-mono opacity-80">{card.tag}</span>}
                </div>

                <div className="p-3 sm:p-4 flex-1 space-y-2 text-xs sm:text-[13px] text-neutral-800 dark:text-neutral-200">
                  {card.bullets && card.bullets.map((b, bIdx) => (
                    <div key={bIdx} className="flex items-start gap-2">
                      <span className="text-[#854D0E] dark:text-[#FACC15] shrink-0 mt-0.5">•</span>
                      <span className="leading-snug">{b}</span>
                    </div>
                  ))}
                  {card.description && <p className="leading-snug text-neutral-600 dark:text-neutral-400">{card.description}</p>}
                </div>

                {card.footer && (
                  <div className="p-2.5 sm:p-3 bg-amber-500/10 dark:bg-amber-500/20 border-t border-amber-500/30 text-amber-900 dark:text-amber-200 text-[11px] sm:text-xs font-semibold">
                    {card.footer}
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {slide.calloutBox && (
            <div className="p-2.5 rounded-lg bg-neutral-900 text-white text-xs flex items-center gap-2">
              <span className="text-[#FFE500] font-bold shrink-0">{slide.calloutBox.title || "Note"}:</span>
              <span>{slide.calloutBox.text}</span>
            </div>
          )}

          <SlideFrameFooter footer={slide.footer} slideNumber={slide.slideNumber} isDark={isDarkSlide} />
        </div>
      );

    /* ──── CASE STUDY (HORIZONTAL TIMELINE & CALLOUT) ──── */
    case "caseStudy":
      const studyCards = slide.cards && slide.cards.length >= 2
        ? slide.cards
        : (slide.bullets && slide.bullets.length >= 2
            ? [
                {
                  title: "Stage 01",
                  tag: "Initial Context",
                  bullets: slide.bullets.slice(0, Math.ceil(slide.bullets.length / 2)),
                },
                {
                  title: "Stage 02",
                  tag: "Key Outcome",
                  bullets: slide.bullets.slice(Math.ceil(slide.bullets.length / 2)),
                }
              ]
            : (slide.bullets?.length === 1
                ? [{ title: "Scenario Overview", bullets: slide.bullets }]
                : (slide.description ? [{ title: "Scenario Overview", bullets: [slide.description] }] : [])));

      return (
        <div className={`w-full h-full ${bgClasses} flex flex-col justify-between p-[5%] sm:p-[6%] relative font-sf`} style={dynamicBgStyle}>
          <div>
            <SlideFrameHeader badge={slide.badge || "CASE STUDY SCENARIO"} category={slide.category} isDark={isDarkSlide} primaryColor={palette.primary} rightPill={slide.topRightPill || "Scenario"} />
            <motion.h2 {...anim(0.04)} className={`text-xl sm:text-3xl font-extrabold ${headingFontClass} text-neutral-950 dark:text-white leading-tight mt-1`}>
              {safeString(slide.title)}
            </motion.h2>
            {slide.subtitle && (
              <motion.p {...anim(0.08)} className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                {safeString(slide.subtitle)}
              </motion.p>
            )}
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3 sm:gap-4 my-auto">
            {studyCards.map((sc, scIdx) => (
              <React.Fragment key={scIdx}>
                <motion.div
                  {...anim(0.1 + scIdx * 0.08)}
                  className="flex-1 w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-sm flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-extrabold text-sm sm:text-base text-neutral-950 dark:text-white">
                      {sc.title}
                    </span>
                    {sc.tag && (
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        scIdx === 0 ? "bg-[#FFE500] text-black" : "bg-neutral-900 text-white dark:bg-neutral-800"
                      }`}>
                        {sc.tag}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1.5 text-xs sm:text-[13px] text-neutral-700 dark:text-neutral-300">
                    {sc.bullets && sc.bullets.map((b, bIdx) => (
                      <div key={bIdx} className="flex items-start gap-2">
                        <span className="text-[#854D0E] dark:text-[#FACC15] shrink-0">•</span>
                        <span>{b}</span>
                      </div>
                    ))}
                    {sc.description && <p>{sc.description}</p>}
                  </div>
                  {sc.footer && (
                    <div className="mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-800 text-[11px] font-semibold text-neutral-500">
                      {sc.footer}
                    </div>
                  )}
                </motion.div>

                {scIdx < studyCards.length - 1 && (
                  <div className="text-neutral-400 dark:text-neutral-600 font-black text-xl shrink-0">
                    →
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          {slide.calloutBox ? (
            <motion.div
              {...anim(0.24)}
              className="p-3.5 sm:p-4 rounded-xl bg-neutral-950 text-white dark:bg-neutral-900 border border-neutral-800 flex items-center justify-between gap-3 shadow-md"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">❓</span>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#FFE500]">
                    {slide.calloutBox.title || "The Question for the Room"}
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-neutral-100">
                    {slide.calloutBox.text}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : slide.description ? (
            <div className="p-3 rounded-xl bg-neutral-950 text-white text-xs font-semibold flex items-center gap-2">
              <span className="text-[#FFE500]">💡 Key Dilemma:</span>
              <span>{slide.description}</span>
            </div>
          ) : null}

          <SlideFrameFooter footer={slide.footer} slideNumber={slide.slideNumber} isDark={isDarkSlide} />
        </div>
      );

    /* ──── SPLIT POLL / DILEMMA ──── */
    case "splitPoll":
      const taxCard = slide.cards?.[0] || {
        title: slide.bullets?.[0]?.split(/[:—–-]/)[0]?.trim() || "Perspective A",
        description: slide.bullets?.[0]?.split(/[:—–-]/).slice(1).join("—").trim() || slide.bullets?.[0] || slide.description || "Primary Consideration",
      };
      const legalCard = slide.cards?.[1] || {
        title: slide.bullets?.[1]?.split(/[:—–-]/)[0]?.trim() || "Perspective B",
        description: slide.bullets?.[1]?.split(/[:—–-]/).slice(1).join("—").trim() || slide.bullets?.[1] || "Alternative Consideration",
      };
      const pollOpts = slide.pollOptions && slide.pollOptions.length > 0
        ? slide.pollOptions
        : (slide.bullets && slide.bullets.length > 2
            ? slide.bullets.slice(2, 5).map((b, bIdx) => ({
                label: String.fromCharCode(65 + bIdx),
                text: safeString(b),
              }))
            : []);

      return (
        <div className={`w-full h-full ${bgClasses} flex flex-col justify-between p-[5%] sm:p-[6%] relative font-sf`} style={dynamicBgStyle}>
          <div>
            <SlideFrameHeader badge={slide.badge || "DECISION DILEMMA & POLL"} category={slide.category} isDark={isDarkSlide} primaryColor={palette.primary} rightPill={slide.topRightPill || "Scenario"} />
            <motion.h2 {...anim(0.04)} className={`text-xl sm:text-3xl font-extrabold ${headingFontClass} text-neutral-950 dark:text-white leading-tight mt-1`}>
              {safeString(slide.title)}
            </motion.h2>
            {slide.subtitle && (
              <motion.p {...anim(0.08)} className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                {safeString(slide.subtitle)}
              </motion.p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 my-2">
            <motion.div {...anim(0.1)} className="rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
              <div className="bg-[#FFE500] text-black font-extrabold px-3.5 py-2 uppercase tracking-wider text-xs flex items-center justify-between">
                <span>{taxCard.title}</span>
                <span className="text-[10px] font-bold opacity-75">PERSPECTIVE 01</span>
              </div>
              <div className="p-3 sm:p-4 text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 font-semibold leading-relaxed">
                {taxCard.description || taxCard.bullets?.join(" ")}
              </div>
            </motion.div>

            <motion.div {...anim(0.14)} className="rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
              <div className="bg-neutral-900 dark:bg-neutral-800 text-white font-extrabold px-3.5 py-2 uppercase tracking-wider text-xs flex items-center justify-between">
                <span>{legalCard.title}</span>
                <span className="text-[10px] font-bold opacity-75">PERSPECTIVE 02</span>
              </div>
              <div className="p-3 sm:p-4 text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 font-semibold leading-relaxed">
                {legalCard.description || legalCard.bullets?.join(" ")}
              </div>
            </motion.div>
          </div>

          {pollOpts.length > 0 && (
            <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 space-y-2">
              <div className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <span>🙋</span>
                <span>Decision Poll</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {pollOpts.map((opt, oIdx) => (
                  <div
                    key={oIdx}
                    className="flex items-center gap-2.5 p-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 hover:border-amber-400 cursor-pointer transition-colors shadow-2xs text-xs"
                  >
                    <span className="w-5 h-5 rounded-full bg-neutral-900 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                      {opt.label}
                    </span>
                    <span className="text-neutral-800 dark:text-neutral-200 font-medium leading-tight">
                      {opt.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <SlideFrameFooter footer={slide.footer} slideNumber={slide.slideNumber} isDark={isDarkSlide} />
        </div>
      );

    /* ──── INTERACTIVE CASE CARD & PROMPT TEST ──── */
    case "interactiveCase":
      const caseCardObj = slide.cards?.[0] || {
        title: slide.bullets?.[0]?.split(/[:—–-]/)[0]?.trim() || "Brief / Input",
        bullets: slide.bullets && slide.bullets.length > 0 ? slide.bullets.slice(0, 3) : (slide.description ? [slide.description] : ["Primary details."]),
      };
      const templateCardObj = slide.cards?.[1] || {
        title: "Key Framework",
        bullets: slide.bullets && slide.bullets.length > 3 ? slide.bullets.slice(3) : ["Scope & Requirements", "Risk Analysis & Assessment", "Execution Strategy & Next Steps"],
      };

      return (
        <div className={`w-full h-full ${bgClasses} flex flex-col justify-between p-[5%] sm:p-[6%] relative font-sf`} style={dynamicBgStyle}>
          <div>
            <SlideFrameHeader badge={slide.badge || "INTERACTIVE CASE BRIEF"} category={slide.category} isDark={isDarkSlide} primaryColor={palette.primary} rightPill={slide.topRightPill || "Case Card"} />
            <motion.h2 {...anim(0.04)} className={`text-xl sm:text-3xl font-extrabold ${headingFontClass} text-neutral-950 dark:text-white leading-tight mt-1`}>
              {safeString(slide.title)}
            </motion.h2>
            {slide.subtitle && (
              <motion.p {...anim(0.08)} className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                {safeString(slide.subtitle)}
              </motion.p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 my-2">
            <motion.div {...anim(0.1)} className="rounded-xl border-2 border-neutral-950 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-3.5 shadow-sm flex flex-col justify-between">
              <div className="bg-[#FFE500] text-black font-extrabold px-3 py-1 rounded text-xs w-fit mb-2 uppercase tracking-wider">
                {caseCardObj.title || "Case Card"}
              </div>
              <div className="space-y-1.5 text-xs sm:text-[13px] text-neutral-800 dark:text-neutral-200">
                {caseCardObj.bullets && caseCardObj.bullets.map((b, bIdx) => (
                  <div key={bIdx} className="flex items-start gap-2">
                    <span className="text-[#854D0E] dark:text-[#FACC15] shrink-0">•</span>
                    <span>{b}</span>
                  </div>
                ))}
              </div>
              {slide.promptBox && (
                <div className="mt-3 p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-[11px] font-mono text-neutral-700 dark:text-neutral-300">
                  <span className="font-bold text-neutral-900 dark:text-white block mb-0.5">{slide.promptBox.label}:</span>
                  &ldquo;{slide.promptBox.prompt}&rdquo;
                </div>
              )}
            </motion.div>

            <motion.div {...anim(0.14)} className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-800 p-3.5 shadow-sm flex flex-col justify-between">
              <div className="bg-neutral-900 text-white font-extrabold px-3 py-1 rounded text-xs w-fit mb-2 uppercase tracking-wider">
                {templateCardObj.title || "Output Template"}
              </div>
              <div className="space-y-1.5 text-xs sm:text-[13px] text-neutral-800 dark:text-neutral-200">
                {templateCardObj.bullets && templateCardObj.bullets.map((b, bIdx) => (
                  <div key={bIdx} className="p-1.5 rounded bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                    <span className="font-medium">{b}</span>
                    <span className="text-[10px] text-neutral-400 font-mono">Fill in</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {slide.bottomBanners && slide.bottomBanners.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {slide.bottomBanners.map((bn, bnIdx) => (
                <div
                  key={bnIdx}
                  className={`p-2.5 rounded-lg font-medium ${
                    bn.variant === "yellow"
                      ? "bg-[#FFE500]/25 text-[#854D0E] border border-[#FFE500]/50"
                      : "bg-neutral-950 text-white border border-neutral-800"
                  }`}
                >
                  <span className="font-bold mr-1.5">{bn.variant === "yellow" ? "💡" : "🔄"} {bn.title}:</span>
                  <span>{bn.text}</span>
                </div>
              ))}
            </div>
          )}

          <SlideFrameFooter footer={slide.footer} slideNumber={slide.slideNumber} isDark={isDarkSlide} />
        </div>
      );

    /* ──── FULL-BLEED BREAK SCREEN ──── */
    case "breakSlide":
      return (
        <div className="w-full h-full bg-[#FFE500] text-black flex flex-col justify-between p-[8%] relative overflow-hidden font-sf select-none">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-black/15">
              {slide.badge || "SESSION PAUSE"}
            </span>
            <span className="text-xl font-mono font-black opacity-50">
              {String(slide.slideNumber || "20").padStart(2, "0")}
            </span>
          </div>

          <div className="my-auto flex flex-col items-center text-center max-w-2xl mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-black text-[#FFE500] flex items-center justify-center text-2xl shadow-lg">
              ☕
            </div>
            <motion.h1 {...anim(0.06)} className="text-3xl sm:text-5xl font-black tracking-tight leading-none text-black">
              {safeString(slide.title)}
            </motion.h1>
            {slide.subtitle && (
              <motion.p {...anim(0.12)} className="text-sm sm:text-base font-semibold text-black/85 max-w-lg leading-relaxed">
                {safeString(slide.subtitle)}
              </motion.p>
            )}
            <motion.div
              {...anim(0.18)}
              className="px-6 py-2.5 rounded-full bg-white text-black font-extrabold text-sm sm:text-base shadow-md inline-flex items-center gap-2 border border-black/10"
            >
              <span>🕒</span>
              <span>{slide.ctaText || "We resume at [insert return time]"}</span>
            </motion.div>
          </div>

          <div className="flex items-center justify-between text-xs font-mono tracking-wider opacity-60 uppercase">
            <span>{slide.footer || ""}</span>
            <span>SESSION BREAK</span>
          </div>
        </div>
      );

    /* ──── KEY INSIGHT / SYNTHESIS SLIDE ──── */
    case "keyInsight":
      return (
        <div className={`w-full h-full ${bgClasses} flex flex-col justify-between p-[6%] sm:p-[7%] relative font-sf`} style={dynamicBgStyle}>
          <div>
            <SlideFrameHeader badge={slide.badge || "KEY STRATEGIC INSIGHT"} category={slide.category} isDark={isDarkSlide} primaryColor={palette.primary} rightPill={slide.topRightPill} />
            <div className="bg-[#FFE500] text-black px-4 py-2 rounded-lg font-black text-xl sm:text-2xl mt-1 tracking-tight inline-block shadow-xs">
              💡 {safeString(slide.title)}
            </div>
            {slide.subtitle && (
              <motion.p {...anim(0.08)} className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-2 font-medium">
                {safeString(slide.subtitle)}
              </motion.p>
            )}
          </div>

          <div className="my-auto space-y-3">
            {slide.tableRows && slide.tableRows.length > 0 && (
              <div className="rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm max-w-2xl">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-neutral-100 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
                      {(slide.tableHeaders || ["Instrument", "Wins on", "Loses on"]).map((h, hIdx) => (
                        <th key={hIdx} className="p-2.5 font-bold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {slide.tableRows.map((r, rIdx) => (
                      <tr key={rIdx} className="border-b border-neutral-100 dark:border-neutral-800 last:border-b-0">
                        <td className="p-2.5 font-extrabold">{r.feature || r.cells?.[0]}</td>
                        <td className="p-2.5 font-semibold text-neutral-900 dark:text-neutral-100">{r.current || r.cells?.[1]}</td>
                        <td className="p-2.5 font-semibold text-[#854D0E] dark:text-[#FACC15]">{r.proposed || r.cells?.[2]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {slide.actionItems && slide.actionItems.length > 0 && (
              <div className="space-y-2">
                {slide.actionItems.map((ai, aiIdx) => (
                  <div key={aiIdx} className="flex items-start gap-3 p-2.5 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xs">
                    <span className="w-6 h-6 rounded-full bg-neutral-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {aiIdx + 1}
                    </span>
                    <div className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      {ai.verb && <strong className="text-[#854D0E] dark:text-[#FACC15] mr-1.5">{ai.verb}</strong>}
                      {ai.text}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {slide.quote && (
              <div className="p-3.5 sm:p-4 rounded-xl border-l-4 border-[#854D0E] dark:border-[#FACC15] bg-amber-500/10 dark:bg-amber-500/15">
                <p className="text-xs sm:text-sm italic font-semibold text-neutral-800 dark:text-neutral-200 leading-relaxed">
                  &ldquo;{slide.quote.text}&rdquo;
                </p>
                {slide.quote.author && (
                  <span className="block mt-1 text-[11px] font-mono text-neutral-500">— {slide.quote.author}</span>
                )}
              </div>
            )}

            {slide.bullets && slide.bullets.length > 0 && !slide.actionItems && (
              <div className="space-y-1.5 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
                {slide.bullets.map((b, bIdx) => (
                  <div key={bIdx} className="flex items-start gap-2">
                    <span className="text-[#FFE500] font-bold">✔</span>
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <SlideFrameFooter footer={slide.footer} slideNumber={slide.slideNumber} isDark={isDarkSlide} />
        </div>
      );

    default:
      // Safe fallback layout: Clean elegant bullets/overview
      return (
        <div className={`w-full h-full ${bgClasses} flex flex-col justify-between p-[8%] relative font-sans`} style={dynamicBgStyle}>
          <div className="mb-2">
            <motion.h2
              {...anim(0)}
              className={`text-2xl sm:text-3xl font-bold ${headingFontClass} text-neutral-950 dark:text-white leading-tight`}
            >
              {safeString(slide.title || "Slide Overview")}
            </motion.h2>
            {slide.subtitle && (
              <motion.p {...anim(0.06)} className="text-sm sm:text-base text-neutral-500 mt-1">
                {safeString(slide.subtitle)}
              </motion.p>
            )}
          </div>

          <div className="flex-1 flex flex-col justify-center gap-2.5 my-auto">
            {slide.bullets && slide.bullets.length > 0 ? (
              slide.bullets.map((b, i) => (
                <motion.div key={i} {...anim(0.1 + i * 0.08)} className="flex items-start gap-2.5">
                  <CheckCircle2
                    className="w-4 h-4 mt-0.5 shrink-0"
                    style={{ color: palette.primary }}
                  />
                  <span className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
                    {safeString(b)}
                  </span>
                </motion.div>
              ))
            ) : slide.description ? (
              <motion.p {...anim(0.12)} className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-xl">
                {safeString(slide.description)}
              </motion.p>
            ) : null}
          </div>

          <div className="relative z-10 flex items-center gap-2 mt-auto">
            <div
              className="w-5 h-5 rounded-sm flex items-center justify-center"
              style={{ backgroundColor: palette.primary, color: palette.id === "launcher" ? "#111" : "#fff" }}
            >
              <Layers className="w-3 h-3" />
            </div>
            <span className="text-xs font-semibold text-neutral-400">{slide.footer || ""}</span>
          </div>
        </div>
      );
  }
}

/* ───────────────────────────────────────────────────
 * Thumbnail Preview (Miniature Scaled Vector Presentation)
 * ─────────────────────────────────────────────────── */
function SlideThumbnail({
  slide,
  index,
  isActive,
  palette,
  bgStyle,
  fontPairing,
  titleFont = "sf-pro",
  bodyFont = "sf-pro",
  onClick,
}: {
  slide: SlideData;
  index: number;
  isActive: boolean;
  palette: ColorPalette;
  bgStyle: BgStyle;
  fontPairing: FontPairing;
  titleFont?: TitleFont;
  bodyFont?: BodyFont;
  onClick: () => void;
}) {
  return (
    <div className="flex items-center gap-2 group w-full select-none">
      <span
        className={`w-3.5 text-[11px] font-bold text-right tabular-nums transition-colors shrink-0 ${
          isActive
            ? "text-neutral-900 dark:text-white"
            : "text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-700 dark:group-hover:text-neutral-300"
        }`}
      >
        {index + 1}
      </span>
      <button
        onClick={onClick}
        className={`group/thumb relative flex-1 aspect-[16/9] rounded-md overflow-hidden border-2 transition-all cursor-pointer text-left bg-white dark:bg-[#18181b] ${
          isActive
            ? "border-[#7C3AED] ring-2 ring-[#7C3AED]/25 shadow-sm scale-[1.01]"
            : "border-neutral-200/90 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 opacity-80 hover:opacity-100"
        }`}
      >
        <div className="absolute inset-0 w-[500%] h-[500%] origin-top-left transform scale-[0.2] pointer-events-none select-none">
          <SlideRenderer
            slide={slide}
            isThumbnail
            palette={palette}
            bgStyle={bgStyle}
            fontPairing={fontPairing}
            titleFont={titleFont}
            bodyFont={bodyFont}
          />
        </div>
      </button>
    </div>
  );
}

function LauncherDropdown<T extends string>({
  value,
  options,
  onChange,
  getFontClass,
}: {
  value: T;
  options: Array<{ id: T; name: string; tag: string }>;
  onChange: (val: T) => void;
  getFontClass?: (val: T) => string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.id === value) || options[0];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative w-full select-none">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-2.5 sm:py-3 rounded-md bg-white dark:bg-[#181818] border transition-all flex items-center justify-between cursor-pointer text-left shadow-2xs ${
          isOpen
            ? "border-neutral-900 dark:border-neutral-200 ring-2 ring-[#FFDE3C]/40"
            : "border-neutral-300/90 dark:border-neutral-700/90 hover:border-neutral-400 dark:hover:border-neutral-500"
        }`}
      >
        <div className="flex items-center gap-2.5 truncate">
          <span className={`text-[15px] sm:text-[15.5px] font-semibold text-neutral-950 dark:text-white truncate ${getFontClass ? getFontClass(value) : ""}`}>
            {selectedOption.name}
          </span>
          <span className="text-[13px] text-neutral-500 dark:text-neutral-400 truncate hidden sm:inline font-normal">
            • {selectedOption.tag}
          </span>
        </div>
        <ChevronDown
          className={`w-4.5 h-4.5 text-neutral-500 dark:text-neutral-400 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-neutral-900 dark:text-white" : ""
          }`}
        />
      </button>

      {/* Animated Dropdown Menu Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.99 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-[#181818] border border-neutral-200 dark:border-neutral-800 rounded-md shadow-xl py-1.5 max-h-72 overflow-y-auto"
          >
            {options.map((opt) => {
              const isSelected = opt.id === value;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    onChange(opt.id);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-[#FFDE3C]/20 dark:bg-[#FFDE3C]/15 text-neutral-950 dark:text-white font-semibold"
                      : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 hover:text-neutral-950 dark:hover:text-white font-normal"
                  }`}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className={`text-[15px] sm:text-[15.5px] ${isSelected ? "font-bold text-neutral-950 dark:text-white" : "font-medium"} ${getFontClass ? getFontClass(opt.id) : ""}`}>
                      {opt.name}
                    </span>
                    <span className="text-[12.5px] text-neutral-500 dark:text-neutral-400">
                      {opt.tag}
                    </span>
                  </div>
                  {isSelected && (
                    <Check className="w-4.5 h-4.5 text-neutral-950 dark:text-[#FFDE3C] shrink-0 stroke-[2.5]" />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ───────────────────────────────────────────────────
 * Main Deck Generator Page Component
 * ─────────────────────────────────────────────────── */
export default function DeckGeneratorPage() {
  const { setCollapsed } = useSidebar();
  const [step, setStep] = useState<"input" | "styler" | "confirm" | "slides">("input");
  const [content, setContent] = useState("");
  const [attachedSkill, setAttachedSkill] = useState<AttachedSkill | null>(null);
  const [mode, setMode] = useState<ContentMode>("generate");
  const [slideCount, setSlideCount] = useState("8");
  
  // Custom Style State
  const [selectedPalette, setSelectedPalette] = useState<ColorPalette>(COLOR_PALETTES[0]);
  const [bgColors, setBgColors] = useState({
    color1: "#FFDE3C", // Primary Base
    color2: "#FFFFFF", // Secondary Split
    color3: "#111111", // Accent / Dark
  });
  const [isCustomBgColors, setIsCustomBgColors] = useState(false);
  const [bgStyle, setBgStyle] = useState<BgStyle>("solid");
  const [fontPairing, setFontPairing] = useState<FontPairing>("modern");
  const [titleFont, setTitleFont] = useState<TitleFont>("sf-pro");
  const [bodyFont, setBodyFont] = useState<BodyFont>("sf-pro");
  const [layoutMood, setLayoutMood] = useState<LayoutMood>("framework");

  const applyFontPreset = (tf: TitleFont, bf: BodyFont) => {
    setTitleFont(tf);
    setBodyFont(bf);
    if (tf === "bricolage") setFontPairing("creative");
    else setFontPairing("modern");
  };

  const handleUpdateBgColor = (key: "color1" | "color2" | "color3", val: string) => {
    let cleanHex = val.trim();
    if (!cleanHex.startsWith("#")) cleanHex = `#${cleanHex}`;
    const nextColors = { ...bgColors, [key]: cleanHex };
    setBgColors(nextColors);
    setIsCustomBgColors(true);
    setSelectedPalette({
      id: "custom",
      name: `Custom (${nextColors.color1.toUpperCase()})`,
      primary: nextColors.color1,
      secondary: nextColors.color2,
      accent: nextColors.color3,
      bgLight: "bg-white",
      bgDark: "dark:bg-[#121212]",
      textPrimary: "text-neutral-950",
      badgeBg: "bg-neutral-900 text-white",
    });
  };

  const handleSelectPalette = (pal: ColorPalette) => {
    setSelectedPalette(pal);
    setIsCustomBgColors(false);
    if (pal.id === "launcher") {
      setBgColors({ color1: "#FFDE3C", color2: "#FFFFFF", color3: "#111111" });
    } else if (pal.id === "silicon") {
      setBgColors({ color1: "#171717", color2: "#FFFFFF", color3: "#737373" });
    } else if (pal.id === "indigo") {
      setBgColors({ color1: "#4F46E5", color2: "#EEF2FF", color3: "#6366F1" });
    } else if (pal.id === "emerald") {
      setBgColors({ color1: "#059669", color2: "#ECFDF5", color3: "#10B981" });
    }
  };

  // Content Density & Questionnaire State
  const [density, setDensity] = useState<"brief" | "medium" | "detailed" | "preserve">("medium");
  const [audience, setAudience] = useState<string>("Executives & C-Level");
  const [purpose, setPurpose] = useState<string>("Pitch Idea & Strategy");
  const [slideCountPreference, setSlideCountPreference] = useState<string>("Auto");
  const [keyTakeaway, setKeyTakeaway] = useState<string>("");
  const [specialNotes, setSpecialNotes] = useState<string>("");
  const [selectedLayoutPreview, setSelectedLayoutPreview] = useState<number>(1);
  const [showTemplateModal, setShowTemplateModal] = useState<boolean>(false);
  const [showSkillModal, setShowSkillModal] = useState<boolean>(false);
  const [customBrainActive, setCustomBrainActive] = useState<boolean>(false);
  const [showCloneStyleModal, setShowCloneStyleModal] = useState<boolean>(false);
  const [clonedStyle, setClonedStyle] = useState<ClonedStyleResult | null>(null);

  const handleApplyClonedStyle = (style: ClonedStyleResult) => {
    setClonedStyle(style);
    setBgColors({
      color1: style.palette.primary,
      color2: style.palette.secondary,
      color3: style.palette.accent,
    });
    setIsCustomBgColors(true);
    if (style.typography.titleFontSuggestion) {
      setTitleFont(style.typography.titleFontSuggestion);
    }
    if (style.typography.bodyFontSuggestion) {
      setBodyFont(style.typography.bodyFontSuggestion);
    }
    setBgStyle(style.bgStyle);
    const mappedMood: LayoutMood =
      style.layoutMood === "data" || (style.layoutMood as string) === "data-driven"
        ? "data"
        : style.layoutMood === "framework"
        ? "framework"
        : "executive";
    setLayoutMood(mappedMood);
    setDensity(style.contentDensity);
  };

  const handleClearClonedStyle = () => {
    setClonedStyle(null);
    setIsCustomBgColors(false);
  };

  const [isPlanningOutline, setIsPlanningOutline] = useState<boolean>(false);

  const handlePlanOutline = async (targetCount: number) => {
    const effectiveContent =
      content.trim() ||
      (attachedSkill
        ? "Program Eksekutif ITB × RevoU: Data-Driven & AI-Enabled Decision Making for Leaders (Governance, Risk & Compliance for Data and AI Strategy)"
        : "");
    if (!effectiveContent) return;
    setIsPlanningOutline(true);

    try {
      const activeProvider = typeof window !== "undefined" ? (localStorage.getItem("ai_provider") || "gemini") : "gemini";
      const storedApiKey = typeof window !== "undefined" ? (localStorage.getItem(`ai_key_${activeProvider}`) || "") : "";
      const storedModel = typeof window !== "undefined" ? (localStorage.getItem(`ai_model_${activeProvider}`) || "") : "";

      const skillDirectives = attachedSkill
        ? `=== INSTITUTIONAL SKILL ATTACHMENT (${attachedSkill.name}) ===\n${attachedSkill.content}\n`
        : "";
      const combinedDirectives = [skillDirectives, clonedStyle?.visualDirectives || ""].filter(Boolean).join("\n\n");

      const res = await fetch("/api/decks/plan-outline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: effectiveContent,
          targetCount,
          audience,
          purpose,
          layoutMood,
          clonedStyleDirectives: combinedDirectives,
          apiKey: storedApiKey,
          provider: activeProvider,
          model: storedModel,
        }),
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.outline) && data.outline.length > 0) {
        setEditableBreakdown(data.outline);
        setSlideCountPreference(`${data.outline.length} Slides`);
        setSlideCount(String(data.outline.length));
      }
    } catch (err) {
      console.error("Plan outline error:", err);
    } finally {
      setIsPlanningOutline(false);
    }
  };

  // Load user defaults and custom brain from settings
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedDensity = localStorage.getItem("deck_default_density");
      const storedCount = localStorage.getItem("deck_default_count");
      const storedBrain = localStorage.getItem("deck_custom_brain");

      if (storedDensity && (storedDensity === "brief" || storedDensity === "medium" || storedDensity === "detailed")) {
        setDensity(storedDensity as "brief" | "medium" | "detailed");
      }
      if (storedCount) {
        if (storedCount === "Auto") {
          setSlideCountPreference("Auto");
        } else {
          setSlideCountPreference(`${storedCount} Slides`);
          setSlideCount(storedCount);
        }
      }
      if (storedBrain && storedBrain.trim().length > 0) {
        setCustomBrainActive(true);
      }
    }
  }, []);

  const handleDownloadTemplateMd = () => {
    const blob = new Blob([STANDARD_MD_TEMPLATE], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "deck-prompt-template.md");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const detectedSlideCount = detectPromptSlideCount(content);
  const [editableBreakdown, setEditableBreakdown] = useState<ParsedSlideBreakdown[]>([]);

  // Synchronize editable breakdown cards whenever content or step changes
  useEffect(() => {
    if (content.trim()) {
      setEditableBreakdown(parsePromptBreakdown(content));
    }
  }, [content]);

  const handleAddSlideCard = () => {
    setEditableBreakdown((prev) => [
      ...prev,
      {
        slideNumber: prev.length + 1,
        headline: `Slide ${prev.length + 1}: Inisiatif & Poin Baru`,
        subheadline: "Subjudul penjelasan materi slide",
        visualLayout: "Visual & Diagram Flow",
        description: "Tuliskan poin penjelasan atau narasi utama untuk slide ini...",
      },
    ]);
  };

  const handleDeleteSlideCard = (index: number) => {
    setEditableBreakdown((prev) => {
      if (prev.length <= 1) return prev;
      const next = prev.filter((_, i) => i !== index);
      return next.map((item, i) => ({ ...item, slideNumber: i + 1 }));
    });
  };

  const handleMoveSlideCard = (index: number, direction: "up" | "down") => {
    setEditableBreakdown((prev) => {
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const next = [...prev];
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next.map((item, i) => ({ ...item, slideNumber: i + 1 }));
    });
  };

  const handleUpdateCardField = (
    index: number,
    field: keyof ParsedSlideBreakdown,
    val: any
  ) => {
    setEditableBreakdown((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };

  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isPresentation, setIsPresentation] = useState(false);

  // Real-time Studio Monitor States
  const [generatingStage, setGeneratingStage] = useState("Menghubungkan ke AI...");
  const [generatingProgress, setGeneratingProgress] = useState(0);
  const [currentGenIndex, setCurrentGenIndex] = useState(0);
  const [isThumbnailCollapsed, setIsThumbnailCollapsed] = useState(false);
  const [speakerNotes, setSpeakerNotes] = useState<Record<string, string>>({});
  const [isSpeakerNotesOpen, setIsSpeakerNotesOpen] = useState(false);
  const [activeToolbarAction, setActiveToolbarAction] = useState<string | null>(null);

  // AI Slide Co-Pilot & Prompt Editor State
  const [editPrompt, setEditPrompt] = useState<string>("");
  const [editScope, setEditScope] = useState<"single" | "all">("single");
  const [isEditingSlide, setIsEditingSlide] = useState<boolean>(false);
  const [editStatusMessage, setEditStatusMessage] = useState<string | null>(null);
  const [slidesHistory, setSlidesHistory] = useState<SlideData[][]>([]);

  const presentationRef = useRef<HTMLDivElement>(null);
  const activeSlide = slides[activeSlideIndex];

  /* Keyboard Navigation for presentation mode */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isPresentation) return;
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        setActiveSlideIndex((prev) => Math.min(prev + 1, slides.length - 1));
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        setActiveSlideIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Escape") {
        setIsPresentation(false);
      }
    },
    [isPresentation, slides.length]
  );

  React.useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

/* ───────────────────────────────────────────────────
 * Real-Time Progressive Canvas Builder Engine
 * ─────────────────────────────────────────────────── */
async function streamBuildSlide(
  inputSlide: SlideData,
  onUpdate: (partial: SlideData, stageText: string) => void,
  isCancelled: () => boolean,
  speedMultiplier: number = 1
) {
  const finalSlide = normalizeSlide(inputSlide);
  let current: SlideData = {
    id: finalSlide.id,
    layout: finalSlide.layout,
    title: "",
    badge: finalSlide.badge,
    category: finalSlide.category,
    highlight: finalSlide.highlight,
    footer: finalSlide.footer,
    ctaText: finalSlide.ctaText,
  };

  const delay = (ms: number) => new Promise((r) => setTimeout(r, Math.max(6, ms / speedMultiplier)));

  // 1. Stream Title letter by letter
  const fullTitle = finalSlide.title || "";
  for (let i = 1; i <= fullTitle.length; i += (fullTitle.length > 60 ? 3 : 2)) {
    if (isCancelled()) return;
    current = { ...current, title: fullTitle.slice(0, i) };
    onUpdate(current, `✍️ Menulis judul: "${fullTitle.slice(0, Math.min(i, 30))}..."`);
    await delay(18);
  }
  current = { ...current, title: fullTitle };
  onUpdate(current, `✨ Judul selesai`);
  await delay(60);

  // 2. Stream Subtitle if present
  if (finalSlide.subtitle) {
    const fullSub = finalSlide.subtitle;
    for (let i = 1; i <= fullSub.length; i += (fullSub.length > 60 ? 4 : 2)) {
      if (isCancelled()) return;
      current = { ...current, subtitle: fullSub.slice(0, i) };
      onUpdate(current, `📝 Menulis sub-judul: "${fullSub.slice(0, Math.min(i, 25))}..."`);
      await delay(15);
    }
    current = { ...current, subtitle: fullSub };
    onUpdate(current, `✨ Sub-judul selesai`);
    await delay(50);
  }

  // 3. Stream Bullets line by line & letter by letter
  if (finalSlide.bullets && finalSlide.bullets.length > 0) {
    current = { ...current, bullets: [] };
    for (let bIdx = 0; bIdx < finalSlide.bullets.length; bIdx++) {
      const bulletText = finalSlide.bullets[bIdx];
      let currentBullet = "";
      for (let i = 1; i <= bulletText.length; i += (bulletText.length > 60 ? 4 : 3)) {
        if (isCancelled()) return;
        currentBullet = bulletText.slice(0, i);
        const nextBullets = [...(current.bullets || [])];
        nextBullets[bIdx] = currentBullet;
        current = { ...current, bullets: nextBullets };
        onUpdate(current, `📌 Menyusun poin ${bIdx + 1}/${finalSlide.bullets.length}...`);
        await delay(14);
      }
      const nextBullets = [...(current.bullets || [])];
      nextBullets[bIdx] = bulletText;
      current = { ...current, bullets: nextBullets };
      await delay(60);
    }
  }

  // 4. Stream Process Steps
  if (finalSlide.processSteps && finalSlide.processSteps.length > 0) {
    current = { ...current, processSteps: [] };
    for (let sIdx = 0; sIdx < finalSlide.processSteps.length; sIdx++) {
      const step = finalSlide.processSteps[sIdx];
      const nextSteps = [...(current.processSteps || []), { title: step.title, description: step.description }];
      current = { ...current, processSteps: nextSteps };
      onUpdate(current, `🔢 Membangun langkah proses ${sIdx + 1}/${finalSlide.processSteps.length}: ${step.title}...`);
      await delay(140);
    }
  }

  // 5. Stream Chevron Steps
  if (finalSlide.chevronSteps && finalSlide.chevronSteps.length > 0) {
    current = { ...current, chevronSteps: [] };
    for (let sIdx = 0; sIdx < finalSlide.chevronSteps.length; sIdx++) {
      const step = finalSlide.chevronSteps[sIdx];
      const nextSteps = [...(current.chevronSteps || []), step];
      current = { ...current, chevronSteps: nextSteps };
      onUpdate(current, `⚡ Merangkai chevron ${sIdx + 1}/${finalSlide.chevronSteps.length}: ${step.title}...`);
      await delay(140);
    }
  }

  // 6. Stream Table Rows (Header + Row by Row)
  if (finalSlide.tableRows && finalSlide.tableRows.length > 0) {
    current = { ...current, tableRows: [] };
    for (let rIdx = 0; rIdx < finalSlide.tableRows.length; rIdx++) {
      const row = finalSlide.tableRows[rIdx];
      const nextRows = [...(current.tableRows || []), row];
      current = { ...current, tableRows: nextRows };
      onUpdate(current, `📊 Mengisi baris tabel perbandingan ${rIdx + 1}/${finalSlide.tableRows.length}: ${row.feature}...`);
      await delay(160);
    }
  }

  // 7. Stream Stats / Big Numbers
  if (finalSlide.stats && finalSlide.stats.length > 0) {
    current = { ...current, stats: [] };
    for (let sIdx = 0; sIdx < finalSlide.stats.length; sIdx++) {
      const stat = finalSlide.stats[sIdx];
      const nextStats = [...(current.stats || []), stat];
      current = { ...current, stats: nextStats };
      onUpdate(current, `📈 Menghitung metrik ${sIdx + 1}/${finalSlide.stats.length}: ${stat.value}...`);
      await delay(120);
    }
  }

  // 8. Stream Charts Data Points
  if (finalSlide.chartData && finalSlide.chartData.length > 0) {
    current = { ...current, chartData: [] };
    for (let cIdx = 0; cIdx < finalSlide.chartData.length; cIdx++) {
      const pt = finalSlide.chartData[cIdx];
      const nextData = [...(current.chartData || []), pt];
      current = { ...current, chartData: nextData };
      onUpdate(current, `📊 Memvisualisasikan data grafik: ${pt.name}...`);
      await delay(110);
    }
  }

  // 9. Stream Diagram Nodes (Flow, Timeline, Funnel, Quadrant, Cycle, Trajectory, Gauge, Vertical)
  if (finalSlide.flowNodes && finalSlide.flowNodes.length > 0) {
    current = { ...current, flowNodes: [] };
    for (let nIdx = 0; nIdx < finalSlide.flowNodes.length; nIdx++) {
      const node = finalSlide.flowNodes[nIdx];
      const nextNodes = [...(current.flowNodes || []), node];
      current = { ...current, flowNodes: nextNodes };
      onUpdate(current, `🔗 Menggambar node diagram alur ${nIdx + 1}/${finalSlide.flowNodes.length}...`);
      await delay(120);
    }
  } else if (finalSlide.timelineMilestones && finalSlide.timelineMilestones.length > 0) {
    current = { ...current, timelineMilestones: [] };
    for (let mIdx = 0; mIdx < finalSlide.timelineMilestones.length; mIdx++) {
      const ms = finalSlide.timelineMilestones[mIdx];
      const nextMs = [...(current.timelineMilestones || []), ms];
      current = { ...current, timelineMilestones: nextMs };
      onUpdate(current, `📅 Menyusun milestone ${ms.quarter}...`);
      await delay(120);
    }
  } else if (finalSlide.quadrantData) {
    current = { ...current, quadrantData: finalSlide.quadrantData };
    onUpdate(current, `📐 Menyusun matrix kuadran 2x2...`);
    await delay(150);
  } else if (finalSlide.funnelStages) {
    current = { ...current, funnelStages: finalSlide.funnelStages };
    onUpdate(current, `🔻 Membangun funnel konversi...`);
    await delay(150);
  } else if (finalSlide.cycleNodes) {
    current = { ...current, cycleNodes: finalSlide.cycleNodes };
    onUpdate(current, `🔄 Membentuk siklus interaktif...`);
    await delay(150);
  } else if (finalSlide.gaugeItems) {
    current = { ...current, gaugeItems: finalSlide.gaugeItems };
    onUpdate(current, `🎯 Mengkalibrasi indikator radial...`);
    await delay(150);
  } else if (finalSlide.trajectoryNodes) {
    current = { ...current, trajectoryNodes: finalSlide.trajectoryNodes };
    onUpdate(current, `📈 Menggambar kurva trajektori...`);
    await delay(150);
  } else if (finalSlide.verticalProgressItems) {
    current = { ...current, verticalProgressItems: finalSlide.verticalProgressItems };
    onUpdate(current, `🧱 Menyusun stack progres vertikal...`);
    await delay(150);
  }

  // 10. Stream Description if present
  if (finalSlide.description && !finalSlide.bullets && !finalSlide.processSteps) {
    const fullDesc = finalSlide.description;
    for (let i = 1; i <= fullDesc.length; i += 4) {
      if (isCancelled()) return;
      current = { ...current, description: fullDesc.slice(0, i) };
      onUpdate(current, `✍️ Menulis narasi materi...`);
      await delay(14);
    }
    current = { ...current, description: fullDesc };
  }

  // Final exact sync to ensure 100% fidelity
  onUpdate(finalSlide, `✅ Slide selesai`);
  await delay(70);
}

  /* Start Generation via DeepSeek Launcher Backend with Real-Time Progressive Canvas Streamer */
  const handleGenerate = useCallback(async () => {
    if (!content.trim()) return;

    // 1. Auto-collapse main application sidebar for immersive presentation workspace
    setCollapsed(true);

    setIsGenerating(true);
    setStep("slides");
    setSlides([]);
    setActiveSlideIndex(0);
    setGeneratingProgress(10);
    setGeneratingStage("🧠 Menganalisis konteks materi & struktur slide...");

    try {
      const activeProvider = typeof window !== "undefined" ? (localStorage.getItem("ai_provider") || "deepseek") : "deepseek";
      const storedApiKey = typeof window !== "undefined" ? (localStorage.getItem(`ai_key_${activeProvider}`) || localStorage.getItem("deepseek_api_key") || "") : "";
      const storedModel = typeof window !== "undefined" ? (localStorage.getItem(`ai_model_${activeProvider}`) || localStorage.getItem("deepseek_selected_model") || "deepseek-chat") : "deepseek-chat";
      const storedCustomBrain = typeof window !== "undefined" ? (localStorage.getItem("deck_custom_brain") || "") : "";
      
      setGeneratingProgress(20);
      setGeneratingStage("📐 Merancang layout Launcher OS 16:9, sistem warna & token visual...");

      const markdownPayload =
        editableBreakdown.length > 0
          ? formatBreakdownToMarkdown(editableBreakdown)
          : content;

      const effectiveSlideCount =
        editableBreakdown.length > 0
          ? `${editableBreakdown.length} Slides`
          : slideCountPreference === "Auto"
          ? detectedSlideCount.count
            ? `${detectedSlideCount.count} Slides`
            : "Auto"
          : slideCountPreference;

      const skillDirectives = attachedSkill
        ? `=== INSTITUTIONAL SKILL ATTACHMENT (${attachedSkill.name}) ===\n${attachedSkill.content}\n`
        : "";
      const effectiveDirectives = [skillDirectives, clonedStyle?.visualDirectives || ""].filter(Boolean).join("\n\n");

      // ──── HIGH-CAPACITY CHUNKED PIPELINE FOR 10 TO 100+ SLIDES ────
      if (editableBreakdown.length > 8) {
        const total = editableBreakdown.length;
        const CHUNK_SIZE = 5;
        const totalChunks = Math.ceil(total / CHUNK_SIZE);
        const builtSlides: SlideData[] = [];

        // Put initial placeholders in slides so user can see full slide count
        setSlides(
          editableBreakdown.map((b, idx) => ({
            id: `placeholder-${idx}`,
            layout: (mapVisualLayoutToLayout(b.visualLayout) as SlideLayout) || "bullets",
            title: b.headline,
            subtitle: b.subheadline,
            description: b.description,
            slideNumber: String(idx + 1).padStart(2, "0"),
          }))
        );

        for (let c = 0; c < totalChunks; c++) {
          const startIdx = c * CHUNK_SIZE;
          const endIdx = Math.min((c + 1) * CHUNK_SIZE, total);
          const chunkBreakdown = editableBreakdown.slice(startIdx, endIdx);

          const progressPct = Math.round(15 + (c / totalChunks) * 80);
          setGeneratingProgress(progressPct);
          setGeneratingStage(`⚡ Men-generate Batch ${c + 1}/${totalChunks}: Slide ${startIdx + 1} s/d ${endIdx} dari ${total}...`);
          setActiveSlideIndex(startIdx);

          const chunkRes = await fetch("/api/decks/generate-chunk", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chunkIndex: c,
              totalChunks,
              slidesToGenerate: chunkBreakdown,
              deckContext: {
                audience,
                purpose,
                density,
                bgStylePreference: bgStyle,
                customBgColors: isCustomBgColors ? bgColors : undefined,
                clonedStyleDirectives: effectiveDirectives,
                clonedReferenceSummary: clonedStyle?.designDNASummary || "",
              },
              apiKey: storedApiKey,
              model: storedModel,
              provider: activeProvider,
            }),
          });

          const chunkData = await chunkRes.json();
          const chunkSlides: SlideData[] =
            chunkData.success && Array.isArray(chunkData.slides)
              ? chunkData.slides.map((s: any, idx: number) => normalizeSlide(s, startIdx + idx))
              : chunkBreakdown.map((b, idx) =>
                  normalizeSlide(
                    {
                      id: `slide-${startIdx + idx}`,
                      layout: mapVisualLayoutToLayout(b.visualLayout),
                      title: b.headline,
                      subtitle: b.subheadline,
                      description: b.description,
                    },
                    startIdx + idx
                  )
                );

          for (let i = 0; i < chunkSlides.length; i++) {
            const absoluteIdx = startIdx + i;
            builtSlides[absoluteIdx] = chunkSlides[i];
          }

          setSlides([...builtSlides]);
          await new Promise((r) => setTimeout(r, 60));
        }

        setSlides(builtSlides);
        setGeneratingProgress(100);
        setGeneratingStage(`✅ Selesai! Seluruh ${total} slide berhasil digenerate dengan rapi.`);
        await new Promise((r) => setTimeout(r, 400));
        return;
      }

      const response = await fetch("/api/decks/generate-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: markdownPayload,
          density,
          bgStylePreference: bgStyle,
          customBgColors: isCustomBgColors ? bgColors : undefined,
          titleFont,
          bodyFont,
          slideCountPreference: effectiveSlideCount,
          audience,
          purpose,
          layoutMood,
          paletteId: selectedPalette.id,
          specialNotes,
          customBrainInstruction: storedCustomBrain,
          clonedStyleDirectives: effectiveDirectives,
          clonedReferenceSummary: clonedStyle?.designDNASummary || "",
          apiKey: storedApiKey,
          model: storedModel,
          provider: activeProvider,
        }),
      });

      const data = await response.json();
      const rawList: any[] = data.success && Array.isArray(data.slides) && data.slides.length > 0
        ? data.slides
        : DEMO_SLIDES;

      const targetSlidesList: SlideData[] = rawList.map((s: any, idx: number) => normalizeSlide(s, idx));

      const total = targetSlidesList.length;

      // Real-time canvas authoring: Build each slide live character-by-character & element-by-element!
      const builtSlides: SlideData[] = [];

      for (let i = 0; i < total; i++) {
        const targetSlide = targetSlidesList[i];
        setCurrentGenIndex(i);
        setActiveSlideIndex(i);

        // Put a draft placeholder in slides array so the user sees it in the left thumbnail strip
        setSlides([...builtSlides, { id: targetSlide.id, layout: targetSlide.layout, title: "" }]);

        // Stream build the slide on canvas live!
        await streamBuildSlide(
          targetSlide,
          (partial, stageText) => {
            setSlides((prev) => {
              const copy = [...prev];
              copy[i] = partial;
              return copy;
            });
            const slidePct = Math.round(20 + ((i + ((partial.title?.length || 0) / (targetSlide.title?.length || 1)) * 0.9) / total) * 78);
            setGeneratingProgress(slidePct);
            setGeneratingStage(`[Slide ${i + 1}/${total}] ${stageText}`);
          },
          () => false
        );

        builtSlides.push(targetSlide);
        setSlides([...builtSlides]);
        await new Promise((r) => setTimeout(r, 120));
      }

      setSlides(targetSlidesList);
      setGeneratingProgress(100);
      setGeneratingStage("✅ Complete! All slides generated in real-time.");
      await new Promise((r) => setTimeout(r, 400));

      // Return to Slide 1 (title slide) smoothly for ready presentation
      setActiveSlideIndex(0);
    } catch (err) {
      console.error("Deck generation error:", err);
      setSlides(DEMO_SLIDES);
      setActiveSlideIndex(0);
    } finally {
      setIsGenerating(false);
    }
  }, [
    content,
    density,
    bgStyle,
    isCustomBgColors,
    bgColors,
    titleFont,
    bodyFont,
    slideCountPreference,
    audience,
    purpose,
    layoutMood,
    selectedPalette.id,
    specialNotes,
    setCollapsed,
  ]);

  /* Export to Native PowerPoint .pptx */
  const handleExportPptx = async () => {
    if (slides.length === 0 || isExporting) return;
    setIsExporting(true);
    try {
      const title = content.split("\n")[0]?.replace(/^[#\s*•-]+/, "") || "Presentation Deck";
      await exportDeckToPptx(slides, {
        palette: selectedPalette,
        bgStyle,
        fontPairing,
        titleFont,
        bodyFont,
        deckTitle: title,
      });
    } catch (err) {
      console.error("Export PPTX failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  /* Apply AI Prompt Edit to Single Slide or Global Deck */
  const handleApplyPromptEdit = async (customInstruction?: string) => {
    const instruction = customInstruction || editPrompt;
    if (!instruction.trim() || isEditingSlide || slides.length === 0) return;

    setIsEditingSlide(true);
    setEditStatusMessage(null);

    // Push current slides into history for Undo capability
    setSlidesHistory((prev) => [...prev.slice(-4), JSON.parse(JSON.stringify(slides))]);

    try {
      const activeProvider = typeof window !== "undefined" ? (localStorage.getItem("ai_provider") || "deepseek") : "deepseek";
      const storedApiKey = typeof window !== "undefined" ? (localStorage.getItem(`ai_key_${activeProvider}`) || localStorage.getItem("deepseek_api_key") || "") : "";
      const storedModel = typeof window !== "undefined" ? (localStorage.getItem(`ai_model_${activeProvider}`) || localStorage.getItem("deepseek_selected_model") || "deepseek-chat") : "deepseek-chat";

      const response = await fetch("/api/decks/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scope: editScope,
          activeSlideIndex,
          slides,
          prompt: instruction,
          titleFont,
          bodyFont,
          apiKey: storedApiKey,
          model: storedModel,
          provider: activeProvider,
        }),
      });

      const data = await response.json();
      if (data.success) {
        if (data.scope === "single" && data.updatedSlide) {
          const newSlide = normalizeSlide(data.updatedSlide, activeSlideIndex);
          setSlides((prev) => {
            const copy = [...prev];
            copy[activeSlideIndex] = newSlide;
            return copy;
          });
          setEditStatusMessage(`✅ Slide ${activeSlideIndex + 1} updated successfully!`);
        } else if (data.scope === "all" && Array.isArray(data.updatedSlides)) {
          const newSlides = data.updatedSlides.map((s: any, idx: number) => normalizeSlide(s, idx));
          setSlides(newSlides);
          setEditStatusMessage(`✅ All ${newSlides.length} slides updated successfully!`);
        }
        setEditPrompt("");
      } else {
        setEditStatusMessage(`⚠️ ${data.error || "Failed to update slide"}`);
      }
    } catch (err) {
      console.error("Apply prompt edit failed:", err);
      setEditStatusMessage("⚠️ An error occurred while processing the edit.");
    } finally {
      setIsEditingSlide(false);
      setTimeout(() => {
        setEditStatusMessage(null);
      }, 5000);
    }
  };

  const handleUndoEdit = () => {
    if (slidesHistory.length === 0) return;
    const previous = slidesHistory[slidesHistory.length - 1];
    setSlides(previous);
    setSlidesHistory((prev) => prev.slice(0, -1));
    setEditStatusMessage("↺ Changes reverted successfully.");
    setTimeout(() => {
      setEditStatusMessage(null);
    }, 4000);
  };

  const handleNewDeck = () => {
    setSlides([]);
    setActiveSlideIndex(0);
    setContent("");
    setStep("input");
    setIsGenerating(false);
  };

  /* ──── Presentation Mode (Fullscreen) ──── */
  if (isPresentation && activeSlide) {
    return (
      <div
        ref={presentationRef}
        className="fixed inset-0 z-[200] bg-black flex items-center justify-center font-sans"
        onClick={(e) => {
          const rect = (e.target as HTMLElement).getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          if (clickX > rect.width / 2) {
            setActiveSlideIndex((prev) => Math.min(prev + 1, slides.length - 1));
          } else {
            setActiveSlideIndex((prev) => Math.max(prev - 1, 0));
          }
        }}
      >
        <div className="w-full h-full max-w-[100vw] max-h-[100vh] aspect-[16/9] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide.id || `pres-slide-${activeSlideIndex}`}
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-full h-full"
            >
              <SlideRenderer
                slide={activeSlide}
                isPresentation
                palette={selectedPalette}
                bgStyle={bgStyle}
                fontPairing={fontPairing}
                titleFont={titleFont}
                bodyFont={bodyFont}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/70 backdrop-blur-md px-4 py-2 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveSlideIndex((prev) => Math.max(prev - 1, 0));
            }}
            className="text-white/80 hover:text-white p-1 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-white/80 text-sm font-medium tabular-nums">
            {activeSlideIndex + 1} / {slides.length}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveSlideIndex((prev) =>
                Math.min(prev + 1, slides.length - 1)
              );
            }}
            className="text-white/80 hover:text-white p-1 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="w-px h-4 bg-white/20 mx-1" />
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsPresentation(false);
            }}
            className="text-white/80 hover:text-white p-1 cursor-pointer"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <AppShell
      headerActions={
        step === "slides" && slides.length > 0 ? (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleNewDeck}
              className="h-8.5 bg-[#FFDE3C] hover:bg-[#ffe55c] text-neutral-950 font-bold text-xs px-3.5 shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New Deck</span>
            </Button>
          </div>
        ) : undefined
      }
    >
      {/* ══════════════════════════════════════════════════════════
       * STEP 1: CONTENT INPUT
       * ══════════════════════════════════════════════════════════ */}
      {step === "input" && (
        <div className="w-full max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8 font-sans">
          
          {/* Header Section */}
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h1 className="font-sf text-3xl sm:text-[40px] font-normal sm:font-medium tracking-tight text-neutral-900 dark:text-white leading-[1.2]">
              Transform your ideas into stunning decks
            </h1>
            <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 font-normal">
              Paste in the notes, outline or text content you&apos;d like to use
            </p>
          </div>

          {/* Main Clean Textarea Input Area */}
          <div className="max-w-2xl mx-auto bg-white dark:bg-[#121212] rounded-xl border border-neutral-200/90 dark:border-neutral-800 shadow-sm p-4 sm:p-5 relative transition-all focus-within:ring-2 focus-within:ring-[#FFE54C]/50 focus-within:border-[#E5BC10]">
            {/* Attached Skill File Card (Claude-style Clean Minimalist Card) */}
            {attachedSkill && (
              <div className="mb-3.5">
                <div
                  onClick={() => setShowSkillModal(true)}
                  className="group relative w-32 h-26 p-2.5 rounded-lg border border-neutral-200/90 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/50 flex flex-col justify-between select-none transition-all hover:border-neutral-400 dark:hover:border-neutral-600 hover:bg-neutral-100/60 dark:hover:bg-neutral-900 cursor-pointer"
                  title="Klik untuk membaca instruksi skill"
                >
                  <div>
                    <p className="text-xs font-medium text-neutral-800 dark:text-neutral-200 leading-snug line-clamp-2 break-all group-hover:text-neutral-950 dark:group-hover:text-white transition-colors">
                      {attachedSkill.name}
                    </p>
                    <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1 font-normal">
                      {attachedSkill.content.split("\n").length} lines
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium text-neutral-500 dark:text-neutral-400 bg-neutral-200/60 dark:bg-neutral-800 tracking-wider">
                      MD
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAttachedSkill(null);
                      }}
                      className="p-1 -mr-1 -mb-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 rounded-md transition-all cursor-pointer"
                      title="Remove file"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write a message or notes (optional)..."
              rows={attachedSkill ? 7 : 10}
              className="w-full bg-transparent border-none text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:ring-0 text-sm sm:text-base outline-none resize-none min-h-[180px] font-sans leading-relaxed"
            />

            {/* Bottom Bar: Download Template & Clone Style on Left + Generate Button on Right */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800/80">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCloneStyleModal(true)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer border ${
                    clonedStyle
                      ? "bg-[#FFDE3C]/20 border-[#FFDE3C] text-neutral-900 dark:text-amber-300 shadow-2xs"
                      : "bg-amber-500/10 hover:bg-amber-500/20 text-neutral-800 dark:text-neutral-200 border-amber-500/30"
                  }`}
                  title="Analisis dan tiru gaya visual dari slide contoh (gambar / PDF)"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>{clonedStyle ? "Style Terkloning Aktif" : "Clone Style dari Slide"}</span>
                  {clonedStyle && (
                    <span className="flex items-center gap-1 ml-0.5">
                      <span className="w-2.5 h-2.5 rounded-full border border-black/20" style={{ backgroundColor: clonedStyle.palette.primary }} />
                      <span className="w-2.5 h-2.5 rounded-full border border-black/20" style={{ backgroundColor: clonedStyle.palette.secondary }} />
                      <span className="w-2.5 h-2.5 rounded-full border border-black/20" style={{ backgroundColor: clonedStyle.palette.accent }} />
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadTemplateMd}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer border border-neutral-200/80 dark:border-neutral-700"
                  title="Download File Template .md"
                >
                  <Download className="w-3.5 h-3.5 text-amber-500" />
                  <span>Download Template .md</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowTemplateModal(true)}
                  className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 underline cursor-pointer hidden sm:inline-flex"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>View Format</span>
                </button>
                {customBrainActive && (
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20"
                    title="Custom AI Brain active from Settings (Deck Defaults)"
                  >
                    <span>Custom AI Brain Active</span>
                  </span>
                )}
              </div>

              <button
                type="button"
                disabled={!content.trim() && !attachedSkill}
                onClick={() => setStep("styler")}
                className={`h-8.5 px-4 rounded-md font-semibold text-xs flex items-center justify-center transition-all ${
                  content.trim() || attachedSkill
                    ? "bg-[#FFDE3C] hover:bg-[#ffe55c] text-neutral-950 cursor-pointer active:scale-95 shadow-xs"
                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600 cursor-not-allowed opacity-50"
                }`}
              >
                <span>Generate</span>
              </button>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════
           * 16:9 PLAIN GRAY SHOWCASE GRID (6 ITEMS)
           * ══════════════════════════════════════════════════════════ */}
          <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800/60">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {SHOWCASE_DECKS.map((deck) => (
                <ShowcaseDeckCard
                  key={deck.id}
                  deck={deck}
                  onSelect={(selected) => {
                    if (selected.id === "sc-itb") {
                      // Kosongkan chatbox content agar tetap bersih
                      setContent("");
                      // Pasang file skill attachment template-ITB.md di atas chatbox
                      setAttachedSkill({
                        id: "itb",
                        name: "ITB_Gamma_Deck_Rules.md",
                        title: "ITB × RevoU Deck Design Rules",
                        content: ITB_SKILL_MD,
                      });
                      const itbPal = COLOR_PALETTES.find((p) => p.id === "itb");
                      if (itbPal) setSelectedPalette(itbPal);
                      applyFontPreset("red-hat", "red-hat");
                    } else {
                      setContent(selected.sampleContent);
                    }
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
       * STEP 2: QUESTIONNAIRE & STYLE CUSTOMIZER
       * ══════════════════════════════════════════════════════════ */}
      {step === "styler" && (
        <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 pt-0 pb-8 space-y-6 font-sans">
          
          {/* Header Title, Subtitle & Right-Aligned Back Button */}
          <div className="flex items-start justify-between gap-4 pt-1">
            <div className="space-y-1">
              <h1 className="font-sf text-3xl sm:text-[34px] font-normal sm:font-medium tracking-tight text-neutral-900 dark:text-white leading-tight">
                A few quick questions
              </h1>
              <p className="text-sm sm:text-[14.5px] text-neutral-500 dark:text-neutral-400 font-normal">
                To ensure your generated presentation is accurate, aesthetic, and aligned with your goals.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setStep("input")}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all cursor-pointer shrink-0 border border-neutral-200/80 dark:border-neutral-800"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          </div>

          {/* Reference Slide Style Banner */}
          {clonedStyle ? (
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-neutral-900 dark:to-[#1a1708] border border-amber-300/80 dark:border-amber-800/60 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#FFDE3C]/30 text-amber-900 dark:text-amber-200 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-extrabold uppercase px-2 py-0.5 rounded bg-[#FFDE3C] text-neutral-950">
                      Gaya Referensi Aktif
                    </span>
                    <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                      Warna, Font & Pola Ditiru Otomatis
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-1 max-w-xl">
                    {clonedStyle.designDNASummary}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                  <span className="text-[11px] text-neutral-500 font-medium mr-1">Palette:</span>
                  <span className="w-3.5 h-3.5 rounded-full border border-black/20" style={{ backgroundColor: clonedStyle.palette.primary }} title={`Primary: ${clonedStyle.palette.primary}`} />
                  <span className="w-3.5 h-3.5 rounded-full border border-black/20" style={{ backgroundColor: clonedStyle.palette.secondary }} title={`Secondary: ${clonedStyle.palette.secondary}`} />
                  <span className="w-3.5 h-3.5 rounded-full border border-black/20" style={{ backgroundColor: clonedStyle.palette.accent }} title={`Accent: ${clonedStyle.palette.accent}`} />
                </div>

                <button
                  type="button"
                  onClick={() => setShowCloneStyleModal(true)}
                  className="px-3 py-1.5 rounded-md text-xs font-semibold bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                >
                  Ubah
                </button>
                <button
                  type="button"
                  onClick={handleClearClonedStyle}
                  className="p-1.5 rounded-md text-neutral-400 hover:text-red-500 transition-colors"
                  title="Hapus gaya referensi"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-lg bg-neutral-50 dark:bg-neutral-900/40 border border-dashed border-neutral-300 dark:border-neutral-800 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 text-neutral-600 dark:text-neutral-400">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Punya screenshot atau contoh slide yang ingin ditiru gayanya?</span>
              </div>
              <button
                type="button"
                onClick={() => setShowCloneStyleModal(true)}
                className="px-3 py-1.5 rounded-md text-xs font-bold bg-[#FFDE3C] hover:bg-[#ffe55c] text-neutral-950 transition-all cursor-pointer shadow-2xs shrink-0"
              >
                + Clone Style dari Slide
              </button>
            </div>
          )}

          {/* Form Questions List */}
          <div className="space-y-6 pt-1">
            
            {/* 1. Amount of Text per Card (Content Density Rule) */}
            <div className="space-y-3.5">
              <h3 className="text-[15.5px] sm:text-[17px] font-normal text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <span>1.</span>
                <span>Amount of Text per Card (Content Density):</span>
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {[
                  { id: "brief" as const, label: "Brief (Punchy & Minimal)" },
                  { id: "medium" as const, label: "Medium (Balanced Executive)" },
                  { id: "detailed" as const, label: "Detailed (In-depth & Data-heavy)" },
                  { id: "preserve" as const, label: "Preserve Exact Content" },
                ].map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDensity(d.id)}
                    className={`px-4.5 py-2.5 rounded-md text-[14px] sm:text-[15px] transition-all cursor-pointer border ${
                      density === d.id
                        ? "bg-[#FFDE3C] text-neutral-950 border-[#FFDE3C] font-medium shadow-xs"
                        : "bg-white dark:bg-[#141414] text-neutral-700 dark:text-neutral-300 border-neutral-200/90 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 font-normal"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Slide Background Style */}
            <div className="space-y-3.5">
              <h3 className="text-[15.5px] sm:text-[17px] font-normal text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <span>2.</span>
                <span>Select Slide Background Style:</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                {[
                  { id: "mixed" as BgStyle, label: "Smart Dynamic Mix" },
                  { id: "solid" as BgStyle, label: "Clean Solid Canvas" },
                  { id: "dualtone" as BgStyle, label: "Dual-Tone Blocking" },
                  { id: "gradient" as BgStyle, label: "Ambient Gradient" },
                ].map((bg) => (
                  <button
                    key={bg.id}
                    type="button"
                    onClick={() => setBgStyle(bg.id)}
                    className={`px-3 py-2.5 rounded-md text-[13.5px] sm:text-[14px] text-center transition-colors cursor-pointer border truncate select-none ${
                      bgStyle === bg.id
                        ? "bg-[#FFDE3C] text-neutral-950 border-[#FFDE3C] font-semibold shadow-xs"
                        : "bg-white dark:bg-[#141414] text-neutral-700 dark:text-neutral-300 border-neutral-200/90 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 font-medium"
                    }`}
                  >
                    {bg.label}
                  </button>
                ))}
              </div>

              {/* 3 Dropdown/Inline Inputs for Custom HEX Background & Palette Colors */}
              <div className="mt-3 p-4 bg-neutral-50/90 dark:bg-[#121212] border border-neutral-200/80 dark:border-neutral-800 rounded-md space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-1.5 border-b border-neutral-200/60 dark:border-neutral-800/60">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] sm:text-[13.5px] font-semibold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider font-sf">
                      Custom Background & Theme HEX Channels (3 Warna)
                    </span>
                    {isCustomBgColors && (
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#FFDE3C] text-neutral-950 font-bold">
                        Custom HEX Active
                      </span>
                    )}
                  </div>
                  <span className="text-[12.5px] sm:text-[13px] text-neutral-500 dark:text-neutral-400 font-sf">
                    Klik lingkaran warna untuk picker atau ketik kode HEX
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {/* Color 1 */}
                  <div className="flex flex-col gap-2 p-3 sm:p-3.5 rounded-md bg-white dark:bg-[#181818] border border-neutral-200/80 dark:border-neutral-800 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[14px] sm:text-[14.5px] font-semibold text-neutral-800 dark:text-neutral-200 font-sf">
                        Color 1 (Primary Base)
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <label className="relative flex items-center cursor-pointer" title="Pick Color 1">
                        <input
                          type="color"
                          value={bgColors.color1.startsWith("#") && (bgColors.color1.length === 7 || bgColors.color1.length === 4) ? bgColors.color1 : "#FFDE3C"}
                          onChange={(e) => handleUpdateBgColor("color1", e.target.value)}
                          className="sr-only"
                        />
                        <span
                          className="w-6 h-6 rounded-full border border-black/15 shadow-xs block transition-transform hover:scale-110 shrink-0"
                          style={{ backgroundColor: bgColors.color1 }}
                        />
                      </label>
                      <div className="flex items-center flex-1 bg-neutral-50 dark:bg-neutral-900 px-3 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-700 focus-within:border-neutral-950 dark:focus-within:border-neutral-300 transition-colors">
                        <span className="text-sm font-mono font-normal opacity-50 mr-1 text-neutral-500 dark:text-neutral-400">#</span>
                        <input
                          type="text"
                          value={bgColors.color1.replace(/^#/, "")}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9A-Fa-f]/g, "").slice(0, 6);
                            handleUpdateBgColor("color1", val ? `#${val}` : "#");
                          }}
                          placeholder="FFDE3C"
                          maxLength={6}
                          className="w-full bg-transparent border-none text-[14px] sm:text-[14.5px] font-mono font-normal uppercase outline-none p-0 text-neutral-900 dark:text-neutral-100 tracking-wide"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Color 2 */}
                  <div className="flex flex-col gap-2 p-3 sm:p-3.5 rounded-md bg-white dark:bg-[#181818] border border-neutral-200/80 dark:border-neutral-800 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[14px] sm:text-[14.5px] font-semibold text-neutral-800 dark:text-neutral-200 font-sf">
                        Color 2 (Secondary / Split)
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <label className="relative flex items-center cursor-pointer" title="Pick Color 2">
                        <input
                          type="color"
                          value={bgColors.color2.startsWith("#") && (bgColors.color2.length === 7 || bgColors.color2.length === 4) ? bgColors.color2 : "#FFFFFF"}
                          onChange={(e) => handleUpdateBgColor("color2", e.target.value)}
                          className="sr-only"
                        />
                        <span
                          className="w-6 h-6 rounded-full border border-black/15 shadow-xs block transition-transform hover:scale-110 shrink-0"
                          style={{ backgroundColor: bgColors.color2 }}
                        />
                      </label>
                      <div className="flex items-center flex-1 bg-neutral-50 dark:bg-neutral-900 px-3 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-700 focus-within:border-neutral-950 dark:focus-within:border-neutral-300 transition-colors">
                        <span className="text-sm font-mono font-normal opacity-50 mr-1 text-neutral-500 dark:text-neutral-400">#</span>
                        <input
                          type="text"
                          value={bgColors.color2.replace(/^#/, "")}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9A-Fa-f]/g, "").slice(0, 6);
                            handleUpdateBgColor("color2", val ? `#${val}` : "#");
                          }}
                          placeholder="FFFFFF"
                          maxLength={6}
                          className="w-full bg-transparent border-none text-[14px] sm:text-[14.5px] font-mono font-normal uppercase outline-none p-0 text-neutral-900 dark:text-neutral-100 tracking-wide"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Color 3 */}
                  <div className="flex flex-col gap-2 p-3 sm:p-3.5 rounded-md bg-white dark:bg-[#181818] border border-neutral-200/80 dark:border-neutral-800 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[14px] sm:text-[14.5px] font-semibold text-neutral-800 dark:text-neutral-200 font-sf">
                        Color 3 (Accent / Contrast)
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <label className="relative flex items-center cursor-pointer" title="Pick Color 3">
                        <input
                          type="color"
                          value={bgColors.color3.startsWith("#") && (bgColors.color3.length === 7 || bgColors.color3.length === 4) ? bgColors.color3 : "#111111"}
                          onChange={(e) => handleUpdateBgColor("color3", e.target.value)}
                          className="sr-only"
                        />
                        <span
                          className="w-6 h-6 rounded-full border border-black/15 shadow-xs block transition-transform hover:scale-110 shrink-0"
                          style={{ backgroundColor: bgColors.color3 }}
                        />
                      </label>
                      <div className="flex items-center flex-1 bg-neutral-50 dark:bg-neutral-900 px-3 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-700 focus-within:border-neutral-950 dark:focus-within:border-neutral-300 transition-colors">
                        <span className="text-sm font-mono font-normal opacity-50 mr-1 text-neutral-500 dark:text-neutral-400">#</span>
                        <input
                          type="text"
                          value={bgColors.color3.replace(/^#/, "")}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9A-Fa-f]/g, "").slice(0, 6);
                            handleUpdateBgColor("color3", val ? `#${val}` : "#");
                          }}
                          placeholder="111111"
                          maxLength={6}
                          className="w-full bg-transparent border-none text-[14px] sm:text-[14.5px] font-mono font-normal uppercase outline-none p-0 text-neutral-900 dark:text-neutral-100 tracking-wide"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Typography Pairing (Independent Title & Body Dropdowns) */}
            <div className="space-y-3.5">
              <h3 className="text-[15.5px] sm:text-[17px] font-normal text-neutral-900 dark:text-neutral-100 flex items-center gap-2 font-sf">
                <span>3.</span>
                <span>Select Font Pairing (Typography):</span>
              </h3>

              {/* 2 Independent Professional Launcher Dropdowns for Title & Body Fonts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 bg-neutral-50/90 dark:bg-[#121212] border border-neutral-200/80 dark:border-neutral-800 rounded-md">
                {/* Title Font Dropdown */}
                <div className="flex flex-col gap-2">
                  <label className="text-[14px] sm:text-[14.5px] font-semibold text-neutral-800 dark:text-neutral-200 flex items-center justify-between font-sf">
                    <span>Title / Headline Font (Judul)</span>
                    <span className="text-[12.5px] font-normal text-neutral-500 dark:text-neutral-400">Bold & Punchy</span>
                  </label>
                  <LauncherDropdown
                    value={titleFont}
                    options={TITLE_FONTS}
                    onChange={(val) => setTitleFont(val)}
                    getFontClass={(val) => getTitleFontClass(val)}
                  />
                </div>

                {/* Body Font Dropdown */}
                <div className="flex flex-col gap-2">
                  <label className="text-[14px] sm:text-[14.5px] font-semibold text-neutral-800 dark:text-neutral-200 flex items-center justify-between font-sf">
                    <span>Description & Card Font (Isi / Teks)</span>
                    <span className="text-[12.5px] font-normal text-neutral-500 dark:text-neutral-400">Optimal Legibility</span>
                  </label>
                  <LauncherDropdown
                    value={bodyFont}
                    options={BODY_FONTS}
                    onChange={(val) => setBodyFont(val)}
                    getFontClass={(val) => getBodyFontClass(val)}
                  />
                </div>
              </div>
            </div>

            {/* 4. Slide Layout Character */}
            <div className="space-y-3.5">
              <h3 className="text-[15.5px] sm:text-[17px] font-normal text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <span>4.</span>
                <span>Slide Layout Character & Structure:</span>
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {[
                  { id: "framework" as LayoutMood, label: "Visual & Diagram Flow" },
                  { id: "executive" as LayoutMood, label: "Executive Narrative (Headlines & Key Points)" },
                  { id: "data" as LayoutMood, label: "Data & KPI Heavy (Key Metrics & Large Numbers)" },
                ].map((lm) => (
                  <button
                    key={lm.id}
                    type="button"
                    onClick={() => setLayoutMood(lm.id)}
                    className={`px-4.5 py-2.5 rounded-md text-[14px] sm:text-[15px] transition-all cursor-pointer border ${
                      layoutMood === lm.id
                        ? "bg-[#FFDE3C] text-neutral-950 border-[#FFDE3C] font-medium shadow-xs"
                        : "bg-white dark:bg-[#141414] text-neutral-700 dark:text-neutral-300 border-neutral-200/90 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 font-normal"
                    }`}
                  >
                    {lm.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Target Audience */}
            <div className="space-y-3.5">
              <h3 className="text-[15.5px] sm:text-[17px] font-normal text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <span>5.</span>
                <span>Presentation Target Audience:</span>
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {[
                  "Executives & C-Level",
                  "Students & Education / Classroom",
                  "Internal Team & Workshop",
                  "Public Keynote & Pitch",
                  "Investors & Stakeholders",
                ].map((aud) => (
                  <button
                    key={aud}
                    type="button"
                    onClick={() => setAudience(aud)}
                    className={`px-4.5 py-2.5 rounded-md text-[14px] sm:text-[15px] transition-all cursor-pointer border ${
                      audience === aud
                        ? "bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 border-neutral-950 dark:border-white font-medium shadow-xs"
                        : "bg-white dark:bg-[#141414] text-neutral-700 dark:text-neutral-300 border-neutral-200/90 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 font-normal"
                    }`}
                  >
                    {aud}
                  </button>
                ))}
              </div>
            </div>

            {/* 6. Specific Notes or Instructions */}
            <div className="space-y-3.5">
              <h3 className="text-[15.5px] sm:text-[17px] font-normal text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <span>6.</span>
                <span>Any Specific Notes or Instructions?</span>
              </h3>
              <input
                type="text"
                value={specialNotes}
                onChange={(e) => setSpecialNotes(e.target.value)}
                placeholder="e.g., Emphasize Q1 2026 growth metrics, include a strong Call-To-Action on the final slide..."
                className="w-full bg-white dark:bg-[#141414] border border-neutral-200/90 dark:border-neutral-800 rounded-md px-4.5 py-3 text-[14px] sm:text-[15px] text-neutral-900 dark:text-neutral-100 outline-none focus:ring-1 focus:ring-[#FFDE3C] focus:border-[#FFDE3C] transition-all placeholder:text-neutral-400 dark:placeholder:text-neutral-600 font-normal"
              />
            </div>

            {/* 7. Visual Deck Layout Preview */}
            <div className="space-y-3.5">
              <h3 className="text-[15.5px] sm:text-[17px] font-normal text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <span>7.</span>
                <span>Visual Deck Layout Preview:</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                {[
                  {
                    id: 1,
                    renderInner: () => (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="w-12 h-2 rounded bg-neutral-300 dark:bg-neutral-700" />
                          <div className="w-7 h-2 rounded bg-neutral-200 dark:bg-neutral-800" />
                        </div>
                        <div className="my-auto space-y-2">
                          <div className="w-3/4 h-2.5 rounded bg-neutral-300 dark:bg-neutral-700" />
                          <div className="w-1/2 h-2 rounded bg-neutral-200 dark:bg-neutral-800" />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="w-8 h-1.5 rounded bg-neutral-200 dark:bg-neutral-800" />
                          <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                            <div className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                            <div className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                          </div>
                        </div>
                      </>
                    ),
                  },
                  {
                    id: 2,
                    renderInner: () => (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="w-12 h-2 rounded bg-neutral-300 dark:bg-neutral-700" />
                          <div className="w-7 h-2 rounded bg-neutral-200 dark:bg-neutral-800" />
                        </div>
                        <div className="my-auto grid grid-cols-5 gap-2 items-center">
                          <div className="col-span-2 h-7 rounded bg-neutral-300 dark:bg-neutral-700" />
                          <div className="col-span-3 space-y-1.5">
                            <div className="w-full h-1.5 rounded bg-neutral-200 dark:bg-neutral-800" />
                            <div className="w-4/5 h-1.5 rounded bg-neutral-200 dark:bg-neutral-800" />
                            <div className="w-3/5 h-1.5 rounded bg-neutral-200 dark:bg-neutral-800" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="w-8 h-1.5 rounded bg-neutral-200 dark:bg-neutral-800" />
                          <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                            <div className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                            <div className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                          </div>
                        </div>
                      </>
                    ),
                  },
                  {
                    id: 3,
                    renderInner: () => (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="w-12 h-2 rounded bg-neutral-300 dark:bg-neutral-700" />
                          <div className="w-7 h-2 rounded bg-neutral-200 dark:bg-neutral-800" />
                        </div>
                        <div className="my-auto space-y-2">
                          <div className="w-full h-2 rounded bg-neutral-300 dark:bg-neutral-700 flex gap-1 p-0.5">
                            <div className="h-full w-1/4 bg-neutral-400 dark:bg-neutral-600 rounded-xs" />
                            <div className="h-full w-1/4 bg-neutral-400 dark:bg-neutral-600 rounded-xs" />
                            <div className="h-full w-1/4 bg-neutral-400 dark:bg-neutral-600 rounded-xs" />
                            <div className="h-full w-1/4 bg-neutral-400 dark:bg-neutral-600 rounded-xs" />
                          </div>
                          <div className="grid grid-cols-3 gap-1.5">
                            <div className="h-4 rounded bg-neutral-200 dark:bg-neutral-800" />
                            <div className="h-4 rounded bg-neutral-200 dark:bg-neutral-800" />
                            <div className="h-4 rounded bg-neutral-200 dark:bg-neutral-800" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="w-8 h-1.5 rounded bg-neutral-200 dark:bg-neutral-800" />
                          <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                            <div className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                            <div className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                          </div>
                        </div>
                      </>
                    ),
                  },
                  {
                    id: 4,
                    renderInner: () => (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="w-12 h-2 rounded bg-neutral-300 dark:bg-neutral-700" />
                          <div className="w-7 h-2 rounded bg-neutral-200 dark:bg-neutral-800" />
                        </div>
                        <div className="my-auto flex items-center justify-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                          <div className="w-4 h-0.5 bg-neutral-200 dark:bg-neutral-800" />
                          <div className="w-6 h-6 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                          <div className="w-4 h-0.5 bg-neutral-200 dark:bg-neutral-800" />
                          <div className="w-5 h-5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="w-8 h-1.5 rounded bg-neutral-200 dark:bg-neutral-800" />
                          <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                            <div className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                            <div className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                          </div>
                        </div>
                      </>
                    ),
                  },
                ].map((item) => {
                  const isSelected = selectedLayoutPreview === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedLayoutPreview(item.id)}
                      className={`w-full aspect-[16/9] rounded-md border p-3 sm:p-3.5 flex flex-col justify-between overflow-hidden relative select-none cursor-pointer transition-all active:scale-98 ${
                        isSelected
                          ? "border-[#FFDE3C] ring-2 ring-[#FFDE3C]/35 bg-[#FFDE3C]/5 dark:bg-[#FFDE3C]/10 shadow-xs"
                          : "bg-neutral-100 dark:bg-[#181818] border-neutral-200/80 dark:border-neutral-800/80 hover:border-neutral-400 dark:hover:border-neutral-600 hover:bg-neutral-200/40 dark:hover:bg-[#1f1f1f]"
                      }`}
                    >
                      {/* Selected Checkmark Badge */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-4.5 h-4.5 rounded-full bg-[#FFDE3C] text-neutral-950 flex items-center justify-center shadow-xs z-10 animate-in fade-in zoom-in-75 duration-150">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                      {item.renderInner()}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Bottom Action Footer */}
          <div className="pt-8 border-t border-neutral-200/80 dark:border-neutral-800 flex items-center justify-center">
            <Button
              type="button"
              onClick={() => setStep("confirm")}
              className="w-full max-w-md h-12 rounded-md font-semibold bg-[#FFDE3C] hover:bg-[#ffe55c] text-neutral-950 text-[15px] shadow-sm flex items-center justify-center cursor-pointer active:scale-98 transition-all"
            >
              <span>Review & Confirm Breakdown →</span>
            </Button>
          </div>

        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
       * STEP 3: CONFIRMATION & SLIDE BREAKDOWN PREVIEW (MINIMALIST 16:9 CARDS ALA GAMMA)
       * ══════════════════════════════════════════════════════════ */}
      {step === "confirm" && (
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 font-sans animate-in fade-in duration-200">
          
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-neutral-200/80 dark:border-neutral-800">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FFDE3C]/20 text-[#9E7D00] dark:text-[#FFE54C] border border-[#FFDE3C]/40">
                  {editableBreakdown.length} Slide Terdeteksi
                </span>
                <span className="text-xs text-neutral-400">•</span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  Rasio 16:9 Presisi
                </span>
              </div>
              <h1 className="font-sf text-2xl sm:text-3xl font-normal sm:font-medium tracking-tight text-neutral-900 dark:text-white">
                Review Presentation Outline
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                All slides are uniform 16:9 widescreen. Click text to edit directly or customize layout presets before generation.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setStep("styler")}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all cursor-pointer border border-neutral-200/80 dark:border-neutral-800"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Options</span>
              </button>
              <Button
                type="button"
                onClick={handleGenerate}
                className="h-9.5 px-5 rounded-md font-bold text-xs bg-[#FFDE3C] hover:bg-[#ffe55c] text-neutral-950 shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate {editableBreakdown.length} Slides Now</span>
              </Button>
            </div>
          </div>

          {/* Minimalist Horizontal Style Summary Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-50 dark:bg-neutral-900/60 px-4 py-2.5 rounded-lg border border-neutral-200/70 dark:border-neutral-800 text-xs">
            <div className="flex flex-wrap items-center gap-4 text-neutral-600 dark:text-neutral-400">
              <div>
                <span className="text-neutral-400">Density:</span>{" "}
                <strong className="text-neutral-800 dark:text-neutral-200 capitalize">{density}</strong>
              </div>
              <div>
                <span className="text-neutral-400">Style:</span>{" "}
                <strong className="text-neutral-800 dark:text-neutral-200 capitalize">{bgStyle}</strong>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-neutral-400">Palette:</span>
                <span className="w-3 h-3 rounded-full border border-black/20" style={{ backgroundColor: bgColors.color1 }} />
                <span className="w-3 h-3 rounded-full border border-black/20" style={{ backgroundColor: bgColors.color2 }} />
                <span className="w-3 h-3 rounded-full border border-black/20" style={{ backgroundColor: bgColors.color3 }} />
              </div>
              <div>
                <span className="text-neutral-400">Font:</span>{" "}
                <strong className="text-neutral-800 dark:text-neutral-200">
                  {TITLE_FONTS.find((f) => f.id === titleFont)?.name || titleFont}
                </strong>
              </div>
              <div>
                <span className="text-neutral-400">Audience:</span>{" "}
                <strong className="text-neutral-800 dark:text-neutral-200">{audience}</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddSlideCard}
              className="inline-flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer ml-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Slide</span>
            </button>
          </div>

          {/* AI Blueprint Architect & Slide Target Selector Bar */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Rencanakan Target Slide AI:</span>
              </span>
              {[5, 10, 20, 35, 50, 75, 100].map((num) => (
                <button
                  key={num}
                  type="button"
                  disabled={isPlanningOutline}
                  onClick={() => handlePlanOutline(num)}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer border ${
                    editableBreakdown.length === num
                      ? "bg-[#FFDE3C] text-neutral-950 border-[#FFDE3C] shadow-2xs"
                      : "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-neutral-400"
                  }`}
                >
                  {num} Slide
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {isPlanningOutline ? (
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>AI sedang menyusun blueprint alur cerita...</span>
                </span>
              ) : (
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  {editableBreakdown.length >= 10 ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                      ⚡ Pipeline Batching Aktif ({Math.ceil(editableBreakdown.length / 5)} Batch)
                    </span>
                  ) : (
                    <span>Siap digenerate ({editableBreakdown.length} slide)</span>
                  )}
                </span>
              )}
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════
           * UNIFORM 16:9 PRESENTATION CARDS GRID (ALL IDENTICAL DIMENSIONS)
           * ══════════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {editableBreakdown.map((s, idx) => (
              <div
                key={idx}
                className="w-full aspect-[16/9] bg-white dark:bg-[#151515] border border-neutral-200/90 dark:border-neutral-800 hover:border-amber-400 dark:hover:border-amber-400/80 rounded-xl p-3.5 sm:p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden select-none"
              >
                {/* Card Top Control Bar */}
                <div className="flex items-center justify-between gap-2 border-b border-neutral-100 dark:border-neutral-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 text-[11px] font-bold flex items-center justify-center shrink-0">
                      {s.slideNumber}
                    </span>
                    <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
                      Slide {s.slideNumber}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Visual Layout Picker */}
                    <select
                      value={
                        VISUAL_LAYOUT_OPTIONS.find((v) =>
                          s.visualLayout?.toLowerCase().includes(v.id.toLowerCase())
                        )?.id || s.visualLayout || "Title / Executive Hero"
                      }
                      onChange={(e) =>
                        handleUpdateCardField(idx, "visualLayout", e.target.value)
                      }
                      className="text-[10.5px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200/80 dark:border-neutral-700/80 rounded px-1.5 py-0.5 outline-none cursor-pointer max-w-[130px] truncate"
                    >
                      {VISUAL_LAYOUT_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.id} className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">
                          {opt.label}
                        </option>
                      ))}
                    </select>

                    {/* Move Up */}
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveSlideCard(idx, "up")}
                      className="p-1 rounded text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-20 cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>

                    {/* Move Down */}
                    <button
                      type="button"
                      disabled={idx === editableBreakdown.length - 1}
                      onClick={() => handleMoveSlideCard(idx, "down")}
                      className="p-1 rounded text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-20 cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>

                    {/* Delete Slide */}
                    <button
                      type="button"
                      disabled={editableBreakdown.length <= 1}
                      onClick={() => handleDeleteSlideCard(idx)}
                      className="p-1 rounded text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-20 cursor-pointer"
                      title="Delete Slide"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Middle Slide Content (Clean 16:9 Presentation Canvas Look) */}
                <div className="flex-1 flex flex-col justify-center py-1 space-y-1.5 overflow-hidden">
                  <input
                    type="text"
                    value={s.headline}
                    onChange={(e) => handleUpdateCardField(idx, "headline", e.target.value)}
                    placeholder="Slide Headline..."
                    className="w-full bg-transparent border-b border-transparent hover:border-neutral-200 dark:hover:border-neutral-700 focus:border-amber-400 font-bold text-xs sm:text-[13.5px] text-neutral-900 dark:text-white outline-none transition-colors truncate"
                  />
                  <input
                    type="text"
                    value={s.subheadline || ""}
                    onChange={(e) => handleUpdateCardField(idx, "subheadline", e.target.value)}
                    placeholder="Slide subheadline..."
                    className="w-full bg-transparent border-b border-transparent hover:border-neutral-200 dark:hover:border-neutral-700 focus:border-amber-400 text-[11px] text-neutral-500 dark:text-neutral-400 outline-none transition-colors truncate"
                  />

                  {/* Visual Layout Minimalist Snippet */}
                  <div className="pt-0.5">
                    {s.visualLayout?.toLowerCase().includes("bar") ? (
                      <div className="flex items-end gap-1.5 h-6 pt-1 px-1">
                        <div className="w-2 h-2.5 bg-amber-400/60 rounded-t" />
                        <div className="w-2 h-4.5 bg-amber-400/80 rounded-t" />
                        <div className="w-2 h-6 bg-amber-500 rounded-t" />
                        <div className="w-2 h-5 bg-neutral-300 dark:bg-neutral-700 rounded-t" />
                        <span className="text-[10px] text-neutral-400 font-mono ml-1.5 truncate">
                          {s.stats ? s.stats[0] : "Quarterly Revenue & EBITDA"}
                        </span>
                      </div>
                    ) : s.visualLayout?.toLowerCase().includes("pie") || s.visualLayout?.toLowerCase().includes("donut") ? (
                      <div className="flex items-center gap-2 h-6 px-1">
                        <div className="w-4.5 h-4.5 rounded-full border-[2.5px] border-amber-400 border-t-neutral-800 shrink-0" />
                        <span className="text-[10px] text-neutral-400 font-mono truncate">
                          {s.stats ? s.stats.slice(0, 2).join(" • ") : "Segment Revenue Mix"}
                        </span>
                      </div>
                    ) : s.visualLayout?.toLowerCase().includes("metric") || s.visualLayout?.toLowerCase().includes("kpi") ? (
                      <div className="flex items-center gap-1.5 flex-wrap h-6 overflow-hidden">
                        {(s.stats || ["Gross Margin: 62%", "EBITDA: 18%"]).slice(0, 2).map((st, i) => (
                          <span key={i} className="text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60 truncate">
                            {st}
                          </span>
                        ))}
                      </div>
                    ) : s.visualLayout?.toLowerCase().includes("roadmap") || s.visualLayout?.toLowerCase().includes("timeline") ? (
                      <div className="flex items-center gap-1 h-6 px-1">
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                        <div className="flex-1 h-0.5 bg-neutral-200 dark:bg-neutral-700" />
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                        <div className="flex-1 h-0.5 bg-neutral-200 dark:bg-neutral-700" />
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                        <span className="text-[10px] text-neutral-400 font-mono ml-1 truncate">Roadmap Q4</span>
                      </div>
                    ) : s.visualLayout?.toLowerCase().includes("process") || s.visualLayout?.toLowerCase().includes("flow") ? (
                      <div className="flex items-center gap-1 h-6 px-1">
                        <span className="text-[9px] px-1 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-mono">1. Input</span>
                        <span className="text-neutral-300 text-[10px]">→</span>
                        <span className="text-[9px] px-1 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-mono">2. Flow</span>
                        <span className="text-neutral-300 text-[10px]">→</span>
                        <span className="text-[9px] px-1 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-mono">3. Output</span>
                      </div>
                    ) : (
                      <p className="text-[10.5px] text-neutral-500 dark:text-neutral-400 line-clamp-1 leading-tight">
                        {s.description || (s.bullets && s.bullets[0]) || "Executive narrative & layout structure."}
                      </p>
                    )}
                  </div>
                </div>

                {/* Bottom Footer Info */}
                <div className="flex items-center justify-between pt-1.5 border-t border-neutral-100/80 dark:border-neutral-800/60 text-[10px] text-neutral-400">
                  <span className="capitalize truncate max-w-[140px]">{s.visualLayout || "Executive Layout"}</span>
                  <span className="font-mono">16:9 Slide</span>
                </div>
              </div>
            ))}

            {/* Matching 16:9 Dotted Add Slide Card */}
            <div
              onClick={handleAddSlideCard}
              className="w-full aspect-[16/9] border-2 border-dashed border-neutral-200 dark:border-neutral-800 hover:border-amber-400 dark:hover:border-amber-400/80 rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-amber-50/20 dark:hover:bg-amber-950/10 transition-all cursor-pointer select-none group"
            >
              <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 group-hover:bg-[#FFDE3C] group-hover:text-neutral-950 flex items-center justify-center transition-colors">
                <Plus className="w-4 h-4" />
              </div>
              <div className="text-center">
                <span className="text-xs font-semibold block">+ Add New Slide</span>
                <span className="text-[10px] text-neutral-400 font-mono">16:9 Widescreen (&apos;-----&apos;)</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
       * STEP 3: SLIDE EDITOR / REAL-TIME STUDIO VIEWER (LAUNCHER OS STUDIO STYLE)
       * ══════════════════════════════════════════════════════════ */}
      {step === "slides" && (
        <div className="flex flex-col gap-3 font-sans -mt-2">
          
          {/* Real-time AI Generation Status Ribbon (Executive HUD) */}
          {isGenerating && (
            <div className="w-full bg-white/95 dark:bg-[#141416]/95 backdrop-blur-md border border-neutral-200/90 dark:border-neutral-800/90 shadow-sm rounded-md p-3 sm:px-4.5 sm:py-3 space-y-2.5 transition-all animate-in fade-in duration-200">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full overflow-hidden shrink-0 animate-spin [animation-duration:3.5s]">
                    <Image
                      src="/logo/Logo_revou.png"
                      alt="RevoU Logo"
                      fill
                      sizes="36px"
                      className="object-contain"
                      priority
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="font-semibold text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 truncate block">
                      {generatingStage}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-700/80 font-mono text-xs font-bold text-neutral-800 dark:text-neutral-200 tabular-nums">
                    {generatingProgress}%
                  </div>
                </div>
              </div>

              {/* High-precision Smooth Progress Line */}
              <div className="w-full h-1 bg-neutral-100 dark:bg-neutral-800/80 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#FFDE3C] via-[#F59E0B] to-[#D97706] transition-all duration-300 rounded-full"
                  style={{ width: `${generatingProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Top Control Bar (When Completed or Idle) */}
          {!isGenerating && (
            <div className="flex items-center justify-between gap-3 px-1 py-1 border-b border-neutral-200/80 dark:border-neutral-800 pb-3 font-sf">
              <div className="flex items-center gap-3 min-w-0">
                <h2 className="text-sm sm:text-base font-bold text-neutral-950 dark:text-white truncate max-w-[200px] sm:max-w-md font-sf">
                  {content.split("\n")[0]?.substring(0, 45) || "Presentation Deck"}
                </h2>
                <span className="text-xs text-neutral-600 dark:text-neutral-400 font-sf font-semibold tabular-nums bg-neutral-100 dark:bg-neutral-800 px-2.5 py-0.5 rounded-full border border-neutral-200/60 dark:border-neutral-700/60">
                  {slides.length} slide{slides.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPresentation(true)}
                  className="h-8.5 text-xs font-semibold border-neutral-200 dark:border-neutral-800 rounded-md gap-1.5 cursor-pointer shadow-2xs hover:border-neutral-300"
                >
                  <Play className="w-3.5 h-3.5 text-[#D4A800] fill-[#D4A800]" />
                  <span className="hidden sm:inline">Present</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isExporting}
                  onClick={handleExportPptx}
                  className="h-8.5 text-xs font-semibold border-neutral-200 dark:border-neutral-800 rounded-md gap-1.5 cursor-pointer shadow-2xs hover:border-neutral-300"
                >
                  {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{isExporting ? "Exporting PPTX..." : "Export PPTX"}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8.5 text-xs font-semibold border-neutral-200 dark:border-neutral-800 rounded-md gap-1.5 cursor-pointer shadow-2xs hover:border-neutral-300"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Share</span>
                </Button>
              </div>
            </div>
          )}

          {/* Main Studio Workspace Layout */}
          <div className="flex gap-3 sm:gap-4 min-h-[calc(100vh-210px)] relative">
            
            {/* ──── LEFT COLUMN: VERTICAL NUMBERED SLIDE THUMBNAILS ──── */}
            {!isThumbnailCollapsed && (
              <div className="hidden md:flex flex-col w-[175px] lg:w-[210px] shrink-0 border-r border-neutral-200/80 dark:border-neutral-800/80 pr-3 select-none justify-between">
                {/* Thumbnails Scroll List: perfectly fits 5 slides in viewport, slide 6 requires scroll */}
                <div className="flex-1 min-h-0 space-y-3.5 overflow-y-auto pr-1 scrollbar-hide pb-2">
                  {slides.map((slide, i) => (
                    <SlideThumbnail
                      key={`slide-thumb-${slide.id || 'item'}-${i}`}
                      slide={slide}
                      index={i}
                      isActive={i === activeSlideIndex}
                      palette={selectedPalette}
                      bgStyle={bgStyle}
                      fontPairing={fontPairing}
                      titleFont={titleFont}
                      bodyFont={bodyFont}
                      onClick={() => setActiveSlideIndex(i)}
                    />
                  ))}

                  {/* Incoming Slide Skeletons while generating */}
                  {isGenerating && slides.length < 8 && (
                    <div className="flex items-center gap-2 group w-full opacity-60">
                      <span className="w-3.5 text-[11px] font-bold text-right tabular-nums text-neutral-400 shrink-0">
                        {slides.length + 1}
                      </span>
                      <div className="flex-1 aspect-[16/9] rounded-md border-2 border-dashed border-[#FFDE3C]/80 bg-[#FFDE3C]/5 flex items-center justify-center animate-pulse">
                        <Loader2 className="w-4 h-4 text-[#9E7D00] dark:text-[#FFE54C] animate-spin" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Left Toolbar Controls */}
                <div className="pt-3 border-t border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between text-neutral-400 text-xs shrink-0">
                  <button
                    type="button"
                    onClick={() => {}}
                    className="p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                    title="Grid View"
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsThumbnailCollapsed(true)}
                    className="p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                    title="Collapse Thumbnails"
                  >
                    <PanelLeftClose className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Collapsed Left Trigger */}
            {isThumbnailCollapsed && (
              <button
                type="button"
                onClick={() => setIsThumbnailCollapsed(false)}
                className="hidden md:flex p-2 h-10 self-start rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-all cursor-pointer shadow-2xs"
                title="Expand Thumbnails"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            )}

            {/* ──── CENTER WORKSPACE: RULERS + 16:9 CANVAS + SPEAKER NOTES ──── */}
            <div className="flex-1 flex flex-col items-center justify-start min-w-0 px-1 sm:px-2 relative">
              
              {/* Subtle Top Horizontal Ruler Simulation */}
              <div className="w-full max-w-4xl h-4 border-b border-neutral-200/70 dark:border-neutral-800/70 mb-2 hidden lg:flex items-end justify-between px-3 text-[9px] font-mono text-neutral-300 dark:text-neutral-700 select-none">
                <span>|</span>
                <span>•</span>
                <span>•</span>
                <span>•</span>
                <span>| 25</span>
                <span>•</span>
                <span>•</span>
                <span>•</span>
                <span>| 50 (Center)</span>
                <span>•</span>
                <span>•</span>
                <span>•</span>
                <span>| 75</span>
                <span>•</span>
                <span>•</span>
                <span>•</span>
                <span>| 100</span>
              </div>

              {/* Main 16:9 Active Slide Canvas */}
              {activeSlide ? (
                <div className="w-full max-w-4xl aspect-[16/9] rounded-md overflow-hidden shadow-xl border border-neutral-200/90 dark:border-neutral-800 relative group bg-white dark:bg-neutral-950 transition-all">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeSlide.id || `slide-${activeSlideIndex}`}
                      initial={{ opacity: 0, scale: 0.985 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.985 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="w-full h-full"
                    >
                      <SlideRenderer
                        slide={activeSlide}
                        palette={selectedPalette}
                        bgStyle={bgStyle}
                        fontPairing={fontPairing}
                        titleFont={titleFont}
                        bodyFont={bodyFont}
                      />
                    </motion.div>
                  </AnimatePresence>

                  {/* Fullscreen Overlay Button */}
                  <button
                    onClick={() => setIsPresentation(true)}
                    className="absolute top-3 right-3 p-2 bg-black/40 hover:bg-black/70 backdrop-blur-xs rounded-md text-white/90 hover:text-white transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-md z-30"
                    title="Fullscreen Presentation"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="w-full max-w-4xl aspect-[16/9] rounded-md border-2 border-dashed border-neutral-200 dark:border-neutral-800 flex flex-col items-center justify-center gap-3 bg-neutral-50/50 dark:bg-neutral-900/30">
                  <Loader2 className="w-8 h-8 text-[#9E7D00] dark:text-[#FFE54C] animate-spin" />
                  <p className="text-xs text-neutral-500 font-medium">
                    Sedang menyusun canvas presentasi...
                  </p>
                </div>
              )}

              {/* Bottom Navigation Pagination Bar */}
              <div className="flex items-center justify-center gap-3 mt-3.5">
                <button
                  onClick={() =>
                    setActiveSlideIndex((prev) => Math.max(prev - 1, 0))
                  }
                  disabled={activeSlideIndex === 0}
                  className="p-1.5 rounded-md border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:border-neutral-400 dark:hover:border-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
                  title="Previous Slide"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="text-xs text-neutral-600 dark:text-neutral-400 font-medium font-mono tabular-nums min-w-[70px] text-center">
                  {activeSlideIndex + 1} of {slides.length}
                </span>

                <button
                  onClick={() =>
                    setActiveSlideIndex((prev) =>
                      Math.min(prev + 1, slides.length - 1)
                    )
                  }
                  disabled={activeSlideIndex === slides.length - 1}
                  className="p-1.5 rounded-md border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:border-neutral-400 dark:hover:border-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
                  title="Next Slide"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* ──── AI PROMPT ITERATION / CO-PILOT EDIT PANEL ──── */}
              <div className="w-full max-w-4xl mt-3.5 p-3.5 bg-white dark:bg-[#151517] border border-neutral-200/90 dark:border-neutral-800/90 rounded-md shadow-xs space-y-2.5 transition-all">
                {/* Header & Scope Switcher */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-neutral-100 dark:border-neutral-800/80">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-[#FFDE3C] text-neutral-950 flex items-center justify-center font-bold text-xs shadow-2xs">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs sm:text-[13px] font-semibold text-neutral-900 dark:text-white font-sf">
                      AI Slide Editor & Co-Pilot
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setEditScope("single")}
                      className={`px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-semibold transition-all cursor-pointer border ${
                        editScope === "single"
                          ? "bg-[#FFDE3C] text-neutral-950 border-[#FFDE3C] shadow-2xs"
                          : "bg-neutral-50 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200/80 dark:border-neutral-800 hover:text-neutral-950 dark:hover:text-white"
                      }`}
                    >
                      🎯 Current Slide ({activeSlideIndex + 1})
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditScope("all")}
                      className={`px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-semibold transition-all cursor-pointer border ${
                        editScope === "all"
                          ? "bg-[#FFDE3C] text-neutral-950 border-[#FFDE3C] shadow-2xs"
                          : "bg-neutral-50 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200/80 dark:border-neutral-800 hover:text-neutral-950 dark:hover:text-white"
                      }`}
                    >
                      🌐 All Slides ({slides.length})
                    </button>

                    {slidesHistory.length > 0 && (
                      <button
                        type="button"
                        onClick={handleUndoEdit}
                        disabled={isEditingSlide}
                        className="px-2 py-1 rounded-md text-[11px] font-medium text-neutral-500 hover:text-neutral-950 dark:hover:text-white border border-neutral-200/80 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1 cursor-pointer"
                        title="Undo previous edit"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Undo</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Prompt Input Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleApplyPromptEdit();
                  }}
                  className="flex items-center gap-2 bg-neutral-50 dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-700/80 rounded-md p-1.5 focus-within:border-neutral-900 dark:focus-within:border-neutral-400 transition-all shadow-2xs"
                >
                  <Wand2 className="w-4 h-4 text-[#D4A800] ml-2 shrink-0" />
                  <input
                    type="text"
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    placeholder={
                      editScope === "single"
                        ? `Edit instructions for Slide ${activeSlideIndex + 1} (e.g., "Change to comparison table", "Make text more punchy & enlarge numbers", etc.)...`
                        : `Edit instructions for ALL ${slides.length} slides (e.g., "Use executive C-level tone", "Translate to English", etc.)...`
                    }
                    disabled={isEditingSlide}
                    className="flex-1 bg-transparent border-none text-xs sm:text-[13px] text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none px-1"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isEditingSlide || !editPrompt.trim()}
                    className="bg-[#FFDE3C] hover:bg-[#FACC15] text-neutral-950 font-bold text-xs h-7.5 px-3 rounded-md shadow-xs cursor-pointer shrink-0 disabled:opacity-40"
                  >
                    {isEditingSlide ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <span className="flex items-center gap-1">
                        <span>Apply</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    )}
                  </Button>
                </form>

                {/* Status or Success Notification */}
                {editStatusMessage && (
                  <div className="text-[11.5px] font-medium text-neutral-700 dark:text-neutral-300 px-1 py-0.5 animate-in fade-in duration-150">
                    {editStatusMessage}
                  </div>
                )}

                {/* Quick Presets / Shortcut Chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="text-[11px] font-medium text-neutral-400 mr-1">Quick:</span>
                  {(editScope === "single"
                    ? [
                        { label: "⚡ Punchy & Minimal", prompt: "Make text concise, punchy, and minimalist with strong key takeaways" },
                        { label: "📊 Convert to Table", prompt: "Change this slide layout to tableComparison with clear feature rows" },
                        { label: "📈 Convert to Split Metric", prompt: "Change this slide layout to splitMetric with large metric numbers on the left and detail on the right" },
                        { label: "🔄 Convert to Milestones", prompt: "Change this slide layout to horizontalMilestones with 4 progressive stages" },
                        { label: "💡 Add Key Metrics", prompt: "Add relevant quantitative stats, numbers, and percentage metrics" },
                      ]
                    : [
                        { label: "🇺🇸 Translate to English", prompt: "Translate all headlines, subtitles, and text across all slides into executive American English" },
                        { label: "💼 Executive C-Level Tone", prompt: "Elevate tone across all slides to be highly structured, strategic, and ROI-focused" },
                        { label: "⚡ Summarize All Slides", prompt: "Shorten and polish text across all slides simultaneously" },
                      ]
                  ).map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={isEditingSlide}
                      onClick={() => {
                        setEditPrompt(preset.prompt);
                        handleApplyPromptEdit(preset.prompt);
                      }}
                      className="px-2 py-0.5 rounded-md text-[11px] bg-neutral-100/90 dark:bg-neutral-800/80 hover:bg-[#FFDE3C]/20 hover:text-neutral-950 dark:hover:text-white border border-neutral-200/60 dark:border-neutral-700/60 text-neutral-600 dark:text-neutral-400 transition-all cursor-pointer font-medium"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ──── BOTTOM SPEAKER NOTES SECTION ──── */}
              <div className="w-full max-w-4xl mt-3">
                {!isSpeakerNotesOpen ? (
                  <button
                    type="button"
                    onClick={() => setIsSpeakerNotesOpen(true)}
                    className="w-full py-2 px-3 rounded-md border border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/70 dark:bg-[#151515] text-left text-xs font-normal text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-3.5 h-3.5 opacity-60" />
                      <span>
                        {activeSlide && speakerNotes[activeSlide.id]
                          ? `Notes: ${speakerNotes[activeSlide.id].substring(0, 60)}...`
                          : "Click to add speaker notes"}
                      </span>
                    </div>
                    <ChevronUp className="w-3.5 h-3.5 opacity-50" />
                  </button>
                ) : (
                  <div className="w-full rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#151515] p-3 shadow-sm space-y-2 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800/80 pb-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                        <PenTool className="w-3.5 h-3.5 text-[#9E7D00] dark:text-[#FFE54C]" />
                        <span>Speaker Notes (Slide {activeSlideIndex + 1})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsSpeakerNotesOpen(false)}
                        className="p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-md transition-colors cursor-pointer"
                        title="Close Notes"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>

                    <textarea
                      value={activeSlide ? speakerNotes[activeSlide.id] || "" : ""}
                      onChange={(e) => {
                        if (activeSlide) {
                          const val = e.target.value;
                          setSpeakerNotes((prev) => ({ ...prev, [activeSlide.id]: val }));
                        }
                      }}
                      placeholder="Type talking points, supporting data, or presentation script for this slide..."
                      rows={3}
                      className="w-full bg-transparent border-none text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-0 resize-none font-sans leading-relaxed"
                    />
                  </div>
                )}
              </div>

              {/* Mobile thumbnail strip */}
              <div className="md:hidden flex gap-2 mt-4 overflow-x-auto pb-2 w-full px-1 scrollbar-hide">
                {slides.map((slide, i) => (
                  <button
                    key={`mobile-thumb-${slide.id || 'item'}-${i}`}
                    onClick={() => setActiveSlideIndex(i)}
                    className={`shrink-0 w-20 aspect-[16/9] rounded-md overflow-hidden border-2 transition-all cursor-pointer relative bg-white dark:bg-[#18181b] ${
                      i === activeSlideIndex
                        ? "border-[#7C3AED] shadow-sm"
                        : "border-neutral-200/90 dark:border-neutral-800 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <div className="absolute inset-0 w-[500%] h-[500%] origin-top-left transform scale-[0.2] pointer-events-none select-none">
                      <SlideRenderer
                        slide={slide}
                        isThumbnail
                        palette={selectedPalette}
                        bgStyle={bgStyle}
                        fontPairing={fontPairing}
                        titleFont={titleFont}
                        bodyFont={bodyFont}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* ──── RIGHT COLUMN: STUDIO ACTION TOOLBAR (MATCHING USER SCREENSHOT) ──── */}
            <div className="hidden xl:flex flex-col items-center gap-4 py-2 px-1 border-l border-neutral-200/80 dark:border-neutral-800/80 pl-3 select-none">
              
              <button
                type="button"
                onClick={() => setActiveToolbarAction(activeToolbarAction === "media" ? null : "media")}
                className="flex flex-col items-center gap-1 text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer group"
                title="Add Media"
              >
                <div className="w-9 h-9 rounded-md border border-neutral-200/90 dark:border-neutral-800 flex items-center justify-center group-hover:border-neutral-400 dark:group-hover:border-neutral-600 bg-white dark:bg-neutral-900 shadow-2xs">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-medium">Media</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveToolbarAction(activeToolbarAction === "upload" ? null : "upload")}
                className="flex flex-col items-center gap-1 text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer group"
                title="Upload Dokumen / Aset"
              >
                <div className="w-9 h-9 rounded-md border border-neutral-200/90 dark:border-neutral-800 flex items-center justify-center group-hover:border-neutral-400 dark:group-hover:border-neutral-600 bg-white dark:bg-neutral-900 shadow-2xs">
                  <Upload className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-medium">Upload</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveToolbarAction(activeToolbarAction === "rekam" ? null : "rekam")}
                className="flex flex-col items-center gap-1 text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer group"
                title="Rekam Sesi Latihan"
              >
                <div className="w-9 h-9 rounded-md border border-neutral-200/90 dark:border-neutral-800 flex items-center justify-center group-hover:border-neutral-400 dark:group-hover:border-neutral-600 bg-white dark:bg-neutral-900 shadow-2xs">
                  <Video className="w-4 h-4 text-rose-500" />
                </div>
                <span className="text-[10px] font-medium">Rekam</span>
              </button>

              <button
                type="button"
                onClick={() => setStep("styler")}
                className="flex flex-col items-center gap-1 text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer group"
                title="Ubah Tema & Transformasi AI"
              >
                <div className="w-9 h-9 rounded-md border border-neutral-200/90 dark:border-neutral-800 flex items-center justify-center group-hover:border-neutral-400 dark:group-hover:border-neutral-600 bg-white dark:bg-neutral-900 shadow-2xs">
                  <Wand2 className="w-4 h-4 text-[#9E7D00] dark:text-[#FFE54C]" />
                </div>
                <span className="text-[10px] font-medium">Transformasi</span>
              </button>

            </div>

          </div>
        </div>
      )}

      {/* ──── STANDARD .MD PROMPT TEMPLATE MODAL ──── */}
      <PromptTemplateModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onUseTemplate={(templateText) => {
          setContent(templateText);
          setSlideCountPreference("5 Slides");
          setShowTemplateModal(false);
        }}
      />

      {/* ──── CLONE STYLE VISION MODAL ──── */}
      <CloneStyleModal
        isOpen={showCloneStyleModal}
        onClose={() => setShowCloneStyleModal(false)}
        onApplyStyle={handleApplyClonedStyle}
        currentClonedStyle={clonedStyle}
        onClearClonedStyle={handleClearClonedStyle}
      />

      {/* ──── ATTACHED SKILL RULES PREVIEW MODAL ──── */}
      <SkillRulesModal
        isOpen={showSkillModal}
        onClose={() => setShowSkillModal(false)}
        skill={attachedSkill}
      />
    </AppShell>
  );
}

const PROMPT_TEMPLATE_PRESETS = [
  {
    id: "itb-leadership",
    title: "ITB × RevoU — Decision Making for Leaders",
    badge: "ITB Academic",
    desc: "Official institutional template: Red Hat Display, Deep Blue & Golden Yellow, Action Titles, Prompt Cards, and Speaker Notes.",
    content: `#Headline: Data-Driven & AI-Enabled Decision Making for Leaders
#Subheadline: Executive Framework for High-Stakes Institutional & Enterprise Governance
#Description: Program Eksekutif ITB × RevoU: Mengembangkan kapabilitas kepemimpinan berbasis data dan adopsi AI strategis tanpa halusinasi.
#Badge: ITB × REVOU
#SpeakerNotes: Sambut para eksekutif dan sampaikan tujuan program dalam 1 menit: menjembatani jurang antara data mentah dengan keputusan strategis tingkat direksi.
#Visual: Title / Hero

-----

#Headline: Framework 3 Pilar Kepemimpinan Berbasis AI & Data
#Subheadline: Fondasi operasional untuk memitigasi risiko halusinasi dan bias analitik
#Description: Setiap keputusan strategis harus melewati validasi arsitektur data berlapis sebelum eksekusi kebijakan organisasi.
#Bullet:
- Fondasi Data: Verifikasi single source of truth dan tata kelola data terstruktur
- Validasi Model: Pembatasan parameter AI dengan ground-truth facts tanpa halusinasi
- Tata Kelola Eksekutif: Accountability matrix dan audit trail kepatuhan regulasi
#SpeakerNotes: Berikan penekanan pada pilar kedua: AI tidak boleh dibiarkan mengambil keputusan tanpa supervisi dan validasi data terverifikasi.
#Visual: Key Insights / Bullets

-----

#Headline: Alur Kerja Validasi Keputusan Multi-Tahap
#Subheadline: Dari identifikasi masalah bisnis hingga pemantauan dampak kebijakan
#Description: Metodologi 4 tahap standar industri untuk mengevaluasi rekomendasi sistem cerdas secara objektif.
#Bullet:
- Tahap 01: Problem Formulation & Hypothesis Framing
- Tahap 02: Deterministic Data Extraction & Verification
- Tahap 03: Multi-Model Adversarial Stress Testing
- Tahap 04: Policy Synthesis & Executive Board Sign-off
#SpeakerNotes: Alokasikan 8 menit untuk bedah kasus di tahap 3. Pastikan peserta memahami teknik adversarial challenge terhadap rekomendasi AI.
#Visual: Process / Workflow

-----

#Headline: [HANDS-ON] Eksekusi Audit Keputusan Menggunakan AI Prompt Card
#Subheadline: Format terstruktur untuk mengevaluasi risiko keputusan strategis divisi
#Description: Gunakan template prompt audit di bawah ini pada AI analitis untuk memetakan skenario terburuk dan asumsi tersembunyi.
#Bullet:
- PROMPT CARD: "Sebagai Chief Risk Officer, lakukan stress-test terhadap proposal [Nama Proposal] dengan asumsi penurunan pasar [X]% dan kenaikan biaya operasional [Y]%."
- Evaluasi Tingkat Risiko: Klasifikasikan temuan ke dalam status OK, Risk, atau Critical Failure
- Action Plan: Rumuskan langkah mitigasi sebelum presentasi di hadapan dewan pengawas
#Badge: HANDS-ON 10 MIN
#SpeakerNotes: Latihan squad 10 menit. Minta peserta mengisi placeholder bracket dengan kasus nyata dari unit kerja masing-masing.
#Visual: Two Column / Comparison

-----

#Headline: Matriks Komparasi Keputusan Konvensional vs AI-Augmented
#Subheadline: Perbandingan dampak operasional, akurasi, dan kecepatan respon organisasi
#Description: Evaluasi komprehensif transisi tata kelola keputusan menuju organisasi adaptif.
#Bullet:
- Kecepatan Analisis: Hari ke jam dengan automatisasi sintesis dokumen
- Cakupan Skenario: Dari analisis linear terbatas ke simulasi probabilistik multi-skenario
- Auditability: Dokumentasi log keputusan otomatis yang siap diaudit kapan saja
#SpeakerNotes: Ringkas slide komparasi ini dan tegaskan bahwa AI bukan pengganti intuisi pemimpin, melainkan pengungkit ketajaman analisis.
#Visual: Table Comparison

-----

#Headline: Rangkuman Eksekutif & Agenda Sesi Mendatang
#Subheadline: Implementasikan framework audit keputusan pada portfolio proyek minggu ini
#Description: Langkah nyata pasca sesi: terapkan audit prompt card pada proposal strategis terdekat sebelum milestone evaluasi dewan.
#Badge: NEXT STEPS
#SpeakerNotes: Berikan penutup inspiratif. Ingatkan peserta tentang deadline submission case study sebelum sesi pendampingan minggu depan.
#Visual: Bold Statement / CTA`,
  },
  {
    id: "strategy",
    title: "Strategy & Business Solutions",
    badge: "Popular",
    desc: "Universal format for corporate strategy, problem solving, and phased implementation roadmaps.",
    content: STANDARD_MD_TEMPLATE,
  },
  {
    id: "training",
    title: "Education & Workshop Modules",
    badge: "Education",
    desc: "Structured format for masterclasses, training SOPs, academic frameworks, and onboarding.",
    content: `#Headline: Masterclass: Principles of Scalable System Design
#Subheadline: Understanding Core Foundations, Architectural Patterns, and Production Standards
#Description: Interactive learning module designed to equip practitioners with end-to-end understanding of resilient system engineering.
#Visual: Title / Hero

-----

#Headline: 3 Core Pillars of System Resilience
#Subheadline: Fundamental architectural benchmarks required before production deployment
#Description: Every robust system must be built on three core foundations to minimize downtime and infrastructure overhead.
#Bullet:
- Reliability: System remains operational during partial node or service failure
- Scalability: Handles peak traffic elastic surges with automated load shedding
- Maintainability: Clear codebase structure, semantic logs, and unified observability
#Visual: Key Insights / Bullets

-----

#Headline: 4-Stage Execution Framework
#Subheadline: Systematic workflow from discovery and prototyping to continuous deployment
#Description: Industry best practices for delivering high-impact technological initiatives reliably.
#Bullet:
- Stage 01: Requirement Discovery & Threat Modeling
- Stage 02: Architectural Blueprint & Rapid Prototyping
- Stage 03: Automated Test Matrix & Performance Benchmarking
- Stage 04: Production Staging & Live Telemetry Monitoring
#Visual: Process / Workflow

-----

#Headline: Executive Summary & Immediate Next Steps
#Subheadline: Apply these foundational principles to your current architecture roadmap
#Description: Begin with a targeted architectural audit and implement standardized modules incrementally for maximum return.
#Visual: Bold Statement / CTA`,
  },
  {
    id: "pitch",
    title: "Product Pitch & Value Proposition",
    badge: "Pitching",
    desc: "High-impact format for investor pitches, product showcases, and side-by-side problem-solution flows.",
    content: `#Headline: Introducing Intelligent Workflow Automation
#Subheadline: Unified Enterprise Platform to Accelerate Team Productivity and Knowledge Synthesis
#Description: Combining generative AI capabilities with deterministic design engines to generate executive business assets in seconds.
#Visual: Title / Hero

-----

#Headline: The Problem: 40% of Weekly Hours Spent on Manual Formatting
#Subheadline: The growing friction between strategic ideation and slow asset preparation
#Description: Enterprise teams spend an average of 6 to 8 hours per week manually restructuring layouts, typography, and slides.
#Bullet:
- Frustration with brittle, inflexible templates that break under variable content
- Inconsistent branding and design standards across cross-functional departments
- Missed opportunities caused by turnaround delays in preparing critical pitch decks
#Visual: Key Insights / Bullets

-----

#Headline: The Solution: Context-Adaptive Design Engine
#Subheadline: Naturally aligns layout geometry with narrative structure and data depth
#Description: Intelligent system architecture that evaluates text density and automatically selects optimal visual components.
#Bullet:
- Executive Aesthetics: SF Pro typography paired with tailored, high-contrast palettes
- Full Structural Flexibility: Supports long-form narrative, case studies, and split metrics
#Visual: Two Column / Comparison

-----

#Headline: Join Hundreds of Forward-Thinking Teams
#Subheadline: Transform your team's workflow productivity today
#Description: Contact our enterprise team for a personalized walkthrough and exclusive access to the platform.
#Visual: Bold Statement / CTA`,
  },
  {
    id: "data",
    title: "Performance & Financial Overview",
    badge: "Data & Charts",
    desc: "Tailored for quarterly executive reviews featuring verifiable figures, metrics, and comparisons.",
    content: `#Headline: Q3 Financial Performance & Growth Report
#Subheadline: Executive Review of Revenue Trajectory, Operating Margins, and Capital Efficiency
#Description: Comprehensive summary of third-quarter fiscal milestones demonstrating accelerated profitability across all business units.
#Visual: Title / Hero

-----

#Headline: Quarterly Revenue Expansion 2026
#Subheadline: Consistent top-line momentum driven by enterprise expansion contracts
#Stat: Q1: $1.20M | Q2: $1.45M | Q3: $1.78M | Q4 Target: $2.10M
#Description: Net revenue increased 22.8% QoQ powered by new multi-year agreements and operational efficiency.
#Visual: Bar Chart Comparison

-----

#Headline: Revenue Distribution by Business Unit
#Subheadline: Enterprise solutions represent the core driver of annual recurring revenue
#Stat: Enterprise Platform: 45% | Consumer Tier: 30% | Advisory Services: 15% | Other: 10%
#Description: Robust product diversification shields cash flow from cyclical market fluctuations.
#Visual: Pie / Donut Breakdown

-----

#Headline: Q4 Strategic Execution & 2027 Outlook
#Subheadline: Primary priorities focused on expanding market leadership and operating leverage
#Bullet:
- Expand strategic ecosystem partnerships across regional target markets
- Boost net revenue retention through proactive post-onboarding optimization
- Maintain disciplined capital allocation to protect expanding EBITDA margins
#Visual: Key Insights / Bullets`,
  },
];

/* ───────────────────────────────────────────────────
 * Prompt Template Reference & Insert Modal
 * ─────────────────────────────────────────────────── */
function PromptTemplateModal({
  isOpen,
  onClose,
  onUseTemplate,
}: {
  isOpen: boolean;
  onClose: () => void;
  onUseTemplate: (templateText: string) => void;
}) {
  const [selectedPresetId, setSelectedPresetId] = useState<string>("strategy");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentPreset = PROMPT_TEMPLATE_PRESETS.find((p) => p.id === selectedPresetId) || PROMPT_TEMPLATE_PRESETS[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentPreset.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FFDE3C]/20 text-[#9E7D00] dark:text-[#FFE54C] flex items-center justify-center">
              <FileCode className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Template Library & Markdown (.md) Format
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Select a structure suited to your topic: Strategy, Education, Pitching, or Data
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm">
          {/* Preset Selector Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PROMPT_TEMPLATE_PRESETS.map((preset) => {
              const active = preset.id === selectedPresetId;
              return (
                <button
                  key={preset.id}
                  onClick={() => setSelectedPresetId(preset.id)}
                  className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    active
                      ? "border-[#FFDE3C] bg-[#FFDE3C]/10 dark:bg-[#FFDE3C]/15 ring-1 ring-[#FFDE3C]"
                      : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    {preset.badge}
                  </span>
                  <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 mt-1 leading-snug">
                    {preset.title}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Description of Selected Preset */}
          <div className="text-xs text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900/60 p-3 rounded-md border border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between">
            <span>{currentPreset.desc}</span>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
              Divider: -----
            </span>
          </div>

          {/* Template Snippet */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">Markdown Code Preview:</span>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied!" : "Copy Code"}</span>
              </button>
            </div>
            <pre className="p-4 rounded-lg bg-neutral-950 text-neutral-200 text-xs font-mono overflow-x-auto max-h-56 leading-relaxed border border-neutral-800 select-all">
              {currentPreset.content}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            Close
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-md text-xs font-semibold border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied!" : "Copy Prompt"}</span>
            </button>
            <button
              onClick={() => {
                onUseTemplate(currentPreset.content);
                onClose();
              }}
              className="px-4 py-2 rounded-md text-xs font-bold bg-[#FFDE3C] hover:bg-[#ffe55c] text-neutral-950 transition-all shadow-xs cursor-pointer active:scale-95 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Use This Template</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────
 * Skill Rules Preview Modal
 * ─────────────────────────────────────────────────── */
function SkillRulesModal({
  isOpen,
  onClose,
  skill,
}: {
  isOpen: boolean;
  onClose: () => void;
  skill: AttachedSkill | null;
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !skill) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(skill.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Frosted Glass Backdrop Overlay - Exactly matching MoodCheck styling */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/15 dark:bg-black/45 backdrop-blur-sm transition-all duration-300 cursor-pointer"
      />

      {/* Modal Container with MoodCheck signature elevation & rounded styling */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#121212] border border-neutral-200/80 dark:border-neutral-800/90 rounded-2xl shadow-[0_15px_40px_-15px_rgba(0,0,0,0.12)] dark:shadow-[0_15px_40px_-15px_rgba(0,0,0,0.5)] z-10 flex flex-col overflow-hidden max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between bg-white dark:bg-[#121212]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-neutral-100 dark:bg-neutral-800/90 border border-neutral-200/60 dark:border-neutral-700/60 flex items-center justify-center text-neutral-700 dark:text-neutral-300 font-bold text-xs">
              <FileCode className="w-4.5 h-4.5 text-neutral-700 dark:text-neutral-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-sf text-[15px] font-semibold text-neutral-900 dark:text-white tracking-tight">
                  {skill.name}
                </h2>
                <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium border border-emerald-500/20">
                  Active Skill
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                {skill.content.split("\n").length} baris aturan • {skill.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100/80 dark:bg-neutral-800/80 hover:bg-neutral-200/80 dark:hover:bg-neutral-700/80 transition-colors cursor-pointer border border-neutral-200/60 dark:border-neutral-700/60"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Tersalin!" : "Copy"}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Content Document Viewer with Clean Launcher OS Typography */}
        <div className="p-6 overflow-y-auto space-y-4 font-sans text-[13px] leading-relaxed text-neutral-800 dark:text-neutral-200 bg-neutral-50/40 dark:bg-[#0e0e0e]/50">
          <div className="p-4 rounded-xl bg-white dark:bg-[#141414] border border-neutral-200/80 dark:border-neutral-800 shadow-2xs font-mono text-[12px] leading-relaxed whitespace-pre-wrap select-text text-neutral-800 dark:text-neutral-300">
            {skill.content}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between bg-white dark:bg-[#121212]">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            Aturan ini secara otomatis diinjeksikan ke AI saat generate deck
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-[#FFDE3C] hover:bg-[#ffe55c] text-neutral-950 transition-all shadow-xs cursor-pointer active:scale-95"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
