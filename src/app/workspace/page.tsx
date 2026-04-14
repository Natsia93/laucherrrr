"use client";

import React, { useState, Suspense, useEffect, useRef, useCallback } from "react";
import { marked } from "marked";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  BookOpen, ChevronLeft, Send, Sparkles, Download, 
  History, Loader2, CheckCircle2, Brain, FileText, 
  PenTool, Save, Clock, Zap, Folder
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";

// Progress stages configuration
const PROGRESS_STAGES = [
  { icon: Brain, label: "Menganalisis Konteks", description: "Membaca dan memahami data wawancara Anda..." },
  { icon: FileText, label: "Menyusun Struktur", description: "Merancang kerangka dokumen ATP..." },
  { icon: PenTool, label: "Menulis Konten", description: "AI sedang menulis konten detail..." },
  { icon: Save, label: "Finalisasi", description: "Menyimpan dokumen ke database..." },
];

function WorkspaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get("prompt");
  const context = searchParams.get("context");
  const docType = searchParams.get("type") || "Alur Tujuan Pembelajaran (ATP)";
  const model = searchParams.get("model") || "deepseek";
  const docId = searchParams.get("id");

  const [chatInput, setChatInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [docContent, setDocContent] = useState("");
  const [displayedContent, setDisplayedContent] = useState("");
  const [isGenerated, setIsGenerated] = useState(false);
  const [progressStage, setProgressStage] = useState(-1);
  const [elapsedTime, setElapsedTime] = useState(0);
  const hasStarted = useRef(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const contentRef = useRef("");
  const docAreaRef = useRef<HTMLDivElement>(null);

  const tableStyles = `
    /* === Hidden scrollbar but scrollable === */
    .scroll-hidden::-webkit-scrollbar { display: none; }
    .scroll-hidden { -ms-overflow-style: none; scrollbar-width: none; }

    /* === A4 Paper multiple pages illusion === */
    .a4-paper {
      width: 210mm;
      max-width: 100%;
      min-height: 297mm;
      height: fit-content;
      background-color: white !important;
      
      background-image: repeating-linear-gradient(
        to bottom,
        white 0mm,
        white 296.8mm,
        #e5e7eb 296.8mm,
        #9ca3af 297mm
      );
      
      color: black;
      box-shadow: 0 4px 24px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08);
      border: 1px solid #d1d5db;
      padding: 10mm 10mm; /* Reduced mobile padding */
      box-sizing: border-box;
      font-family: 'Times New Roman', Times, serif;
      font-size: 11pt; /* Slightly smaller for better fit */
      line-height: 1.5;
      text-align: left;
    }

    @media (min-width: 768px) {
      .a4-paper {
        padding: 25mm 20mm;
        font-size: 12pt;
      }
    }

    /* === Curriculum content styles === */
    .curriculum-content table { width: 100%; border-collapse: collapse; margin-top: 1rem; border: 1.5px solid black; background-color: white; page-break-inside: avoid; }
    .curriculum-content th, .curriculum-content td { border: 1px solid black; padding: 6px 8px; vertical-align: top; text-align: left; color: black; font-size: 11pt; }
    .curriculum-content th { background-color: #f3f4f6; text-align: center; font-weight: bold; }
    .curriculum-content h1, .curriculum-content h2 { text-align: center; margin-bottom: 0.5rem; text-transform: uppercase; color: black; }
    .curriculum-content h3 { background-color: #e5e7eb; padding: 4px 8px; margin-top: 1.5rem; border: 1px solid black; font-weight: bold; color: black; }
    .curriculum-content p { margin: 8px 0; color: black; }
    .curriculum-content ul { list-style-type: disc; padding-left: 20px; color: black; }
    .curriculum-content ol { padding-left: 20px; color: black; }
    .curriculum-content strong { font-weight: bold; }

    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    .shimmer-bar {
      background: linear-gradient(90deg, #f0f0f0, #e0e0e0, #f0f0f0);
      background-size: 200% 100%;
      animation: shimmer 1.5s ease-in-out infinite;
    }
    @keyframes pulse-ring {
      0% { transform: scale(0.8); opacity: 0.5; }
      50% { transform: scale(1.1); opacity: 0.2; }
      100% { transform: scale(0.8); opacity: 0.5; }
    }
  `;

  const [messages, setMessages] = useState<{role: string, text: string}[]>([]);

  // Timer for elapsed time during loading
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loading) {
      setElapsedTime(0);
      timer = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
    }
    return () => { if (timer) clearInterval(timer); };
  }, [loading]);

  // Auto-scroll document area as content streams in (only while loading)
  useEffect(() => {
    if (loading && docAreaRef.current && displayedContent) {
      docAreaRef.current.scrollTop = docAreaRef.current.scrollHeight;
    }
  }, [displayedContent, loading]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs < 10 ? '0' : ''}${secs}s` : `${secs}s`;
  };

  // Core streaming function
  const streamGenerate = useCallback(async (rawPrompt: string, appendToExisting = false) => {
    setLoading(true);
    setProgressStage(0);
    
    if (!appendToExisting) {
      setDisplayedContent("");
      setDocContent("");
      contentRef.current = "";
    }

    setMessages(prev => {
      const newMsgs = [...prev, { role: "ai", text: "⏳ Memulai proses penyusunan dokumen..." }];
      return newMsgs;
    });

    try {
      const response = await fetch("/api/generate-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawPrompt, type: docType, model }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: "Server error" }));
        throw new Error(errData.error || `HTTP ${response.status}`);
      }

      const reader = response.body!.getReader();
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

            switch (data.type) {
              case "stage":
                setProgressStage(data.stage);
                // Update the last AI message with progress
                setMessages(prev => {
                  const updated = prev.filter(m => !(m.role === "ai" && m.text.startsWith("⏳")));
                  return [...updated, { role: "ai", text: `⏳ ${data.label}` }];
                });
                break;

              case "chunk":
                contentRef.current += data.text;
                setDisplayedContent(contentRef.current);
                setDocContent(contentRef.current);
                break;

              case "done":
                setIsGenerated(true);
                setMessages(prev => {
                  const updated = prev.filter(m => !(m.role === "ai" && m.text.startsWith("⏳")));
                  return [...updated, { role: "ai", text: "✅ Dokumen berhasil disusun! Silakan tinjau hasilnya di lembar kerja. Ada yang ingin direvisi?" }];
                });
                break;

              case "error":
                setMessages(prev => {
                  const updated = prev.filter(m => !(m.role === "ai" && m.text.startsWith("⏳")));
                  return [...updated, { role: "ai", text: `❌ Gagal: ${data.message}` }];
                });
                break;
            }
          } catch {}
        }
      }
    } catch (err: any) {
      console.error("Stream error:", err);
      setMessages(prev => {
        const updated = prev.filter(m => !(m.role === "ai" && m.text.startsWith("⏳")));
        return [...updated, { role: "ai", text: `❌ Terjadi kesalahan: ${err.message}` }];
      });
    } finally {
      setLoading(false);
      setProgressStage(-1);
    }
  }, [docType]);

  // Initial generation on mount
  useEffect(() => {
    if (hasStarted.current) return;
    
    if (docId) {
      hasStarted.current = true;
      const fetchDoc = async () => {
        setLoading(true);
        try {
          const response = await fetch(`/api/documents/${docId}`);
          const data = await response.json();
          if (data.content) {
            setDocContent(data.content);
            setDisplayedContent(data.content);
            contentRef.current = data.content;
            setIsGenerated(true);
            setMessages([{ role: "ai", text: `✅ Dokumen "${data.title}" berhasil dimuat. Silakan lanjutkan pengeditan atau minta revisi.` }]);
          }
        } catch (err) {
          console.error("Fetch error:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchDoc();
    } else if (context) {
      hasStarted.current = true;
      const prompt = `Berdasarkan hasil wawancara ini: ${context.replace(/\|/g, ". ")}. Tolong buatkan dokumen ${docType} lengkap.`;
      streamGenerate(prompt);
      
      // Hapus parameter context dari URL agar jika di-refresh tidak reload ulang
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete('context');
        window.history.replaceState({}, '', url.toString());
      } catch (e) {}

    } else if (initialPrompt) {
      hasStarted.current = true;
      streamGenerate(initialPrompt);
      
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete('prompt');
        window.history.replaceState({}, '', url.toString());
      } catch (e) {}
    }
  }, [initialPrompt, context, docType, streamGenerate]);

  // Handle send message
  const handleSendMessage = async (isContinue = false) => {
    const textToSend = isContinue ? "Lanjutkan penulisan dokumen dari bagian terakhir." : chatInput;
    if (!textToSend.trim() && !isContinue) return;
    
    const newMsg = { role: "user", text: textToSend };
    setMessages(prev => [...prev, newMsg]);
    setChatInput("");

    if (isContinue || isGenerated) {
      // Use streaming for document generation/continuation
      const prompt = isContinue 
        ? `LANJUTAN: ${docContent.slice(-300)}. Lanjutkan konten kurikulum dari sini.`
        : `Berdasarkan diskusi: ${messages.map(m => m.text).join(". ")}. Revisi/buatlah ulang draf ${docType}.`;
      
      if (isContinue) {
        contentRef.current = docContent + "\n";
      }
      
      await streamGenerate(prompt, isContinue);
    } else {
      // Pre-generation chat (if chat-ai API exists)
      setLoading(true);
      try {
        const response = await fetch("/api/chat-ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: [...messages, newMsg], type: docType })
        });
        const data = await response.json();
        setMessages(prev => [...prev, { role: "ai", text: data.reply }]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const exportToWord = () => {
    if (!docContent) {
      alert("Belum ada dokumen yang dapat diekspor.");
      return;
    }

    const header = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Export AI Curriculum</title>
        <style>
          body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; }
          table { width: 100%; border-collapse: collapse; margin-top: 1rem; border: 1px solid black; }
          th, td { border: 1px solid black; padding: 6px 8px; vertical-align: top; text-align: left; font-size: 11pt; }
          th { background-color: #f3f4f6; text-align: center; font-weight: bold; }
          h1, h2, h3, h4 { text-align: center; margin-bottom: 12px; }
          ul, ol { padding-left: 20px; }
        </style>
      </head>
      <body>
    `;
    const footer = "</body></html>";
    const sourceHTML = header + docContent + footer;
    
    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `Dokumen_${docType.replace(/ /g, '_')}_${new Date().toISOString().slice(0,10)}.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
  };

  // Render the progress indicator component
  const renderProgressIndicator = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center min-h-[900px] w-full px-8 py-12"
    >
      {/* Animated Header */}
      <motion.div 
        className="text-center mb-10"
        initial={{ y: -20 }}
        animate={{ y: 0 }}
      >
        <div className="relative w-16 h-16 mx-auto mb-5">
          <div className="absolute inset-0 rounded-full bg-[#4d7537]/20" style={{ animation: 'pulse-ring 2s ease-in-out infinite' }} />
          <div className="absolute inset-1 rounded-full bg-[#4d7537]/10" style={{ animation: 'pulse-ring 2s ease-in-out infinite 0.3s' }} />
          <div className="relative w-16 h-16 rounded-full bg-[#4d7537] flex items-center justify-center shadow-lg shadow-[#4d7537]/30">
            <Zap className="w-7 h-7 text-white" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-[#2a4a1c] tracking-tight">AI Sedang Menyusun Dokumen</h3>
        <p className="text-sm text-neutral-500 mt-1">Proses ini memerlukan waktu beberapa saat</p>
      </motion.div>

      {/* Progress Steps */}
      <div className="w-full max-w-sm space-y-3 mb-10">
        {PROGRESS_STAGES.map((stage, idx) => {
          const StageIcon = stage.icon;
          const isActive = idx === progressStage;
          const isCompleted = idx < progressStage;
          const isPending = idx > progressStage;

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -30 }}
              animate={{ 
                opacity: isPending ? 0.35 : 1, 
                x: 0,
              }}
              transition={{ delay: idx * 0.08, duration: 0.35 }}
              className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-500 ${
                isActive 
                  ? 'bg-[#4d7537]/10 border-2 border-[#4d7537]/40 shadow-md shadow-[#4d7537]/8' 
                  : isCompleted 
                    ? 'bg-[#4d7537]/5 border border-[#4d7537]/15' 
                    : 'border border-neutral-200/50'
              }`}
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${
                isActive 
                  ? 'bg-[#4d7537] text-white shadow-md shadow-[#4d7537]/30' 
                  : isCompleted 
                    ? 'bg-[#4d7537]/20 text-[#4d7537]' 
                    : 'bg-neutral-100 text-neutral-300'
              }`}>
                {isCompleted ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                    <CheckCircle2 className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <StageIcon className={`w-4.5 h-4.5 ${isActive ? 'animate-pulse' : ''}`} />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm ${
                  isActive ? 'text-[#4d7537]' : isCompleted ? 'text-[#4d7537]/70' : 'text-neutral-300'
                }`}>
                  {stage.label}
                </p>
                <AnimatePresence>
                  {isActive && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-xs text-neutral-500 mt-0.5 leading-relaxed"
                    >
                      {stage.description}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {isActive && (
                <Loader2 className="w-4 h-4 text-[#4d7537] animate-spin shrink-0" />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Timer */}
      <motion.div 
        className="flex items-center gap-2 text-neutral-400 text-sm bg-neutral-50 px-5 py-2.5 rounded-full border border-neutral-200/60"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Clock className="w-4 h-4" />
        <span>Waktu berlalu: <strong className="text-neutral-600 font-mono">{formatTime(elapsedTime)}</strong></span>
      </motion.div>

      {/* Shimmer skeleton preview */}
      <div className="w-full max-w-sm mt-10 space-y-2.5">
        <div className="h-3 rounded-full shimmer-bar" />
        <div className="h-3 w-5/6 rounded-full shimmer-bar" style={{ animationDelay: '0.2s' }} />
        <div className="h-3 w-3/4 rounded-full shimmer-bar" style={{ animationDelay: '0.4s' }} />
        <div className="h-3 w-4/6 rounded-full shimmer-bar" style={{ animationDelay: '0.6s' }} />
      </div>
    </motion.div>
  );

  // Render the idle/empty state
  const renderIdleState = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-[900px] w-full text-center"
    >
      <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mb-4">
        <BookOpen className="w-7 h-7 text-neutral-300" />
      </div>
      <p className="text-neutral-400 font-medium">Menunggu Konteks...</p>
      <p className="text-xs text-neutral-300 mt-1">Gunakan AI Assistant untuk memulai penyusunan dokumen</p>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[#f4f3ed] dark:bg-[#080b06] font-sans flex flex-col h-screen overflow-hidden">
      <style>{tableStyles}</style>

      <nav className="flex items-center justify-between px-4 py-3 border-b border-[#dcdad1] dark:border-[#3f612d]/20 bg-white dark:bg-[#0a0a0a] z-50 shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-neutral-500 rounded-md">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2 px-2">
            <div className="w-7 h-7 rounded bg-[#4d7537] flex items-center justify-center">
              <BookOpen className="text-white w-4 h-4" />
            </div>
            <span className="font-bricolage font-semibold text-lg hidden sm:block">Dekstorio Editor</span>
          </div>
        </div>

        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-1 bg-white dark:bg-[#10140d]/80 rounded-lg p-1 border border-[#dcdad1] dark:border-[#3f612d]/30 backdrop-blur-md shadow-sm">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="text-neutral-500 dark:text-[#a2b591] hover:text-neutral-900 dark:hover:text-[#f4f3ed] hover:bg-neutral-100 dark:hover:bg-[#1a2315] rounded-md transition-all">
              <Folder className="w-4 h-4 mr-2" />
              Penyimpanan File
            </Button>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm" className="bg-neutral-100 dark:bg-[#1a2315] text-neutral-900 dark:text-[#f4f3ed] hover:bg-neutral-200 dark:hover:bg-[#2c471c] hover:text-neutral-900 dark:hover:text-white rounded-md shadow-sm transition-all">
              <Sparkles className="w-4 h-4 mr-2 text-[#4d7537] dark:text-[#89b867]" />
              AI Generate
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {loading && (
            <div className="flex items-center gap-2 bg-[#4d7537]/10 text-[#4d7537] px-3 py-1.5 rounded-full text-[10px] font-medium border border-[#4d7537]/20">
              <span className="relative flex h-1.5 w-1.5 pt-0.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4d7537] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#4d7537]"></span>
              </span>
              <span className="hidden xs:inline">Generating...</span>
            </div>
          )}
          <ThemeToggle />
          <Button onClick={exportToWord} size="sm" className="bg-[#4d7537] text-white hover:bg-[#5a8b41] rounded-md px-3 sm:px-4">
            <Download className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Export .doc</span>
          </Button>
        </div>
      </nav>

      <main className="flex-1 flex overflow-hidden min-h-0">
        {/* Document Area - scrollable without visible scrollbar */}
        <div ref={docAreaRef} data-lenis-prevent="true" className="flex-1 h-full overflow-y-auto scroll-hidden p-6 md:p-10 text-center bg-[#e5e5e0] dark:bg-[#050704]/50">
          <div className="a4-paper curriculum-content relative my-4 mx-auto inline-block text-left w-full max-w-[210mm]">
            <AnimatePresence mode="wait">
              {displayedContent ? (
                <motion.div 
                  key="content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  dangerouslySetInnerHTML={{ __html: marked.parse(displayedContent) as string }} 
                />
              ) : loading ? (
                renderProgressIndicator()
              ) : (
                renderIdleState()
              )}
            </AnimatePresence>
          </div>

          {isGenerated && (
             <Button 
              onClick={() => handleSendMessage(true)}
              disabled={loading}
              className="mb-10 bg-white dark:bg-[#1a2315] border border-[#4d7537] text-[#4d7537] hover:bg-[#4d7537] hover:text-white rounded-full px-10 shadow-lg"
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
              Lanjutkan Penulisan
            </Button>
          )}
        </div>

        {/* Floating AI Toggle (Mobile Only) */}
        {!isSidebarOpen && (
          <Button 
            onClick={() => setIsSidebarOpen(true)}
            className="fixed bottom-6 right-6 z-[60] md:hidden w-14 h-14 rounded-full bg-[#4d7537] text-white shadow-2xl flex items-center justify-center p-0"
          >
            <Sparkles className="w-6 h-6" />
          </Button>
        )}

        {/* AI Sidebar */}
        <div className={`
          fixed inset-0 z-[100] md:relative md:inset-auto md:z-10
          w-full md:w-[350px] lg:w-[420px] 
          border-l border-[#dcdad1] dark:border-[#3f612d]/30 
          bg-white dark:bg-[#0a0a0a] flex flex-col 
          transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
        `}>
          <div className="p-5 border-b border-[#dcdad1] dark:border-[#3f612d]/20 bg-neutral-50/50 dark:bg-[#10140d]/50 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#4d7537]" />
            <h2 className="font-bricolage font-semibold text-neutral-900 dark:text-white">AI Assistant</h2>
            {loading && (
              <div className="ml-auto flex items-center gap-1.5 text-[10px] text-[#4d7537] font-medium">
                <Loader2 className="w-3 h-3 animate-spin" />
                {formatTime(elapsedTime)}
              </div>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden ml-auto text-neutral-400"
              onClick={() => setIsSidebarOpen(false)}
            >
              <ChevronLeft className="w-5 h-5 rotate-180" />
            </Button>
          </div>

          <div data-lenis-prevent="true" className="flex-1 h-full overflow-y-auto scroll-hidden p-5 space-y-4">
            {messages.length === 0 && !loading && (
              <div className="text-center text-neutral-400 text-sm mt-10 space-y-2">
                <Sparkles className="w-8 h-8 mx-auto opacity-30" />
                <p>AI Assistant siap membantu</p>
                <p className="text-xs text-neutral-300">Proses akan dimulai secara otomatis...</p>
              </div>
            )}
            
            {messages.map((m, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-neutral-100' : 'bg-[#4d7537]'}`}>
                   {m.role === 'user' ? <div className="text-[10px] font-bold">ME</div> : <Sparkles className="text-white w-4 h-4" />}
                </div>
                <div className={`p-3.5 rounded-xl text-sm leading-relaxed border max-w-[85%] ${
                  m.role === 'user' 
                    ? 'bg-[#4d7537] text-white border-[#4d7537]' 
                    : (m.text || '').startsWith("⏳")
                      ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-700/30'
                      : (m.text || '').startsWith("✅")
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-700/30'
                        : (m.text || '').startsWith("❌")
                          ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700/30'
                          : 'bg-neutral-100 dark:bg-[#1a2315] dark:text-[#d4e4c8] dark:border-[#3f612d]/30'
                }`}>
                  {(m.text || '').startsWith("⏳") && (
                    <Loader2 className="w-3 h-3 inline-block mr-1.5 animate-spin align-middle" />
                  )}
                  {(() => {
                    const rawText = (m.text || '').replace(/^[⏳✅❌]\s*/, '');
                    // Truncate long error messages
                    const displayText = rawText.length > 120 ? rawText.substring(0, 120) + '...' : rawText;
                    return displayText;
                  })()}
                </div>
              </motion.div>
            ))}

            {loading && messages.length > 0 && (
              <motion.div 
                className="flex gap-3" 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="w-8 h-8 rounded-full bg-[#4d7537] flex items-center justify-center shrink-0">
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                </div>
                <div className="bg-neutral-50 dark:bg-[#1a2315] p-3.5 rounded-xl border border-neutral-200 dark:border-[#3f612d]/30">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-[#4d7537] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-[#4d7537] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-[#4d7537] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <div className="p-5 pb-8 md:pb-5">
            <div className="relative flex items-center bg-neutral-50 dark:bg-[#151a11] border border-neutral-200 dark:border-[#3f612d]/40 rounded-xl p-1 shadow-sm">
              <Input 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Revisi draf ini..." 
                className="flex-1 border-none focus-visible:ring-0 text-sm"
              />
              <Button onClick={() => handleSendMessage()} disabled={loading} className="h-10 w-10 bg-[#4d7537] rounded-lg">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function WorkspacePage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-[#4d7537]" /></div>}>
      <WorkspaceContent />
    </Suspense>
  );
}
