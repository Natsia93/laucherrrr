"use client";

import React, { useEffect, useState } from "react";
import { NodeProps, Handle, Position, useReactFlow } from "@xyflow/react";
import { CustomNodeWrapper } from "./CustomNodeWrapper";
import { CustomNodeData } from "../types";
import { BookOpen, Database, FileText } from "lucide-react";
import { LauncherSelect } from "../LauncherSelect";

const searchModeOptions = [
  { value: "semantic", label: "Semantic / RAG" },
  { value: "keyword", label: "Full-Text Exact" },
];

const topKOptions = [
  { value: "2", label: "Top 2 Excerpts" },
  { value: "3", label: "Top 3 Excerpts" },
  { value: "5", label: "Top 5 Excerpts" },
];

export const KnowledgeRetrieverNode = React.memo(function KnowledgeRetrieverNode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as CustomNodeData;
  const { setNodes } = useReactFlow();
  const [docList, setDocList] = useState<Array<{ id: string; title: string; type: string }>>([]);

  useEffect(() => {
    // Fetch available documents for dropdown
    fetch("/api/documents")
      .then((res) => res.json())
      .then((docs) => {
        if (Array.isArray(docs)) {
          setDocList(docs);
        }
      })
      .catch(() => {});
  }, []);

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

  const docOptions = [
    { value: "all_workspace", label: "All Workspace Documents" },
    ...docList.map((doc) => ({
      value: doc.id,
      label: doc.title || "Untitled Document",
    })),
  ];

  return (
    <CustomNodeWrapper
      id={id}
      selected={selected}
      data={nodeData}
      categoryName="Knowledge RAG"
    >
      <div className="space-y-2.5">
        {/* Knowledge Source Selection */}
        <div className="space-y-1">
          <label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider flex items-center gap-1">
            <Database className="w-3 h-3" />
            <span>Workspace Knowledge Source</span>
          </label>
          <LauncherSelect
            value={nodeData.config?.docId || "all_workspace"}
            onChange={(val) => updateConfig("docId", val)}
            options={docOptions}
          />
        </div>

        {/* Retrieval Strategy */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-0.5">
            <span className="text-[9.5px] font-medium text-neutral-500 uppercase tracking-wider">Search Mode</span>
            <LauncherSelect
              value={nodeData.config?.searchMode || "semantic"}
              onChange={(val) => updateConfig("searchMode", val)}
              options={searchModeOptions}
            />
          </div>
          <div className="space-y-0.5">
            <span className="text-[9.5px] font-medium text-neutral-500 uppercase tracking-wider">Top Chunks</span>
            <LauncherSelect
              value={String(nodeData.config?.topK || 3)}
              onChange={(val) => updateConfig("topK", parseInt(val))}
              options={topKOptions}
            />
          </div>
        </div>

        {/* Handles */}
        <div className="pt-2 border-t border-neutral-200/60 dark:border-white/[0.08] flex flex-col gap-1.5">
          {/* Inputs */}
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

          {/* Outputs */}
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
