import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const { action, channelName, messages, prompt } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    if (action === "summarize") {
      const messagesText = (messages || [])
        .map((m: any) => `${m.user?.name || "User"}: ${m.content}`)
        .join("\n");

      const systemPrompt = `Anda adalah asisten cerdas Launcher OS Slack. Ringkas diskusi berikut di channel #${channelName || "general"}.
Format ringkasan:
1. **Inti Diskusi**: 1-2 kalimat ringkasan utama.
2. **Key Decisions & Action Items**: Poin-poin penting dan aksi tindak lanjut yang disepakati.
3. **Catatan / Follow-up**: Pihak terkait atau deadline (jika ada).
Gunakan bahasa Indonesia yang profesional, ringkas, dan jelas.

Percakapan:
${messagesText || "Belum ada riwayat pesan."}`;

      const result = await model.generateContent(systemPrompt);
      return NextResponse.json({
        success: true,
        summary: result.response.text(),
      });
    }

    if (action === "draft_reply") {
      const context = prompt || "Draft balasan profesional untuk pesan tim.";
      const systemPrompt = `Anda adalah asisten komunikasi Launcher OS. Buatkan draf balasan pesan yang sopan, solutif, dan to the point untuk Slack/Email Bridge.
Konteks / Instruksi: ${context}
Gunakan format markdown yang bersih dan ramah.`;

      const result = await model.generateContent(systemPrompt);
      return NextResponse.json({
        success: true,
        draft: result.response.text(),
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("Slack AI helper error:", err);
    return NextResponse.json({ error: err?.message || "AI generation failed" }, { status: 500 });
  }
}
