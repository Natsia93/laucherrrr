"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { format, parseISO, isToday, isValid } from "date-fns";
import { 
  Calendar, 
  ArrowUpRight, 
  RefreshCw, 
  Video, 
  MapPin, 
  CalendarDays,
  Plus
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";

export interface AgendaEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  category?: string;
  color?: string;
  location?: string;
  meetLink?: string;
  isAllDay?: boolean;
  source?: "google" | "local";
}

export function OverviewAgenda() {
  const { data: session } = authClient.useSession();
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [calendarScopeGranted, setCalendarScopeGranted] = useState(false);

  // Load from local storage cache immediately for instant render (0ms delay)
  useEffect(() => {
    try {
      const cached = localStorage.getItem("launcher_overview_agenda_cache");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed.events)) {
          setEvents(parsed.events);
          setGoogleConnected(Boolean(parsed.googleConnected));
          setCalendarScopeGranted(Boolean(parsed.calendarScopeGranted));
          setLoading(false);
        }
      }
    } catch {}
  }, []);

  const fetchAgenda = useCallback(async (force = false) => {
    try {
      const res = await fetch(`/api/calendar/events${force ? "?refresh=true" : ""}`, { 
        cache: "no-store" 
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.events)) {
        setGoogleConnected(Boolean(data.googleConnected));
        setCalendarScopeGranted(Boolean(data.calendarScopeGranted));

        // Filter events strictly for today
        const todayEvents = data.events
          .filter((evt: AgendaEvent) => {
            if (!evt.startTime) return false;
            try {
              const parsed = parseISO(evt.startTime);
              return isValid(parsed) && isToday(parsed);
            } catch {
              return false;
            }
          })
          .sort((a: AgendaEvent, b: AgendaEvent) => {
            return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
          });

        setEvents(todayEvents);

        try {
          localStorage.setItem(
            "launcher_overview_agenda_cache",
            JSON.stringify({
              events: todayEvents,
              googleConnected: Boolean(data.googleConnected),
              calendarScopeGranted: Boolean(data.calendarScopeGranted),
              updatedAt: Date.now(),
            })
          );
        } catch {}
      }
    } catch (err) {
      console.error("Failed to load today's agenda:", err);
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    fetchAgenda();
  }, [fetchAgenda, session]);

  const handleManualSync = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSyncing(true);
    await fetchAgenda(true);
  };

  const formatEventTime = (event: AgendaEvent) => {
    if (event.isAllDay) return "All Day";
    try {
      const start = parseISO(event.startTime);
      if (!isValid(start)) return "Today";
      const startStr = format(start, "hh:mm a");
      if (event.endTime) {
        const end = parseISO(event.endTime);
        if (isValid(end)) {
          return `${startStr} - ${format(end, "hh:mm a")}`;
        }
      }
      return startStr;
    } catch {
      return "Today";
    }
  };

  return (
    <div className="p-5 sm:p-6 bg-white dark:bg-[#121212] border border-neutral-200/50 dark:border-neutral-800 rounded-xl shadow-none ring-0 flex flex-col justify-between min-h-[420px] h-full transition-all">
      <div className="flex-1 flex flex-col">
        {/* Header with Title and Sync Action */}
        <div className="flex items-center justify-between pb-3.5 mb-2 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800/80 text-neutral-900 dark:text-white">
              <Calendar className="w-4 h-4 text-neutral-900 dark:text-white shrink-0 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-neutral-950 dark:text-white tracking-tight leading-none">
                Today&apos;s Agenda
              </h3>
              <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                {format(new Date(), "EEEE, d MMMM yyyy")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleManualSync}
              disabled={isSyncing || loading}
              title="Sync events"
              className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-[#D4A800]" : ""}`} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col justify-start">
          {loading ? (
            /* Skeleton Loading State */
            <div className="space-y-3 py-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="py-2.5 px-2 rounded-lg border border-neutral-100 dark:border-neutral-800/60 bg-neutral-50/50 dark:bg-neutral-900/30 animate-pulse space-y-2">
                  <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded-md w-24" />
                  <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded-md w-4/5" />
                </div>
              ))}
            </div>
          ) : events.length > 0 ? (
            /* Real Agenda Events List */
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800/80 space-y-0.5 max-h-[290px] overflow-y-auto pr-1">
              {events.map((item) => {
                return (
                  <div
                    key={item.id}
                    className="py-3 px-2.5 rounded-lg hover:bg-neutral-50/90 dark:hover:bg-neutral-900/60 transition-colors group relative"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 min-w-0 flex-1">
                        {/* Time & Category Indicator */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 tracking-tight">
                            {formatEventTime(item)}
                          </span>
                          {item.source === "google" && (
                            <span className="text-[9.5px] px-1.5 py-0.2 rounded-sm bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 font-medium">
                              Google
                            </span>
                          )}
                        </div>

                        {/* Event Title */}
                        <h4 className="text-[13.5px] sm:text-[14px] font-medium text-neutral-800 dark:text-neutral-100 leading-snug group-hover:text-neutral-950 dark:group-hover:text-white transition-colors truncate">
                          {item.title}
                        </h4>

                        {/* Location / Meta */}
                        {item.location && (
                          <p className="text-[11.5px] text-neutral-400 dark:text-neutral-500 flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span className="truncate">{item.location}</span>
                          </p>
                        )}
                      </div>

                      {/* Google Meet Link Action Button */}
                      {item.meetLink && (
                        <a
                          href={item.meetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Join Google Meet"
                          className="shrink-0 p-1.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors flex items-center gap-1 text-[11px] font-medium cursor-pointer"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Join</span>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty State (No Events Today) */
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8 px-4">
              <div className="w-11 h-11 rounded-full bg-neutral-100 dark:bg-neutral-800/80 flex items-center justify-center mb-3 text-neutral-400 dark:text-neutral-500">
                <CalendarDays className="w-5 h-5 stroke-[1.8]" />
              </div>
              <h4 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
                Tidak ada agenda hari ini
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-[220px] leading-relaxed mb-4">
                {googleConnected && calendarScopeGranted
                  ? "Kalender kamu sudah sinkron. Jadwal hari ini bersih."
                  : "Hubungkan Google Calendar untuk melihat agenda harian kamu."}
              </p>
              <Link
                href="/integrations/calendar"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 transition-opacity"
              >
                <Plus className="w-3.5 h-3.5" />
                {googleConnected ? "Buka Kalender" : "Sinkron Kalender"}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Footer Link & Connection Status */}
      <div className="pt-3.5 mt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
        <div className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              googleConnected && calendarScopeGranted
                ? "bg-emerald-500"
                : "bg-amber-400 animate-pulse"
            }`}
          />
          <span className="text-[11.5px] font-medium text-neutral-500 dark:text-neutral-400">
            {googleConnected && calendarScopeGranted ? "Google Connected" : "Local Sync"}
          </span>
        </div>

        <Link
          href="/integrations/calendar"
          className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 hover:text-[#D4A800] dark:hover:text-[#FCD62C] transition-colors flex items-center gap-1 group cursor-pointer"
        >
          Open Calendar
          <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-[#D4A800] dark:group-hover:text-[#FCD62C] transition-colors" />
        </Link>
      </div>
    </div>
  );
}
