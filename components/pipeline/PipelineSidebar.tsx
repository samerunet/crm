"use client";

import { useEffect, useMemo } from "react";
import { PIPELINE_STAGES } from "./stages";
import { useDashboardParams } from "@/lib/hooks/use-dashboard-params";
import { fetchLeadStageCounts, LeadStageCounts } from "@/lib/api";
import { usePollingQuery } from "@/lib/hooks/use-polling-query";
import { DASHBOARD_DATA_EVENT } from "@/lib/dashboard/events";

const shimmer = "animate-pulse bg-[rgba(18,13,10,0.12)]";

export default function PipelineSidebar() {
  const { stage, setStage } = useDashboardParams();

  const { data, isLoading, refresh } = usePollingQuery<LeadStageCounts>(fetchLeadStageCounts, [], {
    refreshInterval: 0,
    initialData: undefined,
  });

  useEffect(() => {
    const handler = () => {
      void refresh();
    };
    window.addEventListener(DASHBOARD_DATA_EVENT, handler);
    return () => window.removeEventListener(DASHBOARD_DATA_EVENT, handler);
  }, [refresh]);

  const counts = useMemo(() => data ?? {}, [data]);

  return (
    <aside className="glass-strong rounded-[calc(var(--radius)+14px)] border border-[--color-border]/50 shadow-[0_20px_48px_rgba(18,13,10,0.18)]">
      <header className="border-b border-[--color-border]/40 px-4 py-3 font-medium text-[--color-foreground]">
        Pipeline
      </header>
      <ul className="p-2">
        {PIPELINE_STAGES.map((item) => {
          const selected = stage === item.id;
          const count = counts[item.id] ?? 0;
          return (
            <li key={item.id}>
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => setStage(selected ? null : item.id)}
                className={`flex w-full items-center justify-between gap-2 rounded-[calc(var(--radius)+6px)] px-3 py-2 text-sm transition ${
                  selected ? "bg-[rgba(18,13,10,0.22)] text-[--color-foreground]" : "hover:bg-[rgba(18,13,10,0.08)]"
                }`}
              >
                <span>{item.label}</span>
                <span
                  className={`icon-chip rounded-[calc(var(--radius)+4px)] px-2 py-1 text-xs ${selected ? "bg-[--color-primary] text-[--color-primary-foreground]" : ""}`}
                >
                  {isLoading && !data ? <span className={`${shimmer} inline-block h-3 w-6 rounded`} /> : count}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
