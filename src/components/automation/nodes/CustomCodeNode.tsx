"use client";

import React from "react";
import { NodeProps, Handle, Position, useReactFlow } from "@xyflow/react";
import { CustomNodeWrapper } from "./CustomNodeWrapper";
import { CustomNodeData } from "../types";
import { Code2 } from "lucide-react";

export const CustomCodeNode = React.memo(function CustomCodeNode({ id, data, selected }: NodeProps) {
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

  const defaultCode =
    nodeData.config?.code ||
    `// Custom JS Data Transformer\nfunction transform(input) {\n  return {\n    formatted: String(input).trim(),\n    length: String(input).length,\n    words: String(input).split(/\\s+/).length,\n  };\n}\nreturn transform(input);`;

  return (
    <CustomNodeWrapper
      id={id}
      selected={selected}
      data={nodeData}
      categoryName="Code Function"
    >
      <div className="space-y-2.5">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider flex items-center gap-1">
              <Code2 className="w-3 h-3" />
              <span>JavaScript Function</span>
            </label>
            <span className="text-[9.5px] font-mono text-neutral-400">ES6 Sandbox</span>
          </div>
          <textarea
            rows={5}
            value={nodeData.config?.code ?? defaultCode}
            onChange={(e) => updateConfig("code", e.target.value)}
            className="w-full p-2 text-[11px] font-mono rounded-[6px] border border-neutral-300/80 dark:border-white/[0.1] bg-[#141414] text-neutral-200 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 resize-none leading-relaxed select-text"
          />
        </div>

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
