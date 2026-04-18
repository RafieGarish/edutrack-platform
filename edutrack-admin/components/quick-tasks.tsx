"use client";

import { useState } from "react";
import { Plus, Circle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "active" | "completed";

export function QuickTasks() {
  const [tab, setTab] = useState<Tab>("active");
  const [taskInput, setTaskInput] = useState("");
  const [tasks, setTasks] = useState<{ id: number; text: string; done: boolean }[]>([]);

  const activeTasks = tasks.filter((t) => !t.done);
  const completedTasks = tasks.filter((t) => t.done);

  const addTask = () => {
    if (!taskInput.trim()) return;
    setTasks((prev) => [...prev, { id: Date.now(), text: taskInput.trim(), done: false }]);
    setTaskInput("");
  };

  const toggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const displayed = tab === "active" ? activeTasks : completedTasks;

  return (
    <div className="rounded-xl bg-card border border-border/50 p-5 flex flex-col gap-4 h-full">
      <div>
        <h3 className="font-semibold text-foreground">Notifikasi Siswa</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Kelola Notifikasi Siswa</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-background/60 rounded-lg border border-border/30">
        {(["active", "completed"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize",
              tab === t
                ? "bg-secondary text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t === "active" ? `Active (${activeTasks.length})` : `Completed (${completedTasks.length})`}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={taskInput}
          onChange={(e) => setTaskInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          placeholder="Add a quick task..."
          className="flex-1 bg-background/60 border border-border/50 rounded-lg px-3 py-2 text-sm outline-none text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 transition-colors"
        />
        <button
          onClick={addTask}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto space-y-2 min-h-[80px]">
        {displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-20 text-muted-foreground/50">
            <p className="text-xs">No {tab} tasks</p>
          </div>
        ) : (
          displayed.map((task) => (
            <button
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className="flex items-center gap-2.5 w-full text-left px-3 py-2.5 rounded-lg bg-background/40 border border-border/30 hover:border-border/60 transition-all group"
            >
              {task.done ? (
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-muted-foreground group-hover:text-foreground shrink-0 transition-colors" />
              )}
              <span
                className={cn(
                  "text-xs font-medium",
                  task.done ? "line-through text-muted-foreground" : "text-foreground"
                )}
              >
                {task.text}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
