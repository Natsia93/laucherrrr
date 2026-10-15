"use client";

import React, { useState, useEffect, useRef } from "react";
import { marked } from "marked";
import {
  ArrowRight,
  Loader2,
  Sparkles,
  RotateCcw,
  Square,
  User,
  Search,
  Check,
  Copy,
  Paperclip,
  ImageIcon,
  FileText,
  FileSpreadsheet,
  FileCode,
  X,
  History,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { motion, type Variants } from "framer-motion";
import { ChatHistoryDrawer, type ConversationSummary } from "@/components/chat/ChatHistoryDrawer";

// Staggered upward animation from leftmost to rightmost
const chipsContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const chipItemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 380,
      damping: 22,
      mass: 0.7,
    },
  },
};

// Configure marked synchronous mode
marked.use({ async: false, breaks: true });

export interface ChatAttachment {
  name: string;
  type: "image" | "pdf" | "word" | "excel" | "text";
  size: string;
  previewUrl?: string; // For images
  extractedText?: string; // For documents
  isExtracting?: boolean;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  image?: string;
  attachment?: ChatAttachment;
  isSearching?: boolean;
  isTyping?: boolean;
}

const getAttachmentType = (file: File): "image" | "pdf" | "word" | "excel" | "text" => {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();

  if (type.startsWith("image/") || /\.(png|jpe?g|webp|gif|svg|bmp|ico)$/i.test(name)) {
    return "image";
  }
  if (type === "application/pdf" || name.endsWith(".pdf")) {
    return "pdf";
  }
  if (
    type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    type === "application/msword" ||
    /\.(docx|doc)$/i.test(name)
  ) {
    return "word";
  }
  if (
    type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    type === "application/vnd.ms-excel" ||
    /\.(xlsx|xls|csv)$/i.test(name)
  ) {
    return "excel";
  }
  return "text";
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const truncateFileName = (name: string, maxLen = 20): string => {
  if (!name || name.length <= maxLen) return name;
  const lastDot = name.lastIndexOf(".");
  if (lastDot > 0 && name.length - lastDot <= 6) {
    const ext = name.slice(lastDot);
    const base = name.slice(0, lastDot);
    const charsToShow = Math.max(maxLen - ext.length - 3, 4);
    return `${base.slice(0, charsToShow).trimEnd()}...${ext}`;
  }
  return `${name.slice(0, maxLen - 3).trimEnd()}...`;
};

export default function DashboardOverviewPage() {
  const { data: session } = authClient.useSession();
  const [prompt, setPrompt] = useState("");
  const [docType, setDocType] = useState("");
  const [loading, setLoading] = useState(false);
  const [attachment, setAttachment] = useState<ChatAttachment | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyMessage = (id: string, text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId((prev) => (prev === id ? null : prev));
    }, 2000);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomFileInputRef = useRef<HTMLInputElement>(null);
  const bottomTextareaRef = useRef<HTMLTextAreaElement>(null);

  const handleIncomingFile = async (file: File) => {
    if (file.size > 15 * 1024 * 1024) {
      alert("Ukuran file maksimal 15MB.");
      return;
    }

    const attType = getAttachmentType(file);
    const sizeFormatted = formatFileSize(file.size);

    if (attType === "image") {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAttachment({
          name: file.name,
          type: "image",
          size: sizeFormatted,
          previewUrl: e.target?.result as string,
          isExtracting: false,
        });
      };
      reader.readAsDataURL(file);
      return;
    }

    // Document: PDF, Word, Excel, or Text
    setAttachment({
      name: file.name,
      type: attType,
      size: sizeFormatted,
      isExtracting: true,
    });

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/extract-text", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Gagal membaca isi dokumen.");
      }

      setAttachment((prev) =>
        prev && prev.name === file.name
          ? {
              ...prev,
              extractedText: data.text,
              isExtracting: false,
            }
          : prev
      );
    } catch (err: any) {
      alert(err?.message || "Gagal memproses file. Pastikan format file sesuai.");
      setAttachment(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleIncomingFile(file);
    }
    e.target.value = "";
  };

  const handleRemoveAttachment = () => {
    setAttachment(null);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === "file") {
        const file = item.getAsFile();
        if (file) {
          handleIncomingFile(file);
          break;
        }
      }
    }
  };

  const userFullName = session?.user?.name || "Fiqiy";
  const nameParts = userFullName.trim().split(/\s+/);
  const userLastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : nameParts[0];

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [conversationsList, setConversationsList] = useState<ConversationSummary[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const activeConvIdRef = useRef<string | null>(null);

  useEffect(() => {
    activeConvIdRef.current = activeConversationId;
  }, [activeConversationId]);

  const fetchConversations = async () => {
    if (!session?.user?.id) return;
    setIsLoadingHistory(true);
    try {
      const res = await fetch("/api/chat/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversationsList(data.conversations || []);
      }
    } catch (err) {
      console.error("Error fetching conversations:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchConversations();
    }
  }, [session?.user?.id]);

  const persistConversation = async (msgs: ChatMessage[]) => {
    if (!session?.user?.id || msgs.length === 0) return;
    try {
      const res = await fetch("/api/chat/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activeConvIdRef.current || undefined,
          docType: docType || "",
          messages: msgs,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.conversation?.id) {
          if (!activeConvIdRef.current) {
            activeConvIdRef.current = data.conversation.id;
            setActiveConversationId(data.conversation.id);
          }
          fetchConversations();
        }
      }
    } catch (err) {
      console.error("Failed to save conversation:", err);
    }
  };

  const persistConversationRef = useRef(persistConversation);
  useEffect(() => {
    persistConversationRef.current = persistConversation;
  });

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Typewriter streaming animation refs
  const targetTextRef = useRef<string>("");
  const displayedTextRef = useRef<string>("");
  const isStreamDoneRef = useRef<boolean>(false);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentAiMsgIdRef = useRef<string | null>(null);

  // Auto-scroll when messages update
  useEffect(() => {
    if (messages.length > 0) {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  // Auto-resize bottom chat textarea dynamically to comfortably fit up to 5 lines (~140px)
  useEffect(() => {
    const el = bottomTextareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const nextH = Math.min(Math.max(el.scrollHeight, 44), 140);
    el.style.height = `${nextH}px`;
  }, [prompt]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, []);

  const stopTypewriter = (finalText?: string) => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
    const aiId = currentAiMsgIdRef.current;
    if (aiId) {
      setMessages((prev) => {
        const updated = prev.map((msg) =>
          msg.id === aiId
            ? {
                ...msg,
                text: finalText !== undefined ? finalText : targetTextRef.current || msg.text,
                isTyping: false,
              }
            : msg
        );
        persistConversationRef.current(updated);
        return updated;
      });
    }
  };

  const startTypewriter = (targetAiMsgId: string) => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }

    currentAiMsgIdRef.current = targetAiMsgId;
    displayedTextRef.current = "";

    typingIntervalRef.current = setInterval(() => {
      const target = targetTextRef.current;
      const current = displayedTextRef.current;

      if (current.length < target.length) {
        const remaining = target.length - current.length;
        // Dynamic adaptive typing cadence: gentle & smooth
        const step = remaining > 120 ? 6 : remaining > 50 ? 4 : remaining > 20 ? 2 : 1;
        const nextText = target.slice(0, current.length + step);
        displayedTextRef.current = nextText;

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === targetAiMsgId
              ? { ...msg, text: nextText, isTyping: true }
              : msg
          )
        );
      } else if (isStreamDoneRef.current) {
        // Finished typing everything after network stream completed
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
          typingIntervalRef.current = null;
        }
        const finalTarget = target;
        setMessages((prev) => {
          const updated = prev.map((msg) =>
            msg.id === targetAiMsgId
              ? { ...msg, text: finalTarget, isTyping: false }
              : msg
          );
          persistConversationRef.current(updated);
          return updated;
        });
        setLoading(false);
      }
    }, 18);
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    isStreamDoneRef.current = true;
    stopTypewriter();
    setLoading(false);
  };

  const handleNewChat = () => {
    handleStopGeneration();
    activeConvIdRef.current = null;
    setActiveConversationId(null);
    setMessages([]);
    setPrompt("");
    setAttachment(null);
    targetTextRef.current = "";
    displayedTextRef.current = "";
    currentAiMsgIdRef.current = null;
  };

  const handleSelectConversation = async (id: string) => {
    if (loading) handleStopGeneration();
    try {
      const res = await fetch(`/api/chat/conversations/${id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.conversation) {
          activeConvIdRef.current = data.conversation.id;
          setActiveConversationId(data.conversation.id);
          setDocType(data.conversation.docType || "");
          setMessages(data.conversation.messages || []);
        }
      }
    } catch (err) {
      console.error("Failed to load conversation:", err);
    }
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      const res = await fetch(`/api/chat/conversations/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setConversationsList((prev) => prev.filter((c) => c.id !== id));
        if (activeConvIdRef.current === id) {
          handleNewChat();
        }
      }
    } catch (err) {
      console.error("Failed to delete conversation:", err);
    }
  };

  const handlePromptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userPrompt = prompt.trim();
    if ((!userPrompt && !attachment) || loading || (attachment?.isExtracting ?? false)) return;

    const currentAttachment = attachment;
    const currentPrompt = userPrompt;

    setPrompt("");
    setAttachment(null);
    setLoading(true);

    const userMsgId = `user-${Date.now()}`;
    const aiMsgId = `ai-${Date.now()}`;

    // Reset typewriter trackers
    targetTextRef.current = "";
    displayedTextRef.current = "";
    isStreamDoneRef.current = false;
    currentAiMsgIdRef.current = aiMsgId;

    let rawPromptToSend = currentPrompt;
    let imageToSend: string | undefined = undefined;

    if (currentAttachment) {
      if (currentAttachment.type === "image") {
        imageToSend = currentAttachment.previewUrl;
        rawPromptToSend = currentPrompt || "Analisis dan jelaskan gambar yang diunggah secara mendalam.";
      } else {
        const docHeader = `[DOKUMEN DILAMPIRKAN: ${currentAttachment.name} (${currentAttachment.type.toUpperCase()})]\n\n--- KONTEN DOKUMEN ---\n${currentAttachment.extractedText || "Teks dokumen tidak dapat diekstrak atau kosong."}\n--- AKHIR KONTEN DOKUMEN ---`;
        rawPromptToSend = currentPrompt
          ? `${docHeader}\n\nPertanyaan / Instruksi Pengguna:\n${currentPrompt}`
          : `${docHeader}\n\nAnalisis dan jelaskan isi dokumen di atas secara komprehensif, terstruktur rapi, dan jelas.`;
      }
    }

    const newMessages: ChatMessage[] = [
      ...messages,
      {
        id: userMsgId,
        role: "user",
        text: currentPrompt,
        image: imageToSend,
        attachment: currentAttachment
          ? {
              name: currentAttachment.name,
              type: currentAttachment.type,
              size: currentAttachment.size,
              previewUrl: currentAttachment.previewUrl,
            }
          : undefined,
      },
      { id: aiMsgId, role: "assistant", text: "", isSearching: false, isTyping: true },
    ];

    setMessages(newMessages);
    startTypewriter(aiMsgId);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.role === "user" ? ("user" as const) : ("ai" as const),
        text: m.text,
      }));

      const activeProvider = typeof window !== "undefined" ? (localStorage.getItem("ai_provider") || "deepseek") : "deepseek";
      const storedApiKey = typeof window !== "undefined" ? (localStorage.getItem(`ai_key_${activeProvider}`) || localStorage.getItem("deepseek_api_key") || "") : "";
      const storedModel = typeof window !== "undefined" ? (localStorage.getItem(`ai_model_${activeProvider}`) || localStorage.getItem("deepseek_selected_model") || "") : "";

      const response = await fetch("/api/generate-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          rawPrompt: rawPromptToSend,
          image: imageToSend,
          type: docType || "General",
          mode: "chat",
          isAssistant: true,
          messages: historyPayload,
          // BYOK: send user's API key and provider
          apiKey: storedApiKey,
          provider: activeProvider,
          selectedModel: storedModel,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to connect to AI");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Stream reader not available");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const part of parts) {
          if (!part.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(part.slice(6));

            if (data.type === "chat" || data.type === "chunk") {
              const chunkText = data.text || "";
              if (!chunkText.includes("🔍 *Mencari informasi") && !chunkText.includes("Mencari informasi")) {
                // Append chunk to target text ref for typewriter queue
                targetTextRef.current += chunkText;
              }
            }
          } catch {
            // ignore JSON parse error for incomplete chunks
          }
        }
      }

      // Mark stream finished so typewriter can conclude
      isStreamDoneRef.current = true;
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        isStreamDoneRef.current = true;
        const fallbackText =
          targetTextRef.current ||
          "Sorry, an error occurred while connecting to AI. Please ensure your API key configuration is active on the server.";
        targetTextRef.current = fallbackText;
      }
    } finally {
      abortControllerRef.current = null;
      // If targetText was empty (or immediate error), ensure typewriter concludes
      if (!targetTextRef.current) {
        stopTypewriter();
        setLoading(false);
      }
    }
  };

  return (
    <AppShell
      headerActions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setHistoryOpen(true)}
            className="h-8.5 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white font-medium text-xs px-3 flex items-center gap-1.5 cursor-pointer rounded-[5px] hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all shadow-2xs"
          >
            <History className="w-3.5 h-3.5 text-neutral-500" />
            <span>Chat History</span>
            {conversationsList.length > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 bg-[#FFDE3C]/30 text-neutral-900 dark:text-[#FFDE3C] text-[10px] font-bold rounded-[3px]">
                {conversationsList.length}
              </span>
            )}
          </Button>

          {messages.length > 0 && (
            <Button
              size="sm"
              onClick={handleNewChat}
              className="h-8.5 bg-[#FFDE3C] hover:bg-[#ffe55c] text-neutral-950 font-bold text-xs px-3.5 shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all rounded-[5px]"
            >
              <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New Chat</span>
            </Button>
          )}
        </div>
      }
    >
      <ChatHistoryDrawer
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        conversations={conversationsList}
        activeId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        isLoadingList={isLoadingHistory}
      />

      {messages.length === 0 ? (
        /* Empty State / Centered Hero Launcher */
        <div className="min-h-[75vh] flex flex-col items-center justify-center max-w-3xl mx-auto px-4 py-8">
          {/* Lora Font English Greeting */}
          <div className="w-full text-center space-y-2.5 mb-8">
            <h1
              suppressHydrationWarning
              className="text-[32px] sm:text-[44px] font-normal sm:font-medium font-sf tracking-tight leading-tight animate-text-shimmer"
            >
              Nice to meet you, {userLastName}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
              What would you like to explore, build, or analyze today?
            </p>
          </div>

          {/* Centered Prompt Box */}
          <div className="w-full relative">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*,.pdf,.docx,.doc,.xlsx,.xls,.csv,.txt,.md"
              className="hidden"
              onChange={handleFileChange}
            />

            <form
              onSubmit={handlePromptSubmit}
              className="w-full bg-white dark:bg-[#111111] border border-neutral-200 dark:border-neutral-800 p-4 sm:p-5 flex flex-col gap-3.5 shadow-sm hover:border-neutral-400 dark:hover:border-neutral-700 transition-all rounded-xl"
            >
              {/* Attachment preview */}
              {attachment && (
                <div className="relative inline-flex items-center gap-2.5 p-1.5 pr-2.5 bg-neutral-100 dark:bg-neutral-800/90 border border-neutral-200 dark:border-neutral-700 rounded-lg self-start group animate-in fade-in zoom-in-95 duration-150 shadow-xs max-w-full">
                  {attachment.type === "image" && attachment.previewUrl ? (
                    <div className="w-8 h-8 rounded-md overflow-hidden border border-neutral-200 dark:border-neutral-700 bg-neutral-200 dark:bg-neutral-900 shrink-0">
                      <img src={attachment.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div
                      className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 border ${
                        attachment.type === "pdf"
                          ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                          : attachment.type === "word"
                          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                          : attachment.type === "excel"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                      }`}
                    >
                      {attachment.isExtracting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : attachment.type === "excel" ? (
                        <FileSpreadsheet className="w-4 h-4" />
                      ) : (
                        <FileText className="w-4 h-4" />
                      )}
                    </div>
                  )}

                  <div className="flex flex-col min-w-0 pr-1 text-left">
                    <span
                      title={attachment.name}
                      className="text-xs font-medium text-neutral-800 dark:text-neutral-200 truncate max-w-[140px] sm:max-w-[200px]"
                    >
                      {truncateFileName(attachment.name, 18)}
                    </span>
                    <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                      {attachment.isExtracting ? (
                        <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium font-sf">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          Extracting document contents...
                        </span>
                      ) : (
                        `${attachment.type.toUpperCase()} • ${attachment.size}`
                      )}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleRemoveAttachment}
                    className="w-5 h-5 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-red-500 text-neutral-500 dark:text-neutral-400 flex items-center justify-center transition-colors cursor-pointer ml-0.5"
                    title="Remove attachment"
                  >
                    <X className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              )}

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onPaste={handlePaste}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    e.currentTarget.form?.requestSubmit();
                  }
                }}
                placeholder={
                  docType === "FINANCE"
                    ? "Ask about market sizing, valuation, unit economics (CAC/LTV), financial models, or attach data..."
                    : docType === "STRATEGY"
                    ? "Describe your business dilemma, competitive moats (7 Powers), product strategy, or PRD requirements..."
                    : docType === "GROWTH"
                    ? "Ask about acquisition loops, viral coefficients, retention curves, funnel conversion, or campaigns..."
                    : docType === "REASONING"
                    ? "Present a complex strategic decision, conflicting trade-off, or hypothesis to stress-test from first principles..."
                    : "Ask anything, explore ideas, or attach documents (PDF, Word, Excel, Images)..."
                }
                className="w-full bg-transparent border-none text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:ring-0 text-sm sm:text-base outline-none resize-none min-h-[95px] font-sf"
              />

              <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium font-sf text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 transition-colors cursor-pointer"
                  title="Attach Document or Image (PDF, Word, Excel, Image)"
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  <span>Attach File</span>
                </button>

                <Button
                  type="submit"
                  size="icon"
                  disabled={(!prompt.trim() && !attachment) || loading || (attachment?.isExtracting ?? false)}
                  className={`h-9 w-9 rounded-lg font-bold shadow-xs transition-all duration-200 shrink-0 ${
                    (prompt.trim() || attachment) && !loading && !attachment?.isExtracting
                      ? "bg-[#FFDE3C] hover:bg-[#ffe55c] text-neutral-950 cursor-pointer active:scale-95"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600 cursor-not-allowed opacity-60"
                  }`}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-neutral-950" />
                  ) : (
                    <ArrowRight
                      className={`w-4 h-4 stroke-[2.5] ${
                        prompt.trim() || attachment
                          ? "text-neutral-950"
                          : "text-neutral-400 dark:text-neutral-600"
                      }`}
                    />
                  )}
                </Button>
              </div>
            </form>

            {/* Specialized Skills & Brain Chips - Single row with left-to-right staggered upward animation */}
            <motion.div
              variants={chipsContainerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-nowrap items-center justify-center gap-2 mt-4 overflow-x-auto no-scrollbar py-1"
            >
              {[
                { label: "General Chat", value: "" },
                { label: "Market & Finance", value: "FINANCE" },
                { label: "Product & Strategy", value: "STRATEGY" },
                { label: "Growth & Marketing", value: "GROWTH" },
                { label: "Deep Reasoning", value: "REASONING" },
              ].map((tag) => (
                <motion.button
                  key={tag.label}
                  variants={chipItemVariants}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={() => setDocType(tag.value)}
                  className={`px-3 py-1.5 rounded-md border text-xs whitespace-nowrap transition-colors font-sf cursor-pointer shrink-0 ${
                    (docType === tag.value) || (!docType && tag.value === "")
                      ? "bg-neutral-950 text-white border-neutral-950 dark:bg-neutral-100 dark:text-neutral-950 dark:border-neutral-100 font-semibold shadow-xs"
                      : "border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:border-neutral-400 dark:hover:border-neutral-600 bg-white dark:bg-neutral-900"
                  }`}
                >
                  {tag.label}
                </motion.button>
              ))}
            </motion.div>
          </div>
        </div>
      ) : (
        /* Active Conversational Chat View (Like ChatGPT / Gemini / Claude) */
        <div className="flex flex-col max-w-3xl mx-auto min-h-[calc(100vh-140px)] pb-32 pt-2 px-3 sm:px-4 font-sf">
          {/* Messages Stream */}
          <div className="space-y-6 flex-1">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-3 transition-opacity duration-300 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {/* AI Message (Clean, standalone larger RevoU logo) */}
                {msg.role === "assistant" ? (
                  <div className="flex items-start gap-3.5 w-full">
                    <div className="relative w-7 h-7 sm:w-8 sm:h-8 shrink-0 select-none mt-0.5 flex items-center justify-center overflow-visible">
                      <img
                        src="/logo/Logo_revou.png"
                        alt="Launcher OS"
                        className={`w-full h-full object-contain select-none transition-all duration-300 ${
                          !msg.text ? "animate-logo-heartbeat" : ""
                        }`}
                      />
                    </div>
                    {msg.text ? (
                      <div className="flex-1 min-w-0 text-sm sm:text-base leading-relaxed text-neutral-900 dark:text-neutral-100 pt-0.5">
                        <div className="relative">
                          <div
                            className="markdown-body prose dark:prose-invert max-w-none [overflow-wrap:break-word] [word-break:break-word]"
                            dangerouslySetInnerHTML={{
                              __html: marked.parse(msg.text) as string,
                            }}
                          />
                          {msg.isTyping && (
                            <span className="inline-block w-2 h-4.5 bg-[#FFDE3C] ml-1 align-middle animate-pulse rounded-xs shadow-xs" />
                          )}
                        </div>
                        {!msg.isTyping && msg.text && (
                          <div className="flex items-center gap-2 mt-2 pt-1 text-neutral-400 dark:text-neutral-500">
                            <button
                              type="button"
                              onClick={() => handleCopyMessage(msg.id, msg.text)}
                              className="p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer flex items-center gap-1.5 text-xs select-none"
                              title="Copy response"
                            >
                              {copiedId === msg.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                                  <span className="text-[11px] font-medium text-emerald-500">Copied</span>
                                </>
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center text-xs sm:text-sm text-neutral-400 dark:text-neutral-500 font-normal pt-1.5 sm:pt-2 select-none animate-pulse">
                        Thinking...
                      </div>
                    )}
                  </div>
                ) : (
                  /* User Message Bubble */
                  <div className="flex flex-col items-end max-w-[85%] ml-auto gap-2">
                    {/* Document Preview Card (PDF, Word, Excel, Text) */}
                    {msg.attachment && msg.attachment.type !== "image" && (
                      <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs max-w-[320px] sm:max-w-[380px]">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                            msg.attachment.type === "pdf"
                              ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                              : msg.attachment.type === "word"
                              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                              : msg.attachment.type === "excel"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : "bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border border-neutral-500/20"
                          }`}
                        >
                          {msg.attachment.type === "excel" ? (
                            <FileSpreadsheet className="w-5 h-5" />
                          ) : (
                            <FileText className="w-5 h-5" />
                          )}
                        </div>
                        <div className="flex flex-col min-w-0 flex-1 text-left">
                          <span
                            title={msg.attachment.name}
                            className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate"
                          >
                            {truncateFileName(msg.attachment.name, 22)}
                          </span>
                          <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                            {msg.attachment.type.toUpperCase()} • {msg.attachment.size}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Image Attachment */}
                    {((msg.attachment?.type === "image" && msg.attachment.previewUrl) || msg.image) && (
                      <div className="rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-xs max-w-[280px] sm:max-w-[340px] bg-white dark:bg-neutral-900">
                        <img
                          src={msg.attachment?.previewUrl || msg.image}
                          alt="Uploaded attachment"
                          className="w-full h-auto max-h-64 object-contain rounded-xl"
                        />
                      </div>
                    )}

                    {msg.text && (
                      <div className="bg-[#FFDE3C] text-neutral-950 font-medium px-4 py-2.5 rounded-lg rounded-tr-xs shadow-xs text-sm sm:text-base leading-relaxed">
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            <div ref={chatBottomRef} />
          </div>

          {/* Sticky Bottom Floating Prompt Box */}
          <div className="fixed bottom-0 left-0 right-0 lg:pl-[238px] z-30 p-4 pointer-events-none">
            <div className="max-w-3xl mx-auto pointer-events-auto">
              <input
                type="file"
                ref={bottomFileInputRef}
                accept="image/*,.pdf,.docx,.doc,.xlsx,.xls,.csv,.txt,.md"
                className="hidden"
                onChange={handleFileChange}
              />

              <form
                onSubmit={handlePromptSubmit}
                className="w-full bg-white/95 dark:bg-[#111111]/95 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 p-3 sm:p-4 flex flex-col gap-2.5 shadow-lg hover:border-neutral-400 dark:hover:border-neutral-700 transition-all rounded-xl"
              >
                {/* Attachment preview */}
                {attachment && (
                  <div className="relative inline-flex items-center gap-2 p-1.5 pr-2 bg-neutral-100 dark:bg-neutral-800/90 border border-neutral-200 dark:border-neutral-700 rounded-md self-start group animate-in fade-in zoom-in-95 duration-150">
                    {attachment.type === "image" && attachment.previewUrl ? (
                      <div className="w-8 h-8 rounded-xs overflow-hidden border border-neutral-200 dark:border-neutral-700 bg-neutral-200 dark:bg-neutral-900 shrink-0">
                        <img src={attachment.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div
                        className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 border ${
                          attachment.type === "pdf"
                            ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                            : attachment.type === "word"
                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                            : attachment.type === "excel"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                        }`}
                      >
                        {attachment.isExtracting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : attachment.type === "excel" ? (
                          <FileSpreadsheet className="w-4 h-4" />
                        ) : (
                          <FileText className="w-4 h-4" />
                        )}
                      </div>
                    )}

                    <div className="flex flex-col min-w-0 pr-1 text-left">
                      <span
                        title={attachment.name}
                        className="text-xs font-medium text-neutral-800 dark:text-neutral-200 truncate max-w-[130px] sm:max-w-[180px]"
                      >
                        {truncateFileName(attachment.name, 18)}
                      </span>
                      <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                        {attachment.isExtracting ? (
                          <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium font-sf">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            Extracting document contents...
                          </span>
                        ) : (
                          `${attachment.type.toUpperCase()} • ${attachment.size}`
                        )}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleRemoveAttachment}
                      className="w-5 h-5 rounded-xs hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-red-500 text-neutral-500 dark:text-neutral-400 flex items-center justify-center transition-colors cursor-pointer ml-0.5"
                      title="Remove attachment"
                    >
                      <X className="w-3 h-3 stroke-[2.5]" />
                    </button>
                  </div>
                )}

                <div className="flex items-end gap-2 pb-0.5">
                  <button
                    type="button"
                    onClick={() => bottomFileInputRef.current?.click()}
                    className="h-9 w-9 rounded-lg flex items-center justify-center text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer shrink-0 mb-0.5"
                    title="Attach File (Image, PDF, Word, Excel)"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  <textarea
                    ref={bottomTextareaRef}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onPaste={handlePaste}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        e.currentTarget.form?.requestSubmit();
                      }
                    }}
                    placeholder="Type your message, analyze files, or discuss ideas..."
                    className="w-full bg-transparent border-none text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:ring-0 text-sm leading-relaxed outline-none resize-none min-h-[44px] max-h-[140px] font-sf py-2.5 clean-scrollbar"
                    rows={1}
                  />

                  {loading ? (
                    <button
                      type="button"
                      onClick={handleStopGeneration}
                      className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all shrink-0 cursor-pointer border-none p-0 mb-0.5"
                      title="Stop generation"
                    >
                      <div className="w-3.5 h-3.5 bg-red-600 hover:bg-red-700 rounded-[2px] shadow-xs active:scale-90 transition-transform" />
                    </button>
                  ) : (
                    <Button
                      type="submit"
                      size="icon"
                      disabled={(!prompt.trim() && !attachment) || loading || (attachment?.isExtracting ?? false)}
                      className={`h-9 w-9 rounded-lg font-bold shadow-xs transition-all duration-200 shrink-0 mb-0.5 ${
                        (prompt.trim() || attachment) && !loading && !attachment?.isExtracting
                          ? "bg-[#FFDE3C] hover:bg-[#ffe55c] text-neutral-950 cursor-pointer active:scale-95"
                          : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600 cursor-not-allowed opacity-60"
                      }`}
                    >
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </Button>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 pt-1 border-t border-neutral-100 dark:border-neutral-800">
                  <span className="text-[11px] text-neutral-400">Mendukung PDF, Word (.docx), Excel (.xlsx), Text, dan Gambar</span>
                  <span>Press Enter to send, Shift+Enter for new line</span>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
