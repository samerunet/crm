// components/admin/ContractBuilderModal.tsx  ✦ NEW FILE
// - Edit rows (Services/Prices) + deposit before saving
'use client';
import React, { useMemo, useState } from 'react';
import type { ContractItem, Lead } from './types';
import { renderHollywoodStyleContract } from './contractTemplates';

function parseMoney(text: string): number {
  const m = text.replaceAll(',', '').match(/(-?\d+(\.\d+)?)/);
  return m ? Number(m[1]) : 0;
}

export default function ContractBuilderModal({
  open,
  lead,
  initialItems,
  initialDeposit,
  onCancel,
  onSave,
}: {
  open: boolean;
  lead: Lead;
  initialItems: ContractItem[];
  initialDeposit: number;
  onCancel: () => void;
  onSave: (v: { items: ContractItem[]; deposit: number; html: string; total: number }) => void;
}) {
  const [rows, setRows] = useState<ContractItem[]>(initialItems);
  const [deposit, setDeposit] = useState<number>(initialDeposit);

  const total = useMemo(() => rows.reduce((s, r) => s + parseMoney(r.priceText), 0), [rows]);

  const html = useMemo(
    () => renderHollywoodStyleContract(lead, { items: rows, depositAmount: deposit }),
    [lead, rows, deposit]
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} aria-hidden="true" />
      <div className="relative w-[98vw] sm:w-[1100px] max-h-[92vh] overflow-hidden rounded-2xl border border-border bg-card shadow-xl glass-2">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="font-semibold">Build Contract</div>
          <div className="flex items-center gap-2">
            <button onClick={onCancel} className="h-9 px-3 rounded-lg border border-border bg-popover hover:bg-accent/20">Cancel</button>
            <button
              onClick={() => onSave({ items: rows, deposit, html, total })}
              className="h-9 px-3 rounded-lg bg-primary text-primary-foreground"
            >
              Save
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* Editor */}
          <div className="p-4 border-b lg:border-b-0 lg:border-r border-border overflow-auto max-h-[80vh]">
            <div className="text-sm font-semibold mb-2">Services & Prices</div>
            <div className="space-y-2">
              {rows.map((r, i) => (
                <div key={i} className="grid grid-cols-5 gap-2 items-center rounded-lg border border-border bg-popover p-2">
                  <input
                    className="col-span-3 h-9 rounded bg-background px-2"
                    placeholder="Service label"
                    value={r.label}
                    onChange={(e)=>setRows(arr=>arr.map((x,idx)=>idx===i?{...x,label:e.target.value}:x))}
                  />
                  <input
                    className="col-span-2 h-9 rounded bg-background px-2"
                    placeholder="$0 or $120/hr"
                    value={r.priceText}
                    onChange={(e)=>setRows(arr=>arr.map((x,idx)=>idx===i?{...x,priceText:e.target.value}:x))}
                  />
                  <div className="col-span-5 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Row total (numeric): ${parseMoney(r.priceText).toFixed(2)}</span>
                    <button
                      className="h-7 px-2 rounded border border-border hover:bg-accent/20"
                      onClick={()=>setRows(arr=>arr.filter((_,idx)=>idx!==i))}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              <button
                className="h-9 px-3 rounded-lg border border-border hover:bg-accent/20"
                onClick={()=>setRows(arr=>[...arr, { label: 'New item', priceText: '$0' }])}
              >
                Add item
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-border p-2">
                <div className="text-xs uppercase text-muted-foreground mb-1">Deposit</div>
                <input
                  type="number"
                  className="h-9 w-full rounded bg-background px-2"
                  value={deposit}
                  onChange={(e)=>setDeposit(Number(e.target.value)||0)}
                />
              </div>
              <div className="rounded-lg border border-border p-2">
                <div className="text-xs uppercase text-muted-foreground mb-1">Computed Total</div>
                <div className="text-sm font-semibold">${total.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">Balance: ${(Math.max(0,total-deposit)).toFixed(2)}</div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="p-4 overflow-auto max-h-[80vh]">
            <div className="prose prose-sm max-w-none bg-white text-black p-4 rounded-lg" dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        </div>
      </div>
    </div>
  );
}
