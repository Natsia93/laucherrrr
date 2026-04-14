"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Sparkles, ArrowRight, ChevronLeft, 
  CheckCircle2, Circle, Loader2, Plus, ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

interface Question {
  id: number;
  question: string;
  type: "chips" | "text";
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

  // Fetch dynamic questions from AI based on the user's prompt
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch("/api/generate-questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, docType })
        });
        const data = await response.json();
        setQuestions(data.questions);
      } catch (err) {
        setQuestions([
          { id: 1, question: "Untuk Fase dan Kelas berapakah dokumen ini dirancang?", type: "chips", options: ["Fase A (Kls 1-2)", "Fase B (Kls 3-4)", "Fase C (Kls 5-6)", "Fase D (Kls 7-9)", "Fase E/F (SMA)"], category: "data" },
          { id: 2, question: "Apa elemen materi utama yang menjadi fokus?", type: "text", placeholder: "Misal: Geometri, Menulis, atau Zat dan Perubahannya...", category: "data" },
          { id: 3, question: "Media pembelajaran apa saja yang tersedia di sekolah Anda?", type: "chips", options: ["Alat Peraga Fisik", "Laboratorium Komputer", "Lingkungan Terbuka", "Buku Teks & Internet"], category: "data" },
          { id: 4, question: "Berapa total Jam Pelajaran (JP) yang tersedia?", type: "chips", options: ["2 JP", "4 JP", "6 JP", "Sesuai Kurikulum"], category: "data" },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [prompt, docType]);

  const handleAnswer = (id: number, val: string) => {
    setAnswers(prev => ({ ...prev, [id]: val }));
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
                   {q.type === "chips" ? (
                     <div className="flex flex-col gap-3">
                        <div className="flex flex-wrap gap-2">
                            {q.options?.map(opt => (
                            <button
                                key={opt}
                                onClick={() => { handleAnswer(q.id, opt); setShowOther(prev => ({ ...prev, [q.id]: false })); }}
                                className={`px-4 py-2 rounded-md border text-sm transition-all ${answers[q.id] === opt && !showOther[q.id] ? 'bg-[#4d7537] text-white border-[#4d7537] shadow-lg shadow-[#4d7537]/20 font-semibold' : 'bg-white dark:bg-[#1a2315] border-neutral-200 dark:border-[#3f612d]/30 hover:border-[#4d7537]'}`}
                            >
                                {opt}
                            </button>
                            ))}
                            <button 
                                onClick={() => { setShowOther(prev => ({ ...prev, [q.id]: !prev[q.id] })); if (!showOther[q.id]) handleAnswer(q.id, ""); }}
                                className={`px-4 py-2 rounded-md border border-dashed transition-all text-sm flex items-center gap-1 ${showOther[q.id] ? 'bg-[#4d7537]/10 border-[#4d7537] text-[#4d7537] font-semibold' : 'border-neutral-300 dark:border-[#3f612d]/50 text-neutral-400 hover:text-[#4d7537] hover:border-[#4d7537]'}`}
                            >
                            <Plus className="w-3.5 h-3.5" /> Lainnya
                            </button>
                        </div>
                        {showOther[q.id] && (
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
