import { NextResponse } from "next/server";
import { db } from "@/db";
import { slackMessages, slackChannels } from "@/db/schema";
import { INITIAL_CHANNELS } from "@/components/slack/mockData";

export const runtime = "nodejs";

// POST /api/slack/reset - Wipe all dummy messages and reset clean default channels
export async function POST() {
  try {
    // 1. Delete all existing messages
    await db.delete(slackMessages);

    // 2. Delete all existing channels
    await db.delete(slackChannels);

    // 3. Re-insert clean channels (#general, inbox-support)
    const cleanChannels = INITIAL_CHANNELS.map((ch) => ({
      id: ch.id,
      name: ch.name,
      topic: ch.topic || "",
      description: ch.description || "",
      type: ch.type || "channel",
      isPrivate: Boolean(ch.isPrivate),
      isEmailBridge: Boolean(ch.isEmailBridge),
      emailAddress: ch.emailAddress || null,
      unreadCount: "0",
      membersCount: "1",
      partnerUser: null,
      pinnedMessageIds: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await db.insert(slackChannels).values(cleanChannels);

    return NextResponse.json({
      success: true,
      message: "Slack workspace wiped clean successfully",
      channels: cleanChannels,
    });
  } catch (err: any) {
    console.error("Error resetting Slack workspace:", err);
    return NextResponse.json({ error: err?.message || "Reset failed" }, { status: 500 });
  }
}
