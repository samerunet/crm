// components/admin/FiltersBar.tsx
// Today / WTD / MTD / All tabs → emits a DateRange
'use client';
import React from 'react';
import { startOfToday, startOfWeek, startOfMonth, endOfToday } from 'date-fns';
import type { DateRange } from './types';

export default function FiltersBar({ value, onChange }: {
  value: DateRange['label'];
  onChange: (range: DateRange) => void;
}) {
  const makeRange = (label: DateRange['label']): DateRange => {
    if (label === 'All') return { label };
    if (label === 'Today') return { label, start: startOfToday(), end: endOfToday() };
    if (label === 'WTD') return { label, start: startOfWeek(new Date(), { weekStartsOn: 1 }), end: endOfToday() };
    return { label: 'MTD', start: startOfMonth(new Date()), end: endOfToday() };
  };

  const tabs: DateRange['label'][] = ['Today', 'WTD', 'MTD', 'All'];
  return (
    <div className="flex gap-2">
      {tabs.map(t => (
        <button
          key={t}
          onClick={() => onChange(makeRange(t))}
          className={`px-3 py-1.5 rounded-full border text-sm
          ${value === t ? 'bg-[color:var(--espresso,#2C1B12)] text-white' : 'bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800'}`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
