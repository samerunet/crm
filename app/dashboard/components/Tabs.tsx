// FILE: app/dashboard/components/Tabs.tsx
'use client';
import React from 'react';

export default function Tabs({
  tabs,
  current,
  onChange,
}: {
  tabs: { key: string; label: string; badge?: number }[];
  current: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-border bg-popover p-1 w-full sm:w-auto overflow-x-auto">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={[
            'h-9 px-3 rounded-full text-sm whitespace-nowrap flex items-center gap-2',
            current === t.key ? 'bg-primary text-primary-foreground' : 'hover:bg-accent/20',
          ].join(' ')}
        >
          <span>{t.label}</span>
          {typeof t.badge === 'number' && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-background/60 border border-border">
              {t.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
