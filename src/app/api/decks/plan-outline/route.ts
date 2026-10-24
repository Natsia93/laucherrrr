import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

export const runtime = "nodejs";
export const maxDuration = 60;

interface OutlineSlideItem {
  slideNumber: number;
  headline: string;
  subheadline: string;
  visualLayout: string;
  description: string;
  keyPoints?: string[];
  speakerNotes?: string;
}

const OUTLINE_SYSTEM_PROMPT = `
You are the Master Presentation Architect for Launcher OS (McKinsey, Bain, ITB, and Apple executive standards).
Your job is to transform raw topics, curriculum, or business notes into a dynamic, content-tailored, and CREATIVELY DIVERSE Master Slide Blueprint.

=== CREATIVE FREEDOM & CONTENT-ADAPTIVE ARCHITECTURE (ANTI-MONOTONY RULE) ===
DO NOT USE A STATIC REPEATING PATTERN! The user has explicitly rejected rigid, predictable slide templates where Slide 2 is always the same layout, Slide 3 is always the same layout, etc.

1. FREEDOM OF EXPRESSION & CONTENT-FIRST SELECTION:
   - Analyze the UNIQUE substance and narrative friction of the user's specific content.
   - Choose the visual layout that BEST expresses each specific idea.
   - NEVER force a rigid sequential order (e.g. NEVER default to: 1. Hero, 2. Divider, 3. Paired Rows, 4. Horizontal Stack, 5. Stepper...). That is a rigid template and strictly forbidden!

2. SLIDE 2 IS CONTENT, NOT A WASTED DIVIDER:
   - Unless the user's material explicitly defines multiple numbered modules (e.g. "Module 1", "Week 2"), DO NOT put a "Section Divider" on Slide 2!
   - Slide 2 must immediately hook the audience with substantive depth:
     * "Two Column" (Current Reality vs Strategic Opportunity, Problem vs Solution)
     * "Card Grid" / "Bullets" (3-4 Core Market Drivers or Strategic Shifts)
     * "Flow Diagram" / "Architecture" (System Context or High-Level Overview)
     * "Table Comparison" (Competitive Landscape or Paradigm Shift)
     * "Stats" (Empirical Metrics Grid, only if data exists in input)
     * "Process" (High-level Strategic Horizon)

3. FULL CREATIVE PALETTE OF LAYOUTS:
   Freely combine, mix, and adapt from this diverse library according to what best fits the text:
   - "Split Comparison": (MANDATORY FOR 2-4 SLIDES) Official ITB Two-Panel layout with Left Blue Panel (Yellow accent bar + bold white Action Title + golden yellow Subtitle) and Right White Panel (Before AI Card [grey #F1F1F1] → Arrow → After AI Card [solid blue #005AAB with yellow top bar] + bottom full-width Key Insight strip [blue with yellow left edge]). Used for case studies, worked examples, and paradigm shifts.
   - "Split Profile": Facilitator / Speaker Profile with Left Blue Panel (Yellow bar + Name + Role) and Right White Panel (Circular photo [Photo] + blue SPEAKER PROFILE tag + organization role + executive bio).
   - "Section Divider": (MANDATORY FOR 1-2 SLIDES IN 15-20 SLIDE DECKS) Pure chapter/part transition slide on full solid blue background. Contains ONLY a yellow accent bar (140x12px), yellow uppercase "PART N" label, large white title, and white subtitle. Strictly NO CARDS on this slide!
   - "Pyramid Hierarchy": 3-tier McKinsey apex pyramid (Apex Vision at peak -> Core Strategic Pillars in middle -> Foundation Enablers at base).
   - "Transformation Bridge": 3-panel transformational shift comparing current friction (As-Is) to target outcome (To-Be) via a central catalyst engine.
   - "Radial Hub": Central core operational hub (e.g. Data & AI Governance Core) with 4 surrounding domain satellites (e.g. Legal, Security, Capital, Operations).
   - "Chevron Process": 5-step alternating chevron cycle (e.g. Frame -> Gather -> Evaluate -> Decide -> Act & Learn) with descriptions below, diagnostic status pills (e.g. "Fails here: wrong question"), and bottom full-width Key Insight strip.
   - "Formula Hero": High-impact formula banner at top (THE FORMULA: Impact = Speed × Scale × Confidence) + 3 factor columns below + massive accent stat box (e.g. 61%).
   - "Decision Matrix": 2x2 Quadrant matrix with labeled X/Y dimensional arrows (High stakes vs Low stakes, Low data richness vs High data richness) and 4 asymmetric executive quadrant treatments.
   - "Causation Tree": Top metric callout + 3 cards with internal branching tree diagrams (root node -> 2 child nodes) + bottom takeaway quote strip with vertical yellow accent bar.
   - "Case Study": Case scenario with Situation background, 3 data metric tiles, and yellow Twist warning box + 3-line exercise sheet.
   - "Two Column": Dual perspectives, contrasting scenarios, or side-by-side core themes.
   - "Card Grid": 3 to 4 distinct categorical pillars, capability cards, or strategic tenets.
   - "Process": Step-by-step workflow, methodology, or procedural phases.
   - "Timeline": Chronological milestones, implementation roadmap, or progressive quarters.
   - "Table Comparison": Matrix comparing options, legacy vs future, or capability evaluation.
   - "Flow Diagram": Node-to-node architectural pipeline, data flow, or operating model.
   - "Horizontal Stack": 3 stacked horizontal bars for foundational triads or parallel definitions.
   - "Paired Rows": 2 to 3 direct problem-to-solution or threat-to-mitigation paired rows.
   - "Connected Stepper": Connected track milestones or continuous lifecycle loop.
   - "Ascending Columns": Progressive intensity, capability maturity levels (L1, L2, L3), or tiered impact.
   - "Checklist": Executive governance checklist, readiness audit, or verification criteria.
   - "Stats": Quantitative metric callouts with authoritative context (when numbers exist).
   - "Bullets": Clean, high-impact executive takeaways with bold lead-ins.
   - "Closing Action": Final executive mandate with concrete next steps, ownership, and contact.

4. DYNAMIC PACING & RHYTHM (CRITICAL):
   - For a 15–20 slide deck:
     * Slide 1: Always "Hero" (Cover).
     * Slide 2: High-impact content slide (e.g. "Two Column", "Card Grid", "Split Profile", or "Formula Hero"). NEVER put a Section Divider on Slide 2!
     * Schedule 2 to 4 slides with "Split Comparison" (or "Split Profile") for case studies, worked examples, and real-world analogies.
     * Schedule 1 to 2 slides with "Section Divider" (e.g. around Slide 7-8 and Slide 14) to introduce major chapters (e.g. "PART 1: Core Frameworks", "PART 2: Operational Execution").
     * Mix diverse framework slides: Pyramid Hierarchy, Transformation Bridge, Radial Hub, Chevron Process, Formula Hero, Causation Tree, Paired Rows, Horizontal Stack, Connected Stepper.
     * Never use the same layout two slides in a row!
     * Slide N (last slide): Always "Closing Action".

5. ACTION TITLES (MANDATORY):
   - Every headline MUST be an assertive Action Title (5-9 words), stating the primary takeaway or conclusion of the slide.
   - NEVER write passive topic labels like "Cybersecurity Pillars", "Module 1", "Overview", or "Agenda".
   - Left-aligned, one line preferred. NEVER end a slide title with a period!

6. PRESENTER / SPEAKER NOTES:
   - Provide "speakerNotes" for EVERY slide: 2 to 4 crisp sentences explaining the slide's pedagogical or business intent, the critical takeaway, and timing.

OUTPUT FORMAT:
Return ONLY a valid, parseable JSON array of objects with schema:
[
  {
    "slideNumber": 1,
    "headline": "Active Executive Claim Without Period",
    "subheadline": "Strategic subheadline providing context",
    "visualLayout": "Hero" | "Split Comparison" | "Split Profile" | "Section Divider" | "Pyramid Hierarchy" | "Transformation Bridge" | "Radial Hub" | "Chevron Process" | "Formula Hero" | "Decision Matrix" | "Causation Tree" | "Case Study" | "Two Column" | "Card Grid" | "Process" | "Timeline" | "Table Comparison" | "Flow Diagram" | "Horizontal Stack" | "Paired Rows" | "Connected Stepper" | "Ascending Columns" | "Checklist" | "Stats" | "Bullets" | "Closing Action",
    "description": "Substantive summary of what this slide covers",
    "keyPoints": ["Bullet 1", "Bullet 2"],
    "speakerNotes": "Executive talking points and facilitation timing guidance"
  }
]

=== LANGUAGE RULE (SUPREME PRIORITY) ===
If the user's raw content explicitly requests a specific language (e.g. "in English", "bahasa inggris", "dalam bahasa Inggris", "use English"), ALL generated text — headlines, subheadlines, descriptions, keyPoints, and speakerNotes — MUST be written ENTIRELY in that requested language. Do NOT mix languages. Do NOT default to Indonesian if the user asked for English. The user's language instruction ALWAYS overrides any template examples.
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      content,
      targetCount = 20,
      audience = "Executives & C-Level",
      purpose = "Pitch Idea & Strategy",
      layoutMood = "framework",
      templateRulesMarkdown = "",
      templateName = "",
      clonedStyleDirectives = "",
      apiKey,
      provider = "gemini",
      model: requestedModel,
    } = body;

    const count = Math.min(Math.max(parseInt(String(targetCount), 10) || 10, 3), 100);
    let rulesDoc = (templateRulesMarkdown || clonedStyleDirectives || "").trim();
    const effectiveTemplateName = templateName || "ITB × RevoU Deck Design System";

    if (!rulesDoc) {
      try {
        const fs = await import("fs/promises");
        const path = await import("path");
        const skillPath = path.join(process.cwd(), ".agents/skills/itb-deck-design-rules/SKILL.md");
        rulesDoc = await fs.readFile(skillPath, "utf-8");
      } catch (err) {
        console.warn("Could not load default ITB skill file in plan-outline:", err);
      }
    }

    // ──── LANGUAGE DETECTION ────
    const contentLower = (content || "").toLowerCase();
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
      ? `\n⚠️ MANDATORY LANGUAGE: ALL generated text (headlines, subheadlines, descriptions, keyPoints, speakerNotes) MUST be written ENTIRELY in ${detectedLanguage}. Do NOT use any other language. This overrides all examples in the system prompt.\n`
      : "";

    const userPrompt = `
RAW TOPIC / MATERIALS / CURRICULUM:
"""
${content}
"""

TARGET SLIDE COUNT: Exactly ${count} slides.
AUDIENCE: ${audience}
PURPOSE: ${purpose}
LAYOUT MOOD: ${layoutMood}

${rulesDoc.length > 0 ? `
================================================================================
👑 GOVERNING DESIGN CONTRACT & ARCHITECTURAL RULES (.MD) (UNABRIDGED & MANDATORY):
Source Document: ${templateName || "Institutional Design Specification"}
================================================================================
${rulesDoc}
================================================================================
MANDATORY COMPLIANCE INSTRUCTIONS:
- Faithfully study and execute the governing .md document above in its entirety.
- FREEDOM & CONTENT-FIRST SELECTION: Do NOT apply a rigid, identical layout sequence across decks! Intelligently map each slide to the visual archetype that BEST expresses its specific content from the entire library (Formula Hero, Chevron Process, Decision Matrix, Causation Tree, Case Study, Flow Diagram, Architecture Stack, Strategic Roadmap Timeline, Table Comparison, Horizontal Stack, Paired Rows, Connected Stepper, Ascending Columns, Checklist, Bar Chart, Donut Chart, Stats Grid, Two Column, Card Grid).
- Obey the Rule of Rhythm: Never repeat the same layout more than twice in a row. Create a rich, diverse presentation rhythm.
- Formulate substantive Action Titles (5-9 words) with NO trailing period.
` : ""}

${languageDirective}
Generate a master blueprint with EXACTLY ${count} sequential slides in strict JSON array format.
`;

    // 1. Try Gemini
    const geminiKey = (apiKey && provider === "gemini" ? apiKey : null) || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (geminiKey) {
      try {
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({
          model: "gemini-2.5-flash",
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.6,
          },
        });

        const result = await model.generateContent([OUTLINE_SYSTEM_PROMPT, userPrompt]);
        const text = result.response.text().trim();
        const cleaned = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "").trim();
        const parsed = JSON.parse(cleaned);

        if (Array.isArray(parsed) && parsed.length > 0) {
          const sanitized = sanitizeOutlineItems(parsed, count);
          return NextResponse.json({ success: true, outline: sanitized, source: "gemini" });
        }
      } catch (gemErr: any) {
        console.warn("Gemini outline planning error:", gemErr?.message);
      }
    }

    // 2. Try DeepSeek / OpenAI
    const openAiKey = (apiKey && (provider === "openai" || provider === "deepseek") ? apiKey : null) || process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY;
    const isDeepseek = provider === "deepseek" || (!process.env.OPENAI_API_KEY && process.env.DEEPSEEK_API_KEY);

    if (openAiKey) {
      try {
        const client = new OpenAI({
          baseURL: isDeepseek ? "https://api.deepseek.com" : "https://api.openai.com/v1",
          apiKey: openAiKey,
        });

        const res = await client.chat.completions.create({
          model: requestedModel || (isDeepseek ? "deepseek-chat" : "gpt-4o-mini"),
          temperature: 0.6,
          messages: [
            { role: "system", content: OUTLINE_SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
        });

        const raw = res.choices[0]?.message?.content || "";
        const cleaned = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "").trim();
        const parsed = JSON.parse(cleaned);

        if (Array.isArray(parsed) && parsed.length > 0) {
          const sanitized = sanitizeOutlineItems(parsed, count);
          return NextResponse.json({ success: true, outline: sanitized, source: provider });
        }
      } catch (openAiErr: any) {
        console.warn("OpenAI/Deepseek outline error:", openAiErr?.message);
      }
    }

    // 3. Try Anthropic (Claude 3.5 / 3.7)
    const anthropicKey = (apiKey && provider === "anthropic" ? apiKey : null) || process.env.ANTHROPIC_API_KEY;
    if (anthropicKey && (provider === "anthropic" || !geminiKey && !openAiKey)) {
      try {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": anthropicKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: requestedModel || "claude-3-5-sonnet-20241022",
            max_tokens: 4096,
            temperature: 0.3,
            system: OUTLINE_SYSTEM_PROMPT,
            messages: [{ role: "user", content: userPrompt }],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const raw = data.content?.[0]?.text || "";
          const cleaned = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "").trim();
          const parsed = JSON.parse(cleaned);

          if (Array.isArray(parsed) && parsed.length > 0) {
            const sanitized = sanitizeOutlineItems(parsed, count);
            return NextResponse.json({ success: true, outline: sanitized, source: "anthropic" });
          }
        }
      } catch (anthropicErr: any) {
        console.warn("Anthropic Claude outline error:", anthropicErr?.message);
      }
    }

    // Deterministic fallback generator if no key is configured
    const fallbackOutline: OutlineSlideItem[] = generateFallbackBlueprint(content, count, purpose);
    return NextResponse.json({ success: true, outline: fallbackOutline, source: "deterministic-fallback" });
  } catch (error: any) {
    console.error("Plan Outline API Error:", error);
    return NextResponse.json({ success: false, error: error?.message || "Failed to plan outline" }, { status: 500 });
  }
}

function sanitizeOutlineItems(parsed: any[], targetCount: number): OutlineSlideItem[] {
  const arcLayouts = [
    "Split Comparison",
    "Two Column",
    "Pyramid Hierarchy",
    "Transformation Bridge",
    "Formula Hero",
    "Radial Hub",
    "Chevron Process",
    "Paired Rows",
    "Horizontal Stack",
    "Connected Stepper",
    "Ascending Columns",
    "Checklist",
    "Process",
    "Timeline",
    "Table Comparison",
    "Flow Diagram",
    "Bullets",
  ];

  const knownArchetypes = new Set([
    "hero", "cover", "section divider", "split comparison", "split case", "split profile",
    "case study", "paired rows", "horizontal stack", "connected stepper",
    "ascending columns", "checklist", "closing action", "formula hero",
    "tree comparison", "pyramid hierarchy", "transformation bridge",
    "radial hub", "chevron process", "decision matrix", "two column",
    "process", "timeline", "table comparison", "flow diagram", "bullets",
    "stats", "bold impact", "card grid"
  ]);

  return parsed.slice(0, targetCount).map((item: any, idx: number) => {
    let visualLayout = String(item.visualLayout || "").trim();
    const normalized = visualLayout.toLowerCase();

    // 1. Enforce Opening Slide 1 as Hero
    if (idx === 0) {
      visualLayout = "Hero";
    }
    // 2. Enforce Last Slide as Closing Action / Bold Impact
    else if (idx === targetCount - 1 && targetCount >= 3) {
      visualLayout = visualLayout && (normalized.includes("closing") || normalized.includes("action")) ? "Closing Action" : "Bold Impact";
    }
    // 3. If empty or generic fallback, rotate through arcLayouts
    else if (!visualLayout || (!knownArchetypes.has(normalized) && normalized === "bullets")) {
      visualLayout = arcLayouts[(idx - 1) % arcLayouts.length];
    }

    // 4. Ensure bullets are extracted or populated
    let bullets = Array.isArray(item.keyPoints) && item.keyPoints.length > 0 ? item.keyPoints.slice(0, 6) : undefined;
    if (!bullets && item.description) {
      const desc = String(item.description);
      const matches = [...desc.matchAll(/(?:(?:Decision|Pilar|Pillar|Langkah|Step|Point|Poin)\s*\d+[:\.]?|(?:\d+[\.\)]))\s*([^]+?)(?=(?:(?:Decision|Pilar|Pillar|Langkah|Step|Point|Poin)\s*\d+[:\.]?|(?:\d+[\.\)]))|$)/gi)];
      if (matches.length >= 2) {
        bullets = matches.slice(0, 6).map((m) => m[0].trim());
      }
    }

    return {
      slideNumber: idx + 1,
      headline: String(item.headline || `Slide ${idx + 1}`),
      subheadline: String(item.subheadline || ""),
      visualLayout,
      description: String(item.description || ""),
      bullets,
      speakerNotes: item.speakerNotes ? String(item.speakerNotes) : undefined,
    };
  });
}

function generateFallbackBlueprint(content: string, count: number, purpose: string): OutlineSlideItem[] {
  const layouts = [
    "Hero",
    "Two Column",
    "Process",
    "Timeline",
    "Bullets",
    "Flow Diagram",
    "Table Comparison",
    "Bullets",
  ];

  const lines = content
    .split("\n")
    .map((l) => l.trim().replace(/^[-*#\d.]+\s*/, ""))
    .filter((l) => l.length > 3);

  const mainTopic = lines[0] || purpose || "Strategic Initiative & Framework";

  return Array.from({ length: count }, (_, idx) => {
    const isFirst = idx === 0;
    const isLast = idx === count - 1;
    const layout = isFirst ? "Hero" : isLast ? "Bold Impact" : layouts[(idx - 1) % layouts.length];
    const lineTopic = lines[idx] || `Tahap ${idx + 1}: Implementasi & Analisis Komprehensif`;

    return {
      slideNumber: idx + 1,
      headline: isFirst ? mainTopic : `Fase ${idx}: ${lineTopic.substring(0, 50)}`,
      subheadline: isFirst
        ? "Peta Jalan Strategis Menuju Keunggulan Operasional"
        : `Rincian implementasi dan analisis mendalam untuk pilar ke-${idx}`,
      visualLayout: layout,
      description: `Penjabaran operasional terperinci mengenai ${lineTopic} guna memastikan integrasi yang optimal across divisions.`,
    };
  });
}
