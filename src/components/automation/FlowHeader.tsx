"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Play, Save, LayoutTemplate, RotateCcw, ArrowLeft, 
  Loader2, ArrowRight, Key, Undo2, Redo2, Store, HelpCircle, BookOpen
} from "lucide-react";
import { StarterTemplate } from "./types";
import { STARTER_TEMPLATES } from "./starterTemplates";
import { ThemeToggle } from "@/components/ThemeToggle";
import dynamic from "next/dynamic";

const LivePresenceStack = dynamic(
  () => import("@/components/layout/LivePresenceStack").then((mod) => mod.LivePresenceStack),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center -space-x-1.5 p-0.5">
        <div className="w-7 h-7 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-200/60 dark:bg-neutral-800/60 animate-pulse" />
      </div>
    ),
  }
);

interface FlowHeaderProps {
  flowName: string;
  setFlowName: (name: string) => void;
  onSave: () => Promise<void>;
  onRun: () => void;
  onLoadTemplate: (template: StarterTemplate) => void;
  onClear: () => void;
  onOpenApiModal: () => void;
  onOpenExportModal: () => void;
  onOpenImportModal: () => void;
  onOpenGlobalVars: () => void;
  onOpenTemplateMarketplace: () => void;
  onOpenTutorial: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isSaving: boolean;
  isRunning: boolean;
  hasUnsavedChanges: boolean;
  globalVarsCount: number;
}

export function FlowHeader({
  flowName,
  setFlowName,
  onSave,
  onRun,
  onLoadTemplate,
  onClear,
  onOpenApiModal,
  onOpenExportModal,
  onOpenImportModal,
  onOpenGlobalVars,
  onOpenTemplateMarketplace,
  onOpenTutorial,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  isSaving,
  isRunning,
  hasUnsavedChanges,
  globalVarsCount,
}: FlowHeaderProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  return (
    <header className="h-14 px-4 sm:px-5 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0c0c0c] flex items-center justify-between z-30 shrink-0 select-none font-sans">
      {/* Left Section: Back Button & Branding */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Back to Dashboard Button */}
        <Link
          href="/overview"
          className="h-8 px-2.5 rounded-[6px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121212] hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Overview</span>
        </Link>

        <div className="h-4 w-[1px] bg-neutral-200 dark:bg-neutral-800 hidden sm:block" />

        {/* Launcher OS Brand */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative w-6 h-6 rounded overflow-hidden shrink-0">
            <Image
              src="/logo/Logo_revou.png"
              alt="Launcher OS"
              fill
              sizes="24px"
              className="object-contain"
            />
          </div>

          <div className="flex items-center gap-2 min-w-0">
            {isEditingTitle ? (
              <input
                type="text"
                value={flowName}
                onChange={(e) => setFlowName(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => e.key === "Enter" && setIsEditingTitle(false)}
                autoFocus
                className="text-xs sm:text-[13px] font-semibold text-neutral-900 dark:text-neutral-100 bg-transparent border-b border-neutral-400 dark:border-neutral-500 focus:outline-none px-0.5 py-0.5"
              />
            ) : (
              <span
                onClick={() => setIsEditingTitle(true)}
                className="text-xs sm:text-[13px] font-semibold text-neutral-900 dark:text-neutral-100 truncate max-w-[140px] sm:max-w-[280px] md:max-w-[340px] cursor-pointer hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                title="Click to rename"
              >
                {flowName}
              </span>
            )}

            <span className="text-[10px] text-neutral-400 font-normal">
              {hasUnsavedChanges ? "(unsaved)" : ""}
            </span>
          </div>
        </div>

        {/* Undo/Redo */}
        <div className="hidden md:flex items-center gap-0.5 ml-1">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className="h-7 w-7 rounded-[5px] border border-neutral-200/60 dark:border-neutral-800/60 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-25 disabled:cursor-not-allowed"
          >
            <Undo2 className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Shift+Z)"
            className="h-7 w-7 rounded-[5px] border border-neutral-200/60 dark:border-neutral-800/60 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-25 disabled:cursor-not-allowed"
          >
            <Redo2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Right Section: Action Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Beginner Guide & Tutorial */}
        <button
          type="button"
          onClick={onOpenTutorial}
          title="Visual Automation Guide & Tutorial"
          className="h-8 px-2.5 rounded-[6px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121212] hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer group"
        >
          <BookOpen className="w-3.5 h-3.5 text-neutral-500 group-hover:text-[#FFE500] transition-colors" />
          <span className="hidden sm:inline">Guide</span>
        </button>

        {/* Global Variables */}
        <button
          type="button"
          onClick={onOpenGlobalVars}
          title="Global Variables & Secrets"
          className="h-8 px-2.5 rounded-[6px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121212] hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Key className="w-3.5 h-3.5 text-neutral-500" />
          <span className="hidden lg:inline">Variables</span>
          {globalVarsCount > 0 && (
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
              {globalVarsCount}
            </span>
          )}
        </button>

        {/* Template Marketplace */}
        <button
          type="button"
          onClick={onOpenTemplateMarketplace}
          className="h-8 px-2.5 rounded-[6px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121212] hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Store className="w-3.5 h-3.5 text-neutral-500" />
          <span className="hidden md:inline">Templates</span>
        </button>

        {/* Code / API Modal Trigger (Langflow-style) */}
        <button
          type="button"
          onClick={onOpenApiModal}
          title="Generate API Code (cURL, JS, Python)"
          className="h-8 px-2.5 rounded-[6px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121212] hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span className="font-mono font-bold text-[11px]">&lt;/&gt;</span>
          <span className="hidden xl:inline">API</span>
        </button>

        {/* Export JSON */}
        <button
          type="button"
          onClick={onOpenExportModal}
          title="Export Flow as JSON"
          className="h-8 px-2 rounded-[6px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121212] hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span className="text-[11px]">Export</span>
        </button>

        {/* Import JSON */}
        <button
          type="button"
          onClick={onOpenImportModal}
          title="Import Flow JSON"
          className="h-8 px-2 rounded-[6px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121212] hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span className="text-[11px]">Import</span>
        </button>

        {/* Reset Canvas */}
        <button
          type="button"
          onClick={onClear}
          title="Reset Canvas"
          className="h-8 px-2.5 rounded-[6px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121212] hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span className="hidden xl:inline">Reset</span>
        </button>

        {/* Save Button */}
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="h-8 px-3 rounded-[6px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121212] hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
        >
          {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
          <span className="hidden sm:inline">Save</span>
        </button>

        {/* Primary Run Flow Button */}
        <button
          type="button"
          onClick={onRun}
          disabled={isRunning}
          className="h-8 px-3.5 rounded-[6px] bg-[#FFE500] hover:bg-[#FFE500]/90 active:scale-98 text-neutral-950 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-60"
        >
          {isRunning ? (
            <Loader2 className="w-3 h-3 animate-spin text-neutral-950" />
          ) : (
            <Play className="w-3 h-3 fill-neutral-950" />
          )}
          <span>Run</span>
        </button>

        <div className="h-4 w-[1px] bg-neutral-200 dark:bg-neutral-800 mx-0.5 hidden sm:block" />

        {/* Live Collaborators & Theme */}
        <div className="hidden lg:flex items-center">
          <LivePresenceStack />
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
