"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, Info, CheckCircle2 } from "lucide-react";
import { Button } from "./button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  description: string;
  type?: "danger" | "info" | "success";
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export function ActionModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  type = "info",
  confirmText = "Konfirmasi",
  cancelText = "Batal",
  isLoading = false,
}: ModalProps) {
  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  const icons = {
    danger: <AlertTriangle className="w-6 h-6 text-red-500" />,
    info: <Info className="w-6 h-6 text-blue-500" />,
    success: <CheckCircle2 className="w-6 h-6 text-emerald-500" />,
  };

  const colors = {
    danger: "bg-red-50 dark:bg-red-900/20",
    info: "bg-blue-50 dark:bg-blue-900/20",
    success: "bg-emerald-50 dark:bg-emerald-900/20",
  };

  const buttonColors = {
    danger: "bg-red-500 hover:bg-red-600 shadow-red-500/20",
    info: "bg-[#4d7537] hover:bg-[#5a8b41] shadow-[#4d7537]/20",
    success: "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-[2px]"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-white dark:bg-[#0a0a0a] border border-[#dcdad1] dark:border-[#3f612d]/30 rounded-2xl shadow-2xl pointer-events-auto overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colors[type]}`}>
                    {icons[type]}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white font-bricolage">
                      {title}
                    </h3>
                    <p className="text-neutral-500 dark:text-[#a2b591] text-sm mt-1 leading-relaxed">
                      {description}
                    </p>
                  </div>
                  <button 
                    onClick={onClose}
                    className="text-neutral-400 hover:text-neutral-600 dark:hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center justify-end gap-3 mt-8">
                  <Button
                    variant="ghost"
                    onClick={onClose}
                    disabled={isLoading}
                    className="text-neutral-500 hover:bg-neutral-100 dark:hover:bg-[#1a2315] rounded-xl px-6"
                  >
                    {cancelText}
                  </Button>
                  <Button
                    onClick={onConfirm}
                    disabled={isLoading}
                    className={`text-white rounded-xl px-6 shadow-lg transition-all active:scale-95 ${buttonColors[type === "info" ? "info" : type]}`}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Memproses...
                      </span>
                    ) : (
                      confirmText
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
