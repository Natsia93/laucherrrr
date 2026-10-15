import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// Webhook endpoint that can be called externally to trigger a flow
// POST /api/automation/webhook/[webhookId]
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ webhookId: string }> }
) {
  try {
    const { webhookId } = await params;
    const body = await req.json().catch(() => ({}));
    const headersList = Object.fromEntries(req.headers.entries());

    // Store the webhook event in memory (in production, use a queue like Redis)
    // For now, we acknowledge and return the payload shape
    const event = {
      webhookId,
      receivedAt: new Date().toISOString(),
      method: req.method,
      body,
      headers: {
        "content-type": headersList["content-type"],
        "user-agent": headersList["user-agent"],
        authorization: headersList["authorization"] ? "[REDACTED]" : undefined,
      },
    };

    console.log(`[Webhook] Received event for ${webhookId}:`, JSON.stringify(event, null, 2));

    return NextResponse.json({
      success: true,
      message: `Webhook received by Launcher OS Automation`,
      webhookId,
      receivedAt: event.receivedAt,
      bodyKeys: Object.keys(body),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Webhook processing error" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ webhookId: string }> }
) {
  const { webhookId } = await params;
  return NextResponse.json({
    status: "active",
    webhookId,
    message: "Launcher OS Automation Webhook is ready to receive events",
    supportedMethods: ["POST", "GET", "PUT"],
  });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ webhookId: string }> }
) {
  return POST(req, { params });
}
