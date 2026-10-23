"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  ReactFlow,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  ReactFlowProvider,
  useReactFlow,
  BackgroundVariant,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { TriggerNode } from "./nodes/TriggerNode";
import { AINode } from "./nodes/AINode";
import { ActionNode } from "./nodes/ActionNode";
import { LogicNode } from "./nodes/LogicNode";
import { OutputNode } from "./nodes/OutputNode";
import { IntegrationNode } from "./nodes/IntegrationNode";
import { CustomCodeNode } from "./nodes/CustomCodeNode";
import { KnowledgeRetrieverNode } from "./nodes/KnowledgeRetrieverNode";
import { ConditionalRouterNode } from "./nodes/ConditionalRouterNode";
import { WebhookTriggerNode } from "./nodes/WebhookTriggerNode";
import { LoopBatchNode } from "./nodes/LoopBatchNode";
import { ScheduleTriggerNode } from "./nodes/ScheduleTriggerNode";
import { NoteNode } from "./nodes/NoteNode";
import { GoogleSheetsNode } from "./nodes/GoogleSheetsNode";
import { GoogleDocsNode } from "./nodes/GoogleDocsNode";
import { GoogleSlidesNode } from "./nodes/GoogleSlidesNode";
import { GoogleDriveNode } from "./nodes/GoogleDriveNode";
import { WhatsAppNode } from "./nodes/WhatsAppNode";
import dynamic from "next/dynamic";
import { NodePalette } from "./NodePalette";
import { FlowHeader } from "./FlowHeader";
import { STARTER_TEMPLATES } from "./starterTemplates";
import { AutomationNode, AutomationEdge, StarterTemplate, ExecutionResult } from "./types";
import type { GlobalVariable } from "./GlobalVariablesModal";
import { useTheme } from "next-themes";
import { Maximize2, ZoomIn, ZoomOut, Plus, Undo2, Redo2 } from "lucide-react";

// Lazy loaded modals & drawers for optimal initial bundle & 60fps performance
const RunPlaygroundDrawer = dynamic(
  () => import("./RunPlaygroundDrawer").then((mod) => mod.RunPlaygroundDrawer),
  { ssr: false }
);
const ApiCodeModal = dynamic(
  () => import("./ApiCodeModal").then((mod) => mod.ApiCodeModal),
  { ssr: false }
);
const ExportImportModal = dynamic(
  () => import("./ExportImportModal").then((mod) => mod.ExportImportModal),
  { ssr: false }
);
const GlobalVariablesModal = dynamic(
  () => import("./GlobalVariablesModal").then((mod) => mod.GlobalVariablesModal),
  { ssr: false }
);
const FlowTemplateMarketplace = dynamic(
  () => import("./FlowTemplateMarketplace").then((mod) => mod.FlowTemplateMarketplace),
  { ssr: false }
);
const AutomationTutorialModal = dynamic(
  () => import("./AutomationTutorialModal").then((mod) => mod.AutomationTutorialModal),
  { ssr: false }
);

const nodeTypes = {
  triggerNode: TriggerNode,
  aiNode: AINode,
  actionNode: ActionNode,
  logicNode: LogicNode,
  outputNode: OutputNode,
  integrationNode: IntegrationNode,
  customCodeNode: CustomCodeNode,
  knowledgeNode: KnowledgeRetrieverNode,
  conditionalRouterNode: ConditionalRouterNode,
  webhookTriggerNode: WebhookTriggerNode,
  loopBatchNode: LoopBatchNode,
  scheduleTriggerNode: ScheduleTriggerNode,
  noteNode: NoteNode,
  googleSheetsNode: GoogleSheetsNode,
  googleDocsNode: GoogleDocsNode,
  googleSlidesNode: GoogleSlidesNode,
  googleDriveNode: GoogleDriveNode,
  whatsappNode: WhatsAppNode,
};

// ─── Undo/Redo History ───────────────────────────────────────────────
interface HistoryEntry {
  nodes: AutomationNode[];
  edges: AutomationEdge[];
}

const MAX_HISTORY = 50;

function AutomationCanvas() {
  const { theme } = useTheme();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition, fitView, zoomIn, zoomOut } = useReactFlow();

  const defaultTemplate = STARTER_TEMPLATES[0];

  const [nodes, setNodes, onNodesChange] = useNodesState<AutomationNode>(defaultTemplate.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<AutomationEdge>(defaultTemplate.edges);
  const [flowName, setFlowName] = useState<string>(defaultTemplate.title);
  const [flowId, setFlowId] = useState<string>(`flow-${Date.now()}`);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [runnerOpen, setRunnerOpen] = useState(false);
  const [apiModalOpen, setApiModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [globalVarsModalOpen, setGlobalVarsModalOpen] = useState(false);
  const [templateMarketplaceOpen, setTemplateMarketplaceOpen] = useState(false);
  const [tutorialModalOpen, setTutorialModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Check if first-time user to show tutorial
  useEffect(() => {
    try {
      const hasSeenTutorial = localStorage.getItem("launcher_automation_tutorial_seen");
      if (!hasSeenTutorial) {
        setTutorialModalOpen(true);
        localStorage.setItem("launcher_automation_tutorial_seen", "true");
      }
    } catch {}
  }, []);

  // ─── Global Variables Store ──────────────────────────────────────
  const [globalVariables, setGlobalVariables] = useState<GlobalVariable[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("launcher_automation_global_vars");
      if (stored) {
        setGlobalVariables(JSON.parse(stored));
      }
    } catch {}
  }, []);

  // ─── Canvas Auto-Restore on Mount ───────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem("launcher_automation_current_flow");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.nodes && Array.isArray(parsed.nodes) && parsed.nodes.length > 0) {
          setNodes(parsed.nodes);
          setEdges(parsed.edges || []);
          if (parsed.flowName) setFlowName(parsed.flowName);
          if (parsed.flowId) setFlowId(parsed.flowId);
          historyRef.current = [{ nodes: parsed.nodes, edges: parsed.edges || [] }];
          historyIndexRef.current = 0;
          setTimeout(() => fitView({ padding: 0.25, duration: 250 }), 80);
        }
      }
    } catch {}
  }, [fitView, setNodes, setEdges]);

  // ─── Canvas Debounced Auto-Persistence ──────────────────────────
  useEffect(() => {
    if (nodes.length === 0 && edges.length === 0) return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(
          "launcher_automation_current_flow",
          JSON.stringify({ flowId, flowName, nodes, edges })
        );
      } catch {}
    }, 600);
    return () => clearTimeout(timer);
  }, [flowId, flowName, nodes, edges]);

  // ─── Undo/Redo Stack (Feature #2) ───────────────────────────────
  const historyRef = useRef<HistoryEntry[]>([{ nodes: defaultTemplate.nodes, edges: defaultTemplate.edges }]);
  const historyIndexRef = useRef(0);
  const isUndoRedoRef = useRef(false);

  const pushHistory = useCallback((newNodes: AutomationNode[], newEdges: AutomationEdge[]) => {
    if (isUndoRedoRef.current) {
      isUndoRedoRef.current = false;
      return;
    }
    const history = historyRef.current;
    const index = historyIndexRef.current;
    // Truncate forward history
    historyRef.current = history.slice(0, index + 1);
    historyRef.current.push({ nodes: newNodes, edges: newEdges });
    if (historyRef.current.length > MAX_HISTORY) {
      historyRef.current = historyRef.current.slice(-MAX_HISTORY);
    }
    historyIndexRef.current = historyRef.current.length - 1;
  }, []);

  const canUndo = historyIndexRef.current > 0;
  const canRedo = historyIndexRef.current < historyRef.current.length - 1;

  const handleUndo = useCallback(() => {
    if (historyIndexRef.current <= 0) return;
    isUndoRedoRef.current = true;
    historyIndexRef.current -= 1;
    const entry = historyRef.current[historyIndexRef.current];
    setNodes(entry.nodes);
    setEdges(entry.edges);
  }, [setNodes, setEdges]);

  const handleRedo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    isUndoRedoRef.current = true;
    historyIndexRef.current += 1;
    const entry = historyRef.current[historyIndexRef.current];
    setNodes(entry.nodes);
    setEdges(entry.edges);
  }, [setNodes, setEdges]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Connection Handler
  const onConnect = useCallback(
    (params: Connection) => {
      setHasUnsavedChanges(true);
      setEdges((eds) => {
        const newEdges = addEdge(
          {
            ...params,
            type: "smoothstep",
            animated: false,
            style: { stroke: "#737373", strokeWidth: 1.5 },
          },
          eds
        );
        pushHistory(nodes, newEdges);
        return newEdges;
      });
    },
    [setEdges, nodes, pushHistory]
  );

  // Drag over handler for canvas
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  // Drop handler to insert node from palette
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const rawData = event.dataTransfer.getData("application/reactflow");
      if (!rawData) return;

      try {
        const item = JSON.parse(rawData);
        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });

        const newNode: AutomationNode = {
          id: `node-${Date.now()}`,
          type: item.type,
          position,
          data: {
            label: item.label,
            category: item.category,
            nodeType: item.nodeType,
            description: item.description,
            config: item.defaultConfig,
            inputs: item.inputs || [],
            outputs: item.outputs || [],
            status: "idle",
          },
        };

        setNodes((nds) => {
          const updated = nds.concat(newNode);
          pushHistory(updated, edges);
          return updated;
        });
        setHasUnsavedChanges(true);
      } catch (err) {
        console.error("Failed to drop node:", err);
      }
    },
    [screenToFlowPosition, setNodes, edges, pushHistory]
  );

  // Click handler to insert node directly
  const handleAddNodeFromPalette = useCallback(
    (item: any) => {
      const newNode: AutomationNode = {
        id: `node-${Date.now()}`,
        type: item.type,
        position: {
          x: 350 + Math.random() * 50,
          y: 180 + Math.random() * 50,
        },
        data: {
          label: item.label,
          category: item.category,
          nodeType: item.nodeType,
          description: item.description,
          config: item.defaultConfig,
          inputs: item.inputs || [],
          outputs: item.outputs || [],
          status: "idle",
        },
      };

      setNodes((nds) => {
        const updated = nds.concat(newNode);
        pushHistory(updated, edges);
        return updated;
      });
      setHasUnsavedChanges(true);
    },
    [setNodes, edges, pushHistory]
  );

  // Load Starter Template
  const handleLoadTemplate = useCallback(
    (template: StarterTemplate) => {
      setNodes(template.nodes);
      setEdges(template.edges);
      setFlowName(template.title);
      setHasUnsavedChanges(true);
      pushHistory(template.nodes, template.edges);
      setTimeout(() => fitView({ padding: 0.25, duration: 300 }), 50);
    },
    [setNodes, setEdges, fitView, pushHistory]
  );

  // Clear Canvas
  const handleClearCanvas = useCallback(() => {
    if (confirm("Reset canvas dan kosongkan seluruh node saat ini?")) {
      setNodes([]);
      setEdges([]);
      setHasUnsavedChanges(true);
      pushHistory([], []);
      try {
        localStorage.removeItem("launcher_automation_current_flow");
      } catch {}
    }
  }, [setNodes, setEdges, pushHistory]);

  // Save Flow
  const handleSaveFlow = async () => {
    setIsSaving(true);
    try {
      await fetch("/api/automation/flows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: flowId,
          name: flowName,
          nodes,
          edges,
          globalVariables,
        }),
      });
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Update single node status with lastOutput & message
  const updateNodeStatus = useCallback(
    (nodeId: string, status: "idle" | "running" | "success" | "error", message?: string, output?: any) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                status,
                statusMessage: message || node.data.statusMessage,
                lastOutput: output !== undefined ? output : node.data.lastOutput,
              },
            };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  // Reset all node statuses
  const resetAllNodeStatuses = useCallback(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          status: "idle",
        },
      }))
    );
  }, [setNodes]);

  const handleImportFlow = (imported: { name: string; nodes: AutomationNode[]; edges: AutomationEdge[] }) => {
    setFlowName(imported.name);
    setNodes(imported.nodes);
    setEdges(imported.edges);
    setHasUnsavedChanges(true);
    pushHistory(imported.nodes, imported.edges);
    setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 80);
  };

  const isDark = theme === "dark";

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#faf9f6] dark:bg-[#090909] text-neutral-900 dark:text-neutral-100 font-sans select-none">
      {/* Top Navbar */}
      <FlowHeader
        flowName={flowName}
        setFlowName={(name) => {
          setFlowName(name);
          setHasUnsavedChanges(true);
        }}
        onSave={handleSaveFlow}
        onRun={() => {
          resetAllNodeStatuses();
          setRunnerOpen(true);
        }}
        onLoadTemplate={handleLoadTemplate}
        onClear={handleClearCanvas}
        onOpenApiModal={() => setApiModalOpen(true)}
        onOpenExportModal={() => setExportModalOpen(true)}
        onOpenImportModal={() => setImportModalOpen(true)}
        onOpenGlobalVars={() => setGlobalVarsModalOpen(true)}
        onOpenTemplateMarketplace={() => setTemplateMarketplaceOpen(true)}
        onOpenTutorial={() => setTutorialModalOpen(true)}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
        isSaving={isSaving}
        isRunning={isRunning}
        hasUnsavedChanges={hasUnsavedChanges}
        globalVarsCount={globalVariables.length}
      />

      {/* Main Flow Canvas Area */}
      <div className="flex-1 relative w-full h-[calc(100vh-56px)] overflow-hidden" ref={reactFlowWrapper}>
        {/* Node Library Palette */}
        <NodePalette
          isOpen={paletteOpen}
          onToggle={() => setPaletteOpen(!paletteOpen)}
          onAddNode={handleAddNodeFromPalette}
        />

        {/* React Flow Infinite Canvas */}
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeDragStop={(_, node) => {
            setHasUnsavedChanges(true);
            pushHistory(nodes, edges);
          }}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          colorMode={isDark ? "dark" : "light"}
          onlyRenderVisibleElements={true}
          defaultEdgeOptions={{
            type: "smoothstep",
            animated: false,
            style: { stroke: "#737373", strokeWidth: 1.5 },
          }}
          className="bg-[#faf9f6] dark:bg-[#090909]"
        >
          {/* Dot Grid */}
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1.2}
            color={isDark ? "#222222" : "#e5e5e5"}
          />

          {/* Minimal Floating Canvas Controls (Bottom Center) */}
          <Panel position="bottom-center" className="mb-4">
            <div className="flex items-center gap-1 p-1 rounded-[8px] bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 shadow-md">
              <button
                type="button"
                onClick={() => setPaletteOpen(!paletteOpen)}
                className="h-7 px-2.5 rounded-[5px] bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-950 text-xs font-semibold flex items-center gap-1 hover:bg-neutral-800 dark:hover:bg-white transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Node</span>
              </button>

              <div className="h-3.5 w-[1px] bg-neutral-200 dark:bg-neutral-800 mx-0.5" />

              {/* Undo */}
              <button
                type="button"
                onClick={handleUndo}
                disabled={!canUndo}
                title="Undo (Ctrl+Z)"
                className="w-7 h-7 rounded-[5px] hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>

              {/* Redo */}
              <button
                type="button"
                onClick={handleRedo}
                disabled={!canRedo}
                title="Redo (Ctrl+Shift+Z)"
                className="w-7 h-7 rounded-[5px] hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Redo2 className="w-3.5 h-3.5" />
              </button>

              <div className="h-3.5 w-[1px] bg-neutral-200 dark:bg-neutral-800 mx-0.5" />

              <button
                type="button"
                onClick={() => zoomIn({ duration: 150 })}
                title="Zoom In"
                className="w-7 h-7 rounded-[5px] hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 flex items-center justify-center transition-colors cursor-pointer"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => zoomOut({ duration: 150 })}
                title="Zoom Out"
                className="w-7 h-7 rounded-[5px] hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 flex items-center justify-center transition-colors cursor-pointer"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => fitView({ padding: 0.2, duration: 300 })}
                title="Fit View"
                className="w-7 h-7 rounded-[5px] hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 flex items-center justify-center transition-colors cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </Panel>
        </ReactFlow>

        {/* Live Execution Drawer */}
        <RunPlaygroundDrawer
          isOpen={runnerOpen}
          onClose={() => setRunnerOpen(false)}
          nodes={nodes}
          edges={edges}
          onExecuteStart={() => setIsRunning(true)}
          onExecuteEnd={() => setIsRunning(false)}
          updateNodeStatus={updateNodeStatus}
        />

        {/* API & Code Generator Modal */}
        <ApiCodeModal
          isOpen={apiModalOpen}
          onClose={() => setApiModalOpen(false)}
          flowName={flowName}
          flowId={flowId}
          nodes={nodes}
          edges={edges}
        />

        {/* Export / Import JSON Modal */}
        <ExportImportModal
          isOpen={exportModalOpen || importModalOpen}
          mode={exportModalOpen ? "export" : "import"}
          onClose={() => {
            setExportModalOpen(false);
            setImportModalOpen(false);
          }}
          flowName={flowName}
          nodes={nodes}
          edges={edges}
          onImportFlow={handleImportFlow}
        />

        {/* Global Variables Store Modal */}
        <GlobalVariablesModal
          isOpen={globalVarsModalOpen}
          onClose={() => setGlobalVarsModalOpen(false)}
          variables={globalVariables}
          onUpdateVariables={setGlobalVariables}
        />

        {/* Flow Template Marketplace Modal */}
        <FlowTemplateMarketplace
          isOpen={templateMarketplaceOpen}
          onClose={() => setTemplateMarketplaceOpen(false)}
          onLoadTemplate={handleLoadTemplate}
        />

        {/* Beginner Guide & Interactive Tutorial Modal */}
        <AutomationTutorialModal
          isOpen={tutorialModalOpen}
          onClose={() => setTutorialModalOpen(false)}
          onLoadStarterTemplate={() => handleLoadTemplate(STARTER_TEMPLATES[0])}
        />
      </div>
    </div>
  );
}

export function AutomationStudio() {
  return (
    <ReactFlowProvider>
      <AutomationCanvas />
    </ReactFlowProvider>
  );
}
