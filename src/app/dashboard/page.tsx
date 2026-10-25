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
  UploadCloud,
  Folder,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useSidebar } from "@/components/layout/SidebarContext";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { motion, type Variants } from "framer-motion";
import { ChatHistoryDrawer, type ConversationSummary } from "@/components/chat/ChatHistoryDrawer";
import { renderPdfFirstPage } from "@/lib/pdf-thumbnail";

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
  type: "image" | "pdf" | "word" | "excel" | "zip" | "text";
  size: string;
  previewUrl?: string; // For images and PDF first page thumbnail
  extractedText?: string; // For documents
  isExtracting?: boolean;
}

export interface ConnectorActionResult {
  connector: "sheets" | "docs" | "slides" | "drive" | "slack" | "whatsapp" | "notion" | "gmail" | "calendar";
  action: string;
  status: "running" | "success" | "error";
  title: string;
  detail: string;
  url?: string;
  data?: any;
  icon?: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  image?: string;
  attachment?: ChatAttachment;
  isSearching?: boolean;
  isTyping?: boolean;
  connectorActions?: ConnectorActionResult[];
}

const getAttachmentType = (file: File): "image" | "pdf" | "word" | "excel" | "zip" | "text" => {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();

  if (type.startsWith("image/") || /\.(png|jpe?g|webp|gif|svg|bmp|ico)$/i.test(name)) {
    return "image";
  }
  if (type === "application/pdf" || name.endsWith(".pdf")) {
    return "pdf";
  }
  if (
    type.includes("zip") ||
    type.includes("x-zip") ||
    type.includes("compressed") ||
    /\.(zip|tar|gz|rar|7z)$/i.test(name)
  ) {
    return "zip";
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

async function rasterizeSvgToPng(svgFile: File): Promise<{ pngUrl: string; svgText: string }> {
  const svgText = await svgFile.text();
  return new Promise((resolve) => {
    try {
      const blob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const width = img.naturalWidth || 512;
          const height = img.naturalHeight || 512;
          canvas.width = Math.min(Math.max(width, 256), 1024);
          canvas.height = Math.min(Math.max(height, 256), 1024);
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const pngUrl = canvas.toDataURL("image/png");
            URL.revokeObjectURL(url);
            resolve({ pngUrl, svgText });
            return;
          }
        } catch (e) {
          console.warn("[SVG canvas render warning]", e);
        }
        URL.revokeObjectURL(url);
        resolve({ pngUrl: "", svgText });
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({ pngUrl: "", svgText });
      };
      img.src = url;
    } catch {
      resolve({ pngUrl: "", svgText });
    }
  });
}

const getAttachmentBadgeMeta = (att: ChatAttachment) => {
  const ext = att.name.split(".").pop()?.toUpperCase() || "";
  if (att.type === "zip" || ext === "ZIP" || ext === "RAR" || ext === "7Z") {
    return {
      badge: ext || "ZIP",
      badgeClass: "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200/80 dark:border-neutral-700/80",
    };
  }
  if (att.type === "word") {
    return {
      badge: ext === "DOC" ? "DOC" : "DOCX",
      badgeClass: "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200/80 dark:border-neutral-700/80",
    };
  }
  if (att.type === "pdf") {
    return {
      badge: "PDF",
      badgeClass: "bg-white/95 dark:bg-neutral-900/90 text-neutral-800 dark:text-neutral-200 border border-neutral-200/90 dark:border-neutral-700 shadow-xs",
    };
  }
  if (att.type === "excel") {
    return {
      badge: ext === "CSV" ? "CSV" : "XLSX",
      badgeClass: "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200/80 dark:border-neutral-700/80",
    };
  }
  return {
    badge: ext || "TXT",
    badgeClass: "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200/80 dark:border-neutral-700/80",
  };
};

/* Claude.ai exact square attachment card (PDF preview, Image preview, or Non-visual ZIP/Word/Excel) */
function ClaudeAttachmentCard({
  attachment,
  onRemove,
  onClick,
}: {
  attachment: ChatAttachment;
  onRemove?: () => void;
  onClick?: () => void;
}) {
  const meta = getAttachmentBadgeMeta(attachment);

  return (
    <div className="mb-2 inline-block">
      <div
        onClick={onClick}
        className={`group relative w-20 h-20 sm:w-22 sm:h-22 rounded-xl border border-neutral-200 dark:border-neutral-700/80 bg-white dark:bg-[#181818] shadow-xs hover:border-neutral-400 dark:hover:border-neutral-500 transition-all overflow-hidden select-none ${
          onClick ? "cursor-pointer" : ""
        }`}
        title={attachment.name}
      >
        {/* Remove Button on hover (Claude style) */}
        {onRemove && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="absolute top-1.5 right-1.5 z-20 w-4.5 h-4.5 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-sm"
            title="Remove attachment"
          >
            <X className="w-2.5 h-2.5 stroke-[2.5]" />
          </button>
        )}

        {/* Content Rendering */}
        {attachment.type === "image" && attachment.previewUrl ? (
          <div className="w-full h-full flex items-center justify-center p-1 bg-neutral-50 dark:bg-neutral-900">
            <img
              src={attachment.previewUrl}
              alt={attachment.name}
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
        ) : attachment.type === "pdf" && attachment.previewUrl ? (
          <div className="relative w-full h-full bg-white dark:bg-neutral-900">
            <img
              src={attachment.previewUrl}
              alt="PDF Page 1 preview"
              className="w-full h-full object-cover object-top"
            />
            <div className="absolute bottom-1.5 left-1.5 z-10 pointer-events-none">
              <span className="px-1 py-0.2 rounded text-[8px] font-bold tracking-wider bg-white/95 dark:bg-neutral-900/90 text-neutral-800 dark:text-neutral-200 border border-neutral-200/90 dark:border-neutral-700 shadow-xs">
                PDF
              </span>
            </div>
          </div>
        ) : (
          /* ZIP, DOCX, XLSX, TXT, or PDF during extraction (Claude style) */
          <div className="w-full h-full p-2 flex flex-col justify-between bg-white dark:bg-[#181818]">
            <div className="pr-3">
              <p className="text-[11px] font-normal text-neutral-800 dark:text-neutral-200 leading-tight line-clamp-2 break-words">
                {attachment.name}
              </p>
              {attachment.isExtracting && (
                <span className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-medium mt-0.5">
                  <Loader2 className="w-2.5 h-2.5 animate-spin" />
                  <span>Reading...</span>
                </span>
              )}
            </div>
            <div className="flex items-center">
              <span className={`px-1 py-0.2 rounded text-[8px] font-bold tracking-wider ${meta.badgeClass}`}>
                {meta.badge}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardOverviewPage() {
  const { data: session } = authClient.useSession();
  const { collapsed } = useSidebar();
  const [prompt, setPrompt] = useState("");
  const [docType, setDocType] = useState("");
  const [loading, setLoading] = useState(false);
  const [attachment, setAttachment] = useState<ChatAttachment | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeConnectors, setActiveConnectors] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("launcher_app_connectors");
      if (raw) {
        try {
          setActiveConnectors(JSON.parse(raw));
        } catch {}
      }
    }
  }, []);

  const connectedList = React.useMemo(() => {
    if (!activeConnectors) return [];
    const list: { id: string; name: string; icon: string }[] = [];
    if (activeConnectors.gmail?.connected) {
      list.push({ id: "gmail", name: "Gmail", icon: "/logo/App-connector/Gmail.webp" });
    }
    if (activeConnectors.sheets?.connected) {
      list.push({ id: "sheets", name: "Sheets", icon: "/logo/App-connector/google-sheets-svgrepo-com.svg" });
    }
    if (activeConnectors.docs?.connected) {
      list.push({ id: "docs", name: "Docs", icon: "/logo/App-connector/google-docs.webp" });
    }
    if (activeConnectors.slides?.connected) {
      list.push({ id: "slides", name: "Slides", icon: "/logo/App-connector/google-slides.webp" });
    }
    if (activeConnectors.drive?.connected) {
      list.push({ id: "drive", name: "Drive", icon: "/logo/App-connector/google-drive-svgrepo-com.svg" });
    }
    if (activeConnectors.slack?.connected) {
      list.push({ id: "slack", name: "Slack", icon: "/logo/App-connector/slack-svgrepo-com.svg" });
    }
    if (activeConnectors.whatsapp?.connected) {
      list.push({ id: "whatsapp", name: "WhatsApp", icon: "/logo/App-connector/whatsapp-128-svgrepo-com.svg" });
    }
    if (activeConnectors.notion?.connected) {
      list.push({ id: "notion", name: "Notion", icon: "/logo/App-connector/notion-logo-svgrepo-com.svg" });
    }
    return list;
  }, [activeConnectors]);

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

  const [isDragging, setIsDragging] = useState(false);

  const handleIncomingFile = async (file: File) => {
    if (file.size > 15 * 1024 * 1024) {
      alert("Ukuran file maksimal 15MB.");
      return;
    }

    const attType = getAttachmentType(file);
    const sizeFormatted = formatFileSize(file.size);

    if (attType === "image") {
      const isSvg = file.name.toLowerCase().endsWith(".svg") || file.type.includes("svg");
      if (isSvg) {
        try {
          const { pngUrl, svgText } = await rasterizeSvgToPng(file);
          setAttachment({
            name: file.name,
            type: "image",
            size: sizeFormatted,
            previewUrl: pngUrl || URL.createObjectURL(file),
            extractedText: svgText,
            isExtracting: false,
          });
          return;
        } catch (svgErr) {
          console.warn("[SVG parse fallback]", svgErr);
        }
      }

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

    // Document: PDF, Word, Excel, ZIP, or Text
    setAttachment({
      name: file.name,
      type: attType,
      size: sizeFormatted,
      isExtracting: attType !== "zip",
    });

    // If PDF, render first page as visual thumbnail
    if (attType === "pdf") {
      renderPdfFirstPage(file)
        .then((thumb) => {
          if (thumb) {
            setAttachment((prev) =>
              prev && prev.name === file.name ? { ...prev, previewUrl: thumb } : prev
            );
          }
        })
        .catch((err) => console.warn("[PDF Thumbnail Error]", err));
    }

    // If zip archive, skip text extraction
    if (attType === "zip") {
      return;
    }

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

  // Full-window drag and drop listeners (Claude style)
  useEffect(() => {
    let counter = 0;
    const onDragEnter = (e: DragEvent) => {
      e.preventDefault();
      counter++;
      if (e.dataTransfer && Array.from(e.dataTransfer.types).includes("Files")) {
        setIsDragging(true);
      }
    };
    const onDragLeave = (e: DragEvent) => {
      e.preventDefault();
      counter--;
      if (counter <= 0) {
        setIsDragging(false);
        counter = 0;
      }
    };
    const onDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = "copy";
      }
    };
    const onDrop = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      counter = 0;
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        handleIncomingFile(e.dataTransfer.files[0]);
      }
    };

    window.addEventListener("dragenter", onDragEnter);
    window.addEventListener("dragleave", onDragLeave);
    window.addEventListener("dragover", onDragOver);
    window.addEventListener("drop", onDrop);

    return () => {
      window.removeEventListener("dragenter", onDragEnter);
      window.removeEventListener("dragleave", onDragLeave);
      window.removeEventListener("dragover", onDragOver);
      window.removeEventListener("drop", onDrop);
    };
  }, []);

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
        let basePrompt = currentPrompt || "Analisis dan jelaskan gambar yang diunggah secara mendalam.";
        if (currentAttachment.extractedText) {
          basePrompt += `\n\n[FILE ASLI BERFORMAT VEKTOR SVG: ${currentAttachment.name}]\n${currentAttachment.extractedText.slice(0, 10000)}`;
        }
        rawPromptToSend = basePrompt;
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
      const storedConnectors = typeof window !== "undefined" ? localStorage.getItem("launcher_app_connectors") : null;
      const connectorsPayload = storedConnectors ? JSON.parse(storedConnectors) : null;

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
          connectors: connectorsPayload,
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

            if (data.type === "connector_action") {
              setMessages((prev) =>
                prev.map((msg) => {
                  if (msg.id === aiMsgId) {
                    const existing = msg.connectorActions || [];
                    const isDup = existing.some(
                      (a) => a.connector === data.connector && a.action === data.action && a.detail === data.detail
                    );
                    return {
                      ...msg,
                      connectorActions: isDup ? existing : [...existing, data],
                    };
                  }
                  return msg;
                })
              );
            }

            if (data.type === "chat" || data.type === "chunk") {
              const chunkText = data.text || "";
              if (!chunkText.includes("🔍 *Mencari informasi") && !chunkText.includes("Mencari informasi")) {
                const cleanChunk = chunkText.replace(/<<<ACTION:[\s\S]*?>>>/g, "");
                // Append chunk to target text ref for typewriter queue
                targetTextRef.current += cleanChunk;
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
            className="h-8.5 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white font-medium text-xs px-2.5 sm:px-3 flex items-center gap-1.5 cursor-pointer rounded-[5px] hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all shadow-2xs shrink-0"
          >
            <History className="w-3.5 h-3.5 text-neutral-500" />
            <span className="hidden sm:inline">Chat History</span>
            <span className="sm:hidden">History</span>
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
              className="h-8.5 bg-[#FFDE3C] hover:bg-[#ffe55c] text-neutral-950 dark:bg-[#141414] dark:hover:bg-[#1e1e1e] dark:text-neutral-100 dark:border dark:border-white/10 font-bold text-xs px-3.5 shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all rounded-[5px]"
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
              className="text-[32px] sm:text-[44px] font-normal sm:font-medium font-lora tracking-tight leading-tight animate-text-shimmer"
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
              accept="image/*,.pdf,.docx,.doc,.xlsx,.xls,.csv,.txt,.md,.zip,.tar,.gz,.rar,.7z"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Active Connectors Indicator Bar (Claude-style) */}
            {connectedList.length > 0 && (
              <div className="flex items-center justify-between px-3 py-1.5 mb-2 rounded-lg bg-neutral-100/70 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-white/5 text-[11px] text-neutral-500 dark:text-neutral-400">
                <div className="flex items-center gap-1.5 overflow-x-auto clean-scrollbar">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 shrink-0">
                    Active Connectors:
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    {connectedList.map((c) => (
                      <span
                        key={c.id}
                        title={`${c.name} is connected`}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium text-[11px] shadow-2xs border border-neutral-200/50 dark:border-neutral-700/50"
                      >
                        <img src={c.icon} alt={c.name} className="w-3.5 h-3.5 object-contain" />
                        <span>{c.name}</span>
                      </span>
                    ))}
                  </div>
                </div>
                <Link
                  href="/settings"
                  className="ml-2 text-[10px] font-semibold text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 shrink-0 transition-colors"
                >
                  Manage →
                </Link>
              </div>
            )}

            <form
              onSubmit={handlePromptSubmit}
              className="w-full bg-white dark:bg-[#111111] border border-neutral-200 dark:border-neutral-800 p-4 sm:p-5 flex flex-col gap-3.5 shadow-sm hover:border-neutral-400 dark:hover:border-neutral-700 transition-all rounded-xl relative"
            >
              {/* Attachment preview (Claude-style Exact Square Card) */}
              {attachment && (
                <ClaudeAttachmentCard
                  attachment={attachment}
                  onRemove={handleRemoveAttachment}
                />
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
                    : docType === "CURRICULUM_DECK"
                    ? "Attach or paste a curriculum, syllabus, or lecture topic to generate a master 120-min slide outline..."
                    : docType === "REASONING"
                    ? "Present a complex strategic decision, conflicting trade-off, or hypothesis to stress-test from first principles..."
                    : "Ask anything, explore ideas, or attach documents (PDF, Word, Excel, Images)..."
                }
                className="w-full bg-transparent border-none text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:ring-0 text-[15px] sm:text-base leading-relaxed outline-none resize-none min-h-[95px] font-lora"
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
              className="flex flex-nowrap items-center justify-start sm:justify-center gap-2 mt-4 overflow-x-auto no-scrollbar py-1 w-full px-1"
            >
              {[
                { label: "General Chat", value: "" },
                { label: "Market & Finance", value: "FINANCE" },
                { label: "Product & Strategy", value: "STRATEGY" },
                { label: "Curriculum to Outline", value: "CURRICULUM_DECK" },
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
        <div className="flex flex-col max-w-3xl mx-auto min-h-[calc(100vh-140px)] pb-48 sm:pb-56 pt-2 px-3 sm:px-4 font-lora">
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
                    {msg.text || (msg.connectorActions && msg.connectorActions.length > 0) ? (
                      <div className="flex-1 min-w-0 font-lora text-sm sm:text-base leading-relaxed text-neutral-900 dark:text-neutral-100 pt-0.5">
                        {/* Connector Action Badges (Claude-style Tool Action Execution) */}
                        {msg.connectorActions && msg.connectorActions.length > 0 && (
                          <div className="flex flex-col gap-1.5 mb-2.5">
                            {msg.connectorActions.map((action, idx) => (
                              <div
                                key={idx}
                                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border max-w-fit transition-all ${
                                  action.status === "success"
                                    ? "bg-neutral-50 dark:bg-neutral-900/80 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 shadow-xs"
                                    : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300"
                                }`}
                              >
                                {action.icon ? (
                                  <img
                                    src={action.icon}
                                    alt={action.connector}
                                    className="w-4 h-4 object-contain shrink-0"
                                  />
                                ) : (
                                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                                )}
                                <span className="font-semibold text-neutral-900 dark:text-neutral-100 capitalize">
                                  {action.connector}
                                </span>
                                <span className="text-neutral-400 dark:text-neutral-500">•</span>
                                <span className="truncate max-w-[280px] sm:max-w-md">{action.detail}</span>
                                {action.url && (
                                  <a
                                    href={action.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-1 inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline shrink-0"
                                  >
                                    Buka
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {msg.text ? (
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
                        ) : (
                          <div className="flex items-center text-xs sm:text-sm text-neutral-400 dark:text-neutral-500 font-normal pt-1 select-none animate-pulse">
                            Thinking...
                          </div>
                        )}
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
                    {/* Document Preview Card (PDF first page thumbnail or Word, Excel, ZIP, Text) */}
                    {msg.attachment && msg.attachment.type === "pdf" && msg.attachment.previewUrl ? (
                      <div
                        onClick={() => msg.attachment?.previewUrl && window.open(msg.attachment.previewUrl, "_blank")}
                        className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl border border-neutral-200 dark:border-neutral-700/80 bg-white dark:bg-neutral-900 overflow-hidden shadow-2xs cursor-pointer hover:opacity-90 transition-opacity"
                        title="Klik untuk melihat PDF"
                      >
                        <img
                          src={msg.attachment.previewUrl}
                          alt="PDF Page 1 preview"
                          className="w-full h-full object-cover object-top"
                        />
                        <div className="absolute bottom-1 left-1 z-10 pointer-events-none">
                          <span className="px-1 py-0.2 rounded text-[8px] font-bold tracking-wider bg-white/95 dark:bg-neutral-900/90 text-neutral-800 dark:text-neutral-200 border border-neutral-200/90 dark:border-neutral-700 shadow-2xs">
                            PDF
                          </span>
                        </div>
                      </div>
                    ) : msg.attachment && msg.attachment.type !== "image" ? (
                      <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xs max-w-[200px] sm:max-w-[240px]">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 text-[10px] font-bold"
                        >
                          {msg.attachment.type === "zip"
                            ? "ZIP"
                            : msg.attachment.type === "excel"
                            ? "XLS"
                            : msg.attachment.type === "word"
                            ? "DOC"
                            : "FILE"}
                        </div>
                        <div className="flex flex-col min-w-0 flex-1 text-left">
                          <span
                            title={msg.attachment.name}
                            className="text-[11px] font-semibold text-neutral-900 dark:text-neutral-100 truncate"
                          >
                            {truncateFileName(msg.attachment.name, 18)}
                          </span>
                          <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                            {msg.attachment.type.toUpperCase()} • {msg.attachment.size}
                          </span>
                        </div>
                      </div>
                    ) : null}

                    {/* Image Attachment (Compact aesthetic thumbnail) */}
                    {((msg.attachment?.type === "image" && msg.attachment.previewUrl) || msg.image) && (
                      <div
                        onClick={() => {
                          const src = msg.attachment?.previewUrl || msg.image;
                          if (src) window.open(src, "_blank");
                        }}
                        className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700/80 bg-neutral-50 dark:bg-neutral-900 shadow-2xs cursor-pointer hover:opacity-90 transition-opacity p-1 flex items-center justify-center"
                        title="Klik untuk melihat gambar penuh"
                      >
                        <img
                          src={msg.attachment?.previewUrl || msg.image}
                          alt="Uploaded attachment"
                          className="w-full h-full object-contain rounded-lg"
                        />
                      </div>
                    )}

                    {msg.text && (
                      <div className="bg-[#FFDE3C] text-neutral-950 dark:bg-[#141414] dark:text-neutral-100 dark:border dark:border-white/10 font-lora font-medium px-4 py-2.5 rounded-lg rounded-tr-xs shadow-xs text-sm sm:text-base leading-relaxed">
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            <div ref={chatBottomRef} />
          </div>

          {/* Sticky Bottom Floating Prompt Box with Claude-Style Gradient Mask */}
          <div
            className={`fixed bottom-0 left-0 right-0 z-30 pointer-events-none transition-[padding] duration-200 ${
              collapsed ? "lg:pl-[70px]" : "lg:pl-[238px]"
            }`}
          >
            {/* Claude-style top gradient fade mask: subtle, gentle dissolve right above the prompt box */}
            <div className="w-full h-7 sm:h-10 bg-gradient-to-t from-[#faf9f6] via-[#faf9f6]/30 to-transparent dark:from-[#090909] dark:via-[#090909]/30 dark:to-transparent pointer-events-none" />

            {/* Solid background dock behind prompt box: prevents any text from peeking underneath */}
            <div className="w-full bg-[#faf9f6] dark:bg-[#090909] pb-3 sm:pb-4 px-3 sm:px-4 pointer-events-auto">
              <div className="max-w-3xl mx-auto">
                <input
                  type="file"
                  ref={bottomFileInputRef}
                  accept="image/*,.pdf,.docx,.doc,.xlsx,.xls,.csv,.txt,.md,.zip,.tar,.gz,.rar,.7z"
                  className="hidden"
                  onChange={handleFileChange}
                />

                {/* Active Connectors Indicator Bar (Claude-style) */}
                {connectedList.length > 0 && (
                  <div className="flex items-center justify-between px-3 py-1 mb-1.5 rounded-lg bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xs border border-neutral-200/60 dark:border-white/5 text-[11px] text-neutral-500 dark:text-neutral-400">
                    <div className="flex items-center gap-1.5 overflow-x-auto clean-scrollbar">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 shrink-0">
                        Connectors:
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        {connectedList.map((c) => (
                          <span
                            key={c.id}
                            title={`${c.name} is active`}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium text-[10px]"
                          >
                            <img src={c.icon} alt={c.name} className="w-3 h-3 object-contain" />
                            <span>{c.name}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                    <Link
                      href="/settings"
                      className="ml-2 text-[10px] font-semibold text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 shrink-0 transition-colors"
                    >
                      Manage →
                    </Link>
                  </div>
                )}

                <form
                  onSubmit={handlePromptSubmit}
                  className="w-full bg-white dark:bg-[#141414] border border-neutral-200 dark:border-white/10 p-3 sm:p-4 flex flex-col gap-2.5 shadow-sm dark:shadow-2xl hover:border-neutral-300 dark:hover:border-white/20 transition-all rounded-2xl relative"
                >
                  {/* Attachment preview (Claude-style Exact Square Card) */}
                  {attachment && (
                    <ClaudeAttachmentCard
                      attachment={attachment}
                      onRemove={handleRemoveAttachment}
                    />
                  )}

                  <div className="flex items-end gap-2 pb-0.5">
                    <button
                      type="button"
                      onClick={() => bottomFileInputRef.current?.click()}
                      className="h-9 w-9 rounded-lg flex items-center justify-center text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer shrink-0 mb-0.5"
                      title="Attach File (PDF, Word, Excel, ZIP, Image)"
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
                      className="w-full bg-transparent border-none text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:ring-0 text-[15px] sm:text-base leading-relaxed outline-none resize-none min-h-[44px] max-h-[150px] font-lora py-2.5 clean-scrollbar"
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

                  <div className="flex items-center justify-between text-[11px] font-sans text-neutral-500 dark:text-neutral-400 pt-1 border-t border-neutral-100 dark:border-neutral-800">
                    <span className="text-[10px] sm:text-[11px] text-neutral-400 truncate">Mendukung PDF, Word, Excel, ZIP, Gambar</span>
                    <span className="hidden sm:inline">Press Enter to send, Shift+Enter for new line</span>
                  </div>
                </form>

                {/* Claude-style footer note */}
                <div className="flex items-center justify-center text-[10px] sm:text-[11px] font-sans text-neutral-400 dark:text-neutral-500 pt-2 px-1 text-center">
                  <span className="truncate">Launcher OS can make mistakes. Verify important responses.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Claude-style Drag & Drop Overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-50 pointer-events-none transition-all duration-200 flex items-center justify-center">
          {/* Soft blurred backdrop */}
          <div className="absolute inset-0 bg-white/80 dark:bg-[#141415]/85 backdrop-blur-xs" />

          {/* Launcher OS Inset Perimeter Border */}
          <div className="absolute inset-4 sm:inset-6 md:inset-8 border-2 border-[#E5BC10] dark:border-[#FFDE3C] rounded-2xl sm:rounded-3xl pointer-events-none shadow-[0_0_25px_rgba(229,188,16,0.18)]" />

          {/* Launcher OS Center Icon Cluster + Drop files here */}
          <div className="relative z-10 flex flex-col items-center justify-center select-none">
            <div className="flex items-center justify-center gap-1.5 mb-2.5 text-[#B89200] dark:text-[#FFDE3C]">
              <ImageIcon className="w-6 h-6 stroke-[1.8]" />
              <FileText className="w-7 h-7 stroke-[1.8] -mx-0.5" />
              <Folder className="w-6 h-6 stroke-[1.8]" />
            </div>
            <p className="text-base sm:text-lg font-semibold text-[#8C6D00] dark:text-[#FFDE3C] tracking-tight">
              Drop files here
            </p>
          </div>
        </div>
      )}
    </AppShell>
  );
}
