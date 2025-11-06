"use client";
import Kpis from "@/components/widgets/Kpis";
import RevenueSummary from "@/components/dashboard/RevenueSummary";
import { useState } from "react";

export default function RightRail() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="hidden lg:block space-y-4 sticky top-4">
        <RevenueSummary />
        <Kpis />
      </div>
      <div className="lg:hidden glass-strong rounded-[calc(var(--radius)+12px)] border border-[--color-border]/50">
        <button className="w-full text-left px-3 py-2" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
          <div className="font-medium">Insights</div>
          <div className="text-xs opacity-80">Revenue & KPIs</div>
        </button>
        {open && (
          <div className="p-3 space-y-4">
            <RevenueSummary />
            <Kpis />
          </div>
        )}
      </div>
    </>
  );
}
