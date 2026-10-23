"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, Plus, Trash2, ListTodo, Sparkles, Loader2, CloudCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";

interface TodoItem {
  id: string;
  task: string;
  isCompleted: boolean;
  createdAt: number;
}

export function OverviewToDoList() {
  const { data: session } = authClient.useSession();
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTask, setNewTask] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load from local storage cache immediately for instant render (0ms delay)
  useEffect(() => {
    try {
      const cached = localStorage.getItem("launcher_os_todos");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTodos(parsed);
          setIsLoading(false);
        }
      }
    } catch {}
  }, []);

  // Fetch todos from database
  const fetchTodos = useCallback(async () => {
    try {
      const res = await fetch("/api/todos");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.todos)) {
          const formatted: TodoItem[] = data.todos.map((item: any) => ({
            id: item.id,
            task: item.task,
            isCompleted: Boolean(item.isCompleted),
            createdAt: new Date(item.createdAt).getTime(),
          }));
          setTodos(formatted);
          if (typeof window !== "undefined") {
            localStorage.setItem("launcher_os_todos", JSON.stringify(formatted));
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch todos:", err);
      // Fallback to local cache if offline
      if (typeof window !== "undefined") {
        try {
          const cached = localStorage.getItem("launcher_os_todos");
          if (cached) setTodos(JSON.parse(cached));
        } catch {}
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos, session?.user?.id]);

  const handleAddTodo = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newTask.trim()) return;

    const tempId = `todo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const taskText = newTask.trim();
    const newTodoItem: TodoItem = {
      id: tempId,
      task: taskText,
      isCompleted: false,
      createdAt: Date.now(),
    };

    // Optimistic UI update
    setTodos((prev) => [newTodoItem, ...prev]);
    setNewTask("");
    setIsSyncing(true);

    try {
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: tempId,
          task: taskText,
          isCompleted: false,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.todo?.id && data.todo.id !== tempId) {
          setTodos((prev) =>
            prev.map((t) => (t.id === tempId ? { ...t, id: data.todo.id } : t))
          );
        }
      }
    } catch (err) {
      console.error("Failed to save todo to database:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleToggle = async (id: string) => {
    const current = todos.find((t) => t.id === id);
    if (!current) return;
    const nextState = !current.isCompleted;

    // Optimistic UI update
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isCompleted: nextState } : t))
    );

    try {
      await fetch("/api/todos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          isCompleted: nextState,
        }),
      });
    } catch (err) {
      console.error("Failed to toggle todo in database:", err);
    }
  };

  const handleDelete = async (id: string) => {
    // Optimistic UI update
    setTodos((prev) => prev.filter((t) => t.id !== id));

    try {
      await fetch(`/api/todos?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Failed to delete todo in database:", err);
    }
  };

  const handleClearCompleted = async () => {
    // Optimistic UI update
    setTodos((prev) => prev.filter((t) => !t.isCompleted));

    try {
      await fetch("/api/todos?clearCompleted=true", {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Failed to clear completed todos in database:", err);
    }
  };

  const completedCount = todos.filter((t) => t.isCompleted).length;

  return (
    <Card className="p-5 sm:p-6 bg-white dark:bg-[#121212] border border-neutral-200/80 dark:border-neutral-800 rounded-xl shadow-xs flex flex-col justify-between min-h-[420px] h-full transition-all">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <ListTodo className="w-5 h-5 text-neutral-950 dark:text-white shrink-0 stroke-[2]" />
            <h3 className="text-base sm:text-lg font-semibold text-neutral-950 dark:text-white tracking-tight">
              Tasks & Focus
            </h3>
          </div>

          {isSyncing ? (
            <div className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Saving...</span>
            </div>
          ) : (
            <span className="text-[11px] text-neutral-400 dark:text-neutral-500 font-normal">
              Cloud DB
            </span>
          )}
        </div>

        {/* Input Form with Larger Font & Polished Button */}
        <form onSubmit={handleAddTodo} className="relative mb-3.5">
          <Input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new task..."
            className="h-10 pl-3.5 pr-11 text-[13.5px] sm:text-sm bg-neutral-50/90 dark:bg-neutral-900 border-neutral-200/90 dark:border-neutral-800 rounded-md text-neutral-950 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus-visible:ring-1.5 focus-visible:ring-[#FCD62C]"
          />
          <Button
            type="submit"
            disabled={!newTask.trim()}
            size="icon"
            className="absolute right-1.5 top-1.5 h-7 w-7 rounded-md bg-[#FCD62C] hover:bg-[#ebd524] text-neutral-950 shadow-2xs disabled:opacity-40 cursor-pointer transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </Button>
        </form>

        {/* List of Tasks */}
        <div className="space-y-2 min-h-[220px] max-h-[280px] overflow-y-auto scrollbar-hide pr-0.5">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-2">
              <Loader2 className="w-5 h-5 animate-spin text-neutral-400" />
              <p className="text-xs text-neutral-400">Loading tasks from database...</p>
            </div>
          ) : (
            <AnimatePresence initial={false} mode="popLayout">
              {todos.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-16 flex flex-col items-center justify-center text-center space-y-1.5"
                >
                  <p className="text-xs sm:text-[13.5px] font-semibold text-neutral-700 dark:text-neutral-300">
                    No tasks yet!
                  </p>
                  <p className="text-[11.5px] text-neutral-400 dark:text-neutral-500">
                    Add priorities for your session above.
                  </p>
                </motion.div>
              ) : (
                todos.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className={cn(
                      "group flex items-center gap-3 p-2.5 rounded-lg border border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/70 dark:bg-neutral-900/40 hover:bg-neutral-100/60 dark:hover:bg-neutral-800/60 transition-all",
                      item.isCompleted && "opacity-50 bg-neutral-100/40 dark:bg-neutral-900/20"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => handleToggle(item.id)}
                      className={cn(
                        "shrink-0 transition-transform active:scale-90 cursor-pointer mt-0.5",
                        item.isCompleted ? "text-[#FCD62C]" : "text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                      )}
                    >
                      {item.isCompleted ? (
                        <CheckCircle2 className="w-4.5 h-4.5 text-[#FCD62C] fill-[#FCD62C]/20 stroke-[2.2]" />
                      ) : (
                        <Circle className="w-4.5 h-4.5 stroke-[1.8]" />
                      )}
                    </button>

                    <span
                      className={cn(
                        "flex-1 text-[13.5px] sm:text-[14px] font-normal leading-snug transition-all select-none truncate",
                        item.isCompleted
                          ? "text-neutral-400 dark:text-neutral-500 line-through"
                          : "text-neutral-800 dark:text-neutral-200"
                      )}
                    >
                      {item.task}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-red-600 dark:hover:text-red-400 rounded-md transition-opacity cursor-pointer shrink-0"
                      title="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 mt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs sm:text-[12.5px] text-neutral-500 dark:text-neutral-400">
        <span className="font-medium text-neutral-400 dark:text-neutral-500">
          {todos.filter((t) => !t.isCompleted).length} pending tasks
        </span>
        {completedCount > 0 && (
          <button
            type="button"
            onClick={handleClearCompleted}
            className="text-neutral-900 dark:text-neutral-100 hover:text-[#D4A800] dark:hover:text-[#FCD62C] font-semibold cursor-pointer text-xs transition-colors"
          >
            Clear Completed ({completedCount})
          </button>
        )}
      </div>
    </Card>
  );
}

