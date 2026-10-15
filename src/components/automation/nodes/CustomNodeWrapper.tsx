"use client";

import React, { useState } from "react";
import { useReactFlow } from "@xyflow/react";
import { Trash2, Copy, ChevronDown, ChevronUp, Loader2, CheckCircle2, AlertCircle, Eye, Check } from "lucide-react";
import { CustomNodeData } from "../types";

interface CustomNodeWrapperProps {
  id: string;
  selected?: boolean;
  data: CustomNodeData;
  children: React.ReactNode;
  categoryName?: string;
}

export function CustomNodeWrapper({
  id,
  selected,
  data,
  children,
  categoryName,
}: CustomNodeWrapperProps) {
  const { deleteElements, getNode, addNodes } = useReactFlow();
  const [collapsed, setCollapsed] = useState(false);
  const [showInspector, setShowInspector] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteElements({ nodes: [{ id }] });
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentNode = getNode(id);
    if (!currentNode) return;

    const newNode = {
      ...currentNode,
      id: `node-${Date.now()}`,
      position: {
        x: currentNode.position.x + 30,
        y: currentNode.position.y + 30,
      },
      selected: true,
    };
    addNodes(newNode);
  };

  const hasOutput = data.status === "success" || data.lastOutput;

  return (
    <div
      className={`w-[296px] rounded-[10px] border transition-colors duration-100 font-sans ${
        selected
          ? "border-neutral-500 dark:border-white/60 ring-1 ring-neutral-400/50 dark:ring-white/25 shadow-lg dark:shadow-[0_12px_36px_rgba(0,0,0,0.6)]"
          : "border-neutral-300/90 dark:border-white/[0.12] hover:border-neutral-400 dark:hover:border-white/[0.22] shadow-sm dark:shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
      } bg-white dark:bg-[#1a1a1a] text-neutral-900 dark:text-neutral-100`}
    >
      {/* Sleek Grey Glassmorphism Header */}
      <div className="px-3.5 py-2.5 bg-neutral-100/70 dark:bg-white/[0.04] border-b border-neutral-200/80 dark:border-white/[0.08] rounded-t-[9px] flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[12.5px] font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                {data.label}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[9.5px] font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                {categoryName || data.category}
              </span>

              {/* Status */}
              {data.status && data.status !== "idle" && (
                <div className="flex items-center gap-1">
                  <span className="text-neutral-300 dark:text-neutral-600">•</span>
                  {data.status === "running" && (
                    <span className="flex items-center gap-1 text-[10px] text-amber-500 font-medium">
                      <Loader2 className="w-2.5 h-2.5 animate-spin" /> Running
                    </span>
                  )}
                  {data.status === "success" && (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-500 font-medium">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Done
                    </span>
                  )}
                  {data.status === "error" && (
                    <span className="flex items-center gap-1 text-[10px] text-red-500 font-medium">
                      <AlertCircle className="w-2.5 h-2.5" /> Error
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-0.5 text-neutral-400">
          {hasOutput && (
            <button
              type="button"
              onClick={() => setShowInspector(!showInspector)}
              title={showInspector ? "Hide Inspector" : "Inspect Node Output"}
              className={`p-1 rounded-[5px] transition-colors ${
                showInspector
                  ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold"
                  : "hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-200/50 dark:hover:bg-white/[0.08]"
              }`}
            >
              <Eye className="w-3 h-3" />
            </button>
          )}
          <button
            type="button"
            onClick={handleDuplicate}
            title="Duplicate"
            className="p-1 rounded-[5px] hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-200/50 dark:hover:bg-white/[0.08] transition-colors"
          >
            <Copy className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            title="Delete"
            className="p-1 rounded-[5px] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-[5px] hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-200/50 dark:hover:bg-white/[0.08] transition-colors"
          >
            {collapsed ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* In-Node Output Inspector (Langflow-style) */}
      {showInspector && (
        <div className="p-3 bg-neutral-950 text-neutral-200 border-b border-neutral-800 text-xs font-mono space-y-1.5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between text-[10px] text-neutral-400">
            <span>OUTPUT TRACE</span>
            <button
              type="button"
              onClick={() => {
                const text = typeof data.lastOutput === "object" ? JSON.stringify(data.lastOutput, null, 2) : String(data.lastOutput || "Executed");
                navigator.clipboard.writeText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className="hover:text-white flex items-center gap-1 cursor-pointer"
            >
              {copied ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
          <div className="p-2 rounded bg-[#121212] max-h-36 overflow-y-auto text-[10.5px] whitespace-pre-wrap leading-relaxed">
            {typeof data.lastOutput === "object"
              ? JSON.stringify(data.lastOutput, null, 2)
              : String(data.lastOutput || data.statusMessage || "Node executed successfully with zero runtime errors.")}
          </div>
        </div>
      )}

      {/* Node Content Body */}
      {!collapsed && (
        <div className="p-3.5 space-y-3">
          {data.description && (
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-snug">
              {data.description}
            </p>
          )}
          {children}
        </div>
      )}
    </div>
  );
}
