"use client";

import React, { useState, useEffect, Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { authClient } from "@/lib/auth-client";
import {
  FileSpreadsheet,
  RefreshCw,
  Plus,
  ExternalLink,
  ChevronDown,
  Table as TableIcon,
  Search,
  Check,
  X,
  ChevronRight,
  Sparkles,
  Layers,
  ArrowUpDown,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface SpreadsheetSummary {
  id: string;
  name: string;
  modifiedTime?: string;
  webViewLink?: string;
}

interface SheetDetail {
  id: string;
  title: string;
  url: string;
  tabs: Array<{ id: number; title: string; rowCount?: number; columnCount?: number }>;
  activeTab: string;
  values: string[][];
}

function GoogleSheetsContent() {
  const { data: session } = authClient.useSession();
  const searchParams = useSearchParams();
  const initialSpreadsheetId = searchParams.get("spreadsheetId") || "";

  const [spreadsheets, setSpreadsheets] = useState<SpreadsheetSummary[]>([]);
  const [selectedSheetId, setSelectedSheetId] = useState<string>(initialSpreadsheetId);
  const [currentSheet, setCurrentSheet] = useState<SheetDetail | null>(null);
  const [activeTab, setActiveTab] = useState<string>("");

  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(true);
  const [sheetsScopeGranted, setSheetsScopeGranted] = useState(true);

  // Table Search Filter
  const [filterText, setFilterText] = useState("");

  // Modals
  const [isAddRowModalOpen, setIsAddRowModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newSheetTitle, setNewSheetTitle] = useState("");
  const [newRowValues, setNewRowValues] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Fetch user's spreadsheet list
  const fetchSpreadsheets = async () => {
    try {
      setIsLoadingList(true);
      const res = await fetch("/api/google/sheets", { cache: "no-store" });
      const data = await res.json();

      if (data.success) {
        setGoogleConnected(Boolean(data.googleConnected));
        setSheetsScopeGranted(Boolean(data.sheetsScopeGranted));
        const list: SpreadsheetSummary[] = data.spreadsheets || [];
        setSpreadsheets(list);

        // If no selected sheet and list has items, select the first one
        if (!selectedSheetId && list.length > 0) {
          setSelectedSheetId(list[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch spreadsheets:", err);
    } finally {
      setIsLoadingList(false);
    }
  };

  // 2. Fetch details & values of the selected spreadsheet
  const fetchSheetDetail = async (id: string, tab = "") => {
    if (!id) return;
    try {
      setIsLoadingDetail(true);
      const url = `/api/google/sheets?spreadsheetId=${encodeURIComponent(id)}${
        tab ? `&tab=${encodeURIComponent(tab)}` : ""
      }`;
      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();

      if (data.success && data.spreadsheet) {
        setCurrentSheet(data.spreadsheet);
        setActiveTab(data.spreadsheet.activeTab);
      }
    } catch (err) {
      console.error("Failed to fetch sheet details:", err);
    } finally {
      setIsLoadingDetail(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSpreadsheets();
  }, [session]);

  useEffect(() => {
    if (selectedSheetId) {
      fetchSheetDetail(selectedSheetId, activeTab);
    }
  }, [selectedSheetId]);

  const handleTabChange = (tabTitle: string) => {
    setActiveTab(tabTitle);
    fetchSheetDetail(selectedSheetId, tabTitle);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchSpreadsheets();
    if (selectedSheetId) {
      await fetchSheetDetail(selectedSheetId, activeTab);
    }
  };

  const handleConnectGoogle = async () => {
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/integrations/sheets",
      });
    } catch (err) {
      console.error("Google OAuth error:", err);
    }
  };

  const handleCreateSpreadsheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSheetTitle.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/google/sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          title: newSheetTitle.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.spreadsheet?.spreadsheetId) {
        setIsCreateModalOpen(false);
        setNewSheetTitle("");
        await fetchSpreadsheets();
        setSelectedSheetId(data.spreadsheet.spreadsheetId);
      }
    } catch (err) {
      console.error("Failed to create spreadsheet:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAppendRow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSheet) return;

    const headersList = currentSheet.values[0] || [];
    const orderedValues = headersList.map((h) => newRowValues[h] || "");

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/google/sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "append_row",
          spreadsheetId: currentSheet.id,
          range: `${activeTab || "Sheet1"}!A1`,
          values: orderedValues,
        }),
      });

      if (res.ok) {
        setIsAddRowModalOpen(false);
        setNewRowValues({});
        await fetchSheetDetail(currentSheet.id, activeTab);
      }
    } catch (err) {
      console.error("Failed to append row:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Process rows & headers
  const headers = currentSheet?.values?.[0] || [];
  const rows = currentSheet?.values?.slice(1) || [];

  const filteredRows = rows.filter((row) => {
    if (!filterText.trim()) return true;
    const match = filterText.toLowerCase();
    return row.some((cell) => cell?.toLowerCase().includes(match));
  });

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
              <span className="text-neutral-900 dark:text-neutral-100 font-medium">Google Sheets</span>
            </div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                Google Sheets Studio
              </h1>
              {sheetsScopeGranted && (
                <span className="px-2 py-0.5 rounded text-[10.5px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Live Sync
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Connect, view, and append data directly into your Google Spreadsheets.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 sm:px-3 sm:py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/80 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Refresh sheet data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {currentSheet?.url && (
              <a
                href={currentSheet.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/80 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                <span className="hidden sm:inline">Open in Google</span>
              </a>
            )}

            {sheetsScopeGranted && (
              <>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/80 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Sheet</span>
                </button>

                {currentSheet && (
                  <button
                    onClick={() => {
                      setNewRowValues({});
                      setIsAddRowModalOpen(true);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Row</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* OAuth Consent Warning Banner */}
        {(!googleConnected || !sheetsScopeGranted) && (
          <div className="p-4 sm:p-5 rounded-xl border border-amber-300/60 dark:border-amber-700/40 bg-amber-50/50 dark:bg-amber-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Otorisasi Google Sheets Diperlukan
              </h3>
              <p className="text-xs text-amber-800/80 dark:text-amber-300/80 leading-relaxed max-w-2xl">
                Launcher OS membutuhkan izin akses Google Sheets untuk membaca dan memperbarui data tabel secara otomatis.
              </p>
            </div>
            <button
              onClick={handleConnectGoogle}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shrink-0 flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <span>Hubungkan Google Sheets</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Spreadsheet Selector & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Active Spreadsheet Selector */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 shrink-0">
              <FileSpreadsheet className="w-4 h-4" />
            </div>

            <div className="relative flex-1 max-w-md">
              <select
                value={selectedSheetId}
                onChange={(e) => setSelectedSheetId(e.target.value)}
                disabled={isLoadingList || spreadsheets.length === 0}
                className="w-full pl-3 pr-8 py-2 rounded-lg text-xs font-medium bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 text-neutral-900 dark:text-neutral-100 cursor-pointer appearance-none truncate"
              >
                {spreadsheets.length === 0 ? (
                  <option value="">{isLoadingList ? "Loading spreadsheets..." : "No spreadsheets found"}</option>
                ) : (
                  spreadsheets.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))
                )}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Quick Search within Table */}
          {currentSheet && (
            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Filter table rows..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 text-neutral-900 dark:text-neutral-100"
              />
            </div>
          )}
        </div>

        {/* Tab Selector if spreadsheet has multiple sheets */}
        {currentSheet?.tabs && currentSheet.tabs.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto border-b border-neutral-200 dark:border-neutral-800 pb-2">
            <span className="text-xs text-neutral-400 font-medium mr-1 flex items-center gap-1 shrink-0">
              <Layers className="w-3.5 h-3.5" />
              Tabs:
            </span>
            {currentSheet.tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.title)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer shrink-0 border ${
                  activeTab === tab.title
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                    : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/60"
                }`}
              >
                {tab.title}
              </button>
            ))}
          </div>
        )}

        {/* Table Content View */}
        {isLoadingDetail ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-neutral-400">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
            <p className="text-xs">Loading spreadsheet rows...</p>
          </div>
        ) : !currentSheet ? (
          <div className="py-20 text-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50/40 dark:bg-neutral-900/20 space-y-3">
            <FileSpreadsheet className="w-10 h-10 mx-auto text-neutral-400 opacity-60" />
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                Pilih atau Buat Spreadsheet
              </h4>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Pilih spreadsheet dari menu di atas atau klik tombol "New Sheet" untuk memulai tabel data baru.
              </p>
            </div>
          </div>
        ) : headers.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50/40 dark:bg-neutral-900/20 space-y-3">
            <TableIcon className="w-8 h-8 mx-auto text-neutral-400 opacity-60" />
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                Lembar Kerja Masih Kosong
              </h4>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Belum ada data di tab "{activeTab || "Sheet1"}". Klik "Add Row" untuk memasukkan baris pertama.
              </p>
            </div>
          </div>
        ) : (
          /* Real Data Table */
          <div className="border border-neutral-200/90 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-900/70 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto max-h-[620px] calendar-scrollbar">
              <table className="w-full text-left border-collapse text-xs">
                {/* Header Row */}
                <thead className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-850/90 backdrop-blur-xs border-b border-neutral-200 dark:border-neutral-800">
                  <tr>
                    <th className="w-12 px-3 py-2.5 text-[10.5px] font-mono text-neutral-400 text-center border-r border-neutral-200/60 dark:border-neutral-800/60">
                      #
                    </th>
                    {headers.map((col, idx) => (
                      <th
                        key={idx}
                        className="px-3.5 py-2.5 font-semibold text-neutral-800 dark:text-neutral-200 tracking-tight whitespace-nowrap border-r border-neutral-200/60 dark:border-neutral-800/60 last:border-r-0"
                      >
                        {col || `Column ${String.fromCharCode(65 + idx)}`}
                      </th>
                    ))}
                  </tr>
                </thead>

                {/* Rows */}
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
                  {filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={headers.length + 1} className="py-12 text-center text-xs text-neutral-400">
                        Tidak ada baris yang cocok dengan filter.
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((row, rowIdx) => (
                      <tr
                        key={rowIdx}
                        className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors"
                      >
                        <td className="w-12 px-3 py-2 text-[10px] font-mono text-neutral-400 text-center border-r border-neutral-100 dark:border-neutral-800/60 select-none">
                          {rowIdx + 1}
                        </td>
                        {headers.map((_, colIdx) => (
                          <td
                            key={colIdx}
                            className="px-3.5 py-2 text-neutral-700 dark:text-neutral-300 font-normal whitespace-nowrap border-r border-neutral-100 dark:border-neutral-800/60 last:border-r-0"
                          >
                            {row[colIdx] || "--"}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer info */}
            <div className="p-3 bg-neutral-50/60 dark:bg-neutral-900 border-t border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between text-[11px] text-neutral-500 font-mono">
              <span>Total: {rows.length} baris data</span>
              <span>Sheet: {activeTab || "Sheet1"}</span>
            </div>
          </div>
        )}

        {/* Add Row Modal */}
        {isAddRowModalOpen && currentSheet && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 w-full max-w-lg shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800 shrink-0">
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-emerald-500" />
                  Tambah Baris Data Baru ke Google Sheets
                </h3>
                <button
                  onClick={() => setIsAddRowModalOpen(false)}
                  className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAppendRow} className="space-y-3 overflow-y-auto pr-1 flex-1">
                {headers.map((colName, idx) => (
                  <div key={idx} className="space-y-1">
                    <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                      {colName || `Column ${String.fromCharCode(65 + idx)}`}
                    </label>
                    <input
                      type="text"
                      placeholder={`Isi nilai untuk ${colName}...`}
                      value={newRowValues[colName] || ""}
                      onChange={(e) =>
                        setNewRowValues((prev) => ({
                          ...prev,
                          [colName]: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 text-neutral-900 dark:text-neutral-100"
                    />
                  </div>
                ))}

                <div className="flex items-center justify-end gap-2 pt-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsAddRowModalOpen(false)}
                    className="px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    {isSubmitting ? "Menyimpan..." : "Simpan ke Google Sheets"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Spreadsheet Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 w-full max-w-md shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-emerald-500" />
                  Buat Spreadsheet Baru
                </h3>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateSpreadsheet} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    Judul Spreadsheet
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Launcher OS Data Tracking"
                    value={newSheetTitle}
                    onChange={(e) => setNewSheetTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-xs bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 text-neutral-900 dark:text-neutral-100"
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
                    disabled={isSubmitting || !newSheetTitle.trim()}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    {isSubmitting ? "Membuat..." : "Buat Spreadsheet"}
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

export default function GoogleSheetsPage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-neutral-400">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
            <p className="text-xs">Loading Google Sheets Studio...</p>
          </div>
        </AppShell>
      }
    >
      <GoogleSheetsContent />
    </Suspense>
  );
}

