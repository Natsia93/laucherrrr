import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/db";
import { slackMessages, slackChannels } from "@/db/schema";
import { eq, desc, asc } from "drizzle-orm";
import { INITIAL_MESSAGES, INITIAL_CHANNELS } from "@/components/slack/mockData";

export const runtime = "nodejs";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Auto-seed helper
async function ensureSeeded() {
  try {
    const existingCh = await db.select().from(slackChannels).limit(1);
    if (existingCh.length === 0) {
      const seedChannels = INITIAL_CHANNELS.map((ch) => ({
        id: ch.id,
        name: ch.name,
        topic: ch.topic || "",
        description: ch.description || "",
        type: ch.type || "channel",
        isPrivate: Boolean(ch.isPrivate),
        isEmailBridge: Boolean(ch.isEmailBridge),
        emailAddress: ch.emailAddress || null,
        unreadCount: String(ch.unreadCount || 0),
        membersCount: String(ch.membersCount || 1),
        partnerUser: null,
        pinnedMessageIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      await db.insert(slackChannels).values(seedChannels).onConflictDoNothing();
    }
  } catch (seedErr) {
    console.warn("Seeding warning:", seedErr);
  }
}

// GET /api/slack/messages - Fetch messages for a channel or all messages
export async function GET(req: NextRequest) {
  try {
    await ensureSeeded();

    const { searchParams } = new URL(req.url);
    const channelId = searchParams.get("channelId");

    let messages;
    if (channelId) {
      messages = await db
        .select()
        .from(slackMessages)
        .where(eq(slackMessages.channelId, channelId))
        .orderBy(asc(slackMessages.createdAt));
    } else {
      messages = await db
        .select()
        .from(slackMessages)
        .orderBy(asc(slackMessages.createdAt));
    }

    const formattedMessages = messages.map((m) => ({
      id: m.id,
      channelId: m.channelId,
      userId: m.userId,
      user: m.user as any,
      content: m.content,
      attachments: (m.attachments as any[]) || [],
      reactions: (m.reactions as any[]) || [],
      threadCount: Number(m.threadCount || 0),
      threadLastReply: m.threadLastReply || undefined,
      threads: (m.threads as any[]) || [],
      isPinned: Boolean(m.isPinned),
      emailMeta: (m.emailMeta as any) || undefined,
      isAI: Boolean(m.isAi),
      createdAt: m.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      messages: formattedMessages,
    });
  } catch (err: any) {
    console.error("Error fetching Slack messages:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

// POST /api/slack/messages - Insert message to database, handle email, webhook & @ai
export async function POST(req: NextRequest) {
  try {
    await ensureSeeded();

    const body = await req.json();
    const {
      channelId = "c-general",
      content = "",
      attachments = [],
      sendAsEmail = false,
      emailSubject,
      emailTo,
      webhookUrl,
      user,
      botName,
    } = body;

    if (!content.trim() && (!attachments || attachments.length === 0)) {
      return NextResponse.json({ error: "Message content or attachments required" }, { status: 400 });
    }

    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const now = new Date();

    let deliveredViaEmail = false;
    let deliveredViaWebhook = false;

    // 1. Email Bridge handling
    if (sendAsEmail || emailTo) {
      deliveredViaEmail = true;
      console.log(`[Slack Email Bridge] Dispatched email to ${emailTo || "team@launcheros.app"} with subject: ${emailSubject || "Slack Message Notification"}`);
    }

    // 2. External Outbound Webhook forwarder
    if (webhookUrl && webhookUrl.startsWith("http")) {
      try {
        const hookRes = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: `*[${user?.name || botName || "Launcher OS"}]*: ${content}`,
            username: botName || user?.name || "Launcher OS Bot",
          }),
          signal: AbortSignal.timeout(5000),
        });
        deliveredViaWebhook = hookRes.ok;
      } catch (hookErr) {
        console.warn("Outbound webhook error:", hookErr);
      }
    }

    const emailMetadata = (sendAsEmail || emailTo)
      ? {
          from: user?.email || "fiqiy@revou.co",
          fromName: user?.name || "Fiqiy Muhammad",
          to: emailTo || "support@revou.co",
          subject: emailSubject || "Update from Launcher OS Slack",
          deliveredViaEmail: true,
          messageId: `eml-${Date.now()}`,
        }
      : null;

    const currentUserData = user || {
      id: "user-current",
      name: "Fiqiy Muhammad",
      email: "fiqiy@revou.co",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      status: "online",
      role: "Workspace Owner",
    };

    const newDbMsg = {
      id: messageId,
      channelId: channelId,
      userId: currentUserData.id,
      user: currentUserData,
      content: content.trim(),
      attachments: attachments || [],
      reactions: [],
      threadCount: "0",
      threadLastReply: null,
      threads: [],
      isPinned: false,
      emailMeta: emailMetadata,
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

    // 3. Optional AI Assistant auto-reply if @ai is mentioned
    let aiResponse = null;
    if (content && (content.includes("@ai") || content.includes("@launcher") || content.includes("@bot"))) {
      try {
        const cleanPrompt = content.replace(/@(ai|launcher|bot)/gi, "").trim();
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `You are Launcher OS Slack Copilot, a helpful, executive AI assistant in a modern startup workspace. Answer the following query cleanly and concisely in Indonesian with Slack markdown style:\n\nQuery: "${cleanPrompt}"`,
                },
              ],
            },
          ],
        });

        const replyText = result.response.text();
        if (replyText) {
          const aiMsgId = `msg-ai-${Date.now()}`;
          const aiNow = new Date(Date.now() + 500);

          const aiUser = {
            id: "u-copilot",
            name: "Launcher AI Copilot",
            email: "copilot@launcheros.app",
            avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100",
            status: "online",
            role: "AI Assistant",
            isBot: true,
          };

          const aiDbMsg = {
            id: aiMsgId,
            channelId: channelId,
            userId: "u-copilot",
            user: aiUser,
            content: replyText,
            attachments: [],
            reactions: [{ emoji: "⚡", count: 1, users: ["u-copilot"] }],
            threadCount: "0",
            threadLastReply: null,
            threads: [],
            isPinned: false,
            emailMeta: null,
            isAi: true,
            createdAt: aiNow,
            updatedAt: aiNow,
          };

          await db.insert(slackMessages).values(aiDbMsg);

          aiResponse = {
            ...aiDbMsg,
            threadCount: 0,
            createdAt: aiNow.toISOString(),
          };
        }
      } catch (aiErr) {
        console.warn("AI Slack auto-reply error:", aiErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: formattedMessage,
      aiResponse,
      deliveredViaEmail,
      deliveredViaWebhook,
    });
  } catch (err: any) {
    console.error("Error creating Slack message:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/slack/messages - Toggle reaction, pin, or update message in database
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { messageId, action, emoji, userId = "user-current" } = body;

    if (!messageId) {
      return NextResponse.json({ error: "messageId is required" }, { status: 400 });
    }

    const [existing] = await db
      .select()
      .from(slackMessages)
      .where(eq(slackMessages.id, messageId));

    if (!existing) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    if (action === "toggle_reaction") {
      let reactions = (existing.reactions as any[]) || [];
      const existingReactionIndex = reactions.findIndex((r) => r.emoji === emoji);

      if (existingReactionIndex > -1) {
        const r = reactions[existingReactionIndex];
        const hasUser = r.users?.includes(userId);

        if (hasUser) {
          r.users = r.users.filter((u: string) => u !== userId);
          r.count = Math.max(0, r.count - 1);
          if (r.count === 0) {
            reactions.splice(existingReactionIndex, 1);
          }
        } else {
          r.users = [...(r.users || []), userId];
          r.count += 1;
        }
      } else {
        reactions.push({
          emoji: emoji,
          count: 1,
          users: [userId],
        });
      }

      await db
        .update(slackMessages)
        .set({ reactions: reactions, updatedAt: new Date() })
        .where(eq(slackMessages.id, messageId));

      return NextResponse.json({ success: true, reactions });
    }

    if (action === "toggle_pin") {
      const newPinned = !existing.isPinned;
      await db
        .update(slackMessages)
        .set({ isPinned: newPinned, updatedAt: new Date() })
        .where(eq(slackMessages.id, messageId));

      return NextResponse.json({ success: true, isPinned: newPinned });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("Error updating Slack message:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/slack/messages - Delete a message
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const messageId = searchParams.get("id");

    if (!messageId) {
      return NextResponse.json({ error: "Message ID is required" }, { status: 400 });
    }

    await db.delete(slackMessages).where(eq(slackMessages.id, messageId));

    return NextResponse.json({ success: true, deletedId: messageId });
  } catch (err: any) {
    console.error("Error deleting Slack message:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
