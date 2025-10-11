// components/admin/ProgressStepper.tsx
// Horizontal stepper with checkmarks
'use client';
import React from 'react';
import type { LeadStage } from './types';

const STEPS: LeadStage[] = ['contacted','deposit','trial','booked','confirmed','changes','completed'];

export default function ProgressStepper({ current }: { current: LeadStage }) {
  const idx = Math.max(0, STEPS.indexOf(current));
  return (
    <div className="flex items-center gap-2 overflow-x-auto">
      {STEPS.map((s, i) => {
        const done = i <= idx;
        return (
          <div key={s} className="flex items-center gap-2">
            <div className={`h-7 min-w-7 w-7 rounded-full flex items-center justify-center text-xs
              ${done ? 'bg-[color:var(--sage,#008767)] text-white' : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300'}
            `}>
              {done ? '✓' : i+1}
            </div>
            <div className="text-xs font-medium capitalize">{s}</div>
            {i < STEPS.length - 1 && <div className="w-6 h-[2px] bg-neutral-200 dark:bg-neutral-700 mx-1" />}
          </div>
        );
      })}
    </div>
  );
}
