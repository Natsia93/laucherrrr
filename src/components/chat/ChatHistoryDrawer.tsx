"use client";

import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
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
            className="fixed inset-0 z-[120] bg-black/40 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Sidebar: Full Viewport Height All The Way To Bottom (Anchored to Right Edge) */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed inset-y-0 top-0 right-0 bottom-0 z-[120] w-full max-w-[340px] sm:max-w-[380px] h-screen h-dvh bg-[#faf9f6] dark:bg-[#0d0d0d] border-l border-neutral-200/80 dark:border-neutral-800/80 shadow-2xl flex flex-col font-sans selection:bg-[#ffd100]/40 selection:text-neutral-950"
          >
            {/* Header: Signature Launcher OS Brand Header */}
            <div className="h-14 px-4 border-b border-neutral-200/80 dark:border-neutral-800/80 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-md flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-[5px] bg-[#FFDE3C] border border-[#E5BC10]/60 flex items-center justify-center shrink-0 shadow-2xs p-1">
                  <Image
                    src="/logo/Logo_revou.png"
                    alt="Launcher OS"
                    width={18}
                    height={18}
                    className="object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-sm font-lora font-medium text-neutral-950 dark:text-neutral-100 tracking-tight truncate">
                      Riwayat Percakapan
                    </h2>
                    <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.2 rounded-[3px] bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold border border-neutral-200/60 dark:border-neutral-700/60 shrink-0">
                      LOS
                    </span>
                  </div>
                  <p className="text-[10.5px] text-neutral-500 dark:text-neutral-400 truncate">
                    Tersimpan di akun Google Anda
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <Button
                  size="sm"
                  onClick={() => {
                    onNewChat();
                    onClose();
                  }}
                  className="h-7.5 bg-[#FFDE3C] hover:bg-[#FCD526] text-neutral-950 font-semibold text-xs px-2.5 rounded-[5px] border border-[#E5BC10]/70 flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95 transition-all"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Baru</span>
                </Button>
                <button
                  onClick={onClose}
                  title="Tutup riwayat"
                  className="w-7 h-7 rounded-[5px] text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="p-3 border-b border-neutral-200/60 dark:border-neutral-800/60 bg-white/40 dark:bg-neutral-900/30">
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Cari riwayat percakapan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-12 py-1.5 text-xs rounded-[5px] bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 focus:border-neutral-400 dark:focus:border-neutral-600 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 outline-none transition-all shadow-2xs font-sans"
                />
                {searchQuery ? (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 text-xs px-1 cursor-pointer"
                  >
                    ×
                  </button>
                ) : (
                  <span className="absolute right-2 text-[9.5px] font-mono text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded-[3px] border border-neutral-200/60 dark:border-neutral-700/60 pointer-events-none">
                    ⌘K
                  </span>
                )}
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3 calendar-scrollbar">
              {isLoadingList ? (
                <div className="flex flex-col items-center justify-center py-12 text-neutral-400 gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-[#FFDE3C]" />
                  <span className="text-xs">Memuat riwayat chat...</span>
                </div>
              ) : groupedConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                  <div className="w-12 h-12 rounded-[5px] bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center mb-3 text-neutral-400 shadow-2xs">
                    <Sparkles className="w-5 h-5 text-[#FFDE3C]" />
                  </div>
                  <p className="text-xs font-lora font-medium text-neutral-800 dark:text-neutral-200">
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
                      className="mt-4 h-7.5 bg-[#FFDE3C] hover:bg-[#FCD526] text-neutral-950 text-xs font-semibold px-3 rounded-[5px] border border-[#E5BC10]/70 flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Mulai Chat Baru
                    </Button>
                  )}
                </div>
              ) : (
                groupedConversations.map(([groupName, items]) => (
                  <div key={groupName} className="space-y-1">
                    <div className="flex items-center gap-2 px-1 pt-1.5 pb-0.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 font-mono">
                        {groupName}
                      </span>
                      <div className="flex-1 h-[1px] bg-neutral-200/70 dark:bg-neutral-800/70" />
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
                          className={`group relative flex items-center justify-between p-2.5 rounded-[5px] cursor-pointer transition-all duration-150 ${
                            isActive
                              ? "bg-white dark:bg-[#161616] border-y border-r border-l-[3.5px] border-l-[#FFDE3C] border-y-neutral-200 dark:border-y-neutral-800 border-r-neutral-200 dark:border-r-neutral-800 shadow-2xs"
                              : "hover:bg-white/80 dark:hover:bg-neutral-850/60 text-neutral-700 dark:text-neutral-300 border border-transparent hover:border-neutral-200/60 dark:hover:border-neutral-800/60"
                          }`}
                        >
                          <div className="flex items-start gap-2.5 min-w-0 pr-2">
                            <div
                              className={`w-6 h-6 rounded-[4px] flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                                isActive
                                  ? "bg-[#FFDE3C] text-neutral-950 font-bold shadow-2xs"
                                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 group-hover:bg-neutral-200/70 dark:group-hover:bg-neutral-700 group-hover:text-neutral-900 dark:group-hover:text-white"
                              }`}
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <p
                                className={`text-xs truncate leading-snug ${
                                  isActive
                                    ? "text-neutral-950 dark:text-neutral-100 font-semibold"
                                    : "text-neutral-800 dark:text-neutral-200 font-normal group-hover:text-neutral-950 dark:group-hover:text-white"
                                }`}
                              >
                                {conv.title || "Percakapan Baru"}
                              </p>
                              <div className="flex items-center gap-1.5 mt-1 text-[10.5px] text-neutral-400">
                                <span className="font-mono">{formatRelativeTime(conv.updatedAt)}</span>
                                {conv.messageCount > 0 && (
                                  <>
                                    <span>•</span>
                                    <span className="px-1.5 py-0.2 rounded-[3px] bg-neutral-100 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-400 text-[9.5px] font-mono border border-neutral-200/50 dark:border-neutral-700/50">
                                      {conv.messageCount} pesan
                                    </span>
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
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-[3px] hover:bg-red-50 dark:hover:bg-red-950/40 text-neutral-400 hover:text-red-600 dark:hover:text-red-400 transition-all shrink-0 cursor-pointer"
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

            {/* Footer: Authentic Launcher OS Status Bar */}
            <div className="p-3 border-t border-neutral-200/80 dark:border-neutral-800/80 bg-white/70 dark:bg-[#111111]/70 backdrop-blur-xs flex items-center justify-between text-[11px] text-neutral-500 shrink-0">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-neutral-600 dark:text-neutral-400 font-medium">
                  Tersinkronisasi ke Google Cloud
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-[4px] bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200/60 dark:border-neutral-700/60 font-semibold">
                {conversations.length} sesi
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
