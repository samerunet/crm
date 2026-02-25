'use client';

import { useEffect, useMemo, useRef } from 'react';

import { useBooking } from '@/components/ui/booking-provider';

type Props = {
  serviceTitle?: string;
  serviceId?: string;
};

export default function BookClient({ serviceTitle, serviceId }: Props) {
  const booking = useBooking();
  const openedRef = useRef(false);

  const service = useMemo(() => {
    const title = (serviceTitle || '').trim();
    if (!title) return undefined;
    const id = (serviceId || title).trim();
    return { id, title };
  }, [serviceTitle, serviceId]);

  useEffect(() => {
    if (openedRef.current) return;
    openedRef.current = true;
    booking.open(service);
  }, [booking, service]);

  return (
    <main className="f-container py-10">
      <div className="glass specular rounded-2xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Book now</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The booking form should open automatically. If it does not, use the button below.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => booking.open(service)}
            className="h-10 rounded-lg bg-primary px-4 text-sm text-primary-foreground"
          >
            Open booking form
          </button>
          {service?.title ? (
            <span className="text-xs text-muted-foreground">Service: {service.title}</span>
          ) : null}
        </div>
      </div>
    </main>
  );
}
