"use client";

import { create } from "zustand";
import { addMonths, subMonths, startOfToday } from "date-fns";

type Tab = "leads" | "calendar" | "analytics";

/* eslint-disable no-unused-vars */
type UIState = {
  activeTab: Tab;
  visibleMonth: Date;
  selectedDate: Date;
  mobileSidebarOpen: boolean;
  setActiveTab: (_tab: Tab) => void;
  goPrevMonth: () => void;
  goNextMonth: () => void;
  goToday: () => void;
  setSelectedDate: (_date: Date) => void;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
};
/* eslint-enable no-unused-vars */

export const useUiStore = create<UIState>((set) => {
  const today = startOfToday();
  return {
    activeTab: "leads",
    visibleMonth: today,
    selectedDate: today,
    mobileSidebarOpen: false,
    setActiveTab: (t) => set({ activeTab: t }),
    goPrevMonth: () => set((s) => ({ visibleMonth: subMonths(s.visibleMonth, 1) })),
    goNextMonth: () => set((s) => ({ visibleMonth: addMonths(s.visibleMonth, 1) })),
    goToday: () => set({ visibleMonth: today, selectedDate: today }),
    setSelectedDate: (d) => set({ selectedDate: d }),
    openSidebar: () => set({ mobileSidebarOpen: true }),
    closeSidebar: () => set({ mobileSidebarOpen: false }),
    toggleSidebar: () => set((s) => ({ mobileSidebarOpen: !s.mobileSidebarOpen })),
  };
});
