import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

export const runtime = "nodejs";
export const maxDuration = 60;

interface OutlineItem {
  slideNumber: number;
  headline: string;
  subheadline?: string;
  visualLayout?: string;
  description?: string;
  bullets?: string[];
  speakerNotes?: string;
}

const CHUNK_SYSTEM_PROMPT = `
You are the elite Slide Worker Engine for Launcher OS (McKinsey, Bain, ITB, and Apple executive standards).
Your task is to generate full, richly detailed slide objects for a SPECIFIC BATCH of slides in an executive deck.

=== UNIVERSAL SLIDE CONTRACT (FOR CLAUDE, DEEPSEEK, GPT, & GEMINI) ===
For each slide outline provided in the batch, generate a complete JSON object adhering strictly to the Launcher OS SlideData contract:
- Layouts available:
  "hero", "twoColumn", "process", "timeline", "tableComparison", "flowDiagram", "bullets", "stats", "boldStatement", "cardGrid", "keyInsight"
- Required Universal Fields:
  - id: unique string (e.g. "slide-1", "slide-2")
  - layout: one of the valid layouts above
  - title: ACTION TITLE (5-9 words). A substantive takeaway claim. Left-aligned, one line where possible. NEVER end with a period!
  - subtitle: crisp strategic context or transition
  - description: thorough insight (1-2 sentences)
  - badge: category tag in uppercase (e.g. "STRATEGIC IMPERATIVE", "OPERATIONAL BLUEPRINT", "HANDS-ON", "ITB × REVOU")
  - speakerNotes: MANDATORY 2-4 sentences of executive speaking guidance (intent of slide, key message to land, timing, and facilitation watch-outs).
  - bgStyle: "white" | "yellowGradient" | "boldYellow"
- Layout-specific fields:
  * If "process": processSteps: [{ "title": "Step 1", "description": "Details" }, ...]
  * If "timeline": timelineMilestones: [{ "quarter": "Phase 1", "title": "Foundation", "description": "Details" }, ...]
  * If "tableComparison": tableHeaders: ["Dimension", "Option A", "Option B"], tableRows: [{ "feature": "...", "current": "...", "proposed": "..." }]
  * If "flowDiagram": flowNodes: [{ "title": "Node 1", "subtitle": "Details", "tag": "01" }, ...]
  * If "bullets": bullets: ["Key Concept 1: In-depth rationale", "Key Concept 2: In-depth rationale", ...]
  * If "stats": stats: [{ "value": "95%", "label": "Retention" }, ...] (NEVER invent fake numbers; use real outline numbers or bracket placeholders like [X]%)

OUTPUT FORMAT:
Return ONLY a valid, parseable JSON array containing the detailed slide objects for THIS BATCH.
No markdown backticks, no explanatory comments.
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      chunkIndex = 0,
      totalChunks = 1,
      slidesToGenerate = [],
      deckContext = {},
      apiKey,
      provider = "gemini",
      model: requestedModel,
    } = body;

    const outlines: OutlineItem[] = slidesToGenerate;
    if (!outlines || outlines.length === 0) {
      return NextResponse.json({ success: false, error: "No slides in this chunk" }, { status: 400 });
    }

    const {
      audience = "Executives & C-Level",
      purpose = "Strategy & Framework",
      density = "medium",
      bgStylePreference = "mixed",
      customBgColors,
      clonedStyleDirectives = "",
      clonedReferenceSummary = "",
    } = deckContext;

    const userPrompt = `
BATCH DETAILS:
- Processing Chunk: ${chunkIndex + 1} of ${totalChunks}
- Slides in this batch: ${outlines.length} slides (${outlines.map((o) => `Slide #${o.slideNumber}`).join(", ")})

DECK CONTEXT:
- Audience: ${audience}
- Purpose: ${purpose}
- Density: ${density}
- Background Rhythm: ${bgStylePreference}
${customBgColors ? `- Custom Palette: Primary ${customBgColors.color1}, Secondary ${customBgColors.color2}, Accent ${customBgColors.color3}` : ""}
${clonedStyleDirectives ? `\nCLONED STYLE DIRECTIVES FROM USER REFERENCE SLIDE:\nSummary: ${clonedReferenceSummary}\n"""\n${clonedStyleDirectives}\n"""\n` : ""}

OUTLINE BLUEPRINT FOR THIS BATCH:
${JSON.stringify(outlines, null, 2)}

Generate exactly ${outlines.length} complete, production-ready slide objects for this batch in strict JSON array format.
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
            temperature: 0.25,
          },
        });

        const result = await model.generateContent([CHUNK_SYSTEM_PROMPT, userPrompt]);
        const text = result.response.text().trim();
        const cleaned = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "").trim();
        const parsed = JSON.parse(cleaned);

        if (Array.isArray(parsed) && parsed.length > 0) {
          const sanitized = parsed.map((s: any, idx: number) => {
            const outline = outlines[idx];
            return {
              ...s,
              id: s.id || `chunk-${chunkIndex}-slide-${idx}`,
              slideNumber: outline ? String(outline.slideNumber).padStart(2, "0") : undefined,
              speakerNotes: s.speakerNotes || outline?.speakerNotes || undefined,
            };
          });

          return NextResponse.json({
            success: true,
            chunkIndex,
            slides: sanitized,
            source: "gemini-chunk",
          });
        }
      } catch (gemErr: any) {
        console.warn(`Chunk ${chunkIndex} Gemini error:`, gemErr?.message);
      }
    }

    // 2. Try OpenAI / DeepSeek
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
          temperature: 0.25,
          messages: [
            { role: "system", content: CHUNK_SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
        });

        const raw = res.choices[0]?.message?.content || "";
        const cleaned = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "").trim();
        const parsed = JSON.parse(cleaned);

        if (Array.isArray(parsed) && parsed.length > 0) {
          const sanitized = parsed.map((s: any, idx: number) => {
            const outline = outlines[idx];
            return {
              ...s,
              id: s.id || `chunk-${chunkIndex}-slide-${idx}`,
              slideNumber: outline ? String(outline.slideNumber).padStart(2, "0") : undefined,
              speakerNotes: s.speakerNotes || outline?.speakerNotes || undefined,
            };
          });

          return NextResponse.json({
            success: true,
            chunkIndex,
            slides: sanitized,
            source: provider,
          });
        }
      } catch (openAiErr: any) {
        console.warn(`Chunk ${chunkIndex} OpenAI/Deepseek error:`, openAiErr?.message);
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
            temperature: 0.25,
            system: CHUNK_SYSTEM_PROMPT,
            messages: [{ role: "user", content: userPrompt }],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const raw = data.content?.[0]?.text || "";
          const cleaned = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "").trim();
          const parsed = JSON.parse(cleaned);

          if (Array.isArray(parsed) && parsed.length > 0) {
            const sanitized = parsed.map((s: any, idx: number) => {
              const outline = outlines[idx];
              return {
                ...s,
                id: s.id || `chunk-${chunkIndex}-slide-${idx}`,
                slideNumber: outline ? String(outline.slideNumber).padStart(2, "0") : undefined,
                speakerNotes: s.speakerNotes || outline?.speakerNotes || undefined,
              };
            });

            return NextResponse.json({
              success: true,
              chunkIndex,
              slides: sanitized,
              source: "anthropic",
            });
          }
        }
      } catch (anthropicErr: any) {
        console.warn(`Chunk ${chunkIndex} Anthropic Claude error:`, anthropicErr?.message);
      }
    }

    // Fallback synthesizer per chunk
    const fallbackSlides = outlines.map((o, idx) => ({
      id: `fallback-${chunkIndex}-${idx}`,
      layout: mapLayoutStringToLayout(o.visualLayout),
      title: o.headline,
      subtitle: o.subheadline || "Strategic Operational Framework",
      description: o.description || "Inisiatif menyeluruh untuk memastikan integrasi yang optimal across divisions.",
      badge: "EXECUTIVE BLUEPRINT",
      bgStyle: idx === 0 && chunkIndex === 0 ? "boldYellow" : "white",
      speakerNotes: o.speakerNotes || "Panduan Presenter: Paparkan pesan inti slide ini dengan ringkas dalam 1-2 menit, fokus pada dampak strategis.",
      bullets: o.bullets || [
        "Pilar Utama: Standarisasi arsitektur kerja dan efisiensi waktu eksekusi.",
        "Dampak Terukur: Memaksimalkan transparansi operasional lintas pemangku kepentingan.",
      ],
      processSteps: [
        { title: "Tahap 1: Ingestion", description: "Standardisasi input materi dan verifikasi data." },
        { title: "Tahap 2: Synthesis", description: "Pemetaan framework dan analisis mendalam." },
        { title: "Tahap 3: Delivery", description: "Penerapan solusi dan evaluasi dampak strategis." },
      ],
      slideNumber: String(o.slideNumber).padStart(2, "0"),
    }));

    return NextResponse.json({
      success: true,
      chunkIndex,
      slides: fallbackSlides,
      source: "fallback-chunk",
    });
  } catch (error: any) {
    console.error("Generate Chunk API Error:", error);
    return NextResponse.json({ success: false, error: error?.message || "Chunk generation error" }, { status: 500 });
  }
}

function mapLayoutStringToLayout(val?: string): string {
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
  return "bullets";
}
