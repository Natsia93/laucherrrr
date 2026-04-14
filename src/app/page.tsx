"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  BookOpen, Sparkles, Wand2, ArrowRight, FileText, 
  ChevronDown, Crown, Folder, Loader2, Image as ImageIcon, 
  Paperclip, X, Plus, FileUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Home() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [docType, setDocType] = useState("Modul Ajar");
  const [scrolled, setScrolled] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  
  // File upload states
  const [attachedText, setAttachedText] = useState("");
  const [attachedFileName, setAttachedFileName] = useState("");
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const heroWords = ["Prosem & Prota", "CP, ATP & KKTP", "Perangkat Ajar", "Lembar Kerja PD"];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % heroWords.length);
    }, 2500);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearInterval(interval);
    };
  }, [heroWords.length]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) { router.push("/login"); return; }
    if (!prompt.trim() && !attachedText && !attachedImage) return;
    
    setLoading(true);
    const params = new URLSearchParams();
    let finalPrompt = prompt;
    if (attachedText) finalPrompt += `\n\nREFERENSI FILE:\n${attachedText.substring(0, 5000)}`;
    
    params.append("prompt", finalPrompt);
    params.append("type", docType);
    if (attachedImage) localStorage.setItem("pending_image", attachedImage);
    
    router.push(`/generate?${params.toString()}`);
  };

  const sections = [
    {
      title: "Generasi Pilihan Pengguna",
      linkText: "Semua Generasi",
      items: [
        { title: "Matematika SD Kelas 4 - CP & ATP Lengkap", author: "Budi Guru", type: "CP & ATP", views: "12k" },
        { title: "Bahasa Inggris SMA Kelas 10 - Modul Ajar", author: "Rini Susanti", type: "Modul Ajar", views: "8k" },
        { title: "IPA SMP Kelas 8 - Prosem & Prota", author: "Ahmad", type: "Prota", views: "15k" }
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-[#4d7537]/30 selection:text-neutral-900 dark:selection:text-white relative overflow-hidden transition-colors duration-300">
      
      {/* Background Grid & Glow */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808015_1px,transparent_1px),linear-gradient(to_bottom,#80808015_1px,transparent_1px)] bg-[size:160px_80px]"></div>
        <div className="absolute left-1/2 -translate-x-1/2 top-40 w-[600px] h-[400px] bg-[#4d7537]/10 dark:bg-[#3f612d]/20 rounded-full blur-[120px]"></div>
      </div>

      <nav className={`fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 transition-all duration-300 ${scrolled ? "py-4 bg-[#f4f3ed]/60 dark:bg-[#080b06]/40 backdrop-blur-xl border-b border-[#dcdad1] dark:border-[#3f612d]/50 shadow-none" : "py-6 bg-transparent"}`}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-[#4d7537] flex items-center justify-center">
            <BookOpen className="text-white w-5 h-5" />
          </div>
          <span className="font-bricolage font-semibold text-lg tracking-tight hidden md:inline-block">Dekstorio</span>
        </div>
        
        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-1 bg-white dark:bg-[#10140d]/80 backdrop-blur-md rounded-lg p-1 border border-[#dcdad1] dark:border-[#3f612d]/30">
          <Link href="/dashboard"><Button variant="ghost" size="sm" className="text-neutral-500 rounded-md"><Folder className="w-4 h-4 mr-2" />Penyimpanan File</Button></Link>
          <Link href="/"><Button variant="ghost" size="sm" className="bg-neutral-100 dark:bg-[#1a2315] text-neutral-900 rounded-md"><Sparkles className="w-4 h-4 mr-2" />AI Generate</Button></Link>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {!isPending && !session && (
            <div className="flex items-center gap-2">
              <Link href="/login"><Button variant="ghost" size="sm">Sign In</Button></Link>
              <Link href="/register"><Button size="sm" className="bg-[#4d7537] text-white">Get Started</Button></Link>
            </div>
          )}
          {session && !isPending && (
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="text-xs font-medium text-[#4d7537] hover:underline">Dashboard</Link>
              <Avatar className="w-8 h-8 border border-neutral-300 dark:border-[#3f612d]/40">
                <AvatarImage src={session.user.image || undefined} />
                <AvatarFallback>{session.user.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>
      </nav>

      <main className="relative z-10 flex-1 flex flex-col items-center pt-32 md:pt-48 pb-20 px-4">
        <div className="text-center space-y-6 max-w-5xl w-full flex flex-col items-center">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 bg-white dark:bg-[#1a2315] border border-[#dcdad1] dark:border-[#3f612d]/40 px-3 py-1.5 rounded-full text-xs text-[#4d7537] shadow-sm mb-2">
            <Sparkles className="w-4 h-4" />
            <span>DeepSeek V3 & Gemini Flash Ready</span>
          </motion.div>
          
          <motion.h1 className="font-bricolage text-3xl sm:text-5xl md:text-6xl font-normal tracking-tight text-neutral-900 dark:text-[#f4f3ed] flex flex-col md:flex-row items-center justify-center gap-x-4">
            <span>Buat Dokumen</span>
            <AnimatePresence mode="wait">
              <motion.span key={heroWords[wordIndex]} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} transition={{ duration: 0.4 }} className="text-[#4d7537] font-semibold">
                {heroWords[wordIndex]}
              </motion.span>
            </AnimatePresence>
          </motion.h1>
          <p className="font-sans text-neutral-600 dark:text-[#a2b591] text-lg max-w-2xl text-center">Asisten AI perancang kurikulum lengkap, dari CP hingga LKPD. Standar Merdeka 046/2025.</p>
        </div>

        {/* Improved Prompt Box with Plus Menu */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-12 w-full max-w-3xl relative z-10">
          <form onSubmit={handleSubmit} className="w-full bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800 p-4 flex flex-col gap-4 shadow-2xl rounded-2xl">
            
            {(attachedFileName || attachedImage) && (
              <div className="flex flex-wrap gap-2 mb-1">
                {attachedFileName && (
                  <div className="flex items-center gap-2 bg-[#4d7537]/10 text-[#4d7537] px-3 py-1.5 rounded-xl text-xs font-medium border border-[#4d7537]/20">
                    <FileText className="w-3.5 h-3.5" />
                    <span className="max-w-[150px] truncate">{attachedFileName}</span>
                    <button type="button" onClick={() => { setAttachedFileName(""); setAttachedText(""); }} className="hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
                  </div>
                )}
                {attachedImage && (
                  <div className="relative group">
                    <img src={attachedImage} className="w-12 h-12 object-cover rounded-xl border" />
                    <button type="button" onClick={() => setAttachedImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 shadow-md"><X className="w-3 h-3" /></button>
                  </div>
                )}
              </div>
            )}

            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Tuliskan mata pelajaran atau upload file modul Anda..."
              className="w-full bg-transparent border-none text-neutral-900 dark:text-[#f4f3ed] focus:ring-0 text-lg min-h-[120px] outline-none resize-none px-2"
            />
            
            <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-900 px-2">
              <div className="flex items-center gap-3">
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,.docx" className="hidden" />
                <input type="file" ref={imageInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                
                <div className="relative group">
                  <select value={docType} onChange={(e) => setDocType(e.target.value)} className="h-9 px-4 rounded-xl bg-neutral-100 dark:bg-neutral-900 border-none text-xs font-semibold text-[#4d7537] focus:ring-1 focus:ring-[#4d7537]/30 appearance-none pr-10 cursor-pointer">
                    <option value="Modul Ajar">Pilih Tipe Dokumen</option>
                    <option value="CP">Capaian Pembelajaran (CP)</option>
                    <option value="ATP">Alur Tujuan Pembelajaran (ATP)</option>
                    <option value="LKPD">LKPD</option>
                    <option value="PROTA">Program Tahunan</option>
                    <option value="PROSEM">Program Semester</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#4d7537] pointer-events-none" />
                </div>

                <div className="h-6 w-px bg-neutral-200 dark:bg-neutral-800 mx-1"></div>

                {/* Modern Plus Menu - NOW ON THE RIGHT */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button type="button" variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-[#4d7537]/20 hover:text-[#4d7537]">
                      <Plus className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56 p-2 rounded-xl shadow-2xl border-neutral-100 dark:border-neutral-800">
                    <DropdownMenuItem onClick={() => fileInputRef.current?.click()} className="flex items-center gap-3 p-2.5 cursor-pointer rounded-lg hover:bg-[#4d7537]/10">
                      <FileUp className="w-4 h-4 text-[#4d7537]" />
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">Upload File</span>
                        <span className="text-[10px] text-neutral-400">PDF atau Word (.docx)</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => imageInputRef.current?.click()} className="flex items-center gap-3 p-2.5 cursor-pointer rounded-lg hover:bg-[#4d7537]/10">
                      <ImageIcon className="w-4 h-4 text-[#4d7537]" />
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">Upload Media</span>
                        <span className="text-[10px] text-neutral-400">Gambar/Foto Modul</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <Button type="submit" disabled={(!prompt.trim() && !attachedText && !attachedImage) || loading || extracting} className="bg-neutral-900 dark:bg-[#4d7537] text-white hover:bg-[#4d7537] rounded-full px-8 gap-2 h-10 shadow-lg shadow-[#4d7537]/20">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
              </Button>
            </div>
          </form>
        </motion.div>

        {/* Quick Tags */}
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          {["CP", "ATP", "Prosem", "Prota", "KKTP", "LKPD"].map((tag) => (
            <button key={tag} className="px-5 py-2 rounded-full border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500 hover:text-[#4d7537] hover:border-[#4d7537] transition-all bg-white dark:bg-black/20">
              {tag}
            </button>
          ))}
        </div>
      </main>

      <footer className="border-t border-neutral-200 dark:border-neutral-900 mt-20 py-12 bg-neutral-50 dark:bg-transparent">
        <div className="max-w-7xl mx-auto px-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#4d7537] flex items-center justify-center"><BookOpen className="text-white w-3 h-3" /></div>
            <span className="font-bricolage font-semibold text-sm">Dekstorio AI</span>
          </div>
          <p className="text-[10px] text-neutral-400">© 2026 Dekstorio AI. Semua Hak Dilindungi.</p>
        </div>
      </footer>
    </div>
  );
}
