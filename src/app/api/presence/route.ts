import { NextRequest, NextResponse } from "next/server";

export interface PresenceUser {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  color: string;
  status: string;
  moodEmoji: string;
  moodLabel: string;
  lastSeen: number;
}

// Global in-memory presence store across API invocations in server lifecycle
declare global {
  // eslint-disable-next-line no-var
  var __launcher_presence_store__: Map<string, PresenceUser> | undefined;
}

const store: Map<string, PresenceUser> =
  global.__launcher_presence_store__ ??
  (global.__launcher_presence_store__ = new Map<string, PresenceUser>());

// Timeout threshold: 12 seconds of inactivity -> considered offline
const PRESENCE_TIMEOUT_MS = 12000;

function cleanupExpiredUsers() {
  const now = Date.now();
  for (const [id, user] of store.entries()) {
    if (now - user.lastSeen > PRESENCE_TIMEOUT_MS) {
      store.delete(id);
    }
  }
}

export async function GET() {
  cleanupExpiredUsers();
  const users = Array.from(store.values()).sort((a, b) => b.lastSeen - a.lastSeen);
  return NextResponse.json({ users });
}

export async function POST(req: NextRequest) {
  try {
    let body: any = null;
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      body = await req.json();
    } else {
      // Beacon often sends text/plain
      const text = await req.text();
      if (text) {
        try {
          body = JSON.parse(text);
        } catch {
          body = null;
        }
      }
    }

    if (!body) {
      cleanupExpiredUsers();
      return NextResponse.json({ users: Array.from(store.values()) });
    }

    const { action, user, userId } = body;

    if (action === "leave" && userId) {
      store.delete(userId);
    } else if ((action === "heartbeat" || action === "join") && user?.id) {
      store.set(user.id, {
        id: user.id,
        name: user.name || "Member",
        role: user.role || "Member",
        avatar: user.avatar || undefined,
        color: user.color || "#FFE54C",
        status: user.status || "Active",
        moodEmoji: user.moodEmoji || "😄",
        moodLabel: user.moodLabel || "Great",
        lastSeen: Date.now(),
      });
    } else if (action === "update_mood" && user?.id) {
      const existing = store.get(user.id);
      if (existing) {
        store.set(user.id, {
          ...existing,
          moodEmoji: user.moodEmoji || existing.moodEmoji,
          moodLabel: user.moodLabel || existing.moodLabel,
          avatar: user.avatar || existing.avatar,
          lastSeen: Date.now(),
        });
      }
    }

    cleanupExpiredUsers();
    const users = Array.from(store.values()).sort((a, b) => b.lastSeen - a.lastSeen);
    return NextResponse.json({ users });
  } catch (error) {
    console.error("Presence API error:", error);
    cleanupExpiredUsers();
    return NextResponse.json({ users: Array.from(store.values()) });
  }
}
