"use client";

import React from "react";
import { NodeProps, useReactFlow } from "@xyflow/react";
import { MessageSquare, CheckCircle2 } from "lucide-react";
import { CustomNodeWrapper } from "./CustomNodeWrapper";
import { CustomNodeData } from "../types";
import { LauncherSelect } from "../LauncherSelect";

const GATEWAY_OPTIONS = [
  { value: "fonnte_qr", label: "Fonnte QR Gateway (Instant Scan)" },
  { value: "wablas_qr", label: "Wablas API Gateway" },
  { value: "waha_selfhost", label: "Waha (Open-Source HTTP API)" },
  { value: "meta_cloud", label: "Meta WhatsApp Cloud API (Official)" },
];

export const WhatsAppNode = React.memo(function WhatsAppNode({ id, data, selected }: NodeProps) {
  const { setNodes } = useReactFlow();
  const nodeData = data as unknown as CustomNodeData;
  const config = nodeData.config || {};
  const gateway = config.gateway || "fonnte_qr";
  const targetPhone = config.targetPhone || "{{phone}}";
  const messageBody = config.messageBody || "Halo {{name}}, terima kasih telah menghubungi tim kami. Berikut update alur otomatis Anda: {{summary}}";

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
        {/* Gateway Selection */}
        <div>
          <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
            WhatsApp Gateway Provider
          </label>
          <LauncherSelect
            value={gateway}
            onChange={(val) => updateConfig("gateway", val)}
            options={GATEWAY_OPTIONS}
            placeholder="Select provider..."
          />
        </div>

        {/* Target Phone */}
        <div>
          <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
            Target Phone Number / Variable
          </label>
          <div className="relative">
            <input
              type="text"
              value={targetPhone}
              onChange={(e) => updateConfig("targetPhone", e.target.value)}
              placeholder="e.g. 08123456789 or {{phone}}"
              className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
            />
          </div>
          <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1">
            Tips: Gunakan format internasional (+62) atau tag dinamis {"{{phone}}"}
          </p>
        </div>

        {/* Message Template / Body */}
        <div>
          <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
            Message Body (Supports AI Tags)
          </label>
          <textarea
            rows={3}
            value={messageBody}
            onChange={(e) => updateConfig("messageBody", e.target.value)}
            placeholder="Ketik template pesan WhatsApp di sini..."
            className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 text-xs font-sans focus:outline-none focus:ring-1 focus:ring-emerald-500/50 resize-none leading-relaxed"
          />
        </div>

        {/* Gateway Device Status */}
        <div className="p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>WA Device: Online</span>
          </div>
          <span className="text-[10px] text-neutral-400 font-mono">Status: Connected</span>
        </div>
      </div>
    </CustomNodeWrapper>
  );
});

WhatsAppNode.displayName = "WhatsAppNode";
