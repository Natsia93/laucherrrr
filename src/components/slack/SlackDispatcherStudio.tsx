"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import {
  Send,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Hash,
  ArrowRight,
  Settings,
  X,
  Eye,
  EyeOff,
  ExternalLink,
  HelpCircle,
  ShieldCheck,
  SlidersHorizontal
} from "lucide-react";

interface DispatchHistoryItem {
  id: string;
  title: string;
  text: string;
  category: "custom" | "daily_agenda" | "ai_digest" | "deck_share" | "task_update";
  channel: string;
  sentAt: string;
}

export function SlackDispatcherStudio() {
  const [mounted, setMounted] = useState(false);

  // Webhook & Config state initialized with instant local cache (no flicker)
  const [webhookUrl, setWebhookUrl] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem("launcher_slack_webhook_url") || "";
      } catch {
        return "";
      }
    }
    return "";
  });
  const [defaultChannel, setDefaultChannel] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem("launcher_slack_default_channel") || "#general";
      } catch {
        return "#general";
      }
    }
    return "#general";
  });
  const [botName, setBotName] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem("launcher_slack_bot_name") || "Launcher OS Bot";
      } catch {
        return "Launcher OS Bot";
      }
    }
    return "Launcher OS Bot";
  });
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);

  // Configuration Modal state
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [tempWebhookUrl, setTempWebhookUrl] = useState("");
  const [tempChannel, setTempChannel] = useState("#general");
  const [tempBotName, setTempBotName] = useState("Launcher OS Bot");
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  const [showWebhookGuide, setShowWebhookGuide] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Keyboard shortcut: Escape to close modal (matches MoodCheck behavior)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isConfigModalOpen && !isSavingConfig) {
        setIsConfigModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isConfigModalOpen, isSavingConfig]);

  // Composer state
  const [category, setCategory] = useState<
    "custom" | "daily_agenda" | "ai_digest" | "deck_share" | "task_update"
  >("custom");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetChannel, setTargetChannel] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem("launcher_slack_default_channel") || "#general";
      } catch {
        return "#general";
      }
    }
    return "#general";
  });
  const [mention, setMention] = useState<"none" | "here" | "channel">("none");

  // Dispatch state
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchStatus, setDispatchStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // History state with instant cache
  const [history, setHistory] = useState<DispatchHistoryItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("launcher_slack_dispatch_history");
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  // Fetch saved config from /api/slack/config on mount
  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch("/api/slack/config");
        if (res.ok) {
          const data = await res.json();
          if (data?.config) {
            const url = data.config.webhookUrl || "";
            const ch = data.config.defaultChannel || "#general";
            const bot = data.config.botName || "Launcher OS Bot";
            
            setWebhookUrl(url);
            setTempWebhookUrl(url);

            setDefaultChannel(ch);
            setTargetChannel(ch);
            setTempChannel(ch);

            setBotName(bot);
            setTempBotName(bot);

            // Keep local cache synced
            try {
              localStorage.setItem("launcher_slack_webhook_url", url);
              localStorage.setItem("launcher_slack_default_channel", ch);
              localStorage.setItem("launcher_slack_bot_name", bot);
            } catch {}
          }
        }
      } catch (err) {
        console.warn("Could not fetch Slack config:", err);
      } finally {
        setIsConfigLoaded(true);
      }
    }

    fetchConfig();
  }, []);

  // Open config modal with current values
  const openConfigModal = () => {
    setTempWebhookUrl(webhookUrl);
    setTempChannel(defaultChannel);
    setTempBotName(botName);
    setIsConfigModalOpen(true);
  };

  // Save configuration directly to /api/slack/config
  const handleSaveConfig = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingConfig(true);
    setDispatchStatus(null);

    try {
      const res = await fetch("/api/slack/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          webhookUrl: tempWebhookUrl.trim(),
          defaultChannel: tempChannel.trim() || "#general",
          botName: tempBotName.trim() || "Launcher OS Bot",
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setWebhookUrl(tempWebhookUrl.trim());
        setDefaultChannel(tempChannel.trim() || "#general");
        setTargetChannel(tempChannel.trim() || "#general");
        setBotName(tempBotName.trim() || "Launcher OS Bot");

        try {
          localStorage.setItem("launcher_slack_webhook_url", tempWebhookUrl.trim());
          localStorage.setItem("launcher_slack_default_channel", tempChannel.trim() || "#general");
          localStorage.setItem("launcher_slack_bot_name", tempBotName.trim() || "Launcher OS Bot");
        } catch {}

        setIsConfigModalOpen(false);
        setDispatchStatus({
          type: "success",
          message: "Slack Webhook configuration saved successfully.",
        });
      } else {
        setDispatchStatus({
          type: "error",
          message: data?.error || "Failed to save configuration.",
        });
      }
    } catch (err: any) {
      setDispatchStatus({
        type: "error",
        message: err?.message || "Failed to connect to server.",
      });
    } finally {
      setIsSavingConfig(false);
    }
  };

  // Dispatch message to Slack
  const handleDispatch = async () => {
    if (!message.trim()) {
      setDispatchStatus({
        type: "error",
        message: "Please enter a message before dispatching.",
      });
      return;
    }

    if (!webhookUrl) {
      openConfigModal();
      setDispatchStatus({
        type: "error",
        message: "Please configure your Slack Webhook URL first.",
      });
      return;
    }

    setIsDispatching(true);
    setDispatchStatus(null);

    try {
      const res = await fetch("/api/slack/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          webhookUrl: webhookUrl || undefined,
          title: title.trim() || undefined,
          text: message,
          category,
          channel: targetChannel || defaultChannel,
          mention,
          botName,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setDispatchStatus({
          type: "success",
          message: `Message dispatched successfully to ${targetChannel || defaultChannel}.`,
        });

        const newHistoryItem: DispatchHistoryItem = {
          id: `disp-${Date.now()}`,
          title: title || "Direct Message",
          text: message,
          category,
          channel: targetChannel || defaultChannel,
          sentAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        const updatedHistory = [newHistoryItem, ...history.slice(0, 14)];
        setHistory(updatedHistory);
        try {
          localStorage.setItem("launcher_slack_dispatch_history", JSON.stringify(updatedHistory));
        } catch {}
      } else {
        setDispatchStatus({
          type: "error",
          message: data?.error || "Failed to dispatch message to Slack.",
        });
      }
    } catch (err: any) {
      setDispatchStatus({
        type: "error",
        message: err?.message || "Network error while contacting Slack.",
      });
    } finally {
      setIsDispatching(false);
    }
  };

  // Quick Test Ping
  const handleTestPing = async () => {
    if (!webhookUrl) {
      openConfigModal();
      setDispatchStatus({
        type: "error",
        message: "Webhook URL is not configured. Please enter your Webhook URL below.",
      });
      return;
    }

    setIsDispatching(true);
    setDispatchStatus(null);

    try {
      const res = await fetch("/api/slack/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          webhookUrl,
          title: "Launcher OS Connection Test",
          text: "Slack Dispatcher connection active and operational for automated broadcasts.",
          category: "custom",
          channel: targetChannel || defaultChannel,
          botName,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDispatchStatus({
          type: "success",
          message: "Test ping delivered successfully to your Slack channel.",
        });
      } else {
        setDispatchStatus({
          type: "error",
          message: data?.error || "Test ping was rejected by Slack.",
        });
      }
    } catch (err: any) {
      setDispatchStatus({
        type: "error",
        message: err?.message || "Connection failed.",
      });
    } finally {
      setIsDispatching(false);
    }
  };

  // Preset Loaders (English, Without Emojis)
  const loadPreset = (presetType: "daily_agenda" | "ai_digest" | "task_update" | "deck_share") => {
    setCategory(presetType);

    if (presetType === "daily_agenda") {
      setTitle("Daily Agenda & Standup Briefing");
      setMessage(
        "Today's Schedule & Key Agenda:\n• 10:00 AM - Daily Standup & Sprint Sync\n• 01:30 PM - Client Deck Review & Finalization\n• 04:00 PM - Executive Mentoring Session\n\nNote: Please submit blockers before 12:00 PM."
      );
    } else if (presetType === "ai_digest") {
      setTitle("Executive AI Synthesis");
      setMessage(
        "Executive AI Summary & Analysis Highlights:\n• System architecture optimized with precision typography\n• Load-time performance improved with reduced client simulation overhead\n• Recommendation: Deploy changes to staging prior to final sign-off"
      );
    } else if (presetType === "task_update") {
      setTitle("Sprint To-Do Progress Update");
      setMessage(
        "Today's Priority Task Status:\n[Completed] Finalize Curriculum Presentation Deck\n[In Progress] Review Webhook Dispatcher Integration\n[Queued] Sync Google Calendar data with team agenda\n\nTarget completion: 06:00 PM."
      );
    } else if (presetType === "deck_share") {
      setTitle("New Presentation Deck Released");
      setMessage(
        "New Presentation Deck Ready for Review:\n• Title: Executive Deck - Curriculum Roadmap\n• Format: 16:9 Standard RevoU × ITB Template\n• Access: Ready for export in PowerPoint (.pptx) & PDF\n\nPlease review and provide feedback in this thread."
      );
    }
  };

  const isConnected = Boolean(webhookUrl && webhookUrl.startsWith("https://hooks.slack.com/"));

  return (
    <AppShell>
      <div className="max-w-[1200px] mx-auto px-2 sm:px-4 lg:px-6 space-y-6 pb-28 sm:pb-12 font-sans">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-2 border-b border-neutral-200/60 dark:border-neutral-800/60">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-lora font-normal sm:font-medium tracking-tight text-neutral-950 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-b dark:from-white dark:via-neutral-200 dark:to-neutral-400/90 leading-tight">
              Slack Dispatcher
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 font-normal max-w-xl leading-relaxed">
              Broadcast executive summaries, daily standups, and document releases directly to your team&apos;s Slack channels.
            </p>
          </div>

          {/* Action & Status Group */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={openConfigModal}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium border border-neutral-200/80 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 text-neutral-600 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors cursor-pointer"
              title="Click to configure Slack Webhook"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isConnected ? "bg-emerald-500" : "bg-neutral-400 dark:bg-neutral-600"
                }`}
              />
              <span>{isConnected ? `Connected (${defaultChannel})` : "Not Configured"}</span>
            </button>

            <button
              onClick={handleTestPing}
              disabled={isDispatching}
              className="px-3.5 py-1.5 rounded-md text-xs font-medium border border-neutral-200/80 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer disabled:opacity-50"
            >
              Test Ping
            </button>

            <button
              onClick={openConfigModal}
              className="px-3.5 py-1.5 rounded-md text-xs font-medium border border-neutral-200/80 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-neutral-500" />
              <span>Configure</span>
            </button>
          </div>
        </div>

        {/* NOTIFICATION FEEDBACK BANNER */}
        {dispatchStatus && (
          <div
            className={`p-4 rounded-md text-xs sm:text-sm font-normal flex items-center justify-between border transition-all ${
              dispatchStatus.type === "success"
                ? "bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100"
                : "bg-red-500/5 border-red-500/20 text-red-600 dark:text-red-400"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {dispatchStatus.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-neutral-700 dark:text-neutral-300" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
              )}
              <span>{dispatchStatus.message}</span>
            </div>
            <button
              onClick={() => setDispatchStatus(null)}
              className="text-xs text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 2. MASTER CARDS WRAPPER (TANPA ROUNDED - POLOS) SEPERTI DI OVERVIEW */}
        <div className="border border-neutral-200/50 dark:border-neutral-800/80 rounded-none bg-neutral-50/30 dark:bg-[#0d0d0d]/60 p-4 sm:p-6 lg:p-7 space-y-6 shadow-none">

          {/* PRESET SEGMENTED CONTROLS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                Quick Templates
              </span>
              <span className="text-xs text-neutral-400">Select a template to prefill draft</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => loadPreset("daily_agenda")}
                className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer border ${
                  category === "daily_agenda"
                    ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 border-transparent shadow-xs"
                    : "bg-white dark:bg-neutral-900/70 text-neutral-600 dark:text-neutral-300 border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
                }`}
              >
                Daily Standup
              </button>

              <button
                type="button"
                onClick={() => loadPreset("ai_digest")}
                className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer border ${
                  category === "ai_digest"
                    ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 border-transparent shadow-xs"
                    : "bg-white dark:bg-neutral-900/70 text-neutral-600 dark:text-neutral-300 border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
                }`}
              >
                Executive Digest
              </button>

              <button
                type="button"
                onClick={() => loadPreset("task_update")}
                className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer border ${
                  category === "task_update"
                    ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 border-transparent shadow-xs"
                    : "bg-white dark:bg-neutral-900/70 text-neutral-600 dark:text-neutral-300 border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
                }`}
              >
                Sprint Tasks
              </button>

              <button
                type="button"
                onClick={() => loadPreset("deck_share")}
                className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer border ${
                  category === "deck_share"
                    ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 border-transparent shadow-xs"
                    : "bg-white dark:bg-neutral-900/70 text-neutral-600 dark:text-neutral-300 border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
                }`}
              >
                Deck Release
              </button>

              <button
                type="button"
                onClick={() => {
                  setCategory("custom");
                  setTitle("");
                  setMessage("");
                }}
                className="px-3 py-1.5 rounded-md text-xs font-normal text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>

          {/* SECTION DIVIDER LINE */}
          <div className="h-[1px] w-full bg-neutral-200/50 dark:bg-neutral-800/80" />

          {/* WORKSPACE LAYOUT: COMPOSER (7) & LIVE PREVIEW (5) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* COMPOSER (LEFT) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="p-5 sm:p-6 rounded-md border border-neutral-200/50 dark:border-neutral-800 bg-white dark:bg-[#121212] space-y-5 shadow-none">
                
                {/* Card Header & Mention Toggle */}
                <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800/70">
                  <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                    Draft Message
                  </span>
                  
                  {/* Monochrome Mention Segment */}
                  <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800/80 p-0.5 rounded-md text-xs">
                    <button
                      type="button"
                      onClick={() => setMention("none")}
                      className={`px-2.5 py-1 rounded-sm transition-all cursor-pointer ${
                        mention === "none"
                          ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white font-medium shadow-2xs"
                          : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                      }`}
                    >
                      None
                    </button>
                    <button
                      type="button"
                      onClick={() => setMention("here")}
                      className={`px-2.5 py-1 rounded-sm transition-all cursor-pointer ${
                        mention === "here"
                          ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white font-medium shadow-2xs"
                          : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                      }`}
                    >
                      @here
                    </button>
                    <button
                      type="button"
                      onClick={() => setMention("channel")}
                      className={`px-2.5 py-1 rounded-sm transition-all cursor-pointer ${
                        mention === "channel"
                          ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white font-medium shadow-2xs"
                          : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                      }`}
                    >
                      @channel
                    </button>
                  </div>
                </div>

                {/* Title Field */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                    Header Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Daily Standup, Sprint Update..."
                    className="w-full h-10 px-3.5 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 transition-colors"
                  />
                </div>

                {/* Message Content */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                      Message Content (Supports Slack Markdown: *bold*, _italic_, • lists)
                    </label>
                    <span className="text-[11px] text-neutral-400">
                      {message.length} characters
                    </span>
                  </div>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={9}
                    placeholder="Compose your message, update, or executive briefing here..."
                    className="w-full p-3.5 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 transition-colors resize-y leading-relaxed font-sans"
                  />
                </div>

                {/* Footer Actions */}
                <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-neutral-100 dark:border-neutral-800/70">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-400">Channel:</span>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700 text-xs font-medium text-neutral-700 dark:text-neutral-300 font-mono">
                      <Hash className="w-3.5 h-3.5 text-neutral-400" />
                      <input
                        type="text"
                        value={targetChannel}
                        onChange={(e) => setTargetChannel(e.target.value)}
                        placeholder="#general"
                        className="w-24 bg-transparent outline-none text-xs font-medium font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setTitle("");
                        setMessage("");
                      }}
                      className="px-3 py-2 text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
                    >
                      Clear
                    </button>

                    <button
                      type="button"
                      onClick={handleDispatch}
                      disabled={isDispatching || !message.trim()}
                      className="px-6 py-2.5 rounded-md bg-neutral-950 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-neutral-950 text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer disabled:opacity-40"
                    >
                      {isDispatching ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Dispatching...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Send to Slack</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>

              {/* RECENT DISPATCHES HISTORY */}
              {history.length > 0 && (
                <div className="p-5 rounded-md border border-neutral-200/50 dark:border-neutral-800 bg-white dark:bg-[#121212] space-y-4 shadow-none">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800/70">
                    <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                      Dispatch History
                    </span>
                    <button
                      onClick={() => {
                        setHistory([]);
                        localStorage.removeItem("launcher_slack_dispatch_history");
                      }}
                      className="text-[11px] text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>

                  <div className="divide-y divide-neutral-100 dark:divide-neutral-800/70">
                    {history.slice(0, 4).map((item) => (
                      <div key={item.id} className="py-3 flex items-start justify-between gap-4 text-xs">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-neutral-900 dark:text-white truncate">
                              {item.title || "Untitled Dispatch"}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-neutral-100 dark:bg-neutral-800 text-neutral-500 font-mono">
                              {item.channel}
                            </span>
                          </div>
                          <p className="text-neutral-500 dark:text-neutral-400 line-clamp-1 leading-relaxed">
                            {item.text}
                          </p>
                        </div>
                        <span className="text-[11px] text-neutral-400 shrink-0 font-mono">
                          {item.sentAt}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* LIVE PREVIEW (RIGHT) */}
            <div className="lg:col-span-5 space-y-5">
              
              <div className="p-5 sm:p-6 rounded-md border border-neutral-200/50 dark:border-neutral-800 bg-white dark:bg-[#121212] space-y-4 shadow-none">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800/70">
                  <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                    Slack Live Preview
                  </span>
                  <span className="text-[11px] font-mono text-neutral-400">
                    {targetChannel || defaultChannel}
                  </span>
                </div>

                {/* Realistic Slack Message Card */}
                <div className="p-4 sm:p-5 rounded-md bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800/60 font-sans space-y-2.5">
                  <div className="flex items-start gap-3">
                    {/* Clean Bot Monogram Avatar (No Emojis) */}
                    <div className="w-8 h-8 rounded-md bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center font-semibold text-xs shrink-0">
                      L
                    </div>
                    <div className="min-w-0 flex-1 space-y-1.5">
                      {/* Bot Name & Tag Header */}
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-bold text-neutral-900 dark:text-white">
                          {botName || "Launcher OS Bot"}
                        </span>
                        <span className="px-1.5 py-0.5 bg-neutral-200/70 dark:bg-neutral-800 rounded-sm text-[10px] font-medium text-neutral-600 dark:text-neutral-400">
                          App
                        </span>
                        <span className="text-[10px] text-neutral-400">
                          {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>

                      {/* Header */}
                      {title && (
                        <h4 className="text-xs font-bold text-neutral-950 dark:text-white tracking-tight pt-0.5">
                          {title}
                        </h4>
                      )}

                      {/* Markdown Body */}
                      <div className="text-xs text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed space-y-1">
                        {mention === "here" && (
                          <span className="bg-neutral-200 dark:bg-neutral-800 px-1 py-0.5 rounded-sm font-mono text-[11px] text-neutral-900 dark:text-white mr-1.5">
                            @here
                          </span>
                        )}
                        {mention === "channel" && (
                          <span className="bg-neutral-200 dark:bg-neutral-800 px-1 py-0.5 rounded-sm font-mono text-[11px] text-neutral-900 dark:text-white mr-1.5">
                            @channel
                          </span>
                        )}
                        {message || <span className="text-neutral-400 italic">Preview of your message will appear here...</span>}
                      </div>

                      {/* Footer Context */}
                      <div className="pt-2 mt-2 border-t border-neutral-200/60 dark:border-neutral-800/60 text-[10px] text-neutral-400 flex items-center justify-between">
                        <span>Dispatched via Launcher OS</span>
                        <span>Now</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* DIRECT CONFIGURATION TRIGGER CARD */}
              <div className="p-5 rounded-md border border-neutral-200/50 dark:border-neutral-800 bg-white dark:bg-[#121212] flex items-center justify-between gap-4 shadow-none">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-medium text-neutral-900 dark:text-white flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-500" />
                    Webhook Configuration
                  </h4>
                  <p className="text-[11px] text-neutral-400">
                    {isConnected ? `Configured for ${defaultChannel}` : "Incoming Webhook URL not set"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openConfigModal}
                  className="px-3.5 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-300 transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <span>Configure</span>
                  <ArrowRight className="w-3 h-3 text-neutral-400" />
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* DEDICATED SLACK CONFIGURATION MODAL (EXACT MOODCHECK ANIMATION) */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {isConfigModalOpen && (
              <motion.div
                key="slack-config-modal-container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.25 } }}
                className="fixed inset-0 z-[99999999] flex items-center justify-center p-4 select-none font-sans"
              >
                {/* Frosted Glass Backdrop Overlay - matching MoodCheck styling */}
                <motion.div
                  key="slack-config-modal-backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.2 } }}
                  onClick={() => {
                    if (!isSavingConfig) setIsConfigModalOpen(false);
                  }}
                  className="fixed inset-0 transition-all duration-300 bg-black/20 dark:bg-black/50 backdrop-blur-sm"
                />

                {/* Modal Container with Center Vertical Expand IN & OUT (MoodCheck signature animation) */}
                <motion.div
                  key="slack-config-modal-card"
                  initial={{ opacity: 0, scaleY: 0.1, scaleX: 0.95 }}
                  animate={{ opacity: 1, scaleY: 1, scaleX: 1 }}
                  exit={{
                    opacity: 0,
                    scaleY: 0.1,
                    scaleX: 0.95,
                    transition: {
                      type: "spring",
                      damping: 24,
                      stiffness: 300,
                      mass: 0.75,
                    },
                  }}
                  transition={{
                    type: "spring",
                    damping: 26,
                    stiffness: 340,
                    mass: 0.8,
                  }}
                  style={{ transformOrigin: "center center" }}
                  className="relative w-full max-w-lg bg-white dark:bg-[#141414] border border-neutral-200/80 dark:border-neutral-800 rounded-xl shadow-[0_15px_40px_-15px_rgba(0,0,0,0.12)] dark:shadow-[0_15px_40px_-15px_rgba(0,0,0,0.5)] p-6 sm:p-7 z-10 space-y-6 select-auto"
                >
                  {/* Modal Header */}
                  <div className="flex items-start justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
                    <div className="space-y-1">
                      <h2 className="text-base font-semibold text-neutral-950 dark:text-white flex items-center gap-2">
                        <Settings className="w-4 h-4 text-neutral-500" />
                        Slack Webhook Configuration
                      </h2>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Configure your Slack Incoming Webhook URL to enable real-time dispatching.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsConfigModalOpen(false)}
                      className="p-1 rounded-md text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSaveConfig} className="space-y-4">
                    {/* Webhook URL Input with Show/Hide toggle */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                          Incoming Webhook URL <span className="text-red-500">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowWebhookGuide(!showWebhookGuide)}
                          className="text-[11px] text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 flex items-center gap-1 cursor-pointer"
                        >
                          <HelpCircle className="w-3 h-3" />
                          How to get URL?
                        </button>
                      </div>

                      {/* Guide Collapsible */}
                      {showWebhookGuide && (
                        <div className="p-3.5 rounded-md bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-300 space-y-2">
                          <p className="font-medium text-neutral-900 dark:text-white">Quick 3-step setup:</p>
                          <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed">
                            <li>
                              Visit{" "}
                              <a
                                href="https://api.slack.com/apps"
                                target="_blank"
                                rel="noreferrer"
                                className="underline font-medium inline-flex items-center gap-0.5 text-neutral-900 dark:text-white"
                              >
                                Slack Apps Dashboard <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            </li>
                            <li>Click <strong>Create New App</strong> → <strong>From scratch</strong> → pick your workspace.</li>
                            <li>Enable <strong>Incoming Webhooks</strong> → click <strong>Add New Webhook</strong> → choose your channel.</li>
                          </ol>
                          <p className="text-[11px] text-neutral-400">
                            Copy the generated link (starts with <code>https://hooks.slack.com/services/...</code>) into the field below.
                          </p>
                        </div>
                      )}

                      <div className="relative">
                        <input
                          type={showWebhookSecret ? "text" : "password"}
                          value={tempWebhookUrl}
                          onChange={(e) => setTempWebhookUrl(e.target.value)}
                          placeholder="https://hooks.slack.com/services/T000/B000/XXXX"
                          className="w-full h-10 pl-3.5 pr-10 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 font-mono text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
                        />
                        <button
                          type="button"
                          onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                        >
                          {showWebhookSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Channel and Bot Name Inputs */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                          Default Channel
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs">#</span>
                          <input
                            type="text"
                            value={tempChannel.replace(/^#/, "")}
                            onChange={(e) => setTempChannel(`#${e.target.value.replace(/^#/, "")}`)}
                            placeholder="general"
                            className="w-full h-10 pl-7 pr-3 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs text-neutral-900 dark:text-white focus:outline-none font-mono"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                          Bot Display Name
                        </label>
                        <input
                          type="text"
                          value={tempBotName}
                          onChange={(e) => setTempBotName(e.target.value)}
                          placeholder="Launcher OS Bot"
                          className="w-full h-10 px-3.5 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs text-neutral-900 dark:text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Modal Actions */}
                    <div className="pt-3 flex items-center justify-end gap-3 border-t border-neutral-100 dark:border-neutral-800">
                      <button
                        type="button"
                        onClick={() => setIsConfigModalOpen(false)}
                        className="px-4 py-2 rounded-md text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSavingConfig}
                        className="px-5 py-2.5 rounded-md bg-neutral-950 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isSavingConfig ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Save Configuration</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}

    </AppShell>
  );
}
