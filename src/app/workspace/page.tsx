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
    .scroll-hide {
      scrollbar-width: none !important;
      -ms-overflow-style: none !important;
    }
    .scroll-hide::-webkit-scrollbar {
      display: none !important;
    }

    .a4-paper {
      width: 210mm;
      max-width: 100%;
      min-height: 297mm;
      height: fit-content;
      background-color: white !important;
      color: black !important;
      box-shadow: 0 10px 50px rgba(0,0,0,0.5);
      border: 1px solid #333;
      padding: 15mm 10mm;
      box-sizing: border-box;
      font-family: 'Times New Roman', Times, serif;
      font-size: 11pt;
      line-height: 1.5;
    }

    @media (min-width: 768px) {
      .a4-paper { padding: 25mm 20mm; font-size: 12pt; }
    }
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
      setMessages(prev => [...prev.filter(m => !m.text.startsWith("⏳")), { role: "ai", text: "⏹️ Proses dihentikan." }]);
    }
  };

  const streamGenerate = useCallback(async (rawPrompt: string, appendToExisting = false) => {
    setLoading(true);
    setProgressStage(0);
    
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
        signal: controller.signal,
        body: JSON.stringify({ rawPrompt, type: docType, model }),
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
                { role: "ai", text: "✅ Dokumen berhasil disusun!" }
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
      const prompt = `Berdasarkan wawancara: ${context.replace(/\|/g, ". ")}. Buatkan dokumen ${docType} lengkap.`;
      streamGenerate(prompt);
    } else if (initialPrompt) {
      streamGenerate(initialPrompt);
    }
  }, [initialPrompt, context, docType, docId, streamGenerate]);

  const handleSendMessage = async (isContinue = false) => {
    if (loading) return;
    const isArabicDoc = displayedContent.includes('dir="rtl"') || displayedContent.includes('Noto Naskh Arabic');
    
    const textToSend = isContinue 
      ? `Lanjutkan penulisan dokumen ${docType} ini. WAJIB tetap gunakan Bahasa ${isArabicDoc ? 'Arab Ber-Harokat (Tasykil)' : 'Indonesia'} dan format yang sama. Sambung materi berikutnya.` 
      : chatInput;
      
    if (!textToSend.trim()) return;
    
    const contextPrompt = isContinue 
      ? `KONTEKS: Dokumen ${docType} ${isArabicDoc ? 'Arab' : 'Indonesia'}. LANJUTKAN dari draf terakhir: ${docContent.slice(-400)}`
      : `Revisi draf: ${textToSend}. Berdasarkan diskusi sebelumnya.`;

    if (!isContinue) setMessages(prev => [...prev, { role: "user", text: textToSend }]);
    setChatInput("");
    
    if (isContinue) contentRef.current = docContent + "\n";
    await streamGenerate(contextPrompt, isContinue);
  };

  const exportToWord = () => {
    const isArabicDoc = displayedContent.includes('dir="rtl"') || displayedContent.includes('Noto Naskh Arabic');
    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><style>
        body { font-family: 'Times New Roman', serif; }
        table { width: 100%; border-collapse: collapse; border: 1px solid black; }
        th, td { border: 1px solid black; padding: 6px; }
        [dir="rtl"] { direction: rtl; text-align: right; }
      </style></head><body>`;
    const sourceHTML = header + `<div ${isArabicDoc ? 'dir="rtl"' : 'dir="ltr"'}>` + docContent + "</div></body></html>";
    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const link = document.createElement("a");
    link.href = source;
    link.download = `Dekstorio_${docType.replace(/ /g,'_')}.doc`;
    link.click();
  };

  const renderProgressIndicator = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center min-h-[900px] w-full py-12">
      <div className="relative w-16 h-16 mb-8">
        <div className="absolute inset-0 rounded-full bg-[#4d7537]/20 animate-ping" />
        <div className="relative w-16 h-16 rounded-full bg-[#4d7537] flex items-center justify-center shadow-lg">
          <Zap className="w-8 h-8 text-white" />
        </div>
      </div>
      <h3 className="text-xl font-bold text-white mb-2 font-bricolage">AI Sedang Menyusun Dokumen</h3>
      <p className="text-sm text-neutral-400 mb-8 flex items-center gap-2">
        <Clock className="w-4 h-4" /> {formatTime(elapsedTime)}
      </p>
      
      <div className="w-full max-w-sm space-y-3 mb-10">
        {PROGRESS_STAGES.map((s, i) => (
          <div key={i} className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-500 ${i <= progressStage ? 'bg-[#4d7537]/10 border-[#4d7537]/30 shadow-sm' : 'opacity-20 border-white/10'}`}>
            <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-500 ${i <= progressStage ? 'bg-[#4d7537] text-white' : 'bg-white/5'}`}>
              {i < progressStage ? <CheckCircle2 className="w-5 h-5" /> : <s.icon className="w-4.5 h-4.5" />}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{s.label}</p>
              {i === progressStage && <p className="text-[10px] text-neutral-400">{s.description}</p>}
            </div>
          </div>
        ))}
      </div>

      <Button variant="outline" onClick={stopGeneration} className="border-red-500/30 text-red-500 hover:bg-red-500/10 rounded-full px-8 gap-2 transition-all active:scale-95 shadow-sm">
        <XCircle className="w-4 h-4" /> Hentikan Generate
      </Button>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col h-screen overflow-hidden text-neutral-200">
      <style>{tableStyles}</style>

      {/* Top Navbar - Forced Dark */}
      <nav className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-[#0a0a0a] z-50 shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-neutral-400 hover:bg-white/5">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Link href="/" className="flex items-center gap-2 px-1">
            <div className="w-8 h-8 rounded bg-[#4d7537] flex items-center justify-center shadow-md">
              <BookOpen className="text-white w-4.5 h-4.5" />
            </div>
            <span className="font-bricolage font-bold text-lg tracking-tight hidden sm:block">Dekstorio Editor</span>
          </Link>
        </div>

        <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-1 bg-white/5 rounded-lg p-1 border border-white/5 backdrop-blur-md">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="text-neutral-400 hover:text-white hover:bg-white/10 rounded-md">
              <Folder className="w-4 h-4 mr-2" /> Penyimpanan File
            </Button>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm" className="bg-[#4d7537] text-white rounded-md shadow-sm">
              <Sparkles className="w-4 h-4 mr-2" /> AI Generate
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button onClick={exportToWord} size="sm" className="bg-[#4d7537] text-white hover:bg-[#5a8b41] rounded-lg shadow-lg">
             <Download className="w-4 h-4 mr-2" /> Export .doc
          </Button>
        </div>
      </nav>

      <main className="flex-1 flex overflow-hidden min-h-0 relative">
        {/* Document Area - Hidden Scrollbar */}
        <div ref={docAreaRef} data-lenis-prevent="true" className="flex-1 h-full overflow-y-auto p-4 md:p-12 text-center bg-[#050505] scroll-hide">
          <div className="a4-paper curriculum-content relative my-4 mx-auto inline-block text-left w-full max-w-[210mm] shadow-[0_0_100px_rgba(0,0,0,0.8)] transition-all duration-300">
            <AnimatePresence mode="wait">
              {displayedContent ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                  dangerouslySetInnerHTML={{ __html: displayedContent.trim().startsWith("<") ? displayedContent : marked.parse(displayedContent) }} 
                />
              ) : loading ? renderProgressIndicator() : (
                <div className="flex flex-col items-center justify-center min-h-[900px] opacity-10 py-20">
                   <div className="w-20 h-20 rounded-3xl bg-white/5 mb-6 flex items-center justify-center">
                      <BookOpen className="w-10 h-10 text-white" />
                   </div>
                   <p className="font-semibold text-lg">Menunggu Konteks...</p>
                </div>
              )}
            </AnimatePresence>
          </div>
          {isGenerated && !loading && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-10 mb-20">
              <Button onClick={() => handleSendMessage(true)} className="bg-transparent border-2 border-[#4d7537] text-[#4d7537] hover:bg-[#4d7537] hover:text-white rounded-full px-12 h-14 font-bold shadow-2xl transition-all">
                <Sparkles className="w-5 h-5 mr-3" /> Lanjutkan Penulisan
              </Button>
            </motion.div>
          )}
        </div>

        {/* Sidebar Chat Area - Hidden Scrollbar */}
        <div className={`fixed inset-0 z-[100] md:relative md:inset-auto md:z-10 w-full md:w-[400px] border-l border-white/5 bg-[#0a0a0a] flex flex-col transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
          <div className="p-5 border-b border-white/5 bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-[#4d7537]/20 flex items-center justify-center"><Sparkles className="w-4 h-4 text-[#4d7537]" /></div>
               <h2 className="font-bold text-white font-bricolage">AI Assistant</h2>
            </div>
            {loading && <div className="text-[10px] text-[#4d7537] font-mono">{formatTime(elapsedTime)}</div>}
            <Button variant="ghost" size="icon" className="md:hidden text-neutral-400" onClick={() => setIsSidebarOpen(false)}><XCircle className="w-5 h-5" /></Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-5 space-y-5 scroll-hide" data-lenis-prevent="true">
            {messages.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
                className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-lg ${m.role === 'user' ? 'bg-white/5 border border-white/10 text-white' : 'bg-[#4d7537] text-white'}`}>
                  {m.role === 'user' ? <div className="text-[10px] font-bold">U</div> : <Sparkles className="w-4 h-4" />}
                </div>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed max-w-[85%] border shadow-lg ${
                  m.role === 'user' 
                    ? 'bg-[#4d7537] text-white border-[#4d7537]' 
                    : m.text.startsWith('⏳') ? 'bg-white/5 border-white/10 text-amber-500'
                    : 'bg-[#151515] border-white/5 text-neutral-300'
                }`}>
                  {m.text}
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="p-5 bg-[#0a0a0a] border-t border-white/5">
            <div className="relative flex items-center bg-white/5 border border-white/10 rounded-2xl p-1.5 shadow-inner">
              <Input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Tulis revisi di sini..." className="border-none focus-visible:ring-0 text-sm bg-transparent text-white" />
              <Button onClick={() => handleSendMessage()} disabled={loading} className="h-10 w-10 bg-[#4d7537] rounded-xl shadow-lg hover:scale-105 transition-all">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>
      
      {!isSidebarOpen && (
        <Button onClick={() => setIsSidebarOpen(true)} className="fixed bottom-6 right-6 z-50 md:hidden w-14 h-14 rounded-full bg-[#4d7537] text-white shadow-2xl flex items-center justify-center p-0">
          <Sparkles className="w-6 h-6" />
        </Button>
      )}
    </div>
  );
}

export default function WorkspacePage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-[#050505] text-[#4d7537]"><Loader2 className="w-12 h-12 animate-spin" /></div>}>
      <WorkspaceContent />
    </Suspense>
  );
}
