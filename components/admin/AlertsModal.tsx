// components/admin/AlertsModal.tsx
'use client';
import React, { useMemo } from 'react';
import type { Lead } from './types';

type Kind = 'overdue' | 'unsigned';

export default function AlertsModal({
  open,
  kind,
  leads,
  onClose,
  onSelectLead,
}: {
  open: boolean;
  kind: Kind;
  leads: Lead[];
  onClose: () => void;
  onSelectLead: (lead: Lead) => void;
}) {
  const rows = useMemo(() => {
    if (!open) return [];

    if (kind === 'overdue') {
      const now = Date.now();
      type Row = {
        type: 'invoice';
        lead: Lead;
        id: string;
        number?: string;
        dueAt?: Date;
        total: number;
        paid: number;
        balance: number;
        daysOverdue: number;
      };
      const out: Row[] = [];
      for (const lead of leads ?? []) {
        for (const inv of lead.invoices ?? []) {
          const dueMs = inv?.dueAt ? new Date(inv.dueAt).getTime() : NaN;
          const isPaid = inv?.status === 'paid';
          const overdue =
            inv?.status === 'overdue' ||
            (!isPaid && Number.isFinite(dueMs) && dueMs < now);
          if (!overdue) continue;

          const paid = (inv.payments ?? []).reduce(
            (a, p) => a + (Number(p.amount) || 0),
            0
          );
          const total = Number(inv.total) || (inv.lines ?? []).reduce((a, l) => a + (Number(l.amount) || 0), 0);
          const balance = Math.max(0, total - paid);
          const daysOverdue = Number.isFinite(dueMs)
            ? Math.max(1, Math.ceil((now - dueMs) / (1000 * 60 * 60 * 24)))
            : 0;

          out.push({
            type: 'invoice',
            lead,
            id: inv.id,
            number: inv.number,
            dueAt: inv.dueAt ? new Date(inv.dueAt) : undefined,
            total,
            paid,
            balance,
            daysOverdue,
          });
        }
      }
      // most overdue first
      out.sort((a, b) => b.daysOverdue - a.daysOverdue);
      return out;
    }

    // kind === 'unsigned'
    type Row = {
      type: 'contract';
      lead: Lead;
      id: string;
      template?: string;
      status: string;
      sentAt?: Date;
    };
    const out2: Row[] = [];
    for (const lead of leads ?? []) {
      for (const c of lead.contracts ?? []) {
        const isWedding = (c.template || '').startsWith('wedding_');
        if (!isWedding || c.status === 'signed') continue;
        out2.push({
          type: 'contract',
          lead,
          id: c.id,
          template: c.template,
          status: c.status,
          sentAt: c.sentAt ? new Date(c.sentAt) : undefined,
        });
      }
    }
    return out2;
  }, [open, kind, leads]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Panel */}
      <div className="relative w-[95vw] sm:w-[640px] max-h-[85vh] overflow-hidden rounded-2xl border border-border bg-card shadow-xl glass-2 specular">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="font-semibold">
            {kind === 'overdue' ? 'Overdue invoices' : 'Unsigned wedding contracts'}
          </div>
          <button
            onClick={onClose}
            className="h-8 px-3 rounded-lg border border-border bg-popover hover:bg-accent/20 text-sm"
          >
            Close
          </button>
        </div>

        {/* List */}
        <div className="overflow-auto max-h-[70vh] divide-y divide-border/60">
          {rows.length === 0 && (
            <div className="p-4 text-sm text-muted-foreground">
              No items to show.
            </div>
          )}

          {kind === 'overdue' &&
            rows.map((r: any) => (
              <button
                key={r.id}
                onClick={() => onSelectLead(r.lead)}
                className="w-full text-left p-3 hover:bg-accent/10"
                title="Open client"
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium">{r.lead.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {r.daysOverdue}d overdue
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {r.number ? `${r.number} • ` : ''}
                  Due {r.dueAt ? r.dueAt.toLocaleDateString() : '—'}
                  {' • '}
                  Total {fmtUSD(r.total)} · Paid {fmtUSD(r.paid)} · Balance{' '}
                  {fmtUSD(r.balance)}
                </div>
              </button>
            ))}

          {kind === 'unsigned' &&
            rows.map((r: any) => (
              <button
                key={r.id}
                onClick={() => onSelectLead(r.lead)}
                className="w-full text-left p-3 hover:bg-accent/10"
                title="Open client"
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium">{r.lead.name}</div>
                  <div className="text-xs text-muted-foreground capitalize">
                    {r.status}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Template: {r.template || '—'}
                  {r.sentAt ? ` • Sent ${r.sentAt.toLocaleDateString()}` : ''}
                </div>
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}

function fmtUSD(n: number) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(n) ? n : 0);
}
