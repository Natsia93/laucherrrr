"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronDown, Plus, Trash2, MessageSquare, Loader2 } from "lucide-react";

export interface SidebarConversation {
  id: string;
  title: string;
  updatedAt: string | Date;
}

interface SidebarChatHistoryProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile?: () => void;
}

// Module-level caches that persist across all page navigations in memory
let memoryConversationsCache: SidebarConversation[] | null = null;
let hasInitialLoaded = false;
let memoryIsOpenCache: boolean | null = null;

// Compare two conversation arrays to prevent unnecessary re-renders that cause flickering
const areConversationsEqual = (a: SidebarConversation[], b: SidebarConversation[]): boolean => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].id !== b[i].id || a[i].title !== b[i].title) return false;
  }
  return true;
};

export function SidebarChatHistory({
  collapsed,
  mobileOpen,
  onCloseMobile,
}: SidebarChatHistoryProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // State initializers ONLY use module-level memory cache (SSR-safe: null on both server & client for first render).
  // On subsequent client navigations, memory cache is already populated → instant, zero-flicker.
  // localStorage is hydrated in useEffect AFTER hydration completes to avoid mismatch.
  const [conversations, setConversations] = useState<SidebarConversation[]>(
    () => memoryConversationsCache || []
  );
  const [isOpen, setIsOpen] = useState<boolean>(
    () => memoryIsOpenCache !== null ? memoryIsOpenCache : false
  );
  const [mounted, setMounted] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Post-hydration: sync from localStorage (only runs on client, after SSR hydration is complete)
  useEffect(() => {
    setMounted(true);

    // Hydrate isOpen from localStorage if memory cache was empty
    if (memoryIsOpenCache === null) {
      try {
        const saved = localStorage.getItem("launcher_sidebar_chats_expanded");
        if (saved !== null) {
          const val = saved === "true";
          memoryIsOpenCache = val;
          setIsOpen(val);
        } else {
          // Default to open if no saved preference
          memoryIsOpenCache = true;
          setIsOpen(true);
        }
      } catch (_) {
        memoryIsOpenCache = true;
        setIsOpen(true);
      }
    }

    // Hydrate conversations from localStorage if memory cache was empty
    if (!memoryConversationsCache) {
      try {
        const stored = localStorage.getItem("launcher_sidebar_chats_cache");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            memoryConversationsCache = parsed;
            setConversations(parsed);
          }
        }
      } catch (_) {}
    }
  }, []);

  const toggleOpen = () => {
    setIsOpen((prev) => {
      const next = !prev;
      memoryIsOpenCache = next;
      try {
        localStorage.setItem("launcher_sidebar_chats_expanded", String(next));
      } catch (_) {}
      return next;
    });
  };

  // Fetch conversations with silent stale-while-revalidate pattern
  const fetchConversations = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent && !hasInitialLoaded && (!memoryConversationsCache || memoryConversationsCache.length === 0)) {
        setLoading(true);
      }
      const res = await fetch("/api/chat/conversations");
      if (res.ok) {
        const data = await res.json();
        const list: SidebarConversation[] = data.conversations || [];
        hasInitialLoaded = true;

        // ONLY update state and cause re-render if the list has actually changed
        if (!memoryConversationsCache || !areConversationsEqual(memoryConversationsCache, list)) {
          memoryConversationsCache = list;
          setConversations(list);
          try {
            localStorage.setItem("launcher_sidebar_chats_cache", JSON.stringify(list));
          } catch (_) {}
        }
      }
    } catch (err) {
      console.error("Failed to fetch sidebar conversations:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Background sync on mount and custom events
  useEffect(() => {
    fetchConversations(Boolean(memoryConversationsCache && memoryConversationsCache.length > 0));

    const handleUpdated = () => {
      fetchConversations(true);
    };

    window.addEventListener("conversations_updated", handleUpdated);
    return () => {
      window.removeEventListener("conversations_updated", handleUpdated);
    };
  }, [fetchConversations]);

  // Sync with active conversation from URL or custom events without re-fetching
  useEffect(() => {
    const urlId = searchParams?.get("id");
    if (urlId) {
      setActiveId(urlId);
    }

    const handleActiveChanged = (e: any) => {
      if (e.detail?.id !== undefined) {
        setActiveId(e.detail.id);
      }
    };

    window.addEventListener("active_conversation_changed", handleActiveChanged);
    return () => {
      window.removeEventListener("active_conversation_changed", handleActiveChanged);
    };
  }, [searchParams]);

  const handleSelectChat = (id: string) => {
    setActiveId(id);
    if (onCloseMobile) onCloseMobile();
    try {
      localStorage.setItem("last_active_conversation_id", id);
    } catch (_) {}

    if (pathname === "/dashboard") {
      window.dispatchEvent(new CustomEvent("select_conversation", { detail: { id } }));
    } else {
      router.push(`/dashboard?id=${id}`);
    }
  };

  const handleNewChat = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveId(null);
    if (onCloseMobile) onCloseMobile();
    try {
      localStorage.removeItem("last_active_conversation_id");
    } catch (_) {}

    if (pathname === "/dashboard") {
      window.dispatchEvent(new CustomEvent("new_chat"));
    } else {
      router.push("/dashboard");
    }
  };

  const handleDeleteChat = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();

    setDeletingId(id);
    try {
      const res = await fetch(`/api/chat/conversations/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const nextList = (memoryConversationsCache || conversations).filter((c) => c.id !== id);
        memoryConversationsCache = nextList;
        setConversations(nextList);
        try {
          localStorage.setItem("launcher_sidebar_chats_cache", JSON.stringify(nextList));
        } catch (_) {}

        if (activeId === id) {
          setActiveId(null);
        }
        window.dispatchEvent(new CustomEvent("conversation_deleted", { detail: { id } }));
        window.dispatchEvent(new CustomEvent("conversations_updated"));
      }
    } catch (err) {
      console.error("Failed to delete chat:", err);
    } finally {
      setDeletingId(null);
    }
  };

  // If collapsed on desktop and mobile is closed, show minimal icon trigger
  if (collapsed && !mobileOpen) {
    return (
      <div className="pt-2 px-1 border-t border-black/10 dark:border-neutral-800/80">
        <button
          type="button"
          onClick={handleNewChat}
          className="flex items-center justify-center w-full h-10 rounded-lg text-neutral-900/70 hover:text-neutral-950 hover:bg-[#FFE853]/50 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-[#1a1a1a] transition-all cursor-pointer"
          title="New Chat / History"
        >
          <MessageSquare className="w-4.5 h-4.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="pt-2.5 mt-2.5 border-t border-black/10 dark:border-neutral-800/80">
      {/* Header Dropdown Trigger */}
      <div className="flex items-center justify-between px-2.5 py-1 mb-1 select-none">
        <button
          type="button"
          onClick={toggleOpen}
          className="flex items-center gap-2 text-[14px] font-medium text-neutral-900/90 hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white transition-colors cursor-pointer group"
        >
          <span>Chats</span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-600 dark:text-neutral-500 dark:group-hover:text-neutral-300 transition-transform duration-200 ${
              isOpen ? "rotate-0" : "-rotate-90"
            }`}
          />
        </button>

        <button
          type="button"
          onClick={handleNewChat}
          title="New chat"
          className="p-1 rounded-md text-neutral-700 hover:text-neutral-950 hover:bg-black/10 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-[#212121] transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.2]" />
        </button>
      </div>

      {/* Seamless list without flicker on navigation */}
      <div
        className={`space-y-0.5 overflow-hidden transition-[opacity,max-height] duration-200 ease-in-out ${
          isOpen ? "opacity-100 max-h-[1200px]" : "opacity-0 max-h-0 pointer-events-none"
        }`}
      >
        {loading && conversations.length === 0 ? (
          <div className="flex items-center gap-2 px-2.5 py-1 text-[13px] text-neutral-500">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Loading chats...</span>
          </div>
        ) : conversations.length === 0 ? (
          <div className="px-2.5 py-1 text-[13px] text-neutral-500 dark:text-neutral-500 italic">
            No recent chats yet
          </div>
        ) : (
          conversations.map((conv) => {
            const isCurrentActive = activeId === conv.id;
            const isDeleting = deletingId === conv.id;

            return (
              <div
                key={conv.id}
                onClick={() => handleSelectChat(conv.id)}
                className={`group relative flex items-center justify-between px-2.5 py-1 rounded-lg text-[14px] leading-snug transition-all cursor-pointer select-none ${
                  isCurrentActive
                    ? "bg-[#FFE853] dark:bg-[#212121] border border-[#E5BC10] dark:border-white/[0.07] text-neutral-950 dark:text-neutral-100 font-medium shadow-xs dark:shadow-none"
                    : "text-neutral-950/80 hover:text-neutral-950 hover:bg-[#FFE853]/50 dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-[#1a1a1a] font-normal border border-transparent"
                }`}
                title={conv.title}
              >
                <span className="truncate flex-1 pr-2">
                  {conv.title || "Untitled Chat"}
                </span>

                {/* Delete action button on hover */}
                <button
                  type="button"
                  onClick={(e) => handleDeleteChat(e, conv.id)}
                  disabled={isDeleting}
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:text-red-600 dark:hover:text-red-400 hover:bg-black/10 dark:hover:bg-neutral-800 text-neutral-400 transition-all shrink-0 cursor-pointer"
                  title="Delete chat"
                >
                  {isDeleting ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default SidebarChatHistory;
