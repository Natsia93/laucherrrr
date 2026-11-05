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
  ArrowLeft,
  ChevronRight,
  HardDrive,
  X,
  FileCheck,
} from "lucide-react";
import Link from "next/link";

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
      return <Folder className="w-5 h-5 text-amber-500 fill-amber-500/20" />;
    }
    if (mimeType.includes("spreadsheet")) {
      return <FileSpreadsheet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
    }
    if (mimeType.includes("document")) {
      return <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
    }
    if (mimeType.includes("presentation")) {
      return <Presentation className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
    }
    return <File className="w-5 h-5 text-neutral-500" />;
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
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "--";
    }
  };

  return (
    <AppShell>
      <div className="max-w-[1280px] mx-auto px-3 sm:px-6 py-6 space-y-6">
        {/* Header Breadcrumb & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200/70 dark:border-neutral-800">
          <div>
            <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mb-1">
              <Link href="/overview" className="hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors">
                Overview
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span>Integrations</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-neutral-900 dark:text-neutral-100 font-medium">Google Drive</span>
            </div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                Google Drive Hub
              </h1>
              {driveScopeGranted && (
                <span className="px-2 py-0.5 rounded text-[10.5px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Synced
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Live explorer and sync center for your Google Drive files, spreadsheets, and docs.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchFiles(currentFolderId, activeFilter, searchQuery)}
              disabled={isRefreshing}
              className="p-2 sm:px-3 sm:py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/80 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Refresh files"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {driveScopeGranted && (
              <button
                onClick={() => {
                  setCreateType("folder");
                  setCreateName("");
                  setIsCreateModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New</span>
              </button>
            )}
          </div>
        </div>

        {/* OAuth Consent / Scope Warning Banner */}
        {(!googleConnected || !driveScopeGranted) && (
          <div className="p-4 sm:p-5 rounded-xl border border-amber-300/60 dark:border-amber-700/40 bg-amber-50/50 dark:bg-amber-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                Otorisasi Google Drive Diperlukan
              </h3>
              <p className="text-xs text-amber-800/80 dark:text-amber-300/80 leading-relaxed max-w-2xl">
                Launcher OS membutuhkan izin akses Google Drive untuk menampilkan file dan menyinkronkan dokumen. Klik tombol di samping untuk mengotorisasi akun Google kamu.
              </p>
            </div>
            <button
              onClick={handleConnectGoogle}
              className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-colors shrink-0 flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <span>Hubungkan Google Drive</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Navigation Breadcrumb inside Drive Folder */}
        {folderPath.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900/60 p-2.5 rounded-lg border border-neutral-200/80 dark:border-neutral-800">
            <button
              onClick={() => navigateBackTo(-1)}
              className="hover:text-neutral-950 dark:hover:text-white font-medium flex items-center gap-1 transition-colors cursor-pointer"
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>Root Drive</span>
            </button>
            {folderPath.map((folder, idx) => (
              <React.Fragment key={folder.id}>
                <ChevronRight className="w-3 h-3 text-neutral-400" />
                <button
                  onClick={() => navigateBackTo(idx)}
                  className={`hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer ${
                    idx === folderPath.length - 1 ? "font-semibold text-neutral-900 dark:text-neutral-100" : ""
                  }`}
                >
                  {folder.name}
                </button>
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: "all", label: "All Files" },
              { id: "spreadsheet", label: "Spreadsheets" },
              { id: "document", label: "Documents" },
              { id: "presentation", label: "Presentations" },
              { id: "folder", label: "Folders" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 border ${
                  activeFilter === f.id
                    ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-neutral-900 dark:border-white shadow-2xs"
                    : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/60"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search Bar & View Mode Toggle */}
          <div className="flex items-center gap-2">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 md:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search drive files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 focus:outline-hidden focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600 text-neutral-900 dark:text-neutral-100"
              />
            </form>

            <div className="flex items-center border border-neutral-200 dark:border-neutral-800 rounded-lg p-0.5 bg-white dark:bg-neutral-900 shrink-0">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    : "text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                }`}
                title="Grid view"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
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

        {/* Files Display */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-neutral-400">
            <RefreshCw className="w-6 h-6 animate-spin text-neutral-500" />
            <p className="text-xs">Loading Google Drive files...</p>
          </div>
        ) : files.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50/40 dark:bg-neutral-900/20 space-y-3">
            <HardDrive className="w-10 h-10 mx-auto text-neutral-400 opacity-60" />
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                Tidak ada file ditemukan
              </h4>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                {searchQuery
                  ? `Tidak ada file yang cocok dengan pencarian "${searchQuery}".`
                  : "Folder ini kosong atau belum ada file yang disinkronkan."}
              </p>
            </div>
          </div>
        ) : viewMode === "grid" ? (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {files.map((file) => {
              const isFolder = file.mimeType.includes("folder");
              const isSpreadsheet = file.mimeType.includes("spreadsheet");

              return (
                <div
                  key={file.id}
                  onClick={() => (isFolder ? navigateToFolder(file) : null)}
                  className={`p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all flex flex-col justify-between gap-3 group relative ${
                    isFolder ? "cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-850" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800/80 shrink-0">
                      {getFileIcon(file.mimeType)}
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {file.webViewLink && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyLink(file);
                          }}
                          className="p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
                          title="Copy Link"
                        >
                          {copiedId === file.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      )}

                      {file.webViewLink && (
                        <a
                          href={file.webViewLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
                          title="Open in Google Drive"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 line-clamp-2 leading-snug">
                      {file.name}
                    </h3>
                    <div className="flex items-center justify-between text-[10.5px] text-neutral-500 font-mono">
                      <span>{formatDate(file.modifiedTime)}</span>
                      <span>{isFolder ? "Folder" : formatFileSize(file.size)}</span>
                    </div>
                  </div>

                  {isSpreadsheet && (
                    <Link
                      href={`/integrations/sheets?spreadsheetId=${file.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1 pt-2 border-t border-neutral-100 dark:border-neutral-800 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <FileSpreadsheet className="w-3 h-3" />
                      <span>Open in Sheets Studio</span>
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="border border-neutral-200/80 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-900/60 overflow-hidden divide-y divide-neutral-100 dark:divide-neutral-800">
            {files.map((file) => {
              const isFolder = file.mimeType.includes("folder");
              const isSpreadsheet = file.mimeType.includes("spreadsheet");

              return (
                <div
                  key={file.id}
                  onClick={() => (isFolder ? navigateToFolder(file) : null)}
                  className={`p-3 sm:px-4 flex items-center justify-between gap-3 hover:bg-neutral-50 dark:hover:bg-neutral-850/60 transition-colors group ${
                    isFolder ? "cursor-pointer" : ""
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="shrink-0">{getFileIcon(file.mimeType)}</div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                        {file.name}
                      </p>
                      <span className="text-[10px] text-neutral-400 font-mono block sm:hidden">
                        {formatDate(file.modifiedTime)}
                      </span>
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center gap-6 text-[11px] text-neutral-500 font-mono shrink-0">
                    <span>{formatDate(file.modifiedTime)}</span>
                    <span className="w-16 text-right">{isFolder ? "--" : formatFileSize(file.size)}</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {isSpreadsheet && (
                      <Link
                        href={`/integrations/sheets?spreadsheetId=${file.id}`}
                        className="px-2 py-1 rounded text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors hidden md:inline-flex items-center gap-1"
                      >
                        <FileSpreadsheet className="w-3 h-3" />
                        <span>Open Sheet</span>
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

        {/* Create Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 w-full max-w-md shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-emerald-500" />
                  Buat Item Baru di Google Drive
                </h3>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    Tipe Item
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCreateType("folder")}
                      className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        createType === "folder"
                          ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 text-amber-950 dark:text-amber-200"
                          : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400"
                      }`}
                    >
                      <FolderPlus className="w-4 h-4 text-amber-500" />
                      <span>Folder Baru</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCreateType("spreadsheet")}
                      className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        createType === "spreadsheet"
                          ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-200"
                          : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400"
                      }`}
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                      <span>Spreadsheet</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    Nama {createType === "folder" ? "Folder" : "Spreadsheet"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={createType === "folder" ? "Contoh: Laporan Q1" : "Contoh: Data Leads Marketing"}
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-xs bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 focus:outline-hidden focus:ring-1 focus:ring-neutral-400 text-neutral-900 dark:text-neutral-100"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !createName.trim()}
                    className="px-4 py-1.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? "Membuat..." : "Buat Sekarang"}
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

