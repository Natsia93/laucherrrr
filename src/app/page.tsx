"use client";

import React, { useState, useEffect } from "react";
import { BookOpen, Sparkles, Wand2, ArrowRight, FileText, ChevronDown, Crown, Folder, Loader2 } from "lucide-react";
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
  const [prompt, setPrompt] = useState("");
  const [docType, setDocType] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const [isReady, setIsReady] = useState(false);

  // Menggunakan kata-kata yang relevan
  const heroWords = ["Prosem & Prota", "CP, ATP & KKTP", "Perangkat Ajar", "Lembar Kerja PD"];

  useEffect(() => {
    // Coordination with Preloader
    const hasVisited = sessionStorage.getItem("hasVisited_App");
    const isHomePage = window.location.pathname === "/"; 
    const willShowPreloader = !hasVisited || isHomePage;

    if (willShowPreloader) {
      // Delay landing animations until preloader ripple starts revealing content
      // Preloader timing: 3.2s stroke + ~0.3s gap = ~3.5s
      const timer = setTimeout(() => setIsReady(true), 3500);
      return () => clearTimeout(timer);
    } else {
      setIsReady(true);
    }
  }, []);

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

  const navigation = ["Beranda", "Modul Ajar", "CP & ATP", "Prosem/Prota", "KKTP", "Harga", "Bantuan"];

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
    <div key="home-page-root" className="min-h-screen flex flex-col font-sans selection:bg-[#4d7537]/30 selection:text-neutral-900 dark:selection:text-white relative overflow-hidden transition-colors duration-300">
      
      {/* Background Grid & Glow Effect */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Rectangular Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808015_1px,transparent_1px),linear-gradient(to_bottom,#80808015_1px,transparent_1px)] bg-[size:160px_80px]"></div>
        {/* Glow */}
        <div className="absolute left-1/2 -translate-x-1/2 top-40 w-[600px] h-[400px] bg-[#4d7537]/10 dark:bg-[#3f612d]/20 rounded-full blur-[120px]"></div>
      </div>

      {/* Navbar */}
      <nav className={`fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 transition-all duration-300 ${scrolled ? "py-4 bg-[#f4f3ed]/60 dark:bg-[#080b06]/40 backdrop-blur-xl border-b border-[#dcdad1] dark:border-[#3f612d]/50 shadow-none" : "py-6 bg-transparent border-transparent"}`}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-[#4d7537] flex items-center justify-center">
            <BookOpen className="text-white w-5 h-5" />
          </div>
          <span className="font-bricolage font-semibold text-lg tracking-tight hidden md:inline-block">Dekstorio</span>
        </div>
        
        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-1 bg-white dark:bg-[#10140d]/80 backdrop-blur-md rounded-lg p-1 border border-[#dcdad1] dark:border-[#3f612d]/30">
          <Link href="/dashboard">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-neutral-500 dark:text-[#a2b591] hover:text-neutral-900 dark:hover:text-[#f4f3ed] hover:bg-neutral-100 dark:hover:bg-[#1a2315] rounded-md"
            >
              <Folder className="w-4 h-4 mr-2" />
              Penyimpanan File
            </Button>
          </Link>
          <Link href="/">
            <Button 
              variant="ghost" 
              size="sm" 
              className="bg-neutral-100 dark:bg-[#1a2315] text-neutral-900 dark:text-[#f4f3ed] hover:bg-neutral-200 dark:hover:bg-[#2c471c] hover:text-neutral-900 dark:hover:text-white rounded-md"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI Generate
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="h-6 w-px bg-neutral-300 dark:bg-[#3f612d]/30 hidden md:block mx-1"></div>
          
          {!isPending && !session && (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-neutral-500 dark:text-[#a2b591] hover:text-neutral-900 dark:hover:text-white font-medium text-sm transition-colors cursor-pointer">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-[#4d7537] text-white hover:bg-[#5a8b41] shadow-sm border border-[#4d7537] dark:border-[#6b9d4f]/50 font-medium px-4 py-1.5 text-sm rounded-md transition-all cursor-pointer">
                  Get Started
                </Button>
              </Link>
            </div>
          )}

          {session && !isPending && (
            <div className="flex items-center gap-3">
              <Link 
                href="/dashboard" 
                className="hidden md:block text-xs font-medium text-[#4d7537] hover:underline"
              >
                Dashboard
              </Link>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs font-medium text-neutral-500 hover:text-red-500 dark:text-[#a2b591] dark:hover:text-red-400"
                onClick={async () => {
                  await authClient.signOut();
                  router.refresh();
                }}
              >
                Sign Out
              </Button>
              <Avatar className="w-8 h-8 border border-neutral-300 dark:border-[#3f612d]/40">
                <AvatarImage src={session.user.image || undefined} />
                <AvatarFallback className="bg-neutral-100 dark:bg-[#1a2315] text-[#4d7537] text-[10px]">
                  {session.user.name?.substring(0, 2).toUpperCase() || "US"}
                </AvatarFallback>
              </Avatar>
            </div>
          )}

          {isPending && (
            <div className="flex items-center gap-2">
              <div className="w-20 h-8 rounded-md bg-neutral-200/50 dark:bg-[#1a2315]/50 animate-pulse"></div>
              <div className="w-24 h-8 rounded-md bg-neutral-200/50 dark:bg-[#1a2315]/50 animate-pulse"></div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center pt-32 md:pt-48 pb-20 px-4">
        <div className="text-center space-y-6 max-w-5xl w-full flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={isReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white dark:bg-[#1a2315] border border-[#dcdad1] dark:border-[#3f612d]/40 px-3 py-1.5 rounded-full text-[10px] sm:text-xs md:text-sm text-[#4d7537] dark:text-[#d4e4c8] shadow-sm mb-2"
          >
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-[#4d7537] dark:text-[#89b867]" />
            <span className="font-sans font-medium dark:font-normal">DeepSeek V3 & Gemini Flash Ready</span>
          </motion.div>
          
          <div className="w-full flex flex-col items-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={isReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.1, duration: 0.8 }}
              className="font-bricolage text-3xl sm:text-5xl md:text-6xl font-normal tracking-tight text-neutral-900 dark:text-[#f4f3ed] flex flex-col md:flex-row items-center justify-center gap-y-2 md:gap-x-4 md:pl-20"
            >
              <span>Buat Dokumen</span>
              <div className="relative h-[48px] sm:h-[60px] md:h-[80px] flex items-center justify-center md:justify-start min-w-[300px] md:min-w-[500px]">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={heroWords[wordIndex]}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="text-[#4d7537] dark:text-[#89b867] font-semibold whitespace-nowrap text-3xl sm:text-5xl md:text-6xl text-center md:text-left"
                  >
                    {heroWords[wordIndex]}
                  </motion.span>
                </AnimatePresence>
              </div>
            </motion.h1>
          </div>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={isReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="font-sans text-neutral-600 dark:text-[#a2b591] text-lg md:text-xl font-light max-w-2xl text-center mx-auto"
          >
            Asisten AI perancang CP, ATP, KKTP, Program Tahunan, Program Semester, hingga Lembar Kerja Peserta Didik (LKPD). Terstandarisasi dan siap export ke Word.
          </motion.p>
        </div>

        {/* Modern Prompt Input Box */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isReady ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mt-12 w-full max-w-3xl relative z-10"
        >
          {/* Main Box Area */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (!session) {
                router.push("/login");
                return;
              }
              if (!prompt.trim() || loading) return;
              
              setLoading(true);
              const params = new URLSearchParams();
              params.append("prompt", prompt);
              params.append("type", docType);
              router.push(`/generate?${params.toString()}`);
            }}
            className="w-full bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800 p-4 flex flex-col gap-4 shadow-sm hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
          >
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  e.currentTarget.form?.requestSubmit();
                }
              }}
              placeholder="Tuliskan mata pelajaran, jenjang, atau paste silabus di sini..."
              className="w-full bg-transparent border-none text-neutral-900 dark:text-[#f4f3ed] placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:ring-0 text-base md:text-lg outline-none resize-none min-h-[100px] font-sans"
            />
            
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative inline-block text-left">
                  <select 
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="h-9 pl-3 pr-8 rounded-none text-xs font-normal border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#141414] text-neutral-600 dark:text-[#a2b591] hover:text-neutral-900 dark:hover:text-white appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#4d7537] transition-all"
                  >
                    <option value="" disabled>Pilih Tipe Dokumen</option>
                    <option value="CP">Capaian Pembelajaran (CP)</option>
                    <option value="ATP">Alur Tujuan Pembelajaran (ATP)</option>
                    <option value="PROTA">Program Tahunan (PROTA)</option>
                    <option value="PROSEM">Program Semester (PROSEM)</option>
                    <option value="LKPD">LKPD</option>
                    <option value="KKTP">KKTP</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
                </div>
              </div>
              
              <Button 
                type="submit"
                size="icon" 
                disabled={!prompt.trim() || !docType || loading}
                className="h-10 w-10 rounded-none bg-neutral-900 dark:bg-neutral-800 text-white hover:bg-[#4d7537] transition-colors shrink-0 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
              </Button>
            </div>
          </form>
        </motion.div>

        {/* Quick Filters */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={isReady ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="flex flex-wrap justify-center gap-3 mt-8"
        >
          {[
            { label: "CP", value: "CP" },
            { label: "ATP", value: "ATP" },
            { label: "Prosem", value: "PROSEM" },
            { label: "Prota", value: "PROTA" },
            { label: "KKTP", value: "KKTP" },
            { label: "LKPD", value: "LKPD" },
          ].map((tag) => (
            <button 
              key={tag.label} 
              onClick={() => setDocType(tag.value)}
              className={`px-4 py-2 rounded-none border text-sm transition-colors font-sans ${docType === tag.value ? 'bg-[#4d7537]/10 border-[#4d7537] text-[#4d7537] dark:text-[#89b867] dark:border-[#6b9d4f] font-medium' : 'border-[#dcdad1] dark:border-[#3f612d]/30 text-neutral-600 dark:text-[#a2b591] hover:text-neutral-900 dark:hover:text-[#f4f3ed] hover:border-[#4d7537]/50 dark:hover:border-[#6b9d4f]/50 bg-white/50 dark:bg-[#10140d]/80'}`}
            >
              {tag.label}
            </button>
          ))}
        </motion.div>

        {/* Dekstorio Description Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-7xl mt-24 px-4 flex flex-col md:flex-row items-center gap-12"
        >
          <div className="flex-1 space-y-6 text-center md:text-left">
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
              className="font-bricolage text-3xl md:text-5xl font-normal tracking-tight text-neutral-900 dark:text-[#f4f3ed]"
            >
              Membantu Perancangan Kurikulum <br className="hidden md:block"/> 
              <span className="text-[#4d7537] dark:text-[#89b867]">Jauh Lebih Cepat.</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
              className="font-sans text-neutral-600 dark:text-[#a2b591] text-lg md:text-xl font-light leading-relaxed max-w-xl text-justify"
            >
              Dekstorio merupakan platform inovatif yang dirancang khusus untuk mendukung para pendidik dalam menyusun perangkat ajar secara sistematis, akurat, dan berstandar tinggi, baik di lingkungan sekolah maupun instansi pendidikan. Dengan mengintegrasikan teknologi kecerdasan buatan (AI) yang canggih serta mengacu pada regulasi kurikulum terbaru.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
              className="flex flex-wrap gap-4 justify-center md:justify-start pt-2"
            >
              <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-[#a2b591]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#4d7537]"></div>
                Standar Kurikulum Merdeka
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-[#a2b591]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#4d7537]"></div>
                Ekspor Word Instan
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-[#a2b591]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#4d7537]"></div>
                Terintegrasi DeepSeek V3
              </div>
            </motion.div>
          </div>
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
            className="flex-1 w-full max-w-xl"
          >
            <img 
              src="/mockuper.png" 
              alt="Dekstorio Interface" 
              className="w-full h-auto object-cover"
            />
          </motion.div>
        </motion.section>

        {/* Content Galleries */}
        <div className="w-full max-w-7xl mt-24 space-y-16">
          {sections.map((section, idx) => (
            <motion.section 
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.1 * idx }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between border-b border-neutral-200 dark:border-[#3f612d]/20 pb-4">
                <h2 className="font-bricolage text-xl md:text-2xl font-medium tracking-tight text-neutral-900 dark:text-[#f4f3ed]">{section.title}</h2>
                <Button variant="ghost" className="text-sm text-[#4d7537] dark:text-[#a2b591] hover:text-[#2c471c] dark:hover:text-[#f4f3ed] font-sans">
                  {section.linkText} <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {section.items.map((item, idx2) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: -60, filter: "blur(12px)" }}
                    whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ delay: 0.15 * idx2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Card className="group overflow-hidden bg-white dark:bg-[#10140d] border-[#dcdad1] dark:border-[#3f612d]/20 hover:border-[#4d7537]/40 dark:hover:border-[#6b9d4f]/40 transition-all cursor-pointer shadow-sm">
                    <div className="aspect-[4/3] bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-[#1a2315] dark:to-[#080b06] flex flex-col justify-between p-4 relative overflow-hidden">
                      {/* Subtle hover gradient inner */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[#4d7537]/5 dark:from-[#4d7537]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      
                      <div className="flex justify-between items-start z-10">
                        <Badge variant="outline" className={`bg-white/80 dark:bg-[#080b06]/50 backdrop-blur text-xs ${item.type === 'Pro' ? 'text-[#89b867] border-[#89b867]/30' : 'text-[#4d7537] dark:text-[#a2b591] border-[#4d7537]/30 dark:border-[#3f612d]/30'}`}>
                          {item.type}
                        </Badge>
                        <div className="p-1.5 rounded-md bg-white/80 dark:bg-[#080b06]/50 border border-[#dcdad1] dark:border-[#3f612d]/20 backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity">
                          <FileText className="w-4 h-4 text-[#4d7537] dark:text-[#89b867]" />
                        </div>
                      </div>
                      
                      <div className="space-y-2 z-10">
                        <h3 className="font-bricolage font-medium text-neutral-900 dark:text-[#f4f3ed] line-clamp-2 text-sm leading-snug">{item.title}</h3>
                        <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-[#a2b591] font-sans">
                          <div className="flex items-center gap-1.5">
                            <div className="w-4 h-4 rounded-full bg-neutral-200 dark:bg-[#1a2315] border border-neutral-300 dark:border-[#3f612d]/30 flex items-center justify-center text-[8px] text-neutral-700 dark:text-[#f4f3ed]">
                              {item.author[0]}
                            </div>
                            <span>{item.author}</span>
                          </div>
                          <span>{item.views} views</span>
                        </div>
                      </div>
                    </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#dcdad1] dark:border-[#3f612d]/20 mt-20 bg-neutral-50 dark:bg-[#080b06] relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#4d7537] flex items-center justify-center">
              <BookOpen className="text-white w-3 h-3" />
            </div>
            <span className="font-bricolage font-semibold text-sm text-neutral-900 dark:text-[#f4f3ed]">Dekstorio AI</span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-[#a2b591] text-center md:text-left font-sans">
            Platform AI asisten khusus guru untuk pembuatan kurikulum cerdas.
          </p>
          <div className="flex gap-4 text-xs text-neutral-500 dark:text-[#a2b591] font-sans">
            <a href="#" className="hover:text-neutral-900 dark:hover:text-[#f4f3ed] transition-colors">Privacy</a>
            <a href="#" className="hover:text-neutral-900 dark:hover:text-[#f4f3ed] transition-colors">Terms</a>
            <a href="#" className="hover:text-neutral-900 dark:hover:text-[#f4f3ed] transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
