import { Node, Edge } from "@xyflow/react";

export type NodeCategory = "trigger" | "ai" | "action" | "logic" | "output" | "integration" | "utility";

export type DataPortType = "text" | "json" | "document" | "deck" | "todo" | "calendar" | "any";

export interface NodePortDef {
  id: string;
  label: string;
  type: DataPortType;
  description?: string;
}

export interface CustomNodeData {
  label: string;
  category: NodeCategory;
  nodeType: string;
  icon?: string;
  description?: string;
  status?: "idle" | "running" | "success" | "error";
  statusMessage?: string;
  config: Record<string, any>;
  inputs?: NodePortDef[];
  outputs?: NodePortDef[];
  [key: string]: any;
}

export type AutomationNode = Node<CustomNodeData>;
export type AutomationEdge = Edge;

export interface StarterTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  badge: string;
  icon: string;
  nodes: AutomationNode[];
  edges: AutomationEdge[];
}

export interface ExecutionLog {
  id: string;
  nodeId: string;
  nodeName: string;
  status: "pending" | "running" | "success" | "error";
  message: string;
  timestamp: string;
  output?: any;
}

export interface ExecutionResult {
  runId: string;
  status: "success" | "error";
  durationMs: number;
  logs: ExecutionLog[];
  finalOutput?: any;
  createdEntities?: {
    documentId?: string;
    documentTitle?: string;
    todoId?: string;
    todoTask?: string;
    calendarEventId?: string;
    calendarTitle?: string;
    scratchpadUpdated?: boolean;
    slackSent?: boolean;
    gmailSent?: boolean;
    httpSent?: boolean;
    searchResultsCount?: number;
  };
}
