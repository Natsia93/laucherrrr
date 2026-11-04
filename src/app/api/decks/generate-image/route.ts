import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      prompt = "",
      style = "minimal-vector",
      primaryColor = "#005AAB",
      accentColor = "#FFDD3C",
    } = body;

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Prompt is required to generate an image." },
        { status: 400 }
      );
    }

    const cleanSubject = prompt
      .replace(/buatkan|tambahkan|generate|gambar|ilustrasi|image|illustration|tolong|please/gi, "")
      .trim();

    // Construct refined executive-grade prompt
    const enhancedPrompt = `Minimalist corporate vector illustration of ${cleanSubject}, modern flat executive slide graphic, clean geometric shapes, palette themed around ${primaryColor} and ${accentColor}, high contrast, isolated on clean background, no text, no watermark, crisp vector style`;

    const seed = Math.floor(Math.random() * 999999);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
      enhancedPrompt
    )}?width=1024&height=768&nologo=true&seed=${seed}`;

    return NextResponse.json({
      success: true,
      imageUrl,
      format: "png",
      prompt: cleanSubject,
    });
  } catch (error: any) {
    console.error("[Generate Image Error]", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to generate image." },
      { status: 500 }
    );
  }
}
