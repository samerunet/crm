"use client";

import { useCallback, useEffect, useMemo } from "react";
import { format } from "date-fns";
import {
  Task,
  TaskStatusEnum,
  listTasks,
  updateTask,
} from "@/lib/api";
import { usePollingQuery } from "@/lib/hooks/use-polling-query";
import { DASHBOARD_DATA_EVENT, emitDashboardDataChange } from "@/lib/dashboard/events";

const shimmerClass = "animate-pulse bg-[rgba(18,13,10,0.12)]";

const startOfToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

const endOfToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
};

const parseDate = (value: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const categorizeTasks = (tasks: Task[]) => {
  const todayStart = startOfToday();
  const todayEnd = endOfToday();

  const overdue: Task[] = [];
  const today: Task[] = [];
  const upcoming: Task[] = [];

  tasks.forEach((task) => {
    if (task.status !== TaskStatusEnum.OPEN) return;
    const due = parseDate(task.dueDate ?? null);
    if (!due) {
      upcoming.push(task);
      return;
    }

    if (due < todayStart) {
      overdue.push(task);
    } else if (due >= todayStart && due <= todayEnd) {
      today.push(task);
    } else {
      upcoming.push(task);
    }
  });

  return { overdue, today, upcoming };
};

async function handleComplete(task: Task) {
  await updateTask(task.id, {
    status: TaskStatusEnum.COMPLETED,
    completedAt: new Date().toISOString(),
  });
  emitDashboardDataChange();
}

export default function TasksList() {
  const fetchTasks = useCallback(() => listTasks({ status: TaskStatusEnum.OPEN }), []);

  const { data, isLoading, error, refresh } = usePollingQuery(fetchTasks, [], {
    refreshInterval: 0,
  });

  useEffect(() => {
    const handler = () => {
      void refresh();
    };
    window.addEventListener(DASHBOARD_DATA_EVENT, handler);
    return () => window.removeEventListener(DASHBOARD_DATA_EVENT, handler);
  }, [refresh]);

  const { overdue, today, upcoming } = useMemo(() => categorizeTasks(data ?? []), [data]);

  const renderSection = (title: string, tasks: Task[], emptyText: string) => (
    <section className="glass rounded-[--radius-xl] border border-[--color-border]/60">
      <header className="border-b border-[--color-border]/40 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-[--color-muted-foreground]">
        {title}
      </header>
      <ul className="divide-y divide-[--color-border]/20">
        {isLoading && !data ? (
          <li className="p-4">
            <div className={`${shimmerClass} h-4 w-1/2 rounded`} />
            <div className="mt-2 flex gap-2">
              <span className={`${shimmerClass} h-3 w-16 rounded`} />
              <span className={`${shimmerClass} h-3 w-20 rounded`} />
            </div>
          </li>
        ) : tasks.length === 0 ? (
          <li className="p-4 text-sm text-[--color-muted-foreground]">{emptyText}</li>
        ) : (
          tasks.map((task) => {
            const due = parseDate(task.dueDate ?? null);
            const dueLabel = due ? format(due, "MMM d, yyyy") : "No due date";
            return (
              <li key={task.id} className="flex items-start gap-3 px-4 py-3">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await handleComplete(task);
                      void refresh();
                    } catch (err) {
                      console.error("Failed to complete task", err);
                    }
                  }}
                  aria-label="Mark task complete"
                  className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full border border-[--color-border]/60 text-[--color-muted-foreground] transition hover:bg-[--color-primary]/20 hover:text-[--color-primary]"
                >
                  ✓
                </button>
                <div className="flex-1">
                  <div className="text-sm font-medium text-[--color-foreground]">{task.title}</div>
                  <div className="text-xs text-[--color-muted-foreground]">
                    {task.lead?.name ? `Lead: ${task.lead.name}` : "Unassigned"}
                  </div>
                </div>
                <div className="text-right text-xs text-[--color-muted-foreground]">
                  {dueLabel}
                </div>
              </li>
            );
          })
        )}
      </ul>
    </section>
  );

  return (
    <div className="space-y-4">
      {renderSection("Due Today", today, "No tasks due today.")}
      {renderSection("Upcoming", upcoming, "No upcoming tasks.")}
      {renderSection("Overdue", overdue, "No overdue tasks. Great job!")}
      {!isLoading && error ? (
        <div className="rounded-[--radius-lg] border border-amber-400/70 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
          {error.message}
        </div>
      ) : null}
    </div>
  );
}
