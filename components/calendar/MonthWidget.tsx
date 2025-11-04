"use client";

import CalendarHeader from "./CalendarHeader";
import MonthGrid, { EventDensity } from "./MonthGrid";
import type { Appointment } from "@/lib/api";
import { useState } from "react";

type MonthWidgetProps = {
  events?: EventDensity;
  appointmentsByDay?: Record<string, Appointment[]>;
};

export default function MonthWidget({ events, appointmentsByDay }: MonthWidgetProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="space-y-3">
      <CalendarHeader />
      <div className="hidden sm:block">
        <MonthGrid events={events} appointmentsByDay={appointmentsByDay} />
      </div>
      <div className="sm:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="w-full rounded-[--radius-xl] border border-[--color-border]/60 bg-[--color-card] px-3 py-2 text-sm font-medium"
        >
          Open calendar
        </button>
        {mobileOpen ? (
          <div className="fixed inset-0 z-[140] bg-black/50 px-3 py-6">
            <div className="mx-auto max-w-md rounded-[--radius-xl] border border-[--color-border]/60 bg-[--color-card] p-2">
              <div className="flex items-center justify-between px-2 pb-2">
                <div className="text-sm font-semibold">Calendar</div>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="icon-chip rounded-[--radius-md] px-2 py-1 text-xs"
                >
                  Close
                </button>
              </div>
              <MonthGrid events={events} appointmentsByDay={appointmentsByDay} />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
