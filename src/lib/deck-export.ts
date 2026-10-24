import pptxgen from "pptxgenjs";
import JSZip from "jszip";

export interface SlideData {
  id: string;
  layout:
    | "title"
    | "hero"
    | "stats"
    | "twoColumn"
    | "process"
    | "bullets"
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
    | "keyInsight"
    | "sectionDivider"
    | "pairedRows"
    | "horizontalStack"
    | "connectedRailStepper"
    | "ascendingColumns"
    | "checklist"
    | "closingAction"
    | "formulaHero"
    | "treeComparison"
    | "caseExercise"
    | "pyramidHierarchy"
    | "transformationBridge"
    | "radialHub"
    | "splitComparison"
    | "splitProfile";
  bgStyle?: "white" | "yellowGradient" | "boldYellow";
  title: string;
  subtitle?: string;
  description?: string;
  badge?: string;
  category?: string;
  beforeCard?: { title?: string; bullets?: string[]; description?: string };
  afterCard?: { title?: string; bullets?: string[]; description?: string };
  profileData?: { tag?: string; name?: string; role?: string; bio?: string; photoUrl?: string };
  stats?: Array<{ value: string; label: string }>;
  processSteps?: Array<{ title: string; description: string }>;
  bullets?: string[];
  highlight?: string;
  chartData?: Array<{ name: string; value: number; secondary?: number; label?: string }>;
  flowNodes?: Array<{ title: string; subtitle?: string; tag?: string }>;
  timelineMilestones?: Array<{ quarter: string; title: string; description: string; status?: "done" | "active" | "planned" }>;
  tableHeaders?: string[];
  tableRows?: Array<{ feature?: string; current?: string | boolean; proposed?: string | boolean; cells?: Array<string | boolean>; [key: string]: unknown }>;
  pairedRows?: Array<{ left: string; right: string; leftLead?: string; rightLead?: string }>;
  stackCards?: Array<{ title: string; tag?: string; description: string }>;
  railSteps?: Array<{ stepNumber?: number | string; title: string; description?: string }>;
  ascendingLevels?: Array<{ levelNumber?: string | number; title: string; description?: string; tag?: string }>;
  checklistItems?: string[];
  insightBarText?: string;
  noteBoxText?: string;
  contactFooterText?: string;
  speakerNotes?: string;
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
  layers?: Array<{ name: string; detail?: string; color?: string }>;
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
  backgroundImage?: string;
}

export type TitleFont = "sf-pro" | "bricolage" | "jakarta" | "outfit" | "lora" | "inter" | "red-hat" | "red-hat-display";
export type BodyFont = "sf-pro" | "inter" | "jakarta" | "outfit" | "red-hat" | "red-hat-display";

export interface ExportOptions {
  palette: {
    id?: string;
    name: string;
    primary: string;
    secondary?: string;
    accent?: string;
    dark?: string;
    light?: string;
  };
  bgStyle?: "mixed" | "solid" | "dualtone" | "gradient" | "dark" | "warm";
  fontPairing?: "editorial" | "modern" | "creative";
  titleFont?: TitleFont;
  bodyFont?: BodyFont;
  deckTitle?: string;
}

export function resolveSlideBackground(
  slide: SlideData | any,
  index: number = 0,
  totalSlides: number = 1
): string {
  if (slide?.backgroundImage) return slide.backgroundImage;

  // Rule 1: Cover slide — strictly once at the beginning (slide 1 / index 0)
  if (index === 0) {
    return "/bg-deck/itb-deck/cover-deck.png";
  }

  const isLast = totalSlides > 0 && index === totalSlides - 1;
  const layout = String(slide?.layout || "");
  const titleLower = String(slide?.title || "").toLowerCase();
  const subtitleLower = String(slide?.subtitle || "").toLowerCase();
  const badgeLower = String(slide?.badge || "").toLowerCase();
  const categoryLower = String(slide?.category || "").toLowerCase();
  const combined = `${titleLower} ${subtitleLower} ${badgeLower} ${categoryLower}`;

  // Rule 2: Closing slide — strictly for the final slide of the deck (Rule §5: Last slide only)
  const isClosing =
    isLast &&
    (layout === "closingAction" ||
      layout === "cta" ||
      combined.includes("closing") ||
      combined.includes("penutup") ||
      combined.includes("next step") ||
      combined.includes("langkah berikutnya") ||
      combined.includes("tindakan selanjutnya") ||
      combined.includes("kesimpulan") ||
      combined.includes("wrap up") ||
      combined.includes("terima kasih") ||
      combined.includes("thank you") ||
      index === totalSlides - 1);

  if (isClosing) {
    return "/bg-deck/itb-deck/closing-deck.png";
  }

  // Rule 3: Section Divider / Part header (Rule §5: Section dividers "Part N", break, guest hand-over)
  const isPart =
    layout === "sectionDivider" ||
    layout === "breakSlide" ||
    /^(part|bagian|agenda utama|modul|bab)\s+\d+/i.test(titleLower.trim());

  if (isPart) {
    return "/bg-deck/itb-deck/part-deck.png";
  }

  // Rule 4: Split / Task / Workshop / Exercise / Case Study (Rule §5: 2-4 per deck for split case comparisons & profiles)
  const isTaskSpeaker =
    layout === "splitComparison" ||
    layout === "splitProfile" ||
    layout === "interactiveCase" ||
    layout === "splitPoll" ||
    layout === "caseStudy" ||
    layout === "caseExercise" ||
    (layout === "twoColumn" && (badgeLower.includes("case") || badgeLower.includes("hands-on") || titleLower.includes("studi kasus")));

  if (isTaskSpeaker) {
    return "/bg-deck/itb-deck/task-speaker-deck.png";
  }

  // Rule 5: Default content deck
  return "/bg-deck/itb-deck/content-deck.png";
}

export async function fetchImageAsBase64(url: string): Promise<string | null> {
  try {
    if (typeof window !== "undefined") {
      const res = await fetch(url);
      if (!res.ok) return null;
      const blob = await res.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } else {
      const fs = await import("fs/promises");
      const path = await import("path");
      const cleanPath = url.startsWith("/") ? url.slice(1) : url;
      const fullPath = path.join(process.cwd(), "public", cleanPath);
      const buffer = await fs.readFile(fullPath);
      const ext = path.extname(url).slice(1) || "png";
      return `data:image/${ext};base64,${buffer.toString("base64")}`;
    }
  } catch (e) {
    console.warn("Could not load image as base64:", url, e);
    return null;
  }
}

export async function exportDeckToPptx(slides: SlideData[], options: ExportOptions) {
  const pptx = new pptxgen();

  // Modern 16:9 Widescreen Presentation (13.333" x 7.5" standard in PowerPoint & Google Slides)
  pptx.defineLayout({ name: "CUSTOM_16x9", width: 13.333, height: 7.5 });
  pptx.layout = "CUSTOM_16x9";
  pptx.author = "Launcher OS";
  pptx.company = "Launcher OS AI";
  pptx.title = options.deckTitle || "Presentation Deck";

  // Enforce Red Hat Display as master presentation theme font (used for Speaker Notes & default runs)
  pptx.theme = {
    headFontFace: "Red Hat Display",
    bodyFontFace: "Red Hat Display",
  };

  const isDarkTheme = options.bgStyle === "dark";
  const primaryHex = options.palette.primary.replace("#", "") || "FFDE3C";
  const darkHex = options.palette.dark?.replace("#", "") || "121212";
  const lightHex = options.bgStyle === "warm" ? "FDFBF7" : "FFFFFF";
  const bgHex = isDarkTheme ? darkHex : lightHex;
  const textColor = isDarkTheme ? "FFFFFF" : "171717";
  const textMuted = isDarkTheme ? "999999" : "666666";
  const titleColor = isDarkTheme ? "FFFFFF" : "005AAB";

  const getPptxTitleFont = (tf?: TitleFont | string) => {
    switch (tf) {
      case "red-hat":
      case "red-hat-display": return "Red Hat Display";
      case "bricolage": return "Bricolage Grotesque";
      case "jakarta": return "Plus Jakarta Sans";
      case "outfit": return "Outfit";
      case "lora": return "Lora";
      case "inter": return "Inter";
      default: return "Red Hat Display";
    }
  };

  const getPptxBodyFont = (bf?: BodyFont | string) => {
    switch (bf) {
      case "red-hat":
      case "red-hat-display": return "Red Hat Display";
      case "inter": return "Inter";
      case "jakarta": return "Plus Jakarta Sans";
      case "outfit": return "Outfit";
      default: return "Red Hat Display";
    }
  };

  const fontTitle = getPptxTitleFont(options.titleFont);
  const fontBody = getPptxBodyFont(options.bodyFont);
  const fontFace = fontBody;

  const isDualTone = options.bgStyle === "dualtone";

  const getPptxContrastColor = (hex?: string) => {
    if (!hex) return "111111";
    const cleaned = hex.replace("#", "");
    const r = parseInt(cleaned.substring(0, 2), 16) || 0;
    const g = parseInt(cleaned.substring(2, 4), 16) || 0;
    const b = parseInt(cleaned.substring(4, 6), 16) || 0;
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 145 ? "111111" : "FFFFFF";
  };

  const primaryContrastColor = getPptxContrastColor(primaryHex);

  // ═══════════════════════════════════════════════════════════════
  // STANDARDIZED SPACING SYSTEM — prevents element overlap in PPTX & Google Slides
  // Canvas: 13.333 × 7.5 in (1920 × 1080 px)
  // ═══════════════════════════════════════════════════════════════
  const PAD = {
    // Horizontal safe zone
    LEFT: 1.0,          // left margin
    RIGHT: 12.33,       // right edge (13.333 - 1.0)
    CONTENT_W: 11.33,   // usable width (RIGHT - LEFT)
    INNER: 0.25,        // internal padding inside cards/shapes
    GAP_H: 0.35,        // horizontal gap between adjacent elements

    // Vertical zones — content flows top-to-bottom in these bands
    TITLE_Y: 0.5,       // slide title top
    TITLE_H: 0.82,      // slide title height (supports bold 34pt 2 lines cleanly)
    SUB_Y: 1.35,        // subtitle top
    SUB_H: 0.45,        // subtitle height
    CONTENT_Y: 1.95,    // first content element top
    FOOTER_Y: 6.0,      // bottom bar / insight bar top
    FOOTER_H: 0.7,      // bottom bar height
    CONTENT_BOTTOM: 5.9, // content must not exceed this Y
    GAP_V: 0.2,         // minimum vertical gap between stacked elements
    CARD_PAD: 0.3,      // padding inside card shapes for text
  };

  function getSanitizedSlideBg(s: SlideData, i: number, total: number): string {
    let bg = s.backgroundImage || resolveSlideBackground(s, i, total);
    // ITB Rule §5: closing-deck.png is ONLY for the last slide
    if (bg && bg.includes("closing-deck.png") && i < total - 1) {
      bg = "/bg-deck/itb-deck/content-deck.png";
    }
    // ITB Rule §5: cover-deck.png is ONLY for slide 1
    if (bg && bg.includes("cover-deck.png") && i > 0) {
      bg = "/bg-deck/itb-deck/content-deck.png";
    }
    return bg;
  }

  // Pre-load all slide background images as base64 to ensure 100% rendering in PowerPoint and Google Slides
  const bgCache = new Map<string, string | null>();
  for (let i = 0; i < slides.length; i++) {
    const s = slides[i];
    const bgUrl = getSanitizedSlideBg(s, i, slides.length);
    if (bgUrl && !bgCache.has(bgUrl)) {
      bgCache.set(bgUrl, await fetchImageAsBase64(bgUrl));
    }
  }

  slides.forEach((slide, idx) => {
    const pSlide = pptx.addSlide();

    // Export Speaker Notes into PowerPoint Presenter View
    if (slide.speakerNotes || slide.description) {
      pSlide.addNotes(slide.speakerNotes || slide.description || "");
    }

    // Resolve template background image (Base64 embedded as layer 0 so Google Slides & PPT render flawlessly)
    const bgUrl = getSanitizedSlideBg(slide, idx, slides.length);
    const bgBase64 = bgUrl ? bgCache.get(bgUrl) : null;
    const hasTemplateBg = Boolean(bgBase64);

    const isSectionDivider = slide.layout === "sectionDivider";
    const isClosingAction = slide.layout === "closingAction";
    const isBoldYellow = !isDualTone && (slide.bgStyle === "boldYellow" || slide.layout === "boldStatement" || slide.layout === "boldImpact" || isSectionDivider || isClosingAction);
    const isYellowGrad = !isDualTone && (slide.bgStyle === "yellowGradient" || slide.layout === "imageSplitMetric");
    const secondaryHex = options.palette.secondary?.replace("#", "") || "FFFDF0";

    if (bgBase64) {
      pSlide.addImage({
        data: bgBase64,
        x: 0,
        y: 0,
        w: 13.333,
        h: 7.5,
      });
    } else {
      const slideBg = isBoldYellow ? primaryHex : isYellowGrad ? secondaryHex : bgHex;
      pSlide.background = { color: slideBg };
    }

    const currentTextColor = isDarkTheme ? "FFFFFF" : "171717";
    const currentMutedColor = isDarkTheme ? "CBD5E1" : "272525";
    const footerColor = isDarkTheme ? "999999" : "888888";

    // If Dual-Tone and not template, draw split color block on the left
    if (!hasTemplateBg && isDualTone && slide.layout !== "sectionDivider" && slide.layout !== "closingAction") {
      pSlide.addShape(pptx.ShapeType.rect, {
        x: 0,
        y: 0,
        w: 4.6,
        h: 7.5,
        fill: { color: primaryHex },
        line: { color: primaryHex },
      });
    }

    // Top Brand & Category Tag (skip if using institutional template background to avoid clash)
    if (!hasTemplateBg && slide.layout !== "title" && slide.layout !== "hero" && slide.layout !== "sectionDivider" && slide.layout !== "closingAction" && (slide.badge || slide.category)) {
      const headerText = slide.badge ? `${slide.badge}${slide.category ? `  •  ${slide.category}` : ""}` : (slide.category || "");
      pSlide.addText(headerText, {
        x: isDualTone ? 0.6 : 1.0,
        y: 0.45,
        w: isDualTone ? 3.6 : 9.0,
        h: 0.3,
        fontSize: 9,
        bold: true,
        color: isDualTone ? primaryContrastColor : "888888",
        fontFace: fontBody,
      });
    }

    // Bottom footer branding (if template background is active, the logo & footer are already baked into the background)
    if (slide.layout !== "sectionDivider") {
      if (!hasTemplateBg) {
        pSlide.addText(slide.footer || "company.com", {
          x: isDualTone ? 5.2 : 1.0,
          y: 6.9,
          w: 4.0,
          h: 0.3,
          fontSize: 9,
          color: footerColor,
          fontFace: fontBody,
        });
      }

      // Slide Number badge (clean at bottom right)
      const pageNum = slide.slideNumber || `${idx + 1}/${slides.length}`;
      pSlide.addText(pageNum, {
        x: 11.5,
        y: 6.9,
        w: 1.5,
        h: 0.3,
        fontSize: 9,
        color: footerColor,
        align: "right",
        fontFace: fontBody,
      });
    }

    switch (slide.layout) {
      case "title":
      case "hero": {
        if (hasTemplateBg) {
          // ITB Template Cover (Safe zone: x 125–1360, y 300–1000 per Rule §5)
          // Logos are located at y: 0.6–2.0 in. Title MUST start at y >= 2.35 in to prevent logo overlap.
          pSlide.addText(slide.title, {
            x: 0.9,
            y: 2.35,
            w: 7.8,
            h: 1.85,
            fontSize: 40,
            color: "174A7F", // Navy Deep Blue per ITB rules
            bold: true,
            fontFace: fontTitle,
            margin: 0,
            valign: "top",
          });

          if (slide.subtitle) {
            pSlide.addText(slide.subtitle, {
              x: 0.9,
              y: 4.3,
              w: 7.8,
              h: 0.85,
              fontSize: 19,
              bold: true,
              color: "005AAB", // Deep Blue
              fontFace: fontTitle,
              margin: 0,
              valign: "top",
            });
          }

          // 3 meta lines at bottom-left per ITB rules (week · program · facilitator)
          const metaLine1 = slide.category || "Data-Driven & AI-Enabled Decision Making for Leaders";
          const metaLine2 = slide.highlight || "Executive Education Program";
          const metaLine3 = slide.quote?.author || slide.badge || "Direktorat Pendidikan Non Reguler ITB & RevoU";
          pSlide.addText(`${metaLine1}\n${metaLine2}\n${metaLine3}`, {
            x: 0.9,
            y: 5.35,
            w: 7.8,
            h: 1.25,
            fontSize: 13,
            italic: true,
            color: "595959",
            fontFace: fontBody,
            margin: 0,
            valign: "top",
          });

          // Slide number at bottom-right
          pSlide.addText(slide.slideNumber ? String(slide.slideNumber).padStart(2, "0") : "01", {
            x: 11.8,
            y: 6.8,
            w: 0.8,
            h: 0.35,
            fontSize: 11,
            bold: true,
            color: "FFFFFF",
            align: "right",
            fontFace: fontBody,
          });
        } else {
          if (slide.highlight || slide.badge || slide.category) {
            const badgeText = (slide.highlight || slide.category || slide.badge || "PRESENTATION").toUpperCase();
            const badgeW = Math.min(Math.max(badgeText.length * 0.11 + 0.5, 2.0), 6.5);
            pSlide.addShape(pptx.ShapeType.roundRect, {
              x: 1.0,
              y: 1.4,
              w: badgeW,
              h: 0.38,
              fill: { color: primaryHex },
              rectRadius: 0.05,
            });
            pSlide.addText(badgeText, {
              x: 1.0,
              y: 1.43,
              w: badgeW,
              h: 0.32,
              fontSize: 11,
              bold: true,
              color: primaryContrastColor,
              align: "center",
              fontFace: fontBody,
            });
          }

          pSlide.addText(slide.title, {
            x: 1.0,
            y: 2.0,
            w: 11.2,
            h: 2.0,
            fontSize: 44,
            color: titleColor,
            bold: true,
            fontFace: fontTitle,
          });

          if (slide.subtitle) {
            pSlide.addText(slide.subtitle, {
              x: 1.0,
              y: 4.3,
              w: 10.8,
              h: 0.9,
              fontSize: 20,
              color: "272525",
              fontFace: fontBody,
            });
          }

          if (slide.description) {
            pSlide.addText(slide.description, {
              x: 1.0,
              y: 5.5,
              w: 11.0,
              h: 1.2,
              fontSize: 14,
              color: currentMutedColor,
              fontFace: fontBody,
            });
          }
        }
        break;
      }

      case "stats": {
        // Header
        pSlide.addText(slide.title, {
          x: PAD.LEFT,
          y: PAD.TITLE_Y,
          w: PAD.CONTENT_W,
          h: PAD.TITLE_H,
          fontSize: 34,
          color: titleColor,
          bold: true,
          fontFace: fontTitle,
        });

        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: PAD.LEFT,
            y: PAD.SUB_Y,
            w: PAD.CONTENT_W,
            h: PAD.SUB_H,
            fontSize: 16,
            color: currentMutedColor,
            fontFace: fontBody,
          });
        }

        // Stat Cards - alternating Soft Yellow and Soft Blue (authentic ITB colors)
        const stats = slide.stats || [];
        const sCount = Math.min(stats.length, 4);
        const cols = sCount === 1 ? 1 : 2;
        const rows = Math.ceil(sCount / cols);
        const cardW = (PAD.CONTENT_W - (cols - 1) * PAD.GAP_H) / cols;
        const cardH = rows === 1 ? 3.5 : 1.65;
        const startY = PAD.CONTENT_Y + 0.1;

        stats.slice(0, 4).forEach((st, sIdx) => {
          const col = sIdx % cols;
          const row = Math.floor(sIdx / cols);
          const x = PAD.LEFT + col * (cardW + PAD.GAP_H);
          const y = startY + row * (cardH + PAD.GAP_V);
          const isYellow = sIdx % 2 === 0;

          // Card Box
          pSlide.addShape(pptx.ShapeType.roundRect, {
            x,
            y,
            w: cardW,
            h: cardH,
            fill: { color: isDarkTheme ? "1E293B" : (isYellow ? "FFF9D6" : "EAF2FB") },
            line: { color: isDarkTheme ? "334155" : (isYellow ? "FFDD3C" : "005AAB"), width: 1.5 },
            rectRadius: 0.06,
          });

          // Stat Value
          pSlide.addText(st.value, {
            x: x + PAD.CARD_PAD,
            y: y + (rows === 1 ? 0.55 : 0.18),
            w: cardW - PAD.CARD_PAD * 2,
            h: rows === 1 ? 1.2 : 0.7,
            fontSize: rows === 1 ? 48 : 34,
            color: isDarkTheme ? (isYellow ? "FFDD3C" : "93C5FD") : (isYellow ? "B45309" : "005AAB"),
            bold: true,
            fontFace: fontTitle,
          });

          // Stat Label
          pSlide.addText(st.label, {
            x: x + PAD.CARD_PAD,
            y: y + (rows === 1 ? 1.85 : 0.88),
            w: cardW - PAD.CARD_PAD * 2,
            h: rows === 1 ? 1.2 : 0.65,
            fontSize: rows === 1 ? 18 : 15,
            color: isDarkTheme ? "E2E8F0" : (isYellow ? "272525" : "005AAB"),
            bold: true,
            fontFace: fontBody,
          });
        });
        break;
      }

      case "twoColumn": {
        pSlide.addText(slide.title, {
          x: PAD.LEFT,
          y: PAD.TITLE_Y,
          w: PAD.CONTENT_W,
          h: PAD.TITLE_H,
          fontSize: 34,
          color: titleColor,
          bold: true,
          fontFace: fontTitle,
        });

        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: PAD.LEFT,
            y: PAD.SUB_Y,
            w: PAD.CONTENT_W,
            h: PAD.SUB_H,
            fontSize: 16,
            color: currentMutedColor,
            fontFace: fontBody,
          });
        }

        const rStats = slide.stats || [];
        const bullets = slide.bullets || [];

        if (rStats.length > 0) {
          // Render stats as side-by-side metric cards (matching decks/page.tsx)
          const sCount = Math.min(rStats.length, 4);
          const cols = sCount === 1 ? 1 : 2;
          const rows = Math.ceil(sCount / cols);
          const colW = (PAD.CONTENT_W - (cols - 1) * PAD.GAP_H) / cols;
          const rowH = rows === 1 ? 3.6 : (3.6 - (rows - 1) * PAD.GAP_V) / rows;
          const startY = PAD.CONTENT_Y + 0.1;

          rStats.slice(0, 4).forEach((st, sIdx) => {
            const c = sIdx % cols;
            const r = Math.floor(sIdx / cols);
            const x = PAD.LEFT + c * (colW + PAD.GAP_H);
            const y = startY + r * (rowH + PAD.GAP_V);
            const isYellow = sIdx % 2 === 0;

            pSlide.addShape(pptx.ShapeType.roundRect, {
              x,
              y,
              w: colW,
              h: rowH,
              fill: { color: isDarkTheme ? "1E293B" : (isYellow ? "FFF9D6" : "EAF2FB") },
              line: { color: isDarkTheme ? "334155" : (isYellow ? "FFDD3C" : "005AAB"), width: 1.5 },
              rectRadius: 0.06,
            });

            pSlide.addText(st.value, {
              x: x + PAD.CARD_PAD,
              y: y + (rows === 1 ? 0.55 : 0.2),
              w: colW - PAD.CARD_PAD * 2,
              h: rows === 1 ? 1.1 : 0.65,
              fontSize: rows === 1 ? 46 : 32,
              color: isDarkTheme ? (isYellow ? "FFDD3C" : "93C5FD") : (isYellow ? "B45309" : "005AAB"),
              bold: true,
              fontFace: fontTitle,
            });

            pSlide.addText(st.label, {
              x: x + PAD.CARD_PAD,
              y: y + (rows === 1 ? 1.8 : 0.88),
              w: colW - PAD.CARD_PAD * 2,
              h: rows === 1 ? 1.2 : Math.max(rowH - 1.0, 0.4),
              fontSize: rows === 1 ? 16 : 14,
              color: isDarkTheme ? "E2E8F0" : (isYellow ? "272525" : "005AAB"),
              bold: true,
              fontFace: fontBody,
            });
          });
        } else if (bullets.length > 0) {
          // Render structured bullet cards (1, 2, 3, or 4 items) exactly matching decks/page.tsx
          const items = bullets.slice(0, 4);
          const count = items.length;

          if (count === 3) {
            // 3 Columns side-by-side (Alternating Yellow -> Blue -> Yellow)
            const cWidth = (PAD.CONTENT_W - 2 * PAD.GAP_H) / 3;
            const cardH = 3.6;
            const cardY = PAD.CONTENT_Y + 0.1;

            items.forEach((bullet, i) => {
              const x = PAD.LEFT + i * (cWidth + PAD.GAP_H);
              const parts = bullet.split(/:\s*|\s*-\s*|\s*—\s*/);
              const bTitle = parts.length > 1 ? parts[0]?.trim() : `Pillar 0${i + 1}`;
              const bDesc = parts.length > 1 ? parts.slice(1).join(" — ").trim() : bullet;
              const isYellow = i % 2 === 0;

              const cardBg = isDarkTheme ? "1E293B" : (isYellow ? "FFF9D6" : "EAF2FB");
              const cardBorder = isDarkTheme ? "334155" : (isYellow ? "FFDD3C" : "005AAB");
              const pillBg = isYellow ? "FFDD3C" : "005AAB";
              const pillFg = isYellow ? "272525" : "FFFFFF";
              const cTitleColor = isDarkTheme ? (isYellow ? "FFDD3C" : "93C5FD") : (isYellow ? "272525" : "005AAB");
              const cDescColor = isDarkTheme ? "E2E8F0" : (isYellow ? "4A4545" : "334155");

              pSlide.addShape(pptx.ShapeType.roundRect, {
                x,
                y: cardY,
                w: cWidth,
                h: cardH,
                fill: { color: cardBg },
                line: { color: cardBorder, width: 1.5 },
                rectRadius: 0.06,
              });

              // Pill badge
              pSlide.addShape(pptx.ShapeType.roundRect, {
                x: x + 0.3,
                y: cardY + 0.3,
                w: 0.58,
                h: 0.34,
                fill: { color: pillBg },
                rectRadius: 0.04,
              });

              pSlide.addText(`0${i + 1}`, {
                x: x + 0.3,
                y: cardY + 0.32,
                w: 0.58,
                h: 0.3,
                fontSize: 11.5,
                bold: true,
                color: pillFg,
                align: "center",
                valign: "middle",
                fontFace: fontBody,
              });

              // Title
              pSlide.addText(bTitle, {
                x: x + 1.0,
                y: cardY + 0.24,
                w: cWidth - 1.3,
                h: 0.52,
                fontSize: 18.5,
                bold: true,
                color: cTitleColor,
                fontFace: fontTitle,
                valign: "middle",
              });

              // Description
              pSlide.addText(bDesc, {
                x: x + 0.3,
                y: cardY + 0.85,
                w: cWidth - 0.6,
                h: cardH - 1.05,
                fontSize: 15.5,
                color: cDescColor,
                fontFace: fontBody,
                valign: "top",
                lineSpacingMultiple: 1.25,
              });
            });
          } else if (count === 4) {
            // 2x2 Grid (matching 4 items in decks/page.tsx)
            const cWidth = (PAD.CONTENT_W - PAD.GAP_H) / 2;
            const cHeight = (3.6 - PAD.GAP_V) / 2;
            const startY = PAD.CONTENT_Y + 0.1;

            items.forEach((bullet, i) => {
              const col = i % 2;
              const row = Math.floor(i / 2);
              const x = PAD.LEFT + col * (cWidth + PAD.GAP_H);
              const y = startY + row * (cHeight + PAD.GAP_V);
              const isYellow = i % 2 === 0;

              const parts = bullet.split(/:\s*|\s*-\s*|\s*—\s*/);
              const bTitle = parts.length > 1 ? parts[0]?.trim() : `Pillar 0${i + 1}`;
              const bDesc = parts.length > 1 ? parts.slice(1).join(" — ").trim() : bullet;

              const cardBg = isDarkTheme ? "1E293B" : (isYellow ? "FFF9D6" : "EAF2FB");
              const cardBorder = isDarkTheme ? "334155" : (isYellow ? "FFDD3C" : "005AAB");
              const pillBg = isYellow ? "FFDD3C" : "005AAB";
              const pillFg = isYellow ? "272525" : "FFFFFF";
              const cTitleColor = isDarkTheme ? (isYellow ? "FFDD3C" : "93C5FD") : (isYellow ? "272525" : "005AAB");
              const cDescColor = isDarkTheme ? "E2E8F0" : (isYellow ? "4A4545" : "334155");

              pSlide.addShape(pptx.ShapeType.roundRect, {
                x,
                y,
                w: cWidth,
                h: cHeight,
                fill: { color: cardBg },
                line: { color: cardBorder, width: 1.5 },
                rectRadius: 0.05,
              });

              pSlide.addShape(pptx.ShapeType.roundRect, {
                x: x + 0.3,
                y: y + 0.22,
                w: 0.52,
                h: 0.32,
                fill: { color: pillBg },
                rectRadius: 0.04,
              });

              pSlide.addText(`0${i + 1}`, {
                x: x + 0.3,
                y: y + 0.24,
                w: 0.52,
                h: 0.28,
                fontSize: 12,
                bold: true,
                color: pillFg,
                align: "center",
                valign: "middle",
                fontFace: fontBody,
              });

              pSlide.addText(bTitle, {
                x: x + 0.95,
                y: y + 0.16,
                w: cWidth - 1.25,
                h: 0.44,
                fontSize: 17.5,
                bold: true,
                color: cTitleColor,
                fontFace: fontTitle,
                valign: "middle",
              });

              pSlide.addText(bDesc, {
                x: x + 0.3,
                y: y + 0.65,
                w: cWidth - 0.6,
                h: cHeight - 0.8,
                fontSize: 14.5,
                color: cDescColor,
                fontFace: fontBody,
                valign: "top",
                lineSpacingMultiple: 1.2,
              });
            });
          } else {
            // count === 2 (Standard Two-Column) OR count === 1
            const cWidth = count === 1 ? 8.0 : (PAD.CONTENT_W - PAD.GAP_H) / 2;
            const startX = count === 1 ? PAD.LEFT + (PAD.CONTENT_W - 8.0) / 2 : PAD.LEFT;
            const cardH = 3.6;
            const cardY = PAD.CONTENT_Y + 0.1;

            items.forEach((bullet, i) => {
              const x = startX + i * (cWidth + PAD.GAP_H);
              const parts = bullet.split(/:\s*|\s*-\s*|\s*—\s*/);
              const bTitle = parts.length > 1 ? parts[0]?.trim() : `Pillar 0${i + 1}`;
              const bDesc = parts.length > 1 ? parts.slice(1).join(" — ").trim() : bullet;
              const isYellow = i % 2 === 0;

              const cardBg = isDarkTheme ? "1E293B" : (isYellow ? "FFF9D6" : "EAF2FB");
              const cardBorder = isDarkTheme ? "334155" : (isYellow ? "FFDD3C" : "005AAB");
              const pillBg = isYellow ? "FFDD3C" : "005AAB";
              const pillFg = isYellow ? "272525" : "FFFFFF";
              const cTitleColor = isDarkTheme ? (isYellow ? "FFDD3C" : "93C5FD") : (isYellow ? "272525" : "005AAB");
              const cDescColor = isDarkTheme ? "E2E8F0" : (isYellow ? "4A4545" : "334155");

              pSlide.addShape(pptx.ShapeType.roundRect, {
                x,
                y: cardY,
                w: cWidth,
                h: cardH,
                fill: { color: cardBg },
                line: { color: cardBorder, width: 1.5 },
                rectRadius: 0.06,
              });

              // Pill badge
              pSlide.addShape(pptx.ShapeType.roundRect, {
                x: x + 0.35,
                y: cardY + 0.35,
                w: 0.58,
                h: 0.36,
                fill: { color: pillBg },
                rectRadius: 0.04,
              });

              pSlide.addText(`0${i + 1}`, {
                x: x + 0.35,
                y: cardY + 0.37,
                w: 0.58,
                h: 0.32,
                fontSize: 12,
                bold: true,
                color: pillFg,
                align: "center",
                valign: "middle",
                fontFace: fontBody,
              });

              // Title (bold, prominent)
              pSlide.addText(bTitle, {
                x: x + 1.1,
                y: cardY + 0.26,
                w: cWidth - 1.45,
                h: 0.58,
                fontSize: 20.5,
                bold: true,
                color: cTitleColor,
                fontFace: fontTitle,
                valign: "middle",
              });

              // Description (clearly legible, balanced padding)
              pSlide.addText(bDesc, {
                x: x + 0.35,
                y: cardY + 0.95,
                w: cWidth - 0.7,
                h: cardH - 1.15,
                fontSize: 16.5,
                color: cDescColor,
                fontFace: fontBody,
                valign: "top",
                lineSpacingMultiple: 1.3,
              });
            });
          }
        } else if (slide.description) {
          // Single contextual narrative card (clean, no dummy placeholders)
          pSlide.addShape(pptx.ShapeType.roundRect, {
            x: PAD.LEFT,
            y: PAD.CONTENT_Y + 0.1,
            w: PAD.CONTENT_W,
            h: 3.5,
            fill: { color: isDarkTheme ? "1E293B" : "EAF2FB" },
            line: { color: isDarkTheme ? "334155" : "005AAB", width: 1.5 },
            rectRadius: 0.06,
          });

          pSlide.addText(slide.description, {
            x: PAD.LEFT + 0.5,
            y: PAD.CONTENT_Y + 0.5,
            w: PAD.CONTENT_W - 1.0,
            h: 2.7,
            fontSize: 18,
            color: isDarkTheme ? "FFFFFF" : "272525",
            fontFace: fontBody,
            valign: "top",
            lineSpacingMultiple: 1.3,
          });
        }
        break;
      }

      case "process": {
        pSlide.addText(slide.title, {
          x: PAD.LEFT,
          y: PAD.TITLE_Y,
          w: PAD.CONTENT_W,
          h: PAD.TITLE_H,
          fontSize: 34,
          color: titleColor,
          bold: true,
          fontFace: fontTitle,
        });

        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: PAD.LEFT,
            y: PAD.SUB_Y,
            w: PAD.CONTENT_W,
            h: PAD.SUB_H,
            fontSize: 16,
            color: currentMutedColor,
            fontFace: fontBody,
          });
        }

        const rawSteps = (slide.processSteps && slide.processSteps.length > 0)
          ? slide.processSteps
          : (slide.bullets && slide.bullets.length > 0)
          ? slide.bullets.map((b, idx) => {
              const parts = b.split(/:\s*|\s*-\s*|\s*—\s*/);
              return {
                title: parts.length > 1 ? parts[0]?.trim() : `Pillar 0${idx + 1}`,
                description: parts.length > 1 ? parts.slice(1).join(" — ").trim() : b,
              };
            })
          : [];

        const sCount = Math.max(rawSteps.length, 1);
        const stepH = Math.min((3.7 - (sCount - 1) * 0.16) / sCount, 1.05);
        rawSteps.forEach((step, sIdx) => {
          const y = PAD.CONTENT_Y + 0.1 + sIdx * (stepH + 0.16);
          const isYellow = sIdx % 2 === 0;

          const cardBg = isDarkTheme ? "1E293B" : (isYellow ? "FFF9D6" : "EAF2FB");
          const cardBorder = isDarkTheme ? "334155" : (isYellow ? "FFDD3C" : "005AAB");
          const numBg = isYellow ? "FFDD3C" : "005AAB";
          const numFg = isYellow ? "272525" : "FFFFFF";
          const sTitleColor = isDarkTheme ? (isYellow ? "FFDD3C" : "93C5FD") : (isYellow ? "272525" : "005AAB");

          // Step Container Card
          pSlide.addShape(pptx.ShapeType.roundRect, {
            x: PAD.LEFT,
            y,
            w: PAD.CONTENT_W,
            h: stepH,
            fill: { color: cardBg },
            line: { color: cardBorder, width: 1.5 },
            rectRadius: 0.05,
          });

          // Square Number Badge
          pSlide.addShape(pptx.ShapeType.roundRect, {
            x: PAD.LEFT + 0.25,
            y: y + (stepH - 0.54) / 2,
            w: 0.54,
            h: 0.54,
            fill: { color: numBg },
            rectRadius: 0.04,
          });

          pSlide.addText(String(sIdx + 1).padStart(2, "0"), {
            x: PAD.LEFT + 0.25,
            y: y + (stepH - 0.54) / 2 + 0.02,
            w: 0.54,
            h: 0.5,
            fontSize: 15,
            bold: true,
            color: numFg,
            align: "center",
            valign: "middle",
            fontFace: fontBody,
          });

          // Step Title
          pSlide.addText(step.title, {
            x: PAD.LEFT + 0.98,
            y: y + 0.1,
            w: PAD.CONTENT_W - 1.25,
            h: 0.4,
            fontSize: 18.5,
            bold: true,
            color: sTitleColor,
            fontFace: fontTitle,
            valign: "middle",
          });

          // Step Description
          if (step.description && step.description !== step.title) {
            pSlide.addText(step.description, {
              x: PAD.LEFT + 0.98,
              y: y + 0.48,
              w: PAD.CONTENT_W - 1.25,
              h: Math.max(stepH - 0.54, 0.35),
              fontSize: 15,
              color: isDarkTheme ? "E2E8F0" : "272525",
              fontFace: fontBody,
              valign: "top",
              lineSpacingMultiple: 1.2,
            });
          }
        });
        break;
      }

      case "bullets": {
        pSlide.addText(slide.title, {
          x: PAD.LEFT,
          y: PAD.TITLE_Y,
          w: PAD.CONTENT_W,
          h: PAD.TITLE_H,
          fontSize: 34,
          color: titleColor,
          bold: true,
          fontFace: fontTitle,
        });

        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: PAD.LEFT,
            y: PAD.SUB_Y,
            w: PAD.CONTENT_W,
            h: PAD.SUB_H,
            fontSize: 16,
            color: currentMutedColor,
            fontFace: fontBody,
          });
        }

        const bullets = slide.bullets || (slide.description ? [slide.description] : ["Strategic objective implementation"]);
        const items = bullets.slice(0, 6);
        const count = items.length;
        const hasInsight = Boolean(slide.insightBarText || (slide.description && slide.description !== slide.title && !slide.bullets?.includes(slide.description)));
        const availableH = hasInsight ? 3.0 : 3.6;

        if (count === 3) {
          // 3 Strategic Pillars side-by-side (Alternating Yellow -> Blue -> Yellow)
          const cWidth = (PAD.CONTENT_W - 2 * PAD.GAP_H) / 3;
          items.forEach((b, bIdx) => {
            const x = PAD.LEFT + bIdx * (cWidth + PAD.GAP_H);
            const parts = b.split(/:\s*|\s*-\s*|\s*—\s*/);
            const bTitle = parts.length > 1 ? parts[0]?.trim() : `Pillar 0${bIdx + 1}`;
            const bDesc = parts.length > 1 ? parts.slice(1).join(" — ").trim() : b;
            const isYellow = bIdx % 2 === 0;

            const cardBg = isDarkTheme ? "1E293B" : (isYellow ? "FFF9D6" : "EAF2FB");
            const cardBorder = isDarkTheme ? "334155" : (isYellow ? "FFDD3C" : "005AAB");
            const pillBg = isYellow ? "FFDD3C" : "005AAB";
            const pillFg = isYellow ? "272525" : "FFFFFF";
            const cTitleColor = isDarkTheme ? (isYellow ? "FFDD3C" : "93C5FD") : (isYellow ? "272525" : "005AAB");
            const cDescColor = isDarkTheme ? "E2E8F0" : (isYellow ? "4A4545" : "334155");

            pSlide.addShape(pptx.ShapeType.roundRect, {
              x,
              y: PAD.CONTENT_Y + 0.1,
              w: cWidth,
              h: availableH,
              fill: { color: cardBg },
              line: { color: cardBorder, width: 1.5 },
              rectRadius: 0.06,
            });

            // Accent pill
            pSlide.addShape(pptx.ShapeType.roundRect, {
              x: x + 0.3,
              y: PAD.CONTENT_Y + 0.3,
              w: 0.58,
              h: 0.34,
              fill: { color: pillBg },
              rectRadius: 0.04,
            });

            pSlide.addText(`0${bIdx + 1}`, {
              x: x + 0.3,
              y: PAD.CONTENT_Y + 0.32,
              w: 0.58,
              h: 0.3,
              fontSize: 12,
              bold: true,
              color: pillFg,
              align: "center",
              valign: "middle",
              fontFace: fontBody,
            });

            // Title
            pSlide.addText(bTitle, {
              x: x + 1.0,
              y: PAD.CONTENT_Y + 0.24,
              w: cWidth - 1.3,
              h: 0.52,
              fontSize: 18.5,
              bold: true,
              color: cTitleColor,
              fontFace: fontTitle,
              valign: "middle",
            });

            // Description
            pSlide.addText(bDesc, {
              x: x + 0.3,
              y: PAD.CONTENT_Y + 0.85,
              w: cWidth - 0.6,
              h: availableH - 1.05,
              fontSize: 15.5,
              color: cDescColor,
              fontFace: fontBody,
              valign: "top",
              lineSpacingMultiple: 1.25,
            });
          });
        } else if (count === 4) {
          // 2x2 Grid (matching 4 items in decks/page.tsx)
          const cWidth = (PAD.CONTENT_W - PAD.GAP_H) / 2;
          const cHeight = (availableH - PAD.GAP_V) / 2;
          const startY = PAD.CONTENT_Y + 0.1;

          items.forEach((b, bIdx) => {
            const col = bIdx % 2;
            const row = Math.floor(bIdx / 2);
            const x = PAD.LEFT + col * (cWidth + PAD.GAP_H);
            const y = startY + row * (cHeight + PAD.GAP_V);
            const isYellow = bIdx % 2 === 0;

            const parts = b.split(/:\s*|\s*-\s*|\s*—\s*/);
            const bTitle = parts.length > 1 ? parts[0]?.trim() : `Pillar 0${bIdx + 1}`;
            const bDesc = parts.length > 1 ? parts.slice(1).join(" — ").trim() : b;

            const cardBg = isDarkTheme ? "1E293B" : (isYellow ? "FFF9D6" : "EAF2FB");
            const cardBorder = isDarkTheme ? "334155" : (isYellow ? "FFDD3C" : "005AAB");
            const pillBg = isYellow ? "FFDD3C" : "005AAB";
            const pillFg = isYellow ? "272525" : "FFFFFF";
            const cTitleColor = isDarkTheme ? (isYellow ? "FFDD3C" : "93C5FD") : (isYellow ? "272525" : "005AAB");
            const cDescColor = isDarkTheme ? "E2E8F0" : (isYellow ? "4A4545" : "334155");

            pSlide.addShape(pptx.ShapeType.roundRect, {
              x,
              y,
              w: cWidth,
              h: cHeight,
              fill: { color: cardBg },
              line: { color: cardBorder, width: 1.5 },
              rectRadius: 0.05,
            });

            pSlide.addShape(pptx.ShapeType.roundRect, {
              x: x + 0.25,
              y: y + 0.2,
              w: 0.52,
              h: 0.32,
              fill: { color: pillBg },
              rectRadius: 0.04,
            });

            pSlide.addText(`0${bIdx + 1}`, {
              x: x + 0.25,
              y: y + 0.22,
              w: 0.52,
              h: 0.28,
              fontSize: 12,
              bold: true,
              color: pillFg,
              align: "center",
              valign: "middle",
              fontFace: fontBody,
            });

            // Unified Title + Description in ONE single text box so they naturally flow and never collide
            pSlide.addText([
              {
                text: bTitle + "\n",
                options: {
                  bold: true,
                  fontSize: 14,
                  color: cTitleColor,
                  fontFace: fontTitle,
                  lineSpacingMultiple: 1.15,
                },
              },
              {
                text: bDesc,
                options: {
                  bold: false,
                  fontSize: 11,
                  color: cDescColor,
                  fontFace: fontBody,
                  lineSpacingMultiple: 1.2,
                },
              },
            ], {
              x: x + 0.88,
              y: y + 0.18,
              w: cWidth - 1.1,
              h: cHeight - 0.28,
              valign: "top",
              margin: 0,
            });
          });
        } else {
          // 2 Columns Side-by-Side (count === 2) OR 1 Card Centered (count === 1)
          const cWidth = count === 1 ? 8.0 : (PAD.CONTENT_W - PAD.GAP_H) / 2;
          const startX = count === 1 ? PAD.LEFT + (PAD.CONTENT_W - 8.0) / 2 : PAD.LEFT;

          items.forEach((b, bIdx) => {
            const x = startX + bIdx * (cWidth + PAD.GAP_H);
            const parts = b.split(/:\s*|\s*-\s*|\s*—\s*/);
            const bTitle = parts.length > 1 ? parts[0]?.trim() : `Pillar 0${bIdx + 1}`;
            const bDesc = parts.length > 1 ? parts.slice(1).join(" — ").trim() : b;
            const isYellow = bIdx % 2 === 0;

            const cardBg = isDarkTheme ? "1E293B" : (isYellow ? "FFF9D6" : "EAF2FB");
            const cardBorder = isDarkTheme ? "334155" : (isYellow ? "FFDD3C" : "005AAB");
            const pillBg = isYellow ? "FFDD3C" : "005AAB";
            const pillFg = isYellow ? "272525" : "FFFFFF";
            const cTitleColor = isDarkTheme ? (isYellow ? "FFDD3C" : "93C5FD") : (isYellow ? "272525" : "005AAB");
            const cDescColor = isDarkTheme ? "E2E8F0" : (isYellow ? "4A4545" : "334155");

            pSlide.addShape(pptx.ShapeType.roundRect, {
              x,
              y: PAD.CONTENT_Y + 0.1,
              w: cWidth,
              h: availableH,
              fill: { color: cardBg },
              line: { color: cardBorder, width: 1.5 },
              rectRadius: 0.06,
            });

            // Accent pill
            pSlide.addShape(pptx.ShapeType.roundRect, {
              x: x + 0.35,
              y: PAD.CONTENT_Y + 0.35,
              w: 0.58,
              h: 0.36,
              fill: { color: pillBg },
              rectRadius: 0.04,
            });

            pSlide.addText(`0${bIdx + 1}`, {
              x: x + 0.35,
              y: PAD.CONTENT_Y + 0.37,
              w: 0.58,
              h: 0.32,
              fontSize: 12,
              bold: true,
              color: pillFg,
              align: "center",
              valign: "middle",
              fontFace: fontBody,
            });

            // Title
            pSlide.addText(bTitle, {
              x: x + 1.1,
              y: PAD.CONTENT_Y + 0.26,
              w: cWidth - 1.45,
              h: 0.58,
              fontSize: 20.5,
              bold: true,
              color: cTitleColor,
              fontFace: fontTitle,
              valign: "middle",
            });

            // Description
            pSlide.addText(bDesc, {
              x: x + 0.35,
              y: PAD.CONTENT_Y + 0.95,
              w: cWidth - 0.7,
              h: availableH - 1.15,
              fontSize: 16.5,
              color: cDescColor,
              fontFace: fontBody,
              valign: "top",
              lineSpacingMultiple: 1.25,
            });
          });
        }

        // Optional Bottom Insight Bar (matching decks/page.tsx line 2745)
        if (hasInsight) {
          const insightContent = slide.insightBarText || slide.description || "";
          const barY = PAD.CONTENT_Y + availableH + 0.25;

          pSlide.addShape(pptx.ShapeType.roundRect, {
            x: PAD.LEFT,
            y: barY,
            w: PAD.CONTENT_W,
            h: 0.55,
            fill: { color: isDarkTheme ? "1E293B" : "EAF2FB" },
            line: { color: isDarkTheme ? "334155" : "005AAB", width: 1 },
            rectRadius: 0.04,
          });

          // Left deep blue accent stripe
          pSlide.addShape(pptx.ShapeType.rect, {
            x: PAD.LEFT,
            y: barY,
            w: 0.12,
            h: 0.55,
            fill: { color: "005AAB" },
            line: { color: "005AAB" },
          });

          pSlide.addText([
            { text: "Insight: ", options: { bold: true, fontSize: 14.5, color: isDarkTheme ? "93C5FD" : "005AAB" } },
            { text: insightContent, options: { bold: false, fontSize: 14.5, color: isDarkTheme ? "E2E8F0" : "272525" } },
          ], {
            x: PAD.LEFT + 0.3,
            y: barY + 0.08,
            w: PAD.CONTENT_W - 0.5,
            h: 0.4,
            fontFace: fontBody,
            valign: "middle",
          });
        }
        break;
      }

      case "bigNumber": {
        if (!hasTemplateBg) {
          pSlide.background = { color: primaryHex };
        }

        pSlide.addText(slide.title, {
          x: PAD.LEFT,
          y: PAD.TITLE_Y,
          w: PAD.CONTENT_W,
          h: PAD.TITLE_H,
          fontSize: 34,
          color: titleColor,
          bold: true,
          fontFace: fontTitle,
        });

        if (slide.highlight) {
          pSlide.addText(slide.highlight, {
            x: PAD.LEFT,
            y: PAD.CONTENT_Y + 0.2,
            w: PAD.CONTENT_W,
            h: 1.8,
            fontSize: 72,
            color: hasTemplateBg ? (isDarkTheme ? "FFDD3C" : "005AAB") : primaryContrastColor,
            bold: true,
            fontFace: fontTitle,
          });
        }

        if (slide.description) {
          pSlide.addText(slide.description, {
            x: PAD.LEFT,
            y: PAD.CONTENT_Y + 2.2,
            w: PAD.CONTENT_W,
            h: 1.4,
            fontSize: 18,
            color: hasTemplateBg ? currentTextColor : primaryContrastColor,
            fontFace: fontBody,
          });
        }
        break;
      }

      case "chartBar":
      case "chartArea": {
        pSlide.addText(slide.title, {
          x: PAD.LEFT,
          y: PAD.TITLE_Y,
          w: PAD.CONTENT_W,
          h: PAD.TITLE_H,
          fontSize: 34,
          color: titleColor,
          bold: true,
          fontFace: fontTitle,
        });

        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: PAD.LEFT,
            y: PAD.SUB_Y,
            w: PAD.CONTENT_W,
            h: PAD.SUB_H,
            fontSize: 16,
            color: currentMutedColor,
            fontFace: fontBody,
          });
        }

        // Add native PPTX bar chart
        const chartData = slide.chartData || [
          { name: "Q1", value: 45, secondary: 25 },
          { name: "Q2", value: 72, secondary: 40 },
          { name: "Q3", value: 110, secondary: 65 },
          { name: "Q4", value: 168, secondary: 95 },
        ];

        const labels = chartData.map((d) => d.name);
        const values = chartData.map((d) => d.value);

        pSlide.addChart(pptx.ChartType.bar, [{ name: "Performance", labels, values }], {
          x: PAD.LEFT,
          y: PAD.CONTENT_Y,
          w: PAD.CONTENT_W,
          h: 4.2,
          chartColors: ["005AAB"],
          showValue: true,
        });
        break;
      }

      case "chartDonut": {
        pSlide.addText(slide.title, {
          x: PAD.LEFT,
          y: PAD.TITLE_Y,
          w: PAD.CONTENT_W,
          h: PAD.TITLE_H,
          fontSize: 34,
          color: titleColor,
          bold: true,
          fontFace: fontTitle,
        });

        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: PAD.LEFT,
            y: PAD.SUB_Y,
            w: PAD.CONTENT_W,
            h: PAD.SUB_H,
            fontSize: 16,
            color: currentMutedColor,
            fontFace: fontBody,
          });
        }

        const donutData = slide.chartData || [
          { name: "Enterprise SaaS", value: 45 },
          { name: "Education & EdTech", value: 25 },
          { name: "Healthcare & Biotech", value: 18 },
          { name: "Finance & Banking", value: 12 },
        ];

        const labels = donutData.map((d) => d.name);
        const values = donutData.map((d) => d.value);

        pSlide.addChart(pptx.ChartType.doughnut, [{ name: "Segments", labels, values }], {
          x: PAD.LEFT,
          y: PAD.CONTENT_Y,
          w: PAD.CONTENT_W,
          h: 4.2,
          chartColors: ["005AAB", "FFDD3C", "3B82F6", "F59E0B"],
          showLegend: true,
          legendPos: "r",
        });
        break;
      }

      case "flowDiagram": {
        pSlide.addText(slide.title, {
          x: PAD.LEFT,
          y: PAD.TITLE_Y,
          w: PAD.CONTENT_W,
          h: PAD.TITLE_H,
          fontSize: 34,
          color: titleColor,
          bold: true,
          fontFace: fontTitle,
        });

        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: PAD.LEFT,
            y: PAD.SUB_Y,
            w: PAD.CONTENT_W,
            h: PAD.SUB_H,
            fontSize: 16,
            color: currentMutedColor,
            fontFace: fontBody,
          });
        }

        const nodes = slide.flowNodes && slide.flowNodes.length > 0
          ? slide.flowNodes
          : (slide.bullets && slide.bullets.length > 0
              ? slide.bullets.map((b, i) => ({
                  title: b.split(/[:—–-]/)[0]?.trim() || `Step ${i + 1}`,
                  subtitle: b.split(/[:—–-]/).slice(1).join("—").trim() || b,
                  tag: `0${i + 1}`,
                }))
              : []);

        const N = Math.max(nodes.length, 1);
        const totalW = PAD.CONTENT_W;
        const gap = N <= 3 ? 0.45 : 0.3;
        const cardWidth = Math.min((totalW - (N - 1) * gap) / N, 3.6);
        const actualWidthSpan = N * cardWidth + (N - 1) * gap;
        const startX = PAD.LEFT + (totalW - actualWidthSpan) / 2;

        nodes.forEach((node, nIdx) => {
          const x = startX + nIdx * (cardWidth + gap);
          const isEven = nIdx % 2 === 0;
          pSlide.addShape(pptx.ShapeType.roundRect, {
            x,
            y: PAD.CONTENT_Y,
            w: cardWidth,
            h: 3.8,
            fill: { color: isDarkTheme ? "1E293B" : (isEven ? "FFF9D6" : "EAF2FB") },
            line: { color: isDarkTheme ? "334155" : (isEven ? "FFDD3C" : "005AAB"), width: 1.5 },
            rectRadius: 0.05,
          });

          // Tag
          pSlide.addShape(pptx.ShapeType.roundRect, {
            x: x + PAD.CARD_PAD,
            y: PAD.CONTENT_Y + 0.25,
            w: 0.85,
            h: 0.32,
            fill: { color: isEven ? "FFDD3C" : "005AAB" },
            rectRadius: 0.04,
          });

          pSlide.addText(node.tag || `0${nIdx + 1}`, {
            x: x + PAD.CARD_PAD,
            y: PAD.CONTENT_Y + 0.28,
            w: 0.85,
            h: 0.26,
            fontSize: 12,
            color: isEven ? "111827" : "FFFFFF",
            bold: true,
            align: "center",
            fontFace: fontBody,
          });

          // Title
          pSlide.addText(node.title, {
            x: x + PAD.CARD_PAD,
            y: PAD.CONTENT_Y + 0.72,
            w: cardWidth - PAD.CARD_PAD * 2,
            h: 0.65,
            fontSize: 18,
            color: isDarkTheme ? "FFFFFF" : "005AAB",
            bold: true,
            fontFace: fontTitle,
          });

          // Subtitle
          if (node.subtitle) {
            pSlide.addText(node.subtitle, {
              x: x + PAD.CARD_PAD,
              y: PAD.CONTENT_Y + 1.45,
              w: cardWidth - PAD.CARD_PAD * 2,
              h: 2.1,
              fontSize: 14,
              color: isDarkTheme ? "CCCCCC" : "272525",
              fontFace: fontBody,
            });
          }

          // Arrow indicator between cards
          if (nIdx < nodes.length - 1) {
            pSlide.addText("→", {
              x: x + cardWidth,
              y: PAD.CONTENT_Y + 1.55,
              w: gap,
              h: 0.55,
              fontSize: 24,
              color: primaryHex === "FFDE3C" ? "D97706" : primaryHex,
              align: "center",
              bold: true,
              fontFace: fontBody,
            });
          }
        });
        break;
      }

      case "tableComparison": {
        pSlide.addText(slide.title, {
          x: PAD.LEFT,
          y: PAD.TITLE_Y,
          w: PAD.CONTENT_W,
          h: PAD.TITLE_H,
          fontSize: 34,
          color: titleColor,
          bold: true,
          fontFace: fontTitle,
        });

        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: PAD.LEFT,
            y: PAD.SUB_Y,
            w: PAD.CONTENT_W,
            h: PAD.SUB_H,
            fontSize: 16,
            color: currentMutedColor,
            fontFace: fontBody,
          });
        }

        const rows = slide.tableRows && slide.tableRows.length > 0 ? slide.tableRows : [];
        if (rows.length === 0) {
          const items = (slide.bullets && slide.bullets.length > 0)
            ? slide.bullets
            : (slide.description ? [slide.description] : ["Analysis in progress"]);
          const cWidth = items.length <= 2 ? 5.4 : 3.5;
          const cGap = 0.4;
          items.slice(0, 3).forEach((item, i) => {
            const x = PAD.LEFT + i * (cWidth + cGap);
            const isEven = i % 2 === 0;
            pSlide.addShape(pptx.ShapeType.roundRect, {
              x,
              y: PAD.CONTENT_Y,
              w: cWidth,
              h: 3.8,
              fill: { color: isDarkTheme ? "181818" : (isEven ? "FFF9D6" : "EAF2FB") },
              line: { color: isDarkTheme ? "333333" : (isEven ? "FFDD3C" : "005AAB"), width: 1.5 },
              rectRadius: 0.05,
            });
            pSlide.addText(item, {
              x: x + PAD.CARD_PAD,
              y: PAD.CONTENT_Y + 0.3,
              w: cWidth - PAD.CARD_PAD * 2,
              h: 3.2,
              fontSize: 16,
              color: isDarkTheme ? "FFFFFF" : "005AAB",
              fontFace: fontBody,
            });
          });
          break;
        }

        const headers = slide.tableHeaders && slide.tableHeaders.length > 0
          ? slide.tableHeaders
          : ["Feature / Dimension", "Current State", "Proposed Solution"];

        const headerRow = headers.map((h, i) => ({
          text: h,
          options: {
            bold: true,
            fill: i === headers.length - 1 ? "005AAB" : (i % 2 === 0 ? "FFDD3C" : "F3F4F6"),
            color: i === headers.length - 1 ? "FFFFFF" : (i % 2 === 0 ? "111827" : "333333"),
            align: (i === 0 ? "left" : "center") as "left" | "center",
            fontSize: 14,
          },
        }));

        const tableData: Array<Array<{ text: string; options?: Record<string, unknown> }>> = [headerRow];

        rows.forEach((r, rIdx) => {
          const rowBg = rIdx % 2 === 0 ? "FFFFFF" : (isDarkTheme ? "1E293B" : "F5F9FE");
          if (r.cells && r.cells.length > 0) {
            tableData.push(
              r.cells.map((c, i) => ({
                text: typeof c === "boolean" ? (c ? "Yes" : "No") : String(c ?? ""),
                options: {
                  bold: i === 0 || i === r.cells!.length - 1,
                  color: i === 0 ? (isDarkTheme ? "FFFFFF" : "005AAB") : (isDarkTheme ? "CCCCCC" : "333333"),
                  fill: rowBg,
                  align: (i === 0 ? "left" : "center") as "left" | "center",
                  fontSize: 13,
                },
              }))
            );
          } else {
            tableData.push([
              { text: r.feature || "Feature", options: { color: isDarkTheme ? "FFFFFF" : "005AAB", bold: true, align: "left", fill: rowBg, fontSize: 13 } },
              { text: typeof r.current === "boolean" ? (r.current ? "Yes" : "No") : String(r.current ?? "-"), options: { align: "center", color: isDarkTheme ? "CCCCCC" : "666666", fill: rowBg, fontSize: 13 } },
              { text: typeof r.proposed === "boolean" ? (r.proposed ? "Yes" : "No") : String(r.proposed ?? "Yes"), options: { align: "center", bold: true, color: isDarkTheme ? "FFDD3C" : "005AAB", fill: rowBg, fontSize: 13 } },
            ]);
          }
        });

        const numCols = headers.length;
        const colW = numCols === 3 ? [5.33, 3.0, 3.0] : Array(numCols).fill(PAD.CONTENT_W / numCols);

        pSlide.addTable(tableData, {
          x: PAD.LEFT,
          y: PAD.CONTENT_Y,
          w: PAD.CONTENT_W,
          h: 3.8,
          colW,
          border: { type: "solid", color: "E5E7EB", pt: 1 },
          fontFace: fontBody,
          fontSize: 13,
        });
        break;
      }

      case "timeline": {
        pSlide.addText(slide.title, {
          x: PAD.LEFT,
          y: PAD.TITLE_Y,
          w: PAD.CONTENT_W,
          h: PAD.TITLE_H,
          fontSize: 34,
          color: titleColor,
          bold: true,
          fontFace: fontTitle,
        });

        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: PAD.LEFT,
            y: PAD.SUB_Y,
            w: PAD.CONTENT_W,
            h: PAD.SUB_H,
            fontSize: 16,
            color: currentMutedColor,
            fontFace: fontBody,
          });
        }

        const milestones = slide.timelineMilestones && slide.timelineMilestones.length > 0
          ? slide.timelineMilestones
          : (slide.bullets && slide.bullets.length > 0
              ? slide.bullets.map((b, i) => ({
                  quarter: `Phase 0${i + 1}`,
                  title: b.split(/[:—–-]/)[0]?.trim() || `Milestone 0${i + 1}`,
                  description: b.split(/[:—–-]/).slice(1).join("—").trim() || b,
                }))
              : []);

        const mCount = Math.max(milestones.length, 1);
        const mGap = 0.35;
        const mWidth = (PAD.CONTENT_W - (mCount - 1) * mGap) / mCount;

        milestones.forEach((m, mIdx) => {
          const x = PAD.LEFT + mIdx * (mWidth + mGap);
          const isEven = mIdx % 2 === 0;
          pSlide.addShape(pptx.ShapeType.roundRect, {
            x,
            y: PAD.CONTENT_Y + 0.1,
            w: mWidth,
            h: 3.8,
            fill: { color: isDarkTheme ? "181818" : (isEven ? "FFF9D6" : "EAF2FB") },
            line: { color: isDarkTheme ? "333333" : (isEven ? "FFDD3C" : "005AAB"), width: 1.5 },
            rectRadius: 0.05,
          });

          // Node Circle
          pSlide.addShape(pptx.ShapeType.ellipse, {
            x: x + (mWidth - 0.5) / 2,
            y: PAD.CONTENT_Y + 0.35,
            w: 0.5,
            h: 0.5,
            fill: { color: isEven ? "FFDD3C" : "005AAB" },
          });

          // Quarter
          pSlide.addText(m.quarter, {
            x: x + 0.1,
            y: PAD.CONTENT_Y + 0.95,
            w: mWidth - 0.2,
            h: 0.3,
            fontSize: 12,
            color: isDarkTheme ? "999999" : (isEven ? "B45309" : "005AAB"),
            bold: true,
            align: "center",
            fontFace: fontBody,
          });

          // Title
          pSlide.addText(m.title, {
            x: x + 0.1,
            y: PAD.CONTENT_Y + 1.35,
            w: mWidth - 0.2,
            h: 0.6,
            fontSize: 16,
            color: isDarkTheme ? "FFFFFF" : "005AAB",
            bold: true,
            align: "center",
            fontFace: fontTitle,
          });

          // Description
          pSlide.addText(m.description, {
            x: x + 0.1,
            y: PAD.CONTENT_Y + 2.05,
            w: mWidth - 0.2,
            h: 1.6,
            fontSize: 13.5,
            color: isDarkTheme ? "CCCCCC" : "272525",
            align: "center",
            fontFace: fontBody,
          });
        });
        break;
      }

      case "chartRadar": {
        pSlide.addText(slide.title, {
          x: 1.0,
          y: 0.8,
          w: 11.0,
          h: 0.8,
          fontSize: 34,
          color: titleColor,
          bold: true,
          fontFace: fontTitle,
        });

        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: 1.0,
            y: 1.6,
            w: 11.0,
            h: 0.5,
            fontSize: 16,
            color: currentMutedColor,
            fontFace: fontBody,
          });
        }

        const radarData = slide.chartData || [
          { name: "Velocity", value: 95 },
          { name: "Visual Polish", value: 92 },
          { name: "Cost ROI", value: 98 },
          { name: "Scalability", value: 85 },
          { name: "Usability", value: 90 },
          { name: "Security", value: 88 },
        ];

        const labels = radarData.map((d) => d.name);
        const values = radarData.map((d) => d.value);

        pSlide.addChart(pptx.ChartType.radar, [{ name: "Score", labels, values }], {
          x: 2.5,
          y: 2.3,
          w: 8.0,
          h: 4.4,
          chartColors: ["005AAB"],
          showLegend: false,
        });
        break;
      }

      case "quadrantMatrix": {
        pSlide.addText(slide.title, {
          x: PAD.LEFT,
          y: PAD.TITLE_Y,
          w: PAD.CONTENT_W,
          h: PAD.TITLE_H,
          fontSize: 34,
          color: titleColor,
          bold: true,
          fontFace: fontTitle,
        });

        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: PAD.LEFT,
            y: PAD.SUB_Y,
            w: PAD.CONTENT_W,
            h: PAD.SUB_H,
            fontSize: 16,
            color: currentMutedColor,
            fontFace: fontBody,
          });
        }

        const bulletItems = slide.bullets || [];
        const quads = [
          { title: "QUICK WINS (High Impact, Low Effort)", items: slide.quadrantData?.q1 || (bulletItems[0] ? [{ title: bulletItems[0] }] : []), col: 0, row: 0, fill: "FFF9D6", border: "FFDD3C" },
          { title: "STRATEGIC BETS (High Impact, High Effort)", items: slide.quadrantData?.q2 || (bulletItems[1] ? [{ title: bulletItems[1] }] : []), col: 1, row: 0, fill: "EAF2FB", border: "005AAB" },
          { title: "FILL-IN TASKS (Low Impact, Low Effort)", items: slide.quadrantData?.q3 || (bulletItems[2] ? [{ title: bulletItems[2] }] : []), col: 0, row: 1, fill: "F8FAFC", border: "CBD5E1" },
          { title: "DEPRIORITIZE (Low Impact, High Effort)", items: slide.quadrantData?.q4 || (bulletItems[3] ? [{ title: bulletItems[3] }] : []), col: 1, row: 1, fill: "FEF2F2", border: "FECACA" },
        ];

        const quadW = (PAD.CONTENT_W - PAD.GAP_H) / 2;
        const quadH = 1.95;

        quads.forEach((q) => {
          const x = PAD.LEFT + q.col * (quadW + PAD.GAP_H);
          const y = PAD.CONTENT_Y + q.row * (quadH + 0.2);
          pSlide.addShape(pptx.ShapeType.roundRect, {
            x,
            y,
            w: quadW,
            h: quadH,
            fill: { color: isDarkTheme ? "1E293B" : q.fill },
            line: { color: isDarkTheme ? "334155" : q.border, width: 1.5 },
            rectRadius: 0.05,
          });

          pSlide.addText(q.title, {
            x: x + PAD.INNER,
            y: y + 0.15,
            w: quadW - PAD.INNER * 2,
            h: 0.35,
            fontSize: 13,
            bold: true,
            color: isDarkTheme ? "FFDD3C" : "005AAB",
            fontFace: fontTitle,
          });

          const itemTexts = q.items.map((it) => it.title).join(" • ");
          pSlide.addText(itemTexts, {
            x: x + PAD.INNER,
            y: y + 0.55,
            w: quadW - PAD.INNER * 2,
            h: quadH - 0.7,
            fontSize: 13.5,
            color: currentTextColor,
            fontFace: fontBody,
          });
        });
        break;
      }

      case "funnel": {
        pSlide.addText(slide.title, {
          x: PAD.LEFT,
          y: PAD.TITLE_Y,
          w: PAD.CONTENT_W,
          h: PAD.TITLE_H,
          fontSize: 34,
          color: titleColor,
          bold: true,
          fontFace: fontTitle,
        });

        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: PAD.LEFT,
            y: PAD.SUB_Y,
            w: PAD.CONTENT_W,
            h: PAD.SUB_H,
            fontSize: 16,
            color: currentMutedColor,
            fontFace: fontBody,
          });
        }

        const stages = slide.funnelStages || [
          { label: "Total Reach", value: "250,000", rate: "100%" },
          { label: "Engaged Creators", value: "84,000", rate: "33.6%" },
          { label: "Active Workspaces", value: "28,500", rate: "11.4%" },
          { label: "Enterprise Subscriptions", value: "6,200", rate: "2.4%" },
        ];

        const stageH = 0.85;
        const stageGap = 0.15;
        const maxW = PAD.CONTENT_W;

        stages.forEach((st, sIdx) => {
          const w = maxW - sIdx * (maxW * 0.14);
          const x = PAD.LEFT + (maxW - w) / 2;
          const y = PAD.CONTENT_Y + sIdx * (stageH + stageGap);
          const isFinal = sIdx === stages.length - 1;

          pSlide.addShape(pptx.ShapeType.roundRect, {
            x,
            y,
            w,
            h: stageH,
            fill: { color: isFinal ? primaryHex : (isDarkTheme ? "1E293B" : "FFFFFF") },
            line: { color: isDarkTheme ? "334155" : "D1D5DB", width: 1.5 },
            rectRadius: 0.08,
          });

          pSlide.addText(`${st.label}   |   ${st.value} (${st.rate || ""})`, {
            x: x + PAD.INNER,
            y: y + 0.18,
            w: w - PAD.INNER * 2,
            h: 0.45,
            fontSize: 14.5,
            bold: true,
            color: isFinal ? primaryContrastColor : currentTextColor,
            align: "center",
            fontFace: fontBody,
          });
        });
        break;
      }

      case "cycleLoop": {
        pSlide.addText(slide.title, {
          x: PAD.LEFT,
          y: PAD.TITLE_Y,
          w: PAD.CONTENT_W,
          h: PAD.TITLE_H,
          fontSize: 34,
          color: titleColor,
          bold: true,
          fontFace: fontTitle,
        });

        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: PAD.LEFT,
            y: PAD.SUB_Y,
            w: PAD.CONTENT_W,
            h: PAD.SUB_H,
            fontSize: 16,
            color: currentMutedColor,
            fontFace: fontBody,
          });
        }

        const nodes = slide.cycleNodes && slide.cycleNodes.length > 0
          ? slide.cycleNodes
          : (slide.bullets && slide.bullets.length > 0
              ? slide.bullets.map((b, i) => ({
                  title: b.split(/[:—–-]/)[0]?.trim() || `Step ${i + 1}`,
                  description: b.split(/[:—–-]/).slice(1).join("—").trim() || b,
                }))
              : []);

        const nCount = Math.max(nodes.length, 1);
        const cardGap = 0.3;
        const cardW = (PAD.CONTENT_W - (nCount - 1) * cardGap) / nCount;
        const cardH = 3.9;

        nodes.forEach((n, nIdx) => {
          const x = PAD.LEFT + nIdx * (cardW + cardGap);
          const isYellow = nIdx % 2 === 0;
          pSlide.addShape(pptx.ShapeType.roundRect, {
            x,
            y: PAD.CONTENT_Y,
            w: cardW,
            h: cardH,
            fill: { color: isDarkTheme ? "1E293B" : (isYellow ? "FFF9D6" : "EAF2FB") },
            line: { color: isDarkTheme ? "334155" : (isYellow ? "FFDD3C" : "005AAB"), width: 1.5 },
            rectRadius: 0.05,
          });

          pSlide.addText(n.title, {
            x: x + PAD.INNER,
            y: PAD.CONTENT_Y + 0.25,
            w: cardW - PAD.INNER * 2,
            h: 0.5,
            fontSize: 17,
            bold: true,
            color: isDarkTheme ? "FFDD3C" : "005AAB",
            fontFace: fontTitle,
          });

          if (n.description) {
            pSlide.addText(n.description, {
              x: x + PAD.INNER,
              y: PAD.CONTENT_Y + 0.85,
              w: cardW - PAD.INNER * 2,
              h: cardH - 1.05,
              fontSize: 14,
              color: isDarkTheme ? "CBD5E1" : "272525",
              fontFace: fontBody,
            });
          }
        });
        break;
      }

      case "architecture": {
        pSlide.addText(slide.title, {
          x: PAD.LEFT,
          y: PAD.TITLE_Y,
          w: PAD.CONTENT_W,
          h: PAD.TITLE_H,
          fontSize: 34,
          color: titleColor,
          bold: true,
          fontFace: fontTitle,
        });

        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: PAD.LEFT,
            y: PAD.SUB_Y,
            w: PAD.CONTENT_W,
            h: PAD.SUB_H,
            fontSize: 16,
            color: currentMutedColor,
            fontFace: fontBody,
          });
        }

        const tiers: Array<{ name: string; desc: string }> = (slide.layers && slide.layers.length > 0)
          ? slide.layers.map((l: { name: string; detail?: string }) => ({
              name: l.name,
              desc: l.detail || "",
            }))
          : (slide.bullets && slide.bullets.length > 0
              ? slide.bullets.map((b: string, i: number) => ({
                  name: b.split(/[:—–-]/)[0]?.trim() || `Layer 0${i + 1}`,
                  desc: b.split(/[:—–-]/).slice(1).join("—").trim() || b,
                }))
              : []);

        const tCount = Math.max(tiers.length, 1);
        const tierGap = 0.16;
        const tierH = Math.min((4.0 - (tCount - 1) * tierGap) / tCount, 1.15);

        tiers.forEach((t, tIdx) => {
          const y = PAD.CONTENT_Y + tIdx * (tierH + tierGap);
          const isYellow = tIdx % 2 === 0;
          pSlide.addShape(pptx.ShapeType.roundRect, {
            x: PAD.LEFT,
            y,
            w: PAD.CONTENT_W,
            h: tierH,
            fill: { color: isDarkTheme ? "1E293B" : (isYellow ? "FFF9D6" : "EAF2FB") },
            line: { color: isDarkTheme ? "334155" : (isYellow ? "FFDD3C" : "005AAB"), width: 1.5 },
            rectRadius: 0.05,
          });

          pSlide.addText(t.name, {
            x: PAD.LEFT + PAD.INNER,
            y: y + 0.12,
            w: PAD.CONTENT_W - PAD.INNER * 2,
            h: 0.35,
            fontSize: 16.5,
            bold: true,
            color: isDarkTheme ? "FFDD3C" : "005AAB",
            fontFace: fontTitle,
          });

          pSlide.addText(t.desc, {
            x: PAD.LEFT + PAD.INNER,
            y: y + 0.5,
            w: PAD.CONTENT_W - PAD.INNER * 2,
            h: tierH - 0.55,
            fontSize: 13.5,
            color: isDarkTheme ? "CBD5E1" : "272525",
            fontFace: fontBody,
          });
        });
        break;
      }

      case "chevronProcess": {
        pSlide.addText(slide.title, {
          x: PAD.LEFT,
          y: PAD.TITLE_Y,
          w: PAD.CONTENT_W,
          h: PAD.TITLE_H,
          fontSize: 34,
          color: titleColor,
          bold: true,
          fontFace: fontTitle,
        });

        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: PAD.LEFT,
            y: PAD.SUB_Y,
            w: PAD.CONTENT_W,
            h: PAD.SUB_H,
            fontSize: 16,
            color: currentMutedColor,
            fontFace: fontBody,
          });
        }

        const cSteps = slide.chevronSteps || [
          { title: "Step 01", percentage: "35%", description: "Ingestion", position: "bottom" },
          { title: "Step 02", percentage: "45%", description: "Context", position: "top" },
          { title: "Step 03", percentage: "55%", description: "Synthesis", position: "bottom" },
          { title: "Step 04", percentage: "65%", description: "Mapping", position: "top" },
          { title: "Step 05", percentage: "75%", description: "Export", position: "bottom" },
        ];

        const cCount = cSteps.length;
        const cGap = 0.2;
        const cWidth = (PAD.CONTENT_W - (cCount - 1) * cGap) / cCount;

        cSteps.forEach((st, sIdx) => {
          const x = PAD.LEFT + sIdx * (cWidth + cGap);
          const isYellow = sIdx % 2 === 0;

          // Top Callout
          if (st.position === "top") {
            pSlide.addText(st.percentage || "", {
              x,
              y: PAD.CONTENT_Y,
              w: cWidth,
              h: 0.4,
              fontSize: 18,
              bold: true,
              color: isDarkTheme ? "FFDD3C" : "005AAB",
              align: "center",
              fontFace: fontTitle,
            });
            pSlide.addText(st.description || "", {
              x,
              y: PAD.CONTENT_Y + 0.4,
              w: cWidth,
              h: 0.45,
              fontSize: 12.5,
              color: currentMutedColor,
              align: "center",
              fontFace: fontBody,
            });
          }

          // Chevron Box
          pSlide.addShape(pptx.ShapeType.roundRect, {
            x,
            y: PAD.CONTENT_Y + 1.1,
            w: cWidth,
            h: 0.9,
            fill: { color: isYellow ? primaryHex : (isDarkTheme ? "1E293B" : "005AAB") },
            rectRadius: 0.05,
          });

          pSlide.addText(st.title, {
            x,
            y: PAD.CONTENT_Y + 1.25,
            w: cWidth,
            h: 0.6,
            fontSize: 14,
            bold: true,
            color: isYellow ? primaryContrastColor : "FFFFFF",
            align: "center",
            fontFace: fontTitle,
          });

          // Bottom Callout
          if (st.position === "bottom") {
            pSlide.addText(st.percentage || "", {
              x,
              y: PAD.CONTENT_Y + 2.2,
              w: cWidth,
              h: 0.4,
              fontSize: 18,
              bold: true,
              color: isDarkTheme ? "FFDD3C" : "005AAB",
              align: "center",
              fontFace: fontTitle,
            });
            pSlide.addText(st.description || "", {
              x,
              y: PAD.CONTENT_Y + 2.65,
              w: cWidth,
              h: 0.45,
              fontSize: 12.5,
              color: currentMutedColor,
              align: "center",
              fontFace: fontBody,
            });
          }
        });
        break;
      }

      case "gaugeRings": {
        pSlide.addText(slide.title, {
          x: PAD.LEFT,
          y: PAD.TITLE_Y,
          w: PAD.CONTENT_W,
          h: PAD.TITLE_H,
          fontSize: 34,
          color: titleColor,
          bold: true,
          fontFace: fontTitle,
        });

        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: PAD.LEFT,
            y: PAD.SUB_Y,
            w: PAD.CONTENT_W,
            h: PAD.SUB_H,
            fontSize: 16,
            color: currentMutedColor,
            fontFace: fontBody,
          });
        }

        const gauges = slide.gaugeItems || [
          { percentage: 55, title: "Standardized Automation", description: "Eliminates design bottlenecks across teams." },
          { percentage: 75, title: "Velocity Acceleration", description: "Sub-second slide generation & instant export." },
        ];

        const cardW = (PAD.CONTENT_W - PAD.GAP_H) / 2;

        gauges.forEach((g, gIdx) => {
          const x = PAD.LEFT + gIdx * (cardW + PAD.GAP_H);
          pSlide.addShape(pptx.ShapeType.roundRect, {
            x,
            y: PAD.CONTENT_Y,
            w: cardW,
            h: 3.9,
            fill: { color: isDarkTheme ? "1E293B" : "FFFFFF" },
            line: { color: isDarkTheme ? "334155" : "E5E7EB", width: 1.5 },
            rectRadius: 0.08,
          });

          // Gauge Circle
          pSlide.addShape(pptx.ShapeType.ellipse, {
            x: x + 0.4,
            y: PAD.CONTENT_Y + 0.6,
            w: 1.8,
            h: 1.8,
            fill: { color: isDarkTheme ? "0F172A" : "FFFBEB" },
            line: { color: primaryHex, width: 4 },
          });

          pSlide.addText(`${g.percentage}%`, {
            x: x + 0.4,
            y: PAD.CONTENT_Y + 1.15,
            w: 1.8,
            h: 0.6,
            fontSize: 26,
            bold: true,
            color: isDarkTheme ? "FFFFFF" : darkHex,
            align: "center",
            fontFace: fontTitle,
          });

          pSlide.addText(g.title, {
            x: x + 2.5,
            y: PAD.CONTENT_Y + 0.6,
            w: cardW - 2.8,
            h: 0.6,
            fontSize: 17,
            bold: true,
            color: isDarkTheme ? "FFDD3C" : "005AAB",
            fontFace: fontTitle,
          });

          pSlide.addText(g.description, {
            x: x + 2.5,
            y: PAD.CONTENT_Y + 1.25,
            w: cardW - 2.8,
            h: 1.8,
            fontSize: 13.5,
            color: currentTextColor,
            fontFace: fontBody,
          });
        });
        break;
      }

      case "ascendingTrajectory": {
        pSlide.addText(slide.title, {
          x: PAD.LEFT,
          y: PAD.TITLE_Y,
          w: PAD.CONTENT_W,
          h: PAD.TITLE_H,
          fontSize: 34,
          color: titleColor,
          bold: true,
          fontFace: fontTitle,
        });

        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: PAD.LEFT,
            y: PAD.SUB_Y,
            w: PAD.CONTENT_W,
            h: PAD.SUB_H,
            fontSize: 16,
            color: currentMutedColor,
            fontFace: fontBody,
          });
        }

        const tNodes = slide.trajectoryNodes && slide.trajectoryNodes.length > 0
          ? slide.trajectoryNodes
          : (slide.bullets && slide.bullets.length > 0
              ? slide.bullets.map((b, i) => ({
                  percentage: `${(i + 1) * 30}%`,
                  title: b.split(/[:—–-]/)[0]?.trim() || `Phase 0${i + 1}`,
                  description: b.split(/[:—–-]/).slice(1).join("—").trim() || b,
                }))
              : []);

        const tCount = Math.max(tNodes.length, 1);
        const tGap = 0.3;
        const tWidth = (PAD.CONTENT_W - (tCount - 1) * tGap) / tCount;

        tNodes.forEach((tn, tIdx) => {
          const x = PAD.LEFT + tIdx * (tWidth + tGap);
          const y = 4.6 - tIdx * 0.9;

          pSlide.addShape(pptx.ShapeType.roundRect, {
            x,
            y,
            w: tWidth,
            h: 1.4,
            fill: { color: primaryHex },
            rectRadius: 0.08,
          });

          pSlide.addText(tn.percentage, {
            x: x + PAD.INNER,
            y: y + 0.15,
            w: tWidth - PAD.INNER * 2,
            h: 0.4,
            fontSize: 24,
            bold: true,
            color: primaryContrastColor,
            fontFace: fontTitle,
          });

          pSlide.addText(tn.title, {
            x: x + PAD.INNER,
            y: y + 0.55,
            w: tWidth - PAD.INNER * 2,
            h: 0.35,
            fontSize: 16,
            bold: true,
            color: primaryContrastColor,
            fontFace: fontTitle,
          });

          if (tn.description) {
            pSlide.addText(tn.description, {
              x: x + PAD.INNER,
              y: y + 0.9,
              w: tWidth - PAD.INNER * 2,
              h: 0.45,
              fontSize: 13,
              color: primaryContrastColor,
              fontFace: fontBody,
            });
          }
        });
        break;
      }

      case "verticalProgress": {
        pSlide.addText(slide.title, {
          x: PAD.LEFT,
          y: PAD.TITLE_Y,
          w: PAD.CONTENT_W,
          h: PAD.TITLE_H,
          fontSize: 34,
          color: titleColor,
          bold: true,
          fontFace: fontTitle,
        });

        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: PAD.LEFT,
            y: PAD.SUB_Y,
            w: PAD.CONTENT_W,
            h: PAD.SUB_H,
            fontSize: 16,
            color: currentMutedColor,
            fontFace: fontBody,
          });
        }

        const vItems = slide.verticalProgressItems || [
          { title: "Input Ingestion & Extraction", percentage: 45, tag: "01" },
          { title: "Semantic Parsing & Structuring", percentage: 55, tag: "02" },
          { title: "16:9 Presentation Synthesis", percentage: 85, tag: "03" },
        ];

        vItems.forEach((vi, vIdx) => {
          const y = PAD.CONTENT_Y + vIdx * 1.25;

          // Tag Pill
          pSlide.addShape(pptx.ShapeType.roundRect, {
            x: PAD.LEFT,
            y: y + 0.05,
            w: 0.6,
            h: 0.6,
            fill: { color: primaryHex },
            rectRadius: 0.1,
          });

          pSlide.addText(vi.tag || `0${vIdx + 1}`, {
            x: PAD.LEFT,
            y: y + 0.15,
            w: 0.6,
            h: 0.4,
            fontSize: 13,
            bold: true,
            color: primaryContrastColor,
            align: "center",
            fontFace: fontBody,
          });

          // Title & %
          pSlide.addText(`${vi.title}   (${vi.percentage}%)`, {
            x: PAD.LEFT + 0.8,
            y,
            w: PAD.CONTENT_W - 0.8,
            h: 0.4,
            fontSize: 16.5,
            bold: true,
            color: currentTextColor,
            fontFace: fontTitle,
          });

          // Progress Track
          pSlide.addShape(pptx.ShapeType.roundRect, {
            x: PAD.LEFT + 0.8,
            y: y + 0.45,
            w: PAD.CONTENT_W - 0.8,
            h: 0.18,
            fill: { color: isDarkTheme ? "334155" : "E5E7EB" },
            rectRadius: 0.05,
          });

          // Active Bar
          pSlide.addShape(pptx.ShapeType.roundRect, {
            x: PAD.LEFT + 0.8,
            y: y + 0.45,
            w: ((PAD.CONTENT_W - 0.8) * vi.percentage) / 100,
            h: 0.18,
            fill: { color: primaryHex },
            rectRadius: 0.05,
          });
        });
        break;
      }

      case "splitMetric": {
        // Title & Subtitle
        pSlide.addText(slide.title, {
          x: PAD.LEFT,
          y: PAD.TITLE_Y,
          w: PAD.CONTENT_W,
          h: PAD.TITLE_H,
          fontSize: 34,
          color: titleColor,
          bold: true,
          fontFace: fontTitle,
        });

        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: PAD.LEFT,
            y: PAD.SUB_Y,
            w: PAD.CONTENT_W,
            h: PAD.SUB_H,
            fontSize: 16,
            color: currentMutedColor,
            fontFace: fontBody,
          });
        }

        // Left Metric Card
        const metricVal = slide.metricBox?.value || slide.stats?.[0]?.value || "56.2K";
        const metricLbl = slide.metricBox?.label || slide.stats?.[0]?.label || "Operational Milestone";
        const metricDesc = slide.metricBox?.description || "Project Phases With Modern Process Layouts That Improve Collaboration";

        pSlide.addShape(pptx.ShapeType.roundRect, {
          x: PAD.LEFT,
          y: PAD.CONTENT_Y,
          w: 3.8,
          h: 3.8,
          fill: { color: primaryHex },
          rectRadius: 0.1,
        });

        pSlide.addText(metricVal, {
          x: PAD.LEFT + PAD.INNER,
          y: PAD.CONTENT_Y + 0.3,
          w: 3.8 - PAD.INNER * 2,
          h: 0.9,
          fontSize: 44,
          bold: true,
          color: primaryContrastColor,
          fontFace: fontTitle,
        });

        pSlide.addText(metricLbl, {
          x: PAD.LEFT + PAD.INNER,
          y: PAD.CONTENT_Y + 1.3,
          w: 3.8 - PAD.INNER * 2,
          h: 0.5,
          fontSize: 16,
          bold: true,
          color: primaryContrastColor,
          fontFace: fontBody,
        });

        pSlide.addText(metricDesc, {
          x: PAD.LEFT + PAD.INNER,
          y: PAD.CONTENT_Y + 1.9,
          w: 3.8 - PAD.INNER * 2,
          h: 1.5,
          fontSize: 13.5,
          color: primaryContrastColor,
          fontFace: fontBody,
        });

        // Vertical divider line
        pSlide.addShape(pptx.ShapeType.line, {
          x: PAD.LEFT + 4.2,
          y: PAD.CONTENT_Y,
          w: 0,
          h: 3.8,
          line: { color: "E5E7EB", width: 1.5 },
        });

        // Right side: 3 Numbered Steps with Progress Bars
        const steps = slide.verticalProgressItems || [
          { title: "Data Project Process", percentage: 45, description: "Structured execution framework" },
          { title: "Process Flow Refinement", percentage: 65, description: "Iterative design enhancements" },
          { title: "Enterprise Scaling", percentage: 85, description: "Company-wide standardized adoption" },
        ];

        steps.forEach((st, sIdx) => {
          const sy = PAD.CONTENT_Y + sIdx * 1.3;
          
          // Badge number circle
          pSlide.addShape(pptx.ShapeType.roundRect, {
            x: PAD.LEFT + 4.6,
            y: sy + 0.05,
            w: 0.6,
            h: 0.35,
            fill: { color: primaryHex },
            rectRadius: 0.08,
          });

          pSlide.addText(`0${sIdx + 1}.`, {
            x: PAD.LEFT + 4.6,
            y: sy + 0.05,
            w: 0.6,
            h: 0.35,
            fontSize: 12,
            bold: true,
            color: primaryContrastColor,
            align: "center",
            fontFace: fontBody,
          });

          // Title
          pSlide.addText(st.title, {
            x: PAD.LEFT + 5.4,
            y: sy,
            w: 4.8,
            h: 0.35,
            fontSize: 16.5,
            bold: true,
            color: currentTextColor,
            fontFace: fontTitle,
          });

          // Description
          if (st.description) {
            pSlide.addText(st.description, {
              x: PAD.LEFT + 5.4,
              y: sy + 0.35,
              w: 4.8,
              h: 0.3,
              fontSize: 13,
              color: currentMutedColor,
              fontFace: fontBody,
            });
          }

          // Percentage stat
          pSlide.addText(`${st.percentage}%`, {
            x: PAD.LEFT + 10.2,
            y: sy,
            w: 1.1,
            h: 0.35,
            fontSize: 15,
            bold: true,
            color: currentTextColor,
            align: "right",
            fontFace: fontBody,
          });

          // Progress track
          pSlide.addShape(pptx.ShapeType.roundRect, {
            x: PAD.LEFT + 5.4,
            y: sy + 0.72,
            w: 5.9,
            h: 0.1,
            fill: { color: "E5E7EB" },
            rectRadius: 0.04,
          });

          // Progress fill
          pSlide.addShape(pptx.ShapeType.roundRect, {
            x: PAD.LEFT + 5.4,
            y: sy + 0.72,
            w: (5.9 * st.percentage) / 100,
            h: 0.1,
            fill: { color: primaryHex },
            rectRadius: 0.04,
          });
        });

        break;
      }

      case "horizontalMilestones": {
        // Title on left
        pSlide.addText(slide.title, {
          x: PAD.LEFT,
          y: PAD.TITLE_Y,
          w: 7.0,
          h: PAD.TITLE_H,
          fontSize: 34,
          color: titleColor,
          bold: true,
          fontFace: fontTitle,
        });

        // Subtitle on right
        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: 8.2,
            y: PAD.TITLE_Y,
            w: PAD.CONTENT_W - 7.0,
            h: PAD.TITLE_H,
            fontSize: 16,
            color: currentMutedColor,
            align: "right",
            fontFace: fontBody,
          });
        }

        const ms = slide.horizontalMilestones || [
          { percentage: "20%", title: "Data Project Process A", description: "Initial data baseline" },
          { percentage: "40%", title: "Data Project Process B", description: "Architecture design" },
          { percentage: "60%", title: "Data Project Process C", description: "Validation & QA" },
          { percentage: "70%", title: "Data Project Process D", description: "Deployment & Scale" },
        ];

        const barWidth = PAD.CONTENT_W;
        const segmentWidth = barWidth / ms.length;

        // Draw horizontal milestone bar
        ms.forEach((m, mIdx) => {
          const mx = PAD.LEFT + mIdx * segmentWidth;
          
          pSlide.addShape(pptx.ShapeType.rect, {
            x: mx,
            y: PAD.CONTENT_Y + 0.6,
            w: segmentWidth - 0.05,
            h: 0.8,
            fill: { color: primaryHex },
          });

          pSlide.addText(m.percentage, {
            x: mx,
            y: PAD.CONTENT_Y + 0.8,
            w: segmentWidth - 0.05,
            h: 0.4,
            fontSize: 18,
            bold: true,
            color: primaryContrastColor,
            align: "center",
            fontFace: fontTitle,
          });

          // Text below
          pSlide.addText(m.title, {
            x: mx + 0.1,
            y: PAD.CONTENT_Y + 1.6,
            w: segmentWidth - 0.2,
            h: 0.5,
            fontSize: 15.5,
            bold: true,
            color: currentTextColor,
            fontFace: fontTitle,
          });

          if (m.description) {
            pSlide.addText(m.description, {
              x: mx + 0.1,
              y: PAD.CONTENT_Y + 2.15,
              w: segmentWidth - 0.2,
              h: 1.2,
              fontSize: 13,
              color: currentMutedColor,
              fontFace: fontBody,
            });
          }
        });

        break;
      }

      case "boldStatement": {
        // Large statement title
        pSlide.addText(slide.title, {
          x: 1.0,
          y: 1.8,
          w: 11.3,
          h: 2.2,
          fontSize: 42,
          bold: true,
          color: titleColor,
          fontFace: fontTitle,
        });

        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: 1.0,
            y: 4.2,
            w: 10.5,
            h: 0.8,
            fontSize: 18,
            color: currentMutedColor,
            fontFace: fontBody,
          });
        }

        const ctaBtn = slide.ctaText || "Get In Touch  →";
        const btnW = Math.min(Math.max(ctaBtn.length * 0.11 + 0.8, 3.2), 6.5);
        pSlide.addShape(pptx.ShapeType.roundRect, {
          x: 1.0,
          y: 5.2,
          w: btnW,
          h: 0.65,
          fill: { color: isDarkTheme ? "FFDD3C" : "005AAB" },
          rectRadius: 0.05,
        });

        pSlide.addText(ctaBtn, {
          x: 1.0,
          y: 5.34,
          w: btnW,
          h: 0.4,
          fontSize: 14,
          bold: true,
          color: isDarkTheme ? "111827" : "FFFFFF",
          align: "center",
          fontFace: fontBody,
        });

        break;
      }

      case "bubbleCluster": {
        // Title
        pSlide.addText(slide.title, {
          x: PAD.LEFT,
          y: PAD.TITLE_Y,
          w: 4.5,
          h: PAD.TITLE_H,
          fontSize: 34,
          bold: true,
          color: titleColor,
          fontFace: fontTitle,
        });

        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: PAD.LEFT,
            y: PAD.SUB_Y,
            w: 4.5,
            h: PAD.SUB_H,
            fontSize: 16,
            color: currentMutedColor,
            fontFace: fontBody,
          });
        }

        const bubbles = slide.bubbleNodes || [
          { title: "Process A", percentage: 25, color: "yellow", description: "Discovery & Analysis" },
          { title: "Process B", percentage: 48, color: "black", description: "Architecture Refinement" },
          { title: "Process C", percentage: 75, color: "yellow", description: "System Deployment" },
        ];

        // Bubble 1: Process A (Yellow, smaller, top)
        pSlide.addShape(pptx.ShapeType.ellipse, {
          x: 4.8,
          y: PAD.CONTENT_Y,
          w: 1.4,
          h: 1.4,
          fill: { color: primaryHex },
          line: { color: "FFFFFF", width: 2 },
        });
        pSlide.addText("Process A", {
          x: 4.8,
          y: PAD.CONTENT_Y + 0.5,
          w: 1.4,
          h: 0.4,
          fontSize: 12,
          bold: true,
          color: primaryContrastColor,
          align: "center",
          fontFace: fontBody,
        });
        pSlide.addText("25%  " + (bubbles[0]?.description || ""), {
          x: 6.4,
          y: PAD.CONTENT_Y + 0.4,
          w: 4.5,
          h: 0.5,
          fontSize: 14.5,
          bold: true,
          color: currentTextColor,
          fontFace: fontTitle,
        });

        // Bubble 2: Process B (Black/Dark, medium, center)
        pSlide.addShape(pptx.ShapeType.ellipse, {
          x: 5.6,
          y: PAD.CONTENT_Y + 0.8,
          w: 1.8,
          h: 1.8,
          fill: { color: isDarkTheme ? "334155" : "111827" },
          line: { color: "FFFFFF", width: 2 },
        });
        pSlide.addText("Process B", {
          x: 5.6,
          y: PAD.CONTENT_Y + 1.5,
          w: 1.8,
          h: 0.4,
          fontSize: 13,
          bold: true,
          color: "FFFFFF",
          align: "center",
          fontFace: fontBody,
        });
        pSlide.addText("48%  " + (bubbles[1]?.description || ""), {
          x: 7.6,
          y: PAD.CONTENT_Y + 1.4,
          w: 4.5,
          h: 0.5,
          fontSize: 14.5,
          bold: true,
          color: currentTextColor,
          fontFace: fontTitle,
        });

        // Bubble 3: Process C (Yellow/Primary, large, bottom right)
        pSlide.addShape(pptx.ShapeType.ellipse, {
          x: 6.8,
          y: PAD.CONTENT_Y + 1.5,
          w: 2.4,
          h: 2.4,
          fill: { color: primaryHex },
          line: { color: "FFFFFF", width: 2 },
        });
        pSlide.addText("Process C", {
          x: 6.8,
          y: PAD.CONTENT_Y + 2.4,
          w: 2.4,
          h: 0.5,
          fontSize: 14,
          bold: true,
          color: primaryContrastColor,
          align: "center",
          fontFace: fontTitle,
        });
        pSlide.addText("75%  " + (bubbles[2]?.description || ""), {
          x: 3.8,
          y: PAD.CONTENT_Y + 3.0,
          w: 2.8,
          h: 0.6,
          fontSize: 14.5,
          bold: true,
          color: currentTextColor,
          align: "right",
          fontFace: fontTitle,
        });

        break;
      }

      case "imageSplitMetric": {
        // Left Column: Visual card + note card
        pSlide.addShape(pptx.ShapeType.roundRect, {
          x: PAD.LEFT,
          y: PAD.CONTENT_Y,
          w: 4.5,
          h: 2.7,
          fill: { color: isDarkTheme ? "1E293B" : "E5E7EB" },
          rectRadius: 0.08,
        });
        pSlide.addText("[ Executive Visual ]", {
          x: PAD.LEFT,
          y: PAD.CONTENT_Y + 1.1,
          w: 4.5,
          h: 0.5,
          fontSize: 14,
          color: isDarkTheme ? "94A3B8" : "64748B",
          align: "center",
          fontFace: fontBody,
        });

        pSlide.addShape(pptx.ShapeType.roundRect, {
          x: PAD.LEFT,
          y: PAD.CONTENT_Y + 2.9,
          w: 4.5,
          h: 1.1,
          fill: { color: primaryHex },
          rectRadius: 0.08,
        });
        pSlide.addText(slide.description || "Visualize Every Process Clearly With Structured Steps And Engaging", {
          x: PAD.LEFT + PAD.INNER,
          y: PAD.CONTENT_Y + 3.0,
          w: 4.5 - PAD.INNER * 2,
          h: 0.9,
          fontSize: 13.5,
          bold: true,
          color: primaryContrastColor,
          fontFace: fontBody,
        });

        // Right Column: Title + Highlight + Big Stat
        pSlide.addText(slide.title, {
          x: PAD.LEFT + 4.9,
          y: PAD.TITLE_Y,
          w: PAD.CONTENT_W - 4.9,
          h: PAD.TITLE_H + 0.4,
          fontSize: 34,
          bold: true,
          color: titleColor,
          fontFace: fontTitle,
        });

        if (slide.highlight) {
          pSlide.addShape(pptx.ShapeType.roundRect, {
            x: PAD.LEFT + 4.9,
            y: PAD.CONTENT_Y + 0.4,
            w: PAD.CONTENT_W - 4.9,
            h: 0.9,
            fill: { color: primaryHex },
            rectRadius: 0.06,
          });
          pSlide.addText(slide.highlight, {
            x: PAD.LEFT + 4.9 + PAD.INNER,
            y: PAD.CONTENT_Y + 0.5,
            w: PAD.CONTENT_W - 4.9 - PAD.INNER * 2,
            h: 0.7,
            fontSize: 13.5,
            color: primaryContrastColor,
            fontFace: fontBody,
          });
        }

        const statItem = slide.stats?.[0] || { value: "+62%", label: "Acceleration across strategic workflow units" };
        pSlide.addText(statItem.value, {
          x: 5.8,
          y: 4.3,
          w: 2.6,
          h: 1.2,
          fontSize: 52,
          bold: true,
          color: currentTextColor,
          fontFace: fontTitle,
        });
        pSlide.addText(statItem.label, {
          x: 8.5,
          y: 4.7,
          w: 3.8,
          h: 0.8,
          fontSize: 14,
          color: currentMutedColor,
          fontFace: fontBody,
        });

        break;
      }

      case "boldImpact": {
        pSlide.addText(slide.title, {
          x: PAD.LEFT,
          y: PAD.TITLE_Y,
          w: 7.5,
          h: PAD.TITLE_H,
          fontSize: 34,
          bold: true,
          color: titleColor,
          fontFace: fontTitle,
        });

        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: 8.5,
            y: PAD.TITLE_Y,
            w: PAD.CONTENT_W - 7.5,
            h: PAD.TITLE_H,
            fontSize: 16,
            color: currentMutedColor,
            align: "right",
            fontFace: fontBody,
          });
        }

        // Left Stat
        if (slide.highlight) {
          pSlide.addText(slide.highlight, {
            x: PAD.LEFT,
            y: PAD.CONTENT_Y + 0.3,
            w: 5.5,
            h: 0.4,
            fontSize: 14,
            bold: true,
            color: isDarkTheme ? "FFDD3C" : "005AAB",
            fontFace: fontBody,
          });
        }

        const impactStat = slide.stats?.[0] || { value: "+85%", label: "Compounding acceleration across key execution metrics" };
        pSlide.addText(impactStat.value, {
          x: PAD.LEFT,
          y: PAD.CONTENT_Y + 0.8,
          w: 5.5,
          h: 1.4,
          fontSize: 56,
          bold: true,
          color: hasTemplateBg ? (isDarkTheme ? "FFDD3C" : "005AAB") : primaryContrastColor,
          fontFace: fontTitle,
        });

        pSlide.addText(impactStat.label, {
          x: PAD.LEFT,
          y: PAD.CONTENT_Y + 2.3,
          w: 5.5,
          h: 0.6,
          fontSize: 15,
          color: currentTextColor,
          fontFace: fontBody,
        });

        // Right floating card
        pSlide.addShape(pptx.ShapeType.roundRect, {
          x: 7.2,
          y: PAD.CONTENT_Y + 0.4,
          w: 5.1,
          h: 2.6,
          fill: { color: isDarkTheme ? "1E293B" : "FFFFFF" },
          line: { color: isDarkTheme ? "334155" : "E5E7EB", width: 1 },
          rectRadius: 0.08,
        });

        pSlide.addShape(pptx.ShapeType.roundRect, {
          x: 7.6,
          y: PAD.CONTENT_Y + 0.7,
          w: 0.5,
          h: 0.5,
          fill: { color: primaryHex },
          rectRadius: 0.05,
        });

        pSlide.addText(slide.description || "Visualize Every Process Clearly With Structured Steps And Engaging", {
          x: 7.6,
          y: PAD.CONTENT_Y + 1.4,
          w: 4.3,
          h: 1.2,
          fontSize: 15,
          bold: true,
          color: isDarkTheme ? "FFFFFF" : "272525",
          fontFace: fontBody,
        });

        break;
      }

      case "asymmetricMatrix": {
        // Left Column: Asymmetric cards (62%, 78%, 83%)
        const matrixCards = slide.asymmetricCards || [
          { stat: "62%", text: "Project Phases With Modern Layouts" },
          { stat: "78%", text: "Connect Ideas, Actions And Results Through Process" },
          { stat: "83%", text: "Illustrate Workflows With Elegant Visual Systems" },
        ];

        // Card 1
        pSlide.addText(matrixCards[0]?.stat || "62%", {
          x: 1.0,
          y: 1.2,
          w: 2.4,
          h: 1.0,
          fontSize: 40,
          bold: true,
          color: currentTextColor,
          fontFace: fontTitle,
        });
        pSlide.addShape(pptx.ShapeType.roundRect, {
          x: 3.6,
          y: 1.2,
          w: 3.4,
          h: 1.1,
          fill: { color: primaryHex },
          rectRadius: 0.08,
        });
        pSlide.addText(matrixCards[0]?.text || "", {
          x: 3.8,
          y: 1.35,
          w: 3.0,
          h: 0.8,
          fontSize: 13.5,
          bold: true,
          color: primaryContrastColor,
          fontFace: fontBody,
        });

        // Card 2
        pSlide.addShape(pptx.ShapeType.roundRect, {
          x: 1.0,
          y: 2.7,
          w: 3.4,
          h: 1.1,
          fill: { color: primaryHex },
          rectRadius: 0.08,
        });
        pSlide.addText(matrixCards[1]?.text || "", {
          x: 1.2,
          y: 2.85,
          w: 3.0,
          h: 0.8,
          fontSize: 13.5,
          bold: true,
          color: primaryContrastColor,
          fontFace: fontBody,
        });
        pSlide.addText(matrixCards[1]?.stat || "78%", {
          x: 4.6,
          y: 2.7,
          w: 2.4,
          h: 1.0,
          fontSize: 40,
          bold: true,
          color: currentTextColor,
          fontFace: fontTitle,
        });

        // Card 3
        pSlide.addText(matrixCards[2]?.stat || "83%", {
          x: 1.0,
          y: 4.2,
          w: 2.4,
          h: 1.0,
          fontSize: 40,
          bold: true,
          color: currentTextColor,
          fontFace: fontTitle,
        });
        pSlide.addShape(pptx.ShapeType.roundRect, {
          x: 3.6,
          y: 4.2,
          w: 3.4,
          h: 1.1,
          fill: { color: primaryHex },
          rectRadius: 0.08,
        });
        pSlide.addText(matrixCards[2]?.text || "", {
          x: 3.8,
          y: 4.35,
          w: 3.0,
          h: 0.8,
          fontSize: 13.5,
          bold: true,
          color: primaryContrastColor,
          fontFace: fontBody,
        });

        // Right Column: Big Title + Subtitle
        pSlide.addText(slide.title, {
          x: 7.6,
          y: 2.4,
          w: 4.7,
          h: 2.0,
          fontSize: 34,
          bold: true,
          color: titleColor,
          fontFace: fontTitle,
        });

        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: 7.6,
            y: 4.4,
            w: 4.7,
            h: 1.0,
            fontSize: 16,
            color: currentMutedColor,
            fontFace: fontBody,
          });
        }

        break;
      }

      case "connectedRings": {
        // Left Column: Title + Subtitle + Big Stat
        pSlide.addText(slide.title, {
          x: PAD.LEFT,
          y: PAD.TITLE_Y,
          w: 4.8,
          h: PAD.TITLE_H,
          fontSize: 34,
          bold: true,
          color: titleColor,
          fontFace: fontTitle,
        });

        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: PAD.LEFT,
            y: PAD.SUB_Y,
            w: 4.8,
            h: PAD.SUB_H,
            fontSize: 16,
            color: currentMutedColor,
            fontFace: fontBody,
          });
        }

        const ringStat = slide.stats?.[0] || { value: "5729+", label: "Highlight Every Milestone Using Connected Readability" };
        pSlide.addText(ringStat.value, {
          x: PAD.LEFT,
          y: PAD.CONTENT_Y + 0.6,
          w: 4.8,
          h: 1.0,
          fontSize: 48,
          bold: true,
          color: isDarkTheme ? "FFDD3C" : "005AAB",
          fontFace: fontTitle,
        });
        pSlide.addText(ringStat.label, {
          x: PAD.LEFT,
          y: PAD.CONTENT_Y + 1.7,
          w: 4.8,
          h: 0.8,
          fontSize: 14,
          color: currentMutedColor,
          fontFace: fontBody,
        });

        // Right Column: 3 Connected Rings
        const rings = slide.connectedRings || [
          { percentage: 75, title: "Project Process 01", description: "Structured pipeline initiation" },
          { percentage: 95, title: "Project Process 02", description: "Rapid scaling & velocity verification" },
          { percentage: 35, title: "Project Process 03", description: "Long-term governance tracking" },
        ];

        // Vertical connecting line
        pSlide.addShape(pptx.ShapeType.line, {
          x: 6.8,
          y: PAD.CONTENT_Y + 0.3,
          w: 0,
          h: 3.5,
          line: { color: primaryHex, width: 3 },
        });

        rings.forEach((rg, rIdx) => {
          const ry = PAD.CONTENT_Y + rIdx * 1.35;

          // Ring Circle
          pSlide.addShape(pptx.ShapeType.ellipse, {
            x: 6.1,
            y: ry,
            w: 1.3,
            h: 1.3,
            fill: { color: isDarkTheme ? "1E293B" : "FFFFFF" },
            line: { color: primaryHex, width: 3.5 },
          });

          pSlide.addText(`${rg.percentage}%`, {
            x: 6.1,
            y: ry + 0.38,
            w: 1.3,
            h: 0.5,
            fontSize: 14,
            bold: true,
            color: isDarkTheme ? "FFFFFF" : darkHex,
            align: "center",
            fontFace: fontTitle,
          });

          // Horizontal pointer line
          pSlide.addShape(pptx.ShapeType.line, {
            x: 7.5,
            y: ry + 0.65,
            w: 0.5,
            h: 0,
            line: { color: primaryHex, width: 2 },
          });

          // Title & Description
          pSlide.addText(rg.title, {
            x: 8.2,
            y: ry + 0.15,
            w: 4.1,
            h: 0.4,
            fontSize: 17,
            bold: true,
            color: currentTextColor,
            fontFace: fontTitle,
          });

          pSlide.addText(rg.description, {
            x: 8.2,
            y: ry + 0.58,
            w: 4.1,
            h: 0.55,
            fontSize: 13.5,
            color: currentMutedColor,
            fontFace: fontBody,
          });
        });

        break;
      }

      case "cta": {
        if (!hasTemplateBg) {
          pSlide.background = { color: isDarkTheme ? darkHex : (isBoldYellow ? primaryHex : darkHex) };
        }

        pSlide.addText(slide.title, {
          x: PAD.LEFT,
          y: 1.8,
          w: PAD.CONTENT_W,
          h: 1.3,
          fontSize: 38,
          color: hasTemplateBg ? titleColor : (isBoldYellow ? primaryContrastColor : "FFFFFF"),
          bold: true,
          align: "center",
          fontFace: fontTitle,
        });

        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: PAD.LEFT,
            y: 3.2,
            w: PAD.CONTENT_W,
            h: 0.8,
            fontSize: 18,
            color: hasTemplateBg ? currentMutedColor : (isBoldYellow ? currentMutedColor : "CBD5E1"),
            align: "center",
            fontFace: fontBody,
          });
        }

        if (slide.ctaText) {
          const btnText = slide.ctaText;
          const btnW = Math.min(Math.max(btnText.length * 0.14 + 0.9, 3.8), 7.5);
          const btnX = PAD.LEFT + (PAD.CONTENT_W - btnW) / 2;
          pSlide.addShape(pptx.ShapeType.roundRect, {
            x: btnX,
            y: 4.4,
            w: btnW,
            h: 0.8,
            fill: { color: isDarkTheme ? "FFDD3C" : "005AAB" },
            rectRadius: 0.05,
          });

          pSlide.addText(btnText, {
            x: btnX,
            y: 4.55,
            w: btnW,
            h: 0.5,
            fontSize: 15,
            color: isDarkTheme ? "111827" : "FFFFFF",
            bold: true,
            align: "center",
            fontFace: fontBody,
          });
        }
        break;
      }

      case "breakSlide": {
        if (!hasTemplateBg) {
          pSlide.background = { color: primaryHex };
        }

        pSlide.addText(slide.title, {
          x: PAD.LEFT,
          y: 2.0,
          w: PAD.CONTENT_W,
          h: 1.3,
          fontSize: 42,
          color: hasTemplateBg ? titleColor : primaryContrastColor,
          bold: true,
          align: "center",
          fontFace: fontTitle,
        });

        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: PAD.LEFT,
            y: 3.5,
            w: PAD.CONTENT_W,
            h: 0.8,
            fontSize: 18,
            color: hasTemplateBg ? currentMutedColor : primaryContrastColor,
            align: "center",
            fontFace: fontBody,
          });
        }

        const resumeText = slide.ctaText || "We resume at [insert return time]";
        pSlide.addShape(pptx.ShapeType.roundRect, {
          x: 3.9,
          y: 4.8,
          w: 5.5,
          h: 0.75,
          fill: { color: isDarkTheme ? "1E293B" : "FFFFFF" },
          rectRadius: 0.35,
          line: { color: isDarkTheme ? "334155" : "005AAB", width: 1.5 },
        });

        pSlide.addText(resumeText, {
          x: 3.9,
          y: 4.92,
          w: 5.5,
          h: 0.5,
          fontSize: 15,
          color: isDarkTheme ? "FFDD3C" : "005AAB",
          bold: true,
          align: "center",
          fontFace: fontBody,
        });
        break;
      }

      case "actionList": {
        pSlide.addText(slide.title, {
          x: PAD.LEFT,
          y: PAD.TITLE_Y,
          w: PAD.CONTENT_W,
          h: PAD.TITLE_H,
          fontSize: 34,
          color: titleColor,
          bold: true,
          fontFace: fontTitle,
        });

        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: PAD.LEFT,
            y: PAD.SUB_Y,
            w: PAD.CONTENT_W,
            h: PAD.SUB_H,
            fontSize: 16,
            color: currentMutedColor,
            fontFace: fontBody,
          });
        }

        // Left accent line
        pSlide.addShape(pptx.ShapeType.rect, {
          x: PAD.LEFT,
          y: PAD.CONTENT_Y,
          w: 0.08,
          h: 4.2,
          fill: { color: primaryHex },
          line: { color: primaryHex },
        });

        const items = slide.actionItems && slide.actionItems.length > 0
          ? slide.actionItems
          : (slide.bullets || []).map((b, idx) => {
              const parts = b.split(/:\s*|\s*-\s*/);
              return { verb: parts[0], text: parts.slice(1).join(": ") || parts[0] };
            });

        const startY = PAD.CONTENT_Y + 0.1;
        const itemGap = Math.min(0.98, 4.0 / Math.max(1, items.length));

        items.forEach((item, aIdx) => {
          const rowY = startY + aIdx * itemGap;
          pSlide.addShape(pptx.ShapeType.roundRect, {
            x: PAD.LEFT + 0.35,
            y: rowY,
            w: PAD.CONTENT_W - 0.35,
            h: 0.82,
            fill: { color: isDarkTheme ? "1A1A1A" : "F9F9F9" },
            rectRadius: 0.08,
            line: { color: isDarkTheme ? "333333" : "E5E5E5", width: 1 },
          });

          const displayText = `${aIdx + 1}. ${item.verb ? item.verb.toUpperCase() + ": " : ""}${item.text}`;
          pSlide.addText(displayText, {
            x: PAD.LEFT + 0.55,
            y: rowY + 0.14,
            w: PAD.CONTENT_W - 0.75,
            h: 0.54,
            fontSize: 15,
            color: currentTextColor,
            fontFace: fontBody,
          });
        });
        break;
      }

      case "cardGrid": {
        pSlide.addText(slide.title, {
          x: PAD.LEFT,
          y: PAD.TITLE_Y,
          w: PAD.CONTENT_W,
          h: PAD.TITLE_H,
          fontSize: 34,
          color: titleColor,
          bold: true,
          fontFace: fontTitle,
        });

        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: PAD.LEFT,
            y: PAD.SUB_Y,
            w: PAD.CONTENT_W,
            h: PAD.SUB_H,
            fontSize: 16,
            color: currentMutedColor,
            fontFace: fontBody,
          });
        }

        const gridCards = slide.cards && slide.cards.length > 0 ? slide.cards : [
          { title: "Shareholder Loan", bullets: ["Interest is deductible", "WHT applies on every payment"], footer: "Hidden cost: cash bleed" },
          { title: "Equity Injection", bullets: ["No interest or WHT going in", "Trapped cash in future"], footer: "Hidden cost: dividends" },
          { title: "Service Fee", bullets: ["Arm's length required", "WHT & VAT applicable"], footer: "Hidden cost: TP documentation" },
        ];

        const cardW = (PAD.CONTENT_W - 2 * PAD.GAP_H) / 3;
        gridCards.slice(0, 3).forEach((card, cIdx) => {
          const cX = PAD.LEFT + cIdx * (cardW + PAD.GAP_H);
          const isEven = cIdx % 2 === 0;

          // Header strip
          pSlide.addShape(pptx.ShapeType.roundRect, {
            x: cX,
            y: PAD.CONTENT_Y,
            w: cardW,
            h: 0.65,
            fill: { color: isDarkTheme ? (isEven ? "FFDD3C" : "1E293B") : (isEven ? "FFDD3C" : "005AAB") },
            rectRadius: 0.05,
          });

          pSlide.addText(card.title, {
            x: cX + PAD.INNER,
            y: PAD.CONTENT_Y + 0.12,
            w: cardW - PAD.INNER * 2,
            h: 0.42,
            fontSize: 16,
            bold: true,
            color: isDarkTheme ? (isEven ? "111827" : "FFFFFF") : (isEven ? "111827" : "FFFFFF"),
            fontFace: fontTitle,
          });

          // Card body
          pSlide.addShape(pptx.ShapeType.roundRect, {
            x: cX,
            y: PAD.CONTENT_Y + 0.65,
            w: cardW,
            h: 3.15,
            fill: { color: isDarkTheme ? "181818" : (isEven ? "FFF9D6" : "EAF2FB") },
            rectRadius: 0.05,
            line: { color: isDarkTheme ? "333333" : (isEven ? "FFDD3C" : "005AAB"), width: 1.5 },
          });

          const bulletLines = card.bullets && card.bullets.length > 0 ? card.bullets.map(b => `• ${b}`).join("\n\n") : (card.description || "");
          pSlide.addText(bulletLines, {
            x: cX + PAD.INNER,
            y: PAD.CONTENT_Y + 0.85,
            w: cardW - PAD.INNER * 2,
            h: card.footer ? 2.0 : 2.8,
            fontSize: 14,
            color: currentTextColor,
            fontFace: fontBody,
            lineSpacingMultiple: 1.2,
          });

          if (card.footer) {
            pSlide.addShape(pptx.ShapeType.roundRect, {
              x: cX,
              y: PAD.CONTENT_Y + 2.95,
              w: cardW,
              h: 0.85,
              fill: { color: isDarkTheme ? "1E293B" : "FFF5CC" },
              rectRadius: 0.05,
              line: { color: isDarkTheme ? "334155" : "FFE588", width: 1 },
            });
            pSlide.addText(card.footer, {
              x: cX + PAD.INNER,
              y: PAD.CONTENT_Y + 3.05,
              w: cardW - PAD.INNER * 2,
              h: 0.65,
              fontSize: 13,
              bold: true,
              color: isDarkTheme ? "FFDD3C" : "854D0E",
              fontFace: fontBody,
            });
          }
        });
        break;
      }

      /* ──── SPLIT CASE COMPARISON (BEFORE VS AFTER ON SPLIT BACKGROUND) ──── */
      case "splitComparison": {
        // Left Panel on Blue Laptop Graphic (x: 0.6 in, y: 1.4 in)
        pSlide.addShape(pptx.ShapeType.roundRect, {
          x: 0.6,
          y: 1.35,
          w: 1.2,
          h: 0.08,
          fill: { color: secondaryHex },
          rectRadius: 0.04,
        });

        pSlide.addText(slide.title, {
          x: 0.6,
          y: 1.6,
          w: 3.8,
          h: 1.8,
          fontSize: 28,
          bold: true,
          color: "FFFFFF",
          fontFace: fontTitle,
        });

        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: 0.6,
            y: 3.45,
            w: 3.8,
            h: 0.9,
            fontSize: 15,
            bold: true,
            color: secondaryHex,
            fontFace: fontBody,
          });
        }

        // Right Panel on White Canvas (x: 5.0 in to 12.6 in)
        const bTitle = slide.beforeCard?.title || "BEFORE AI";
        const bText = slide.beforeCard?.bullets && slide.beforeCard.bullets.length > 0
          ? slide.beforeCard.bullets.join("\n\n")
          : slide.pairedRows && slide.pairedRows.length > 0
          ? slide.pairedRows.map((r) => r.left).join("\n\n")
          : slide.bullets && slide.bullets.length >= 2
          ? slide.bullets.slice(0, Math.ceil(slide.bullets.length / 2)).join("\n\n")
          : (slide.beforeCard?.description || "Rule-based dispatch and human coordination across hundreds of concurrent requests. Bottleneck: human bandwidth caps matching quality.");

        const aTitle = slide.afterCard?.title || "AFTER AI";
        const aText = slide.afterCard?.bullets && slide.afterCard.bullets.length > 0
          ? slide.afterCard.bullets.join("\n\n")
          : slide.pairedRows && slide.pairedRows.length > 0
          ? slide.pairedRows.map((r) => r.right).join("\n\n")
          : slide.bullets && slide.bullets.length >= 2
          ? slide.bullets.slice(Math.ceil(slide.bullets.length / 2)).join("\n\n")
          : (slide.afterCard?.description || "ML allocation optimises several objectives at once. Leaders set pricing logic, fairness guardrails and escalation rules.");

        // Card 1: BEFORE AI (Light Grey #F1F1F1)
        pSlide.addShape(pptx.ShapeType.roundRect, {
          x: 5.0,
          y: 1.25,
          w: 3.4,
          h: 3.65,
          fill: { color: "F1F1F1" },
          rectRadius: 0.08,
          line: { color: "E5E7EB", width: 1 },
        });

        pSlide.addText([
          {
            text: bTitle.toUpperCase() + "\n\n",
            options: {
              bold: true,
              fontSize: 12,
              color: "595959",
              fontFace: fontTitle,
            },
          },
          {
            text: bText,
            options: {
              bold: false,
              fontSize: 11,
              color: "272525",
              fontFace: fontBody,
              lineSpacingMultiple: 1.2,
            },
          },
        ], {
          x: 5.2,
          y: 1.4,
          w: 3.0,
          h: 3.35,
          valign: "top",
          margin: 0,
        });

        // Arrow in middle
        pSlide.addText("→", {
          x: 8.5,
          y: 2.7,
          w: 0.6,
          h: 0.5,
          fontSize: 24,
          bold: true,
          color: "005AAB",
          align: "center",
          fontFace: fontTitle,
        });

        // Card 2: AFTER AI (Solid Deep Blue #005AAB)
        pSlide.addShape(pptx.ShapeType.roundRect, {
          x: 9.15,
          y: 1.25,
          w: 3.5,
          h: 3.65,
          fill: { color: "005AAB" },
          rectRadius: 0.08,
        });

        // Top Yellow Accent Line on After Card
        pSlide.addShape(pptx.ShapeType.roundRect, {
          x: 9.35,
          y: 1.45,
          w: 0.8,
          h: 0.05,
          fill: { color: secondaryHex },
          rectRadius: 0.02,
        });

        pSlide.addText([
          {
            text: aTitle.toUpperCase() + "\n\n",
            options: {
              bold: true,
              fontSize: 12,
              color: secondaryHex,
              fontFace: fontTitle,
            },
          },
          {
            text: aText,
            options: {
              bold: false,
              fontSize: 11,
              color: "FFFFFF",
              fontFace: fontBody,
              lineSpacingMultiple: 1.2,
            },
          },
        ], {
          x: 9.35,
          y: 1.6,
          w: 3.1,
          h: 3.15,
          valign: "top",
          margin: 0,
        });

        // Bottom Insight Bar: Solid Deep Blue with Yellow Left Border
        const insText = slide.insightBarText || slide.highlight || "Key insight: AI didn't replace the leader. It changed what the leader decides.";
        pSlide.addShape(pptx.ShapeType.roundRect, {
          x: 5.0,
          y: 5.1,
          w: 7.65,
          h: 0.85,
          fill: { color: "005AAB" },
          rectRadius: 0.05,
        });

        pSlide.addShape(pptx.ShapeType.rect, {
          x: 5.0,
          y: 5.1,
          w: 0.12,
          h: 0.85,
          fill: { color: secondaryHex },
          line: { color: secondaryHex },
        });

        pSlide.addText(insText, {
          x: 5.25,
          y: 5.2,
          w: 7.25,
          h: 0.65,
          fontSize: 12.5,
          bold: true,
          color: "FFFFFF",
          fontFace: fontBody,
        });
        break;
      }

      /* ──── SPLIT PROFILE SLIDE ──── */
      case "splitProfile": {
        // Left Panel (x: 0.6 in)
        pSlide.addShape(pptx.ShapeType.roundRect, {
          x: 0.6,
          y: 1.35,
          w: 1.2,
          h: 0.08,
          fill: { color: secondaryHex },
          rectRadius: 0.04,
        });

        pSlide.addText(slide.title, {
          x: 0.6,
          y: 1.6,
          w: 3.8,
          h: 1.8,
          fontSize: 28,
          bold: true,
          color: "FFFFFF",
          fontFace: fontTitle,
        });

        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: 0.6,
            y: 3.45,
            w: 3.8,
            h: 0.9,
            fontSize: 15,
            bold: true,
            color: secondaryHex,
            fontFace: fontBody,
          });
        }

        // Right Panel (Photo Circle + Details)
        pSlide.addShape(pptx.ShapeType.ellipse, {
          x: 5.2,
          y: 2.2,
          w: 2.2,
          h: 2.2,
          fill: { color: "EAF2FB" },
          line: { color: "005AAB", width: 2.5 },
        });

        pSlide.addText("[Photo]", {
          x: 5.2,
          y: 3.1,
          w: 2.2,
          h: 0.4,
          align: "center",
          fontSize: 13,
          bold: true,
          color: "005AAB",
          fontFace: fontBody,
        });

        const pTag = slide.profileData?.tag || "SPEAKER PROFILE";
        pSlide.addText(pTag, {
          x: 7.8,
          y: 2.2,
          w: 4.8,
          h: 0.35,
          fontSize: 12,
          bold: true,
          color: "005AAB",
          fontFace: fontTitle,
        });

        const pRole = slide.profileData?.role || slide.description || "[Role and organization]";
        pSlide.addText(pRole, {
          x: 7.8,
          y: 2.65,
          w: 4.8,
          h: 0.6,
          fontSize: 17,
          bold: true,
          color: "272525",
          fontFace: fontTitle,
        });

        const pBio = slide.profileData?.bio || slide.bullets?.join(". ") || "[Short bio: expertise, research focus, industry experience]";
        pSlide.addText(pBio, {
          x: 7.8,
          y: 3.35,
          w: 4.8,
          h: 2.2,
          fontSize: 13,
          color: "595959",
          fontFace: fontBody,
          lineSpacingMultiple: 1.25,
        });
        break;
      }

      case "caseStudy":
      case "splitPoll":
      case "interactiveCase":
      case "keyInsight": {
        // Universal clean high-fidelity rendering for bespoke two-card & key-insight formats
        pSlide.addText(slide.title, {
          x: PAD.LEFT,
          y: PAD.TITLE_Y,
          w: PAD.CONTENT_W,
          h: PAD.TITLE_H,
          fontSize: 34,
          color: titleColor,
          bold: true,
          fontFace: fontTitle,
        });

        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: PAD.LEFT,
            y: PAD.SUB_Y,
            w: PAD.CONTENT_W,
            h: PAD.SUB_H,
            fontSize: 16,
            color: currentMutedColor,
            fontFace: fontBody,
          });
        }

        const cardsToDraw = slide.cards && slide.cards.length >= 2 ? slide.cards.slice(0, 2) : [
          { title: "Perspective 01", bullets: slide.bullets?.slice(0, 3) || ["Analysis item A", "Analysis item B"] },
          { title: "Perspective 02", bullets: slide.bullets?.slice(3, 6) || ["Counter-analysis item C", "Decision criteria D"] },
        ];

        const panelW = (PAD.CONTENT_W - PAD.GAP_H) / 2;
        const panelH = (slide.calloutBox || slide.quote) ? 3.5 : 4.0;
        cardsToDraw.forEach((cObj, pIdx) => {
          const pX = PAD.LEFT + pIdx * (panelW + PAD.GAP_H);
          const isEven = pIdx % 2 === 0;
          pSlide.addShape(pptx.ShapeType.roundRect, {
            x: pX,
            y: PAD.CONTENT_Y,
            w: panelW,
            h: panelH,
            fill: { color: isDarkTheme ? "1A1A1A" : (isEven ? "FFF9D6" : "EAF2FB") },
            rectRadius: 0.05,
            line: { color: isDarkTheme ? "333333" : (isEven ? "FFDD3C" : "005AAB"), width: 1.5 },
          });

          pSlide.addText(cObj.title, {
            x: pX + PAD.CARD_PAD,
            y: PAD.CONTENT_Y + 0.2,
            w: panelW - PAD.CARD_PAD * 2,
            h: 0.45,
            fontSize: 18,
            bold: true,
            color: isDarkTheme ? (isEven ? "FFDD3C" : "93C5FD") : "005AAB",
            fontFace: fontTitle,
          });

          const pBullets = cObj.bullets ? cObj.bullets.map(b => `• ${b}`).join("\n\n") : (cObj.description || "");
          pSlide.addText(pBullets, {
            x: pX + PAD.CARD_PAD,
            y: PAD.CONTENT_Y + 0.75,
            w: panelW - PAD.CARD_PAD * 2,
            h: panelH - 0.95,
            fontSize: 14.5,
            color: currentTextColor,
            fontFace: fontBody,
            lineSpacingMultiple: 1.25,
          });
        });

        // Bottom Callout or Banner
        if (slide.calloutBox || slide.quote) {
          const bText = slide.calloutBox ? `${slide.calloutBox.title || "Note"}: ${slide.calloutBox.text}` : `"${slide.quote?.text}"`;
          pSlide.addShape(pptx.ShapeType.roundRect, {
            x: PAD.LEFT,
            y: PAD.FOOTER_Y,
            w: PAD.CONTENT_W,
            h: PAD.FOOTER_H,
            fill: { color: isDarkTheme ? "1E293B" : "005AAB" },
            rectRadius: 0.05,
          });
          pSlide.addText(bText, {
            x: PAD.LEFT + PAD.CARD_PAD,
            y: PAD.FOOTER_Y + 0.1,
            w: PAD.CONTENT_W - PAD.CARD_PAD * 2,
            h: PAD.FOOTER_H - 0.2,
            fontSize: 13.5,
            color: "FFFFFF",
            bold: true,
            fontFace: fontBody,
          });
        }
        break;
      }

      /* ──── 1. SECTION DIVIDER ──── */
      case "sectionDivider": {
        // Yellow bottom stripe
        pSlide.addShape(pptx.ShapeType.rect, {
          x: 0,
          y: 7.35,
          w: 13.333,
          h: 0.15,
          fill: { color: secondaryHex },
          line: { color: secondaryHex },
        });

        // Yellow top bar accent
        pSlide.addShape(pptx.ShapeType.roundRect, {
          x: 1.0,
          y: 2.1,
          w: 1.6,
          h: 0.12,
          fill: { color: secondaryHex },
          rectRadius: 0.04,
        });

        // Part Tag
        const partTag = (slide.badge || slide.category || "BAGIAN").toUpperCase();
        pSlide.addText(partTag, {
          x: 1.0,
          y: 2.35,
          w: 11.0,
          h: 0.4,
          fontSize: 15,
          bold: true,
          color: secondaryHex,
          fontFace: fontBody,
        });

        // Section Title
        pSlide.addText(slide.title, {
          x: 1.0,
          y: 2.85,
          w: 11.2,
          h: 1.8,
          fontSize: 46,
          bold: true,
          color: "FFFFFF",
          fontFace: fontTitle,
        });

        // Section Subtitle
        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: 1.0,
            y: 4.8,
            w: 11.0,
            h: 0.9,
            fontSize: 20,
            color: "E5E7EB",
            fontFace: fontBody,
          });
        }
        break;
      }

      /* ──── 2. PAIRED ROWS (PROBLEM → SOLUTION) ──── */
      case "pairedRows": {
        pSlide.addText(slide.title, {
          x: PAD.LEFT,
          y: PAD.TITLE_Y,
          w: PAD.CONTENT_W,
          h: PAD.TITLE_H,
          fontSize: 34,
          color: titleColor,
          bold: true,
          fontFace: fontTitle,
        });

        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: PAD.LEFT,
            y: PAD.SUB_Y,
            w: PAD.CONTENT_W,
            h: PAD.SUB_H,
            fontSize: 16,
            color: currentMutedColor,
            fontFace: fontBody,
          });
        }

        const paired = slide.pairedRows && slide.pairedRows.length > 0
          ? slide.pairedRows
          : (slide.bullets && slide.bullets.length > 0
            ? slide.bullets.map((b) => {
                const parts = b.split(/\s*→\s*|\s*->\s*|\s*:\s*/i);
                return { left: parts[0] || b, right: parts[1] || "Solusi dan langkah pencegahan operasional" };
              })
            : [
                { left: "Perangkat tidak pernah diperbarui", right: "Aktifkan pembaruan otomatis berkala" },
                { left: "Akun mantan karyawan masih aktif", right: "Cabut hak akses saat peran berubah" },
                { left: "Backup tidak pernah diuji", right: "Jadwalkan uji pemulihan rutin berkala" },
              ]);

        const rowCount = Math.max(paired.length, 1);
        const colW = 5.2;
        const availableH = (slide.insightBarText ? PAD.FOOTER_Y : 6.5) - 2.2;
        const rowH = Math.min((availableH - (rowCount - 1) * 0.18) / rowCount, 1.05);

        // Headers (prominent, bold, 14pt)
        pSlide.addText("MASALAH", { x: PAD.LEFT, y: 1.8, w: colW, h: 0.35, fontSize: 14, bold: true, color: isDarkTheme ? "999999" : "475569", fontFace: fontTitle });
        pSlide.addText("PERBAIKAN", { x: 7.1, y: 1.8, w: colW, h: 0.35, fontSize: 14, bold: true, color: isDarkTheme ? "FFDD3C" : "005AAB", fontFace: fontTitle });

        paired.forEach((r, rIdx) => {
          const y = 2.2 + rIdx * (rowH + 0.18);

          // Left Box (Problem / Neutral Soft Wash)
          pSlide.addShape(pptx.ShapeType.roundRect, {
            x: PAD.LEFT,
            y,
            w: colW,
            h: rowH,
            fill: { color: isDarkTheme ? "1E293B" : "F1F5F9" },
            line: { color: isDarkTheme ? "334155" : "E2E8F0", width: 1.5 },
            rectRadius: 0.05,
          });
          pSlide.addText(r.left, {
            x: PAD.LEFT + PAD.INNER,
            y: y + 0.08,
            w: colW - PAD.INNER * 2,
            h: rowH - 0.16,
            fontSize: 16,
            color: isDarkTheme ? "FFFFFF" : "111827",
            fontFace: fontBody,
            valign: "middle",
            lineSpacingMultiple: 1.2,
          });

          // Arrow in center
          pSlide.addText("→", {
            x: 6.35,
            y: y + 0.08,
            w: 0.6,
            h: rowH - 0.16,
            fontSize: 26,
            color: isDarkTheme ? "FFDD3C" : "005AAB",
            align: "center",
            bold: true,
            fontFace: fontBody,
            valign: "middle",
          });

          // Right Box (Solution / Solid Deep Blue Primary)
          pSlide.addShape(pptx.ShapeType.roundRect, {
            x: 7.1,
            y,
            w: colW,
            h: rowH,
            fill: { color: "005AAB" },
            line: { color: "005AAB" },
            rectRadius: 0.05,
          });
          pSlide.addText(r.right, {
            x: 7.1 + PAD.INNER,
            y: y + 0.08,
            w: colW - PAD.INNER * 2,
            h: rowH - 0.16,
            fontSize: 16,
            color: "FFFFFF",
            bold: true,
            fontFace: fontBody,
            valign: "middle",
            lineSpacingMultiple: 1.2,
          });
        });

        // Bottom Insight Bar if exists
        if (slide.insightBarText) {
          pSlide.addShape(pptx.ShapeType.roundRect, {
            x: PAD.LEFT,
            y: PAD.FOOTER_Y,
            w: PAD.CONTENT_W,
            h: PAD.FOOTER_H,
            fill: { color: primaryHex },
            rectRadius: 0.08,
          });
          pSlide.addShape(pptx.ShapeType.rect, {
            x: PAD.LEFT,
            y: PAD.FOOTER_Y,
            w: 0.15,
            h: PAD.FOOTER_H,
            fill: { color: secondaryHex },
            line: { color: secondaryHex },
          });
          pSlide.addText(`Wawasan kunci: ${slide.insightBarText}`, {
            x: PAD.LEFT + PAD.CARD_PAD,
            y: PAD.FOOTER_Y + 0.08,
            w: PAD.CONTENT_W - PAD.CARD_PAD * 2,
            h: PAD.FOOTER_H - 0.16,
            fontSize: 13.5,
            color: primaryContrastColor,
            bold: true,
            fontFace: fontBody,
          });
        }
        break;
      }

      /* ──── 3. HORIZONTAL STACK CARDS ──── */
      case "horizontalStack": {
        pSlide.addText(slide.title, {
          x: PAD.LEFT,
          y: PAD.TITLE_Y,
          w: PAD.CONTENT_W,
          h: PAD.TITLE_H,
          fontSize: 34,
          color: titleColor,
          bold: true,
          fontFace: fontTitle,
        });

        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: PAD.LEFT,
            y: PAD.SUB_Y,
            w: PAD.CONTENT_W,
            h: PAD.SUB_H,
            fontSize: 16,
            color: currentMutedColor,
            fontFace: fontBody,
          });
        }

        const cards = slide.stackCards && slide.stackCards.length > 0
          ? slide.stackCards
          : (slide.bullets && slide.bullets.length > 0
            ? slide.bullets.map((b, idx) => {
                const colon = b.indexOf(":");
                return {
                  title: colon > 0 ? b.slice(0, colon).trim() : `Pilar 0${idx + 1}`,
                  tag: `PILLAR 0${idx + 1}`,
                  description: colon > 0 ? b.slice(colon + 1).trim() : b,
                };
              })
            : [
                { title: "Kerahasiaan", tag: "CONFIDENTIALITY", description: "Hanya orang berwenang yang dapat mengakses data sensitif organisasi." },
                { title: "Integritas", tag: "INTEGRITY", description: "Data tetap akurat, konsisten, dan tidak diubah tanpa izin sah." },
                { title: "Ketersediaan", tag: "AVAILABILITY", description: "Sistem dan data dapat diakses seketika saat dibutuhkan oleh bisnis." },
              ]);

        const cCount = Math.max(cards.length, 1);
        const hasNote = Boolean(slide.noteBoxText);
        const availH = hasNote ? 3.3 : 3.9;
        const cardH = Math.min((availH - (cCount - 1) * 0.18) / cCount, 1.25);

        cards.forEach((c, cIdx) => {
          // Exactly matching HorizontalStackCards in SlideDiagrams.tsx:
          // Even (0, 2) = Solid Golden Yellow (#FFDD3C) with dark text (#272525) & deep blue tag (#005AAB)
          // Odd (1) = Solid Deep Blue (#005AAB) with pure white text (#FFFFFF) & yellow tag (#FFDD3C)
          const isPrimary = cIdx % 2 === 1;
          const cardBg = isPrimary ? "005AAB" : "FFDD3C";
          const titleFg = isPrimary ? "FFFFFF" : "272525";
          const descFg = isPrimary ? "FFFFFF" : "272525";
          const tagFg = isPrimary ? "FFDD3C" : "005AAB";
          const y = PAD.CONTENT_Y + 0.1 + cIdx * (cardH + 0.18);

          // Card Solid Background Shape
          pSlide.addShape(pptx.ShapeType.roundRect, {
            x: PAD.LEFT,
            y,
            w: PAD.CONTENT_W,
            h: cardH,
            fill: { color: cardBg },
            line: { color: cardBg },
            rectRadius: 0.05,
          });

          // Left Title (Extrabold)
          pSlide.addText(c.title, {
            x: PAD.LEFT + 0.4,
            y: y + 0.15,
            w: 3.5,
            h: 0.42,
            fontSize: 18.5,
            bold: true,
            color: titleFg,
            fontFace: fontTitle,
            valign: "middle",
          });

          // Left Tag (Uppercase tracking-wider)
          if (c.tag) {
            pSlide.addText(c.tag.toUpperCase(), {
              x: PAD.LEFT + 0.4,
              y: y + 0.58,
              w: 3.5,
              h: 0.28,
              fontSize: 12,
              bold: true,
              color: tagFg,
              fontFace: fontBody,
              valign: "middle",
            });
          }

          // Right Description (Legible with white or dark text matching the card background!)
          pSlide.addText(c.description, {
            x: PAD.LEFT + 4.1,
            y: y + 0.12,
            w: PAD.CONTENT_W - 4.4,
            h: cardH - 0.24,
            fontSize: 15.5,
            color: descFg,
            fontFace: fontBody,
            valign: "middle",
            lineSpacingMultiple: 1.25,
          });
        });

        // NoteBox at bottom if present
        if (slide.noteBoxText) {
          const noteY = PAD.CONTENT_Y + availH + 0.25;
          pSlide.addShape(pptx.ShapeType.roundRect, {
            x: PAD.LEFT,
            y: noteY,
            w: PAD.CONTENT_W,
            h: 0.6,
            fill: { color: "FFEC8E" },
            line: { color: "FFEC8E" },
            rectRadius: 0.04,
          });

          pSlide.addText([
            { text: "Catatan: ", options: { bold: true, fontSize: 13.5, color: "272525" } },
            { text: slide.noteBoxText, options: { bold: false, fontSize: 13.5, color: "272525" } },
          ], {
            x: PAD.LEFT + 0.3,
            y: noteY + 0.1,
            w: PAD.CONTENT_W - 0.6,
            h: 0.42,
            fontFace: fontBody,
            valign: "middle",
          });
        }
        break;
      }

      /* ──── 4. CONNECTED RAIL STEPPER ──── */
      case "connectedRailStepper": {
        pSlide.addText(slide.title, {
          x: PAD.LEFT,
          y: PAD.TITLE_Y,
          w: PAD.CONTENT_W,
          h: PAD.TITLE_H,
          fontSize: 34,
          color: titleColor,
          bold: true,
          fontFace: fontTitle,
        });

        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: PAD.LEFT,
            y: PAD.SUB_Y,
            w: PAD.CONTENT_W,
            h: PAD.SUB_H,
            fontSize: 16,
            color: currentMutedColor,
            fontFace: fontBody,
          });
        }

        const railSteps = slide.railSteps && slide.railSteps.length > 0
          ? slide.railSteps
          : (slide.processSteps && slide.processSteps.length > 0
            ? slide.processSteps.map((s, idx) => ({ stepNumber: idx + 1, title: s.title, description: s.description }))
            : [
                { stepNumber: 1, title: "Deteksi", description: "Kenali sinyal awal serangan sejak dini." },
                { stepNumber: 2, title: "Isolasi", description: "Batasi penyebaran dan putus jalur koneksi." },
                { stepNumber: 3, title: "Investigasi", description: "Cari akar penyebab dan analisa dampak sistem." },
                { stepNumber: 4, title: "Pulihkan", description: "Kembalikan layanan dari cadangan aman." },
                { stepNumber: 5, title: "Evaluasi", description: "Perbaiki proses dan komunikasikan ke pihak terkait." },
              ]);

        const sCount = railSteps.length;
        const totalW = PAD.CONTENT_W;
        const nodeW = 0.85;
        const stepSpanW = totalW / sCount;
        const railY = PAD.CONTENT_Y + 0.65;

        // Continuous horizontal rail track
        pSlide.addShape(pptx.ShapeType.rect, {
          x: PAD.LEFT + stepSpanW / 2,
          y: railY,
          w: totalW - stepSpanW,
          h: 0.06,
          fill: { color: "005AAB" },
          line: { color: "005AAB" },
        });

        railSteps.forEach((s, sIdx) => {
          const isYellow = sIdx % 2 === 0;
          const circleBg = isYellow ? "FFDE3C" : "005AAB";
          const circleFg = isYellow ? "111111" : "FFFFFF";
          const centerX = PAD.LEFT + sIdx * stepSpanW + (stepSpanW - nodeW) / 2;

          // Circle node
          pSlide.addShape(pptx.ShapeType.ellipse, {
            x: centerX,
            y: railY - nodeW / 2,
            w: nodeW,
            h: nodeW,
            fill: { color: circleBg },
            line: { color: "005AAB", width: 2 },
          });

          pSlide.addText(String(s.stepNumber || sIdx + 1), {
            x: centerX,
            y: railY - nodeW / 2 + 0.12,
            w: nodeW,
            h: nodeW - 0.24,
            fontSize: 18,
            bold: true,
            color: circleFg,
            align: "center",
            fontFace: fontTitle,
          });

          // Unified Title + Description in ONE single text box placed cleanly below the circle
          const textTopY = railY + nodeW / 2 + 0.2;
          const textH = PAD.FOOTER_Y - textTopY - 0.2;

          pSlide.addText([
            {
              text: s.title + "\n\n",
              options: {
                bold: true,
                fontSize: 12.5,
                color: "005AAB",
                fontFace: fontTitle,
                align: "center" as const,
                lineSpacingMultiple: 1.15,
              },
            },
            ...(s.description && s.description !== s.title
              ? [
                  {
                    text: s.description,
                    options: {
                      bold: false,
                      fontSize: 10,
                      color: "272525",
                      fontFace: fontBody,
                      align: "center" as const,
                      lineSpacingMultiple: 1.2,
                    },
                  },
                ]
              : []),
          ], {
            x: PAD.LEFT + sIdx * stepSpanW + 0.1,
            y: textTopY,
            w: stepSpanW - 0.2,
            h: textH,
            valign: "top" as const,
            align: "center" as const,
            margin: 0,
          });
        });

        // Bottom Insight Bar — pinned at PAD.FOOTER_Y
        if (slide.insightBarText || slide.description) {
          pSlide.addShape(pptx.ShapeType.roundRect, {
            x: PAD.LEFT,
            y: PAD.FOOTER_Y,
            w: PAD.CONTENT_W,
            h: PAD.FOOTER_H,
            fill: { color: "005AAB" },
            rectRadius: 0.05,
          });
          pSlide.addShape(pptx.ShapeType.rect, {
            x: PAD.LEFT,
            y: PAD.FOOTER_Y,
            w: 0.15,
            h: PAD.FOOTER_H,
            fill: { color: "FFDE3C" },
            line: { color: "FFDE3C" },
          });
          pSlide.addText(`Wawasan kunci: ${slide.insightBarText || slide.description}`, {
            x: PAD.LEFT + PAD.CARD_PAD,
            y: PAD.FOOTER_Y + 0.1,
            w: PAD.CONTENT_W - PAD.CARD_PAD * 2,
            h: PAD.FOOTER_H - 0.2,
            fontSize: 13.5,
            color: "FFFFFF",
            bold: true,
            fontFace: fontBody,
          });
        }
        break;
      }

      /* ──── 5. ASCENDING COLUMNS ──── */
      case "ascendingColumns": {
        pSlide.addText(slide.title, {
          x: PAD.LEFT,
          y: PAD.TITLE_Y,
          w: PAD.CONTENT_W,
          h: PAD.TITLE_H,
          fontSize: 34,
          color: titleColor,
          bold: true,
          fontFace: fontTitle,
        });

        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: PAD.LEFT,
            y: PAD.SUB_Y,
            w: PAD.CONTENT_W,
            h: PAD.SUB_H,
            fontSize: 16,
            color: currentMutedColor,
            fontFace: fontBody,
          });
        }

        const levels = slide.ascendingLevels && slide.ascendingLevels.length > 0
          ? slide.ascendingLevels
          : [
              { tag: "LEVEL 1", title: "Dasar", description: "Reaktif: bertindak setelah insiden terjadi." },
              { tag: "LEVEL 2", title: "Terkelola", description: "Kebijakan dan kontrol operasional dasar berjalan." },
              { tag: "LEVEL 3", title: "Terukur", description: "Risiko dipantau dengan metrik dan indikator berkala." },
              { tag: "LEVEL 4", title: "Adaptif", description: "Belajar dari insiden dan terus menyesuaikan sistem secara proaktif." },
            ];

        const lCount = Math.max(levels.length, 1);
        const totalW = PAD.CONTENT_W;
        const gap = 0.35;
        const colW = (totalW - (lCount - 1) * gap) / lCount;
        const baseH = 1.8;
        const stepH = 1.8 / (lCount - 1 || 1);

        levels.forEach((lvl, lIdx) => {
          const colH = baseH + lIdx * stepH;
          const x = PAD.LEFT + lIdx * (colW + gap);
          const y = 6.2 - colH;
          const isHighest = lIdx === lCount - 1;
          const isLowest = lIdx === 0;
          const colBg = isLowest ? "FFDD3C" : isHighest ? "005AAB" : (lIdx === 1 ? "EAF2FB" : "D6E4F5");
          const colFg = isHighest ? "FFFFFF" : (isLowest ? "111111" : "005AAB");
          const tagFg = isLowest ? "854D0E" : isHighest ? "FFDD3C" : "005AAB";

          pSlide.addShape(pptx.ShapeType.roundRect, {
            x,
            y,
            w: colW,
            h: colH,
            fill: { color: colBg },
            rectRadius: 0.05,
          });

          // Tag
          pSlide.addText(lvl.tag || `LEVEL ${lIdx + 1}`, {
            x: x + PAD.INNER,
            y: y + 0.15,
            w: colW - PAD.INNER * 2,
            h: 0.32,
            fontSize: 12,
            bold: true,
            color: tagFg,
            fontFace: fontBody,
          });

          // Title
          pSlide.addText(lvl.title, {
            x: x + PAD.INNER,
            y: y + 0.48,
            w: colW - PAD.INNER * 2,
            h: 0.5,
            fontSize: 18,
            bold: true,
            color: colFg,
            fontFace: fontTitle,
          });

          // Description
          if (lvl.description) {
            pSlide.addText(lvl.description, {
              x: x + PAD.INNER,
              y: y + 1.0,
              w: colW - PAD.INNER * 2,
              h: Math.max(colH - 1.15, 0.5),
              fontSize: 13.5,
              color: isHighest ? "E5E7EB" : (isLowest ? "272525" : "334155"),
              fontFace: fontBody,
              lineSpacingMultiple: 1.2,
            });
          }
        });
        break;
      }

      /* ──── 6. EXECUTIVE CHECKLIST ──── */
      case "checklist": {
        const checkItems = slide.checklistItems && slide.checklistItems.length > 0
          ? slide.checklistItems
          : (slide.bullets && slide.bullets.length > 0
            ? slide.bullets
            : [
                "MFA aktif pada email dan seluruh dokumen kerja penting",
                "Backup sistem diuji pemulihannya secara berkala",
                "Perangkat dan aplikasi selalu diperbarui otomatis",
                "Hak akses dan otorisasi ditinjau secara berkala",
                "Aturan penggunaan AI dan batasan data telah disepakati",
                "Seluruh tim memahami rencana respons insiden darurat",
              ]);

        pSlide.addText(slide.title, {
          x: PAD.LEFT,
          y: PAD.TITLE_Y,
          w: PAD.CONTENT_W - 2.5,
          h: PAD.TITLE_H,
          fontSize: 34,
          color: titleColor,
          bold: true,
          fontFace: fontTitle,
        });

        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: PAD.LEFT,
            y: PAD.SUB_Y,
            w: PAD.CONTENT_W - 2.5,
            h: PAD.SUB_H,
            fontSize: 16,
            color: currentMutedColor,
            fontFace: fontBody,
          });
        }

        // Pill badge right
        pSlide.addShape(pptx.ShapeType.roundRect, {
          x: 10.33,
          y: PAD.TITLE_Y + 0.1,
          w: 2.0,
          h: 0.45,
          fill: { color: secondaryHex },
          rectRadius: 0.2,
        });
        pSlide.addText(`${checkItems.length} BUTIR`, {
          x: 10.33,
          y: PAD.TITLE_Y + 0.12,
          w: 2.0,
          h: 0.35,
          fontSize: 12,
          bold: true,
          color: "272525",
          align: "center",
          fontFace: fontBody,
        });

        // 2 Columns of Checkboxes
        const half = Math.ceil(checkItems.length / 2);
        const col1 = checkItems.slice(0, half);
        const col2 = checkItems.slice(half);

        const renderCol = (items: string[], colX: number) => {
          items.forEach((item, i) => {
            const y = PAD.CONTENT_Y + i * 1.15;

            // Checkbox square
            pSlide.addShape(pptx.ShapeType.roundRect, {
              x: colX,
              y: y + 0.05,
              w: 0.4,
              h: 0.4,
              fill: { color: "FFFFFF" },
              line: { color: primaryHex, width: 2 },
              rectRadius: 0.05,
            });

            // Checkmark symbol
            pSlide.addText("✓", {
              x: colX,
              y: y + 0.06,
              w: 0.4,
              h: 0.35,
              fontSize: 14,
              bold: true,
              color: primaryHex,
              align: "center",
              fontFace: fontBody,
            });

            // Text
            pSlide.addText(item, {
              x: colX + 0.55,
              y,
              w: 4.75,
              h: 0.85,
              fontSize: 14.5,
              color: isDarkTheme ? "FFFFFF" : "272525",
              fontFace: fontBody,
              lineSpacingMultiple: 1.2,
            });

            // Dividing line under row
            pSlide.addShape(pptx.ShapeType.line, {
              x: colX,
              y: y + 0.95,
              w: 5.3,
              h: 0,
              line: { color: "E5E7EB", width: 1 },
            });
          });
        };

        renderCol(col1, PAD.LEFT);
        renderCol(col2, PAD.LEFT + 5.8);
        break;
      }

      /* ──── 7. CLOSING ACTION SLIDE ──── */
      case "closingAction": {
        // Top 75% primary panel
        pSlide.addShape(pptx.ShapeType.rect, {
          x: 0,
          y: 0,
          w: 13.333,
          h: 5.6,
          fill: { color: primaryHex },
          line: { color: primaryHex },
        });

        // Dividing accent line
        pSlide.addShape(pptx.ShapeType.rect, {
          x: 0,
          y: 5.6,
          w: 13.333,
          h: 0.12,
          fill: { color: secondaryHex },
          line: { color: secondaryHex },
        });

        // Yellow Pill Tag
        pSlide.addShape(pptx.ShapeType.roundRect, {
          x: 1.0,
          y: 0.85,
          w: 3.0,
          h: 0.48,
          fill: { color: secondaryHex },
          rectRadius: 0.24,
        });
        pSlide.addText(slide.badge || "LANGKAH BERIKUTNYA", {
          x: 1.0,
          y: 0.9,
          w: 3.0,
          h: 0.38,
          fontSize: 12,
          bold: true,
          color: "272525",
          align: "center",
          fontFace: fontBody,
        });

        // Title
        pSlide.addText(slide.title, {
          x: 1.0,
          y: 1.45,
          w: 11.0,
          h: 1.0,
          fontSize: 40,
          bold: true,
          color: "FFFFFF",
          fontFace: fontTitle,
        });

        // Subtitle
        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: 1.0,
            y: 2.45,
            w: 11.0,
            h: 0.55,
            fontSize: 18,
            color: "E5E7EB",
            fontFace: fontBody,
          });
        }

        // Actions List
        const actions = slide.bullets && slide.bullets.length > 0
          ? slide.bullets
          : [
              "Aktifkan MFA pada akun email dan dokumen kerja Anda",
              "Tanyakan ke tim: kapan terakhir backup diuji pulih?",
              "Sepakati data apa yang boleh masuk ke tool AI publik",
            ];

        actions.slice(0, 4).forEach((act, aIdx) => {
          const y = 3.1 + aIdx * 0.62;
          pSlide.addText(
            [
              { text: `${aIdx + 1}.  `, options: { bold: true, fontSize: 16, color: secondaryHex } },
              { text: act, options: { fontSize: 15, color: "FFFFFF" } },
            ],
            {
              x: 1.0,
              y,
              w: 10.5,
              h: 0.55,
              fontFace: fontBody,
              lineSpacingMultiple: 1.2,
            }
          );
        });

        // Bottom Contact Strip in White Area (only if clean public contact, never facilitator scripts or bracketed placeholders)
        const exportContact = slide.contactFooterText;
        const isCleanContact =
          exportContact &&
          !exportContact.includes("[") &&
          !exportContact.includes("]") &&
          !/facilitator|narasumber|pembicara/i.test(exportContact);

        if (isCleanContact) {
          pSlide.addText(exportContact, {
            x: 1.0,
            y: 6.2,
            w: 11.0,
            h: 0.6,
            fontSize: 13.5,
            color: "272525",
            fontFace: fontBody,
          });
        }
        break;
      }
    }
  });

  const fileName = `${(options.deckTitle || "Presentation").replace(/[^a-zA-Z0-9_-]/g, "_")}.pptx`;

  // Post-process OOXML package via JSZip to ensure Speaker Notes are 100% Red Hat Display in PPTX & Google Slides
  try {
    const rawData = (await pptx.write({ outputType: "blob" })) as Blob;
    const zip = await JSZip.loadAsync(rawData);

    // Patch all notes slides to explicitly declare Red Hat Display typeface
    const noteSlideKeys = Object.keys(zip.files).filter(
      (k) => k.startsWith("ppt/notesSlides/notesSlide") && k.endsWith(".xml")
    );
    for (const key of noteSlideKeys) {
      let xml = await zip.files[key].async("text");
      xml = xml.replace(
        /<a:rPr([^>]*)\/>/g,
        '<a:rPr$1><a:latin typeface="Red Hat Display"/><a:cs typeface="Red Hat Display"/></a:rPr>'
      );
      xml = xml.replace(
        /<a:endParaRPr([^>]*)\/>/g,
        '<a:endParaRPr$1><a:latin typeface="Red Hat Display"/><a:cs typeface="Red Hat Display"/></a:endParaRPr>'
      );
      zip.file(key, xml);
    }

    // Patch notes master if present
    if (zip.files["ppt/notesMasters/notesMaster1.xml"]) {
      let masterXml = await zip.files["ppt/notesMasters/notesMaster1.xml"].async("text");
      masterXml = masterXml.replace(/<a:latin typeface="Calibri"\/>/g, '<a:latin typeface="Red Hat Display"/>');
      masterXml = masterXml.replace(/<a:cs typeface="Calibri"\/>/g, '<a:cs typeface="Red Hat Display"/>');
      zip.file("ppt/notesMasters/notesMaster1.xml", masterXml);
    }

    const modifiedBlob = await zip.generateAsync({
      type: "blob",
      mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    });

    if (typeof window !== "undefined") {
      const url = window.URL.createObjectURL(modifiedBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }
  } catch (err) {
    console.warn("Post-processing notes font failed, falling back to standard writeFile:", err);
    await pptx.writeFile({ fileName });
  }
}
