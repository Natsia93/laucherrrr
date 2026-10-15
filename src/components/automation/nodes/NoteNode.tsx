"use client";

import React, { useState } from "react";
import { NodeProps, Handle, Position, useReactFlow } from "@xyflow/react";
import { CustomNodeWrapper } from "./CustomNodeWrapper";
import { CustomNodeData } from "../types";
import { Layers, ChevronDown, ChevronRight } from "lucide-react";

export const NoteNode = React.memo(function NoteNode({ id, data, selected }: NodeProps) {
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
    <div
      className={`w-[260px] rounded-[8px] border transition-colors duration-100 font-sans ${
        selected
          ? "border-amber-400/60 ring-1 ring-amber-400/30"
          : "border-amber-200/60 dark:border-amber-900/40 hover:border-amber-300 dark:hover:border-amber-800"
      } bg-amber-50 dark:bg-[#201a12] shadow-sm font-sans`}
    >
      <div className="px-3 py-2 border-b border-amber-200/50 dark:border-amber-900/30 flex items-center gap-2">
        <Layers className="w-3 h-3 text-amber-500" />
        <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-200">
          Note
        </span>
      </div>
      <div className="p-3">
        <textarea
          rows={3}
          placeholder="Add a note for this section of the flow..."
          value={nodeData.config?.note || ""}
          onChange={(e) => updateConfig("note", e.target.value)}
          className="w-full text-[11px] leading-relaxed rounded-[5px] border-none bg-transparent focus:outline-none resize-none placeholder:text-amber-400/60 dark:placeholder:text-amber-700 text-amber-900 dark:text-amber-100"
        />
      </div>
    </div>
  );
});
