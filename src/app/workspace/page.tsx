"use client";

import React, { useState, Suspense, useEffect, useRef, useCallback } from "react";
import { marked } from "marked";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  BookOpen, ChevronLeft, Send, Sparkles, Download, 
  History, Loader2, CheckCircle2, Brain, FileText, 
  PenTool, Save, Clock, Zap, Folder, XCircle,
  Paperclip, Image as ImageIcon, X, Plus, FileUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PROGRESS_STAGES = [
  { icon: Brain, label: "Menganalisis Konteks", description: "Membaca data dan file..." },
  { icon: FileText, label: "Menyusun Struktur", description: "Merancang kerangka dokumen..." },
  { icon: PenTool, label: "Menulis Konten", description: "AI sedang menulis detail..." },
  { icon: Save, label: "Finalisasi", description: "Menyimpan ke database..." },
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
  const contentRef = useRef("");
  const docAreaRef = useRef<HTMLDivElement>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const [attachedText, setAttachedText] = useState("");
  const [attachedFileName, setAttachedFileName] = useState("");
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const tableStyles = `
    .a4-paper {
      width: 210mm;
      max-width: 100%;
      min-height: 297mm;
      height: fit-content;
      background-color: white !important;
      color: black !important;
      box-shadow: 0 10px 40px rgba(0,0,0,0.15);
      border: 1px solid #d1d5db;
      padding: 20mm 15mm;
      margin: 40px auto;
      box-sizing: border-box;
      font-family: 'Times New Roman', Times, serif;
      font-size: 11pt;
      line-height: 1.5;
      text-align: left;
    }

    [dir="rtl"] .a4-paper {
       font-family: 'Noto Naskh Arabic', serif !important;
       text-align: right;
    }

    table { width: 100%; border-collapse: collapse; border: 2px solid black; margin-bottom: 20px; }
    th, td { border: 2px solid black; padding: 12px; vertical-align: top; }
    [dir="rtl"] td, [dir="rtl"] th { text-align: right; }
    
    .curriculum-content div { margin-bottom: 20px; }
    .curriculum-content h1, .curriculum-content h2 { border-bottom: none; font-weight: bold; }
  `;

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

  const streamGenerate = useCallback(async (rawPrompt: string, appendToExisting = false, image?: string | null) => {
    setLoading(true); setProgressStage(0);
    if (!appendToExisting) { setDisplayedContent(""); setDocContent(""); contentRef.current = ""; }
    const controller = new AbortController(); setAbortController(controller);

    try {
      const response = await fetch("/api/generate-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawPrompt, type: docType, model: image ? "gemini" : model, image }),
        signal: controller.signal
      });

      if (!response.ok) throw new Error("Gagal menyambung");
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
            if (data.type === "done") { setIsGenerated(true); }
          } catch {}
        }
      }
    } catch (err: any) { if (err.name !== 'AbortError') console.error(err); } 
    finally { setLoading(false); setProgressStage(-1); setAbortController(null); }
  }, [docType, model]);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;
    const pendingImage = typeof window !== 'undefined' ? localStorage.getItem("pending_image") : null;
    if (pendingImage) localStorage.removeItem("pending_image");
    const p = context ? `Wawancara: ${context.replace(/\|/g, ". ")}. Buatkan ${docType}.` : initialPrompt!;
    streamGenerate(p, false, pendingImage);
  }, [initialPrompt, context, docType, streamGenerate]);

  const handleSendMessage = async (isContinue = false) => {
    if (loading || extracting) return;
    const isArabicDoc = displayedContent.includes('dir="rtl"') || displayedContent.includes('Noto Naskh Arabic');
    let textToSend = isContinue ? "Lanjutkan penulisan." : chatInput;
    if (!isContinue) setMessages(prev => [...prev, { role: 'user', text: textToSend, image: attachedImage }]);
    
    const finalPrompt = isContinue 
      ? `LANJUTKAN ${docType}. Tetap Bahasa ${isArabicDoc ? 'Arab' : 'Indonesia'}. Conteks: ${docContent.slice(-400)}`
      : `${chatInput}. Ref: ${attachedText}`;
    const img = attachedImage;
    setChatInput(""); setAttachedText(""); setAttachedFileName(""); setAttachedImage(null);
    if (isContinue) contentRef.current = docContent + "\n";
    await streamGenerate(finalPrompt, isContinue, img);
  };

  return (
    <div className="flex flex-col h-screen bg-[#f4f3ed] dark:bg-[#080b06] overflow-hidden">
      <style>{tableStyles}</style>
      
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-3 bg-white dark:bg-[#0a0a0a] border-b border-[#dcdad1] dark:border-[#3f612d]/20 shrink-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-neutral-500 hover:text-[#4d7537]"><ChevronLeft className="w-5 h-5" /></Button>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-[#4d7537] flex items-center justify-center shadow-sm"><BookOpen className="text-white w-4 h-4" /></div>
            <span className="font-bricolage font-semibold text-xl tracking-tight">Dekstorio</span>
          </Link>
        </div>
        <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button onClick={() => {}} size="sm" className="bg-[#4d7537] text-white hover:bg-[#5a8b41] rounded-lg px-4 gap-2 transition-all"><Download className="w-4 h-4" /> Export .doc</Button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Document Editor Area - FORCED SCROLL */}
        <div 
          ref={docAreaRef}
          data-lenis-prevent="true"
          className="flex-1 overflow-y-auto bg-[#e5e5e0] dark:bg-[#050704]/90 p-4 md:p-8 scroll-smooth"
          style={{ overscrollBehavior: 'contain' }}
        >
          <div className="a4-paper curriculum-content mx-auto shadow-2xl">
            <AnimatePresence mode="wait">
              {displayedContent ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} dangerouslySetInnerHTML={{ __html: displayedContent.trim().startsWith("<") ? displayedContent : marked.parse(displayedContent) }} />
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[600px] gap-6">
                    <Loader2 className="w-12 h-12 animate-spin text-[#4d7537]" />
                    <p className="text-neutral-500 font-medium font-sans">AI Sedang Menyusun Dokumen Anda...</p>
                </div>
              )}
            </AnimatePresence>
          </div>
          {isGenerated && !loading && (
            <div className="flex justify-center pb-20 pt-10">
                <Button onClick={() => handleSendMessage(true)} className="bg-white dark:bg-neutral-900 border-2 border-[#4d7537] text-[#4d7537] hover:bg-[#4d7537] hover:text-white rounded-full px-12 py-6 shadow-2xl transition-all transform hover:scale-105 active:scale-95 text-lg font-bold">
                    <Sparkles className="w-5 h-5 mr-3" /> Lanjutkan Penulisan
                </Button>
            </div>
          )}
        </div>

        {/* AI Assistant Sidebar */}
        <div className="w-[420px] bg-white dark:bg-[#0a0a0a] border-l border-[#dcdad1] dark:border-[#3f612d]/30 flex flex-col hidden lg:flex shadow-xl">
          <div className="p-5 border-b border-[#f0f0f0] dark:border-neutral-800 flex items-center justify-between bg-neutral-50/10">
             <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-[#4d7537]" />
                <h2 className="font-bold text-sm tracking-wide">AI REVISION ASSISTANT</h2>
             </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5" data-lenis-prevent="true" style={{ overscrollBehavior: 'contain' }}>
            {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center opacity-20 gap-4 text-center">
                    <Sparkles className="w-16 h-16" />
                    <p className="text-sm">Tanyakan revisi atau tambahkan<br/>materi lewat chat ini.</p>
                </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`p-4 rounded-2xl text-sm max-w-[88%] shadow-sm ${m.role === 'user' ? 'bg-[#4d7537] text-white' : 'bg-neutral-100 dark:bg-neutral-900 border'}`}>
                    {m.image && <img src={m.image} className="w-full rounded-xl mb-3 shadow-inner" />}
                    {m.text}
                </div>
              </div>
            ))}
            {loading && <div className="flex gap-3 animate-pulse"><div className="bg-neutral-100 dark:bg-neutral-900 p-4 rounded-2xl w-32 h-12 border" /></div>}
          </div>

          {/* Input Area */}
          <div className="p-5 bg-white dark:bg-[#0a0a0a] border-t border-[#f0f0f0] dark:border-neutral-800">
            {(attachedFileName || attachedImage) && (
              <div className="flex gap-3 mb-4 flex-wrap">
                {attachedFileName && <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-900 px-3 py-1.5 rounded-lg text-xs font-semibold">{attachedFileName}<button onClick={() => setAttachedFileName("")} className="hover:text-red-500"><X className="w-3 h-3" /></button></div>}
                {attachedImage && <div className="relative"><img src={attachedImage} className="w-12 h-12 object-cover rounded-xl border-2 border-white shadow-md" /><button onClick={() => setAttachedImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg"><X className="w-2 h-2" /></button></div>}
              </div>
            )}
            
            <div className="flex items-center gap-3 bg-neutral-50 dark:bg-neutral-900 rounded-2xl p-2 border border-neutral-200 dark:border-neutral-800 transition-all focus-within:ring-2 focus-within:ring-[#4d7537]/20">
               <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,.docx" className="hidden" />
               <input type="file" ref={imageInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
               
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button type="button" variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-[#4d7537]/20 hover:text-[#4d7537] transition-all">
                      <Plus className="w-6 h-6" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56 p-2 rounded-2xl shadow-2xl border-neutral-100 dark:border-neutral-800">
                    <DropdownMenuItem onClick={() => fileInputRef.current?.click()} className="flex items-center gap-3 p-3 cursor-pointer rounded-xl hover:bg-[#4d7537]/10">
                      <FileUp className="w-5 h-5 text-[#4d7537]" />
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-[#4d7537]">Upload File</span>
                        <span className="text-[10px] text-neutral-400">PDF atau Word (.docx)</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => imageInputRef.current?.click()} className="flex items-center gap-3 p-3 cursor-pointer rounded-xl hover:bg-[#4d7537]/10">
                      <ImageIcon className="w-5 h-5 text-[#4d7537]" />
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-[#4d7537]">Upload Image</span>
                        <span className="text-[10px] text-neutral-400">Foto Buku / Catatan</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

               <Input 
                 value={chatInput} 
                 onChange={(e) => setChatInput(e.target.value)} 
                 onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} 
                 placeholder="Ketik revisi di sini..." 
                 className="border-none bg-transparent focus-visible:ring-0 text-sm h-10 shadow-none" 
               />
               
               <Button onClick={() => handleSendMessage()} size="icon" disabled={loading} className="h-10 w-10 rounded-full bg-[#4d7537] shadow-lg shadow-[#4d7537]/20 hover:scale-105 active:scale-95 transition-all">
                 <Send className="w-5 h-5" />
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
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-[#f4f3ed]"><Loader2 className="w-12 h-12 animate-spin text-[#4d7537]" /></div>}>
      <WorkspaceContent />
    </Suspense>
  );
}
