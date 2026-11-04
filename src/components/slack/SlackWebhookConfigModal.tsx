"use client";

import React, { useState } from "react";
import { 
  Bot, 
  X, 
  Check, 
  Send, 
  ExternalLink, 
  Zap, 
  CheckCircle2, 
  AlertCircle,
  Copy
} from "lucide-react";
import { SlackWorkspaceConfig } from "./types";

interface SlackWebhookConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SlackWorkspaceConfig;
  onSaveConfig: (newConfig: SlackWorkspaceConfig) => void;
}

export function SlackWebhookConfigModal({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}: SlackWebhookConfigModalProps) {
  const [webhookUrl, setWebhookUrl] = useState(config.webhookUrl || "");
  const [defaultChannel, setDefaultChannel] = useState(config.defaultChannel || "#general");
  const [botName, setBotName] = useState(config.botName || "Launcher OS Bot");
  const [testMessage, setTestMessage] = useState("Halo RevoU Family! 👋 Ini pesan uji coba dari Launcher OS Hub.");
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveConfig({
      ...config,
      webhookUrl: webhookUrl.trim(),
      defaultChannel: defaultChannel.trim(),
      botName: botName.trim(),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webhookUrl.trim()) {
      setSendResult({
        success: false,
        message: "Silakan masukkan Incoming Webhook URL terlebih dahulu.",
      });
      return;
    }

    setIsSending(true);
    setSendResult(null);

    try {
      const res = await fetch("/api/slack/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelId: "c-general",
          content: testMessage,
          webhookUrl: webhookUrl.trim(),
          botName: botName.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error("Server gagal meneruskan webhook");
      }

      setSendResult({
        success: true,
        message: `Pesan berhasil dikirim ke ${defaultChannel} via Webhook!`,
      });
    } catch (err: any) {
      setSendResult({
        success: false,
        message: `Gagal mengirim ke Slack Webhook: ${err?.message || "Koneksi terputus"}`,
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#161616] border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white flex items-center justify-center font-bold">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                Slack Webhook & Launcher Automation Integrasi
              </h3>
              <p className="text-[11px] text-neutral-400">
                Hubungkan dengan Workspace Slack eksternal via Incoming Webhook
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          <div className="space-y-3">
            <div>
              <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                Slack Incoming Webhook URL
              </label>
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://hooks.slack.com/services/..."
                className="w-full px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Default Channel
                </label>
                <input
                  type="text"
                  value={defaultChannel}
                  onChange={(e) => setDefaultChannel(e.target.value)}
                  placeholder="#general"
                  className="w-full px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Bot Username
                </label>
                <input
                  type="text"
                  value={botName}
                  onChange={(e) => setBotName(e.target.value)}
                  placeholder="Launcher OS Bot"
                  className="w-full px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold text-xs hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer"
              >
                {saved ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : null}
                {saved ? "Tersimpan!" : "Simpan Pengaturan"}
              </button>

              <a
                href="https://api.slack.com/messaging/webhooks"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-neutral-500 hover:text-[#D4A800] flex items-center gap-1"
              >
                Dokumentasi Slack API
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Test Dispatch Form */}
          <div className="pt-3 border-t border-neutral-200/80 dark:border-neutral-800 space-y-2.5">
            <h4 className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-[#D4A800]" />
              Uji Coba Kirim Notifikasi Langsung
            </h4>

            <textarea
              rows={3}
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 resize-none"
            />

            {sendResult && (
              <div
                className={`p-2.5 rounded-lg border text-[11px] flex items-start gap-2 ${
                  sendResult.success
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                    : "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                }`}
              >
                {sendResult.success ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <p>{sendResult.message}</p>
              </div>
            )}

            <button
              type="button"
              onClick={handleSendTest}
              disabled={isSending || !webhookUrl}
              className="w-full py-2 rounded-xl bg-[#FFE500] hover:bg-[#F2D700] text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 shadow-xs"
            >
              <Send className={`w-3.5 h-3.5 ${isSending ? "animate-spin" : ""}`} />
              <span>{isSending ? "Mengirim..." : `Kirim Pesan ke ${defaultChannel}`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
