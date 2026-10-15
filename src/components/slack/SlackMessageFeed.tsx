"use client";

import React, { useRef, useEffect } from "react";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import { 
  FileText, 
  Image as ImageIcon, 
  Download, 
  MessageSquare, 
  Smile, 
  Mail, 
  Pin, 
  Copy, 
  Check, 
  ExternalLink,
  Paperclip,
  Eye,
  Plus
} from "lucide-react";
import { SlackMessage, SlackUser, Attachment } from "./types";
import { SlackEmojiPicker } from "./SlackEmojiPicker";

interface SlackMessageFeedProps {
  messages: SlackMessage[];
  currentUser: SlackUser;
  onOpenThread: (message: SlackMessage) => void;
  onToggleReaction: (messageId: string, emoji: string) => void;
  onTogglePin?: (messageId: string) => void;
  onPreviewAttachment: (attachment: Attachment) => void;
  onSaveAsTodo?: (message: SlackMessage) => void;
  onSaveToScratchpad?: (message: SlackMessage) => void;
}

export function SlackMessageFeed({
  messages,
  currentUser,
  onOpenThread,
  onToggleReaction,
  onTogglePin,
  onPreviewAttachment,
  onSaveAsTodo,
  onSaveToScratchpad,
}: SlackMessageFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [activePicker, setActivePicker] = React.useState<{
    messageId: string;
    source: "bottom" | "hover";
    anchorRect: { top: number; left: number; bottom: number; right: number };
  } | null>(null);

  // Smart auto-scroll to bottom only if user is near bottom or initial render
  useEffect(() => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 160;
      if (isNearBottom || messages.length <= 1) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }
  }, [messages.length]);

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatMessageTime = (isoString: string) => {
    try {
      const date = parseISO(isoString);
      return format(date, "HH:mm");
    } catch {
      return "";
    }
  };

  const formatDividerDate = (isoString: string) => {
    try {
      const date = parseISO(isoString);
      if (isToday(date)) return "Hari Ini";
      if (isYesterday(date)) return "Kemarin";
      return format(date, "EEEE, d MMMM yyyy");
    } catch {
      return "Hari Ini";
    }
  };

  // Group messages by date
  const groupedMessages: { date: string; msgs: SlackMessage[] }[] = [];
  messages.forEach((msg) => {
    const dStr = formatDividerDate(msg.createdAt);
    const existing = groupedMessages.find((g) => g.date === dStr);
    if (existing) {
      existing.msgs.push(msg);
    } else {
      groupedMessages.push({ date: dStr, msgs: [msg] });
    }
  });

  // Render message content with markdown formatting
  const renderMessageBody = (text: string) => {
    const lines = text.split("\n");
    return (
      <div className="space-y-1.5 text-[14.5px] sm:text-[15px] leading-relaxed text-neutral-800 dark:text-neutral-100 break-words">
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-1.5" />;
          
          if (line.trim().startsWith("- ")) {
            return (
              <div key={idx} className="flex items-start gap-2.5 pl-2">
                <span className="text-[#D4A800] dark:text-[#FFE500] font-bold text-base">•</span>
                <span className="flex-1">{formatInline(line.trim().substring(2))}</span>
              </div>
            );
          }

          if (line.trim().startsWith("> ")) {
            return (
              <blockquote
                key={idx}
                className="pl-3 py-1 my-1 border-l-2 border-[#FFE500] bg-neutral-100/60 dark:bg-neutral-800/40 rounded-r-md text-neutral-700 dark:text-neutral-300 italic text-sm"
              >
                {formatInline(line.trim().substring(2))}
              </blockquote>
            );
          }

          return <p key={idx}>{formatInline(line)}</p>;
        })}
      </div>
    );
  };

  // Inline markdown formatter for bold, code, links
  const formatInline = (text: string) => {
    const parts: React.ReactNode[] = [];
    let remaining = text;

    while (remaining.length > 0) {
      const boldMatch = remaining.match(/\*\*(.*?)\*\*/);
      const italicMatch = remaining.match(/\*(.*?)\*/);
      const codeMatch = remaining.match(/`(.*?)`/);

      const matches = [
        boldMatch ? { type: "bold", index: boldMatch.index!, length: boldMatch[0].length, content: boldMatch[1] } : null,
        italicMatch && (!boldMatch || italicMatch.index! < boldMatch.index!) ? { type: "italic", index: italicMatch.index!, length: italicMatch[0].length, content: italicMatch[1] } : null,
        codeMatch ? { type: "code", index: codeMatch.index!, length: codeMatch[0].length, content: codeMatch[1] } : null,
      ].filter(Boolean) as { type: string; index: number; length: number; content: string }[];

      if (matches.length === 0) {
        parts.push(remaining);
        break;
      }

      matches.sort((a, b) => a.index - b.index);
      const firstMatch = matches[0];

      if (firstMatch.index > 0) {
        parts.push(remaining.substring(0, firstMatch.index));
      }

      if (firstMatch.type === "bold") {
        parts.push(<strong key={parts.length} className="font-bold text-neutral-950 dark:text-white">{firstMatch.content}</strong>);
      } else if (firstMatch.type === "italic") {
        parts.push(<em key={parts.length} className="italic text-neutral-800 dark:text-neutral-200">{firstMatch.content}</em>);
      } else if (firstMatch.type === "code") {
        parts.push(
          <code key={parts.length} className="px-1.5 py-0.5 rounded bg-neutral-200/70 dark:bg-neutral-800 font-mono text-xs text-amber-700 dark:text-amber-300 font-semibold">
            {firstMatch.content}
          </code>
        );
      }

      remaining = remaining.substring(firstMatch.index + firstMatch.length);
    }

    return parts;
  };

  return (
    <div
      ref={scrollRef}
      className={`flex-1 ${
        activePicker ? "overflow-hidden" : "overflow-y-auto"
      } p-4 sm:p-6 space-y-6 select-text`}
    >
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-center text-neutral-400 space-y-2">
          <MessageSquare className="w-12 h-12 text-neutral-300 dark:text-neutral-700 stroke-1" />
          <p className="text-base font-medium">Belum ada pesan di channel ini.</p>
          <p className="text-sm">Mulai percakapan atau bagikan dokumen tim sekarang!</p>
        </div>
      )}

      {groupedMessages.map((group, gIdx) => (
        <div key={gIdx} className="space-y-4">
          {/* Date Divider */}
          <div className="relative flex items-center justify-center my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200/80 dark:border-neutral-800" />
            </div>
            <span className="relative px-3.5 py-1 rounded-full text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200/80 dark:border-neutral-700/80 shadow-2xs">
              {group.date}
            </span>
          </div>

          {/* Messages in Date Group */}
          <div className="space-y-1">
            {group.msgs.map((msg) => {
              const isEmail = Boolean(msg.emailMeta);
              const isBottomPickerOpen = activePicker?.messageId === msg.id && activePicker.source === "bottom";
              const isHoverPickerOpen = activePicker?.messageId === msg.id && activePicker.source === "hover";

              return (
                <div
                  key={msg.id}
                  className={`group relative flex items-start gap-3 py-2 px-2.5 rounded-lg transition-all ${
                    msg.isPinned
                      ? "bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/50"
                      : "hover:bg-neutral-50/90 dark:hover:bg-neutral-900/50"
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0 mt-0.5">
                    <img
                      src={msg.user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120"}
                      alt={msg.user.name}
                      className="w-9 h-9 rounded-lg object-cover border border-neutral-200/80 dark:border-neutral-800 shadow-2xs"
                    />
                  </div>

                  {/* Main Message Content Container */}
                  <div className="flex-1 min-w-0 space-y-1">
                    {/* Header: Name, Role Badge, Time, Email badge */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-neutral-900 dark:text-white hover:underline cursor-pointer">
                        {msg.user.name}
                      </span>

                      {isEmail && (
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          Email Bridge
                        </span>
                      )}

                      {msg.user.role && !isEmail && (
                        <span className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">
                          {msg.user.role}
                        </span>
                      )}

                      <span className="text-xs text-neutral-400 dark:text-neutral-500">
                        {formatMessageTime(msg.createdAt)}
                      </span>

                      {msg.isPinned && (
                        <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium">
                          <Pin className="w-3 h-3 fill-amber-500" />
                          Pinned
                        </span>
                      )}
                    </div>

                    {/* Email Subject / Metadata Banner if from email */}
                    {msg.emailMeta && (
                      <div className="p-3 rounded-xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/50 text-sm space-y-1">
                        <div className="font-semibold text-sky-950 dark:text-sky-200 flex items-center gap-2">
                          <Mail className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                          Subjek: {msg.emailMeta.subject}
                        </div>
                        <div className="text-xs text-sky-800/80 dark:text-sky-400/80 flex items-center gap-4">
                          <span>Dari: <strong>{msg.emailMeta.from}</strong></span>
                          <span>Kepada: <strong>{msg.emailMeta.to}</strong></span>
                        </div>
                      </div>
                    )}

                    {/* Message Body */}
                    {renderMessageBody(msg.content)}

                    {/* Attachments Section */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-xl">
                        {msg.attachments.map((att) => {
                          const isImage = att.type === "image" || att.previewUrl;
                          return (
                            <div
                              key={att.id}
                              className="group/att relative overflow-hidden rounded-xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-[#161616] p-3 shadow-2xs hover:border-[#FFE500] transition-all"
                            >
                              {isImage && att.previewUrl ? (
                                <div className="space-y-2">
                                  <div 
                                    onClick={() => onPreviewAttachment(att)}
                                    className="relative w-full h-40 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-900 cursor-pointer"
                                  >
                                    <img
                                      src={att.previewUrl}
                                      alt={att.name}
                                      className="w-full h-full object-cover group-hover/att:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-neutral-950/20 opacity-0 group-hover/att:opacity-100 transition-opacity flex items-center justify-center text-white gap-1.5 text-sm font-semibold">
                                      <Eye className="w-4 h-4" />
                                      Pratinjau
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between text-sm pt-1">
                                    <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate pr-2">
                                      {att.name}
                                    </span>
                                    <span className="text-xs text-neutral-400 shrink-0">
                                      {att.size}
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between gap-3">
                                  <div 
                                    onClick={() => onPreviewAttachment(att)}
                                    className="flex items-center gap-3 min-w-0 cursor-pointer"
                                  >
                                    <div className="w-10 h-10 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-200/60 dark:border-rose-900/40">
                                      <FileText className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                                        {att.name}
                                      </p>
                                      <p className="text-xs text-neutral-400">
                                        {att.size} • PDF Document
                                      </p>
                                    </div>
                                  </div>

                                  <a
                                    href={att.url}
                                    download={att.name}
                                    onClick={(e) => e.stopPropagation()}
                                    title="Unduh File"
                                    className="p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors shrink-0"
                                  >
                                    <Download className="w-4 h-4" />
                                  </a>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Reactions Section */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {msg.reactions?.map((r, rIdx) => {
                        const myId = currentUser.id || "user-current";
                        const hasReacted = r.users?.some((u) => u === myId || u === "user-current" || u === "u-current");
                        return (
                          <button
                            key={rIdx}
                            onClick={() => onToggleReaction(msg.id, r.emoji)}
                            title={`${r.users?.length || r.count} orang bereaksi ${r.emoji}`}
                            className={`px-2 py-0.5 rounded-full text-xs sm:text-[13px] flex items-center gap-1.5 border transition-all cursor-pointer select-none active:scale-95 ${
                              hasReacted
                                ? "bg-amber-100/80 dark:bg-amber-950/60 border-amber-300 dark:border-amber-600/80 text-amber-950 dark:text-amber-100 font-bold shadow-2xs scale-102"
                                : "bg-neutral-100/90 dark:bg-neutral-800/80 border-neutral-200/90 dark:border-neutral-700/70 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/70 dark:hover:bg-neutral-700/60 font-medium"
                            }`}
                          >
                            <span className="text-sm leading-none">{r.emoji}</span>
                            <span className="text-xs font-semibold">{r.count}</span>
                          </button>
                        );
                      })}

                      {/* Quick Add Reaction Button */}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const rect = e.currentTarget.getBoundingClientRect();
                            setActivePicker((prev) =>
                              prev?.messageId === msg.id && prev.source === "bottom"
                                ? null
                                : {
                                    messageId: msg.id,
                                    source: "bottom",
                                    anchorRect: {
                                      top: rect.top,
                                      left: rect.left,
                                      bottom: rect.bottom,
                                      right: rect.right,
                                    },
                                  }
                            );
                          }}
                          className={`p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
                            isBottomPickerOpen
                              ? "opacity-100 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                              : "opacity-0 group-hover:opacity-100"
                          } cursor-pointer`}
                          title="Tambah Reaksi"
                        >
                          <Smile className="w-4 h-4" />
                        </button>

                        {isBottomPickerOpen && (
                          <SlackEmojiPicker
                            anchorRect={activePicker?.anchorRect}
                            onSelectEmoji={(emoji) => {
                              onToggleReaction(msg.id, emoji);
                              setActivePicker(null);
                            }}
                            onClose={() => setActivePicker(null)}
                            position="top"
                            align="left"
                          />
                        )}
                      </div>
                    </div>

                    {/* Thread Preview & Quick Reply Button */}
                    {(msg.threadCount || 0) > 0 && (
                      <button
                        onClick={() => onOpenThread(msg)}
                        className="mt-1.5 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold text-[#D4A800] dark:text-[#FFE500] hover:bg-[#FFE500]/10 border border-[#FFE500]/30 transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>{msg.threadCount} balasan</span>
                        <span className="text-xs font-normal text-neutral-400">
                          • Lihat percakapan thread
                        </span>
                      </button>
                    )}
                  </div>

                  {/* Hover Floating Actions Menu */}
                  <div
                    className={`absolute right-3 -top-3 ${
                      isHoverPickerOpen ? "flex" : "hidden group-hover:flex"
                    } items-center bg-white dark:bg-[#1a1a1a] border border-neutral-200/90 dark:border-neutral-700 rounded-lg shadow-md p-0.5 text-neutral-500 dark:text-neutral-300 z-30`}
                  >
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const rect = e.currentTarget.getBoundingClientRect();
                          setActivePicker((prev) =>
                            prev?.messageId === msg.id && prev.source === "hover"
                              ? null
                              : {
                                  messageId: msg.id,
                                  source: "hover",
                                  anchorRect: {
                                    top: rect.top,
                                    left: rect.left,
                                    bottom: rect.bottom,
                                    right: rect.right,
                                  },
                                }
                          );
                        }}
                        title="Reaksi Cepat"
                        className={`p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white rounded transition-colors cursor-pointer ${
                          isHoverPickerOpen ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white" : ""
                        }`}
                      >
                        <Smile className="w-4 h-4" />
                      </button>

                      {isHoverPickerOpen && (
                        <SlackEmojiPicker
                          anchorRect={activePicker?.anchorRect}
                          onSelectEmoji={(emoji) => {
                            onToggleReaction(msg.id, emoji);
                            setActivePicker(null);
                          }}
                          onClose={() => setActivePicker(null)}
                          position="bottom"
                          align="right"
                        />
                      )}
                    </div>

                    <button
                      onClick={() => onOpenThread(msg)}
                      title="Balas di Thread"
                      className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white rounded transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>

                    {onTogglePin && (
                      <button
                        onClick={() => onTogglePin(msg.id)}
                        title={msg.isPinned ? "Lepas Pin" : "Pin Pesan"}
                        className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white rounded transition-colors cursor-pointer"
                      >
                        <Pin className="w-4 h-4" />
                      </button>
                    )}

                    {onSaveAsTodo && (
                      <button
                        onClick={() => onSaveAsTodo(msg)}
                        title="Buat Jadi Todo di Launcher OS"
                        className="p-1.5 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-600 dark:hover:text-[#FFE500] rounded transition-colors cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}

                    {onSaveToScratchpad && (
                      <button
                        onClick={() => onSaveToScratchpad(msg)}
                        title="Simpan ke Scratchpad"
                        className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white rounded transition-colors cursor-pointer"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => handleCopyText(msg.id, msg.content)}
                      title="Salin Pesan"
                      className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white rounded transition-colors cursor-pointer"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
