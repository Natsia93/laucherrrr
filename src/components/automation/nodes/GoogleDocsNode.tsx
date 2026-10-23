"use client";

import React from "react";
import { NodeProps, useReactFlow } from "@xyflow/react";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { CustomNodeWrapper } from "./CustomNodeWrapper";
import { CustomNodeData } from "../types";
import { LauncherSelect } from "../LauncherSelect";

const OPERATION_OPTIONS = [
  { value: "create_document", label: "Create New Document (From Template / AI Content)" },
  { value: "append_text", label: "Append Content / Log Section to Document" },
  { value: "read_document", label: "Read / Extract Document Text Content" },
  { value: "replace_text", label: "Search & Replace Variables in Document" },
];

const TEMPLATE_OPTIONS = [
  { value: "Executive Report", label: "Executive Report (Standard Structure)" },
  { value: "Briefing Memo", label: "Briefing Memo (Compact Actionable)" },
  { value: "Proposal & Pitch", label: "Strategic Proposal & Project Charter" },
  { value: "Meeting Minutes", label: "Meeting Minutes & Action Items" },
];

export const GoogleDocsNode = React.memo(function GoogleDocsNode({ id, data, selected }: NodeProps) {
  const { setNodes } = useReactFlow();
  const nodeData = data as unknown as CustomNodeData;
  const config = nodeData.config || {};
  const operation = config.operation || "create_document";
  const documentId = config.documentId || "";
  const documentTitle = config.documentTitle || "Dokumen_{{timestamp}}";
  const template = config.template || "Executive Report";

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
            Docs Action
          </label>
          <LauncherSelect
            value={operation}
            onChange={(val) => updateConfig("operation", val)}
            options={OPERATION_OPTIONS}
            placeholder="Select action..."
          />
        </div>

        {/* Document Title (for create) */}
        {operation === "create_document" && (
          <div>
            <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
              Document Title
            </label>
            <input
              type="text"
              value={documentTitle}
              onChange={(e) => updateConfig("documentTitle", e.target.value)}
              placeholder="e.g. Laporan_Strategis_{{date}}"
              className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-neutral-400"
            />
          </div>
        )}

        {/* Document ID (for append / read / replace) */}
        {operation !== "create_document" && (
          <div>
            <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
              Target Document ID or URL
            </label>
            <input
              type="text"
              value={documentId}
              onChange={(e) => updateConfig("documentId", e.target.value)}
              placeholder="e.g. 1uK7... or full document link"
              className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-neutral-400"
            />
          </div>
        )}

        {/* Template Style */}
        <div>
          <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
            Formatting Template
          </label>
          <LauncherSelect
            value={template}
            onChange={(val) => updateConfig("template", val)}
            options={TEMPLATE_OPTIONS}
            placeholder="Select template..."
          />
        </div>

        {/* OAuth Status Indicator */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-100/80 dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800 text-[10.5px]">
          <div className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
            <Image
              src="/logo/App-connector/google-docs.webp"
              alt="Google Docs"
              width={16}
              height={16}
              className="w-4 h-4 object-contain"
            />
            <span className="font-mono">Google Docs OAuth: Active</span>
          </div>
          <span className="text-neutral-500 font-mono text-[10px]">Cloud Sync</span>
        </div>
      </div>
    </CustomNodeWrapper>
  );
});

GoogleDocsNode.displayName = "GoogleDocsNode";
