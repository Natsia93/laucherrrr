import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { slackMessages } from "@/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

// POST /api/slack/threads - Add thread reply to a parent message
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { parentMessageId, content, user, attachments, sendAsEmail } = body;

    if (!parentMessageId || !content?.trim()) {
      return NextResponse.json({ error: "parentMessageId and content are required" }, { status: 400 });
    }

    const [parent] = await db
      .select()
      .from(slackMessages)
      .where(eq(slackMessages.id, parentMessageId));

    if (!parent) {
      return NextResponse.json({ error: "Parent message not found" }, { status: 404 });
    }

    const threadId = `th-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const now = new Date();

    const currentUser = user || {
      id: "user-current",
      name: "Fiqiy Muhammad",
      email: "fiqiy@revou.co",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      status: "online",
      role: "Workspace Owner",
    };

    const newReply = {
      id: threadId,
      channelId: parent.channelId,
      userId: currentUser.id,
      user: currentUser,
      content: content.trim(),
      attachments: attachments || [],
      createdAt: now.toISOString(),
      emailMeta: sendAsEmail
        ? {
            from: currentUser.email,
            fromName: currentUser.name,
            to: (parent.emailMeta as any)?.from || "client@company.com",
            subject: `Re: ${(parent.emailMeta as any)?.subject || "Thread Conversation"}`,
            deliveredViaEmail: true,
          }
        : undefined,
    };

    const existingThreads = (parent.threads as any[]) || [];
    const updatedThreads = [...existingThreads, newReply];
    const newCount = String(updatedThreads.length);

    await db
      .update(slackMessages)
      .set({
        threads: updatedThreads,
        threadCount: newCount,
        threadLastReply: now.toISOString(),
        updatedAt: now,
      })
      .where(eq(slackMessages.id, parentMessageId));

    return NextResponse.json({
      success: true,
      reply: newReply,
      threadCount: updatedThreads.length,
    });
  } catch (err: any) {
    console.error("Error creating Slack thread reply:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
