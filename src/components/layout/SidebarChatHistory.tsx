"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronDown, Plus, Trash2, MessageSquare, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

export function SidebarChatHistory({
  collapsed,
  mobileOpen,
  onCloseMobile,
}: SidebarChatHistoryProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [conversations, setConversations] = useState<SidebarConversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Load collapse state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("launcher_sidebar_chats_expanded");
      if (saved !== null) {
        setIsOpen(saved === "true");
      }
    } catch (_) {}
  }, []);

  const toggleOpen = () => {
    setIsOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("launcher_sidebar_chats_expanded", String(next));
      } catch (_) {}
      return next;
    });
  };

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/chat/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch (err) {
      console.error("Failed to fetch sidebar conversations:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Sync with active conversation from URL or custom events
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

    const handleUpdated = () => {
      fetchConversations();
    };

    window.addEventListener("active_conversation_changed", handleActiveChanged);
    window.addEventListener("conversations_updated", handleUpdated);

    return () => {
      window.removeEventListener("active_conversation_changed", handleActiveChanged);
      window.removeEventListener("conversations_updated", handleUpdated);
    };
  }, [searchParams, fetchConversations]);

  const handleSelectChat = (id: string) => {
    setActiveId(id);
    if (onCloseMobile) onCloseMobile();

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
        setConversations((prev) => prev.filter((c) => c.id !== id));
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
    <div className="pt-3 mt-3 border-t border-black/10 dark:border-neutral-800/80">
      {/* Header Dropdown Trigger ala Kimi */}
      <div className="flex items-center justify-between px-3 py-1 mb-1">
        <button
          type="button"
          onClick={toggleOpen}
          className="flex items-center gap-1.5 text-[12px] font-medium tracking-wide text-neutral-800/80 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors cursor-pointer select-none group"
        >
          <span>Chats</span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-neutral-500 transition-transform duration-200 ${
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

      {/* Collapsible and Scrollable Chat History List */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="max-h-[220px] overflow-y-auto px-1 space-y-1 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-800 pr-1">
              {loading && conversations.length === 0 ? (
                <div className="flex items-center gap-2 px-3 py-2 text-[12px] text-neutral-500">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Loading chats...</span>
                </div>
              ) : conversations.length === 0 ? (
                <div className="px-3 py-2 text-[12px] text-neutral-500 dark:text-neutral-500 italic">
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
                      className={`group relative flex items-center justify-between px-3 py-1.5 rounded-lg text-[13px] leading-snug transition-all cursor-pointer select-none ${
                        isCurrentActive
                          ? "bg-[#FFE853] dark:bg-[#212121] border border-[#E5BC10] dark:border-white/[0.07] text-neutral-950 dark:text-neutral-100 font-medium shadow-xs dark:shadow-none"
                          : "text-neutral-950/85 hover:text-neutral-950 hover:bg-[#FFE853]/50 dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-[#1a1a1a] font-normal border border-transparent"
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
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:text-red-600 dark:hover:text-red-400 hover:bg-black/10 dark:hover:bg-neutral-800 text-neutral-400 transition-all shrink-0 cursor-pointer"
                        title="Delete chat"
                      >
                        {isDeleting ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Trash2 className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SidebarChatHistory;
