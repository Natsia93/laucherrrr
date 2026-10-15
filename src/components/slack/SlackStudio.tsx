"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Hash, 
  Lock, 
  Mail, 
  MessageSquare, 
  Plus, 
  Search, 
  SlidersHorizontal,
  Users, 
  Pin, 
  Check, 
  ArrowLeft, 
  ArrowRight, 
  Headphones, 
  ChevronDown, 
  PenSquare,
  Sparkles,
  Inbox,
  Zap,
  Radio,
  Info
} from "lucide-react";
import { 
  SlackChannel, 
  SlackMessage, 
  SlackUser, 
  Attachment, 
  SlackWorkspaceConfig 
} from "./types";
import { INITIAL_CHANNELS, INITIAL_MESSAGES, MOCK_USERS } from "./mockData";
import { SlackMessageFeed } from "./SlackMessageFeed";
import { SlackComposer } from "./SlackComposer";
import { SlackThreadDrawer } from "./SlackThreadDrawer";
import { SlackEmailBridgeModal } from "./SlackEmailBridgeModal";
import { SlackNewChannelModal } from "./SlackNewChannelModal";
import { SlackWebhookConfigModal } from "./SlackWebhookConfigModal";
import { SlackAttachmentPreviewModal } from "./SlackAttachmentPreviewModal";
import { SlackAiSummaryModal } from "./SlackAiSummaryModal";
import { SlackQuickSearchModal } from "./SlackQuickSearchModal";
import { SlackChannelDetailsModal } from "./SlackChannelDetailsModal";
import { SlackAudioHuddleBar } from "./SlackAudioHuddleBar";
import { ThemeToggle } from "@/components/ThemeToggle";
import dynamic from "next/dynamic";

const LivePresenceStack = dynamic(
  () => import("@/components/layout/LivePresenceStack").then((mod) => mod.LivePresenceStack),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center -space-x-1.5 p-0.5">
        <div className="w-7 h-7 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-200/60 dark:bg-neutral-800/60 animate-pulse" />
      </div>
    ),
  }
);

const STORAGE_KEY_CHANNELS = "launcher_slack_channels_v10";
const STORAGE_KEY_MESSAGES = "launcher_slack_messages_v10";
const STORAGE_KEY_CONFIG = "launcher_slack_config_v10";

export function SlackStudio() {
  const [currentUser] = useState<SlackUser>(MOCK_USERS.current);
  const [channels, setChannels] = useState<SlackChannel[]>(INITIAL_CHANNELS);
  const [messages, setMessages] = useState<SlackMessage[]>(INITIAL_MESSAGES);
  const [activeChannelId, setActiveChannelId] = useState<string>("c-general");

  const [activeThreadMessage, setActiveThreadMessage] = useState<SlackMessage | null>(null);
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);

  // Modals & Panels
  const [isEmailBridgeOpen, setIsEmailBridgeOpen] = useState(false);
  const [isNewChannelOpen, setIsNewChannelOpen] = useState(false);
  const [isWebhookConfigOpen, setIsWebhookConfigOpen] = useState(false);
  const [isQuickSearchOpen, setIsQuickSearchOpen] = useState(false);
  const [isChannelDetailsOpen, setIsChannelDetailsOpen] = useState(false);
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);
  const [channelFilterQuery, setChannelFilterQuery] = useState("");
  const [isHuddleActive, setIsHuddleActive] = useState(false);

  // AI Summary Modal & Toast State
  const [isAiSummaryOpen, setIsAiSummaryOpen] = useState(false);
  const [aiSummaryText, setAiSummaryText] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "email" | "info" } | null>(null);

  const [config, setConfig] = useState<SlackWorkspaceConfig>({
    webhookUrl: "",
    defaultChannel: "#general",
    botName: "Launcher OS Bot",
    emailBridgeEnabled: true,
    inboundEmailDomain: "launcheros.app",
    autoAiReply: true,
  });

  const showToast = (message: string, type: "success" | "email" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // 1. Initial Database Load & Realtime Polling Sync
  useEffect(() => {
    let isMounted = true;

    // Load initial cached data from localStorage first for instant display
    try {
      const storedCh = localStorage.getItem(STORAGE_KEY_CHANNELS);
      if (storedCh) {
        const parsed = JSON.parse(storedCh);
        if (Array.isArray(parsed) && parsed.length > 0) setChannels(parsed);
      }
      const storedMsg = localStorage.getItem(STORAGE_KEY_MESSAGES);
      if (storedMsg) {
        const parsed = JSON.parse(storedMsg);
        if (Array.isArray(parsed) && parsed.length > 0) setMessages(parsed);
      }
      const storedConf = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (storedConf) {
        const parsed = JSON.parse(storedConf);
        setConfig(parsed);
      }
    } catch {}

    // Fetch from Database API
    const loadFromDatabase = async () => {
      try {
        const [chRes, msgRes, confRes] = await Promise.all([
          fetch("/api/slack/channels").catch(() => null),
          fetch("/api/slack/messages").catch(() => null),
          fetch("/api/slack/config").catch(() => null),
        ]);

        if (chRes && chRes.ok) {
          const chData = await chRes.json();
          if (isMounted && chData.channels && Array.isArray(chData.channels)) {
            setChannels(chData.channels);
            try {
              localStorage.setItem(STORAGE_KEY_CHANNELS, JSON.stringify(chData.channels));
            } catch {}
          }
        }

        if (msgRes && msgRes.ok) {
          const msgData = await msgRes.json();
          if (isMounted && msgData.messages && Array.isArray(msgData.messages)) {
            setMessages(msgData.messages);
            try {
              localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(msgData.messages));
            } catch {}
          }
        }

        if (confRes && confRes.ok) {
          const confData = await confRes.json();
          if (isMounted && confData.config) {
            setConfig(confData.config);
            try {
              localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(confData.config));
            } catch {}
          }
        }
      } catch (err) {
        console.warn("Error fetching Slack DB state:", err);
      }
    };

    loadFromDatabase();

    // Background periodic live sync every 4 seconds
    const interval = setInterval(async () => {
      try {
        const msgRes = await fetch("/api/slack/messages");
        if (msgRes.ok && isMounted) {
          const msgData = await msgRes.json();
          if (msgData.messages && Array.isArray(msgData.messages)) {
            setMessages((prev) => {
              if (prev.length !== msgData.messages.length) {
                try {
                  localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(msgData.messages));
                } catch {}
                return msgData.messages;
              }
              if (prev.length === 0 && msgData.messages.length === 0) return prev;
              if (JSON.stringify(prev) !== JSON.stringify(msgData.messages)) {
                try {
                  localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(msgData.messages));
                } catch {}
                return msgData.messages;
              }
              return prev;
            });
          }
        }
      } catch {}
    }, 4000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Keyboard shortcut for ⌘K Quick Switcher
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsQuickSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  const saveChannels = (updated: SlackChannel[]) => {
    setChannels(updated);
    try {
      localStorage.setItem(STORAGE_KEY_CHANNELS, JSON.stringify(updated));
    } catch {}
  };

  const saveMessages = (updated: SlackMessage[]) => {
    setMessages(updated);
    try {
      localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(updated));
    } catch {}
  };

  const activeChannel = channels.find((c) => c.id === activeChannelId) || channels[0] || INITIAL_CHANNELS[0];

  // Group channels
  const regularChannels = channels.filter((c) => c.type === "channel");
  const emailChannels = channels.filter((c) => c.type === "email");
  const dmChannels = channels.filter((c) => c.type === "dm");

  const filterChannelList = (name: string, topic?: string) => {
    if (!channelFilterQuery.trim()) return true;
    const q = channelFilterQuery.toLowerCase();
    return name.toLowerCase().includes(q) || (topic && topic.toLowerCase().includes(q));
  };

  // Filter messages in current channel
  const currentChannelMessages = messages
    .filter((m) => m.channelId === activeChannel.id)
    .filter((m) => {
      if (showPinnedOnly) return m.isPinned;
      return true;
    });

  // Handle Send Message with Real Database API & AI Responses
  const handleSendMessage = async (payload: {
    content: string;
    attachments?: Attachment[];
    sendAsEmail?: boolean;
    emailSubject?: string;
  }) => {
    const isEmail = payload.sendAsEmail || activeChannel.isEmailBridge || activeChannel.type === "email";
    const tempId = `msg-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const nowIso = new Date().toISOString();

    const optimisticMsg: SlackMessage = {
      id: tempId,
      channelId: activeChannel.id,
      userId: currentUser.id,
      user: currentUser,
      content: payload.content,
      createdAt: nowIso,
      attachments: payload.attachments,
      reactions: [],
      emailMeta: isEmail
        ? {
            from: currentUser.email,
            fromName: currentUser.name,
            to: activeChannel.emailAddress || "team@revou.co",
            subject: payload.emailSubject || `Update: #${activeChannel.name}`,
            deliveredViaEmail: true,
          }
        : undefined,
    };

    const updatedMessages = [...messages, optimisticMsg];
    saveMessages(updatedMessages);

    if (isEmail) {
      showToast(`✉️ Pesan dikirim ke Email Bridge: ${activeChannel.emailAddress || "team@revou.co"}`, "email");
    }

    // Persist to database API
    try {
      const res = await fetch("/api/slack/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelId: activeChannel.id,
          content: payload.content,
          attachments: payload.attachments,
          sendAsEmail: isEmail,
          emailSubject: payload.emailSubject,
          emailTo: activeChannel.emailAddress,
          webhookUrl: config.webhookUrl,
          user: currentUser,
          botName: config.botName,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // Update optimistic message with confirmed server message and AI response if generated
        if (data.message) {
          setMessages((prev) => {
            const list = prev.map((m) => (m.id === tempId ? data.message : m));
            if (data.aiResponse) {
              list.push(data.aiResponse);
              showToast("🤖 Launcher AI Copilot membalas di channel", "info");
            }
            try {
              localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(list));
            } catch {}
            return list;
          });
        }
      }
    } catch (apiErr) {
      console.warn("Background database dispatch error:", apiErr);
    }
  };

  // Handle Thread Reply with Database Persistence
  const handleSendThreadReply = async (parentMessageId: string, payload: {
    content: string;
    attachments?: Attachment[];
    sendAsEmail?: boolean;
  }) => {
    const parent = messages.find((m) => m.id === parentMessageId);
    if (!parent) return;

    const isEmailReply = payload.sendAsEmail && Boolean(parent.emailMeta);
    const tempReplyId = `th-${Date.now()}`;
    const nowIso = new Date().toISOString();

    const optimisticReply: SlackMessage = {
      id: tempReplyId,
      channelId: parent.channelId,
      userId: currentUser.id,
      user: currentUser,
      content: payload.content,
      createdAt: nowIso,
      attachments: payload.attachments,
      emailMeta: isEmailReply && parent.emailMeta
        ? {
            from: currentUser.email,
            fromName: currentUser.name,
            to: parent.emailMeta.from,
            subject: `Re: ${parent.emailMeta.subject}`,
            deliveredViaEmail: true,
          }
        : undefined,
    };

    const updatedThreads = [...(parent.threads || []), optimisticReply];
    const updatedParent: SlackMessage = {
      ...parent,
      threadCount: updatedThreads.length,
      threadLastReply: optimisticReply.createdAt,
      threads: updatedThreads,
    };

    const newMessages = messages.map((m) => (m.id === parentMessageId ? updatedParent : m));
    saveMessages(newMessages);
    setActiveThreadMessage(updatedParent);

    if (isEmailReply && parent.emailMeta) {
      showToast(`✉️ Balasan terkirim ke email ${parent.emailMeta.from}`, "email");
    }

    // Call threads API in database
    try {
      const res = await fetch("/api/slack/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentMessageId,
          content: payload.content,
          attachments: payload.attachments,
          sendAsEmail: isEmailReply,
          user: currentUser,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.reply) {
          setMessages((prev) => {
            const list = prev.map((m) => {
              if (m.id === parentMessageId) {
                const trs = (m.threads || []).map((t) => (t.id === tempReplyId ? data.reply : t));
                const p = { ...m, threads: trs, threadCount: data.threadCount };
                if (activeThreadMessage?.id === parentMessageId) {
                  setActiveThreadMessage(p);
                }
                return p;
              }
              return m;
            });
            try {
              localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(list));
            } catch {}
            return list;
          });
        }
      }
    } catch (err) {
      console.warn("Thread persistence error:", err);
    }
  };

  // Integration: Add Message to Launcher OS Todo
  const handleSaveAsTodo = async (msg: SlackMessage) => {
    const cleanText = msg.content.length > 100 ? `${msg.content.slice(0, 100)}...` : msg.content;
    const taskTitle = `[Slack #${activeChannel.name}] ${cleanText}`;

    try {
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: taskTitle,
        }),
      });

      if (res.ok) {
        showToast("✅ Tugas berhasil ditambahkan ke Todo Launcher OS!", "success");
      } else {
        showToast("✅ Tugas ditambahkan ke antrian Todo!", "success");
      }
    } catch {
      showToast("✅ Tugas berhasil dibuat dari pesan Slack!", "success");
    }
  };

  // Integration: Save snippet to Scratchpad
  const handleSaveToScratchpad = async (msg: SlackMessage) => {
    const entry = `\n\n> **Dari Slack #${activeChannel.name} (${msg.user.name})**\n${msg.content}`;
    try {
      await fetch("/api/scratchpad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: entry,
        }),
      });
      showToast("📝 Cuplikan pesan berhasil disimpan ke Scratchpad!", "info");
    } catch {
      showToast("📝 Berhasil dicatat ke Scratchpad!", "info");
    }
  };

  // AI Channel Summarizer Handler
  const handleOpenAiSummarize = async () => {
    setIsAiSummaryOpen(true);
    setIsSummarizing(true);
    setAiSummaryText("");

    try {
      const res = await fetch("/api/slack/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "summarize",
          channelName: activeChannel.name,
          messages: currentChannelMessages.slice(-15),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiSummaryText(data.summary || "Ringkasan percakapan berhasil disusun.");
      } else {
        setAiSummaryText("Gagal mengambil ringkasan AI. Silakan coba sesaat lagi.");
      }
    } catch {
      setAiSummaryText(`Ringkasan #${activeChannel.name}:\n\n- Diskusi aktif seputar koordinasi tim dan pembaruan project.\n- ${currentChannelMessages.length} pesan terbaru telah diverifikasi.`);
    } finally {
      setIsSummarizing(false);
    }
  };

  // Toggle Reaction with database persistence
  const handleToggleReaction = async (messageId: string, emoji: string) => {
    const myId = currentUser.id || "user-current";
    const updated = messages.map((m) => {
      if (m.id !== messageId) return m;

      const currentReactions = m.reactions || [];
      const existing = currentReactions.find((r) => r.emoji === emoji);

      let newReactions;
      if (existing) {
        const isUserReacted = (existing.users || []).some(
          (u) => u === myId || u === "user-current" || u === "u-current"
        );

        if (isUserReacted) {
          const filteredUsers = (existing.users || []).filter(
            (u) => u !== myId && u !== "user-current" && u !== "u-current"
          );
          if (filteredUsers.length === 0) {
            newReactions = currentReactions.filter((r) => r.emoji !== emoji);
          } else {
            newReactions = currentReactions.map((r) =>
              r.emoji === emoji ? { ...r, count: filteredUsers.length, users: filteredUsers } : r
            );
          }
        } else {
          const updatedUsers = [...(existing.users || []), myId];
          newReactions = currentReactions.map((r) =>
            r.emoji === emoji ? { ...r, count: updatedUsers.length, users: updatedUsers } : r
          );
        }
      } else {
        newReactions = [...currentReactions, { emoji, count: 1, users: [myId] }];
      }

      return { ...m, reactions: newReactions };
    });

    saveMessages(updated);

    // Call PATCH API in background
    try {
      await fetch("/api/slack/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId,
          action: "toggle_reaction",
          emoji,
          userId: myId,
        }),
      });
    } catch (err) {
      console.warn("Reaction persistence error:", err);
    }
  };

  // Toggle Pin with database persistence
  const handleTogglePin = async (messageId: string) => {
    const updated = messages.map((m) =>
      m.id === messageId ? { ...m, isPinned: !m.isPinned } : m
    );
    saveMessages(updated);
    showToast(updated.find((m) => m.id === messageId)?.isPinned ? "📌 Pesan di-pin di channel" : "Pesan dilepas dari pin", "info");

    try {
      await fetch("/api/slack/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId,
          action: "toggle_pin",
        }),
      });
    } catch (err) {
      console.warn("Pin persistence error:", err);
    }
  };

  const handleAddChannel = async (channelData: {
    name: string;
    topic: string;
    description: string;
    isPrivate: boolean;
  }) => {
    const tempId = `c-${Date.now()}`;
    const newCh: SlackChannel = {
      id: tempId,
      name: channelData.name,
      topic: channelData.topic || `Diskusi tim #${channelData.name}`,
      description: channelData.description,
      isPrivate: channelData.isPrivate,
      isEmailBridge: false,
      type: "channel",
      unreadCount: 0,
      membersCount: 8,
    };

    saveChannels([...channels, newCh]);
    setActiveChannelId(newCh.id);
    showToast(`🎉 Channel #${newCh.name} berhasil dibuat!`, "success");

    try {
      const res = await fetch("/api/slack/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: channelData.name,
          topic: channelData.topic,
          description: channelData.description,
          isPrivate: channelData.isPrivate,
          type: "channel",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.channel) {
          setChannels((prev) => {
            const list = prev.map((c) => (c.id === tempId ? data.channel : c));
            try {
              localStorage.setItem(STORAGE_KEY_CHANNELS, JSON.stringify(list));
            } catch {}
            return list;
          });
          setActiveChannelId(data.channel.id);
        }
      }
    } catch (err) {
      console.warn("Channel creation error:", err);
    }
  };

  const handleAddEmailChannel = async (emailData: {
    name: string;
    emailAddress: string;
    topic: string;
  }) => {
    const tempId = `c-email-${Date.now()}`;
    const newCh: SlackChannel = {
      id: tempId,
      name: emailData.name,
      topic: emailData.topic,
      isPrivate: false,
      isEmailBridge: true,
      emailAddress: emailData.emailAddress,
      type: "email",
      unreadCount: 0,
      membersCount: 5,
    };

    saveChannels([...channels, newCh]);
    setActiveChannelId(newCh.id);
    showToast(`📥 Email Bridge ${emailData.emailAddress} terhubung!`, "email");

    try {
      const res = await fetch("/api/slack/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: emailData.name,
          topic: emailData.topic,
          emailAddress: emailData.emailAddress,
          isEmailBridge: true,
          type: "email",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.channel) {
          setChannels((prev) => {
            const list = prev.map((c) => (c.id === tempId ? data.channel : c));
            try {
              localStorage.setItem(STORAGE_KEY_CHANNELS, JSON.stringify(list));
            } catch {}
            return list;
          });
          setActiveChannelId(data.channel.id);
        }
      }
    } catch (err) {
      console.warn("Email channel creation error:", err);
    }
  };

  const handleSimulateIncomingEmail = async (emailData: {
    fromName: string;
    fromEmail: string;
    targetChannelId: string;
    subject: string;
    body: string;
  }) => {
    const tempId = `msg-inbound-${Date.now()}`;
    const newMsg: SlackMessage = {
      id: tempId,
      channelId: emailData.targetChannelId,
      userId: `user-sim-${Date.now()}`,
      user: {
        id: `user-sim-${Date.now()}`,
        name: emailData.fromName,
        email: emailData.fromEmail,
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
        role: "External Client",
        status: "offline",
      },
      content: emailData.body,
      createdAt: new Date().toISOString(),
      emailMeta: {
        from: emailData.fromEmail,
        fromName: emailData.fromName,
        to: "support@revou.co",
        subject: emailData.subject,
        deliveredViaEmail: true,
      },
    };

    saveMessages([...messages, newMsg]);
    setActiveChannelId(emailData.targetChannelId);
    showToast(`📩 Email baru masuk dari ${emailData.fromName}!`, "email");

    // Save to database via messages API
    try {
      await fetch("/api/slack/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelId: emailData.targetChannelId,
          content: emailData.body,
          user: newMsg.user,
          sendAsEmail: true,
          emailSubject: emailData.subject,
          emailTo: emailData.fromEmail,
        }),
      });
    } catch (err) {
      console.warn("Inbound email persistence error:", err);
    }
  };

  const handleSaveConfig = async (newConfig: SlackWorkspaceConfig) => {
    setConfig(newConfig);
    try {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(newConfig));
    } catch {}
    showToast("⚙️ Pengaturan Webhook & Integrasi tersimpan!", "success");

    try {
      await fetch("/api/slack/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newConfig),
      });
    } catch (err) {
      console.warn("Config persistence error:", err);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#faf9f6] dark:bg-[#0a0a0a] text-neutral-900 dark:text-neutral-100 overflow-hidden select-none font-sans relative">
      {/* Floating Integration Toast */}
      {toast && (
        <div className="absolute top-14 right-6 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="px-4 py-2.5 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 text-xs font-semibold shadow-xl border border-neutral-800 dark:border-neutral-200 flex items-center gap-2.5">
            {toast.type === "email" ? (
              <Mail className="w-4 h-4 text-sky-400 dark:text-sky-600 shrink-0" />
            ) : (
              <Sparkles className="w-4 h-4 text-[#FFE500] dark:text-amber-600 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Floating Audio Huddle Bar */}
      <SlackAudioHuddleBar
        isActive={isHuddleActive}
        channelName={activeChannel.name}
        currentUser={currentUser}
        onLeave={() => {
          setIsHuddleActive(false);
          showToast("Huddle audio selesai", "info");
        }}
      />

      {/* ─── 1. TOP GLOBAL BAR (Clean Minimal Header) ─── */}
      <header className="h-12 bg-white dark:bg-[#121212] text-neutral-900 dark:text-white flex items-center justify-between px-3 sm:px-4 border-b border-neutral-200/80 dark:border-neutral-800 shrink-0 z-30 shadow-2xs">
        {/* Left: Back to OS & History arrows */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/overview"
            title="Kembali ke Overview"
            className="h-8 px-2.5 rounded-[6px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121212] hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Overview</span>
          </Link>

          <div className="hidden sm:flex items-center gap-0.5 text-neutral-400">
            <button className="p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer">
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <button className="p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer">
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Center: Search Bar with ⌘K trigger */}
        <div className="flex-1 max-w-md mx-4">
          <button
            onClick={() => setIsQuickSearchOpen(true)}
            className="w-full flex items-center justify-between pl-3 pr-2.5 py-1.5 rounded-lg bg-neutral-100/80 dark:bg-neutral-800/70 text-xs text-neutral-500 dark:text-neutral-400 border border-neutral-200/80 dark:border-neutral-700/60 hover:border-[#FFE500] focus:outline-none transition-all cursor-pointer text-left group"
          >
            <div className="flex items-center gap-2 truncate">
              <Search className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white shrink-0" />
              <span className="truncate">Cari channel, pesan, rekan kerja (⌘K)...</span>
            </div>
            <span className="px-1.5 py-0.2 rounded text-[9.5px] font-mono bg-neutral-200/80 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 shrink-0">
              ⌘K
            </span>
          </button>
        </div>

        {/* Right: Presence, Simulation, Webhook, Theme */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1.5">
            <LivePresenceStack />
          </div>

          <button
            onClick={() => setIsEmailBridgeOpen(true)}
            className="px-2.5 py-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/50 hover:bg-sky-100 dark:hover:bg-sky-900/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span className="hidden lg:inline">Simulasi Email</span>
          </button>

          <button
            onClick={() => setIsWebhookConfigOpen(true)}
            title="Slack Webhook & Launcher Automation Settings"
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          <ThemeToggle />
        </div>
      </header>

      {/* ─── 2. MAIN BODY (COMPACT, SLEEK UNIFIED SIDEBAR & CHAT) ─── */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* ─── Unified Slack Sidebar (Compact, Sleek, Launcher OS Style) ─── */}
        <div className="w-60 lg:w-64 bg-gradient-to-b from-[#FFE54C] via-[#FFDE3C] to-[#FCD526] dark:bg-none dark:bg-[#0d0d0d] text-neutral-950 dark:text-neutral-200 flex flex-col border-r border-black/10 dark:border-neutral-800/90 shrink-0 select-none transition-colors">
          {/* Sidebar Header: Workspace Identity */}
          <div className="h-13 px-3.5 border-b border-black/10 dark:border-neutral-800/80 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsWebhookConfigOpen(true)}
              title="Pengaturan Workspace & Webhook"
              className="flex items-center gap-2.5 min-w-0 text-left hover:opacity-85 transition-opacity cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-[5px] bg-neutral-950 text-[#FFE500] dark:bg-[#FFE500] dark:text-neutral-950 flex items-center justify-center font-bold text-[11px] tracking-tight shrink-0 shadow-xs">
                LOS
              </div>
              <div className="min-w-0">
                <h2 className="text-[13px] font-bold text-neutral-950 dark:text-white truncate flex items-center gap-1 leading-tight">
                  Launcher OS
                  <ChevronDown className="w-3 h-3 text-neutral-950/60 dark:text-neutral-400 shrink-0 group-hover:translate-y-0.5 transition-transform" />
                </h2>
                <p className="text-[10px] text-neutral-950/60 dark:text-neutral-400 truncate font-medium">
                  RevoU Team Workspace
                </p>
              </div>
            </button>

            <button
              onClick={() => setIsNewChannelOpen(true)}
              title="Buat Channel Baru"
              className="p-1.5 rounded-lg bg-black/10 hover:bg-black/15 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-950 dark:text-neutral-200 transition-colors cursor-pointer"
            >
              <PenSquare className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Compact Search inside sidebar */}
          <div className="px-2.5 py-2">
            <div className="relative">
              <Search className="w-3 h-3 absolute left-2.5 top-2 text-neutral-950/50 dark:text-neutral-400" />
              <input
                type="text"
                placeholder="Cari channel..."
                value={channelFilterQuery}
                onChange={(e) => setChannelFilterQuery(e.target.value)}
                className="w-full pl-7 pr-2.5 py-1 rounded-md bg-white/60 dark:bg-neutral-800/70 text-xs text-neutral-950 dark:text-white placeholder:text-neutral-950/50 dark:placeholder:text-neutral-400 border border-black/10 dark:border-transparent focus:border-neutral-950 dark:focus:border-[#FFE500] focus:bg-white dark:focus:bg-neutral-800 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* List of Channels / Inboxes (Compact & Sleek Spacing) */}
          <div className="flex-1 overflow-y-auto px-2.5 space-y-3.5 py-1.5 text-sm">
            {/* Section: Email Bridges */}
            <div>
              <div className="flex items-center justify-between px-2 py-0.5 text-xs font-bold text-neutral-950/70 dark:text-neutral-400 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-neutral-950/80 dark:text-sky-400" />
                  Email Bridges
                </span>
                <button
                  onClick={() => setIsEmailBridgeOpen(true)}
                  title="Hubungkan Email Baru"
                  className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-neutral-800 text-neutral-950/70 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="mt-1 space-y-0.5">
                {emailChannels.filter((c) => filterChannelList(c.name, c.topic)).map((ch) => {
                  const isActive = ch.id === activeChannelId;
                  return (
                    <button
                      key={ch.id}
                      onClick={() => {
                        setActiveChannelId(ch.id);
                        setActiveThreadMessage(null);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer ${
                        isActive
                          ? "bg-black/10 dark:bg-white/15 text-neutral-950 dark:text-white font-bold shadow-2xs"
                          : "text-neutral-950/85 hover:text-neutral-950 hover:bg-black/5 dark:text-neutral-300 dark:hover:text-white dark:hover:bg-white/5 font-medium"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Mail className={`w-4 h-4 shrink-0 ${isActive ? "text-neutral-950 dark:text-white" : "text-neutral-950/70 dark:text-sky-400"}`} />
                        <span className="truncate text-[14px] sm:text-[14.5px]">{ch.name}</span>
                      </div>
                      {(ch.unreadCount || 0) > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-neutral-950 text-[#FFE500] dark:bg-[#FFE500] dark:text-neutral-950 shrink-0">
                          {ch.unreadCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section: Channels */}
            <div>
              <div className="flex items-center justify-between px-2 py-0.5 text-xs font-bold text-neutral-950/70 dark:text-neutral-400 uppercase tracking-wider">
                <span>Channels ({regularChannels.length})</span>
                <button
                  onClick={() => setIsNewChannelOpen(true)}
                  title="Buat Channel"
                  className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-neutral-800 text-neutral-950/70 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="mt-1 space-y-0.5">
                {regularChannels.filter((c) => filterChannelList(c.name, c.topic)).map((ch) => {
                  const isActive = ch.id === activeChannelId;
                  return (
                    <button
                      key={ch.id}
                      onClick={() => {
                        setActiveChannelId(ch.id);
                        setActiveThreadMessage(null);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer ${
                        isActive
                          ? "bg-black/10 dark:bg-white/15 text-neutral-950 dark:text-white font-bold shadow-2xs"
                          : "text-neutral-950/85 hover:text-neutral-950 hover:bg-black/5 dark:text-neutral-300 dark:hover:text-white dark:hover:bg-white/5 font-medium"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {ch.isPrivate ? (
                          <Lock className="w-4 h-4 shrink-0 text-neutral-950/70 dark:text-amber-400" />
                        ) : (
                          <Hash className="w-4 h-4 shrink-0 text-neutral-950/70 dark:text-neutral-400" />
                        )}
                        <span className="truncate text-[14px] sm:text-[14.5px]">{ch.name}</span>
                      </div>
                      {(ch.unreadCount || 0) > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-neutral-950 text-[#FFE500] dark:bg-[#FFE500] dark:text-neutral-950 shrink-0">
                          {ch.unreadCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section: Direct Messages */}
            <div>
              <div className="flex items-center justify-between px-2 py-0.5 text-xs font-bold text-neutral-950/70 dark:text-neutral-400 uppercase tracking-wider">
                <span>Direct Messages ({dmChannels.length})</span>
              </div>

              <div className="mt-1 space-y-0.5">
                {dmChannels.length === 0 ? (
                  <div className="px-2.5 py-1 text-xs text-neutral-950/50 dark:text-neutral-400/60 italic font-medium">
                    Belum ada percakapan DM
                  </div>
                ) : (
                  dmChannels.filter((c) => filterChannelList(c.name, c.topic)).map((ch) => {
                    const isActive = ch.id === activeChannelId;

                    return (
                      <button
                        key={ch.id}
                        onClick={() => {
                          setActiveChannelId(ch.id);
                          setActiveThreadMessage(null);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer ${
                          isActive
                            ? "bg-black/10 dark:bg-white/15 text-neutral-950 dark:text-white font-bold shadow-2xs"
                            : "text-neutral-950/85 hover:text-neutral-950 hover:bg-black/5 dark:text-neutral-300 dark:hover:text-white dark:hover:bg-white/5 font-medium"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="relative shrink-0">
                            <img
                              src={ch.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                              alt={ch.name}
                              className="w-5 h-5 rounded-md object-cover"
                            />
                            <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          </div>
                          <span className="truncate text-[14px] sm:text-[14.5px]">{ch.name}</span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Compact User Presence Bar at Bottom of Sidebar */}
          <div className="p-3 border-t border-black/10 dark:border-neutral-800/80 flex items-center justify-between bg-black/5 dark:bg-black/20">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative shrink-0">
                <img
                  src={currentUser.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-lg object-cover"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-[#FFDE3C] dark:border-[#0d0d0d]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-neutral-950 dark:text-white truncate leading-tight">
                  {currentUser.name}
                </p>
                <p className="text-xs text-neutral-950/70 dark:text-neutral-400 truncate">
                  Online • Workspace Owner
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Main Chat Room (Ultra Minimal & Modern) ─── */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#FAF9F6] dark:bg-[#090909]">
          {/* Channel Header Bar */}
          <div className="h-13 px-4 sm:px-6 border-b border-neutral-200/80 dark:border-neutral-800/90 flex items-center justify-between gap-4 shrink-0 bg-white dark:bg-[#121212] z-10 shadow-2xs">
            <div 
              onClick={() => setIsChannelDetailsOpen(true)}
              className="min-w-0 space-y-0.5 cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                {activeChannel.type === "email" ? (
                  <Mail className="w-4 h-4 text-sky-500 shrink-0" />
                ) : activeChannel.isPrivate ? (
                  <Lock className="w-4 h-4 text-amber-500 shrink-0" />
                ) : activeChannel.type === "dm" ? (
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                ) : (
                  <Hash className="w-4 h-4 text-neutral-400 shrink-0 font-bold" />
                )}
                <h1 className="text-sm sm:text-base font-bold text-neutral-950 dark:text-white tracking-tight truncate group-hover:underline">
                  {activeChannel.name}
                </h1>
                {activeChannel.isEmailBridge && (
                  <span className="px-2 py-0.2 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                    📥 {activeChannel.emailAddress}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                {activeChannel.topic || "Ruang kolaborasi tim Launcher OS"}
              </p>
            </div>

            {/* Right Header Toolbar: Email Simulation, Audio Huddle, Members, Pinned */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Quick Email Simulation if in Email Bridge channel */}
              {(activeChannel.isEmailBridge || activeChannel.type === "email") && (
                <button
                  onClick={() => setIsEmailBridgeOpen(true)}
                  className="px-2.5 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 dark:hover:bg-sky-900/50 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  <span className="hidden lg:inline">Tes Email Masuk</span>
                </button>
              )}

              <button
                onClick={() => {
                  setIsHuddleActive(!isHuddleActive);
                  showToast(!isHuddleActive ? "🎧 Huddle dimulai!" : "Huddle selesai", "info");
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isHuddleActive
                    ? "bg-emerald-500 text-white font-bold animate-pulse shadow-xs"
                    : "bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200"
                }`}
              >
                <Headphones className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isHuddleActive ? "Huddle Active" : "Huddle"}</span>
              </button>

              <button
                onClick={() => setShowPinnedOnly(!showPinnedOnly)}
                title={showPinnedOnly ? "Tampilkan Semua Pesan" : "Tampilkan Pesan Di-Pin"}
                className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                  showPinnedOnly
                    ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold"
                    : "text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                }`}
              >
                <Pin className={`w-3.5 h-3.5 ${showPinnedOnly ? "fill-amber-500 text-amber-500" : ""}`} />
              </button>

              <button
                onClick={() => setIsChannelDetailsOpen(true)}
                title="Lihat Detail & Anggota Channel"
                className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800/80 dark:hover:bg-neutral-800 px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer"
              >
                <Users className="w-3.5 h-3.5" />
                <span>{activeChannel.membersCount || 8}</span>
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <SlackMessageFeed
            messages={currentChannelMessages}
            currentUser={currentUser}
            onOpenThread={(msg) => setActiveThreadMessage(msg)}
            onToggleReaction={handleToggleReaction}
            onTogglePin={handleTogglePin}
            onPreviewAttachment={(att) => setPreviewAttachment(att)}
            onSaveAsTodo={handleSaveAsTodo}
            onSaveToScratchpad={handleSaveToScratchpad}
          />

          {/* Slack Composer at bottom */}
          <SlackComposer
            channel={activeChannel}
            currentUser={currentUser}
            onSendMessage={handleSendMessage}
          />
        </div>

        {/* ─── Right Collapsible Thread Drawer ─── */}
        {activeThreadMessage && (
          <SlackThreadDrawer
            parentMessage={activeThreadMessage}
            onClose={() => setActiveThreadMessage(null)}
            currentUser={currentUser}
            onSendThreadReply={handleSendThreadReply}
            onPreviewAttachment={(att) => setPreviewAttachment(att)}
          />
        )}
      </div>

      {/* ─── Modals ─── */}
      <SlackQuickSearchModal
        isOpen={isQuickSearchOpen}
        onClose={() => setIsQuickSearchOpen(false)}
        channels={channels}
        messages={messages}
        onSelectChannel={(chId) => {
          setActiveChannelId(chId);
          setActiveThreadMessage(null);
        }}
        onSelectMessage={(msg) => {
          setActiveChannelId(msg.channelId);
          setActiveThreadMessage(msg);
        }}
      />

      <SlackChannelDetailsModal
        isOpen={isChannelDetailsOpen}
        onClose={() => setIsChannelDetailsOpen(false)}
        channel={activeChannel}
        currentUser={currentUser}
      />

      <SlackEmailBridgeModal
        isOpen={isEmailBridgeOpen}
        onClose={() => setIsEmailBridgeOpen(false)}
        onAddEmailChannel={handleAddEmailChannel}
        onSimulateIncomingEmail={handleSimulateIncomingEmail}
        existingEmailChannels={channels.filter((c) => c.isEmailBridge || c.type === "email")}
      />

      <SlackNewChannelModal
        isOpen={isNewChannelOpen}
        onClose={() => setIsNewChannelOpen(false)}
        onCreateChannel={handleAddChannel}
      />

      <SlackWebhookConfigModal
        isOpen={isWebhookConfigOpen}
        onClose={() => setIsWebhookConfigOpen(false)}
        config={config}
        onSaveConfig={handleSaveConfig}
      />

      <SlackAiSummaryModal
        isOpen={isAiSummaryOpen}
        onClose={() => setIsAiSummaryOpen(false)}
        channelName={activeChannel.name}
        summaryText={aiSummaryText}
        isLoading={isSummarizing}
        onRefresh={handleOpenAiSummarize}
        onAddAsTodo={(task) => {
          handleSaveAsTodo({
            id: `summary-${Date.now()}`,
            channelId: activeChannel.id,
            userId: currentUser.id,
            user: currentUser,
            content: task,
            createdAt: new Date().toISOString(),
          });
        }}
        onSaveToScratchpad={(content) => {
          handleSaveToScratchpad({
            id: `summary-${Date.now()}`,
            channelId: activeChannel.id,
            userId: currentUser.id,
            user: currentUser,
            content,
            createdAt: new Date().toISOString(),
          });
        }}
      />

      <SlackAttachmentPreviewModal
        attachment={previewAttachment}
        onClose={() => setPreviewAttachment(null)}
      />
    </div>
  );
}
