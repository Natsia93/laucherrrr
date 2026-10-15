"use client";

import React, { useState } from "react";
import { X, Copy, Check, Terminal, Code2, FileCode } from "lucide-react";
import { AutomationNode, AutomationEdge } from "./types";

interface ApiCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  flowName: string;
  flowId: string;
  nodes: AutomationNode[];
  edges: AutomationEdge[];
}

export function ApiCodeModal({
  isOpen,
  onClose,
  flowName,
  flowId,
  nodes,
  edges,
}: ApiCodeModalProps) {
  const [activeTab, setActiveTab] = useState<"curl" | "js" | "python" | "json">("curl");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  const endpointUrl = `${origin}/api/automation/run`;

  const curlCode = `curl -X POST ${endpointUrl} \\
  -H "Content-Type: application/json" \\
  -d '{
    "workflowId": "${flowId}",
    "inputPrompt": "Enter your research topic or instruction here..."
  }'`;

  const jsCode = `// Launcher OS Automation Execution (JavaScript / TypeScript)
async function executeWorkflow(inputPrompt) {
  const response = await fetch("${endpointUrl}", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      workflowId: "${flowId}",
      inputPrompt: inputPrompt,
    }),
  });

  if (!response.ok) {
    throw new Error(\`Execution failed with status \${response.status}\`);
  }

  const result = await response.json();
  console.log("Status:", result.success);
  console.log("Output:", result.finalOutput);
  return result;
}

// Example invocation:
executeWorkflow("AI Automation Strategy 2026");`;

  const pythonCode = `# Launcher OS Automation Execution (Python)
import requests

url = "${endpointUrl}"
payload = {
    "workflowId": "${flowId}",
    "inputPrompt": "AI Automation Strategy 2026"
}
headers = {
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)
data = response.json()

if response.status_code == 200 and data.get("success"):
    print("Flow completed successfully!")
    print("Output:", data.get("finalOutput"))
else:
    print("Error:", data.get("error"))`;

  const jsonPayload = JSON.stringify(
    {
      name: flowName,
      flowId,
      exportedAt: new Date().toISOString(),
      nodesCount: nodes.length,
      edgesCount: edges.length,
      nodes,
      edges,
    },
    null,
    2
  );

  const getCurrentSnippet = () => {
    switch (activeTab) {
      case "curl":
        return curlCode;
      case "js":
        return jsCode;
      case "python":
        return pythonCode;
      case "json":
        return jsonPayload;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCurrentSnippet());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 font-sans">
      <div className="w-full max-w-2xl rounded-[10px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121212] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/30">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-[6px] bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-950 flex items-center justify-center">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-950 dark:text-neutral-50">
                API & Code Generator
              </h2>
              <p className="text-[11px] text-neutral-500">
                Invoke &quot;{flowName}&quot; programmatically from external apps
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

        {/* Tab Switcher */}
        <div className="px-5 pt-3 pb-2 border-b border-neutral-150 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {[
              { id: "curl", label: "cURL", icon: Terminal },
              { id: "js", label: "JavaScript / TypeScript", icon: Code2 },
              { id: "python", label: "Python", icon: FileCode },
              { id: "json", label: "Raw Schema (JSON)", icon: Code2 },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-2.5 py-1 rounded-[5px] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-950"
                      : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="px-2.5 py-1 rounded-[5px] border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 text-neutral-700 dark:text-neutral-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Code"}</span>
          </button>
        </div>

        {/* Code View Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-neutral-950 font-mono text-[11.5px] leading-relaxed text-neutral-200 select-text">
          <pre className="whitespace-pre overflow-x-auto p-1">
            <code>{getCurrentSnippet()}</code>
          </pre>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/40 flex items-center justify-between text-xs text-neutral-500">
          <span>Endpoint: <code className="font-mono text-[11px] text-neutral-800 dark:text-neutral-200">POST /api/automation/run</code></span>
          <span className="text-[11px]">Zero setup • Ready to integrate</span>
        </div>
      </div>
    </div>
  );
}
