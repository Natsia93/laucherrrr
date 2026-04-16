"use client";

import React, { useState, Suspense, useEffect, useRef, useCallback } from "react";
import { marked } from "marked";

// Configure marked synchronous mode (v18+)
marked.use({ async: false });
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  BookOpen, ChevronLeft, Send, Sparkles, Download, 
  History, Loader2, CheckCircle2, Brain, FileText, 
  PenTool, Save, Clock, Zap, Folder, XCircle,
  ZoomIn, ZoomOut, PanelRightClose, PanelRightOpen
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const contentRef = useRef("");
  const docAreaRef = useRef<HTMLDivElement>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs < 10 ? '0' : ''}${secs}s` : `${secs}s`;
  };

  const handleZoom = (direction: 'in' | 'out') => {
    setZoomLevel(prev => {
      if (direction === 'in') return Math.min(prev + 10, 150);
      return Math.max(prev - 10, 50);
    });
  };

  const stopGeneration = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setLoading(false);
      setProgressStage(-1);
      setMessages(prev => [
        ...prev.filter(m => !m.text.startsWith("⏳")), 
        { role: "ai", text: "⏹️ Proses pembuatan dokumen telah dihentikan oleh Anda." }
      ]);
    }
  };

  const streamGenerate = useCallback(async (rawPrompt: string, appendToExisting = false, rawContext?: string) => {
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
        signal: controller.signal,
        body: JSON.stringify({ rawPrompt, type: docType, model, rawContext }),
      });

      if (!response.ok) throw new Error("Gagal menyambung ke AI");

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
                { role: "ai", text: "✅ Selesai! Dokumen sudah siap. Ingin revisi?" }
              ]);
              
              // PERBAIKAN: Update URL agar saat refresh tidak generate ulang
              if (data.docId) {
                const newUrl = `${window.location.pathname}?id=${data.docId}`;
                window.history.replaceState({ ...window.history.state, path: newUrl }, '', newUrl);
              }
            }
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
          setMessages([{ role: "ai", text: `✅ Dokumen berhasil dimuat.` }]);
        } catch (e) {} finally { setLoading(false); }
      };
      fetchDoc();
    } else if (context) {
      const prompt = `Wawancara: ${context.replace(/ _\|\|_ /g, ". ")}. Buatkan dokumen ${docType} LENGKAP.`;
      streamGenerate(prompt, false, context);
    } else if (initialPrompt) {
      streamGenerate(initialPrompt);
    }
  }, [initialPrompt, context, docType, docId, streamGenerate]);

  const handleSendMessage = async (isContinue = false) => {
    if (loading) return;
    const isArabicDoc = displayedContent.includes('dir="rtl"') || displayedContent.includes('Noto Naskh Arabic');
    
    const textToSend = isContinue 
      ? `INI ADALAH KONTINUASI (LANJUTAN) DARI DRAF SEBELUMNYA. 
         TUGAS ANDA HANYA MENERUSKAN ISI HTML YANG TERPOTONG. 
         
         DILARANG KERAS MELAKUKAN HAL BERIKUT:
         1. DILARANG membuat Kop Surat/Identitas baru.
         2. DILARANG membuat ulang tag header dokumen.
         3. DILARANG membuat ulang kerangka tabel dari awal jika sedang di tengah tabel.
         4. DILARANG menduplikasi/mengulang isi yang sudah ada di draf.
         5. DILARANG membuat kalimat pembuka atau penutup.
         
         Jika draf sebelumnya terpotong di tengah baris tabel, lanjutkan langsung elemen HTML (\`<tr>\`, \`<td>\`, dll) yang terpotong tersebut.
         LANGSUNG BERIKAN KELANJUTAN KONTEN HTML-NYA SAJA DARI TITIK TERAKHIR.
         
         Gunakan Bahasa ${isArabicDoc ? 'Arab Ber-Harokat (Full Tasykil) dan RTL' : 'Indonesia'}.
         WAJIB: Gunakan text-align: justify untuk narasi dan text-align: center untuk baris BAB pada tabel.`
      : chatInput;
      
    if (!textToSend.trim()) return;
    
    const contextPrompt = isContinue 
      ? `INI ADALAH BAGIAN AKHIR DARI DRAF SEBELUMNYA:\n\n[ ... ${docContent.slice(-1500)} ]\n\nTUGAS ANDA: LANJUTKAN DRAF HTML TERSEBUT DARI TITIK TERAKHIR. JANGAN MENGULANG KALIMAT TERAKHIR. LANGSUNG SAMBUNG KODE HTML-NYA.`
      : `Revisi draf: ${textToSend}. Tetap pada jenis dokumen ${docType}.`;

    if (!isContinue) setMessages(prev => [...prev, { role: "user", text: textToSend }]);
    setChatInput("");
    
    if (isContinue) {
      contentRef.current = docContent.replace(/(<\/td>|<\/tr>|<\/tbody>|<\/table>|<\/div>|<\/body>|<\/html>|\s+)$/gi, " ");
    }
    await streamGenerate(contextPrompt, isContinue);
  };

  const exportToWord = () => {
    const isArabic = displayedContent.includes('dir="rtl"') || displayedContent.includes('Noto Naskh Arabic');
    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><style>
        body { font-family: 'Times New Roman', serif; }
        table { width: 100%; border-collapse: collapse; border: 1px solid black; }
        th, td { border: 1px solid black; padding: 6px; }
        [dir="rtl"] { direction: rtl; text-align: right; font-family: 'Amiri', serif; }
      </style></head><body><div ${isArabic ? 'dir="rtl"' : 'dir="ltr"'}>`;
    const sourceHTML = header + docContent + "</div></body></html>";
    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const link = document.createElement("a");
    link.href = source;
    link.download = `Dekstorio_${docType.replace(/ /g,'_')}.doc`;
    link.click();
  };

  const renderProgressIndicator = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center min-h-[900px] w-full py-12 scroll-hide">
      <div className="relative w-16 h-16 mb-8">
        <div className="absolute inset-0 rounded-full bg-[#4d7537]/20 animate-ping" />
        <div className="relative w-16 h-16 rounded-full bg-[#4d7537] flex items-center justify-center shadow-lg">
          <Zap className="w-8 h-8 text-white" />
        </div>
      </div>
      <h3 className="text-xl font-bold text-foreground mb-2 font-bricolage tracking-tight">AI Sedang Menyusun Dokumen</h3>
      <p className="text-sm text-muted-foreground mb-10 flex items-center gap-2">
        <Clock className="w-4 h-4" /> {formatTime(elapsedTime)}
      </p>
      
      <div className="w-full max-w-sm space-y-3 mb-12">
        {PROGRESS_STAGES.map((s, i) => (
          <div key={i} className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-500 ${i <= progressStage ? 'bg-[#4d7537]/10 border-[#4d7537]/30 shadow-md' : 'opacity-20 border-border'}`}>
            <div className={`w-9 h-9 rounded-full flex items-center justify-center ${i <= progressStage ? 'bg-[#4d7537] text-white shadow-lg' : 'bg-secondary'}`}>
              {i < progressStage ? <CheckCircle2 className="w-5 h-5" /> : <s.icon className="w-4.5 h-4.5" />}
            </div>
            <div>
              <p className="text-sm font-bold text-foreground leading-none">{s.label}</p>
              {i === progressStage && <p className="text-[10px] text-muted-foreground mt-1">{s.description}</p>}
            </div>
          </div>
        ))}
      </div>

      <Button 
        variant="outline" 
        onClick={stopGeneration} 
        className="border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white rounded-full px-10 h-12 gap-2 shadow-2xl transition-all active:scale-95 bg-transparent"
      >
        <XCircle className="w-5 h-5" /> Batalkan Proses
      </Button>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col h-screen overflow-hidden text-foreground">
      <style>{`
        .scroll-hide { scrollbar-width: none; -ms-overflow-style: none; }
        .scroll-hide::-webkit-scrollbar { display: none; }
        .a4-paper {
          width: 210mm;
          min-height: 297mm;
          background: white !important;
          color: black !important;
          box-shadow: 0 40px 100px rgba(0,0,0,0.1);
          padding: 25mm 20mm;
          margin: 40px auto;
          font-family: 'Times New Roman', serif;
          font-size: 12pt;
          line-height: 1.5;
        }
        .curriculum-content { text-align: justify; }
        .curriculum-content table { border-collapse: collapse; width: 100%; border: 1px solid black; text-align: left; }
        .curriculum-content th, .curriculum-content td { border: 1px solid black; padding: 8px; vertical-align: top; }
        .curriculum-content [dir="rtl"] { direction: rtl; text-align: right; }
      `}</style>

      <nav className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50 transition-colors duration-300 shrink-0 relative">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-muted-foreground hover:bg-secondary"><ChevronLeft className="w-5 h-5" /></Button>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-[#4d7537] flex items-center justify-center"><BookOpen className="text-white w-5 h-5" /></div>
            <span className="font-bricolage font-semibold text-lg hidden md:inline-block text-foreground">Dekstorio</span>
          </Link>
        </div>

        {/* Center Toggle Navigation — layout matched, but colors back to grey */}
        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-1 bg-secondary/80 backdrop-blur-md rounded-lg p-1 border border-border">
          <Link href="/dashboard">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground hover:text-foreground hover:bg-background/50 rounded-md"
            >
              <Folder className="w-4 h-4 mr-2" />
              Penyimpanan File
            </Button>
          </Link>
          <Link href="/">
            <Button 
              variant="ghost" 
              size="sm" 
              className="bg-background text-foreground hover:bg-background/80 rounded-md shadow-sm"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI Generate
            </Button>
          </Link>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          {/* Zoom Controls */}
          <div className="hidden md:flex items-center gap-1 bg-secondary/80 rounded-lg p-1 border border-border">
            <Button variant="ghost" size="icon" onClick={() => handleZoom('out')} className="h-7 w-7 text-muted-foreground hover:text-foreground">
              <ZoomOut className="w-3.5 h-3.5" />
            </Button>
            <span className="text-[10px] font-bold text-muted-foreground w-8 text-center">{zoomLevel}%</span>
            <Button variant="ghost" size="icon" onClick={() => handleZoom('in')} className="h-7 w-7 text-muted-foreground hover:text-foreground">
              <ZoomIn className="w-3.5 h-3.5" />
            </Button>
          </div>

          <ThemeToggle />
          <Button onClick={exportToWord} size="sm" className="bg-[#4d7537] text-white hover:bg-[#5a8b41] shadow-lg shadow-[#4d7537]/20 border-none transition-all active:scale-95">
             <Download className="w-4 h-4 mr-2" /> Export .doc
          </Button>
        </div>
      </nav>

      <main className="flex-1 flex overflow-hidden min-h-0 relative">
        <div ref={docAreaRef} data-lenis-prevent="true" className="flex-1 h-full overflow-y-auto p-8 md:p-12 text-center bg-background scroll-hide">
          <div 
            className="a4-paper curriculum-content relative inline-block text-left w-full max-w-[210mm] origin-top transition-transform duration-200"
            style={{ transform: `scale(${zoomLevel / 100})` }}
          >
            <AnimatePresence mode="wait">
              {displayedContent ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                  dangerouslySetInnerHTML={{ __html: displayedContent.trim().startsWith("<") ? displayedContent : (marked.parse(displayedContent) as string) }} 
                />
              ) : loading ? renderProgressIndicator() : (
                <div className="flex flex-col items-center justify-center min-h-[900px] opacity-10 py-20">
                   <BookOpen className="w-16 h-16 text-foreground mb-4" />
                   <p className="text-xl font-bold">Menunggu Konteks...</p>
                </div>
              )}
            </AnimatePresence>
          </div>
          {/* Extra bottom space for scrolling */}
          {displayedContent && <div className="h-32" />}
        </div>

        {/* Sidebar */}
        <div className={`fixed inset-0 z-[100] md:relative md:inset-auto md:z-10 border-l border-border bg-card flex flex-col transition-all duration-300 ${
          isSidebarOpen ? 'translate-x-0 w-full' : 'translate-x-full w-full md:translate-x-0'
        } ${isSidebarCollapsed ? 'md:w-0 md:border-l-0 md:overflow-hidden' : 'md:w-[420px]'}`}>
          <div className="p-5 border-b border-border bg-secondary/50 flex items-center justify-between">
            <h2 className="font-bold text-lg text-foreground font-bricolage flex items-center gap-2"><Sparkles className="w-5 h-5 text-[#4d7537]" /> AI Assistant</h2>
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsSidebarCollapsed(true)} 
                className="hidden md:flex h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-background/50"
                title="Sembunyikan Sidebar"
              >
                <PanelRightClose className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground" onClick={() => setIsSidebarOpen(false)}><XCircle className="w-5 h-5" /></Button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-hide">
            {messages.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-lg ${m.role === 'user' ? 'bg-secondary text-foreground border border-border' : 'bg-[#4d7537] text-white'}`}>{m.role === 'user' ? 'U' : <Sparkles className="w-5 h-5" />}</div>
                <div className={`p-4 rounded-xl text-[13px] leading-relaxed max-w-[85%] border shadow-xl ${m.role === 'user' ? 'bg-[#4d7537]/70 backdrop-blur-md border-border text-white' : 'bg-secondary/50 border-border text-foreground'}`}>{m.text}</div>
              </motion.div>
            ))}

            {/* Continue Button inside sidebar */}
            {isGenerated && !loading && !docId && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-2">
                <Button 
                  onClick={() => handleSendMessage(true)} 
                  className="w-full bg-transparent border-2 border-[#4d7537] text-[#4d7537] hover:bg-[#4d7537] hover:text-white rounded-xl h-12 font-bold shadow-lg shadow-[#4d7537]/10 transition-all active:scale-95"
                >
                  <Sparkles className="w-4 h-4 mr-2" /> Lanjutkan Penulisan
                </Button>
              </motion.div>
            )}
          </div>
          
          <div className="p-6 bg-card border-t border-border">
            <div className="relative flex items-center bg-background border border-border rounded-xl p-2 shadow-inner">
              <Input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Tulis instruksi revisi..." className="border-none focus-visible:ring-0 text-sm bg-transparent text-foreground" />
              <Button onClick={() => handleSendMessage()} disabled={loading} className="h-11 w-11 bg-[#4d7537] rounded-lg shadow-lg transition-transform hover:scale-105"><Send className="w-5 h-5" /></Button>
            </div>
          </div>
        </div>
      </main>
      
      {/* Mobile FAB for sidebar */}
      {!isSidebarOpen && <Button onClick={() => setIsSidebarOpen(true)} className="fixed bottom-6 right-6 z-50 md:hidden w-16 h-16 rounded-full bg-[#4d7537] text-white shadow-2xl flex items-center justify-center p-0"><Sparkles className="w-8 h-8" /></Button>}
      
      {/* Desktop: Re-open sidebar button when collapsed */}
      {isSidebarCollapsed && (
        <Button 
          onClick={() => setIsSidebarCollapsed(false)} 
          className="hidden md:flex fixed top-20 right-4 z-50 h-9 w-9 rounded-lg bg-white dark:bg-[#10140d] border border-[#dcdad1] dark:border-[#3f612d]/30 text-muted-foreground hover:text-foreground hover:bg-neutral-100 dark:hover:bg-[#1a2315] shadow-lg transition-all p-0 items-center justify-center"
          title="Tampilkan Sidebar"
        >
          <PanelRightOpen className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}

export default function WorkspacePage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-background"><Loader2 className="w-12 h-12 animate-spin text-[#4d7537]" /></div>}>
      <WorkspaceContent />
    </Suspense>
  );
}
