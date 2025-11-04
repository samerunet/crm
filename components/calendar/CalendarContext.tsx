"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { addMonths, startOfMonth } from "date-fns";

/* eslint-disable no-unused-vars */
export type CalendarContextValue = {
  visibleMonth: Date;
  selectedDate: Date;
  setSelectedDate: (_date: Date) => void;
  goToMonth: (_offset: number) => void;
  setVisibleMonth: (_month: Date) => void;
};
/* eslint-enable no-unused-vars */

const CalendarContext = createContext<CalendarContextValue | null>(null);

export function CalendarProvider({ children }: { children: ReactNode }) {
  const today = useMemo(() => new Date(), []);
  const [visibleMonth, setVisibleMonthState] = useState<Date>(startOfMonth(today));
  const [selectedDate, setSelectedDateState] = useState<Date>(today);

  const setVisibleMonth = (month: Date) => {
    setVisibleMonthState(startOfMonth(month));
  };

  const setSelectedDate = (date: Date) => {
    setSelectedDateState(date);
    setVisibleMonthState(startOfMonth(date));
  };

  const goToMonth = (offset: number) => {
    setVisibleMonthState((prev) => startOfMonth(addMonths(prev, offset)));
  };

  const value = useMemo<CalendarContextValue>(
    () => ({ visibleMonth, selectedDate, setSelectedDate, goToMonth, setVisibleMonth }),
    [visibleMonth, selectedDate],
  );

  return <CalendarContext.Provider value={value}>{children}</CalendarContext.Provider>;
}

export const useCalendarContext = () => {
  const ctx = useContext(CalendarContext);
  if (!ctx) throw new Error("useCalendarContext must be used within a CalendarProvider");
  return ctx;
};
