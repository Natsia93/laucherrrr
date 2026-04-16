"use client";

import React, { useState, Suspense, useEffect, useRef, useCallback } from "react";
import { marked } from "marked";

// Configure marked synchronous mode (v18+)
marked.use({ async: false });
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  BookOpen, ChevronLeft, Sparkles, Download, 
  History, Loader2, CheckCircle2, Brain, FileText, 
  PenTool, Save, Clock, Zap, Folder, XCircle,
  ZoomIn, ZoomOut, PanelRightClose, PanelRightOpen,
  Plus, ArrowRight, Send, X, Paperclip, FileText as FileIcon,
  MessageSquare, FileEdit
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  const [assistantMode, setAssistantMode] = useState<'chat' | 'edit'>('chat');
  const [loading, setLoading] = useState(false);
  const [docContent, setDocContent] = useState("");
  const [docTitle, setDocTitle] = useState("");
  const [displayedContent, setDisplayedContent] = useState("");
  const [isGenerated, setIsGenerated] = useState(false);
  const [isCutOff, setIsCutOff] = useState(false);
  const [progressStage, setProgressStage] = useState(-1);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const hasStarted = useRef(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const contentRef = useRef("");
  const docAreaRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [attachments, setAttachments] = useState<{name: string, content: string, type: string}[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const streamGenerate = useCallback(async (rawPrompt: string, appendToExisting = false, rawContext?: string, isAssistantMode = false, forcedMode?: 'chat' | 'edit', isContinue = false) => {
    setLoading(true);
    
    // DETECT REVISION: Now based on manual forcedMode OR assistantMode
    const currentMode = forcedMode || assistantMode;
    const isAssistantRevision = isAssistantMode && currentMode === 'edit';
    setIsCutOff(false);

    if (!isAssistantMode) setProgressStage(0);
    setElapsedTime(0);
    
    const previousContent = contentRef.current;
    if (!appendToExisting && !isAssistantMode) {
      setDisplayedContent("");
      setDocContent("");
      contentRef.current = "";
    }

    const controller = new AbortController();
    setAbortController(controller);

    if (isAssistantMode) {
      setMessages(prev => [...prev, { role: "ai", text: "" }]);
    } else {
      setMessages(prev => [
        ...prev.filter(m => !m.text.startsWith("⏳")), 
        { role: "ai", text: "⏳ Sedang menyusun konten..." }
      ]);
    }

    let isPatchMode = false;
    let patchBuffer = "";
    let hasDecidedMode = false;
    let decisionBuffer = "";

    try {
      const response = await fetch("/api/generate-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({ 
          rawPrompt, 
          type: docType, 
          model, 
          rawContext, 
          messages: messages.slice(-6), 
          isAssistant: isAssistantMode,
          mode: isAssistantMode ? currentMode : 'doc',
          isContinue
        }),
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
            if (data.type === "status") {
              if (data.isCutOff) setIsCutOff(true);
            }
            if (data.type === "chunk") {
              if (!hasDecidedMode && isAssistantRevision) {
                decisionBuffer += data.text;
                
                const patchStartIdx = decisionBuffer.indexOf("[SMART_PATCH");
                const divStartIdx = decisionBuffer.toLowerCase().indexOf("<div");

                // If it's short and we don't see any clear markers yet, keep buffering
                if (decisionBuffer.length < 150 && patchStartIdx === -1 && divStartIdx === -1) {
                  break;
                }

                if (patchStartIdx !== -1 && (divStartIdx === -1 || patchStartIdx < divStartIdx)) {
                  isPatchMode = true;
                  patchBuffer = decisionBuffer;
                } else {
                  // Major edit - clear content
                  contentRef.current = "";
                  setDocContent("");
                  setDisplayedContent("");
                  
                  // If there was chatty preamble before the <div>, skip it
                  const cleanContent = divStartIdx !== -1 ? decisionBuffer.substring(divStartIdx) : decisionBuffer;
                  contentRef.current += cleanContent;
                  setDocContent(contentRef.current);
                  setDisplayedContent(contentRef.current);
                }
                hasDecidedMode = true;
                break;
              }

              if (isPatchMode) {
                patchBuffer += data.text;
              } else {
                contentRef.current += data.text;
                setDisplayedContent(contentRef.current);
                setDocContent(contentRef.current);
              }
            }

            if (data.type === "chat") {
              setMessages(prev => {
                const newMessages = [...prev];
                const last = newMessages[newMessages.length - 1];
                if (last && last.role === "ai") {
                  last.text += data.text;
                }
                return newMessages;
              });
            }

            if (data.type === "done") {
              if (!isAssistantMode) {
                // Handle case where stream ended before decision buffer reached threshold
                if (!hasDecidedMode && decisionBuffer) {
                   if (decisionBuffer.includes("[SMART_PATCH")) {
                     isPatchMode = true;
                     patchBuffer = decisionBuffer;
                   } else {
                     contentRef.current += decisionBuffer;
                     setDocContent(contentRef.current);
                     setDisplayedContent(contentRef.current);
                   }
                   hasDecidedMode = true;
                }

                if (isPatchMode && (patchBuffer || decisionBuffer)) {
                  const applySmartPatches = (current: string, patches: string) => {
                    let result = current;
                    const blocks = patches.split("[SMART_PATCH_START]");
                    blocks.forEach(block => {
                      if (!block.includes("[SMART_PATCH_END]")) return;
                      const sMatch = block.match(/SEARCH:\s*([\s\S]*?)\n\s*REPLACE:/);
                      const rMatch = block.match(/REPLACE:\s*([\s\S]*?)\n\s*\[SMART_PATCH_END\]/);
                      if (sMatch && rMatch) {
                        const s = sMatch[1].trim();
                        const r = rMatch[1].trim();
                        if (result.includes(s)) result = result.replace(s, r);
                      }
                    });
                    return result;
                  };
                  const finalContent = applySmartPatches(previousContent, patchBuffer || decisionBuffer);
                  contentRef.current = finalContent;
                  setDocContent(finalContent);
                  setDisplayedContent(finalContent);
                }

                setIsGenerated(true);
                setMessages(prev => [
                  ...prev.filter(m => !m.text.startsWith("⏳")), 
                  { role: "ai", text: isPatchMode ? "✅ Revisi minor telah diterapkan!" : "✅ Selesai! Dokumen sudah siap. Ingin revisi?" }
                ]);
                
                if (data.title) setDocTitle(data.title);
                if (data.docId) {
                  const newUrl = `${window.location.pathname}?id=${data.docId}`;
                  window.history.replaceState({ ...window.history.state, path: newUrl }, '', newUrl);
                }
              }
            }
            if (data.type === "error") {
              setMessages(prev => [...prev.filter(m => !m.text.startsWith("⏳")), { role: "ai", text: `❌ ${data.message}` }]);
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
  }, [docType, model, messages]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loading) {
      timer = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [loading]);

  // Auto-scroll chat to bottom when messages update
  useEffect(() => {
    if (chatScrollRef.current) {
      requestAnimationFrame(() => {
        chatScrollRef.current?.scrollTo({
          top: chatScrollRef.current.scrollHeight,
          behavior: 'smooth'
        });
      });
    }
  }, [messages]);

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
          setDocTitle(data.title);
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Format file terlalu besar. Maksimal 5MB.");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/extract-text", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.text) {
        setAttachments(prev => [...prev, {
          name: file.name,
          content: data.text,
          type: file.type.includes("image") ? "image" : "pdf"
        }]);
      } else if (data.error) {
        alert(data.error);
      }
    } catch (err) {
      alert("Gagal mengunggah file.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async (isContinue = false) => {
    if (loading) return;
    const isArabicDoc = displayedContent.includes('dir="rtl"') || displayedContent.includes('Noto Naskh Arabic');
    
    const textToSend = isContinue 
      ? `INI ADALAH KONTINUASI (LANJUTAN) DARI DRAF SEBELUMNYA. TUGAS ANDA HANYA MENERUSKAN ISI HTML YANG TERPOTONG.`
      : chatInput;
      
    if (!textToSend.trim() && attachments.length === 0) return;
    
    // Manual toggle mode
    const isAssistantMode = true;
    const isEditInstruction = assistantMode === 'edit';

    // Add attachments context if present
    let finalPrompt = textToSend;
    if (attachments.length > 0) {
      const attachmentText = attachments.map(a => `[REFERENSI FILE: ${a.name}]\n${a.content}`).join("\n\n");
      finalPrompt = `${textToSend}\n\nKONTEKS DARI FILE YANG DIUNGGAH:\n${attachmentText}`;
    }

    const contextPrompt = isContinue 
      ? `INI ADALAH BAGIAN AKHIR DARI DRAF SEBELUMNYA:\n\n[ ... ${docContent.slice(-1500)} ]\n\nTUGAS ANDA: LANJUTKAN DRAF HTML TERSEBUT DARI TITIK TERAKHIR.`
      : isAssistantMode 
        ? finalPrompt
        : `Revisi draf: ${finalPrompt}. Tetap pada jenis dokumen ${docType}.`;

    if (!isContinue) {
       setMessages(prev => [...prev.filter(m => !m.text.startsWith("⏳")), { role: "user", text: chatInput || (attachments.length > 0 ? `📄 Mengunggah ${attachments.length} file...` : "") }]);
    }
    
    setChatInput("");
    setAttachments([]);
    
    if (isContinue) {
      contentRef.current = docContent.replace(/(<\/td>|<\/tr>|<\/tbody>|<\/table>|<\/div>|<\/body>|<\/html>|\s+)$/gi, " ");
    }
    
    await streamGenerate(contextPrompt, isContinue, contentRef.current, isAssistantMode, assistantMode, isContinue);
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
        .scroll-hide { scrollbar-width: none; -ms-overflow-style: none; -webkit-overflow-scrolling: touch; }
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
        
        .markdown-chat h1, .markdown-chat h2, .markdown-chat h3 { font-weight: bold; margin-bottom: 0.5rem; margin-top: 1rem; }
        .markdown-chat p { margin-bottom: 0.75rem; }
        .markdown-chat ul, .markdown-chat ol { margin-left: 1.5rem; margin-bottom: 0.75rem; }
        .markdown-chat code { background: rgba(0,0,0,0.05); padding: 0.1rem 0.3rem; border-radius: 0.2rem; }
      `}</style>

      <nav className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50 transition-colors duration-300 shrink-0 relative">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-muted-foreground hover:bg-secondary"><ChevronLeft className="w-5 h-5" /></Button>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-[#4d7537] flex items-center justify-center"><BookOpen className="text-white w-5 h-5" /></div>
            <div className="flex flex-col">
              <span className="font-bricolage font-semibold text-lg leading-none text-foreground">Dekstorio</span>
              {docTitle && (
                <span className="text-[10px] text-muted-foreground font-medium truncate max-w-[120px] md:max-w-[200px] mt-0.5">
                  {docTitle}
                </span>
              )}
            </div>
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
            <Button variant="ghost" size="icon" onClick={() => handleZoom('out')} className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-xs font-bold text-muted-foreground w-10 text-center">{zoomLevel}%</span>
            <Button variant="ghost" size="icon" onClick={() => handleZoom('in')} className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <ZoomIn className="w-4 h-4" />
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

          {/* Continue Button below document - Now ONLY based on explicit isCutOff status */}
          {(isGenerated || docId) && !loading && assistantMode === 'edit' && isCutOff && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="mt-8 mb-12 flex justify-center"
            >
              <Button 
                onClick={() => handleSendMessage(true)} 
                className="px-12 py-6 bg-[#4d7537] text-white hover:bg-[#5a8b41] rounded-xl font-bold shadow-xl shadow-[#4d7537]/20 border-none transition-all active:scale-95 flex items-center gap-3"
              >
                <Sparkles className="w-5 h-5 animate-pulse" /> AI Terhenti? Lanjutkan Penulisan
              </Button>
            </motion.div>
          )}

          {/* Extra bottom space for scrolling */}
          {displayedContent && <div className="h-32" />}
        </div>

        {/* Sidebar */}
        <div className={`fixed inset-0 z-[100] md:relative md:inset-auto md:z-10 h-full border-l border-border bg-card flex flex-col transition-all duration-300 ${
          isSidebarOpen ? 'translate-x-0 w-full' : 'translate-x-full w-full md:translate-x-0'
        } ${isSidebarCollapsed ? 'md:w-0 md:border-l-0 md:overflow-hidden' : 'md:w-[420px]'}`}>
          <div className="py-3 px-5 border-b border-border bg-secondary/50 flex items-center justify-between">
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
          
          <div 
            ref={chatScrollRef} 
            data-lenis-prevent="true"
            className="flex-1 min-h-0 overflow-y-auto p-6 space-y-8 overflow-x-hidden"
            style={{ touchAction: 'pan-y', overscrollBehavior: 'contain' }}
          >
            {messages.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex flex-col gap-2 ${m.role === 'user' ? 'items-end text-right' : 'items-start text-left'}`}>
                {m.role === 'user' ? (
                  <div className="bg-[#4d7537]/80 backdrop-blur-md text-white px-4 py-2 rounded-lg rounded-tr-sm text-[14px] max-w-[85%] shadow-sm border border-white/5 leading-relaxed font-medium">
                    {m.text}
                  </div>
                ) : (
                  <div className="w-full text-foreground">
                    {m.text.startsWith("⏳") || m.text.startsWith("✅") || m.text.startsWith("❌") ? (
                      <div className="inline-flex items-center gap-2 bg-secondary/50 border border-border px-3 py-1.5 rounded-lg text-xs text-muted-foreground animate-pulse">
                        {m.text}
                      </div>
                    ) : (
                      <div 
                        className="markdown-chat prose prose-sm dark:prose-invert max-w-none text-[14px] leading-relaxed antialiased"
                        dangerouslySetInnerHTML={{ __html: marked.parse(m.text) }}
                      />
                    )}
                  </div>
                )}
              </motion.div>
            ))}

            {/* Continue Button removed from here */}

          </div>
          
          <div className="p-6 bg-transparent border-t border-border/50">
            {/* Attachment Preview */}
            <AnimatePresence>
              {attachments.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: 10 }}
                  className="flex flex-wrap gap-2 mb-4"
                >
                  {attachments.map((a, i) => (
                    <div key={i} className="flex items-center gap-2 bg-secondary/80 backdrop-blur-md border border-border rounded-lg px-3 py-1.5 text-xs">
                      <FileIcon className="w-3.5 h-3.5 text-[#4d7537]" />
                      <span className="max-w-[100px] truncate font-medium">{a.name}</span>
                      <button onClick={() => removeAttachment(i)} className="text-muted-foreground hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mode Toggle Compact */}
            <div className="flex justify-start mb-2 px-1">
              <div className="bg-secondary/40 backdrop-blur-sm p-0.5 rounded-md border border-border/50 flex items-center shadow-sm">
                <button 
                  onClick={() => setAssistantMode('chat')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] text-[11px] font-bold transition-all ${assistantMode === 'chat' ? 'bg-[#4d7537] text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <MessageSquare className="w-3 h-3" /> Tanya AI
                </button>
                <button 
                  onClick={() => setAssistantMode('edit')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] text-[11px] font-bold transition-all ${assistantMode === 'edit' ? 'bg-[#4d7537] text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <FileEdit className="w-3 h-3" /> Edit Dokumen
                </button>
              </div>
            </div>

            <div className="relative group transition-all">
              <div className="absolute inset-0 bg-[#4d7537]/5 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
              <div className="relative flex flex-col bg-[#f4f4f5] dark:bg-[#121212] border border-black/5 dark:border-white/5 rounded-lg p-1.5 transition-all focus-within:ring-1 focus-within:ring-[#4d7537]/20 shadow-sm dark:shadow-none">
                <Textarea 
                  value={chatInput} 
                  onChange={(e) => setChatInput(e.target.value)} 
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }} 
                  placeholder={assistantMode === 'edit' ? "Tulis instruksi revisi dokumen..." : "Tanya apa saja ke AI..."} 
                  className="border-none focus-visible:ring-0 text-sm bg-transparent text-foreground min-h-[40px] px-3 py-2 resize-none shadow-none" 
                />
                
                <div className="flex items-center justify-between px-2 pt-1 pb-1">
                  <div className="flex items-center gap-1">
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileUpload} 
                      className="hidden" 
                      accept=".pdf,.docx" 
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => fileInputRef.current?.click()} 
                      className="h-9 w-9 text-muted-foreground hover:text-[#4d7537] hover:bg-[#4d7537]/10 rounded-xl"
                      disabled={isUploading}
                    >
                      {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                    </Button>
                  </div>
                  
                  <Button 
                    onClick={() => handleSendMessage()} 
                    disabled={loading || (!chatInput.trim() && attachments.length === 0)} 
                    className={`h-9 w-9 rounded-lg transition-all ${chatInput.trim() || attachments.length > 0 ? 'bg-[#4d7537] text-white shadow-lg scale-100' : 'bg-transparent text-muted-foreground scale-90 opacity-40'}`}
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                  </Button>
                </div>
              </div>
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
