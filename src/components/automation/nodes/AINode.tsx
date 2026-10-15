"use client";

import React from "react";
import { NodeProps, Handle, Position, useReactFlow } from "@xyflow/react";
import { CustomNodeWrapper } from "./CustomNodeWrapper";
import { CustomNodeData } from "../types";
import { LauncherSelect } from "../LauncherSelect";

export const AINode = React.memo(function AINode({ id, data, selected }: NodeProps) {
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

  const isDeck = nodeData.nodeType === "deck_creator";

  // Dynamic Variable Extraction ({var_name} in prompt -> dynamic input handles)
  const promptText = nodeData.config?.systemPrompt || "";
  const dynamicVars = React.useMemo(() => {
    const matches = Array.from(promptText.matchAll(/\{([a-zA-Z0-9_-]+)\}/g));
    const unique = Array.from(new Set(matches.map((m: any) => m[1] as string)));
    return unique.filter((v) => v !== "topic" && v !== "prompt" && v !== "context");
  }, [promptText]);

  const modelOptions = [
    { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
    { value: "gpt-4o-mini", label: "GPT-4o Mini" },
    { value: "claude-3-5-sonnet", label: "Claude 3.5 Sonnet" },
    { value: "deepseek-chat", label: "DeepSeek V3" },
  ];

  return (
    <CustomNodeWrapper
      id={id}
      selected={selected}
      data={nodeData}
      categoryName="AI Model"
    >
      <div className="space-y-2.5">
        {/* Model Selection & Temperature */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
              Model
            </label>
            <LauncherSelect
              value={nodeData.config?.model || "gemini-2.5-flash"}
              onChange={(val) => updateConfig("model", val)}
              options={modelOptions}
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
              <span>Temp</span>
              <span className="font-mono text-neutral-700 dark:text-neutral-300">
                {nodeData.config?.temperature ?? 0.3}
              </span>
            </div>
            <div className="pt-2">
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={nodeData.config?.temperature ?? 0.3}
                onChange={(e) => updateConfig("temperature", parseFloat(e.target.value))}
                className="w-full h-1 bg-neutral-200 dark:bg-neutral-800 rounded appearance-none cursor-pointer accent-neutral-900 dark:accent-neutral-200"
              />
            </div>
          </div>
        </div>

        {/* System Prompt / Instructions */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
              {isDeck ? "Slide Outline Instructions" : "System Directives"}
            </label>
            {dynamicVars.length > 0 && (
              <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-neutral-200/70 dark:bg-white/[0.08] text-neutral-700 dark:text-neutral-300">
                {dynamicVars.length} {dynamicVars.length === 1 ? "variable" : "variables"}
              </span>
            )}
          </div>
          <textarea
            rows={3}
            value={nodeData.config?.systemPrompt || ""}
            placeholder="Instruksi AI (Gunakan {variabel} untuk input dinamis...)"
            onChange={(e) => updateConfig("systemPrompt", e.target.value)}
            className="w-full p-2 text-xs rounded-[6px] border border-neutral-300/80 dark:border-white/[0.1] bg-white/80 dark:bg-[#141414]/90 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 resize-none font-sans leading-relaxed"
          />
        </div>

        {/* Handles: Inputs on Left & Outputs on Right */}
        <div className="pt-2 border-t border-neutral-200/60 dark:border-white/[0.08] flex flex-col gap-1.5">
          {/* Default Inputs (Left) */}
          {nodeData.inputs && nodeData.inputs.length > 0 && (
            <div className="space-y-1">
              {nodeData.inputs.map((inp) => (
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
            </div>
          )}

          {/* Dynamic Extracted Variables Handles (Left) */}
          {dynamicVars.map((varName) => (
            <div key={`var-${varName}`} className="relative flex items-center text-[11px] text-neutral-700 dark:text-neutral-300 pl-1">
              <Handle
                type="target"
                position={Position.Left}
                id={`var_${varName}`}
                className="w-2.5 h-2.5 bg-neutral-400 dark:bg-neutral-500 border border-white dark:border-neutral-900 rounded-full hover:bg-neutral-800 dark:hover:bg-white hover:scale-125 transition-all shadow-2xs"
                style={{ left: -19 }}
              />
              <span className="font-mono font-medium text-[10.5px] text-neutral-900 dark:text-neutral-100">
                &#123;{varName}&#125;
              </span>
              <span className="text-[9px] uppercase font-mono text-neutral-400 ml-1.5">
                var
              </span>
            </div>
          ))}

          {/* Outputs (Right) */}
          {nodeData.outputs && nodeData.outputs.length > 0 && (
            <div className="space-y-1 pt-0.5">
              {nodeData.outputs.map((out) => (
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
          )}
        </div>
      </div>
    </CustomNodeWrapper>
  );
});
