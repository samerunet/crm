"use client";

import { useEffect, useMemo } from "react";
import { format, startOfMonth, subMonths } from "date-fns";
import { listContracts, ContractStatusEnum, type Contract } from "@/lib/api";
import { usePollingQuery } from "@/lib/hooks/use-polling-query";
import { DASHBOARD_DATA_EVENT } from "@/lib/dashboard/events";

const shimmer = "animate-pulse bg-[rgba(18,13,10,0.12)]";

const toCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function sumAmount(contracts: Contract[]) {
  return contracts.reduce((total, contract) => total + (contract.amountCents ?? 0), 0);
}

export default function RevenueSummary() {
  const { data, isLoading, refresh } = usePollingQuery(
    async () => {
      const [won, pipeline] = await Promise.all([
        listContracts({ status: ContractStatusEnum.SIGNED }),
        listContracts({ status: [ContractStatusEnum.DRAFT, ContractStatusEnum.SENT] }),
      ]);
      return { won, pipeline };
    },
    [],
    { refreshInterval: 0 },
  );

  useEffect(() => {
    const handler = () => {
      void refresh();
    };
    window.addEventListener(DASHBOARD_DATA_EVENT, handler);
    return () => window.removeEventListener(DASHBOARD_DATA_EVENT, handler);
  }, [refresh]);

  const metrics = useMemo(() => {
    const won = data?.won ?? [];
    const pipeline = data?.pipeline ?? [];
    const closedCents = sumAmount(won);
    const pipelineCents = sumAmount(pipeline);
    const averageCents = won.length ? Math.round(closedCents / won.length) : 0;
    const totalDeals = won.length + pipeline.length;
    const closeRate = totalDeals ? Math.round((won.length / totalDeals) * 100) : 0;
    return {
      closedCents,
      pipelineCents,
      averageCents,
      closeRate,
    };
  }, [data]);

  const isLoadingInitial = isLoading && !data;

  const renderCurrency = (valueCents: number) => toCurrency.format((valueCents ?? 0) / 100);

  const monthlySeries = useMemo(() => {
    const won = data?.won ?? [];
    const base = startOfMonth(new Date());
    const months = Array.from({ length: 6 }, (_, index) => subMonths(base, 5 - index));
    return months.map((monthDate) => {
      const monthKey = monthDate.getMonth();
      const yearKey = monthDate.getFullYear();
      const total = won.reduce((sum, contract) => {
        const iso = contract.signedAt || contract.updatedAt || contract.createdAt;
        if (!iso) return sum;
        const when = new Date(iso);
        if (when.getMonth() === monthKey && when.getFullYear() === yearKey) {
          return sum + (contract.amountCents ?? 0);
        }
        return sum;
      }, 0);
      return { label: format(monthDate, "MMM"), value: total };
    });
  }, [data]);

  const chartMax = useMemo(() => {
    return monthlySeries.reduce((max, item) => Math.max(max, item.value), 0) || 1;
  }, [monthlySeries]);

  return (
    <section className="glass-strong rounded-[calc(var(--radius)+14px)] border border-[--color-border]/50 p-4 shadow-[0_20px_48px_rgba(18,13,10,0.18)]">
      <header className="mb-3 flex items-center justify-between text-sm font-semibold text-[--color-foreground]">
        <span>Revenue snapshot</span>
        <span className="icon-chip rounded-full px-2 py-1 text-xs">Live</span>
      </header>
      {isLoadingInitial ? (
        <div className="space-y-3">
          <div className={`${shimmer} h-5 w-32 rounded`} />
          <div className={`${shimmer} h-14 w-full rounded`} />
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <div className="text-xs uppercase tracking-wide text-[--color-muted-foreground]">Closed revenue</div>
            <div className="mt-1 text-3xl font-semibold text-[--color-foreground]">
              {renderCurrency(metrics.closedCents)}
            </div>
          </div>

          <div className="space-y-3 rounded-[calc(var(--radius)+8px)] border border-[--color-border]/40 bg-[rgba(18,13,10,0.08)] p-3">
            <div className="flex items-center justify-between text-xs text-[--color-muted-foreground]">
              <span>Pipeline value</span>
              <span className="font-medium text-[--color-foreground]">{renderCurrency(metrics.pipelineCents)}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[rgba(18,13,10,0.12)]">
              <div
                className="h-full rounded-full bg-[--color-primary]"
                style={{
                  width: `${Math.min(100, metrics.closedCents + metrics.pipelineCents === 0
                    ? 0
                    : Math.round((metrics.closedCents / (metrics.closedCents + metrics.pipelineCents)) * 100))}%`,
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-[calc(var(--radius)+6px)] border border-[--color-border]/40 bg-[rgba(18,13,10,0.08)] p-3">
              <div className="text-xs uppercase tracking-wide text-[--color-muted-foreground]">Avg. deal</div>
              <div className="mt-1 font-semibold text-[--color-foreground]">
                {renderCurrency(metrics.averageCents)}
              </div>
            </div>
            <div className="rounded-[calc(var(--radius)+6px)] border border-[--color-border]/40 bg-[rgba(18,13,10,0.08)] p-3">
              <div className="text-xs uppercase tracking-wide text-[--color-muted-foreground]">Close rate</div>
              <div className="mt-1 font-semibold text-[--color-foreground]">{metrics.closeRate}%</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wide text-[--color-muted-foreground]">Revenue (last 6 months)</div>
            <div className="flex h-28 items-end gap-3">
              {monthlySeries.map(({ label, value }) => {
                const heightPercent = Math.round((value / chartMax) * 100);
                return (
                  <div key={label} className="flex flex-col items-center gap-2 text-[10px] text-[--color-muted-foreground]">
                    <div
                      className="w-8 rounded-[calc(var(--radius)+4px)] bg-[rgba(108,58,34,0.45)] shadow-[0_8px_18px_rgba(18,13,10,0.22)]"
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span>{label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
