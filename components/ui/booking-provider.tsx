'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import BookingModal from './booking-modal';

type Service = { id: string; title: string } | null;

type BookingContextType = {
  open: (service?: Service) => void;
  close: () => void;
};

const BookingContext = createContext<BookingContextType | null>(null);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [service, setService] = useState<Service>(null);

  const api = useMemo<BookingContextType>(
    () => ({
      open: (svc?: Service) => {
        if (svc) setService(svc);
        setIsOpen(true);
      },
      close: () => {
        setIsOpen(false);
        setService(null); // reset so each session starts clean
      },
    }),
    [],
  );

  return (
    <BookingContext.Provider value={api}>
      {children}
      <BookingModal open={isOpen} onClose={api.close} service={service ?? undefined} />
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking must be used within <BookingProvider />');
  return ctx;
}
