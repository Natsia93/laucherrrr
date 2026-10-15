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
          className="fixed inset-0 z-[99999999] flex items-center justify-center p-4 select-none font-jakarta"
        >
          {/* Frosted Glass Backdrop Overlay - matching MoodCheck styling */}
          <motion.div
            key="logout-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.25 } }}
            onClick={() => {
              if (!isLoading) onClose();
            }}
            className="fixed inset-0 transition-all duration-300 bg-black/15 dark:bg-black/45 backdrop-blur-md"
          />

          {/* Modal Container with Center Vertical Swipe IN & OUT (MoodCheck signature animation) */}
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
            className="font-jakarta relative w-full max-w-[440px] bg-white dark:bg-[#121212] border border-neutral-200/80 dark:border-neutral-800/90 rounded-3xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.6)] p-8 sm:p-9 z-10 space-y-7"
          >
            {/* Header & Description */}
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.2 }}
              className="text-center space-y-3 pt-1"
            >
              <h2 className="font-jakarta text-[26px] sm:text-[28px] font-bold tracking-tight text-neutral-950 dark:text-white leading-tight">
                Log out
              </h2>
              <p className="font-jakarta text-[15.5px] sm:text-[16.5px] leading-relaxed text-neutral-600 dark:text-neutral-300 max-w-[340px] mx-auto font-normal">
                Are you sure you want to log out? Your active session will be ended.
              </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.2 }}
              className="flex items-center gap-3.5 pt-1"
            >
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                disabled={isLoading}
                onClick={onClose}
                className="font-jakarta flex-1 h-12 px-5 rounded-xl text-[15px] font-semibold border border-neutral-200 dark:border-neutral-800 bg-neutral-100 hover:bg-neutral-200/70 dark:bg-neutral-800/80 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                disabled={isLoading}
                onClick={onConfirm}
                className="font-jakarta flex-1 h-12 px-5 rounded-xl text-[15px] font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors shadow-sm shadow-red-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Logging out...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="w-4.5 h-4.5 stroke-[2.2]" />
                    <span>Log out</span>
                  </>
                )}
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
