"use client";
import MiniMonth from "@/components/calendar/MiniMonth";
import Kpis from "@/components/widgets/Kpis";
import { useState } from "react";

export default function RightRail() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="hidden lg:block space-y-4 sticky top-4">
        <div className="glass rounded-[--radius-xl] p-3">
          <MiniMonth />
        </div>
        <Kpis />
      </div>
      <div className="lg:hidden glass rounded-[--radius-xl]">
        <button className="w-full text-left px-3 py-2" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
          <div className="font-medium">Insights</div>
          <div className="text-xs opacity-80">Mini calendar & KPIs</div>
        </button>
        {open && (
          <div className="p-3 space-y-4">
            <MiniMonth />
            <Kpis />
          </div>
        )}
      </div>
    </>
  );
}
