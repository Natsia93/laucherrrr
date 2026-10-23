"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Edit3, Check, Trash2, Loader2, CloudCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/lib/auth-client";

export function OverviewScratchpad() {
  const { data: session } = authClient.useSession();
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load from local storage cache immediately for instant render (0ms delay)
  useEffect(() => {
    try {
      const cached = localStorage.getItem("launcher_os_scratchpad");
      if (cached !== null) {
        setNote(cached);
        setIsLoading(false);
      }
    } catch {}
  }, []);

  // Fetch initial note from database
  const fetchNote = useCallback(async () => {
    try {
      const res = await fetch("/api/scratchpad");
      if (res.ok) {
        const data = await res.json();
        if (typeof data.content === "string") {
          setNote(data.content);
          if (typeof window !== "undefined") {
            localStorage.setItem("launcher_os_scratchpad", data.content);
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch scratchpad from database:", err);
      // Fallback to local storage if offline
      if (typeof window !== "undefined") {
        const cached = localStorage.getItem("launcher_os_scratchpad");
        if (cached !== null) setNote(cached);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNote();
  }, [fetchNote, session?.user?.id]);

  // Save to database
  const saveToDatabase = useCallback(async (content: string) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/scratchpad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        setSaved(true);
        if (typeof window !== "undefined") {
          localStorage.setItem("launcher_os_scratchpad", content);
        }
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (err) {
      console.error("Failed to save scratchpad:", err);
    } finally {
      setIsSaving(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNote(val);
    setSaved(false);

    // Debounced autosave (800ms)
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      saveToDatabase(val);
    }, 800);
  };

  const handleBlur = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    saveToDatabase(note);
  };

  const handleClear = async () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setNote("");
    setSaved(false);
    setIsSaving(true);
    try {
      await fetch("/api/scratchpad", {
        method: "DELETE",
      });
      if (typeof window !== "undefined") {
        localStorage.setItem("launcher_os_scratchpad", "");
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Failed to clear scratchpad in database:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="p-5 sm:p-6 bg-[#FFEDA5] dark:bg-[#1c1a11] border-[#ebd68c] dark:border-[#FFEDA5]/20 rounded-xl shadow-xs flex flex-col justify-between min-h-[420px] h-full relative group transition-all">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-[#ebd68c]/80 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <Edit3 className="w-5 h-5 text-neutral-950 dark:text-white shrink-0 stroke-[2]" />
            <h3 className="text-base sm:text-lg font-semibold text-neutral-950 dark:text-white tracking-tight">
              Scratchpad & Notes
            </h3>
          </div>

          {isSaving ? (
            <span className="text-[11px] font-semibold text-amber-900 dark:text-amber-400 inline-flex items-center gap-1 shrink-0">
              <Loader2 className="w-3 h-3 animate-spin" />
              Saving...
            </span>
          ) : saved ? (
            <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 inline-flex items-center gap-1 shrink-0">
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              Saved to Cloud
            </span>
          ) : null}
        </div>

        {/* Textarea */}
        {isLoading ? (
          <div className="min-h-[250px] flex items-center justify-center text-neutral-700 dark:text-neutral-400 text-xs">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Loading notes from database...
          </div>
        ) : (
          <Textarea
            value={note}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Write ideas, quick prompts, or temporary notes here..."
            className="min-h-[250px] w-full bg-transparent border-none outline-none focus-visible:ring-0 resize-none text-[13.5px] font-normal text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-600/60 dark:placeholder:text-neutral-500 leading-relaxed p-0 shadow-none"
          />
        )}
      </div>

      {/* Footer */}
      <div className="pt-3.5 mt-3 border-t border-[#ebd68c]/80 dark:border-neutral-800 flex items-center justify-between text-[11px] text-neutral-700/80 dark:text-neutral-400">
        <span>Saved to user cloud database</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="h-6 text-[11px] text-neutral-700 dark:text-neutral-400 hover:text-red-700 hover:bg-black/10 dark:hover:bg-neutral-800 rounded-md px-2 gap-1 cursor-pointer"
        >
          <Trash2 className="w-3 h-3" />
          <span>Clear</span>
        </Button>
      </div>
    </Card>
  );
}

