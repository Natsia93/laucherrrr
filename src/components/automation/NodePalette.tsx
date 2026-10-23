"use client";

import React, { useState } from "react";
import { Search, Plus, X, ChevronLeft, ChevronRight } from "lucide-react";
import { NodeCategory } from "./types";

interface PaletteItem {
  type: string;
  category: NodeCategory;
  nodeType: string;
  label: string;
  description: string;
  defaultConfig: Record<string, any>;
  inputs?: { id: string; label: string; type: any }[];
  outputs?: { id: string; label: string; type: any }[];
}

const PALETTE_ITEMS: PaletteItem[] = [
  // Triggers
  {
    type: "triggerNode",
    category: "trigger",
    nodeType: "manual_input",
    label: "Manual Prompt Input",
    description: "Accepts raw text or prompt entered by user",
    defaultConfig: {
      placeholder: "Ketik teks masukan rapat atau topik...",
      defaultText: "",
    },
    outputs: [{ id: "text_out", label: "Text", type: "text" }],
  },
  {
    type: "triggerNode",
    category: "trigger",
    nodeType: "schedule_cron",
    label: "Schedule (Cron)",
    description: "Runs automatically on recurring schedule",
    defaultConfig: { frequency: "daily_9am" },
    outputs: [{ id: "trigger_out", label: "Trigger Signal", type: "text" }],
  },
  {
    type: "triggerNode",
    category: "trigger",
    nodeType: "webhook",
    label: "Event Trigger",
    description: "Fires when document or to-do is created",
    defaultConfig: { event: "document_created" },
    outputs: [{ id: "event_out", label: "Event Data", type: "json" }],
  },

  // AI Intelligence
  {
    type: "aiNode",
    category: "ai",
    nodeType: "llm_generate",
    label: "AI LLM Generator",
    description: "Processes text with Gemini / Claude / GPT",
    defaultConfig: {
      model: "gemini-2.5-flash",
      temperature: 0.3,
      systemPrompt: "Rangkum dan ekstrak poin-poin utama secara terstruktur.",
    },
    inputs: [{ id: "prompt_in", label: "Input Context", type: "text" }],
    outputs: [
      { id: "text_out", label: "AI Result", type: "text" },
      { id: "json_out", label: "Structured JSON", type: "json" },
    ],
  },
  {
    type: "aiNode",
    category: "ai",
    nodeType: "deck_creator",
    label: "AI Deck Outline Generator",
    description: "Generates modern presentation slide structures",
    defaultConfig: {
      model: "gemini-2.5-flash",
      slideCount: 6,
      stylePreset: "modern_dark",
    },
    inputs: [{ id: "topic_in", label: "Topic", type: "text" }],
    outputs: [{ id: "deck_out", label: "Slide Deck", type: "deck" }],
  },
  {
    type: "aiNode",
    category: "ai",
    nodeType: "prompt_template",
    label: "Prompt Template Composer",
    description: "Merges variables into structured prompt",
    defaultConfig: {
      template: "Sebagai konsultan bisnis, buatkan rekomendasi untuk {topic} dengan target {audience}.",
    },
    inputs: [
      { id: "var_topic", label: "topic", type: "text" },
      { id: "var_audience", label: "audience", type: "text" },
    ],
    outputs: [{ id: "prompt_out", label: "Composed Prompt", type: "text" }],
  },
  {
    type: "knowledgeNode",
    category: "ai",
    nodeType: "knowledge_retriever",
    label: "Workspace Knowledge RAG",
    description: "Grounds AI with your workspace documents & strategy briefs",
    defaultConfig: {
      docId: "all_workspace",
      searchMode: "semantic",
      topK: 3,
    },
    inputs: [{ id: "query_in", label: "Query", type: "text" }],
    outputs: [{ id: "context_out", label: "Retrieved Knowledge", type: "text" }],
  },

  // Launcher OS Actions
  {
    type: "actionNode",
    category: "action",
    nodeType: "create_document",
    label: "Create Launcher Document",
    description: "Saves generated text to Workspace library",
    defaultConfig: { docType: "Strategy Brief" },
    inputs: [{ id: "content_in", label: "Content", type: "text" }],
    outputs: [{ id: "doc_out", label: "Saved Document", type: "document" }],
  },
  {
    type: "actionNode",
    category: "action",
    nodeType: "create_todo",
    label: "Add Launcher To-Do",
    description: "Adds task directly to your To-Do checklist",
    defaultConfig: {
      taskTitle: "Action Item Baru dari Automation",
      priority: "High",
    },
    inputs: [{ id: "task_in", label: "Task Text", type: "text" }],
    outputs: [{ id: "todo_out", label: "Created To-Do", type: "todo" }],
  },
  {
    type: "actionNode",
    category: "action",
    nodeType: "create_calendar",
    label: "Schedule Calendar Event",
    description: "Books event slot on Google Calendar",
    defaultConfig: {
      eventTitle: "Meeting Baru dari Automation",
      category: "meeting",
      durationMinutes: 60,
    },
    inputs: [{ id: "details_in", label: "Event Details", type: "text" }],
    outputs: [{ id: "event_out", label: "Calendar Event", type: "calendar" }],
  },
  {
    type: "actionNode",
    category: "action",
    nodeType: "update_scratchpad",
    label: "Update Scratchpad",
    description: "Syncs note into your Overview Scratchpad",
    defaultConfig: { mode: "append" },
    inputs: [{ id: "note_in", label: "Note Text", type: "text" }],
    outputs: [{ id: "scratch_out", label: "Updated Note", type: "text" }],
  },

  // Logic
  {
    type: "logicNode",
    category: "logic",
    nodeType: "condition_router",
    label: "Condition (If / Else)",
    description: "Branches execution based on content or rules",
    defaultConfig: { condition: "contains_keyword" },
    inputs: [{ id: "eval_in", label: "Input", type: "any" }],
    outputs: [
      { id: "true_out", label: "If True", type: "any" },
      { id: "false_out", label: "If False", type: "any" },
    ],
  },
  {
    type: "logicNode",
    category: "logic",
    nodeType: "data_formatter",
    label: "JSON Formatter",
    description: "Transforms text to JSON or Markdown",
    defaultConfig: { mode: "to_json" },
    inputs: [{ id: "raw_in", label: "Raw Data", type: "any" }],
    outputs: [{ id: "formatted_out", label: "Formatted", type: "json" }],
  },
  {
    type: "customCodeNode",
    category: "logic",
    nodeType: "custom_code",
    label: "JavaScript Function",
    description: "Execute custom JS data transformations & regex in ES6 sandbox",
    defaultConfig: {
      code: "// Transform input data\nreturn {\n  formatted: String(input).trim(),\n  words: String(input).split(/\\s+/).length,\n};",
    },
    inputs: [{ id: "raw_in", label: "Input Data", type: "any" }],
    outputs: [{ id: "res_out", label: "Output", type: "any" }],
  },

  // Integrations & External Tools
  {
    type: "integrationNode",
    category: "integration",
    nodeType: "slack_webhook",
    label: "Slack Notification",
    description: "Send alerts or messages to Slack channels via incoming webhook",
    defaultConfig: {
      webhookUrl: "",
      channel: "#general",
      botName: "Launcher OS Bot",
    },
    inputs: [{ id: "msg_in", label: "Message Text", type: "text" }],
    outputs: [{ id: "res_out", label: "Status", type: "json" }],
  },
  {
    type: "integrationNode",
    category: "integration",
    nodeType: "telegram_bot",
    label: "Telegram Bot Alert",
    description: "Send instant formatted alerts, summaries, or reports to Telegram chat or group",
    defaultConfig: {
      botToken: "",
      chatId: "",
      parseMode: "Markdown",
      silent: false,
      template: "🚀 *[Launcher OS Alert]*\n\n{{summary}}",
    },
    inputs: [{ id: "msg_in", label: "Message Text", type: "text" }],
    outputs: [{ id: "res_out", label: "Status", type: "json" }],
  },
  {
    type: "integrationNode",
    category: "integration",
    nodeType: "web_search",
    label: "Live Web Search",
    description: "Fetches live real-time internet data and search grounding",
    defaultConfig: {
      query: "",
      maxResults: 4,
    },
    inputs: [{ id: "query_in", label: "Search Query", type: "text" }],
    outputs: [{ id: "search_out", label: "Search Grounding", type: "text" }],
  },
  {
    type: "integrationNode",
    category: "integration",
    nodeType: "http_request",
    label: "HTTP Request / Webhook",
    description: "Trigger Zapier, Make, n8n, Discord or any REST API endpoint",
    defaultConfig: {
      method: "POST",
      url: "",
    },
    inputs: [{ id: "payload_in", label: "Payload In", type: "json" }],
    outputs: [{ id: "response_out", label: "API Response", type: "json" }],
  },
  {
    type: "integrationNode",
    category: "integration",
    nodeType: "send_email",
    label: "Email Dispatcher",
    description: "Send automated reports or notifications to colleague emails",
    defaultConfig: {
      toEmail: "",
      subject: "Launcher OS Automation Report",
    },
    inputs: [{ id: "body_in", label: "Email Body", type: "text" }],
    outputs: [{ id: "status_out", label: "Status", type: "json" }],
  },
  {
    type: "googleSheetsNode",
    category: "integration",
    nodeType: "google_sheets",
    label: "Google Sheets Connector",
    description: "Read, append, or update rows directly in Google Spreadsheets",
    defaultConfig: {
      operation: "read_rows",
      spreadsheetId: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
      sheetName: "Sheet1",
      limit: 10,
    },
    inputs: [{ id: "trigger_in", label: "Trigger / Data", type: "any" }],
    outputs: [
      { id: "rows_out", label: "Sheet Rows / Record", type: "json" },
      { id: "status_out", label: "Status", type: "text" },
    ],
  },
  {
    type: "googleDocsNode",
    category: "integration",
    nodeType: "google_docs",
    label: "Google Docs Connector",
    description: "Create, append, or sync structured document reports to Google Docs",
    defaultConfig: {
      operation: "create_document",
      documentTitle: "Laporan_Eksekutif_{{timestamp}}",
      template: "Executive Report",
    },
    inputs: [{ id: "content_in", label: "Document Content / Text", type: "text" }],
    outputs: [
      { id: "doc_url_out", label: "Google Doc URL", type: "text" },
      { id: "doc_id_out", label: "Document ID", type: "text" },
      { id: "status_out", label: "Status", type: "json" },
    ],
  },
  {
    type: "googleSlidesNode",
    category: "integration",
    nodeType: "google_slides",
    label: "Google Slides Connector",
    description: "Generate, append, or export presentation decks into Google Slides",
    defaultConfig: {
      operation: "create_presentation",
      presentationTitle: "Deck_Master_{{timestamp}}",
      theme: "Institutional Standard",
    },
    inputs: [
      { id: "outline_in", label: "Slide Outline / Deck", type: "any" },
      { id: "title_in", label: "Deck Title", type: "text" },
    ],
    outputs: [
      { id: "presentation_url_out", label: "Presentation URL", type: "text" },
      { id: "presentation_id_out", label: "Presentation ID", type: "text" },
      { id: "status_out", label: "Status", type: "json" },
    ],
  },
  {
    type: "googleDriveNode",
    category: "integration",
    nodeType: "google_drive",
    label: "Google Drive Storage",
    description: "Upload, search, read, or export documents and slides to Google Drive folders",
    defaultConfig: {
      operation: "upload_file",
      folderPath: "Launcher_Exports",
      fileName: "Export_{{timestamp}}.pdf",
    },
    inputs: [
      { id: "file_in", label: "File / Data In", type: "any" },
      { id: "folder_in", label: "Target Folder", type: "text" },
    ],
    outputs: [
      { id: "file_url_out", label: "Drive File URL", type: "text" },
      { id: "file_id_out", label: "Drive File ID", type: "text" },
      { id: "status_out", label: "Status", type: "json" },
    ],
  },
  {
    type: "whatsappNode",
    category: "integration",
    nodeType: "whatsapp_send",
    label: "WhatsApp Messenger",
    description: "Send instant personalized WhatsApp messages via QR Gateway / API",
    defaultConfig: {
      gateway: "fonnte_qr",
      targetPhone: "{{phone}}",
      messageBody: "Halo {{name}}, berikut update dari alur otomatis Launcher OS: {{summary}}",
    },
    inputs: [
      { id: "phone_in", label: "Target Phone", type: "text" },
      { id: "msg_in", label: "Message Body", type: "text" },
    ],
    outputs: [
      { id: "delivery_out", label: "Delivery Status", type: "json" },
      { id: "msg_id_out", label: "Message ID", type: "text" },
    ],
  },

  // Advanced Logic & Router
  {
    type: "conditionalRouterNode",
    category: "logic",
    nodeType: "advanced_router",
    label: "Conditional Router",
    description: "Advanced branching with multiple conditions, regex, expressions, and AND/OR logic",
    defaultConfig: {
      evalMode: "all",
      conditions: [{ id: "cond-1", field: "input", operator: "contains", value: "" }],
    },
    inputs: [{ id: "eval_in", label: "Input", type: "any" }],
    outputs: [
      { id: "true_out", label: "If True", type: "any" },
      { id: "false_out", label: "If False", type: "any" },
    ],
  },

  // Loop & Batch Processing
  {
    type: "loopBatchNode",
    category: "logic",
    nodeType: "loop_batch",
    label: "Loop / Batch Processor",
    description: "Iterate over arrays, lines, CSV rows, or repeat N times with parallel execution",
    defaultConfig: {
      loopMode: "each_line",
      concurrency: "sequential",
      aggregation: "array",
      count: 5,
    },
    inputs: [{ id: "batch_in", label: "Data Input", type: "any" }],
    outputs: [
      { id: "item_out", label: "Current Item", type: "any" },
      { id: "aggregate_out", label: "Aggregated", type: "any" },
    ],
  },

  // Webhook Trigger
  {
    type: "webhookTriggerNode",
    category: "trigger",
    nodeType: "webhook_trigger",
    label: "Webhook Trigger",
    description: "Receive external HTTP requests to trigger this flow from Zapier, Make, or any API",
    defaultConfig: {
      method: "POST",
      webhookId: "",
      authToken: "",
    },
    outputs: [
      { id: "body_out", label: "Request Body", type: "json" },
      { id: "headers_out", label: "Headers", type: "json" },
    ],
  },

  // Scheduled Cron Trigger
  {
    type: "scheduleTriggerNode",
    category: "trigger",
    nodeType: "schedule_trigger",
    label: "Scheduled Cron Trigger",
    description: "Auto-run flow on a recurring schedule with timezone and custom cron expression support",
    defaultConfig: {
      frequency: "daily_9am",
      timezone: "Asia/Jakarta",
      maxRuns: 0,
      cron: "",
    },
    outputs: [
      { id: "schedule_out", label: "Trigger Signal", type: "text" },
      { id: "timestamp_out", label: "Timestamp", type: "text" },
    ],
  },

  // Utility: Sticky Note
  {
    type: "noteNode",
    category: "utility",
    nodeType: "sticky_note",
    label: "Sticky Note",
    description: "Add annotations and documentation to your flow canvas",
    defaultConfig: { note: "" },
  },

  // Output
  {
    type: "outputNode",
    category: "output",
    nodeType: "result_preview",
    label: "Result Previewer",
    description: "Inspects output in live test drawer",
    defaultConfig: {},
    inputs: [{ id: "result_in", label: "Final In", type: "any" }],
  },
  {
    type: "outputNode",
    category: "output",
    nodeType: "export_file",
    label: "Export PPTX / DOCX",
    description: "Compiles output into downloadable file",
    defaultConfig: { format: "PPTX" },
    inputs: [{ id: "file_in", label: "Content In", type: "any" }],
  },
];

interface NodePaletteProps {
  onAddNode: (item: PaletteItem) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function NodePalette({ onAddNode, isOpen, onToggle }: NodePaletteProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    { id: "all", label: "All" },
    { id: "trigger", label: "Trigger" },
    { id: "ai", label: "AI" },
    { id: "action", label: "Action" },
    { id: "integration", label: "Integrations" },
    { id: "logic", label: "Logic" },
    { id: "output", label: "Output" },
    { id: "utility", label: "Utility" },
  ];

  const filteredItems = PALETTE_ITEMS.filter((item) => {
    const matchesSearch =
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const onDragStart = (event: React.DragEvent, item: PaletteItem) => {
    event.dataTransfer.setData("application/reactflow", JSON.stringify(item));
    event.dataTransfer.effectAllowed = "move";
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className="absolute left-4 top-4 z-20 h-8 px-3 rounded-[6px] bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-800 shadow-xs hover:border-neutral-300 dark:hover:border-neutral-700 text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-colors"
      >
        <Plus className="w-3.5 h-3.5 text-neutral-900 dark:text-neutral-100" />
        <span>Add Node</span>
      </button>
    );
  }

  return (
    <div className="absolute left-4 top-4 bottom-4 z-20 w-72 rounded-[8px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121212] shadow-lg flex flex-col overflow-hidden font-sans">
      {/* Header */}
      <div className="px-3.5 py-3 border-b border-neutral-150 dark:border-neutral-800 flex items-center justify-between">
        <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
          Components
        </span>
        <button
          type="button"
          onClick={onToggle}
          title="Close drawer"
          className="p-1 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Search & Tabs */}
      <div className="p-3 border-b border-neutral-150 dark:border-neutral-800 space-y-2">
        <div className="relative">
          <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-7 pl-7 pr-2 text-xs rounded-[5px] border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#1a1a1a] focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 placeholder:text-neutral-400 font-medium"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2 py-0.5 rounded-[4px] text-[10.5px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-semibold"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Node List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
        {filteredItems.map((item, index) => (
          <div
            key={index}
            draggable
            onDragStart={(e) => onDragStart(e, item)}
            onClick={() => onAddNode(item)}
            className="group p-2.5 rounded-[6px] border border-neutral-200/70 dark:border-neutral-800/70 hover:border-neutral-400 dark:hover:border-neutral-600 bg-neutral-50/50 dark:bg-[#161616] hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50 transition-colors cursor-grab active:cursor-grabbing select-none"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                {item.label}
              </span>
              <span className="text-[9.5px] uppercase font-mono text-neutral-400">
                {item.category}
              </span>
            </div>
            <p className="text-[10.5px] text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-0.5 leading-snug">
              {item.description}
            </p>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="text-center py-8 text-neutral-400 text-xs">
            No nodes found.
          </div>
        )}
      </div>
    </div>
  );
}
