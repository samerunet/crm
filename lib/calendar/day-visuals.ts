import { AppointmentStatusEnum } from "@/lib/api";

export type DayVisualStatus = "open" | "tentative" | "booked";

type DayVisualMetrics = {
  backgroundColor: string;
  borderColor: string;
};

export const DAY_VISUAL_STYLES: Record<DayVisualStatus, DayVisualMetrics> = {
  booked: {
    backgroundColor: "color-mix(in srgb, var(--sage) 28%, transparent)",
    borderColor: "color-mix(in srgb, var(--sage) 60%, transparent)",
  },
  tentative: {
    backgroundColor: "color-mix(in srgb, var(--amber) 32%, transparent)",
    borderColor: "color-mix(in srgb, var(--amber) 55%, transparent)",
  },
  open: {
    backgroundColor: "color-mix(in srgb, var(--destructive) 18%, transparent)",
    borderColor: "color-mix(in srgb, var(--destructive) 45%, transparent)",
  },
};

export function determineDayStatus(
  events?: Partial<Record<AppointmentStatusEnum, number>>,
): DayVisualStatus {
  if (!events) return "open";
  const confirmed = (events[AppointmentStatusEnum.CONFIRMED] ?? 0) + (events[AppointmentStatusEnum.COMPLETED] ?? 0);
  if (confirmed > 0) return "booked";
  if ((events[AppointmentStatusEnum.TENTATIVE] ?? 0) > 0) return "tentative";
  return "open";
}
