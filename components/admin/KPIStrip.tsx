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
}: {
  events: Appointment[];
  sales: Sale[];
  leads: Lead[];
}) {
  const serviceRevenue = useMemo(() => events.reduce((s, e: any) => s + (e.price ?? 0), 0), [events]);
  const guideRevenue = useMemo(
    () => sales.filter((s: any) => s.type === "guide").reduce((s, e) => s + (e.amount ?? 0), 0),
    [sales]
  );
  const trials = useMemo(
    () => events.filter((e: any) => (e.service || "").toLowerCase().includes("trial")).length,
    [events]
  );
  const booked = useMemo(
    () => events.filter((e: any) => e.status === "booked" || e.status === "completed").length,
    [events]
  );

  // Sparklines
  const svSeries = useMemo(() => seriesFromAmounts(events.map((e: any) => e.price ?? 0)), [events]);
  const gdSeries = useMemo(() => seriesFromAmounts(sales.filter((s: any) => s.type === "guide").map((s) => s.amount ?? 0)), [sales]);
  const bkSeries = useMemo(() => seriesFromAmounts(events.map(() => 1)), [events]);
  const trSeries = useMemo(() => seriesFromAmounts(events.map((e: any) => ((e.service || "").toLowerCase().includes("trial") ? 1 : 0))), [events]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <KPIBlock label="Bookings" value={booked} sublabel="All time" sparkline={bkSeries} />
      <KPIBlock label="Trials" value={trials} sublabel="All time" sparkline={trSeries} />
      <KPIBlock label="Service Revenue" value={fmtUSD(serviceRevenue)} sublabel="Payments received" sparkline={svSeries} />
      <KPIBlock label="Guide Revenue" value={fmtUSD(guideRevenue)} sublabel="Payments received" sparkline={gdSeries} />
    </div>
  );
}
