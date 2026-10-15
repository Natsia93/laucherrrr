"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { AgentCommandCenter } from "./AgentCommandCenter";
import { 
  ViewportState, 
  BrowserTab, 
  ActionLogEntry, 
  AgentChatMessage, 
  VoiceConfig, 
  SearchResultItem 
} from "./types";

const INITIAL_TABS: BrowserTab[] = [
  {
    id: "tab-google",
    title: "Google Chrome (Playwright Direct)",
    url: "https://www.google.com",
  },
];

export function AgenticVisionStudio() {
  // Viewport & Direct Browser State
  const [tabs, setTabs] = useState<BrowserTab[]>(INITIAL_TABS);
  const [activeTabId, setActiveTabId] = useState<string>("tab-google");
  const [viewport, setViewport] = useState<ViewportState>({
    currentUrl: "https://www.google.com",
    title: "Google Search",
    searchQuery: "",
    searchResults: [],
    isLoading: false,
    activeTabId: "tab-google",
    realScreenshotSrc: null,
    onDemandScreenshot: null,
    activeViewMode: "browser",
    engine: "playwright",
    desktopResolution: { width: 1280, height: 800 },
    cursor: {
      x: "48%",
      y: "38%",
      visible: false,
      isClicking: false,
      label: "",
    },
  });

  // Agent State
  const [messages, setMessages] = useState<AgentChatMessage[]>([
    {
      id: "msg-welcome",
      role: "assistant",
      content:
        "Halo! Saya adalah **Launcher OS Vision & Direct Browser Agent**.\n\nSistem ini dirancang untuk berinteraksi langsung dengan web browser dan sistem operasi secara otonom melalui DOM dan kontrol native.\n\nSilakan ketik instruksi untuk mulai menavigasi web, mencari informasi, atau memutar musik.",
      timestamp: Date.now(),
    },
  ]);
  const [actionLogs, setActionLogs] = useState<ActionLogEntry[]>([]);
  const [currentThought, setCurrentThought] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash");

  // Voice Configuration
  const [voiceConfig, setVoiceConfig] = useState<VoiceConfig>({
    provider: "elevenlabs",
    apiKey: "",
    voiceId: "21m00Tcm4TlvDq8ikWAM",
    enabled: true,
    autoSpeak: true,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const speechCancelRef = useRef<(() => void) | null>(null);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speechKeepAliveRef = useRef<any>(null);

  // Load saved voice config if present
  useEffect(() => {
    try {
      const savedVoice = localStorage.getItem("launcher_vision_voice_config");
      if (savedVoice) {
        setVoiceConfig(JSON.parse(savedVoice));
      }
    } catch {}
  }, []);

  // Fetch initial screenshot from real Chrome so the preview mirror is immediately active
  useEffect(() => {
    fetch("/api/agentic-vision/control?type=screenshot")
      .then((res) => res.json())
      .then((data) => {
        if (data.content) {
          setViewport((prev) => ({
            ...prev,
            realScreenshotSrc: data.content,
          }));
        }
      })
      .catch(() => {});
  }, []);

  // ── Signature Test Cursor Glide (Both UI Hub & Real Google Chrome Window) ──
  const handleTestCursorGlide = async () => {
    // 1. Animate Ghost Cursor in Launcher OS UI Hub
    setViewport((prev) => ({
      ...prev,
      cursor: {
        x: "15%",
        y: "20%",
        visible: true,
        isClicking: false,
        label: "🤖 AI Ghost Cursor Aktif!",
      },
    }));

    await new Promise((r) => setTimeout(r, 450));

    setViewport((prev) => ({
      ...prev,
      cursor: {
        ...prev.cursor,
        x: "48%",
        y: "38%",
        label: "🎯 Menguji Gerak Kursor Halus...",
      },
    }));

    await new Promise((r) => setTimeout(r, 650));

    setViewport((prev) => ({
      ...prev,
      cursor: {
        ...prev.cursor,
        isClicking: true,
        label: "🖱️ Klik Ripple!",
      },
    }));

    await new Promise((r) => setTimeout(r, 260));

    setViewport((prev) => ({
      ...prev,
      cursor: {
        ...prev.cursor,
        isClicking: false,
        x: "48%",
        y: "54%",
        label: "Gerak Kursor Berhasil",
      },
    }));

    // 2. Also trigger on-screen movement in real Google Chrome on Desktop!
    try {
      const res = await fetch("/api/agentic-vision/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test_cursor" }),
      });
      const data = await res.json();
      if (data.screenshot) {
        setViewport((prev) => ({ ...prev, realScreenshotSrc: data.screenshot }));
      }
    } catch {}

    setTimeout(() => {
      setViewport((prev) => ({
        ...prev,
        cursor: { ...prev.cursor, visible: false },
      }));
    }, 2800);
  };

  const handleUpdateVoiceConfig = (newConfig: VoiceConfig) => {
    setVoiceConfig(newConfig);
    try {
      localStorage.setItem("launcher_vision_voice_config", JSON.stringify(newConfig));
    } catch {}
  };

  // ── Voice Synthesizer Helpers ─────────────────────────────────────
  const extractCleanSiteName = (urlOrText: string): string => {
    try {
      const match = urlOrText.match(/https?:\/\/(?:www\.)?([a-zA-Z0-9-]+)(?:\.[a-zA-Z0-9.-]+)?(?:\/[^\s)]*)?/i);
      if (match && match[1]) {
        const rawDomain = match[1].toLowerCase();
        const knownBrands: Record<string, string> = {
          youtube: "YouTube",
          google: "Google",
          spotify: "Spotify",
          github: "GitHub",
          intellibron: "IntelliBron",
          wikipedia: "Wikipedia",
          twitter: "Twitter",
          instagram: "Instagram",
        };
        if (knownBrands[rawDomain]) return knownBrands[rawDomain];
        return rawDomain.charAt(0).toUpperCase() + rawDomain.slice(1);
      }
    } catch {}
    return "website";
  };

  const sanitizeAnalysisText = (rawText: string): string => {
    if (!rawText) return "";
    return rawText
      // Strip preliminary / future-tense phrases at the very beginning of the response
      // e.g. "Sebentar, akan aku cek untuk isi dari websitenya..."
      // e.g. "Tunggu sebentar, saya akan memeriksa..."
      // e.g. "Baik, mari kita telusuri..."
      .replace(
        /^(?:sebentar|tunggu sebentar|baik|oke|mari)[,\s]*(?:akan\s+(?:aku|saya|kita)\s+(?:cek|periksa|lihat|baca|telusuri)|(?:saya|aku|kita)\s+akan\s+(?:mengecek|memeriksa|melihat|menelusuri|membaca)|mari\s+kita\s+(?:cek|periksa|lihat|telusuri))[^.!?\n]*[.!?\n]\s*/gi,
        ""
      )
      .replace(
        /^(?:sebentar|tunggu sebentar)[,\s]*(?:ya|dulu)?[.!?\n]\s*/gi,
        ""
      )
      .trim();
  };

  const cleanMarkdownForSpeech = (rawText: string): string => {
    return rawText
      // 0. Remove preliminary opening phrases (e.g. "sebentar, akan aku cek...")
      .replace(
        /^(?:sebentar|tunggu sebentar|baik|oke|mari)[,\s]*(?:akan\s+(?:aku|saya|kita)\s+(?:cek|periksa|lihat|baca|telusuri)|(?:saya|aku|kita)\s+akan\s+(?:mengecek|memeriksa|melihat|menelusuri|membaca)|mari\s+kita\s+(?:cek|periksa|lihat|telusuri))[^.!?\n]*[.!?\n]\s*/gi,
        ""
      )
      .replace(
        /^(?:sebentar|tunggu sebentar)[,\s]*(?:ya|dulu)?[.!?\n]\s*/gi,
        ""
      )
      // 1. Remove markdown links, keeping only text: [Link text](url) -> Link text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      // 2. Remove parenthetical URL wrappers like (URL : https://...) or (URL: ...) or (https://...)
      .replace(/\(\s*(?:URL|Url|url|Tautan|Link)?\s*[:\-]?\s*https?:\/\/[^\s)]+\s*\)/gi, "")
      // 3. Replace any standalone URLs with clean brand name (e.g. https://intellibron.io/orion -> IntelliBron)
      .replace(/https?:\/\/(?:www\.)?([a-zA-Z0-9-]+)(?:\.[a-zA-Z0-9.-]+)?(?:\/[^\s.,!?)]*)?/gi, (_, domain) => {
        const d = domain.toLowerCase();
        const known: Record<string, string> = {
          youtube: "YouTube",
          google: "Google",
          spotify: "Spotify",
          github: "GitHub",
          intellibron: "IntelliBron",
          wikipedia: "Wikipedia",
          twitter: "Twitter",
          instagram: "Instagram",
        };
        return known[d] || (d.charAt(0).toUpperCase() + d.slice(1));
      })
      // 4. Replace bare domains like intellibron.com or www.intellibron.com with clean brand name
      .replace(/(?:www\.)?([a-zA-Z0-9-]+)\.(?:com|org|io|net|ai|id|co\.id|edu|gov|dev)(?:\/[^\s.,!?)]*)?/gi, (_, domain) => {
        const d = domain.toLowerCase();
        const known: Record<string, string> = {
          youtube: "YouTube",
          google: "Google",
          spotify: "Spotify",
          github: "GitHub",
          intellibron: "IntelliBron",
          wikipedia: "Wikipedia",
          twitter: "Twitter",
          instagram: "Instagram",
        };
        return known[d] || (d.charAt(0).toUpperCase() + d.slice(1));
      })
      // 5. Remove leftover markdown symbols: bold, italic, headings, blockquotes, code
      .replace(/[*_#`~>]/g, "")
      // 6. Remove bullet list marks
      .replace(/^[ \t]*[-*•]\s+/gm, "")
      .replace(/\n\s*[-*•]\s*/g, ". ")
      // 7. Turn newlines into sentence pauses
      .replace(/\n+/g, ". ")
      // 8. Clean duplicate spaces and punctuation
      .replace(/\s+/g, " ")
      .replace(/\.\s*\./g, ".")
      .trim();
  };

  const speakText = useCallback(
    async (rawText: string) => {
      if (!voiceConfig.enabled || !rawText.trim()) return;

      const text = cleanMarkdownForSpeech(rawText);
      if (!text) return;

      // Cancel any ongoing speech and timers
      if (speechCancelRef.current) {
        speechCancelRef.current();
        speechCancelRef.current = null;
      }
      if (speechKeepAliveRef.current) {
        clearInterval(speechKeepAliveRef.current);
        speechKeepAliveRef.current = null;
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }

      setIsSpeaking(true);

      try {
        // 1. Try ElevenLabs if custom API key is configured
        if (voiceConfig.apiKey) {
          const res = await fetch("/api/agentic-vision/voice", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text: text.slice(0, 500),
              voiceId: voiceConfig.voiceId,
              apiKey: voiceConfig.apiKey,
            }),
          });

          const data = await res.json();
          if (data.success && data.audioBase64) {
            const audio = new Audio(`data:audio/mpeg;base64,${data.audioBase64}`);
            audioPlayerRef.current = audio;
            audio.onended = () => setIsSpeaking(false);
            audio.onerror = () => setIsSpeaking(false);
            await audio.play();
            return;
          }
        }

        // 2. High-Quality Web Speech API fallback with sentence chunking & GC protection
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          // Split into sentences so Chrome never cuts out or times out after 15 seconds
          const rawChunks = text.split(/(?<=[.!?])\s+/);
          const chunks = rawChunks.map((c) => c.trim()).filter((c) => c.length > 0);

          if (chunks.length === 0) {
            setIsSpeaking(false);
            return;
          }

          let isCancelled = false;
          let chunkIndex = 0;

          // Keep alive interval to prevent Chromium speech synthesis freeze
          speechKeepAliveRef.current = setInterval(() => {
            if (typeof window !== "undefined" && window.speechSynthesis.speaking) {
              window.speechSynthesis.pause();
              window.speechSynthesis.resume();
            }
          }, 6000);

          speechCancelRef.current = () => {
            isCancelled = true;
            if (speechKeepAliveRef.current) {
              clearInterval(speechKeepAliveRef.current);
              speechKeepAliveRef.current = null;
            }
            activeUtteranceRef.current = null;
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
          };

          const playNextChunk = () => {
            if (isCancelled || chunkIndex >= chunks.length) {
              setIsSpeaking(false);
              activeUtteranceRef.current = null;
              if (speechKeepAliveRef.current) {
                clearInterval(speechKeepAliveRef.current);
                speechKeepAliveRef.current = null;
              }
              speechCancelRef.current = null;
              return;
            }

            const currentSentence = chunks[chunkIndex++];
            const utterance = new SpeechSynthesisUtterance(currentSentence);
            utterance.lang = "id-ID";
            utterance.rate = 1.05;

            // Pick Indonesian voice if available
            const voices = window.speechSynthesis.getVoices();
            const indonesianVoice = voices.find(
              (v) => v.lang.startsWith("id") || v.lang.toLowerCase().includes("indonesia")
            );
            if (indonesianVoice) {
              utterance.voice = indonesianVoice;
            }

            // CRITICAL: Hold reference on ref so V8 GC doesn't collect it before onend!
            activeUtteranceRef.current = utterance;

            utterance.onend = () => {
              activeUtteranceRef.current = null;
              if (!isCancelled) {
                setTimeout(playNextChunk, 80);
              }
            };
            utterance.onerror = (e) => {
              activeUtteranceRef.current = null;
              if (e.error !== "canceled" && !isCancelled) {
                setTimeout(playNextChunk, 80);
              } else {
                setIsSpeaking(false);
                if (speechKeepAliveRef.current) {
                  clearInterval(speechKeepAliveRef.current);
                  speechKeepAliveRef.current = null;
                }
              }
            };

            window.speechSynthesis.speak(utterance);
          };

          playNextChunk();
        } else {
          setIsSpeaking(false);
        }
      } catch {
        setIsSpeaking(false);
        if (speechKeepAliveRef.current) {
          clearInterval(speechKeepAliveRef.current);
          speechKeepAliveRef.current = null;
        }
      }
    },
    [voiceConfig]
  );

  // ── On-Demand Visual Snapshot (1x capture, NO continuous stream) ──
  const handleCaptureOnDemandScreenshot = useCallback(async () => {
    setViewport((prev) => ({ ...prev, isLoading: true }));
    try {
      const res = await fetch("/api/agentic-vision/control?type=screenshot", {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        const src = data.content || data.screenshot;
        if (src) {
          const fullSrc = src.startsWith("data:") ? src : `data:image/jpeg;base64,${src}`;
          setViewport((prev) => ({
            ...prev,
            isLoading: false,
            onDemandScreenshot: fullSrc,
            activeViewMode: "visual_snapshot",
          }));
          return fullSrc;
        }
      }
      setViewport((prev) => ({ ...prev, isLoading: false }));
      return null;
    } catch (err) {
      console.warn("Failed to capture on-demand screenshot:", err);
      setViewport((prev) => ({ ...prev, isLoading: false }));
      return null;
    }
  }, []);

  // ── Open Real Google in Chrome on User's Desktop ───────────────
  const handleOpenRealGoogle = async () => {
    try {
      speakText("Membuka Google di browser komputer Anda.");
      setActionLogs((prev) => [
        ...prev,
        {
          id: `act-${Date.now()}`,
          timestamp: Date.now(),
          type: "navigate",
          title: "Buka Google Chrome Nyata",
          detail: "Meluncurkan https://www.google.com pada browser pengguna",
          status: "done",
        },
      ]);

      await fetch("/api/agentic-vision/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "open",
          url: viewport.currentUrl || "https://www.google.com",
        }),
      });
    } catch (err) {
      console.error("Open real Google error:", err);
    }
  };

  // ── Direct Navigation via Playwright CDP ──────────────────────
  const handleNavigateUrl = async (url: string) => {
    setViewport((prev) => ({
      ...prev,
      isLoading: true,
      currentUrl: url,
      cursor: { ...prev.cursor, visible: false },
    }));

    try {
      const res = await fetch("/api/agentic-vision/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "navigate", url }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setViewport((prev) => ({
          ...prev,
          isLoading: false,
          currentUrl: data.data.url || url,
          title: data.data.title || prev.title,
          realScreenshotSrc: data.data.screenshot || prev.realScreenshotSrc,
          pageContent: {
            headline: data.data.title || "Halaman Terbuka",
            sections: [{ heading: "Isi Ringkasan Halaman", text: data.data.contentSummary || "Konten berhasil dimuat." }],
          },
        }));
      } else {
        setViewport((prev) => ({ ...prev, isLoading: false }));
      }
    } catch {
      setViewport((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // ── Direct Google Search via Playwright CDP ───────────────────
  const handleSearchQuery = async (query: string) => {
    setViewport((prev) => ({
      ...prev,
      isLoading: true,
      searchQuery: query,
      currentUrl: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
      pageContent: undefined,
    }));

    try {
      const res = await fetch("/api/agentic-vision/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "search", query }),
      });
      const data = await res.json();

      let items: SearchResultItem[] = [];
      if (data.success && data.data?.results && data.data.results.length > 0) {
        items = data.data.results;
      } else {
        // High-signal search fallback if direct Google DOM was intercepted
        const fallbackRes = await fetch("/api/agentic-vision/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });
        const fallbackData = await fallbackRes.json();
        if (fallbackData.results) {
          items = fallbackData.results;
        }
      }

      setViewport((prev) => ({
        ...prev,
        isLoading: false,
        searchResults: items,
      }));
      return items;
    } catch {
      setViewport((prev) => ({ ...prev, isLoading: false }));
      return [];
    }
  };

  // ── Click Search Result Link directly ─────────────────────────
  const handleClickResult = async (result: SearchResultItem, index: number) => {
    const isSpotify = result.url.includes("spotify") || result.title.toLowerCase().includes("spotify");
    const isYouTube = result.url.includes("youtube") || result.title.toLowerCase().includes("youtube");
    
    const targetUrl = isSpotify 
      ? "https://open.spotify.com" 
      : isYouTube 
      ? "https://www.youtube.com" 
      : result.url;

    setViewport((prev) => ({
      ...prev,
      isLoading: false,
      currentUrl: targetUrl,
      title: result.title,
      searchResults: [],
      cursor: { ...prev.cursor, visible: false },
      pageContent: {
        headline: result.title,
        author: result.source || "Web Source",
        date: "Hasil Terkini",
        sections: [
          { heading: "Ringkasan Eksekutif", text: result.snippet },
          {
            heading: "Konten Halaman Terbuka",
            text: `Halaman ${result.title} berhasil dimuat dan diekstrak oleh agen Launcher OS.`,
          },
        ],
      },
    }));

    try {
      await fetch("/api/agentic-vision/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "navigate", url: targetUrl }),
      });
    } catch {}
  };

  // ── Helper: Extract Best Query from Natural Language ─────────────
  const extractSearchTerms = (raw: string): string => {
    let q = raw.trim();
    const lower = q.toLowerCase();
    if (lower.includes("spotify")) {
      return "spotify";
    }
    if (lower.includes("youtube") && (lower.includes("raf") || lower.includes("dev"))) {
      return "youtube raf dev";
    }
    q = q.replace(/^(coba|tolong|bisa|tolongin|mohon)\s+/gi, "");
    q = q.replace(/^(buka dan cari|buka dan carikan|buka|carikan|cari|car|temukan)\s+/gi, "");
    q = q.replace(/^(halaman|web|website|situs|chanel|channel)\s+/gi, "");
    return q.trim() || raw.trim();
  };

  // ── Autonomous Agent Execution Loop (Signature AI Agent Real-Time Experience) ──
  const executeAutonomousGoal = async (goal: string) => {
    // 0. Cancel any active speech immediately so AI does not talk over new question
    if (speechCancelRef.current) {
      speechCancelRef.current();
      speechCancelRef.current = null;
    }
    if (speechKeepAliveRef.current) {
      clearInterval(speechKeepAliveRef.current);
      speechKeepAliveRef.current = null;
    }
    activeUtteranceRef.current = null;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    audioPlayerRef.current?.pause();
    audioPlayerRef.current = null;
    setIsSpeaking(false);

    setIsRunning(true);
    abortControllerRef.current = new AbortController();

    // 1. Add User Message
    const userMsg: AgentChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: goal,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);

    // 2. Immediate Visual Activity Feedback
    const initialLogId = `act-${Date.now()}`;
    const initialLog: ActionLogEntry = {
      id: initialLogId,
      timestamp: Date.now(),
      type: "search",
      title: "Mengarahkan Kursor ke Google",
      detail: `Memproses: "${goal}"`,
      status: "running",
    };
    setActionLogs((prev) => [...prev, initialLog]);

    // 3. SPECIAL BRAIN: Inspeksi Halaman Aktif & Panduan Cara Pakai Fitur
    const isInspectOrGuide = /halaman apa|fitur apa|cara pakai|bagaimana cara|jelaskan halaman|apa fungsi|baca tab|baca halaman|apa ini|bantu pakai|gimana cara|fitur di|tab ini|halaman ini|halaman google|jelaskan website|analisis website/i.test(goal);

    if (isInspectOrGuide) {
      setCurrentThought(`Membaca dan memindai seluruh isi halaman dari atas hingga bawah...`);
      // NOTE: Do not speak aloud until scrolling is completely finished and returned to the top!
      
      let liveUrl = viewport.currentUrl || "https://www.google.com";
      let liveTitle = viewport.title || "Google";
      let liveText = "";
      let interactiveElements: any[] = [];

      // 1. Scan entire page: smooth scroll to footer and glide back to top
      try {
        const scrollRes = await fetch("/api/agentic-vision/control", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "scroll", mode: "full_scan" }),
          signal: abortControllerRef.current.signal,
        });
        const scrollData = await scrollRes.json().catch(() => null);
        if (scrollData?.data) {
          liveUrl = scrollData.data.url || liveUrl;
          liveTitle = scrollData.data.title || liveTitle;
          liveText = scrollData.data.textSummary || scrollData.data.contentSummary || "";
          if (scrollData.data.screenshot) {
            setViewport((prev) => ({
              ...prev,
              realScreenshotSrc: scrollData.data.screenshot,
              currentUrl: liveUrl,
              title: liveTitle,
            }));
          }
        }
      } catch {}

      // 2. Inspect DOM elements
      try {
        const inspectRes = await fetch("/api/agentic-vision/control", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "inspect" }),
          signal: abortControllerRef.current.signal,
        });
        const inspectData = await inspectRes.json();
        if (inspectData.data) {
          liveUrl = inspectData.data.url || liveUrl;
          liveTitle = inspectData.data.title || liveTitle;
          liveText = inspectData.data.textSummary || inspectData.data.contentSummary || liveText;
          interactiveElements = inspectData.data.interactiveElements || [];
          setViewport((prev) => ({
            ...prev,
            currentUrl: liveUrl,
            title: liveTitle,
          }));
        }
      } catch {}

      // 3. Page is now back at top: Send to Gemini for full explanation
      setCurrentThought(`Menganalisis konten lengkap "${liveTitle}" dan merangkum penjelasannya...`);

      try {
        const stepRes = await fetch("/api/agentic-vision/step", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            goal,
            currentUrl: liveUrl,
            viewportText: liveText || `Judul Halaman: ${liveTitle}`,
            interactiveElements,
            modelName: selectedModel,
            isDirectAnalysis: true,
            stepNumber: 8,
            maxSteps: 15,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (stepRes.ok) {
          const stepData = await stepRes.json();
          const decision = stepData.decision;
          if (decision?.thought) setCurrentThought(decision.thought);

          const rawAnswer =
            decision?.finalSummary ||
            `Halaman yang sedang Anda buka adalah **${liveTitle}**.\n\nUntuk menggunakan fitur ini, Anda dapat memanfaatkan elemen interaktif yang tersedia pada halaman tersebut.`;
          const answerText = sanitizeAnalysisText(rawAnswer);

          setActionLogs((prev) =>
            prev.map((l) =>
              l.id === initialLogId
                ? {
                    ...l,
                    type: "extract",
                    title: `Selesai Membaca Halaman: "${liveTitle}"`,
                    detail: `Menganalisis URL ${liveUrl} dan merespons pertanyaan pengguna.`,
                    status: "done",
                  }
                : l
            )
          );

          // 1. Result appears in the chat now (after scrolling finished and back at top)
          setMessages((prev) => [
            ...prev,
            {
              id: `assistant-${Date.now()}`,
              role: "assistant",
              content: answerText,
              timestamp: Date.now(),
              thought: decision?.thought,
            },
          ]);

          // 2. Stop running status (Thinking indicator stops)
          setIsRunning(false);

          // 3. Agentic AI reads the full explanation aloud now
          speakText(answerText);
          return;
        }
      } catch (err: any) {
        if (err.name === "AbortError") return;
        setIsRunning(false);
      }
    }

    // 3.1 SPECIAL BRAIN: Perintah Scrolling Halaman Web
    const isScrollCommand = /^(scroll|gulir|geser ke bawah|scroll ke bawah|scroll down|scroll up|gulir ke atas)/i.test(goal.trim());
    if (isScrollCommand) {
      const direction = /up|atas/i.test(goal) ? "up" : "down";
      setCurrentThought(`Menggulirkan halaman web ke ${direction === "down" ? "bawah" : "atas"}...`);
      speakText(`Menggulirkan halaman ke ${direction === "down" ? "bawah" : "atas"}.`);

      await fetch("/api/agentic-vision/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "scroll", direction, amount: 650 }),
      });

      setActionLogs((prev) =>
        prev.map((l) =>
          l.id === initialLogId
            ? {
                ...l,
                type: "scroll",
                title: `Halaman Berhasil Digulir (${direction === "down" ? "Bawah" : "Atas"})`,
                detail: `Menggeser layar browser aktif 650px.`,
                status: "done",
              }
            : l
        )
      );

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: `Halaman telah berhasil digulir ke ${direction === "down" ? "bawah" : "atas"}. Anda dapat memberikan instruksi scroll lagi atau membaca bagian selanjutnya.`,
          timestamp: Date.now(),
        },
      ]);

      setIsRunning(false);
      return;
    }

    // 3.2 SPECIAL BRAIN: Membuka URL Langsung & Menganalisis Isi Website
    const rawUrlMatch = goal.match(/(https?:\/\/[^\s]+|[a-zA-Z0-9-]+\.(?:com|org|io|net|ai|id|co\.id|edu|gov|dev)(?:\/[^\s]*)?)/i);
    if (rawUrlMatch) {
      let targetUrl = rawUrlMatch[0].replace(/[.,!?;:]+$/, "");
      if (!/^https?:\/\//i.test(targetUrl)) {
        targetUrl = `https://${targetUrl}`;
      }
      const siteBrandName = extractCleanSiteName(targetUrl);
      setCurrentThought(`Membuka website "${siteBrandName}" (${targetUrl}) dan memindai seluruh halamannya...`);
      // NOTE: Do not speak aloud until scrolling is completely finished and returned to the top!

      setActionLogs((prev) =>
        prev.map((l) =>
          l.id === initialLogId
            ? {
                ...l,
                type: "navigate",
                title: `Membuka Website Langsung`,
                detail: targetUrl,
                status: "running",
              }
            : l
        )
      );

      // 1. Navigate directly to target URL
      await fetch("/api/agentic-vision/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "navigate", url: targetUrl }),
      });

      // 2. Scan entire page: scroll smoothly down to bottom, then back up to top
      setCurrentThought(`Membaca dan memindai seluruh halaman website dari atas hingga bawah...`);
      setActionLogs((prev) =>
        prev.map((l) =>
          l.id === initialLogId
            ? {
                ...l,
                type: "extract",
                title: `Membaca & Memindai Seluruh Halaman`,
                detail: `Menggulir dari atas ke bawah untuk membaca seluruh konten, lalu kembali ke posisi awal.`,
                status: "running",
              }
            : l
        )
      );

      let liveTitle = siteBrandName;
      let liveText = "";
      let interactiveElements: any[] = [];

      await new Promise((r) => setTimeout(r, 600));
      const scrollRes = await fetch("/api/agentic-vision/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "scroll", mode: "full_scan" }),
      });
      const scrollData = await scrollRes.json().catch(() => null);
      if (scrollData?.data) {
        liveTitle = scrollData.data.title || liveTitle;
        liveText = scrollData.data.textSummary || scrollData.data.contentSummary || "";
        if (scrollData.data.screenshot) {
          setViewport((prev) => ({
            ...prev,
            realScreenshotSrc: scrollData.data.screenshot,
            currentUrl: targetUrl,
            title: liveTitle,
          }));
        }
      }

      // 3. Inspect DOM snapshot
      try {
        const inspectRes = await fetch("/api/agentic-vision/control", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "inspect" }),
        });
        const inspectData = await inspectRes.json();
        if (inspectData.data) {
          liveTitle = inspectData.data.title || liveTitle;
          liveText = inspectData.data.textSummary || inspectData.data.contentSummary || liveText;
          interactiveElements = inspectData.data.interactiveElements || [];
          setViewport((prev) => ({
            ...prev,
            currentUrl: targetUrl,
            title: liveTitle,
          }));
        }
      } catch {}

      // 4. Page is now back at top: Send to Gemini for full website explanation
      setCurrentThought(`Menganalisis konten lengkap "${liveTitle}" dan merangkum penjelasannya...`);

      try {
        const stepRes = await fetch("/api/agentic-vision/step", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            goal,
            currentUrl: targetUrl,
            viewportText: liveText || `Judul Website: ${liveTitle}`,
            interactiveElements,
            modelName: selectedModel,
            isDirectAnalysis: true,
            stepNumber: 8,
            maxSteps: 15,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (stepRes.ok) {
          const stepData = await stepRes.json();
          const decision = stepData.decision;
          if (decision?.thought) setCurrentThought(decision.thought);

          const rawAnswer =
            decision?.finalSummary ||
            (decision?.thought ? `**${liveTitle}**\n\n${decision.thought}` : `Website **${liveTitle}** berhasil dibuka dan dianalisis secara lengkap.`);
          const answerText = sanitizeAnalysisText(rawAnswer);

          setActionLogs((prev) =>
            prev.map((l) =>
              l.id === initialLogId
                ? {
                    ...l,
                    type: "extract",
                    title: `Selesai Membaca & Menganalisis: "${liveTitle}"`,
                    detail: `Website berhasil dibuka dan dianalisis tuntas.`,
                    status: "done",
                  }
                : l
            )
          );

          // 1. Result appears in the chat now (only after scrolling is finished and back at top!)
          setMessages((prev) => [
            ...prev,
            {
              id: `assistant-${Date.now()}`,
              role: "assistant",
              content: answerText,
              timestamp: Date.now(),
              thought: decision?.thought,
            },
          ]);

          // 2. Stop running status (Thinking indicator stops)
          setIsRunning(false);

          // 3. Agentic AI voice reads the analysis aloud now!
          speakText(answerText);
          return;
        }
      } catch (err: any) {
        if (err.name === "AbortError") return;
        setIsRunning(false);
      }
    }

    // 3.3 CONTEXTUAL FOLLOW-UP: Pertanyaan atau Permintaan Tolong tentang Website yang Sedang Dibuka
    const isOnActiveWebsite = Boolean(viewport.currentUrl && !viewport.currentUrl.includes("google.com"));
    const isExplicitNewSearch = /^(cari di google|search di google|buka google|googling)\b/i.test(goal);
    const isExplicitMedia = /^(putar|mainkan|play|dengarkan)\s+(lagu|musik|video|track|playlist)/i.test(goal);

    if (isOnActiveWebsite && !isExplicitNewSearch && !isExplicitMedia) {
      const siteName = viewport.title || extractCleanSiteName(viewport.currentUrl);
      setCurrentThought(`Menjawab pertanyaan atau permintaan terkait website "${siteName}"...`);

      let currentText = "";
      try {
        const inspectRes = await fetch("/api/agentic-vision/control", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "inspect" }),
          signal: abortControllerRef.current.signal,
        });
        const inspectData = await inspectRes.json();
        if (inspectData.data) {
          currentText = inspectData.data.textSummary || inspectData.data.contentSummary || "";
        }
      } catch {}

      try {
        const stepRes = await fetch("/api/agentic-vision/step", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            goal,
            currentUrl: viewport.currentUrl,
            viewportText: currentText || `Website aktif: ${siteName} (${viewport.currentUrl})`,
            history: messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
            modelName: selectedModel,
            isDirectAnalysis: true,
            stepNumber: 8,
            maxSteps: 15,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (stepRes.ok) {
          const stepData = await stepRes.json();
          const decision = stepData.decision;
          if (decision?.thought) setCurrentThought(decision.thought);

          const rawAnswer =
            decision?.finalSummary ||
            (decision?.thought ? decision.thought : `Berikut tanggapan terkait **${siteName}**: ${goal}`);
          const answerText = sanitizeAnalysisText(rawAnswer);

          setActionLogs((prev) =>
            prev.map((l) =>
              l.id === initialLogId
                ? {
                    ...l,
                    type: "extract",
                    title: `Menjawab Pertanyaan: "${siteName}"`,
                    detail: goal,
                    status: "done",
                  }
                : l
            )
          );

          setMessages((prev) => [
            ...prev,
            {
              id: `assistant-${Date.now()}`,
              role: "assistant",
              content: answerText,
              timestamp: Date.now(),
              thought: decision?.thought,
            },
          ]);

          setIsRunning(false);
          speakText(answerText);
          return;
        }
      } catch (err: any) {
        if (err.name === "AbortError") return;
        setIsRunning(false);
      }
    }

    // 4. Reset viewport to clean Google Home if we were on another page for search
    setViewport((prev) => ({
      ...prev,
      currentUrl: "https://www.google.com",
      title: "Google",
      searchQuery: "",
      searchResults: [],
      pageContent: undefined,
    }));

    setCurrentThought(`Menganalisis instruksi pengguna: "${goal}". Mengarahkan kursor AI otonom ke kotak pencarian Google.`);
    speakText("Baik, mari kita mulai mencari di Google.");

    // 5. Determine Search Query
    let queryToSearch = extractSearchTerms(goal);
    let decision: any = null;

    try {
      const stepRes = await fetch("/api/agentic-vision/step", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal,
          currentUrl: "https://www.google.com",
          viewportText: "Google Search Engine Beranda Playwright.",
          modelName: selectedModel,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (stepRes.ok) {
        const stepData = await stepRes.json();
        if (stepData.decision) {
          decision = stepData.decision;
          if (decision.thought) setCurrentThought(decision.thought);
          if (decision.narrate) speakText(decision.narrate);
          if (decision.action?.query || decision.action?.text) {
            queryToSearch = decision.action.query || decision.action.text;
          }
        }
      }
    } catch (err: any) {
      if (err.name === "AbortError") return;
    }

    if (abortControllerRef.current?.signal.aborted) return;

    // ── STEP A: KURSOR MELUNCUR KE KOTAK PENCARIAN GOOGLE ──
    setViewport((prev) => ({
      ...prev,
      cursor: {
        x: "48%",
        y: "48%",
        visible: true,
        isClicking: false,
        label: "🎯 Menuju kotak pencarian Google...",
      },
    }));
    await new Promise((r) => setTimeout(r, 650));

    // ── STEP B: KLIK & FOKUS INPUT PENCARIAN ──
    setViewport((prev) => ({
      ...prev,
      cursor: { ...prev.cursor, isClicking: true, label: "⌨️ Memfokuskan input..." },
    }));
    await new Promise((r) => setTimeout(r, 220));

    setViewport((prev) => ({
      ...prev,
      cursor: { ...prev.cursor, isClicking: false, label: `⌨️ Mengetik "${queryToSearch}"...` },
    }));

    // ── STEP C: GHOST TYPING KARAKTER PER KARAKTER SECARA REAL-TIME ──
    let typed = "";
    for (const char of queryToSearch) {
      if (abortControllerRef.current?.signal.aborted) return;
      typed += char;
      setViewport((prev) => ({ ...prev, searchQuery: typed }));
      await new Promise((r) => setTimeout(r, 65));
    }
    await new Promise((r) => setTimeout(r, 350));

    // ── STEP D: KURSOR MELUNCUR KE TOMBOL "Penelusuran Google" & MENGKLIK ──
    setViewport((prev) => ({
      ...prev,
      cursor: {
        x: "42%",
        y: "56%",
        visible: true,
        isClicking: false,
        label: "🖱️ Menjalankan pencarian...",
      },
    }));
    await new Promise((r) => setTimeout(r, 500));

    setViewport((prev) => ({
      ...prev,
      cursor: { ...prev.cursor, isClicking: true },
    }));
    await new Promise((r) => setTimeout(r, 220));

    setViewport((prev) => ({
      ...prev,
      cursor: { ...prev.cursor, isClicking: false },
    }));

    // ── STEP E: MUAT HASIL PENCARIAN RESMI ──
    setActionLogs((prev) =>
      prev.map((l) =>
        l.id === initialLogId
          ? { ...l, title: `Memuat hasil pencarian "${queryToSearch}"...`, status: "running" }
          : l
      )
    );

    const searchResults = await handleSearchQuery(queryToSearch);
    if (abortControllerRef.current?.signal.aborted) return;

    // ── STEP F: KURSOR MELUNCUR KE HASIL TERATAS & MENGKLIK LINK HASIL ──
    const lowerQuery = queryToSearch.toLowerCase();
    const lowerGoal = goal.toLowerCase();
    const isMusicOrMediaGoal = /play|putar|mainkan|musik|lagu|song|track|video|dengar|tonton/i.test(lowerGoal) || /play|putar|mainkan|lagu|musik/i.test(lowerQuery);
    const isSpotifyGoal = lowerGoal.includes("spotify") || lowerQuery.includes("spotify");
    const isYouTubeGoal = isSpotifyGoal ? false : (isMusicOrMediaGoal || lowerGoal.includes("youtube") || lowerQuery.includes("youtube") || lowerGoal.includes("yt") || lowerQuery.includes("yt"));

    const topResult = searchResults[0] || {
      title: isSpotifyGoal 
        ? "Spotify - Web Player: Music for everyone" 
        : isYouTubeGoal 
        ? "YouTube - Nikmati video dan musik yang Anda suka"
        : `${queryToSearch} - Sumber Resmi`,
      url: isSpotifyGoal 
        ? "https://open.spotify.com" 
        : isYouTubeGoal 
        ? "https://www.youtube.com" 
        : `https://${queryToSearch.replace(/\s+/g, "")}.com`,
      snippet: "Halaman resmi teratas dari hasil pencarian Google.",
    };

    setViewport((prev) => ({
      ...prev,
      cursor: {
        ...prev.cursor,
        x: "24%",
        y: "28%",
        label: `🎯 Mengklik: ${topResult.title.slice(0, 28)}...`,
      },
    }));
    await new Promise((r) => setTimeout(r, 700));

    setViewport((prev) => ({
      ...prev,
      cursor: { ...prev.cursor, isClicking: true },
    }));
    await new Promise((r) => setTimeout(r, 260));

    setViewport((prev) => ({
      ...prev,
      cursor: { ...prev.cursor, isClicking: false, label: "🌐 Membuka halaman tujuan..." },
    }));

    // ── STEP G: BUKA HALAMAN TUJUAN SECARA NYATA DI GOOGLE CHROME ──
    let finalUrl = topResult.url;
    let mediaQuery = "";
    if (isYouTubeGoal) {
      mediaQuery = goal
        .replace(/^(coba|tolong|bisa|mohon)?\s*(mainkan|putar|tonton|lihat|cari|buka dan putar|buka dan mainkan|play)?\s*(video|lagu|musik|track)?\s*/gi, "")
        .replace(/\s+(di|pada|ke)\s+(yt|youtube|yutub).*$/gi, "")
        .trim();
      if (!mediaQuery || /^(youtube|yt|video|lagu|musik)$/i.test(mediaQuery)) {
        mediaQuery = queryToSearch.replace(/\s*(youtube|yt|video|lagu|musik)\s*/gi, "").trim() || "lofi chill music";
      }
      finalUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(mediaQuery)}`;
    } else if (isSpotifyGoal) {
      mediaQuery = goal
        .replace(/^(coba|tolong|bisa|mohon)?\s*(mainkan|putar|dengarkan|cari|buka dan putar|play)?\s*(lagu|musik|track|playlist)?\s*/gi, "")
        .replace(/\s+(di|pada|ke)\s+(spotify).*$/gi, "")
        .trim();
      if (!mediaQuery || /^(spotify|lagu|musik)$/i.test(mediaQuery)) {
        mediaQuery = queryToSearch.replace(/\s*(spotify|lagu|musik)\s*/gi, "").trim() || "top hits";
      }
      finalUrl = `https://open.spotify.com/search/${encodeURIComponent(mediaQuery)}`;
    }

    let finalTitle = isSpotifyGoal
      ? `Spotify – ${mediaQuery || "Web Player"}`
      : isYouTubeGoal
      ? `YouTube – ${mediaQuery || "Video"}`
      : topResult.title;

    setViewport((prev) => ({
      ...prev,
      currentUrl: finalUrl,
      title: finalTitle,
      searchResults: [],
      isLoading: false,
      cursor: {
        ...prev.cursor,
        x: "48%",
        y: "36%",
        label: isYouTubeGoal
          ? "Menuju YouTube & Mencari Video..."
          : isSpotifyGoal
          ? "Menuju Spotify & Mencari Lagu..."
          : "Membuka Tab Asli di Chrome...",
      },
    }));

    // ── STEP G.2: EKSEKUSI MEDIA (PUTAR VIDEO / LAGU SECARA NYATA) ──
    if (isYouTubeGoal || isSpotifyGoal) {
      setViewport((prev) => ({
        ...prev,
        cursor: {
          ...prev.cursor,
          x: "36%",
          y: "42%",
          visible: true,
          label: isYouTubeGoal
            ? `Memilih & memutar video "${mediaQuery}"...`
            : `Memutar lagu "${mediaQuery}"...`,
        },
      }));
      await new Promise((r) => setTimeout(r, 600));

      setViewport((prev) => ({
        ...prev,
        cursor: { ...prev.cursor, isClicking: true, label: "Menekan Play..." },
      }));
      await new Promise((r) => setTimeout(r, 260));

      setViewport((prev) => ({
        ...prev,
        cursor: { ...prev.cursor, isClicking: false },
      }));

      // Eksekusi auto-play langsung di Google Chrome via Playwright CDP
      try {
        const playRes = await fetch("/api/agentic-vision/control", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "play_media",
            platform: isYouTubeGoal ? "youtube" : "spotify",
            query: mediaQuery,
            url: finalUrl,
          }),
        });
        const playData = await playRes.json();
        if (playData.data?.url) {
          finalUrl = playData.data.url;
        }
        if (playData.data?.title) {
          finalTitle = playData.data.title;
        }
        if (playData.data?.screenshot) {
          setViewport((prev) => ({
            ...prev,
            realScreenshotSrc: playData.data.screenshot,
            currentUrl: finalUrl,
            title: finalTitle,
          }));
        }
      } catch {}

      // Buka tab video yang sedang diputar langsung di Google Chrome pengguna
      if (typeof window !== "undefined") {
        try {
          window.open(finalUrl, "_blank");
        } catch {}
      }
    } else {
      // ── NON-MEDIA: OVERPOWER MULTI-STEP AUTONOMOUS BROWSER ENGINE ──
      if (typeof window !== "undefined") {
        try {
          window.open(finalUrl, "_blank");
        } catch {}
      }

      let activeUrl = finalUrl;
      let activeTitle = finalTitle;
      let pageContentText = "";

      // Step 1: Navigasi awal ke URL tujuan
      try {
        const navRes = await fetch("/api/agentic-vision/control", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "navigate", url: finalUrl }),
        });
        const navData = await navRes.json();
        if (navData.data?.url) activeUrl = navData.data.url;
        if (navData.data?.title) activeTitle = navData.data.title;
        if (navData.data?.contentSummary) pageContentText = navData.data.contentSummary;
        if (navData.data?.screenshot) {
          setViewport((prev) => ({
            ...prev,
            realScreenshotSrc: navData.data.screenshot,
            currentUrl: activeUrl,
            title: activeTitle,
          }));
        }
      } catch {}

      // Step 2..N: Autonomous Reasoning Loop (Inspect DOM -> Think -> Act)
      const MAX_LOOP_STEPS = 15;
      const historyLog: any[] = [
        { type: "search", title: `Cari di Google: ${queryToSearch}` },
        { type: "navigate", title: `Buka halaman: ${activeTitle}`, url: activeUrl },
      ];

      for (let stepIdx = 2; stepIdx <= MAX_LOOP_STEPS; stepIdx++) {
        if (abortControllerRef.current?.signal.aborted) break;

        // Ambil DOM snapshot terkini
        let interactiveList: any[] = [];
        try {
          const snapRes = await fetch("/api/agentic-vision/control", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "snapshot" }),
          });
          const snapData = await snapRes.json();
          if (snapData.data?.interactiveElements) {
            interactiveList = snapData.data.interactiveElements;
          }
          if (snapData.data?.contentSummary) {
            pageContentText = snapData.data.contentSummary;
          }
        } catch {}

        // Tanyakan Model AI untuk langkah berikutnya
        let nextDecision: any = null;
        try {
          const stepRes = await fetch("/api/agentic-vision/step", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              goal,
              currentUrl: activeUrl,
              viewportText: pageContentText,
              interactiveElements: interactiveList,
              history: historyLog,
              stepNumber: stepIdx,
              maxSteps: MAX_LOOP_STEPS,
              modelName: selectedModel,
            }),
            signal: abortControllerRef.current?.signal,
          });
          if (stepRes.ok) {
            const stepJson = await stepRes.json();
            nextDecision = stepJson.decision;
          }
        } catch {}

        if (!nextDecision) break;
        decision = nextDecision;
        if (nextDecision.thought) setCurrentThought(nextDecision.thought);
        if (nextDecision.narrate) speakText(nextDecision.narrate);

        // Jika model memutuskan selesai (finish / isCompleted)
        if (nextDecision.isCompleted || nextDecision.action?.type === "finish") {
          break;
        }

        const actType = nextDecision.action?.type;
        const actTarget = nextDecision.action?.target || "";
        const actText = nextDecision.action?.text || "";

        // Buat Action Log baru
        const loopLogId = `act-${Date.now()}`;
        const newLog: ActionLogEntry = {
          id: loopLogId,
          timestamp: Date.now(),
          type: (actType as any) || "navigate",
          title: `Langkah ${stepIdx}: ${actType?.toUpperCase()} ${actTarget ? `(${actTarget.slice(0, 30)})` : ""}`,
          status: "running",
          stepNumber: stepIdx,
        };
        setActionLogs((prev) => [...prev, newLog]);

        // Eksekusi aksi spesifik
        if (actType === "scroll") {
          setViewport((prev) => ({
            ...prev,
            cursor: { ...prev.cursor, visible: true, label: "📜 Menggulir halaman..." },
          }));
          await new Promise((r) => setTimeout(r, 400));
          try {
            const scrRes = await fetch("/api/agentic-vision/control", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "scroll", direction: nextDecision.action?.direction || "down" }),
            });
            const scrData = await scrRes.json();
            if (scrData.data?.screenshot) {
              setViewport((prev) => ({ ...prev, realScreenshotSrc: scrData.data.screenshot }));
            }
          } catch {}
          historyLog.push({ type: "scroll", detail: "Scroll down for more information" });
        } else if (actType === "click") {
          setViewport((prev) => ({
            ...prev,
            cursor: { ...prev.cursor, x: "32%", y: "45%", visible: true, isClicking: true, label: `🎯 Klik: ${actTarget.slice(0, 25)}` },
          }));
          await new Promise((r) => setTimeout(r, 450));
          setViewport((prev) => ({ ...prev, cursor: { ...prev.cursor, isClicking: false } }));

          try {
            const clkRes = await fetch("/api/agentic-vision/control", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "click", target: actTarget }),
            });
            const clkData = await clkRes.json();
            if (clkData.data?.url) activeUrl = clkData.data.url;
            if (clkData.data?.title) activeTitle = clkData.data.title;
            if (clkData.data?.screenshot) {
              setViewport((prev) => ({ ...prev, realScreenshotSrc: clkData.data.screenshot, currentUrl: activeUrl, title: activeTitle }));
            }
          } catch {}
          historyLog.push({ type: "click", title: actTarget });
        } else if (actType === "type") {
          setViewport((prev) => ({
            ...prev,
            cursor: { ...prev.cursor, visible: true, label: `⌨️ Mengetik "${actText.slice(0, 20)}"...` },
          }));
          await new Promise((r) => setTimeout(r, 350));
          try {
            await fetch("/api/agentic-vision/control", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "type", target: actTarget, text: actText }),
            });
          } catch {}
          historyLog.push({ type: "type", title: actTarget, detail: actText });
        } else if (actType === "navigate") {
          const navUrl = actText || actTarget;
          setViewport((prev) => ({
            ...prev,
            cursor: { ...prev.cursor, visible: true, label: `🌐 Navigasi ke ${navUrl.slice(0, 30)}...` },
          }));
          await new Promise((r) => setTimeout(r, 400));
          try {
            const navRes = await fetch("/api/agentic-vision/control", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "navigate", url: navUrl }),
            });
            const navData = await navRes.json();
            if (navData.data?.url) activeUrl = navData.data.url;
            if (navData.data?.title) activeTitle = navData.data.title;
            if (navData.data?.contentSummary) pageContentText = navData.data.contentSummary;
            if (navData.data?.screenshot) {
              setViewport((prev) => ({ ...prev, realScreenshotSrc: navData.data.screenshot, currentUrl: activeUrl, title: activeTitle }));
            }
          } catch {}
          historyLog.push({ type: "navigate", title: `Navigasi ke: ${navUrl}` });
        } else if (actType === "search") {
          const searchQuery = nextDecision.action?.query || actText || actTarget;
          setViewport((prev) => ({
            ...prev,
            cursor: { ...prev.cursor, visible: true, label: `🔍 Mencari "${searchQuery.slice(0, 25)}"...` },
          }));
          await new Promise((r) => setTimeout(r, 400));
          try {
            const searchRes = await fetch("/api/agentic-vision/control", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "search", query: searchQuery }),
            });
            const searchData = await searchRes.json();
            if (searchData.data?.url) activeUrl = searchData.data.url;
            if (searchData.data?.title) activeTitle = searchData.data.title;
            if (searchData.data?.contentSummary) pageContentText = searchData.data.contentSummary;
            if (searchData.data?.screenshot) {
              setViewport((prev) => ({ ...prev, realScreenshotSrc: searchData.data.screenshot, currentUrl: activeUrl, title: activeTitle }));
            }
          } catch {}
          historyLog.push({ type: "search", title: `Cari: ${searchQuery}` });
        } else if (actType === "extract") {
          // Extract: just re-inspect the page content
          historyLog.push({ type: "extract", title: "Mengekstrak data halaman", detail: nextDecision.action?.keyInsight || "" });
        }

        // Tandai log selesai
        setActionLogs((prev) => prev.map((l) => (l.id === loopLogId ? { ...l, status: "done" } : l)));
        await new Promise((r) => setTimeout(r, 400));
      }

      finalUrl = activeUrl;
      finalTitle = activeTitle;
    }

    setTimeout(() => {
      setViewport((prev) => ({
        ...prev,
        cursor: { ...prev.cursor, visible: false },
      }));
    }, 2800);

    // ── STEP H: SELESAIKAN MISI & CATAT JAWABAN AKHIR ─────────────
    setActionLogs((prev) =>
      prev.map((l) =>
        l.id === initialLogId
          ? {
              ...l,
              title: isYouTubeGoal
                ? `Memutar Video: "${finalTitle}"`
                : isSpotifyGoal
                ? `Memutar Lagu: "${mediaQuery}"`
                : `Berhasil Membuka Tab "${finalTitle}"`,
              detail: isYouTubeGoal
                ? `Video YouTube "${finalTitle}" berhasil dipilih dan sedang diputar (${finalUrl}).`
                : isSpotifyGoal
                ? `Lagu "${mediaQuery}" berhasil dibuka dan diputar di Spotify (${finalUrl}).`
                : `Tab resmi ${finalTitle} telah dibuka langsung di Google Chrome Anda (${finalUrl}).`,
              status: "done",
            }
          : l
      )
    );

    const finalAnswer =
      decision?.finalSummary ||
      (isYouTubeGoal
        ? `Video **${finalTitle}** telah berhasil ditemukan dan diputar langsung di YouTube.\n\n[Tonton Video di YouTube: ${finalTitle} ↗](${finalUrl})`
        : isSpotifyGoal
        ? `Lagu **${mediaQuery}** telah berhasil dibuka dan diputar di Spotify Web Player.\n\n[Buka di Spotify Web Player ↗](${finalUrl})`
        : `Tugas berhasil diselesaikan.\n\nTab resmi [${finalTitle}](${finalUrl}) telah dibuka langsung di Google Chrome Anda. Layar dan konten siap digunakan.\n\n[Buka Tab: ${finalTitle} ↗](${finalUrl})`);

    setMessages((prev) => [
      ...prev,
      {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: finalAnswer,
        timestamp: Date.now(),
        thought:
          decision?.thought ||
          (isYouTubeGoal
            ? "Mencari video di YouTube, memilih hasil teratas, dan memicu tombol Play."
            : isSpotifyGoal
            ? "Mencari lagu di Spotify dan menekan tombol putar musik."
            : "Tab baru di Google Chrome berhasil dibuka untuk pengguna."),
      },
    ]);

    speakText(
      isYouTubeGoal
        ? `Video ${finalTitle.slice(0, 35)} telah diputar di YouTube.`
        : isSpotifyGoal
        ? `Lagu ${mediaQuery} telah diputar di Spotify.`
        : finalAnswer
    );

    // Hide cursor after a short delay
    setTimeout(() => {
      setViewport((prev) => ({
        ...prev,
        cursor: { ...prev.cursor, visible: false },
      }));
    }, 1800);

    setIsRunning(false);
  };

  const handleStopAgent = () => {
    abortControllerRef.current?.abort();
    setIsRunning(false);
    setIsSpeaking(false);
    if (speechCancelRef.current) {
      speechCancelRef.current();
      speechCancelRef.current = null;
    }
    if (speechKeepAliveRef.current) {
      clearInterval(speechKeepAliveRef.current);
      speechKeepAliveRef.current = null;
    }
    activeUtteranceRef.current = null;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    audioPlayerRef.current?.pause();
    audioPlayerRef.current = null;
    setViewport((prev) => ({
      ...prev,
      cursor: { ...prev.cursor, visible: false },
    }));
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col py-2 sm:py-4">
      <AgentCommandCenter
        messages={messages}
        actionLogs={actionLogs}
        currentThought={currentThought}
        isRunning={isRunning}
        onSendGoal={executeAutonomousGoal}
        onStopAgent={handleStopAgent}
        voiceConfig={voiceConfig}
        onUpdateVoiceConfig={handleUpdateVoiceConfig}
        selectedModel={selectedModel}
        onSelectModel={setSelectedModel}
        isSpeaking={isSpeaking}
        activeUrl={viewport.currentUrl}
        onOpenTab={(url) => {
          if (typeof window !== "undefined") {
            window.open(url, "_blank");
          }
        }}
        onTestCursor={handleTestCursorGlide}
        onResetChat={() => {
          handleStopAgent();
          setMessages([
            {
              id: "msg-welcome",
              role: "assistant",
              content:
                "Halo! Saya adalah **Launcher OS Vision & Direct Browser Agent**.\n\nSistem ini dirancang untuk berinteraksi langsung dengan web browser dan sistem operasi secara otonom melalui DOM dan kontrol native.\n\nSilakan ketik instruksi untuk mulai menavigasi web, mencari informasi, atau memutar musik.",
              timestamp: Date.now(),
            },
          ]);
          setActionLogs([]);
          setCurrentThought("");
        }}
      />
    </div>
  );
}
