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
You are a Master Presentation Architect operating at the highest tier of strategic communication design.
You think like a senior McKinsey engagement manager, write like an Apple keynote director, and structure like a Cambridge professor.
Your role: transform raw content into a brilliantly architected Master Slide Blueprint that would earn a standing ovation.

=== YOUR MANDATORY THINKING PROCESS (CHAIN-OF-THOUGHT) ===

Before generating ANY output, you MUST complete these analytical steps internally:

**Step 1 — Content Taxonomy:**
Classify the input as: CURRICULUM (course/training), STRATEGY (business plan/initiative), PITCH (sales/fundraising), RESEARCH (academic/analysis), CASE_STUDY (scenario-based), or HYBRID.
This determines your narrative architecture.

**Step 2 — Core Thesis Extraction:**
Identify the single overarching argument or conclusion the entire deck must serve.
Every slide must advance this thesis. If the input has no clear thesis, construct one from the strongest thread.

**Step 3 — Audience Need Mapping:**
Determine what the audience needs to:
- FEEL by the end (confidence, urgency, curiosity, conviction)
- KNOW by the end (frameworks, data, methods, decisions)
- DO after the presentation (specific actions, decisions, behavioral shifts)

**Step 4 — Rhetorical Friction Identification:**
Identify 2-4 moments of productive tension in the content:
- Misconceptions to shatter
- Counterintuitive insights to reveal
- Paradigm shifts to navigate
- "Aha" moments to engineer
These become your most visually distinctive and memorable slides.

**Step 5 — Evidence Inventory:**
Catalog available: statistics, case studies, frameworks, quotes, comparisons, processes, exercises.
Flag gaps where placeholders [INSTRUCTOR TO CONFIRM] are needed.

=== 9-STAGE NARRATIVE ARC (CONTENT-ADAPTIVE DRAMATURGY) ===

Your deck MUST follow this dramaturgical arc, adapted by content taxonomy:

1. HOOK (Slide 1-2): Establish authority + create cognitive dissonance
   - CURRICULUM → "What you'll master that transforms your capability"
   - STRATEGY → "The widening gap between where we are and where we must be"
   - PITCH → "The $X problem no one is solving properly — until now"
   - RESEARCH → "The assumption everyone holds that the evidence contradicts"

2. CONTEXT (Slide 2-3): Ground the audience in shared reality
   - Current state analysis, market landscape, foundational framework, or baseline metrics

3. FRAMEWORK (Slide 4-7): Introduce the organizing principle
   - The mental model, methodology, decision architecture, or analytical lens
   - This is where Pyramid Hierarchy, Radial Hub, Chevron Process, or Formula Hero excel

4. EVIDENCE (Slide 5-10): Prove the framework with specifics
   - Case studies (Split Comparison), data (Stats), worked examples (Case Study)
   - Real-world analogies that make abstract concepts concrete and memorable

5. PRACTICE (1-2 slides for CURRICULUM): Make it tangible and interactive
   - Exercises, decision scenarios, application templates
   - Skip for PITCH/STRATEGY; replace with competitive proof points

6. TENSION (1-2 slides): Introduce productive complexity
   - "But what about..." edge cases, common mistakes, counterarguments
   - Causation Tree, Decision Matrix, Paired Rows work well here

7. SYNTHESIS (1-2 slides): Resolve tension into higher understanding
   - Integration of framework + evidence + nuance
   - Transformation Bridge or advanced Split Comparison

8. IMPACT (1 slide): The quantified or qualitative "so what"
   - Formula Hero, Stats, or Bold Statement with specific outcomes

9. CALL (1 slide): Specific, time-bound, actionable next steps
   - Always Closing Action with concrete ownership and deadlines

=== LAYOUT SELECTION PHILOSOPHY (CONTENT-FIRST, NEVER HABIT-FIRST) ===

NEVER choose a layout by position or pattern. For EVERY slide, ask:
"What is the CORE IDEA, and which visual form BEST EXPRESSES that specific idea?"

Content-to-Layout Intelligence:
- Tension between two states/eras → "Split Comparison" or "Two Column"
- Person/authority/facilitator intro → "Split Profile"
- Chapter/module transition → "Section Divider" (max 2 per 15-20 slide deck)
- Ascending complexity/maturity → "Ascending Columns" or "Pyramid Hierarchy"
- Cyclical/iterative process → "Chevron Process" or connected loop
- System/ecosystem architecture → "Radial Hub" or "Flow Diagram"
- Before/After transformation → "Transformation Bridge"
- Quantifiable impact or formula → "Formula Hero" or "Stats"
- 2x2 decision classification → "Decision Matrix" (quadrantMatrix)
- Causal vs correlational reasoning → "Causation Tree" (treeComparison)
- Interactive exercise/case → "Case Study" (caseExercise)
- Foundational triads/pillars → "Horizontal Stack" or "Card Grid"
- Threat-response or problem-solution pairs → "Paired Rows"
- Linear sequential process → "Connected Stepper" or "Process"
- Roadmap/milestones → "Timeline"
- Feature/option comparison → "Table Comparison"
- Governance/readiness audit → "Checklist"
- Final executive mandate → "Closing Action"
- High-impact executive takeaways → "Bullets"
- Pipeline/data flow → "Flow Diagram"

Full Layout Library:
"Hero", "Split Comparison", "Split Profile", "Section Divider", "Pyramid Hierarchy",
"Transformation Bridge", "Radial Hub", "Chevron Process", "Formula Hero",
"Decision Matrix", "Causation Tree", "Case Study", "Two Column", "Card Grid",
"Process", "Timeline", "Table Comparison", "Flow Diagram", "Horizontal Stack",
"Paired Rows", "Connected Stepper", "Ascending Columns", "Checklist",
"Stats", "Bullets", "Closing Action", "Bold Impact"

PACING CONSTRAINTS:
- Slide 1: ALWAYS "Hero" (Cover)
- Slide 2: NEVER Section Divider. Must be substantive content (Two Column, Card Grid, Split Comparison, Formula Hero, Stats)
- Section Dividers: 1-2 per deck at natural chapter breaks (never consecutive, never Slide 2)
- Split layouts: 2-4 per deck for case studies, worked examples, and analogies
- Same layout NEVER appears in consecutive slides
- Last slide: ALWAYS "Closing Action" or "Bold Impact"

=== ACTION TITLES (NON-NEGOTIABLE EXECUTIVE STANDARD) ===

Every headline MUST be a bold, assertive claim — the ONE takeaway if someone reads only titles.

❌ REJECTED (passive labels):        → ✅ REQUIRED (active claims):
"AI Overview"                        → "AI Compresses the Decision Cycle from Weeks to Hours"
"Risk Analysis"                      → "Three Hidden Risks Invalidate Traditional Due Diligence"
"Module 3 Content"                   → "Leaders Who Design Systems Outperform Those Who Decide Alone"
"Implementation Steps"               → "The 90-Day Sprint Transforms Governance from Reactive to Predictive"
"Financial Summary"                  → "Unit Economics Cross Breakeven at 12K MAU with 68% Gross Margin"
"Cybersecurity Pillars"              → "Confidentiality, Integrity and Availability Form Every Data Decision"
"Team Structure"                     → "Cross-Functional Pods Eliminate Handoff Delays by 40%"
"Market Trends"                      → "Three Structural Shifts Are Redrawing the Competitive Landscape"

Rules: 5-12 words. Active voice. Contains the insight or conclusion. NO trailing period. Left-aligned.

=== SPEAKER NOTES (MANDATORY — FACILITATION SCRIPT QUALITY) ===

Every slide MUST have "speakerNotes" with this structure:
1. **Intent**: Why this slide exists in the narrative arc (1 sentence)
2. **Key Message**: The one thing the audience must remember (1 sentence)
3. **Delivery Cue**: How to present — timing, emphasis, rhetorical questions, pause points (1-2 sentences)
4. **Transition**: The bridge sentence to the next slide (1 sentence)

=== CONTENT ELEVATION (EXECUTIVE COPYWRITING) ===

- NEVER reduce the user's content to shallow 1-2 word bullet fragments.
- ELEVATE draft notes into confident, authoritative executive prose.
- Use strong active verbs: accelerate, eliminate, consolidate, architect, safeguard, quantify, compress.
- Preserve 100% of the user's facts, technical terms, and data — but sharpen the framing.
- Replace vague language ("improve things", "better results") with specific claims ("reduce cycle time by 60%", "consolidate 5 tools into 1 platform").
- NEVER invent statistics, names, dates, or case studies not present in the source material.
- Use [INSTRUCTOR TO CONFIRM], [X]-minute, [__]% for missing data.

=== SELF-VALIDATION CHECKLIST (RUN BEFORE OUTPUT) ===

Before returning JSON, mentally verify ALL of these:
□ Slide 1 is Hero; last slide is Closing Action or Bold Impact
□ No layout appears in 3+ consecutive slides
□ Section Divider never appears on Slide 2
□ Every headline is an Action Title (claim, not label) with NO trailing period
□ 2-4 slides use Split Comparison or Split Profile
□ 1-2 slides use Section Divider (for 15+ slide decks)
□ speakerNotes exist for every single slide
□ The arc creates emotional progression — not an information dump
□ Every slide earns its place (no filler, no redundancy)
□ Descriptions are substantive (2+ sentences), not placeholder text
□ keyPoints contain 2-4 concrete, insightful points per slide

OUTPUT FORMAT:
Return ONLY a valid, parseable JSON array. No markdown, no backticks, no commentary.
[
  {
    "slideNumber": 1,
    "headline": "Active Executive Claim Without Period",
    "subheadline": "Strategic subheadline providing context",
    "visualLayout": "Hero",
    "description": "Substantive 2-3 sentence summary of what this slide covers and why it matters in the narrative",
    "keyPoints": ["Concrete insight 1 with specific detail", "Concrete insight 2 with evidence or framework"],
    "speakerNotes": "Intent: ... Key message: ... Delivery: ... Transition: ..."
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

    // ──── STRICT BYOK PROVIDER EXECUTION ────
    // Always prioritize the user's selected provider!
    const effectiveProvider = (provider || (apiKey?.startsWith("sk-") ? "deepseek" : "deepseek")).toLowerCase();

    // 1. DeepSeek (BYOK First)
    if (effectiveProvider === "deepseek") {
      const deepseekKey = apiKey || process.env.DEEPSEEK_API_KEY;
      if (deepseekKey) {
        try {
          const client = new OpenAI({
            baseURL: "https://api.deepseek.com",
            apiKey: deepseekKey,
          });

          const selectedModel = requestedModel || "deepseek-chat";
          const isReasoner = selectedModel === "deepseek-reasoner" || selectedModel.includes("reasoner");

          const res = await client.chat.completions.create({
            model: selectedModel,
            ...(isReasoner ? {} : { temperature: 0.4 }),
            messages: isReasoner
              ? [{ role: "user", content: `${OUTLINE_SYSTEM_PROMPT}\n\n${userPrompt}` }]
              : [
                  { role: "system", content: OUTLINE_SYSTEM_PROMPT },
                  { role: "user", content: userPrompt },
                ],
          });

          const raw = res.choices[0]?.message?.content || "";
          const cleaned = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "").trim();
          const parsed = JSON.parse(cleaned);

          if (Array.isArray(parsed) && parsed.length > 0) {
            const sanitized = sanitizeOutlineItems(parsed, count);
            return NextResponse.json({ success: true, outline: sanitized, source: "deepseek" });
          }
        } catch (dsErr: any) {
          console.error("DeepSeek outline planning error:", dsErr?.message);
        }
      }
    }

    // 2. OpenAI
    if (effectiveProvider === "openai") {
      const openAiKey = apiKey || process.env.OPENAI_API_KEY;
      if (openAiKey) {
        try {
          const client = new OpenAI({
            baseURL: "https://api.openai.com/v1",
            apiKey: openAiKey,
          });

          const res = await client.chat.completions.create({
            model: requestedModel || "gpt-4o",
            temperature: 0.4,
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
            return NextResponse.json({ success: true, outline: sanitized, source: "openai" });
          }
        } catch (openAiErr: any) {
          console.error("OpenAI outline planning error:", openAiErr?.message);
        }
      }
    }

    // 3. Anthropic (Claude)
    if (effectiveProvider === "anthropic") {
      const anthropicKey = apiKey || process.env.ANTHROPIC_API_KEY;
      if (anthropicKey) {
        const modelsToTry = [requestedModel, "claude-3-7-sonnet-20250219", "claude-3-5-sonnet-20241022"].filter(Boolean) as string[];
        for (const mName of modelsToTry) {
          try {
            const response = await fetch("https://api.anthropic.com/v1/messages", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-api-key": anthropicKey,
                "anthropic-version": "2023-06-01",
              },
              body: JSON.stringify({
                model: mName,
                max_tokens: 8192,
                temperature: 0.4,
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
            console.error("Anthropic Claude outline error:", anthropicErr?.message);
          }
        }
      }
    }

    // 4. Google Gemini (Active Model Cascade)
    const geminiKey = (effectiveProvider === "gemini" ? apiKey : null) || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || (apiKey && !apiKey.startsWith("sk-") ? apiKey : null);
    if (geminiKey) {
      const geminiModels = [requestedModel, "gemini-3.8-flash", "gemini-3.5-flash", "gemini-flash-latest"].filter(Boolean) as string[];
      for (const mName of geminiModels) {
        try {
          const genAI = new GoogleGenerativeAI(geminiKey);
          const model = genAI.getGenerativeModel({
            model: mName,
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.4,
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
          console.warn(`Gemini outline planning error (${mName}):`, gemErr?.message);
        }
      }
    }

    // High-quality domain-aware fallback generator if all API keys fail or are empty
    const fallbackOutline: OutlineSlideItem[] = generateFallbackBlueprint(content, count, purpose);
    return NextResponse.json({ success: true, outline: fallbackOutline, source: "intelligent-fallback" });
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
    "Card Grid",
    "Stats",
    "Decision Matrix",
    "Causation Tree",
    "Case Study",
  ];

  const knownArchetypes = new Set([
    "hero", "cover", "section divider", "split comparison", "split case", "split profile",
    "case study", "paired rows", "horizontal stack", "connected stepper",
    "ascending columns", "checklist", "closing action", "formula hero",
    "tree comparison", "causation tree", "pyramid hierarchy", "transformation bridge",
    "radial hub", "chevron process", "decision matrix", "two column",
    "process", "timeline", "table comparison", "flow diagram", "bullets",
    "stats", "bold impact", "card grid", "bold statement"
  ]);

  const items = parsed.slice(0, targetCount);

  // ── Post-AI Validation Pass ──
  const sanitized = items.map((item: any, idx: number) => {
    let visualLayout = String(item.visualLayout || "").trim();
    const normalized = visualLayout.toLowerCase();

    // Enforce Opening Slide 1 as Hero
    if (idx === 0) {
      visualLayout = "Hero";
    }
    // Enforce Last Slide as Closing Action / Bold Impact
    else if (idx === items.length - 1 && items.length >= 3) {
      visualLayout = visualLayout && (normalized.includes("closing") || normalized.includes("action")) ? "Closing Action" : "Bold Impact";
    }
    // Section Divider must NEVER be Slide 2
    else if (idx === 1 && (normalized.includes("section") || normalized.includes("divider"))) {
      visualLayout = "Two Column";
    }
    // If empty or unrecognized, rotate through arcLayouts
    else if (!visualLayout || !knownArchetypes.has(normalized)) {
      visualLayout = arcLayouts[(idx - 1) % arcLayouts.length];
    }

    // Break consecutive layout repetitions (no 3+ of the same in a row)
    if (idx >= 2) {
      const prev1 = sanitized[idx - 1]?.visualLayout?.toLowerCase() || "";
      const prev2 = sanitized[idx - 2]?.visualLayout?.toLowerCase() || "";
      if (prev1 === visualLayout.toLowerCase() && prev2 === visualLayout.toLowerCase()) {
        const recentLayouts = new Set([prev1, prev2]);
        const alt = arcLayouts.find(l => !recentLayouts.has(l.toLowerCase()));
        if (alt) visualLayout = alt;
      }
    }

    // Extract or populate bullets from keyPoints
    let bullets = Array.isArray(item.keyPoints) && item.keyPoints.length > 0 ? item.keyPoints.slice(0, 6) : undefined;
    if (!bullets && item.description) {
      const desc = String(item.description);
      const matches = [...desc.matchAll(/(?:(?:Decision|Pilar|Pillar|Langkah|Step|Point|Poin)\s*\d+[:\.]?|(?:\d+[\.\)]))\s*([^]+?)(?=(?:(?:Decision|Pilar|Pillar|Langkah|Step|Point|Poin)\s*\d+[:\.]?|(?:\d+[\.\)]))|$)/gi)];
      if (matches.length >= 2) {
        bullets = matches.slice(0, 6).map((m) => m[0].trim());
      }
    }

    let headline = String(item.headline || `Slide ${idx + 1}`);
    headline = headline.replace(/\.$/, "");

    const speakerNotes = item.speakerNotes
      ? String(item.speakerNotes)
      : `Intent: Menekankan ${headline} dalam alur narasi. Key message: ${headline}. Delivery: Sampaikan dengan otoritas dan berikan jeda refleksi bagi audiens. Transition: Lanjutkan ke analisis dimensi berikutnya.`;

    const result: OutlineSlideItem = {
      slideNumber: idx + 1,
      headline,
      subheadline: String(item.subheadline || ""),
      visualLayout,
      description: String(item.description || ""),
      keyPoints: bullets,
      speakerNotes,
    };

    return result;
  });

  return sanitized;
}

function generateFallbackBlueprint(content: string, count: number, purpose: string): OutlineSlideItem[] {
  // Clean user prompt to extract true subject
  const cleanedTopic = content
    .replace(/^(?:tolong\s+buatkan?|buatkan?|generate|bikin(?:kan)?|bantu\s+buatkan?|create\s+a?|deck\s+tentang|deck\s+topik|topik|presentasi\s+tentang)\s+/i, "")
    .replace(/[.!?]+$/, "")
    .trim() || purpose || "Strategi Operasional";

  const isCyber = /cyber|keamanan|siber|security|infosec|soc|zero\s*trust|malware|ransomware/i.test(content);

  const cyberThemes = [
    { title: `Arsitektur Ketahanan Keamanan Siber Enterprise`, sub: "Membangun pertahanan proaktif melindungi aset kritis di era AI & Cloud", layout: "Hero" },
    { title: "Lanskap Ancaman Siber: Eskalasi Serangan & Kerentanan Sistem", sub: "Memetakan vektor serangan kritis dan dampak finansial pelanggaran data", layout: "Two Column" },
    { title: "Paradigma Zero Trust: Validasi Identitas & Akses Berkelanjutan", sub: "Beralih dari perimeter konvensional ke verifikasi identitas berlapis", layout: "Horizontal Stack" },
    { title: "Tiga Pilar Pertahanan: Tata Kelola, Manusia, dan Otomasi", sub: "Menyelaraskan budaya keamanan, SOP mitigasi, dan AI security operations", layout: "Pyramid Hierarchy" },
    { title: "Transformasi SOC: Memangkas Waktu Deteksi Insiden hingga 80%", sub: "Beralih dari investigasi manual ke deteksi prediktif terotomasi", layout: "Split Comparison" },
    { title: "Alur Deteksi & Respons Insiden Siber Secara Real-Time", sub: "Siklus hidup penanganan ancaman dari triage hingga remediasi sistemik", layout: "Connected Stepper" },
    { title: "Matriks Prioritas Penanganan Kerentanan & Manajemen Risiko", sub: "Klasifikasi risiko aset berdasarkan dampak bisnis dan eksploitabilitas", layout: "Table Comparison" },
    { title: "Audit Kepatuhan & Standar Regulasi Keamanan Data", sub: "Memastikan keselarasan dengan NIST CSF, ISO 27001, dan kepatuhan privasi data", layout: "Checklist" },
    { title: "Roadmap 12 Bulan Penguatan Ketahanan Siber Perusahaan", sub: "Linimasa implementasi kapabilitas keamanan tingkat enterprise", layout: "Timeline" },
    { title: "Mandat Eksekutif: 3 Langkah Aksi Mengamankan Aset Kritis", sub: "Keputusan strategis dewan direksi untuk memperkuat postur keamanan", layout: "Closing Action" },
    { title: "Persamaan Dampak: Visibilitas × Kecepatan Respons = Risiko Terkendali", sub: "Mengukur ROI investasi keamanan siber bagi kelangsungan bisnis", layout: "Formula Hero" },
    { title: "Pusat Koordinasi Ekosistem Keamanan Lintas Divisi", sub: "Mengintegrasikan telemetry endpoint, cloud, dan jaringan dalam satu cockpit", layout: "Radial Hub" },
  ];

  const defaultThemes = [
    { title: `Strategi & Transformasi ${cleanedTopic}`, sub: "Peta jalan komprehensif mencapai keunggulan kompetitif dan efisiensi operasional", layout: "Hero" },
    { title: "Diagnosis Tantangan Utama: Hambatan dan Titik Gesekan Saat Ini", sub: "Mengidentifikasi akar permasalahan operasional yang menghambat skala bisnis", layout: "Two Column" },
    { title: "Arsitektur Solusi Terpadu: Tiga Pilar Keberhasilan Eksekusi", sub: "Kerangka terstruktur menyelaraskan strategi, kapabilitas manusia, dan teknologi", layout: "Horizontal Stack" },
    { title: "Hierarki Kemampuan Inti Menuju Eksekusi Kelas Dunia", sub: "Tingkatan maturitas sistematis dari standardisasi hingga otomatisasi cerdas", layout: "Pyramid Hierarchy" },
    { title: "Studi Komparasi Operasional: Dampak Terukur Sebelum dan Sesudah Transformasi", sub: "Bukti empiris efisiensi biaya dan akselerasi kecepatan eksekusi", layout: "Split Comparison" },
    { title: "Siklus Kerja Terstandar: 4 Tahap Penerapan Tanpa Hambatan", sub: "Prosedur operasional baku dari inisiasi hingga evaluasi performa berkelanjutan", layout: "Connected Stepper" },
    { title: "Matriks Perbandingan Opsi Solusi & Analisis Trade-off", sub: "Evaluasi multidimensi mempertimbangkan biaya, kecepatan, dan risiko", layout: "Table Comparison" },
    { title: "Checklist Kesiapan Tata Kelola & Kontrol Kualitas", sub: "Kriteria verifikasi memastikan kepatuhan regulasi dan stabilitas sistem", layout: "Checklist" },
    { title: "Linimasa Eksekusi Strategis: Milestones Pencapaian Kunci", sub: "Roadmap bertahap dengan checkpoint pencapaian yang terukur", layout: "Timeline" },
    { title: "Mandat Aksi Eksekutif: 3 Prioritas Utama yang Harus Diluncurkan", sub: "Instruksi tindakan nyata dengan alokasi kepemilikan dan target waktu yang tegas", layout: "Closing Action" },
  ];

  const themes = isCyber ? cyberThemes : defaultThemes;

  return Array.from({ length: count }, (_, idx) => {
    const isFirst = idx === 0;
    const isLast = idx === count - 1;
    const themeIdx = idx % themes.length;
    const theme = themes[themeIdx];

    const layout = isFirst ? "Hero" : isLast ? "Closing Action" : theme.layout;
    const headline = isFirst ? theme.title : isLast ? theme.title : (idx < themes.length ? theme.title : `${theme.title} — Bagian ${Math.floor(idx / themes.length) + 1}`);
    const subheadline = theme.sub;

    return {
      slideNumber: idx + 1,
      headline,
      subheadline,
      visualLayout: layout,
      description: `Analisis strategis mendalam mengenai ${theme.title} guna memastikan integrasi optimal, mitigasi risiko proaktif, dan dampak bisnis terukur.`,
      keyPoints: [
        `Identifikasi faktor keberhasilan utama untuk ${theme.title}.`,
        `Standarisasi protokol eksekusi guna mengeliminasi latensi operasional.`,
        `Pengukuran dampak menggunakan indikator kinerja kunci secara berkala.`,
      ],
      speakerNotes: `Intent: Paparkan ${theme.title} sebagai pilar penting dalam narasi keseluruhan. Key message: ${theme.sub}. Delivery: Tekankan urgensi dan manfaat strategis bagi kepemimpinan eksekutif. Transition: Hubungkan konsep ini ke langkah implementasi berikutnya.`,
    };
  });
}

