import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel - Clean, professional voice

export async function POST(req: NextRequest) {
  try {
    const { text, voiceId = DEFAULT_VOICE_ID, apiKey: userKey } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const apiKey = userKey || process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        fallback: true,
        reason: "NO_KEY",
        message: "No ElevenLabs key provided, falling back to Web Speech API",
      });
    }

    // Call ElevenLabs Text-to-Speech API
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey.trim(),
      },
      body: JSON.stringify({
        text: text.slice(0, 500), // Protect quota
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn("ElevenLabs TTS warning:", response.status, errText);
      return NextResponse.json({
        fallback: true,
        reason: "API_ERROR",
        status: response.status,
        message: "ElevenLabs API rejected or quota exhausted, falling back to Web Speech API",
      });
    }

    const audioBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString("base64");

    return NextResponse.json({
      success: true,
      audioBase64: base64Audio,
      contentType: "audio/mpeg",
    });
  } catch (err: any) {
    console.warn("ElevenLabs voice route exception:", err);
    return NextResponse.json({
      fallback: true,
      reason: "EXCEPTION",
      message: err?.message || "Failed to reach ElevenLabs, falling back to Web Speech API",
    });
  }
}
