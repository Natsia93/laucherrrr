"use client";

import React from "react";
import { NodeProps, useReactFlow } from "@xyflow/react";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { CustomNodeWrapper } from "./CustomNodeWrapper";
import { CustomNodeData } from "../types";
import { LauncherSelect } from "../LauncherSelect";

const OPERATION_OPTIONS = [
  { value: "create_presentation", label: "Create New Presentation (From AI Outline / Deck)" },
  { value: "append_slides", label: "Append Slide Section to Existing Deck" },
  { value: "read_slides", label: "Extract Presentation Text & Structure" },
  { value: "export_presentation", label: "Export Deck to PDF / PPTX" },
];

const THEME_OPTIONS = [
  { value: "Institutional Standard", label: "ITB × RevoU Institutional Standard" },
  { value: "UI Institutional Standard", label: "UI × RevoU Institutional Standard" },
  { value: "McKinsey Clean", label: "McKinsey Executive Clean (Light)" },
  { value: "Dark Mode Executive", label: "Dark Minimalist Executive (16:9)" },
  { value: "Tech Pitch Deck", label: "Silicon Valley Tech Pitch Deck" },
];

export const GoogleSlidesNode = React.memo(function GoogleSlidesNode({ id, data, selected }: NodeProps) {
  const { setNodes } = useReactFlow();
  const nodeData = data as unknown as CustomNodeData;
  const config = nodeData.config || {};
  const operation = config.operation || "create_presentation";
  const presentationId = config.presentationId || "";
  const presentationTitle = config.presentationTitle || "Presentasi_{{timestamp}}";
  const theme = config.theme || "Institutional Standard";

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
            Slides Action
          </label>
          <LauncherSelect
            value={operation}
            onChange={(val) => updateConfig("operation", val)}
            options={OPERATION_OPTIONS}
            placeholder="Select action..."
          />
        </div>

        {/* Presentation Title (for create) */}
        {operation === "create_presentation" && (
          <div>
            <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
              Presentation Deck Title
            </label>
            <input
              type="text"
              value={presentationTitle}
              onChange={(e) => updateConfig("presentationTitle", e.target.value)}
              placeholder="e.g. Master_Executive_Deck_{{date}}"
              className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-neutral-400"
            />
          </div>
        )}

        {/* Presentation ID (for append / read / export) */}
        {operation !== "create_presentation" && (
          <div>
            <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
              Target Presentation ID or URL
            </label>
            <input
              type="text"
              value={presentationId}
              onChange={(e) => updateConfig("presentationId", e.target.value)}
              placeholder="e.g. 1pQ9... or full presentation link"
              className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-neutral-400"
            />
          </div>
        )}

        {/* Master Theme Style */}
        <div>
          <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
            Master Theme & Typography
          </label>
          <LauncherSelect
            value={theme}
            onChange={(val) => updateConfig("theme", val)}
            options={THEME_OPTIONS}
            placeholder="Select master theme..."
          />
        </div>

        {/* OAuth Status Indicator */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-100/80 dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800 text-[10.5px]">
          <div className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
            <Image
              src="/logo/App-connector/google-slides.webp"
              alt="Google Slides"
              width={16}
              height={16}
              className="w-4 h-4 object-contain"
            />
            <span className="font-mono">Google Slides OAuth: Active</span>
          </div>
          <span className="text-neutral-500 font-mono text-[10px]">Cloud Sync</span>
        </div>
      </div>
    </CustomNodeWrapper>
  );
});

GoogleSlidesNode.displayName = "GoogleSlidesNode";
