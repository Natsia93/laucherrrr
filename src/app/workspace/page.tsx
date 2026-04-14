"use client";

import React, { useState, Suspense, useEffect, useRef, useCallback } from "react";
import { marked } from "marked";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  BookOpen, ChevronLeft, Send, Sparkles, Download, 
  History, Loader2, CheckCircle2, Brain, FileText, 
  PenTool, Save, Clock, Zap, Folder, XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";

// Progress stages configuration
const PROGRESS_STAGES = [
  { icon: Brain, label: "Menganalisis Konteks", description: "Membaca dan memahami data wawancara Anda..." },
  { icon: FileText, label: "Menyusun Struktur", description: "Merancang kerangka dokumen kurikulum..." },
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
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const hasStarted = useRef(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const contentRef = useRef("");
  const docAreaRef = useRef<HTMLDivElement>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const tableStyles = `
    .scroll-hidden::-webkit-scrollbar { display: none; }
    .scroll-hidden { -ms-overflow-style: none; scrollbar-width: none; }

    .a4-paper {
      width: 210mm;
      max-width: 100%;
      min-height: 297mm;
      height: fit-content;
      background-color: white !important;
      color: black !important;
      box-shadow: 0 4px 24px rgba(0,0,0,0.12);
      border: 1px solid #d1d5db;
      padding: 15mm 10mm;
      box-sizing: border-box;
      font-family: 'Times New Roman', Times, serif;
      font-size: 11pt;
      line-height: 1.5;
    }

    @media (min-width: 768px) {
      .a4-paper { padding: 25mm 20mm; font-size: 12pt; }
    }

    .shimmer-bar {
      background: linear-gradient(90deg, #f0f0f0, #e0e0e0, #f0f0f0);
      background-size: 200% 100%;
      animation: shimmer 1.5s ease-in-out infinite;
    }
    @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  `;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs < 10 ? '0' : ''}${secs}s` : `${secs}s`;
  };

  const stopGeneration = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setLoading(false);
      setProgressStage(-1);
      setMessages(prev => [...prev.filter(m => !m.text.startsWith("⏳")), { role: "ai", text: "⏹️ Proses dihentikan oleh pengguna." }]);
    }
  };

  const streamGenerate = useCallback(async (rawPrompt: string, appendToExisting = false) => {
    setLoading(true);
    setProgressStage(0);
    setElapsedTime(0);
    
    if (!appendToExisting) {
      setDisplayedContent("");
      setDocContent("");
      contentRef.current = "";
    }

    const controller = new AbortController();
    setAbortController(controller);

    setMessages(prev => [
      ...prev.filter(m => !m.text.startsWith("⏳")), 
      { role: "ai", text: "⏳ Sedang menyusun konten..." }
    ]);

    try {
      const response = await fetch("/api/generate-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawPrompt, type: docType, model }),
        signal: controller.signal
      });

      if (!response.ok) throw new Error("Gagal menyambung ke server AI");

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
            if (data.type === "stage") setProgressStage(data.stage);
            if (data.type === "chunk") {
              contentRef.current += data.text;
              setDisplayedContent(contentRef.current);
              setDocContent(contentRef.current);
            }
            if (data.type === "done") {
              setIsGenerated(true);
              setMessages(prev => [
                ...prev.filter(m => !m.text.startsWith("⏳")), 
                { role: "ai", text: "✅ Selesai! Dokumen Anda sudah siap." }
              ]);
            }
            if (data.type === "error") throw new Error(data.message);
          } catch {}
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      setMessages(prev => [...prev.filter(m => !m.text.startsWith("⏳")), { role: "ai", text: `❌ Kesalahan: ${err.message}` }]);
    } finally {
      setLoading(false);
      setProgressStage(-1);
      setAbortController(null);
    }
  }, [docType, model]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loading) {
      timer = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [loading]);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    if (docId) {
      const fetchDoc = async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/documents/${docId}`);
          const data = await res.json();
          setDocContent(data.content);
          setDisplayedContent(data.content);
          contentRef.current = data.content;
          setIsGenerated(true);
          setMessages([{ role: "ai", text: `✅ Dokumen "${data.title}" berhasil dimuat.` }]);
        } catch (e) {} finally { setLoading(false); }
      };
      fetchDoc();
    } else if (context) {
      const prompt = `Wawancara: ${context.replace(/\|/g, ". ")}. Buatkan dokumen ${docType} lengkap sesuai kriteria Merdeka 046/2025.`;
      streamGenerate(prompt);
    } else if (initialPrompt) {
      streamGenerate(initialPrompt);
    }
  }, [initialPrompt, context, docType, docId, streamGenerate]);

  const handleSendMessage = async (isContinue = false) => {
    if (loading) return;
    const isArabicDoc = displayedContent.includes('dir="rtl"') || displayedContent.includes('Noto Naskh Arabic');
    
    const textToSend = isContinue 
      ? `Lanjutkan penulisan dokumen ${docType} ini. WAJIB tetap gunakan Bahasa ${isArabicDoc ? 'Arab Ber-Harokat (Tasykil)' : 'Indonesia'} dan format tabel yang sama. Mulai langsung dari materi berikutnya.` 
      : chatInput;
      
    if (!textToSend.trim()) return;
    
    const contextPrompt = isContinue 
      ? `KONTEKS PRODUKSI: Dokumen ${docType} dalam bahasa ${isArabicDoc ? 'Arab' : 'Indonesia'}. LANJUTKAN dari draf terakhir: ${docContent.slice(-400)}`
      : `Berdasarkan diskusi: ${textToSend}. Revisi draf ${docType} ini.`;

    if (!isContinue) setMessages(prev => [...prev, { role: "user", text: textToSend }]);
    setChatInput("");
    
    if (isContinue) contentRef.current = docContent + "\n";
    await streamGenerate(contextPrompt, isContinue);
  };

  const exportToWord = () => {
    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><style>
        body { font-family: 'Times New Roman', serif; }
        table { width: 100%; border-collapse: collapse; border: 1px solid black; }
        th, td { border: 1px solid black; padding: 6px; }
        [dir="rtl"] { direction: rtl; text-align: right; }
      </style></head><body>`;
    const sourceHTML = header + docContent + "</body></html>";
    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const link = document.createElement("a");
    link.href = source;
    link.download = `Dekstorio_${docType.replace(/ /g,'_')}.doc`;
    link.click();
  };

  const renderProgressIndicator = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center min-h-[800px] w-full py-12">
      <div className="relative w-16 h-16 mb-8">
        <div className="absolute inset-0 rounded-full bg-[#4d7537]/20 animate-ping" />
        <div className="relative w-16 h-16 rounded-full bg-[#4d7537] flex items-center justify-center shadow-lg">
          <Zap className="w-8 h-8 text-white" />
        </div>
      </div>
      <h3 className="text-xl font-bold text-[#2a4a1c] mb-2">AI Sedang Menyusun Dokumen</h3>
      <p className="text-sm text-neutral-500 mb-8 items-center flex gap-2">
        <Clock className="w-4 h-4" /> {formatTime(elapsedTime)}
      </p>
      
      <div className="w-full max-w-sm space-y-3 mb-10">
        {PROGRESS_STAGES.map((s, i) => (
          <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${i <= progressStage ? 'bg-[#4d7537]/5 border-[#4d7537]/20' : 'opacity-40 border-neutral-200'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${i <= progressStage ? 'bg-[#4d7537] text-white' : 'bg-neutral-100'}`}>
              {i < progressStage ? <CheckCircle2 className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
            </div>
            <span className="text-sm font-semibold">{s.label}</span>
          </div>
        ))}
      </div>

      <Button variant="outline" onClick={stopGeneration} className="border-red-200 text-red-600 hover:bg-red-50 rounded-full px-8 gap-2">
        <XCircle className="w-4 h-4" /> Hentikan Generate
      </Button>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[#f4f3ed] dark:bg-[#080b06] flex flex-col h-screen overflow-hidden">
      <style>{tableStyles}</style>
      <nav className="flex items-center justify-between px-4 py-3 border-b border-[#dcdad1] dark:border-[#3f612d]/20 bg-white dark:bg-[#0a0a0a] z-50 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-neutral-500"><ChevronLeft className="w-5 h-5" /></Button>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-[#4d7537] flex items-center justify-center"><BookOpen className="text-white w-4 h-4" /></div>
            <span className="font-bricolage font-semibold text-lg hidden sm:block">Dekstorio</span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button onClick={exportToWord} size="sm" className="bg-[#4d7537] text-white hover:bg-[#5a8b41] rounded-md"><Download className="w-4 h-4 mr-2" /> Export .doc</Button>
        </div>
      </nav>

      <main className="flex-1 flex overflow-hidden">
        <div ref={docAreaRef} className="flex-1 h-full overflow-y-auto p-6 md:p-10 text-center bg-[#e5e5e0] dark:bg-[#050704]/50 scroll-hidden">
          <div className="a4-paper curriculum-content relative my-4 mx-auto inline-block text-left w-full max-w-[210mm]">
            <AnimatePresence mode="wait">
              {displayedContent ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                  dangerouslySetInnerHTML={{ __html: displayedContent.trim().startsWith("<") ? displayedContent : marked.parse(displayedContent) }} 
                />
              ) : loading ? renderProgressIndicator() : (
                <div className="flex flex-col items-center justify-center min-h-[800px] opacity-20">
                   <BookOpen className="w-20 h-20 mb-4" />
                   <p>Menunggu Konteks...</p>
                </div>
              )}
            </AnimatePresence>
          </div>
          {isGenerated && !loading && (
            <Button onClick={() => handleSendMessage(true)} className="mb-20 bg-white dark:bg-[#1a2315] border border-[#4d7537] text-[#4d7537] hover:bg-[#4d7537] hover:text-white rounded-full px-10 shadow-xl">
              <Sparkles className="w-4 h-4 mr-2" /> Lanjutkan Penulisan
            </Button>
          )}
        </div>

        <div className={`fixed inset-0 z-[100] md:relative md:inset-auto md:z-10 w-full md:w-[380px] border-l border-[#dcdad1] dark:border-[#3f612d]/30 bg-white dark:bg-[#0a0a0a] flex flex-col transition-transform ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
          <div className="p-4 border-b bg-neutral-50/50 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#4d7537]" />
            <h2 className="font-semibold">AI Assistant</h2>
            <Button variant="ghost" size="icon" className="md:hidden ml-auto" onClick={() => setIsSidebarOpen(false)}><XCircle className="w-5 h-5" /></Button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-hidden">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-neutral-100' : 'bg-[#4d7537] text-white'}`}>
                  {m.role === 'user' ? 'ME' : <Sparkles className="w-4 h-4" />}
                </div>
                <div className={`p-3 rounded-2xl text-sm max-w-[85%] border ${m.role === 'user' ? 'bg-[#4d7537] text-white' : 'bg-neutral-50'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-[#4d7537]/20" />
                <div className="bg-neutral-50 p-3 rounded-2xl w-20 h-10 border" />
              </div>
            )}
          </div>
          <div className="p-4 bg-white border-t">
            <div className="relative flex items-center bg-neutral-50 border rounded-xl p-1">
              <Input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Revisi draf ini..." className="border-none focus-visible:ring-0" />
              <Button onClick={() => handleSendMessage()} disabled={loading} className="bg-[#4d7537]"><Send className="w-4 h-4" /></Button>
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
