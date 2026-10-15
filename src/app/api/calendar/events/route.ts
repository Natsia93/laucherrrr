import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { calendarEvents, account } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { headers } from "next/headers";

export const runtime = "nodejs";

// Helper to refresh Google OAuth Access Token if expired
async function getValidGoogleAccessToken(userId: string): Promise<string | null> {
  try {
    const userAccount = await db
      .select()
      .from(account)
      .where(and(eq(account.userId, userId), eq(account.providerId, "google")))
      .limit(1);

    if (!userAccount.length || !userAccount[0].accessToken) {
      return null;
    }

    const acc = userAccount[0];
    const now = new Date();

    // If access token is still valid (with 2 min buffer), return it
    if (acc.accessTokenExpiresAt && acc.accessTokenExpiresAt.getTime() > now.getTime() + 120000) {
      return acc.accessToken;
    }

    // If expired but refresh token exists, refresh from Google OAuth endpoint
    if (acc.refreshToken && process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      const refreshRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          refresh_token: acc.refreshToken,
          grant_type: "refresh_token",
        }),
      });

      if (refreshRes.ok) {
        const tokenData = await refreshRes.json();
        const newAccessToken = tokenData.access_token;
        const expiresIn = tokenData.expires_in || 3600;
        const newExpiresAt = new Date(Date.now() + expiresIn * 1000);

        await db
          .update(account)
          .set({
            accessToken: newAccessToken,
            accessTokenExpiresAt: newExpiresAt,
            updatedAt: new Date(),
          })
          .where(eq(account.id, acc.id));

        return newAccessToken;
      }
    }

    // Return current access token as fallback
    return acc.accessToken;
  } catch (err) {
    console.error("Error refreshing Google Access Token:", err);
    return null;
  }
}

// In-memory cache for ultra-fast instant responses
const calendarCache = new Map<string, { timestamp: number; data: any }>();
const CACHE_TTL_MS = 30000; // 30 seconds cache

// ── GET: Fetch Real Events from Google Calendar API v3 ──
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({
        success: true,
        events: [],
        isGuest: true,
        googleConnected: false,
        requiresAuth: true,
      });
    }

    const userId = session.user.id;
    const userEmail = session.user.email;
    const { searchParams } = new URL(req.url);
    const forceRefresh = searchParams.get("refresh") === "true";

    // Return instant cached data if fresh and not force-refreshing
    const cached = calendarCache.get(userId);
    if (!forceRefresh && cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json(cached.data);
    }

    // 1. Attempt to fetch real Google Calendar events
    const accessToken = await getValidGoogleAccessToken(userId);
    let googleEvents: any[] = [];
    let googleConnected = false;
    let calendarScopeGranted = false;

    if (accessToken) {
      try {
        const timeMin = new Date(Date.now() - 30 * 86400000).toISOString(); // 30 days past
        const timeMax = new Date(Date.now() + 90 * 86400000).toISOString(); // 90 days ahead

        const gRes = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events?singleEvents=true&orderBy=startTime&timeMin=${encodeURIComponent(
            timeMin
          )}&timeMax=${encodeURIComponent(timeMax)}&maxResults=150`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            signal: AbortSignal.timeout(5000),
          }
        );

        if (gRes.ok) {
          const gData = await gRes.json();
          googleEvents = gData.items || [];
          googleConnected = true;
          calendarScopeGranted = true;
        } else if (gRes.status === 403 || gRes.status === 401) {
          console.warn("Google Calendar API returned 403/401 (Scope might not be granted yet):", await gRes.text());
          googleConnected = true;
          calendarScopeGranted = false;
        }
      } catch (gErr) {
        console.error("Google Calendar API fetch error or timeout:", gErr);
        // Fallback to existing cache if fetch timed out
        if (cached) {
          return NextResponse.json(cached.data);
        }
      }
    }

    // 2. Fetch local database events created in Launcher OS
    const dbEvents = await db
      .select()
      .from(calendarEvents)
      .where(eq(calendarEvents.userId, userId))
      .orderBy(desc(calendarEvents.startTime));

// Helper to detect meeting link from Google hangout, Zoom, Teams, Webex in location or description
function extractMeetingLink(item: any): string {
  if (item.hangoutLink) return item.hangoutLink;
  if (item.conferenceData?.entryPoints?.[0]?.uri) return item.conferenceData.entryPoints[0].uri;

  const textToCheck = `${item.location || ""} ${item.description || ""}`;
  
  const zoomMatch = textToCheck.match(/https?:\/\/[a-zA-Z0-9.\-_]*zoom\.us\/(?:j|w|my|wc)\/[a-zA-Z0-9?=_&.-]+/i);
  if (zoomMatch) return zoomMatch[0];

  const meetMatch = textToCheck.match(/https?:\/\/meet\.google\.com\/[a-zA-Z0-9-]+/i);
  if (meetMatch) return meetMatch[0];

  const teamsMatch = textToCheck.match(/https?:\/\/teams\.microsoft\.com\/[a-zA-Z0-9?=_&./-]+/i);
  if (teamsMatch) return teamsMatch[0];

  if (item.location && (item.location.startsWith("http://") || item.location.startsWith("https://"))) {
    return item.location;
  }

  return "";
}

    // 3. Transform Google Events to unified Launcher OS Task format
    const mappedGoogleEvents = googleEvents.map((item: any) => {
      const startIso = item.start?.dateTime || item.start?.date || new Date().toISOString();
      const endIso = item.end?.dateTime || item.end?.date || startIso;
      const isAllDay = Boolean(item.start?.date && !item.start?.dateTime);

      // Category detection based on summary / colorId
      let category = "strategy";
      const summaryLower = (item.summary || "").toLowerCase();
      if (summaryLower.includes("meeting") || summaryLower.includes("sync") || summaryLower.includes("call") || summaryLower.includes("1:1")) {
        category = "meeting";
      } else if (summaryLower.includes("review") || summaryLower.includes("feedback") || summaryLower.includes("demo")) {
        category = "review";
      } else if (summaryLower.includes("deploy") || summaryLower.includes("release") || summaryLower.includes("task") || summaryLower.includes("bug")) {
        category = "task";
      }

      // Smart video meeting detection (Zoom, Google Meet, Teams, etc.)
      const meetLink = extractMeetingLink(item);

      return {
        id: `gcal-${item.id}`,
        googleId: item.id,
        title: item.summary || "(Untitled Event)",
        description: item.description || "",
        startTime: startIso,
        endTime: endIso,
        category,
        color: category === "meeting" ? "#8B5CF6" : category === "review" ? "#10B981" : category === "task" ? "#3B82F6" : "#FFE500",
        location: item.location || "",
        meetLink,
        isAllDay,
        source: "google",
      };
    });

    // 4. Transform DB events
    const mappedDbEvents = dbEvents
      .filter((d) => !googleEvents.some((g) => g.id === d.googleEventId))
      .map((d) => ({
        id: d.id,
        googleId: d.googleEventId || undefined,
        title: d.title,
        description: d.description || "",
        startTime: d.startTime.toISOString(),
        endTime: d.endTime.toISOString(),
        category: d.category || "strategy",
        color: d.color || "#FFE500",
        location: d.location || "",
        meetLink: d.meetLink || "",
        isAllDay: d.isAllDay || false,
        source: "local",
      }));

    // Merge Google events + local events
    const mergedEvents = [...mappedGoogleEvents, ...mappedDbEvents];

    const responsePayload = {
      success: true,
      events: mergedEvents,
      googleConnected,
      calendarScopeGranted,
      userEmail,
      isGuest: false,
    };

    // Store in server cache
    calendarCache.set(userId, {
      timestamp: Date.now(),
      data: responsePayload,
    });

    return NextResponse.json(responsePayload);
  } catch (error: any) {
    console.error("Error in Calendar GET route:", error);
    return NextResponse.json(
      {
        success: false,
        events: [],
        error: error.message || "Internal error",
      },
      { status: 500 }
    );
  }
}

// ── POST: Create Event directly on Google Calendar + DB ──
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await req.json();
    const {
      title,
      description = "",
      startTime,
      endTime,
      category = "strategy",
      color = "#FFE500",
      location = "",
      meetLink = "",
      isAllDay = false,
    } = body;

    if (!title || !startTime) {
      return NextResponse.json(
        { success: false, error: "Title and start time are required." },
        { status: 400 }
      );
    }

    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date(start.getTime() + 60 * 60 * 1000);

    // 1. If Google account connected, sync to Google Calendar API
    let googleEventId: string | null = null;
    let finalMeetLink = meetLink;

    const accessToken = await getValidGoogleAccessToken(userId);
    if (accessToken) {
      try {
        const gBody: any = {
          summary: title,
          description,
          location,
          start: isAllDay
            ? { date: start.toISOString().split("T")[0] }
            : { dateTime: start.toISOString() },
          end: isAllDay
            ? { date: end.toISOString().split("T")[0] }
            : { dateTime: end.toISOString() },
        };

        // If meet requested or online
        if (meetLink || body.type === "online") {
          gBody.conferenceData = {
            createRequest: {
              requestId: `meet-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              conferenceSolutionKey: { type: "hangoutsMeet" },
            },
          };
        }

        const gRes = await fetch(
          "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(gBody),
          }
        );

        if (gRes.ok) {
          const gData = await gRes.json();
          googleEventId = gData.id;
          if (gData.hangoutLink) {
            finalMeetLink = gData.hangoutLink;
          }
        }
      } catch (gErr) {
        console.warn("Failed to create on Google Calendar API:", gErr);
      }
    }

    // 2. Persist in local database
    const eventId = `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    await db.insert(calendarEvents).values({
      id: eventId,
      userId,
      title,
      description,
      startTime: start,
      endTime: end,
      category,
      color,
      location,
      meetLink: finalMeetLink,
      googleEventId,
      isAllDay,
    });

    calendarCache.delete(userId);

    return NextResponse.json({
      success: true,
      event: {
        id: googleEventId ? `gcal-${googleEventId}` : eventId,
        googleId: googleEventId || undefined,
        title,
        description,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        category,
        color,
        location,
        meetLink: finalMeetLink,
        isAllDay,
        source: googleEventId ? "google" : "local",
      },
    });
  } catch (error: any) {
    console.error("Error in Calendar POST route:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create event" },
      { status: 500 }
    );
  }
}

// ── DELETE: Delete Event on Google Calendar + DB ──
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("id");

    if (!eventId) {
      return NextResponse.json(
        { success: false, error: "Event ID is required" },
        { status: 400 }
      );
    }

    // If it's a Google event (`gcal-xxx`), delete from Google Calendar API
    if (eventId.startsWith("gcal-")) {
      const gcalId = eventId.replace(/^gcal-/, "");
      const accessToken = await getValidGoogleAccessToken(userId);
      if (accessToken) {
        try {
          await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(gcalId)}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
        } catch (gErr) {
          console.warn("Failed to delete event from Google Calendar API:", gErr);
        }
      }
    }

    // Delete from local DB if exists
    await db
      .delete(calendarEvents)
      .where(and(eq(calendarEvents.id, eventId), eq(calendarEvents.userId, userId)));

    calendarCache.delete(userId);

    return NextResponse.json({ success: true, deletedId: eventId });
  } catch (error: any) {
    console.error("Error in Calendar DELETE route:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete event" },
      { status: 500 }
    );
  }
}
