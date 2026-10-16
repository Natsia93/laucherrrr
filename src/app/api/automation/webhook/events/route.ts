import { NextRequest, NextResponse } from "next/server";
import { getWebhookEvents, clearWebhookEvents } from "@/lib/webhook-store";
import { db } from "@/db";
import { workflows } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const events = getWebhookEvents();

    // Also fetch user's workflows with webhook triggers
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    const userId = session?.user?.id;

    let registeredTriggers: Array<{
      flowId: string;
      flowName: string;
      webhookId: string;
      method: string;
    }> = [];

    if (userId) {
      try {
        const userFlows = await db.query.workflows.findMany({
          where: eq(workflows.userId, userId),
        });

        for (const flow of userFlows) {
          if (Array.isArray(flow.nodes)) {
            for (const node of flow.nodes as any[]) {
              if (
                node.type === "webhookTriggerNode" ||
                node.data?.nodeType === "webhook_trigger"
              ) {
                registeredTriggers.push({
                  flowId: flow.id,
                  flowName: flow.name,
                  webhookId: node.data?.config?.webhookId || node.id,
                  method: node.data?.config?.method || "POST",
                });
              }
            }
          }
        }
      } catch (err) {
        console.warn("Could not query user registered triggers:", err);
      }
    }

    return NextResponse.json({
      success: true,
      events,
      totalCount: events.length,
      registeredTriggers,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch webhook events" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  clearWebhookEvents();
  return NextResponse.json({ success: true, message: "Webhook events cleared" });
}
