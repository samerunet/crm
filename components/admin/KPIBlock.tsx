// FILE: components/admin/KPIBlock.tsx  (DROP-IN)
// Glass KPI with inline sparkline

"use client";

type Props = {
  label: string;
  value: string | number;
  sublabel?: string;
  trendPct?: number;          // e.g. +12 or -5
  sparkline?: number[];       // e.g. last 12 weeks
};

export default function KPIBlock({ label, value, sublabel, trendPct, sparkline }: Props) {
  // mini sparkline path
  const path = (() => {
    if (!sparkline || sparkline.length < 2) return "";
    const w = 120, h = 34, pad = 4;
    const xs = sparkline.map((_, i) => (i / (sparkline.length - 1)) * (w - pad * 2) + pad);
    const min = Math.min(...sparkline), max = Math.max(...sparkline);
    const scaleY = (v: number) => {
      if (max === min) return h / 2;
      const t = (v - min) / (max - min);
      return h - pad - t * (h - pad * 2);
    };
    return xs.map((x, i) => `${i ? "L" : "M"} ${x.toFixed(2)} ${scaleY(sparkline[i]).toFixed(2)}`).join(" ");
  })();

  const trendColor =
    trendPct == null ? "" : trendPct >= 0 ? "text-[var(--sage)]" : "text-[var(--destructive)]";

  return (
    <div className="kpi-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="kpi-label">{label}</div>
          <div className="kpi-value">{typeof value === "number" ? value.toLocaleString() : value}</div>
          {sublabel && <div className="text-xs text-muted-foreground mt-0.5">{sublabel}</div>}
        </div>

        {/* Sparkline */}
        <svg width="120" height="34" viewBox="0 0 120 34" className="opacity-90">
          <defs>
            <linearGradient id="kpiGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--gold)" />
              <stop offset="100%" stopColor="var(--accent)" />
            </linearGradient>
          </defs>
          <path d={path} fill="none" stroke="url(#kpiGrad)" strokeWidth="2" />
        </svg>
      </div>

      {trendPct != null && (
        <div className={`mt-2 text-xs font-medium ${trendColor}`}>
          {trendPct >= 0 ? "▲" : "▼"} {Math.abs(trendPct)}%
        </div>
      )}
    </div>
  );
}
