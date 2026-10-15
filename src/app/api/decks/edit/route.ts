import OpenAI from "openai";
import { NextRequest } from "next/server";
import { SlideData } from "../generate-stream/route";

export const runtime = "nodejs";
export const maxDuration = 60;

const EDIT_SYSTEM_PROMPT = `
You are the world-class Presentation Editing & Refinement Engine for Launcher OS.
Your task is to modify, transform, or refine presentation slides based strictly on the user's edit instruction.

=== STRICT LAUNCHER OS AESTHETIC & ARCHETYPE SCHEMA RULES ===
1. Valid Slide Layouts:
   - "title", "hero", "stats", "bullets", "process", "twoColumn", "bigNumber",
     "chartBar", "chartArea", "chartDonut", "chartRadar", "flowDiagram", "timeline",
     "tableComparison", "quadrantMatrix", "funnel", "cycleLoop", "architecture",
     "chevronProcess", "gaugeRings", "ascendingTrajectory", "verticalProgress",
     "splitMetric", "horizontalMilestones", "bubbleCluster", "connectedRings",
     "asymmetricMatrix", "boldStatement", "imageSplitMetric", "boldImpact", "cta"

2. Schema Properties:
   - "id": string (preserve original slide id if editing single slide)
   - "layout": string
   - "bgStyle": "white" | "yellowGradient" | "boldYellow"
   - "title": string (high-impact, punchy)
   - "subtitle": string (optional)
   - "description": string (optional)
   - "badge": string (optional)
   - "category": string (optional)
   - "stats": Array<{ value: string; label: string }>
   - "bullets": string[]
   - "processSteps": Array<{ title: string; description: string }>
   - "tableRows": Array<{ feature: string; current: string | boolean; proposed: string | boolean }>
   - "horizontalMilestones": Array<{ percentage: string; title: string; description: string }>
   - "verticalProgressItems": Array<{ title: string; percentage: number; description?: string; tag?: string }>
   - "metricBox": { value: string; label?: string; description?: string }
   - "bubbleNodes": Array<{ title: string; percentage: number; color?: "yellow" | "black"; description?: string }>
   - "cycleNodes": Array<{ title: string; description?: string; percentage?: string }>
   - "chevronSteps": Array<{ title: string; percentage?: string; description?: string; position?: "top" | "bottom" }>
   - "gaugeItems": Array<{ percentage: number; title: string; description: string }>
   - "trajectoryNodes": Array<{ percentage: string; title: string; description?: string }>
   - "connectedRings": Array<{ percentage: number; title: string; description: string }>
   - "asymmetricCards": Array<{ stat: string; text: string }>
   - "flowNodes": Array<{ title: string; subtitle?: string; tag?: string }>
   - "ctaText": string (optional)
   - "footer": string (optional)
   - "slideNumber": string (optional)

3. EDITING BEHAVIOR:
   - If scope is "single": Return a SINGLE valid JSON object matching the SlideData schema with the user's requested changes applied.
   - If scope is "all": Return a valid JSON array containing ALL slides in the exact same sequence with the global modifications applied across every slide.
   - Preserve untouched fields and slide IDs whenever appropriate.
   - Output ONLY the parseable JSON (object for single, array for all). No markdown fences, no preamble, no postscript.
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      scope = "single", // "single" | "all"
      activeSlideIndex = 0,
      slides = [],
      prompt = "",
      titleFont = "sf-pro",
      bodyFont = "sf-pro",
      apiKey: userApiKey,
      model = "deepseek-chat",
      provider = "deepseek",
    } = body;

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "Prompt edit instruction is required." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const currentSlide = slides[activeSlideIndex] || slides[0] || null;

    if (scope === "single" && !currentSlide) {
      return new Response(
        JSON.stringify({ success: false, error: "Active slide not found." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const providerBaseUrls: Record<string, string> = {
      deepseek: "https://api.deepseek.com",
      openai: "https://api.openai.com/v1",
      gemini: "https://generativelanguage.googleapis.com/v1beta/openai",
    };

    const effectiveApiKey = userApiKey || req.headers.get("x-deepseek-api-key") || process.env.DEEPSEEK_API_KEY;

    let userInstructionPrompt = "";
    if (scope === "single") {
      userInstructionPrompt = `
TARGET: Single Slide Modification (Slide Index ${activeSlideIndex + 1} of ${slides.length})
CURRENT SLIDE DATA:
"""
${JSON.stringify(currentSlide, null, 2)}
"""

USER EDIT INSTRUCTION:
"""
${prompt}
"""

Typography Setting: Title Font = ${titleFont}, Body Font = ${bodyFont}.

Return the single updated SlideData JSON object with the edits applied. Do NOT output an array.
`;
    } else {
      userInstructionPrompt = `
TARGET: Global Presentation Modification (All ${slides.length} Slides)
CURRENT DECK SLIDES:
"""
${JSON.stringify(slides, null, 2)}
"""

USER GLOBAL EDIT INSTRUCTION:
"""
${prompt}
"""

Typography Setting: Title Font = ${titleFont}, Body Font = ${bodyFont}.

Return the full array of updated SlideData JSON objects with the edits applied to all slides in sequence.
`;
    }

    if (effectiveApiKey && effectiveApiKey !== "dummy_key" && effectiveApiKey.trim().length > 0) {
      try {
        const aiClient = new OpenAI({
          baseURL: providerBaseUrls[provider] || providerBaseUrls.deepseek,
          apiKey: effectiveApiKey.trim(),
          timeout: 45000,
        });

        const response = await aiClient.chat.completions.create({
          model: model || "deepseek-chat",
          temperature: 0.25,
          messages: [
            { role: "system", content: EDIT_SYSTEM_PROMPT },
            { role: "user", content: userInstructionPrompt },
          ],
          stream: false,
        });

        const rawOutput = response.choices[0]?.message?.content?.trim() || "";
        const cleanedJson = rawOutput.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "").trim();

        if (scope === "single") {
          let updatedSlide: SlideData | null = null;
          try {
            const parsed = JSON.parse(cleanedJson);
            if (Array.isArray(parsed) && parsed.length > 0) {
              updatedSlide = parsed[0];
            } else if (typeof parsed === "object" && parsed !== null) {
              updatedSlide = parsed;
            }
          } catch {
            const matchObj = rawOutput.match(/\{[\s\S]*\}/);
            if (matchObj) {
              try {
                updatedSlide = JSON.parse(matchObj[0]);
              } catch (e2) {
                console.error("Secondary single slide parse error:", e2);
              }
            }
          }

          if (updatedSlide) {
            // Ensure ID and slideNumber are preserved if omitted
            if (!updatedSlide.id) updatedSlide.id = currentSlide.id || `slide-${activeSlideIndex + 1}`;
            if (!updatedSlide.slideNumber) updatedSlide.slideNumber = currentSlide.slideNumber;
            return new Response(
              JSON.stringify({
                success: true,
                scope: "single",
                updatedSlide,
                slideIndex: activeSlideIndex,
              }),
              { headers: { "Content-Type": "application/json" } }
            );
          }
        } else {
          // Scope === "all"
          let updatedSlides: SlideData[] | null = null;
          try {
            const parsed = JSON.parse(cleanedJson);
            if (Array.isArray(parsed) && parsed.length > 0) {
              updatedSlides = parsed;
            }
          } catch {
            const matchArr = rawOutput.match(/\[\s*\{[\s\S]*\}\s*\]/);
            if (matchArr) {
              try {
                updatedSlides = JSON.parse(matchArr[0]);
              } catch (e2) {
                console.error("Secondary multi slide parse error:", e2);
              }
            }
          }

          if (updatedSlides && updatedSlides.length > 0) {
            return new Response(
              JSON.stringify({
                success: true,
                scope: "all",
                updatedSlides,
              }),
              { headers: { "Content-Type": "application/json" } }
            );
          }
        }
      } catch (apiErr) {
        console.error("Edit API Execution Error:", apiErr);
      }
    }

    // Fallback deterministic local transformation if API key absent/failed
    if (scope === "single") {
      const fallbackSlide: SlideData = applyDeterministicSingleEdit(currentSlide, prompt, activeSlideIndex, slides.length);
      return new Response(
        JSON.stringify({
          success: true,
          scope: "single",
          updatedSlide: fallbackSlide,
          slideIndex: activeSlideIndex,
          fallback: true,
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    } else {
      const fallbackSlides: SlideData[] = slides.map((s: SlideData, idx: number) =>
        applyDeterministicSingleEdit(s, prompt, idx, slides.length)
      );
      return new Response(
        JSON.stringify({
          success: true,
          scope: "all",
          updatedSlides: fallbackSlides,
          fallback: true,
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (error: unknown) {
    console.error("Deck Edit API Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

function applyDeterministicSingleEdit(slide: SlideData, prompt: string, index: number, total: number): SlideData {
  const p = prompt.toLowerCase();
  const copy: SlideData = JSON.parse(JSON.stringify(slide));

  // Layout switches
  if (p.includes("tabel") || p.includes("matrix") || p.includes("comparison") || p.includes("perbandingan")) {
    copy.layout = "tableComparison";
    copy.tableRows = copy.tableRows || [
      { feature: "Deployment Velocity", current: "14 Days", proposed: "5 Minutes" },
      { feature: "AI Orchestration", current: "Manual Middleware", proposed: "Instant Stream" },
      { feature: "Data Latency", current: "450ms", proposed: "<15ms" },
      { feature: "Compliance & SOC2", current: "Manual Audit", proposed: "Real-Time Verification" },
      { feature: "Operational Cost", current: "$0.42 / op", proposed: "$0.03 / op" },
    ];
  } else if (p.includes("split metric") || p.includes("metric box")) {
    copy.layout = "splitMetric";
    copy.metricBox = { value: "85%", description: copy.subtitle || "Accelerating execution through structured visual milestones." };
    copy.verticalProgressItems = [
      { title: "Process Initiation", percentage: 45, tag: "01.", description: "Baseline audit & pipeline setup" },
      { title: "Core Synthesis", percentage: 75, tag: "02.", description: "Semantic reasoning & layout mapping" },
      { title: "Executive Deployment", percentage: 95, tag: "03.", description: "Multi-platform presentation delivery" },
    ];
  } else if (p.includes("milestone") || p.includes("horizontal") || p.includes("timeline")) {
    copy.layout = "horizontalMilestones";
    copy.horizontalMilestones = [
      { percentage: "25%", title: "Phase 1: Discovery", description: "Audit legacy architecture & establish baseline." },
      { percentage: "50%", title: "Phase 2: Automation", description: "Deploy Launcher OS intelligent layout engine." },
      { percentage: "75%", title: "Phase 3: Integration", description: "Unify cross-functional presentation workflows." },
      { percentage: "100%", title: "Phase 4: Launch", description: "Enterprise-wide rollout with continuous learning." },
    ];
  } else if (p.includes("bold statement") || p.includes("get in touch") || p.includes("contact")) {
    copy.layout = "boldStatement";
    copy.bgStyle = "boldYellow";
    copy.ctaText = "Get in Touch →";
  } else if (p.includes("bold impact") || p.includes("stat impact")) {
    copy.layout = "boldImpact";
    copy.bgStyle = "boldYellow";
    copy.stats = [{ value: "+85%", label: "Measurable acceleration over traditional presentation workflows" }];
  } else if (p.includes("ring") || p.includes("connected ring")) {
    copy.layout = "connectedRings";
    copy.stats = [{ value: "5729+", label: "Verified Data Milestone Points" }];
    copy.connectedRings = [
      { percentage: 75, title: "Execution Velocity", description: "Sub-second slide generation & instant export" },
      { percentage: 95, title: "Typographic Precision", description: "Strict design token & font pairing compliance" },
      { percentage: 88, title: "Stakeholder Alignment", description: "High-impact visual diagrams that convert" },
    ];
  }

  // Text modifications
  if (p.includes("singkat") || p.includes("punchy") || p.includes("ringkas")) {
    if (copy.title) copy.title = copy.title.split(" ").slice(0, 5).join(" ");
    if (copy.subtitle) copy.subtitle = copy.subtitle.split(" ").slice(0, 8).join(" ");
    if (copy.bullets) copy.bullets = copy.bullets.map(b => b.split(" ").slice(0, 6).join(" "));
  }

  // Indonesian / English translations
  if (p.includes("indonesia") || p.includes("terjemah") || p.includes("translate")) {
    if (copy.badge) copy.badge = "MODUL EKSEKUTIF";
    if (copy.category) copy.category = "Strategi Bisnis";
  }

  return copy;
}
