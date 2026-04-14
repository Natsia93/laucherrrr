"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Sparkles, ArrowRight, ChevronLeft, 
  CheckCircle2, Circle, Loader2, Plus, ArrowLeft, Zap, Brain
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

interface Question {
  id: number;
  question: string;
  type: "chips" | "multi-chips" | "text";
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

  // Fetch dynamic questions from AI based on the user's prompt
  useEffect(() => {
    const fetchQuestions = async () => {
      // Jika bukan LKPD, kita tidak butuh wawancara panjang
      if (docType !== "LKPD") {
        setQuestions([]);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/generate-questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, docType })
        });
        const data = await response.json();
        
        // Tambahkan pertanyaan bahasa di awal khusus LKPD
        const langQuestion: Question = {
            id: 0,
            question: "Pilih Bahasa untuk LKPD ini:",
            type: "chips",
            options: ["Bahasa Indonesia", "Bahasa Arab (Ber-Harokat/Tasykil)"],
            category: "data"
        };
        
        setQuestions([langQuestion, ...(data.questions || [])]);
      } catch (err) {
        // Fallback LKPD questions
        setQuestions([
            { id: 0, question: "Pilih Bahasa untuk LKPD ini:", type: "chips", options: ["Bahasa Indonesia", "Bahasa Arab (Ber-Harokat/Tasykil)"], category: "data" },
            { id: 1, question: "Untuk Fase dan Kelas berapakah LKPD ini dirancang?", type: "chips", options: ["Fase A (Kls 1-2)", "Fase B (Kls 3-4)", "Fase C (Kls 5-6)", "Fase D (Kls 7-9)", "Fase E (Kls 10)", "Fase F (Kls 11-12)"], category: "data" },
            { id: 2, question: "Apa materi spesifik yang ingin diujikan?", type: "text", placeholder: "Misal: Rantai Makanan, Thaharah, Persamaan Kuadrat...", category: "data" },
            { id: 3, question: "Pilih jenis soal (bisa pilih lebih dari satu):", type: "multi-chips", options: ["Pilihan Ganda", "Esai", "Jawaban Singkat"], category: "data" },
            { id: 4, question: "Berapa jumlah soal yang Anda butuhkan?", type: "chips", options: ["5 Soal", "10 Soal", "20 Soal"], category: "data" },
        ]);
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

  const toggleSkip = (id: number) => {
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
      {/* Dynamic Header */}
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
           {/* AI Model Selection */}
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
                   <button 
                     onClick={() => toggleSkip(q.id)}
                     className={`text-xs font-bold uppercase tracking-wider transition-colors ${skipped.includes(q.id) ? 'text-[#4d7537]' : 'text-neutral-400 hover:text-neutral-600'}`}
                   >
                     {skipped.includes(q.id) ? 'Dilewati' : 'Lewati'}
                   </button>
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
             disabled={answeredCount < questions.length - 2 && answeredCount < 2}
             onClick={() => {
               const contextStr = questions.map(q => {
                 const ans = answers[q.id] || (skipped.includes(q.id) ? "Lewati (isi manual)" : "");
                 return `${q.id}. ${q.question}: ${ans}`;
               }).join("|");
               
               const params = new URLSearchParams();
               params.append("context", contextStr);
               params.append("type", docType);
               params.append("prompt", prompt);
               params.append("model", selectedModel);
               router.push(`/workspace?${params.toString()}`);
             }}
             className="w-full max-w-md h-16 bg-[#4d7537] text-white hover:bg-[#5a8b41] rounded-lg text-lg font-bold shadow-xl shadow-[#4d7537]/20 transition-all hover:scale-[1.02] active:scale-95 group"
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
