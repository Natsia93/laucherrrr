"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, ArrowRight, ArrowLeft, Check, Sparkles, Play,
  Zap, Cpu, FileText, Layers, Workflow
} from "lucide-react";

interface AutomationTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadStarterTemplate?: () => void;
}

const TUTORIAL_STEPS = [
  {
    step: 1,
    tag: "Basic Concept",
    title: "Visual Flow Automation",
    subtitle: "Assemble automated workflows without writing complex code",
    description:
      "Transform repetitive tasks into intelligent pipelines. Rectangles are Nodes (work steps), and connecting lines are Edges carrying data.",
    icon: Layers,
    visual: (
      <div className="w-full h-full flex flex-col justify-center items-center gap-3 p-3">
        <div className="flex items-center justify-between gap-1.5 w-full">
          <div className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200/70 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 font-medium text-[11px]">
            <Zap className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap font-semibold">Trigger</span>
          </div>
          <div className="w-2.5 h-[1.5px] bg-neutral-300 dark:bg-neutral-700 shrink-0" />
          <div className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg bg-amber-50 dark:bg-[#FFE500]/10 border border-amber-200/70 dark:border-[#FFE500]/20 text-amber-700 dark:text-[#FFE500] font-semibold text-[11px] shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap font-semibold">AI Brain</span>
          </div>
          <div className="w-2.5 h-[1.5px] bg-neutral-300 dark:bg-neutral-700 shrink-0" />
          <div className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/70 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-medium text-[11px]">
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap font-semibold">Action DB</span>
          </div>
        </div>
        <p className="text-[11px] text-neutral-400 dark:text-neutral-500 text-center leading-tight">
          Input Prompt ➔ AI Processing ➔ Saved to Documents
        </p>
      </div>
    ),
    highlights: [
      "Left: Input prompt, webhook, or cron schedule",
      "Middle: AI Processing with Gemini / GPT & Search",
      "Right: Automated execution into Workspace DB"
    ]
  },
  {
    step: 2,
    tag: "Node Collection",
    title: "Modular Component Library",
    subtitle: "Select and drag components from the left panel onto the canvas",
    description:
      "Open the Components (+) panel in the top left to choose nodes tailored to your task.",
    icon: Cpu,
    visual: (
      <div className="w-full h-full grid grid-cols-2 gap-2 p-1 content-center">
        <div className="p-2 rounded-lg border border-neutral-200/70 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/60 flex flex-col justify-center">
          <span className="text-[9px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded w-fit">Trigger</span>
          <p className="text-[11.5px] font-semibold text-neutral-800 dark:text-neutral-200 mt-0.5">Input / Webhook</p>
        </div>
        <div className="p-2 rounded-lg border border-neutral-200/70 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/60 flex flex-col justify-center">
          <span className="text-[9px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded w-fit">AI Model</span>
          <p className="text-[11.5px] font-semibold text-neutral-800 dark:text-neutral-200 mt-0.5">Gemini & GPT-4o</p>
        </div>
        <div className="p-2 rounded-lg border border-neutral-200/70 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/60 flex flex-col justify-center">
          <span className="text-[9px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded w-fit">Tools</span>
          <p className="text-[11.5px] font-semibold text-neutral-800 dark:text-neutral-200 mt-0.5">Search & Slack</p>
        </div>
        <div className="p-2 rounded-lg border border-neutral-200/70 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/60 flex flex-col justify-center">
          <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded w-fit">Actions</span>
          <p className="text-[11.5px] font-semibold text-neutral-800 dark:text-neutral-200 mt-0.5">Docs & Task DB</p>
        </div>
      </div>
    ),
    highlights: [
      "Drag & drop node cards directly anywhere on the canvas",
      "Customize model parameters & prompts in each node card",
      "Use Custom Code for custom JavaScript data transformations"
    ]
  },
  {
    step: 3,
    tag: "Flow Connection",
    title: "Connecting Data Pipelines",
    subtitle: "Connect output handles to input handles to route data",
    description:
      "Drag a line from the circular handle on the right side (Output) to the handle on the left side (Input) of the target node.",
    icon: Workflow,
    visual: (
      <div className="w-full h-full flex flex-col justify-center items-center gap-2.5 p-3">
        <div className="flex items-center justify-center gap-2.5 w-full">
          <div className="px-3 py-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-2xs relative">
            <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">Trigger</span>
            <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#FFE500] border-2 border-white dark:border-neutral-900" />
          </div>
          <div className="flex items-center gap-0.5">
            <div className="w-8 h-[2px] bg-[#FFE500]" />
            <ArrowRight className="w-3.5 h-3.5 text-[#FFE500] -ml-1" />
          </div>
          <div className="px-3 py-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-2xs relative">
            <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-neutral-900" />
            <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">AI / Action</span>
          </div>
        </div>
        <p className="text-[11px] text-neutral-400 dark:text-neutral-500 text-center">
          Click an edge and press Delete to remove a connection
        </p>
      </div>
    ),
    highlights: [
      "Data flows automatically from left to right",
      "Shortcuts: Undo (Ctrl + Z) and Redo (Ctrl + Y)",
      "Move nodes freely without disconnecting attached edges"
    ]
  },
  {
    step: 4,
    tag: "Live Execution",
    title: "Run & Monitor Execution",
    subtitle: "Test workflows and inspect live database updates",
    description:
      "Click the yellow Run button in the header. The execution drawer will process live data into the Launcher OS database.",
    icon: Play,
    visual: (
      <div className="w-full h-full flex flex-col justify-center p-2.5">
        <div className="p-2 rounded-lg bg-white dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800/80 font-mono text-[10.5px] space-y-1.5 text-neutral-700 dark:text-neutral-300 shadow-2xs">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <Check className="w-3 h-3 shrink-0" />
            <span className="truncate">[1] Trigger input received</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <Check className="w-3 h-3 shrink-0" />
            <span className="truncate">[2] AI summary processed</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <Check className="w-3 h-3 shrink-0" />
            <span className="truncate">[3] Document saved to DB</span>
          </div>
        </div>
      </div>
    ),
    highlights: [
      "Automation results are persisted directly to the Launcher OS database",
      "Exportable to cURL, JavaScript SDK, and Python",
      "Ready-to-use templates available via the Templates button"
    ]
  }
];

export function AutomationTutorialModal({
  isOpen,
  onClose,
  onLoadStarterTemplate,
}: AutomationTutorialModalProps) {
  const [mounted, setMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const current = TUTORIAL_STEPS[currentStep];
  const isLast = currentStep === TUTORIAL_STEPS.length - 1;

  const handleNext = () => {
    if (!isLast) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="tutorial-modal-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
          className="fixed inset-0 z-[99999999] flex items-center justify-center p-4 select-none font-sans"
        >
          {/* Frosted Glass Backdrop Overlay */}
          <motion.div
            key="tutorial-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            onClick={onClose}
            className="fixed inset-0 bg-black/25 dark:bg-black/50 backdrop-blur-[3px] transition-all duration-300"
          />

          {/* Modal Container */}
          <motion.div
            key="tutorial-modal-card"
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
            className="relative w-full max-w-[750px] h-[415px] bg-white dark:bg-[#121212] border border-neutral-200/80 dark:border-neutral-800/90 rounded-xl shadow-[0_15px_40px_-15px_rgba(0,0,0,0.12)] dark:shadow-[0_15px_40px_-15px_rgba(0,0,0,0.5)] p-5 sm:p-6 z-10 flex flex-col justify-between overflow-hidden"
          >
            {/* Top Bar: Tag, Step Counter, and Close */}
            <div className="space-y-2.5 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                    {current.tag}
                  </span>
                  <span className="text-xs text-neutral-400 dark:text-neutral-500">
                    Step {currentStep + 1} of {TUTORIAL_STEPS.length}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-6 h-6 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Step Progress Line */}
              <div className="flex items-center gap-1.5">
                {TUTORIAL_STEPS.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentStep(idx)}
                    className={`h-1 flex-1 rounded-sm transition-all duration-200 cursor-pointer ${
                      idx === currentStep
                        ? "bg-[#FFE500]"
                        : idx < currentStep
                        ? "bg-neutral-400 dark:bg-neutral-600"
                        : "bg-neutral-200 dark:bg-neutral-800"
                    }`}
                    title={`Jump to step ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Middle Section: Landscape 2-Column Balanced Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center flex-1 my-1 overflow-hidden">
              {/* Left Column: Title, Subtitle, Description & Bullet points */}
              <div className="md:col-span-7 flex flex-col justify-center space-y-2 h-full">
                <div>
                  <h2 className="text-[17px] font-semibold text-neutral-900 dark:text-white tracking-tight leading-snug">
                    {current.title}
                  </h2>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    {current.subtitle}
                  </p>
                </div>

                <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  {current.description}
                </p>

                {/* Highlights */}
                <div className="space-y-1 pt-0.5">
                  {current.highlights.map((point, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                      <span className="text-[#FFE500] font-bold text-[12px] leading-none mt-0.5">•</span>
                      <span className="leading-tight text-[11.5px]">{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Visual Box */}
              <div className="md:col-span-5 h-[155px] w-full rounded-lg bg-neutral-50/80 dark:bg-neutral-900/50 border border-neutral-200/60 dark:border-neutral-800/60 overflow-hidden flex items-center justify-center p-1">
                {current.visual}
              </div>
            </div>

            {/* Bottom Bar: Action Buttons */}
            <div className="pt-2.5 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between gap-3 shrink-0">
              {currentStep === 0 && onLoadStarterTemplate ? (
                <button
                  type="button"
                  onClick={() => {
                    onLoadStarterTemplate();
                    onClose();
                  }}
                  className="text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  Try Starter Template
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                {currentStep > 0 && (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="px-3 py-1.5 rounded-[6px] border border-neutral-200/80 dark:border-neutral-800 bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-medium text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>Back</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleNext}
                  className="px-3.5 py-1.5 rounded-[6px] bg-[#FFE500] hover:bg-[#FFE500]/90 text-neutral-950 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs hover:shadow-xs active:scale-98"
                >
                  <span>{isLast ? "Get Started" : "Next"}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
