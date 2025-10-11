'use client';
import React from 'react';
import type { LeadStage } from './types';

export type ServiceFilter = 'All' | 'weddings' | 'tutorial' | 'events' | 'trial';

export default function StageFilterBar({
  stages,
  selected,
  onChange,
  serviceFilter,
  onServiceChange,
  uncontactedOnly,
  uncontactedCount,
  onToggleUncontacted,
}: {
  stages: LeadStage[];
  selected: LeadStage | 'All';
  onChange: (s: LeadStage | 'All') => void;
  serviceFilter: ServiceFilter;
  onServiceChange: (s: ServiceFilter) => void;
  uncontactedOnly: boolean;
  uncontactedCount: number;
  onToggleUncontacted: () => void;
}) {
  const stageOptions = ['All', ...stages] as (LeadStage | 'All')[];
  const tabs: ServiceFilter[] = ['All', 'weddings', 'tutorial', 'events', 'trial'];

  return (
    <div className="w-full flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Stage dropdown */}
      <div className="w-full sm:w-auto">
        <select
          className="h-11 w-full sm:w-52 rounded-xl border border-input bg-popover text-foreground px-3 pr-8 appearance-none"
          style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
          value={selected}
          onChange={(e) => onChange(e.target.value as any)}
          aria-label="Filter by stage"
        >
          {stageOptions.map((s) => (
            <option key={s} value={s}>
              {String(s)}
            </option>
          ))}
        </select>
      </div>

      {/* Right side: tabs + uncontacted
          - mobile: stack (tabs row, then toggle)
          - desktop: inline */}
      <div className="w-full sm:w-auto flex flex-col gap-2 sm:flex-row sm:items-center">
        {/* Scrollable tabs strip (no negative margins) */}
        <div className="w-full sm:w-auto">
          <div
            className="flex items-center gap-1 rounded-full border border-border bg-popover p-1
                       overflow-x-auto whitespace-nowrap snap-x snap-mandatory max-w-full"
            role="tablist"
            aria-label="Filter by service type"
          >
            {tabs.map((t) => {
              const active = serviceFilter === t;
              return (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-label={t}
                  onClick={() => onServiceChange(t)}
                  className={[
                    'h-9 px-3 rounded-full text-sm capitalize snap-start transition shrink-0',
                    'focus:outline-none focus:ring-2 focus:ring-ring',
                    active
                      ? 'bg-primary text-primary-foreground shadow'
                      : 'bg-transparent text-foreground hover:bg-accent/20',
                  ].join(' ')}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        {/* Uncontacted toggle */}
        <div className="w-full sm:w-auto">
          <button
            type="button"
            onClick={onToggleUncontacted}
            className={[
              'h-9 px-3 w-full sm:w-auto rounded-full border text-sm flex items-center justify-between sm:justify-start gap-2 transition',
              'focus:outline-none focus:ring-2 focus:ring-ring',
              uncontactedOnly
                ? 'border-[color:var(--sage,#008767)] bg-[color:var(--sage,#008767)]/18 text-[color:var(--sage,#008767)]'
                : 'border-border bg-popover text-foreground hover:bg-accent/20',
            ].join(' ')}
            aria-pressed={uncontactedOnly}
            title="Show only uncontacted leads"
          >
            <span>Uncontacted</span>
            <span
              className={[
                'min-w-[1.25rem] h-5 px-2 rounded-full text-xs font-medium flex items-center justify-center',
                uncontactedOnly
                  ? 'bg-[color:var(--sage,#008767)] text-white'
                  : 'bg-muted text-muted-foreground',
              ].join(' ')}
            >
              {uncontactedCount}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
