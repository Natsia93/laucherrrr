"use client";

import React, { useState } from "react";
import { X, ArrowRight, Search, Sparkles, Zap, FileText, Mail, Globe, BarChart3, Users, Bot } from "lucide-react";
import { StarterTemplate } from "./types";
import { STARTER_TEMPLATES } from "./starterTemplates";

interface FlowTemplateMarketplaceProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadTemplate: (template: StarterTemplate) => void;
}

// Community/marketplace templates that extend the starter templates
const MARKETPLACE_CATEGORIES = [
  { id: "all", label: "All", icon: Sparkles },
  { id: "productivity", label: "Productivity", icon: Zap },
  { id: "content", label: "Content", icon: FileText },
  { id: "communication", label: "Communication", icon: Mail },
  { id: "research", label: "Research", icon: Globe },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "team", label: "Team", icon: Users },
  { id: "agent", label: "AI Agent", icon: Bot },
];

export function FlowTemplateMarketplace({
  isOpen,
  onClose,
  onLoadTemplate,
}: FlowTemplateMarketplaceProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  if (!isOpen) return null;

  const allTemplates = STARTER_TEMPLATES;

  const filtered = allTemplates.filter((t) => {
    const matchesSearch =
      !searchQuery ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-3xl max-h-[80vh] rounded-[10px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121212] shadow-xl overflow-hidden font-sans flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-sm font-bold text-neutral-950 dark:text-neutral-50">
              Flow Templates
            </h2>
            <p className="text-[11px] text-neutral-500">
              Pre-built workflow templates — click to load onto canvas
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search + Categories */}
        <div className="px-5 pt-4 pb-3 border-b border-neutral-100 dark:border-neutral-800/60 space-y-3 shrink-0">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-xs rounded-[6px] border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#1a1a1a] focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 placeholder:text-neutral-400 font-medium"
            />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            {MARKETPLACE_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-[5px] text-[10.5px] font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                    selectedCategory === cat.id
                      ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-semibold"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-5">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-neutral-400 text-xs space-y-2">
              <Search className="w-8 h-8 mx-auto text-neutral-300 dark:text-neutral-600" />
              <p>No templates found matching your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filtered.map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => {
                    onLoadTemplate(tmpl);
                    onClose();
                  }}
                  className="p-4 rounded-[8px] border border-neutral-200/80 dark:border-neutral-800/80 hover:border-neutral-400 dark:hover:border-neutral-600 bg-neutral-50/50 dark:bg-neutral-900/30 hover:bg-neutral-100/60 dark:hover:bg-neutral-800/40 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{tmpl.icon}</span>
                      <div>
                        <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                          {tmpl.title}
                        </h3>
                        <span className="text-[9px] uppercase font-mono text-neutral-400 tracking-wider">
                          {tmpl.category}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors" />
                  </div>
                  <p className="text-[10.5px] text-neutral-500 dark:text-neutral-400 leading-snug line-clamp-2">
                    {tmpl.description}
                  </p>
                  <div className="mt-2.5 flex items-center gap-2 text-[9.5px] text-neutral-400 font-mono">
                    <span>{tmpl.badge}</span>
                    <span>•</span>
                    <span>{tmpl.nodes.length} nodes</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
