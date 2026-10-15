import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, and } from "drizzle-orm";

async function getAuthenticatedUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session?.user || null;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const [conversation] = await db
      .select()
      .from(schema.chatConversations)
      .where(
        and(
          eq(schema.chatConversations.id, id),
          eq(schema.chatConversations.userId, user.id)
        )
      )
      .limit(1);

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    return NextResponse.json({ conversation });
  } catch (error: any) {
    console.error("GET /api/chat/conversations/[id] error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to load conversation" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { title } = body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ error: "Valid title is required" }, { status: 400 });
    }

    const [updated] = await db
      .update(schema.chatConversations)
      .set({
        title: title.trim(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(schema.chatConversations.id, id),
          eq(schema.chatConversations.userId, user.id)
        )
      )
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    return NextResponse.json({ conversation: updated });
  } catch (error: any) {
    console.error("PATCH /api/chat/conversations/[id] error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update conversation" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const [deleted] = await db
      .delete(schema.chatConversations)
      .where(
        and(
          eq(schema.chatConversations.id, id),
          eq(schema.chatConversations.userId, user.id)
        )
      )
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error("DELETE /api/chat/conversations/[id] error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete conversation" },
      { status: 500 }
    );
  }
}
