"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Sparkles, ArrowRight, Loader2, Plus, ArrowLeft, Zap, Brain
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

interface Question {
  id: number;
  question: string;
  type: "chips" | "multi-chips" | "text" | "file";
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
      question: "Berapa alokasi Jam Pelajaran (JP) yang tersedia?",
      type: "chips",
      options: ["2 JP", "4 JP", "8 JP", "12 JP", "Sesuai Kurikulum"],
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

        if (["Capaian Pembelajaran (CP)", "CP", "KKTP"].includes(docType)) {
           initialQuestions = initialQuestions.filter(q => q.id !== 1005);
           initialQuestions.push({
              id: 1004,
              question: "Pilih Semester yang ingin di-generate:",
              type: "chips",
              options: ["Semester Ganjil", "Semester Genap", "Ganjil & Genap"],
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

        if (["Alur Tujuan Pembelajaran (ATP)", "ATP"].includes(docType)) {
           initialQuestions.push({
              id: 1004,
              question: "Pilih Semester yang ingin di-generate:",
              type: "chips",
              options: ["Semester Ganjil", "Semester Genap", "Ganjil & Genap"],
              category: "mandatory"
           });
        }
        
        const filteredAiQuestions = (data.questions || []).filter((q: Question) => {
           const lowerQ = q.question.toLowerCase();
           const isJunk = lowerQ.includes("kelas") || lowerQ.includes("fase") || lowerQ.includes("mata pelajaran") || 
                          lowerQ.includes("semester") || lowerQ.includes("jp") || lowerQ.includes("jam pelajaran") ||
                          lowerQ.includes("materi spesifik") || lowerQ.includes("topik");
           
           // Extra junk for LKPD since we have dedicated fields now
           const isLkpdJunk = docType === "LKPD" && (lowerQ.includes("total soal") || lowerQ.includes("jumlah soal") || lowerQ.includes("jenis soal") || lowerQ.includes("bentuk soal"));
           
           return !isJunk && !isLkpdJunk;
        });

        const finalQuestions = [...initialQuestions, ...filteredAiQuestions];
        
        // Forcefully ensure the file context question is ALWAYS present at the end
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
        
        if (["Alur Tujuan Pembelajaran (ATP)", "Capaian Pembelajaran (CP)", "KKTP", "ATP", "CP"].includes(docType)) {
           fallback.push({
              id: 1004,
              question: "Pilih Semester yang ingin di-generate:",
              type: "chips",
              options: ["Semester Ganjil", "Semester Genap", "Ganjil & Genap"],
              category: "mandatory"
           });
        }

        if (docType === "LKPD") {
            fallback = fallback.filter(q => q.id !== 1005);
            fallback.push({ id: 2000, question: "Pilih Bahasa untuk LKPD ini:", type: "chips", options: ["Bahasa Indonesia", "Bahasa Arab", "Bahasa Inggris"], category: "data" });
            fallback.push({ id: 2001, question: "Apa materi spesifik yang ingin diujikan?", type: "text", placeholder: "Misal: Rantai Makanan, Thaharah, Persamaan Kuadrat...", category: "data" });
            fallback.push({ id: 2002, question: "Jumlah Soal Pilihan Ganda (PG):", type: "chips", options: ["0 Soal", "5 Soal", "10 Soal", "15 Soal"], category: "data" });
            fallback.push({ id: 2003, question: "Jumlah Soal Jawaban Singkat:", type: "chips", options: ["0 Soal", "5 Soal", "10 Soal"], category: "data" });
            fallback.push({ id: 2004, question: "Jumlah Soal Esai:", type: "chips", options: ["0 Soal", "2 Soal", "5 Soal"], category: "data" });
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
    
    // Client-side guard for immediate feedback
    if (file.size > 5 * 1024 * 1024) {
      alert("Format file terlalu besar. Maksimal 5MB untuk keamanan.");
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f3ed] dark:bg-[#080b06] flex flex-col items-center justify-center text-center p-4">
         <div className="w-16 h-16 rounded-lg bg-[#4d7537]/10 flex items-center justify-center mb-6">
            <Sparkles className="w-8 h-8 text-[#4d7537] animate-pulse" />
         </div>
         <h1 className="text-2xl font-bricolage font-bold mb-2">Merancang Kuesioner Personalisasi...</h1>
         <p className="text-neutral-500 max-w-sm">Mohon tunggu, AI sedang menyusun pertanyaan untuk topik: <span className="text-[#4d7537] font-semibold">"{prompt}"</span></p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f3ed] dark:bg-[#080b06] text-neutral-900 dark:text-[#e8eedd] pb-20">
      <div className="fixed top-0 left-0 w-full z-50 bg-white/80 dark:bg-[#080b06]/80 backdrop-blur-md border-b border-[#dcdad1] dark:border-[#3f612d]/20 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
           <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-neutral-500 hover:bg-neutral-100 dark:hover:bg-[#1a2315] rounded-md">
             <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
           </Button>
           <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase tracking-widest font-bold text-[#4d7537]">Progress Data</span>
              <span className="text-sm font-bold">{answeredCount}/{questions.length}</span>
           </div>
           <div className="w-20" /> 
        </div>
      </div>

      <main className="max-w-3xl mx-auto pt-28 px-6">
        <header className="mb-12">
           <h1 className="text-3xl font-bricolage font-bold mb-3 italic">Beberapa pertanyaan</h1>
           <p className="text-neutral-500 dark:text-[#a2b591]">Biar perangkat ajar-nya lebih akurat. Jawab semua pertanyaan di bawah.</p>
        </header>

        <div className="space-y-12">
           <section className="relative group">
              <div className="flex items-center justify-between mb-4">
                 <h2 className="text-lg font-bold flex gap-3 items-start">
                   <span className="text-[#4d7537]">A.</span> 
                   Pilih Otak AI Perancang
                 </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {[
                   { id: "gemini", name: "Gemini 2.0 Flash", desc: "Super cepat & kreatif", icon: Zap },
                   { id: "deepseek", name: "DeepSeek V3", desc: "Logika kuat & rapi", icon: Brain }
                 ].map(m => (
                   <button
                     key={m.id}
                     onClick={() => setSelectedModel(m.id)}
                     className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${selectedModel === m.id ? 'bg-[#4d7537]/5 border-[#4d7537] ring-1 ring-[#4d7537]' : 'bg-white dark:bg-[#1a2315] border-neutral-200 dark:border-[#3f612d]/30 hover:border-[#4d7537]'}`}
                   >
                     <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedModel === m.id ? 'bg-[#4d7537] text-white' : 'bg-neutral-100 dark:bg-[#080b06] text-neutral-400'}`}>
                       <m.icon className="w-5 h-5" />
                     </div>
                     <div>
                       <div className={`font-bold text-sm ${selectedModel === m.id ? 'text-[#4d7537]' : ''}`}>{m.name}</div>
                       <div className="text-[11px] text-neutral-500">{m.desc}</div>
                     </div>
                   </button>
                 ))}
              </div>
              <div className="absolute -bottom-6 left-0 w-full h-[1px] bg-neutral-100 dark:bg-[#3f612d]/10" />
           </section>

           {questions.map((q, idx) => (
             <section key={q.id} className="relative group">
                <div className="flex items-center justify-between mb-4">
                   <h2 className="text-lg font-bold flex gap-3 items-start">
                     <span className="text-[#4d7537]">{idx + 1}.</span> 
                     {q.question}
                   </h2>
                   {q.category !== "mandatory" ? (
                     <div className="flex items-center gap-3">
                       <Badge variant="outline" className="text-[10px] uppercase tracking-tighter bg-neutral-100 dark:bg-white/5 text-neutral-400 border-none font-bold">Opsional</Badge>
                       <button 
                         onClick={() => toggleSkip(q.id)}
                         className={`text-xs font-bold uppercase tracking-wider transition-colors ${skipped.includes(q.id) ? 'text-[#4d7537]' : 'text-neutral-400 hover:text-neutral-600'}`}
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
                                 className={`px-4 py-2 rounded-md border text-sm transition-all ${isActive ? 'bg-[#4d7537] text-white border-[#4d7537] shadow-lg shadow-[#4d7537]/20 font-semibold' : 'bg-white dark:bg-[#1a2315] border-neutral-200 dark:border-[#3f612d]/30 hover:border-[#4d7537]'}`}
                             >
                                 {opt}
                             </button>
                             )})}
                             {q.type === "chips" && (
                              <button 
                                  onClick={() => { setShowOther(prev => ({ ...prev, [q.id]: !prev[q.id] })); if (!showOther[q.id]) handleAnswer(q.id, ""); }}
                                  className={`px-4 py-2 rounded-md border border-dashed transition-all text-sm flex items-center gap-1 ${showOther[q.id] ? 'bg-[#4d7537]/10 border-[#4d7537] text-[#4d7537] font-semibold' : 'border-neutral-300 dark:border-[#3f612d]/50 text-neutral-400 hover:text-[#4d7537] hover:border-[#4d7537]'}`}
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
                                className="bg-white dark:bg-[#1a2315] border-[#4d7537] h-12 rounded-md focus-visible:ring-[#4d7537]"
                             />
                          </motion.div>
                        )}
                     </div>
                   ) : q.type === "file" ? (
                     <div className="space-y-4">
                        <div className={`p-8 border-2 border-dashed rounded-xl transition-all flex flex-col items-center justify-center gap-4 relative ${answers[q.id] ? 'bg-[#4d7537]/5 border-[#4d7537]' : 'bg-white dark:bg-[#1a2315] border-neutral-200 dark:border-[#3f612d]/30 hover:border-[#4d7537]'}`}>
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
                                    <p className="text-[10px] text-neutral-400 mt-1">{answers[q.id].split("]")[0].replace("[FILE REFERENCE: ", "")}</p>
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
                                 <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-white/5 flex items-center justify-center">
                                    <Plus className="w-6 h-6 text-neutral-400" />
                                 </div>
                                 <div className="text-center">
                                    <p className="text-sm font-bold">Klik untuk unggah file</p>
                                    <p className="text-[10px] text-neutral-500 mt-1">PDF, DOCX, atau Gambar Modul (Maks. 5MB)</p>
                                 </div>
                                 <input 
                                    type="file" 
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                                    onChange={(e) => {
                                       const file = e.target.files?.[0];
                                       if (file) handleFileUpload(q.id, file);
                                       e.target.value = ''; // Reset to allow same file re-upload
                                    }}
                                    accept=".pdf,.docx,image/*"
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
                          className="bg-white dark:bg-[#1a2315] border-neutral-200 dark:border-[#3f612d]/30 h-14 rounded-md focus-visible:ring-[#4d7537]"
                        />
                     </div>
                   )}
                </div>
                <div className="absolute -bottom-6 left-0 w-full h-[1px] bg-neutral-100 dark:bg-[#3f612d]/10" />
             </section>
           ))}
        </div>

        <footer className="mt-20 flex justify-center">
           <Button 
             disabled={!allMandatoryAnswered || (answeredCount < questions.length - 2 && answeredCount < mandatoryIds.length + 1)}
             onClick={() => {
               const contextStr = questions.map(q => {
                 const ans = answers[q.id] || (skipped.includes(q.id) ? "Lewati (isi manual)" : "");
                 return `${q.id}. ${q.question}: ${ans}`;
               }).join(" _||_ ");
               
               const params = new URLSearchParams();
               params.append("context", contextStr);
               params.append("type", docType);
               params.append("prompt", prompt);
               params.append("model", selectedModel);
               router.push(`/workspace?${params.toString()}`);
             }}
             className="w-full max-w-md h-14 bg-[#4d7537] text-white hover:bg-[#5a8b41] rounded-lg text-base font-bold shadow-md shadow-[#4d7537]/10 transition-all hover:scale-[1.01] active:scale-95 group disabled:opacity-50 disabled:grayscale disabled:hover:scale-100"
           >
             Generate {docType}
             <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
           </Button>
        </footer>
      </main>
    </div>
  );
}

export default function GeneratePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f4f3ed] dark:bg-[#080b06] flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-[#4d7537]" /></div>}>
      <GenerateContent />
    </Suspense>
  );
}
