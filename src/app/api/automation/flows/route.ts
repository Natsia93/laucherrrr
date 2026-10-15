import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { workflows } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ flows: [] });
    }

    const userFlows = await db.query.workflows.findMany({
      where: eq(workflows.userId, userId),
      orderBy: (w, { desc }) => [desc(w.updatedAt)],
    });

    return NextResponse.json({ flows: userFlows });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to fetch flows" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const { id, name, description, nodes, edges, viewport } = await req.json();

    const flowId = id || `flow-${Date.now()}`;

    const existing = await db.query.workflows.findFirst({
      where: eq(workflows.id, flowId),
    });

    if (existing) {
      await db.update(workflows)
        .set({
          name: name || existing.name,
          description: description || existing.description,
          nodes: nodes || existing.nodes,
          edges: edges || existing.edges,
          viewport: viewport || existing.viewport,
          updatedAt: new Date(),
        })
        .where(eq(workflows.id, flowId));
    } else {
      await db.insert(workflows).values({
        id: flowId,
        userId,
        name: name || "Untitled Automation Flow",
        description: description || "",
        nodes: nodes || [],
        edges: edges || [],
        viewport: viewport || {},
      });
    }

    return NextResponse.json({ success: true, flowId });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to save flow" }, { status: 500 });
  }
}
