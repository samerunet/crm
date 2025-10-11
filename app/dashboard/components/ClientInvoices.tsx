// FILE: app/dashboard/components/ClientInvoices.tsx
'use client';
import React from 'react';
import type { Invoice } from "@/components/admin/types";

function fmtUSD(n?: number) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(n || 0));
}

export default function ClientInvoices({
  invoices,
  onMarkPaid,
}: {
  invoices: Invoice[];
  onMarkPaid: (invoiceId: string) => void;
}) {
  if (!invoices?.length) {
    return <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">No invoices yet.</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {invoices.map((inv) => (
        <div key={inv.id} className="rounded-xl border border-border bg-card/70 p-4 backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="font-medium">{inv.kind === 'deposit' ? 'Deposit' : 'Remaining Balance'}</div>
            <div className="text-xs uppercase opacity-80">{inv.status}</div>
          </div>
          <div className="mt-1 text-sm">Total: <strong>{fmtUSD(inv.total)}</strong></div>
          <div className="mt-1 text-xs text-muted-foreground">Due: {inv.dueAt ? new Date(inv.dueAt as any).toLocaleDateString() : '—'}</div>
          <div className="mt-3 flex items-center gap-2">
            {inv.status !== 'paid' ? (
              <button className="h-9 px-3 rounded-lg bg-primary text-primary-foreground" onClick={()=>onMarkPaid(inv.id)}>Mark Paid</button>
            ) : (
              <span className="text-xs text-green-700">Paid ✔</span>
            )}
            {inv.url && <a href={inv.url} target="_blank" rel="noreferrer" className="h-9 px-3 rounded-lg border border-border hover:bg-accent/20">Open</a>}
          </div>
        </div>
      ))}
    </div>
  );
}
