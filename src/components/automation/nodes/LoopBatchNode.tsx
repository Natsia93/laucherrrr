"use client";

import React from "react";
import { NodeProps, Handle, Position, useReactFlow } from "@xyflow/react";
import { CustomNodeWrapper } from "./CustomNodeWrapper";
import { CustomNodeData } from "../types";
import { LauncherSelect } from "../LauncherSelect";

const loopModeOptions = [
  { value: "each_line", label: "Each Line" },
  { value: "json_array", label: "JSON Array Items" },
  { value: "csv_rows", label: "CSV Rows" },
  { value: "chunk", label: "Fixed Chunk Size" },
  { value: "repeat", label: "Repeat N Times" },
];

const concurrencyOptions = [
  { value: "sequential", label: "Sequential" },
  { value: "parallel_2", label: "Parallel (2x)" },
  { value: "parallel_5", label: "Parallel (5x)" },
  { value: "parallel_all", label: "Parallel (All)" },
];

const aggregationOptions = [
  { value: "array", label: "Collect as Array" },
  { value: "concat", label: "Concatenate Text" },
  { value: "last", label: "Last Item Only" },
  { value: "merge", label: "Merge Objects" },
];

export const LoopBatchNode = React.memo(function LoopBatchNode({ id, data, selected }: NodeProps) {
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
              config: { ...nodeData.config, [key]: value },
            },
          };
        }
        return node;
      })
    );
  };

  return (
    <CustomNodeWrapper
      id={id}
      selected={selected}
      data={nodeData}
      categoryName="Loop"
    >
      <div className="space-y-2.5">
        {/* Loop Mode */}
        <div className="space-y-1">
          <label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
            Loop Mode
          </label>
          <LauncherSelect
            value={nodeData.config?.loopMode || "each_line"}
            onChange={(val) => updateConfig("loopMode", val)}
            options={loopModeOptions}
          />
        </div>

        {/* Chunk Size / Repeat Count */}
        {(nodeData.config?.loopMode === "chunk" ||
          nodeData.config?.loopMode === "repeat") && (
          <div className="space-y-1">
            <label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
              {nodeData.config?.loopMode === "repeat" ? "Repeat Count" : "Chunk Size"}
            </label>
            <input
              type="number"
              min={1}
              max={1000}
              value={nodeData.config?.count || 5}
              onChange={(e) => updateConfig("count", parseInt(e.target.value) || 1)}
              className="w-full h-8 px-2.5 text-xs font-mono rounded-[6px] border border-neutral-300/80 dark:border-white/[0.1] bg-white/80 dark:bg-[#141414]/90 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
            />
          </div>
        )}

        {/* Concurrency */}
        <div className="space-y-1">
          <label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
            Concurrency
          </label>
          <LauncherSelect
            value={nodeData.config?.concurrency || "sequential"}
            onChange={(val) => updateConfig("concurrency", val)}
            options={concurrencyOptions}
          />
        </div>

        {/* Aggregation */}
        <div className="space-y-1">
          <label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
            Output Aggregation
          </label>
          <LauncherSelect
            value={nodeData.config?.aggregation || "array"}
            onChange={(val) => updateConfig("aggregation", val)}
            options={aggregationOptions}
          />
        </div>

        {/* Handles */}
        <div className="pt-2 border-t border-neutral-200/60 dark:border-white/[0.08] flex flex-col gap-1.5">
          <div className="relative flex items-center text-[11px] text-neutral-600 dark:text-neutral-400 pl-1">
            <Handle
              type="target"
              position={Position.Left}
              id="batch_in"
              className="w-2.5 h-2.5 bg-neutral-400 dark:bg-neutral-500 border border-white dark:border-neutral-900 rounded-full hover:bg-neutral-800 dark:hover:bg-white hover:scale-125 transition-all shadow-2xs"
              style={{ left: -19 }}
            />
            <span className="font-medium text-neutral-800 dark:text-neutral-200">
              Data Input
            </span>
          </div>
          <div className="relative flex items-center justify-end text-[11px] text-neutral-600 dark:text-neutral-400 pr-1">
            <span className="font-medium text-neutral-800 dark:text-neutral-200">
              Current Item
            </span>
            <Handle
              type="source"
              position={Position.Right}
              id="item_out"
              className="w-2.5 h-2.5 bg-neutral-400 dark:bg-neutral-500 border border-white dark:border-neutral-900 rounded-full hover:bg-neutral-800 dark:hover:bg-white hover:scale-125 transition-all shadow-2xs"
              style={{ right: -19 }}
            />
          </div>
          <div className="relative flex items-center justify-end text-[11px] text-neutral-600 dark:text-neutral-400 pr-1">
            <span className="font-medium text-neutral-800 dark:text-neutral-200">
              Aggregated
            </span>
            <Handle
              type="source"
              position={Position.Right}
              id="aggregate_out"
              className="w-2.5 h-2.5 bg-neutral-400 dark:bg-neutral-500 border border-white dark:border-neutral-900 rounded-full hover:bg-neutral-800 dark:hover:bg-white hover:scale-125 transition-all shadow-2xs"
              style={{ right: -19 }}
            />
          </div>
        </div>
      </div>
    </CustomNodeWrapper>
  );
});
