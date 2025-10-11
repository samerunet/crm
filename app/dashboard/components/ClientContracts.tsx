// FILE: app/dashboard/components/ClientContracts.tsx
'use client';
import React, { useState } from 'react';
import type { Lead, Contract } from "@/components/admin/types";
import EsignModal from "@/components/admin/EsignModal";

export default function ClientContracts({
  lead,
  contracts,
  onUpdateContract,
}: {
  lead: Lead;
  contracts: Contract[];
  onUpdateContract: (updated: Contract) => void;
}) {
  const latest = contracts?.[0];

  const [open, setOpen] = useState(false);

  if (!latest) {
    return <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">No contracts yet.</div>;
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Your Contract</div>
        <div className="text-xs capitalize opacity-80">{latest.status}</div>
      </div>
      <div className="text-xs mt-1">
        Total: <strong>${(latest.totalAmount||0).toFixed(0)}</strong> • Deposit: <strong>${(latest.depositAmount||0).toFixed(0)}</strong>
      </div>

      <div className="prose prose-sm max-w-none bg-white text-black p-4 rounded-lg mt-3"
        dangerouslySetInnerHTML={{ __html: latest.body || '<p>No body</p>' }} />

      {latest.status !== 'signed' && (
        <div className="mt-3 flex items-center gap-2">
          <button className="h-9 px-3 rounded-lg bg-primary text-primary-foreground" onClick={()=>setOpen(true)}>Review & Sign</button>
          {latest.url && (
            <a href={latest.url} className="h-9 px-3 rounded-lg border border-border hover:bg-accent/20" target="_blank" rel="noreferrer">Open sign link</a>
          )}
        </div>
      )}

      {open && (
        <EsignModal
          open={open}
          lead={lead}
          contract={latest}
          onClose={()=>setOpen(false)}
          onSigned={(c)=>{ onUpdateContract(c); setOpen(false); }}
        />
      )}
    </div>
  );
}
