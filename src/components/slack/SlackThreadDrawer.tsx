"use client";

import React, { useState } from "react";
import { format, parseISO } from "date-fns";
import { 
  X, 
  MessageSquare, 
  Send, 
  Mail, 
  FileText 
} from "lucide-react";
import { Attachment, SlackMessage, SlackUser } from "./types";

interface SlackThreadDrawerProps {
  parentMessage: SlackMessage | null;
  onClose: () => void;
  currentUser: SlackUser;
  onSendThreadReply: (parentMessageId: string, payload: {
    content: string;
    attachments?: Attachment[];
    sendAsEmail?: boolean;
  }) => void;
  onPreviewAttachment: (att: Attachment) => void;
}

export function SlackThreadDrawer({
  parentMessage,
  onClose,
  currentUser,
  onSendThreadReply,
  onPreviewAttachment,
}: SlackThreadDrawerProps) {
  const [replyContent, setReplyContent] = useState("");
  const [sendAsEmail, setSendAsEmail] = useState(Boolean(parentMessage?.emailMeta));

  if (!parentMessage) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    onSendThreadReply(parentMessage.id, {
      content: replyContent.trim(),
      sendAsEmail: sendAsEmail,
    });

    setReplyContent("");
  };

  const formatTime = (isoString: string) => {
    try {
      return format(parseISO(isoString), "HH:mm");
    } catch {
      return "";
    }
  };

  const threads = parentMessage.threads || [];

  return (
    <div className="w-full sm:w-[420px] shrink-0 flex flex-col h-full bg-white dark:bg-[#121212] border-l border-neutral-200/80 dark:border-neutral-800 shadow-xl z-20">
      {/* Header */}
      <div className="p-4 border-b border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <MessageSquare className="w-5 h-5 text-[#D4A800] dark:text-[#FFE500]" />
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
            Thread Percakapan
          </h3>
          <span className="text-xs text-neutral-400 font-medium">
            ({threads.length} balasan)
          </span>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
        {/* Pinned Parent Message */}
        <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 space-y-2.5">
          <div className="flex items-center gap-2.5">
            <img
              src={parentMessage.user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
              alt={parentMessage.user.name}
              className="w-8 h-8 rounded-lg object-cover"
            />
            <span className="font-bold text-neutral-900 dark:text-white truncate text-sm">
              {parentMessage.user.name}
            </span>
            <span className="text-xs text-neutral-400 ml-auto">
              {formatTime(parentMessage.createdAt)}
            </span>
          </div>

          <p className="text-[14px] text-neutral-800 dark:text-neutral-200 leading-relaxed break-words">
            {parentMessage.content}
          </p>

          {/* Parent Attachments */}
          {parentMessage.attachments && parentMessage.attachments.length > 0 && (
            <div className="space-y-1.5 pt-1">
              {parentMessage.attachments.map((att) => (
                <div
                  key={att.id}
                  onClick={() => onPreviewAttachment(att)}
                  className="flex items-center gap-2.5 p-2 rounded-lg bg-white dark:bg-[#161616] border border-neutral-200 dark:border-neutral-800 cursor-pointer hover:border-[#FFE500]"
                >
                  <FileText className="w-4 h-4 text-rose-500 shrink-0" />
                  <span className="truncate font-medium text-neutral-800 dark:text-neutral-200 text-xs">
                    {att.name}
                  </span>
                  <span className="text-xs text-neutral-400 ml-auto shrink-0">{att.size}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-3">
          <div className="w-full border-t border-neutral-200/60 dark:border-neutral-800/80" />
          <span className="absolute px-3 text-xs font-semibold bg-white dark:bg-[#121212] text-neutral-400">
            Balasan Thread
          </span>
        </div>

        {/* Thread Replies List */}
        {threads.map((reply) => (
          <div key={reply.id} className="flex items-start gap-3">
            <img
              src={reply.user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
              alt={reply.user.name}
              className="w-8 h-8 rounded-lg object-cover shrink-0 mt-0.5"
            />
            <div className="flex-1 min-w-0 bg-neutral-100/60 dark:bg-neutral-800/50 p-3 rounded-xl border border-neutral-200/50 dark:border-neutral-800/50 space-y-1">
              <div className="flex items-center justify-between gap-1">
                <span className="font-bold text-neutral-900 dark:text-white truncate text-xs sm:text-sm">
                  {reply.user.name}
                </span>
                <span className="text-xs text-neutral-400 shrink-0">
                  {formatTime(reply.createdAt)}
                </span>
              </div>
              <p className="text-[13.5px] text-neutral-800 dark:text-neutral-200 leading-relaxed break-words">
                {reply.content}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Reply Input Form */}
      <form onSubmit={handleSend} className="p-3.5 border-t border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 space-y-2.5">
        {parentMessage.emailMeta && (
          <label className="flex items-center gap-2 text-xs text-sky-800 dark:text-sky-300 font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={sendAsEmail}
              onChange={(e) => setSendAsEmail(e.target.checked)}
              className="rounded text-sky-600 focus:ring-sky-500"
            />
            <span>Kirim balasan ini via Email ke <strong>{parentMessage.emailMeta.from}</strong></span>
          </label>
        )}

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Balas di thread ini..."
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#161616] border border-neutral-200 dark:border-neutral-800 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#FFE500]"
          />
          <button
            type="submit"
            disabled={!replyContent.trim()}
            title="Kirim balasan"
            className="p-2 rounded-lg text-neutral-700 hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white hover:bg-neutral-200/70 dark:hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5 stroke-[1.8]" />
          </button>
        </div>
      </form>
    </div>
  );
}
