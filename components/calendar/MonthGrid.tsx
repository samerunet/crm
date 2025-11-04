"use client";

import { getMonthGrid, isSameDay, isSameMonth } from "@/lib/calendar/date";
import { AppointmentStatusEnum, type Appointment, type AppointmentStatus } from "@/lib/api";
import { DAY_VISUAL_STYLES, determineDayStatus } from "@/lib/calendar/day-visuals";
import { format, isToday } from "date-fns";
import { useCalendarContext } from "./CalendarContext";

export type EventDensity = Record<string, Partial<Record<AppointmentStatus, number>>>;

const STATUS_DOTS: Record<AppointmentStatus, string> = {
  [AppointmentStatusEnum.TENTATIVE]: "var(--amber)",
  [AppointmentStatusEnum.CONFIRMED]: "var(--color-primary)",
  [AppointmentStatusEnum.COMPLETED]: "var(--sage)",
  [AppointmentStatusEnum.CANCELED]: "var(--destructive)",
};

const APPOINTMENT_BG: Record<AppointmentStatus, string> = {
  [AppointmentStatusEnum.TENTATIVE]: "color-mix(in srgb, var(--amber) 35%, transparent)",
  [AppointmentStatusEnum.CONFIRMED]: "color-mix(in srgb, var(--sage) 40%, transparent)",
  [AppointmentStatusEnum.COMPLETED]: "color-mix(in srgb, var(--sage) 25%, transparent)",
  [AppointmentStatusEnum.CANCELED]: "color-mix(in srgb, var(--destructive) 35%, transparent)",
};

const APPOINTMENT_BORDER: Record<AppointmentStatus, string> = {
  [AppointmentStatusEnum.TENTATIVE]: "color-mix(in srgb, var(--amber) 65%, transparent)",
  [AppointmentStatusEnum.CONFIRMED]: "color-mix(in srgb, var(--sage) 65%, transparent)",
  [AppointmentStatusEnum.COMPLETED]: "color-mix(in srgb, var(--sage) 50%, transparent)",
  [AppointmentStatusEnum.CANCELED]: "color-mix(in srgb, var(--destructive) 70%, transparent)",
};

type MonthGridProps = {
  events?: EventDensity;
  appointmentsByDay?: Record<string, Appointment[]>;
  onSelectDate?: (date: Date) => void;
};

export default function MonthGrid({ events = {}, appointmentsByDay = {}, onSelectDate }: MonthGridProps) {
  const { visibleMonth, selectedDate, setSelectedDate } = useCalendarContext();
  const days = getMonthGrid(visibleMonth);

  return (
    <div role="grid" aria-label="Calendar month grid" className="glass rounded-[--radius-xl] p-2">
      <div className="grid grid-cols-7 text-xs opacity-80 px-2 pb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((label) => (
          <div key={label} className="text-center">
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1" role="rowgroup">
        {days.map((date) => {
          const outOfMonth = !isSameMonth(date, visibleMonth);
          const selected = isSameDay(date, selectedDate);
          const today = isToday(date);
          const iso = format(date, "yyyy-MM-dd");
          const dayEvents = events[iso] ?? {};
          const dayStatus = determineDayStatus(dayEvents);
          const visualStyle = !selected && !outOfMonth ? DAY_VISUAL_STYLES[dayStatus] : undefined;
          const appointments = appointmentsByDay[iso] ?? [];
          const visibleAppointments = appointments.slice(0, 2);

          return (
            <button
              key={iso}
              type="button"
              onClick={() => {
                setSelectedDate(date);
                onSelectDate?.(date);
              }}
              className={[
                "relative flex h-24 flex-col rounded-[--radius-md] border px-2 py-1.5 text-left text-xs transition sm:h-28",
                outOfMonth ? "opacity-60" : "",
                selected
                  ? "border-[--color-primary] bg-[--color-card] text-[--color-foreground]"
                  : "hover:bg-[rgba(18,13,10,0.06)]",
              ].join(" ")}
              aria-pressed={selected}
              style={selected ? undefined : visualStyle}
            >
              <div className="flex items-center justify-between text-xs font-semibold">
                <span>
                  {today ? "Today" : format(date, selected ? "MMM d" : "d")}
                </span>
                <span className="flex gap-1">
                  {Object.entries(dayEvents)
                    .filter(([, count]) => (count ?? 0) > 0)
                    .slice(0, 3)
                    .map(([status], index) => (
                      <span
                        key={`${iso}-status-${status}-${index}`}
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: STATUS_DOTS[status as AppointmentStatus] || "var(--color-primary)" }}
                      />
                    ))}
                </span>
              </div>

              <div className="mt-1 flex-1 space-y-1 overflow-hidden">
                {visibleAppointments.map((appointment) => {
                  const startTime = new Date(appointment.start);
                  const label = Number.isNaN(startTime.getTime()) ? "" : format(startTime, "p");
                  const status = appointment.status ?? AppointmentStatusEnum.TENTATIVE;

                  return (
                    <div
                      key={appointment.id}
                      className="rounded-[--radius-sm] px-2 py-1 text-[10px] leading-tight"
                      style={{
                        background: APPOINTMENT_BG[status],
                        border: `1px solid ${APPOINTMENT_BORDER[status]}`,
                      }}
                    >
                      <div className="truncate font-medium text-[--color-foreground]">
                        {appointment.title || "Untitled"}
                      </div>
                      <div className="text-[10px] text-[--color-muted-foreground]">
                        {label}
                        {appointment.location ? ` • ${appointment.location}` : ""}
                      </div>
                    </div>
                  );
                })}
                {appointments.length > visibleAppointments.length ? (
                  <div className="text-[10px] text-[--color-muted-foreground]">
                    +{appointments.length - visibleAppointments.length} more
                  </div>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
