export type AgentActionType = 
  | "navigate" 
  | "search"
  | "click" 
  | "type" 
  | "scroll" 
  | "wait" 
  | "screenshot" 
  | "extract" 
  | "narrate" 
  | "play_media"
  | "guide"
  | "point"
  | "finish";

export interface BrowserTab {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  isLoading?: boolean;
}

export interface Coordinates {
  x: number;
  y: number;
}

export interface InteractiveElement {
  index: number;
  tag: string;
  text: string;
  role?: string;
  selector?: string;
  box?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface ActionLogEntry {
  id: string;
  timestamp: number;
  type: AgentActionType;
  title: string;
  detail?: string;
  coordinates?: Coordinates;
  status: "running" | "done" | "error";
  targetElement?: string;
  stepNumber?: number;
}

export interface AgentChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  thought?: string;
  isStreaming?: boolean;
  actionSummary?: string;
  stepCount?: number;
  finalMetrics?: {
    totalSteps: number;
    durationMs: number;
    actionTypes: AgentActionType[];
  };
}

export interface SearchResultItem {
  title: string;
  url: string;
  snippet: string;
  source?: string;
}

export interface ViewportState {
  currentUrl: string;
  title: string;
  searchQuery: string;
  searchResults: SearchResultItem[];
  pageContent?: {
    headline: string;
    sections: { heading?: string; text: string }[];
    author?: string;
    date?: string;
  };
  isLoading: boolean;
  activeTabId: string;
  realScreenshotSrc?: string | null;
  onDemandScreenshot?: string | null;
  activeViewMode?: "browser" | "visual_snapshot";
  isRealDesktopMode?: boolean;
  engine?: "playwright" | "simulator";
  desktopResolution?: { width: number; height: number };
  cursor: {
    x: number | string;
    y: number | string;
    visible: boolean;
    isClicking: boolean;
    label?: string;
  };
}

export interface VoiceConfig {
  provider: "elevenlabs" | "webspeech";
  apiKey: string;
  voiceId: string;
  enabled: boolean;
  autoSpeak: boolean;
}

export interface AgentDecisionAction {
  type: AgentActionType;
  target?: string;
  query?: string;
  text?: string;
  direction?: "up" | "down";
  amount?: number;
  platform?: "youtube" | "spotify";
  keyInsight?: string;
}

export interface AgentDecision {
  thought: string;
  narrate: string;
  action: AgentDecisionAction;
  isCompleted: boolean;
  finalSummary?: string;
  stepNumber?: number;
  confidence?: number;
}
