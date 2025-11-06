"use client";

import { useCallback, useEffect, useMemo } from "react";
import { differenceInMinutes, startOfMonth } from "date-fns";
import {
  listAppointments,
  listContracts,
  listLeads,
  type Contract,
  type Lead,
  ContractStatusEnum,
} from "@/lib/api";
import { usePollingQuery } from "@/lib/hooks/use-polling-query";
import { DASHBOARD_DATA_EVENT } from "@/lib/dashboard/events";

const shimmer = "animate-pulse bg-[rgba(18,13,10,0.12)]";

type KPIMetrics = {
  newLeads: number;
  appointments: number;
  deliveries: number;
  responseMinutes: number | null;
};

export default function Kpis() {
  const fetcher = useCallback(async (): Promise<KPIMetrics> => {
    const monthStart = startOfMonth(new Date());

    const [recentLeads, upcomingAppointments, signedContracts] = await Promise.all([
      listLeads({ createdAfter: monthStart }),
      listAppointments({ rangeStart: monthStart.toISOString() }),
      listContracts({ status: ContractStatusEnum.SIGNED }),
    ]);

    const responseMinutes = computeAverageResponseMinutes(recentLeads);

    return {
      newLeads: recentLeads.length,
      appointments: upcomingAppointments.length,
      deliveries: signedContracts.length,
      responseMinutes,
    } satisfies KPIMetrics;
  }, []);

  const { data, isLoading, refresh } = usePollingQuery(fetcher, [], { refreshInterval: 0 });

  useEffect(() => {
    const handler = () => {
      void refresh();
    };
    window.addEventListener(DASHBOARD_DATA_EVENT, handler);
    return () => window.removeEventListener(DASHBOARD_DATA_EVENT, handler);
  }, [refresh]);

  const metrics = useMemo<KPIMetrics>(() => {
    if (data) return data;
    return { newLeads: 0, appointments: 0, deliveries: 0, responseMinutes: null };
  }, [data]);

  return (
    <div className="grid grid-cols-2 gap-3">
      <KpiCard label="New Leads" value={metrics.newLeads} loading={isLoading && !data} suffix="" />
      <KpiCard label="Appointments" value={metrics.appointments} loading={isLoading && !data} suffix="" />
      <KpiCard label="Deliveries" value={metrics.deliveries} loading={isLoading && !data} suffix="" />
      <KpiCard
        label="Response Time"
        value={metrics.responseMinutes ?? 0}
        loading={isLoading && !data}
        formatter={(value) =>
          metrics.responseMinutes === null ? "—" : `${Math.round(value)} min`
        }
      />
    </div>
  );
}

function computeAverageResponseMinutes(leads: Lead[]) {
  const diffs: number[] = [];
  leads.forEach((lead) => {
    if (lead.lastInboundAt && lead.lastOutboundAt) {
      const inbound = new Date(lead.lastInboundAt);
      const outbound = new Date(lead.lastOutboundAt);
      if (!Number.isNaN(inbound.getTime()) && !Number.isNaN(outbound.getTime())) {
        const minutes = Math.abs(differenceInMinutes(outbound, inbound));
        diffs.push(minutes);
      }
    }
  });
  if (!diffs.length) return null;
  const sum = diffs.reduce((total, value) => total + value, 0);
  return sum / diffs.length;
}

type KpiCardProps = {
  label: string;
  value: number;
  loading: boolean;
  suffix?: string;
  formatter?: (value: number) => string;
};

function KpiCard({ label, value, loading, suffix = "", formatter }: KpiCardProps) {
  return (
    <div className="glass-strong rounded-[calc(var(--radius)+12px)] border border-[--color-border]/50 p-3 shadow-[0_16px_40px_rgba(18,13,10,0.16)]">
      <div className="text-xs opacity-80">{label}</div>
      <div className="mt-1 text-xl font-semibold text-[--color-foreground]">
        {loading ? <span className={`${shimmer} inline-block h-6 w-12 rounded`} /> : formatter ? formatter(value) : `${value}${suffix}`}
      </div>
    </div>
  );
}
