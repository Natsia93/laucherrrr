"use client";

import React from "react";
import { NodeProps, Handle, Position, useReactFlow } from "@xyflow/react";
import { CustomNodeWrapper } from "./CustomNodeWrapper";
import { CustomNodeData } from "../types";

export const TriggerNode = React.memo(function TriggerNode({ id, data, selected }: NodeProps) {
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

  const isSchedule = nodeData.nodeType === "schedule_cron";
  const isWebhook = nodeData.nodeType === "webhook";

  return (
    <CustomNodeWrapper
      id={id}
      selected={selected}
      data={nodeData}
      categoryName="Trigger"
    >
      <div className="space-y-2.5">
        {isSchedule ? (
          <div className="space-y-1">
            <label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
              Frequency
            </label>
            <select
              value={nodeData.config?.frequency || "daily_9am"}
              onChange={(e) => updateConfig("frequency", e.target.value)}
              className="w-full h-8 px-2.5 text-xs rounded-[6px] border border-neutral-300/80 dark:border-white/[0.1] bg-white/80 dark:bg-[#141414]/90 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 font-medium"
            >
              <option value="daily_9am">Daily at 09:00 AM</option>
              <option value="weekly_monday">Weekly on Monday</option>
              <option value="hourly">Hourly</option>
              <option value="custom_cron">Custom Cron</option>
            </select>
          </div>
        ) : isWebhook ? (
          <div className="space-y-1">
            <label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
              Event Listener
            </label>
            <select
              value={nodeData.config?.event || "document_created"}
              onChange={(e) => updateConfig("event", e.target.value)}
              className="w-full h-8 px-2.5 text-xs rounded-[6px] border border-neutral-300/80 dark:border-white/[0.1] bg-white/80 dark:bg-[#141414]/90 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 font-medium"
            >
              <option value="document_created">Document Created</option>
              <option value="todo_added">To-Do Added</option>
              <option value="manual_button">Run Button Clicked</option>
            </select>
          </div>
        ) : (
          <div className="space-y-1">
            <label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
              Prompt Input
            </label>
            <textarea
              rows={3}
              value={nodeData.config?.defaultText || ""}
              placeholder={nodeData.config?.placeholder || "Ketik teks masukan rapat atau topik..."}
              onChange={(e) => updateConfig("defaultText", e.target.value)}
              className="w-full p-2 text-xs rounded-[6px] border border-neutral-300/80 dark:border-white/[0.1] bg-white/80 dark:bg-[#141414]/90 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 resize-none font-sans leading-relaxed"
            />
          </div>
        )}

        {/* Output Port Handles */}
        <div className="pt-2 border-t border-neutral-200/60 dark:border-white/[0.08] flex flex-col gap-1.5">
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
