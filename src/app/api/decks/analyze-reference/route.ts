import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

export const runtime = "nodejs";
export const maxDuration = 60;

interface ExtractedStyleResult {
  palette: {
    primary: string;
    secondary: string;
    accent: string;
  };
  bgStyle: "solid" | "mixed" | "dualtone" | "gradient";
  isDarkTheme: boolean;
  typography: {
    titleFontSuggestion: "sf-pro" | "bricolage" | "jakarta" | "outfit" | "lora" | "inter";
    bodyFontSuggestion: "sf-pro" | "inter" | "jakarta" | "outfit";
    rationale: string;
  };
  layoutMood: "executive" | "framework" | "data";
  contentDensity: "brief" | "medium" | "detailed";
  designDNASummary: string;
  layoutPatterns: string[];
  visualDirectives: string;
  imageStyle?: string;
  extractedSampleContent?: string;
}

const SYSTEM_ANALYSIS_PROMPT = `
You are an elite Presentation Design Architect (McKinsey / Apple / Pentagram executive standard).
Analyze the uploaded reference presentation slide or deck image.
Deconstruct its visual DNA and design system with extreme precision.

Return ONLY a valid, parseable JSON object matching this exact schema (no markdown fences, no explanatory text):
{
  "palette": {
    "primary": "#HEX (dominant brand accent / button / highlight color, e.g. #FFE500, #0A2540, #3B82F6, #10B981)",
    "secondary": "#HEX (slide background or card surface color, e.g. #FFFFFF, #F8FAFC, #111827)",
    "accent": "#HEX (vibrant contrast color for badges, pill tags, key stats, e.g. #FF3B30, #FFDE3C, #06B6D4)"
  },
  "bgStyle": "solid" | "mixed" | "dualtone" | "gradient",
  "isDarkTheme": boolean,
  "typography": {
    "titleFontSuggestion": "sf-pro" | "bricolage" | "jakarta" | "outfit" | "lora" | "inter",
    "bodyFontSuggestion": "sf-pro" | "inter" | "jakarta" | "outfit",
    "rationale": "Short explanation of font choice based on visual traits"
  },
  "layoutMood": "framework" | "minimalist" | "data-driven" | "editorial" | "creative",
  "contentDensity": "brief" | "medium" | "detailed",
  "designDNASummary": "1-2 punchy sentences describing the exact aesthetic (e.g. Modern executive dark deck with neon accents and high whitespace)",
  "layoutPatterns": ["3-column card grid", "split metric hero", "horizontal progress", "bold quote banner"],
  "visualDirectives": "Concise bullet-point instructions for an AI slide generator to replicate this exact look, card padding, pill styling, and visual rhythm.",
  "imageStyle": "Description of any photos/illustrations used (e.g. clean 3D isometric, executive photography, flat vector, or none)",
  "extractedSampleContent": "Optional brief text summary of what is written on the slide if legible"
}
`;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const userApiKey = formData.get("apiKey") as string | null;
    const provider = (formData.get("provider") as string | null) || "gemini";

    if (!file) {
      return NextResponse.json({ success: false, error: "Tidak ada file gambar atau dokumen yang diunggah." }, { status: 400 });
    }

    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: "Ukuran file maksimal 15MB." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Data = buffer.toString("base64");
    const mimeType = file.type || "image/png";

    // 1. Try Gemini Vision (Native multimodal with gemini-2.5-flash)
    const geminiKey = (userApiKey && provider === "gemini" ? userApiKey : null) || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (geminiKey) {
      try {
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({
          model: "gemini-2.5-flash",
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        });

        const promptPart = "Analyze this presentation slide and output its design system and visual DNA strictly in JSON format.";
        const imagePart = {
          inlineData: {
            data: base64Data,
            mimeType: mimeType.startsWith("application/pdf") ? "application/pdf" : mimeType,
          },
        };

        const result = await model.generateContent([SYSTEM_ANALYSIS_PROMPT, promptPart, imagePart]);
        const responseText = result.response.text().trim();
        const cleaned = responseText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "").trim();
        const parsed: ExtractedStyleResult = JSON.parse(cleaned);

        return NextResponse.json({
          success: true,
          style: sanitizeExtractedStyle(parsed),
          source: "gemini-vision",
        });
      } catch (geminiErr: any) {
        console.warn("Gemini vision analysis failed, checking fallback:", geminiErr?.message);
      }
    }

    // 2. Try OpenAI Vision (GPT-4o / GPT-4o-mini)
    const openaiKey = (userApiKey && provider === "openai" ? userApiKey : null) || process.env.OPENAI_API_KEY;
    if (openaiKey) {
      try {
        const openai = new OpenAI({ apiKey: openaiKey });
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          temperature: 0.2,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: SYSTEM_ANALYSIS_PROMPT },
            {
              role: "user",
              content: [
                { type: "text", text: "Analyze this presentation slide and extract its visual DNA into the required JSON schema." },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${mimeType};base64,${base64Data}`,
                  },
                },
              ],
            },
          ],
        });

        const raw = completion.choices[0]?.message?.content || "{}";
        const parsed: ExtractedStyleResult = JSON.parse(raw);

        return NextResponse.json({
          success: true,
          style: sanitizeExtractedStyle(parsed),
          source: "openai-vision",
        });
      } catch (openAiErr: any) {
        console.error("OpenAI vision analysis failed:", openAiErr?.message);
      }
    }

    // 3. Try OpenRouter Vision (google/gemini-2.5-flash or openai/gpt-4o-mini)
    const openrouterKey = (userApiKey && provider === "openrouter" ? userApiKey : null) || process.env.OPENROUTER_API_KEY;
    if (openrouterKey) {
      try {
        const openrouter = new OpenAI({
          baseURL: "https://openrouter.ai/api/v1",
          apiKey: openrouterKey,
          defaultHeaders: {
            "HTTP-Referer": "https://launcher-os.local",
            "X-Title": "Launcher OS",
          },
        });
        const completion = await openrouter.chat.completions.create({
          model: "google/gemini-2.5-flash",
          temperature: 0.2,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: SYSTEM_ANALYSIS_PROMPT },
            {
              role: "user",
              content: [
                { type: "text", text: "Analyze this presentation slide and extract its visual DNA into the required JSON schema." },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${mimeType};base64,${base64Data}`,
                  },
                },
              ],
            },
          ],
        });

        const raw = completion.choices[0]?.message?.content || "{}";
        const parsed: ExtractedStyleResult = JSON.parse(raw);

        return NextResponse.json({
          success: true,
          style: sanitizeExtractedStyle(parsed),
          source: "openrouter-vision",
        });
      } catch (openRouterErr: any) {
        console.error("OpenRouter vision analysis failed:", openRouterErr?.message);
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "Tidak ada API Key Vision yang aktif (OpenRouter, Gemini, atau OpenAI dibutuhkan untuk analisis visual).",
      },
      { status: 500 }
    );
  } catch (error: any) {
    console.error("Analyze Reference Slide Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Gagal menganalisis slide contoh." },
      { status: 500 }
    );
  }
}

function sanitizeHex(val?: string, fallback: string = "#FFDE3C"): string {
  if (!val || typeof val !== "string") return fallback;
  const cleaned = val.trim();
  if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(cleaned)) {
    return cleaned;
  }
  return fallback;
}

function sanitizeExtractedStyle(data: any): ExtractedStyleResult {
  const allowedTitleFonts = ["sf-pro", "bricolage", "jakarta", "outfit", "lora", "inter"];
  const allowedBodyFonts = ["sf-pro", "inter", "jakarta", "outfit"];
  const allowedBgStyles = ["solid", "mixed", "dualtone", "gradient"];
  const allowedDensities = ["brief", "medium", "detailed"];
  const rawMood = String(data?.layoutMood || "").toLowerCase();
  const normalizedMood: "executive" | "framework" | "data" =
    rawMood.includes("data") || rawMood.includes("metric") || rawMood.includes("chart")
      ? "data"
      : rawMood.includes("framework") || rawMood.includes("process") || rawMood.includes("step")
      ? "framework"
      : "executive";

  return {
    palette: {
      primary: sanitizeHex(data?.palette?.primary, "#FFDE3C"),
      secondary: sanitizeHex(data?.palette?.secondary, "#FFFFFF"),
      accent: sanitizeHex(data?.palette?.accent, "#111111"),
    },
    bgStyle: allowedBgStyles.includes(data?.bgStyle) ? data.bgStyle : "mixed",
    isDarkTheme: Boolean(data?.isDarkTheme),
    typography: {
      titleFontSuggestion: allowedTitleFonts.includes(data?.typography?.titleFontSuggestion)
        ? data.typography.titleFontSuggestion
        : "sf-pro",
      bodyFontSuggestion: allowedBodyFonts.includes(data?.typography?.bodyFontSuggestion)
        ? data.typography.bodyFontSuggestion
        : "sf-pro",
      rationale: String(data?.typography?.rationale || "Modern clean pairing matched from sample."),
    },
    layoutMood: normalizedMood,
    contentDensity: allowedDensities.includes(data?.contentDensity) ? data.contentDensity : "medium",
    designDNASummary: String(data?.designDNASummary || "Modern executive presentation style"),
    layoutPatterns: Array.isArray(data?.layoutPatterns) ? data.layoutPatterns.slice(0, 6) : ["card-grid", "split-hero"],
    visualDirectives: String(data?.visualDirectives || ""),
    imageStyle: data?.imageStyle ? String(data.imageStyle) : undefined,
    extractedSampleContent: data?.extractedSampleContent ? String(data.extractedSampleContent) : undefined,
  };
}
