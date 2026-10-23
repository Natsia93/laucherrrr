"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Loader2 } from "lucide-react";

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
}

export function LogoutConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: LogoutConfirmModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="logout-modal-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.25 } }}
          className="fixed inset-0 z-[99999999] flex items-center justify-center p-4 select-none font-sf"
        >
          {/* Frosted Glass Backdrop Overlay */}
          <motion.div
            key="logout-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            onClick={() => {
              if (!isLoading) onClose();
            }}
            className="fixed inset-0 transition-all duration-300 bg-black/20 dark:bg-black/50 backdrop-blur-sm"
          />

          {/* Modal Container: Compact, Minimalist, Modern with MoodCheck Vertical Expand Animation */}
          <motion.div
            key="logout-modal-card"
            initial={{ opacity: 0, scaleY: 0.1, scaleX: 0.95 }}
            animate={{ opacity: 1, scaleY: 1, scaleX: 1 }}
            exit={{
              opacity: 0,
              scaleY: 0.1,
              scaleX: 0.95,
              transition: {
                type: "spring",
                damping: 24,
                stiffness: 300,
                mass: 0.75,
              },
            }}
            transition={{
              type: "spring",
              damping: 26,
              stiffness: 340,
              mass: 0.8,
            }}
            style={{ transformOrigin: "center center" }}
            className="font-sf relative w-full max-w-[340px] bg-white dark:bg-[#141414] border border-neutral-200/90 dark:border-neutral-800 rounded-2xl shadow-xl dark:shadow-2xl p-5 z-10 space-y-4"
          >
            {/* Header & Description */}
            <div className="text-center space-y-1.5 pt-0.5">
              <h2 className="text-base sm:text-[17px] font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                Log out
              </h2>
              <p className="text-xs sm:text-[13px] leading-relaxed text-neutral-500 dark:text-neutral-400 font-normal px-1">
                Are you sure you want to log out? Your active session will be ended.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                disabled={isLoading}
                onClick={onClose}
                className="flex-1 h-9 px-3 rounded-lg text-xs font-medium border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer active:scale-95 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={onConfirm}
                className="flex-1 h-9 px-3 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 active:scale-95 text-white transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Logging out...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="w-3.5 h-3.5 stroke-[2.2]" />
                    <span>Log out</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
