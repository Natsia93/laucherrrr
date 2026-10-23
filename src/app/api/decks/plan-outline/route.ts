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
Your job is to transform raw topics, curriculum, or business notes into a comprehensive, highly structured Master Slide Blueprint.

=== UNIVERSAL ARCHITECTURAL RULES (FOR CLAUDE, DEEPSEEK, GPT, & GEMINI) ===
1. TARGET SLIDE COUNT: Output EXACTLY the requested number of slides. Do not cut short! If 50 slides are requested, output exactly 50 slide items.
2. ACTION TITLES (MANDATORY):
   - Every headline MUST be a substantive, informative sentence/claim (5-9 words), NEVER boring category labels like "Introduction", "Slide 3", or "Agenda".
   - ACTION TITLE RULE: Left-aligned, one line where possible. NEVER end a slide title with a period!
3. STORYTELLING ARC & VISUAL PACING (Anti-Monoton):
   - Slide 1: "Hero / Cover" (Grand strategic hook, executive subtitle, authoritative headline).
   - Slide 2: "Two Column" or "Bullets" (Context, friction, current state vs target vision).
   - Core Middle Slides: Dynamically rotate between layouts:
     * "Process / Implementation Steps"
     * "Flow Diagram / Architecture"
     * "Timeline / Roadmap"
     * "Table Comparison / Matrix"
     * "Stats / Key Metrics" (Only when real numbers or metrics are involved; NEVER invent fake numbers!)
     * "Bullets / Key Pillars"
     * "Two Column / Problem vs Solution"
   - Final Slide: "Bold Impact / Call to Action" (High-conviction strategic close).
   - NEVER repeat the exact same layout more than twice consecutively!
4. PRESENTER / SPEAKER NOTES:
   - Provide "speakerNotes" for EVERY slide: 2 to 4 crisp sentences explaining the slide's core intent, key takeaway, timing, or mentor guidance.
5. NO INVENTED METRICS:
   - If exact metrics are absent from input material, use qualitative descriptions or visible bracket placeholders like [X]%.

OUTPUT FORMAT:
Return ONLY a valid, parseable JSON array of objects with schema:
[
  {
    "slideNumber": 1,
    "headline": "Active Executive Claim Without Period",
    "subheadline": "Strategic subheadline providing context",
    "visualLayout": "Hero" | "Two Column" | "Process" | "Timeline" | "Table Comparison" | "Flow Diagram" | "Bullets" | "Stats" | "Bold Impact",
    "description": "Substantive summary of what this slide covers",
    "keyPoints": ["Bullet 1", "Bullet 2"],
    "speakerNotes": "Executive talking points and facilitation timing guidance"
  }
]
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
      clonedStyleDirectives = "",
      apiKey,
      provider = "gemini",
      model: requestedModel,
    } = body;

    const count = Math.min(Math.max(parseInt(String(targetCount), 10) || 10, 3), 100);

    const userPrompt = `
RAW TOPIC / MATERIALS / CURRICULUM:
"""
${content}
"""

TARGET SLIDE COUNT: Exactly ${count} slides.
AUDIENCE: ${audience}
PURPOSE: ${purpose}
LAYOUT MOOD: ${layoutMood}
${clonedStyleDirectives ? `\nREFERENCE STYLE GUIDELINES:\n${clonedStyleDirectives}\n` : ""}

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
            temperature: 0.3,
          },
        });

        const result = await model.generateContent([OUTLINE_SYSTEM_PROMPT, userPrompt]);
        const text = result.response.text().trim();
        const cleaned = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "").trim();
        const parsed = JSON.parse(cleaned);

        if (Array.isArray(parsed) && parsed.length > 0) {
          const sanitized = parsed.map((item: any, idx: number) => ({
            slideNumber: idx + 1,
            headline: String(item.headline || `Slide ${idx + 1}`),
            subheadline: String(item.subheadline || ""),
            visualLayout: String(item.visualLayout || "Bullets"),
            description: String(item.description || ""),
            bullets: Array.isArray(item.keyPoints) ? item.keyPoints.slice(0, 4) : undefined,
            speakerNotes: item.speakerNotes ? String(item.speakerNotes) : undefined,
          }));

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
          temperature: 0.3,
          messages: [
            { role: "system", content: OUTLINE_SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
        });

        const raw = res.choices[0]?.message?.content || "";
        const cleaned = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "").trim();
        const parsed = JSON.parse(cleaned);

        if (Array.isArray(parsed) && parsed.length > 0) {
          const sanitized = parsed.map((item: any, idx: number) => ({
            slideNumber: idx + 1,
            headline: String(item.headline || `Slide ${idx + 1}`),
            subheadline: String(item.subheadline || ""),
            visualLayout: String(item.visualLayout || "Bullets"),
            description: String(item.description || ""),
            bullets: Array.isArray(item.keyPoints) ? item.keyPoints.slice(0, 4) : undefined,
            speakerNotes: item.speakerNotes ? String(item.speakerNotes) : undefined,
          }));

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
            const sanitized = parsed.map((item: any, idx: number) => ({
              slideNumber: idx + 1,
              headline: String(item.headline || `Slide ${idx + 1}`),
              subheadline: String(item.subheadline || ""),
              visualLayout: String(item.visualLayout || "Bullets"),
              description: String(item.description || ""),
              bullets: Array.isArray(item.keyPoints) ? item.keyPoints.slice(0, 4) : undefined,
              speakerNotes: item.speakerNotes ? String(item.speakerNotes) : undefined,
            }));

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
