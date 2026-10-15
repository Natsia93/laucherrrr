"use client";

import React, { useState } from "react";
import { 
  Sparkles, 
  X, 
  Copy, 
  Check, 
  CheckSquare, 
  FileText, 
  RefreshCw,
  Zap 
} from "lucide-react";

interface SlackAiSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  channelName: string;
  summaryText: string;
  isLoading: boolean;
  onRefresh: () => void;
  onAddAsTodo: (taskText: string) => void;
  onSaveToScratchpad: (content: string) => void;
}

export function SlackAiSummaryModal({
  isOpen,
  onClose,
  channelName,
  summaryText,
  isLoading,
  onRefresh,
  onAddAsTodo,
  onSaveToScratchpad,
}: SlackAiSummaryModalProps) {
  const [copied, setCopied] = useState(false);
  const [todoAdded, setTodoAdded] = useState(false);
  const [scratchpadSaved, setScratchpadSaved] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!summaryText) return;
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveTodo = () => {
    if (!summaryText) return;
    onAddAsTodo(`[Ringkasan #${channelName}] Follow up poin penting dari diskusi tim.`);
    setTodoAdded(true);
    setTimeout(() => setTodoAdded(false), 2500);
  };

  const handleSaveScratch = () => {
    if (!summaryText) return;
    onSaveToScratchpad(`## Ringkasan Diskusi #${channelName}\n${summaryText}`);
    setScratchpadSaved(true);
    setTimeout(() => setScratchpadSaved(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#161616] border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-transparent to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FFE500] text-neutral-950 flex items-center justify-center font-bold shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                AI Channel Summary & Action Items
              </h3>
              <p className="text-[11px] text-neutral-400">
                Ekstraksi poin keputusan penting di #{channelName}
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
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-sm flex-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3 text-center">
              <div className="w-8 h-8 rounded-full border-2 border-[#FFE500] border-t-transparent animate-spin" />
              <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                Menganalisis riwayat percakapan #{channelName}...
              </p>
              <p className="text-xs text-neutral-400">
                Menyusun keputusan utama dan tugas tindak lanjut.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed font-sans">
                {summaryText || "Tidak ada pesan yang cukup untuk diringkas saat ini."}
              </div>

              {/* Action Buttons to connect with Launcher OS ecosystem */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3 py-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Tersalin!" : "Salin Teks"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveTodo}
                  className="px-3 py-2 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {todoAdded ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <CheckSquare className="w-3.5 h-3.5" />}
                  <span>{todoAdded ? "Todo Dibuat!" : "+ Buat Todo"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveScratch}
                  className="px-3 py-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {scratchpadSaved ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <FileText className="w-3.5 h-3.5" />}
                  <span>{scratchpadSaved ? "Tersimpan!" : "Scratchpad"}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/40">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Generate Ulang</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold text-xs hover:opacity-90 transition-opacity cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
