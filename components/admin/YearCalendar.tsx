// components/admin/YearCalendar.tsx
// Year view with green dots on booked days, plus category dot (guide/service/both)
'use client';
import React, { useMemo } from 'react';
import {
  startOfYear, endOfYear, eachMonthOfInterval, startOfMonth, endOfMonth,
  eachDayOfInterval, isSameMonth, isSameDay, format, isWithinInterval
} from 'date-fns';
import type { Appointment, Lead, Sale, DateRange } from './types';
import { CATEGORY_DOT } from './theme';

type Props = {
  year?: number;
  events: Appointment[];
  leads: Lead[];
  sales: Sale[]; // for guide dots
  range?: DateRange; // to dim outside range
  onDayClick?: (date: Date) => void;
};

export default function YearCalendar({ year = new Date().getFullYear(), events, leads, sales, range, onDayClick }: Props) {
  const months = eachMonthOfInterval({ start: startOfYear(new Date(year, 0, 1)), end: endOfYear(new Date(year, 11, 31)) });

  // preindex: map day -> info
  const dayMap = useMemo(() => {
    const map = new Map<string, { booked: boolean; categories: Set<'guide'|'service'|'both'> }>();
    for (const e of events) {
      if (!e.start) continue;
      const key = format(e.start, 'yyyy-MM-dd');
      const m = map.get(key) ?? { booked: false, categories: new Set() };
      if (e.status === 'booked' || e.status === 'completed') m.booked = true;
      // category from lead
      const lead = e.leadId ? leads.find(l => l.id === e.leadId) : undefined;
      if (lead?.category) m.categories.add(lead.category === 'both' ? 'both' : 'service');
      map.set(key, m);
    }
    for (const s of sales) {
      const key = format(s.date, 'yyyy-MM-dd');
      const m = map.get(key) ?? { booked: false, categories: new Set() };
      if (s.type === 'guide') m.categories.add('guide');
      map.set(key, m);
    }
    return map;
  }, [events, leads, sales]);

  const inRange = (d: Date) =>
    !range?.start || !range?.end ? true : isWithinInterval(d, { start: range.start, end: range.end! });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {months.map((m) => {
        const days = eachDayOfInterval({ start: startOfMonth(m), end: endOfMonth(m) });
        const monthName = format(m, 'MMMM');
        const firstDayIdx = Number(format(startOfMonth(m), 'i')); // 1..7 (Mon..Sun)
        // pad to Monday-first 7-col grid
        const pads = Array.from({ length: (firstDayIdx + 6) % 7 });

        return (
          <div key={monthName} className="rounded-2xl shadow bg-white dark:bg-neutral-900 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">{monthName}</div>
              <div className="text-xs text-neutral-500">{format(m, 'yyyy')}</div>
            </div>
            <div className="grid grid-cols-7 text-[11px] text-neutral-500 mb-1">
              {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => <div key={d} className="text-center py-1">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {pads.map((_,i)=><div key={`pad-${i}`} />)}
              {days.map((d) => {
                const key = format(d, 'yyyy-MM-dd');
                const info = dayMap.get(key);
                const dim = !inRange(d);
                return (
                  <button
                    key={key}
                    onClick={() => onDayClick?.(d)}
                    className={`h-10 sm:h-12 rounded-md border text-xs flex flex-col items-center justify-center
                      ${dim ? 'opacity-40' : ''}
                      ${isSameMonth(d, m) ? 'bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800' : 'opacity-60'}
                    `}
                    title={format(d, 'PPPP')}
                  >
                    <span className="text-[12px]">{format(d, 'd')}</span>
                    {/* main booked dot (green-ish) */}
                    <span className={`mt-0.5 h-1.5 w-1.5 rounded-full ${info?.booked ? 'bg-[color:var(--sage,#008767)]' : 'bg-transparent'}`} />
                    {/* category dot (guide/service/both) */}
                    {info?.categories.size ? (
                      <span className={`mt-0.5 h-1.5 w-1.5 rounded-full ${
                        CATEGORY_DOT[info.categories.has('both') ? 'both' :
                          info.categories.has('guide') && !info.categories.has('service') ? 'guide' : 'service'
                        ]
                      }`} />
                    ) : <span className="mt-0.5 h-1.5 w-1.5" />}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
