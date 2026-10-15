import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { slackMessages, slackChannels } from "@/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      text,
      content,
      channel,
      channelId,
      username,
      botName,
      emailMeta,
      attachments,
      source,
    } = body;

    const messageText = content || text || "Webhook payload received.";

    // Resolve channel: check by ID or name
    let targetChannel = channelId || (channel?.replace(/^#/, "") ? `c-${channel.replace(/^#/, "")}` : "c-general");

    try {
      const existingCh = await db.select().from(slackChannels).where(eq(slackChannels.id, targetChannel));
      if (existingCh.length === 0) {
        const cleanName = (channel?.replace(/^#/, "") || "general").toLowerCase();
        const byName = await db.select().from(slackChannels).where(eq(slackChannels.name, cleanName));
        if (byName.length > 0) {
          targetChannel = byName[0].id;
        } else {
          targetChannel = "c-general";
        }
      }
    } catch {
      targetChannel = "c-general";
    }

    const messageId = `hook-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const now = new Date();

    const webhookUser = {
      id: "u-webhook-bot",
      name: username || botName || (source ? `${source} Integration` : "Launcher OS Webhook"),
      email: "webhook@launcheros.app",
      avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100",
      status: "online",
      role: "Automation Bot",
      isBot: true,
    };

    const newDbMsg = {
      id: messageId,
      channelId: targetChannel,
      userId: "u-webhook-bot",
      user: webhookUser,
      content: messageText,
      attachments: attachments || [],
      reactions: [{ emoji: "🚀", count: 1, users: ["u-webhook-bot"] }],
      threadCount: "0",
      threadLastReply: null,
      threads: [],
      isPinned: false,
      emailMeta: emailMeta || null,
      isAi: false,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(slackMessages).values(newDbMsg);

    const formattedMessage = {
      ...newDbMsg,
      threadCount: 0,
      createdAt: now.toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: formattedMessage,
      deliveredTo: targetChannel,
      timestamp: now.toISOString(),
    });
  } catch (err: any) {
    console.error("Slack incoming webhook error:", err);
    return NextResponse.json({ error: err?.message || "Webhook processing failed" }, { status: 500 });
  }
}
