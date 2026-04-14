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

    [dir="rtl"] .a4-paper {
       font-family: 'Noto Naskh Arabic', serif !important;
    }

    @media (min-width: 768px) {
      .a4-paper { padding: 25mm 20mm; font-size: 12pt; }
    }

    table { width: 100%; border-collapse: collapse; border: 1.5px solid black; margin-bottom: 20px; }
    th, td { border: 1.5px solid black; padding: 10px; text-align: left; vertical-align: top; }
    [dir="rtl"] td, [dir="rtl"] th { text-align: right; }
  `;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert("File maksimal 10MB"); return; }
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
    if (file.size > 5 * 1024 * 1024) { alert("Gambar maksimal 5MB"); return; }
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
    } catch (err: any) { if (err.name !== 'AbortError') alert(err.message); } 
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
    
    let finalPrompt = textToSend;
    if (attachedText) finalPrompt += `\n\nREF: ${attachedText}`;

    const contextPrompt = isContinue 
      ? `LANJUTKAN ${docType}. Tetap Bahasa ${isArabicDoc ? 'Arab' : 'Indonesia'}. Conteks: ${docContent.slice(-400)}`
      : finalPrompt;

    const img = attachedImage;
    setChatInput(""); setAttachedText(""); setAttachedFileName(""); setAttachedImage(null);
    if (isContinue) contentRef.current = docContent + "\n";
    await streamGenerate(contextPrompt, isContinue, img);
  };

  return (
    <div className="min-h-screen bg-[#f4f3ed] dark:bg-[#080b06] flex flex-col h-screen overflow-hidden">
      <style>{tableStyles}</style>
      <nav className="flex items-center justify-between px-4 py-3 border-b bg-white dark:bg-[#0a0a0a] z-50 shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}><ChevronLeft className="w-5 h-5" /></Button>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-[#4d7537] flex items-center justify-center"><BookOpen className="text-white w-4 h-4" /></div>
            <span className="font-bricolage font-semibold text-lg">Dekstorio</span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button onClick={() => {}} size="sm" className="bg-[#4d7537] text-white"><Download className="w-4 h-4 mr-2" /> Export .doc</Button>
        </div>
      </nav>

      <main className="flex-1 flex overflow-hidden">
        <div 
          ref={docAreaRef} 
          data-lenis-prevent="true"
          className="flex-1 h-full overflow-y-auto p-6 md:p-10 text-center bg-[#e5e5e0] dark:bg-[#050704]/80 scroll-smooth"
        >
          <div className="a4-paper curriculum-content relative my-4 mx-auto inline-block text-left w-full max-w-[210mm] shadow-2xl">
            <AnimatePresence mode="wait">
              {displayedContent ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} dangerouslySetInnerHTML={{ __html: displayedContent.trim().startsWith("<") ? displayedContent : marked.parse(displayedContent) }} />
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[600px]">
                    <Loader2 className="w-10 h-10 animate-spin text-[#4d7537] mb-4" />
                    <p className="text-neutral-500 font-medium font-sans">Menyusun dokumen...</p>
                </div>
              )}
            </AnimatePresence>
          </div>
          {isGenerated && !loading && (
            <div className="pb-20 pt-10">
                <Button onClick={() => handleSendMessage(true)} className="bg-white border-[#4d7537] text-[#4d7537] hover:bg-[#4d7537] hover:text-white rounded-full px-12 shadow-2xl scale-110">
                    <Sparkles className="w-4 h-4 mr-2" /> Lanjutkan Penulisan
                </Button>
            </div>
          )}
        </div>

        <div className="w-[400px] border-l bg-white dark:bg-[#0a0a0a] flex flex-col hidden md:flex">
          <div className="p-4 border-b flex items-center gap-2 bg-neutral-50/10"><Sparkles className="w-4 h-4 text-[#4d7537]" /><h2 className="font-semibold text-sm">AI Assistant</h2></div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4" data-lenis-prevent="true">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`p-3 rounded-2xl text-xs max-w-[85%] border ${m.role === 'user' ? 'bg-[#4d7537] text-white border-[#4d7537]' : 'bg-neutral-50 dark:bg-neutral-900 border-neutral-100 dark:border-neutral-800'}`}>
                    {m.image && <img src={m.image} className="w-full rounded-md mb-2" />}
                    {m.text}
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 bg-white dark:bg-[#0a0a0a] border-t">
            {(attachedFileName || attachedImage) && (
              <div className="flex gap-2 mb-3">
                {attachedFileName && <div className="flex items-center gap-1 bg-neutral-100 px-2 py-1 rounded text-[10px]">{attachedFileName}<button onClick={() => setAttachedFileName("")}><X className="w-2 h-2" /></button></div>}
                {attachedImage && <div className="relative"><img src={attachedImage} className="w-10 h-10 object-cover rounded" /><button onClick={() => setAttachedImage(null)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"><X className="w-2 h-2" /></button></div>}
              </div>
            )}
            <div className="flex items-center gap-2 bg-neutral-50 dark:bg-neutral-900 rounded-2xl p-1.5 border border-neutral-200 dark:border-neutral-800">
               <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,.docx" className="hidden" />
               <input type="file" ref={imageInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
               
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-[#4d7537]/20 hover:text-[#4d7537]">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48 p-1.5 rounded-xl">
                    <DropdownMenuItem onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2.5 p-2 cursor-pointer rounded-lg">
                      <FileUp className="w-4 h-4" />
                      <span className="text-xs font-medium">Buka File</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => imageInputRef.current?.click()} className="flex items-center gap-2.5 p-2 cursor-pointer rounded-lg">
                      <ImageIcon className="w-4 h-4" />
                      <span className="text-xs font-medium">Buka Media</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

               <Input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Revisi..." className="border-none bg-transparent focus-visible:ring-0 text-sm h-8" />
               <Button onClick={() => handleSendMessage()} size="icon" disabled={loading} className="h-8 w-8 rounded-full bg-[#4d7537]"><Send className="w-4 h-4" /></Button>
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
