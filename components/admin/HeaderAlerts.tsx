// components/admin/HeaderAlerts.tsx
'use client';
import React, { useMemo } from 'react';
import type { Lead } from './types';

export default function HeaderAlerts({
  leads,
  onOpenOverdue,
  onOpenUnsigned,
}: {
  leads: Lead[];
  onOpenOverdue?: () => void;
  onOpenUnsigned?: () => void;
}) {
  const now = Date.now();

  const { overdue, unsigned } = useMemo(() => {
    let overdue = 0;
    let unsigned = 0;
    for (const l of leads ?? []) {
      for (const inv of l.invoices ?? []) {
        const dueMs = inv?.dueAt ? new Date(inv.dueAt).getTime() : NaN;
        const isPaid = inv?.status === 'paid';
        const isOverdue =
          inv?.status === 'overdue' ||
          (!isPaid && Number.isFinite(dueMs) && dueMs < now);
        if (isOverdue) overdue++;
      }
      for (const c of l.contracts ?? []) {
        const isWedding = (c.template || '').startsWith('wedding_');
        if (isWedding && c.status !== 'signed') unsigned++;
      }
    }
    return { overdue, unsigned };
  }, [leads, now]);

  const pillBase =
    'flex items-center gap-2 rounded-xl border border-border bg-popover px-3 py-2';
  const badgeBase =
    'inline-flex h-5 min-w-[20px] px-2 items-center justify-center rounded-full text-xs font-semibold';

  const overdueBadge =
    overdue > 0
      ? 'bg-destructive text-destructive-foreground'
      : 'bg-muted text-muted-foreground';
  const unsignedBadge =
    unsigned > 0
      ? 'bg-accent text-accent-foreground'
      : 'bg-muted text-muted-foreground';

  return (
    <div className="w-full flex flex-col sm:flex-row gap-2" aria-label="Alerts" role="status">
      {/* Overdue invoices — clickable */}
      <button
        type="button"
        onClick={onOpenOverdue}
        className={pillBase + ' text-left hover:bg-accent/20 transition'}
        title="View overdue invoices"
      >
        <span className={`${badgeBase} ${overdueBadge}`}>{overdue}</span>
        <span className="text-sm">Overdue invoices</span>
      </button>

      {/* Unsigned wedding contracts — clickable */}
      <button
        type="button"
        onClick={onOpenUnsigned}
        className={pillBase + ' text-left hover:bg-accent/20 transition'}
        title="View unsigned wedding contracts"
      >
        <span className={`${badgeBase} ${unsignedBadge}`}>{unsigned}</span>
        <span className="text-sm">Unsigned wedding contracts</span>
      </button>
    </div>
  );
}
