// components/ui/booking-provider.tsx
"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import BookingModal from "./booking-modal";

type Service = { id: string; title: string } | null;
type AddOn = { id: string; label: string; price?: string };

type BookingContextType = {
  open: (service?: Service, addOns?: AddOn[]) => void;
  close: () => void;
};

const BookingContext = createContext<BookingContextType | null>(null);

const DEFAULT_ADDONS: AddOn[] = [
  { id: "touchups", label: "On-site touch-ups", price: "Hourly" },
  { id: "earlystart", label: "Early start / Before 7am" },
  { id: "travel", label: "Travel / Destination" },
  { id: "airbrush", label: "Airbrush finish" },
  { id: "trial2", label: "Second trial" },
];

export function BookingProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [service, setService] = useState<Service>(null);
  const [addOns, setAddOns] = useState<AddOn[]>(DEFAULT_ADDONS);

  const api = useMemo<BookingContextType>(
    () => ({
      open: (svc?: Service, list?: AddOn[]) => {
        if (svc) setService(svc);
        if (list?.length) setAddOns(list);
        setOpen(true);
      },
      close: () => setOpen(false),
    }),
    []
  );

  return (
    <BookingContext.Provider value={api}>
      {children}
      <BookingModal open={open} onClose={() => setOpen(false)} service={service ?? undefined} addOns={addOns} />
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within <BookingProvider />");
  return ctx;
}
