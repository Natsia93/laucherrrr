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
  X,
  Layers,
  CheckCircle2,
} from "lucide-react";
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
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

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
        triggerToast("Spreadsheet created successfully");
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
        triggerToast("New row added to Google Sheets");
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

  const isConnected = Boolean(googleConnected && sheetsScopeGranted);

  return (
    <AppShell>
      <div className="max-w-[1200px] mx-auto px-2 sm:px-4 lg:px-6 space-y-6 pb-28 sm:pb-12 font-sans">
        
        {/* HEADER SECTION - Apple / Slack Dispatcher Standard */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-2 border-b border-neutral-200/60 dark:border-neutral-800/60">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-lora font-normal sm:font-medium tracking-tight text-neutral-950 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-b dark:from-white dark:via-neutral-200 dark:to-neutral-400/90 leading-tight">
              Google Sheets
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 font-normal max-w-xl leading-relaxed">
              Live viewer, tabular editor, and automated data synchronization for Google Spreadsheets.
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
              <span>{isConnected ? "Live Sync Active" : "Not Configured"}</span>
            </div>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-3.5 py-1.5 rounded-md text-xs font-medium border border-neutral-200/80 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>

            {currentSheet?.url && (
              <a
                href={currentSheet.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-md text-xs font-medium border border-neutral-200/80 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                <span>Open in Google</span>
              </a>
            )}

            {isConnected && (
              <>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-md text-xs font-medium border border-neutral-200/80 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors flex items-center gap-1.5 cursor-pointer"
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
                    className="px-3.5 py-1.5 rounded-md text-xs font-medium bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Row</span>
                  </button>
                )}
              </>
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
                <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                Google Sheets Authorization Required
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-xl leading-relaxed">
                Connect your Google account to grant reading and editing permissions for Google Sheets. Launcher OS can read structured tables and append data directly.
              </p>
            </div>
            <button
              onClick={handleConnectGoogle}
              className="px-4 py-2 rounded-md bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-xs font-medium hover:opacity-90 transition-opacity shrink-0 flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <span>Connect Google Sheets</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* MASTER CARDS WRAPPER (TANPA ROUNDED - POLOS) SEPERTI DI OVERVIEW & SLACK DISPATCHER */}
        <div className="border border-neutral-200/50 dark:border-neutral-800/80 rounded-none bg-neutral-50/30 dark:bg-[#0d0d0d]/60 p-4 sm:p-6 lg:p-7 space-y-6 shadow-none">
          
          {/* SPREADSHEET SELECTOR & TABS BAR */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 shrink-0">
                  Select Spreadsheet:
                </span>

                <div className="relative flex-1 max-w-md">
                  <select
                    value={selectedSheetId}
                    onChange={(e) => setSelectedSheetId(e.target.value)}
                    disabled={isLoadingList || spreadsheets.length === 0}
                    className="w-full h-9 pl-3.5 pr-8 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121212] text-xs font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 appearance-none truncate cursor-pointer transition-colors"
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
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search in table..."
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    className="w-full h-8.5 pl-8 pr-3 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/70 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 transition-colors"
                  />
                </div>
              )}
            </div>

            {/* TAB SELECTOR (MATCHING PRESET PILLS) */}
            {currentSheet?.tabs && currentSheet.tabs.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pt-1">
                <span className="text-xs text-neutral-400 font-medium mr-1 flex items-center gap-1 shrink-0">
                  <Layers className="w-3.5 h-3.5" />
                  Tabs:
                </span>
                {currentSheet.tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleTabChange(tab.title)}
                    className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer border ${
                      activeTab === tab.title
                        ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 border-transparent shadow-xs"
                        : "bg-white dark:bg-neutral-900/70 text-neutral-600 dark:text-neutral-300 border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
                    }`}
                  >
                    {tab.title}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* SECTION DIVIDER LINE */}
          <div className="h-[1px] w-full bg-neutral-200/50 dark:bg-neutral-800/80" />

          {/* TABLE CONTENT BOX */}
          {isLoadingDetail ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3 text-neutral-400">
              <RefreshCw className="w-5 h-5 animate-spin text-neutral-500" />
              <p className="text-xs font-mono">Loading spreadsheet rows...</p>
            </div>
          ) : !currentSheet ? (
            <div className="p-12 rounded-md border border-neutral-200/60 dark:border-neutral-800 bg-white dark:bg-[#121212] text-center space-y-3">
              <FileSpreadsheet className="w-8 h-8 mx-auto text-neutral-400 opacity-50" />
              <div className="space-y-1">
                <h4 className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                  No spreadsheet selected
                </h4>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  Pick a spreadsheet from the selector above or click &quot;New Sheet&quot; to start tracking data.
                </p>
              </div>
            </div>
          ) : headers.length === 0 ? (
            <div className="p-12 rounded-md border border-neutral-200/60 dark:border-neutral-800 bg-white dark:bg-[#121212] text-center space-y-3">
              <TableIcon className="w-8 h-8 mx-auto text-neutral-400 opacity-50" />
              <div className="space-y-1">
                <h4 className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                  Spreadsheet is empty
                </h4>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  No columns or rows found in tab &quot;{activeTab || "Sheet1"}&quot;. Click &quot;Add Row&quot; to create the initial row.
                </p>
              </div>
            </div>
          ) : (
            /* REAL DATA TABLE */
            <div className="border border-neutral-200/70 dark:border-neutral-800 rounded-md bg-white dark:bg-[#121212] overflow-hidden shadow-none">
              <div className="overflow-x-auto max-h-[600px] calendar-scrollbar">
                <table className="w-full text-left border-collapse text-xs">
                  {/* Header Row */}
                  <thead className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                    <tr>
                      <th className="w-12 px-3 py-2.5 text-[10.5px] font-mono text-neutral-400 text-center border-r border-neutral-200/60 dark:border-neutral-800/60">
                        #
                      </th>
                      {headers.map((col, idx) => (
                        <th
                          key={idx}
                          className="px-3.5 py-2.5 font-medium text-neutral-800 dark:text-neutral-200 tracking-tight whitespace-nowrap border-r border-neutral-200/60 dark:border-neutral-800/60 last:border-r-0"
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
                          No rows match your filter.
                        </td>
                      </tr>
                    ) : (
                      filteredRows.map((row, rowIdx) => (
                        <tr
                          key={rowIdx}
                          className="hover:bg-neutral-50/60 dark:hover:bg-[#161616] transition-colors"
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
              <div className="p-3 bg-neutral-50/60 dark:bg-neutral-900 border-t border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                <span>{rows.length} rows recorded</span>
                <span>Active: {activeTab || "Sheet1"}</span>
              </div>
            </div>
          )}
        </div>

        {/* ADD ROW MODAL */}
        {isAddRowModalOpen && currentSheet && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-800 rounded-md p-5 sm:p-6 w-full max-w-lg shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800/80 shrink-0">
                <h3 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
                  Append Row to Google Sheets
                </h3>
                <button
                  onClick={() => setIsAddRowModalOpen(false)}
                  className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAppendRow} className="space-y-3.5 overflow-y-auto pr-1 flex-1">
                {headers.map((colName, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                      {colName || `Column ${String.fromCharCode(65 + idx)}`}
                    </label>
                    <input
                      type="text"
                      placeholder={`Enter value for ${colName}...`}
                      value={newRowValues[colName] || ""}
                      onChange={(e) =>
                        setNewRowValues((prev) => ({
                          ...prev,
                          [colName]: e.target.value,
                        }))
                      }
                      className="w-full h-9.5 px-3 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 transition-colors"
                    />
                  </div>
                ))}

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsAddRowModalOpen(false)}
                    className="px-3.5 py-1.5 rounded-md text-xs font-medium border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-1.5 rounded-md bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    {isSubmitting ? "Saving..." : "Save Row"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* CREATE SPREADSHEET MODAL */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-800 rounded-md p-5 sm:p-6 w-full max-w-md shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800/80">
                <h3 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
                  Create New Spreadsheet
                </h3>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateSpreadsheet} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                    Spreadsheet Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Launcher OS Tracking Data"
                    value={newSheetTitle}
                    onChange={(e) => setNewSheetTitle(e.target.value)}
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
                    disabled={isSubmitting || !newSheetTitle.trim()}
                    className="px-4 py-1.5 rounded-md bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    {isSubmitting ? "Creating..." : "Create Spreadsheet"}
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
            <RefreshCw className="w-6 h-6 animate-spin text-neutral-500" />
            <p className="text-xs font-mono">Loading Google Sheets Studio...</p>
          </div>
        </AppShell>
      }
    >
      <GoogleSheetsContent />
    </Suspense>
  );
}
