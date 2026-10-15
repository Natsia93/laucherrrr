"use client";

import React from "react";
import { NodeProps, Handle, Position, useReactFlow } from "@xyflow/react";
import { CustomNodeWrapper } from "./CustomNodeWrapper";
import { CustomNodeData } from "../types";
import { LauncherSelect } from "../LauncherSelect";

const frequencyOptions = [
  { value: "every_5min", label: "Every 5 Minutes" },
  { value: "every_15min", label: "Every 15 Minutes" },
  { value: "every_30min", label: "Every 30 Minutes" },
  { value: "hourly", label: "Every Hour" },
  { value: "daily_9am", label: "Daily at 09:00" },
  { value: "daily_6pm", label: "Daily at 18:00" },
  { value: "weekdays_9am", label: "Weekdays at 09:00" },
  { value: "weekly_monday", label: "Weekly on Monday" },
  { value: "monthly_1st", label: "Monthly on 1st" },
  { value: "custom", label: "Custom Cron Expression" },
];

const timezoneOptions = [
  { value: "Asia/Jakarta", label: "Asia/Jakarta (WIB)" },
  { value: "Asia/Makassar", label: "Asia/Makassar (WITA)" },
  { value: "Asia/Jayapura", label: "Asia/Jayapura (WIT)" },
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "US Eastern" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "Asia/Singapore", label: "Singapore" },
  { value: "Asia/Tokyo", label: "Tokyo" },
];

export const ScheduleTriggerNode = React.memo(function ScheduleTriggerNode({ id, data, selected }: NodeProps) {
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
      categoryName="Schedule"
    >
      <div className="space-y-2.5">
        {/* Preset Frequency */}
        <div className="space-y-1">
          <label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
            Frequency
          </label>
          <LauncherSelect
            value={nodeData.config?.frequency || "daily_9am"}
            onChange={(val) => updateConfig("frequency", val)}
            options={frequencyOptions}
          />
        </div>

        {/* Custom Cron (when custom is selected) */}
        {nodeData.config?.frequency === "custom" && (
          <div className="space-y-1">
            <label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
              Cron Expression
            </label>
            <input
              type="text"
              placeholder="*/5 * * * *"
              value={nodeData.config?.cron || ""}
              onChange={(e) => updateConfig("cron", e.target.value)}
              className="w-full h-8 px-2.5 text-[11px] font-mono rounded-[6px] border border-neutral-300/80 dark:border-white/[0.1] bg-white/80 dark:bg-[#141414]/90 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 placeholder:text-neutral-400"
            />
            <p className="text-[9.5px] text-neutral-400">
              Format: minute hour day-of-month month day-of-week
            </p>
          </div>
        )}

        {/* Timezone */}
        <div className="space-y-1">
          <label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
            Timezone
          </label>
          <LauncherSelect
            value={nodeData.config?.timezone || "Asia/Jakarta"}
            onChange={(val) => updateConfig("timezone", val)}
            options={timezoneOptions}
          />
        </div>

        {/* Max Runs */}
        <div className="space-y-1">
          <label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
            Max Executions (0 = unlimited)
          </label>
          <input
            type="number"
            min={0}
            value={nodeData.config?.maxRuns || 0}
            onChange={(e) => updateConfig("maxRuns", parseInt(e.target.value) || 0)}
            className="w-full h-7 px-2 text-xs font-mono rounded-[5px] border border-neutral-300/80 dark:border-white/[0.1] bg-white/80 dark:bg-[#141414]/90 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
          />
        </div>

        {/* Handles */}
        <div className="pt-2 border-t border-neutral-200/60 dark:border-white/[0.08] flex flex-col gap-1.5">
          <div className="relative flex items-center justify-end text-[11px] text-neutral-600 dark:text-neutral-400 pr-1">
            <span className="font-medium text-neutral-800 dark:text-neutral-200">
              Trigger Signal
            </span>
            <Handle
              type="source"
              position={Position.Right}
              id="schedule_out"
              className="w-2.5 h-2.5 bg-neutral-400 dark:bg-neutral-500 border border-white dark:border-neutral-900 rounded-full hover:bg-neutral-800 dark:hover:bg-white hover:scale-125 transition-all shadow-2xs"
              style={{ right: -19 }}
            />
          </div>
          <div className="relative flex items-center justify-end text-[11px] text-neutral-600 dark:text-neutral-400 pr-1">
            <span className="font-medium text-neutral-800 dark:text-neutral-200">
              Timestamp
            </span>
            <Handle
              type="source"
              position={Position.Right}
              id="timestamp_out"
              className="w-2.5 h-2.5 bg-neutral-400 dark:bg-neutral-500 border border-white dark:border-neutral-900 rounded-full hover:bg-neutral-800 dark:hover:bg-white hover:scale-125 transition-all shadow-2xs"
              style={{ right: -19 }}
            />
          </div>
        </div>
      </div>
    </CustomNodeWrapper>
  );
});
