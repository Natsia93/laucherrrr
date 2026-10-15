"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Paperclip, 
  Bold, 
  Italic, 
  Code, 
  List, 
  Mail, 
  X, 
  FileText, 
  Image as ImageIcon,
  Smile 
} from "lucide-react";
import { Attachment, SlackChannel, SlackUser } from "./types";
import { SlackEmojiPicker } from "./SlackEmojiPicker";

interface SlackComposerProps {
  channel: SlackChannel;
  currentUser: SlackUser;
  onSendMessage: (payload: {
    content: string;
    attachments?: Attachment[];
    sendAsEmail?: boolean;
    emailSubject?: string;
  }) => void;
  isSending?: boolean;
}

export function SlackComposer({
  channel,
  currentUser,
  onSendMessage,
  isSending = false,
}: SlackComposerProps) {
  const [content, setContent] = useState("");
  const [sendAsEmail, setSendAsEmail] = useState(channel.isEmailBridge || channel.type === "email");
  const [emailSubject, setEmailSubject] = useState("");
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiAnchor, setEmojiAnchor] = useState<{ top: number; left: number; bottom: number; right: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync email toggle when channel changes
  useEffect(() => {
    setSendAsEmail(Boolean(channel.isEmailBridge || channel.type === "email"));
    setEmailSubject("");
    setShowEmojiPicker(false);
  }, [channel.id, channel.isEmailBridge, channel.type]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  };

  const handleInsertEmoji = (emoji: string) => {
    if (!textareaRef.current) {
      setContent((prev) => prev + emoji);
      return;
    }
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const replacement = emoji;
    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start + emoji.length, start + emoji.length);
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
      }
    }, 50);
  };

  const handleSend = () => {
    if ((!content.trim() && pendingAttachments.length === 0) || isSending) return;

    onSendMessage({
      content: content.trim(),
      attachments: pendingAttachments.length > 0 ? pendingAttachments : undefined,
      sendAsEmail: sendAsEmail,
      emailSubject: emailSubject.trim() || undefined,
    });

    setContent("");
    setPendingAttachments([]);
    setShowEmojiPicker(false);
    if (!channel.isEmailBridge) {
      setSendAsEmail(false);
    }
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const isImg = file.type.startsWith("image/");
      const isPdf = file.type === "application/pdf";
      const sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

      const reader = new FileReader();
      reader.onload = (event) => {
        const resultUrl = event.target?.result as string;
        const newAtt: Attachment = {
          id: `att-up-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          name: file.name,
          type: isImg ? "image" : isPdf ? "pdf" : "doc",
          url: resultUrl,
          size: sizeStr,
          previewUrl: isImg ? resultUrl : undefined,
        };

        setPendingAttachments((prev) => [...prev, newAtt]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (id: string) => {
    setPendingAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const insertFormatting = (prefix: string, suffix: string = "") => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selected = content.substring(start, end);
    const replacement = `${prefix}${selected || "teks"}${suffix}`;

    setContent(content.substring(0, start) + replacement + content.substring(end));
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start + prefix.length, start + prefix.length + (selected.length || 4));
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
      }
    }, 50);
  };

  const placeholderText = channel.type === "dm"
    ? `Kirim pesan ke @${channel.name}...`
    : channel.type === "email"
    ? `Kirim pesan ke ${channel.emailAddress || channel.name}...`
    : `Kirim pesan ke #${channel.name}...`;

  return (
    <div className="px-3 py-2 sm:px-4 sm:py-2.5 bg-white dark:bg-[#121212] border-t border-neutral-200/80 dark:border-neutral-800 space-y-2">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileUpload}
        className="hidden"
        accept="image/*,.pdf,.doc,.docx,.xlsx,.pptx"
      />

      {/* Email Subject Bar if in Email Mode */}
      {(sendAsEmail || channel.isEmailBridge || channel.type === "email") && (
        <div className="px-3 py-1.5 rounded-lg bg-sky-50/80 dark:bg-sky-950/40 border border-sky-200/80 dark:border-sky-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-sky-900 dark:text-sky-200 font-medium">
            <Mail className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
            <span className="font-semibold">Email Bridge:</span>
            <span className="text-sky-800 dark:text-sky-300">
              Pesan ini dikirim ke kontak email tujuan.
            </span>
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <input
              type="text"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder="Subjek email (Opsional)..."
              className="px-2.5 py-1 rounded bg-white dark:bg-[#161616] border border-sky-200 dark:border-sky-800 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-sky-400 w-full sm:w-52"
            />
            <button
              onClick={() => setSendAsEmail(false)}
              className="p-1 text-sky-700 hover:text-sky-950 dark:hover:text-white cursor-pointer"
              title="Batalkan kirim email"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Pending Attachments Chips */}
      {pendingAttachments.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {pendingAttachments.map((att) => (
            <div
              key={att.id}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs"
            >
              {att.type === "image" ? (
                <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
              ) : (
                <FileText className="w-3.5 h-3.5 text-rose-500" />
              )}
              <span className="font-medium text-neutral-800 dark:text-neutral-200 truncate max-w-[140px]">
                {att.name}
              </span>
              <span className="text-[11px] text-neutral-400">{att.size}</span>
              <button
                onClick={() => removeAttachment(att.id)}
                className="p-0.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main Composer Box */}
      <div className="relative rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#161616]/70 focus-within:border-[#FFE500] focus-within:bg-white dark:focus-within:bg-[#161616] transition-all shadow-2xs">
        {/* Formatting Toolbar */}
        <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-neutral-200/60 dark:border-neutral-800/80 text-neutral-600 dark:text-neutral-400 text-xs">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => insertFormatting("**", "**")}
              title="Bold (**teks**)"
              className="p-1 rounded-md hover:bg-neutral-200/70 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting("*", "*")}
              title="Italic (*teks*)"
              className="p-1 rounded-md hover:bg-neutral-200/70 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting("`", "`")}
              title="Code Block (`code`)"
              className="p-1 rounded-md hover:bg-neutral-200/70 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting("- ")}
              title="Bullet List"
              className="p-1 rounded-md hover:bg-neutral-200/70 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <List className="w-3.5 h-3.5" />
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (showEmojiPicker) {
                    setShowEmojiPicker(false);
                    setEmojiAnchor(null);
                  } else {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setEmojiAnchor({
                      top: rect.top,
                      left: rect.left,
                      bottom: rect.bottom,
                      right: rect.right,
                    });
                    setShowEmojiPicker(true);
                  }
                }}
                title="Sisipkan Emoji"
                className={`p-1 rounded-md hover:bg-neutral-200/70 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer ${
                  showEmojiPicker ? "bg-neutral-200/80 dark:bg-neutral-800 text-neutral-900 dark:text-white" : ""
                }`}
              >
                <Smile className="w-3.5 h-3.5" />
              </button>

              {showEmojiPicker && (
                <SlackEmojiPicker
                  anchorRect={emojiAnchor}
                  onSelectEmoji={handleInsertEmoji}
                  onClose={() => {
                    setShowEmojiPicker(false);
                    setEmojiAnchor(null);
                  }}
                  position="top"
                  align="left"
                />
              )}
            </div>

            <div className="w-px h-3.5 bg-neutral-200 dark:bg-neutral-800 mx-1" />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Lampirkan File / Dokumen / Gambar"
              className="px-1.5 py-1 rounded-md hover:bg-neutral-200/70 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-xs font-medium"
            >
              <Paperclip className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-300" />
              <span>Attach</span>
            </button>

            <button
              type="button"
              onClick={() => setSendAsEmail(!sendAsEmail)}
              title="Kirim juga salinan via Email"
              className={`px-1.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 text-xs font-medium ${
                sendAsEmail
                  ? "bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-bold"
                  : "hover:bg-neutral-200/70 dark:hover:bg-neutral-800 hover:text-neutral-900"
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email Bridge</span>
            </button>
          </div>
        </div>

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          rows={2}
          value={content}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholderText}
          className="w-full px-3.5 py-2.5 bg-transparent text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none resize-none leading-normal min-h-[56px] max-h-[160px]"
        />

        {/* Footer Composer Action Bar (No inner border, clean send button) */}
        <div className="flex items-center justify-end px-2.5 pb-2 bg-transparent">
          <button
            type="button"
            onClick={handleSend}
            disabled={(!content.trim() && pendingAttachments.length === 0) || isSending}
            title="Kirim pesan (Enter)"
            className="p-2 rounded-lg text-neutral-700 hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white hover:bg-neutral-200/70 dark:hover:bg-neutral-800 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            <Send className="w-5 h-5 stroke-[1.8]" />
          </button>
        </div>
      </div>
    </div>
  );
}
