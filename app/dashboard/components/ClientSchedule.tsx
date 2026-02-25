// FILE: app/dashboard/components/ClientSchedule.tsx
'use client';
import React from 'react';
import type { Appointment } from "@/components/admin/types";
import { useBooking } from '@/components/ui/booking-provider';

export default function ClientSchedule({ events }: { events: Appointment[] }) {
  const booking = useBooking();

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm font-semibold">Upcoming Appointments</div>
        <button
          type="button"
          onClick={() => booking.open()}
          className="h-9 rounded-lg bg-primary px-3 text-sm text-primary-foreground"
        >
          Book appointment
        </button>
      </div>
      <div className="divide-y divide-border/60">
        {(events||[]).length ? (events||[]).map(e => {
          const location =
            typeof e.location === 'string'
              ? e.location
              : e.location
              ? [e.location.city, e.location.state].filter(Boolean).join(', ')
              : '';
          return (
            <div key={e.id} className="py-2">
              <div className="flex items-center justify-between text-sm">
                <div className="font-medium">{e.title || 'Service'}</div>
                <div className="text-xs opacity-80">{e.status || 'booked'}</div>
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(e.start as any).toLocaleString()} — {new Date(e.end as any).toLocaleTimeString()}
              </div>
              {location ? <div className="text-xs">{location}</div> : null}
            </div>
          );
        }) : <div className="text-sm text-muted-foreground">No upcoming appointments.</div>}
      </div>
    </div>
  );
}
