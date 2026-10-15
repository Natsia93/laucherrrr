"use client";

import React from "react";
import { NodeProps, Handle, Position, useReactFlow } from "@xyflow/react";
import { CustomNodeWrapper } from "./CustomNodeWrapper";
import { CustomNodeData } from "../types";
import { LauncherSelect } from "../LauncherSelect";

export const IntegrationNode = React.memo(function IntegrationNode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as CustomNodeData;
  const { setNodes } = useReactFlow();

  const updateConfig = (key: string, value: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              config: {
                ...nodeData.config,
                [key]: value,
              },
            },
          };
        }
        return node;
      })
    );
  };

  const isSlack = nodeData.nodeType === "slack_webhook";
  const isTelegram = nodeData.nodeType === "telegram_bot";
  const isSearch = nodeData.nodeType === "web_search";
  const isHttp = nodeData.nodeType === "http_request";
  const isEmail = nodeData.nodeType === "send_email";

  const snippetOptions = [
    { value: "3", label: "3 Results" },
    { value: "5", label: "5 Results" },
    { value: "8", label: "8 Results" },
  ];

  const methodOptions = [
    { value: "POST", label: "POST" },
    { value: "GET", label: "GET" },
    { value: "PUT", label: "PUT" },
  ];

  const parseModeOptions = [
    { value: "Markdown", label: "Markdown" },
    { value: "HTML", label: "HTML" },
    { value: "None", label: "Plain Text" },
  ];

  return (
    <CustomNodeWrapper
      id={id}
      selected={selected}
      data={nodeData}
      categoryName="Integration"
    >
      <div className="space-y-2.5">
        {/* Telegram Bot Config */}
        {isTelegram && (
          <div className="space-y-2">
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
                Chat ID / Channel ID
              </label>
              <input
                type="text"
                value={nodeData.config?.chatId || ""}
                placeholder="@my_channel or -100123456789"
                onChange={(e) => updateConfig("chatId", e.target.value)}
                className="w-full h-8 px-2.5 text-xs rounded-[6px] border border-neutral-300/80 dark:border-white/[0.1] bg-white/80 dark:bg-[#141414]/90 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 font-mono text-[11px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-0.5">
                <span className="text-[9.5px] font-medium text-neutral-500 uppercase tracking-wider">Format</span>
                <LauncherSelect
                  value={nodeData.config?.parseMode || "Markdown"}
                  onChange={(val) => updateConfig("parseMode", val)}
                  options={parseModeOptions}
                />
              </div>
              <div className="space-y-0.5">
                <span className="text-[9.5px] font-medium text-neutral-500 uppercase tracking-wider">Mode</span>
                <label className="flex items-center gap-1.5 h-7 px-2 text-xs rounded-[5px] border border-neutral-300/80 dark:border-white/[0.1] bg-white/80 dark:bg-[#141414]/90 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={!!nodeData.config?.silent}
                    onChange={(e) => updateConfig("silent", e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-neutral-300"
                  />
                  <span className="text-[10.5px] text-neutral-600 dark:text-neutral-400">Silent</span>
                </label>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
                Bot Token (Optional if set in Env)
              </label>
              <input
                type="password"
                value={nodeData.config?.botToken || ""}
                placeholder="123456789:ABCdefGhIJKlmNoPQ..."
                onChange={(e) => updateConfig("botToken", e.target.value)}
                className="w-full h-7 px-2 text-[10.5px] font-mono rounded-[5px] border border-neutral-300/80 dark:border-white/[0.1] bg-white/80 dark:bg-[#141414]/90"
              />
            </div>
          </div>
        )}

        {/* Slack Webhook Config */}
        {isSlack && (
          <div className="space-y-2">
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
                Slack Webhook URL
              </label>
              <input
                type="text"
                value={nodeData.config?.webhookUrl || ""}
                placeholder="https://hooks.slack.com/services/..."
                onChange={(e) => updateConfig("webhookUrl", e.target.value)}
                className="w-full h-8 px-2.5 text-xs rounded-[6px] border border-neutral-300/80 dark:border-white/[0.1] bg-white/80 dark:bg-[#141414]/90 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 font-mono text-[11px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-0.5">
                <span className="text-[9.5px] font-medium text-neutral-500 uppercase tracking-wider">Channel</span>
                <input
                  type="text"
                  value={nodeData.config?.channel || "#general"}
                  onChange={(e) => updateConfig("channel", e.target.value)}
                  className="w-full h-7 px-2 text-xs rounded-[5px] border border-neutral-300/80 dark:border-white/[0.1] bg-white/80 dark:bg-[#141414]/90"
                />
              </div>
              <div className="space-y-0.5">
                <span className="text-[9.5px] font-medium text-neutral-500 uppercase tracking-wider">Bot Name</span>
                <input
                  type="text"
                  value={nodeData.config?.botName || "Launcher OS Bot"}
                  onChange={(e) => updateConfig("botName", e.target.value)}
                  className="w-full h-7 px-2 text-xs rounded-[5px] border border-neutral-300/80 dark:border-white/[0.1] bg-white/80 dark:bg-[#141414]/90"
                />
              </div>
            </div>
          </div>
        )}

        {/* Live Web Search Config */}
        {isSearch && (
          <div className="space-y-2">
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
                Live Search Query
              </label>
              <input
                type="text"
                value={nodeData.config?.query || ""}
                placeholder="Search keywords (e.g. Global Tech Trends 2026)"
                onChange={(e) => updateConfig("query", e.target.value)}
                className="w-full h-8 px-2.5 text-xs rounded-[6px] border border-neutral-300/80 dark:border-white/[0.1] bg-white/80 dark:bg-[#141414]/90 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span className="text-[10px] uppercase tracking-wider">Max Snippets</span>
              <div className="w-32">
                <LauncherSelect
                  value={String(nodeData.config?.maxResults || 4)}
                  onChange={(val) => updateConfig("maxResults", parseInt(val))}
                  options={snippetOptions}
                />
              </div>
            </div>
          </div>
        )}

        {/* Generic HTTP Request / Webhook Config */}
        {isHttp && (
          <div className="space-y-2">
            <div className="grid grid-cols-4 gap-1.5">
              <div className="col-span-1 space-y-0.5">
                <span className="text-[9.5px] font-medium text-neutral-500 uppercase tracking-wider">Method</span>
                <LauncherSelect
                  value={nodeData.config?.method || "POST"}
                  onChange={(val) => updateConfig("method", val)}
                  options={methodOptions}
                />
              </div>
              <div className="col-span-3 space-y-0.5">
                <span className="text-[9.5px] font-medium text-neutral-500 uppercase tracking-wider">Endpoint URL</span>
                <input
                  type="text"
                  value={nodeData.config?.url || ""}
                  placeholder="https://api.zapier.com/..."
                  onChange={(e) => updateConfig("url", e.target.value)}
                  className="w-full h-8 px-2 text-xs font-mono text-[11px] rounded-[6px] border border-neutral-300/80 dark:border-white/[0.1] bg-white/80 dark:bg-[#141414]/90"
                />
              </div>
            </div>
            <div className="p-2 rounded-[5px] bg-neutral-100/70 dark:bg-white/[0.04] text-[10.5px] text-neutral-500">
              Compatible with Zapier, Make.com, n8n, Discord, & Custom APIs.
            </div>
          </div>
        )}

        {/* Email Dispatcher Config */}
        {isEmail && (
          <div className="space-y-2">
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
                Recipient Email
              </label>
              <input
                type="email"
                value={nodeData.config?.toEmail || ""}
                placeholder="colleague@revou.co"
                onChange={(e) => updateConfig("toEmail", e.target.value)}
                className="w-full h-8 px-2.5 text-xs rounded-[6px] border border-neutral-300/80 dark:border-white/[0.1] bg-white/80 dark:bg-[#141414]/90 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
                Subject
              </label>
              <input
                type="text"
                value={nodeData.config?.subject || ""}
                placeholder="Automation Summary Report"
                onChange={(e) => updateConfig("subject", e.target.value)}
                className="w-full h-7 px-2 text-xs rounded-[5px] border border-neutral-300/80 dark:border-white/[0.1] bg-white/80 dark:bg-[#141414]/90"
              />
            </div>
          </div>
        )}

        {/* Handles */}
        <div className="pt-2 border-t border-neutral-200/60 dark:border-white/[0.08] flex flex-col gap-1.5">
          {/* Inputs */}
          {nodeData.inputs?.map((inp) => (
            <div key={inp.id} className="relative flex items-center text-[11px] text-neutral-600 dark:text-neutral-400 pl-1">
              <Handle
                type="target"
                position={Position.Left}
                id={inp.id}
                className="w-2.5 h-2.5 bg-neutral-400 dark:bg-neutral-500 border border-white dark:border-neutral-900 rounded-full hover:bg-neutral-800 dark:hover:bg-white hover:scale-125 transition-all shadow-2xs"
                style={{ left: -19 }}
              />
              <span className="font-medium text-neutral-800 dark:text-neutral-200">{inp.label}</span>
              <span className="text-[9.5px] uppercase font-mono text-neutral-400 ml-1.5">
                {inp.type}
              </span>
            </div>
          ))}

          {/* Outputs */}
          {nodeData.outputs?.map((out) => (
            <div key={out.id} className="relative flex items-center justify-end text-[11px] text-neutral-600 dark:text-neutral-400 pr-1">
              <span className="text-[9.5px] uppercase font-mono text-neutral-400 mr-2">
                {out.type}
              </span>
              <span className="font-medium text-neutral-800 dark:text-neutral-200">{out.label}</span>
              <Handle
                type="source"
                position={Position.Right}
                id={out.id}
                className="w-2.5 h-2.5 bg-neutral-400 dark:bg-neutral-500 border border-white dark:border-neutral-900 rounded-full hover:bg-neutral-800 dark:hover:bg-white hover:scale-125 transition-all shadow-2xs"
                style={{ right: -19 }}
              />
            </div>
          ))}
        </div>
      </div>
    </CustomNodeWrapper>
  );
});
