"use client";

import React, { useState, useRef } from "react";
import {
  Upload,
  Sparkles,
  Check,
  X,
  Palette,
  Type,
  Layout,
  RefreshCw,
  FileImage,
  AlertCircle,
  Eye,
  Sliders,
} from "lucide-react";

export interface ClonedStyleResult {
  referenceImageUrl?: string;
  palette: {
    primary: string;
    secondary: string;
    accent: string;
  };
  bgStyle: "solid" | "mixed" | "dualtone" | "gradient";
  isDarkTheme: boolean;
  typography: {
    titleFontSuggestion: "sf-pro" | "bricolage" | "jakarta" | "outfit" | "lora" | "inter";
    bodyFontSuggestion: "sf-pro" | "inter" | "jakarta" | "outfit";
    rationale: string;
  };
  layoutMood: "executive" | "framework" | "data";
  contentDensity: "brief" | "medium" | "detailed";
  designDNASummary: string;
  layoutPatterns: string[];
  visualDirectives: string;
  imageStyle?: string;
  extractedSampleContent?: string;
}

interface CloneStyleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyStyle: (style: ClonedStyleResult) => void;
  currentClonedStyle?: ClonedStyleResult | null;
  onClearClonedStyle?: () => void;
}

export function CloneStyleModal({
  isOpen,
  onClose,
  onApplyStyle,
  currentClonedStyle,
  onClearClonedStyle,
}: CloneStyleModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ClonedStyleResult | null>(currentClonedStyle || null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (selectedFile: File) => {
    setErrorMsg(null);
    if (!selectedFile.type.startsWith("image/") && !selectedFile.name.endsWith(".pdf")) {
      setErrorMsg("Mohon unggah file gambar (PNG, JPG, WEBP) atau file PDF.");
      return;
    }

    if (selectedFile.size > 15 * 1024 * 1024) {
      setErrorMsg("Ukuran file maksimal 15MB.");
      return;
    }

    setFile(selectedFile);
    if (selectedFile.type.startsWith("image/")) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    setErrorMsg(null);

    try {
      const activeProvider = typeof window !== "undefined" ? (localStorage.getItem("ai_provider") || "gemini") : "gemini";
      const storedApiKey = typeof window !== "undefined" ? (localStorage.getItem(`ai_key_${activeProvider}`) || "") : "";

      const formData = new FormData();
      formData.append("file", file);
      if (storedApiKey) {
        formData.append("apiKey", storedApiKey);
        formData.append("provider", activeProvider);
      }

      const res = await fetch("/api/decks/analyze-reference", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success || !data.style) {
        throw new Error(data.error || "Gagal menganalisis gaya visual slide referensi.");
      }

      const resultWithImage: ClonedStyleResult = {
        ...data.style,
        referenceImageUrl: previewUrl || undefined,
      };

      setAnalysisResult(resultWithImage);
    } catch (err: any) {
      console.error("Clone style error:", err);
      setErrorMsg(err.message || "Terjadi kesalahan saat memproses gambar.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApply = () => {
    if (analysisResult) {
      onApplyStyle(analysisResult);
      onClose();
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreviewUrl(null);
    setAnalysisResult(null);
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-[#121212] rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FFDE3C]/20 text-[#8F7200] dark:text-[#FFE54C] flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white font-sf">
                Clone Style dari Slide Referensi
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Vision AI menganalisis warna, layout, dan font dari slide favorit Anda
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 font-sans">
          {errorMsg && (
            <div className="p-3.5 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex items-start gap-2.5 text-xs text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!analysisResult ? (
            /* Upload Zone State */
            <div className="space-y-4">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                  isDragOver
                    ? "border-[#FFDE3C] bg-[#FFDE3C]/10"
                    : "border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600 bg-neutral-50/50 dark:bg-neutral-900/30"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,application/pdf"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileSelect(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />

                {previewUrl ? (
                  <div className="space-y-3 flex flex-col items-center">
                    <div className="relative w-48 h-28 rounded-lg overflow-hidden border border-neutral-300 dark:border-neutral-700 shadow-md">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={previewUrl} alt="Preview Slide" className="w-full h-full object-cover" />
                    </div>
                    <div className="text-xs font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                      <FileImage className="w-3.5 h-3.5 text-amber-500" />
                      <span>{file?.name}</span>
                    </div>
                    <p className="text-[11px] text-neutral-400">Klik untuk mengganti gambar</p>
                  </div>
                ) : file ? (
                  <div className="space-y-2 flex flex-col items-center">
                    <FileImage className="w-10 h-10 text-amber-500" />
                    <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">{file.name}</span>
                    <p className="text-[11px] text-neutral-400">Klik untuk mengganti file</p>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500">
                      <Upload className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                        Drop screenshot slide contoh di sini, atau <span className="text-amber-600 dark:text-amber-400 underline">pilih file</span>
                      </p>
                      <p className="text-xs text-neutral-400 mt-1">
                        Mendukung format PNG, JPG, WEBP, atau PDF (Maks. 15MB)
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Action Button to Start Analysis */}
              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-neutral-500 dark:text-neutral-400 italic">
                  💡 Tips: Screenshot 1 slide yang layout dan warnanya paling kamu sukai.
                </p>
                <button
                  type="button"
                  disabled={!file || isAnalyzing}
                  onClick={handleAnalyze}
                  className={`px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    file && !isAnalyzing
                      ? "bg-[#FFDE3C] hover:bg-[#ffe55c] text-neutral-950 shadow-md active:scale-95"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600 cursor-not-allowed"
                  }`}
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-neutral-900" />
                      <span>Menganalisis Visual DNA...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Mulai Analisis Slide</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Results View */
            <div className="space-y-5">
              {/* Top Banner Summary */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-neutral-900 dark:to-[#1a1708] border border-amber-200/80 dark:border-amber-900/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-[#FFDE3C] text-neutral-950">
                      Visual DNA Terdeteksi
                    </span>
                    {analysisResult.isDarkTheme && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-900 text-white dark:bg-neutral-800">
                        Dark Canvas
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-xs font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white flex items-center gap-1 underline"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Ganti Gambar</span>
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 font-medium leading-relaxed">
                  {analysisResult.designDNASummary}
                </p>
              </div>

              {/* Grid 1: Palette Colors */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5 font-sf">
                  <Palette className="w-3.5 h-3.5" />
                  <span>Palet Warna yang Diekstrak</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Primary Brand", color: analysisResult.palette.primary, desc: "Aksen utama / kartu" },
                    { label: "Secondary", color: analysisResult.palette.secondary, desc: "Warna dasar canvas" },
                    { label: "Accent / Pill", color: analysisResult.palette.accent, desc: "Badge & sorotan" },
                  ].map((p, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/40 flex items-center gap-3"
                    >
                      <div
                        className="w-8 h-8 rounded-md border border-black/15 shadow-sm shrink-0"
                        style={{ backgroundColor: p.color }}
                      />
                      <div className="overflow-hidden">
                        <p className="text-[11px] font-bold text-neutral-800 dark:text-neutral-200 truncate">{p.label}</p>
                        <p className="text-xs font-mono text-neutral-500 uppercase">{p.color}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grid 2: Typography & Mood */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/40 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    <Type className="w-3.5 h-3.5 text-amber-500" />
                    <span>Rekomendasi Tipografi</span>
                  </div>
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white capitalize">
                    {analysisResult.typography.titleFontSuggestion.toUpperCase()} + {analysisResult.typography.bodyFontSuggestion.toUpperCase()}
                  </p>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-snug">
                    {analysisResult.typography.rationale}
                  </p>
                </div>

                <div className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/40 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    <Layout className="w-3.5 h-3.5 text-amber-500" />
                    <span>Gaya Layout & Ritme</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 capitalize">
                      Mood: {analysisResult.layoutMood}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 capitalize">
                      Kepadatan: {analysisResult.contentDensity}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {analysisResult.layoutPatterns.map((pat, i) => (
                      <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-800 dark:text-amber-300 font-medium">
                        {pat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Directives Preview */}
              {analysisResult.visualDirectives && (
                <div className="p-3 rounded-lg bg-neutral-100/70 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 text-[11.5px] text-neutral-600 dark:text-neutral-400 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-neutral-800 dark:text-neutral-200">
                    <Sliders className="w-3 h-3 text-amber-500" />
                    <span>Petunjuk Visual Otomatis (Akan dimasukkan ke generator)</span>
                  </div>
                  <p className="line-clamp-2 leading-relaxed">{analysisResult.visualDirectives}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/50 flex items-center justify-between">
          <div>
            {currentClonedStyle && onClearClonedStyle && (
              <button
                type="button"
                onClick={() => {
                  onClearClonedStyle();
                  handleReset();
                }}
                className="text-xs text-red-500 hover:text-red-700 underline font-medium"
              >
                Hapus Gaya Referensi Aktif
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Batal
            </button>
            {analysisResult && (
              <button
                type="button"
                onClick={handleApply}
                className="px-5 py-2 rounded-lg text-xs font-bold bg-[#FFDE3C] hover:bg-[#ffe55c] text-neutral-950 flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Terapkan Gaya ke Presentasi Ini</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
