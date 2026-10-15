"use client";

import React from "react";
import { NodeProps, Handle, Position, useReactFlow } from "@xyflow/react";
import { CustomNodeWrapper } from "./CustomNodeWrapper";
import { CustomNodeData } from "../types";
import { LauncherSelect } from "../LauncherSelect";

export const ActionNode = React.memo(function ActionNode({ id, data, selected }: NodeProps) {
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

  const isTodo = nodeData.nodeType === "create_todo";
  const isCalendar = nodeData.nodeType === "create_calendar";
  const isDocument = nodeData.nodeType === "create_document";
  const isScratchpad = nodeData.nodeType === "update_scratchpad";

  const priorityOptions = [
    { value: "High", label: "High" },
    { value: "Medium", label: "Medium" },
    { value: "Low", label: "Low" },
  ];

  const calendarCategoryOptions = [
    { value: "meeting", label: "Meeting" },
    { value: "strategy", label: "Strategy" },
    { value: "review", label: "Review" },
    { value: "task", label: "Focus" },
  ];

  const durationOptions = [
    { value: "30", label: "30 min" },
    { value: "60", label: "60 min" },
    { value: "90", label: "90 min" },
  ];

  const docTypeOptions = [
    { value: "Strategy Brief", label: "Strategy Brief" },
    { value: "Presentation Deck", label: "Presentation Deck" },
    { value: "Executive Meeting Notes", label: "Executive Meeting Notes" },
    { value: "Product Requirements (PRD)", label: "Product Requirements (PRD)" },
    { value: "Curriculum Document", label: "Curriculum Document" },
  ];

  const scratchpadModeOptions = [
    { value: "append", label: "Append note" },
    { value: "replace", label: "Replace note" },
  ];

  return (
    <CustomNodeWrapper
      id={id}
      selected={selected}
      data={nodeData}
      categoryName="Action"
    >
      <div className="space-y-2.5">
        {/* Specific Configuration based on Action Type */}
        {isTodo && (
          <div className="space-y-1.5">
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
                Task Title
              </label>
              <input
                type="text"
                value={nodeData.config?.taskTitle || ""}
                placeholder="e.g. Review Q4 Strategy Document"
                onChange={(e) => updateConfig("taskTitle", e.target.value)}
                className="w-full h-8 px-2.5 text-xs rounded-[6px] border border-neutral-300/80 dark:border-white/[0.1] bg-white/80 dark:bg-[#141414]/90 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 font-medium"
              />
            </div>
            <div className="flex items-center justify-between pt-0.5 text-xs text-neutral-500">
              <span className="text-[10px] font-medium uppercase tracking-wider">Priority</span>
              <div className="w-28">
                <LauncherSelect
                  value={nodeData.config?.priority || "High"}
                  onChange={(val) => updateConfig("priority", val)}
                  options={priorityOptions}
                />
              </div>
            </div>
          </div>
        )}

        {isCalendar && (
          <div className="space-y-1.5">
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
                Event Title
              </label>
              <input
                type="text"
                value={nodeData.config?.eventTitle || ""}
                placeholder="e.g. Stakeholder Demo Session"
                onChange={(e) => updateConfig("eventTitle", e.target.value)}
                className="w-full h-8 px-2.5 text-xs rounded-[6px] border border-neutral-300/80 dark:border-white/[0.1] bg-white/80 dark:bg-[#141414]/90 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 font-medium"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-0.5">
                <span className="text-[9.5px] font-medium text-neutral-500 uppercase tracking-wider">Category</span>
                <LauncherSelect
                  value={nodeData.config?.category || "meeting"}
                  onChange={(val) => updateConfig("category", val)}
                  options={calendarCategoryOptions}
                />
              </div>
              <div className="space-y-0.5">
                <span className="text-[9.5px] font-medium text-neutral-500 uppercase tracking-wider">Duration</span>
                <LauncherSelect
                  value={String(nodeData.config?.durationMinutes || 60)}
                  onChange={(val) => updateConfig("durationMinutes", parseInt(val))}
                  options={durationOptions}
                />
              </div>
            </div>
          </div>
        )}

        {isDocument && (
          <div className="space-y-1">
            <label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
              Document Category
            </label>
            <LauncherSelect
              value={nodeData.config?.docType || "Strategy Brief"}
              onChange={(val) => updateConfig("docType", val)}
              options={docTypeOptions}
            />
          </div>
        )}

        {isScratchpad && (
          <div className="space-y-1">
            <label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
              Sync Mode
            </label>
            <LauncherSelect
              value={nodeData.config?.mode || "append"}
              onChange={(val) => updateConfig("mode", val)}
              options={scratchpadModeOptions}
            />
          </div>
        )}

        {/* Handles */}
        <div className="pt-2 border-t border-neutral-200/60 dark:border-white/[0.08] flex flex-col gap-1.5">
          {/* Inputs (Left) */}
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

          {/* Outputs (Right) */}
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
