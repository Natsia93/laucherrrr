"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  BookOpen, Sparkles, Wand2, ArrowRight, FileText, 
  ChevronDown, Crown, Folder, Loader2, Image as ImageIcon, 
  Paperclip, X, CheckCircle 
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

    setExtracting(true);
    setAttachedFileName(file.name);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.text) {
        setAttachedText(data.text);
      }
    } catch (err) {
      console.error("Extraction error:", err);
      alert("Gagal membaca file.");
    } finally {
      setExtracting(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      router.push("/login");
      return;
    }
    if (!prompt.trim() && !attachedText && !attachedImage) return;
    
    setLoading(true);
    const params = new URLSearchParams();
    
    // Combine prompt with extracted text if exists
    let finalPrompt = prompt;
    if (attachedText) {
      finalPrompt += `\n\nREFERENSI MODUL/FILE:\n${attachedText.substring(0, 5000)}`;
    }
    
    params.append("prompt", finalPrompt);
    params.append("type", docType);
    if (attachedImage) {
        // We might need to handle images via session storage or local storage if too large for URL
        // but for now let's just push to workspace and handle state there.
        // Actually it's better to pass image to workspace via context.
        localStorage.setItem("pending_image", attachedImage);
    }
    
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
    },
    {
        title: "Template Modul Ajar Terbaru",
        linkText: "Lihat Semua",
        items: [
          { title: "Kurikulum Merdeka - Biologi SMA (Fase F)", author: "Dina Edu", type: "Pro", views: "5.4k" },
          { title: "Pendidikan Pancasila - SD (Fase A)", author: "Guru Juara", type: "Free", views: "20k" },
          { title: "Seni Budaya - SMP (Fase D)", author: "Kreatif Mengajar", type: "Free", views: "3.2k" },
          { title: "Fisika Lanjutan - SMA (Fase F)", author: "ScienceID", type: "Pro", views: "11k" }
        ]
      },
      {
        title: "Capaian Pembelajaran (CP) Siap Pakai",
        linkText: "Jelajahi",
        items: [
          { title: "Geografi Fase E - Lengkap dengan Indikator", author: "EduGeog", type: "Free", views: "8k" },
          { title: "Sejarah Fase F - Analisis Mendalam", author: "HistoriGuru", type: "Free", views: "6.1k" },
          { title: "Kimia Fase F - Praktikum Khusus", author: "LabKim", type: "Pro", views: "9k" },
          { title: "PJOK Fase B - Aktivitas Ritmik", author: "SportEdu", type: "Free", views: "4.5k" }
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

      <nav className={`fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 transition-all duration-300 ${scrolled ? "py-4 bg-[#f4f3ed]/60 dark:bg-[#080b06]/40 backdrop-blur-xl border-b border-[#dcdad1] dark:border-[#3f612d]/50" : "py-6 bg-transparent"}`}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-[#4d7537] flex items-center justify-center">
            <BookOpen className="text-white w-5 h-5" />
          </div>
          <span className="font-bricolage font-semibold text-lg tracking-tight hidden md:inline-block">Dekstorio</span>
        </div>
        
        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-1 bg-white dark:bg-[#10140d]/80 backdrop-blur-md rounded-lg p-1 border border-[#dcdad1] dark:border-[#3f612d]/30">
          <Link href="/dashboard"><Button variant="ghost" size="sm" className="text-neutral-500 dark:text-[#a2b591] hover:text-neutral-900 rounded-md"><Folder className="w-4 h-4 mr-2" />Penyimpanan File</Button></Link>
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
              <Avatar className="w-8 h-8 border border-neutral-300">
                <AvatarImage src={session.user.image || undefined} />
                <AvatarFallback>{session.user.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>
      </nav>

      <main className="relative z-10 flex-1 flex flex-col items-center pt-32 md:pt-48 pb-20 px-4">
        <div className="text-center space-y-6 max-w-5xl w-full flex flex-col items-center">
          <motion.h1 className="font-bricolage text-3xl sm:text-5xl md:text-6xl font-normal tracking-tight text-neutral-900 dark:text-[#f4f3ed] flex flex-col md:flex-row items-center justify-center gap-y-2 md:gap-x-4">
            <span>Buat Dokumen</span>
            <div className="relative min-w-[300px] md:min-w-[500px]">
              <AnimatePresence mode="wait">
                <motion.span key={heroWords[wordIndex]} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} transition={{ duration: 0.4 }} className="text-[#4d7537] font-semibold block">
                  {heroWords[wordIndex]}
                </motion.span>
              </AnimatePresence>
            </div>
          </motion.h1>
          <p className="font-sans text-neutral-600 dark:text-[#a2b591] text-lg max-w-2xl">Asisten AI perancang kurikulum lengkap, dari CP hingga LKPD. Siap export ke Word.</p>
        </div>

        {/* Prompt Input Area with Upload */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-12 w-full max-w-3xl relative z-10">
          <form onSubmit={handleSubmit} className="w-full bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800 p-4 flex flex-col gap-4 shadow-xl">
            
            {(attachedFileName || attachedImage) && (
              <div className="flex flex-wrap gap-2 mb-2">
                {attachedFileName && (
                  <div className="flex items-center gap-2 bg-[#4d7537]/10 text-[#4d7537] px-3 py-1.5 rounded-lg text-xs font-medium border border-[#4d7537]/20">
                    <FileText className="w-3.5 h-3.5" />
                    <span className="max-w-[150px] truncate">{attachedFileName}</span>
                    <button onClick={() => { setAttachedFileName(""); setAttachedText(""); }} className="hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
                  </div>
                )}
                {attachedImage && (
                  <div className="relative group">
                    <img src={attachedImage} className="w-16 h-16 object-cover rounded-lg border" />
                    <button onClick={() => setAttachedImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 shadow-md"><X className="w-3 h-3" /></button>
                  </div>
                )}
              </div>
            )}

            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Tuliskan mata pelajaran atau upload file modul Anda..."
              className="w-full bg-transparent border-none text-neutral-900 dark:text-[#f4f3ed] focus:ring-0 text-base md:text-lg min-h-[100px] outline-none resize-none"
            />
            
            <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-1">
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,.docx" className="hidden" />
                <input type="file" ref={imageInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                
                <Button type="button" variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} className="text-neutral-500 hover:text-[#4d7537] gap-2 px-2">
                  <Paperclip className="w-4 h-4" />
                  <span className="text-xs hidden sm:inline">Upload PDF/Word</span>
                  {extracting && <Loader2 className="w-3 h-3 animate-spin" />}
                </Button>
                
                <Button type="button" variant="ghost" size="sm" onClick={() => imageInputRef.current?.click()} className="text-neutral-500 hover:text-[#4d7537] gap-2 px-2">
                  <ImageIcon className="w-4 h-4" />
                  <span className="text-xs hidden sm:inline">Upload Media</span>
                </Button>

                <div className="h-4 w-px bg-neutral-200 mx-2"></div>

                <select value={docType} onChange={(e) => setDocType(e.target.value)} className="h-8 bg-transparent text-xs font-medium focus:ring-0 appearance-none cursor-pointer border-none text-[#4d7537]">
                  <option value="Modul Ajar">Modul Ajar</option>
                  <option value="CP">Capaian Pembelajaran</option>
                  <option value="ATP">Alur Tujuan Pembelajaran</option>
                  <option value="LKPD">LKPD</option>
                  <option value="PROTA">Program Tahunan</option>
                  <option value="PROSEM">Program Semester</option>
                </select>
              </div>
              
              <Button type="submit" disabled={(!prompt.trim() && !attachedText && !attachedImage) || loading || extracting} className="bg-neutral-900 dark:bg-[#4d7537] text-white hover:bg-[#4d7537] rounded-full px-6 gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-4 h-4" /> Generate Sekarang</>}
              </Button>
            </div>
          </form>
        </motion.div>
      </main>
      
      {/* ... keeping footer and other sections ... */}
      <footer className="border-t border-[#dcdad1] dark:border-[#3f612d]/20 mt-20 bg-neutral-50 dark:bg-[#080b06] py-12">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center text-xs text-neutral-500">
           <span>© 2026 Dekstorio AI</span>
        </div>
      </footer>
    </div>
  );
}
