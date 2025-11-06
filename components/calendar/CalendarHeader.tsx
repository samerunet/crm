"use client";

import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCalendarContext } from "./CalendarContext";

export default function CalendarHeader({ onToday }: { onToday?: () => void } = {}) {
  const { visibleMonth, goToMonth, setSelectedDate } = useCalendarContext();

  const handleToday = () => {
    const now = new Date();
    setSelectedDate(now);
    onToday?.();
  };

  return (
    <div className="glass-strong flex flex-wrap items-center justify-between gap-3 rounded-[calc(var(--radius)+10px)] border border-[--color-border]/50 px-4 py-3 shadow-[0_16px_40px_rgba(18,13,10,0.16)]">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-[--color-muted-foreground]">
          Calendar
        </div>
        <div className="text-lg font-semibold text-[--color-foreground]">
          {format(visibleMonth, "MMMM yyyy")}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="icon-chip inline-flex h-9 w-9 items-center justify-center rounded-full"
          onClick={() => goToMonth(-1)}
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="icon-chip inline-flex h-9 items-center justify-center rounded-[--radius-lg] px-3 text-xs font-semibold uppercase tracking-wide"
          onClick={handleToday}
        >
          Today
        </button>
        <button
          type="button"
          className="icon-chip inline-flex h-9 w-9 items-center justify-center rounded-full"
          onClick={() => goToMonth(1)}
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
