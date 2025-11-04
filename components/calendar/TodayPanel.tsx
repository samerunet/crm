"use client";

import { Appointment, AppointmentStatusEnum } from "@/lib/api";

const STATUS_COLORS: Record<string, string> = {
  [AppointmentStatusEnum.TENTATIVE]: "var(--amber)",
  [AppointmentStatusEnum.CONFIRMED]: "var(--teal)",
  [AppointmentStatusEnum.COMPLETED]: "var(--sage)",
  [AppointmentStatusEnum.CANCELED]: "var(--destructive)",
};

type TodayPanelProps = {
  appointments: Appointment[];
  onCreate?: () => void;
};

export default function TodayPanel({ appointments, onCreate }: TodayPanelProps) {
  return (
    <div className="glass rounded-[--radius-xl] border border-[--color-border]/60">
      <header className="border-b border-[--color-border]/40 px-4 py-3 font-medium text-[--color-foreground]">
        Today
      </header>
      <ul className="space-y-3 px-4 py-3">
        {appointments.length === 0 ? (
          <li className="text-sm text-[--color-muted-foreground]">
            No events scheduled.
          </li>
        ) : (
          appointments.map((event) => (
            <li key={event.id} className="flex items-start gap-3">
              <span
                className="mt-2 inline-flex h-2 w-2 rounded-full"
                style={{ background: STATUS_COLORS[event.status] ?? "var(--color-primary)" }}
                aria-hidden="true"
              />
              <div className="space-y-1 text-sm">
                <div className="font-medium text-[--color-foreground]">{event.title}</div>
                <div className="text-xs text-[--color-muted-foreground]">
                  {new Date(event.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  {event.location ? ` • ${event.location}` : ""}
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
      <footer className="border-t border-[--color-border]/40 px-4 py-3">
        <button
          type="button"
          onClick={onCreate}
          className="gbtn w-full rounded-[--radius-lg] px-3 py-2 text-sm"
        >
          Create event
        </button>
      </footer>
    </div>
  );
}
