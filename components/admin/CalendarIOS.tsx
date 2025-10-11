// FILE: components/admin/CalendarIOS.tsx  (DROP-IN REPLACEMENT)
"use client";

import React, { useMemo, useState } from "react";
import type { Appointment, Lead } from "./types";

/** Safely pull a Date from many possible event fields */
function getEventDate(e: any): Date | null {
  const v = e?.date || e?.dateISO || e?.start || e?.startAt || e?.when;
  if (!v) return null;
  const d = new Date(v);
  return isNaN(+d) ? null : d;
}
function ymd(d: Date) {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const dd = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${dd}`;
}
function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function addMonths(d: Date, delta: number) {
  return new Date(d.getFullYear(), d.getMonth() + delta, 1);
}
function monthLabel(d: Date) {
  return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

/** Props for the calendar */
type Props = {
  events: Appointment[];
  leads: Lead[];
  onEventOpen?: (e: Appointment) => void;
  /** Optional: called when user clicks “+ New” with the currently selected date */
  onDayCreate?: (date: Date) => void;
};

export default function CalendarIOS({ events, leads, onEventOpen, onDayCreate }: Props) {
  const today = new Date();
  const [cursor, setCursor] = useState<Date>(startOfMonth(today));
  const [mode, setMode] = useState<"month" | "today">("month");
  const [selectedKey, setSelectedKey] = useState<string | null>(ymd(today));

  /** Map events by day key YYYY-MM-DD */
  const eventsByDay = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const e of events ?? []) {
      const d = getEventDate(e);
      if (!d) continue;
      const key = ymd(d);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    }
    return map;
  }, [events]);

  const selectedDate: Date | null = useMemo(() => {
    return selectedKey ? new Date(`${selectedKey}T00:00:00`) : null;
  }, [selectedKey]);

  /** Build visible month grid (6x7 cells) starting on Sunday */
  const monthCells = useMemo(() => {
    const start = startOfMonth(cursor);
    const startDay = start.getDay(); // 0=Sun
    const firstCell = new Date(start);
    firstCell.setDate(firstCell.getDate() - startDay);
    const cells: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(firstCell);
      d.setDate(firstCell.getDate() + i);
      cells.push(d);
    }
    return cells;
  }, [cursor]);

  /** Today list (filtered) */
  const todayList = useMemo(() => {
    return (events ?? []).filter((e) => {
      const d = getEventDate(e);
      return d ? sameDay(d, today) : false;
    });
  }, [events, today]);

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div className="crm-toolbar flex flex-wrap items-center justify-between gap-2">
        {/* Left: Month nav */}
        <div className="flex items-center gap-2">
          <button
            className="icon-chip h-9 w-9 rounded-xl inline-grid place-items-center"
            onClick={() => setCursor((c) => addMonths(c, -1))}
            aria-label="Previous month"
          >
            ‹
          </button>
          <div className="px-2 text-sm sm:text-base font-semibold">{monthLabel(cursor)}</div>
          <button
            className="icon-chip h-9 w-9 rounded-xl inline-grid place-items-center"
            onClick={() => setCursor((c) => addMonths(c, +1))}
            aria-label="Next month"
          >
            ›
          </button>

          <button
            className="ml-2 h-9 rounded-xl border border-border/70 px-3 text-sm hover:bg-accent/20"
            onClick={() => {
              const m = startOfMonth(today);
              setCursor(m);
              setMode("month");
              setSelectedKey(ymd(today));
            }}
          >
            Today
          </button>
        </div>

        {/* Right: view toggle */}
        <div className="flex items-center gap-1">
          <button
            className={`h-9 rounded-xl px-3 text-sm border ${
              mode === "month"
                ? "bg-primary/15 border-border/70"
                : "border-border/60 hover:bg-accent/20"
            }`}
            onClick={() => setMode("month")}
          >
            Month
          </button>
          <button
            className={`h-9 rounded-xl px-3 text-sm border ${
              mode === "today"
                ? "bg-primary/15 border-border/70"
                : "border-border/60 hover:bg-accent/20"
            }`}
            onClick={() => setMode("today")}
          >
            Today
          </button>
        </div>
      </div>

      {/* MAIN */}
      {mode === "today" ? (
        <div className="glass mt-3 rounded-2xl p-3">
          {todayList.length === 0 ? (
            <div className="text-sm text-muted-foreground p-3">No bookings today.</div>
          ) : (
            <ul className="divide-y glass-sep">
              {todayList.map((e: any) => (
                <li key={e.id} className="py-2 px-2">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium">{e.title || e.service || "Appointment"}</div>
                      <div className="text-xs text-muted-foreground">
                        {(e.time || e.startTime || "").toString()}
                        {e.location ? ` · ${e.location}` : ""}
                      </div>
                    </div>
                    {e.price != null && (
                      <div className="text-sm font-medium">${Math.round(e.price)}</div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <>
          {/* Month grid */}
          <div className="mt-3">
            <div className="grid grid-cols-7 gap-2 text-xs text-muted-foreground">
              <div className="text-center">Sun</div>
              <div className="text-center">Mon</div>
              <div className="text-center">Tue</div>
              <div className="text-center">Wed</div>
              <div className="text-center">Thu</div>
              <div className="text-center">Fri</div>
              <div className="text-center">Sat</div>
            </div>

            <div className="mt-2 grid grid-cols-7 gap-2">
              {monthCells.map((d, idx) => {
                const inMonth = d.getMonth() === cursor.getMonth();
                const key = ymd(d);
                const items = eventsByDay.get(key) ?? [];
                const isSel = selectedKey === key;
                const isTodayCell = sameDay(d, today);

                return (
                  <button
                    key={`${key}-${idx}`}
                    onClick={() => setSelectedKey(key)}
                    className={[
                      "relative h-[92px] sm:h-[110px] rounded-xl border p-1.5 text-left",
                      "transition hover:bg-accent/10",
                      inMonth ? "bg-background/30" : "bg-background/10 opacity-75",
                      isSel ? "ring-2 ring-[--ring]" : "",
                      isTodayCell ? "border-[var(--gold)]" : "border-border/60",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-medium">{d.getDate()}</span>
                      {items.length > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-card/70 px-1.5 py-0.5 text-[10px]">
                          <span
                            className="inline-block h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: "var(--sage)" }}
                          />
                          {items.length}
                        </span>
                      )}
                    </div>

                    {/* Event chips (max 2) */}
                    <div className="mt-1 space-y-1">
                      {items.slice(0, 2).map((e) => (
                        <div
                          key={e.id}
                          onClick={(ev) => {
                            ev.stopPropagation();
                            onEventOpen?.(e);
                          }}
                          className="truncate rounded-lg border border-border/70 bg-card/75 px-1.5 py-0.5 text-[11px] hover:bg-accent/20"
                          title={e.title || e.service || "Appointment"}
                        >
                          {e.title || e.service || "Appointment"}
                        </div>
                      ))}
                      {items.length > 2 && (
                        <div className="text-[10px] text-muted-foreground">+{items.length - 2} more</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected day panel + Create */}
          <div className="mt-3 glass rounded-2xl p-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">
                {selectedDate ? selectedDate.toLocaleDateString() : "Select a day"}
              </div>

              <button
                className="px-2 py-1 rounded border border-border bg-popover hover:bg-accent/20 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!selectedDate || !onDayCreate}
                onClick={() => {
                  if (!selectedDate || !onDayCreate) return;
                  onDayCreate(selectedDate);
                }}
              >
                + New
              </button>
            </div>

            {selectedDate && (
              <ul className="mt-2 divide-y glass-sep">
                {(eventsByDay.get(ymd(selectedDate)) ?? []).map((e) => (
                  <li key={e.id} className="py-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">
                          {e.title || e.service || "Appointment"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {(e as any).time || (e as any).startTime || ""}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {e.price != null && (
                          <span className="text-xs font-medium">${Math.round(e.price)}</span>
                        )}
                        <button
                          className="h-8 rounded-md border border-border/60 px-2 text-xs hover:bg-accent/20"
                          onClick={() => onEventOpen?.(e)}
                        >
                          Open
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
                {(eventsByDay.get(ymd(selectedDate)) ?? []).length === 0 && (
                  <li className="py-2 text-sm text-muted-foreground">No events on this day.</li>
                )}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
