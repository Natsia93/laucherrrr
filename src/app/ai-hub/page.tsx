"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { 
  Bot, 
  Cpu, 
  Sparkles, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  Flame, 
  ShieldCheck, 
  Workflow,
  Search,
  BookOpen
} from "lucide-react";
import { useRouter } from "next/navigation";

interface ModelCard {
  id: string;
  name: string;
  provider: string;
  badge: string;
  badgeColor: string;
  description: string;
  contextWindow: string;
  strengths: string[];
  recommendedTask: string;
  modelParam: string;
}

const AI_MODELS: ModelCard[] = [
  {
    id: "claude-3-5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    badge: "Most Nuanced",
    badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300/60",
    description: "Model unggulan untuk penulisan eksekutif, analisis strategi mendalam, sintesis multi-dokumen, dan formatting dokumen tingkat tinggi.",
    contextWindow: "200K Tokens",
    strengths: ["Strategic Thinking", "Tone Adaptation", "Long Form Polish"],
    recommendedTask: "Business Cases, OKR Decks, Executive Briefs",
    modelParam: "claude-3-5-sonnet",
  },
  {
    id: "deepseek-r1",
    name: "DeepSeek-R1 (Reasoning)",
    provider: "DeepSeek AI",
    badge: "Deep Reasoning",
    badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300/60",
    description: "Mesin penalaran berantai (Chain-of-Thought) untuk kalkulasi bisnis rumit, logika alur kerja multi-cabang, dan validasi data terstruktur.",
    contextWindow: "128K Tokens",
    strengths: ["Step-by-Step Logic", "Financial Modeling", "Edge-Case Testing"],
    recommendedTask: "Automation Workflows, Logic Rules, Math Modeling",
    modelParam: "deepseek",
  },
  {
    id: "gemini-2-5-flash",
    name: "Gemini 2.5 Flash",
    provider: "Google Cloud",
    badge: "Ultra Fast",
    badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300/60",
    description: "Respon instan dengan latensi terendah dan integrasi grounding Google Live Search untuk data real-time.",
    contextWindow: "1M Tokens",
    strengths: ["Live Web Grounding", "Speed (0.3s)", "Massive Documents"],
    recommendedTask: "Market Intelligence, Live Search Synthesis, Fast Drafts",
    modelParam: "gemini",
  },
  {
    id: "gpt-4o",
    name: "GPT-4o Omnichannel",
    provider: "OpenAI",
    badge: "Balanced All-Rounder",
    badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300/60",
    description: "Pemahaman instruksi serbaguna dengan penalaran lintas bahasa dan integrasi API yang sangat andal.",
    contextWindow: "128K Tokens",
    strengths: ["Instruction Following", "JSON Schema", "Multi-Language"],
    recommendedTask: "Customer Comms, API Actions, General Tasks",
    modelParam: "gpt-4o",
  },
];

export default function AiHubPage() {
  const router = useRouter();
  const [selectedModel, setSelectedModel] = useState<string>("claude-3-5-sonnet");
  const [quickPrompt, setQuickPrompt] = useState<string>("");

  const handleLaunchWorkspace = (modelId: string, customPrompt?: string) => {
    const promptToSend = customPrompt || quickPrompt || "Buat analisis strategis komprehensif";
    router.push(`/workspace?prompt=${encodeURIComponent(promptToSend)}&model=${encodeURIComponent(modelId)}`);
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-8 pb-16">
        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8 bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 text-white border border-neutral-800 shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFE500]/20 text-[#FFE500] border border-[#FFE500]/30">
              <Cpu className="w-3.5 h-3.5" />
              <span>Multi-Model AI Intelligence Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Pusat Model AI & Executive Orchestrator
            </h1>
            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
              Pilih dan jalankan model frontier terbaik sesuai kebutuhan bisnis <strong>RevoU Family</strong> — mulai dari penalaran logika mendalam DeepSeek hingga penulisan eksekutif Claude 3.5 Sonnet.
            </p>
          </div>

          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-end pr-8">
            <Bot className="w-64 h-64 text-white" />
          </div>
        </div>

        {/* Quick Prompt Launcher Bar */}
        <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#121212] border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#D4A800]" />
            Instant Prompt Dispatcher
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={quickPrompt}
              onChange={(e) => setQuickPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && quickPrompt.trim()) {
                  handleLaunchWorkspace(selectedModel, quickPrompt);
                }
              }}
              placeholder="Ketik topik dokumen, strategi, atau prompt langsung... (Tekan Enter untuk launch)"
              className="flex-1 px-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FFE500] transition-all"
            />
            <button
              onClick={() => handleLaunchWorkspace(selectedModel, quickPrompt)}
              className="px-5 py-2.5 rounded-lg bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-sm font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#FFE500]" />
              Launch in Workspace
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Model Cards Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white tracking-tight">
              Tersedia 4 Model Frontier Terintegrasi
            </h2>
            <span className="text-xs text-neutral-500">Auto Token Balancing Active</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {AI_MODELS.map((m) => {
              const isSelected = selectedModel === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedModel(m.id)}
                  className={`p-5 sm:p-6 rounded-xl border transition-all cursor-pointer flex flex-col justify-between relative ${
                    isSelected
                      ? "bg-amber-50/20 dark:bg-amber-950/10 border-[#FFE500] ring-1 ring-[#FFE500] shadow-sm"
                      : "bg-white dark:bg-[#121212] border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                          {m.provider}
                        </span>
                        <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
                          {m.name}
                        </h3>
                      </div>
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md border ${m.badgeColor}`}>
                        {m.badge}
                      </span>
                    </div>

                    <p className="text-xs sm:text-[13px] text-neutral-600 dark:text-neutral-300 leading-relaxed">
                      {m.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {m.strengths.map((str) => (
                        <span
                          key={str}
                          className="text-[11px] font-medium px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                        >
                          ✓ {str}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between">
                    <div className="text-[11px] text-neutral-400">
                      Context: <span className="font-semibold text-neutral-600 dark:text-neutral-300">{m.contextWindow}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLaunchWorkspace(m.modelParam);
                      }}
                      className="text-xs font-semibold text-neutral-900 dark:text-white hover:text-[#D4A800] dark:hover:text-[#FFE500] transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      Buka Model
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
