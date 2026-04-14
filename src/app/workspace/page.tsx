"use client";

import React, { useState, Suspense, useEffect, useRef, useCallback } from "react";
import { marked } from "marked";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  BookOpen, ChevronLeft, Send, Sparkles, Download, 
  History, Loader2, CheckCircle2, Brain, FileText, 
  PenTool, Save, Clock, Zap, Folder, XCircle,
  Paperclip, Image as ImageIcon, X
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
  const [extracting, setExtracting] = useState(false);
  const [docContent, setDocContent] = useState("");
  const [displayedContent, setDisplayedContent] = useState("");
  const [isGenerated, setIsGenerated] = useState(false);
  const [progressStage, setProgressStage] = useState(-1);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string, image?: string | null}[]>([]);
  const hasStarted = useRef(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const contentRef = useRef("");
  const docAreaRef = useRef<HTMLDivElement>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  // Upload States
  const [attachedText, setAttachedText] = useState("");
  const [attachedFileName, setAttachedFileName] = useState("");
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs < 10 ? '0' : ''}${secs}s` : `${secs}s`;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExtracting(true);
    setAttachedFileName(file.name);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/extract", { method: "POST", body: formData });
      const data = await res.json();
      if (data.text) setAttachedText(data.text);
    } catch (err) { alert("Gagal membaca file."); } finally { setExtracting(false); }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setAttachedImage(reader.result as string);
    reader.readAsDataURL(file);
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

  const streamGenerate = useCallback(async (rawPrompt: string, appendToExisting = false, image?: string | null) => {
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
      { role: "ai", text: "⏳ Sedang memproses..." }
    ]);

    try {
      // If image exists, we must use Gemini Flash
      const currentModel = image ? "gemini" : model;
      
      const response = await fetch("/api/generate-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawPrompt, type: docType, model: currentModel, image }),
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
                { role: "ai", text: "✅ Selesai! Draf telah diperbarui." }
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
      const pendingImage = localStorage.getItem("pending_image");
      localStorage.removeItem("pending_image");
      const prompt = `Wawancara: ${context.replace(/\|/g, ". ")}. Buatkan dokumen ${docType} lengkap.`;
      streamGenerate(prompt, false, pendingImage);
    } else if (initialPrompt) {
      const pendingImage = localStorage.getItem("pending_image");
      localStorage.removeItem("pending_image");
      streamGenerate(initialPrompt, false, pendingImage);
    }
  }, [initialPrompt, context, docType, docId, streamGenerate]);

  const handleSendMessage = async (isContinue = false) => {
    if (loading || extracting) return;
    const isArabicDoc = displayedContent.includes('dir="rtl"') || displayedContent.includes('Noto Naskh Arabic');
    
    let textToSend = isContinue ? "Lanjutkan penulisan dari bagian terakhir." : chatInput;
    if (!textToSend.trim() && !attachedText && !attachedImage) return;

    if (!isContinue) {
      setMessages(prev => [...prev, { role: "user", text: textToSend, image: attachedImage }]);
    }
    
    let finalPrompt = textToSend;
    if (attachedText) {
      finalPrompt += `\n\nREFERENSI TAMBAHAN:\n${attachedText}`;
    }

    const contextPrompt = isContinue 
      ? `LANJUTKAN penulisan dokumen ${docType} ini. WAJIB tetap gunakan Bahasa ${isArabicDoc ? 'Arab Ber-Harokat' : 'Indonesia'} dan format yang sama. Konten terakhir: ${docContent.slice(-400)}`
      : `Berdasarkan draf sebelumnya dan instruksi baru ini: ${finalPrompt}. Revisi/perbarui dokumen ${docType}.`;

    const imgToUse = attachedImage;
    setChatInput("");
    setAttachedText("");
    setAttachedFileName("");
    setAttachedImage(null);
    
    if (isContinue) contentRef.current = docContent + "\n";
    await streamGenerate(contextPrompt, isContinue, imgToUse);
  };

  const exportToWord = () => {
    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><style>body { font-family: 'Times New Roman', serif; } table { width: 100%; border-collapse: collapse; border: 1px solid black; } th, td { border: 1px solid black; padding: 6px; } [dir="rtl"] { direction: rtl; text-align: right; }</style></head><body>`;
    const sourceHTML = header + docContent + "</body></html>";
    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const link = document.createElement("a");
    link.href = source; link.download = `Dekstorio_${docType}.doc`; link.click();
  };

  return (
    <div className="min-h-screen bg-[#f4f3ed] dark:bg-[#080b06] flex flex-col h-screen overflow-hidden">
      <nav className="flex items-center justify-between px-4 py-3 border-b border-[#dcdad1] dark:border-[#3f612d]/20 bg-white dark:bg-[#0a0a0a] z-50 shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-neutral-500"><ChevronLeft className="w-5 h-5" /></Button>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-[#4d7537] flex items-center justify-center"><BookOpen className="text-white w-4 h-4" /></div>
            <span className="font-bricolage font-semibold text-lg hidden sm:block">Dekstorio</span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button onClick={exportToWord} size="sm" className="bg-[#4d7537] text-white rounded-md"><Download className="w-4 h-4 mr-2" /> Export .doc</Button>
        </div>
      </nav>

      <main className="flex-1 flex overflow-hidden">
        <div className="flex-1 h-full overflow-y-auto p-6 md:p-10 text-center bg-[#e5e5e0] dark:bg-[#050704]/50 scroll-hidden">
          <div className="a4-paper curriculum-content relative my-4 mx-auto inline-block text-left w-full max-w-[210mm] bg-white p-10 min-h-[297mm] shadow-xl border">
            <AnimatePresence mode="wait">
              {displayedContent ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} dangerouslySetInnerHTML={{ __html: displayedContent.trim().startsWith("<") ? displayedContent : marked.parse(displayedContent) }} />
              ) : loading ? (
                <div className="flex flex-col items-center justify-center min-h-[800px]">
                    <Loader2 className="w-8 h-8 animate-spin text-[#4d7537] mb-4" />
                    <p className="text-neutral-500">AI sedang menyusun konten...</p>
                    <Button variant="outline" onClick={stopGeneration} className="mt-6 border-red-200 text-red-600 rounded-full px-8"><XCircle className="w-4 h-4 mr-2" /> Hentikan</Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[800px] opacity-20"><BookOpen className="w-20 h-20 mb-4" /><p>Menunggu Konteks...</p></div>
              )}
            </AnimatePresence>
          </div>
          {isGenerated && !loading && <Button onClick={() => handleSendMessage(true)} className="mb-20 bg-white border border-[#4d7537] text-[#4d7537] hover:bg-[#4d7537] hover:text-white rounded-full px-10 shadow-xl"><Sparkles className="w-4 h-4 mr-2" /> Lanjutkan Penulisan</Button>}
        </div>

        <div className={`fixed inset-0 z-[100] md:relative md:inset-auto md:z-10 w-full md:w-[400px] border-l border-[#dcdad1] dark:border-[#3f612d]/30 bg-white dark:bg-[#0a0a0a] flex flex-col transition-transform ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
          <div className="p-4 border-b bg-neutral-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-[#4d7537]" /><h2 className="font-semibold">AI Assistant</h2></div>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsSidebarOpen(false)}><XCircle className="w-5 h-5" /></Button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-neutral-100' : 'bg-[#4d7537] text-white'}`}>{m.role === 'user' ? 'ME' : <Sparkles className="w-4 h-4" />}</div>
                <div className={`p-3 rounded-2xl text-sm max-w-[85%] border ${m.role === 'user' ? 'bg-[#4d7537] text-white' : 'bg-neutral-50'}`}>
                  {m.image && <img src={m.image} className="w-full max-h-40 object-cover rounded-lg mb-2" />}
                  {m.text}
                </div>
              </div>
            ))}
            {loading && <div className="flex gap-3 animate-pulse"><div className="w-8 h-8 rounded-full bg-[#4d7537]/20" /><div className="bg-neutral-50 p-3 rounded-2xl w-24 h-12 border" /></div>}
          </div>
          <div className="p-4 bg-white border-t">
            {/* Attachment Preview Area */}
            {(attachedFileName || attachedImage) && (
              <div className="flex gap-2 mb-3">
                {attachedFileName && <div className="flex items-center gap-1 bg-neutral-100 px-2 py-1 rounded text-[10px]">{attachedFileName}<button onClick={() => setAttachedFileName("")}><X className="w-2 h-2" /></button></div>}
                {attachedImage && <div className="relative"><img src={attachedImage} className="w-10 h-10 object-cover rounded" /><button onClick={() => setAttachedImage(null)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"><X className="w-2 h-2" /></button></div>}
              </div>
            )}
            <div className="flex flex-col gap-2">
                <Input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Revisi draf ini..." className="border-none bg-neutral-50 focus-visible:ring-0" />
                <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,.docx" className="hidden" />
                        <input type="file" ref={imageInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                        <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} className="h-8 w-8 text-neutral-400 hover:text-[#4d7537]"><Paperclip className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => imageInputRef.current?.click()} className="h-8 w-8 text-neutral-400 hover:text-[#4d7537]"><ImageIcon className="w-4 h-4" /></Button>
                    </div>
                    <Button onClick={() => handleSendMessage()} disabled={loading || extracting} className="bg-[#4d7537] h-8 px-4 text-xs">Kirim</Button>
                </div>
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
