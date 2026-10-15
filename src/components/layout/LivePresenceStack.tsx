"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Copy,
  X,
  Smile,
} from "lucide-react";
import { MoodCheckInModal, MoodOption } from "./MoodCheckInModal";
import { authClient } from "@/lib/auth-client";

export interface ActiveUser {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  color: string;
  status: string;
  moodEmoji: string;
  moodLabel: string;
  isCurrentUser?: boolean;
}

const COLOR_PALETTE = [
  "#FFE54C", // Bright Yellow
  "#60A5FA", // Blue
  "#34D399", // Emerald Green
  "#F472B6", // Pink
  "#A78BFA", // Violet
  "#F97316", // Orange
  "#38BDF8", // Sky
];

function getOrCreateClientId(): string {
  if (typeof window === "undefined") return "client-init";
  let id = sessionStorage.getItem("launcher_os_client_id");
  if (!id) {
    id = `usr_${Math.random().toString(36).substring(2, 8)}`;
    sessionStorage.setItem("launcher_os_client_id", id);
  }
  return id;
}

function getOrCreateClientColor(clientId: string): string {
  if (typeof window === "undefined") return "#FFE54C";
  let color = sessionStorage.getItem("launcher_os_client_color");
  if (!color) {
    let hash = 0;
    for (let i = 0; i < clientId.length; i++) {
      hash = clientId.charCodeAt(i) + ((hash << 5) - hash);
    }
    color = COLOR_PALETTE[Math.abs(hash) % COLOR_PALETTE.length];
    sessionStorage.setItem("launcher_os_client_color", color);
  }
  return color;
}

function getStoredLocalAvatar(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("user_avatar_url") || null;
}

function getStoredLocalName(): string | null {
  if (typeof window === "undefined") return null;
  const first = localStorage.getItem("user_first_name");
  const last = localStorage.getItem("user_last_name");
  if (first || last) return `${first || ""} ${last || ""}`.trim();
  const full = localStorage.getItem("user_full_name");
  if (full) return full.trim();
  return null;
}

export function LivePresenceStack() {
  const { data: session } = authClient.useSession();
  const [users, setUsers] = useState<ActiveUser[]>([]);
  const [hoveredUser, setHoveredUser] = useState<ActiveUser | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Synchronously initialize avatar and name from localStorage for zero-flicker on route transitions
  const [avatarUrl, setAvatarUrl] = useState<string | null>(getStoredLocalAvatar);
  const [customName, setCustomName] = useState<string | null>(getStoredLocalName);

  // Derive stable client identity
  const clientIdRef = useRef<string>("");
  const clientColorRef = useRef<string>("#FFE54C");

  const [currentMood, setCurrentMood] = useState<MoodOption>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("user_daily_mood");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return { id: "great", emoji: "😄", label: "Great" };
  });

  // Determine current user's display name
  const rawName = customName || session?.user?.name || "Member";
  const nameParts = rawName.trim().split(/\s+/);
  const currentUserName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : nameParts[0];

  const currentAvatar = avatarUrl || session?.user?.image || undefined;

  // Stable refs to prevent recreating sync functions and triggering infinite re-renders
  const stateRef = useRef({
    currentUserName,
    currentMood,
    session,
    currentAvatar,
  });

  useEffect(() => {
    stateRef.current = {
      currentUserName,
      currentMood,
      session,
      currentAvatar,
    };
  }, [currentUserName, currentMood, session, currentAvatar]);

  // Helper to construct current user payload (stable reference)
  const getCurrentUserPayload = useCallback((): ActiveUser => {
    const id = clientIdRef.current || getOrCreateClientId();
    const color = clientColorRef.current || getOrCreateClientColor(id);
    const { currentUserName: name, currentMood: mood, session: sess, currentAvatar: av } = stateRef.current;

    return {
      id,
      name: name || "Member",
      role: sess?.user?.email ? "Lead" : "Member",
      avatar: av,
      color,
      status: "Active",
      moodEmoji: mood.emoji,
      moodLabel: mood.label,
      isCurrentUser: true,
    };
  }, []);

  // Send Heartbeat / Sync with backend presence API (stable reference)
  const syncPresence = useCallback(
    async (action: "heartbeat" | "join" | "leave" | "update_mood" = "heartbeat") => {
      const payload = getCurrentUserPayload();
      try {
        const res = await fetch("/api/presence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action,
            user: payload,
            userId: payload.id,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.users)) {
            const myId = payload.id;
            const mappedUsers: ActiveUser[] = data.users.map((u: ActiveUser) => {
              const isMe = u.id === myId;
              return {
                ...u,
                name: isMe ? (payload.name || u.name) : u.name,
                avatar: isMe ? (payload.avatar || u.avatar) : u.avatar,
                isCurrentUser: isMe,
              };
            });

            // If for any reason current user isn't in response yet, include it
            const hasMe = mappedUsers.some((u) => u.id === myId);
            if (!hasMe) {
              mappedUsers.unshift(payload);
            }

            setUsers(mappedUsers);
          }
        }
      } catch {
        // In case of offline, at least keep current user
        setUsers((prev) => (prev.length > 0 ? prev : [payload]));
      }
    },
    [getCurrentUserPayload]
  );

  // Initialize client and presence lifecycle (mount only once)
  useEffect(() => {
    const id = getOrCreateClientId();
    const color = getOrCreateClientColor(id);
    clientIdRef.current = id;
    clientColorRef.current = color;

    // Refresh from localStorage on mount
    const savedAvatar = localStorage.getItem("user_avatar_url");
    if (savedAvatar) setAvatarUrl(savedAvatar);
    const savedName = getStoredLocalName();
    if (savedName) setCustomName(savedName);

    try {
      const savedMood = localStorage.getItem("user_daily_mood");
      if (savedMood) setCurrentMood(JSON.parse(savedMood));
    } catch {}

    // 1. Initial Join / Heartbeat
    syncPresence("join");

    // 2. Continuous Heartbeat interval (every 4 seconds)
    const interval = setInterval(() => {
      syncPresence("heartbeat");
    }, 4000);

    // 3. Tab Close / Unload beacon (instantly marks offline on server when browser tab is closed)
    const handleUnload = () => {
      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        navigator.sendBeacon(
          "/api/presence",
          JSON.stringify({ action: "leave", userId: id })
        );
      }
    };

    window.addEventListener("beforeunload", handleUnload);

    // 4. Local tab BroadcastChannel for instant multi-tab communication
    let channel: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      channel = new BroadcastChannel("launcher_os_presence");
      channel.onmessage = (e) => {
        if (e.data?.type === "PRESENCE_CHANGED" || e.data?.type === "MOOD_UPDATE") {
          syncPresence("heartbeat");
        } else if (e.data?.type === "PROFILE_UPDATE" || e.data?.type === "AVATAR_UPDATE") {
          if (e.data?.avatar !== undefined) setAvatarUrl(e.data.avatar);
          if (e.data?.name) setCustomName(e.data.name);
          setTimeout(() => syncPresence("heartbeat"), 50);
        }
      };
    }

    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", handleUnload);
      if (channel) {
        channel.close();
      }
      // CRITICAL: Do NOT call handleUnload() here!
      // In Next.js client-side navigation, components unmount on every page switch.
      // Calling handleUnload() here was falsely deleting the user's presence session on page change.
    };
  }, [syncPresence]);

  // Listen for mood changes from modal
  useEffect(() => {
    const handleMoodChange = (e: any) => {
      const moodData: MoodOption = e.detail;
      if (moodData) {
        setCurrentMood(moodData);
        setTimeout(() => {
          syncPresence("update_mood");
        }, 50);

        if (typeof window !== "undefined" && "BroadcastChannel" in window) {
          const ch = new BroadcastChannel("launcher_os_presence");
          ch.postMessage({ type: "MOOD_UPDATE", mood: moodData });
          ch.close();
        }
      }
    };

    window.addEventListener("user_mood_changed", handleMoodChange);
    return () => window.removeEventListener("user_mood_changed", handleMoodChange);
  }, [syncPresence]);

  // Listen for avatar / profile changes (instant reactive UI updates)
  useEffect(() => {
    const handleAvatarChange = (e: any) => {
      const newAvatar = e.detail !== undefined ? e.detail : localStorage.getItem("user_avatar_url");
      setAvatarUrl(newAvatar);
      setTimeout(() => {
        syncPresence("heartbeat");
      }, 50);
    };

    const handleProfileChange = (e: any) => {
      if (e.detail?.name) {
        setCustomName(e.detail.name);
      }
      if (e.detail?.avatar !== undefined) {
        setAvatarUrl(e.detail.avatar);
      }
      setTimeout(() => {
        syncPresence("heartbeat");
      }, 50);
    };

    window.addEventListener("user_avatar_changed", handleAvatarChange);
    window.addEventListener("user_profile_changed", handleProfileChange);
    window.addEventListener("storage", handleAvatarChange);
    return () => {
      window.removeEventListener("user_avatar_changed", handleAvatarChange);
      window.removeEventListener("user_profile_changed", handleProfileChange);
      window.removeEventListener("storage", handleAvatarChange);
    };
  }, [syncPresence]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Immediate synchronous fallback guarantees user's avatar is always visible on first frame
  const localMe = getCurrentUserPayload();
  const displayUsers = users.length > 0
    ? users.map((u) => (u.isCurrentUser ? { ...u, avatar: localMe.avatar || u.avatar, name: localMe.name || u.name } : u))
    : [localMe];
  const visibleUsers = displayUsers.slice(0, 3);
  const extraCount = displayUsers.length - visibleUsers.length;

  return (
    <>
      {/* Mood Check-In Modal */}
      <MoodCheckInModal
        onSelectMood={(mood) => {
          setCurrentMood(mood);
        }}
      />

      <div className="relative flex items-center">
        {/* Seamless Overlapping Avatars Stack with Prominent Mood Badges */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex items-center -space-x-2.5 p-0.5 cursor-pointer select-none outline-none focus:outline-none group"
          title="Team Mood & Status"
        >
          {visibleUsers.map((user) => (
            <div
              key={user.id}
              onMouseEnter={() => setHoveredUser(user)}
              onMouseLeave={() => setHoveredUser(null)}
              className="relative transition-transform duration-150 group-hover:scale-105"
            >
              {/* Main Avatar with Instant Painting & Larger 40px Size */}
              <div
                className="w-10 h-10 rounded-full border-[1.5px] border-white dark:border-[#141414] shadow-xs overflow-hidden flex items-center justify-center text-[12px] font-black text-neutral-950 shrink-0"
                style={{ backgroundColor: user.color }}
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = "none";
                    }}
                  />
                ) : (
                  <span>{user.name.charAt(0).toUpperCase()}</span>
                )}
              </div>

              {/* Corner Mood Badge with subtle minimal border */}
              <div
                className="absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-white dark:bg-[#1a1a1a] border border-white dark:border-[#0a0a0a] flex items-center justify-center text-[12px] leading-none select-none pointer-events-none shadow-2xs"
              >
                <span className="scale-105" suppressHydrationWarning>{user.moodEmoji}</span>
              </div>
            </div>
          ))}

          {/* Extra Count Circle */}
          {extraCount > 0 && (
            <div className="relative z-10 transition-transform duration-150 group-hover:scale-105">
              <div className="w-10 h-10 rounded-full bg-neutral-900 text-white dark:bg-neutral-800 text-[12px] font-bold flex items-center justify-center border-[1.5px] border-white dark:border-[#0a0a0a] shadow-xs">
                +{extraCount}
              </div>
            </div>
          )}
        </button>

        {/* Floating Hover Tooltip */}
        {hoveredUser && !isOpen && (
          <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-neutral-950 text-white text-[11.5px] py-1 px-2.5 rounded-md shadow-xl flex items-center gap-1.5 whitespace-nowrap border border-white/10">
              <span className="text-xs">{hoveredUser.moodEmoji}</span>
              <span className="font-semibold">{hoveredUser.name}</span>
              <span className="text-neutral-400 font-normal">
                • {hoveredUser.moodLabel}
              </span>
            </div>
          </div>
        )}

        {/* Sharp Minimalist Dropdown Card with Smooth Swipe Down Animation */}
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop Click */}
              <motion.div
                key="presence-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 z-40"
              />

              {/* Floating Dropdown Card with true curtain swipe down (clipPath wipe from top to bottom) */}
              <motion.div
                key="presence-card"
                initial={{
                  opacity: 0,
                  clipPath: "inset(0% 0% 100% 0% round 12px)",
                  y: -10,
                }}
                animate={{
                  opacity: 1,
                  clipPath: "inset(0% 0% 0% 0% round 12px)",
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  clipPath: "inset(0% 0% 100% 0% round 12px)",
                  y: -8,
                  transition: {
                    duration: 0.2,
                    ease: [0.32, 0, 0.67, 0],
                  },
                }}
                transition={{
                  duration: 0.32,
                  ease: [0.16, 1, 0.3, 1], // Smooth premium cubic-bezier easeOut
                }}
                className="absolute right-0 top-full mt-2 w-[310px] sm:w-[330px] bg-white dark:bg-[#111111] border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl p-3.5 z-50 space-y-3 font-sans"
              >
                {/* Header: Clean with only subtle close button */}
                <div className="flex items-center justify-between pb-1">
                  <span className="text-[13px] font-semibold text-emerald-600 dark:text-emerald-400 tracking-tight">
                    {displayUsers.length} Active
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Users List with clear typography and larger font size */}
                <div className="space-y-1.5 max-h-[240px] overflow-y-auto pr-0.5">
                  {displayUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-neutral-100/80 dark:hover:bg-neutral-800/60 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative shrink-0">
                          <div
                            className="w-10 h-10 rounded-full border border-neutral-200 dark:border-neutral-700 overflow-hidden flex items-center justify-center text-xs font-bold text-neutral-950 shrink-0"
                            style={{ backgroundColor: user.color }}
                          >
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-full h-full object-cover rounded-full"
                                onError={(e) => {
                                  (e.currentTarget as HTMLElement).style.display = "none";
                                }}
                              />
                            ) : (
                              <span>{user.name.charAt(0).toUpperCase()}</span>
                            )}
                          </div>

                          {/* Corner Mood Badge */}
                          <span className="absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-white dark:bg-[#1a1a1a] border border-white dark:border-[#111111] flex items-center justify-center text-[12px] shadow-2xs leading-none">
                            <span className="scale-105" suppressHydrationWarning>{user.moodEmoji}</span>
                          </span>
                        </div>

                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5 leading-tight">
                            <span className="text-[15px] font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                              {user.name}
                            </span>
                            {user.isCurrentUser && (
                              <span className="text-[12px] font-semibold text-amber-600 dark:text-amber-400">
                                (You)
                              </span>
                            )}
                          </div>
                          <span className="text-[13.5px] text-neutral-500 dark:text-neutral-400 font-medium truncate pt-0.5">
                            {user.moodLabel}
                          </span>
                        </div>
                      </div>

                      <span className="text-[13px] text-neutral-400 dark:text-neutral-500 shrink-0 font-normal">
                        {user.role}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Action Buttons with sharp modern rounded corners */}
                <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      window.dispatchEvent(new CustomEvent("open_mood_modal"));
                    }}
                    className="flex-1 h-9 rounded-md bg-[#FFDE3C] hover:bg-[#ffe55c] text-neutral-950 text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-98"
                  >
                    <Smile className="w-4 h-4 stroke-[2.2]" />
                    <span>Update Mood</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="h-9 px-3 rounded-md bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-[13px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    title="Copy link"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

