import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";

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

    const [record] = await db
      .select()
      .from(schema.scratchpads)
      .where(eq(schema.scratchpads.userId, user.id))
      .limit(1);

    return NextResponse.json({
      content: record ? record.content : "",
      updatedAt: record ? record.updatedAt : null,
    });
  } catch (error: any) {
    console.error("GET /api/scratchpad error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch scratchpad" },
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
    const content = typeof body.content === "string" ? body.content : "";

    const [existing] = await db
      .select()
      .from(schema.scratchpads)
      .where(eq(schema.scratchpads.userId, user.id))
      .limit(1);

    if (existing) {
      const [updated] = await db
        .update(schema.scratchpads)
        .set({
          content,
          updatedAt: new Date(),
        })
        .where(eq(schema.scratchpads.userId, user.id))
        .returning();

      return NextResponse.json({ success: true, scratchpad: updated });
    } else {
      const [created] = await db
        .insert(schema.scratchpads)
        .values({
          id: `sp_${user.id}`,
          userId: user.id,
          content,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      return NextResponse.json({ success: true, scratchpad: created });
    }
  } catch (error: any) {
    console.error("POST /api/scratchpad error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to save scratchpad" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const user = await getAuthenticatedUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await db
      .update(schema.scratchpads)
      .set({
        content: "",
        updatedAt: new Date(),
      })
      .where(eq(schema.scratchpads.userId, user.id));

    return NextResponse.json({ success: true, message: "Scratchpad cleared" });
  } catch (error: any) {
    console.error("DELETE /api/scratchpad error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to clear scratchpad" },
      { status: 500 }
    );
  }
}
