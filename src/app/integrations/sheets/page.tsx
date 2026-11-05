"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { authClient } from "@/lib/auth-client";
import {
  FileSpreadsheet,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Menu,
  Table as TableIcon,
  Search,
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
  tabs: Array<{
    id: number;
    title: string;
    rowCount?: number;
    columnCount?: number;
    frozenRowCount?: number;
    frozenColumnCount?: number;
  }>;
  activeTab: string;
  frozenRowCount?: number;
  frozenColumnCount?: number;
  wrapStrategies?: Record<number, string>;
  values: string[][];
}

// In-memory cache for ultra-fast sheet & tab switching
const sheetsDetailCache = new Map<string, SheetDetail>();

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

  // Tab horizontal scroll ref
  const tabsScrollRef = useRef<HTMLDivElement>(null);

  const scrollTabs = (direction: "left" | "right") => {
    if (tabsScrollRef.current) {
      tabsScrollRef.current.scrollBy({
        left: direction === "left" ? -240 : 240,
        behavior: "smooth",
      });
    }
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

  // 2. Fetch details & values of the selected spreadsheet (with in-memory cache)
  const fetchSheetDetail = async (id: string, tab = "", forceRefresh = false) => {
    if (!id) return;
    const cacheKey = `${id}::${tab}`;

    // Instant switch if tab is already cached
    if (!forceRefresh && sheetsDetailCache.has(cacheKey)) {
      const cached = sheetsDetailCache.get(cacheKey)!;
      setCurrentSheet(cached);
      setActiveTab(cached.activeTab);
      setIsLoadingDetail(false);
      setIsRefreshing(false);
      return;
    }

    try {
      setIsLoadingDetail(true);
      const url = `/api/google/sheets?spreadsheetId=${encodeURIComponent(id)}${
        tab ? `&tab=${encodeURIComponent(tab)}` : ""
      }`;
      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();

      if (data.success && data.spreadsheet) {
        sheetsDetailCache.set(cacheKey, data.spreadsheet);
        if (!tab && data.spreadsheet.activeTab) {
          sheetsDetailCache.set(`${id}::${data.spreadsheet.activeTab}`, data.spreadsheet);
        }
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
    // Invalidate cache for current spreadsheet on manual refresh
    for (const key of sheetsDetailCache.keys()) {
      if (key.startsWith(`${selectedSheetId}::`)) {
        sheetsDetailCache.delete(key);
      }
    }
    await fetchSpreadsheets();
    if (selectedSheetId) {
      await fetchSheetDetail(selectedSheetId, activeTab, true);
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
          </div>
        </div>

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
                  Pick a spreadsheet from the selector above to start viewing and monitoring data.
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
                  No columns or rows found in tab &quot;{activeTab || "Sheet1"}&quot;.
                </p>
              </div>
            </div>
          ) : (
            /* REAL DATA TABLE WITH FROZEN COLUMNS & MULTILINE TEXT WRAPPING */
            <div className="border border-neutral-200/70 dark:border-neutral-800 rounded-md bg-white dark:bg-[#121212] overflow-hidden shadow-none">
              <div className="overflow-x-auto max-h-[640px] calendar-scrollbar">
                <table className="w-full text-left border-collapse text-xs">
                  {/* Header Row */}
                  <thead className="sticky top-0 z-20 bg-neutral-100 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                    <tr>
                      <th className="w-12 min-w-[48px] max-w-[48px] px-3 py-2.5 text-[10.5px] font-mono text-neutral-400 text-center border-r border-neutral-200/80 dark:border-neutral-800 select-none">
                        #
                      </th>
                      {headers.map((col, idx) => {
                        const shouldWrapCol =
                          currentSheet?.wrapStrategies?.[idx] === "WRAP" ||
                          /(case|example|desc|topic|overview|notes|objective|link|detail|curriculum|summary)/i.test(col || "");
                        const isShortCol = /(duration|hours|min|profil|id|no|date|time|week|sync|async)/i.test(col || "");

                        let widthClass = "min-w-[170px] max-w-[280px]";
                        if (isShortCol) {
                          widthClass = "w-28 min-w-[105px] max-w-[130px]";
                        } else if (shouldWrapCol) {
                          widthClass = "min-w-[300px] max-w-[500px]";
                        }

                        return (
                          <th
                            key={idx}
                            className={`px-3.5 py-2.5 font-medium text-neutral-800 dark:text-neutral-200 tracking-tight border-r border-neutral-200/60 dark:border-neutral-800/60 last:border-r-0 ${widthClass} ${
                              isShortCol ? "text-center" : "text-left"
                            } ${shouldWrapCol ? "whitespace-normal break-words" : "whitespace-nowrap"}`}
                          >
                            {col || `Column ${String.fromCharCode(65 + idx)}`}
                          </th>
                        );
                      })}
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
                          className="hover:bg-neutral-50/70 dark:hover:bg-[#161616] transition-colors"
                        >
                          <td className="w-12 min-w-[48px] max-w-[48px] px-3 py-3 text-[10px] font-mono text-neutral-400 text-center border-r border-neutral-100 dark:border-neutral-800/60 select-none align-top">
                            {rowIdx + 1}
                          </td>
                          {headers.map((colName, colIdx) => {
                            const shouldWrapCol =
                              currentSheet?.wrapStrategies?.[colIdx] === "WRAP" ||
                              /(case|example|desc|topic|overview|notes|objective|link|detail|curriculum|summary)/i.test(colName || "");
                            const isShortCol = /(duration|hours|min|profil|id|no|date|time|week|sync|async)/i.test(colName || "");

                            let widthClass = "min-w-[170px] max-w-[280px]";
                            if (isShortCol) {
                              widthClass = "w-28 min-w-[105px] max-w-[130px]";
                            } else if (shouldWrapCol) {
                              widthClass = "min-w-[300px] max-w-[500px]";
                            }

                            const cellVal = row[colIdx];
                            const isCellWrapped =
                              shouldWrapCol ||
                              Boolean(cellVal && (cellVal.includes("\n") || cellVal.length > 55));

                            return (
                              <td
                                key={colIdx}
                                className={`px-3.5 text-neutral-700 dark:text-neutral-300 font-normal border-r border-neutral-100 dark:border-neutral-800/60 last:border-r-0 ${widthClass} ${
                                  isShortCol ? "text-center" : "text-left"
                                } ${
                                  isCellWrapped
                                    ? "py-3.5 align-top whitespace-pre-wrap break-words leading-relaxed text-[12px]"
                                    : "py-2.5 align-middle whitespace-nowrap truncate text-[12px]"
                                }`}
                              >
                                {cellVal || "--"}
                              </td>
                            );
                          })}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* GOOGLE SHEETS AUTHENTIC BOTTOM TAB BAR */}
              {currentSheet?.tabs && currentSheet.tabs.length > 0 && (
                <div className="border-t border-neutral-200/80 dark:border-neutral-800 bg-neutral-100/90 dark:bg-[#151515] flex items-center justify-between px-2 py-1 select-none text-xs">
                  {/* Left Controls (Menu to cycle tabs) */}
                  <div className="flex items-center gap-1 shrink-0 pr-2 border-r border-neutral-200/80 dark:border-neutral-800">
                    <button
                      type="button"
                      onClick={() => {
                        if (currentSheet.tabs.length > 1) {
                          const currIdx = currentSheet.tabs.findIndex((t) => t.title === activeTab);
                          const nextTab = currentSheet.tabs[(currIdx + 1) % currentSheet.tabs.length];
                          if (nextTab) handleTabChange(nextTab.title);
                        }
                      }}
                      className="p-1.5 rounded hover:bg-neutral-200/80 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                      title="Next Tab"
                    >
                      <Menu className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Center: Scrollable Single-Line Tabs Strip (Muscle Memory Google Sheets) */}
                  <div
                    ref={tabsScrollRef}
                    className="flex items-center overflow-x-auto flex-1 min-w-0 mx-2 no-scrollbar scroll-smooth"
                  >
                    {currentSheet.tabs.map((tab, tabIdx) => {
                      const isActive = activeTab === tab.title;
                      return (
                        <React.Fragment key={tab.id}>
                          <button
                            type="button"
                            onClick={() => handleTabChange(tab.title)}
                            className={`whitespace-nowrap px-3.5 py-1.5 rounded-t-sm text-xs transition-all flex items-center cursor-pointer shrink-0 border-b-2 ${
                              isActive
                                ? "bg-white dark:bg-[#202020] text-neutral-950 dark:text-white border-neutral-900 dark:border-white shadow-xs font-semibold"
                                : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 hover:text-neutral-900 dark:hover:text-white border-transparent font-medium"
                            }`}
                            title={`Switch to ${tab.title}`}
                          >
                            <span>{tab.title}</span>
                          </button>
                          {/* Garis Pemisah Antar Tab */}
                          {tabIdx < currentSheet.tabs.length - 1 && (
                            <div className="w-[1px] h-3.5 bg-neutral-300 dark:bg-neutral-800 shrink-0 mx-0.5" />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>

                  {/* Right: Horizontal Scroll Arrows */}
                  <div className="flex items-center gap-0.5 shrink-0 pl-2 border-l border-neutral-200/80 dark:border-neutral-800">
                    <button
                      type="button"
                      onClick={() => scrollTabs("left")}
                      className="p-1 rounded hover:bg-neutral-200/80 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                      title="Scroll tabs left"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollTabs("right")}
                      className="p-1 rounded hover:bg-neutral-200/80 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                      title="Scroll tabs right"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
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
