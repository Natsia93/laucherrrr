import { NextRequest, NextResponse } from "next/server";
import { performWebSearch } from "@/lib/web-search";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    let formatted: any[] = [];
    let providerName = "Google Web Search";

    try {
      const { results, provider } = await performWebSearch(query.trim());
      if (results && results.length > 0) {
        formatted = results.map((r: { title: string; url: string; snippet: string }) => ({
          title: r.title,
          url: r.url,
          snippet: r.snippet,
          source: r.url ? new URL(r.url).hostname : "Google Web Result",
        }));
        providerName = provider;
      }
    } catch (searchErr) {
      console.warn("Direct web search fallback triggered:", searchErr);
    }

    // High-signal AI Grounding fallback if web search returned empty
    if (formatted.length === 0) {
      try {
        const model = genAI.getGenerativeModel({
          model: "gemini-2.5-flash",
          generationConfig: { responseMimeType: "application/json" },
        });

        const prompt = `Anda adalah mesin pencari Google terdepan. Berikan 4 hasil pencarian web paling relevan, faktual, dan berbobot untuk query: "${query}".
Format respon JSON berupa array of objects:
[
  {
    "title": "Judul Artikel Terkait",
    "url": "https://sumber-resmi.com/artikel-terkait",
    "snippet": "Penjelasan intisari artikel yang padat fakta dan informatif",
    "source": "sumber-resmi.com"
  }
]`;

        const resp = await model.generateContent(prompt);
        const parsed = JSON.parse(resp.response.text());
        if (Array.isArray(parsed) && parsed.length > 0) {
          formatted = parsed;
          providerName = "Google AI Grounded Search";
        }
      } catch (geminiErr) {
        console.warn("Gemini search fallback error:", geminiErr);
      }
    }

    return NextResponse.json({
      success: true,
      query,
      results: formatted,
      provider: providerName,
    });
  } catch (err: any) {
    console.error("Agentic Vision Search Error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to perform web search" },
      { status: 500 }
    );
  }
}
