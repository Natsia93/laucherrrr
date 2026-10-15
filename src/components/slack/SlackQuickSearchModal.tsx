"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Search, 
  Hash, 
  Lock, 
  Mail, 
  User, 
  MessageSquare, 
  ArrowRight, 
  X,
  Sparkles
} from "lucide-react";
import { SlackChannel, SlackMessage } from "./types";

interface SlackQuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  channels: SlackChannel[];
  messages: SlackMessage[];
  onSelectChannel: (channelId: string) => void;
  onSelectMessage: (message: SlackMessage) => void;
}

export function SlackQuickSearchModal({
  isOpen,
  onClose,
  channels,
  messages,
  onSelectChannel,
  onSelectMessage,
}: SlackQuickSearchModalProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const filteredChannels = channels.filter(
    (c) => c.name.toLowerCase().includes(q) || (c.topic && c.topic.toLowerCase().includes(q))
  );

  const filteredMessages = q
    ? messages
        .filter((m) => m.content.toLowerCase().includes(q) || m.user.name.toLowerCase().includes(q))
        .slice(0, 8)
    : [];

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-start justify-center pt-20 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-[#161616] border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95">
        {/* Search Header */}
        <div className="p-3.5 border-b border-neutral-200/80 dark:border-neutral-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-[#D4A800] dark:text-[#FFE500] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ketik untuk mencari channel, pesan, atau rekan tim..."
            className="flex-1 bg-transparent text-sm sm:text-base text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="px-2 py-0.5 rounded text-[10px] font-mono bg-neutral-100 dark:bg-neutral-800 text-neutral-500 border border-neutral-200 dark:border-neutral-700">
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="overflow-y-auto p-3 space-y-4 max-h-[60vh] text-xs sm:text-sm">
          {/* Channels Section */}
          {filteredChannels.length > 0 && (
            <div className="space-y-1">
              <div className="px-2 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                Channels & Inboxes
              </div>
              {filteredChannels.slice(0, 6).map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => {
                    onSelectChannel(ch.id);
                    onClose();
                  }}
                  className="w-full px-3 py-2 rounded-xl flex items-center justify-between hover:bg-neutral-100 dark:hover:bg-neutral-800/80 text-left transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {ch.type === "email" ? (
                      <Mail className="w-4 h-4 text-sky-500 shrink-0" />
                    ) : ch.isPrivate ? (
                      <Lock className="w-4 h-4 text-amber-500 shrink-0" />
                    ) : ch.type === "dm" ? (
                      <User className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <Hash className="w-4 h-4 text-neutral-400 shrink-0" />
                    )}
                    <span className="font-semibold text-neutral-900 dark:text-white truncate">
                      {ch.name}
                    </span>
                    <span className="text-xs text-neutral-400 truncate hidden sm:inline">
                      {ch.topic}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              ))}
            </div>
          )}

          {/* Messages Search Results */}
          {filteredMessages.length > 0 && (
            <div className="space-y-1">
              <div className="px-2 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                Pesan Relevan
              </div>
              {filteredMessages.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => {
                    onSelectChannel(msg.channelId);
                    onSelectMessage(msg);
                    onClose();
                  }}
                  className="w-full px-3 py-2 rounded-xl flex items-start gap-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 text-left transition-colors cursor-pointer group"
                >
                  <MessageSquare className="w-4 h-4 text-[#D4A800] dark:text-[#FFE500] shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-xs text-neutral-400 mb-0.5">
                      <span className="font-bold text-neutral-900 dark:text-white">
                        {msg.user.name}
                      </span>
                      <span>#{channels.find((c) => c.id === msg.channelId)?.name || "channel"}</span>
                    </div>
                    <p className="text-xs text-neutral-700 dark:text-neutral-300 line-clamp-2">
                      {msg.content}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {filteredChannels.length === 0 && filteredMessages.length === 0 && query && (
            <div className="py-12 text-center text-neutral-400 space-y-1">
              <p className="text-sm font-semibold">Tidak ada hasil untuk "{query}"</p>
              <p className="text-xs">Coba cari dengan kata kunci lain atau nama channel.</p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-2.5 bg-neutral-50 dark:bg-neutral-900/60 border-t border-neutral-200/80 dark:border-neutral-800 text-[11px] text-neutral-400 flex items-center justify-between">
          <span>Gunakan <strong>↑↓</strong> untuk navigasi dan <strong>Enter</strong> untuk membuka</span>
          <span className="font-semibold text-neutral-700 dark:text-neutral-300">Launcher OS Quick Switcher</span>
        </div>
      </div>
    </div>
  );
}
