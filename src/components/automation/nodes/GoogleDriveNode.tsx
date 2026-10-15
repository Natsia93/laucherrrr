"use client";

import React from "react";
import { NodeProps, useReactFlow } from "@xyflow/react";
import { HardDrive, CheckCircle2 } from "lucide-react";
import { CustomNodeWrapper } from "./CustomNodeWrapper";
import { CustomNodeData } from "../types";
import { LauncherSelect } from "../LauncherSelect";

const OPERATION_OPTIONS = [
  { value: "upload_file", label: "Upload File / Export Document" },
  { value: "search_files", label: "Search Files in Folder" },
  { value: "read_file", label: "Read / Download File Content" },
  { value: "create_folder", label: "Create New Drive Folder" },
];

export const GoogleDriveNode = React.memo(function GoogleDriveNode({ id, data, selected }: NodeProps) {
  const { setNodes } = useReactFlow();
  const nodeData = data as unknown as CustomNodeData;
  const config = nodeData.config || {};
  const operation = config.operation || "upload_file";
  const folderPath = config.folderPath || "Launcher_Exports";
  const fileName = config.fileName || "Laporan_{{timestamp}}.pdf";

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
        {/* Action Selector */}
        <div>
          <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
            Drive Action
          </label>
          <LauncherSelect
            value={operation}
            onChange={(val) => updateConfig("operation", val)}
            options={OPERATION_OPTIONS}
            placeholder="Select action..."
          />
        </div>

        {/* Target Folder Path / ID */}
        <div>
          <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
            Target Folder (Path / Folder ID)
          </label>
          <input
            type="text"
            value={folderPath}
            onChange={(e) => updateConfig("folderPath", e.target.value)}
            placeholder="e.g. Launcher_Exports or 1AbCdEfG..."
            className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-neutral-400"
          />
        </div>

        {/* File Name (for Upload / Read) */}
        {(operation === "upload_file" || operation === "read_file") && (
          <div>
            <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
              File Name / Template
            </label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => updateConfig("fileName", e.target.value)}
              placeholder="e.g. Export_{{date}}.pdf"
              className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-neutral-400"
            />
          </div>
        )}

        {/* OAuth Status Indicator */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-100/80 dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800 text-[10.5px]">
          <div className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-neutral-800 dark:text-neutral-200" />
            <span className="font-mono">Drive OAuth: Active</span>
          </div>
          <span className="text-neutral-500 font-mono text-[10px]">MyDrive & Shared</span>
        </div>
      </div>
    </CustomNodeWrapper>
  );
});
