"use client";

import React from "react";
import { NodeProps, useReactFlow } from "@xyflow/react";
import { FileSpreadsheet, CheckCircle2 } from "lucide-react";
import { CustomNodeWrapper } from "./CustomNodeWrapper";
import { CustomNodeData } from "../types";
import { LauncherSelect } from "../LauncherSelect";

const OPERATION_OPTIONS = [
  { value: "read_rows", label: "Read Rows (Fetch Spreadsheet Data)" },
  { value: "append_row", label: "Append Row (Insert Data Log)" },
  { value: "update_row", label: "Update Existing Row" },
];

export const GoogleSheetsNode = React.memo(function GoogleSheetsNode({ id, data, selected }: NodeProps) {
  const { setNodes } = useReactFlow();
  const nodeData = data as unknown as CustomNodeData;
  const config = nodeData.config || {};
  const operation = config.operation || "read_rows";
  const sheetName = config.sheetName || "Sheet1";
  const spreadsheetId = config.spreadsheetId || "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms";

  const updateConfig = (key: string, value: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              config: {
                ...(node.data as any).config,
                [key]: value,
              },
            },
          };
        }
        return node;
      })
    );
  };

  return (
    <CustomNodeWrapper id={id} data={nodeData} selected={selected}>
      <div className="space-y-3 font-sans text-xs">
        {/* Operation Selector */}
        <div>
          <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
            Action Mode
          </label>
          <LauncherSelect
            value={operation}
            onChange={(val) => updateConfig("operation", val)}
            options={OPERATION_OPTIONS}
            placeholder="Select action..."
          />
        </div>

        {/* Spreadsheet ID / Name */}
        <div>
          <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
            Spreadsheet ID or Name
          </label>
          <input
            type="text"
            value={spreadsheetId}
            onChange={(e) => updateConfig("spreadsheetId", e.target.value)}
            placeholder="e.g. 1BxiMVs0X... or Leads_2026"
            className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
          />
        </div>

        {/* Sheet Tab Name */}
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
              Sheet Tab
            </label>
            <input
              type="text"
              value={sheetName}
              onChange={(e) => updateConfig("sheetName", e.target.value)}
              placeholder="Sheet1"
              className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
            />
          </div>

          <div className="w-24">
            <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
              Limit Rows
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={config.limit || 10}
              onChange={(e) => updateConfig("limit", parseInt(e.target.value) || 10)}
              className="w-full px-2 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
            />
          </div>
        </div>

        {/* Connection Status Badge */}
        <div className="p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Google Connector: Ready</span>
          </div>
          <span className="text-[10px] text-neutral-400 font-mono">OAuth 2.0</span>
        </div>
      </div>
    </CustomNodeWrapper>
  );
});

GoogleSheetsNode.displayName = "GoogleSheetsNode";
