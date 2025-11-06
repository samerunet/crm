"use client";

import { useCallback, useEffect, useMemo } from "react";
import {
  ContractStatusEnum,
  TaskStatusEnum,
  listContracts,
  listLeads,
  listTasks,
} from "@/lib/api";
import { usePollingQuery } from "@/lib/hooks/use-polling-query";
import { DASHBOARD_DATA_EVENT } from "@/lib/dashboard/events";

const shimmerClasses = "animate-pulse bg-[rgba(18,13,10,0.12)]";

const CARD_LABELS = [
  { id: "newLeads", label: "New leads" },
  { id: "pendingTasks", label: "Pending tasks" },
  { id: "overdueTasks", label: "Overdue" },
  { id: "unsignedContracts", label: "Unsigned contracts" },
] as const;

type StatsPayload = Record<(typeof CARD_LABELS)[number]["id"], number>;

export default function StatsCards() {
  const fetcher = useCallback(async (): Promise<StatsPayload> => {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [recentLeads, pendingTasks, overdueTasks, unsignedContracts] = await Promise.all([
      listLeads({ createdAfter: since }),
      listTasks({ status: TaskStatusEnum.OPEN, due: "today-or-future" }),
      listTasks({ status: TaskStatusEnum.OPEN, overdue: true }),
      listContracts({ status: [ContractStatusEnum.DRAFT, ContractStatusEnum.SENT] }),
    ]);

    return {
      newLeads: recentLeads.length,
      pendingTasks: pendingTasks.length,
      overdueTasks: overdueTasks.length,
      unsignedContracts: unsignedContracts.length,
    } satisfies StatsPayload;
  }, []);

  const { data, isLoading, error, refresh } = usePollingQuery(fetcher, [], { refreshInterval: 0 });

  useEffect(() => {
    const handler = () => {
      void refresh();
    };
    window.addEventListener(DASHBOARD_DATA_EVENT, handler);
    return () => window.removeEventListener(DASHBOARD_DATA_EVENT, handler);
  }, [refresh]);

  const values = useMemo<StatsPayload>(() => {
    if (data) return data;
    return {
      newLeads: 0,
      pendingTasks: 0,
      overdueTasks: 0,
      unsignedContracts: 0,
    };
  }, [data]);

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {CARD_LABELS.map(({ id, label }) => {
        const value = values[id];
        const showShimmer = isLoading && !data;
        return (
          <article
            key={id}
            className="glass-strong rounded-[calc(var(--radius)+12px)] border border-[--color-border]/50 p-4 shadow-[0_20px_48px_rgba(18,13,10,0.18)]"
          >
            <div className="text-sm text-[--color-muted-foreground]">{label}</div>
            <div className="mt-2 text-3xl font-semibold text-[--color-foreground]">
              {showShimmer ? <span className={`${shimmerClasses} inline-block h-8 w-16 rounded-md`} /> : value}
            </div>
            {!showShimmer && error && (
              <div className="mt-2 flex items-center justify-between gap-2 rounded-[--radius-md] bg-[rgba(122,48,34,0.18)] px-3 py-2 text-xs text-[--color-foreground]">
                <span>Couldn’t refresh.</span>
                <button
                  type="button"
                  onClick={() => refresh()}
                  className="underline-offset-2 hover:underline"
                >
                  Retry
                </button>
              </div>
            )}
          </article>
        );
      })}
    </section>
  );
}
