// components/admin/EsignModal.tsx
// Modal that collects clause initials + signature and marks the contract "signed"
'use client';
import React, { useMemo, useState } from 'react';
import type { Contract, Lead, EsignField } from './types';
import SignatureCanvas from './SignatureCanvas';

export default function EsignModal({
  open,
  lead,
  contract,
  onClose,
  onSigned,
}: {
  open: boolean;
  lead: Lead;
  contract: Contract;
  onClose: () => void;
  onSigned: (updated: Contract) => void;
}) {
  const requiredFields: EsignField[] = useMemo(
    () =>
      contract.esignFields?.length
        ? contract.esignFields
        : [
            { id: 'policies', type: 'initial', label: 'Policies Bookings', required: true },
            { id: 'cancellation', type: 'initial', label: 'Cancellation Policy', required: true },
            { id: 'delays', type: 'initial', label: 'Delays', required: true },
            { id: 'parking', type: 'initial', label: 'Parking Fees', required: true },
            { id: 'travel', type: 'initial', label: 'Travel Fees', required: true },
            { id: 'liability', type: 'initial', label: 'Liability', required: true },
            { id: 'payment', type: 'initial', label: 'Payment', required: true },
            { id: 'signature', type: 'signature', label: 'Client Signature', required: true },
          ],
    [contract.esignFields]
  );

  const [initials, setInitials] = useState<Record<string, string>>({});
  const [sigData, setSigData] = useState<string>('');
  const [clearCount, setClearCount] = useState(0);

  const missing = useMemo(() => {
    const out: string[] = [];
    for (const f of requiredFields) {
      if (f.type === 'initial') {
        if (f.required && !(initials[f.id]?.trim())) out.push(f.id);
      } else {
        if (f.required && !sigData) out.push(f.id);
      }
    }
    return out;
  }, [requiredFields, initials, sigData]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div className="relative w-[96vw] sm:w-[980px] max-h-[92vh] overflow-hidden rounded-2xl border border-border bg-card shadow-xl glass-2">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="font-semibold">E-Sign: {lead.name}</div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="h-9 px-3 rounded-lg border border-border bg-popover hover:bg-accent/20"
            >
              Close
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* Contract preview */}
          <div className="overflow-auto max-h-[78vh] p-4 border-b lg:border-b-0 lg:border-r border-border">
            <div
              className="prose prose-sm max-w-none bg-white text-black p-4 rounded-lg"
              dangerouslySetInnerHTML={{ __html: contract.body || '<p>No contract body</p>' }}
            />
          </div>

          {/* Fields */}
          <div className="overflow-auto max-h-[78vh] p-4">
            <div className="text-sm font-semibold mb-2">Initial each clause</div>
            <div className="space-y-2">
              {requiredFields.filter(f=>f.type==='initial').map((f) => (
                <label key={f.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-popover p-2">
                  <span className="text-sm">{f.label || f.id}</span>
                  <input
                    className="h-10 w-24 rounded bg-background px-2 text-center uppercase tracking-wider"
                    maxLength={4}
                    placeholder="AB"
                    value={initials[f.id] || ''}
                    onChange={(e) => setInitials((m) => ({ ...m, [f.id]: e.target.value.toUpperCase() }))}
                  />
                </label>
              ))}
            </div>

            <div className="mt-4 text-sm font-semibold mb-2">Signature</div>
            <SignatureCanvas
              onChange={(d) => setSigData(d)}
              clearSignal={clearCount}
              width={700}
              height={200}
            />
            <div className="mt-2 flex items-center gap-2">
              <button
                className="h-9 px-3 rounded-lg border border-border hover:bg-accent/20"
                onClick={() => setClearCount((n) => n + 1)}
              >
                Clear
              </button>
            </div>

            {missing.length > 0 && (
              <div className="mt-3 text-xs text-destructive">
                Please complete: {missing.join(', ')}
              </div>
            )}

            <div className="mt-4">
              <button
                className="h-10 px-4 rounded-lg bg-primary text-primary-foreground"
                onClick={() => {
                  if (missing.length) return;
                  const updated: Contract = {
                    ...contract,
                    status: 'signed',
                    signedAt: new Date(),
                    digitalStamp: `stamp_${contract.id}_${Date.now()}`,
                    esignFields: requiredFields.map((f) =>
                      f.type === 'initial'
                        ? { ...f, valueText: initials[f.id] || '' }
                        : { ...f, imageDataUrl: sigData }
                    ),
                  };
                  onSigned(updated);
                }}
              >
                Sign & Save
              </button>
              <div className="mt-2 text-xs text-muted-foreground">
                A digital stamp is recorded with timestamp. You can email a copy to the client or CC the planner from the Contracts tab.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
