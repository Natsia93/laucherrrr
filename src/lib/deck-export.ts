import pptxgen from "pptxgenjs";

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
    | "keyInsight";
  bgStyle?: "white" | "yellowGradient" | "boldYellow";
  title: string;
  subtitle?: string;
  description?: string;
  badge?: string;
  category?: string;
  stats?: Array<{ value: string; label: string }>;
  processSteps?: Array<{ title: string; description: string }>;
  bullets?: string[];
  highlight?: string;
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
  speakerNotes?: string;
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

export async function exportDeckToPptx(slides: SlideData[], options: ExportOptions) {
  const pptx = new pptxgen();

  // 16:9 Widescreen Presentation
  pptx.layout = "LAYOUT_16x9";
  pptx.author = "Launcher OS";
  pptx.company = "Launcher OS AI";
  pptx.title = options.deckTitle || "Presentation Deck";

  const isDarkTheme = options.bgStyle === "dark";
  const primaryHex = options.palette.primary.replace("#", "") || "FFDE3C";
  const darkHex = options.palette.dark?.replace("#", "") || "121212";
  const lightHex = options.bgStyle === "warm" ? "FDFBF7" : "FFFFFF";
  const bgHex = isDarkTheme ? darkHex : lightHex;
  const textColor = isDarkTheme ? "FFFFFF" : "171717";
  const textMuted = isDarkTheme ? "999999" : "666666";

  const getPptxTitleFont = (tf?: TitleFont | string) => {
    switch (tf) {
      case "red-hat":
      case "red-hat-display": return "Red Hat Display";
      case "bricolage": return "Bricolage Grotesque";
      case "jakarta": return "Plus Jakarta Sans";
      case "outfit": return "Outfit";
      case "lora": return "Lora";
      case "inter": return "Inter";
      case "sf-pro":
      default: return options.fontPairing === "creative" ? "Century Gothic" : "SF Pro Display";
    }
  };

  const getPptxBodyFont = (bf?: BodyFont | string) => {
    switch (bf) {
      case "red-hat":
      case "red-hat-display": return "Red Hat Display";
      case "inter": return "Inter";
      case "jakarta": return "Plus Jakarta Sans";
      case "outfit": return "Outfit";
      case "sf-pro":
      default: return options.fontPairing === "creative" ? "Segoe UI" : "SF Pro Display";
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

  slides.forEach((slide, idx) => {
    const pSlide = pptx.addSlide();

    // Export Speaker Notes into PowerPoint Presenter View
    if (slide.speakerNotes || slide.description) {
      pSlide.addNotes(slide.speakerNotes || slide.description || "");
    }

    // Background matching selected theme or slide override
    const isBoldYellow = !isDualTone && slide.bgStyle === "boldYellow";
    const isYellowGrad = !isDualTone && slide.bgStyle === "yellowGradient";
    const secondaryHex = options.palette.secondary?.replace("#", "") || "FFFDF0";
    const slideBg = isBoldYellow ? primaryHex : isYellowGrad ? secondaryHex : bgHex;
    pSlide.background = { color: slideBg };
    const currentTextColor = isBoldYellow ? (options.palette.accent?.replace("#", "") || "111111") : textColor;
    const currentMutedColor = isBoldYellow ? "444444" : textMuted;
    const footerColor = isBoldYellow ? "555555" : "999999";

    // If Dual-Tone, draw split color block on the left
    if (isDualTone) {
      pSlide.addShape(pptx.ShapeType.rect, {
        x: 0,
        y: 0,
        w: 4.6,
        h: 7.5,
        fill: { color: primaryHex },
        line: { color: primaryHex },
      });
    }

    // Top Brand & Category Tag (if not title or hero)
    if (slide.layout !== "title" && slide.layout !== "hero" && (slide.badge || slide.category)) {
      const headerText = slide.badge ? `${slide.badge}${slide.category ? `  •  ${slide.category}` : ""}` : (slide.category || "");
      pSlide.addText(headerText, {
        x: isDualTone ? 0.6 : 1.0,
        y: 0.45,
        w: isDualTone ? 3.6 : 9.0,
        h: 0.3,
        fontSize: 9,
        bold: true,
        color: isDualTone ? primaryContrastColor : (isBoldYellow ? "333333" : "888888"),
        fontFace: fontBody,
      });
    }

    // Bottom footer branding
    pSlide.addText(slide.footer || "company.com", {
      x: isDualTone ? 5.2 : 1.0,
      y: 6.9,
      w: 4.0,
      h: 0.3,
      fontSize: 9,
      color: footerColor,
      fontFace: fontBody,
    });

    // Slide Number badge
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

    switch (slide.layout) {
      case "title":
      case "hero": {
        // Top Brand & Category Tag
        if (slide.highlight || slide.badge || slide.category) {
          const badgeText = (slide.highlight || slide.category || slide.badge || "PRESENTATION").toUpperCase();
          pSlide.addShape(pptx.ShapeType.roundRect, {
            x: 1.0,
            y: 1.5,
            w: Math.min(badgeText.length * 0.12 + 0.5, 3.5),
            h: 0.35,
            fill: { color: primaryHex },
            rectRadius: 0.05,
          });
          pSlide.addText(badgeText, {
            x: 1.0,
            y: 1.52,
            w: Math.min(badgeText.length * 0.12 + 0.5, 3.5),
            h: 0.35,
            fontSize: 9,
            bold: true,
            color: "000000",
            align: "center",
            fontFace: fontBody,
          });
        }

        // Title
        pSlide.addText(slide.title, {
          x: 1.0,
          y: 2.1,
          w: 11.0,
          h: 2.0,
          fontSize: 32,
          color: textColor,
          bold: true,
          fontFace: fontTitle,
        });

        // Subtitle
        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: 1.0,
            y: 4.2,
            w: 10.0,
            h: 0.6,
            fontSize: 15,
            color: textMuted,
            fontFace: fontBody,
          });
        }

        // Description
        if (slide.description) {
          pSlide.addText(slide.description, {
            x: 1.0,
            y: 4.9,
            w: 10.5,
            h: 1.5,
            fontSize: 12,
            color: textMuted,
            fontFace: fontBody,
          });
        }
        break;
      }

      case "stats": {
        // Header
        pSlide.addText(slide.title, {
          x: 1.0,
          y: 0.8,
          w: 11.0,
          h: 0.8,
          fontSize: 24,
          color: darkHex,
          bold: true,
          fontFace,
        });

        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: 1.0,
            y: 1.6,
            w: 11.0,
            h: 0.5,
            fontSize: 13,
            color: "666666",
            fontFace,
          });
        }

        // 4 Stat Cards
        const stats = slide.stats || [];
        stats.forEach((st, sIdx) => {
          const col = sIdx % 2;
          const row = Math.floor(sIdx / 2);
          const x = 1.0 + col * 5.7;
          const y = 2.6 + row * 2.0;

          // Card Box
          pSlide.addShape(pptx.ShapeType.roundRect, {
            x,
            y,
            w: 5.3,
            h: 1.7,
            fill: { color: "FFFFFF" },
            line: { color: "E5E5E5", width: 1 },
            rectRadius: 0.1,
          });

          // Stat Value
          pSlide.addText(st.value, {
            x: x + 0.3,
            y: y + 0.2,
            w: 4.7,
            h: 0.7,
            fontSize: 28,
            color: primaryHex === "FFDE3C" ? "D97706" : primaryHex,
            bold: true,
            fontFace,
          });

          // Stat Label
          pSlide.addText(st.label, {
            x: x + 0.3,
            y: y + 0.9,
            w: 4.7,
            h: 0.6,
            fontSize: 12,
            color: "555555",
            fontFace,
          });
        });
        break;
      }

      case "twoColumn": {
        pSlide.addText(slide.title, {
          x: 1.0,
          y: 0.8,
          w: 11.0,
          h: 0.8,
          fontSize: 24,
          color: darkHex,
          bold: true,
          fontFace,
        });

        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: 1.0,
            y: 1.6,
            w: 11.0,
            h: 0.5,
            fontSize: 13,
            color: "666666",
            fontFace,
          });
        }

        // Left Column (Description)
        pSlide.addShape(pptx.ShapeType.roundRect, {
          x: 1.0,
          y: 2.4,
          w: 5.3,
          h: 4.0,
          fill: { color: "FFFFFF" },
          line: { color: "E5E5E5", width: 1 },
          rectRadius: 0.1,
        });

        pSlide.addText(slide.description || "Key contextual insights and strategic execution overview.", {
          x: 1.3,
          y: 2.7,
          w: 4.7,
          h: 3.4,
          fontSize: 14,
          color: "444444",
          lineSpacing: 22,
          fontFace,
        });

        // Right Column (Stats/Comparison)
        const rStats = slide.stats || [];
        rStats.forEach((st, sIdx) => {
          const y = 2.4 + sIdx * 2.1;
          pSlide.addShape(pptx.ShapeType.roundRect, {
            x: 6.7,
            y,
            w: 5.6,
            h: 1.9,
            fill: { color: sIdx === 0 ? "F3F4F6" : "FFFBEB" },
            line: { color: "E5E7EB", width: 1 },
            rectRadius: 0.1,
          });

          pSlide.addText(st.value, {
            x: 7.0,
            y: y + 0.25,
            w: 5.0,
            h: 0.7,
            fontSize: 26,
            color: sIdx === 0 ? darkHex : "D97706",
            bold: true,
            fontFace,
          });

          pSlide.addText(st.label, {
            x: 7.0,
            y: y + 1.0,
            w: 5.0,
            h: 0.6,
            fontSize: 13,
            color: "555555",
            fontFace,
          });
        });
        break;
      }

      case "process": {
        pSlide.addText(slide.title, {
          x: 1.0,
          y: 0.8,
          w: 11.0,
          h: 0.8,
          fontSize: 24,
          color: darkHex,
          bold: true,
          fontFace,
        });

        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: 1.0,
            y: 1.6,
            w: 11.0,
            h: 0.5,
            fontSize: 13,
            color: "666666",
            fontFace,
          });
        }

        const steps = slide.processSteps || [];
        steps.forEach((step, sIdx) => {
          const y = 2.4 + sIdx * 1.1;

          // Number Icon
          pSlide.addShape(pptx.ShapeType.roundRect, {
            x: 1.0,
            y: y + 0.05,
            w: 0.7,
            h: 0.7,
            fill: { color: primaryHex },
            rectRadius: 0.1,
          });

          pSlide.addText(String(sIdx + 1).padStart(2, "0"), {
            x: 1.0,
            y: y + 0.15,
            w: 0.7,
            h: 0.5,
            fontSize: 12,
            bold: true,
            color: "000000",
            align: "center",
            fontFace,
          });

          // Title & Description
          pSlide.addText(
            [
              { text: step.title + "\n", options: { bold: true, fontSize: 13, color: darkHex } },
              { text: step.description, options: { fontSize: 11, color: "666666" } },
            ],
            {
              x: 1.9,
              y,
              w: 10.4,
              h: 0.9,
              fontFace,
            }
          );
        });
        break;
      }

      case "bullets": {
        pSlide.addText(slide.title, {
          x: 1.0,
          y: 0.8,
          w: 11.0,
          h: 0.8,
          fontSize: 24,
          color: darkHex,
          bold: true,
          fontFace,
        });

        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: 1.0,
            y: 1.6,
            w: 11.0,
            h: 0.5,
            fontSize: 13,
            color: "666666",
            fontFace,
          });
        }

        const bullets = slide.bullets || [];
        const bulletItems = bullets.map((b) => ({
          text: b,
          options: {
            bullet: true,
            fontSize: 14,
            color: "333333",
            lineSpacing: 26,
          },
        }));

        pSlide.addText(bulletItems, {
          x: 1.0,
          y: 2.5,
          w: 11.0,
          h: 4.2,
          fontFace,
        });
        break;
      }

      case "bigNumber": {
        pSlide.background = { color: primaryHex };

        pSlide.addText(slide.title, {
          x: 1.0,
          y: 1.2,
          w: 11.0,
          h: 0.6,
          fontSize: 18,
          color: "1A1A1A",
          bold: true,
          fontFace,
        });

        if (slide.highlight) {
          pSlide.addText(slide.highlight, {
            x: 1.0,
            y: 1.8,
            w: 11.0,
            h: 2.0,
            fontSize: 64,
            color: "000000",
            bold: true,
            fontFace,
          });
        }

        if (slide.description) {
          pSlide.addText(slide.description, {
            x: 1.0,
            y: 4.2,
            w: 10.0,
            h: 1.2,
            fontSize: 16,
            color: "222222",
            fontFace,
          });
        }
        break;
      }

      case "chartBar":
      case "chartArea": {
        pSlide.addText(slide.title, {
          x: 1.0,
          y: 0.8,
          w: 11.0,
          h: 0.8,
          fontSize: 24,
          color: darkHex,
          bold: true,
          fontFace,
        });

        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: 1.0,
            y: 1.6,
            w: 11.0,
            h: 0.5,
            fontSize: 13,
            color: "666666",
            fontFace,
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
          x: 1.0,
          y: 2.3,
          w: 11.0,
          h: 4.4,
          chartColors: [primaryHex],
          showValue: true,
        });
        break;
      }

      case "chartDonut": {
        pSlide.addText(slide.title, {
          x: 1.0,
          y: 0.8,
          w: 11.0,
          h: 0.8,
          fontSize: 24,
          color: darkHex,
          bold: true,
          fontFace,
        });

        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: 1.0,
            y: 1.6,
            w: 11.0,
            h: 0.5,
            fontSize: 13,
            color: "666666",
            fontFace,
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
          x: 1.0,
          y: 2.3,
          w: 11.0,
          h: 4.4,
          chartColors: [primaryHex, "6366F1", "059669", "D97706"],
          showLegend: true,
          legendPos: "r",
        });
        break;
      }

      case "flowDiagram": {
        pSlide.addText(slide.title, {
          x: 1.0,
          y: 0.8,
          w: 11.0,
          h: 0.8,
          fontSize: 24,
          color: darkHex,
          bold: true,
          fontFace,
        });

        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: 1.0,
            y: 1.6,
            w: 11.0,
            h: 0.5,
            fontSize: 13,
            color: "666666",
            fontFace,
          });
        }

        const nodes = slide.flowNodes && slide.flowNodes.length > 0
          ? slide.flowNodes
          : (slide.bullets && slide.bullets.length > 0
              ? slide.bullets.map((b, i) => ({
                  title: b.split(/[:—–-]/)[0]?.trim() || `Step ${i + 1}`,
                  subtitle: b.split(/[:—–-]/).slice(1).join("—").trim() || b,
                  tag: `Step 0${i + 1}`,
                }))
              : []);

        const cardWidth = 2.4;
        const gap = 0.5;
        nodes.forEach((node, nIdx) => {
          const x = 1.0 + nIdx * (cardWidth + gap);
          pSlide.addShape(pptx.ShapeType.roundRect, {
            x,
            y: 2.6,
            w: cardWidth,
            h: 3.2,
            fill: { color: "FFFFFF" },
            line: { color: "E5E7EB", width: 1 },
            rectRadius: 0.1,
          });

          // Tag
          pSlide.addText(node.tag || `0${nIdx + 1}`, {
            x: x + 0.2,
            y: 2.8,
            w: cardWidth - 0.4,
            h: 0.3,
            fontSize: 10,
            color: "B45309",
            bold: true,
            fontFace,
          });

          // Title
          pSlide.addText(node.title, {
            x: x + 0.2,
            y: 3.2,
            w: cardWidth - 0.4,
            h: 0.8,
            fontSize: 13,
            color: darkHex,
            bold: true,
            fontFace,
          });

          // Subtitle
          if (node.subtitle) {
            pSlide.addText(node.subtitle, {
              x: x + 0.2,
              y: 4.1,
              w: cardWidth - 0.4,
              h: 1.2,
              fontSize: 10,
              color: "666666",
              fontFace,
            });
          }

          // Arrow indicator between cards
          if (nIdx < nodes.length - 1) {
            pSlide.addText("→", {
              x: x + cardWidth + 0.05,
              y: 3.8,
              w: gap - 0.1,
              h: 0.5,
              fontSize: 18,
              color: primaryHex,
              align: "center",
              bold: true,
              fontFace,
            });
          }
        });
        break;
      }

      case "tableComparison": {
        pSlide.addText(slide.title, {
          x: 1.0,
          y: 0.8,
          w: 11.0,
          h: 0.8,
          fontSize: 24,
          color: darkHex,
          bold: true,
          fontFace,
        });

        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: 1.0,
            y: 1.6,
            w: 11.0,
            h: 0.5,
            fontSize: 13,
            color: "666666",
            fontFace,
          });
        }

        const rows = slide.tableRows && slide.tableRows.length > 0 ? slide.tableRows : [];
        if (rows.length === 0) {
          const items = (slide.bullets && slide.bullets.length > 0)
            ? slide.bullets
            : (slide.description ? [slide.description] : ["Analysis in progress"]);
          const cWidth = items.length <= 2 ? 5.2 : 3.5;
          const cGap = 0.4;
          items.slice(0, 3).forEach((item, i) => {
            const x = 1.0 + i * (cWidth + cGap);
            pSlide.addShape(pptx.ShapeType.roundRect, {
              x,
              y: 2.4,
              w: cWidth,
              h: 3.8,
              fill: { color: i === 0 ? "FFFFFF" : "F9FAFB" },
              line: { color: i === 0 ? primaryHex : "E5E7EB", width: i === 0 ? 2 : 1 },
              rectRadius: 0.1,
            });
            pSlide.addText(item, {
              x: x + 0.3,
              y: 2.7,
              w: cWidth - 0.6,
              h: 3.2,
              fontSize: 13,
              color: darkHex,
              fontFace,
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
            fill: i === headers.length - 1 ? primaryHex : "F3F4F6",
            color: i === headers.length - 1 ? "000000" : "333333",
            align: (i === 0 ? "left" : "center") as "left" | "center",
          },
        }));

        const tableData: Array<Array<{ text: string; options?: Record<string, unknown> }>> = [headerRow];

        rows.forEach((r) => {
          if (r.cells && r.cells.length > 0) {
            tableData.push(
              r.cells.map((c, i) => ({
                text: typeof c === "boolean" ? (c ? "Yes" : "No") : String(c ?? ""),
                options: {
                  bold: i === 0 || i === r.cells!.length - 1,
                  color: i === 0 ? "222222" : "555555",
                  align: (i === 0 ? "left" : "center") as "left" | "center",
                },
              }))
            );
          } else {
            tableData.push([
              { text: r.feature || "Feature", options: { color: "222222", bold: true, align: "left" } },
              { text: typeof r.current === "boolean" ? (r.current ? "Yes" : "No") : String(r.current ?? "-"), options: { align: "center", color: "666666" } },
              { text: typeof r.proposed === "boolean" ? (r.proposed ? "Yes" : "No") : String(r.proposed ?? "Yes"), options: { align: "center", bold: true, color: "000000" } },
            ]);
          }
        });

        const numCols = headers.length;
        const colW = numCols === 3 ? [5.0, 3.0, 3.0] : Array(numCols).fill(11.0 / numCols);

        pSlide.addTable(tableData, {
          x: 1.0,
          y: 2.3,
          w: 11.0,
          h: 4.2,
          colW,
          border: { type: "solid", color: "E5E7EB", pt: 1 },
          fontFace,
          fontSize: 10,
        });
        break;
      }

      case "timeline": {
        pSlide.addText(slide.title, {
          x: 1.0,
          y: 0.8,
          w: 11.0,
          h: 0.8,
          fontSize: 24,
          color: darkHex,
          bold: true,
          fontFace,
        });

        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: 1.0,
            y: 1.6,
            w: 11.0,
            h: 0.5,
            fontSize: 13,
            color: "666666",
            fontFace,
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

        const mWidth = 2.4;
        const mGap = 0.5;
        milestones.forEach((m, mIdx) => {
          const x = 1.0 + mIdx * (mWidth + mGap);
          pSlide.addShape(pptx.ShapeType.roundRect, {
            x,
            y: 2.6,
            w: mWidth,
            h: 3.6,
            fill: { color: "FFFFFF" },
            line: { color: "E5E7EB", width: 1 },
            rectRadius: 0.1,
          });

          // Node Circle
          pSlide.addShape(pptx.ShapeType.ellipse, {
            x: x + 0.95,
            y: 2.8,
            w: 0.5,
            h: 0.5,
            fill: { color: mIdx === 1 ? primaryHex : "1A1A1A" },
          });

          // Quarter
          pSlide.addText(m.quarter, {
            x: x + 0.1,
            y: 3.4,
            w: mWidth - 0.2,
            h: 0.3,
            fontSize: 10,
            color: "888888",
            align: "center",
            fontFace,
          });

          // Title
          pSlide.addText(m.title, {
            x: x + 0.1,
            y: 3.8,
            w: mWidth - 0.2,
            h: 0.7,
            fontSize: 12,
            color: darkHex,
            bold: true,
            align: "center",
            fontFace,
          });

          // Description
          pSlide.addText(m.description, {
            x: x + 0.1,
            y: 4.6,
            w: mWidth - 0.2,
            h: 1.4,
            fontSize: 10,
            color: "666666",
            align: "center",
            fontFace,
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
          fontSize: 24,
          color: darkHex,
          bold: true,
          fontFace,
        });

        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: 1.0,
            y: 1.6,
            w: 11.0,
            h: 0.5,
            fontSize: 13,
            color: "666666",
            fontFace,
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
          chartColors: [primaryHex],
          showLegend: false,
        });
        break;
      }

      case "quadrantMatrix": {
        pSlide.addText(slide.title, {
          x: 1.0,
          y: 0.8,
          w: 11.0,
          h: 0.8,
          fontSize: 24,
          color: darkHex,
          bold: true,
          fontFace,
        });

        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: 1.0,
            y: 1.6,
            w: 11.0,
            h: 0.5,
            fontSize: 13,
            color: "666666",
            fontFace,
          });
        }

        const bulletItems = slide.bullets || [];
        const quads = [
          { title: "QUICK WINS (High Impact, Low Effort)", items: slide.quadrantData?.q1 || (bulletItems[0] ? [{ title: bulletItems[0] }] : []), col: 0, row: 0, fill: "FEF3C7" },
          { title: "STRATEGIC BETS (High Impact, High Effort)", items: slide.quadrantData?.q2 || (bulletItems[1] ? [{ title: bulletItems[1] }] : []), col: 1, row: 0, fill: "DBEAFE" },
          { title: "FILL-IN TASKS (Low Impact, Low Effort)", items: slide.quadrantData?.q3 || (bulletItems[2] ? [{ title: bulletItems[2] }] : []), col: 0, row: 1, fill: "F3F4F6" },
          { title: "DEPRIORITIZE (Low Impact, High Effort)", items: slide.quadrantData?.q4 || (bulletItems[3] ? [{ title: bulletItems[3] }] : []), col: 1, row: 1, fill: "FFE4E6" },
        ];

        quads.forEach((q) => {
          const x = 1.0 + q.col * 5.7;
          const y = 2.4 + q.row * 2.1;
          pSlide.addShape(pptx.ShapeType.roundRect, {
            x,
            y,
            w: 5.4,
            h: 1.9,
            fill: { color: q.fill },
            line: { color: "E5E7EB", width: 1 },
            rectRadius: 0.1,
          });

          pSlide.addText(q.title, {
            x: x + 0.2,
            y: y + 0.15,
            w: 5.0,
            h: 0.4,
            fontSize: 10,
            bold: true,
            color: darkHex,
            fontFace,
          });

          const itemTexts = q.items.map((it) => it.title).join(" • ");
          pSlide.addText(itemTexts, {
            x: x + 0.2,
            y: y + 0.6,
            w: 5.0,
            h: 1.1,
            fontSize: 12,
            color: "333333",
            fontFace,
          });
        });
        break;
      }

      case "funnel": {
        pSlide.addText(slide.title, {
          x: 1.0,
          y: 0.8,
          w: 11.0,
          h: 0.8,
          fontSize: 24,
          color: darkHex,
          bold: true,
          fontFace,
        });

        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: 1.0,
            y: 1.6,
            w: 11.0,
            h: 0.5,
            fontSize: 13,
            color: "666666",
            fontFace,
          });
        }

        const stages = slide.funnelStages || [
          { label: "Total Reach", value: "250,000", rate: "100%" },
          { label: "Engaged Creators", value: "84,000", rate: "33.6%" },
          { label: "Active Workspaces", value: "28,500", rate: "11.4%" },
          { label: "Enterprise Subscriptions", value: "6,200", rate: "2.4%" },
        ];

        stages.forEach((st, sIdx) => {
          const w = 11.0 - sIdx * 1.8;
          const x = 1.0 + (11.0 - w) / 2;
          const y = 2.4 + sIdx * 1.05;

          pSlide.addShape(pptx.ShapeType.roundRect, {
            x,
            y,
            w,
            h: 0.9,
            fill: { color: sIdx === stages.length - 1 ? primaryHex : "FFFFFF" },
            line: { color: "D1D5DB", width: 1 },
            rectRadius: 0.1,
          });

          pSlide.addText(`${st.label}   |   ${st.value} (${st.rate || ""})`, {
            x: x + 0.2,
            y: y + 0.2,
            w: w - 0.4,
            h: 0.5,
            fontSize: 12,
            bold: true,
            color: darkHex,
            align: "center",
            fontFace,
          });
        });
        break;
      }

      case "cycleLoop": {
        pSlide.addText(slide.title, {
          x: 1.0,
          y: 0.8,
          w: 11.0,
          h: 0.8,
          fontSize: 24,
          color: darkHex,
          bold: true,
          fontFace,
        });

        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: 1.0,
            y: 1.6,
            w: 11.0,
            h: 0.5,
            fontSize: 13,
            color: "666666",
            fontFace,
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

        nodes.forEach((n, nIdx) => {
          const x = 1.0 + nIdx * 2.9;
          pSlide.addShape(pptx.ShapeType.roundRect, {
            x,
            y: 2.6,
            w: 2.6,
            h: 3.4,
            fill: { color: "FFFFFF" },
            line: { color: "E5E7EB", width: 1 },
            rectRadius: 0.1,
          });

          pSlide.addText(n.title, {
            x: x + 0.2,
            y: 2.9,
            w: 2.2,
            h: 0.6,
            fontSize: 14,
            bold: true,
            color: darkHex,
            fontFace,
          });

          if (n.description) {
            pSlide.addText(n.description, {
              x: x + 0.2,
              y: 3.6,
              w: 2.2,
              h: 1.6,
              fontSize: 11,
              color: "666666",
              fontFace,
            });
          }
        });
        break;
      }

      case "architecture": {
        pSlide.addText(slide.title, {
          x: 1.0,
          y: 0.8,
          w: 11.0,
          h: 0.8,
          fontSize: 24,
          color: darkHex,
          bold: true,
          fontFace,
        });

        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: 1.0,
            y: 1.6,
            w: 11.0,
            h: 0.5,
            fontSize: 13,
            color: "666666",
            fontFace,
          });
        }

        const tiers: Array<{ name: string; desc: string; fill: string }> = (slide.layers && slide.layers.length > 0)
          ? slide.layers.map((l: { name: string; detail?: string; color?: string }, i: number) => ({
              name: l.name,
              desc: l.detail || "",
              fill: l.color ? l.color.replace("#", "") : (i === 0 ? primaryHex : i === 1 ? "6366F1" : "059669"),
            }))
          : (slide.bullets && slide.bullets.length > 0
              ? slide.bullets.map((b: string, i: number) => ({
                  name: b.split(/[:—–-]/)[0]?.trim() || `Layer 0${i + 1}`,
                  desc: b.split(/[:—–-]/).slice(1).join("—").trim() || b,
                  fill: i === 0 ? primaryHex : i === 1 ? "6366F1" : "059669",
                }))
              : []);

        tiers.forEach((t, tIdx) => {
          const y = 2.4 + tIdx * 1.4;
          pSlide.addShape(pptx.ShapeType.roundRect, {
            x: 1.0,
            y,
            w: 11.0,
            h: 1.2,
            fill: { color: "FFFFFF" },
            line: { color: "E5E7EB", width: 1 },
            rectRadius: 0.1,
          });

          pSlide.addText(t.name, {
            x: 1.3,
            y: y + 0.15,
            w: 10.4,
            h: 0.4,
            fontSize: 13,
            bold: true,
            color: darkHex,
            fontFace,
          });

          pSlide.addText(t.desc, {
            x: 1.3,
            y: y + 0.55,
            w: 10.4,
            h: 0.45,
            fontSize: 11,
            color: "666666",
            fontFace,
          });
        });
        break;
      }

      case "chevronProcess": {
        pSlide.addText(slide.title, {
          x: 1.0,
          y: 0.8,
          w: 11.0,
          h: 0.8,
          fontSize: 24,
          color: darkHex,
          bold: true,
          fontFace,
        });

        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: 1.0,
            y: 1.6,
            w: 11.0,
            h: 0.5,
            fontSize: 13,
            color: "666666",
            fontFace,
          });
        }

        const cSteps = slide.chevronSteps || [
          { title: "Step 01", percentage: "35%", description: "Ingestion", position: "bottom" },
          { title: "Step 02", percentage: "45%", description: "Context", position: "top" },
          { title: "Step 03", percentage: "55%", description: "Synthesis", position: "bottom" },
          { title: "Step 04", percentage: "65%", description: "Mapping", position: "top" },
          { title: "Step 05", percentage: "75%", description: "Export", position: "bottom" },
        ];

        const cWidth = 2.1;
        const cGap = 0.15;
        cSteps.forEach((st, sIdx) => {
          const x = 1.0 + sIdx * (cWidth + cGap);
          const isYellow = sIdx % 2 === 0;

          // Top Callout
          if (st.position === "top") {
            pSlide.addText(st.percentage || "", {
              x,
              y: 2.3,
              w: cWidth,
              h: 0.4,
              fontSize: 16,
              bold: true,
              color: darkHex,
              align: "center",
              fontFace,
            });
            pSlide.addText(st.description || "", {
              x,
              y: 2.7,
              w: cWidth,
              h: 0.4,
              fontSize: 9,
              color: "666666",
              align: "center",
              fontFace,
            });
          }

          // Chevron Box
          pSlide.addShape(pptx.ShapeType.roundRect, {
            x,
            y: 3.3,
            w: cWidth,
            h: 0.9,
            fill: { color: isYellow ? primaryHex : "181818" },
            rectRadius: 0.05,
          });

          pSlide.addText(st.title, {
            x,
            y: 3.5,
            w: cWidth,
            h: 0.5,
            fontSize: 11,
            bold: true,
            color: isYellow ? "000000" : "FFFFFF",
            align: "center",
            fontFace,
          });

          // Bottom Callout
          if (st.position === "bottom") {
            pSlide.addText(st.percentage || "", {
              x,
              y: 4.4,
              w: cWidth,
              h: 0.4,
              fontSize: 16,
              bold: true,
              color: darkHex,
              align: "center",
              fontFace,
            });
            pSlide.addText(st.description || "", {
              x,
              y: 4.8,
              w: cWidth,
              h: 0.4,
              fontSize: 9,
              color: "666666",
              align: "center",
              fontFace,
            });
          }
        });
        break;
      }

      case "gaugeRings": {
        pSlide.addText(slide.title, {
          x: 1.0,
          y: 0.8,
          w: 11.0,
          h: 0.8,
          fontSize: 24,
          color: darkHex,
          bold: true,
          fontFace,
        });

        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: 1.0,
            y: 1.6,
            w: 11.0,
            h: 0.5,
            fontSize: 13,
            color: "666666",
            fontFace,
          });
        }

        const gauges = slide.gaugeItems || [
          { percentage: 55, title: "Standardized Automation", description: "Eliminates design bottlenecks across teams." },
          { percentage: 75, title: "Velocity Acceleration", description: "Sub-second slide generation & instant export." },
        ];

        gauges.forEach((g, gIdx) => {
          const x = 1.0 + gIdx * 5.7;
          pSlide.addShape(pptx.ShapeType.roundRect, {
            x,
            y: 2.5,
            w: 5.4,
            h: 3.6,
            fill: { color: "FFFFFF" },
            line: { color: "E5E7EB", width: 1 },
            rectRadius: 0.1,
          });

          // Gauge Circle
          pSlide.addShape(pptx.ShapeType.ellipse, {
            x: x + 0.4,
            y: 3.1,
            w: 1.8,
            h: 1.8,
            fill: { color: "FFFBEB" },
            line: { color: primaryHex, width: 4 },
          });

          pSlide.addText(`${g.percentage}%`, {
            x: x + 0.4,
            y: 3.7,
            w: 1.8,
            h: 0.6,
            fontSize: 22,
            bold: true,
            color: darkHex,
            align: "center",
            fontFace,
          });

          pSlide.addText(g.title, {
            x: x + 2.4,
            y: 3.1,
            w: 2.8,
            h: 0.6,
            fontSize: 14,
            bold: true,
            color: darkHex,
            fontFace,
          });

          pSlide.addText(g.description, {
            x: x + 2.4,
            y: 3.7,
            w: 2.8,
            h: 1.4,
            fontSize: 11,
            color: "666666",
            fontFace,
          });
        });
        break;
      }

      case "ascendingTrajectory": {
        pSlide.addText(slide.title, {
          x: 1.0,
          y: 0.8,
          w: 11.0,
          h: 0.8,
          fontSize: 24,
          color: darkHex,
          bold: true,
          fontFace,
        });

        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: 1.0,
            y: 1.6,
            w: 11.0,
            h: 0.5,
            fontSize: 13,
            color: "666666",
            fontFace,
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

        tNodes.forEach((tn, tIdx) => {
          const x = 1.2 + tIdx * 3.8;
          const y = 4.4 - tIdx * 1.0;

          pSlide.addShape(pptx.ShapeType.roundRect, {
            x,
            y,
            w: 3.2,
            h: 1.3,
            fill: { color: primaryHex },
            rectRadius: 0.1,
          });

          pSlide.addText(tn.percentage, {
            x: x + 0.2,
            y: y + 0.2,
            w: 1.2,
            h: 0.8,
            fontSize: 24,
            bold: true,
            color: "000000",
            fontFace,
          });

          pSlide.addText(tn.title, {
            x: x + 1.4,
            y: y + 0.2,
            w: 1.6,
            h: 0.4,
            fontSize: 12,
            bold: true,
            color: "000000",
            fontFace,
          });

          if (tn.description) {
            pSlide.addText(tn.description, {
              x: x + 1.4,
              y: y + 0.6,
              w: 1.6,
              h: 0.5,
              fontSize: 9,
              color: "333333",
              fontFace,
            });
          }
        });
        break;
      }

      case "verticalProgress": {
        pSlide.addText(slide.title, {
          x: 1.0,
          y: 0.8,
          w: 11.0,
          h: 0.8,
          fontSize: 24,
          color: darkHex,
          bold: true,
          fontFace,
        });

        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: 1.0,
            y: 1.6,
            w: 11.0,
            h: 0.5,
            fontSize: 13,
            color: "666666",
            fontFace,
          });
        }

        const vItems = slide.verticalProgressItems || [
          { title: "Input Ingestion & Extraction", percentage: 45, tag: "01" },
          { title: "Semantic Parsing & Structuring", percentage: 55, tag: "02" },
          { title: "16:9 Presentation Synthesis", percentage: 85, tag: "03" },
        ];

        vItems.forEach((vi, vIdx) => {
          const y = 2.6 + vIdx * 1.3;

          // Tag Pill
          pSlide.addShape(pptx.ShapeType.roundRect, {
            x: 1.0,
            y: y + 0.05,
            w: 0.6,
            h: 0.6,
            fill: { color: primaryHex },
            rectRadius: 0.1,
          });

          pSlide.addText(vi.tag || `0${vIdx + 1}`, {
            x: 1.0,
            y: y + 0.15,
            w: 0.6,
            h: 0.4,
            fontSize: 11,
            bold: true,
            color: "000000",
            align: "center",
            fontFace,
          });

          // Title & %
          pSlide.addText(`${vi.title}   (${vi.percentage}%)`, {
            x: 1.8,
            y,
            w: 10.2,
            h: 0.4,
            fontSize: 13,
            bold: true,
            color: darkHex,
            fontFace,
          });

          // Progress Track
          pSlide.addShape(pptx.ShapeType.roundRect, {
            x: 1.8,
            y: y + 0.45,
            w: 10.2,
            h: 0.18,
            fill: { color: "E5E7EB" },
            rectRadius: 0.05,
          });

          // Active Bar
          pSlide.addShape(pptx.ShapeType.roundRect, {
            x: 1.8,
            y: y + 0.45,
            w: (10.2 * vi.percentage) / 100,
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
          x: 1.0,
          y: 0.9,
          w: 11.0,
          h: 0.8,
          fontSize: 26,
          color: currentTextColor,
          bold: true,
          fontFace: fontTitle,
        });

        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: 1.0,
            y: 1.7,
            w: 11.0,
            h: 0.4,
            fontSize: 12,
            color: currentMutedColor,
            fontFace: fontBody,
          });
        }

        // Left Glow Metric Card
        const metricVal = slide.metricBox?.value || slide.stats?.[0]?.value || "56.2K";
        const metricLbl = slide.metricBox?.label || slide.stats?.[0]?.label || "Operational Milestone";
        const metricDesc = slide.metricBox?.description || "Project Phases With Modern Process Layouts That Improve Collaboration";

        pSlide.addShape(pptx.ShapeType.roundRect, {
          x: 1.0,
          y: 2.4,
          w: 3.8,
          h: 3.8,
          fill: { color: primaryHex },
          rectRadius: 0.15,
        });

        pSlide.addText(metricVal, {
          x: 1.3,
          y: 2.8,
          w: 3.2,
          h: 1.0,
          fontSize: 38,
          bold: true,
          color: "000000",
          fontFace: fontTitle,
        });

        pSlide.addText(metricLbl, {
          x: 1.3,
          y: 3.9,
          w: 3.2,
          h: 0.5,
          fontSize: 12,
          bold: true,
          color: "111111",
          fontFace: fontBody,
        });

        pSlide.addText(metricDesc, {
          x: 1.3,
          y: 4.5,
          w: 3.2,
          h: 1.2,
          fontSize: 10,
          color: "333333",
          fontFace: fontBody,
        });

        // Vertical divider line
        pSlide.addShape(pptx.ShapeType.line, {
          x: 5.4,
          y: 2.4,
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
          const sy = 2.4 + sIdx * 1.3;
          
          // Badge number circle
          pSlide.addShape(pptx.ShapeType.roundRect, {
            x: 5.9,
            y: sy + 0.05,
            w: 0.6,
            h: 0.35,
            fill: { color: primaryHex },
            rectRadius: 0.08,
          });

          pSlide.addText(`0${sIdx + 1}.`, {
            x: 5.9,
            y: sy + 0.05,
            w: 0.6,
            h: 0.35,
            fontSize: 10,
            bold: true,
            color: "000000",
            align: "center",
            fontFace: fontBody,
          });

          // Title
          pSlide.addText(st.title, {
            x: 6.7,
            y: sy,
            w: 4.5,
            h: 0.35,
            fontSize: 13,
            bold: true,
            color: currentTextColor,
            fontFace: fontTitle,
          });

          // Description
          if (st.description) {
            pSlide.addText(st.description, {
              x: 6.7,
              y: sy + 0.35,
              w: 4.5,
              h: 0.3,
              fontSize: 9,
              color: currentMutedColor,
              fontFace: fontBody,
            });
          }

          // Percentage stat
          pSlide.addText(`${st.percentage}%`, {
            x: 11.2,
            y: sy,
            w: 1.1,
            h: 0.35,
            fontSize: 12,
            bold: true,
            color: currentTextColor,
            align: "right",
            fontFace: fontBody,
          });

          // Progress track
          pSlide.addShape(pptx.ShapeType.roundRect, {
            x: 6.7,
            y: sy + 0.72,
            w: 5.6,
            h: 0.1,
            fill: { color: "E5E7EB" },
            rectRadius: 0.04,
          });

          // Progress fill
          pSlide.addShape(pptx.ShapeType.roundRect, {
            x: 6.7,
            y: sy + 0.72,
            w: (5.6 * st.percentage) / 100,
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
          x: 1.0,
          y: 0.9,
          w: 7.0,
          h: 0.9,
          fontSize: 26,
          color: currentTextColor,
          bold: true,
          fontFace: fontTitle,
        });

        // Subtitle on right
        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: 8.2,
            y: 0.9,
            w: 4.1,
            h: 0.8,
            fontSize: 11,
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

        const barWidth = 11.3;
        const segmentWidth = barWidth / ms.length;

        // Draw horizontal yellow milestone bar
        ms.forEach((m, mIdx) => {
          const mx = 1.0 + mIdx * segmentWidth;
          
          pSlide.addShape(pptx.ShapeType.rect, {
            x: mx,
            y: 2.8,
            w: segmentWidth - 0.05,
            h: 0.8,
            fill: { color: primaryHex },
          });

          pSlide.addText(m.percentage, {
            x: mx,
            y: 3.0,
            w: segmentWidth - 0.05,
            h: 0.4,
            fontSize: 16,
            bold: true,
            color: "000000",
            align: "center",
            fontFace: fontTitle,
          });

          // Text below
          pSlide.addText(m.title, {
            x: mx + 0.1,
            y: 3.9,
            w: segmentWidth - 0.2,
            h: 0.5,
            fontSize: 11,
            bold: true,
            color: currentTextColor,
            fontFace: fontTitle,
          });

          if (m.description) {
            pSlide.addText(m.description, {
              x: mx + 0.1,
              y: 4.45,
              w: segmentWidth - 0.2,
              h: 1.0,
              fontSize: 9,
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
          w: 10.5,
          h: 2.2,
          fontSize: 44,
          bold: true,
          color: "000000",
          fontFace: fontTitle,
        });

        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: 1.0,
            y: 4.2,
            w: 8.5,
            h: 0.8,
            fontSize: 14,
            color: "222222",
            fontFace: fontBody,
          });
        }

        const ctaBtn = slide.ctaText || "Get In Touch  ->";
        pSlide.addShape(pptx.ShapeType.roundRect, {
          x: 1.0,
          y: 5.2,
          w: 2.6,
          h: 0.65,
          fill: { color: "111111" },
          rectRadius: 0.2,
        });

        pSlide.addText(ctaBtn, {
          x: 1.0,
          y: 5.32,
          w: 2.6,
          h: 0.4,
          fontSize: 11,
          bold: true,
          color: "FFFFFF",
          align: "center",
          fontFace: fontBody,
        });

        break;
      }

      case "bubbleCluster": {
        // Title
        pSlide.addText(slide.title, {
          x: 1.0,
          y: 1.0,
          w: 4.5,
          h: 1.2,
          fontSize: 26,
          bold: true,
          color: currentTextColor,
          fontFace: fontTitle,
        });

        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: 1.0,
            y: 2.3,
            w: 4.5,
            h: 0.8,
            fontSize: 11,
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
          y: 2.0,
          w: 1.4,
          h: 1.4,
          fill: { color: primaryHex },
          line: { color: "FFFFFF", width: 2 },
        });
        pSlide.addText("Process A", {
          x: 4.8,
          y: 2.5,
          w: 1.4,
          h: 0.4,
          fontSize: 9,
          bold: true,
          color: "000000",
          align: "center",
          fontFace: fontBody,
        });
        pSlide.addText("25%  " + (bubbles[0]?.description || ""), {
          x: 6.4,
          y: 2.4,
          w: 4.5,
          h: 0.5,
          fontSize: 12,
          bold: true,
          color: currentTextColor,
          fontFace: fontTitle,
        });

        // Bubble 2: Process B (Black, medium, center)
        pSlide.addShape(pptx.ShapeType.ellipse, {
          x: 5.6,
          y: 2.8,
          w: 1.8,
          h: 1.8,
          fill: { color: "111111" },
          line: { color: "FFFFFF", width: 2 },
        });
        pSlide.addText("Process B", {
          x: 5.6,
          y: 3.5,
          w: 1.8,
          h: 0.4,
          fontSize: 10,
          bold: true,
          color: "FFFFFF",
          align: "center",
          fontFace: fontBody,
        });
        pSlide.addText("48%  " + (bubbles[1]?.description || ""), {
          x: 7.6,
          y: 3.4,
          w: 4.5,
          h: 0.5,
          fontSize: 12,
          bold: true,
          color: currentTextColor,
          fontFace: fontTitle,
        });

        // Bubble 3: Process C (Yellow, large, bottom right)
        pSlide.addShape(pptx.ShapeType.ellipse, {
          x: 6.8,
          y: 3.5,
          w: 2.4,
          h: 2.4,
          fill: { color: primaryHex },
          line: { color: "FFFFFF", width: 2 },
        });
        pSlide.addText("Process C", {
          x: 6.8,
          y: 4.4,
          w: 2.4,
          h: 0.5,
          fontSize: 12,
          bold: true,
          color: "000000",
          align: "center",
          fontFace: fontTitle,
        });
        pSlide.addText("75%  " + (bubbles[2]?.description || ""), {
          x: 3.8,
          y: 5.0,
          w: 2.8,
          h: 0.6,
          fontSize: 12,
          bold: true,
          color: currentTextColor,
          align: "right",
          fontFace: fontTitle,
        });

        break;
      }

      case "imageSplitMetric": {
        // Left Column: Visual card + yellow note card
        pSlide.addShape(pptx.ShapeType.roundRect, {
          x: 1.0,
          y: 1.2,
          w: 4.2,
          h: 3.2,
          fill: { color: "E5E7EB" },
          rectRadius: 0.1,
        });
        pSlide.addText("[ Executive Visual ]", {
          x: 1.0,
          y: 2.5,
          w: 4.2,
          h: 0.5,
          fontSize: 12,
          color: "888888",
          align: "center",
          fontFace: fontBody,
        });

        pSlide.addShape(pptx.ShapeType.roundRect, {
          x: 1.0,
          y: 4.7,
          w: 4.2,
          h: 1.4,
          fill: { color: primaryHex },
          rectRadius: 0.08,
        });
        pSlide.addText(slide.description || "Visualize Every Process Clearly With Structured Steps And Engaging", {
          x: 1.2,
          y: 4.85,
          w: 3.8,
          h: 1.1,
          fontSize: 10,
          bold: true,
          color: "000000",
          fontFace: fontBody,
        });

        // Right Column: Title + Highlight + Big Stat
        pSlide.addText(slide.title, {
          x: 5.8,
          y: 1.2,
          w: 6.5,
          h: 1.5,
          fontSize: 28,
          bold: true,
          color: currentTextColor,
          fontFace: fontTitle,
        });

        if (slide.highlight) {
          pSlide.addShape(pptx.ShapeType.roundRect, {
            x: 5.8,
            y: 2.9,
            w: 4.5,
            h: 0.9,
            fill: { color: primaryHex },
            rectRadius: 0.06,
          });
          pSlide.addText(slide.highlight, {
            x: 6.0,
            y: 3.0,
            w: 4.1,
            h: 0.7,
            fontSize: 9,
            color: "000000",
            fontFace: fontBody,
          });
        }

        const statItem = slide.stats?.[0] || { value: "+62%", label: "Acceleration across strategic workflow units" };
        pSlide.addText(statItem.value, {
          x: 5.8,
          y: 4.3,
          w: 2.6,
          h: 1.2,
          fontSize: 48,
          bold: true,
          color: currentTextColor,
          fontFace: fontTitle,
        });
        pSlide.addText(statItem.label, {
          x: 8.5,
          y: 4.7,
          w: 3.8,
          h: 0.8,
          fontSize: 10,
          color: currentMutedColor,
          fontFace: fontBody,
        });

        break;
      }

      case "boldImpact": {
        // Title & Subtitle on bold yellow
        pSlide.addText(slide.title, {
          x: 1.0,
          y: 1.0,
          w: 7.2,
          h: 1.5,
          fontSize: 30,
          bold: true,
          color: "000000",
          fontFace: fontTitle,
        });

        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: 8.5,
            y: 1.0,
            w: 3.8,
            h: 1.0,
            fontSize: 11,
            color: "333333",
            align: "right",
            fontFace: fontBody,
          });
        }

        // Left Stat
        if (slide.highlight) {
          pSlide.addText(slide.highlight, {
            x: 1.0,
            y: 3.0,
            w: 5.5,
            h: 0.4,
            fontSize: 11,
            bold: true,
            color: "222222",
            fontFace: fontBody,
          });
        }

        const impactStat = slide.stats?.[0] || { value: "+85%", label: "Compounding acceleration across key execution metrics" };
        pSlide.addText(impactStat.value, {
          x: 1.0,
          y: 3.4,
          w: 5.5,
          h: 1.4,
          fontSize: 52,
          bold: true,
          color: "000000",
          fontFace: fontTitle,
        });

        pSlide.addText(impactStat.label, {
          x: 1.0,
          y: 4.8,
          w: 5.5,
          h: 0.6,
          fontSize: 11,
          color: "333333",
          fontFace: fontBody,
        });

        // Right floating white card
        pSlide.addShape(pptx.ShapeType.roundRect, {
          x: 7.2,
          y: 3.2,
          w: 5.1,
          h: 2.2,
          fill: { color: "FFFFFF" },
          rectRadius: 0.12,
        });

        pSlide.addShape(pptx.ShapeType.roundRect, {
          x: 7.6,
          y: 3.6,
          w: 0.5,
          h: 0.5,
          fill: { color: primaryHex },
          rectRadius: 0.05,
        });

        pSlide.addText(slide.description || "Visualize Every Process Clearly With Structured Steps And Engaging", {
          x: 7.6,
          y: 4.3,
          w: 4.3,
          h: 0.9,
          fontSize: 12,
          bold: true,
          color: "111111",
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
          fontSize: 36,
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
          fontSize: 10,
          bold: true,
          color: "000000",
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
          fontSize: 10,
          bold: true,
          color: "000000",
          fontFace: fontBody,
        });
        pSlide.addText(matrixCards[1]?.stat || "78%", {
          x: 4.6,
          y: 2.7,
          w: 2.4,
          h: 1.0,
          fontSize: 36,
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
          fontSize: 36,
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
          fontSize: 10,
          bold: true,
          color: "000000",
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
          color: currentTextColor,
          fontFace: fontTitle,
        });

        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: 7.6,
            y: 4.4,
            w: 4.7,
            h: 1.0,
            fontSize: 12,
            color: currentMutedColor,
            fontFace: fontBody,
          });
        }

        break;
      }

      case "connectedRings": {
        // Left Column: Title + Subtitle + Big Stat
        pSlide.addText(slide.title, {
          x: 1.0,
          y: 1.2,
          w: 4.2,
          h: 1.4,
          fontSize: 28,
          bold: true,
          color: currentTextColor,
          fontFace: fontTitle,
        });

        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: 1.0,
            y: 2.6,
            w: 4.2,
            h: 0.6,
            fontSize: 11,
            color: currentMutedColor,
            fontFace: fontBody,
          });
        }

        const ringStat = slide.stats?.[0] || { value: "5729+", label: "Highlight Every Milestone Using Connected Readability" };
        pSlide.addText(ringStat.value, {
          x: 1.0,
          y: 3.6,
          w: 4.2,
          h: 1.0,
          fontSize: 42,
          bold: true,
          color: currentTextColor,
          fontFace: fontTitle,
        });
        pSlide.addText(ringStat.label, {
          x: 1.0,
          y: 4.7,
          w: 4.2,
          h: 0.8,
          fontSize: 10,
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
          x: 6.2,
          y: 1.8,
          w: 0,
          h: 3.6,
          line: { color: primaryHex, width: 3 },
        });

        rings.forEach((rg, rIdx) => {
          const ry = 1.4 + rIdx * 1.6;

          // Ring Circle
          pSlide.addShape(pptx.ShapeType.ellipse, {
            x: 5.6,
            y: ry,
            w: 1.2,
            h: 1.2,
            fill: { color: "FFFFFF" },
            line: { color: primaryHex, width: 4 },
          });

          pSlide.addText(`${rg.percentage}%`, {
            x: 5.6,
            y: ry + 0.35,
            w: 1.2,
            h: 0.5,
            fontSize: 11,
            bold: true,
            color: "000000",
            align: "center",
            fontFace: fontTitle,
          });

          // Horizontal pointer line
          pSlide.addShape(pptx.ShapeType.line, {
            x: 6.9,
            y: ry + 0.6,
            w: 0.5,
            h: 0,
            line: { color: primaryHex, width: 2 },
          });

          // Title & Description
          pSlide.addText(rg.title, {
            x: 7.6,
            y: ry + 0.2,
            w: 4.7,
            h: 0.4,
            fontSize: 13,
            bold: true,
            color: currentTextColor,
            fontFace: fontTitle,
          });

          pSlide.addText(rg.description, {
            x: 7.6,
            y: ry + 0.6,
            w: 4.7,
            h: 0.5,
            fontSize: 9,
            color: currentMutedColor,
            fontFace: fontBody,
          });
        });

        break;
      }

      case "cta": {
        pSlide.background = { color: darkHex };

        pSlide.addText(slide.title, {
          x: 1.5,
          y: 2.0,
          w: 10.3,
          h: 1.2,
          fontSize: 32,
          color: "FFFFFF",
          bold: true,
          align: "center",
          fontFace,
        });

        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: 1.5,
            y: 3.3,
            w: 10.3,
            h: 0.8,
            fontSize: 16,
            color: "AAAAAA",
            align: "center",
            fontFace,
          });
        }

        if (slide.ctaText) {
          pSlide.addShape(pptx.ShapeType.roundRect, {
            x: 4.6,
            y: 4.5,
            w: 4.1,
            h: 0.9,
            fill: { color: primaryHex },
            rectRadius: 0.1,
          });

          pSlide.addText(slide.ctaText, {
            x: 4.6,
            y: 4.65,
            w: 4.1,
            h: 0.6,
            fontSize: 13,
            color: "000000",
            bold: true,
            align: "center",
            fontFace,
          });
        }
        break;
      }

      case "breakSlide": {
        pSlide.background = { color: primaryHex };

        pSlide.addText(slide.title, {
          x: 1.5,
          y: 2.5,
          w: 10.3,
          h: 1.2,
          fontSize: 38,
          color: "000000",
          bold: true,
          align: "center",
          fontFace: fontTitle,
        });

        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: 2.0,
            y: 3.8,
            w: 9.3,
            h: 0.8,
            fontSize: 16,
            color: "222222",
            align: "center",
            fontFace,
          });
        }

        const resumeText = slide.ctaText || "We resume at [insert return time]";
        pSlide.addShape(pptx.ShapeType.roundRect, {
          x: 4.2,
          y: 4.8,
          w: 4.9,
          h: 0.7,
          fill: { color: "FFFFFF" },
          rectRadius: 0.35,
          line: { color: "DDDDDD", width: 1 },
        });

        pSlide.addText(resumeText, {
          x: 4.2,
          y: 4.9,
          w: 4.9,
          h: 0.5,
          fontSize: 13,
          color: "000000",
          bold: true,
          align: "center",
          fontFace,
        });
        break;
      }

      case "actionList": {
        const titleY = slide.subtitle ? 0.9 : 1.1;
        pSlide.addText(slide.title, {
          x: 1.0,
          y: titleY,
          w: 11.3,
          h: 0.8,
          fontSize: 24,
          color: currentTextColor,
          bold: true,
          fontFace: fontTitle,
        });

        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: 1.0,
            y: 1.7,
            w: 11.3,
            h: 0.4,
            fontSize: 13,
            color: currentMutedColor,
            fontFace,
          });
        }

        // Left yellow accent line
        pSlide.addShape(pptx.ShapeType.rect, {
          x: 1.0,
          y: 2.3,
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

        const startY = 2.4;
        const itemGap = Math.min(0.95, 4.0 / Math.max(1, items.length));

        items.forEach((item, aIdx) => {
          const rowY = startY + aIdx * itemGap;
          pSlide.addShape(pptx.ShapeType.roundRect, {
            x: 1.3,
            y: rowY,
            w: 10.8,
            h: 0.75,
            fill: { color: isDarkTheme ? "1A1A1A" : "F9F9F9" },
            rectRadius: 0.1,
            line: { color: isDarkTheme ? "333333" : "E5E5E5", width: 1 },
          });

          const displayText = `${aIdx + 1}. ${item.verb ? item.verb.toUpperCase() + ": " : ""}${item.text}`;
          pSlide.addText(displayText, {
            x: 1.5,
            y: rowY + 0.12,
            w: 10.4,
            h: 0.5,
            fontSize: 12,
            color: currentTextColor,
            fontFace,
          });
        });
        break;
      }

      case "cardGrid": {
        pSlide.addText(slide.title, {
          x: 1.0,
          y: 0.9,
          w: 11.3,
          h: 0.7,
          fontSize: 22,
          color: currentTextColor,
          bold: true,
          fontFace: fontTitle,
        });

        const gridCards = slide.cards && slide.cards.length > 0 ? slide.cards : [
          { title: "Shareholder Loan", bullets: ["Interest is deductible", "WHT applies on every payment"], footer: "Hidden cost: cash bleed" },
          { title: "Equity Injection", bullets: ["No interest or WHT going in", "Trapped cash in future"], footer: "Hidden cost: dividends" },
          { title: "Service Fee", bullets: ["Arm's length required", "WHT & VAT applicable"], footer: "Hidden cost: TP documentation" },
        ];

        const cardW = 3.6;
        const gap = 0.3;
        gridCards.slice(0, 3).forEach((card, cIdx) => {
          const cX = 1.0 + cIdx * (cardW + gap);
          // Header strip
          pSlide.addShape(pptx.ShapeType.roundRect, {
            x: cX,
            y: 1.9,
            w: cardW,
            h: 0.6,
            fill: { color: cIdx === 0 ? primaryHex : "1E1E1E" },
            rectRadius: 0.1,
          });

          pSlide.addText(card.title, {
            x: cX + 0.2,
            y: 2.0,
            w: cardW - 0.4,
            h: 0.4,
            fontSize: 13,
            bold: true,
            color: cIdx === 0 ? "000000" : "FFFFFF",
            fontFace,
          });

          // Card body
          pSlide.addShape(pptx.ShapeType.roundRect, {
            x: cX,
            y: 2.5,
            w: cardW,
            h: 3.6,
            fill: { color: isDarkTheme ? "181818" : "FFFFFF" },
            rectRadius: 0.1,
            line: { color: isDarkTheme ? "333333" : "DDDDDD", width: 1 },
          });

          const bulletLines = card.bullets && card.bullets.length > 0 ? card.bullets.map(b => `• ${b}`).join("\n\n") : (card.description || "");
          pSlide.addText(bulletLines, {
            x: cX + 0.25,
            y: 2.7,
            w: cardW - 0.5,
            h: 2.4,
            fontSize: 11,
            color: currentTextColor,
            fontFace,
          });

          if (card.footer) {
            pSlide.addShape(pptx.ShapeType.roundRect, {
              x: cX,
              y: 5.3,
              w: cardW,
              h: 0.8,
              fill: { color: "FFF5CC" },
              rectRadius: 0.1,
              line: { color: "FFE588", width: 1 },
            });
            pSlide.addText(card.footer, {
              x: cX + 0.15,
              y: 5.4,
              w: cardW - 0.3,
              h: 0.6,
              fontSize: 10,
              bold: true,
              color: "854D0E",
              fontFace,
            });
          }
        });
        break;
      }

      case "caseStudy":
      case "splitPoll":
      case "interactiveCase":
      case "keyInsight": {
        // Universal clean high-fidelity rendering for bespoke two-card & key-insight formats
        pSlide.addText(slide.title, {
          x: 1.0,
          y: 0.9,
          w: 11.3,
          h: 0.7,
          fontSize: 22,
          color: currentTextColor,
          bold: true,
          fontFace: fontTitle,
        });

        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: 1.0,
            y: 1.6,
            w: 11.3,
            h: 0.4,
            fontSize: 13,
            color: currentMutedColor,
            fontFace,
          });
        }

        const cardsToDraw = slide.cards && slide.cards.length >= 2 ? slide.cards.slice(0, 2) : [
          { title: "Perspective 01", bullets: slide.bullets?.slice(0, 3) || ["Analysis item A", "Analysis item B"] },
          { title: "Perspective 02", bullets: slide.bullets?.slice(3, 6) || ["Counter-analysis item C", "Decision criteria D"] },
        ];

        const panelW = 5.4;
        cardsToDraw.forEach((cObj, pIdx) => {
          const pX = 1.0 + pIdx * (panelW + 0.5);
          pSlide.addShape(pptx.ShapeType.roundRect, {
            x: pX,
            y: 2.2,
            w: panelW,
            h: 3.2,
            fill: { color: isDarkTheme ? "1A1A1A" : "FAFAFA" },
            rectRadius: 0.1,
            line: { color: isDarkTheme ? "333333" : "E0E0E0", width: 1 },
          });

          pSlide.addText(cObj.title, {
            x: pX + 0.3,
            y: 2.4,
            w: panelW - 0.6,
            h: 0.4,
            fontSize: 14,
            bold: true,
            color: pIdx === 0 ? "854D0E" : currentTextColor,
            fontFace,
          });

          const pBullets = cObj.bullets ? cObj.bullets.map(b => `• ${b}`).join("\n\n") : (cObj.description || "");
          pSlide.addText(pBullets, {
            x: pX + 0.3,
            y: 2.9,
            w: panelW - 0.6,
            h: 2.2,
            fontSize: 11,
            color: currentTextColor,
            fontFace,
          });
        });

        // Bottom Callout or Banner
        if (slide.calloutBox || slide.quote) {
          const bText = slide.calloutBox ? `${slide.calloutBox.title || "Note"}: ${slide.calloutBox.text}` : `"${slide.quote?.text}"`;
          pSlide.addShape(pptx.ShapeType.roundRect, {
            x: 1.0,
            y: 5.7,
            w: 11.3,
            h: 0.8,
            fill: { color: "111111" },
            rectRadius: 0.1,
          });
          pSlide.addText(bText, {
            x: 1.3,
            y: 5.85,
            w: 10.7,
            h: 0.5,
            fontSize: 11,
            color: "FFFFFF",
            bold: true,
            fontFace,
          });
        }
        break;
      }
    }
  });

  const fileName = `${(options.deckTitle || "Presentation").replace(/[^a-zA-Z0-9_-]/g, "_")}.pptx`;
  await pptx.writeFile({ fileName });
}
