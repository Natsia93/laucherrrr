"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Presentation, ExternalLink, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function GammaIntegrationPage() {
  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Presentation className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                Gamma App Integration
              </h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Direct AI-to-Gamma presentation deck generator & markdown orchestrator
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active Integration
            </span>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-2xs space-y-3">
            <div className="w-9 h-9 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300">
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <h3 className="font-semibold text-neutral-900 dark:text-white text-base">
              Deck Generator
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Generate structured, visual executive slides with custom themes (Onyx, Nord, Emerald, Rose) formatted for Gamma App.
            </p>
            <Link
              href="/decks"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-500 pt-1"
            >
              Open Deck Generator <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-2xs space-y-3">
            <div className="w-9 h-9 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <h3 className="font-semibold text-neutral-900 dark:text-white text-base">
              Workflow Automation
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Use the <span className="font-mono text-[11px] bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">gamma_export</span> node in visual workflows to automatically pipe document outputs into presentation decks.
            </p>
            <Link
              href="/automation"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-500 pt-1"
            >
              Configure Workflows <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-2xs space-y-3">
            <div className="w-9 h-9 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300">
              <ExternalLink className="w-4 h-4 text-purple-500" />
            </div>
            <h3 className="font-semibold text-neutral-900 dark:text-white text-base">
              Gamma Web App
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Paste generated slides directly into Gamma App to generate interactive web presentations and web pages with one click.
            </p>
            <a
              href="https://gamma.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-500 pt-1"
            >
              Launch Gamma.app <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* How-to guide */}
        <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 space-y-4">
          <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
            Quick Usage Guide
          </h2>
          <ol className="space-y-3 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 list-decimal list-inside leading-relaxed">
            <li>
              Navigate to <strong className="text-neutral-900 dark:text-white">Deck Generator</strong> or use an automated workflow with Gamma export.
            </li>
            <li>
              Select your presentation topic, density, and preferred theme.
            </li>
            <li>
              Copy the generated presentation markdown or click <strong className="text-neutral-900 dark:text-white">&ldquo;Export to Gamma&rdquo;</strong> to paste into Gamma App&apos;s import tool.
            </li>
          </ol>
        </div>
      </div>
    </AppShell>
  );
}
