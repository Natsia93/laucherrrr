"use client";

import React from "react";
import { NodeProps, Handle, Position, useReactFlow } from "@xyflow/react";
import { CustomNodeWrapper } from "./CustomNodeWrapper";
import { CustomNodeData } from "../types";

export const LogicNode = React.memo(function LogicNode({ id, data, selected }: NodeProps) {
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

  const isCondition = nodeData.nodeType === "condition_router";

  return (
    <CustomNodeWrapper
      id={id}
      selected={selected}
      data={nodeData}
      categoryName="Logic"
    >
      <div className="space-y-2.5">
        {isCondition ? (
          <div className="space-y-1">
            <label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
              Rule Condition
            </label>
            <select
              value={nodeData.config?.condition || "contains_keyword"}
              onChange={(e) => updateConfig("condition", e.target.value)}
              className="w-full h-8 px-2.5 text-xs font-medium rounded-[6px] border border-neutral-300/80 dark:border-white/[0.1] bg-white/80 dark:bg-[#141414]/90 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
            >
              <option value="contains_keyword">Contains Keyword</option>
              <option value="priority_high">Priority is High</option>
              <option value="is_not_empty">Output is Not Empty</option>
            </select>
          </div>
        ) : (
          <div className="space-y-1">
            <label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
              Format Transform
            </label>
            <select
              value={nodeData.config?.mode || "to_json"}
              onChange={(e) => updateConfig("mode", e.target.value)}
              className="w-full h-8 px-2.5 text-xs font-medium rounded-[6px] border border-neutral-300/80 dark:border-white/[0.1] bg-white/80 dark:bg-[#141414]/90 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
            >
              <option value="to_json">Parse to JSON</option>
              <option value="to_markdown">Convert to Markdown</option>
              <option value="to_plain_text">Strip to Plain Text</option>
            </select>
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
            </div>
          ))}

          {/* Outputs */}
          {nodeData.outputs?.map((out) => (
            <div key={out.id} className="relative flex items-center justify-end text-[11px] text-neutral-600 dark:text-neutral-400 pr-1">
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
