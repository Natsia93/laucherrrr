import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const body = await req.json();
    const { name, image, email } = body;

    const targetUserId = session?.user?.id;
    const targetEmail = session?.user?.email || email;

    if (targetUserId) {
      await db
        .update(schema.user)
        .set({
          ...(name ? { name: name.trim() } : {}),
          ...(image !== undefined ? { image } : {}),
          updatedAt: new Date(),
        })
        .where(eq(schema.user.id, targetUserId));

      return NextResponse.json({ success: true, message: "Profile updated in database" });
    } else if (targetEmail) {
      // Fallback update by email if session ID is not directly matched
      await db
        .update(schema.user)
        .set({
          ...(name ? { name: name.trim() } : {}),
          ...(image !== undefined ? { image } : {}),
          updatedAt: new Date(),
        })
        .where(eq(schema.user.email, targetEmail.trim()));

      return NextResponse.json({ success: true, message: "Profile updated in database" });
    }

    return NextResponse.json(
      { success: false, error: "Unauthorized or user not found" },
      { status: 401 }
    );
  } catch (error: any) {
    console.error("Error updating user profile in database:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
