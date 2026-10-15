"use client";

import React from "react";
import { X, Download, FileText, Image as ImageIcon, ExternalLink } from "lucide-react";
import { Attachment } from "./types";

interface SlackAttachmentPreviewModalProps {
  attachment: Attachment | null;
  onClose: () => void;
}

export function SlackAttachmentPreviewModal({
  attachment,
  onClose,
}: SlackAttachmentPreviewModalProps) {
  if (!attachment) return null;

  const isImage = attachment.type === "image" || attachment.previewUrl;

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-3xl rounded-2xl bg-white dark:bg-[#161616] border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-4 border-b border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            {isImage ? (
              <ImageIcon className="w-4 h-4 text-blue-500 shrink-0" />
            ) : (
              <FileText className="w-4 h-4 text-rose-500 shrink-0" />
            )}
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                {attachment.name}
              </h3>
              <p className="text-[10.5px] text-neutral-400">
                {attachment.size} • Pratinjau Dokumen
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={attachment.url}
              download={attachment.name}
              className="px-3 py-1.5 rounded-lg bg-[#FFE500] hover:bg-[#F2D700] text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh File</span>
            </a>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body Preview */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 flex items-center justify-center bg-neutral-100/50 dark:bg-neutral-900/50 min-h-[320px]">
          {isImage ? (
            <img
              src={attachment.previewUrl || attachment.url}
              alt={attachment.name}
              className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-md"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-8 space-y-3 bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs max-w-md w-full">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-200 dark:border-rose-900/60">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-neutral-900 dark:text-white text-sm">
                  {attachment.name}
                </h4>
                <p className="text-xs text-neutral-400 mt-1">
                  Ukuran File: {attachment.size}
                </p>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Dokumen ini siap diunduh atau dibuka di software pembaca PDF/dokumen lokal Anda.
              </p>
              <a
                href={attachment.url}
                download={attachment.name}
                className="w-full py-2.5 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold text-xs flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
              >
                <Download className="w-4 h-4" />
                Simpan ke Komputer
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
