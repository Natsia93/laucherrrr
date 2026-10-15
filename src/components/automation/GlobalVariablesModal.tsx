"use client";

import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Eye, EyeOff, Key, Variable, Lock, Copy, Check } from "lucide-react";

export interface GlobalVariable {
  id: string;
  key: string;
  value: string;
  type: "text" | "secret" | "number" | "json";
  description?: string;
}

interface GlobalVariablesModalProps {
  isOpen: boolean;
  onClose: () => void;
  variables: GlobalVariable[];
  onUpdateVariables: (vars: GlobalVariable[]) => void;
}

const STORAGE_KEY = "launcher_automation_global_vars";

export function GlobalVariablesModal({
  isOpen,
  onClose,
  variables,
  onUpdateVariables,
}: GlobalVariablesModalProps) {
  const [localVars, setLocalVars] = useState<GlobalVariable[]>(variables);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setLocalVars(variables);
  }, [variables]);

  if (!isOpen) return null;

  const addVariable = () => {
    const newVar: GlobalVariable = {
      id: `var-${Date.now()}`,
      key: "",
      value: "",
      type: "text",
      description: "",
    };
    setLocalVars([...localVars, newVar]);
  };

  const updateVar = (id: string, field: keyof GlobalVariable, value: string) => {
    setLocalVars((prev) =>
      prev.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    );
  };

  const removeVar = (id: string) => {
    setLocalVars((prev) => prev.filter((v) => v.id !== id));
  };

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCopy = (id: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleSave = () => {
    // Filter out empty keys
    const cleaned = localVars.filter((v) => v.key.trim().length > 0);
    onUpdateVariables(cleaned);
    // Persist to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
    } catch {}
    onClose();
  };

  const filtered = localVars.filter(
    (v) =>
      !searchQuery ||
      v.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.description || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl rounded-[10px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121212] shadow-xl overflow-hidden font-sans">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 dark:bg-white flex items-center justify-center">
              <Key className="w-4 h-4 text-white dark:text-neutral-900" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-950 dark:text-neutral-50">
                Global Variables
              </h2>
              <p className="text-[11px] text-neutral-500">
                Shared state & secrets accessible by all nodes
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 pt-4 pb-2">
          <input
            type="text"
            placeholder="Search variables..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8 px-3 text-xs rounded-[6px] border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#1a1a1a] focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 placeholder:text-neutral-400 font-medium"
          />
        </div>

        {/* Variables List */}
        <div className="p-5 space-y-2.5 max-h-[50vh] overflow-y-auto">
          {filtered.length === 0 && localVars.length === 0 && (
            <div className="text-center py-8 text-neutral-400 text-xs space-y-2">
              <Variable className="w-8 h-8 mx-auto text-neutral-300 dark:text-neutral-600" />
              <p>No global variables defined yet.</p>
              <p className="text-[10.5px]">
                Add API keys, secrets, or shared config values.
              </p>
            </div>
          )}

          {filtered.map((v) => (
            <div
              key={v.id}
              className="p-3 rounded-[8px] border border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/40 space-y-2"
            >
              <div className="flex items-center gap-2">
                {/* Key Name */}
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="VARIABLE_KEY"
                    value={v.key}
                    onChange={(e) =>
                      updateVar(v.id, "key", e.target.value.toUpperCase().replace(/\s/g, "_"))
                    }
                    className="w-full h-7 px-2 text-xs font-mono font-bold rounded-[5px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1a1a1a] focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 placeholder:text-neutral-300 dark:placeholder:text-neutral-600"
                  />
                </div>

                {/* Type Selector */}
                <select
                  value={v.type}
                  onChange={(e) => updateVar(v.id, "type", e.target.value)}
                  className="h-7 px-2 text-[10.5px] font-medium rounded-[5px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1a1a1a] focus:outline-none"
                >
                  <option value="text">Text</option>
                  <option value="secret">Secret</option>
                  <option value="number">Number</option>
                  <option value="json">JSON</option>
                </select>

                {/* Actions */}
                <button
                  type="button"
                  onClick={() => handleCopy(v.id, v.value)}
                  className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
                  title="Copy value"
                >
                  {copiedId === v.id ? (
                    <Check className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => removeVar(v.id)}
                  className="p-1 text-neutral-400 hover:text-red-500 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>

              {/* Value */}
              <div className="relative">
                <input
                  type={v.type === "secret" && !revealedIds.has(v.id) ? "password" : "text"}
                  placeholder={v.type === "secret" ? "sk-xxxx..." : "Variable value"}
                  value={v.value}
                  onChange={(e) => updateVar(v.id, "value", e.target.value)}
                  className="w-full h-7 px-2 pr-8 text-xs font-mono rounded-[5px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1a1a1a] focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 placeholder:text-neutral-300 dark:placeholder:text-neutral-600"
                />
                {v.type === "secret" && (
                  <button
                    type="button"
                    onClick={() => toggleReveal(v.id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                  >
                    {revealedIds.has(v.id) ? (
                      <EyeOff className="w-3 h-3" />
                    ) : (
                      <Eye className="w-3 h-3" />
                    )}
                  </button>
                )}
              </div>

              {/* Description */}
              <input
                type="text"
                placeholder="Description (optional)"
                value={v.description || ""}
                onChange={(e) => updateVar(v.id, "description", e.target.value)}
                className="w-full h-6 px-2 text-[10.5px] rounded-[5px] border border-neutral-200/60 dark:border-neutral-800/60 bg-transparent focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 placeholder:text-neutral-300 dark:placeholder:text-neutral-600 text-neutral-500"
              />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <button
            type="button"
            onClick={addVariable}
            className="h-8 px-3 rounded-[6px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1a1a1a] hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>Add Variable</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[10.5px] text-neutral-400 font-mono">
              {localVars.filter((v) => v.key.trim()).length} variables
            </span>
            <button
              type="button"
              onClick={handleSave}
              className="h-8 px-4 rounded-[6px] bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              Save & Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
