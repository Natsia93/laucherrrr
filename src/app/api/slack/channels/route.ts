import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { slackChannels } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { INITIAL_CHANNELS } from "@/components/slack/mockData";

export const runtime = "nodejs";

// GET /api/slack/channels - Fetch all channels or auto-seed defaults if empty
export async function GET() {
  try {
    let channels = await db.select().from(slackChannels).orderBy(asc(slackChannels.createdAt));

    if (channels.length === 0) {
      // Auto-seed initial channels
      const seedData = INITIAL_CHANNELS.map((ch) => ({
        id: ch.id,
        name: ch.name,
        topic: ch.topic || "",
        description: ch.description || "",
        type: ch.type || "channel",
        isPrivate: Boolean(ch.isPrivate),
        isEmailBridge: Boolean(ch.isEmailBridge),
        emailAddress: ch.emailAddress || null,
        unreadCount: String(ch.unreadCount || 0),
        membersCount: String(ch.membersCount || 8),
        partnerUser: ch.partnerUser ? JSON.parse(JSON.stringify(ch.partnerUser)) : null,
        pinnedMessageIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      await db.insert(slackChannels).values(seedData);
      channels = await db.select().from(slackChannels).orderBy(asc(slackChannels.createdAt));
    }

    return NextResponse.json({
      success: true,
      channels: channels.map((c) => ({
        ...c,
        unreadCount: Number(c.unreadCount || 0),
        membersCount: Number(c.membersCount || 8),
      })),
    });
  } catch (err: any) {
    console.error("Error fetching Slack channels:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

// POST /api/slack/channels - Create a new channel
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      topic,
      description,
      type = "channel",
      isPrivate = false,
      isEmailBridge = false,
      emailAddress,
    } = body;

    if (!name) {
      return NextResponse.json({ error: "Channel name is required" }, { status: 400 });
    }

    const cleanName = name.toLowerCase().trim().replace(/\s+/g, "-");
    const channelId = `c-${cleanName}-${Date.now().toString(36)}`;

    const newChannel = {
      id: channelId,
      name: cleanName,
      topic: topic || (isEmailBridge ? `📥 Bridge email untuk ${emailAddress || cleanName}` : "Channel diskusi tim"),
      description: description || "",
      type: type as "channel" | "dm" | "email",
      isPrivate: Boolean(isPrivate),
      isEmailBridge: Boolean(isEmailBridge),
      emailAddress: emailAddress || (isEmailBridge ? `${cleanName}@launcheros.app` : null),
      unreadCount: "0",
      membersCount: "1",
      pinnedMessageIds: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(slackChannels).values(newChannel);

    return NextResponse.json({
      success: true,
      channel: {
        ...newChannel,
        unreadCount: 0,
        membersCount: 1,
      },
    });
  } catch (err: any) {
    console.error("Error creating Slack channel:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
