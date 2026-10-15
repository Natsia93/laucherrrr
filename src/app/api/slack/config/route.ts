import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { slackConfigs } from "@/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

const GLOBAL_CONFIG_ID = "global-config";

// GET /api/slack/config - Get Slack workspace configuration
export async function GET() {
  try {
    const [config] = await db
      .select()
      .from(slackConfigs)
      .where(eq(slackConfigs.id, GLOBAL_CONFIG_ID));

    if (!config) {
      const defaultConfig = {
        id: GLOBAL_CONFIG_ID,
        webhookUrl: "",
        defaultChannel: "#general",
        botName: "Launcher OS Bot",
        emailBridgeEnabled: true,
        inboundEmailDomain: "launcheros.app",
        autoAiReply: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await db.insert(slackConfigs).values(defaultConfig);
      return NextResponse.json({ success: true, config: defaultConfig });
    }

    return NextResponse.json({ success: true, config });
  } catch (err: any) {
    console.error("Error fetching Slack config:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

// POST /api/slack/config - Update Slack workspace configuration
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      webhookUrl = "",
      defaultChannel = "#general",
      botName = "Launcher OS Bot",
      emailBridgeEnabled = true,
      inboundEmailDomain = "launcheros.app",
      autoAiReply = true,
    } = body;

    const [existing] = await db
      .select()
      .from(slackConfigs)
      .where(eq(slackConfigs.id, GLOBAL_CONFIG_ID));

    if (existing) {
      await db
        .update(slackConfigs)
        .set({
          webhookUrl,
          defaultChannel,
          botName,
          emailBridgeEnabled: Boolean(emailBridgeEnabled),
          inboundEmailDomain,
          autoAiReply: Boolean(autoAiReply),
          updatedAt: new Date(),
        })
        .where(eq(slackConfigs.id, GLOBAL_CONFIG_ID));
    } else {
      await db.insert(slackConfigs).values({
        id: GLOBAL_CONFIG_ID,
        webhookUrl,
        defaultChannel,
        botName,
        emailBridgeEnabled: Boolean(emailBridgeEnabled),
        inboundEmailDomain,
        autoAiReply: Boolean(autoAiReply),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      config: {
        webhookUrl,
        defaultChannel,
        botName,
        emailBridgeEnabled,
        inboundEmailDomain,
        autoAiReply,
      },
    });
  } catch (err: any) {
    console.error("Error saving Slack config:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
