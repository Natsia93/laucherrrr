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

    // Fetch documents / slide decks created
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

    const weekRequests = [0, 0, 0, 0, 0, 0, 0];
    let totalDeckCount = userDocs.length;
    let totalChatReplies = 0;

    // Daily distribution of slide deck creations
    for (const doc of userDocs) {
      const dTime = new Date(doc.createdAt).getTime();
      if (dTime >= monday.getTime() && dTime <= sunday.getTime()) {
        const dDay = (new Date(doc.createdAt).getDay() + 6) % 7;
        weekRequests[dDay] += 1;
      }
    }

    // Daily distribution of chat assistant replies
    for (const chat of userChats) {
      const msgs = Array.isArray(chat.messages) ? chat.messages : [];
      const validReplies = msgs.filter((m: any) => {
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

      if (validReplies > 0) {
        totalChatReplies += validReplies;
        const cTime = new Date(chat.updatedAt || chat.createdAt).getTime();
        if (cTime >= monday.getTime() && cTime <= sunday.getTime()) {
          const cDay = (new Date(chat.updatedAt || chat.createdAt).getDay() + 6) % 7;
          weekRequests[cDay] += validReplies;
        }
      }
    }

    const totalGenerations = totalDeckCount + totalChatReplies;

    const weekData = dayKeys.map((key, i) => ({
      dayKey: key,
      name: dayNames[i],
      fullDay: fullDays[i],
      requests: weekRequests[i],
      usage: weekRequests[i], // backward compatibility
      isToday: i === daysSinceMonday,
      isFuture: i > daysSinceMonday,
    }));

    return NextResponse.json({
      totalGenerations,
      totalDecks: totalDeckCount,
      totalChats: totalChatReplies,
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
