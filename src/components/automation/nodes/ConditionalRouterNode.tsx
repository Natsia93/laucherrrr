"use client";

import React, { useState } from "react";
import { NodeProps, Handle, Position, useReactFlow } from "@xyflow/react";
import { CustomNodeWrapper } from "./CustomNodeWrapper";
import { CustomNodeData } from "../types";
import { Plus, Trash2 } from "lucide-react";
import { LauncherSelect } from "../LauncherSelect";

interface RouteCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
}

const evalModeOptions = [
  { value: "all", label: "All match (AND)" },
  { value: "any", label: "Any match (OR)" },
  { value: "expression", label: "Custom expression" },
];

const operatorOptions = [
  { value: "contains", label: "Contains" },
  { value: "not_contains", label: "Not Contains" },
  { value: "equals", label: "Equals" },
  { value: "not_equals", label: "Not Equals" },
  { value: "starts_with", label: "Starts With" },
  { value: "ends_with", label: "Ends With" },
  { value: "regex", label: "Regex Match" },
  { value: "gt", label: "Greater Than" },
  { value: "lt", label: "Less Than" },
  { value: "is_empty", label: "Is Empty" },
  { value: "is_not_empty", label: "Is Not Empty" },
];

export const ConditionalRouterNode = React.memo(function ConditionalRouterNode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as CustomNodeData;
  const { setNodes } = useReactFlow();

  const conditions: RouteCondition[] = nodeData.config?.conditions || [
    { id: "cond-1", field: "input", operator: "contains", value: "" },
  ];

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

  const addCondition = () => {
    const newCond: RouteCondition = {
      id: `cond-${Date.now()}`,
      field: "input",
      operator: "contains",
      value: "",
    };
    updateConfig("conditions", [...conditions, newCond]);
  };

  const removeCondition = (condId: string) => {
    updateConfig(
      "conditions",
      conditions.filter((c) => c.id !== condId)
    );
  };

  const updateCondition = (condId: string, field: string, value: string) => {
    updateConfig(
      "conditions",
      conditions.map((c) => (c.id === condId ? { ...c, [field]: value } : c))
    );
  };

  return (
    <CustomNodeWrapper
      id={id}
      selected={selected}
      data={nodeData}
      categoryName="Router"
    >
      <div className="space-y-2.5">
        {/* Evaluation Mode */}
        <div className="space-y-1">
          <label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
            Evaluation Mode
          </label>
          <LauncherSelect
            value={nodeData.config?.evalMode || "all"}
            onChange={(val) => updateConfig("evalMode", val)}
            options={evalModeOptions}
          />
        </div>

        {/* Conditions */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
              Conditions
            </label>
            <button
              type="button"
              onClick={addCondition}
              className="p-0.5 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {conditions.map((cond, idx) => (
            <div
              key={cond.id}
              className="flex items-center gap-1.5 p-1.5 rounded-[5px] bg-neutral-100/60 dark:bg-white/[0.04] border border-neutral-200/50 dark:border-white/[0.06]"
            >
              <div className="w-[105px] shrink-0">
                <LauncherSelect
                  value={cond.operator}
                  onChange={(val) => updateCondition(cond.id, "operator", val)}
                  options={operatorOptions}
                />
              </div>

              <input
                type="text"
                placeholder="value..."
                value={cond.value}
                onChange={(e) => updateCondition(cond.id, "value", e.target.value)}
                className="flex-1 h-8 px-2 text-[11px] font-mono rounded-[6px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141414] focus:outline-none placeholder:text-neutral-400"
              />

              {conditions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeCondition(cond.id)}
                  className="p-0.5 text-neutral-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Custom Expression (when mode = expression) */}
        {nodeData.config?.evalMode === "expression" && (
          <div className="space-y-1">
            <label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
              JS Expression
            </label>
            <input
              type="text"
              placeholder="input.length > 100 && input.includes('urgent')"
              value={nodeData.config?.expression || ""}
              onChange={(e) => updateConfig("expression", e.target.value)}
              className="w-full h-7 px-2 text-[10.5px] font-mono rounded-[5px] border border-neutral-300/80 dark:border-white/[0.1] bg-white/80 dark:bg-[#141414]/90 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 placeholder:text-neutral-300 dark:placeholder:text-neutral-600"
            />
          </div>
        )}

        {/* Handles */}
        <div className="pt-2 border-t border-neutral-200/60 dark:border-white/[0.08] flex flex-col gap-1.5">
          <div className="relative flex items-center text-[11px] text-neutral-600 dark:text-neutral-400 pl-1">
            <Handle
              type="target"
              position={Position.Left}
              id="eval_in"
              className="w-2.5 h-2.5 bg-neutral-400 dark:bg-neutral-500 border border-white dark:border-neutral-900 rounded-full hover:bg-neutral-800 dark:hover:bg-white hover:scale-125 transition-all shadow-2xs"
              style={{ left: -19 }}
            />
            <span className="font-medium text-neutral-800 dark:text-neutral-200">
              Input
            </span>
          </div>

          <div className="relative flex items-center justify-end text-[11px] text-neutral-600 dark:text-neutral-400 pr-1">
            <span className="font-medium text-emerald-600 dark:text-emerald-400">
              ✓ True
            </span>
            <Handle
              type="source"
              position={Position.Right}
              id="true_out"
              className="w-2.5 h-2.5 bg-emerald-500 border border-white dark:border-neutral-900 rounded-full hover:bg-emerald-600 hover:scale-125 transition-all shadow-2xs"
              style={{ right: -19 }}
            />
          </div>

          <div className="relative flex items-center justify-end text-[11px] text-neutral-600 dark:text-neutral-400 pr-1">
            <span className="font-medium text-red-500 dark:text-red-400">
              ✗ False
            </span>
            <Handle
              type="source"
              position={Position.Right}
              id="false_out"
              className="w-2.5 h-2.5 bg-red-500 border border-white dark:border-neutral-900 rounded-full hover:bg-red-600 hover:scale-125 transition-all shadow-2xs"
              style={{ right: -19 }}
            />
          </div>
        </div>
      </div>
    </CustomNodeWrapper>
  );
});
