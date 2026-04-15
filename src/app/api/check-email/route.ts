import { NextResponse } from "next/server";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ exists: false });
    }

    const existingUser = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, email.toLowerCase().trim()))
      .limit(1);

    return NextResponse.json({ exists: existingUser.length > 0 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Check email error:", error);
    return NextResponse.json({ exists: false, error: message }, { status: 500 });
  }
}
