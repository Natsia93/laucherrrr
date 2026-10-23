"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

export interface MoodOption {
  id: string;
  emoji: string;
  label: string;
}

export const MOOD_OPTIONS: MoodOption[] = [
  {
    id: "awful",
    emoji: "😣",
    label: "Awful",
  },
  {
    id: "bad",
    emoji: "🙁",
    label: "Bad",
  },
  {
    id: "okay",
    emoji: "😐",
    label: "Okay",
  },
  {
    id: "good",
    emoji: "🙂",
    label: "Good",
  },
  {
    id: "great",
    emoji: "😄",
    label: "Great",
  },
];

// Staggered variants for emoticon entrance
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.18,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.7 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 22,
    },
  },
};

interface MoodCheckInModalProps {
  onSelectMood?: (mood: MoodOption) => void;
}

export function MoodCheckInModal({ onSelectMood }: MoodCheckInModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        return sessionStorage.getItem("user_mood_checked_session") !== "true";
      } catch {
        return false;
      }
    }
    return false;
  });
  const [isInitialWelcome, setIsInitialWelcome] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        return sessionStorage.getItem("user_mood_checked_session") !== "true";
      } catch {
        return false;
      }
    }
    return false;
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const sessionChecked = sessionStorage.getItem("user_mood_checked_session") === "true";
    if (!sessionChecked) {
      setIsInitialWelcome(true);
      setIsOpen(true);
    }
  }, []);

  useEffect(() => {
    const handleOpen = () => {
      setIsInitialWelcome(false);
      setIsOpen(true);
    };
    window.addEventListener("open_mood_modal", handleOpen);
    return () => window.removeEventListener("open_mood_modal", handleOpen);
  }, []);

  const handleSelect = (mood: MoodOption) => {
    setSelectedId(mood.id);
    localStorage.setItem("user_daily_mood", JSON.stringify(mood));
    sessionStorage.setItem("user_mood_checked_session", "true");

    if (onSelectMood) {
      onSelectMood(mood);
    }

    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      const channel = new BroadcastChannel("launcher_os_presence");
      channel.postMessage({ type: "MOOD_UPDATE", mood });
      channel.close();
    }

    window.dispatchEvent(new CustomEvent("user_mood_changed", { detail: mood }));

    setTimeout(() => {
      setIsOpen(false);
    }, 450);
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="mood-modal-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
          className="fixed inset-0 z-[99999999] flex items-center justify-center p-4 select-none"
        >
          {/* Frosted Glass Backdrop Overlay - Translucent to show blurred dashboard */}
          <motion.div
            key="mood-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            className={`fixed inset-0 transition-all duration-300 ${
              isInitialWelcome
                ? "bg-black/10 dark:bg-black/40 backdrop-blur-md"
                : "bg-black/15 dark:bg-black/45 backdrop-blur-sm"
            }`}
          />

          {/* Modal Container with Center Vertical Swipe IN & OUT */}
          <motion.div
            key="mood-modal-card"
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
            className="relative w-full max-w-[520px] bg-white dark:bg-[#121212] border border-neutral-200/80 dark:border-neutral-800/90 rounded-3xl shadow-[0_15px_40px_-15px_rgba(0,0,0,0.12)] dark:shadow-[0_15px_40px_-15px_rgba(0,0,0,0.5)] p-4 sm:p-7 md:p-8 z-10 space-y-5 sm:space-y-6"
          >
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.2 }}
              className="text-center"
            >
              <h2 className="font-sans text-[20px] sm:text-[24px] font-semibold tracking-tight text-neutral-900 dark:text-white">
                How are you today?
              </h2>
            </motion.div>

            {/* Staggered Horizontal Yellow Mood Options Row */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex items-center justify-between gap-1 sm:gap-2.5 md:gap-3 py-1"
            >
              {MOOD_OPTIONS.map((opt) => {
                const isSelected = selectedId === opt.id;

                return (
                  <motion.button
                    key={opt.id}
                    variants={itemVariants}
                    type="button"
                    whileHover={{
                      scale: 1.15,
                      y: -5,
                      transition: {
                        type: "spring",
                        stiffness: 450,
                        damping: 17,
                        mass: 0.45,
                      },
                    }}
                    whileTap={{
                      scale: 0.92,
                      transition: {
                        type: "spring",
                        stiffness: 500,
                        damping: 15,
                      },
                    }}
                    onClick={() => handleSelect(opt)}
                    className="flex-1 flex flex-col items-center justify-center gap-1.5 sm:gap-2 p-0.5 sm:p-1 group cursor-pointer outline-none focus:outline-none"
                  >
                    {/* All-Yellow Stylized Vector Face Avatar */}
                    <div
                      className={`relative w-11 h-11 xs:w-12 xs:h-12 sm:w-14 sm:h-14 md:w-15 md:h-15 rounded-full flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "ring-2.5 ring-[#FFD100] dark:ring-[#FFE135] ring-offset-2 dark:ring-offset-[#121212] shadow-xs"
                          : "shadow-2xs group-hover:shadow-sm"
                      }`}
                    >
                      {opt.id === "awful" && (
                        <svg viewBox="0 0 64 64" className="w-full h-full">
                          <circle cx="32" cy="32" r="30" fill="#FFD100" />
                          {/* Closed arch eyes */}
                          <path
                            d="M20 28 Q24 23 28 28"
                            stroke="#2B2100"
                            strokeWidth="3"
                            strokeLinecap="round"
                            fill="none"
                          />
                          <path
                            d="M36 28 Q40 23 44 28"
                            stroke="#2B2100"
                            strokeWidth="3"
                            strokeLinecap="round"
                            fill="none"
                          />
                          {/* Sad frown mouth */}
                          <path
                            d="M23 43 Q32 35 41 43"
                            stroke="#2B2100"
                            strokeWidth="3.2"
                            strokeLinecap="round"
                            fill="none"
                          />
                        </svg>
                      )}

                      {opt.id === "bad" && (
                        <svg viewBox="0 0 64 64" className="w-full h-full">
                          <circle cx="32" cy="32" r="30" fill="#FFD100" />
                          {/* Dot eyes */}
                          <circle cx="24" cy="27" r="3" fill="#2B2100" />
                          <circle cx="40" cy="27" r="3" fill="#2B2100" />
                          {/* Sad downturned mouth */}
                          <path
                            d="M24 42 Q32 35 40 42"
                            stroke="#2B2100"
                            strokeWidth="3.2"
                            strokeLinecap="round"
                            fill="none"
                          />
                        </svg>
                      )}

                      {opt.id === "okay" && (
                        <svg viewBox="0 0 64 64" className="w-full h-full">
                          <circle cx="32" cy="32" r="30" fill="#FFD100" />
                          {/* Dot eyes */}
                          <circle cx="24" cy="27" r="3" fill="#2B2100" />
                          <circle cx="40" cy="27" r="3" fill="#2B2100" />
                          {/* Slanted neutral mouth */}
                          <path
                            d="M24 39 Q32 38 40 41"
                            stroke="#2B2100"
                            strokeWidth="3.2"
                            strokeLinecap="round"
                            fill="none"
                          />
                        </svg>
                      )}

                      {opt.id === "good" && (
                        <svg viewBox="0 0 64 64" className="w-full h-full">
                          <circle cx="32" cy="32" r="30" fill="#FFD100" />
                          {/* Dot eyes */}
                          <circle cx="24" cy="27" r="3" fill="#2B2100" />
                          <circle cx="40" cy="27" r="3" fill="#2B2100" />
                          {/* Gentle smile mouth */}
                          <path
                            d="M24 37 Q32 44 40 37"
                            stroke="#2B2100"
                            strokeWidth="3.2"
                            strokeLinecap="round"
                            fill="none"
                          />
                        </svg>
                      )}

                      {opt.id === "great" && (
                        <svg viewBox="0 0 64 64" className="w-full h-full">
                          <circle cx="32" cy="32" r="30" fill="#FFD100" />
                          {/* Happy curved arch eyes */}
                          <path
                            d="M20 28 Q24 22 28 28"
                            stroke="#2B2100"
                            strokeWidth="3"
                            strokeLinecap="round"
                            fill="none"
                          />
                          <path
                            d="M36 28 Q40 22 44 28"
                            stroke="#2B2100"
                            strokeWidth="3"
                            strokeLinecap="round"
                            fill="none"
                          />
                          {/* Big happy smile mouth */}
                          <path
                            d="M22 37 Q32 48 42 37"
                            stroke="#2B2100"
                            strokeWidth="3.4"
                            strokeLinecap="round"
                            fill="none"
                          />
                        </svg>
                      )}
                    </div>

                    {/* Clean Sans Mood Label */}
                    <span
                      className={`font-sans text-[11px] xs:text-xs sm:text-[13px] md:text-[14px] tracking-tight text-center transition-colors truncate max-w-full ${
                        isSelected
                          ? "text-neutral-950 dark:text-white font-bold"
                          : "text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-950 dark:group-hover:text-white font-medium"
                      }`}
                    >
                      {opt.label}
                    </span>
                  </motion.button>
                );
              })}
            </motion.div>

            {/* Bottom Yellow Highlight Progress Bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.28 }}
              className="pt-1"
            >
              <div className="w-full h-1 bg-neutral-100 dark:bg-neutral-800/80 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#FFD100] transition-all duration-300 rounded-full"
                  style={{
                    width: selectedId
                      ? `${
                          ((MOOD_OPTIONS.findIndex((o) => o.id === selectedId) + 1) /
                            MOOD_OPTIONS.length) *
                          100
                        }%`
                      : "0%",
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
