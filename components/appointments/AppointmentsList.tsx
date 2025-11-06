"use client";

import { format } from "date-fns";
import { Appointment, AppointmentStatusEnum } from "@/lib/api";

const STATUS_LABELS: Record<string, string> = {
  [AppointmentStatusEnum.TENTATIVE]: "Tentative",
  [AppointmentStatusEnum.CONFIRMED]: "Confirmed",
  [AppointmentStatusEnum.COMPLETED]: "Completed",
  [AppointmentStatusEnum.CANCELED]: "Canceled",
};

const STATUS_STYLES: Record<string, { background: string; color: string }> = {
  [AppointmentStatusEnum.TENTATIVE]: { background: "rgba(180, 83, 9, 0.22)", color: "var(--foreground)" },
  [AppointmentStatusEnum.CONFIRMED]: { background: "rgba(108, 58, 34, 0.22)", color: "var(--primary-foreground)" },
  [AppointmentStatusEnum.COMPLETED]: { background: "rgba(0, 135, 103, 0.22)", color: "var(--foreground)" },
  [AppointmentStatusEnum.CANCELED]: { background: "rgba(122, 48, 34, 0.22)", color: "var(--foreground)" },
};

type AppointmentsListProps = {
  appointments: Appointment[];
};

export default function AppointmentsList({ appointments }: AppointmentsListProps) {
  return (
    <div className="glass-strong rounded-[calc(var(--radius)+12px)] border border-[--color-border]/50 shadow-[0_20px_48px_rgba(18,13,10,0.18)]">
      <header className="flex items-center justify-between gap-3 border-b border-[--color-border]/40 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-[--color-muted-foreground]">
        <span>Appointments</span>
        <span className="icon-chip rounded-md px-2 py-1 text-xs">{appointments.length}</span>
      </header>
      {appointments.length === 0 ? (
        <div className="px-4 py-6 text-sm text-[--color-muted-foreground]">No appointments scheduled.</div>
      ) : (
        <ul className="divide-y divide-[--color-border]/20">
          {appointments.map((appointment) => {
            const start = new Date(appointment.start);
            const end = appointment.end ? new Date(appointment.end) : null;
            const status = appointment.status ?? AppointmentStatusEnum.TENTATIVE;
            return (
              <li key={appointment.id} className="px-4 py-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-medium text-[--color-foreground]">{appointment.title}</div>
                  <span
                    className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium"
                    style={STATUS_STYLES[status] ?? { background: "rgba(18,13,10,0.12)", color: "var(--foreground)" }}
                  >
                    {STATUS_LABELS[status] ?? status}
                  </span>
                </div>
                <div className="mt-1 text-xs text-[--color-muted-foreground]">
                  {format(start, "MMM d, yyyy • p")}
                  {end ? ` – ${format(end, "p")}` : ""}
                  {appointment.location ? ` • ${appointment.location}` : ""}
                </div>
                {appointment.lead?.name ? (
                  <div className="mt-1 text-xs text-[--color-muted-foreground]">Lead: {appointment.lead.name}</div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
