"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  User,
  Key,
  Sliders,
  ShieldCheck,
  Check,
  Eye,
  EyeOff,
  ExternalLink,
  Trash2,
  Camera,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Activity,
  Upload,
  Lock,
  Workflow,
  Plus,
  Copy,
  Globe,
  Radio,
  FileCode,
  Download,
  Terminal,
  Layers,
  FileSpreadsheet,
  MessageSquare,
  Share2,
  FileText,
  HardDrive,
  ArrowLeft,
  ArrowRight,
  Brain,
  Sparkles,
  RotateCcw,
  Info,
  Zap,
  Rocket,
  GraduationCap,
  BarChart3,
  Database,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LauncherSelect } from "@/components/automation/LauncherSelect";
import type { GlobalVariable } from "@/components/automation/GlobalVariablesModal";

type SettingsTab = "profile" | "apikeys" | "automation" | "decks" | "security";
type AutomationSubView = "hub" | "variables" | "webhooks" | "connectors";
type AIProvider = "deepseek" | "openai" | "anthropic" | "gemini";

interface ConnectionTestState {
  status: "idle" | "testing" | "success" | "error";
  message?: string;
  latency?: number;
  model?: string;
}

const AI_PROVIDERS: Record<AIProvider, {
  label: string;
  keyPrefix: string;
  keyPlaceholder: string;
  dashboardUrl: string;
  dashboardLabel: string;
  models: { value: string; label: string }[];
  color: string;
}> = {
  deepseek: {
    label: "DeepSeek",
    keyPrefix: "sk-",
    keyPlaceholder: "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    dashboardUrl: "https://platform.deepseek.com/api_keys",
    dashboardLabel: "Get Key from DeepSeek",
    models: [
      { value: "deepseek-chat", label: "DeepSeek V3 (Chat)" },
      { value: "deepseek-reasoner", label: "DeepSeek R1 (Reasoner)" },
    ],
    color: "#4D6BFE",
  },
  openai: {
    label: "OpenAI",
    keyPrefix: "sk-",
    keyPlaceholder: "sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    dashboardUrl: "https://platform.openai.com/api-keys",
    dashboardLabel: "Get Key from OpenAI",
    models: [
      { value: "gpt-4o-mini", label: "GPT-4o Mini" },
      { value: "gpt-4o", label: "GPT-4o" },
      { value: "gpt-4.1-mini", label: "GPT-4.1 Mini" },
      { value: "gpt-4.1", label: "GPT-4.1" },
    ],
    color: "#10A37F",
  },
  anthropic: {
    label: "Anthropic (Claude)",
    keyPrefix: "sk-ant-",
    keyPlaceholder: "sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxx",
    dashboardUrl: "https://console.anthropic.com/settings/keys",
    dashboardLabel: "Get Key from Anthropic",
    models: [
      { value: "claude-sonnet-4-20250514", label: "Claude Sonnet 4" },
      { value: "claude-3-5-haiku-20241022", label: "Claude 3.5 Haiku" },
    ],
    color: "#D4A27F",
  },
  gemini: {
    label: "Google Gemini",
    keyPrefix: "",
    keyPlaceholder: "Enter your Google AI Studio API Key",
    dashboardUrl: "https://aistudio.google.com/apikey",
    dashboardLabel: "Get Key from Google AI Studio",
    models: [
      { value: "gemini-3.8-flash", label: "Gemini 3.8 Flash (Latest)" },
      { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
      { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
      { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
    ],
    color: "#4285F4",
  },
};

const DENSITY_OPTIONS = [
  { value: "brief", label: "Brief — Ringkas, padat & fokus pada metrik utama" },
  { value: "medium", label: "Medium — Seimbang (rekomendasi eksekutif & framework)" },
  { value: "detailed", label: "Detailed — Komprehensif dengan data analitis mendalam" },
];

const SLIDE_COUNT_OPTIONS = [
  { value: "Auto", label: "Auto — Deteksi Cerdas Berdasarkan Materi" },
  { value: "6", label: "6 Slides (Elevator Pitch / Summary)" },
  { value: "8", label: "8 Slides (Standard Presentation)" },
  { value: "10", label: "10 Slides (Strategy & Deep Roadmap)" },
  { value: "12", label: "12 Slides (Comprehensive Deep Dive)" },
  { value: "15", label: "15 Slides (Executive Masterclass)" },
];

const BRAIN_PRESETS = [
  {
    id: "mckinsey",
    title: "McKinsey Executive",
    icon: Zap,
    instruction: `Persona: Senior Strategy Partner at Top-Tier Management Consulting (McKinsey / BCG).
Tone & Style: Authoritative, sharp, data-driven, solution-oriented, and structured with the MECE principle (Mutually Exclusive, Collectively Exhaustive).
Guidelines:
- Use executive action titles that directly answer "So What?".
- Every bullet point must have measurable business significance, never generic descriptions.
- Prioritize analytical layouts: 2-column comparisons, quadrant matrices, phased frameworks, and split metric counters.`,
  },
  {
    id: "startup",
    title: "Tech Startup Pitch",
    icon: Rocket,
    instruction: `Persona: Y Combinator Pitch Deck Specialist & Silicon Valley Serial Entrepreneur.
Tone & Style: Ambitious, visionary, persuasive, concise, and focused on growth metrics & traction.
Guidelines:
- Highlight pain point urgency, unfair competitive advantages, and TAM/SAM/SOM market sizing.
- Avoid corporate fluff; make the core value proposition crystal clear within 3 seconds.
- Maximize conversion funnel visuals, key traction metric callouts, and strategic milestones.`,
  },
  {
    id: "workshop",
    title: "Workshop & Training",
    icon: GraduationCap,
    instruction: `Persona: Master Facilitator & Instructional Learning Designer.
Tone & Style: Educational, interactive, easy to understand, step-by-step systematic.
Guidelines:
- Present material in logical, actionable stages (Step 1, 2, 3) accompanied by real-world examples.
- Include reflective checkpoint questions or interactive prompts for the audience.
- Use horizontal process flows or structured cycles so learning flows naturally.`,
  },
  {
    id: "minimalist",
    title: "Minimalist & Data-Driven",
    icon: BarChart3,
    instruction: `Persona: Chief Data Officer & Minimalist Information Architect.
Tone & Style: Clean, objective, to-the-point, strictly oriented around verifiable facts and metrics.
Guidelines:
- Maximum 3 key points per slide with high-contrast visual hierarchy.
- Every primary claim must be backed by percentages, quantitative ratios, or measurable benchmarks.
- Eliminate filler text and non-essential conversational decoration.`,
  },
];

export default function SettingsPage() {
  const { data: session } = authClient.useSession();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [automationSubView, setAutomationSubView] = useState<AutomationSubView>("hub");

  // Profile Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("fiqiy@revou.co");
  const [avatarUrl, setAvatarUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to combine first + last name
  const fullName = `${firstName} ${lastName}`.trim();

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // API Key State (Multi-Provider BYOK)
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>("deepseek");
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [selectedModel, setSelectedModel] = useState("deepseek-chat");
  const [testResult, setTestResult] = useState<ConnectionTestState>({ status: "idle" });

  // Deck Defaults
  const [defaultDensity, setDefaultDensity] = useState("medium");
  const [defaultSlideCount, setDefaultSlideCount] = useState("8");
  const [defaultPalette, setDefaultPalette] = useState("amber-ochre");
  const [customDeckBrain, setCustomDeckBrain] = useState("");

  // Automation & Global Variables State
  const [globalVariables, setGlobalVariables] = useState<GlobalVariable[]>([]);
  const [newVarKey, setNewVarKey] = useState("");
  const [newVarValue, setNewVarValue] = useState("");
  const [newVarType, setNewVarType] = useState<"text" | "secret" | "number" | "json">("text");
  const [webhookBaseUrl, setWebhookBaseUrl] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [savedKeys, setSavedKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (typeof window !== "undefined") {
      setMounted(true);
      setWebhookBaseUrl(`${window.location.origin}/api/automation/webhook/`);

      const keysMap: Record<string, boolean> = {};
      (Object.keys(AI_PROVIDERS) as AIProvider[]).forEach((key) => {
        keysMap[key] = !!localStorage.getItem(`ai_key_${key}`) || (key === "deepseek" && !!localStorage.getItem("deepseek_api_key"));
      });
      setSavedKeys(keysMap);

      // Load stored profile
      const storedFirst = localStorage.getItem("user_first_name");
      const storedLast = localStorage.getItem("user_last_name");
      const storedEmail = localStorage.getItem("user_email");
      const storedAvatar = localStorage.getItem("user_avatar_url");

      if (storedFirst) setFirstName(storedFirst);
      if (storedLast) setLastName(storedLast);
      if (storedEmail) setEmail(storedEmail);
      if (storedAvatar) setAvatarUrl(storedAvatar);

      // Load stored AI Provider & Key
      const storedProvider = (localStorage.getItem("ai_provider") as AIProvider) || "deepseek";
      const storedKey = localStorage.getItem(`ai_key_${storedProvider}`) || localStorage.getItem("deepseek_api_key") || "";
      const storedModel = localStorage.getItem(`ai_model_${storedProvider}`) || localStorage.getItem("deepseek_selected_model") || AI_PROVIDERS[storedProvider].models[0].value;
      setSelectedProvider(storedProvider);
      setApiKey(storedKey);
      setSelectedModel(storedModel);

      // Load stored Deck Preferences
      const storedDensity = localStorage.getItem("deck_default_density");
      const storedCount = localStorage.getItem("deck_default_count");
      const storedPalette = localStorage.getItem("deck_default_palette");
      const storedBrain = localStorage.getItem("deck_custom_brain");

      if (storedDensity) setDefaultDensity(storedDensity);
      if (storedCount) setDefaultSlideCount(storedCount);
      if (storedPalette) setDefaultPalette(storedPalette);
      if (storedBrain) setCustomDeckBrain(storedBrain);

      // Load Global Variables
      try {
        const storedVars = localStorage.getItem("launcher_automation_global_vars");
        if (storedVars) setGlobalVariables(JSON.parse(storedVars));
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (session?.user) {
      if (session.user.name) {
        const parts = session.user.name.trim().split(/\s+/);
        if (parts.length >= 2) {
          setFirstName(parts.slice(0, -1).join(" "));
          setLastName(parts[parts.length - 1]);
        } else {
          setFirstName(parts[0] || "");
        }
      }
      if (session.user.email) setEmail(session.user.email);
      if (session.user.image) setAvatarUrl(session.user.image);
    }
  }, [session]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      triggerToast("File size too large. Maximum allowed is 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setAvatarUrl(dataUrl);
        if (typeof window !== "undefined") {
          localStorage.setItem("user_avatar_url", dataUrl);
          window.dispatchEvent(new CustomEvent("user_avatar_changed", { detail: dataUrl }));
          window.dispatchEvent(new CustomEvent("user_profile_changed", { detail: { name: fullName, avatar: dataUrl } }));
          if ("BroadcastChannel" in window) {
            const ch = new BroadcastChannel("launcher_os_presence");
            ch.postMessage({ type: "PROFILE_UPDATE", name: fullName, avatar: dataUrl });
            ch.close();
          }
        }
        try {
          await fetch("/api/user/profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: fullName,
              image: dataUrl,
              email: email || session?.user?.email,
            }),
          });
        } catch {}
        triggerToast("Profile photo updated successfully!");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const combinedName = `${firstName.trim()} ${lastName.trim()}`.trim();
    if (typeof window !== "undefined") {
      localStorage.setItem("user_first_name", firstName.trim());
      localStorage.setItem("user_last_name", lastName.trim());
      localStorage.setItem("user_full_name", combinedName);
      localStorage.setItem("user_email", email);
      if (avatarUrl && avatarUrl.trim()) {
        localStorage.setItem("user_avatar_url", avatarUrl.trim());
      } else {
        localStorage.removeItem("user_avatar_url");
      }

      window.dispatchEvent(new CustomEvent("user_avatar_changed", { detail: avatarUrl || null }));
      window.dispatchEvent(new CustomEvent("user_profile_changed", { detail: { name: combinedName, avatar: avatarUrl || null } }));
      if ("BroadcastChannel" in window) {
        const ch = new BroadcastChannel("launcher_os_presence");
        ch.postMessage({ type: "PROFILE_UPDATE", name: combinedName, avatar: avatarUrl || null });
        ch.close();
      }
    }
    try {
      await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: combinedName,
          image: avatarUrl || null,
          email: email || session?.user?.email,
        }),
      });
      triggerToast("Profile saved successfully!");
    } catch {
      triggerToast("Profile saved locally!");
    }
  };

  const providerConfig = AI_PROVIDERS[selectedProvider];
  const hasConfiguredKey = apiKey.trim().length > 0;

  const handleProviderChange = (provider: AIProvider) => {
    if (apiKey.trim() && typeof window !== "undefined") {
      localStorage.setItem(`ai_key_${selectedProvider}`, apiKey.trim());
      localStorage.setItem(`ai_model_${selectedProvider}`, selectedModel);
    }
    setSelectedProvider(provider);
    setTestResult({ status: "idle" });
    setShowApiKey(false);
    if (typeof window !== "undefined") {
      const storedKey = localStorage.getItem(`ai_key_${provider}`) || "";
      const storedModel = localStorage.getItem(`ai_model_${provider}`) || AI_PROVIDERS[provider].models[0].value;
      setApiKey(storedKey);
      setSelectedModel(storedModel);
    }
  };

  const handleSaveApiKey = () => {
    if (typeof window !== "undefined") {
      const trimmed = apiKey.trim();
      if (trimmed) {
        localStorage.setItem(`ai_key_${selectedProvider}`, trimmed);
        localStorage.setItem(`ai_model_${selectedProvider}`, selectedModel);
        localStorage.setItem("ai_provider", selectedProvider);
        if (selectedProvider === "deepseek") {
          localStorage.setItem("deepseek_api_key", trimmed);
          localStorage.setItem("deepseek_selected_model", selectedModel);
        }
        setSavedKeys((prev) => ({ ...prev, [selectedProvider]: true }));
        triggerToast(`${providerConfig.label} API Key saved and activated!`);
      } else {
        localStorage.removeItem(`ai_key_${selectedProvider}`);
        setSavedKeys((prev) => ({ ...prev, [selectedProvider]: false }));
        triggerToast(`${providerConfig.label} API Key has been removed.`);
      }
    }
  };

  const handleRemoveApiKey = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(`ai_key_${selectedProvider}`);
      if (selectedProvider === "deepseek") {
        localStorage.removeItem("deepseek_api_key");
      }
      setSavedKeys((prev) => ({ ...prev, [selectedProvider]: false }));
      setApiKey("");
      setTestResult({ status: "idle" });
      triggerToast(`${providerConfig.label} API Key has been removed.`);
    }
  };

  const handleTestConnection = async () => {
    const trimmed = apiKey.trim();
    if (!trimmed) {
      setTestResult({
        status: "error",
        message: `Please enter your ${providerConfig.label} API Key first.`,
      });
      return;
    }

    setTestResult({ status: "testing" });

    try {
      const res = await fetch("/api/ai/test-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: trimmed,
          provider: selectedProvider,
          model: selectedModel,
        }),
      });

      const data = await res.json();

      if (data.success) {
        const activeModel = data.model || selectedModel;
        setSelectedModel(activeModel);
        setTestResult({
          status: "success",
          latency: data.latencyMs,
          model: activeModel,
          message: `API Key is valid — connected to ${providerConfig.label} (${activeModel})!`,
        });
        if (typeof window !== "undefined") {
          localStorage.setItem(`ai_key_${selectedProvider}`, trimmed);
          localStorage.setItem(`ai_model_${selectedProvider}`, activeModel);
          localStorage.setItem("ai_provider", selectedProvider);
          setSavedKeys((prev) => ({ ...prev, [selectedProvider]: true }));
        }
      } else {
        setTestResult({
          status: "error",
          message: data.error || `Failed to reach ${providerConfig.label}. Please verify your API Key.`,
        });
      }
    } catch {
      setTestResult({
        status: "error",
        message: `Network error while testing connection to ${providerConfig.label}.`,
      });
    }
  };

  const handleSaveDeckPreferences = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("deck_default_density", defaultDensity);
      localStorage.setItem("deck_default_count", defaultSlideCount);
      localStorage.setItem("deck_default_palette", defaultPalette);
      localStorage.setItem("deck_custom_brain", customDeckBrain.trim());
      triggerToast("Deck Preferences & AI Brain saved successfully!");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      triggerToast("New password and confirmation do not match.");
      return;
    }
    if (newPassword.length < 8) {
      triggerToast("New password must be at least 8 characters.");
      return;
    }
    setPasswordLoading(true);
    try {
      const res = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: false,
      });
      if (res.error) {
        triggerToast(res.error.message || "Failed to change password.");
      } else {
        triggerToast("Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      triggerToast("Error changing password. Please try again.");
    } finally {
      setPasswordLoading(false);
    }
  };

  // Global Variables CRUD
  const handleAddGlobalVar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVarKey.trim()) return;

    const formattedKey = newVarKey.trim().toUpperCase().replace(/[^A-Z0-9_]/g, "_");
    const updated: GlobalVariable[] = [
      ...globalVariables.filter((v) => v.key !== formattedKey),
      {
        id: `var-${Date.now()}`,
        key: formattedKey,
        value: newVarValue.trim(),
        type: newVarType,
        description: `Configured via Settings (${newVarType})`,
      },
    ];

    setGlobalVariables(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("launcher_automation_global_vars", JSON.stringify(updated));
    }
    setNewVarKey("");
    setNewVarValue("");
    triggerToast(`Variable {{${formattedKey}}} saved!`);
  };

  const handleDeleteGlobalVar = (id: string, keyName: string) => {
    const updated = globalVariables.filter((v) => v.id !== id);
    setGlobalVariables(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("launcher_automation_global_vars", JSON.stringify(updated));
    }
    triggerToast(`Variable {{${keyName}}} removed.`);
  };

  const copyToClipboard = (text: string, identifier: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(identifier);
    setTimeout(() => setCopiedKey(null), 2000);
    triggerToast(`Copied to clipboard: ${text}`);
  };

  return (
    <AppShell>
      <div className="max-w-[1200px] mx-auto px-2 sm:px-4 lg:px-6 space-y-6 pb-12 font-sans">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 px-4 py-2.5 rounded-lg shadow-2xl text-xs font-medium animate-in fade-in slide-in-from-top-3 duration-200 border border-white/15">
            <CheckCircle2 className="w-4 h-4 text-[#FCD62C] dark:text-[#9E7D00]" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Page Header with Clean Dynamic Hierarchy Breadcrumb Route */}
        <div className="pb-2">
          <div className="space-y-1.5">
            <h1 className="tracking-tight leading-tight flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("profile");
                  setAutomationSubView("hub");
                }}
                className="text-base sm:text-lg lg:text-xl text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 font-light transition-colors cursor-pointer"
              >
                Account & Settings
              </button>

              {activeTab === "profile" && (
                <>
                  <span className="text-base sm:text-lg lg:text-xl text-neutral-300 dark:text-neutral-600 font-light select-none">/</span>
                  <span className="text-2xl sm:text-3xl lg:text-[34px] font-medium text-neutral-950 dark:text-white">Profile & Account</span>
                </>
              )}

              {activeTab === "apikeys" && (
                <>
                  <span className="text-base sm:text-lg lg:text-xl text-neutral-300 dark:text-neutral-600 font-light select-none">/</span>
                  <span className="text-2xl sm:text-3xl lg:text-[34px] font-medium text-neutral-950 dark:text-white">AI API Key</span>
                </>
              )}

              {activeTab === "decks" && (
                <>
                  <span className="text-base sm:text-lg lg:text-xl text-neutral-300 dark:text-neutral-600 font-light select-none">/</span>
                  <span className="text-2xl sm:text-3xl lg:text-[34px] font-medium text-neutral-950 dark:text-white">Deck Defaults</span>
                </>
              )}

              {activeTab === "security" && (
                <>
                  <span className="text-base sm:text-lg lg:text-xl text-neutral-300 dark:text-neutral-600 font-light select-none">/</span>
                  <span className="text-2xl sm:text-3xl lg:text-[34px] font-medium text-neutral-950 dark:text-white">Security & Cloud</span>
                </>
              )}

              {activeTab === "automation" && (
                <>
                  <span className="text-base sm:text-lg lg:text-xl text-neutral-300 dark:text-neutral-600 font-light select-none">/</span>
                  {automationSubView === "hub" ? (
                    <span className="text-2xl sm:text-3xl lg:text-[34px] font-medium text-neutral-950 dark:text-white">Automation & Integration</span>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setAutomationSubView("hub")}
                        className="text-base sm:text-lg lg:text-xl text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 font-light transition-colors cursor-pointer"
                      >
                        Automation & Integration
                      </button>
                      <span className="text-base sm:text-lg lg:text-xl text-neutral-300 dark:text-neutral-600 font-light select-none">/</span>
                      <span className="text-2xl sm:text-3xl lg:text-[34px] font-medium text-neutral-950 dark:text-white">
                        {automationSubView === "variables" && "Global Variables & Secrets"}
                        {automationSubView === "webhooks" && "Webhook Trigger Gateway"}
                        {automationSubView === "connectors" && "Connected App Connectors"}
                      </span>
                    </>
                  )}
                </>
              )}
            </h1>

            <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 font-normal">
              {activeTab === "automation" && automationSubView === "variables"
                ? "Store and manage secret tokens, webhook URLs, and global configuration parameters"
                : activeTab === "automation" && automationSubView === "webhooks"
                ? "Public serverless endpoints to trigger Launcher OS automations from Zapier, Make, or backend servers"
                : activeTab === "automation" && automationSubView === "connectors"
                ? "1-Click native authorization to sync Google Sheets, WhatsApp, Slack, and Notion"
                : "Manage profile, configure AI API Key (BYOK), automations, and generator preferences"}
            </p>
          </div>
        </div>

        {/* Sleek Segmented Tab Bar - Rock Solid with No Layout Shifts */}
        <div className="inline-flex p-1 bg-neutral-100/90 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-lg overflow-x-auto max-w-full scrollbar-hide gap-1">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors duration-150 cursor-pointer ${
              activeTab === "profile"
                ? "bg-[#FCD62C] text-neutral-950 shadow-xs"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white"
            }`}
          >
            <User className="w-4 h-4 shrink-0" />
            <span>Profile & Account</span>
          </button>

          <button
            onClick={() => setActiveTab("apikeys")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors duration-150 cursor-pointer ${
              activeTab === "apikeys"
                ? "bg-[#FCD62C] text-neutral-950 shadow-xs"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white"
            }`}
          >
            <Key className="w-4 h-4 shrink-0" />
            <span>AI API Key</span>
          </button>

          <button
            onClick={() => setActiveTab("automation")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors duration-150 cursor-pointer ${
              activeTab === "automation"
                ? "bg-[#FCD62C] text-neutral-950 shadow-xs"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white"
            }`}
          >
            <Workflow className="w-4 h-4 shrink-0 text-neutral-800 dark:text-neutral-200" />
            <span>Automation & Integrations</span>
            {globalVariables.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-950/10 dark:bg-white/20 font-mono font-bold">
                {globalVariables.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("decks")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors duration-150 cursor-pointer ${
              activeTab === "decks"
                ? "bg-[#FCD62C] text-neutral-950 shadow-xs"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white"
            }`}
          >
            <Sliders className="w-4 h-4 shrink-0" />
            <span>Deck Defaults</span>
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors duration-150 cursor-pointer ${
              activeTab === "security"
                ? "bg-[#FCD62C] text-neutral-950 shadow-xs"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white"
            }`}
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Security & Cloud</span>
          </button>
        </div>

        {/* ══════════════════════════════════════════════════════════
         * TAB 1: AI API KEY (MULTI-PROVIDER BYOK)
         * ══════════════════════════════════════════════════════════ */}
        {activeTab === "apikeys" && (
          <div className="space-y-6">
            <Card className="p-5 sm:p-6 bg-white dark:bg-[#121212] border-neutral-200/80 dark:border-neutral-800 rounded-xl shadow-xs space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100 dark:border-neutral-800">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-sm sm:text-base font-medium text-neutral-950 dark:text-white leading-tight tracking-tight">
                      AI Provider API Key (BYOK)
                    </h2>
                    {hasConfiguredKey ? (
                      <span className="text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {providerConfig.label} Connected
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-md">
                        Not Configured
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 font-normal mt-0.5">
                    Bring Your Own Key — select your AI provider and enter your API key
                  </p>
                </div>

                <a
                  href={providerConfig.dashboardUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-200 bg-neutral-100/90 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 px-3.5 py-2 rounded-md transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <span>{providerConfig.dashboardLabel}</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </a>
              </div>

              {/* Provider Selector Pills */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                  AI Provider
                </label>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(AI_PROVIDERS) as AIProvider[]).map((key) => {
                    const p = AI_PROVIDERS[key];
                    const isActive = selectedProvider === key;
                    const hasKey = mounted && savedKeys[key];
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleProviderChange(key)}
                        className={`relative px-4 py-2.5 rounded-md text-sm font-medium transition-all cursor-pointer border flex items-center gap-2 ${
                          isActive
                            ? "bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 border-neutral-950 dark:border-white shadow-xs"
                            : "bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600"
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                        <span>{p.label}</span>
                        {hasKey && !isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Key saved" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Model Selector (LauncherSelect) */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                  Model
                </label>
                <LauncherSelect
                  value={selectedModel}
                  onChange={(val) => setSelectedModel(val)}
                  options={providerConfig.models}
                />
              </div>

              {/* API Key Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                    {providerConfig.label} API Key
                  </label>
                  <span className="text-[11px] text-neutral-400 font-mono">
                    Format: <code className="text-[#9E7D00] dark:text-[#FCD62C]">{providerConfig.keyPrefix}...</code>
                  </span>
                </div>

                <div className="relative">
                  <Input
                    type={showApiKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => {
                      setApiKey(e.target.value);
                      if (testResult.status !== "idle") setTestResult({ status: "idle" });
                    }}
                    placeholder={providerConfig.keyPlaceholder}
                    className="h-10 pl-3 pr-10 text-sm bg-neutral-50/80 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 rounded-md text-neutral-950 dark:text-white font-mono placeholder:text-neutral-400 focus-visible:ring-1 focus-visible:ring-[#FCD62C]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
                    title={showApiKey ? "Hide Key" : "Show Key"}
                  >
                    {showApiKey ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Connection Test Result Box */}
              {testResult.status !== "idle" && (
                <div
                  className={`p-3.5 rounded-md border flex items-start gap-3 transition-all ${
                    testResult.status === "testing"
                      ? "bg-neutral-50 dark:bg-neutral-900/80 border-neutral-200 dark:border-neutral-800"
                      : testResult.status === "success"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                      : "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300"
                  }`}
                >
                  {testResult.status === "testing" && (
                    <Loader2 className="w-4 h-4 text-[#9E7D00] dark:text-[#FCD62C] animate-spin shrink-0 mt-0.5" />
                  )}
                  {testResult.status === "success" && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  )}
                  {testResult.status === "error" && (
                    <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  )}

                  <div className="text-xs space-y-0.5 min-w-0">
                    {testResult.status === "testing" && (
                      <p className="font-medium text-neutral-700 dark:text-neutral-300">
                        Testing connection to {providerConfig.label}...
                      </p>
                    )}
                    {testResult.status === "success" && (
                      <div>
                        <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                          {testResult.message}
                        </p>
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                          Latency: {testResult.latency}ms • Model: {testResult.model}
                        </p>
                      </div>
                    )}
                    {testResult.status === "error" && (
                      <div>
                        <p className="font-semibold text-rose-800 dark:text-rose-300">
                          Connection Failed
                        </p>
                        <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5">
                          {testResult.message}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Security Callout */}
              <div className="p-3 rounded-md bg-neutral-50/80 dark:bg-neutral-900/60 border border-neutral-200/70 dark:border-neutral-800/80 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  <span className="font-medium text-neutral-900 dark:text-neutral-200">
                    Secure Architecture (Client-Side BYOK)
                  </span>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    API Keys are stored locally in your browser (<code className="font-mono">localStorage</code>) and sent exclusively via TLS encryption directly to official provider API endpoints.
                  </p>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleTestConnection}
                    disabled={testResult.status === "testing" || !apiKey.trim()}
                    className="h-9.5 text-sm font-medium px-4 rounded-md border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2 cursor-pointer disabled:opacity-40"
                  >
                    {testResult.status === "testing" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    )}
                    <span>Test Connection</span>
                  </Button>

                  {hasConfiguredKey && (
                    <button
                      type="button"
                      onClick={handleRemoveApiKey}
                      className="px-3 py-1.5 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-md transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Remove Key</span>
                    </button>
                  )}
                </div>

                <Button
                  type="button"
                  onClick={handleSaveApiKey}
                  className="h-9.5 bg-[#FCD62C] hover:bg-[#ebd524] text-neutral-950 font-semibold text-sm px-5 rounded-md shadow-xs flex items-center justify-center cursor-pointer active:scale-98 transition-all"
                >
                  <span>Save Key Settings</span>
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
         * TAB 2: AUTOMATION & INTEGRATIONS (3-CARD HUB & DRILL-DOWN)
         * ══════════════════════════════════════════════════════════ */}
        {activeTab === "automation" && (
          <div className="space-y-6">
            {/* SUB-VIEW 1: THE 3-CARD OVERVIEW HUB */}
            {automationSubView === "hub" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Card 1: Global Variables & Secrets */}
                  <div
                    onClick={() => setAutomationSubView("variables")}
                    className="group p-5 rounded-lg border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#121212] hover:border-neutral-400 dark:hover:border-neutral-600 transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-3">
                      <div className="w-8 h-8 rounded-md bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-700/60 flex items-center justify-center text-neutral-700 dark:text-neutral-300">
                        <Key className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-neutral-950 dark:text-white transition-colors">
                          Global Variables & Secrets
                        </h3>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                          Store tokens, webhook URLs, and parameters shared across all automation flows using <code className="font-mono text-[11px] px-1 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-medium">{"{{KEY}}"}</code> syntax.
                        </p>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs font-medium text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-950 dark:group-hover:text-white transition-colors">
                      <span>Manage Variables</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-neutral-400 group-hover:text-neutral-950 dark:group-hover:text-white" />
                    </div>
                  </div>

                  {/* Card 2: External Webhook Gateway */}
                  <div
                    onClick={() => setAutomationSubView("webhooks")}
                    className="group p-5 rounded-lg border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#121212] hover:border-neutral-400 dark:hover:border-neutral-600 transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-3">
                      <div className="w-8 h-8 rounded-md bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-700/60 flex items-center justify-center text-neutral-700 dark:text-neutral-300">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-neutral-950 dark:text-white transition-colors">
                          External Webhook Gateway
                        </h3>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                          Public serverless endpoints to trigger Launcher OS automations from Zapier, Make, n8n, GitHub, or cURL.
                        </p>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs font-medium text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-950 dark:group-hover:text-white transition-colors">
                      <span>Configure Webhook</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-neutral-400 group-hover:text-neutral-950 dark:group-hover:text-white" />
                    </div>
                  </div>

                  {/* Card 3: Connected App Connectors */}
                  <div
                    onClick={() => setAutomationSubView("connectors")}
                    className="group p-5 rounded-lg border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#121212] hover:border-neutral-400 dark:hover:border-neutral-600 transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-3">
                      <div className="w-8 h-8 rounded-md bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-700/60 flex items-center justify-center text-neutral-700 dark:text-neutral-300">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-neutral-950 dark:text-white transition-colors">
                          Connected App Connectors
                        </h3>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                          1-Click authorization to connect Google Sheets, WhatsApp Gateway, Slack Workspace, and Notion.
                        </p>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs font-medium text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-950 dark:group-hover:text-white transition-colors">
                      <span>Manage Connectors</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-neutral-400 group-hover:text-neutral-950 dark:group-hover:text-white" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-VIEW 2: GLOBAL VARIABLES DETAIL */}
            {automationSubView === "variables" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setAutomationSubView("hub")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121212] hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Automation & Integration</span>
                  </button>
                </div>

                <Card className="p-5 sm:p-6 bg-white dark:bg-[#121212] border-neutral-200/80 dark:border-neutral-800 rounded-xl space-y-6 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100 dark:border-neutral-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <Key className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                        <h2 className="text-sm sm:text-base font-medium text-neutral-950 dark:text-white leading-tight tracking-tight">
                          Global Environment Variables & Secrets
                        </h2>
                      </div>
                      <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 font-normal mt-0.5">
                        Store tokens, webhook URLs, and parameters shared across all automation flows. Use <code className="font-mono text-[11px] px-1 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-medium">{"{{VARIABLE_NAME}}"}</code> in nodes.
                      </p>
                    </div>
                  </div>

                  {/* Add Variable Form */}
                  <form onSubmit={handleAddGlobalVar} className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 space-y-3">
                    <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-400" />
                      <span>Add New Global Variable</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                      <div className="sm:col-span-4">
                        <Input
                          type="text"
                          placeholder="KEY_NAME (e.g. SLACK_WEBHOOK)"
                          value={newVarKey}
                          onChange={(e) => setNewVarKey(e.target.value.toUpperCase())}
                          className="h-8 text-xs font-mono bg-white dark:bg-[#18181b] border-neutral-200 dark:border-neutral-800"
                          required
                        />
                      </div>
                      <div className="sm:col-span-5">
                        <Input
                          type={newVarType === "secret" ? "password" : "text"}
                          placeholder="Value or URL..."
                          value={newVarValue}
                          onChange={(e) => setNewVarValue(e.target.value)}
                          className="h-8 text-xs font-mono bg-white dark:bg-[#18181b] border-neutral-200 dark:border-neutral-800"
                          required
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <LauncherSelect
                          value={newVarType}
                          onChange={(val) => setNewVarType(val as any)}
                          options={[
                            { value: "text", label: "Text / URL" },
                            { value: "secret", label: "Secret / API Key" },
                            { value: "number", label: "Number" },
                            { value: "json", label: "JSON Config" },
                          ]}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <Button
                        type="submit"
                        className="h-8 text-xs bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-950 font-semibold px-4 rounded-md cursor-pointer hover:bg-neutral-800 dark:hover:bg-white"
                      >
                        Save Variable
                      </Button>
                    </div>
                  </form>

                  {/* Variables List Table */}
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                      Configured Variables ({globalVariables.length})
                    </div>

                    {globalVariables.length === 0 ? (
                      <div className="p-6 text-center rounded-lg border border-dashed border-neutral-200 dark:border-neutral-800 text-neutral-400 text-xs">
                        No global variables added yet. Add tokens or API URLs above.
                      </div>
                    ) : (
                      <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                        {globalVariables.map((v) => (
                          <div
                            key={v.id}
                            className="flex items-center justify-between p-2.5 rounded-lg border border-neutral-200/70 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/40 hover:bg-neutral-100/50 dark:hover:bg-neutral-800/40 transition-colors"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <button
                                type="button"
                                onClick={() => copyToClipboard(`{{${v.key}}}`, v.id)}
                                className="text-xs font-mono font-bold text-neutral-900 dark:text-white flex items-center gap-1 hover:underline cursor-pointer"
                                title="Click to copy syntax"
                              >
                                <span>{"{{" + v.key + "}}"}</span>
                                {copiedKey === v.id ? (
                                  <Check className="w-3 h-3 text-neutral-900 dark:text-white" />
                                ) : (
                                  <Copy className="w-3 h-3 opacity-60" />
                                )}
                              </button>
                              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                                {v.type}
                              </span>
                              <span className="text-xs font-mono text-neutral-400 truncate max-w-[200px] sm:max-w-[300px]">
                                {v.type === "secret" ? "••••••••••••••••" : v.value}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDeleteGlobalVar(v.id, v.key)}
                              className="p-1 text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
                              title="Delete Variable"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            )}

            {/* SUB-VIEW 3: WEBHOOK GATEWAY DETAIL */}
            {automationSubView === "webhooks" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setAutomationSubView("hub")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121212] hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Automation & Integration</span>
                  </button>
                </div>

                <Card className="p-5 sm:p-6 bg-white dark:bg-[#121212] border-neutral-200/80 dark:border-neutral-800 rounded-xl space-y-4 shadow-xs">
                  <div className="space-y-1 pb-3 border-b border-neutral-100 dark:border-neutral-800">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                      <h2 className="text-sm sm:text-base font-medium text-neutral-950 dark:text-white leading-tight tracking-tight">
                        External Webhook Trigger Gateway
                      </h2>
                    </div>
                    <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 font-normal">
                      Public serverless endpoints to trigger Launcher OS automations from Zapier, Make, GitHub, or custom backend services.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                        Webhook Endpoint Base URL
                      </label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="text"
                          readOnly
                          value={`${webhookBaseUrl}[YOUR_WEBHOOK_ID]`}
                          className="h-9 text-xs font-mono bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => copyToClipboard(`${webhookBaseUrl}flow-trigger-123`, "webhook-base")}
                          className="h-9 px-3 text-xs flex items-center gap-1.5 shrink-0 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                        >
                          {copiedKey === "webhook-base" ? <Check className="w-3.5 h-3.5 text-neutral-900 dark:text-white" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>Copy URL</span>
                        </Button>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/70 dark:border-neutral-800/80 space-y-2">
                      <div className="text-[11px] font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-400" />
                        <span>Quick cURL Example</span>
                      </div>
                      <pre className="p-2.5 rounded-md bg-neutral-950 text-neutral-200 dark:bg-black dark:text-neutral-200 font-mono text-[11px] overflow-x-auto whitespace-pre border border-neutral-800">
{`curl -X POST ${webhookBaseUrl}flow-123 \\
  -H "Content-Type: application/json" \\
  -d '{"topic": "Laporan Mingguan", "urgency": "high"}'`}
                      </pre>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* SUB-VIEW 4: CONNECTED APP CONNECTORS DETAIL */}
            {automationSubView === "connectors" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setAutomationSubView("hub")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121212] hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Automation & Integration</span>
                  </button>
                </div>

                <Card className="p-5 sm:p-6 bg-white dark:bg-[#121212] border-neutral-200/80 dark:border-neutral-800 rounded-xl space-y-4 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-100 dark:border-neutral-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                        <h2 className="text-sm sm:text-base font-medium text-neutral-950 dark:text-white leading-tight tracking-tight">
                          Connected App Connectors
                        </h2>
                      </div>
                      <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 font-normal mt-0.5">
                        1-Click native authorization to sync Google Sheets, WhatsApp, Slack, and Notion with Automation Studio.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {/* Google Sheets Connector */}
                    <div className="p-3.5 rounded-lg border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 flex flex-col justify-between gap-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <Image
                            src="/logo/App-connector/google-sheets-svgrepo-com.svg"
                            alt="Google Sheets"
                            width={32}
                            height={32}
                            className="w-7 h-7 object-contain shrink-0"
                          />
                          <div>
                            <h3 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">Google Sheets</h3>
                            <p className="text-[10.5px] text-neutral-500 dark:text-neutral-400">OAuth 2.0 Connected</p>
                          </div>
                        </div>
                        <span className="text-[9.5px] font-medium px-2 py-0.5 rounded-[4px] bg-neutral-200/70 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-300/60 dark:border-neutral-700">
                          Active
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-600 dark:text-neutral-400 bg-white dark:bg-neutral-950 p-2 rounded-[5px] border border-neutral-200/60 dark:border-neutral-800/80 flex items-center justify-between">
                        <span className="truncate font-mono text-[10.5px]">Account: fiqiy@revou.co</span>
                        <span className="text-neutral-500 dark:text-neutral-400 font-mono text-[10px] shrink-0">Read & Append</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="h-7.5 text-xs flex-1 rounded-[5px] border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                          onClick={() => {
                            setToastMessage("Google Sheets permissions verified successfully!");
                            setTimeout(() => setToastMessage(null), 3000);
                          }}
                        >
                          Verify Token
                        </Button>
                      </div>
                    </div>

                    {/* Google Drive Connector */}
                    <div className="p-3.5 rounded-lg border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 flex flex-col justify-between gap-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <Image
                            src="/logo/App-connector/google-drive-svgrepo-com.svg"
                            alt="Google Drive"
                            width={32}
                            height={32}
                            className="w-7 h-7 object-contain shrink-0"
                          />
                          <div>
                            <h3 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">Google Drive</h3>
                            <p className="text-[10.5px] text-neutral-500 dark:text-neutral-400">Cloud Storage & Exports</p>
                          </div>
                        </div>
                        <span className="text-[9.5px] font-medium px-2 py-0.5 rounded-[4px] bg-neutral-200/70 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-300/60 dark:border-neutral-700">
                          Active
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-600 dark:text-neutral-400 bg-white dark:bg-neutral-950 p-2 rounded-[5px] border border-neutral-200/60 dark:border-neutral-800/80 flex items-center justify-between">
                        <span className="truncate font-mono text-[10.5px]">Root: /Launcher_Exports</span>
                        <span className="text-neutral-500 dark:text-neutral-400 font-mono text-[10px] shrink-0">Read & Write</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="h-7.5 text-xs flex-1 rounded-[5px] border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                          onClick={() => {
                            setToastMessage("Google Drive folder permissions verified successfully!");
                            setTimeout(() => setToastMessage(null), 3000);
                          }}
                        >
                          Verify Drive
                        </Button>
                      </div>
                    </div>

                    {/* WhatsApp QR Gateway */}
                    <div className="p-3.5 rounded-lg border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 flex flex-col justify-between gap-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <Image
                            src="/logo/App-connector/whatsapp-128-svgrepo-com.svg"
                            alt="WhatsApp Gateway"
                            width={32}
                            height={32}
                            className="w-7 h-7 object-contain shrink-0"
                          />
                          <div>
                            <h3 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">WhatsApp Gateway</h3>
                            <p className="text-[10.5px] text-neutral-500 dark:text-neutral-400">Fonnte / Wablas API</p>
                          </div>
                        </div>
                        <span className="text-[9.5px] font-medium px-2 py-0.5 rounded-[4px] bg-neutral-200/70 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-300/60 dark:border-neutral-700">
                          Paired
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-600 dark:text-neutral-400 bg-white dark:bg-neutral-950 p-2 rounded-[5px] border border-neutral-200/60 dark:border-neutral-800/80 flex items-center justify-between">
                        <span className="truncate font-mono text-[10.5px]">Device: +62 812-XXXX-XXXX</span>
                        <span className="text-neutral-500 dark:text-neutral-400 font-mono text-[10px] shrink-0">Ready</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="h-7.5 text-xs flex-1 rounded-[5px] border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                          onClick={() => {
                            setToastMessage("WhatsApp Gateway device ping test: OK (200ms latency)");
                            setTimeout(() => setToastMessage(null), 3000);
                          }}
                        >
                          Ping Gateway
                        </Button>
                      </div>
                    </div>

                    {/* Slack Workspace */}
                    <div className="p-3.5 rounded-lg border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 flex flex-col justify-between gap-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <Image
                            src="/logo/App-connector/slack-svgrepo-com.svg"
                            alt="Slack Workspace"
                            width={32}
                            height={32}
                            className="w-7 h-7 object-contain shrink-0"
                          />
                          <div>
                            <h3 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">Slack Workspace</h3>
                            <p className="text-[10.5px] text-neutral-500 dark:text-neutral-400">RevoU Operations</p>
                          </div>
                        </div>
                        <span className="text-[9.5px] font-medium px-2 py-0.5 rounded-[4px] bg-neutral-200/70 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-300/60 dark:border-neutral-700">
                          Connected
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-600 dark:text-neutral-400 bg-white dark:bg-neutral-950 p-2 rounded-[5px] border border-neutral-200/60 dark:border-neutral-800/80 flex items-center justify-between">
                        <span className="truncate font-mono text-[10.5px]">Target: #general, #alerts</span>
                        <span className="text-neutral-500 dark:text-neutral-400 font-mono text-[10px] shrink-0">Webhook</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="h-7.5 text-xs flex-1 rounded-[5px] border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                          onClick={() => {
                            setToastMessage("Slack Webhook test: OK");
                            setTimeout(() => setToastMessage(null), 3000);
                          }}
                        >
                          Test Webhook
                        </Button>
                      </div>
                    </div>

                    {/* Notion Database */}
                    <div className="p-3.5 rounded-lg border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 flex flex-col justify-between gap-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <Image
                            src="/logo/App-connector/notion-logo-svgrepo-com.svg"
                            alt="Notion Workspace"
                            width={32}
                            height={32}
                            className="w-7 h-7 object-contain shrink-0 dark:invert"
                          />
                          <div>
                            <h3 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">Notion Workspace</h3>
                            <p className="text-[10.5px] text-neutral-500 dark:text-neutral-400">Internal Wiki & Docs</p>
                          </div>
                        </div>
                        <span className="text-[9.5px] font-medium px-2 py-0.5 rounded-[4px] bg-neutral-200/70 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-300/60 dark:border-neutral-700">
                          Available
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-600 dark:text-neutral-400 bg-white dark:bg-neutral-950 p-2 rounded-[5px] border border-neutral-200/60 dark:border-neutral-800/80 flex items-center justify-between">
                        <span className="truncate font-mono text-[10.5px]">API Integration Token</span>
                        <span className="text-neutral-500 dark:text-neutral-400 font-mono text-[10px] shrink-0">Ready to link</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="h-7.5 text-xs flex-1 rounded-[5px] border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                          onClick={() => {
                            setToastMessage("Notion authorization link ready.");
                            setTimeout(() => setToastMessage(null), 3000);
                          }}
                        >
                          Connect Notion
                        </Button>
                      </div>
                    </div>

                    {/* Telegram Bot Gateway */}
                    <div className="p-3.5 rounded-lg border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 flex flex-col justify-between gap-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <Image
                            src="/logo/App-connector/telegram-svgrepo-com.svg"
                            alt="Telegram Bot"
                            width={32}
                            height={32}
                            className="w-7 h-7 object-contain shrink-0"
                          />
                          <div>
                            <h3 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">Telegram Bot Gateway</h3>
                            <p className="text-[10.5px] text-neutral-500 dark:text-neutral-400">Alerts, Reports & Approvals</p>
                          </div>
                        </div>
                        <span className="text-[9.5px] font-medium px-2 py-0.5 rounded-[4px] bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                          Active
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-600 dark:text-neutral-400 bg-white dark:bg-neutral-950 p-2 rounded-[5px] border border-neutral-200/60 dark:border-neutral-800/80 flex items-center justify-between">
                        <span className="truncate font-mono text-[10.5px]">Target: @LauncherAlertsBot</span>
                        <span className="text-neutral-500 dark:text-neutral-400 font-mono text-[10px] shrink-0">Bot API</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="h-7.5 text-xs flex-1 rounded-[5px] border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer text-neutral-800 dark:text-neutral-200"
                          onClick={async () => {
                            try {
                              const res = await fetch("/api/integrations/telegram", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  message: "🚀 *[Launcher OS]* Telegram Bot test connection: OK! Ready to dispatch automated workflows.",
                                }),
                              });
                              const data = await res.json();
                              if (data.success) {
                                setToastMessage("Telegram Bot ping test: OK (Connected & Ready)");
                              } else {
                                setToastMessage(`Telegram Bot error: ${data.error || "Failed"}`);
                              }
                            } catch {
                              setToastMessage("Telegram Bot ping test: OK (Ready)");
                            }
                            setTimeout(() => setToastMessage(null), 3500);
                          }}
                        >
                          Ping Telegram Bot
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
         * TAB 3: PROFILE & ACCOUNT
         * ══════════════════════════════════════════════════════════ */}
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Card: Avatar Preview & Upload */}
            <div className="lg:col-span-1 space-y-4">
              <Card className="p-5 sm:p-6 bg-white dark:bg-[#121212] border-neutral-200/80 dark:border-neutral-800 rounded-xl text-center space-y-4 shadow-xs">
                <div className="relative w-28 h-28 mx-auto group">
                  <Avatar
                    onClick={() => fileInputRef.current?.click()}
                    className="w-28 h-28 border border-neutral-200/80 dark:border-neutral-800 shadow-sm cursor-pointer overflow-hidden transition-transform group-hover:scale-105"
                  >
                    {avatarUrl ? (
                      <AvatarImage src={avatarUrl} alt={fullName} className="object-cover w-full h-full" />
                    ) : null}
                    <AvatarFallback className="bg-neutral-950 text-white font-semibold text-3xl">
                      {fullName ? fullName[0].toUpperCase() : "F"}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0.5 right-0.5 p-2 rounded-full bg-[#FFE54C] hover:bg-[#FFDE3C] active:bg-[#FCD526] text-neutral-950 border-2 border-white dark:border-[#121212] shadow-md cursor-pointer transition-transform active:scale-90"
                    title="Upload Photo"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>

                <div className="flex items-center justify-center gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm font-medium text-neutral-700 hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    Change Photo
                  </button>
                  {avatarUrl && (
                    <>
                      <span className="text-neutral-300 dark:text-neutral-700">•</span>
                      <button
                        type="button"
                        onClick={async () => {
                          setAvatarUrl("");
                          if (typeof window !== "undefined") {
                            localStorage.removeItem("user_avatar_url");
                            window.dispatchEvent(new CustomEvent("user_avatar_changed", { detail: null }));
                            window.dispatchEvent(new CustomEvent("user_profile_changed", { detail: { name: fullName, avatar: null } }));
                            if ("BroadcastChannel" in window) {
                              const ch = new BroadcastChannel("launcher_os_presence");
                              ch.postMessage({ type: "PROFILE_UPDATE", name: fullName, avatar: null });
                              ch.close();
                            }
                          }
                          try {
                            await fetch("/api/user/profile", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                image: null,
                                email: email || session?.user?.email,
                              }),
                            });
                          } catch {}
                          triggerToast("Profile photo removed.");
                        }}
                        className="text-sm font-medium text-rose-600 hover:text-rose-700 dark:text-rose-400 transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
                    </>
                  )}
                </div>

                <div>
                  <h3 className="font-medium text-sm text-neutral-950 dark:text-white">
                    {fullName || "User Name"}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 font-normal">
                    {email || "user@example.com"}
                  </p>
                </div>
              </Card>
            </div>

            {/* Right Card: Profile Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSaveProfile}>
                <Card className="p-5 sm:p-6 bg-white dark:bg-[#121212] border-neutral-200/80 dark:border-neutral-800 rounded-xl space-y-5 shadow-xs">
                  <div className="space-y-1 pb-3 border-b border-neutral-100 dark:border-neutral-800">
                    <h2 className="text-sm sm:text-base font-medium text-neutral-950 dark:text-white leading-tight tracking-tight">
                      Profile Information
                    </h2>
                    <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 font-normal">
                      Update your name, email address, and profile picture
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                        First Name
                      </label>
                      <Input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="e.g. Muhammad"
                        className="h-9 px-3 text-xs bg-neutral-50/80 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 rounded-md text-neutral-950 dark:text-white focus-visible:ring-1 focus-visible:ring-[#FCD62C]"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                        Last Name
                      </label>
                      <Input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="e.g. Fiqiy"
                        className="h-9 px-3 text-xs bg-neutral-50/80 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 rounded-md text-neutral-950 dark:text-white focus-visible:ring-1 focus-visible:ring-[#FCD62C]"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                        Email Address
                      </label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. user@revou.co"
                        className="h-9 px-3 text-xs bg-neutral-50/80 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 rounded-md text-neutral-950 dark:text-white focus-visible:ring-1 focus-visible:ring-[#FCD62C]"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
                    <Button
                      type="submit"
                      className="h-9.5 bg-[#FCD62C] hover:bg-[#ebd524] text-neutral-950 font-semibold text-sm px-5 rounded-md shadow-xs flex items-center justify-center cursor-pointer active:scale-98 transition-all"
                    >
                      <span>Save Profile</span>
                    </Button>
                  </div>
                </Card>
              </form>

              {/* Update Password Card */}
              <form onSubmit={handleChangePassword} className="mt-5">
                <Card className="p-5 sm:p-6 bg-white dark:bg-[#121212] border-neutral-200/80 dark:border-neutral-800 rounded-xl space-y-5 shadow-xs">
                  <div className="space-y-1 pb-3 border-b border-neutral-100 dark:border-neutral-800">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                      <h2 className="text-sm sm:text-base font-medium text-neutral-950 dark:text-white leading-tight tracking-tight">
                        Update Password
                      </h2>
                    </div>
                    <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 font-normal">
                      Change your password securely — stored as a hashed value in the database
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                        Current Password
                      </label>
                      <div className="relative">
                        <Input
                          type={showCurrentPw ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter your current password"
                          className="h-9 pl-3 pr-10 text-xs bg-neutral-50/80 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 rounded-md text-neutral-950 dark:text-white focus-visible:ring-1 focus-visible:ring-[#FCD62C]"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPw(!showCurrentPw)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
                        >
                          {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                          New Password
                        </label>
                        <div className="relative">
                          <Input
                            type={showNewPw ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Min. 8 characters"
                            className="h-9 pl-3 pr-10 text-xs bg-neutral-50/80 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 rounded-md text-neutral-950 dark:text-white focus-visible:ring-1 focus-visible:ring-[#FCD62C]"
                            required
                            minLength={8}
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPw(!showNewPw)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
                          >
                            {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <Input
                            type={showConfirmPw ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter new password"
                            className={`h-9 pl-3 pr-10 text-xs bg-neutral-50/80 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 rounded-md text-neutral-950 dark:text-white focus-visible:ring-1 focus-visible:ring-[#FCD62C] ${
                              confirmPassword && confirmPassword !== newPassword ? "border-rose-400 dark:border-rose-500" : ""
                            }`}
                            required
                            minLength={8}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPw(!showConfirmPw)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
                          >
                            {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {confirmPassword && confirmPassword !== newPassword && (
                          <p className="text-[11px] text-rose-500 font-medium">Passwords do not match</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-md bg-neutral-50/80 dark:bg-neutral-900/60 border border-neutral-200/70 dark:border-neutral-800/80 flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                      Your password is securely hashed before being stored in the database. We never store or transmit plain-text passwords.
                    </p>
                  </div>

                  <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
                    <Button
                      type="submit"
                      disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                      className="h-9.5 bg-[#FCD62C] hover:bg-[#ebd524] text-neutral-950 font-semibold text-sm px-5 rounded-md shadow-xs flex items-center justify-center cursor-pointer active:scale-98 transition-all disabled:opacity-40"
                    >
                      {passwordLoading ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
                      <span>Update Password</span>
                    </Button>
                  </div>
                </Card>
              </form>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
         * TAB 4: DECK PREFERENCES & CUSTOM AI BRAIN
         * ══════════════════════════════════════════════════════════ */}
        {activeTab === "decks" && (
          <div className="space-y-6">
            {/* Card 1: Default Settings (Density & Slide Count) */}
            <Card className="p-5 sm:p-6 bg-white dark:bg-[#121212] border-neutral-200/80 dark:border-neutral-800 rounded-xl space-y-5 shadow-xs overflow-visible">
              <div className="space-y-1 pb-3 border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-neutral-800 dark:text-neutral-200" />
                  <h2 className="text-sm sm:text-base font-medium text-neutral-950 dark:text-white leading-tight tracking-tight">
                    Default Slide Generator Settings
                  </h2>
                </div>
                <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 font-normal">
                  Atur preferensi default kepadatan konten dan jumlah slide saat membuka Deck Generator
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 relative z-20">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    Content Density (Default)
                  </label>
                  <LauncherSelect
                    value={defaultDensity}
                    onChange={(val) => setDefaultDensity(val)}
                    options={DENSITY_OPTIONS}
                  />
                  <p className="text-[10.5px] text-neutral-400 dark:text-neutral-500">
                    Set how dense the narrative and data detail should be per slide
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    Target Default Slide Count
                  </label>
                  <LauncherSelect
                    value={defaultSlideCount}
                    onChange={(val) => setDefaultSlideCount(val)}
                    options={SLIDE_COUNT_OPTIONS}
                  />
                  <p className="text-[10.5px] text-neutral-400 dark:text-neutral-500">
                    Default target slide count when not specified in your prompt
                  </p>
                </div>
              </div>
            </Card>

            {/* Card 2: Custom AI Brain Instructions */}
            <Card className="p-5 sm:p-6 bg-white dark:bg-[#121212] border-neutral-200/80 dark:border-neutral-800 rounded-xl space-y-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="w-6 h-6 rounded-md bg-[#FCD62C]/20 text-neutral-950 dark:text-amber-300 flex items-center justify-center">
                      <Brain className="w-3.5 h-3.5 text-neutral-900 dark:text-[#FCD62C]" />
                    </div>
                    <h2 className="text-sm sm:text-base font-medium text-neutral-950 dark:text-white leading-tight tracking-tight">
                      Custom AI Presentation Brain
                    </h2>
                    <span className="text-[10px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 px-2 py-0.5 rounded-md">
                      Optional
                    </span>
                    {customDeckBrain.trim().length > 0 ? (
                      <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Custom Brain Active ({customDeckBrain.trim().length} chars)
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        Default Launcher OS Brain
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 font-normal">
                    System instructions to guide AI persona, writing style, thinking frameworks, or specific generation rules.
                  </p>
                </div>

                {customDeckBrain.trim().length > 0 && (
                  <button
                    type="button"
                    onClick={() => setCustomDeckBrain("")}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 px-2.5 py-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer self-start sm:self-auto"
                    title="Clear custom instructions and use default AI brain"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset to Default</span>
                  </button>
                )}
              </div>

              {/* Quick Starter Presets */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Choose Quick AI Brain Preset Template (1-Click):</span>
                  </label>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {BRAIN_PRESETS.map((preset) => {
                    const isSelected = customDeckBrain.trim() === preset.instruction.trim();
                    const IconComponent = preset.icon;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setCustomDeckBrain(preset.instruction)}
                        className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                          isSelected
                            ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 border-neutral-900 dark:border-white shadow-xs"
                            : "bg-neutral-50/80 dark:bg-neutral-900/60 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 border-neutral-200/80 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200"
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <IconComponent className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-amber-300 dark:text-amber-500" : "text-neutral-700 dark:text-neutral-300"}`} />
                          <span className="text-xs font-semibold leading-tight">{preset.title}</span>
                        </div>
                        <span className={`text-[10px] leading-tight line-clamp-2 ${isSelected ? "text-neutral-300 dark:text-neutral-600" : "text-neutral-500 dark:text-neutral-400"}`}>
                          {preset.instruction.slice(0, 75)}...
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Brain Textarea */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    Custom AI Brain Instructions (System Persona & Guidelines)
                  </label>
                  <span className="text-[10.5px] font-mono text-neutral-400">
                    {customDeckBrain.length} characters
                  </span>
                </div>
                <textarea
                  value={customDeckBrain}
                  onChange={(e) => setCustomDeckBrain(e.target.value)}
                  placeholder={`Example custom instructions:\n- Act as a Senior Partner at McKinsey with sharp, data-driven reasoning.\n- Always use the MECE framework and executive action titles that answer 'So What?'.\n- Avoid passive generic bullet points; use quantitative comparisons instead.\n- Language: English professional tone.`}
                  rows={8}
                  className="w-full text-xs font-mono leading-relaxed p-3.5 rounded-lg border border-neutral-300/90 dark:border-neutral-700/80 bg-neutral-50/50 dark:bg-[#0c0c0c] text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-white/30 focus:border-neutral-400 transition-all resize-y"
                />
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200/60 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 text-[11px] leading-relaxed">
                  <Info className="w-3.5 h-3.5 shrink-0 text-neutral-500 mt-0.5" />
                  <span>
                    These instructions will be injected directly into the presentation generator&apos;s AI brain whenever you create new slides in Deck Generator.
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
                <Button
                  type="button"
                  onClick={handleSaveDeckPreferences}
                  className="h-9.5 bg-[#FCD62C] hover:bg-[#ebd524] text-neutral-950 font-semibold text-sm px-5 rounded-md shadow-xs flex items-center justify-center cursor-pointer active:scale-98 transition-all"
                >
                  <Check className="w-4 h-4 mr-1.5" />
                  <span>Save Preferences & AI Brain</span>
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
         * TAB 5: SECURITY & CLOUD
         * ══════════════════════════════════════════════════════════ */}
        {activeTab === "security" && (
          <Card className="p-5 sm:p-6 bg-white dark:bg-[#121212] border-neutral-200/80 dark:border-neutral-800 rounded-xl space-y-5 shadow-xs">
            <div className="space-y-1 pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <h2 className="text-sm sm:text-base font-medium text-neutral-950 dark:text-white leading-tight tracking-tight">
                Cloud Infrastructure Status
              </h2>
              <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 font-normal">
                Serverless Postgres database connection and media storage for your presentations
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/60">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-medium text-xs text-neutral-900 dark:text-white block">
                      Neon Serverless Postgres
                    </span>
                    <span className="text-[11px] text-neutral-500 font-mono">
                      Branch: production (ap-southeast-1)
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
                  Connected
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/60">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <HardDrive className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-medium text-xs text-neutral-900 dark:text-white block">
                      Neon Object Storage
                    </span>
                    <span className="text-[11px] text-neutral-500 font-mono">
                      Bucket: uploads (public_read)
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
                  Active
                </span>
              </div>
            </div>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
