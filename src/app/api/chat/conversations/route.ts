import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, desc } from "drizzle-orm";

async function getAuthenticatedUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session?.user || null;
}

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rows = await db
      .select({
        id: schema.chatConversations.id,
        title: schema.chatConversations.title,
        docType: schema.chatConversations.docType,
        createdAt: schema.chatConversations.createdAt,
        updatedAt: schema.chatConversations.updatedAt,
        messages: schema.chatConversations.messages,
      })
      .from(schema.chatConversations)
      .where(eq(schema.chatConversations.userId, user.id))
      .orderBy(desc(schema.chatConversations.updatedAt));

    const conversations = rows.map((c) => ({
      id: c.id,
      title: c.title,
      docType: c.docType,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      messageCount: Array.isArray(c.messages) ? c.messages.length : 0,
      preview: Array.isArray(c.messages) && c.messages.length > 0
        ? (c.messages[c.messages.length - 1] as any)?.text?.slice(0, 80) || ""
        : "",
    }));

    return NextResponse.json({ conversations });
  } catch (error: any) {
    console.error("GET /api/chat/conversations error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, title, docType, messages } = body;

    const messagesArray = Array.isArray(messages) ? messages : [];

    // Helper to generate a clean title if none provided
    const deriveTitle = () => {
      if (title && typeof title === "string" && title.trim()) {
        return title.trim();
      }
      const firstUserMsg = messagesArray.find((m: any) => m.role === "user");
      if (firstUserMsg?.text && typeof firstUserMsg.text === "string") {
        const clean = firstUserMsg.text.replace(/\s+/g, " ").trim();
        return clean.length > 36 ? `${clean.slice(0, 36)}...` : clean;
      }
      return "Percakapan Baru";
    };

    if (id) {
      // Check if conversation exists for this user
      const [existing] = await db
        .select()
        .from(schema.chatConversations)
        .where(eq(schema.chatConversations.id, id))
        .limit(1);

      if (existing && existing.userId === user.id) {
        const updateData: any = {
          messages: messagesArray,
          updatedAt: new Date(),
        };
        if (title) updateData.title = title.trim();
        if (docType !== undefined) updateData.docType = docType;

        const [updated] = await db
          .update(schema.chatConversations)
          .set(updateData)
          .where(eq(schema.chatConversations.id, id))
          .returning();

        return NextResponse.json({ conversation: updated });
      }
    }

    // Insert new conversation
    const newId = id || `conv_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const newTitle = deriveTitle();

    const [created] = await db
      .insert(schema.chatConversations)
      .values({
        id: newId,
        userId: user.id,
        title: newTitle,
        docType: docType || "",
        messages: messagesArray,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json({ conversation: created }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/chat/conversations error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to save conversation" },
      { status: 500 }
    );
  }
}
