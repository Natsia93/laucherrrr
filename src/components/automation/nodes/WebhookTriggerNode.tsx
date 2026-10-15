"use client";

import React, { useState } from "react";
import { NodeProps, Handle, Position, useReactFlow } from "@xyflow/react";
import { CustomNodeWrapper } from "./CustomNodeWrapper";
import { CustomNodeData } from "../types";
import { Copy, Check, RefreshCw } from "lucide-react";

export const WebhookTriggerNode = React.memo(function WebhookTriggerNode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as CustomNodeData;
  const { setNodes } = useReactFlow();
  const [copied, setCopied] = useState(false);

  const updateConfig = (key: string, value: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              config: { ...nodeData.config, [key]: value },
            },
          };
        }
        return node;
      })
    );
  };

  const webhookId = nodeData.config?.webhookId || id;
  const webhookUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/automation/webhook/${webhookId}`
      : `/api/automation/webhook/${webhookId}`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const regenerateId = () => {
    const newId = `wh-${Date.now().toString(36)}`;
    updateConfig("webhookId", newId);
  };

  return (
    <CustomNodeWrapper
      id={id}
      selected={selected}
      data={nodeData}
      categoryName="Webhook"
    >
      <div className="space-y-2.5">
        {/* Webhook URL Preview */}
        <div className="space-y-1">
          <label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
            Webhook Endpoint
          </label>
          <div className="flex items-center gap-1">
            <div className="flex-1 h-7 px-2 text-[10px] font-mono rounded-[5px] border border-neutral-300/80 dark:border-white/[0.1] bg-neutral-100/60 dark:bg-[#1a1a1a]/90 text-neutral-600 dark:text-neutral-400 flex items-center overflow-hidden">
              <span className="truncate">{webhookUrl}</span>
            </div>
            <button
              type="button"
              onClick={handleCopyUrl}
              title="Copy URL"
              className="h-7 px-2 rounded-[5px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141414] hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors flex items-center"
            >
              {copied ? (
                <Check className="w-3 h-3 text-emerald-500" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
            <button
              type="button"
              onClick={regenerateId}
              title="Regenerate Webhook ID"
              className="h-7 px-2 rounded-[5px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141414] hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors flex items-center"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* HTTP Method */}
        <div className="space-y-1">
          <label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
            Accepted Method
          </label>
          <select
            value={nodeData.config?.method || "POST"}
            onChange={(e) => updateConfig("method", e.target.value)}
            className="w-full h-7 px-2 text-xs font-medium rounded-[5px] border border-neutral-300/80 dark:border-white/[0.1] bg-white/80 dark:bg-[#141414]/90 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
          >
            <option value="POST">POST</option>
            <option value="GET">GET</option>
            <option value="PUT">PUT</option>
            <option value="ANY">ANY Method</option>
          </select>
        </div>

        {/* Auth Token (optional) */}
        <div className="space-y-1">
          <label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
            Auth Token (optional)
          </label>
          <input
            type="password"
            placeholder="Bearer token for request validation..."
            value={nodeData.config?.authToken || ""}
            onChange={(e) => updateConfig("authToken", e.target.value)}
            className="w-full h-7 px-2 text-[10.5px] font-mono rounded-[5px] border border-neutral-300/80 dark:border-white/[0.1] bg-white/80 dark:bg-[#141414]/90 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 placeholder:text-neutral-300 dark:placeholder:text-neutral-600"
          />
        </div>

        {/* Handles */}
        <div className="pt-2 border-t border-neutral-200/60 dark:border-white/[0.08] flex flex-col gap-1.5">
          <div className="relative flex items-center justify-end text-[11px] text-neutral-600 dark:text-neutral-400 pr-1">
            <span className="font-medium text-neutral-800 dark:text-neutral-200">
              Request Body
            </span>
            <Handle
              type="source"
              position={Position.Right}
              id="body_out"
              className="w-2.5 h-2.5 bg-neutral-400 dark:bg-neutral-500 border border-white dark:border-neutral-900 rounded-full hover:bg-neutral-800 dark:hover:bg-white hover:scale-125 transition-all shadow-2xs"
              style={{ right: -19 }}
            />
          </div>
          <div className="relative flex items-center justify-end text-[11px] text-neutral-600 dark:text-neutral-400 pr-1">
            <span className="font-medium text-neutral-800 dark:text-neutral-200">
              Headers
            </span>
            <Handle
              type="source"
              position={Position.Right}
              id="headers_out"
              className="w-2.5 h-2.5 bg-neutral-400 dark:bg-neutral-500 border border-white dark:border-neutral-900 rounded-full hover:bg-neutral-800 dark:hover:bg-white hover:scale-125 transition-all shadow-2xs"
              style={{ right: -19 }}
            />
          </div>
        </div>
      </div>
    </CustomNodeWrapper>
  );
});
