"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { authClient } from "@/lib/auth-client";
import {
  Search,
  RefreshCw,
  Folder,
  FileSpreadsheet,
  FileText,
  Presentation,
  File,
  ExternalLink,
  Plus,
  Grid,
  List,
  Copy,
  Check,
  FolderPlus,
  ChevronRight,
  HardDrive,
  X,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

type DriveFilterType = "all" | "spreadsheet" | "document" | "presentation" | "folder";

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  size?: string;
  iconLink?: string;
  webViewLink?: string;
  thumbnailLink?: string;
  owners?: Array<{ displayName: string; emailAddress: string }>;
}

export default function GoogleDrivePage() {
  const { data: session } = authClient.useSession();
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(true);
  const [driveScopeGranted, setDriveScopeGranted] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "spreadsheet" | "document" | "presentation" | "folder">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Folder Navigation History
  const [currentFolderId, setCurrentFolderId] = useState<string>("");
  const [folderPath, setFolderPath] = useState<Array<{ id: string; name: string }>>([]);

  // Create Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createType, setCreateType] = useState<"folder" | "spreadsheet">("folder");
  const [createName, setCreateName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchFiles = async (folderId = currentFolderId, type = activeFilter, query = searchQuery) => {
    try {
      setIsRefreshing(true);
      const params = new URLSearchParams();
      if (folderId) params.set("folderId", folderId);
      if (type !== "all") params.set("type", type);
      if (query.trim()) params.set("search", query.trim());

      const res = await fetch(`/api/google/drive?${params.toString()}`, { cache: "no-store" });
      const data = await res.json();

      if (data.success) {
        setGoogleConnected(Boolean(data.googleConnected));
        setDriveScopeGranted(Boolean(data.driveScopeGranted));
        setFiles(data.files || []);
      }
    } catch (err) {
      console.error("Failed to fetch Google Drive files:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFiles(currentFolderId, activeFilter, searchQuery);
  }, [currentFolderId, activeFilter, session]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFiles(currentFolderId, activeFilter, searchQuery);
  };

  const handleConnectGoogle = async () => {
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/integrations/drive",
      });
    } catch (err) {
      console.error("Google OAuth error:", err);
    }
  };

  const handleCopyLink = (file: DriveFile) => {
    if (!file.webViewLink) return;
    navigator.clipboard.writeText(file.webViewLink);
    setCopiedId(file.id);
    triggerToast("Link copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/google/drive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createName.trim(),
          type: createType,
          parentFolderId: currentFolderId || undefined,
        }),
      });

      if (res.ok) {
        setIsCreateModalOpen(false);
        setCreateName("");
        triggerToast(`${createType === "folder" ? "Folder" : "Spreadsheet"} created in Drive`);
        await fetchFiles(currentFolderId, activeFilter, searchQuery);
      }
    } catch (err) {
      console.error("Failed to create file/folder:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const navigateToFolder = (folder: DriveFile) => {
    setCurrentFolderId(folder.id);
    setFolderPath((prev) => [...prev, { id: folder.id, name: folder.name }]);
  };

  const navigateBackTo = (index: number) => {
    if (index === -1) {
      setCurrentFolderId("");
      setFolderPath([]);
    } else {
      const target = folderPath[index];
      setCurrentFolderId(target.id);
      setFolderPath((prev) => prev.slice(0, index + 1));
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes("folder")) {
      return <Folder className="w-4 h-4 text-amber-500 fill-amber-500/20" />;
    }
    if (mimeType.includes("spreadsheet")) {
      return <FileSpreadsheet className="w-4 h-4 text-emerald-500" />;
    }
    if (mimeType.includes("document")) {
      return <FileText className="w-4 h-4 text-blue-500" />;
    }
    if (mimeType.includes("presentation")) {
      return <Presentation className="w-4 h-4 text-amber-500" />;
    }
    return <File className="w-4 h-4 text-neutral-400" />;
  };

  const formatFileSize = (bytes?: string) => {
    if (!bytes) return "--";
    const num = parseInt(bytes, 10);
    if (isNaN(num)) return "--";
    if (num < 1024) return `${num} B`;
    if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
    return `${(num / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return "--";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "--";
    }
  };

  const isConnected = Boolean(googleConnected && driveScopeGranted);

  return (
    <AppShell>
      <div className="max-w-[1200px] mx-auto px-2 sm:px-4 lg:px-6 space-y-6 pb-28 sm:pb-12 font-sans">
        
        {/* HEADER SECTION - Apple / Slack Dispatcher Standard */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-2 border-b border-neutral-200/60 dark:border-neutral-800/60">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-lora font-normal sm:font-medium tracking-tight text-neutral-950 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-b dark:from-white dark:via-neutral-200 dark:to-neutral-400/90 leading-tight">
              Google Drive
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 font-normal max-w-xl leading-relaxed">
              Explore, manage, and synchronize cloud assets and workspace documents directly from Launcher OS.
            </p>
          </div>

          {/* Action & Status Group */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <div
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium border border-neutral-200/80 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 text-neutral-600 dark:text-neutral-300"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isConnected ? "bg-emerald-500" : "bg-neutral-400 dark:bg-neutral-600"
                }`}
              />
              <span>{isConnected ? "Google Connected" : "Not Configured"}</span>
            </div>

            <button
              onClick={() => fetchFiles(currentFolderId, activeFilter, searchQuery)}
              disabled={isRefreshing}
              className="px-3.5 py-1.5 rounded-md text-xs font-medium border border-neutral-200/80 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>

            {isConnected && (
              <button
                onClick={() => {
                  setCreateType("folder");
                  setCreateName("");
                  setIsCreateModalOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-md text-xs font-medium bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Item</span>
              </button>
            )}
          </div>
        </div>

        {/* FEEDBACK TOAST NOTIFICATION */}
        {toastMessage && (
          <div className="p-4 rounded-md text-xs sm:text-sm font-normal flex items-center justify-between border transition-all bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-xs text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* OAUTH PERMISSION NOTICE (IF DISCONNECTED) */}
        {!isConnected && (
          <div className="p-5 rounded-md border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#121212] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                Google Drive Authorization Required
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-xl leading-relaxed">
                Connect your Google account to grant reading and file management permissions. Launcher OS will automatically index your drive files.
              </p>
            </div>
            <button
              onClick={handleConnectGoogle}
              className="px-4 py-2 rounded-md bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-xs font-medium hover:opacity-90 transition-opacity shrink-0 flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <span>Connect Google Drive</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* MASTER CARDS WRAPPER (TANPA ROUNDED - POLOS) SEPERTI DI OVERVIEW & SLACK DISPATCHER */}
        <div className="border border-neutral-200/50 dark:border-neutral-800/80 rounded-none bg-neutral-50/30 dark:bg-[#0d0d0d]/60 p-4 sm:p-6 lg:p-7 space-y-6 shadow-none">
          
          {/* QUICK TEMPLATES / FILTER SEGMENTED CONTROLS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                Filter by Category
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                {files.length} items discovered
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: "all", label: "All Files" },
                { id: "spreadsheet", label: "Spreadsheets" },
                { id: "document", label: "Documents" },
                { id: "presentation", label: "Presentations" },
                { id: "folder", label: "Folders" },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setActiveFilter(f.id as DriveFilterType)}
                  className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer border ${
                    activeFilter === f.id
                      ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 border-transparent shadow-xs"
                      : "bg-white dark:bg-neutral-900/70 text-neutral-600 dark:text-neutral-300 border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* SECTION DIVIDER LINE */}
          <div className="h-[1px] w-full bg-neutral-200/50 dark:bg-neutral-800/80" />

          {/* TOOLBAR: FOLDER PATH, SEARCH & VIEW TOGGLE */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Breadcrumb Hierarchy Navigation */}
            <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 overflow-x-auto py-1">
              <button
                type="button"
                onClick={() => navigateBackTo(-1)}
                className="hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1 font-medium"
              >
                <HardDrive className="w-3.5 h-3.5" />
                <span>Drive Root</span>
              </button>
              {folderPath.map((folder, idx) => (
                <React.Fragment key={folder.id}>
                  <ChevronRight className="w-3 h-3 text-neutral-400 shrink-0" />
                  <button
                    type="button"
                    onClick={() => navigateBackTo(idx)}
                    className={`hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer whitespace-nowrap ${
                      idx === folderPath.length - 1 ? "font-semibold text-neutral-900 dark:text-neutral-100" : ""
                    }`}
                  >
                    {folder.name}
                  </button>
                </React.Fragment>
              ))}
            </div>

            {/* Search Input & View Mode */}
            <div className="flex items-center gap-2">
              <form onSubmit={handleSearchSubmit} className="relative flex-1 md:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search files in Drive..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-8.5 pl-8 pr-3 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/70 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 transition-colors"
                />
              </form>

              <div className="flex items-center border border-neutral-200 dark:border-neutral-800 rounded-md p-0.5 bg-white dark:bg-neutral-900/70 shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-sm transition-colors cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                      : "text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                  }`}
                  title="Grid view"
                >
                  <Grid className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-sm transition-colors cursor-pointer ${
                    viewMode === "list"
                      ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                      : "text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                  }`}
                  title="List view"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* MAIN CONTENT AREA */}
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3 text-neutral-400">
              <RefreshCw className="w-5 h-5 animate-spin text-neutral-500" />
              <p className="text-xs font-mono">Syncing Drive files...</p>
            </div>
          ) : files.length === 0 ? (
            <div className="p-12 rounded-md border border-neutral-200/60 dark:border-neutral-800 bg-white dark:bg-[#121212] text-center space-y-3">
              <HardDrive className="w-8 h-8 mx-auto text-neutral-400 opacity-50" />
              <div className="space-y-1">
                <h4 className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                  No files found
                </h4>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  {searchQuery
                    ? `No assets match your search "${searchQuery}".`
                    : "This folder is empty or no files have been created yet."}
                </p>
              </div>
            </div>
          ) : viewMode === "grid" ? (
            /* Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {files.map((file) => {
                const isFolder = file.mimeType.includes("folder");
                const isSpreadsheet = file.mimeType.includes("spreadsheet");

                return (
                  <div
                    key={file.id}
                    onClick={() => (isFolder ? navigateToFolder(file) : null)}
                    className={`p-4 rounded-md border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#121212] hover:border-neutral-300 dark:hover:border-neutral-700 transition-all flex flex-col justify-between gap-3 group relative ${
                      isFolder ? "cursor-pointer hover:bg-neutral-50/50 dark:hover:bg-[#161616]" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="p-2 rounded-md bg-neutral-100 dark:bg-neutral-800/60 shrink-0">
                        {getFileIcon(file.mimeType)}
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {file.webViewLink && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyLink(file);
                            }}
                            className="p-1 rounded-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
                            title="Copy link"
                          >
                            {copiedId === file.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}

                        {file.webViewLink && (
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1 rounded-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
                            title="Open in Google Drive"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-xs font-medium text-neutral-900 dark:text-neutral-100 line-clamp-2 leading-snug">
                        {file.name}
                      </h3>
                      <div className="flex items-center justify-between text-[10.5px] text-neutral-400 font-mono">
                        <span>{formatDate(file.modifiedTime)}</span>
                        <span>{isFolder ? "Folder" : formatFileSize(file.size)}</span>
                      </div>
                    </div>

                    {isSpreadsheet && (
                      <Link
                        href={`/integrations/sheets?spreadsheetId=${file.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1 pt-2 border-t border-neutral-100 dark:border-neutral-800/80 text-[11px] font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white flex items-center justify-between transition-colors"
                      >
                        <span className="flex items-center gap-1.5">
                          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Open in Sheets Studio</span>
                        </span>
                        <ChevronRight className="w-3 h-3 text-neutral-400" />
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* List View */
            <div className="border border-neutral-200/80 dark:border-neutral-800 rounded-md bg-white dark:bg-[#121212] overflow-hidden divide-y divide-neutral-100 dark:divide-neutral-800/80">
              {files.map((file) => {
                const isFolder = file.mimeType.includes("folder");
                const isSpreadsheet = file.mimeType.includes("spreadsheet");

                return (
                  <div
                    key={file.id}
                    onClick={() => (isFolder ? navigateToFolder(file) : null)}
                    className={`p-3 sm:px-4 flex items-center justify-between gap-3 hover:bg-neutral-50/60 dark:hover:bg-[#161616] transition-colors group ${
                      isFolder ? "cursor-pointer" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="shrink-0">{getFileIcon(file.mimeType)}</div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-neutral-900 dark:text-neutral-100 truncate">
                          {file.name}
                        </p>
                      </div>
                    </div>

                    <div className="hidden sm:flex items-center gap-6 text-[11px] text-neutral-400 font-mono shrink-0">
                      <span>{formatDate(file.modifiedTime)}</span>
                      <span className="w-16 text-right">{isFolder ? "--" : formatFileSize(file.size)}</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {isSpreadsheet && (
                        <Link
                          href={`/integrations/sheets?spreadsheetId=${file.id}`}
                          className="px-2.5 py-1 rounded-md text-[11px] font-medium border border-neutral-200/80 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors hidden md:inline-flex items-center gap-1.5"
                        >
                          <FileSpreadsheet className="w-3 h-3 text-emerald-500" />
                          <span>Sheets Studio</span>
                        </Link>
                      )}

                      {file.webViewLink && (
                        <a
                          href={file.webViewLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
                          title="Open in Google Drive"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* CREATE MODAL */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-800 rounded-md p-5 sm:p-6 w-full max-w-md shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800/80">
                <h3 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
                  Create New Item in Google Drive
                </h3>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                    Item Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCreateType("folder")}
                      className={`p-2.5 rounded-md border text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        createType === "folder"
                          ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 border-transparent shadow-xs"
                          : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400"
                      }`}
                    >
                      <FolderPlus className="w-3.5 h-3.5" />
                      <span>New Folder</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCreateType("spreadsheet")}
                      className={`p-2.5 rounded-md border text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        createType === "spreadsheet"
                          ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 border-transparent shadow-xs"
                          : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400"
                      }`}
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Spreadsheet</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                    {createType === "folder" ? "Folder Name" : "Spreadsheet Title"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={createType === "folder" ? "e.g. Q1 Executive Reports" : "e.g. Sales Pipeline 2026"}
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 transition-colors"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-3.5 py-1.5 rounded-md text-xs font-medium border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !createName.trim()}
                    className="px-4 py-1.5 rounded-md bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    {isSubmitting ? "Creating..." : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
