import { NextRequest, NextResponse } from "next/server";
import { recordWebhookEvent } from "@/lib/webhook-store";
import { db } from "@/db";
import { workflows } from "@/db/schema";

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
    const clientIp = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";

    // Check if this webhookId matches any registered workflow
    let matchedFlowName: string | undefined = undefined;
    try {
      const allFlows = await db.query.workflows.findMany();
      for (const flow of allFlows) {
        if (Array.isArray(flow.nodes)) {
          const hasMatch = (flow.nodes as any[]).some(
            (node) =>
              (node.type === "webhookTriggerNode" || node.data?.nodeType === "webhook_trigger") &&
              (node.data?.config?.webhookId === webhookId || node.id === webhookId)
          );
          if (hasMatch) {
            matchedFlowName = flow.name;
            break;
          }
        }
      }
    } catch {}

    const recorded = recordWebhookEvent({
      webhookId,
      method: req.method,
      receivedAt: new Date().toISOString(),
      status: 200,
      headers: {
        "content-type": headersList["content-type"],
        "user-agent": headersList["user-agent"],
        authorization: headersList["authorization"] ? "[REDACTED]" : undefined,
      },
      body,
      ip: clientIp,
      matchedFlowName,
    });

    return NextResponse.json({
      success: true,
      message: `Webhook "${webhookId}" processed successfully by Launcher OS Automation`,
      webhookId,
      receivedAt: recorded.receivedAt,
      matchedFlowName: matchedFlowName || null,
      bodyKeys: Object.keys(body),
      event: {
        id: recorded.id,
        method: recorded.method,
        status: 200,
      },
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
  const clientIp = req.headers.get("x-forwarded-for") || "127.0.0.1";

  const recorded = recordWebhookEvent({
    webhookId,
    method: "GET",
    receivedAt: new Date().toISOString(),
    status: 200,
    headers: {
      "user-agent": req.headers.get("user-agent") || undefined,
    },
    body: { ping: "ok", queryParams: Object.fromEntries(req.nextUrl.searchParams.entries()) },
    ip: clientIp,
  });

  return NextResponse.json({
    status: "active",
    webhookId,
    message: "Launcher OS Automation Webhook is ready to receive events",
    supportedMethods: ["POST", "GET", "PUT"],
    receivedAt: recorded.receivedAt,
    eventId: recorded.id,
  });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ webhookId: string }> }
) {
  return POST(req, { params });
}
