// FILE: components/admin/CalendarIOS.tsx  (DROP-IN REPLACEMENT)
"use client";

import React, { useMemo, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import type { Appointment, Lead } from "./types";

/** Safely pull a Date from many possible event fields */
function getEventDate(e: any): Date | null {
  const v = e?.start || e?.dateISO || e?.startAt || e?.when;
  if (!v) return null;
  const d = new Date(v);
  return isNaN(+d) ? null : d;
}
function getEventEnd(e: any, start: Date | null): Date | null {
  const v = e?.end || e?.endAt || e?.finish || e?.endTime;
  if (v) {
    const d = new Date(v);
    if (!isNaN(+d)) return d;
  }
  if (start) {
    return new Date(start.getTime() + 60 * 60 * 1000);
  }
  return null;
}
const toTime = (value: Date | string | null | undefined) => {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};
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

type StatusCategory = "new" | "pending" | "booked" | "other";
type RangeShortcut = "today" | "tomorrow" | "week";

const CATEGORY_COLORS: Record<StatusCategory, string> = {
  new: "#ef4444",
  pending: "#f59e0b",
  booked: "#22c55e",
  other: "#64748b",
};

function hexToRgba(hex: string, alpha: number) {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean.length === 3 ? clean.repeat(2) : clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function categorizeEvent(lead?: Lead, event?: Appointment): StatusCategory {
  const stage = lead?.stage;
  if (stage === "uncontacted") return "new";
  if (stage === "contacted" || stage === "deposit" || stage === "trial" || stage === "changes")
    return "pending";
  if (stage === "booked" || stage === "confirmed" || stage === "completed") return "booked";

  const status = event?.status;
  if (status === "tentative") return "pending";
  if (status === "booked" || status === "completed") return "booked";
  if (status === "canceled") return "other";
  return "other";
}

type RichEvent = {
  event: Appointment;
  start: Date | null;
  end: Date | null;
  lead?: Lead;
  category: StatusCategory;
  color: string;
};

type DaySlot =
  | { type: "event"; start: Date; end: Date; rich: RichEvent }
  | { type: "open"; start: Date; end: Date };

function buildDaySchedule(events: RichEvent[], day: Date): DaySlot[] {
  const sorted = events
    .filter((rich) => rich.start)
    .sort((a, b) => (a.start?.getTime() ?? 0) - (b.start?.getTime() ?? 0));
  const slots: DaySlot[] = [];
  const dayStart = new Date(day);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(day);
  dayEnd.setHours(23, 59, 0, 0);

  let cursor = dayStart;

  for (const rich of sorted) {
    const start = rich.start ?? new Date(dayStart);
    const end = rich.end ?? new Date(start.getTime() + 60 * 60 * 1000);
    if (start > cursor) {
      slots.push({ type: "open", start: new Date(cursor), end: new Date(start) });
    }
    slots.push({ type: "event", start: new Date(start), end: new Date(end), rich });
    if (end > cursor) cursor = new Date(end);
  }

  if (cursor < dayEnd) {
    slots.push({ type: "open", start: new Date(cursor), end: dayEnd });
  }

  return slots;
}

/** Props for the calendar */
type Props = {
  events: Appointment[];
  leads: Lead[];
  onEventOpen?: (e: Appointment) => void;
  /** Optional: called when user clicks “+ New” with the currently selected date */
  onDayCreate?: (date: Date) => void;
  focusDate?: Date | null;
  viewMode?: "month" | "today";
  rangeLabel?: string;
  onRequestTimeframeChange?: (key: RangeShortcut) => void;
};

export default function CalendarIOS({
  events,
  leads,
  onEventOpen,
  onDayCreate,
  focusDate,
  viewMode,
  rangeLabel,
  onRequestTimeframeChange,
}: Props) {
  const realToday = new Date();
  const initialFocus = focusDate ?? realToday;
  const [cursor, setCursor] = useState<Date>(startOfMonth(initialFocus));
  const [mode, setMode] = useState<"month" | "today">(viewMode ?? "month");
  const [selectedKey, setSelectedKey] = useState<string | null>(ymd(initialFocus));
  const [modalKey, setModalKey] = useState<string | null>(null);
  const focusKey = focusDate ? ymd(focusDate) : null;

  useEffect(() => {
    if (!focusDate) return;
    setSelectedKey(ymd(focusDate));
    setCursor(startOfMonth(focusDate));
  }, [focusKey]);

  useEffect(() => {
    if (!viewMode) return;
    setMode(viewMode);
  }, [viewMode]);

  const anchorDate = focusDate ?? realToday;
  const anchorKey = ymd(anchorDate);
  const listLabel = rangeLabel ?? "Today";

  const leadById = useMemo(() => {
    const map = new Map<string, Lead>();
    for (const lead of leads ?? []) {
      if (lead?.id) map.set(lead.id, lead);
    }
    return map;
  }, [leads]);

  const richEvents: RichEvent[] = useMemo(() => {
    return (events ?? []).map((event) => {
      const start = getEventDate(event);
      const end = getEventEnd(event, start);
      const lead = event.leadId ? leadById.get(event.leadId) : undefined;
      const category = categorizeEvent(lead, event);
      const color = CATEGORY_COLORS[category] ?? CATEGORY_COLORS.other;
      return { event, start, end, lead, category, color };
    });
  }, [events, leadById]);

  /** Map events by day key YYYY-MM-DD */
  const eventsByDay = useMemo(() => {
    const map = new Map<string, RichEvent[]>();
    for (const rich of richEvents) {
      const d = rich.start ?? getEventDate(rich.event);
      if (!d) continue;
      const key = ymd(d);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(rich);
    }
    return map;
  }, [richEvents]);

  const selectedDate: Date | null = useMemo(() => {
    return selectedKey ? new Date(`${selectedKey}T00:00:00`) : null;
  }, [selectedKey]);

  const selectedEvents = useMemo(() => {
    if (!selectedKey) return [] as RichEvent[];
    const list = eventsByDay.get(selectedKey) ?? [];
    return [...list].sort((a, b) => (a.start?.getTime() ?? 0) - (b.start?.getTime() ?? 0));
  }, [selectedKey, eventsByDay]);

  const modalEvents = useMemo(() => {
    if (!modalKey) return [] as RichEvent[];
    const list = eventsByDay.get(modalKey) ?? [];
    return [...list].sort((a, b) => (a.start?.getTime() ?? 0) - (b.start?.getTime() ?? 0));
  }, [modalKey, eventsByDay]);

  const modalDate = useMemo(() => {
    return modalKey ? new Date(`${modalKey}T00:00:00`) : null;
  }, [modalKey]);

  const closeModal = () => setModalKey(null);

  const modalSlots = useMemo(() => {
    if (!modalDate) return [] as DaySlot[];
    return buildDaySchedule(modalEvents, modalDate);
  }, [modalEvents, modalDate]);

  useEffect(() => {
    if (!modalDate) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [modalDate]);

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

  /** Focus-day list (filtered) */
  const focusList = useMemo(() => {
    return richEvents.filter((rich) => {
      const d = rich.start;
      return d ? sameDay(d, anchorDate) : false;
    });
  }, [richEvents, anchorKey]);

  return (
    <>
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
              const m = startOfMonth(realToday);
              setCursor(m);
              setSelectedKey(ymd(realToday));
              setMode("today");
              onRequestTimeframeChange?.("today");
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
            onClick={() => {
              setMode("month");
            }}
          >
            Month
          </button>
          <button
            className={`h-9 rounded-xl px-3 text-sm border ${
              mode === "today"
                ? "bg-primary/15 border-border/70"
                : "border-border/60 hover:bg-accent/20"
            }`}
            onClick={() => {
              setMode("today");
              onRequestTimeframeChange?.("today");
            }}
          >
            Today
          </button>
        </div>
      </div>

      {/* MAIN */}
      {mode === "today" ? (
        <div className="glass mt-3 rounded-2xl p-3">
          {focusList.length === 0 ? (
            <div className="text-sm text-muted-foreground p-3">No bookings for {listLabel.toLowerCase()}.</div>
          ) : (
            <ul className="divide-y glass-sep">
              {focusList.map((rich) => {
                const start = rich.start;
                const end = rich.end;
                const event = rich.event;
                const timeLabel = [toTime(start), toTime(end)].filter(Boolean).join(" – ");
                return (
                  <li key={event.id} className="py-2 px-2">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          <span
                            className="inline-block h-2 w-2 rounded-full"
                            style={{ backgroundColor: rich.color }}
                          />
                          {event.title || event.service || "Appointment"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {timeLabel}
                          {event.location ? ` · ${event.location}` : ""}
                        </div>
                      </div>
                      {event.price != null && (
                        <div className="text-sm font-medium">${Math.round(event.price)}</div>
                      )}
                    </div>
                  </li>
                );
              })}
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
                const isFocusCell = sameDay(d, anchorDate);
                const isTodayCell = sameDay(d, realToday);
                const categories = new Set(items.map((item) => item.category));
                let dayStyle: React.CSSProperties | undefined;
                if (items.length === 0) {
                  dayStyle = {
                    backgroundColor: hexToRgba(CATEGORY_COLORS.pending, 0.12),
                    borderColor: hexToRgba(CATEGORY_COLORS.pending, 0.5),
                  };
                } else if (categories.has("new")) {
                  dayStyle = {
                    backgroundColor: hexToRgba(CATEGORY_COLORS.new, 0.12),
                    borderColor: hexToRgba(CATEGORY_COLORS.new, 0.55),
                  };
                } else if (categories.has("pending")) {
                  dayStyle = {
                    backgroundColor: hexToRgba(CATEGORY_COLORS.pending, 0.12),
                    borderColor: hexToRgba(CATEGORY_COLORS.pending, 0.55),
                  };
                } else if (categories.has("booked")) {
                  dayStyle = {
                    backgroundColor: hexToRgba(CATEGORY_COLORS.booked, 0.12),
                    borderColor: hexToRgba(CATEGORY_COLORS.booked, 0.55),
                  };
                }
                if (!inMonth) {
                  dayStyle = undefined;
                }

                return (
                  <button
                    key={`${key}-${idx}`}
                    onClick={() => {
                      setSelectedKey(key);
                      setModalKey(key);
                    }}
                    className={[
                      "relative h-[92px] sm:h-[110px] rounded-xl border p-1.5 text-left",
                      "transition hover:bg-accent/10",
                      inMonth ? "bg-background/30" : "bg-background/10 opacity-75",
                      isSel ? "ring-2 ring-[--ring]" : "",
                      isFocusCell || isTodayCell ? "border-[var(--gold)]" : "border-border/60",
                    ].join(" ")}
                    style={dayStyle}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-medium">{d.getDate()}</span>
                      {items.length > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-card/70 px-1.5 py-0.5 text-[10px]">
                          <span
                            className="inline-block h-1.5 w-1.5 rounded-full"
                            style={{
                              backgroundColor:
                                CATEGORY_COLORS[
                                  categories.has("new")
                                    ? "new"
                                    : categories.has("pending")
                                    ? "pending"
                                    : categories.has("booked")
                                    ? "booked"
                                    : "other"
                                ],
                            }}
                          />
                          {items.length}
                        </span>
                      )}
                    </div>

                    {/* Event chips (max 2) */}
                    <div className="mt-1 space-y-1">
                      {items.slice(0, 2).map((rich) => (
                        <div
                          key={rich.event.id}
                          onClick={(ev) => {
                            ev.stopPropagation();
                            onEventOpen?.(rich.event);
                          }}
                          className="truncate rounded-lg border px-1.5 py-0.5 text-[11px] hover:bg-accent/20"
                          style={{
                            backgroundColor: hexToRgba(rich.color, 0.18),
                            borderColor: hexToRgba(rich.color, 0.5),
                            color: "#1f1a17",
                          }}
                          title={rich.event.title || rich.event.service || "Appointment"}
                        >
                          {rich.event.title || rich.event.service || "Appointment"}
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
                {selectedEvents.map((rich) => {
                  const event = rich.event;
                  const start = rich.start;
                  const end = rich.end;
                  const timeLabel = [toTime(start), toTime(end)].filter(Boolean).join(" – ");
                  return (
                    <li key={event.id} className="py-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm flex items-center gap-2">
                            <span
                              className="inline-block h-2 w-2 rounded-full"
                              style={{ backgroundColor: rich.color }}
                            />
                            {event.title || event.service || "Appointment"}
                          </div>
                          <div className="text-xs text-muted-foreground">{timeLabel}</div>
                          {rich.lead?.stage && (
                            <div className="mt-1 inline-flex items-center gap-1 rounded-full border border-border/60 px-2 py-0.5 text-[10px] uppercase tracking-wide">
                              {rich.lead.stage}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {event.price != null && (
                            <span className="text-xs font-medium">${Math.round(event.price)}</span>
                          )}
                          <button
                            className="h-8 rounded-md border border-border/60 px-2 text-xs hover:bg-accent/20"
                            onClick={() => onEventOpen?.(event)}
                          >
                            Open
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
                {selectedEvents.length === 0 && (
                  <li className="py-2 text-sm text-muted-foreground flex items-center justify-between">
                    <span>No events on this day.</span>
                    {onDayCreate && selectedDate && (
                      <button
                        className="h-8 rounded-lg border border-border/60 px-2 text-xs hover:bg-accent/20"
                        onClick={() => onDayCreate(selectedDate)}
                      >
                        + Add lead
                      </button>
                    )}
                  </li>
                )}
              </ul>
            )}
          </div>
        </>
      )}
      </div>

      {modalDate &&
        createPortal(
          <div className="fixed inset-0 z-[300] flex items-center justify-center px-4 py-8">
            <div className="absolute inset-0 bg-black/50" onClick={closeModal} />
            <div className="relative z-[310] w-full max-w-xl rounded-3xl border border-border/70 bg-popover/95 p-4 shadow-2xl backdrop-blur">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold">
                    {modalDate.toLocaleDateString(undefined, {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {modalEvents.length} booking{modalEvents.length === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {onDayCreate && (
                    <button
                      className="h-8 rounded-lg border border-border/60 px-3 text-xs font-medium hover:bg-accent/20"
                      onClick={() => {
                        onDayCreate?.(modalDate);
                        closeModal();
                      }}
                    >
                      + New lead
                    </button>
                  )}
                  <button
                    aria-label="Close"
                    className="icon-chip h-8 w-8 rounded-xl inline-grid place-items-center"
                    onClick={closeModal}
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="mt-3 space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {modalSlots.map((slot, idx) => {
                  if (slot.type === "open") {
                    const label = `${toTime(slot.start)} – ${toTime(slot.end)}`;
                    return (
                      <div
                        key={`open-${idx}`}
                        className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/80 px-3 py-2 text-sm text-amber-900"
                      >
                        <div>
                          <div className="font-semibold">Available</div>
                          <div className="text-xs">{label}</div>
                        </div>
                        {onDayCreate && (
                          <button
                            className="h-7 rounded-lg border border-amber-400 px-2 text-xs font-medium hover:bg-amber-100"
                            onClick={() => {
                              const start = new Date(slot.start);
                              onDayCreate?.(start);
                              closeModal();
                            }}
                          >
                            Add lead
                          </button>
                        )}
                      </div>
                    );
                  }

                  const { rich } = slot;
                  const event = rich.event;
                  const leadName = rich.lead?.name ?? "Unnamed client";
                  const timeLabel = `${toTime(slot.start)} – ${toTime(slot.end)}`;
                  return (
                    <div
                      key={event.id}
                      className="rounded-xl border px-3 py-2 shadow-sm"
                      style={{
                        borderColor: hexToRgba(rich.color, 0.5),
                        backgroundColor: hexToRgba(rich.color, 0.12),
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold text-sm flex items-center gap-2">
                            <span
                              className="inline-block h-2 w-2 rounded-full"
                              style={{ backgroundColor: rich.color }}
                            />
                            {event.title || event.service || "Appointment"}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">{timeLabel}</div>
                          <div className="text-xs mt-1 font-medium">{leadName}</div>
                          {rich.lead?.stage && (
                            <div className="mt-1 inline-flex items-center gap-1 rounded-full border border-border/60 px-2 py-0.5 text-[10px] uppercase tracking-wide">
                              {rich.lead.stage}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {event.price != null && (
                            <span className="text-xs font-semibold">${Math.round(event.price)}</span>
                          )}
                          <button
                            className="h-7 rounded-lg border border-border/60 px-2 text-xs hover:bg-accent/20"
                            onClick={() => {
                              onEventOpen?.(event);
                              closeModal();
                            }}
                          >
                            Open
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {modalSlots.length === 0 && (
                  <div className="rounded-xl border border-border/60 bg-popover/70 px-3 py-4 text-sm text-muted-foreground">
                    No events scheduled. This day is wide open.
                    {onDayCreate && (
                      <button
                        className="mt-3 block rounded-lg border border-border/60 px-3 py-2 text-xs font-medium hover:bg-accent/20"
                        onClick={() => {
                          onDayCreate?.(modalDate);
                          closeModal();
                        }}
                      >
                        + Add lead
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
