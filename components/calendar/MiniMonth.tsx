"use client";
import { format, isToday } from "date-fns";
import { getMonthGrid, isSameDay, isSameMonth } from "@/lib/calendar/date";
import { AppointmentStatusEnum, type AppointmentStatus } from "@/lib/api";
import { DAY_VISUAL_STYLES, determineDayStatus } from "@/lib/calendar/day-visuals";
import { useCalendarContext } from "./CalendarContext";

type EventDensity = Record<string, Partial<Record<AppointmentStatus, number>>>;

const STATUS_DOTS: Record<AppointmentStatus, string> = {
  [AppointmentStatusEnum.TENTATIVE]: "var(--amber)",
  [AppointmentStatusEnum.CONFIRMED]: "var(--color-primary)",
  [AppointmentStatusEnum.COMPLETED]: "var(--sage)",
  [AppointmentStatusEnum.CANCELED]: "var(--destructive)",
};

const STATUS_PRIORITY: AppointmentStatus[] = [
  AppointmentStatusEnum.CONFIRMED,
  AppointmentStatusEnum.TENTATIVE,
  AppointmentStatusEnum.COMPLETED,
  AppointmentStatusEnum.CANCELED,
];

/* eslint-disable no-unused-vars */
type MiniMonthProps = {
  events?: EventDensity;
  onSelectDate?: (date: Date) => void;
};
/* eslint-enable no-unused-vars */

export default function MiniMonth({ events = {}, onSelectDate }: MiniMonthProps) {
  const { visibleMonth, selectedDate, setSelectedDate, goToMonth } = useCalendarContext();
  const days = getMonthGrid(visibleMonth);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <button
          className="icon-chip px-2 py-1 rounded-[--radius-md]"
          onClick={() => goToMonth(-1)}
          aria-label="Previous month"
        >
          ‹
        </button>
        <div className="text-sm font-medium">{format(visibleMonth, "MMM yyyy")}</div>
        <button
          className="icon-chip px-2 py-1 rounded-[--radius-md]"
          onClick={() => goToMonth(1)}
          aria-label="Next month"
        >
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 text-[10px] opacity-80 mb-1">
        {["S", "M", "T", "W", "T", "F", "S"].map((label, index) => (
          <div key={`${label}-${index}`} className="text-center">
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d) => {
          const out = !isSameMonth(d, visibleMonth);
          const selected = isSameDay(d, selectedDate);
          const iso = d.toISOString().slice(0, 10);
          const dayEvents = events[iso];
          const status = determineDayStatus(dayEvents);
          const visualStyle = !selected && !out ? DAY_VISUAL_STYLES[status] : undefined;
          return (
            <button
              key={d.toISOString()}
              onClick={() => {
                setSelectedDate(d);
                onSelectDate?.(d);
              }}
              className={[
                "h-7 rounded-[--radius-sm] text-[11px] border",
                out ? "opacity-50" : "",
                selected
                  ? "border-[--color-primary] bg-[--color-card]"
                  : "hover:bg-[rgba(18,13,10,.06)]",
              ].join(" ")}
              aria-label={format(d, "PPP")}
              aria-pressed={selected}
              style={selected ? undefined : visualStyle}
            >
              <span className="flex items-center gap-1">
                {isToday(d) ? <span className="px-1 rounded icon-chip">•</span> : d.getDate()}
              </span>
              {(() => {
                const statusDot = STATUS_PRIORITY.find((s) => dayEvents?.[s]);
                if (!statusDot) return null;
                return (
                  <span
                    className="mt-[1px] block h-1 w-1 rounded-full"
                    style={{ background: STATUS_DOTS[statusDot] || "var(--color-primary)" }}
                  />
                );
              })()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
