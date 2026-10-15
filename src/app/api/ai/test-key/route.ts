import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

// Provider configuration registry
const PROVIDER_CONFIG: Record<string, {
  baseURL: string;
  defaultModel: string;
  label: string;
}> = {
  deepseek: {
    baseURL: "https://api.deepseek.com",
    defaultModel: "deepseek-chat",
    label: "DeepSeek",
  },
  openai: {
    baseURL: "https://api.openai.com/v1",
    defaultModel: "gpt-4o-mini",
    label: "OpenAI",
  },
  anthropic: {
    baseURL: "https://api.anthropic.com/v1",
    defaultModel: "claude-3-5-sonnet-20241022",
    label: "Anthropic (Claude)",
  },
  gemini: {
    baseURL: "https://generativelanguage.googleapis.com/v1beta",
    defaultModel: "gemini-2.0-flash",
    label: "Google Gemini",
  },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const apiKey = body.apiKey?.trim();
    const provider = body.provider || "deepseek";
    const model = body.model;

    if (!apiKey || apiKey.length === 0) {
      return Response.json(
        { success: false, error: "API Key cannot be empty." },
        { status: 400 }
      );
    }

    const config = PROVIDER_CONFIG[provider];
    if (!config) {
      return Response.json(
        { success: false, error: `Unknown provider: ${provider}` },
        { status: 400 }
      );
    }

    const targetModel = model || config.defaultModel;

    // Google Gemini uses official GoogleGenerativeAI SDK
    if (provider === "gemini") {
      return await testGemini(apiKey, targetModel, config.label);
    }

    // Anthropic uses a non-OpenAI-compatible header auth
    if (provider === "anthropic") {
      return await testAnthropic(apiKey, targetModel, config.label);
    }

    // DeepSeek and OpenAI use OpenAI-compatible SDK
    const startTime = Date.now();
    const client = new OpenAI({
      baseURL: config.baseURL,
      apiKey,
      timeout: 15000,
    });

    const response = await client.chat.completions.create({
      model: targetModel,
      messages: [{ role: "user", content: "Respond with only: OK" }],
      max_tokens: 5,
    });

    const latency = Date.now() - startTime;

    if (response.choices && response.choices.length > 0) {
      return Response.json({
        success: true,
        provider,
        model: response.model || targetModel,
        latencyMs: latency,
        message: `Connected successfully to ${config.label} API.`,
      });
    } else {
      return Response.json(
        { success: false, error: `No response returned by ${config.label}.` },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error("AI Key Test Error:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to connect. Please verify your API key.";
    return Response.json(
      { success: false, error: errorMessage },
      { status: 401 }
    );
  }
}

// Anthropic uses its own REST API format (not OpenAI-compatible)
async function testAnthropic(apiKey: string, model: string, label: string) {
  const startTime = Date.now();

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 5,
        messages: [{ role: "user", content: "Respond with only: OK" }],
      }),
      signal: AbortSignal.timeout(15000),
    });

    const latency = Date.now() - startTime;
    const data = await res.json();

    if (res.ok && data.content) {
      return Response.json({
        success: true,
        provider: "anthropic",
        model: data.model || model,
        latencyMs: latency,
        message: `Connected successfully to ${label} API.`,
      });
    } else {
      return Response.json(
        { success: false, error: data.error?.message || `Failed to reach ${label}.` },
        { status: res.status }
      );
    }
  } catch (error: unknown) {
    console.error("Anthropic Key Test Error:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to connect to Anthropic.";
    return Response.json(
      { success: false, error: errorMessage },
      { status: 401 }
    );
  }
}

// Google Gemini test using dynamic model discovery + official SDK + REST fallback
async function testGemini(apiKey: string, requestedModel: string, label: string) {
  const startTime = Date.now();
  let availableModels: string[] = [];

  // Step 1: Query ListModels to find which models are actually active and supported for this key
  try {
    const listRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`,
      {
        method: "GET",
        headers: { "x-goog-api-key": apiKey },
        signal: AbortSignal.timeout(10000),
      }
    );
    if (listRes.ok) {
      const listData = await listRes.json();
      if (Array.isArray(listData?.models)) {
        availableModels = listData.models
          .filter((m: any) =>
            m.supportedGenerationMethods?.includes("generateContent")
          )
          .map((m: any) => m.name.replace(/^models\//, ""));
      }
    }
  } catch (e) {
    console.warn("Could not list Gemini models:", e);
  }

  const cleanRequested = (requestedModel || "").replace(/^models\//, "");

  // Build priority order: requested model (if in available list), then available models, then fallback candidates
  const candidateModels = [
    ...(availableModels.includes(cleanRequested) ? [cleanRequested] : []),
    ...availableModels,
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-1.5-flash-latest",
    "gemini-1.5-pro-latest",
    "gemini-pro",
  ].filter((v, i, a) => v && a.indexOf(v) === i);

  let lastErrorMsg = "Failed to connect to Google Gemini API.";

  for (const targetModel of candidateModels) {
    // Strategy 1: Google Generative AI SDK
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const m = genAI.getGenerativeModel({ model: targetModel });
      const result = await m.generateContent("Respond with: OK");
      const responseText = result.response.text();

      if (responseText) {
        return Response.json({
          success: true,
          provider: "gemini",
          model: targetModel,
          availableModels: availableModels.length > 0 ? availableModels : undefined,
          latencyMs: Date.now() - startTime,
          message: `Connected successfully to ${label} (${targetModel})!`,
        });
      }
    } catch (sdkError: any) {
      lastErrorMsg = sdkError?.message || lastErrorMsg;
    }

    // Strategy 2: Direct REST with x-goog-api-key
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: "Respond with: OK" }] }],
          }),
          signal: AbortSignal.timeout(15000),
        }
      );

      const data = await res.json();

      if (res.ok && data?.candidates?.length > 0) {
        return Response.json({
          success: true,
          provider: "gemini",
          model: targetModel,
          availableModels: availableModels.length > 0 ? availableModels : undefined,
          latencyMs: Date.now() - startTime,
          message: `Connected successfully to ${label} (${targetModel})!`,
        });
      } else {
        lastErrorMsg = data?.error?.message || lastErrorMsg;
      }
    } catch (restError: any) {
      lastErrorMsg = restError?.message || lastErrorMsg;
    }
  }

  return Response.json(
    {
      success: false,
      error: lastErrorMsg,
    },
    { status: 401 }
  );
}



