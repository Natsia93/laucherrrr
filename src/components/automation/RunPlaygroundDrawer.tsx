"use client";

import React, { useState } from "react";
import { 
  Play, X, Loader2, CheckCircle2, AlertCircle, Clock, 
  Terminal, FileText, CheckSquare, Calendar, Copy, Check, 
  Sparkles, ExternalLink, ArrowRight, CornerDownRight 
} from "lucide-react";
import { AutomationNode, AutomationEdge, ExecutionResult, ExecutionLog } from "./types";
import Link from "next/link";

interface RunPlaygroundDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: AutomationNode[];
  edges: AutomationEdge[];
  onExecuteStart: () => void;
  onExecuteEnd: (result: ExecutionResult) => void;
  updateNodeStatus: (nodeId: string, status: "idle" | "running" | "success" | "error", message?: string, output?: any) => void;
}

export function RunPlaygroundDrawer({
  isOpen,
  onClose,
  nodes,
  edges,
  onExecuteStart,
  onExecuteEnd,
  updateNodeStatus,
}: RunPlaygroundDrawerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>([]);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [inputPrompt, setInputPrompt] = useState<string>("");
  const [copied, setCopied] = useState(false);

  // Find initial trigger node
  const triggerNode = nodes.find((n) => n.data.category === "trigger");

  React.useEffect(() => {
    if (triggerNode && !inputPrompt) {
      setInputPrompt(triggerNode.data.config?.defaultText || "");
    }
  }, [triggerNode]);

  if (!isOpen) return null;

  const handleRunExecution = async () => {
    setIsRunning(true);
    setExecutionLogs([]);
    setExecutionResult(null);
    onExecuteStart();

    const startTime = Date.now();
    const logs: ExecutionLog[] = [];

    const addLog = (nodeId: string, nodeName: string, status: "running" | "success" | "error", message: string, output?: any) => {
      const logEntry: ExecutionLog = {
        id: `log-${Date.now()}-${Math.random()}`,
        nodeId,
        nodeName,
        status,
        message,
        timestamp: new Date().toLocaleTimeString(),
        output,
      };
      logs.push(logEntry);
      setExecutionLogs([...logs]);
      updateNodeStatus(nodeId, status, message, output);
    };

    try {
      let globalVariables: any[] = [];
      try {
        const storedVars = localStorage.getItem("launcher_automation_global_vars");
        if (storedVars) globalVariables = JSON.parse(storedVars);
      } catch {}

      const response = await fetch("/api/automation/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nodes,
          edges,
          inputPrompt,
          globalVariables,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || "Failed to execute flow");
      }

      const result = await response.json();
      const durationMs = Date.now() - startTime;

      for (const log of result.logs || []) {
        addLog(log.nodeId, log.nodeName, log.status, log.message, log.output);
        await new Promise((r) => setTimeout(r, 350));
      }

      const finalRes: ExecutionResult = {
        runId: result.runId || `run-${Date.now()}`,
        status: "success",
        durationMs,
        logs: logs,
        finalOutput: result.finalOutput,
        createdEntities: result.createdEntities,
      };

      setExecutionResult(finalRes);
      onExecuteEnd(finalRes);
    } catch (err: any) {
      const durationMs = Date.now() - startTime;
      const errorLog: ExecutionLog = {
        id: `log-err-${Date.now()}`,
        nodeId: "flow",
        nodeName: "Pipeline Error",
        status: "error",
        message: err?.message || "Execution encountered an error",
        timestamp: new Date().toLocaleTimeString(),
      };
      setExecutionLogs((prev) => [...prev, errorLog]);

      const finalRes: ExecutionResult = {
        runId: `run-${Date.now()}`,
        status: "error",
        durationMs,
        logs: [...logs, errorLog],
      };
      setExecutionResult(finalRes);
      onExecuteEnd(finalRes);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopyOutput = () => {
    if (!executionResult?.finalOutput) return;
    const text = typeof executionResult.finalOutput === "string" 
      ? executionResult.finalOutput 
      : JSON.stringify(executionResult.finalOutput, null, 2);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[500px] bg-white/95 dark:bg-[#0e0e0e]/95 backdrop-blur-2xl border-l border-neutral-200/90 dark:border-neutral-800/90 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 font-sans">
      {/* Header */}
      <div className="p-4 sm:px-6 border-b border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 flex items-center justify-center font-bold shadow-sm">
            <Play className="w-3.5 h-3.5 fill-current" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-neutral-950 dark:text-neutral-50">
              Pipeline Execution Engine
            </h2>
            <p className="text-[11px] text-neutral-400">
              Real-time trace, state evaluation & metrics
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-7 h-7 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {/* Input Parameters Box */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-neutral-600 dark:text-neutral-300 uppercase tracking-wider flex items-center justify-between">
            <span>Input Context / Test Prompt</span>
            <span className="text-[10px] font-medium text-neutral-400 normal-case">
              (Initial Trigger Node)
            </span>
          </label>
          <textarea
            rows={3}
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Enter test input context or prompt for this pipeline..."
            className="w-full p-3 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/80 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 resize-none font-sans leading-relaxed"
          />
        </div>

        {/* Primary Run Button */}
        <button
          type="button"
          onClick={handleRunExecution}
          disabled={isRunning}
          className="w-full h-11 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-100 active:scale-98 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-60"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-neutral-950" />
              <span>Executing Pipeline Steps...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-neutral-950" />
              <span>Execute Pipeline Flow</span>
            </>
          )}
        </button>

        {/* Live Step Trace Logs */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-neutral-400" />
              Execution Steps & Logs
            </span>
            {executionResult && (
              <span className="text-[10.5px] font-mono font-semibold px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                {executionResult.durationMs}ms
              </span>
            )}
          </div>

          <div className="p-3.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-950 text-neutral-200 font-mono text-[11px] min-h-[140px] max-h-[220px] overflow-y-auto space-y-2 shadow-inner leading-relaxed">
            {executionLogs.length === 0 && !isRunning && (
              <div className="text-neutral-500 text-center py-6">
                Click &quot;Execute Pipeline Flow&quot; to inspect real-time steps.
              </div>
            )}

            {executionLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-2 animate-in fade-in duration-150">
                <span className="text-neutral-500 text-[10px] shrink-0 mt-0.5">
                  [{log.timestamp}]
                </span>
                <div className="flex-1">
                  <span className="text-[#FFE500] font-bold">
                    {log.nodeName}:
                  </span>{" "}
                  <span className={log.status === "error" ? "text-red-400" : "text-neutral-300"}>
                    {log.message}
                  </span>
                </div>
              </div>
            ))}

            {isRunning && (
              <div className="flex items-center gap-2 text-yellow-400 animate-pulse text-xs pt-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Running next node in graph...</span>
              </div>
            )}
          </div>
        </div>

        {/* Generated Entities / Result */}
        {executionResult && (
          <div className="space-y-3.5 pt-2 animate-in fade-in zoom-in-95 duration-200">
            {/* Created Launcher Entities */}
            {executionResult.createdEntities && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                  Created Workspace Items:
                </span>
                <div className="space-y-2">
                  {executionResult.createdEntities.documentId && (
                    <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5 text-emerald-900 dark:text-emerald-200">
                        <FileText className="w-4 h-4 text-emerald-500" />
                        <span className="font-semibold truncate max-w-[240px]">
                          {executionResult.createdEntities.documentTitle || "New Document"}
                        </span>
                      </div>
                      <Link
                        href={`/workspace?id=${executionResult.createdEntities.documentId}`}
                        className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        Open <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  )}

                  {executionResult.createdEntities.todoTask && (
                    <div className="p-3 rounded-xl border border-blue-500/30 bg-blue-500/10 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5 text-blue-900 dark:text-blue-200">
                        <CheckSquare className="w-4 h-4 text-blue-500" />
                        <span className="font-semibold truncate max-w-[240px]">
                          {executionResult.createdEntities.todoTask}
                        </span>
                      </div>
                      <Link
                        href="/overview"
                        className="text-[11px] font-bold text-blue-700 dark:text-blue-400 hover:underline flex items-center gap-1"
                      >
                        To-Do <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  )}

                  {executionResult.createdEntities.calendarTitle && (
                    <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5 text-amber-900 dark:text-amber-200">
                        <Calendar className="w-4 h-4 text-amber-500" />
                        <span className="font-semibold truncate max-w-[240px]">
                          {executionResult.createdEntities.calendarTitle}
                        </span>
                      </div>
                      <Link
                        href="/integrations/calendar"
                        className="text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
                      >
                        Calendar <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  )}

                  {executionResult.createdEntities.slackSent && (
                    <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5 text-emerald-900 dark:text-emerald-200">
                        <span className="text-sm">💬</span>
                        <span className="font-semibold">
                          Slack Channel Notification Prepared / Dispatched
                        </span>
                      </div>
                      <span className="text-[10.5px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        DELIVERED
                      </span>
                    </div>
                  )}

                  {executionResult.createdEntities.searchResultsCount !== undefined && (
                    <div className="p-3 rounded-xl border border-sky-500/30 bg-sky-500/10 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5 text-sky-900 dark:text-sky-200">
                        <span className="text-sm">🌐</span>
                        <span className="font-semibold">
                          Live Web Search Grounding: {executionResult.createdEntities.searchResultsCount} Verified Sources
                        </span>
                      </div>
                      <span className="text-[10.5px] font-mono font-bold text-sky-600 dark:text-sky-400">
                        GROUNDED
                      </span>
                    </div>
                  )}

                  {executionResult.createdEntities.httpSent && (
                    <div className="p-3 rounded-xl border border-purple-500/30 bg-purple-500/10 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5 text-purple-900 dark:text-purple-200">
                        <span className="text-sm">⚡</span>
                        <span className="font-semibold">
                          Custom REST / Webhook Payload Sent
                        </span>
                      </div>
                      <span className="text-[10.5px] font-mono font-bold text-purple-600 dark:text-purple-400">
                        POST 200
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Raw Final Output Result */}
            {executionResult.finalOutput && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                    Final Output Content:
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyOutput}
                    className="text-[11px] text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 flex items-center gap-1 cursor-pointer font-medium"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/90 dark:bg-neutral-900/90 text-xs text-neutral-800 dark:text-neutral-200 max-h-48 overflow-y-auto whitespace-pre-wrap font-sans leading-relaxed">
                  {typeof executionResult.finalOutput === "string"
                    ? executionResult.finalOutput
                    : JSON.stringify(executionResult.finalOutput, null, 2)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
