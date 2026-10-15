"use client";

import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Plus,
  MessageSquare,
  Trash2,
  Clock,
  Search,
  Loader2,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

export interface ConversationSummary {
  id: string;
  title: string;
  docType?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  messageCount: number;
  preview?: string;
}

interface ChatHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: ConversationSummary[];
  activeId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => Promise<void>;
  isLoadingList?: boolean;
}

export function ChatHistoryDrawer({
  isOpen,
  onClose,
  conversations,
  activeId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  isLoadingList = false,
}: ChatHistoryDrawerProps) {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Group conversations by date
  const groupedConversations = useMemo(() => {
    const filtered = conversations.filter((c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterday = today - 24 * 60 * 60 * 1000;
    const sevenDaysAgo = today - 7 * 24 * 60 * 60 * 1000;

    const groups: { [key: string]: ConversationSummary[] } = {
      "Hari Ini": [],
      "Kemarin": [],
      "7 Hari Terakhir": [],
      "Lebih Lama": [],
    };

    filtered.forEach((c) => {
      const time = new Date(c.updatedAt).getTime();
      if (time >= today) {
        groups["Hari Ini"].push(c);
      } else if (time >= yesterday) {
        groups["Kemarin"].push(c);
      } else if (time >= sevenDaysAgo) {
        groups["7 Hari Terakhir"].push(c);
      } else {
        groups["Lebih Lama"].push(c);
      }
    });

    return Object.entries(groups).filter(([_, items]) => items.length > 0);
  }, [conversations, searchQuery]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Hapus percakapan ini dari riwayat?")) {
      setDeletingId(id);
      try {
        await onDeleteConversation(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const formatRelativeTime = (dateInput: string | Date) => {
    const date = new Date(dateInput);
    return date.toLocaleDateString("id-ID", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[120] bg-black/50 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Sidebar: Full Viewport Height All The Way To Bottom (Anchored to Right Edge) */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed inset-y-0 top-0 right-0 bottom-0 z-[120] w-full max-w-[340px] sm:max-w-[380px] h-screen h-dvh bg-white dark:bg-[#121212] border-l border-neutral-200/80 dark:border-neutral-800/80 shadow-2xl flex flex-col font-sans"
          >
            {/* Header */}
            <div className="p-4 border-b border-neutral-200/70 dark:border-neutral-800/70 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[4px] bg-[#FFDE3C]/20 text-neutral-900 dark:text-[#FFDE3C] flex items-center justify-center font-bold shrink-0">
                  <MessageSquare className="w-4 h-4 text-neutral-900 dark:text-[#FFDE3C]" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                    Riwayat Percakapan
                  </h2>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    Tersimpan di akun Google Anda
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  onClick={() => {
                    onNewChat();
                    onClose();
                  }}
                  className="h-8 bg-[#FFDE3C] hover:bg-[#ffe55c] text-neutral-950 font-semibold text-xs px-2.5 rounded-[4px] flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Baru</span>
                </Button>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-[4px] text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="p-3 border-b border-neutral-100 dark:border-neutral-800/50">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari riwayat chat..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-[4px] bg-neutral-100/80 dark:bg-neutral-800/60 border border-transparent focus:border-[#FFDE3C]/60 text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 outline-none transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 text-xs"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4 calendar-scrollbar">
              {isLoadingList ? (
                <div className="flex flex-col items-center justify-center py-12 text-neutral-400 gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-[#FFDE3C]" />
                  <span className="text-xs">Memuat riwayat chat...</span>
                </div>
              ) : groupedConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                  <div className="w-12 h-12 rounded-[4px] bg-neutral-100 dark:bg-neutral-800/80 flex items-center justify-center mb-3 text-neutral-400">
                    <Sparkles className="w-5 h-5 text-neutral-400" />
                  </div>
                  <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    {searchQuery ? "Tidak ditemukan" : "Belum ada riwayat"}
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-1 max-w-[220px]">
                    {searchQuery
                      ? `Tidak ada chat dengan kata kunci "${searchQuery}".`
                      : "Percakapan yang Anda mulai akan otomatis tersimpan di sini."}
                  </p>
                  {!searchQuery && (
                    <Button
                      size="sm"
                      onClick={() => {
                        onNewChat();
                        onClose();
                      }}
                      className="mt-4 h-8 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 text-xs font-semibold px-3 rounded-[4px] flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Mulai Chat Baru
                    </Button>
                  )}
                </div>
              ) : (
                groupedConversations.map(([groupName, items]) => (
                  <div key={groupName} className="space-y-1">
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                      {groupName}
                    </div>
                    {items.map((conv) => {
                      const isActive = activeId === conv.id;
                      return (
                        <div
                          key={conv.id}
                          onClick={() => {
                            onSelectConversation(conv.id);
                            onClose();
                          }}
                          className={`group relative flex items-center justify-between p-2.5 rounded-[4px] cursor-pointer transition-all duration-150 ${
                            isActive
                              ? "bg-[#FFDE3C]/15 dark:bg-[#FFDE3C]/10 border border-[#FFDE3C]/40 text-neutral-950 dark:text-white"
                              : "hover:bg-neutral-100 dark:hover:bg-neutral-800/70 text-neutral-700 dark:text-neutral-300 border border-transparent"
                          }`}
                        >
                          <div className="flex items-start gap-2.5 min-w-0 pr-2">
                            <MessageSquare
                              className={`w-4 h-4 shrink-0 mt-0.5 ${
                                isActive
                                   ? "text-neutral-900 dark:text-[#FFDE3C]"
                                  : "text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-200"
                              }`}
                            />
                            <div className="min-w-0">
                              <p
                                className={`text-xs font-medium truncate ${
                                  isActive
                                    ? "text-neutral-950 dark:text-neutral-100 font-semibold"
                                    : "text-neutral-800 dark:text-neutral-200"
                                }`}
                              >
                                {conv.title || "Percakapan Baru"}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5 text-[10px] text-neutral-400">
                                <span>{formatRelativeTime(conv.updatedAt)}</span>
                                {conv.messageCount > 0 && (
                                  <>
                                    <span>•</span>
                                    <span>{conv.messageCount} pesan</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Delete Button */}
                          <button
                            onClick={(e) => handleDelete(e, conv.id)}
                            disabled={deletingId === conv.id}
                            title="Hapus percakapan"
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-[3px] hover:bg-red-50 dark:hover:bg-red-950/40 text-neutral-400 hover:text-red-600 dark:hover:text-red-400 transition-all shrink-0"
                          >
                            {deletingId === conv.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer with Google Account indicator */}
            <div className="p-3 border-t border-neutral-200/70 dark:border-neutral-800/70 bg-neutral-50/50 dark:bg-neutral-900/50 flex items-center justify-between text-[11px] text-neutral-500 shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Tersinkronisasi ke Cloud</span>
              </div>
              <span className="text-neutral-400">{conversations.length} sesi</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
