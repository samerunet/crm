// FILE: components/admin/KPIStrip.tsx  (DROP-IN)
// Computes key metrics and supplies sparklines

"use client";

import { useMemo } from "react";
import KPIBlock from "./KPIBlock";
import type { Appointment, Sale, Lead } from "./types";

function fmtUSD(n: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

// build a simple last-12 buckets series from events or sales
function seriesFromAmounts(amounts: number[], buckets = 12) {
  if (amounts.length === 0) return Array(buckets).fill(0);
  // naive bucket by index
  const size = Math.ceil(amounts.length / buckets);
  const out: number[] = [];
  for (let i = 0; i < buckets; i++) {
    const chunk = amounts.slice(i * size, (i + 1) * size);
    out.push(chunk.reduce((s, v) => s + v, 0));
  }
  return out;
}

export default function KPIStrip({
  events,
  sales,
  leads,
  timeframeLabel,
}: {
  events: Appointment[];
  sales: Sale[];
  leads: Lead[];
  timeframeLabel?: string;
}) {
  const eventList = Array.isArray(events) ? events : [];
  const saleList = Array.isArray(sales) ? sales : [];
  const label = timeframeLabel ?? "All time";

  const serviceRevenue = useMemo(
    () => eventList.reduce((s, e: any) => s + (e?.price ?? 0), 0),
    [eventList]
  );
  const guideRevenue = useMemo(
    () =>
      saleList
        .filter((s: any) => s?.type === "guide")
        .reduce((s, e) => s + (e?.amount ?? 0), 0),
    [saleList]
  );
  const trials = useMemo(
    () =>
      eventList.filter((e: any) =>
        (e?.service || "").toLowerCase().includes("trial")
      ).length,
    [eventList]
  );
  const booked = useMemo(
    () =>
      eventList.filter(
        (e: any) => e?.status === "booked" || e?.status === "completed"
      ).length,
    [eventList]
  );

  // Sparklines
  const svSeries = useMemo(
    () => seriesFromAmounts(eventList.map((e: any) => e?.price ?? 0)),
    [eventList]
  );
  const gdSeries = useMemo(
    () =>
      seriesFromAmounts(
        saleList
          .filter((s: any) => s?.type === "guide")
          .map((s) => s?.amount ?? 0)
      ),
    [saleList]
  );
  const bkSeries = useMemo(
    () => seriesFromAmounts(eventList.map(() => 1)),
    [eventList]
  );
  const trSeries = useMemo(
    () =>
      seriesFromAmounts(
        eventList.map((e: any) =>
          (e?.service || "").toLowerCase().includes("trial") ? 1 : 0
        )
      ),
    [eventList]
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <KPIBlock label="Bookings" value={booked} sublabel={label} sparkline={bkSeries} />
      <KPIBlock label="Trials" value={trials} sublabel={label} sparkline={trSeries} />
      <KPIBlock label="Service Revenue" value={fmtUSD(serviceRevenue)} sublabel={`${label} · Payments`} sparkline={svSeries} />
      <KPIBlock label="Guide Revenue" value={fmtUSD(guideRevenue)} sublabel={`${label} · Payments`} sparkline={gdSeries} />
    </div>
  );
}
