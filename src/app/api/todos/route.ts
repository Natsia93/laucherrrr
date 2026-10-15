import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

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

    const todos = await db
      .select()
      .from(schema.todos)
      .where(eq(schema.todos.userId, user.id))
      .orderBy(desc(schema.todos.createdAt));

    return NextResponse.json({ todos });
  } catch (error: any) {
    console.error("GET /api/todos error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch todos" },
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
    const { task, isCompleted, id } = body;

    if (!task || typeof task !== "string" || !task.trim()) {
      return NextResponse.json({ error: "Task description is required" }, { status: 400 });
    }

    const todoId = id || `todo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const [newTodo] = await db
      .insert(schema.todos)
      .values({
        id: todoId,
        userId: user.id,
        task: task.trim(),
        isCompleted: Boolean(isCompleted),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json({ todo: newTodo }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/todos error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create todo" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, isCompleted, task } = body;

    if (!id) {
      return NextResponse.json({ error: "Todo ID is required" }, { status: 400 });
    }

    const updateData: Partial<typeof schema.todos.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (typeof isCompleted === "boolean") {
      updateData.isCompleted = isCompleted;
    }
    if (typeof task === "string" && task.trim()) {
      updateData.task = task.trim();
    }

    const [updatedTodo] = await db
      .update(schema.todos)
      .set(updateData)
      .where(and(eq(schema.todos.id, id), eq(schema.todos.userId, user.id)))
      .returning();

    if (!updatedTodo) {
      return NextResponse.json({ error: "Todo not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ todo: updatedTodo });
  } catch (error: any) {
    console.error("PATCH /api/todos error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update todo" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const clearCompleted = searchParams.get("clearCompleted") === "true";
    const id = searchParams.get("id");

    if (clearCompleted) {
      await db
        .delete(schema.todos)
        .where(
          and(
            eq(schema.todos.userId, user.id),
            eq(schema.todos.isCompleted, true)
          )
        );
      return NextResponse.json({ success: true, message: "Completed todos cleared" });
    }

    if (!id) {
      return NextResponse.json({ error: "Todo ID is required" }, { status: 400 });
    }

    await db
      .delete(schema.todos)
      .where(and(eq(schema.todos.id, id), eq(schema.todos.userId, user.id)));

    return NextResponse.json({ success: true, message: "Todo deleted" });
  } catch (error: any) {
    console.error("DELETE /api/todos error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete todo" },
      { status: 500 }
    );
  }
}
