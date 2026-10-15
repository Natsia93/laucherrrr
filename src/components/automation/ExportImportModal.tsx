"use client";

import React, { useState, useRef } from "react";
import { X, Download, Upload, Copy, Check, FileJson, AlertCircle } from "lucide-react";
import { AutomationNode, AutomationEdge } from "./types";

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "export" | "import";
  flowName: string;
  nodes: AutomationNode[];
  edges: AutomationEdge[];
  onImportFlow: (imported: { name: string; nodes: AutomationNode[]; edges: AutomationEdge[] }) => void;
}

export function ExportImportModal({
  isOpen,
  onClose,
  mode: initialMode,
  flowName,
  nodes,
  edges,
  onImportFlow,
}: ExportImportModalProps) {
  const [mode, setMode] = useState<"export" | "import">(initialMode);
  const [importJsonText, setImportJsonText] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setMode(initialMode);
    setImportError(null);
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const exportData = {
    schemaVersion: "1.0",
    generator: "Launcher OS Automation Studio",
    name: flowName,
    exportedAt: new Date().toISOString(),
    nodes,
    edges,
  };

  const jsonString = JSON.stringify(exportData, null, 2);

  const handleDownloadFile = () => {
    const filename = `${flowName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-workflow.json`;
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyClipboard = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleProcessImport = (rawText: string) => {
    try {
      setImportError(null);
      const parsed = JSON.parse(rawText);

      if (!parsed.nodes || !Array.isArray(parsed.nodes)) {
        throw new Error("Invalid schema: 'nodes' array is missing");
      }

      onImportFlow({
        name: parsed.name || "Imported Workflow",
        nodes: parsed.nodes,
        edges: parsed.edges || [],
      });
      onClose();
    } catch (err: any) {
      setImportError(err?.message || "Failed to parse workflow JSON format");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportJsonText(content);
      handleProcessImport(content);
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 font-sans">
      <div className="w-full max-w-xl rounded-[10px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121212] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/30">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-[6px] bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-950 flex items-center justify-center">
              <FileJson className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-950 dark:text-neutral-50">
                {mode === "export" ? "Export Workflow (JSON)" : "Import Workflow (JSON)"}
              </h2>
              <p className="text-[11px] text-neutral-500">
                Share or restore portable flow configurations
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-[6px] text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="px-5 pt-3 pb-2 border-b border-neutral-150 dark:border-neutral-800 flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setMode("export")}
            className={`px-3 py-1 rounded-[5px] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              mode === "export"
                ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-950"
                : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
          <button
            type="button"
            onClick={() => setMode("import")}
            className={`px-3 py-1 rounded-[5px] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              mode === "import"
                ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-950"
                : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {mode === "export" ? (
            <div className="space-y-3">
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                You can download the full workflow schema as a <code className="font-mono text-[11px] text-neutral-900 dark:text-neutral-100">.json</code> file or copy it to clipboard.
              </p>

              <div className="p-3 rounded-[8px] bg-neutral-950 text-neutral-300 font-mono text-[11px] max-h-56 overflow-y-auto whitespace-pre select-text">
                {jsonString}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleDownloadFile}
                  className="flex-1 h-9 rounded-[6px] bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-950 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .JSON File</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyClipboard}
                  className="h-9 px-4 rounded-[6px] border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 text-neutral-800 dark:text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Upload Drop Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-6 rounded-[8px] border-2 border-dashed border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 bg-neutral-50/50 dark:bg-[#141414] text-center cursor-pointer transition-colors space-y-1.5"
              >
                <Upload className="w-6 h-6 mx-auto text-neutral-400" />
                <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                  Click to choose a .json workflow file
                </p>
                <p className="text-[11px] text-neutral-400">
                  Supports exported Launcher OS or Langflow JSON schemas
                </p>
              </div>

              <div className="space-y-1 pt-1">
                <label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
                  Or paste raw JSON directly:
                </label>
                <textarea
                  rows={4}
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  placeholder="Paste JSON schema here..."
                  className="w-full p-2.5 text-xs font-mono rounded-[6px] border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#161616] focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 resize-none"
                />
              </div>

              {importError && (
                <div className="p-2.5 rounded-[6px] bg-red-500/10 border border-red-500/20 text-xs text-red-500 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              <button
                type="button"
                onClick={() => handleProcessImport(importJsonText)}
                disabled={!importJsonText.trim()}
                className="w-full h-9 rounded-[6px] bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-950 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Load Workflow to Canvas</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
