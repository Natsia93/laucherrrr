import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { workflows } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";

export const runtime = "nodejs";

export interface GlobalVariable {
  id: string;
  key: string;
  value: string;
  type: "text" | "secret" | "number" | "json";
  description?: string;
}

// GET /api/automation/variables
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ variables: [] });
    }

    const configId = `system_vars_${userId}`;
    const record = await db.query.workflows.findFirst({
      where: and(eq(workflows.id, configId), eq(workflows.userId, userId)),
    });

    if (record && Array.isArray(record.nodes)) {
      return NextResponse.json({ success: true, variables: record.nodes });
    }

    return NextResponse.json({ success: true, variables: [] });
  } catch (error: any) {
    console.error("Error fetching global variables:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch variables" },
      { status: 500 }
    );
  }
}

// POST /api/automation/variables
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { variables } = await req.json();

    if (!Array.isArray(variables)) {
      return NextResponse.json({ error: "Variables must be an array" }, { status: 400 });
    }

    const configId = `system_vars_${userId}`;
    const existing = await db.query.workflows.findFirst({
      where: and(eq(workflows.id, configId), eq(workflows.userId, userId)),
    });

    if (existing) {
      await db
        .update(workflows)
        .set({
          nodes: variables as any,
          updatedAt: new Date(),
        })
        .where(eq(workflows.id, configId));
    } else {
      await db.insert(workflows).values({
        id: configId,
        userId,
        name: "Global Automation Variables",
        description: "System environment variables and tokens for Launcher OS",
        nodes: variables as any,
        edges: [],
      });
    }

    return NextResponse.json({ success: true, count: variables.length });
  } catch (error: any) {
    console.error("Error saving global variables:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to save variables" },
      { status: 500 }
    );
  }
}
