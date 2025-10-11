// components/BigCalendar.tsx
// Selectable calendar + event click with event styling hook
'use client';
import React from 'react';
import { Calendar, dateFnsLocalizer, SlotInfo } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import type { Appointment } from './types';

const locales = { 'en-US': enUS } as const;
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

export default function BigCalendar({
  events,
  onCreateAt,
  onOpenEvent,
  eventStyle,
}: {
  events: Appointment[];
  onCreateAt: (slotStart: Date) => void;
  onOpenEvent: (appt: Appointment) => void;
  eventStyle?: (e: Appointment) => React.CSSProperties | undefined;
}) {
  return (
    <div className="rounded-2xl shadow p-3 bg-white dark:bg-neutral-900">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        defaultView="week"
        style={{ height: 680 }}
        selectable
        onSelectSlot={(slot: SlotInfo) => {
          const start =
            Array.isArray(slot.slots) && slot.slots.length > 0
              ? new Date(slot.slots[0])
              : new Date(slot.start);
          onCreateAt(start);
        }}
        onSelectEvent={(evt) => onOpenEvent(evt as Appointment)}
        popup
        step={30}
        timeslots={2}
        eventPropGetter={(event) => ({ style: eventStyle?.(event as Appointment) })}
      />
    </div>
  );
}
