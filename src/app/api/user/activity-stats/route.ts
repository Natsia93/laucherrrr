import { NextResponse } from "next/server";
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

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const currentJsDay = now.getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat
    const daysSinceMonday = (currentJsDay + 6) % 7; // 0 = Mon ... 6 = Sun

    const monday = new Date(now);
    monday.setDate(now.getDate() - daysSinceMonday);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    // Fetch documents
    const userDocs = await db
      .select({
        id: schema.documents.id,
        type: schema.documents.type,
        createdAt: schema.documents.createdAt,
      })
      .from(schema.documents)
      .where(
        and(
          eq(schema.documents.userId, user.id),
          eq(schema.documents.isDeleted, false)
        )
      );

    // Fetch chat conversations
    const userChats = await db
      .select({
        id: schema.chatConversations.id,
        messages: schema.chatConversations.messages,
        createdAt: schema.chatConversations.createdAt,
        updatedAt: schema.chatConversations.updatedAt,
      })
      .from(schema.chatConversations)
      .where(eq(schema.chatConversations.userId, user.id));



    // Initialize 7 days data (Monday to Sunday)
    const dayKeys = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const fullDays = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    const weekUsage = [0, 0, 0, 0, 0, 0, 0];
    let totalAllTimeCreditsUsed = 0;

    // Calculate usage from documents (5 credits each for automated deck/document generation)
    for (const doc of userDocs) {
      const docCost = 5;
      totalAllTimeCreditsUsed += docCost;
      const dTime = new Date(doc.createdAt).getTime();
      if (dTime >= monday.getTime() && dTime <= sunday.getTime()) {
        const dDay = (new Date(doc.createdAt).getDay() + 6) % 7;
        weekUsage[dDay] += docCost;
      }
    }

    // Calculate usage from chats (1 credit per successful assistant reply)
    for (const chat of userChats) {
      const msgs = Array.isArray(chat.messages) ? chat.messages : [];
      // Only count valid assistant responses that are not error messages
      const validAssistantReplies = msgs.filter((m: any) => {
        if (m.role !== "assistant") return false;
        const text = m.text || "";
        if (!text.trim()) return false;
        if (
          text.includes("Sorry, an error occurred") ||
          text.includes("Failed to connect to AI") ||
          text.includes("API key")
        ) {
          return false;
        }
        return true;
      }).length;

      if (validAssistantReplies > 0) {
        totalAllTimeCreditsUsed += validAssistantReplies;
        const cTime = new Date(chat.updatedAt || chat.createdAt).getTime();
        if (cTime >= monday.getTime() && cTime <= sunday.getTime()) {
          const cDay = (new Date(chat.updatedAt || chat.createdAt).getDay() + 6) % 7;
          weekUsage[cDay] += validAssistantReplies;
        }
      }
    }

    const creditsTotal = 120;
    const creditsUsed = totalAllTimeCreditsUsed;
    const creditsRemaining = Math.max(0, creditsTotal - creditsUsed);

    const weekData = dayKeys.map((key, i) => ({
      dayKey: key,
      name: dayNames[i],
      fullDay: fullDays[i],
      usage: weekUsage[i],
      isToday: i === daysSinceMonday,
      isFuture: i > daysSinceMonday,
    }));

    return NextResponse.json({
      creditsTotal,
      creditsUsed,
      creditsRemaining,
      currentDayIndex: daysSinceMonday,
      weekData,
    });
  } catch (error: any) {
    console.error("GET /api/user/activity-stats error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch activity stats" },
      { status: 500 }
    );
  }
}
