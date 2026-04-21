"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Sparkles, ArrowRight, Loader2, Plus, ArrowLeft, Zap, Brain, CheckCircle2, FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

interface Question {
  id: number;
  question: string;
  type: "chips" | "multi-chips" | "text" | "file" | "month-range";
  options?: string[];
  placeholder?: string;
  category: string;
}

function GenerateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prompt = searchParams.get("prompt") || "";
  const docType = searchParams.get("type") || "Kurikulum";

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [skipped, setSkipped] = useState<number[]>([]);
  const [showOther, setShowOther] = useState<Record<number, boolean>>({});
  const [selectedModel, setSelectedModel] = useState("deepseek");
  const [fileExtracting, setFileExtracting] = useState<Record<number, boolean>>({});
  const [showSummary, setShowSummary] = useState(false);

  const mandatoryQuestions: Question[] = [
    { 
      id: 1001, 
      question: "Mata Pelajaran apa yang ingin Anda rancang?", 
      type: "text", 
      placeholder: "Misal: Matematika, Bahasa Arab, IPA, Fisika...", 
      category: "mandatory" 
    },
    { 
      id: 1002, 
      question: "Pilih Kelas:", 
      type: "chips", 
      options: ["Kelas 1", "Kelas 2", "Kelas 3", "Kelas 4", "Kelas 5", "Kelas 6", "Kelas 7", "Kelas 8", "Kelas 9", "Kelas 10", "Kelas 11", "Kelas 12"], 
      category: "mandatory" 
    },
    { 
      id: 1003, 
      question: "Pilih Fase:", 
      type: "chips", 
      options: ["Fase A", "Fase B", "Fase C", "Fase D", "Fase E", "Fase F"], 
      category: "mandatory" 
    },
    {
      id: 1005,
      question: "Berapa alokasi Jam Pelajaran (JP) dalam SATU BAB? (Misal: 9 JP, AI akan membagi jadi 3+4+2 per baris)",
      type: "chips",
      options: ["4 JP", "6 JP", "9 JP", "12 JP", "Sesuai Kurikulum"],
      category: "mandatory"
    }
  ];

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch("/api/generate-questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, docType })
        });
        const data = await response.json();
        
        let initialQuestions = [...mandatoryQuestions];

        if (["Capaian Pembelajaran (CP)", "CP"].includes(docType)) {
           // CP tidak butuh JP (1005) dan tidak butuh Semester (1004)
           initialQuestions = initialQuestions.filter(q => q.id !== 1005);
        }

        if (docType === "PROSEM") {
           initialQuestions.push({
              id: 1006,
              question: "Rentang Bulan Pelaksanaan Program Semester?",
              type: "month-range",
              category: "mandatory"
           });
        }

        if (docType === "KKTP") {
           // KKTP tidak butuh JP (1005) tapi butuh Semester (1004)
           initialQuestions = initialQuestions.filter(q => q.id !== 1005);
           initialQuestions.push({
              id: 1004,
              question: "Pilih Semester yang ingin di-generate:",
              type: "chips",
              options: ["Semester Ganjil", "Semester Genap"],
              category: "mandatory"
           });
        }

        if (docType === "LKPD") {
           initialQuestions = initialQuestions.filter(q => q.id !== 1005);
           initialQuestions.push({
              id: 2000,
              question: "Pilih Bahasa untuk LKPD ini:",
              type: "chips",
              options: ["Bahasa Indonesia", "Bahasa Arab", "Bahasa Inggris"],
              category: "data"
           });
           initialQuestions.push({
              id: 2001,
              question: "Apa materi spesifik yang ingin diujikan?",
              type: "text",
              placeholder: "Misal: Rantai Makanan, Thaharah, Persamaan Kuadrat...",
              category: "data"
           });
           initialQuestions.push({
              id: 2002,
              question: "Jumlah Soal Pilihan Ganda (PG):",
              type: "chips",
              options: ["0 Soal", "5 Soal", "10 Soal", "15 Soal"],
              category: "data"
           });
           initialQuestions.push({
              id: 2003,
              question: "Jumlah Soal Jawaban Singkat:",
              type: "chips",
              options: ["0 Soal", "5 Soal", "10 Soal"],
              category: "data"
           });
           initialQuestions.push({
              id: 2004,
              question: "Jumlah Soal Esai:",
              type: "chips",
              options: ["0 Soal", "2 Soal", "5 Soal"],
              category: "data"
           });
        }

        if (docType === "KISI-KISI") {
            initialQuestions = initialQuestions.filter(q => q.id !== 1005);
            initialQuestions.push({
               id: 1004,
               question: "Pilih Semester yang ingin di-generate:",
               type: "chips",
               options: ["Semester Ganjil", "Semester Genap"],
               category: "mandatory"
            });
            initialQuestions.push({
               id: 2002,
               question: "Jumlah Soal Pilihan Ganda (PG):",
               type: "chips",
               options: ["0 Soal", "10 Soal", "20 Soal", "30 Soal"],
               category: "data"
            });
            initialQuestions.push({
               id: 3000,
               question: "Jumlah Soal PG Kompleks:",
               type: "chips",
               options: ["0 Soal", "5 Soal", "10 Soal"],
               category: "data"
            });
            initialQuestions.push({
               id: 2004,
               question: "Jumlah Soal Uraian/Esai:",
               type: "chips",
               options: ["0 Soal", "5 Soal", "10 Soal"],
               category: "data"
            });
         }

        if (["Alur Tujuan Pembelajaran (ATP)", "ATP"].includes(docType)) {
           initialQuestions.push({
              id: 1004,
              question: "Pilih Semester yang ingin di-generate:",
              type: "chips",
              options: ["Semester Ganjil", "Semester Genap"],
              category: "mandatory"
           });
        }

        if (docType === "TP" || docType === "Tujuan Pembelajaran (TP)") {
           // TP tidak butuh JP (1005)
           initialQuestions = initialQuestions.filter(q => q.id !== 1005);
           initialQuestions.push({
              id: 1007,
              question: "Nama Satuan Pendidikan?",
              type: "text",
              placeholder: "Misal: Madrasah Aliyah, SMA Negeri 1...",
              category: "mandatory"
           });
           initialQuestions.push({
              id: 1008,
              question: "Tahun Pelajaran?",
              type: "chips",
              options: ["2022-2023", "2023-2024", "2024-2025", "2025-2026"],
              category: "mandatory"
           });
           initialQuestions.push({
              id: 1009,
              question: "Nama Penyusun Dasar?",
              type: "text",
              placeholder: "Misal: Tim Guru Al-Qur'an Hadis...",
              category: "mandatory"
           });
        }
        
        const filteredAiQuestions = (data.questions || []).filter((q: Question) => {
           const lowerQ = q.question.toLowerCase();
           const isJunk = lowerQ.includes("kelas") || lowerQ.includes("fase") || lowerQ.includes("mata pelajaran") || 
                          lowerQ.includes("semester") || lowerQ.includes("jp") || lowerQ.includes("jam pelajaran") ||
                          lowerQ.includes("materi spesifik") || lowerQ.includes("topik");
           
           const isLkpdJunk = docType === "LKPD" && (lowerQ.includes("total soal") || lowerQ.includes("jumlah soal") || lowerQ.includes("jenis soal") || lowerQ.includes("bentuk soal"));
           const isTpMediaJunk = (docType === "TP" || docType === "Tujuan Pembelajaran (TP)") && lowerQ.includes("media");
           
           return !isJunk && !isLkpdJunk && !isTpMediaJunk;
        });

        const finalQuestions = [...initialQuestions, ...filteredAiQuestions];
        
        if (!finalQuestions.some(q => q.type === "file")) {
           finalQuestions.push({
              id: 9999,
              question: "Punya file referensi tambahan (Modul/PDF)?",
              type: "file",
              category: "optional"
           });
        }

        setQuestions(finalQuestions);
      } catch (err) {
        let fallback = [...mandatoryQuestions];
        
        if (["Capaian Pembelajaran (CP)", "CP"].includes(docType)) {
           fallback = fallback.filter(q => q.id !== 1005);
        }

        if (docType === "PROSEM") {
            fallback.push({
               id: 1006,
               question: "Rentang Bulan Pelaksanaan Program Semester?",
               type: "month-range",
               category: "mandatory"
            });
        }

        if (["Alur Tujuan Pembelajaran (ATP)", "ATP", "KKTP"].includes(docType)) {
           fallback.push({
              id: 1004,
              question: "Pilih Semester yang ingin di-generate:",
              type: "chips",
              options: ["Semester Ganjil", "Semester Genap"],
              category: "mandatory"
           });
        }
        
        if (docType === "TP") {
            fallback = fallback.filter(q => q.id !== 1005);
            fallback.push({ id: 1007, question: "Nama Satuan Pendidikan?", type: "text", placeholder: "Misal: Madrasah Aliyah, SMA Negeri 1...", category: "mandatory" });
            fallback.push({ id: 1008, question: "Tahun Pelajaran?", type: "chips", options: ["2022-2023", "2023-2024", "2024-2025", "2025-2026"], category: "mandatory" });
            fallback.push({ id: 1009, question: "Nama Penyusun Dasar?", type: "text", placeholder: "Misal: Tim Guru Al-Qur'an Hadis...", category: "mandatory" });
        }

        if (docType === "LKPD") {
            fallback = fallback.filter(q => q.id !== 1005);
            fallback.push({ id: 2000, question: "Pilih Bahasa untuk LKPD ini:", type: "chips", options: ["Bahasa Indonesia", "Bahasa Arab", "Bahasa Inggris"], category: "data" });
            fallback.push({ id: 2001, question: "Apa materi spesifik yang ingin diujikan?", type: "text", placeholder: "Misal: Rantai Makanan, Thaharah, Persamaan Kuadrat...", category: "data" });
            fallback.push({ id: 2002, question: "Jumlah Soal Pilihan Ganda (PG):", type: "chips", options: ["0 Soal", "5 Soal", "10 Soal", "15 Soal"], category: "data" });
            fallback.push({ id: 2003, question: "Jumlah Soal Jawaban Singkat:", type: "chips", options: ["0 Soal", "5 Soal", "10 Soal"], category: "data" });
            fallback.push({ id: 2004, question: "Jumlah Soal Esai:", type: "chips", options: ["0 Soal", "2 Soal", "5 Soal"], category: "data" });
        }

        if (docType === "KISI-KISI") {
             fallback = fallback.filter(q => q.id !== 1005);
              fallback.push({ id: 1004, question: "Pilih Semester yang ingin di-generate:", type: "chips", options: ["Semester Ganjil", "Semester Genap"], category: "mandatory" });
             fallback.push({ id: 2002, question: "Jumlah Soal Pilihan Ganda (PG):", type: "chips", options: ["0 Soal", "10 Soal", "20 Soal", "30 Soal"], category: "data" });
             fallback.push({ id: 3000, question: "Jumlah Soal PG Kompleks:", type: "chips", options: ["0 Soal", "5 Soal", "10 Soal"], category: "data" });
             fallback.push({ id: 2004, question: "Jumlah Soal Uraian/Esai:", type: "chips", options: ["0 Soal", "5 Soal", "10 Soal"], category: "data" });
         }

        if (!fallback.some(q => q.type === "file")) {
           fallback.push({
              id: 9999,
              question: "Punya file referensi tambahan (Modul/PDF)?",
              type: "file",
              category: "optional"
           });
        }
        
        setQuestions(fallback);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [prompt, docType]);

  const handleAnswer = (id: number, val: string, multi = false) => {
    setAnswers(prev => {
        if (!multi) return { ...prev, [id]: val };
        const current = prev[id] || "";
        const currentList = current ? current.split(", ") : [];
        if (currentList.includes(val)) {
            const updated = currentList.filter(v => v !== val).join(", ");
            return { ...prev, [id]: updated };
        } else {
            const updated = [...currentList, val].join(", ");
            return { ...prev, [id]: updated };
        }
    });
    setSkipped(prev => prev.filter(s => s !== id));
  };

  const handleFileUpload = async (id: number, file: File) => {
    if (!file) return;
    
    if (file.size > 10 * 1024 * 1024) {
      alert("Format file terlalu besar. Maksimal 10MB untuk keamanan.");
      return;
    }

    setFileExtracting(prev => ({ ...prev, [id]: true }));
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/extract-text", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.text) {
        handleAnswer(id, `[FILE REFERENCE: ${file.name}] Content: ${data.text}`);
      } else if (data.error) {
        alert(data.error);
      }
    } catch (err) {
      console.error("File upload failed:", err);
      alert("Gagal membaca file. Pastikan format file benar.");
    } finally {
      setFileExtracting(prev => ({ ...prev, [id]: false }));
    }
  };

  const toggleSkip = (id: number) => {
    const q = questions.find(q => q.id === id);
    if (q?.category === "mandatory") return;

    if (skipped.includes(id)) {
      setSkipped(prev => prev.filter(s => s !== id));
    } else {
      setSkipped(prev => [...prev, id]);
      setAnswers(prev => {
        const n = { ...prev };
        delete n[id];
        return n;
      });
      setShowOther(prev => ({ ...prev, [id]: false }));
    }
  };

  const mandatoryIds = questions.filter(q => q.category === "mandatory").map(q => q.id);
  const allMandatoryAnswered = mandatoryIds.length > 0 && mandatoryIds.every(id => !!answers[id]);
  const answeredCount = Object.keys(answers).length + skipped.length;
  const progressPercent = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  const handleGenerate = () => {
    const contextStr = questions.map(q => {
      const ans = answers[q.id] || (skipped.includes(q.id) ? "Lewati (isi manual)" : "");
      return `${q.id}. ${q.question}: ${ans}`;
    }).join(" _||_ ");
    
    // Simpan context besar ke sessionStorage agar tidak kena URI_TOO_LONG
    sessionStorage.setItem("generate_context", contextStr);
    
    const params = new URLSearchParams();
    params.append("type", docType);
    params.append("prompt", prompt);
    params.append("model", selectedModel);
    params.append("hasContext", "true"); // Penanda untuk workspace agar ambil dari sessionStorage
    
    router.push(`/workspace?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center p-4">
         <div className="w-16 h-16 rounded-lg bg-[#4d7537]/10 flex items-center justify-center mb-6">
            <Sparkles className="w-8 h-8 text-[#4d7537] animate-pulse" />
         </div>
         <h1 className="text-2xl font-bricolage font-bold mb-2">Merancang Kuesioner Personalisasi...</h1>
         <p className="text-muted-foreground max-w-sm">Mohon tunggu, AI sedang menyusun pertanyaan untuk topik: <span className="text-[#4d7537] font-semibold">"{prompt}"</span></p>
      </div>
    );
  }

  // ── SUMMARY / CONFIRMATION VIEW ──
  if (showSummary) {
    const answeredQuestions = questions.filter(q => answers[q.id] || skipped.includes(q.id));
    return (
      <div className="min-h-screen bg-background text-foreground pb-20">
        <div className="fixed top-0 left-0 w-full z-50 bg-card/80 backdrop-blur-md border-b border-border px-4 py-4">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
             <Button variant="ghost" size="sm" onClick={() => setShowSummary(false)} className="text-muted-foreground hover:bg-secondary rounded-md">
               <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Form
             </Button>
             <div className="flex flex-col items-center">
                <span className="text-[10px] uppercase tracking-widest font-bold text-[#4d7537]">Konfirmasi</span>
                <span className="text-sm font-bold">Ringkasan Data</span>
             </div>
             <div className="w-20" /> 
          </div>
        </div>

        <main className="max-w-3xl mx-auto pt-28 px-6">
          <header className="mb-10 text-center">
            <h1 className="text-2xl font-bricolage font-bold mb-2">Periksa Data Sebelum Generate</h1>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">Pastikan semua data di bawah sudah benar. Klik "Mulai Generate" jika sudah siap.</p>
          </header>

          {/* Summary Cards */}
          <div className="space-y-3 mb-12">
            {questions.map((q) => {
              const answer = answers[q.id];
              const isSkipped = skipped.includes(q.id);
              const displayValue = isSkipped ? "Dilewati (isi manual)" : answer || "Belum diisi";
              const isFile = q.type === "file" && answer;
              const fileName = isFile ? answer.split("]")[0].replace("[FILE REFERENCE: ", "") : "";

              return (
                <motion.div 
                  key={q.id} 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: questions.indexOf(q) * 0.03 }}
                  className={`p-4 rounded-xl border transition-all ${answer ? 'bg-[#4d7537]/5 border-[#4d7537]/20' : isSkipped ? 'bg-secondary/30 border-border' : 'bg-secondary/10 border-border opacity-50'}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-1">{q.question}</p>
                      <p className={`text-sm font-medium truncate ${isSkipped ? 'text-muted-foreground italic' : 'text-foreground'}`}>
                        {isFile ? `📄 ${fileName}` : displayValue}
                      </p>
                    </div>
                    {answer && !isSkipped && (
                      <CheckCircle2 className="w-5 h-5 text-[#4d7537] shrink-0 mt-1" />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Generate Button */}
          <div className="flex flex-col items-center gap-4">
            <Button 
              onClick={handleGenerate}
              className="w-full max-w-md h-14 bg-[#4d7537] text-white hover:bg-[#5a8b41] rounded-lg text-base font-bold shadow-lg shadow-[#4d7537]/20 transition-all hover:scale-[1.01] active:scale-95 group"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Mulai Generate {docType}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <button 
              onClick={() => setShowSummary(false)} 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Kembali edit jawaban
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Header with Progress Bar */}
      <div className="fixed top-0 left-0 w-full z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="px-4 py-4">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
             <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-muted-foreground hover:bg-secondary rounded-md">
               <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
             </Button>
             <div className="flex flex-col items-center">
                <span className="text-[10px] uppercase tracking-widest font-bold text-[#4d7537]">Progress Data</span>
                <span className="text-sm font-bold">{answeredCount}/{questions.length}</span>
             </div>
             <div className="w-20" /> 
          </div>
        </div>
        {/* Progress Bar */}
        <div className="h-1 bg-secondary w-full">
          <motion.div 
            className="h-full bg-[#4d7537] rounded-r-full" 
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>

      <main className="max-w-3xl mx-auto pt-28 px-6">
        <header className="mb-12">
           <h1 className="text-3xl font-bricolage font-bold mb-3 italic">Beberapa pertanyaan</h1>
           <p className="text-muted-foreground">Biar perangkat ajar-nya lebih akurat. Jawab semua pertanyaan di bawah.</p>
        </header>

        <div className="space-y-12">


           {questions.map((q, idx) => (
             <section key={q.id} className="relative group">
                <div className="flex items-center justify-between mb-4">
                   <h2 className="text-lg font-bold flex gap-3 items-start">
                     <span className="text-[#4d7537]">{idx + 1}.</span> 
                     {q.question}
                   </h2>
                   {q.category !== "mandatory" ? (
                     <div className="flex items-center gap-3">
                       <Badge variant="outline" className="text-[10px] uppercase tracking-tighter bg-secondary text-muted-foreground border-none font-bold">Opsional</Badge>
                       <button 
                         onClick={() => toggleSkip(q.id)}
                         className={`text-xs font-bold uppercase tracking-wider transition-colors ${skipped.includes(q.id) ? 'text-[#4d7537]' : 'text-muted-foreground hover:text-foreground'}`}
                       >
                         {skipped.includes(q.id) ? 'Dilewati' : 'Lewati'}
                       </button>
                     </div>
                   ) : (
                     <Badge variant="outline" className="text-[10px] uppercase tracking-tighter bg-[#4d7537]/10 text-[#4d7537] border-none font-bold">Wajib Diisi</Badge>
                   )}
                </div>

                <div className={`transition-opacity duration-300 ${skipped.includes(q.id) ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                   {q.type === "chips" || q.type === "multi-chips" ? (
                     <div className="flex flex-col gap-3">
                        <div className="flex flex-wrap gap-2">
                            {q.options?.map(opt => {
                             const isActive = q.type === "multi-chips" 
                               ? (answers[q.id] || "").split(", ").includes(opt)
                               : answers[q.id] === opt && !showOther[q.id];
                             
                             return (
                             <button
                                 key={opt}
                                 onClick={() => { handleAnswer(q.id, opt, q.type === "multi-chips"); if(q.type === "chips") setShowOther(prev => ({ ...prev, [q.id]: false })); }}
                                 className={`px-4 py-2 rounded-md border text-sm transition-all ${isActive ? 'bg-[#4d7537] text-white border-[#4d7537] shadow-lg shadow-[#4d7537]/20 font-semibold' : 'bg-card border-border hover:border-[#4d7537]'}`}
                             >
                                 {opt}
                             </button>
                             )})}
                             {q.type === "chips" && q.id !== 1004 && (
                              <button 
                                  onClick={() => { setShowOther(prev => ({ ...prev, [q.id]: !prev[q.id] })); if (!showOther[q.id]) handleAnswer(q.id, ""); }}
                                  className={`px-4 py-2 rounded-md border border-dashed transition-all text-sm flex items-center gap-1 ${showOther[q.id] ? 'bg-[#4d7537]/10 border-[#4d7537] text-[#4d7537] font-semibold' : 'border-border text-muted-foreground hover:text-[#4d7537] hover:border-[#4d7537]'}`}
                              >
                              <Plus className="w-3.5 h-3.5" /> Lainnya
                              </button>
                             )}
                        </div>
                        {q.type === "chips" && showOther[q.id] && (
                          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                             <Input 
                                placeholder="Ketik jawaban lainnya di sini..."
                                value={answers[q.id] || ""}
                                onChange={(e) => handleAnswer(q.id, e.target.value)}
                                className="bg-card border-[#4d7537] h-12 rounded-md focus-visible:ring-[#4d7537]"
                             />
                          </motion.div>
                        )}
                     </div>
                    ) : q.type === "month-range" ? (
                     <div className="flex items-center gap-4">
                        <div className="flex-1">
                           <label className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-2 block">Bulan Mulai</label>
                           <select 
                             className="w-full bg-card border border-border h-14 rounded-md px-4 focus-visible:ring-[#4d7537] outline-none"
                             value={(answers[q.id] || "").split(" sampai ")[0] || ""}
                             onChange={(e) => {
                               const currentEnd = (answers[q.id] || "").split(" sampai ")[1] || "Desember";
                               handleAnswer(q.id, `${e.target.value} sampai ${currentEnd}`);
                             }}
                           >
                             <option value="" disabled>Pilih Bulan</option>
                             <option value="Juli">Juli (Awal Smt Ganjil)</option>
                             <option value="Agustus">Agustus</option>
                             <option value="September">September</option>
                             <option value="Oktober">Oktober</option>
                             <option value="November">November</option>
                             <option value="Desember">Desember</option>
                             <option value="Januari">Januari (Awal Smt Genap)</option>
                             <option value="Februari">Februari</option>
                             <option value="Maret">Maret</option>
                             <option value="April">April</option>
                             <option value="Mei">Mei</option>
                             <option value="Juni">Juni</option>
                           </select>
                        </div>
                        <div className="w-8 flex justify-center text-muted-foreground mt-6"><ArrowRight className="w-5 h-5" /></div>
                        <div className="flex-1">
                           <label className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-2 block">Bulan Berakhir</label>
                           <select 
                             className="w-full bg-card border border-border h-14 rounded-md px-4 focus-visible:ring-[#4d7537] outline-none"
                             value={(answers[q.id] || "").split(" sampai ")[1] || ""}
                             onChange={(e) => {
                               const currentStart = (answers[q.id] || "").split(" sampai ")[0] || "Juli";
                               handleAnswer(q.id, `${currentStart} sampai ${e.target.value}`);
                             }}
                           >
                             <option value="" disabled>Pilih Bulan</option>
                             <option value="Juli">Juli</option>
                             <option value="Agustus">Agustus</option>
                             <option value="September">September</option>
                             <option value="Oktober">Oktober</option>
                             <option value="November">November</option>
                             <option value="Desember">Desember (Akhir Smt Ganjil)</option>
                             <option value="Januari">Januari</option>
                             <option value="Februari">Februari</option>
                             <option value="Maret">Maret</option>
                             <option value="April">April</option>
                             <option value="Mei">Mei</option>
                             <option value="Juni">Juni (Akhir Smt Genap)</option>
                           </select>
                        </div>
                     </div>
                   ) : q.type === "file" ? (
                     <div className="space-y-4">
                        <div className={`p-8 border-2 border-dashed rounded-xl transition-all flex flex-col items-center justify-center gap-4 relative ${answers[q.id] ? 'bg-[#4d7537]/5 border-[#4d7537]' : 'bg-card border-border hover:border-[#4d7537]'}`}>
                           {fileExtracting[q.id] ? (
                              <div className="flex flex-col items-center gap-2">
                                 <Loader2 className="w-8 h-8 text-[#4d7537] animate-spin" />
                                 <p className="text-sm font-medium">Mengekstrak teks...</p>
                              </div>
                           ) : answers[q.id] ? (
                              <div className="flex flex-col items-center gap-2">
                                 <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                    <Sparkles className="w-6 h-6 text-emerald-500" />
                                 </div>
                                 <div className="text-center">
                                    <p className="text-sm font-bold text-emerald-600">File Berhasil Dibaca!</p>
                                    <p className="text-[10px] text-muted-foreground mt-1">{answers[q.id].split("]")[0].replace("[FILE REFERENCE: ", "")}</p>
                                 </div>
                                 <button 
                                    onClick={() => handleAnswer(q.id, "")}
                                    className="text-xs text-red-500 hover:text-red-600 font-bold mt-2 z-10"
                                 >
                                    Hapus File
                                 </button>
                              </div>
                           ) : (
                              <>
                                 <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                                    <Plus className="w-6 h-6 text-muted-foreground" />
                                 </div>
                                 <div className="text-center">
                                    <p className="text-sm font-bold">Klik untuk unggah file</p>
                                    <p className="text-[10px] text-muted-foreground mt-1">PDF, DOCX, atau Gambar Modul (Maks. 5MB)</p>
                                 </div>
                                 <input 
                                    type="file" 
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                                    onChange={(e) => {
                                       const file = e.target.files?.[0];
                                       if (file) handleFileUpload(q.id, file);
                                       e.target.value = '';
                                    }}
                                    accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,image/*"
                                 />
                              </>
                           )}
                        </div>
                     </div>
                   ) : (
                     <div className="relative">
                        <Input 
                          placeholder={q.placeholder}
                          value={answers[q.id] || ""}
                          onChange={(e) => handleAnswer(q.id, e.target.value)}
                          className="bg-card border-border h-14 rounded-md focus-visible:ring-[#4d7537]"
                        />
                     </div>
                   )}
                </div>
                <div className="absolute -bottom-6 left-0 w-full h-[1px] bg-border" />
             </section>
           ))}
        </div>

        <footer className="mt-20 flex justify-center">
           <Button 
             disabled={!allMandatoryAnswered || (answeredCount < questions.length - 2 && answeredCount < mandatoryIds.length + 1)}
             onClick={() => setShowSummary(true)}
             className="w-full max-w-md h-14 bg-[#4d7537] text-white hover:bg-[#5a8b41] rounded-lg text-base font-bold shadow-md shadow-[#4d7537]/10 transition-all hover:scale-[1.01] active:scale-95 group disabled:opacity-50 disabled:grayscale disabled:hover:scale-100"
           >

             Tinjau & Generate {docType}
             <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
           </Button>
        </footer>
      </main>
    </div>
  );
}

export default function GeneratePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-[#4d7537]" /></div>}>
      <GenerateContent />
    </Suspense>
  );
}
