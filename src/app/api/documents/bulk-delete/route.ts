import { NextResponse } from "next/server";
import { db } from "@/db";
import { documents } from "@/db/schema";
import { inArray, and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ids } = await req.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No IDs provided" }, { status: 400 });
    }

    const result = await db.delete(documents)
      .where(and(
        inArray(documents.id, ids),
        eq(documents.userId, session.user.id)
      ))
      .returning();

    return NextResponse.json({ 
      success: true, 
      count: result.length 
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Bulk Delete Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
