"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useSidebar } from "@/components/layout/SidebarContext";
import { 
  ActionLogEntry, 
  AgentChatMessage, 
  VoiceConfig 
} from "./types";

interface AgentCommandCenterProps {
  messages: AgentChatMessage[];
  actionLogs: ActionLogEntry[];
  currentThought: string;
  isRunning: boolean;
  onSendGoal: (goal: string) => void;
  onStopAgent: () => void;
  voiceConfig: VoiceConfig;
  onUpdateVoiceConfig: (newConfig: VoiceConfig) => void;
  selectedModel: string;
  onSelectModel: (model: string) => void;
  isSpeaking: boolean;
  activeUrl?: string;
  onOpenTab?: (url: string) => void;
  onTestCursor?: () => void;
  onResetChat?: () => void;
}

function FormattedMessage({ content }: { content: string }) {
  const renderFormattedText = (text: string) => {
    // Matches markdown links: [Title](url)
    const linkRegex = /\[([^\]]+)\]\s*\((https?:\/\/[^\s)]+)\)/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(renderBold(text.substring(lastIndex, match.index), `txt-${lastIndex}`));
      }
      const title = match[1];
      const url = match[2];
      parts.push(
        <a
          key={`link-${match.index}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-semibold text-neutral-950 dark:text-[#FFE54C] underline decoration-[#FFE54C]/80 underline-offset-4 hover:opacity-80 transition-opacity"
        >
          <span>{title}</span>
          <span className="text-xs">↗</span>
        </a>
      );
      lastIndex = linkRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(renderBold(text.substring(lastIndex), `txt-${lastIndex}`));
    }

    return parts;
  };

  const renderBold = (text: string, keyPrefix: string) => {
    const boldRegex = /\*\*([^*]+)\*\*/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = boldRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      parts.push(
        <strong key={`${keyPrefix}-b-${match.index}`} className="font-semibold text-neutral-950 dark:text-white">
          {match[1]}
        </strong>
      );
      lastIndex = boldRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts;
  };

  return (
    <div className="whitespace-pre-wrap break-words [overflow-wrap:anywhere] leading-relaxed">
      {renderFormattedText(content)}
    </div>
  );
}

export function AgentCommandCenter({
  messages,
  actionLogs,
  currentThought,
  isRunning,
  onSendGoal,
  onStopAgent,
  voiceConfig,
  onUpdateVoiceConfig,
  selectedModel,
  onSelectModel,
  isSpeaking,
  activeUrl,
  onOpenTab,
  onTestCursor,
  onResetChat,
}: AgentCommandCenterProps) {
  const { collapsed } = useSidebar();
  const [inputValue, setInputValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isVoiceSettingsOpen, setIsVoiceSettingsOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Settings form
  const [elevenKey, setElevenKey] = useState(voiceConfig.apiKey);
  const [voiceId, setVoiceId] = useState(voiceConfig.voiceId);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, actionLogs, currentThought]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Speech Recognition (Mic Input)
  const toggleListening = () => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Browser Anda belum mendukung Web Speech Recognition. Silakan gunakan Google Chrome.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      const recognition = new SpeechRecognition();
      recognition.lang = "id-ID";
      recognition.interimResults = true;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const text = Array.from(event.results)
          .map((r: any) => r[0].transcript)
          .join("");
        setInputValue(text);
      };
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isRunning) return;
    if (isSpeaking) {
      onStopAgent();
    }
    onSendGoal(inputValue.trim());
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSaveVoiceSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateVoiceConfig({
      ...voiceConfig,
      apiKey: elevenKey.trim(),
      voiceId: voiceId.trim() || "21m00Tcm4TlvDq8ikWAM",
    });
    setIsVoiceSettingsOpen(false);
  };

  // Only consider real dialogue (more than 1 message or user has talked)
  const hasUserMessages = messages.some((m) => m.role === "user");

  return (
    <div className="w-full flex flex-col font-sans">
      {/* Sesi Baru subtle action only when in active chat */}
      {hasUserMessages && onResetChat && (
        <div className="flex justify-end pb-3">
          <button
            type="button"
            onClick={onResetChat}
            className="px-3 py-1 rounded-md border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white bg-white/80 dark:bg-[#111111]/80 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-xs font-medium cursor-pointer shadow-2xs"
            title="Mulai sesi baru"
          >
            Sesi Baru
          </button>
        </div>
      )}

      {/* ── STATE 1: EMPTY / HERO LAUNCHER ── */}
      {!hasUserMessages ? (
        <div className="pt-2 sm:pt-6 pb-16 flex flex-col items-center max-w-3xl mx-auto px-4 w-full">
          {/* Centered Editorial Header (Tetap berada di atas) */}
          <div className="w-full text-center space-y-2 mb-12 sm:mb-16">
            <h1 className="text-[32px] sm:text-[44px] font-normal sm:font-medium font-sf tracking-tight leading-tight text-neutral-900 dark:text-white">
              Navigate your browser autonomously
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
              Perintahkan AI untuk menelusuri web, mengetik di Google, menggerakkan mouse, atau memutar musik
            </p>
          </div>

          {/* Main Clean Prompt Card (Ditunrunkan posisinya lebih ke bawah) */}
          <div className="w-full relative">
            <form
              onSubmit={handleSubmit}
              className="w-full bg-white dark:bg-[#111111] border border-neutral-200 dark:border-neutral-800 p-4 sm:p-5 flex flex-col gap-3.5 shadow-sm hover:border-neutral-400 dark:hover:border-neutral-700 transition-all rounded-xl focus-within:ring-2 focus-within:ring-[#FFE54C]/50 focus-within:border-[#E5BC10]"
            >
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isRunning}
                placeholder={
                  isListening
                    ? "Mendengarkan suara Anda..."
                    : "Ketik instruksi di sini... (Contoh: Buka Spotify dan mainkan lagu lofi chill, atau cari berita AI)"
                }
                rows={3}
                className="w-full bg-transparent border-none text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:ring-0 text-sm sm:text-base outline-none resize-none min-h-[90px] font-sans leading-relaxed"
              />

              {/* Bottom Card Toolbar: Mic on Left + Action Button on Right */}
              <div className="flex items-center justify-between pt-2.5 border-t border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      isListening
                        ? "bg-red-500 text-white border-red-600 animate-pulse"
                        : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 border-neutral-200 dark:border-neutral-800"
                    }`}
                  >
                    <span>{isListening ? "Mendengarkan..." : "Voice Input"}</span>
                  </button>

                  {isSpeaking && (
                    <button
                      type="button"
                      onClick={onStopAgent}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-red-50 hover:bg-red-100 dark:bg-red-950/50 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/80 cursor-pointer transition-all"
                      title="Hentikan suara AI"
                    >
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                      </span>
                      <span>Stop Suara</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {(isRunning || isSpeaking) && (
                    <button
                      type="button"
                      onClick={onStopAgent}
                      className="h-9 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                      title={isRunning ? "Hentikan eksekusi agen" : "Hentikan pembacaan suara AI"}
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <rect x="5" y="5" width="14" height="14" rx="2" />
                      </svg>
                      <span>Stop</span>
                    </button>
                  )}

                  {/* Primary Yellow Action Button (Matches Deck Generator style) */}
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isRunning}
                    className={`h-9 px-5 rounded-lg font-bold text-xs shadow-xs transition-all flex items-center justify-center ${
                      inputValue.trim() && !isRunning
                        ? "bg-[#FFDE3C] hover:bg-[#ffe55c] text-neutral-950 cursor-pointer active:scale-95"
                        : isRunning || (isSpeaking && !inputValue.trim())
                        ? "hidden"
                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600 cursor-not-allowed opacity-60"
                    }`}
                  >
                    {isRunning ? "Mengeksekusi..." : "Jalankan"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : (
        /* ── STATE 2: ACTIVE CONVERSATIONAL VIEW (TIRU EXACT DARI LLM MODE CHAT VIEW) ── */
        <div className="flex flex-col max-w-3xl mx-auto min-h-[calc(100vh-180px)] pb-36 pt-2 w-full px-3 sm:px-4">
          {/* Messages Stream */}
          <div className="space-y-6 flex-1">
            {/* Messages Dialogue */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-3.5 transition-opacity duration-300 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {/* Assistant Message (Clean RevoU Logo, exact like LLM Mode) */}
                {msg.role === "assistant" ? (
                  <div className="flex items-start gap-3.5 w-full">
                    <div className="relative w-7 h-7 sm:w-8 sm:h-8 shrink-0 select-none mt-0.5 overflow-visible">
                      <Image
                        src="/logo/Logo_revou.png"
                        alt="Launcher OS"
                        fill
                        sizes="32px"
                        className="object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0 text-sm sm:text-base leading-relaxed text-neutral-900 dark:text-neutral-100 pt-0.5">
                      <div className="relative group">
                        <FormattedMessage content={msg.content} />
                        {/* Audio Speaking Live Indicator & Stop Voice Button */}
                        {isSpeaking && msg.id === messages[messages.length - 1]?.id && (
                          <div className="flex items-center gap-2 mt-2 pt-1 select-none">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-[11px] font-medium text-amber-800 dark:text-amber-300">
                              <span className="flex items-center gap-0.5">
                                <span className="w-1 h-2 bg-amber-500 rounded-sm animate-bounce" />
                                <span className="w-1 h-3.5 bg-amber-500 rounded-sm animate-bounce [animation-delay:150ms]" />
                                <span className="w-1 h-2 bg-amber-500 rounded-sm animate-bounce [animation-delay:300ms]" />
                              </span>
                              <span>AI sedang membacakan...</span>
                            </span>
                            <button
                              type="button"
                              onClick={onStopAgent}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold cursor-pointer transition-all shadow-xs active:scale-95"
                              title="Hentikan suara AI"
                            >
                              <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                                <rect x="5" y="5" width="14" height="14" rx="1.5" />
                              </svg>
                              <span>Stop Suara</span>
                            </button>
                          </div>
                        )}

                        <div className="flex items-center gap-2 mt-2 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => handleCopy(msg.id, msg.content)}
                            className="px-2 py-0.5 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 text-[11px] font-medium cursor-pointer"
                          >
                            {copiedId === msg.id ? "Tersalin" : "Salin"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* User Message Bubble (Matching LLM Mode) */
                  <div className="flex flex-col items-end max-w-[85%] ml-auto gap-2">
                    <div className="bg-[#FFDE3C] text-neutral-950 font-medium px-4 py-2.5 rounded-lg rounded-tr-xs shadow-xs text-sm sm:text-base leading-relaxed">
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Assistant Thinking Indicator when running (Exact like LLM Mode) */}
            {isRunning && (
              <div className="flex items-start gap-3.5 w-full">
                <div className="relative w-7 h-7 sm:w-8 sm:h-8 shrink-0 select-none mt-0.5 overflow-visible">
                  <Image
                    src="/logo/Logo_revou.png"
                    alt="Launcher OS"
                    fill
                    sizes="32px"
                    className="object-contain animate-logo-heartbeat"
                  />
                </div>
                <div className="flex items-center text-xs sm:text-sm text-neutral-400 dark:text-neutral-500 font-normal pt-1.5 sm:pt-2 select-none animate-pulse">
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* ── DOCKED BOTTOM CHATBAR (Exact style dari LLM Mode /dashboard) ── */}
          <div
            className={`fixed bottom-0 inset-x-0 ${
              collapsed ? "lg:pl-[70px]" : "lg:pl-[238px]"
            } transition-[padding] duration-200 z-30 p-4 pb-6 pointer-events-none`}
          >
            <div className="max-w-3xl mx-auto w-full relative pointer-events-auto">
              <form
                onSubmit={handleSubmit}
                className="w-full bg-white/95 dark:bg-[#111111]/95 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 p-3 sm:p-3.5 flex flex-col gap-2 shadow-lg hover:border-neutral-400 dark:hover:border-neutral-700 transition-all rounded-xl focus-within:ring-2 focus-within:ring-[#FFE54C]/50 focus-within:border-[#E5BC10]"
              >
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isRunning}
                  placeholder={
                    isListening
                      ? "Mendengarkan ucapan Anda..."
                      : "Beri perintah untuk AI menelusuri web, mengetik, atau memutar musik..."
                  }
                  rows={2}
                  className="w-full bg-transparent border-none text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:ring-0 text-xs sm:text-sm outline-none resize-none font-sans"
                />

                <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={toggleListening}
                      className={`inline-flex items-center px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                        isListening
                          ? "bg-red-500 text-white border-red-600 animate-pulse"
                          : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 border-neutral-200 dark:border-neutral-800"
                      }`}
                      title="Gunakan mikrofon"
                    >
                      <span>{isListening ? "Mendengarkan..." : "Voice Input"}</span>
                    </button>

                    {isSpeaking && (
                      <button
                        type="button"
                        onClick={onStopAgent}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold bg-red-50 hover:bg-red-100 dark:bg-red-950/50 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/80 cursor-pointer transition-all"
                        title="Hentikan pembacaan suara AI"
                      >
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                        </span>
                        <span>Stop Suara</span>
                      </button>
                    )}

                    {isRunning && (
                      <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 pl-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                        <span>Mengeksekusi...</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Explicit Stop Button: visible whenever AI is running OR speaking */}
                    {(isRunning || isSpeaking) && (
                      <button
                        type="button"
                        onClick={onStopAgent}
                        className="h-8.5 px-3.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
                        title={isRunning ? "Hentikan proses agen" : "Hentikan pembacaan suara AI"}
                      >
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                          <rect x="5" y="5" width="14" height="14" rx="2" />
                        </svg>
                        <span>Stop</span>
                      </button>
                    )}

                    {/* Kirim Button */}
                    <button
                      type="submit"
                      disabled={!inputValue.trim() || isRunning}
                      className={`h-8.5 px-4 rounded-lg font-bold text-xs shadow-xs transition-all flex items-center justify-center shrink-0 ${
                        inputValue.trim() && !isRunning
                          ? "bg-[#FFDE3C] hover:bg-[#ffe55c] text-neutral-950 cursor-pointer active:scale-95"
                          : isRunning || (isSpeaking && !inputValue.trim())
                          ? "hidden"
                          : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600 cursor-not-allowed opacity-60"
                      }`}
                    >
                      Kirim
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── ELEVENLABS SETTINGS MODAL ── */}
      {isVoiceSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="font-sf text-base font-semibold text-neutral-900 dark:text-white">
                Pengaturan Suara ElevenLabs
              </h3>
              <button
                type="button"
                onClick={() => setIsVoiceSettingsOpen(false)}
                className="text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
              >
                Tutup
              </button>
            </div>

            <form onSubmit={handleSaveVoiceSettings} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-neutral-700 dark:text-neutral-300">
                  ElevenLabs API Key (Opsional)
                </label>
                <input
                  type="password"
                  value={elevenKey}
                  onChange={(e) => setElevenKey(e.target.value)}
                  placeholder="xi-..."
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white font-mono focus:outline-none focus:border-[#FFE54C]"
                />
                <p className="text-[10.5px] text-neutral-400">
                  Jika kosong, sistem otomatis memakai Web Speech API lokal browser.
                </p>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-neutral-700 dark:text-neutral-300">
                  Voice ID
                </label>
                <input
                  type="text"
                  value={voiceId}
                  onChange={(e) => setVoiceId(e.target.value)}
                  placeholder="21m00Tcm4TlvDq8ikWAM"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white font-mono focus:outline-none focus:border-[#FFE54C]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsVoiceSettingsOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#FFE54C] hover:bg-[#FFDE3C] text-neutral-950 font-bold cursor-pointer"
                >
                  Simpan Pengaturan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
