import OpenAI from "openai";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const deepseek = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY || "dummy_key",
});

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
    | "closingAction";
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
  pairedRows?: Array<{ left: string; right: string; leftLead?: string; rightLead?: string }>;
  stackCards?: Array<{ title: string; tag?: string; description: string }>;
  railSteps?: Array<{ stepNumber?: number | string; title: string; description?: string }>;
  ascendingLevels?: Array<{ levelNumber?: string | number; title: string; description?: string; tag?: string }>;
  checklistItems?: string[];
  insightBarText?: string;
  noteBoxText?: string;
  contactFooterText?: string;
  speakerNotes?: string;
  topRightPill?: string;
  ctaText?: string;
  footer?: string;
  slideNumber?: string;
  imageUrl?: string;
}

const LAUNCHER_SYSTEM_PROMPT = `
You are the world-class Presentation Engine for Launcher OS, engineered to create elite executive presentations (McKinsey/Bain/Apple standard).
Your mission is to strictly follow the user's instructions and prompt while transforming raw content into an ultra-polished, visually tailored 16:9 executive presentation deck.

=== 1. USER INSTRUCTION FIDELITY (RULE #1: NEVER "MENENTUKAN SENDIRI") ===
- STRICTLY RESPECT THE USER'S INTENT: If the user provides a specific number of slides, specific slide titles, requested layouts (e.g. Table, Process, Timeline, Two Column, Hero, Chart), or a structured outline (Gamma format, numbered format, markdown), YOU MUST FOLLOW THE USER'S STRUCTURE 1-TO-1.
- DO NOT invent arbitrary storytelling arcs that contradict the user's instructions. If the user asks for 4 slides, output exactly 4 slides. If the user provides an outline with 10 slides, output exactly 10 slides.
- DO NOT dumb down or truncate the user's substantive thoughts into superficial 2-word bullet points.
- PRESERVE 100% OF KEY USER FACTS, domain-specific terminology, technical concepts, and structural logic. Elevate informal phrasing into crisp, authoritative executive language.

=== 2. VISUAL LAYOUT CATALOG & STRICT DATA CONTRACTS ===
Choose the layout that BEST visualizes the specific slide content, or follows the active template guidelines. Each layout requires specific JSON fields:

1. "hero" (Title / Cover / Opening / Major Milestone):
   - Fields: title, subtitle, description, badge, category, bgStyle ("white" | "yellowGradient" | "boldYellow")

2. "sectionDivider" (Section / Module / Part Break Slide):
   - Use for starting a major section, module, or topic transition.
   - Fields: title (Large bold claim), subtitle, badge ("BAGIAN 1" | "MODUL 2" | "PART A"), bgStyle: "boldYellow"

3. "pairedRows" (Problem → Solution / Weak → Robust / Threat → Mitigation):
   - Perfect for comparisons where each problem/issue maps directly to a concrete operational fix.
   - Fields: title, subtitle, badge
   - pairedRows: [
       { "left": "Clear statement of the problem or vulnerability", "right": "Concrete operational fix or response" },
       { "left": "Second issue or weak practice", "right": "Second countermeasure or standard" },
       { "left": "Third issue or risk", "right": "Third countermeasure or standard" }
     ]
   - Optional: insightBarText ("Key leadership shift: explanation of the overarching principle")

4. "horizontalStack" (Parallel Strategic Pillars / CIA Triad / Core Dimensions):
   - Ideal for 2 to 4 equal-weight core principles, definitions, or foundational pillars.
   - Fields: title, subtitle, badge
   - stackCards: [
       { "title": "Pillar 1 Title", "tag": "UPPERCASE TAG", "description": "Concise executive definition or operational mandate." },
       { "title": "Pillar 2 Title", "tag": "UPPERCASE TAG", "description": "Concise executive definition or operational mandate." },
       { "title": "Pillar 3 Title", "tag": "UPPERCASE TAG", "description": "Concise executive definition or operational mandate." }
     ]
   - Optional: noteBoxText ("Rule or Note: specific context for applying these pillars")

5. "connectedRailStepper" (Continuous Rail Step Process / Sequential Lifecycle):
   - Best for 4 to 5 sequential phases (e.g. Detect → Isolate → Investigate → Recover → Evaluate).
   - Fields: title, subtitle, badge
   - railSteps: [
       { "stepNumber": 1, "title": "Phase 1 Name", "description": "Crisp action required in phase 1." },
       { "stepNumber": 2, "title": "Phase 2 Name", "description": "Crisp action required in phase 2." },
       { "stepNumber": 3, "title": "Phase 3 Name", "description": "Crisp action required in phase 3." },
       { "stepNumber": 4, "title": "Phase 4 Name", "description": "Crisp action required in phase 4." },
       { "stepNumber": 5, "title": "Phase 5 Name", "description": "Crisp action required in phase 5." }
     ]
   - Optional: insightBarText ("Wawasan kunci: single most critical lesson across this lifecycle")

6. "ascendingColumns" (Progressive Maturity Levels / Tiered Escalation):
   - Best for staged growth, capability maturity models, or rising intensity.
   - Fields: title, subtitle, badge
   - ascendingLevels: [
       { "tag": "LEVEL 1", "title": "Initial / Reactive", "description": "Ad-hoc actions taken only after incidents." },
       { "tag": "LEVEL 2", "title": "Managed / Standard", "description": "Defined policies and basic controls active." },
       { "tag": "LEVEL 3", "title": "Measured / Quantitative", "description": "Metrics and automated telemetry active." },
       { "tag": "LEVEL 4", "title": "Adaptive / Optimized", "description": "Continuous learning and proactive refinement." }
     ]

7. "checklist" (Governance Checklist / Operational Verification Matrix):
   - Best for audit requirements, leadership sign-offs, and verification steps (4 to 8 items).
   - Fields: title, subtitle, badge ("CHECKLIST" | "6 BUTIR")
   - checklistItems: [
       "Concrete verification item 1",
       "Concrete verification item 2",
       "Concrete verification item 3",
       "Concrete verification item 4",
       "Concrete verification item 5",
       "Concrete verification item 6"
     ]

8. "closingAction" (Next Steps / Action Plan / Immediate Leadership Commitments):
   - Best for concluding deck with immediate, practical, high-conviction actions.
   - Fields: title ("Three Actions This Week" / "Langkah Konkret"), subtitle, badge ("LANGKAH BERIKUTNYA")
   - bullets: ["Concrete action 1 to take immediately", "Concrete question to ask the team", "Concrete policy to establish today"]
   - contactFooterText: "Helpdesk or contact info: [department contact / security channel]"

9. "bullets" (Rich Multi-Card Insights / Core Concepts):
   - Fields: title, subtitle, description, badge, bullets: ["Concept 1: In-depth rationale & impact", "Concept 2: In-depth rationale & impact", "Concept 3: In-depth rationale & impact"]

10. "twoColumn" (Side-by-Side Comparison / Dual Perspectives):
    - Fields: title, subtitle, badge, bullets: ["Perspective A point 1", "Perspective A point 2"], description: "Perspective B synthesis or contextual explanation"

11. "tableComparison" (Multi-Dimension Comparison Matrix / Feature Comparison):
    - Fields: title, subtitle, badge, tableHeaders: ["Dimension", "Current", "Proposed"], tableRows: [{ "feature": "Dim 1", "current": "...", "proposed": "..." }]

12. "flowDiagram" (System Architecture / Connected Workflow):
    - Fields: title, subtitle, badge, flowNodes: [{ "title": "Stage 1", "subtitle": "Details", "tag": "01" }, { "title": "Stage 2", "subtitle": "Details", "tag": "02" }]

13. "stats" (Key Quantitative Metrics):
    - ONLY use when real numerical data exists in user content!
    - Fields: title, subtitle, badge, stats: [{ "value": "94%", "label": "Retention Rate" }]

14. "keyInsight" (Executive Pull-Quote / Highlight Synthesis):
    - Fields: title, subtitle, description, badge, quote: { "text": "Core quote or guiding thesis", "author": "Source or Executive Takeaway" }

=== 3. TEMPLATE-AGNOSTIC & DYNAMIC DESIGN RULES ===
- If a custom design guideline, institutional template (e.g. ITB, UI, Binus, ITS), or reference style is provided in the prompt, STRICTLY ADAPT to that template's rules:
  * Emulate its tone of voice, terminology, and component preferences.
  * Do not invent arbitrary decorations not supported by the template.
- ACTION TITLES: Every slide title MUST state the core conclusion/claim in an active sentence (5-9 words), NEVER end with a period.
- SPEAKER NOTES: Provide "speakerNotes" for EVERY slide (2-4 sentences explaining pedagogical intent, key takeaway, and timing).
- NO INVENTED NUMBERS: Never invent fake metrics. If numbers are not in the prompt, use qualitative logic or visible bracket placeholders like [X]%.

=== 4. OUTPUT FORMAT ===
Return ONLY a valid, parseable JSON array of slide objects matching the schema. No markdown codeblock wrapper, no preamble, no commentary.

=== 5. LANGUAGE RULE (SUPREME PRIORITY) ===
If the user's content explicitly requests a specific language (e.g. "in English", "bahasa inggris", "dalam bahasa Inggris"), ALL generated text — titles, subtitles, descriptions, bullets, processSteps, speakerNotes, and every text field — MUST be written ENTIRELY in that requested language. Do NOT mix languages. Do NOT default to Indonesian when English is requested. The user's language instruction ALWAYS overrides template examples.
`;

function extractDashSlideBlocks(text: string): string[] {
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      content,
      density = "medium",
      bgStylePreference = "mixed",
      customBgColors,
      titleFont = "sf-pro",
      bodyFont = "sf-pro",
      slideCountPreference = "8",
      audience = "Executives & C-Level",
      purpose = "Pitch Idea & Strategy",
      layoutMood = "framework",
      specialNotes = "",
      customBrainInstruction = "",
      templateRulesMarkdown = "",
      templateName = "",
      clonedStyleDirectives = "",
      clonedReferenceSummary = "",
    } = body;

    const rulesDoc = (templateRulesMarkdown || clonedStyleDirectives || "").trim();

    // ──── LANGUAGE DETECTION ────
    let detectedLanguage = "";
    if (/(?:in\s+english|bahasa\s*inggris|dalam\s*(?:bahasa\s*)?inggris|use\s+english|english\s+(?:language|version|deck|presentation))/i.test(content)) {
      detectedLanguage = "English";
    } else if (/(?:bahasa\s*indonesia|dalam\s*(?:bahasa\s*)?indonesia|gunakan\s*(?:bahasa\s*)?indonesia|indonesian)/i.test(content)) {
      detectedLanguage = "Indonesian (Bahasa Indonesia)";
    } else if (/(?:bahasa\s*jepang|japanese|日本語)/i.test(content)) {
      detectedLanguage = "Japanese";
    } else if (/(?:bahasa\s*mandarin|chinese|中文)/i.test(content)) {
      detectedLanguage = "Chinese";
    }
    const languageDirective = detectedLanguage
      ? `\n⚠️ MANDATORY LANGUAGE OVERRIDE: ALL generated slide text (titles, subtitles, descriptions, bullets, processSteps, stats labels, speakerNotes, and every text field) MUST be written ENTIRELY in ${detectedLanguage}. Do NOT use any other language. This is the highest priority rule.\n`
      : "";

    // 1. Detect explicit #Slide format (#Slide 1 .. #Slide N or Slide 1:)
    const explicitSlideMatches = [...content.matchAll(/(?:^|\n)\s*#?\s*Slide\s*\d+[^\n]*/gi)];
    const hasExplicitSlides = explicitSlideMatches.length > 0;

    // 2. Detect dash-separated markdown format (----- or ---)
    const dashBlocks = extractDashSlideBlocks(content as string);
    const hasDashFormat = dashBlocks.length > 1;

    // 3. Detect numbered slide format (e.g. 1. Slide 1 (Bar Chart): ...)
    const numberedMatches = [...content.matchAll(/(?:^|\n)\s*(?:\d+[\.\)]\s*)?Slide\s*\d+[^:\n]*[:·\-]/gi)];
    const hasNumberedSlides = numberedMatches.length > 1;

    // 4. Detect in-text prompt count ("5-slide", "create a 5 slide", "39 slides", etc.)
    const promptCountMatch = content.match(/(\d+)\s*[-_]?\s*(?:slide|slides|halaman|deck)/i);
    const promptCount = promptCountMatch ? parseInt(promptCountMatch[1], 10) : null;

    const targetSlides = hasExplicitSlides
      ? explicitSlideMatches.length
      : hasDashFormat
      ? dashBlocks.length
      : hasNumberedSlides
      ? numberedMatches.length
      : promptCount && promptCount >= 1 && promptCount <= 100
      ? promptCount
      : parseInt(slideCountPreference.match(/\d+/)?.[0] || "5", 10);

    const densityDirectives: Record<string, string> = {
      brief: "BRIEF: Clear, punchy executive bullet points and concise explanations.",
      medium: "MEDIUM: Balanced executive density with complete sentences and structured points.",
      detailed: "DETAILED: In-depth explanations, rich operational context, and comprehensive narrative.",
      preserve: "PRESERVE EXACT CONTENT: Verbatim mapping of user phrases and terminology.",
    };

    const bgStyleDirectives: Record<string, string> = {
      mixed: "SMART DYNAMIC MIX: Use 'white' (60-70%) for content, 'yellowGradient' (15-20%) for hero/milestones, and 'boldYellow' (15-20%) for impact/title.",
      solid: "CLEAN SOLID CANVAS: Keep all slides strictly on clean white background ('white').",
      dualtone: "DUAL-TONE SPLIT: Dynamic two-tone color-blocking panels.",
      gradient: "AMBIENT GRADIENT: Subtle warm ambient gradients across slides.",
    };

    const customColorNote = customBgColors
      ? `Custom Theme Palette active (Primary: ${customBgColors.color1 || "#FFDE3C"}).`
      : "Standard Launcher OS Palette active.";

    const userPrompt = `
RAW CONTENT / OUTLINE:
"""
${content}
"""

PRESENTATION PARAMETERS:
- Content Density (${density}): ${densityDirectives[density] || densityDirectives.medium}
- Slide Background Rhythm (${bgStylePreference}): ${bgStyleDirectives[bgStylePreference] || bgStyleDirectives.mixed} (${customColorNote})
- Target Slide Count: Exactly ${targetSlides} slides (CRITICAL: Output must contain EXACTLY ${targetSlides} slides)
- Target Audience: ${audience}
- Deck Purpose: ${purpose}
- Special Notes/Instructions: ${specialNotes || "None"}
${customBrainInstruction && customBrainInstruction.trim().length > 0 ? `\nUSER CUSTOM AI BRAIN & GUIDELINES (ACTIVE):\n"""\n${customBrainInstruction.trim()}\n"""\n` : ""}

${rulesDoc.length > 0 ? `
================================================================================
👑 GOVERNING DESIGN CONTRACT & ARCHITECTURAL RULES (.MD) (UNABRIDGED & MANDATORY):
Source Document: ${templateName || "Institutional Design Specification"}
================================================================================
${rulesDoc}
================================================================================
MANDATORY COMPLIANCE INSTRUCTIONS:
- Faithfully study and execute the governing .md document above in its entirety.
- Use the visual archetypes specified in the document:
  * "pairedRows": Problems vs Solutions / Threats vs Responses / Weak vs Robust
  * "horizontalStack": Strategic core pillars / CIA Triad (3-4 full-width stack cards)
  * "connectedRailStepper": Continuous lifecycle / attack chain stepper
  * "ascendingColumns": Tiered maturity levels / intensity scale
  * "checklist": 2-column governance verification checklist
  * "closingAction": Final executive action plan + contact footer
  * "sectionDivider": High-contrast section / module transition
  * "tableComparison": Structured matrix table
  * "twoColumn": Full-width multi-card layout
- Obey the Rule of Rhythm: Never repeat the same layout more than twice in a row.
- Formulate substantive Action Titles (5-9 words) with NO trailing period.
` : ""}

INSTRUCTIONS:
- Adapt layouts naturally to the content by selecting the best Master Archetypes ("pairedRows", "horizontalStack", "connectedRailStepper", "ascendingColumns", "checklist", "closingAction", "sectionDivider", "tableComparison", "twoColumn", "stats", "hero").
- DO NOT generate Bar Charts or Pie/Donut Charts unless the content explicitly includes numerical breakdown data!
- Ensure all text from the user's outline is preserved in rich, clear format.
- Adhere to the user's custom brain and persona guidelines above.
${languageDirective}
Generate exactly ${targetSlides} structured slides in strict JSON array format.
`;

    // Support multi-provider BYOK or Server Env Key
    const userApiKey = body.apiKey || req.headers.get("x-deepseek-api-key") || process.env.DEEPSEEK_API_KEY;
    const modelToUse = body.model || "deepseek-chat";
    const provider = body.provider || "deepseek";

    const providerBaseUrls: Record<string, string> = {
      deepseek: "https://api.deepseek.com",
      openai: "https://api.openai.com/v1",
      gemini: "https://generativelanguage.googleapis.com/v1beta/openai",
    };

    if (userApiKey && userApiKey !== "dummy_key" && userApiKey.trim().length > 0) {
      try {
        const aiClient = new OpenAI({
          baseURL: providerBaseUrls[provider] || providerBaseUrls.deepseek,
          apiKey: userApiKey.trim(),
          timeout: 45000,
        });

        const response = await aiClient.chat.completions.create({
          model: modelToUse,
          temperature: 0.3,
          messages: [
            { role: "system", content: LAUNCHER_SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
          stream: false,
        });

        const rawOutput = response.choices[0]?.message?.content?.trim() || "";
        let parsedSlides: SlideData[] | null = null;

        const cleanedJson = rawOutput.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "").trim();
        
        try {
          const parsed = JSON.parse(cleanedJson);
          if (Array.isArray(parsed) && parsed.length > 0) {
            parsedSlides = parsed;
          }
        } catch {
          const arrayMatch = rawOutput.match(/\[\s*\{[\s\S]*\}\s*\]/);
          if (arrayMatch) {
            try {
              const parsed = JSON.parse(arrayMatch[0]);
              if (Array.isArray(parsed) && parsed.length > 0) {
                parsedSlides = parsed;
              }
            } catch (err2) {
              console.error("Secondary JSON parse error:", err2);
            }
          }
        }

        if (parsedSlides && parsedSlides.length > 0) {
          const sanitized = parsedSlides.slice(0, targetSlides).map((s, idx) => normalizeApiSlide(s, idx));
          return new Response(JSON.stringify({ success: true, slides: sanitized, source: provider }), {
            headers: { "Content-Type": "application/json" },
          });
        }
      } catch (apiErr) {
        console.error(`${provider} API Execution Error:`, apiErr);
      }
    }

    // High-quality deterministic content-adaptive fallback engine
    const generatedSlides: SlideData[] = generateLauncherArchetypeSlides(content, targetSlides, purpose, audience, layoutMood, density, bgStylePreference);
    const sanitized = generatedSlides.slice(0, targetSlides).map((s, idx) => normalizeApiSlide(s, idx));

    return new Response(JSON.stringify({ success: true, slides: sanitized }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Deck Generation API Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// ──── HELPER: Extract Chart Data from raw text only when numbers exist ────
function extractChartSeries(text: string, defaultType: "bar" | "donut" = "bar"): Array<{ name: string; value: number; label?: string }> | undefined {
  const regex = /([A-Za-z0-9\s\-_]+)[:\s\(]+(?:\$|€|£)?\s*([\d\.]+)\s*(?:K|M|B|%)?\s*\)?/gi;
  const matches = [...text.matchAll(regex)];
  
  if (matches.length >= 2) {
    return matches.slice(0, 6).map(m => {
      const name = m[1].replace(/^(?:projected|estimated|target)\s+/i, "").trim();
      const val = parseFloat(m[2]) || 0;
      return {
        name: name.length > 25 ? name.substring(0, 25) : name,
        value: val,
      };
    });
  }
  return undefined;
}

// ──── HELPER: Extract Numeric Stats from raw text ────
function extractNumericStats(text: string): Array<{ value: string; label: string }> | undefined {
  const stats: Array<{ value: string; label: string }> = [];
  const p1 = /([A-Za-z\s]+?)\s*[:=]\s*([+\-]?\$?[\d\.]+\s*(?:%|K|M|B|\/\d+(?:\.\d+)?)?)/gi;
  const m1 = [...text.matchAll(p1)];
  
  for (const m of m1) {
    const label = m[1].trim();
    const val = m[2].trim();
    if (label && val && label.length < 35 && !label.toLowerCase().includes("slide") && !label.toLowerCase().includes("headline")) {
      stats.push({ value: val, label });
    }
  }

  if (stats.length >= 1) {
    return stats.slice(0, 4);
  }
  return undefined;
}

// ──── HELPER: Parse Markdown Table (| Col 1 | Col 2 |) ────
function parseMarkdownTable(text: string): { headers: string[]; rows: Array<{ feature?: string; current?: string | boolean; proposed?: string | boolean; cells?: Array<string | boolean> }> } | null {
  const tableLines = text
    .split("\n")
    .map(l => l.trim())
    .filter(l => l.startsWith("|") && l.endsWith("|"));
  
  if (tableLines.length >= 2) {
    const headerLine = tableLines[0];
    const headers = headerLine
      .split("|")
      .slice(1, -1)
      .map(s => s.trim().replace(/\*\*/g, ""))
      .filter(Boolean);

    const bodyLines = tableLines
      .slice(1)
      .filter(l => !/^\|[\s\-:]+(\|[\s\-:]+)+\|$/.test(l));

    if (bodyLines.length > 0) {
      const rows = bodyLines.map(line => {
        const cells = line
          .split("|")
          .slice(1, -1)
          .map(c => c.trim().replace(/\*\*/g, ""));
        return {
          cells,
          feature: cells[0] || "",
          current: cells[1] || "",
          proposed: cells[2] || "",
        };
      });
      return { headers: headers.length > 0 ? headers : ["Feature", "Current", "Proposed"], rows };
    }
  }
  return null;
}

function cleanInlineMarkdown(text: string): string {
  if (!text) return "";
  return text
    .replace(/^#+\s*/, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/^>\s*/, "")
    .trim();
}

// ──── HELPER: Extraction Utilities for Rich Slide Components ────
function extractActionItems(text: string): Array<{ verb?: string; text: string; tag?: string }> | undefined {
  const matches = [...text.matchAll(/(?:^|\n)\s*(\d+)[\.\)]\s*(?:\*\*(.*?)\*\*|\b([A-Z][a-z]+)\b:?)\s*(.*)/g)];
  if (matches.length >= 2) {
    return matches.map(m => {
      const verb = (m[2] || m[3] || "").trim();
      let rest = (m[4] || "").trim();
      let tag: string | undefined = undefined;
      const tagMatch = rest.match(/\[(.*?)\]|\((.*?)\)/);
      if (tagMatch) {
        tag = tagMatch[1] || tagMatch[2];
        rest = rest.replace(/\[(.*?)\]|\((.*?)\)/, "").trim();
      }
      return {
        verb: verb || undefined,
        text: cleanInlineMarkdown(rest),
        tag,
      };
    });
  }
  return undefined;
}

function extractPollOptions(text: string): Array<{ label: string; text: string; isHighlighted?: boolean }> | undefined {
  const matches = [...text.matchAll(/(?:^|\n)\s*[•\-\*]?\s*([A-D])[\)\.]\s*(.*)/g)];
  if (matches.length >= 2) {
    return matches.map(m => ({
      label: m[1].toUpperCase(),
      text: cleanInlineMarkdown(m[2]),
      isHighlighted: m[2].toLowerCase().includes("winner") || m[2].toLowerCase().includes("correct"),
    }));
  }
  return undefined;
}

function extractCalloutBox(text: string): { title?: string; text: string; variant?: "yellow" | "black" | "accent" | "gray" } | undefined {
  const patterns = [
    { regex: /(?:^|\n)\s*(?:[•\-\*]\s+)?(?:\*\*|#)?\s*(?:The question for the room|Question for the room):\s*(?:\*\*)?\s*([^\n]+(?:\n[^\n]+)*)/i, title: "The Question for the Room", variant: "black" as const },
    { regex: /(?:^|\n)\s*(?:[•\-\*]\s+)?(?:\*\*|#)?\s*(?:The problem we have not solved yet):\s*(?:\*\*)?\s*([^\n]+(?:\n[^\n]+)*)/i, title: "The Problem We Have Not Solved Yet", variant: "black" as const },
    { regex: /(?:^|\n)\s*(?:[•\-\*]\s+)?(?:\*\*|#)?\s*(?:Check your prediction):\s*(?:\*\*)?\s*([^\n]+(?:\n[^\n]+)*)/i, title: "Check Your Prediction", variant: "yellow" as const },
    { regex: /(?:^|\n)\s*(?:[•\-\*]\s+)?(?:\*\*|#)?\s*(?:In short):\s*(?:\*\*)?\s*([^\n]+)/i, title: "In Short", variant: "black" as const },
    { regex: /(?:^|\n)\s*(?:[•\-\*]\s+)?(?:\*\*|#)?\s*(?:Why it matters):\s*(?:\*\*)?\s*([^\n]+)/i, title: "Why It Matters", variant: "gray" as const },
    { regex: /(?:^|\n)\s*(?:[•\-\*]\s+)?(?:\*\*|#)?\s*(?:Remember):\s*(?:\*\*)?\s*([^\n]+)/i, title: "Remember", variant: "accent" as const },
  ];

  for (const p of patterns) {
    const m = text.match(p.regex);
    if (m) {
      return {
        title: p.title,
        text: cleanInlineMarkdown(m[1].trim()),
        variant: p.variant,
      };
    }
  }
  return undefined;
}

function extractBottomBanners(text: string): Array<{ title: string; text: string; variant?: "yellow" | "black" | "gray" }> | undefined {
  const banners: Array<{ title: string; text: string; variant?: "yellow" | "black" | "gray" }> = [];
  
  const dpMatch = text.match(/(?:^|\n)\s*>\s*💡\s*(?:\*\*)?Decision point(?:\s*\([^)]*\))?:?\s*(?:\*\*)?\s*([^\n]+)/i);
  if (dpMatch) {
    banners.push({
      title: "Decision Point",
      text: cleanInlineMarkdown(dpMatch[1]),
      variant: "yellow",
    });
  }

  const wiMatch = text.match(/(?:^|\n)\s*>\s*🔄\s*(?:\*\*)?What if(?:\s*\([^)]*\))?:?\s*(?:\*\*)?\s*([^\n]+)/i);
  if (wiMatch) {
    banners.push({
      title: "What If",
      text: cleanInlineMarkdown(wiMatch[1]),
      variant: "black",
    });
  }

  return banners.length > 0 ? banners : undefined;
}

function extractQuote(text: string): { text: string; author?: string } | undefined {
  const qMatch = text.match(/(?:^|\n)\s*>\s*\*"([^"]+)"\*(?:\s*—\s*([^\n]+))?/);
  if (qMatch) {
    return {
      text: qMatch[1].trim(),
      author: qMatch[2]?.trim(),
    };
  }
  const q2Match = text.match(/(?:^|\n)\s*>\s*"([^"]+)"(?:\s*—\s*([^\n]+))?/);
  if (q2Match) {
    return {
      text: q2Match[1].trim(),
      author: q2Match[2]?.trim(),
    };
  }
  return undefined;
}

function extractTopRightPill(text: string, visualText?: string): string | undefined {
  if (visualText) {
    const m = visualText.match(/(?:tag(?:ged)?(?:\s+the\s+slide)?\s*["']([^"']+)["']|tag\s+reading\s*["']([^"']+)["']|tag\s+beside\s*["'][^"']+["']\s*reads\s*["']([^"']+)["'])/i);
    if (m) return m[1] || m[2] || m[3];
  }
  const subMatch = text.match(/Subheadline:\s*\*([^*]+)\*/i);
  if (subMatch && subMatch[1].length < 40) {
    return subMatch[1].replace(/\.$/, "").trim();
  }
  return undefined;
}

function extractCards(text: string): Array<{
  title: string;
  subtitle?: string;
  description?: string;
  tag?: string;
  bullets?: string[];
  footer?: string;
  headerBg?: "yellow" | "black" | "gray";
  content?: string;
}> | undefined {
  const topSections = text.split(/(?:^|\n)\s*-\s*\*\*([^*]+)\*\*\s*\n/);
  if (topSections.length >= 3) {
    const cards: Array<any> = [];
    for (let i = 1; i < topSections.length; i += 2) {
      const cardTitle = topSections[i].trim();
      const cardBody = topSections[i + 1] || "";
      const lines = cardBody
        .split("\n")
        .map(l => l.trim())
        .filter(Boolean);
      
      const bullets: string[] = [];
      let footer: string | undefined = undefined;

      for (const line of lines) {
        if (/^\s*-\s*\*\*(?:Hidden cost|In short|Key risk|Outcome):\*\*/i.test(line)) {
          footer = cleanInlineMarkdown(line);
        } else if (/^\s*-\s*/.test(line)) {
          bullets.push(cleanInlineMarkdown(line.replace(/^\s*-\s*/, "")));
        }
      }

      cards.push({
        title: cardTitle,
        bullets: bullets.length > 0 ? bullets : undefined,
        footer,
        headerBg: i === 1 ? "yellow" : "gray",
      });
    }
    if (cards.length >= 2) return cards;
  }
  return undefined;
}

// ──── HELPER: Smart Visual Layout Resolver ────
function mapVisualTextToLayout(visualText: string, rawCopy: string, title: string, index: number, totalSlides: number, hasMarkdownTable: boolean = false): {
  layout: SlideData["layout"];
  bgStyle: SlideData["bgStyle"];
  ctaText?: string;
} {
  const v = (visualText || "").toLowerCase();
  const t = (title || "").toLowerCase();
  const c = (rawCopy || "").toLowerCase();

  // 1. Section Divider / Module Transition
  if (v.includes("section divider") || v.includes("pembagi bab") || (t.startsWith("bagian ") || t.startsWith("part ") || t.startsWith("modul "))) {
    return { layout: "sectionDivider", bgStyle: "boldYellow" };
  }

  // 2. Break Slide (Session Pause)
  if (v.includes("break") || t.includes("break:") || t.includes("istirahat")) {
    return { layout: "breakSlide", bgStyle: "boldYellow", ctaText: "We resume shortly" };
  }

  // 3. Paired Rows (Problem → Solution / Threat → Mitigation / Weak → Robust)
  if (v.includes("paired") || v.includes("masalah") || v.includes("ancaman dan respons") || t.includes("ancaman") || t.includes("kelemahan dan perbaikan") || (c.includes("→") && c.split("→").length >= 3)) {
    return { layout: "pairedRows", bgStyle: "white" };
  }

  // 4. Horizontal Stack Cards (CIA Triad / Strategic Core Pillars)
  if (v.includes("horizontal stack") || v.includes("stack cards") || v.includes("triad") || t.includes("tiga tujuan") || (v.includes("pillar") && v.includes("horizontal"))) {
    return { layout: "horizontalStack", bgStyle: "white" };
  }

  // 5. Connected Rail Stepper (Continuous Rail Stepper / Sequential Lifecycle)
  if (v.includes("connected stepper") || v.includes("rail") || t.includes("rantai serangan") || t.includes("respons insiden") || (v.includes("stepper") && v.includes("rail"))) {
    return { layout: "connectedRailStepper", bgStyle: "white" };
  }

  // 6. Ascending Columns (Progressive Maturity Levels / Tiered Escalation)
  if (v.includes("ascending") || v.includes("intensity") || v.includes("level kematangan") || t.includes("level kematangan") || v.includes("maturity")) {
    return { layout: "ascendingColumns", bgStyle: "white" };
  }

  // 7. Executive Checklist (2-Column Governance Checklist)
  if (v.includes("checklist") || v.includes("daftar periksa") || t.includes("checklist")) {
    return { layout: "checklist", bgStyle: "white" };
  }

  // 8. Closing Action Plan / Next Steps (Final Slide)
  if (index === totalSlides - 1 || v.includes("closing") || v.includes("what's next") || t.includes("tiga tindakan") || t.includes("langkah berikutnya") || v.includes("tindakan minggu ini")) {
    return { layout: "closingAction", bgStyle: "boldYellow", ctaText: "Execute Next Steps →" };
  }

  // 9. Table / Matrix / Comparison
  if (hasMarkdownTable || v.includes("table") || v.includes("matrix") || v.includes("matriks") || v.includes("tabel") || v.includes("decision matrix") || v.includes("comparison table")) {
    return { layout: "tableComparison", bgStyle: "white" };
  }

  // 10. Hero / Title / Cover
  if (v.includes("title layout") || v.includes("hero") || v.includes("cover") || v.includes("opening") || index === 0) {
    return { layout: "hero", bgStyle: index === 0 ? "white" : "yellowGradient" };
  }

  // 11. Timeline / Roadmap / Milestones
  if (v.includes("timeline") || v.includes("roadmap") || v.includes("milestone") || v.includes("linimasa") || t.includes("roadmap") || t.includes("timeline")) {
    return { layout: "timeline", bgStyle: "white" };
  }

  // 12. Process / Step / SOP / Framework
  if (v.includes("step") || v.includes("process") || v.includes("how-to") || v.includes("framework") || v.includes("stages") || v.includes("alur") || t.includes("framework") || t.includes("langkah") || t.includes("tahapan")) {
    return { layout: "process", bgStyle: "white" };
  }

  // 13. Flow Diagram / Architecture / Wiring
  if (v.includes("flow diagram") || v.includes("architecture") || v.includes("wiring") || (v.includes("flow") && !v.includes("working capital"))) {
    return { layout: "flowDiagram", bgStyle: "white" };
  }

  // 14. Card Grid / 3-Column / Pillars
  if (v.includes("three-column") || v.includes("card grid") || v.includes("three-card") || v.includes("pillar") || v.includes("cards")) {
    return { layout: "cardGrid", bgStyle: "white" };
  }

  // 15. Two Column / Split-Screen / Side-by-Side / Contrast
  if (v.includes("two-column") || v.includes("two column") || v.includes("split") || v.includes("contrast") || v.includes("side-by-side") || t.includes("vs") || t.includes("versus")) {
    return { layout: "twoColumn", bgStyle: "white" };
  }

  // 16. Stats / Metrics
  if (v.includes("stat") || v.includes("metric") || v.includes("kpi") || v.includes("angka")) {
    return { layout: "stats", bgStyle: "white" };
  }

  // 17. Charts
  if (v.includes("bar chart") || v.includes("grafik batang")) {
    return { layout: "chartBar", bgStyle: "white" };
  }
  if (v.includes("donut") || v.includes("pie chart") || v.includes("grafik lingkaran")) {
    return { layout: "chartDonut", bgStyle: "white" };
  }

  // 18. Key Insight / Pull-Quote / Highlight / Synthesis
  if (v.includes("key insight") || v.includes("pull-quote") || v.includes("quote") || v.includes("synthesis") || v.includes("takeaway") || c.includes("> *\"") || c.includes("> \"") || t.includes("💡")) {
    return { layout: "keyInsight", bgStyle: "yellowGradient" };
  }

  // 19. Case Study / Case Card / Scenario
  if (v.includes("case study") || v.includes("case card") || v.includes("kasus") || v.includes("scenario")) {
    return { layout: "caseStudy", bgStyle: "white" };
  }

  // 16. Fallback Storytelling Arc:
  // Slide 1: Hero / Cover
  if (index === 0 && totalSlides > 1) {
    return { layout: "hero", bgStyle: "white" };
  }

  // Final Slide: Bold Statement / Call to Action close
  if (index === totalSlides - 1 && totalSlides >= 3) {
    return { layout: "boldStatement", bgStyle: "boldYellow", ctaText: "Execute Next Steps →" };
  }

  // Middle Slides: Dynamic Visual Rotation (Anti-Monoton Arc)
  const middleLayouts: SlideData["layout"][] = ["twoColumn", "process", "timeline", "tableComparison", "cardGrid", "bullets"];
  const dynamicLayout = middleLayouts[(index - 1) % middleLayouts.length];
  return { layout: dynamicLayout, bgStyle: "white" };
}

// ──── 1. PARSER: 5-Dash Separated Markdown Format (----- or ---) ────
function parseDashSeparatedDeckFormat(rawContent: string, bgStylePreference: string = "mixed"): SlideData[] {
  const blocks = extractDashSlideBlocks(rawContent);
  if (blocks.length === 0) return [];

  const slides: SlideData[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i].trim();
    if (!block) continue;

    // 1. Headline / Title
    const headerTitleMatch = block.match(/(?:^|\n)\s*#*\s*Slide\s*\d+\s*[:·\-]\s*(.+)/i);
    const explicitHeadlineMatch = block.match(/(?:(?:\*\*|#)?\s*(?:Headline|Title):\s*(?:\*\*)?)\s*([^\n]+)/i);
    const topHeaderMatch = block.split("\n")[0]?.match(/^#\s+([^#\n]+)/);

    let rawHeadline = explicitHeadlineMatch
      ? explicitHeadlineMatch[1].trim()
      : headerTitleMatch
      ? headerTitleMatch[1].trim()
      : topHeaderMatch
      ? topHeaderMatch[1].trim()
      : `Slide ${i + 1}`;
    const title = cleanInlineMarkdown(rawHeadline);

    // 2. Subheadline / Subtitle
    const subheadlineMatch =
      block.match(/(?:(?:\*\*|#)?\s*(?:Subheadline|Subtitle):\s*(?:\*\*)?)\s*([^\n]+)/i) ||
      block.match(/(?:^|\n)\s*##\s+([^#\n]+)/);
    const subtitle = subheadlineMatch ? cleanInlineMarkdown(subheadlineMatch[1]) : undefined;

    // 3. Visual Layout Note
    const visualMatch = block.match(
      /(?:(?:\*\*|#)?\s*(?:🗒️\s*)?(?:Note|Visual\/Smart Layout Recommendation|Visual Recommendation|Visual|Layout|Catatan Desain|Rekomendasi Visual|Design Note)[^:]*:\s*(?:\*\*)?)\s*([^\n]+)/i
    );
    const visualText = visualMatch ? visualMatch[1].trim().toLowerCase() : "";

    // 4. Markdown Table check
    const parsedTable = parseMarkdownTable(block);
    const hasMarkdownTable = parsedTable !== null && parsedTable.rows.length > 0;

    // 5. Extract Bullets
    const rawBullets = block
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => /^[•\-\*\+]\s+/.test(l) || /^\d+[\.\)]\s+/.test(l))
      .map((l) => l.replace(/^[•\-\*\+\d\.\)\s]+/, "").trim())
      .filter((l) => l.length > 0 && !/(?:🗒️|Note:|Visual:|Headline:|Subtitle:|Deskripsi:)/i.test(l));
    const bullets = rawBullets.length > 0 ? rawBullets.map(cleanInlineMarkdown) : undefined;

    // 6. Extract Narrative Description
    const nonBulletLines = block
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
    const description = nonBulletLines.length > 0 ? cleanInlineMarkdown(nonBulletLines.join(" ")) : undefined;

    // Determine layout dynamically
    const layoutConfig = mapVisualTextToLayout(visualText, block, title, i, blocks.length, hasMarkdownTable);
    let layout = layoutConfig.layout;
    let bgStyle = layoutConfig.bgStyle;
    let ctaText = layoutConfig.ctaText;

    let tableHeaders: string[] | undefined = undefined;
    let tableRows: SlideData["tableRows"] = undefined;
    let processSteps: SlideData["processSteps"] = undefined;
    let timelineMilestones: SlideData["timelineMilestones"] = undefined;
    let flowNodes: SlideData["flowNodes"] = undefined;

    if (parsedTable && parsedTable.rows.length > 0) {
      layout = "tableComparison";
      tableHeaders = parsedTable.headers;
      tableRows = parsedTable.rows;
    }

    if (layout === "process" && bullets && bullets.length > 0) {
      processSteps = bullets.map((b, idx) => {
        const parts = b.split(/:\s*|\s*-\s*/);
        return {
          title: cleanInlineMarkdown(parts[0] || `Pillar 0${idx + 1}`),
          description: cleanInlineMarkdown(parts.length > 1 ? parts.slice(1).join(": ") : parts[0]),
        };
      });
    }

    let pairedRows: SlideData["pairedRows"] = undefined;
    let stackCards: SlideData["stackCards"] = undefined;
    let railSteps: SlideData["railSteps"] = undefined;
    let ascendingLevels: SlideData["ascendingLevels"] = undefined;
    let checklistItems: SlideData["checklistItems"] = undefined;

    if (layout === "pairedRows" && bullets && bullets.length > 0) {
      pairedRows = bullets.map((b) => {
        const parts = b.split(/\s*→\s*|\s*->\s*|\s*:\s*|\s*vs\.?\s*/i);
        return {
          left: cleanInlineMarkdown(parts[0] || b),
          right: cleanInlineMarkdown(parts[1] || "Solusi dan langkah perbaikan terstruktur"),
        };
      });
    }

    if (layout === "horizontalStack" && bullets && bullets.length > 0) {
      stackCards = bullets.map((b, idx) => {
        const colon = b.indexOf(":");
        return {
          title: cleanInlineMarkdown(colon > 0 ? b.slice(0, colon).trim() : `Pilar 0${idx + 1}`),
          tag: `Pillar 0${idx + 1}`,
          description: cleanInlineMarkdown(colon > 0 ? b.slice(colon + 1).trim() : b),
        };
      });
    }

    if (layout === "connectedRailStepper" && bullets && bullets.length > 0) {
      railSteps = bullets.map((b, idx) => {
        const colon = b.indexOf(":");
        return {
          stepNumber: idx + 1,
          title: cleanInlineMarkdown(colon > 0 ? b.slice(0, colon).trim() : `Langkah ${idx + 1}`),
          description: cleanInlineMarkdown(colon > 0 ? b.slice(colon + 1).trim() : b),
        };
      });
    }

    if (layout === "ascendingColumns" && bullets && bullets.length > 0) {
      ascendingLevels = bullets.map((b, idx) => {
        const colon = b.indexOf(":");
        return {
          levelNumber: idx + 1,
          tag: `LEVEL ${idx + 1}`,
          title: cleanInlineMarkdown(colon > 0 ? b.slice(0, colon).trim() : `Tahap ${idx + 1}`),
          description: cleanInlineMarkdown(colon > 0 ? b.slice(colon + 1).trim() : b),
        };
      });
    }

    if (layout === "checklist" && bullets && bullets.length > 0) {
      checklistItems = bullets;
    }

    const actionItems = extractActionItems(block);
    const pollOptions = extractPollOptions(block);
    const calloutBox = extractCalloutBox(block);
    const bottomBanners = extractBottomBanners(block);
    const quote = extractQuote(block);
    const topRightPill = extractTopRightPill(block, visualText);
    const cards = extractCards(block);

    slides.push({
      id: `slide-${i + 1}`,
      layout,
      bgStyle,
      title,
      subtitle,
      badge: `SLIDE 0${i + 1}`,
      category: "STRATEGIC OVERVIEW",
      description,
      bullets: (layout === "bullets" || layout === "closingAction") ? bullets : undefined,
      processSteps,
      timelineMilestones,
      tableHeaders,
      tableRows,
      flowNodes,
      pairedRows,
      stackCards,
      railSteps,
      ascendingLevels,
      checklistItems,
      cards,
      actionItems,
      pollOptions,
      bottomBanners,
      calloutBox,
      quote,
      topRightPill,
      ctaText,
      slideNumber: `${String(i + 1).padStart(2, "0")}/${String(blocks.length).padStart(2, "0")}`,
      footer: "company.com",
    });
  }

  return slides;
}

// ──── 2. PARSER: Numbered Slide Prompts (1. Slide 1: ... or 1. Judul ...) ────
function parseNumberedDeckFormat(rawContent: string, bgStylePreference: string = "mixed"): SlideData[] {
  // Matches "Slide 1: ...", "1. Slide 1: ...", "1) Slide 1 ...", or standard numbered items "1. Title ..."
  const itemRegex = /(?:^|\n)\s*(?:(\d+)[\.\)]\s*(?:Slide\s*\d+\s*)?|Slide\s*(\d+)\s*)(?:\(([^)]+)\))?[:\s·\-]\s*([^\n]+)([\s\S]*?)(?=(?:(?:^|\n)\s*(?:\d+[\.\)]\s*(?:Slide\s*\d+\s*)?|Slide\s*\d+)|$))/gi;
  const matches = [...rawContent.matchAll(itemRegex)];
  if (matches.length <= 1) return [];

  const slides: SlideData[] = [];

  for (let i = 0; i < matches.length; i++) {
    const m = matches[i];
    const visualHint = (m[3] || "").toLowerCase();
    const titleLine = (m[4] || "").trim();
    const bodyContent = (m[5] || "").trim();
    const fullText = `${titleLine} ${bodyContent}`;
    const lowerFullText = fullText.toLowerCase();

    const lines = bodyContent.split("\n").map(l => l.replace(/^[•\-\*\d\.\)\s]+/, "").trim()).filter(Boolean);

    let layout: SlideData["layout"] = "bullets";
    let bgStyle: SlideData["bgStyle"] = "white";
    let chartData: SlideData["chartData"] = undefined;
    let stats: SlideData["stats"] = undefined;
    let timelineMilestones: SlideData["timelineMilestones"] = undefined;
    let tableRows: SlideData["tableRows"] = undefined;
    let processSteps: SlideData["processSteps"] = undefined;
    let bullets: string[] | undefined = lines.length > 0 ? lines : undefined;
    let ctaText: string | undefined = undefined;
    let description: string | undefined = bodyContent || undefined;
    let badge = `PILLAR 0${i + 1}`;

    const extractedStats = extractNumericStats(fullText);
    const extractedChart = extractChartSeries(fullText);

    // Semantic intent detectors
    const isStepOrProcess = visualHint.includes("process") || visualHint.includes("step") || visualHint.includes("flow") || visualHint.includes("sop") ||
      /(?:langkah|tahap|alur|framework|pillar|pilar|sop|prosedur|cara kerja|workflow|step)/i.test(titleLine);

    const isTimelineOrRoadmap = visualHint.includes("timeline") || visualHint.includes("roadmap") ||
      /(?:roadmap|timeline|jadwal|tenggat|fase|milestone|quarter|tahun|phase)/i.test(titleLine);
    
    const hasMarkdownTable = /\|.*\|.*\|/.test(bodyContent);
    const hasExplicitTableLines = lines.length >= 2 && lines.filter(l => l.includes("|") || l.split(/:\s*/).length >= 3).length >= 2;
    const isComparisonOrTable = (visualHint.includes("comparison") || visualHint.includes("table") || visualHint.includes("matrix")) && (hasMarkdownTable || hasExplicitTableLines);

    const isProblemOrTwoPart = visualHint.includes("two") || visualHint.includes("side-by-side") ||
      /(?:masalah|tantangan|problem|friction|kendala|hambatan|current state|gap)/i.test(titleLine);

    const isClosingOrCta = i === matches.length - 1 && matches.length >= 3 &&
      (visualHint.includes("cta") || visualHint.includes("closing") || visualHint.includes("statement") ||
       /(?:kesimpulan|penutup|next step|action|call to action|komitmen|target)/i.test(titleLine));

    if (i === 0 || visualHint.includes("title") || visualHint.includes("hero") || visualHint.includes("cover")) {
      layout = "hero";
      badge = "EXECUTIVE BRIEFING";
      description = bodyContent || "Executive overview and strategic agenda.";
    } else if (isClosingOrCta) {
      layout = "boldStatement";
      badge = "ACTION PLAN";
      bgStyle = "boldYellow";
      ctaText = "Execute Next Steps →";
    } else if (visualHint.includes("bar") && extractedChart && extractedChart.length >= 2) {
      layout = "chartBar";
      badge = "QUANTITATIVE DATA";
      chartData = extractedChart;
    } else if (visualHint.includes("pie") && extractedChart && extractedChart.length >= 2) {
      layout = "chartDonut";
      badge = "DISTRIBUTION METRIC";
      chartData = extractedChart;
    } else if (isTimelineOrRoadmap && lines.length > 0) {
      layout = "timeline";
      badge = "EXECUTION ROADMAP";
      timelineMilestones = lines.map((l, idx) => ({
        quarter: `Phase 0${idx + 1}`,
        title: l.split(/:\s*/)[0] || `Phase 0${idx + 1}`,
        description: l.split(/:\s*/)[1] || l,
        status: (idx === 0 ? "done" : idx === 1 ? "active" : "planned") as "done" | "active" | "planned",
      }));
    } else if (isComparisonOrTable && lines.length > 0) {
      const parsed = parseMarkdownTable(bodyContent);
      if (parsed && parsed.rows.length > 0) {
        layout = "tableComparison";
        badge = "COMPARATIVE MATRIX";
        tableRows = parsed.rows;
      } else {
        layout = "twoColumn";
        badge = "STRATEGIC COMPARISON";
      }
    } else if (isStepOrProcess && lines.length > 0) {
      layout = "process";
      badge = "OPERATIONAL FRAMEWORK";
      processSteps = lines.map((l, idx) => ({
        title: l.split(/:\s*/)[0] || `Pillar 0${idx + 1}`,
        description: l.split(/:\s*/)[1] || l,
      }));
    } else if (isProblemOrTwoPart) {
      layout = "twoColumn";
      badge = "CONTEXT & FRICTION";
    } else if (extractedStats && extractedStats.length >= 2) {
      layout = "stats";
      badge = "KEY PERFORMANCE METRICS";
      stats = extractedStats;
    } else if (i % 3 === 0 && lines.length >= 2) {
      // Dynamic Visual Variation (preventing monotone bullets)
      layout = "process";
      badge = "FRAMEWORK PILLARS";
      processSteps = lines.map((l, idx) => ({
        title: l.split(/:\s*/)[0] || `Pillar 0${idx + 1}`,
        description: l.split(/:\s*/)[1] || l,
      }));
    } else {
      layout = "bullets";
      badge = `STRATEGIC PILLAR 0${i + 1}`;
    }

    if (bgStylePreference === "solid" || bgStylePreference === "dualtone") {
      bgStyle = "white";
    } else if (bgStylePreference === "gradient") {
      bgStyle = (i === 0 || i % 3 === 0) ? "yellowGradient" : "white";
    }

    slides.push({
      id: `slide-${i + 1}`,
      layout,
      bgStyle,
      title: titleLine || `Slide ${i + 1}`,
      subtitle: lines.length > 0 ? lines[0].substring(0, 90) : undefined,
      badge,
      category: "STRATEGIC INSIGHT",
      description,
      bullets: layout === "bullets" ? bullets : undefined,
      processSteps,
      timelineMilestones,
      tableRows,
      chartData,
      stats,
      ctaText,
      slideNumber: `${String(i + 1).padStart(2, "0")}/${String(matches.length).padStart(2, "0")}`,
      footer: "company.com",
    });
  }

  return slides;
}

// ──── 3. PARSER: Explicit #Slide Format (#Slide 1 .. #Slide N or Slide 1:) ────
function parseExplicitDeckFormat(rawContent: string, bgStylePreference: string = "mixed"): SlideData[] {
  const slideRegex = /(?:^|\n)\s*#*\s*Slide\s*(\d+)[^\n]*/gi;
  const matches = [...rawContent.matchAll(slideRegex)];
  if (matches.length === 0) return [];

  const slides: SlideData[] = [];

  for (let i = 0; i < matches.length; i++) {
    const startIndex = matches[i].index! + matches[i][0].length;
    const endIndex = i + 1 < matches.length ? matches[i + 1].index! : rawContent.length;
    const headerLine = matches[i][0].trim();
    const blockText = rawContent.substring(startIndex, endIndex).trim();

    // 1. Headline / Title
    const headerTitleMatch = headerLine.match(/Slide\s*\d+\s*[:·\-]\s*(.+)/i);
    const explicitHeadlineMatch = blockText.match(/(?:(?:\*\*|#)?\s*(?:Headline|Title):\s*(?:\*\*)?)\s*([^\n]+)/i);
    const topHeaderMatch = blockText.split("\n")[0]?.match(/^#\s+([^#\n]+)/);

    let rawHeadline = explicitHeadlineMatch
      ? explicitHeadlineMatch[1].trim()
      : headerTitleMatch
      ? headerTitleMatch[1].trim()
      : topHeaderMatch
      ? topHeaderMatch[1].trim()
      : `Slide ${i + 1}`;
    const title = cleanInlineMarkdown(rawHeadline);

    // 2. Subheadline / Subtitle
    const subheadlineMatch =
      blockText.match(/(?:(?:\*\*|#)?\s*(?:Subheadline|Subtitle):\s*(?:\*\*)?)\s*([^\n]+)/i) ||
      blockText.match(/(?:^|\n)\s*##\s+([^#\n]+)/);
    const subtitle = subheadlineMatch ? cleanInlineMarkdown(subheadlineMatch[1]) : undefined;

    // 3. Visual Layout Note
    const visualMatch = blockText.match(
      /(?:(?:\*\*|#)?\s*(?:🗒️\s*)?(?:Note|Visual\/Smart Layout Recommendation|Visual Recommendation|Visual|Layout|Catatan Desain|Rekomendasi Visual|Design Note)[^:]*:\s*(?:\*\*)?)\s*([^\n]+)/i
    );
    const visualText = visualMatch ? visualMatch[1].trim().toLowerCase() : "";

    // 4. Markdown Table check
    const parsedTable = parseMarkdownTable(blockText);
    const hasMarkdownTable = parsedTable !== null && parsedTable.rows.length > 0;

    // 5. Extract Bullets
    const rawBullets = blockText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => /^[•\-\*\+]\s+/.test(l) || /^\d+[\.\)]\s+/.test(l))
      .map((l) => l.replace(/^[•\-\*\+\d\.\)\s]+/, "").trim())
      .filter((l) => l.length > 0 && !/(?:🗒️|Note:|Visual:|Headline:|Subtitle:|Deskripsi:)/i.test(l));
    let bullets = rawBullets.length > 0 ? rawBullets.map(cleanInlineMarkdown) : undefined;
    if (!bullets) {
      const decisionMatches = [...blockText.matchAll(/(?:(?:Decision|Pilar|Pillar|Langkah|Step|Point|Poin)\s*\d+[:\.]?|(?:\d+[\.\)]))\s*([^]+?)(?=(?:(?:Decision|Pilar|Pillar|Langkah|Step|Point|Poin)\s*\d+[:\.]?|(?:\d+[\.\)]))|$)/gi)];
      if (decisionMatches.length >= 2) {
        bullets = decisionMatches.slice(0, 4).map((m) => cleanInlineMarkdown(m[0].trim()));
      }
    }

    // 6. Extract Narrative Description
    const nonBulletLines = blockText
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
    const description = nonBulletLines.length > 0 ? cleanInlineMarkdown(nonBulletLines.join(" ")) : undefined;

    // Map visual layout dynamically from prompt
    const layoutConfig = mapVisualTextToLayout(visualText, blockText, title, i, matches.length, hasMarkdownTable);
    let layout = layoutConfig.layout;
    let bgStyle = layoutConfig.bgStyle;
    let ctaText = layoutConfig.ctaText;

    let processSteps: Array<{ title: string; description: string }> | undefined = undefined;
    let timelineMilestones: SlideData["timelineMilestones"] = undefined;
    let tableHeaders: string[] | undefined = undefined;
    let tableRows: SlideData["tableRows"] = undefined;
    let flowNodes: SlideData["flowNodes"] = undefined;
    let stats: SlideData["stats"] = undefined;
    let chartData: SlideData["chartData"] = undefined;
    let promptBox: SlideData["promptBox"] = undefined;

    // Extract rich components
    const actionItems = extractActionItems(blockText);
    const pollOptions = extractPollOptions(blockText);
    const calloutBox = extractCalloutBox(blockText);
    const bottomBanners = extractBottomBanners(blockText);
    const quote = extractQuote(blockText);
    const topRightPill = extractTopRightPill(blockText, visualText);
    let cards = extractCards(blockText);

    // Markdown table assignment
    if (parsedTable && parsedTable.rows.length > 0) {
      tableHeaders = parsedTable.headers;
      tableRows = parsedTable.rows;
      if (layout !== "keyInsight" && layout !== "breakSlide") {
        layout = "tableComparison";
      }
    }

    // Process steps mapping
    if (layout === "process" && bullets && bullets.length > 0) {
      processSteps = bullets.map((b, idx) => {
        const parts = b.split(/:\s*|\s*-\s*/);
        return {
          title: cleanInlineMarkdown(parts[0] || `Step 0${idx + 1}`),
          description: cleanInlineMarkdown(parts.length > 1 ? parts.slice(1).join(": ") : parts[0]),
        };
      });
    }

    // Timeline milestones mapping
    if (layout === "timeline" && bullets && bullets.length > 0) {
      timelineMilestones = bullets.map((b, idx) => {
        const parts = b.split(/:\s*|\s*-\s*/);
        return {
          quarter: `Phase 0${idx + 1}`,
          title: cleanInlineMarkdown(parts[0] || `Phase 0${idx + 1}`),
          description: cleanInlineMarkdown(parts.length > 1 ? parts.slice(1).join(": ") : parts[0]),
          status: (idx === 0 ? "done" : idx === 1 ? "active" : "planned") as "done" | "active" | "planned",
        };
      });
    }

    // Flow nodes mapping
    if (layout === "flowDiagram") {
      const arrowParts = blockText.split(/\s*(?:→|->)\s*/).map(cleanInlineMarkdown).filter(Boolean);
      if (arrowParts.length >= 2) {
        flowNodes = arrowParts.map((part, idx) => ({
          title: part,
          subtitle: `Phase 0${idx + 1}`,
          tag: `0${idx + 1}`,
        }));
      } else if (bullets && bullets.length >= 2) {
        flowNodes = bullets.map((b, idx) => {
          const parts = b.split(/:\s*|\s*-\s*/);
          return {
            title: cleanInlineMarkdown(parts[0] || `Node 0${idx + 1}`),
            subtitle: parts.length > 1 ? cleanInlineMarkdown(parts.slice(1).join(": ")) : undefined,
            tag: `0${idx + 1}`,
          };
        });
      }
    }

    // Interactive case prompt box
    if (layout === "interactiveCase") {
      const promptM = blockText.match(/(?:Suggested prompt:?\s*> "(.*?)"|> "(.*?)")/i);
      if (promptM) {
        promptBox = { label: "Suggested Prompt", prompt: promptM[1] || promptM[2] };
      }
    }

    // Break slide
    if (layout === "breakSlide") {
      bgStyle = "boldYellow";
      const resumeMatch = blockText.match(/We resume at\s*(\[[^\]]+\]|[^\.\n]+)/i);
      ctaText = resumeMatch ? resumeMatch[0].trim() : "We resume shortly";
    }

    // Apply background style preferences
    if (bgStylePreference === "solid" && layout !== "breakSlide") {
      bgStyle = "white";
    } else if (bgStylePreference === "gradient" && (i === 0 || i % 3 === 0) && layout !== "breakSlide") {
      bgStyle = "yellowGradient";
    }

    const slideNumber = `${String(i + 1).padStart(2, "0")}/${String(matches.length).padStart(2, "0")}`;
    const badge = `SLIDE 0${i + 1}`;

    slides.push({
      id: `slide-${i + 1}`,
      layout,
      bgStyle,
      title,
      subtitle,
      badge,
      category: "STRATEGIC MODULE",
      description: description && description.length < 300 ? description : undefined,
      bullets,
      processSteps,
      timelineMilestones,
      tableHeaders,
      tableRows,
      flowNodes,
      cards,
      actionItems,
      pollOptions,
      bottomBanners,
      calloutBox,
      promptBox,
      quote,
      topRightPill,
      ctaText,
      stats,
      chartData,
      slideNumber,
      footer: "company.com",
    });
  }

  return slides;
}

// Master Structured Parser that tries all 3 standardized formats
function parseAnyStructuredDeck(rawContent: string, bgStylePreference: string = "mixed"): SlideData[] {
  // 1. Explicit #Slide 1..#Slide N or Gamma outlines
  const explicitSlides = parseExplicitDeckFormat(rawContent, bgStylePreference);
  if (explicitSlides.length > 0) return explicitSlides;

  // 2. Dash-separated markdown blocks (----- or ---)
  const dashSlides = parseDashSeparatedDeckFormat(rawContent, bgStylePreference);
  if (dashSlides.length > 1) return dashSlides;

  // 3. Numbered slide format (1. Slide 1, etc.)
  const numberedSlides = parseNumberedDeckFormat(rawContent, bgStylePreference);
  if (numberedSlides.length > 1) return numberedSlides;

  return [];
}

// ──── DYNAMIC CONTENT-ADAPTIVE ENGINE FALLBACK ────
function generateLauncherArchetypeSlides(
  rawContent: string,
  targetCount: number,
  purpose: string,
  audience: string,
  layoutMood: string = "framework",
  density: string = "medium",
  bgStylePreference: string = "mixed"
): SlideData[] {
  // Check if any structured slide format is present
  const structuredSlides = parseAnyStructuredDeck(rawContent, bgStylePreference);
  if (structuredSlides.length > 0) {
    return structuredSlides.slice(0, targetCount || structuredSlides.length);
  }

  // Parse raw content intelligently by paragraphs, headers, and bullet lines
  const rawParagraphs = rawContent
    .split(/\n\s*\n+/)
    .map(p => p.trim())
    .filter(Boolean);

  const allLines = rawContent
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean);

  const mainTitle = allLines[0]?.replace(/^[#\s*•-]+/, "").replace(/^Headline:\s*/i, "") || "Executive Overview";
  const mainSubtitle = purpose || (allLines.length > 1 ? allLines[1]?.replace(/^[#\s*•-]+/, "").substring(0, 100) : "Strategic alignment & execution plan");

  // Divide raw text evenly across targetCount slides
  const chunks: string[][] = [];
  const items = allLines.slice(1);
  const chunkSize = Math.max(1, Math.ceil(items.length / Math.max(1, targetCount - 1)));

  for (let c = 0; c < targetCount - 1; c++) {
    const start = c * chunkSize;
    const chunk = items.slice(start, start + chunkSize);
    if (chunk.length > 0) chunks.push(chunk);
  }

  const slides: SlideData[] = [];

  for (let i = 0; i < targetCount; i++) {
    const slideNumber = `${String(i + 1).padStart(2, "0")}/${String(targetCount).padStart(2, "0")}`;
    const slideId = `slide-${i + 1}`;

    if (i === 0) {
      // Slide 1: Hero / Cover
      const introDesc = rawParagraphs[0]?.replace(/^[#\s*•-]+/, "") || "Comprehensive strategic overview and framework.";
      slides.push({
        id: slideId,
        layout: "hero",
        title: mainTitle,
        subtitle: mainSubtitle,
        badge: "EXECUTIVE BRIEFING",
        category: "STRATEGIC OVERVIEW",
        description: introDesc,
        bgStyle: bgStylePreference === "gradient" ? "yellowGradient" : "white",
        slideNumber,
        footer: "company.com",
      });
      continue;
    }

    if (i === targetCount - 1 && targetCount > 2) {
      // Last Slide: Key Takeaway / Call to Action
      const lastChunk = chunks[chunks.length - 1] || [];
      const closingTitle = lastChunk[0]?.replace(/^[#\s*•-]+/, "") || "Key Takeaways & Next Steps";
      const closingDesc = lastChunk.slice(1).join(" ") || "Clear alignment on strategic priorities and next execution phases.";
      slides.push({
        id: slideId,
        layout: "boldStatement",
        title: closingTitle,
        subtitle: "Executive Summary & Next Milestones",
        description: closingDesc,
        badge: "ACTION PLAN",
        category: "CONCLUSION",
        bgStyle: "boldYellow",
        ctaText: "Execute Next Steps →",
        slideNumber,
        footer: "company.com",
      });
      continue;
    }

    // Intermediate Slides: Choose layout dynamically based on semantic context and story pacing
    const currentChunk = chunks[i - 1] || [];
    const chunkHeading = currentChunk[0]?.replace(/^[#\s*•-]+/, "") || `Strategic Pillar 0${i}`;
    const chunkBodyLines = currentChunk.slice(1);
    const chunkFullText = currentChunk.join("\n");

    const isStepList = currentChunk.some(l => /^(?:\d+[\.\)]|Step\s*\d+|Tahap\s*\d+|Langkah\s*\d+|Phase\s*\d+|Pillar\s*\d+)/i.test(l));
    const isComparisonOrTable = /vs|versus|perbandingan|comparison|matriks|matrix|tabel|table/i.test(chunkHeading) || /vs|versus/i.test(chunkFullText);
    const isTimelineOrRoadmap = /roadmap|linimasa|timeline|milestone|tahapan|fase|phase|quarter/i.test(chunkHeading) || /roadmap|timeline/i.test(chunkFullText);
    const extractedStats = extractNumericStats(chunkFullText);
    const extractedCharts = extractChartSeries(chunkFullText);

    let layout: SlideData["layout"] = "bullets";
    let bgStyle: SlideData["bgStyle"] = "white";
    let bullets: string[] | undefined = undefined;
    let processSteps: SlideData["processSteps"] = undefined;
    let timelineMilestones: SlideData["timelineMilestones"] = undefined;
    let tableRows: SlideData["tableRows"] = undefined;
    let stats: SlideData["stats"] = undefined;
    let chartData: SlideData["chartData"] = undefined;
    let description: string | undefined = chunkBodyLines.join(" ") || undefined;
    let badge = `PILLAR 0${i}`;

    if (isTimelineOrRoadmap && chunkBodyLines.length >= 2) {
      layout = "timeline";
      badge = "EXECUTION ROADMAP";
      timelineMilestones = chunkBodyLines.map((l, idx) => {
        const parts = l.split(/:\s*|\s*-\s*/);
        return {
          quarter: `Phase 0${idx + 1}`,
          title: parts[0] || `Milestone 0${idx + 1}`,
          description: parts.length > 1 ? parts.slice(1).join(": ") : parts[0],
          status: (idx === 0 ? "done" : idx === 1 ? "active" : "planned") as "done" | "active" | "planned",
        };
      });
    } else if (isComparisonOrTable && chunkBodyLines.length >= 2) {
      layout = "tableComparison";
      badge = "COMPARATIVE MATRIX";
      tableRows = chunkBodyLines.map((l) => {
        const parts = l.split(/:\s*|\s*\|\s*|\s*vs\s*/i);
        return {
          feature: parts[0] || "Strategic Dimension",
          current: parts[1] || "Legacy Approach",
          proposed: parts[2] || parts[1] || "Optimized Model",
        };
      });
    } else if (isStepList && chunkBodyLines.length >= 2) {
      layout = "process";
      badge = "OPERATIONAL FRAMEWORK";
      processSteps = chunkBodyLines.map((l, idx) => {
        const parts = l.split(/:\s*|\s*-\s*/);
        return {
          title: parts[0] || `Step 0${idx + 1}`,
          description: parts.length > 1 ? parts.slice(1).join(": ") : parts[0],
        };
      });
    } else if (extractedStats && extractedStats.length >= 2) {
      layout = "stats";
      badge = "KEY PERFORMANCE METRICS";
      stats = extractedStats;
    } else if (extractedCharts && extractedCharts.length >= 3 && chunkFullText.toLowerCase().includes("chart")) {
      layout = "chartBar";
      badge = "QUANTITATIVE ANALYSIS";
      chartData = extractedCharts;
    } else if (i === 1) {
      // Slide 2: Context / Problem vs Solution (Pacing Anchor)
      layout = "twoColumn";
      badge = "CONTEXT & FRICTION";
    } else if (i % 3 === 0 && chunkBodyLines.length >= 3) {
      // Rotate to process framework if multiple points
      layout = "process";
      badge = "EXECUTION VECTOR";
      processSteps = chunkBodyLines.map((l, idx) => {
        const parts = l.split(/:\s*|\s*-\s*/);
        return {
          title: parts[0] || `Vector 0${idx + 1}`,
          description: parts.length > 1 ? parts.slice(1).join(": ") : parts[0],
        };
      });
    } else {
      layout = "bullets";
      badge = `STRATEGIC PILLAR 0${i}`;
      bullets = chunkBodyLines.length > 0 ? chunkBodyLines : [chunkHeading];
    }

    if (bgStylePreference === "gradient") {
      bgStyle = i % 2 === 0 ? "yellowGradient" : "white";
    }

    slides.push({
      id: slideId,
      layout,
      bgStyle,
      title: chunkHeading,
      subtitle: purpose || "Key Strategic Insights & Analysis",
      badge,
      category: "STRATEGIC SYNTHESIS",
      description,
      bullets,
      processSteps,
      timelineMilestones,
      tableRows,
      stats,
      chartData,
      slideNumber,
      footer: "company.com",
    });
  }

  return slides;
}

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

function normalizeApiSlide(raw: any, index: number = 0): SlideData {
  if (!raw || typeof raw !== "object") {
    return {
      id: `slide-${index + 1}`,
      layout: "hero",
      title: `Slide ${index + 1}`,
    };
  }

  const validLayouts = [
    "title", "hero", "stats", "bullets", "process", "twoColumn", "bigNumber",
    "chartBar", "chartArea", "chartDonut", "chartRadar", "flowDiagram", "timeline",
    "tableComparison", "quadrantMatrix", "funnel", "cycleLoop", "architecture",
    "chevronProcess", "gaugeRings", "ascendingTrajectory", "verticalProgress",
    "splitMetric", "horizontalMilestones", "bubbleCluster", "connectedRings",
    "asymmetricMatrix", "boldStatement", "imageSplitMetric", "boldImpact", "cta",
    "actionList", "cardGrid", "caseStudy", "splitPoll", "interactiveCase", "breakSlide", "keyInsight",
    "sectionDivider", "pairedRows", "horizontalStack", "connectedRailStepper", "ascendingColumns", "checklist", "closingAction"
  ];
  let layout = raw.layout || "bullets";
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

  let pairedRows: SlideData["pairedRows"] = undefined;
  if (Array.isArray(raw.pairedRows)) {
    pairedRows = raw.pairedRows.map((pr: any) => ({
      left: safeString(pr?.left || pr?.problem || pr?.weak || ""),
      right: safeString(pr?.right || pr?.solution || pr?.robust || ""),
      leftLead: pr?.leftLead ? safeString(pr.leftLead) : undefined,
      rightLead: pr?.rightLead ? safeString(pr.rightLead) : undefined,
    }));
  }

  let stackCards: SlideData["stackCards"] = undefined;
  if (Array.isArray(raw.stackCards)) {
    stackCards = raw.stackCards.map((sc: any) => ({
      title: safeString(sc?.title || ""),
      tag: sc?.tag ? safeString(sc.tag) : undefined,
      description: safeString(sc?.description || sc?.desc || sc?.content || ""),
    }));
  }

  let railSteps: SlideData["railSteps"] = undefined;
  if (Array.isArray(raw.railSteps)) {
    railSteps = raw.railSteps.map((rs: any, i: number) => ({
      stepNumber: rs?.stepNumber ?? (i + 1),
      title: safeString(rs?.title || `Phase ${i + 1}`),
      description: rs?.description ? safeString(rs.description) : undefined,
    }));
  }

  let ascendingLevels: SlideData["ascendingLevels"] = undefined;
  if (Array.isArray(raw.ascendingLevels)) {
    ascendingLevels = raw.ascendingLevels.map((al: any, i: number) => ({
      levelNumber: al?.levelNumber ?? `L${i + 1}`,
      title: safeString(al?.title || `Level ${i + 1}`),
      description: al?.description ? safeString(al.description) : undefined,
      tag: al?.tag ? safeString(al.tag) : undefined,
    }));
  }

  let checklistItems: string[] | undefined = undefined;
  if (Array.isArray(raw.checklistItems)) {
    checklistItems = raw.checklistItems.map((ci: any) => safeString(ci)).filter((s: string) => s.length > 0);
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
  } else if (layout === "pairedRows") {
    if (!pairedRows || pairedRows.length === 0) {
      layout = bullets && bullets.length >= 2 ? "twoColumn" : "bullets";
    }
  } else if (layout === "horizontalStack") {
    if (!stackCards || stackCards.length === 0) {
      layout = cards && cards.length >= 2 ? "cardGrid" : "bullets";
    }
  } else if (layout === "connectedRailStepper") {
    if (!railSteps || railSteps.length === 0) {
      layout = processSteps && processSteps.length >= 2 ? "process" : "bullets";
    }
  } else if (layout === "ascendingColumns") {
    if (!ascendingLevels || ascendingLevels.length === 0) {
      layout = cards && cards.length >= 2 ? "cardGrid" : "bullets";
    }
  } else if (layout === "checklist") {
    if (!checklistItems || checklistItems.length === 0) {
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
    layout: layout as any,
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
    cards: cards || raw.cards,
    actionItems: raw.actionItems,
    pollOptions: raw.pollOptions,
    bottomBanners: raw.bottomBanners,
    calloutBox: raw.calloutBox,
    promptBox: raw.promptBox,
    quote: raw.quote,
    pairedRows,
    stackCards,
    railSteps,
    ascendingLevels,
    checklistItems,
    insightBarText: raw.insightBarText ? safeString(raw.insightBarText) : undefined,
    noteBoxText: raw.noteBoxText ? safeString(raw.noteBoxText) : undefined,
    contactFooterText: raw.contactFooterText ? safeString(raw.contactFooterText) : undefined,
    speakerNotes: raw.speakerNotes ? safeString(raw.speakerNotes) : undefined,
    topRightPill: raw.topRightPill ? safeString(raw.topRightPill) : undefined,
    ctaText: raw.ctaText ? safeString(raw.ctaText) : undefined,
    footer: raw.footer ? safeString(raw.footer) : undefined,
    slideNumber: raw.slideNumber ? safeString(raw.slideNumber) : undefined,
    imageUrl: raw.imageUrl ? safeString(raw.imageUrl) : undefined,
  };
}
