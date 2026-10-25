"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  eachDayOfInterval,
  isToday,
  addMonths,
  subMonths,
  addDays,
  subDays,
  parseISO,
} from "date-fns";
import {
  X,
  Calendar as CalendarDaysIcon,
  Clock,
  Video,
  ExternalLink,
  Users,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  AlignLeft,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

// --- Types ---
export type TaskColorId = "amber" | "emerald" | "blue" | "purple" | "rose";

export interface Task {
  id: string;
  title: string;
  color: TaskColorId;
  date: string; // ISO date string yyyy-MM-dd
  time?: string; // HH:mm
  endTime?: string;
  participants?: string;
  type?: "online" | "offline" | "hybrid";
  notes?: string;
  meetLink?: string;
}

type ViewMode = "month" | "week" | "day";

export const TASK_COLORS: Array<{
  id: TaskColorId;
  label: string;
  bg: string;
  text: string;
  border: string;
  dot: string;
}> = [
  {
    id: "amber",
    label: "Strategy & Core",
    bg: "bg-amber-100/90 dark:bg-amber-950/40",
    text: "text-amber-950 dark:text-amber-200",
    border: "border-amber-300 dark:border-amber-700/60",
    dot: "bg-amber-400 dark:bg-amber-400",
  },
  {
    id: "emerald",
    label: "Reviews & Deliverables",
    bg: "bg-emerald-100/90 dark:bg-emerald-950/40",
    text: "text-emerald-950 dark:text-emerald-200",
    border: "border-emerald-300 dark:border-emerald-700/60",
    dot: "bg-emerald-500",
  },
  {
    id: "blue",
    label: "Automations & AI",
    bg: "bg-blue-100/90 dark:bg-blue-950/40",
    text: "text-blue-950 dark:text-blue-200",
    border: "border-blue-300 dark:border-blue-700/60",
    dot: "bg-blue-500",
  },
  {
    id: "purple",
    label: "Executive Meetings",
    bg: "bg-purple-100/90 dark:bg-purple-950/40",
    text: "text-purple-950 dark:text-purple-200",
    border: "border-purple-300 dark:border-purple-700/60",
    dot: "bg-purple-500",
  },
  {
    id: "rose",
    label: "Critical Deadlines",
    bg: "bg-rose-100/90 dark:bg-rose-950/40",
    text: "text-rose-950 dark:text-rose-200",
    border: "border-rose-300 dark:border-rose-700/60",
    dot: "bg-rose-500",
  },
];

// --- TaskCard Component (Pure Visual / Read-Only, Flat / No-Shadow) ---
const TaskCard = ({
  task,
  onClick,
}: {
  task: Task;
  onClick?: (task: Task) => void;
}) => {
  const theme = TASK_COLORS.find((c) => c.id === task.color) || TASK_COLORS[0];

  return (
    <div
      onClick={(e) => {
        if (onClick) {
          e.stopPropagation();
          onClick(task);
        }
      }}
      className={`p-1.5 mb-1 rounded-md text-[12px] sm:text-[12.5px] font-semibold tracking-tight flex items-center gap-1.5 transition-colors group relative border ${theme.bg} ${theme.text} ${theme.border} hover:opacity-90 cursor-pointer truncate`}
    >
      <div className={`w-1.5 h-3.5 rounded-full ${theme.dot} shrink-0 opacity-90`} />
      <span className="truncate flex-1 font-sans font-medium">{task.title}</span>

      {task.time && (
        <span className="text-[10.5px] font-semibold opacity-75 shrink-0">
          {task.time}
        </span>
      )}
    </div>
  );
};

let hasCalendarMountedOnce = false;
let memoryCalendarTasksCache: Task[] | null = null;

export default function GoogleCalendarPage() {
  const { data: session } = authClient.useSession();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [view, setView] = useState<ViewMode>("week");
  const [tasks, setTasks] = useState<Task[]>(() => memoryCalendarTasksCache || []);
  const [mounted, setMounted] = useState(() => hasCalendarMountedOnce);
  const [isSyncing, setIsSyncing] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [calendarScopeGranted, setCalendarScopeGranted] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");

  // Selected Event Details Modal (Read-Only)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Load Real Tasks from Google Calendar API in Background
  const loadTasks = async (force = false) => {
    try {
      const res = await fetch(`/api/calendar/events${force ? "?refresh=true" : ""}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.events)) {
        setGoogleConnected(Boolean(data.googleConnected));
        setCalendarScopeGranted(Boolean(data.calendarScopeGranted));
        if (data.userEmail) setUserEmail(data.userEmail);

        const mapped: Task[] = data.events.map((e: any) => {
          const startDate = e.startTime ? parseISO(e.startTime) : new Date();
          let catColor: TaskColorId = "amber";
          if (e.category === "meeting") catColor = "purple";
          else if (e.category === "review") catColor = "emerald";
          else if (e.category === "task") catColor = "blue";

          return {
            id: e.id,
            title: e.title,
            color: catColor,
            date: format(startDate, "yyyy-MM-dd"),
            time: format(startDate, "HH:mm"),
            participants: e.location || "",
            type: e.meetLink ? "online" : "offline",
            notes: e.description || "",
            meetLink: e.meetLink || "",
          };
        });
        memoryCalendarTasksCache = mapped;
        setTasks(mapped);
        try {
          localStorage.setItem("launcher_calendar_tasks_cache", JSON.stringify(mapped));
        } catch {}
      }
    } catch (err) {
      console.error("Failed to load real calendar events:", err);
    }
  };

  useEffect(() => {
    hasCalendarMountedOnce = true;
    setMounted(true);
    if (!memoryCalendarTasksCache && typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("launcher_calendar_tasks_cache");
        if (cached) {
          const parsed = JSON.parse(cached);
          memoryCalendarTasksCache = parsed;
          setTasks(parsed);
        }
      } catch (_) {}
    }
    loadTasks();
  }, [session]);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [copiedEnv, setCopiedEnv] = useState(false);

  const handleConnectGoogle = async () => {
    try {
      const res = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/integrations/calendar",
      });
      if (res?.error) {
        setAuthError(res.error.message || "Google OAuth credentials not configured yet.");
        setIsAuthModalOpen(true);
      }
    } catch (err: any) {
      setAuthError(
        err?.message ||
          "GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are not configured in .env.local yet."
      );
      setIsAuthModalOpen(true);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    await loadTasks(true);
    setTimeout(() => setIsSyncing(false), 400);
  };

  // ─── HELPER: Google Calendar Hour Formatter ───
  const formatHourLabel = (h: number) => {
    if (h === 0) return "12 AM";
    if (h === 12) return "12 PM";
    return h > 12 ? `${h - 12} PM` : `${h} AM`;
  };

  // ─── MONTH VIEW (100% Shadow-Free Flat Aesthetic) ───
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday start
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

    return (
      <div className="flex flex-col flex-1 bg-white dark:bg-[#121212] border border-neutral-200/80 dark:border-neutral-800 rounded-xl overflow-x-auto overflow-y-hidden">
        <div className="min-w-[560px] md:min-w-0 flex flex-col flex-1">
          {/* Days Header */}
          <div className="grid grid-cols-7 border-b border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/60">
          {weekDays.map((d, idx) => (
            <div
              key={d}
              className={`py-2.5 text-center text-[11px] font-bold tracking-wider ${
                idx === 0 || idx === 6
                  ? "text-neutral-400 dark:text-neutral-500"
                  : "text-neutral-500 dark:text-neutral-400"
              }`}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 grid-rows-5 flex-1 divide-x divide-y divide-neutral-200/60 dark:divide-neutral-800/60 min-h-[580px]">
          {days.map((day) => {
            const dateKey = format(day, "yyyy-MM-dd");
            const dayTasks = tasks.filter((t) => t.date === dateKey);
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isCurrentToday = isToday(day);

            return (
              <div
                key={dateKey}
                className={`p-1.5 transition-colors relative flex flex-col ${
                  isCurrentToday
                    ? "bg-[#FFE500]/5 dark:bg-[#FFE500]/5"
                    : isCurrentMonth
                    ? "bg-white dark:bg-[#121212]"
                    : "bg-neutral-50/40 dark:bg-neutral-900/20 opacity-40"
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span
                    className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold ${
                      isCurrentToday
                        ? "bg-[#FFE500] text-neutral-950"
                        : isCurrentMonth
                        ? "text-neutral-800 dark:text-neutral-200"
                        : "text-neutral-400 dark:text-neutral-600 font-normal"
                    }`}
                  >
                    {format(day, "d")}
                  </span>
                </div>

                <div className="flex flex-col gap-0.5 flex-1 overflow-y-auto max-h-[85px] calendar-scrollbar">
                  {dayTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onClick={setSelectedTask}
                    />
                  ))}
                </div>
              </div>
            );
          })}
          </div>
        </div>
      </div>
    );
  };

  // ─── GOOGLE CALENDAR 1:1 WEEK VIEW (Shadow-Free) ───
  const renderWeekView = () => {
    const startDate = startOfWeek(currentDate, { weekStartsOn: 0 }); // Sunday start
    const endDate = endOfWeek(currentDate, { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentMinutesOfDay = currentHour * 60 + currentMinute;
    const currentTimeTopPx = (currentMinutesOfDay / 60) * 56; // 56px per hour slot

    return (
      <div className="flex flex-col flex-1 bg-white dark:bg-[#121212] border border-neutral-200/80 dark:border-neutral-800 rounded-xl overflow-hidden">
        {/* Unified Scrollable Container: Sticky Header + 24-Hour Grid inside same scroll context for 100% line alignment */}
        <div className="flex-1 overflow-x-auto overflow-y-auto max-h-[640px] relative calendar-scrollbar">
          <div className="min-w-[620px] md:min-w-0">
            {/* Sticky Week Header */}
            <div className="flex border-b border-neutral-200/80 dark:border-neutral-800 bg-white/95 dark:bg-[#121212]/95 backdrop-blur-xs z-30 sticky top-0">
            {/* Timezone Gutter on Left */}
            <div className="w-14 sm:w-16 shrink-0 flex items-end justify-center pb-2 text-[10.5px] font-medium text-neutral-400 border-r border-neutral-200/80 dark:border-neutral-800 select-none bg-white dark:bg-[#121212]">
              GMT+07
            </div>

            {/* 7 Day Column Headers */}
            <div className="grid grid-cols-7 flex-1 divide-x divide-neutral-200/80 dark:divide-neutral-800 bg-white dark:bg-[#121212]">
              {days.map((day) => {
                const isCurrentToday = isToday(day);
                return (
                  <div
                    key={format(day, "yyyy-MM-dd")}
                    className="py-2.5 text-center select-none"
                  >
                    <span
                      className={`block text-[11px] font-bold uppercase tracking-wider mb-0.5 ${
                        isCurrentToday
                          ? "text-neutral-950 dark:text-[#FFE500]"
                          : "text-neutral-500 dark:text-neutral-400"
                      }`}
                    >
                      {format(day, "EEE")}
                    </span>
                    {isCurrentToday ? (
                      <div className="w-9 h-9 sm:w-10 sm:h-10 mx-auto rounded-full bg-[#FFE500] text-neutral-950 flex items-center justify-center text-base sm:text-lg font-semibold">
                        {format(day, "d")}
                      </div>
                    ) : (
                      <span className="text-xl sm:text-2xl font-normal text-neutral-800 dark:text-neutral-200 block py-0.5">
                        {format(day, "d")}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 24-Hour Time Grid Body */}
          <div className="flex relative">
            {/* Left Hour Gutter */}
            <div className="w-14 sm:w-16 shrink-0 flex flex-col border-r border-neutral-200/80 dark:border-neutral-800 select-none bg-white dark:bg-[#121212]">
              {hours.map((h) => (
                <div
                  key={h}
                  className="h-14 relative flex items-start justify-end pr-2 sm:pr-3 text-[10px] sm:text-[11px] font-medium text-neutral-400 -translate-y-2.5"
                >
                  {h !== 0 && formatHourLabel(h)}
                </div>
              ))}
            </div>

            {/* 7 Day Grid Columns */}
            <div className="grid grid-cols-7 flex-1 divide-x divide-neutral-200/60 dark:divide-neutral-800/60 relative">
              {days.map((day) => {
                const dateKey = format(day, "yyyy-MM-dd");
                const dayTasks = tasks.filter((t) => t.date === dateKey);
                const isCurrentToday = isToday(day);

                return (
                  <div
                    key={dateKey}
                    className="relative flex flex-col"
                  >
                    {/* Current Time Indicator Line */}
                    {isCurrentToday && (
                      <div
                        style={{ top: `${currentTimeTopPx}px` }}
                        className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
                      >
                        <div className="w-2.5 h-2.5 rounded-full bg-[#FFE500] border-2 border-neutral-950 dark:border-black -ml-1.5 shrink-0" />
                        <div className="h-[2px] bg-[#FFE500] dark:bg-[#FFE500] w-full" />
                      </div>
                    )}

                    {/* 24 Hour Slots */}
                    {hours.map((h) => (
                      <div
                        key={h}
                        className="h-14 border-b border-neutral-200/60 dark:border-neutral-800/60"
                      />
                    ))}

                    {/* Event Cards */}
                    {dayTasks.map((task) => {
                      const [sh, sm] = (task.time || "09:00").split(":").map(Number);
                      const topPx = ((sh * 60 + (sm || 0)) / 60) * 56;

                      return (
                        <div
                          key={task.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTask(task);
                          }}
                          style={{
                            top: `${topPx}px`,
                            height: "54px",
                          }}
                          className={`absolute left-1 right-1 z-10 rounded-md p-1.5 sm:p-2 cursor-pointer text-white transition-opacity hover:opacity-90 flex flex-col justify-between overflow-hidden shadow-2xs ${
                            task.color === "purple"
                              ? "bg-[#7986CB] dark:bg-[#5C6BC0]"
                              : task.color === "emerald"
                              ? "bg-[#33B679] dark:bg-[#2E7D32]"
                              : task.color === "amber"
                              ? "bg-[#F6BF26] dark:bg-[#F57F17] text-neutral-900"
                              : task.color === "rose"
                              ? "bg-[#E67C73] dark:bg-[#C62828]"
                              : "bg-[#1A73E8] dark:bg-[#1565C0]"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-[12px] sm:text-[12.5px] leading-tight truncate">
                              {task.title}
                            </span>
                            {task.meetLink && <Video className="w-3.5 h-3.5 shrink-0 opacity-95" />}
                          </div>
                          <span className="text-[10.5px] sm:text-[11px] font-medium opacity-95 truncate">
                            {task.time} {task.participants ? `• ${task.participants}` : ""}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ─── GOOGLE CALENDAR 1:1 DAY VIEW (Shadow-Free) ───
  const renderDayView = () => {
    const dateKey = format(currentDate, "yyyy-MM-dd");
    const dayTasks = tasks.filter((t) => t.date === dateKey);
    const isCurrentToday = isToday(currentDate);
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentMinutesOfDay = currentHour * 60 + currentMinute;
    const currentTimeTopPx = (currentMinutesOfDay / 60) * 56;

    return (
      <div className="flex flex-col flex-1 bg-white dark:bg-[#121212] border border-neutral-200/80 dark:border-neutral-800 rounded-xl overflow-hidden">
        {/* Unified Scrollable Container */}
        <div className="flex-1 overflow-y-auto max-h-[640px] relative calendar-scrollbar">
          {/* Sticky Day Header */}
          <div className="flex border-b border-neutral-200/80 dark:border-neutral-800 bg-white/95 dark:bg-[#121212]/95 backdrop-blur-xs z-30 sticky top-0">
            <div className="w-14 sm:w-16 shrink-0 flex items-end justify-center pb-2 text-[10.5px] font-medium text-neutral-400 border-r border-neutral-200/80 dark:border-neutral-800 select-none bg-white dark:bg-[#121212]">
              GMT+07
            </div>
            <div className="p-3 text-center select-none flex-1 bg-white dark:bg-[#121212]">
              <span
                className={`block text-xs font-bold uppercase tracking-wider mb-0.5 ${
                  isCurrentToday
                    ? "text-neutral-950 dark:text-[#FFE500]"
                    : "text-neutral-500 dark:text-neutral-400"
                }`}
              >
                {format(currentDate, "EEEE")}
              </span>
              {isCurrentToday ? (
                <div className="w-10 h-10 mx-auto rounded-full bg-[#FFE500] text-neutral-950 flex items-center justify-center text-lg sm:text-xl font-semibold">
                  {format(currentDate, "d")}
                </div>
              ) : (
                <span className="text-2xl font-normal text-neutral-800 dark:text-neutral-200 block py-0.5">
                  {format(currentDate, "d")}
                </span>
              )}
            </div>
          </div>

          {/* 24-Hour Day Time Grid Body */}
          <div className="flex relative">
            {/* Left Hour Gutter */}
            <div className="w-14 sm:w-16 shrink-0 flex flex-col border-r border-neutral-200/80 dark:border-neutral-800 select-none bg-white dark:bg-[#121212]">
              {hours.map((h) => (
                <div
                  key={h}
                  className="h-14 relative flex items-start justify-end pr-2 sm:pr-3 text-[10px] sm:text-[11px] font-medium text-neutral-400 -translate-y-2.5"
                >
                  {h !== 0 && formatHourLabel(h)}
                </div>
              ))}
            </div>

            {/* Single Day Grid */}
            <div className="flex-1 relative">
              {/* Current Time Indicator */}
              {isCurrentToday && (
                <div
                  style={{ top: `${currentTimeTopPx}px` }}
                  className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FFE500] border-2 border-neutral-950 dark:border-black -ml-1.5 shrink-0" />
                  <div className="h-[2px] bg-[#FFE500] dark:bg-[#FFE500] w-full" />
                </div>
              )}

              {/* 24 Hour Slots */}
              {hours.map((h) => (
                <div
                  key={h}
                  className="h-14 border-b border-neutral-200/60 dark:border-neutral-800/60"
                />
              ))}

              {/* Event Cards */}
              {dayTasks.map((task) => {
                const [sh, sm] = (task.time || "09:00").split(":").map(Number);
                const topPx = ((sh * 60 + (sm || 0)) / 60) * 56;

                return (
                  <div
                    key={task.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTask(task);
                    }}
                    style={{
                      top: `${topPx}px`,
                      height: "56px",
                    }}
                    className={`absolute left-2 right-4 z-10 rounded-md p-2 cursor-pointer text-white transition-opacity hover:opacity-90 flex flex-col justify-between overflow-hidden shadow-2xs ${
                      task.color === "purple"
                        ? "bg-[#7986CB] dark:bg-[#5C6BC0]"
                        : task.color === "emerald"
                        ? "bg-[#33B679] dark:bg-[#2E7D32]"
                        : task.color === "amber"
                        ? "bg-[#F6BF26] dark:bg-[#F57F17] text-neutral-900"
                        : task.color === "rose"
                        ? "bg-[#E67C73] dark:bg-[#C62828]"
                        : "bg-[#1A73E8] dark:bg-[#1565C0]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-[13px] sm:text-[13.5px] leading-tight truncate">
                        {task.title}
                      </span>
                      {task.meetLink && <Video className="w-4 h-4 shrink-0 opacity-95" />}
                    </div>
                    <span className="text-[11px] sm:text-[11.5px] font-medium opacity-95 truncate">
                      {task.time} {task.participants ? `• ${task.participants}` : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getHeaderDateTitle = () => {
    if (view === "month") {
      return format(currentDate, "MMMM yyyy");
    }
    if (view === "week") {
      const start = startOfWeek(currentDate, { weekStartsOn: 0 });
      const end = endOfWeek(currentDate, { weekStartsOn: 0 });
      if (start.getMonth() === end.getMonth()) {
        return format(start, "MMMM yyyy");
      }
      return `${format(start, "MMM")} – ${format(end, "MMM yyyy")}`;
    }
    return format(currentDate, "MMMM d, yyyy");
  };

  return (
    <AppShell>
      {!mounted ? (
        <div className="h-[70vh] flex items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <RefreshCw className="w-4 h-4 animate-spin text-neutral-400" />
            <span>Loading calendar...</span>
          </div>
        </div>
      ) : (
        <div className="space-y-4 pb-12 sm:pb-4">
        {/* Top Control Bar (Google Calendar Authentic: [Today] [<] [>] [Title] - No Card Wrapper) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-1 py-1">
          {/* Left: [Today] [ < ] [ > ] [ Date Title ] [ Sync Status / Authorize ] */}
          <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Today Pill Button */}
              <button
                onClick={() => setCurrentDate(new Date())}
                className="h-8.5 sm:h-9.5 px-3.5 sm:px-5 rounded-full border border-neutral-300 dark:border-neutral-700 text-xs sm:text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 transition-colors cursor-pointer"
              >
                Today
              </button>

              {/* Prev & Next Chevrons */}
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => {
                    if (view === "month") setCurrentDate(subMonths(currentDate, 1));
                    else if (view === "week") setCurrentDate(subDays(currentDate, 7));
                    else setCurrentDate(subDays(currentDate, 1));
                  }}
                  className="h-8.5 w-8.5 sm:h-9 sm:w-9 rounded-full flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors cursor-pointer"
                  title="Previous"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={() => {
                    if (view === "month") setCurrentDate(addMonths(currentDate, 1));
                    else if (view === "week") setCurrentDate(addDays(currentDate, 7));
                    else setCurrentDate(addDays(currentDate, 1));
                  }}
                  className="h-8.5 w-8.5 sm:h-9 sm:w-9 rounded-full flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors cursor-pointer"
                  title="Next"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>

            {/* Date Title (Slightly larger Google Calendar style) */}
            <h1 className="text-lg sm:text-xl md:text-2xl font-medium text-neutral-800 dark:text-neutral-100 tracking-tight ml-0.5 sm:ml-2">
              {getHeaderDateTitle()}
            </h1>

            {/* Live Synced / Authorize Badge */}
            {calendarScopeGranted ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 ml-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Synced
              </span>
            ) : (
              <button
                onClick={handleConnectGoogle}
                className="inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-normal text-neutral-800 dark:text-amber-200 bg-[#FFE500]/20 hover:bg-[#FFE500]/35 border border-[#FFE500]/40 transition-colors cursor-pointer ml-1"
                title="Grant Google Calendar access"
              >
                Authorize Google Calendar
              </button>
            )}
          </div>

          {/* Right: View Switcher & Sync Button */}
          <div className="flex items-center justify-between sm:justify-end gap-2">
            {/* View Switcher Tabs */}
            <div className="flex bg-neutral-100 dark:bg-neutral-900 p-0.5 rounded-lg border border-neutral-200/80 dark:border-neutral-800">
              {(["month", "week", "day"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all cursor-pointer ${
                    view === v
                      ? "bg-white dark:bg-[#1a1a1a] text-neutral-900 dark:text-white shadow-xs font-bold"
                      : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>

            {/* Sync Button */}
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="h-8.5 sm:h-9 px-3 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              <span>Sync</span>
            </button>
          </div>
        </div>

        {/* Main Calendar Card Wrapper (Shadow-Free, Instant & Lightweight) */}
        <div className="bg-white dark:bg-[#111111] rounded-xl border border-neutral-200/80 dark:border-neutral-800 overflow-hidden flex flex-col min-h-[500px] md:min-h-[660px] relative">
          {view === "month" && renderMonthView()}
          {view === "week" && renderWeekView()}
          {view === "day" && renderDayView()}
        </div>
      </div>
      )}

      {/* ─── READ-ONLY EVENT DETAILS MODAL (GOOGLE CALENDAR STYLE) ─── */}
      {selectedTask && (
        <div 
          onClick={() => setSelectedTask(null)}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-[3px] animate-in fade-in duration-150"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[500px] max-h-[85vh] flex flex-col bg-white dark:bg-[#202124] border border-neutral-200/90 dark:border-neutral-700/80 rounded-[24px] p-5 sm:p-6 relative animate-in zoom-in-95 duration-150 text-neutral-900 dark:text-neutral-100 shadow-2xl overflow-hidden"
          >
            {/* Header with Close Action */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                  Event Details
                </span>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Event Content Body */}
            <div className="space-y-4 pt-3 flex-1 overflow-y-auto pr-1">
              {/* Event Title with Color Chip */}
              <div className="flex items-start gap-3">
                <div
                  className={`w-3.5 h-3.5 rounded-full mt-1.5 shrink-0 ${
                    selectedTask.color === "amber"
                      ? "bg-amber-500"
                      : selectedTask.color === "emerald"
                      ? "bg-emerald-500"
                      : selectedTask.color === "blue"
                      ? "bg-blue-500"
                      : selectedTask.color === "purple"
                      ? "bg-purple-500"
                      : "bg-rose-500"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg sm:text-xl font-semibold text-neutral-950 dark:text-white leading-tight break-words [overflow-wrap:anywhere]">
                    {selectedTask.title}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 font-medium">
                    {format(parseISO(selectedTask.date), "EEEE, MMMM d, yyyy")} • {selectedTask.time || "All day"}
                  </p>
                </div>
              </div>

              {/* Meeting Action Button (Zoom / Google Meet / Teams) */}
              {(() => {
                const meetingUrl =
                  selectedTask.meetLink ||
                  (selectedTask.participants?.startsWith("http")
                    ? selectedTask.participants
                    : "");
                if (!meetingUrl) return null;

                const isZoom = meetingUrl.includes("zoom.us");
                const isMeet = meetingUrl.includes("meet.google.com");
                const isTeams = meetingUrl.includes("teams.microsoft.com");

                const btnLabel = isZoom
                  ? "Join Zoom Meeting"
                  : isMeet
                  ? "Join Google Meet"
                  : isTeams
                  ? "Join Teams Meeting"
                  : "Join Video Meeting";

                const btnBg = isZoom
                  ? "bg-[#0B5CFF] hover:bg-[#004BD9]"
                  : isTeams
                  ? "bg-[#5B5FC7] hover:bg-[#4F52B2]"
                  : "bg-[#1A73E8] hover:bg-[#1557B0]";

                return (
                  <div className="pl-6.5">
                    <a
                      href={meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-2 px-4 py-2 ${btnBg} text-white rounded-full font-semibold text-xs transition-colors cursor-pointer shadow-xs`}
                    >
                      <Video className="w-4 h-4" />
                      {btnLabel}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                );
              })()}

              {/* Location */}
              {selectedTask.participants && !selectedTask.participants.startsWith("http") && (
                <div className="flex items-start gap-3 pl-0.5 min-w-0">
                  <Users className="w-4.5 h-4.5 text-neutral-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-neutral-700 dark:text-neutral-300 min-w-0 flex-1 break-words">
                    {selectedTask.participants}
                  </p>
                </div>
              )}

              {/* Notes & Description (Direct Clickable Links & Clean Formatting) */}
              {selectedTask.notes && (
                <div className="flex items-start gap-3 pl-0.5 min-w-0">
                  <AlignLeft className="w-4.5 h-4.5 text-neutral-500 shrink-0 mt-0.5" />
                  <div className="text-xs text-neutral-700 dark:text-neutral-300 min-w-0 flex-1 leading-relaxed break-words [overflow-wrap:anywhere]">
                    {(() => {
                      let cleaned = selectedTask.notes
                        .replace(/&lt;/g, "<")
                        .replace(/&gt;/g, ">")
                        .replace(/&amp;/g, "&")
                        .replace(/&quot;/g, '"')
                        .replace(/&#39;/g, "'");

                      // Auto-link any standalone URLs
                      const urlRegex = /(?<!href=["'])(https?:\/\/[^\s<>"']+)/gi;
                      cleaned = cleaned.replace(urlRegex, (url) => {
                        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:underline font-medium break-all inline-flex items-center gap-0.5">${url}</a>`;
                      });

                      return (
                        <div
                          className="prose prose-xs dark:prose-invert max-w-none break-words [overflow-wrap:anywhere] [&_a]:text-blue-600 dark:[&_a]:text-blue-400 [&_a]:underline [&_a]:font-medium [&_a]:break-all leading-relaxed text-neutral-700 dark:text-neutral-300"
                          dangerouslySetInnerHTML={{ __html: cleaned }}
                        />
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* Account row */}
              <div className="flex items-center gap-3 pl-0.5 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <CalendarDaysIcon className="w-4.5 h-4.5 text-neutral-500 shrink-0" />
                <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                  {session?.user?.name || userEmail || "Google Calendar Sync"}
                </p>
              </div>
            </div>

            {/* Footer Button */}
            <div className="flex items-center justify-end pt-3 mt-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                onClick={() => setSelectedTask(null)}
                className="px-5 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white rounded-full font-semibold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── GOOGLE CALENDAR AUTHORIZATION MODAL (Minimalist & Sleek) ─── */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 dark:bg-black/45 backdrop-blur-[3px] animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#181818] border border-neutral-200/90 dark:border-neutral-800 rounded-3xl w-full max-w-[420px] p-6 sm:p-7 relative text-neutral-900 dark:text-neutral-100 space-y-5 animate-in zoom-in-95 duration-150">
            {/* Header: Icon badge & Close */}
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 flex items-center justify-center border border-neutral-200/60 dark:border-neutral-700/60">
                <CalendarDaysIcon className="w-5 h-5 text-neutral-900 dark:text-white" />
              </div>
              <button
                onClick={() => setIsAuthModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-1.5">
              <h3 className="text-xl font-semibold font-sf text-neutral-950 dark:text-white tracking-tight">
                Connect Google Calendar
              </h3>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-normal leading-relaxed">
                Authorize your Google account to synchronize and view upcoming meetings, events, and Google Meet links seamlessly in Launcher OS.
              </p>
            </div>

            {/* Compact Env Keys Helper */}
            <div className="bg-neutral-50/80 dark:bg-neutral-900/50 border border-neutral-200/80 dark:border-neutral-800/80 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  Environment Keys
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText('GOOGLE_CLIENT_ID=""\nGOOGLE_CLIENT_SECRET=""');
                    setCopiedEnv(true);
                    setTimeout(() => setCopiedEnv(false), 2000);
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  {copiedEnv ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Snippet</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-neutral-400 dark:text-neutral-500 font-normal">
                Requires <span className="font-mono text-neutral-600 dark:text-neutral-300">GOOGLE_CLIENT_ID</span> and <span className="font-mono text-neutral-600 dark:text-neutral-300">GOOGLE_CLIENT_SECRET</span> in <span className="font-mono text-neutral-600 dark:text-neutral-300">.env.local</span>.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
              <button
                onClick={() => setIsAuthModalOpen(false)}
                className="px-4 py-2.5 rounded-full text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsAuthModalOpen(false);
                  handleConnectGoogle();
                }}
                className="px-5 py-2.5 rounded-full text-xs font-semibold bg-[#FFE500] hover:bg-[#FCD62C] text-neutral-950 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                Authorize Access
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
