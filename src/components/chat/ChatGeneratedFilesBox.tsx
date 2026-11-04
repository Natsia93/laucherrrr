"use client";

import React, { useState, useMemo } from "react";
import {
  FileText,
  FileSpreadsheet,
  FileCode,
  Download,
  Loader2,
  Check,
  Plus,
} from "lucide-react";
import {
  ChatGeneratedFile,
  extractChatFiles,
  downloadChatFile,
  downloadAllChatFiles,
  generateDocxBlob,
  generateXlsxBlob,
  printPdfDocument,
  generateMdBlob,
  triggerBlobDownload,
  sanitizeFilename,
  extractTitleFromMarkdown,
} from "@/lib/chat-file-export";

interface ChatGeneratedFilesBoxProps {
  text: string;
  docType?: string;
  initialFiles?: ChatGeneratedFile[];
}

export function ChatGeneratedFilesBox({
  text,
  docType,
  initialFiles,
}: ChatGeneratedFilesBoxProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [downloadedIds, setDownloadedIds] = useState<Record<string, boolean>>({});

  const files = useMemo(() => {
    if (initialFiles && initialFiles.length > 0) return initialFiles;
    return extractChatFiles(text, docType);
  }, [text, docType, initialFiles]);

  if (!text || text.length < 100 || !files || files.length === 0) return null;

  const handleDownloadSingle = async (file: ChatGeneratedFile) => {
    if (downloadingId || downloadingAll) return;
    setDownloadingId(file.id);
    try {
      await downloadChatFile(file);
      setDownloadedIds((prev) => ({ ...prev, [file.id]: true }));
      setTimeout(() => {
        setDownloadedIds((prev) => ({ ...prev, [file.id]: false }));
      }, 3000);
    } catch (e) {
      console.error("Download failed:", e);
      alert("Gagal mengunduh file.");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDownloadAll = async () => {
    if (downloadingAll || downloadingId) return;
    setDownloadingAll(true);
    try {
      await downloadAllChatFiles(files);
      const allDone: Record<string, boolean> = {};
      files.forEach((f) => (allDone[f.id] = true));
      setDownloadedIds(allDone);
      setTimeout(() => setDownloadedIds({}), 3000);
    } catch (e) {
      console.error("Download all failed:", e);
      alert("Gagal mengunduh semua file.");
    } finally {
      setDownloadingAll(false);
    }
  };

  // Instant export for any format on demand
  const handleExportFormat = async (format: "docx" | "xlsx" | "pdf" | "md") => {
    const title = extractTitleFromMarkdown(text);
    const id = `adhoc-${format}`;
    setDownloadingId(id);

    try {
      if (format === "docx") {
        const blob = await generateDocxBlob(title, text);
        triggerBlobDownload(blob, sanitizeFilename(title, "docx"));
      } else if (format === "xlsx") {
        const blob = generateXlsxBlob(title, text);
        triggerBlobDownload(blob, sanitizeFilename(title, "xlsx"));
      } else if (format === "pdf") {
        printPdfDocument(title, text);
      } else if (format === "md") {
        const blob = generateMdBlob(text);
        triggerBlobDownload(blob, sanitizeFilename(title, "md"));
      }

      setDownloadedIds((prev) => ({ ...prev, [id]: true }));
      setTimeout(() => {
        setDownloadedIds((prev) => ({ ...prev, [id]: false }));
      }, 3000);
    } catch (e) {
      console.error("Export format failed:", e);
      alert(`Gagal mengekspor file ${format.toUpperCase()}.`);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 space-y-2.5 select-none">
      {/* File Cards Stack (Matching Claude.ai Artifacts Design) */}
      <div className="space-y-2">
        {files.map((file) => {
          const isDownloading = downloadingId === file.id;
          const isDownloaded = downloadedIds[file.id];

          // File badge & icon styling
          let icon = <FileText className="w-4.5 h-4.5 text-blue-500 dark:text-blue-400 stroke-[1.8]" />;
          let iconBoxBg = "bg-blue-500/10 dark:bg-blue-500/15 border-blue-500/20";

          if (file.type === "xlsx") {
            icon = <FileSpreadsheet className="w-4.5 h-4.5 text-emerald-500 dark:text-emerald-400 stroke-[1.8]" />;
            iconBoxBg = "bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/20";
          } else if (file.type === "pdf") {
            icon = <FileText className="w-4.5 h-4.5 text-red-500 dark:text-red-400 stroke-[1.8]" />;
            iconBoxBg = "bg-red-500/10 dark:bg-red-500/15 border-red-500/20";
          } else if (file.type === "md") {
            icon = <FileCode className="w-4.5 h-4.5 text-amber-500 dark:text-amber-400 stroke-[1.8]" />;
            iconBoxBg = "bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/20";
          }

          return (
            <div
              key={file.id}
              onClick={() => handleDownloadSingle(file)}
              className="group flex items-center justify-between p-3 sm:py-3.5 sm:px-4 rounded-xl border border-neutral-200/90 dark:border-neutral-800 bg-white/60 dark:bg-[#161616] hover:bg-white dark:hover:bg-[#1f1f1f] hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-150 cursor-pointer shadow-2xs hover:shadow-xs"
              title={`Klik untuk mengunduh ${file.filename}`}
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                {/* Left Icon Box */}
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0 border ${iconBoxBg} transition-transform group-hover:scale-105`}
                >
                  {icon}
                </div>

                {/* Text Metadata */}
                <div className="min-w-0 flex-1 pr-2">
                  <h4 className="text-[13px] sm:text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {file.title}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    {file.subtitle}
                  </p>
                </div>
              </div>

              {/* Right Action / Status */}
              <div className="shrink-0 flex items-center pl-2">
                {isDownloading ? (
                  <span className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                    <Loader2 className="w-4 h-4 animate-spin text-neutral-600 dark:text-neutral-300" />
                  </span>
                ) : isDownloaded ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium border border-emerald-500/20">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span className="hidden sm:inline">Downloaded</span>
                  </span>
                ) : (
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white group-hover:bg-neutral-100 dark:group-hover:bg-neutral-800 transition-all">
                    <Download className="w-4 h-4 stroke-[2]" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Row: "Download all" Button & Quick Format Export Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        {files.length >= 2 ? (
          <button
            type="button"
            onClick={handleDownloadAll}
            disabled={downloadingAll || !!downloadingId}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-100/90 dark:bg-neutral-800/90 hover:bg-neutral-200 dark:hover:bg-neutral-700 active:scale-95 transition-all cursor-pointer border border-neutral-200/80 dark:border-neutral-700/80 shadow-2xs"
          >
            {downloadingAll ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5 stroke-[2.2]" />
            )}
            <span>{downloadingAll ? "Mendownload Semua..." : "Download all"}</span>
          </button>
        ) : (
          <div />
        )}

        {/* Quick Format Export Pills */}
        <div className="flex items-center gap-1 text-[11px] text-neutral-400">
          <span className="hidden sm:inline mr-1 text-[10.5px]">Ekspor Cepat:</span>
          {[
            { format: "docx" as const, label: "Word (.docx)" },
            { format: "xlsx" as const, label: "Excel (.xlsx)" },
            { format: "pdf" as const, label: "PDF" },
            { format: "md" as const, label: "Markdown" },
          ].map((item) => (
            <button
              key={item.format}
              type="button"
              disabled={!!downloadingId || downloadingAll}
              onClick={() => handleExportFormat(item.format)}
              className="px-2 py-0.5 rounded-md border border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900 transition-colors cursor-pointer"
            >
              {downloadingId === `adhoc-${item.format}` ? (
                <Loader2 className="w-2.5 h-2.5 animate-spin inline mr-1" />
              ) : null}
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
