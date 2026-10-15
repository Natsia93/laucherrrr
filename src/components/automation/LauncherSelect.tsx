"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string;
}

interface LauncherSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: (string | SelectOption)[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function LauncherSelect({
  value,
  onChange,
  options,
  placeholder = "Select...",
  className = "",
  disabled = false,
}: LauncherSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalize options
  const normalizedOptions: SelectOption[] = options.map((opt) =>
    typeof opt === "string" ? { value: opt, label: opt } : opt
  );

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Handle key navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-8 px-2.5 text-xs font-medium rounded-[6px] border flex items-center justify-between transition-colors duration-100 cursor-pointer text-left ${
          isOpen
            ? "border-neutral-400 dark:border-white/40 ring-1 ring-neutral-400/30 dark:ring-white/20 bg-neutral-100 dark:bg-white/[0.08]"
            : "border-neutral-300/80 dark:border-white/[0.1] hover:border-neutral-400 dark:hover:border-white/[0.22] bg-white/90 dark:bg-[#141414]"
        } text-neutral-800 dark:text-neutral-100 shadow-2xs`}
      >
        <span className="truncate flex items-center gap-1.5">
          {selectedOption?.icon}
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-150 shrink-0 ml-1 ${
            isOpen ? "rotate-180 text-neutral-700 dark:text-neutral-200" : ""
          }`}
        />
      </button>

      {/* Custom Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-[999] min-w-[140px] max-h-56 overflow-y-auto rounded-[8px] border border-neutral-200 dark:border-white/[0.14] bg-white dark:bg-[#1c1c1c] shadow-[0_10px_25px_rgba(0,0,0,0.12)] dark:shadow-[0_12px_35px_rgba(0,0,0,0.7)] p-1 backdrop-blur-md animate-in fade-in zoom-in-95 duration-100">
          {normalizedOptions.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full px-2.5 py-1.5 text-xs rounded-[5px] flex items-center justify-between transition-colors duration-75 text-left cursor-pointer ${
                  isSelected
                    ? "bg-neutral-100 dark:bg-white/[0.12] text-neutral-900 dark:text-white font-medium"
                    : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100/70 dark:hover:bg-white/[0.06] hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {opt.icon}
                  <span className="truncate">{opt.label}</span>
                  {opt.badge && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-mono">
                      {opt.badge}
                    </span>
                  )}
                </div>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0 ml-1.5" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
