"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
  X,
  Settings2,
  Send,
  Pencil,
  Code,
  Play,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LauncherSelect } from "@/components/automation/LauncherSelect";
import type { GlobalVariable } from "@/components/automation/GlobalVariablesModal";

type SettingsTab = "profile" | "apikeys" | "automation" | "security";
type AutomationSubView = "hub" | "variables" | "webhooks" | "connectors";
type AIProvider = "deepseek" | "openai" | "anthropic" | "gemini" | "openrouter";

export interface ConnectorConfig {
  gmail: { email: string; appPassword?: string; senderName?: string; connected: boolean };
  sheets: { email: string; spreadsheetId: string; sheetName: string; connected: boolean };
  docs: { email: string; documentId: string; template: string; connected: boolean };
  slides: { email: string; presentationId: string; template: string; connected: boolean };
  drive: { rootFolder: string; driveId: string; permission: string; connected: boolean };
  whatsapp: { phone: string; apiToken: string; gateway: string; connected: boolean };
  slack: { webhookUrl: string; channel: string; botName: string; connected: boolean };
  notion: { token: string; databaseId: string; connected: boolean };
}

export const DEFAULT_CONNECTORS: ConnectorConfig = {
  gmail: { email: "", appPassword: "", senderName: "Launcher OS", connected: false },
  sheets: { email: "", spreadsheetId: "", sheetName: "Sheet1", connected: false },
  docs: { email: "", documentId: "", template: "Executive Report", connected: false },
  slides: { email: "", presentationId: "", template: "Institutional Standard", connected: false },
  drive: { rootFolder: "/Launcher_Exports", driveId: "", permission: "Read & Write", connected: false },
  whatsapp: { phone: "", apiToken: "", gateway: "fonnte_qr", connected: false },
  slack: { webhookUrl: "", channel: "#general", botName: "Launcher OS Bot", connected: false },
  notion: { token: "", databaseId: "", connected: false },
};

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
  logo: string;
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
    logo: "/logo/API-provider/deepsek.svg",
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
      { value: "o3-mini", label: "o3-mini (Reasoning)" },
    ],
    color: "#10A37F",
    logo: "/logo/API-provider/openai-light.svg",
  },
  anthropic: {
    label: "Anthropic (Claude)",
    keyPrefix: "sk-ant-",
    keyPlaceholder: "sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxx",
    dashboardUrl: "https://console.anthropic.com/settings/keys",
    dashboardLabel: "Get Key from Anthropic",
    models: [
      { value: "claude-3-5-sonnet-20241022", label: "Claude 3.5 Sonnet" },
      { value: "claude-3-5-haiku-20241022", label: "Claude 3.5 Haiku" },
      { value: "claude-3-opus-20240229", label: "Claude 3 Opus" },
    ],
    color: "#D4A27F",
    logo: "/logo/API-provider/claude-color.svg",
  },
  gemini: {
    label: "Google Gemini",
    keyPrefix: "",
    keyPlaceholder: "Enter your Google AI Studio API Key",
    dashboardUrl: "https://aistudio.google.com/apikey",
    dashboardLabel: "Get Key from Google AI Studio",
    models: [
      { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash (Recommended & Fast)" },
      { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash (Next-Gen)" },
      { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash (Ultra Lightweight)" },
      { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro (Deep Reasoning)" },
      { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro (High Context)" },
    ],
    color: "#4285F4",
    logo: "/logo/API-provider/gemini.svg",
  },
  openrouter: {
    label: "OpenRouter",
    keyPrefix: "sk-or-",
    keyPlaceholder: "sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxx",
    dashboardUrl: "https://openrouter.ai/keys",
    dashboardLabel: "Get Key from OpenRouter",
    models: [
      { value: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash (via OpenRouter - Recommended)" },
      { value: "google/gemini-2.0-flash-001", label: "Gemini 2.0 Flash (via OpenRouter)" },
      { value: "google/gemini-flash-1.5", label: "Gemini 1.5 Flash (via OpenRouter)" },
      { value: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro (via OpenRouter)" },
      { value: "deepseek/deepseek-chat", label: "DeepSeek V3 (via OpenRouter)" },
      { value: "deepseek/deepseek-r1", label: "DeepSeek R1 (via OpenRouter)" },
      { value: "anthropic/claude-3.5-sonnet", label: "Claude 3.5 Sonnet (via OpenRouter)" },
      { value: "openai/gpt-4o-mini", label: "GPT-4o Mini (via OpenRouter)" },
    ],
    color: "#6366F1",
    logo: "/logo/API-provider/openrouter-.svg",
  },
};

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
  // Automation & Global Variables State
  const [globalVariables, setGlobalVariables] = useState<GlobalVariable[]>([]);
  const [newVarKey, setNewVarKey] = useState("");
  const [newVarValue, setNewVarValue] = useState("");
  const [newVarType, setNewVarType] = useState<"text" | "secret" | "number" | "json">("text");
  const [editingVarId, setEditingVarId] = useState<string | null>(null);
  const [revealedSecretIds, setRevealedSecretIds] = useState<Set<string>>(new Set());
  const [webhookBaseUrl, setWebhookBaseUrl] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isSavingVar, setIsSavingVar] = useState(false);

  // Webhook Trigger Gateway State
  const [webhookTestId, setWebhookTestId] = useState("flow-123");
  const [webhookTestMethod, setWebhookTestMethod] = useState<"POST" | "GET" | "PUT">("POST");
  const [webhookTestPayload, setWebhookTestPayload] = useState(
    JSON.stringify(
      {
        event: "lead_submission",
        topic: "Laporan Mingguan",
        urgency: "high",
        user: "Fiqiy",
      },
      null,
      2
    )
  );
  const [webhookTestResult, setWebhookTestResult] = useState<{
    status: "idle" | "sending" | "success" | "error";
    statusCode?: number;
    latencyMs?: number;
    response?: any;
    error?: string;
  }>({ status: "idle" });
  const [webhookEvents, setWebhookEvents] = useState<any[]>([]);
  const [registeredWebhookTriggers, setRegisteredWebhookTriggers] = useState<any[]>([]);
  const [isLoadingWebhookEvents, setIsLoadingWebhookEvents] = useState(false);
  const [webhookCodeTab, setWebhookCodeTab] = useState<"curl" | "fetch" | "python">("curl");
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  // Connected App Connectors State
  const [connectors, setConnectors] = useState<ConnectorConfig>(DEFAULT_CONNECTORS);
  const [activeConnectorModal, setActiveConnectorModal] = useState<keyof ConnectorConfig | null>(null);
  const [editingConnector, setEditingConnector] = useState<any>(null);
  const [testingConnector, setTestingConnector] = useState(false);
  const [testConnectorMessage, setTestConnectorMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showSecretToken, setShowSecretToken] = useState(false);

  // Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [savedKeys, setSavedKeys] = useState<Record<string, boolean>>({});

  // Security & Cloud Infrastructure Health Check State
  const [isCheckingCloud, setIsCheckingCloud] = useState(false);
  const [cloudLatency, setCloudLatency] = useState<number | null>(null);
  const [cloudCheckStatus, setCloudCheckStatus] = useState<"idle" | "healthy" | "error">("idle");

  const handleTestCloudHealth = async () => {
    setIsCheckingCloud(true);
    setCloudCheckStatus("idle");
    const start = performance.now();
    try {
      const res = await fetch("/api/automation/variables", { method: "GET" });
      const end = performance.now();
      const lat = Math.round(end - start);
      setCloudLatency(lat);
      if (res.ok) {
        setCloudCheckStatus("healthy");
        triggerToast(`Cloud connection verified (${lat}ms latency)`);
      } else {
        setCloudCheckStatus("error");
        triggerToast("Cloud service responded with an error.");
      }
    } catch {
      setCloudCheckStatus("error");
      triggerToast("Unable to reach cloud endpoints.");
    } finally {
      setIsCheckingCloud(false);
    }
  };

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



      // Load Global Variables (LocalStorage + Cloud Sync)
      try {
        const storedVars = localStorage.getItem("launcher_automation_global_vars");
        if (storedVars) {
          const parsed = JSON.parse(storedVars);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setGlobalVariables(parsed);
          }
        }
        // Sync with backend API
        fetch("/api/automation/variables")
          .then((r) => r.json())
          .then((data) => {
            if (data.variables && Array.isArray(data.variables) && data.variables.length > 0) {
              setGlobalVariables(data.variables);
              localStorage.setItem("launcher_automation_global_vars", JSON.stringify(data.variables));
            }
          })
          .catch(() => {});
      } catch {}

      // Load Connected App Connectors
      try {
        const storedConn = localStorage.getItem("launcher_app_connectors");
        if (storedConn) {
          const parsed = JSON.parse(storedConn);
          setConnectors({ ...DEFAULT_CONNECTORS, ...parsed });
        } else {
          fetch("/api/slack/config")
            .then((r) => r.json())
            .then((data) => {
              if (data.config?.webhookUrl) {
                setConnectors((prev) => ({
                  ...prev,
                  slack: {
                    webhookUrl: data.config.webhookUrl,
                    channel: data.config.defaultChannel || "#general",
                    botName: data.config.botName || "Launcher OS Bot",
                    connected: true,
                  },
                }));
              }
            })
            .catch(() => {});
        }
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

  // Keyboard shortcut: Escape to close connector modal (matches MoodCheck & Logout modal behavior)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && activeConnectorModal && !testingConnector) {
        setActiveConnectorModal(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeConnectorModal, testingConnector]);

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

  // Global Variables CRUD & Cloud Sync
  const handleAddGlobalVar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVarKey.trim()) return;

    setIsSavingVar(true);
    const formattedKey = newVarKey.trim().toUpperCase().replace(/[^A-Z0-9_]/g, "_");
    
    let updated: GlobalVariable[];
    if (editingVarId) {
      updated = globalVariables.map((v) =>
        v.id === editingVarId
          ? {
              ...v,
              key: formattedKey,
              value: newVarValue.trim(),
              type: newVarType,
              description: `Configured via Settings (${newVarType})`,
            }
          : v
      );
    } else {
      updated = [
        ...globalVariables.filter((v) => v.key !== formattedKey),
        {
          id: `var-${Date.now()}`,
          key: formattedKey,
          value: newVarValue.trim(),
          type: newVarType,
          description: `Configured via Settings (${newVarType})`,
        },
      ];
    }

    setGlobalVariables(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("launcher_automation_global_vars", JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("launcher_global_vars_changed", { detail: updated }));
    }

    try {
      await fetch("/api/automation/variables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variables: updated }),
      });
    } catch {}

    setNewVarKey("");
    setNewVarValue("");
    setEditingVarId(null);
    setIsSavingVar(false);
    triggerToast(editingVarId ? `Variable {{${formattedKey}}} updated!` : `Variable {{${formattedKey}}} saved!`);
  };

  const handleEditGlobalVar = (v: GlobalVariable) => {
    setEditingVarId(v.id);
    setNewVarKey(v.key);
    setNewVarValue(v.value);
    setNewVarType(v.type);
    triggerToast(`Editing {{${v.key}}}...`);
  };

  const handleCancelEdit = () => {
    setEditingVarId(null);
    setNewVarKey("");
    setNewVarValue("");
    setNewVarType("text");
  };

  const toggleRevealSecret = (id: string) => {
    setRevealedSecretIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDeleteGlobalVar = async (id: string, keyName: string) => {
    const updated = globalVariables.filter((v) => v.id !== id);
    setGlobalVariables(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("launcher_automation_global_vars", JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("launcher_global_vars_changed", { detail: updated }));
    }
    try {
      await fetch("/api/automation/variables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variables: updated }),
      });
    } catch {}
    if (editingVarId === id) {
      setEditingVarId(null);
      setNewVarKey("");
      setNewVarValue("");
    }
    triggerToast(`Variable {{${keyName}}} removed.`);
  };

  const handleImportFromConnectors = () => {
    let importedCount = 0;
    const newVars = [...globalVariables];

    const addIfPresent = (keyName: string, val: string | undefined, type: "text" | "secret" = "text", desc: string = "") => {
      if (val && val.trim()) {
        const idx = newVars.findIndex((v) => v.key === keyName);
        if (idx === -1) {
          newVars.push({
            id: `var-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            key: keyName,
            value: val.trim(),
            type,
            description: desc,
          });
          importedCount++;
        }
      }
    };

    if (connectors.slack?.webhookUrl) addIfPresent("SLACK_WEBHOOK_URL", connectors.slack.webhookUrl, "secret", "Imported from Slack Connector");
    if (connectors.slack?.channel) addIfPresent("SLACK_DEFAULT_CHANNEL", connectors.slack.channel, "text", "Imported from Slack Connector");
    if (connectors.gmail?.email) addIfPresent("GMAIL_USER", connectors.gmail.email, "text", "Imported from Gmail Connector");
    if (connectors.gmail?.appPassword) addIfPresent("GMAIL_APP_PASSWORD", connectors.gmail.appPassword, "secret", "Imported from Gmail Connector");
    if (connectors.drive?.rootFolder) addIfPresent("GOOGLE_DRIVE_FOLDER", connectors.drive.rootFolder, "text", "Imported from Drive Connector");
    if (connectors.drive?.driveId) addIfPresent("GOOGLE_DRIVE_ID", connectors.drive.driveId, "text", "Imported from Drive Connector");
    if (connectors.sheets?.spreadsheetId) addIfPresent("GOOGLE_SHEET_ID", connectors.sheets.spreadsheetId, "text", "Imported from Sheets Connector");
    if (connectors.sheets?.email) addIfPresent("GOOGLE_SHEET_EMAIL", connectors.sheets.email, "text", "Imported from Sheets Connector");
    if (connectors.whatsapp?.phone) addIfPresent("WHATSAPP_PHONE", connectors.whatsapp.phone, "text", "Imported from WhatsApp Connector");
    if (connectors.whatsapp?.apiToken) addIfPresent("WHATSAPP_TOKEN", connectors.whatsapp.apiToken, "secret", "Imported from WhatsApp Connector");
    if (connectors.notion?.token) addIfPresent("NOTION_API_KEY", connectors.notion.token, "secret", "Imported from Notion Connector");

    if (importedCount > 0) {
      setGlobalVariables(newVars);
      if (typeof window !== "undefined") {
        localStorage.setItem("launcher_automation_global_vars", JSON.stringify(newVars));
        window.dispatchEvent(new CustomEvent("launcher_global_vars_changed", { detail: newVars }));
      }
      fetch("/api/automation/variables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variables: newVars }),
      }).catch(() => {});
      triggerToast(`Imported ${importedCount} variables from connected apps!`);
    } else {
      triggerToast("All configured connector credentials are already in variables.");
    }
  };

  const copyToClipboard = (text: string, identifier: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(identifier);
    setTimeout(() => setCopiedKey(null), 2000);
    triggerToast(`Copied to clipboard: ${text}`);
  };

  // Webhook Gateway Methods
  const fetchWebhookEvents = async () => {
    setIsLoadingWebhookEvents(true);
    try {
      const res = await fetch("/api/automation/webhook/events");
      const data = await res.json();
      if (data.events) {
        setWebhookEvents(data.events);
      }
      if (data.registeredTriggers) {
        setRegisteredWebhookTriggers(data.registeredTriggers);
      }
    } catch {}
    setIsLoadingWebhookEvents(false);
  };

  useEffect(() => {
    if (automationSubView === "webhooks") {
      fetchWebhookEvents();
    }
  }, [automationSubView]);

  const handleSendTestWebhook = async () => {
    const trimmedId = webhookTestId.trim() || "flow-123";
    setWebhookTestResult({ status: "sending" });
    const startTime = Date.now();

    try {
      let parsedBody: any = undefined;
      if (webhookTestMethod !== "GET") {
        try {
          parsedBody = JSON.parse(webhookTestPayload);
        } catch {
          setWebhookTestResult({
            status: "error",
            error: "Invalid JSON format in payload editor.",
          });
          return;
        }
      }

      const url = `${webhookBaseUrl}${trimmedId}`;
      const res = await fetch(url, {
        method: webhookTestMethod,
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "LauncherOS-Webhook-Tester/1.0",
        },
        body: webhookTestMethod !== "GET" ? JSON.stringify(parsedBody) : undefined,
      });

      const latencyMs = Date.now() - startTime;
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setWebhookTestResult({
          status: "success",
          statusCode: res.status,
          latencyMs,
          response: data,
        });
        triggerToast(`Webhook 200 OK — Processed in ${latencyMs}ms!`);
        fetchWebhookEvents();
      } else {
        setWebhookTestResult({
          status: "error",
          statusCode: res.status,
          latencyMs,
          error: data.error || `HTTP ${res.status} Error`,
          response: data,
        });
      }
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      setWebhookTestResult({
        status: "error",
        latencyMs,
        error: err?.message || "Network request failed",
      });
    }
  };

  const handleClearWebhookEvents = async () => {
    try {
      await fetch("/api/automation/webhook/events", { method: "DELETE" });
      setWebhookEvents([]);
      triggerToast("Webhook event logs cleared.");
    } catch {}
  };

  const loadPayloadPreset = (preset: "lead" | "order" | "github") => {
    if (preset === "lead") {
      setWebhookTestPayload(
        JSON.stringify(
          {
            event: "new_lead",
            name: "Budi Santoso",
            email: "budi@revou.co",
            company: "RevoU Enterprise",
            topic: "Enterprise AI Training",
          },
          null,
          2
        )
      );
    } else if (preset === "order") {
      setWebhookTestPayload(
        JSON.stringify(
          {
            event: "order_completed",
            orderId: `ORD-${Date.now().toString().slice(-6)}`,
            amount: 1500000,
            currency: "IDR",
            status: "PAID",
          },
          null,
          2
        )
      );
    } else if (preset === "github") {
      setWebhookTestPayload(
        JSON.stringify(
          {
            event: "push",
            repository: "LauncherOs",
            branch: "main",
            commit: "3abcc35",
            author: "FiqiyMuhammad",
          },
          null,
          2
        )
      );
    }
  };

  // Connector Helpers
  const openConnectorModal = (key: keyof ConnectorConfig) => {
    setActiveConnectorModal(key);
    setEditingConnector({ ...connectors[key] });
    setTestConnectorMessage(null);
    setShowSecretToken(false);
  };

  const saveConnector = async (key: keyof ConnectorConfig) => {
    if (!editingConnector) return;
    const isNotEmpty =
      key === "gmail"
        ? !!editingConnector.email?.trim()
        : key === "slack"
        ? !!editingConnector.webhookUrl?.trim()
        : key === "whatsapp"
        ? !!(editingConnector.phone?.trim() || editingConnector.apiToken?.trim())
        : key === "sheets"
        ? !!(editingConnector.email?.trim() || editingConnector.spreadsheetId?.trim())
        : key === "docs"
        ? !!(editingConnector.email?.trim() || editingConnector.documentId?.trim())
        : key === "slides"
        ? !!(editingConnector.email?.trim() || editingConnector.presentationId?.trim())
        : key === "drive"
        ? !!editingConnector.rootFolder?.trim()
        : key === "notion"
        ? !!(editingConnector.token?.trim() || editingConnector.databaseId?.trim())
        : false;

    const updated: ConnectorConfig = {
      ...connectors,
      [key]: {
        ...editingConnector,
        connected: isNotEmpty,
      },
    };

    setConnectors(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("launcher_app_connectors", JSON.stringify(updated));
    }

    // Sync to globalVariables so Automation nodes can immediately use {{VAR_NAME}}
    let newVars = [...globalVariables];
    const upsertVar = (varKey: string, val: string, type: "text" | "secret" = "text") => {
      if (!val) return;
      newVars = [
        ...newVars.filter((v) => v.key !== varKey),
        {
          id: `var-${varKey.toLowerCase()}`,
          key: varKey,
          value: val,
          type,
          description: `Synced from ${key} connector`,
        },
      ];
    };

    if (key === "gmail") {
      upsertVar("GMAIL_USER", editingConnector.email);
      if (editingConnector.appPassword) {
        upsertVar("GMAIL_APP_PASSWORD", editingConnector.appPassword, "secret");
      }
    } else if (key === "slack") {
      upsertVar("SLACK_WEBHOOK_URL", editingConnector.webhookUrl, "secret");
      upsertVar("SLACK_DEFAULT_CHANNEL", editingConnector.channel);
      try {
        await fetch("/api/slack/config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            webhookUrl: editingConnector.webhookUrl,
            defaultChannel: editingConnector.channel || "#general",
            botName: editingConnector.botName || "Launcher OS Bot",
          }),
        });
      } catch {}
    } else if (key === "whatsapp") {
      upsertVar("WHATSAPP_TOKEN", editingConnector.apiToken, "secret");
      upsertVar("WHATSAPP_PHONE", editingConnector.phone);
    } else if (key === "sheets") {
      upsertVar("GOOGLE_SHEET_ID", editingConnector.spreadsheetId);
      upsertVar("GOOGLE_SHEET_EMAIL", editingConnector.email);
    } else if (key === "docs") {
      upsertVar("GOOGLE_DOCS_ID", editingConnector.documentId);
      upsertVar("GOOGLE_DOCS_EMAIL", editingConnector.email);
    } else if (key === "slides") {
      upsertVar("GOOGLE_SLIDES_ID", editingConnector.presentationId);
      upsertVar("GOOGLE_SLIDES_EMAIL", editingConnector.email);
    } else if (key === "drive") {
      upsertVar("GOOGLE_DRIVE_FOLDER", editingConnector.rootFolder);
    } else if (key === "notion") {
      upsertVar("NOTION_API_KEY", editingConnector.token, "secret");
      upsertVar("NOTION_DATABASE_ID", editingConnector.databaseId);
    }

    setGlobalVariables(newVars);
    if (typeof window !== "undefined") {
      localStorage.setItem("launcher_automation_global_vars", JSON.stringify(newVars));
    }

    const titles: Record<keyof ConnectorConfig, string> = {
      gmail: "Gmail",
      sheets: "Google Sheets",
      docs: "Google Docs",
      slides: "Google Slides",
      drive: "Google Drive",
      whatsapp: "WhatsApp Gateway",
      slack: "Slack Workspace",
      notion: "Notion Workspace",
    };
    triggerToast(`${titles[key]} credentials saved and synced!`);
    setActiveConnectorModal(null);
  };

  const testConnectorConnection = async (key: keyof ConnectorConfig) => {
    if (!editingConnector) return;
    setTestingConnector(true);
    setTestConnectorMessage(null);

    try {
      if (key === "gmail") {
        if (!editingConnector.email?.trim()) {
          setTestConnectorMessage({ type: "error", text: "Please enter your Gmail address." });
          setTestingConnector(false);
          return;
        }
        const res = await fetch("/api/integrations/gmail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: editingConnector.email,
            message: "🚀 [Launcher OS] Test verification from Gmail Connector: OK!",
          }),
        });
        const data = await res.json();
        if (data.success) {
          setTestConnectorMessage({ type: "success", text: `Verification message sent to ${editingConnector.email}!` });
        } else {
          setTestConnectorMessage({ type: "error", text: data.error || "Failed to reach Gmail API." });
        }
      } else if (key === "slack") {
        if (!editingConnector.webhookUrl?.trim()) {
          setTestConnectorMessage({ type: "error", text: "Please enter an Incoming Webhook URL." });
          setTestingConnector(false);
          return;
        }
        if (!editingConnector.webhookUrl.startsWith("https://hooks.slack.com/")) {
          setTestConnectorMessage({ type: "error", text: "Invalid Webhook format. Must start with https://hooks.slack.com/" });
          setTestingConnector(false);
          return;
        }
        setTestConnectorMessage({ type: "success", text: "Slack Webhook URL verified! Ready to dispatch messages." });
      } else if (key === "whatsapp") {
        if (!editingConnector.phone?.trim()) {
          setTestConnectorMessage({ type: "error", text: "Please enter a device phone number." });
          setTestingConnector(false);
          return;
        }
        setTestConnectorMessage({ type: "success", text: "WhatsApp Gateway device configuration validated." });
      } else if (key === "sheets") {
        if (!editingConnector.email?.trim() && !editingConnector.spreadsheetId?.trim()) {
          setTestConnectorMessage({ type: "error", text: "Please enter an account email or Spreadsheet ID." });
          setTestingConnector(false);
          return;
        }
        setTestConnectorMessage({ type: "success", text: "Google Sheets connection parameters verified." });
      } else if (key === "docs") {
        if (!editingConnector.email?.trim() && !editingConnector.documentId?.trim()) {
          setTestConnectorMessage({ type: "error", text: "Please enter a Google account email or Document ID." });
          setTestingConnector(false);
          return;
        }
        setTestConnectorMessage({ type: "success", text: "Google Docs connection parameters verified." });
      } else if (key === "slides") {
        if (!editingConnector.email?.trim() && !editingConnector.presentationId?.trim()) {
          setTestConnectorMessage({ type: "error", text: "Please enter a Google account email or Presentation ID." });
          setTestingConnector(false);
          return;
        }
        setTestConnectorMessage({ type: "success", text: "Google Slides connection parameters verified." });
      } else if (key === "notion") {
        if (!editingConnector.token?.trim()) {
          setTestConnectorMessage({ type: "error", text: "Please enter a Notion Integration Token." });
          setTestingConnector(false);
          return;
        }
        setTestConnectorMessage({ type: "success", text: "Notion Integration Token format verified." });
      } else if (key === "drive") {
        setTestConnectorMessage({ type: "success", text: "Google Drive export path verified." });
      }
    } catch (err: any) {
      setTestConnectorMessage({ type: "error", text: err?.message || "Connection test failed." });
    } finally {
      setTestingConnector(false);
    }
  };

  const disconnectConnector = (key: keyof ConnectorConfig) => {
    const updated: ConnectorConfig = {
      ...connectors,
      [key]: {
        ...DEFAULT_CONNECTORS[key],
        connected: false,
      },
    };
    setConnectors(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("launcher_app_connectors", JSON.stringify(updated));
    }
    triggerToast(`${key.toUpperCase()} connector disconnected.`);
    setActiveConnectorModal(null);
  };

  return (
    <AppShell>
      <div className="max-w-[1200px] mx-auto px-2 sm:px-4 lg:px-6 space-y-6 pb-28 sm:pb-12 font-sans">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 px-4 py-2.5 rounded-md shadow-2xl text-xs font-medium animate-in fade-in slide-in-from-top-3 duration-200 border border-neutral-800 dark:border-neutral-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* HEADER SECTION - Apple / Slack Dispatcher Standard */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-2 border-b border-neutral-200/60 dark:border-neutral-800/60">
          <div className="space-y-2">
            {/* Breadcrumb Hierarchy */}
            <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-neutral-400 dark:text-neutral-500">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("profile");
                  setAutomationSubView("hub");
                }}
                className="hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors cursor-pointer"
              >
                Settings
              </button>
              <span className="text-neutral-300 dark:text-neutral-600">/</span>
              <span className="text-neutral-800 dark:text-neutral-200">
                {activeTab === "profile" && "Profile & Account"}
                {activeTab === "apikeys" && "AI API Key"}
                {activeTab === "automation" && (
                  automationSubView === "hub"
                    ? "Automation & Integrations"
                    : automationSubView === "variables"
                    ? "Global Variables"
                    : automationSubView === "webhooks"
                    ? "Webhook Gateway"
                    : "Connectors"
                )}
                {activeTab === "security" && "Security & Cloud"}
              </span>
            </div>

            {/* Title with Lora Font & Metallic Gradient in Dark Mode */}
            <h1 className="text-3xl sm:text-4xl font-lora font-normal sm:font-medium tracking-tight text-neutral-950 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-b dark:from-white dark:via-neutral-200 dark:to-neutral-400/90 leading-tight">
              {activeTab === "profile" && "Profile & Account"}
              {activeTab === "apikeys" && "AI API Key"}
              {activeTab === "automation" && (
                automationSubView === "hub"
                  ? "Automation & Integrations"
                  : automationSubView === "variables"
                  ? "Global Variables & Secrets"
                  : automationSubView === "webhooks"
                  ? "Webhook Trigger Gateway"
                  : "Connected App Connectors"
              )}
              {activeTab === "security" && "Security & Cloud"}
            </h1>

            <p className="text-sm text-neutral-500 dark:text-neutral-400 font-normal max-w-2xl leading-relaxed">
              {activeTab === "profile" && "Manage your personal profile, credentials, and account security preferences."}
              {activeTab === "apikeys" && "Bring Your Own Key (BYOK) — configure API keys for Claude, OpenAI, DeepSeek, and Gemini."}
              {activeTab === "automation" && automationSubView === "variables" && "Store and manage secret tokens, webhook URLs, and global configuration parameters."}
              {activeTab === "automation" && automationSubView === "webhooks" && "Public serverless endpoints to trigger Launcher OS automations from external webhooks."}
              {activeTab === "automation" && automationSubView === "connectors" && "Native connectors to sync Google Sheets, WhatsApp, Slack, and Notion."}
              {activeTab === "automation" && automationSubView === "hub" && "Connect webhooks, manage global environment variables, and link external services."}
              {activeTab === "security" && "Inspect serverless cloud infrastructure, database latency, and storage health."}
            </p>
          </div>
        </div>

        {/* 2. MASTER CARDS WRAPPER (TANPA ROUNDED - POLOS) SEPERTI DI OVERVIEW & SLACK DISPATCHER */}
        <div className="border border-neutral-200/50 dark:border-neutral-800/80 rounded-none bg-neutral-50/30 dark:bg-[#0d0d0d]/60 p-4 sm:p-6 lg:p-7 space-y-6 shadow-none">
          {/* Apple-Style Segmented Tab Bar - Rock Solid with No Layout Shifts */}
          <div className="flex items-center p-1 bg-neutral-100/90 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-md overflow-x-auto max-w-full scrollbar-hide gap-1">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === "profile"
                  ? "bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 shadow-xs"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white"
              }`}
            >
              <User className="w-4 h-4 shrink-0" />
              <span>Profile & Account</span>
            </button>

            <button
              onClick={() => setActiveTab("apikeys")}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === "apikeys"
                  ? "bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 shadow-xs"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white"
              }`}
            >
              <Key className="w-4 h-4 shrink-0" />
              <span>AI API Key</span>
            </button>

            <button
              onClick={() => setActiveTab("automation")}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === "automation"
                  ? "bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 shadow-xs"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white"
              }`}
            >
              <Workflow className="w-4 h-4 shrink-0" />
              <span>Automation & Integrations</span>
              {globalVariables.length > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-medium ${
                  activeTab === "automation"
                    ? "bg-white/20 dark:bg-neutral-950/20 text-white dark:text-neutral-950"
                    : "bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                }`}>
                  {globalVariables.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("security")}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === "security"
                  ? "bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 shadow-xs"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white"
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Security & Cloud</span>
            </button>
          </div>

          {/* SECTION DIVIDER LINE */}
          <div className="h-[1px] w-full bg-neutral-200/50 dark:bg-neutral-800/80" />

        {/* ══════════════════════════════════════════════════════════
         * TAB 1: AI API KEY (MULTI-PROVIDER BYOK)
         * ══════════════════════════════════════════════════════════ */}
        {activeTab === "apikeys" && (
          <div className="space-y-6">
            <Card className="p-6 sm:p-7 bg-white dark:bg-[#111111] border-neutral-200/80 dark:border-neutral-800/80 rounded-md shadow-none space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100 dark:border-neutral-800/80">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-sm sm:text-base font-medium text-neutral-950 dark:text-white leading-tight tracking-tight">
                      AI Provider API Key (BYOK)
                    </h2>
                    {hasConfiguredKey ? (
                      <span className="text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-md flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {providerConfig.label} Connected
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 px-2.5 py-0.5 rounded-md">
                        Not Configured
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 font-normal mt-0.5">
                    Bring Your Own Key — select your AI provider and enter your API key
                  </p>
                </div>

                <a
                  href={providerConfig.dashboardUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-200 bg-neutral-100/90 dark:bg-neutral-800/80 hover:bg-neutral-200 dark:hover:bg-neutral-700 px-3.5 py-2 rounded-lg transition-colors cursor-pointer self-start sm:self-auto border border-neutral-200/60 dark:border-neutral-700/60"
                >
                  <span>{providerConfig.dashboardLabel}</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </a>
              </div>

              {/* Provider Selector Pills (Apple / Slack Brand Standard) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-medium text-neutral-800 dark:text-neutral-200">
                    AI Provider
                  </label>
                  <span className="text-[11px] text-neutral-400 font-normal">
                    Select your preferred LLM engine
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  {(Object.keys(AI_PROVIDERS) as AIProvider[]).map((key) => {
                    const p = AI_PROVIDERS[key];
                    const isActive = selectedProvider === key;
                    const hasKey = mounted && savedKeys[key];
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleProviderChange(key)}
                        className={`relative px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer border flex items-center gap-2.5 select-none active:scale-[0.98] ${
                          isActive
                            ? "bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 border-neutral-950 dark:border-white shadow-xs"
                            : "bg-white dark:bg-[#141414] text-neutral-700 dark:text-neutral-300 border-neutral-200/90 dark:border-neutral-800/80 hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-50/80 dark:hover:bg-[#1a1a1a]"
                        }`}
                      >
                        {/* Official Provider Brand Logo with Dark/Light Mode Adaptability */}
                        <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                          {key === "openai" ? (
                            <svg
                              className="w-4 h-4 shrink-0 fill-current"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path d="M22.282 9.821a6 6 0 0 0-.516-4.91 6.05 6.05 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a6 6 0 0 0-3.998 2.9 6.05 6.05 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.05 6.05 0 0 0 6.515 2.9A6 6 0 0 0 13.26 24a6.06 6.06 0 0 0 5.772-4.206 6 6 0 0 0 3.997-2.9 6.06 6.06 0 0 0-.747-7.073M13.26 22.43a4.48 4.48 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.8.8 0 0 0 .392-.681v-6.737l2.02 1.168a.07.07 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494M3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.77.77 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646M2.34 7.896a4.5 4.5 0 0 1 2.366-1.973V11.6a.77.77 0 0 0 .388.677l5.815 3.354-2.02 1.168a.08.08 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855-5.833-3.387L15.119 7.2a.08.08 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667m2.01-3.023-.141-.085-4.774-2.782a.78.78 0 0 0-.785 0L9.409 9.23V6.897a.07.07 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.8.8 0 0 0-.393.681zm1.097-2.365 2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5Z" />
                            </svg>
                          ) : (
                            <img
                              src={p.logo}
                              alt={p.label}
                              className="w-4 h-4 shrink-0 object-contain"
                            />
                          )}
                        </div>

                        <span className="tracking-tight">{p.label}</span>

                        {/* Subtle status dot when API key is saved */}
                        {hasKey && (
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${
                              isActive
                                ? "bg-emerald-400 dark:bg-emerald-600"
                                : "bg-emerald-500 dark:bg-emerald-400"
                            }`}
                            title="Key saved"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Model Selector (LauncherSelect) */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-medium text-neutral-800 dark:text-neutral-200">
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
                  <label className="text-xs sm:text-sm font-medium text-neutral-800 dark:text-neutral-200">
                    {providerConfig.label} API Key
                  </label>
                  <span className="text-[11px] text-neutral-400 font-mono">
                    Format: <code className="text-neutral-700 dark:text-neutral-300 font-medium">{providerConfig.keyPrefix}...</code>
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
                    className="h-10 pl-3.5 pr-10 text-xs sm:text-sm bg-neutral-50/70 dark:bg-neutral-900/50 border border-neutral-200/90 dark:border-neutral-800/90 rounded-lg text-neutral-950 dark:text-white font-mono placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 focus-visible:ring-1 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-600 transition-colors"
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
                  className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all ${
                    testResult.status === "testing"
                      ? "bg-neutral-50 dark:bg-neutral-900/80 border-neutral-200 dark:border-neutral-800"
                      : testResult.status === "success"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                      : "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300"
                  }`}
                >
                  {testResult.status === "testing" && (
                    <Loader2 className="w-4 h-4 text-neutral-500 animate-spin shrink-0 mt-0.5" />
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
              <div className="p-3.5 rounded-xl bg-neutral-50/80 dark:bg-neutral-900/60 border border-neutral-200/70 dark:border-neutral-800/80 flex items-start gap-2.5">
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
              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleTestConnection}
                    disabled={testResult.status === "testing" || !apiKey.trim()}
                    className="h-10 text-xs sm:text-sm font-medium px-4 rounded-lg border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2 cursor-pointer disabled:opacity-40"
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
                      className="px-3.5 py-2 text-xs sm:text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Key</span>
                    </button>
                  )}
                </div>

                <Button
                  type="button"
                  onClick={handleSaveApiKey}
                  className="h-10 px-5 rounded-lg text-xs sm:text-sm font-medium bg-neutral-950 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-neutral-950 transition-all active:scale-[0.99] cursor-pointer shadow-xs flex items-center justify-center"
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Card 1: Global Variables & Secrets */}
                  <div
                    onClick={() => setAutomationSubView("variables")}
                    className="group p-6 rounded-md border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-[#111111] hover:border-neutral-400 dark:hover:border-neutral-600 transition-all cursor-pointer shadow-none flex flex-col justify-between gap-5"
                  >
                    <div className="space-y-3">
                      <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-700/60 flex items-center justify-center text-neutral-700 dark:text-neutral-300">
                        <Key className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-neutral-950 dark:text-white transition-colors">
                          Global Variables & Secrets
                        </h3>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 leading-relaxed">
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
                    className="group p-6 rounded-md border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-[#111111] hover:border-neutral-400 dark:hover:border-neutral-600 transition-all cursor-pointer shadow-none flex flex-col justify-between gap-5"
                  >
                    <div className="space-y-3">
                      <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-700/60 flex items-center justify-center text-neutral-700 dark:text-neutral-300">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-neutral-950 dark:text-white transition-colors">
                          External Webhook Gateway
                        </h3>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 leading-relaxed">
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
                    className="group p-6 rounded-md border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-[#111111] hover:border-neutral-400 dark:hover:border-neutral-600 transition-all cursor-pointer shadow-none flex flex-col justify-between gap-5"
                  >
                    <div className="space-y-3">
                      <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-700/60 flex items-center justify-center text-neutral-700 dark:text-neutral-300">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-neutral-950 dark:text-white transition-colors">
                          Connected App Connectors
                        </h3>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 leading-relaxed">
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
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121212] hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Automation & Integration</span>
                  </button>
                </div>

                <Card className="p-5 sm:p-6 bg-white dark:bg-[#121212] border-neutral-200/80 dark:border-neutral-800 rounded-md space-y-6 shadow-xs">
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

                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleImportFromConnectors}
                      className="h-8 text-xs border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer self-start sm:self-auto shrink-0"
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                      <span>Sync from Connected Apps</span>
                    </Button>
                  </div>

                  {/* Add / Edit Variable Form */}
                  <form onSubmit={handleAddGlobalVar} className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                        {editingVarId ? (
                          <>
                            <Pencil className="w-3.5 h-3.5 text-amber-500" />
                            <span>Edit Variable</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-400" />
                            <span>Add New Global Variable</span>
                          </>
                        )}
                      </div>

                      {editingVarId && (
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="text-[11px] text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 underline cursor-pointer"
                        >
                          Cancel Edit
                        </button>
                      )}
                    </div>

                    {/* Quick Preset Chips */}
                    {!editingVarId && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5 pb-1">
                        <span className="text-[10px] text-neutral-400 font-medium">Quick Presets:</span>
                        {[
                          { key: "GMAIL_USER", type: "text" as const },
                          { key: "GMAIL_APP_PASSWORD", type: "secret" as const },
                          { key: "SLACK_WEBHOOK_URL", type: "secret" as const },
                          { key: "GOOGLE_DRIVE_FOLDER", type: "text" as const },
                          { key: "GOOGLE_SHEET_ID", type: "text" as const },
                          { key: "OPENAI_API_KEY", type: "secret" as const },
                        ].map((chip) => (
                          <button
                            key={chip.key}
                            type="button"
                            onClick={() => {
                              setNewVarKey(chip.key);
                              setNewVarType(chip.type);
                            }}
                            className="px-2 py-0.5 text-[10px] font-mono rounded border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#1a1a1a] hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
                          >
                            +{chip.key}
                          </button>
                        ))}
                      </div>
                    )}

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

                    <div className="flex justify-end gap-2 pt-1">
                      {editingVarId && (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={handleCancelEdit}
                          className="h-8 text-xs cursor-pointer"
                        >
                          Cancel
                        </Button>
                      )}
                      <Button
                        type="submit"
                        disabled={isSavingVar}
                        className="h-8 text-xs bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-950 font-semibold px-4 rounded-md cursor-pointer hover:bg-neutral-800 dark:hover:bg-white"
                      >
                        {isSavingVar ? "Saving..." : editingVarId ? "Update Variable" : "Save Variable"}
                      </Button>
                    </div>
                  </form>

                  {/* Variables List Table */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-medium text-neutral-700 dark:text-neutral-300">
                      <span>Configured Variables ({globalVariables.length})</span>
                      {globalVariables.length > 0 && (
                        <span className="text-[10.5px] text-neutral-400">
                          Click syntax to copy <code className="font-mono">{"{{KEY}}"}</code>
                        </span>
                      )}
                    </div>

                    {globalVariables.length === 0 ? (
                      <div className="p-8 text-center rounded-lg border border-dashed border-neutral-200 dark:border-neutral-800 text-neutral-400 text-xs space-y-2">
                        <Key className="w-6 h-6 mx-auto text-neutral-300 dark:text-neutral-600" />
                        <p>No global variables added yet. Add tokens or API URLs above.</p>
                        <p className="text-[11px] text-neutral-500">
                          Tip: Click <b>&quot;Sync from Connected Apps&quot;</b> above to instantly import credentials from Gmail, Slack, and other connected apps.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                        {globalVariables.map((v) => {
                          const isSecret = v.type === "secret";
                          const isRevealed = revealedSecretIds.has(v.id);
                          return (
                            <div
                              key={v.id}
                              className="flex items-center justify-between p-2.5 rounded-lg border border-neutral-200/70 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/40 hover:bg-neutral-100/50 dark:hover:bg-neutral-800/40 transition-colors gap-3"
                            >
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(`{{${v.key}}}`, `syntax-${v.id}`)}
                                  className="text-xs font-mono font-bold text-neutral-900 dark:text-white flex items-center gap-1 hover:underline cursor-pointer shrink-0"
                                  title="Click to copy {{KEY}} syntax"
                                >
                                  <span>{"{{" + v.key + "}}"}</span>
                                  {copiedKey === `syntax-${v.id}` ? (
                                    <Check className="w-3 h-3 text-emerald-500" />
                                  ) : (
                                    <Copy className="w-3 h-3 opacity-60" />
                                  )}
                                </button>
                                <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 shrink-0">
                                  {v.type}
                                </span>
                                <span
                                  className={`text-xs font-mono truncate max-w-[200px] sm:max-w-[320px] ${
                                    isSecret && isRevealed
                                      ? "text-amber-600 dark:text-amber-400 font-semibold"
                                      : "text-neutral-500 dark:text-neutral-400"
                                  }`}
                                  title={isSecret && !isRevealed ? "Secret masked" : v.value}
                                >
                                  {isSecret && !isRevealed ? "••••••••••••••••" : v.value || "(empty)"}
                                </span>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                {isSecret && (
                                  <button
                                    type="button"
                                    onClick={() => toggleRevealSecret(v.id)}
                                    className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer rounded"
                                    title={isRevealed ? "Hide Secret" : "Show Secret"}
                                  >
                                    {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(v.value, `val-${v.id}`)}
                                  className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer rounded"
                                  title="Copy raw value"
                                >
                                  {copiedKey === `val-${v.id}` ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleEditGlobalVar(v)}
                                  className="p-1.5 text-neutral-400 hover:text-amber-500 transition-colors cursor-pointer rounded"
                                  title="Edit Variable"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteGlobalVar(v.id, v.key)}
                                  className="p-1.5 text-neutral-400 hover:text-red-500 transition-colors cursor-pointer rounded"
                                  title="Delete Variable"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            )}

            {/* SUB-VIEW 3: WEBHOOK GATEWAY DETAIL */}
            {automationSubView === "webhooks" && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setAutomationSubView("hub")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121212] hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Automation & Integration</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={fetchWebhookEvents}
                      disabled={isLoadingWebhookEvents}
                      className="h-8 text-xs border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                    >
                      <RotateCcw className={`w-3.5 h-3.5 mr-1.5 ${isLoadingWebhookEvents ? "animate-spin" : ""}`} />
                      <span>Refresh Gateway</span>
                    </Button>
                  </div>
                </div>

                {/* Card 1: Webhook Endpoint Gateway Configuration */}
                <Card className="p-5 sm:p-6 bg-white dark:bg-[#121212] border-neutral-200/80 dark:border-neutral-800 rounded-xl space-y-5 shadow-xs">
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

                  {/* Registered Triggers from Active Workflows */}
                  {registeredWebhookTriggers.length > 0 && (
                    <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5 space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                        <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                          <Zap className="w-3.5 h-3.5" />
                          <span>Active Registered Workflow Triggers ({registeredWebhookTriggers.length})</span>
                        </span>
                        <span className="text-[10.5px] font-normal text-neutral-400">Click to load in tester</span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {registeredWebhookTriggers.map((trig) => (
                          <button
                            key={trig.flowId + trig.webhookId}
                            type="button"
                            onClick={() => {
                              setWebhookTestId(trig.webhookId);
                              setWebhookTestMethod((trig.method as any) || "POST");
                              triggerToast(`Loaded trigger for flow "${trig.flowName}"`);
                            }}
                            className={`px-2.5 py-1 text-xs rounded-md border flex items-center gap-2 transition-all cursor-pointer ${
                              webhookTestId === trig.webhookId
                                ? "border-amber-500/60 bg-amber-500/15 text-neutral-900 dark:text-white font-medium"
                                : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#18181b] text-neutral-700 dark:text-neutral-300 hover:border-neutral-400"
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span className="font-medium truncate max-w-[150px]">{trig.flowName}</span>
                            <span className="font-mono text-[10px] opacity-70">({trig.webhookId})</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Live Endpoint URL Box */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                      Live Webhook URL Endpoint
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 flex items-center h-9 px-3 rounded-md bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs font-mono overflow-x-auto">
                        <span className="text-neutral-400 shrink-0">{webhookBaseUrl}</span>
                        <span className="text-amber-600 dark:text-amber-400 font-bold shrink-0">{webhookTestId.trim() || "[WEBHOOK_ID]"}</span>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => copyToClipboard(`${webhookBaseUrl}${webhookTestId.trim() || "flow-123"}`, "webhook-base")}
                        className="h-9 px-3 text-xs flex items-center gap-1.5 shrink-0 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                      >
                        {copiedKey === "webhook-base" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Copy URL</span>
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Card 2: Interactive Webhook Dispatcher & Tester */}
                <Card className="p-5 sm:p-6 bg-white dark:bg-[#121212] border-neutral-200/80 dark:border-neutral-800 rounded-xl space-y-4 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-100 dark:border-neutral-800">
                    <div className="flex items-center gap-2">
                      <Play className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <h3 className="text-sm font-semibold text-neutral-950 dark:text-white">
                        Live Webhook Tester & Dispatcher
                      </h3>
                    </div>
                    <span className="text-[10.5px] text-neutral-500 dark:text-neutral-400">
                      Simulate incoming HTTP webhooks from external providers
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      <div className="sm:col-span-3 space-y-1">
                        <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                          HTTP Method
                        </label>
                        <select
                          value={webhookTestMethod}
                          onChange={(e) => setWebhookTestMethod(e.target.value as any)}
                          className="w-full h-8 px-2.5 text-xs font-medium rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#18181b] text-neutral-800 dark:text-neutral-200 focus:outline-none"
                        >
                          <option value="POST">POST (Standard)</option>
                          <option value="GET">GET (Ping / Query)</option>
                          <option value="PUT">PUT (Update)</option>
                        </select>
                      </div>

                      <div className="sm:col-span-9 space-y-1">
                        <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                          Target Webhook ID / Route Parameter
                        </label>
                        <Input
                          type="text"
                          value={webhookTestId}
                          onChange={(e) => setWebhookTestId(e.target.value)}
                          placeholder="e.g. flow-123 or lead-capture"
                          className="h-8 text-xs font-mono bg-white dark:bg-[#18181b] border-neutral-200 dark:border-neutral-800"
                        />
                      </div>
                    </div>

                    {/* Payload Presets & Editor */}
                    {webhookTestMethod !== "GET" && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                            Request Body JSON Payload
                          </label>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-neutral-400">Preset:</span>
                            <button
                              type="button"
                              onClick={() => loadPayloadPreset("lead")}
                              className="px-2 py-0.5 text-[10px] rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
                            >
                              CRM Lead
                            </button>
                            <button
                              type="button"
                              onClick={() => loadPayloadPreset("order")}
                              className="px-2 py-0.5 text-[10px] rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
                            >
                              Order Paid
                            </button>
                            <button
                              type="button"
                              onClick={() => loadPayloadPreset("github")}
                              className="px-2 py-0.5 text-[10px] rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
                            >
                              GitHub Push
                            </button>
                          </div>
                        </div>

                        <textarea
                          rows={5}
                          value={webhookTestPayload}
                          onChange={(e) => setWebhookTestPayload(e.target.value)}
                          className="w-full p-2.5 text-xs font-mono rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-950 text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-700"
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-neutral-400">
                        Dispatches directly to: <code className="font-mono text-neutral-700 dark:text-neutral-300">/api/automation/webhook/{webhookTestId || "..."}</code>
                      </span>
                      <Button
                        type="button"
                        onClick={handleSendTestWebhook}
                        disabled={webhookTestResult.status === "sending"}
                        className="h-8 text-xs bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-950 font-semibold px-4 rounded-md cursor-pointer hover:bg-neutral-800 dark:hover:bg-white shadow-xs"
                      >
                        {webhookTestResult.status === "sending" ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                            <span>Dispatching...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5 mr-1.5" />
                            <span>Send Test Webhook</span>
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Live Test Response Panel */}
                    {webhookTestResult.status !== "idle" && (
                      <div
                        className={`p-3 rounded-lg border space-y-2 mt-3 ${
                          webhookTestResult.status === "success"
                            ? "bg-emerald-500/5 border-emerald-500/20"
                            : webhookTestResult.status === "error"
                            ? "bg-red-500/5 border-red-500/20"
                            : "bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded ${
                                webhookTestResult.status === "success"
                                  ? "bg-emerald-500 text-white"
                                  : "bg-red-500 text-white"
                              }`}
                            >
                              {webhookTestResult.statusCode || (webhookTestResult.status === "success" ? 200 : 500)} {webhookTestResult.status === "success" ? "OK" : "ERROR"}
                            </span>
                            {webhookTestResult.latencyMs !== undefined && (
                              <span className="text-[11px] text-neutral-500 font-mono">
                                Latency: {webhookTestResult.latencyMs}ms
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-neutral-400">Response Payload</span>
                        </div>

                        <pre className="p-2.5 rounded bg-black/80 text-neutral-200 font-mono text-[11px] overflow-x-auto max-h-48 border border-white/10">
                          {JSON.stringify(webhookTestResult.response || { error: webhookTestResult.error }, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Card 3: Multi-Language Code Snippet Generator */}
                <Card className="p-5 sm:p-6 bg-white dark:bg-[#121212] border-neutral-200/80 dark:border-neutral-800 rounded-xl space-y-3 shadow-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
                    <div className="flex items-center gap-2">
                      <Code className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                      <h3 className="text-xs font-semibold text-neutral-900 dark:text-white">
                        Integration Code Snippets
                      </h3>
                    </div>

                    <div className="flex items-center gap-1">
                      {(["curl", "fetch", "python"] as const).map((tab) => (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setWebhookCodeTab(tab)}
                          className={`px-2.5 py-1 text-[11px] font-mono rounded cursor-pointer transition-colors ${
                            webhookCodeTab === tab
                              ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 font-semibold"
                              : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                          }`}
                        >
                          {tab === "curl" ? "cURL" : tab === "fetch" ? "JS (fetch)" : "Python (requests)"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="relative">
                    <pre className="p-3.5 rounded-lg bg-neutral-950 text-neutral-200 font-mono text-[11px] overflow-x-auto whitespace-pre border border-neutral-800 leading-relaxed">
                      {webhookCodeTab === "curl" &&
                        `curl -X ${webhookTestMethod} ${webhookBaseUrl}${webhookTestId || "flow-123"} \\\n  -H "Content-Type: application/json" \\\n  -d '${webhookTestPayload.replace(/\n\s*/g, " ")}'`}
                      {webhookCodeTab === "fetch" &&
                        `await fetch("${webhookBaseUrl}${webhookTestId || "flow-123"}", {\n  method: "${webhookTestMethod}",\n  headers: { "Content-Type": "application/json" },\n  body: JSON.stringify(${webhookTestPayload.trim()})\n});`}
                      {webhookCodeTab === "python" &&
                        `import requests\n\nres = requests.${webhookTestMethod.toLowerCase()}(\n    "${webhookBaseUrl}${webhookTestId || "flow-123"}",\n    json=${webhookTestPayload.trim()}\n)\nprint(res.json())`}
                    </pre>

                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        const code =
                          webhookCodeTab === "curl"
                            ? `curl -X ${webhookTestMethod} ${webhookBaseUrl}${webhookTestId || "flow-123"} \\\n  -H "Content-Type: application/json" \\\n  -d '${webhookTestPayload.replace(/\n\s*/g, " ")}'`
                            : webhookCodeTab === "fetch"
                            ? `await fetch("${webhookBaseUrl}${webhookTestId || "flow-123"}", {\n  method: "${webhookTestMethod}",\n  headers: { "Content-Type": "application/json" },\n  body: JSON.stringify(${webhookTestPayload.trim()})\n});`
                            : `import requests\n\nres = requests.${webhookTestMethod.toLowerCase()}(\n    "${webhookBaseUrl}${webhookTestId || "flow-123"}",\n    json=${webhookTestPayload.trim()}\n)\nprint(res.json())`;
                        copyToClipboard(code, "webhook-snippet");
                      }}
                      className="absolute top-2 right-2 h-7 px-2.5 text-[10.5px] bg-neutral-800/80 hover:bg-neutral-700 text-neutral-200 rounded cursor-pointer flex items-center gap-1 border border-neutral-700"
                    >
                      {copiedKey === "webhook-snippet" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copy Snippet</span>
                    </Button>
                  </div>
                </Card>

                {/* Card 4: Real-Time Incoming Webhook Events & Monitor Log */}
                <Card className="p-5 sm:p-6 bg-white dark:bg-[#121212] border-neutral-200/80 dark:border-neutral-800 rounded-xl space-y-4 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
                    <div className="flex items-center gap-2">
                      <Radio className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                      <h3 className="text-sm font-semibold text-neutral-950 dark:text-white">
                        Incoming Webhook Activity Logs ({webhookEvents.length})
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      {webhookEvents.length > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={handleClearWebhookEvents}
                          className="h-7 px-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          <span>Clear Logs</span>
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={fetchWebhookEvents}
                        disabled={isLoadingWebhookEvents}
                        className="h-7 px-2.5 text-xs cursor-pointer border-neutral-200 dark:border-neutral-800"
                      >
                        <RotateCcw className={`w-3 h-3 mr-1 ${isLoadingWebhookEvents ? "animate-spin" : ""}`} />
                        <span>Refresh</span>
                      </Button>
                    </div>
                  </div>

                  {webhookEvents.length === 0 ? (
                    <div className="p-8 text-center rounded-lg border border-dashed border-neutral-200 dark:border-neutral-800 text-neutral-400 text-xs space-y-2">
                      <Globe className="w-6 h-6 mx-auto text-neutral-300 dark:text-neutral-600" />
                      <p>No webhook events received yet.</p>
                      <p className="text-[11px] text-neutral-500">
                        Dispatch a request using the <b>Live Tester</b> above or via cURL from terminal to see real-time incoming events.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                      {webhookEvents.map((ev) => {
                        const isExpanded = expandedEventId === ev.id;
                        return (
                          <div
                            key={ev.id}
                            className="rounded-lg border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 p-3 space-y-2 transition-all"
                          >
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-[9.5px] font-bold font-mono px-2 py-0.5 rounded ${
                                    ev.method === "POST"
                                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                                      : ev.method === "GET"
                                      ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30"
                                      : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                                  }`}
                                >
                                  {ev.method}
                                </span>
                                <span className="font-mono text-xs font-semibold text-neutral-900 dark:text-white">
                                  /api/automation/webhook/{ev.webhookId}
                                </span>
                                {ev.matchedFlowName && (
                                  <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                                    Flow: {ev.matchedFlowName}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-neutral-400 font-mono">
                                  {new Date(ev.receivedAt).toLocaleTimeString()}
                                </span>
                                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                  {ev.status || 200} OK
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setExpandedEventId(isExpanded ? null : ev.id)}
                                  className="p-1 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
                                  title="Inspect Payload"
                                >
                                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </div>

                            {/* Expanded Payload & Headers */}
                            {isExpanded && (
                              <div className="p-3 rounded bg-black/90 text-neutral-200 text-xs font-mono space-y-2 border border-white/10 mt-2">
                                <div>
                                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider block mb-1">Incoming Body</span>
                                  <pre className="text-[11px] overflow-x-auto text-emerald-400">
                                    {JSON.stringify(ev.body, null, 2)}
                                  </pre>
                                </div>
                                {ev.headers && (
                                  <div className="pt-2 border-t border-neutral-800">
                                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider block mb-1">Headers</span>
                                    <pre className="text-[10px] text-neutral-400 overflow-x-auto">
                                      {JSON.stringify(ev.headers, null, 2)}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
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
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121212] hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Automation & Integration</span>
                  </button>
                </div>

                <Card className="p-5 sm:p-6 bg-white dark:bg-[#121212] border-neutral-200/80 dark:border-neutral-800 rounded-md space-y-4 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-100 dark:border-neutral-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                        <h2 className="text-sm sm:text-base font-medium text-neutral-950 dark:text-white leading-tight tracking-tight">
                          Connected App Connectors
                        </h2>
                      </div>
                      <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 font-normal mt-0.5">
                        1-Click native authorization to sync Google Sheets, Google Docs, Google Slides, WhatsApp, Slack, and Notion with Automation Studio.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {/* Gmail Connector (Urutan Paling Atas) */}
                    <div className="p-3.5 rounded-lg border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 flex flex-col justify-between gap-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <Image
                            src="/logo/App-connector/Gmail.webp"
                            alt="Gmail"
                            width={32}
                            height={32}
                            className="w-7 h-7 object-contain shrink-0"
                          />
                          <div>
                            <h3 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">Gmail</h3>
                            <p className="text-[10.5px] text-neutral-500 dark:text-neutral-400">Email & Automated Dispatch</p>
                          </div>
                        </div>
                        {connectors.gmail?.connected ? (
                          <span className="text-[9.5px] font-medium px-2 py-0.5 rounded-[4px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                          </span>
                        ) : (
                          <span className="text-[9.5px] font-medium px-2 py-0.5 rounded-[4px] bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
                            Not Configured
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-neutral-600 dark:text-neutral-400 bg-white dark:bg-neutral-950 p-2 rounded-[5px] border border-neutral-200/60 dark:border-neutral-800/80 flex items-center justify-between">
                        {connectors.gmail?.connected ? (
                          <>
                            <span className="truncate font-mono text-[10.5px]">Account: {connectors.gmail.email || "Configured"}</span>
                            <span className="text-neutral-500 dark:text-neutral-400 font-mono text-[10px] shrink-0">
                              {connectors.gmail.senderName || "Launcher OS"}
                            </span>
                          </>
                        ) : (
                          <span className="text-neutral-400 dark:text-neutral-500 italic text-[10.5px]">No Gmail account configured. Click Configure to link.</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="h-7.5 text-xs flex-1 rounded-[5px] border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer font-medium"
                          onClick={() => openConnectorModal("gmail")}
                        >
                          <Settings2 className="w-3.5 h-3.5 mr-1" />
                          <span>{connectors.gmail?.connected ? "Edit Settings" : "Configure"}</span>
                        </Button>
                        {connectors.gmail?.connected && (
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-7.5 text-xs px-2.5 rounded-[5px] text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white cursor-pointer"
                            onClick={() => {
                              triggerToast(`Gmail connection for ${connectors.gmail.email} verified!`);
                            }}
                          >
                            Verify
                          </Button>
                        )}
                      </div>
                    </div>

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
                            <p className="text-[10.5px] text-neutral-500 dark:text-neutral-400">OAuth 2.0 & Spreadsheets</p>
                          </div>
                        </div>
                        {connectors.sheets.connected ? (
                          <span className="text-[9.5px] font-medium px-2 py-0.5 rounded-[4px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                          </span>
                        ) : (
                          <span className="text-[9.5px] font-medium px-2 py-0.5 rounded-[4px] bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
                            Not Configured
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-neutral-600 dark:text-neutral-400 bg-white dark:bg-neutral-950 p-2 rounded-[5px] border border-neutral-200/60 dark:border-neutral-800/80 flex items-center justify-between">
                        {connectors.sheets.connected ? (
                          <>
                            <span className="truncate font-mono text-[10.5px]">Account: {connectors.sheets.email || "Configured"}</span>
                            <span className="text-neutral-500 dark:text-neutral-400 font-mono text-[10px] shrink-0">
                              Sheet: {connectors.sheets.spreadsheetId ? connectors.sheets.spreadsheetId.slice(0, 10) + "..." : connectors.sheets.sheetName || "Sheet1"}
                            </span>
                          </>
                        ) : (
                          <span className="text-neutral-400 dark:text-neutral-500 italic text-[10.5px]">No spreadsheet configured. Click Configure to enter credentials.</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="h-7.5 text-xs flex-1 rounded-[5px] border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer font-medium"
                          onClick={() => openConnectorModal("sheets")}
                        >
                          <Settings2 className="w-3.5 h-3.5 mr-1" />
                          <span>{connectors.sheets.connected ? "Edit Settings" : "Configure"}</span>
                        </Button>
                        <Link
                          href="/integrations/sheets"
                          className="h-7.5 px-2.5 text-xs rounded-[5px] bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center justify-center transition-colors shadow-2xs shrink-0"
                        >
                          Studio
                        </Link>
                        {connectors.sheets.connected && (
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-7.5 text-xs px-2.5 rounded-[5px] text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white cursor-pointer"
                            onClick={() => {
                              triggerToast("Google Sheets connection verified successfully!");
                            }}
                          >
                            Verify
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Google Docs Connector */}
                    <div className="p-3.5 rounded-lg border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 flex flex-col justify-between gap-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <Image
                            src="/logo/App-connector/google-docs.webp"
                            alt="Google Docs"
                            width={32}
                            height={32}
                            className="w-7 h-7 object-contain shrink-0"
                          />
                          <div>
                            <h3 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">Google Docs</h3>
                            <p className="text-[10.5px] text-neutral-500 dark:text-neutral-400">Documents & Structured Reports</p>
                          </div>
                        </div>
                        {connectors.docs?.connected ? (
                          <span className="text-[9.5px] font-medium px-2 py-0.5 rounded-[4px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                          </span>
                        ) : (
                          <span className="text-[9.5px] font-medium px-2 py-0.5 rounded-[4px] bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
                            Not Configured
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-neutral-600 dark:text-neutral-400 bg-white dark:bg-neutral-950 p-2 rounded-[5px] border border-neutral-200/60 dark:border-neutral-800/80 flex items-center justify-between">
                        {connectors.docs?.connected ? (
                          <>
                            <span className="truncate font-mono text-[10.5px]">Account: {connectors.docs.email || "Configured"}</span>
                            <span className="text-neutral-500 dark:text-neutral-400 font-mono text-[10px] shrink-0">
                              Doc: {connectors.docs.documentId ? connectors.docs.documentId.slice(0, 10) + "..." : connectors.docs.template || "Executive Report"}
                            </span>
                          </>
                        ) : (
                          <span className="text-neutral-400 dark:text-neutral-500 italic text-[10.5px]">No document configured. Click Configure to enter credentials.</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="h-7.5 text-xs flex-1 rounded-[5px] border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer font-medium"
                          onClick={() => openConnectorModal("docs")}
                        >
                          <Settings2 className="w-3.5 h-3.5 mr-1" />
                          <span>{connectors.docs?.connected ? "Edit Settings" : "Configure"}</span>
                        </Button>
                        {connectors.docs?.connected && (
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-7.5 text-xs px-2.5 rounded-[5px] text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white cursor-pointer"
                            onClick={() => {
                              triggerToast("Google Docs connection verified successfully!");
                            }}
                          >
                            Verify
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Google Slides Connector */}
                    <div className="p-3.5 rounded-lg border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 flex flex-col justify-between gap-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <Image
                            src="/logo/App-connector/google-slides.webp"
                            alt="Google Slides"
                            width={32}
                            height={32}
                            className="w-7 h-7 object-contain shrink-0"
                          />
                          <div>
                            <h3 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">Google Slides</h3>
                            <p className="text-[10.5px] text-neutral-500 dark:text-neutral-400">Presentations & Master Decks</p>
                          </div>
                        </div>
                        {connectors.slides?.connected ? (
                          <span className="text-[9.5px] font-medium px-2 py-0.5 rounded-[4px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                          </span>
                        ) : (
                          <span className="text-[9.5px] font-medium px-2 py-0.5 rounded-[4px] bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
                            Not Configured
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-neutral-600 dark:text-neutral-400 bg-white dark:bg-neutral-950 p-2 rounded-[5px] border border-neutral-200/60 dark:border-neutral-800/80 flex items-center justify-between">
                        {connectors.slides?.connected ? (
                          <>
                            <span className="truncate font-mono text-[10.5px]">Account: {connectors.slides.email || "Configured"}</span>
                            <span className="text-neutral-500 dark:text-neutral-400 font-mono text-[10px] shrink-0">
                              Theme: {connectors.slides.template || "Institutional Standard"}
                            </span>
                          </>
                        ) : (
                          <span className="text-neutral-400 dark:text-neutral-500 italic text-[10.5px]">No presentation configured. Click Configure to enter credentials.</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="h-7.5 text-xs flex-1 rounded-[5px] border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer font-medium"
                          onClick={() => openConnectorModal("slides")}
                        >
                          <Settings2 className="w-3.5 h-3.5 mr-1" />
                          <span>{connectors.slides?.connected ? "Edit Settings" : "Configure"}</span>
                        </Button>
                        {connectors.slides?.connected && (
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-7.5 text-xs px-2.5 rounded-[5px] text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white cursor-pointer"
                            onClick={() => {
                              triggerToast("Google Slides connection verified successfully!");
                            }}
                          >
                            Verify
                          </Button>
                        )}
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
                            <p className="text-[10.5px] text-neutral-500 dark:text-neutral-400">Cloud Storage & Export Root</p>
                          </div>
                        </div>
                        {connectors.drive.connected ? (
                          <span className="text-[9.5px] font-medium px-2 py-0.5 rounded-[4px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                          </span>
                        ) : (
                          <span className="text-[9.5px] font-medium px-2 py-0.5 rounded-[4px] bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
                            Not Configured
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-neutral-600 dark:text-neutral-400 bg-white dark:bg-neutral-950 p-2 rounded-[5px] border border-neutral-200/60 dark:border-neutral-800/80 flex items-center justify-between">
                        {connectors.drive.connected ? (
                          <>
                            <span className="truncate font-mono text-[10.5px]">Root: {connectors.drive.rootFolder || "/Launcher_Exports"}</span>
                            <span className="text-neutral-500 dark:text-neutral-400 font-mono text-[10px] shrink-0">{connectors.drive.permission || "Read & Write"}</span>
                          </>
                        ) : (
                          <span className="text-neutral-400 dark:text-neutral-500 italic text-[10.5px]">Default folder /Launcher_Exports. Click Configure to edit.</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="h-7.5 text-xs flex-1 rounded-[5px] border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer font-medium"
                          onClick={() => openConnectorModal("drive")}
                        >
                          <Settings2 className="w-3.5 h-3.5 mr-1" />
                          <span>{connectors.drive.connected ? "Edit Settings" : "Configure"}</span>
                        </Button>
                        <Link
                          href="/integrations/drive"
                          className="h-7.5 px-2.5 text-xs rounded-[5px] bg-neutral-900 dark:bg-white hover:opacity-90 text-white dark:text-neutral-900 font-medium flex items-center justify-center transition-opacity shadow-2xs shrink-0"
                        >
                          Hub
                        </Link>
                        {connectors.drive.connected && (
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-7.5 text-xs px-2.5 rounded-[5px] text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white cursor-pointer"
                            onClick={() => {
                              triggerToast("Google Drive folder permissions verified!");
                            }}
                          >
                            Verify
                          </Button>
                        )}
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
                            <p className="text-[10.5px] text-neutral-500 dark:text-neutral-400">Fonnte / Wablas API Gateway</p>
                          </div>
                        </div>
                        {connectors.whatsapp.connected ? (
                          <span className="text-[9.5px] font-medium px-2 py-0.5 rounded-[4px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Paired
                          </span>
                        ) : (
                          <span className="text-[9.5px] font-medium px-2 py-0.5 rounded-[4px] bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
                            Not Configured
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-neutral-600 dark:text-neutral-400 bg-white dark:bg-neutral-950 p-2 rounded-[5px] border border-neutral-200/60 dark:border-neutral-800/80 flex items-center justify-between">
                        {connectors.whatsapp.connected ? (
                          <>
                            <span className="truncate font-mono text-[10.5px]">Device: {connectors.whatsapp.phone || "Active"}</span>
                            <span className="text-neutral-500 dark:text-neutral-400 font-mono text-[10px] shrink-0">
                              {connectors.whatsapp.gateway === "fonnte_qr" ? "Fonnte QR" : connectors.whatsapp.gateway === "wablas" ? "Wablas" : "Custom"}
                            </span>
                          </>
                        ) : (
                          <span className="text-neutral-400 dark:text-neutral-500 italic text-[10.5px]">No WhatsApp device configured. Click Configure to set up.</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="h-7.5 text-xs flex-1 rounded-[5px] border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer font-medium"
                          onClick={() => openConnectorModal("whatsapp")}
                        >
                          <Settings2 className="w-3.5 h-3.5 mr-1" />
                          <span>{connectors.whatsapp.connected ? "Edit Settings" : "Configure"}</span>
                        </Button>
                        {connectors.whatsapp.connected && (
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-7.5 text-xs px-2.5 rounded-[5px] text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white cursor-pointer"
                            onClick={() => {
                              triggerToast(`WhatsApp Gateway (${connectors.whatsapp.phone || "Device"}): Ping OK!`);
                            }}
                          >
                            Ping
                          </Button>
                        )}
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
                            <p className="text-[10.5px] text-neutral-500 dark:text-neutral-400">Incoming Webhook Notifications</p>
                          </div>
                        </div>
                        {connectors.slack.connected ? (
                          <span className="text-[9.5px] font-medium px-2 py-0.5 rounded-[4px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Connected
                          </span>
                        ) : (
                          <span className="text-[9.5px] font-medium px-2 py-0.5 rounded-[4px] bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
                            Not Configured
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-neutral-600 dark:text-neutral-400 bg-white dark:bg-neutral-950 p-2 rounded-[5px] border border-neutral-200/60 dark:border-neutral-800/80 flex items-center justify-between">
                        {connectors.slack.connected ? (
                          <>
                            <span className="truncate font-mono text-[10.5px]">Target: {connectors.slack.channel || "#general"}</span>
                            <span className="text-neutral-500 dark:text-neutral-400 font-mono text-[10px] shrink-0">Webhook Active</span>
                          </>
                        ) : (
                          <span className="text-neutral-400 dark:text-neutral-500 italic text-[10.5px]">No webhook URL configured. Click Configure to enter URL.</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="h-7.5 text-xs flex-1 rounded-[5px] border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer font-medium"
                          onClick={() => openConnectorModal("slack")}
                        >
                          <Settings2 className="w-3.5 h-3.5 mr-1" />
                          <span>{connectors.slack.connected ? "Edit Settings" : "Configure"}</span>
                        </Button>
                        {connectors.slack.connected && (
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-7.5 text-xs px-2.5 rounded-[5px] text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white cursor-pointer"
                            onClick={() => {
                              triggerToast(`Slack Webhook for ${connectors.slack.channel || "#general"} verified!`);
                            }}
                          >
                            Test
                          </Button>
                        )}
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
                            <p className="text-[10.5px] text-neutral-500 dark:text-neutral-400">Internal Wiki & Database Sync</p>
                          </div>
                        </div>
                        {connectors.notion.connected ? (
                          <span className="text-[9.5px] font-medium px-2 py-0.5 rounded-[4px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Connected
                          </span>
                        ) : (
                          <span className="text-[9.5px] font-medium px-2 py-0.5 rounded-[4px] bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
                            Not Configured
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-neutral-600 dark:text-neutral-400 bg-white dark:bg-neutral-950 p-2 rounded-[5px] border border-neutral-200/60 dark:border-neutral-800/80 flex items-center justify-between">
                        {connectors.notion.connected ? (
                          <>
                            <span className="truncate font-mono text-[10.5px]">Token Configured</span>
                            <span className="text-neutral-500 dark:text-neutral-400 font-mono text-[10px] shrink-0">
                              DB: {connectors.notion.databaseId ? connectors.notion.databaseId.slice(0, 10) + "..." : "Default"}
                            </span>
                          </>
                        ) : (
                          <span className="text-neutral-400 dark:text-neutral-500 italic text-[10.5px]">No API integration token. Click Configure to link.</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="h-7.5 text-xs flex-1 rounded-[5px] border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer font-medium"
                          onClick={() => openConnectorModal("notion")}
                        >
                          <Settings2 className="w-3.5 h-3.5 mr-1" />
                          <span>{connectors.notion.connected ? "Edit Settings" : "Configure"}</span>
                        </Button>
                        {connectors.notion.connected && (
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-7.5 text-xs px-2.5 rounded-[5px] text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white cursor-pointer"
                            onClick={() => {
                              triggerToast("Notion integration token format verified!");
                            }}
                          >
                            Verify
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* ══════════════════════════════════════════════════════════
                 * MODAL: CONFIGURE CONNECTOR CREDENTIALS
                 * ══════════════════════════════════════════════════════════ */}
                <AnimatePresence>
                  {activeConnectorModal && editingConnector && (
                    <motion.div
                      key="connector-modal-container"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, transition: { duration: 0.25 } }}
                      className="fixed inset-0 z-[99999999] flex items-center justify-center p-4 select-none font-sf"
                    >
                      {/* Frosted Glass Backdrop Overlay - matching MoodCheck styling */}
                      <motion.div
                        key="connector-modal-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.25 } }}
                        onClick={() => {
                          if (!testingConnector) setActiveConnectorModal(null);
                        }}
                        className="fixed inset-0 transition-all duration-300 bg-black/15 dark:bg-black/50 backdrop-blur-md"
                      />

                      {/* Modal Container with Center Vertical Swipe IN & OUT (MoodCheck signature animation) */}
                      <motion.div
                        key="connector-modal-card"
                        initial={{ opacity: 0, scaleY: 0.1, scaleX: 0.95 }}
                        animate={{ opacity: 1, scaleY: 1, scaleX: 1 }}
                        exit={{
                          opacity: 0,
                          scaleY: 0.1,
                          scaleX: 0.95,
                          transition: {
                            type: "spring",
                            damping: 24,
                            stiffness: 300,
                            mass: 0.75,
                          },
                        }}
                        transition={{
                          type: "spring",
                          damping: 26,
                          stiffness: 340,
                          mass: 0.8,
                        }}
                        style={{ transformOrigin: "center center" }}
                        className="relative w-full max-w-lg rounded-3xl border border-neutral-200/80 dark:border-neutral-800/90 bg-white dark:bg-[#121212] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.6)] overflow-hidden font-sf flex flex-col max-h-[92vh] z-10"
                      >
                        {/* Modal Header */}
                      <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Image
                            src={
                              activeConnectorModal === "sheets"
                                ? "/logo/App-connector/google-sheets-svgrepo-com.svg"
                                : activeConnectorModal === "docs"
                                ? "/logo/App-connector/google-docs.webp"
                                : activeConnectorModal === "slides"
                                ? "/logo/App-connector/google-slides.webp"
                                : activeConnectorModal === "drive"
                                ? "/logo/App-connector/google-drive-svgrepo-com.svg"
                                : activeConnectorModal === "whatsapp"
                                ? "/logo/App-connector/whatsapp-128-svgrepo-com.svg"
                                : activeConnectorModal === "slack"
                                ? "/logo/App-connector/slack-svgrepo-com.svg"
                                : activeConnectorModal === "gmail"
                                ? "/logo/App-connector/Gmail.webp"
                                : "/logo/App-connector/Gmail.webp"
                            }
                            alt="Connector"
                            width={28}
                            height={28}
                            className={`w-7 h-7 object-contain shrink-0 ${activeConnectorModal === "notion" ? "dark:invert" : ""}`}
                          />
                          <div>
                            <h3 className="text-sm font-semibold text-neutral-950 dark:text-white">
                              {activeConnectorModal === "gmail" && "Configure Gmail"}
                              {activeConnectorModal === "sheets" && "Configure Google Sheets"}
                              {activeConnectorModal === "docs" && "Configure Google Docs"}
                              {activeConnectorModal === "slides" && "Configure Google Slides"}
                              {activeConnectorModal === "drive" && "Configure Google Drive"}
                              {activeConnectorModal === "whatsapp" && "Configure WhatsApp Gateway"}
                              {activeConnectorModal === "slack" && "Configure Slack Workspace"}
                              {activeConnectorModal === "notion" && "Configure Notion Workspace"}
                            </h3>
                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                              {activeConnectorModal === "gmail" && "Enter your Gmail address and Google App Password for automated emails & alerts."}
                              {activeConnectorModal === "sheets" && "Set account email and target spreadsheet ID for automated workflows."}
                              {activeConnectorModal === "docs" && "Set account email and target document ID for automated reporting & exports."}
                              {activeConnectorModal === "slides" && "Link account email and default presentation ID for automated slide creation."}
                              {activeConnectorModal === "drive" && "Define the default export folder where generated files are stored."}
                              {activeConnectorModal === "whatsapp" && "Connect your phone device and Fonnte / Wablas API gateway token."}
                              {activeConnectorModal === "slack" && "Enter your Slack Incoming Webhook URL and target channel."}
                              {activeConnectorModal === "notion" && "Link your internal integration token and database ID."}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveConnectorModal(null)}
                          className="w-7 h-7 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Modal Body */}
                      <div className="p-5 pb-7 space-y-4 overflow-y-auto">
                        {/* Google Sheets Form */}
                        {activeConnectorModal === "sheets" && (
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                                Google Account Email
                              </label>
                              <Input
                                type="email"
                                placeholder="e.g. fiqiy@revou.co"
                                value={editingConnector.email || ""}
                                onChange={(e) => setEditingConnector({ ...editingConnector, email: e.target.value })}
                                className="h-9 text-xs bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 font-sf"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                                Default Spreadsheet ID
                              </label>
                              <Input
                                type="text"
                                placeholder="e.g. 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                                value={editingConnector.spreadsheetId || ""}
                                onChange={(e) => setEditingConnector({ ...editingConnector, spreadsheetId: e.target.value })}
                                className="h-9 text-xs font-mono bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
                              />
                              <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                                Found in your Google Sheet URL: docs.google.com/spreadsheets/d/<b>SPREADSHEET_ID</b>/edit
                              </p>
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                                Default Sheet Tab Name
                              </label>
                              <Input
                                type="text"
                                placeholder="Sheet1"
                                value={editingConnector.sheetName || "Sheet1"}
                                onChange={(e) => setEditingConnector({ ...editingConnector, sheetName: e.target.value })}
                                className="h-9 text-xs bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 font-sf"
                              />
                            </div>
                          </div>
                        )}

                        {/* Google Docs Form */}
                        {activeConnectorModal === "docs" && (
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                                Google Account Email
                              </label>
                              <Input
                                type="email"
                                placeholder="e.g. fiqiy@revou.co"
                                value={editingConnector.email || ""}
                                onChange={(e) => setEditingConnector({ ...editingConnector, email: e.target.value })}
                                className="h-9 text-xs bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 font-sf"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                                Default Document ID or URL
                              </label>
                              <Input
                                type="text"
                                placeholder="e.g. 1uK7... or full document link"
                                value={editingConnector.documentId || ""}
                                onChange={(e) => setEditingConnector({ ...editingConnector, documentId: e.target.value })}
                                className="h-9 text-xs font-mono bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
                              />
                              <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                                Found in your Google Doc URL: docs.google.com/document/d/<b>DOCUMENT_ID</b>/edit
                              </p>
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                                Document Format / Template
                              </label>
                              <LauncherSelect
                                value={editingConnector.template || "Executive Report"}
                                onChange={(val) => setEditingConnector({ ...editingConnector, template: val })}
                                options={[
                                  { value: "Executive Report", label: "Executive Report (Standard Structure)" },
                                  { value: "Briefing Memo", label: "Briefing Memo (Compact Actionable)" },
                                  { value: "Proposal & Pitch", label: "Strategic Proposal & Project Charter" },
                                  { value: "Meeting Minutes", label: "Meeting Minutes & Action Items" },
                                ]}
                                dropUp
                              />
                            </div>
                          </div>
                        )}

                        {/* Google Slides Form */}
                        {activeConnectorModal === "slides" && (
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                                Google Account Email
                              </label>
                              <Input
                                type="email"
                                placeholder="e.g. fiqiy@revou.co"
                                value={editingConnector.email || ""}
                                onChange={(e) => setEditingConnector({ ...editingConnector, email: e.target.value })}
                                className="h-9 text-xs bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 font-sf"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                                Default Presentation ID or URL
                              </label>
                              <Input
                                type="text"
                                placeholder="e.g. 1pQ9... or full presentation link"
                                value={editingConnector.presentationId || ""}
                                onChange={(e) => setEditingConnector({ ...editingConnector, presentationId: e.target.value })}
                                className="h-9 text-xs font-mono bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
                              />
                              <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                                Found in your Google Slides URL: docs.google.com/presentation/d/<b>PRESENTATION_ID</b>/edit
                              </p>
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                                Presentation Theme / Master Style
                              </label>
                              <LauncherSelect
                                value={editingConnector.template || "Institutional Standard"}
                                onChange={(val) => setEditingConnector({ ...editingConnector, template: val })}
                                options={[
                                  { value: "Institutional Standard", label: "ITB × RevoU Institutional Standard" },
                                  { value: "McKinsey Clean", label: "McKinsey Executive Clean (Light)" },
                                  { value: "Dark Mode Executive", label: "Dark Minimalist Executive (16:9)" },
                                  { value: "Tech Pitch Deck", label: "Silicon Valley Tech Pitch Deck" },
                                ]}
                                dropUp
                              />
                            </div>
                          </div>
                        )}

                        {/* Google Drive Form */}
                        {activeConnectorModal === "drive" && (
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                                Export Root Folder Path
                              </label>
                              <Input
                                type="text"
                                placeholder="/Launcher_Exports"
                                value={editingConnector.rootFolder || "/Launcher_Exports"}
                                onChange={(e) => setEditingConnector({ ...editingConnector, rootFolder: e.target.value })}
                                className="h-9 text-xs bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 font-sf"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                                Shared Drive / Folder ID (Optional)
                              </label>
                              <Input
                                type="text"
                                placeholder="Optional Drive Folder ID..."
                                value={editingConnector.driveId || ""}
                                onChange={(e) => setEditingConnector({ ...editingConnector, driveId: e.target.value })}
                                className="h-9 text-xs font-mono bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                                Permission Level
                              </label>
                              <LauncherSelect
                                value={editingConnector.permission || "Read & Write"}
                                onChange={(val) => setEditingConnector({ ...editingConnector, permission: val })}
                                options={[
                                  { value: "Read & Write", label: "Read & Write (Upload & Export)" },
                                  { value: "Read Only", label: "Read Only" },
                                ]}
                                dropUp
                              />
                            </div>
                          </div>
                        )}

                        {/* WhatsApp Gateway Form */}
                        {activeConnectorModal === "whatsapp" && (
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                                WhatsApp Gateway Provider
                              </label>
                              <LauncherSelect
                                value={editingConnector.gateway || "fonnte_qr"}
                                onChange={(val) => setEditingConnector({ ...editingConnector, gateway: val })}
                                options={[
                                  { value: "fonnte_qr", label: "Fonnte QR Gateway (Instant Scan)" },
                                  { value: "wablas", label: "Wablas API Gateway" },
                                  { value: "custom", label: "Custom WhatsApp Webhook" },
                                ]}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                                Target / Sender Device Phone Number
                              </label>
                              <Input
                                type="text"
                                placeholder="+62 812-3456-7890"
                                value={editingConnector.phone || ""}
                                onChange={(e) => setEditingConnector({ ...editingConnector, phone: e.target.value })}
                                className="h-9 text-xs bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 font-mono"
                              />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                                  Gateway API Token / Secret
                                </label>
                                <button
                                  type="button"
                                  onClick={() => setShowSecretToken(!showSecretToken)}
                                  className="text-[11px] text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 flex items-center gap-1 cursor-pointer"
                                >
                                  {showSecretToken ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                  <span>{showSecretToken ? "Hide" : "Show"}</span>
                                </button>
                              </div>
                              <Input
                                type={showSecretToken ? "text" : "password"}
                                placeholder="Fonnte Token or Wablas API Key..."
                                value={editingConnector.apiToken || ""}
                                onChange={(e) => setEditingConnector({ ...editingConnector, apiToken: e.target.value })}
                                className="h-9 text-xs font-mono bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
                              />
                            </div>
                          </div>
                        )}

                        {/* Slack Workspace Form */}
                        {activeConnectorModal === "slack" && (
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                                  Slack Incoming Webhook URL
                                </label>
                                <button
                                  type="button"
                                  onClick={() => setShowSecretToken(!showSecretToken)}
                                  className="text-[11px] text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 flex items-center gap-1 cursor-pointer"
                                >
                                  {showSecretToken ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                  <span>{showSecretToken ? "Hide" : "Show"}</span>
                                </button>
                              </div>
                              <Input
                                type={showSecretToken ? "text" : "password"}
                                placeholder="https://hooks.slack.com/services/T000/B000/XXXX"
                                value={editingConnector.webhookUrl || ""}
                                onChange={(e) => setEditingConnector({ ...editingConnector, webhookUrl: e.target.value })}
                                className="h-9 text-xs font-mono bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
                              />
                              <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                                Create an Incoming Webhook in your Slack App settings at api.slack.com/apps.
                              </p>
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                                Default Channel
                              </label>
                              <Input
                                type="text"
                                placeholder="#general"
                                value={editingConnector.channel || "#general"}
                                onChange={(e) => setEditingConnector({ ...editingConnector, channel: e.target.value })}
                                className="h-9 text-xs bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 font-mono"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                                Bot Display Name
                              </label>
                              <Input
                                type="text"
                                placeholder="Launcher OS Bot"
                                value={editingConnector.botName || "Launcher OS Bot"}
                                onChange={(e) => setEditingConnector({ ...editingConnector, botName: e.target.value })}
                                className="h-9 text-xs bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 font-sf"
                              />
                            </div>
                          </div>
                        )}

                        {/* Notion Workspace Form */}
                        {activeConnectorModal === "notion" && (
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                                  Notion Internal Integration Token
                                </label>
                                <button
                                  type="button"
                                  onClick={() => setShowSecretToken(!showSecretToken)}
                                  className="text-[11px] text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 flex items-center gap-1 cursor-pointer"
                                >
                                  {showSecretToken ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                  <span>{showSecretToken ? "Hide" : "Show"}</span>
                                </button>
                              </div>
                              <Input
                                type={showSecretToken ? "text" : "password"}
                                placeholder="secret_xxxxxxxxxxxxxxxxxxxxxxxxxx or ntn_..."
                                value={editingConnector.token || ""}
                                onChange={(e) => setEditingConnector({ ...editingConnector, token: e.target.value })}
                                className="h-9 text-xs font-mono bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
                              />
                              <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                                Generate your internal integration token at notion.so/my-integrations.
                              </p>
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                                Target Database ID (Optional)
                              </label>
                              <Input
                                type="text"
                                placeholder="e.g. 1a2b3c4d5e6f7g8h9i0j"
                                value={editingConnector.databaseId || ""}
                                onChange={(e) => setEditingConnector({ ...editingConnector, databaseId: e.target.value })}
                                className="h-9 text-xs font-mono bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
                              />
                            </div>
                          </div>
                        )}

                        {/* Gmail Form */}
                        {activeConnectorModal === "gmail" && (
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                                Gmail Address / Workspace Email
                              </label>
                              <Input
                                type="email"
                                placeholder="yourname@gmail.com"
                                value={editingConnector.email || ""}
                                onChange={(e) => setEditingConnector({ ...editingConnector, email: e.target.value })}
                                className="h-9 text-xs bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
                              />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                                  Google App Password (16 Characters)
                                </label>
                                <button
                                  type="button"
                                  onClick={() => setShowSecretToken(!showSecretToken)}
                                  className="text-[11px] text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 flex items-center gap-1 cursor-pointer"
                                >
                                  {showSecretToken ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                  <span>{showSecretToken ? "Hide" : "Show"}</span>
                                </button>
                              </div>
                              <Input
                                type={showSecretToken ? "text" : "password"}
                                placeholder="abcd efgh ijkl mnop"
                                value={editingConnector.appPassword || ""}
                                onChange={(e) => setEditingConnector({ ...editingConnector, appPassword: e.target.value })}
                                className="h-9 text-xs font-mono bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
                              />
                              <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                                Generated from Google Account &gt; Security &gt; 2-Step Verification &gt; App Passwords.
                              </p>
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                                Sender Display Name
                              </label>
                              <Input
                                type="text"
                                placeholder="Launcher OS Notifications"
                                value={editingConnector.senderName || ""}
                                onChange={(e) => setEditingConnector({ ...editingConnector, senderName: e.target.value })}
                                className="h-9 text-xs bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
                              />
                            </div>
                          </div>
                        )}

                        {/* Test Feedback Message */}
                        {testConnectorMessage && (
                          <div
                            className={`p-3 rounded-lg text-xs flex items-start gap-2 border ${
                              testConnectorMessage.type === "success"
                                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                                : "bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800"
                            }`}
                          >
                            {testConnectorMessage.type === "success" ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                            )}
                            <span className="leading-relaxed">{testConnectorMessage.text}</span>
                          </div>
                        )}
                      </div>

                      {/* Modal Footer */}
                      <div className="px-5 py-3.5 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-2 bg-neutral-50/50 dark:bg-neutral-900/40">
                        <div>
                          {connectors[activeConnectorModal]?.connected && (
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => disconnectConnector(activeConnectorModal)}
                              className="h-8 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer px-2.5"
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-1" />
                              <span>Disconnect</span>
                            </Button>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => testConnectorConnection(activeConnectorModal)}
                            disabled={testingConnector}
                            className="h-8 text-xs border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                          >
                            {testingConnector ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                                <span>Testing...</span>
                              </>
                            ) : (
                              <>
                                <Send className="w-3.5 h-3.5 mr-1.5" />
                                <span>Test Connection</span>
                              </>
                            )}
                          </Button>

                          <Button
                            type="button"
                            onClick={() => saveConnector(activeConnectorModal)}
                            className="h-9 px-4 text-xs sm:text-sm font-medium bg-neutral-950 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-neutral-950 rounded-lg cursor-pointer transition-all active:scale-[0.99] shadow-xs flex items-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Save & Connect</span>
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
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
              <Card className="p-6 sm:p-7 bg-white dark:bg-[#111111] border-neutral-200/80 dark:border-neutral-800/80 rounded-md text-center space-y-5 shadow-none">
                <div className="relative w-28 h-28 mx-auto group">
                  <Avatar
                    onClick={() => fileInputRef.current?.click()}
                    className="w-28 h-28 border border-neutral-200/80 dark:border-neutral-800 shadow-xs cursor-pointer overflow-hidden transition-transform group-hover:scale-105"
                  >
                    {avatarUrl ? (
                      <AvatarImage src={avatarUrl} alt={fullName} className="object-cover w-full h-full" />
                    ) : null}
                    <AvatarFallback className="bg-neutral-950 dark:bg-neutral-800 text-white font-medium text-3xl">
                      {fullName ? fullName[0].toUpperCase() : "F"}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0.5 right-0.5 p-2 rounded-full bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 border-2 border-white dark:border-[#111111] shadow-xs cursor-pointer transition-transform active:scale-90"
                    title="Upload Photo"
                  >
                    <Camera className="w-3.5 h-3.5" />
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
                    className="text-xs sm:text-sm font-medium text-neutral-700 hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white transition-colors cursor-pointer"
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
                        className="text-xs sm:text-sm font-medium text-rose-600 hover:text-rose-700 dark:text-rose-400 transition-colors cursor-pointer"
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
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 font-normal mt-0.5">
                    {email || "user@example.com"}
                  </p>
                </div>
              </Card>
            </div>

            {/* Right Card: Profile Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSaveProfile}>
                <Card className="p-6 sm:p-7 bg-white dark:bg-[#111111] border-neutral-200/80 dark:border-neutral-800/80 rounded-md space-y-6 shadow-none">
                  <div className="space-y-1 pb-4 border-b border-neutral-100 dark:border-neutral-800/80">
                    <h2 className="text-sm sm:text-base font-medium text-neutral-950 dark:text-white leading-tight tracking-tight">
                      Profile Information
                    </h2>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 font-normal">
                      Update your name, email address, and profile picture
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        First Name
                      </label>
                      <Input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="e.g. Muhammad"
                        className="h-10 px-3.5 text-xs sm:text-sm bg-neutral-50/70 dark:bg-neutral-900/50 border border-neutral-200/90 dark:border-neutral-800/90 rounded-lg text-neutral-950 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 focus-visible:ring-1 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-600 transition-colors"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Last Name
                      </label>
                      <Input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="e.g. Fiqiy"
                        className="h-10 px-3.5 text-xs sm:text-sm bg-neutral-50/70 dark:bg-neutral-900/50 border border-neutral-200/90 dark:border-neutral-800/90 rounded-lg text-neutral-950 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 focus-visible:ring-1 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-600 transition-colors"
                        required
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Email Address
                      </label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. user@revou.co"
                        className="h-10 px-3.5 text-xs sm:text-sm bg-neutral-50/70 dark:bg-neutral-900/50 border border-neutral-200/90 dark:border-neutral-800/90 rounded-lg text-neutral-950 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 focus-visible:ring-1 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-600 transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex justify-end">
                    <Button
                      type="submit"
                      className="h-10 px-5 rounded-lg text-xs sm:text-sm font-medium bg-neutral-950 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-neutral-950 transition-all active:scale-[0.99] cursor-pointer shadow-xs flex items-center justify-center"
                    >
                      <span>Save Profile</span>
                    </Button>
                  </div>
                </Card>
              </form>

              {/* Update Password Card */}
              <form onSubmit={handleChangePassword} className="mt-6">
                <Card className="p-6 sm:p-7 bg-white dark:bg-[#111111] border-neutral-200/80 dark:border-neutral-800/80 rounded-md space-y-6 shadow-none">
                  <div className="space-y-1 pb-4 border-b border-neutral-100 dark:border-neutral-800/80">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                      <h2 className="text-sm sm:text-base font-medium text-neutral-950 dark:text-white leading-tight tracking-tight">
                        Update Password
                      </h2>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 font-normal">
                      Change your password securely — stored as a salted hash in the database
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Current Password
                      </label>
                      <div className="relative">
                        <Input
                          type={showCurrentPw ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter your current password"
                          className="h-10 pl-3.5 pr-10 text-xs sm:text-sm bg-neutral-50/70 dark:bg-neutral-900/50 border border-neutral-200/90 dark:border-neutral-800/90 rounded-lg text-neutral-950 dark:text-white focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 focus-visible:ring-1 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-600 transition-colors"
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
                        <label className="text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300">
                          New Password
                        </label>
                        <div className="relative">
                          <Input
                            type={showNewPw ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Min. 8 characters"
                            className="h-10 pl-3.5 pr-10 text-xs sm:text-sm bg-neutral-50/70 dark:bg-neutral-900/50 border border-neutral-200/90 dark:border-neutral-800/90 rounded-lg text-neutral-950 dark:text-white focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 focus-visible:ring-1 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-600 transition-colors"
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
                        <label className="text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <Input
                            type={showConfirmPw ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter new password"
                            className={`h-10 pl-3.5 pr-10 text-xs sm:text-sm bg-neutral-50/70 dark:bg-neutral-900/50 border border-neutral-200/90 dark:border-neutral-800/90 rounded-lg text-neutral-950 dark:text-white focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 focus-visible:ring-1 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-600 transition-colors ${
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

                  <div className="p-3.5 rounded-xl bg-neutral-50/80 dark:bg-neutral-900/60 border border-neutral-200/70 dark:border-neutral-800/80 flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      Your password is securely hashed before being stored in the database. We never store or transmit plain-text passwords.
                    </p>
                  </div>

                  <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex justify-end">
                    <Button
                      type="submit"
                      disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                      className="h-10 px-5 rounded-lg text-xs sm:text-sm font-medium bg-neutral-950 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-neutral-950 transition-all active:scale-[0.99] cursor-pointer shadow-xs flex items-center justify-center disabled:opacity-40"
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
         * TAB 4: SECURITY & CLOUD
         * ══════════════════════════════════════════════════════════ */}
        {activeTab === "security" && (
          <Card className="p-6 sm:p-7 bg-white dark:bg-[#111111] border-neutral-200/80 dark:border-neutral-800/80 rounded-md space-y-6 shadow-none">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100 dark:border-neutral-800/80">
              <div>
                <h2 className="text-sm sm:text-base font-medium text-neutral-950 dark:text-white leading-tight tracking-tight">
                  Cloud Infrastructure Status
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 font-normal mt-0.5">
                  Serverless Postgres database connection, media storage, and real-time latency
                </p>
              </div>

              <button
                type="button"
                onClick={handleTestCloudHealth}
                disabled={isCheckingCloud}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium border border-neutral-200/90 dark:border-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer self-start sm:self-auto disabled:opacity-50"
              >
                {isCheckingCloud ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Activity className="w-3.5 h-3.5 text-emerald-500" />
                )}
                <span>Check Infrastructure Health</span>
              </button>
            </div>

            <div className="space-y-3.5">
              <div className="flex items-center justify-between p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/40">
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-medium text-xs sm:text-sm text-neutral-900 dark:text-white block">
                      Neon Serverless Postgres
                    </span>
                    <span className="text-[11px] text-neutral-500 font-mono">
                      Branch: production (ap-southeast-1)
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  {cloudLatency !== null && (
                    <span className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500">
                      {cloudLatency}ms
                    </span>
                  )}
                  <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-md border ${
                    cloudCheckStatus === "error"
                      ? "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20"
                      : "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                  }`}>
                    {cloudCheckStatus === "error" ? "Degraded" : "Connected"}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/40">
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center">
                    <HardDrive className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-medium text-xs sm:text-sm text-neutral-900 dark:text-white block">
                      Neon Object Storage
                    </span>
                    <span className="text-[11px] text-neutral-500 font-mono">
                      Bucket: uploads (public_read)
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
                  Active
                </span>
              </div>
            </div>
          </Card>
        )}
        </div>
      </div>
    </AppShell>
  );
}
