"use client";

import React from "react";
import { NodeProps, Handle, Position, useReactFlow } from "@xyflow/react";
import { CustomNodeWrapper } from "./CustomNodeWrapper";
import { CustomNodeData } from "../types";
import { LauncherSelect } from "../LauncherSelect";

const formatOptions = [
  { value: "PPTX", label: "PowerPoint (.pptx)" },
  { value: "DOCX", label: "Microsoft Word (.docx)" },
  { value: "MARKDOWN", label: "Markdown (.md)" },
  { value: "JSON", label: "JSON File (.json)" },
];

export const OutputNode = React.memo(function OutputNode({ id, data, selected }: NodeProps) {
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

  const isExport = nodeData.nodeType === "export_file";

  return (
    <CustomNodeWrapper
      id={id}
      selected={selected}
      data={nodeData}
      categoryName="Output"
    >
      <div className="space-y-2.5">
        {isExport ? (
          <div className="space-y-1">
            <label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
              Download Format
            </label>
            <LauncherSelect
              value={nodeData.config?.format || "PPTX"}
              onChange={(val) => updateConfig("format", val)}
              options={formatOptions}
            />
          </div>
        ) : (
          <div className="p-2.5 rounded-[6px] bg-neutral-100/70 dark:bg-white/[0.04] border border-neutral-200/80 dark:border-white/[0.08] text-[11px] text-neutral-600 dark:text-neutral-400">
            Renders output payload into live test drawer.
          </div>
        )}

        {/* Left Inputs */}
        <div className="pt-2 border-t border-neutral-200/60 dark:border-white/[0.08]">
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
        </div>
      </div>
    </CustomNodeWrapper>
  );
});
