// FILE: components/admin/CustomerModal.tsx  (DROP-IN REPLACEMENT)
'use client';

import React, { useMemo, useState } from 'react';
import { Lead, STAGES } from './types';
import ContractTab from '@/components/lead/ContractTab';

/** Local shapes stored on the Lead object (kept inline so you don't have to edit types.ts now) */
type AnyLead = Lead & Record<string, any>;
type ContractRec = {
  id: string;
  createdAt: string;
  status: 'draft' | 'sent' | 'signed';
  eventType?: string;
  serviceDate?: string; // ISO YYYY-MM-DD
  partySize?: number;
  location?: string;
  services?: Array<{ name: string; price: number }>;
  subtotal?: number;
  travelFee?: number;
  discount?: number;
  total?: number;
  notes?: string;
};
type InvoiceRec = {
  id: string;
  type: 'deposit' | 'balance' | 'service' | 'guide';
  amount: number;
  dueDate?: string; // ISO YYYY-MM-DD
  status: 'unpaid' | 'paid';
  method?: 'cash' | 'venmo' | 'zelle' | 'card';
  createdAt: string;
  note?: string;
};

type Tab = 'details' | 'intake' | 'notes' | 'contracts' | 'invoices';

export default function CustomerModal({
  open,
  lead,
  onClose,
  onUpdate,
  onDelete,
  onSave,
  canSave = false,
  saving = false,
  saveError,
}: {
  open: boolean;
  lead: Lead | null;
  onClose: () => void;
  onUpdate: (lead: Lead) => void;
  onDelete?: (id: string) => void;
  onSave?: (lead: AnyLead) => void | Promise<void>;
  canSave?: boolean;
  saving?: boolean;
  saveError?: string | null;
}) {
  const model = useMemo<AnyLead | null>(() => (lead ? { ...lead } : null), [lead]);
  const [tab, setTab] = useState<Tab>('details');

  if (!open || !model) return null;

  const handleSave = () => {
    if (!onSave) return;
    Promise.resolve(onSave(model)).catch((err) => {
      console.error('Lead save handler rejected', err);
    });
  };

  const setField = (key: keyof AnyLead, val: any) =>
    onUpdate({ ...(model as AnyLead), [key]: val });
  const pushTo = (key: keyof AnyLead, item: any) => {
    const arr = ((model as AnyLead)[key] ?? []) as any[];
    onUpdate({ ...(model as AnyLead), [key]: [item, ...arr] });
  };
  const updateIn = (key: keyof AnyLead, id: string, patch: any) => {
    const arr = [...(((model as AnyLead)[key] ?? []) as any[])].map((x) =>
      x.id === id ? { ...x, ...patch } : x,
    );
    onUpdate({ ...(model as AnyLead), [key]: arr });
  };
  const removeFrom = (key: keyof AnyLead, id: string) => {
    const arr = (((model as AnyLead)[key] ?? []) as any[]).filter((x) => x.id !== id);
    onUpdate({ ...(model as AnyLead), [key]: arr });
  };

  // derived helpers
  const toISODate = (d?: any) => (d ? new Date(d).toISOString().slice(0, 10) : '');
  const fromISODate = (s: string) => (s ? `${s}T00:00:00` : undefined);

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Lightened scrim (less dark) */}
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/30" />

      {/* Centered modal */}
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center p-4 sm:p-6">
        <div className="glass-strong pointer-events-auto w-full max-w-[980px] rounded-[--radius-xl] border border-[--color-border]/70 bg-[--color-card] shadow-[0_28px_80px_rgba(0,0,0,0.28)]">
          {/* Header */}
          <div className="border-border/50 flex items-start justify-between gap-3 border-b p-4 sm:p-5">
            <div>
              <div className="text-lg font-semibold">{model.name || 'Untitled client'}</div>
              <div className="text-muted-foreground mt-1 text-xs">
                {model.email || '—'} · {model.phone || '—'}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onSave && (
                <button
                  type="button"
                  onClick={handleSave}
                  className="gbtn h-9 rounded-xl px-4 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={!canSave || saving}
                >
                  {saving ? 'Saving…' : canSave ? 'Save changes' : 'Saved'}
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(model.id)}
                  className="border-destructive/60 text-destructive hover:bg-destructive/10 h-9 rounded-xl border px-3 text-sm"
                >
                  Delete
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="icon-chip inline-grid h-9 w-9 place-items-center rounded-xl"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
          </div>

          {saveError && (
            <div className="border-destructive/40 bg-destructive/10 text-destructive mx-4 mt-3 rounded-xl border px-3 py-2 text-sm sm:mx-5">
              {saveError}
            </div>
          )}

          {/* Tabs */}
          <div className="px-4 pt-3 sm:px-5">
            <div className="flex flex-wrap gap-1">
              {(['details', 'intake', 'notes', 'contracts', 'invoices'] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`h-9 rounded-xl border px-3 text-sm ${
                    tab === t
                      ? 'bg-primary/15 border-border/70'
                      : 'border-border/60 hover:bg-accent/15'
                  } capitalize`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Body (scrollable) */}
          <div className="max-h-[72vh] overflow-y-auto p-4 sm:p-5">
            {tab === 'details' && (
              <DetailsView
                model={model}
                setField={setField}
                toISODate={toISODate}
                fromISODate={fromISODate}
              />
            )}

            {tab === 'intake' && <IntakeView model={model} setField={setField} />}

            {tab === 'notes' && (
              <NotesView
                notes={(model.notes ?? []) as { id: string; text: string; at: string }[]}
                onAdd={(text) =>
                  setField('notes', [
                    { id: `n_${Date.now()}`, text, at: new Date().toISOString() },
                    ...(model.notes ?? []),
                  ])
                }
                onDelete={(id) =>
                  setField(
                    'notes',
                    (model.notes ?? []).filter((n: any) => n.id !== id),
                  )
                }
              />
            )}

            {tab === 'contracts' && (
              <div className="space-y-5">
                <ContractTab leadId={model.id} lead={model as any} />
                <ContractsView
                  model={model}
                  onCreate={() => {
                    // prefill from details
                    const services = [...(model.services ?? [])] as Array<{
                      name: string;
                      price: number;
                    }>;
                    const subtotal = services.reduce((s, x) => s + (x.price || 0), 0);
                    const travel = Number(model.travelFee ?? 0);
                    const discount = Number(model.discount ?? 0);
                    const total = Math.max(0, subtotal + travel - discount);

                    const rec: ContractRec = {
                      id: `c_${Date.now()}`,
                      createdAt: new Date().toISOString(),
                      status: 'draft',
                      eventType: (model as AnyLead).eventType || '',
                      serviceDate: toISODate(model.dateOfService as any),
                      partySize: Number((model as AnyLead).partySize ?? 0) || undefined,
                      location: (model as AnyLead).location || '',
                      services: services.length
                        ? services
                        : [
                            {
                              name: 'Bridal Makeup',
                              price: Number((model as AnyLead).bridalPrice ?? 380),
                            },
                          ],
                      subtotal: services.length
                        ? subtotal
                        : Number((model as AnyLead).bridalPrice ?? 380),
                      travelFee: travel,
                      discount,
                      total,
                      notes: model.internalNotes || '',
                    };

                    pushTo('contracts', rec);
                  }}
                  onUpdate={(id, patch) => updateIn('contracts', id, patch)}
                  onRemove={(id) => removeFrom('contracts', id)}
                />
              </div>
            )}

            {tab === 'invoices' && (
              <InvoicesView
                model={model}
                onCreateFromContract={(contractId, kind) => {
                  const c: ContractRec | undefined = (model.contracts ?? []).find(
                    (x: any) => x.id === contractId,
                  );
                  if (!c) return;

                  let amount = 0;
                  if (kind === 'deposit') amount = Math.round((c.total || 0) * 0.3 * 100) / 100;
                  else if (kind === 'balance')
                    amount = Math.max(0, (c.total || 0) - (c.total || 0) * 0.3);
                  else amount = c.total || 0;

                  const inv: InvoiceRec = {
                    id: `i_${Date.now()}`,
                    type: kind,
                    amount,
                    status: 'unpaid',
                    dueDate: c.serviceDate,
                    createdAt: new Date().toISOString(),
                    note: `Auto-generated from contract ${contractId}`,
                  };
                  pushTo('invoices', inv);
                }}
                onUpdate={(id, patch) => updateIn('invoices', id, patch)}
                onRemove={(id) => removeFrom('invoices', id)}
                onCreateManual={(inv) => pushTo('invoices', inv)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------- Details ------------------------- */
function DetailsView({
  model,
  setField,
  toISODate,
  fromISODate,
}: {
  model: AnyLead;
  setField: (k: keyof AnyLead, v: any) => void;
  toISODate: (d?: any) => string;
  fromISODate: (s: string) => string | undefined;
}) {
  const inputClass = 'liquid-input';

  return (
    <div className="liquid-card p-5 sm:p-6">
      <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2">
        <Field label={<span className="f-label">Name</span>}>
          <input
            className={inputClass}
            value={model.name || ''}
            onChange={(e) => setField('name', e.target.value)}
            placeholder="Full name"
          />
        </Field>

        <Field label={<span className="f-label">Stage</span>}>
          <select
            className={inputClass}
            value={model.stage}
            onChange={(e) => setField('stage', e.target.value)}
          >
            {STAGES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>

        <Field label={<span className="f-label">Email</span>}>
          <input
            className={inputClass}
            value={model.email || ''}
            onChange={(e) => setField('email', e.target.value)}
            placeholder="client@email.com"
          />
        </Field>

        <Field label={<span className="f-label">Phone</span>}>
          <input
            className={inputClass}
            value={model.phone || ''}
            onChange={(e) => setField('phone', e.target.value)}
            placeholder="+1 (555) 000-0000"
          />
        </Field>

        <Field label={<span className="f-label">Service date</span>}>
          <input
            type="date"
            className={inputClass}
            value={toISODate(model.dateOfService)}
            onChange={(e) =>
              setField(
                'dateOfService',
                e.target.value ? fromISODate(e.target.value) : undefined,
              )
            }
          />
        </Field>

        <Field label={<span className="f-label">Location</span>}>
          <input
            className={inputClass}
            value={model.location || ''}
            onChange={(e) => setField('location', e.target.value)}
            placeholder="Venue / address"
          />
        </Field>

        <Field label={<span className="f-label">Party size</span>}>
          <input
            type="number"
            className={inputClass}
            value={model.partySize ?? ''}
            onChange={(e) =>
              setField(
                'partySize',
                e.target.value ? Number(e.target.value) : undefined,
              )
            }
            placeholder="Number of guests"
          />
        </Field>

        <Field label={<span className="f-label">Event type</span>}>
          <input
            className={inputClass}
            value={model.eventType || ''}
            onChange={(e) => setField('eventType', e.target.value)}
            placeholder="Wedding / studio / editorial …"
          />
        </Field>

        <Field label={<span className="f-label">Internal notes</span>} full>
          <textarea
            className={inputClass}
            value={model.internalNotes || ''}
            onChange={(e) => setField('internalNotes', e.target.value)}
            placeholder="Internal-only notes, grooming requests, VIP reminders…"
          />
        </Field>
      </div>

      <div className="mt-5 flex justify-end gap-3">
        <button type="button" className="gbtn-lg">
          Save
        </button>
      </div>
    </div>
  );
}


/* ------------------------- Intake ------------------------- */
function IntakeView({
  model,
  setField,
}: {
  model: AnyLead;
  setField: (k: keyof AnyLead, v: any) => void;
}) {
  const intake = (model.intake ?? {}) as Record<string, any>;

  const setIntake = (k: string, v: any) => setField('intake', { ...intake, [k]: v });

  return (
    <div className="liquid-card p-5 sm:p-6">
      <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2">
        <Field label={<span className="f-label">Skin type</span>}>
          <select
            className="liquid-input"
            value={intake.skinType || ''}
            onChange={(e) => setIntake('skinType', e.target.value)}
          >
            <option value="">Select…</option>
            <option value="dry">Dry</option>
            <option value="normal">Normal</option>
            <option value="combo">Combination</option>
            <option value="oily">Oily</option>
            <option value="sensitive">Sensitive</option>
          </select>
        </Field>
        <Field label={<span className="f-label">Allergies / sensitivities</span>}>
          <input
            className="liquid-input"
            value={intake.allergies || ''}
            onChange={(e) => setIntake('allergies', e.target.value)}
          />
        </Field>

        <Field label={<span className="f-label">Preferred style</span>}>
          <input
            className="liquid-input"
            value={intake.style || ''}
            onChange={(e) => setIntake('style', e.target.value)}
            placeholder="soft glam / natural / full glam"
          />
        </Field>
        <Field label={<span className="f-label">Reference links</span>}>
          <input
            className="liquid-input"
            value={intake.refs || ''}
            onChange={(e) => setIntake('refs', e.target.value)}
            placeholder="URLs, Pinterest boards, IG…"
          />
        </Field>

        <Field label={<span className="f-label">Notes</span>} full>
          <textarea
            className="liquid-input"
            value={intake.notes || ''}
            onChange={(e) => setIntake('notes', e.target.value)}
          />
        </Field>
      </div>
    </div>
  );
}

/* ------------------------- Notes ------------------------- */
function NotesView({
  notes,
  onAdd,
  onDelete,
}: {
  notes: { id: string; text: string; at: string }[];
  onAdd: (t: string) => void;
  onDelete: (id: string) => void;
}) {
  const [txt, setTxt] = useState('');
  return (
    <div className="liquid-card p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          className="liquid-input flex-1"
          placeholder="Add a note…"
          value={txt}
          onChange={(e) => setTxt(e.target.value)}
        />
        <button
          onClick={() => {
            if (txt.trim()) {
              onAdd(txt.trim());
              setTxt('');
            }
          }}
          className="gbtn-lg"
        >
          Add note
        </button>
      </div>

      <div className="mt-4 grid gap-3">
        {notes.length === 0 && <div className="text-muted-foreground text-sm">No notes yet.</div>}
        {notes.map((n) => (
          <div key={n.id} className="liquid-card p-4">
            <div className="text-sm">{n.text}</div>
            <div className="text-muted-foreground mt-1 text-xs">
              {new Date(n.at).toLocaleString()}
            </div>
            <div className="mt-2 flex justify-end">
              <button
                className="gbtn h-8 rounded-[--radius-lg] px-3 text-xs"
                onClick={() => onDelete(n.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------- Contracts ------------------------- */
function ContractsView({
  model,
  onCreate,
  onUpdate,
  onRemove,
}: {
  model: AnyLead;
  onCreate: () => void;
  onUpdate: (id: string, patch: Partial<ContractRec>) => void;
  onRemove: (id: string) => void;
}) {
  const contracts = (model.contracts ?? []) as ContractRec[];
  return (
    <div className="liquid-card space-y-4 p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm font-semibold uppercase tracking-[0.18em] opacity-80">
          Contracts ({contracts.length})
        </div>
        <button className="gbtn-lg" onClick={onCreate}>
          + New from Details
        </button>
      </div>

      {contracts.length === 0 && (
        <div className="text-muted-foreground text-sm">No contracts yet.</div>
      )}

      {contracts.map((c) => (
        <div key={c.id} className="liquid-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm font-semibold">#{c.id}</div>
            <div className="flex items-center gap-2">
              <select
                className="liquid-input h-9 w-[140px]"
                value={c.status}
                onChange={(e) =>
                  onUpdate(c.id, { status: e.target.value as ContractRec['status'] })
                }
              >
                <option value="draft">draft</option>
                <option value="sent">sent</option>
                <option value="signed">signed</option>
              </select>
              <button className="gbtn h-8 rounded-[--radius-lg] px-3 text-xs" onClick={() => onRemove(c.id)}>
                Remove
              </button>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="Event type">
              <input
                className="liquid-input"
                value={c.eventType || ''}
                onChange={(e) => onUpdate(c.id, { eventType: e.target.value })}
              />
            </Field>
            <Field label="Service date">
              <input
                type="date"
                className="liquid-input"
                value={c.serviceDate || ''}
                onChange={(e) => onUpdate(c.id, { serviceDate: e.target.value })}
              />
            </Field>
            <Field label="Party size">
              <input
                type="number"
                className="liquid-input"
                value={c.partySize ?? ''}
                onChange={(e) => onUpdate(c.id, { partySize: Number(e.target.value || 0) })}
              />
            </Field>
            <Field label="Location">
              <input
                className="liquid-input"
                value={c.location || ''}
                onChange={(e) => onUpdate(c.id, { location: e.target.value })}
              />
            </Field>

            <Field label="Subtotal ($)">
              <input
                type="number"
                className="liquid-input"
                value={c.subtotal ?? 0}
                onChange={(e) => onUpdate(c.id, { subtotal: Number(e.target.value || 0) })}
              />
            </Field>
            <Field label="Travel fee ($)">
              <input
                type="number"
                className="liquid-input"
                value={c.travelFee ?? 0}
                onChange={(e) => onUpdate(c.id, { travelFee: Number(e.target.value || 0) })}
              />
            </Field>
            <Field label="Discount ($)">
              <input
                type="number"
                className="liquid-input"
                value={c.discount ?? 0}
                onChange={(e) => onUpdate(c.id, { discount: Number(e.target.value || 0) })}
              />
            </Field>
            <Field label="Total ($)">
              <input
                type="number"
                className="liquid-input"
                value={c.total ?? 0}
                onChange={(e) => onUpdate(c.id, { total: Number(e.target.value || 0) })}
              />
            </Field>

            <Field label="Notes" full>
              <textarea
                className="liquid-input min-h-[80px]"
                value={c.notes || ''}
                onChange={(e) => onUpdate(c.id, { notes: e.target.value })}
              />
            </Field>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------- Invoices ------------------------- */
function InvoicesView({
  model,
  onCreateFromContract,
  onUpdate,
  onRemove,
  onCreateManual,
}: {
  model: AnyLead;
  onCreateFromContract: (contractId: string, kind: InvoiceRec['type']) => void;
  onUpdate: (id: string, patch: Partial<InvoiceRec>) => void;
  onRemove: (id: string) => void;
  onCreateManual: (inv: InvoiceRec) => void;
}) {
  const invoices = (model.invoices ?? []) as InvoiceRec[];
  const contracts = (model.contracts ?? []) as ContractRec[];

  const createManual = () => {
    const inv: InvoiceRec = {
      id: `i_${Date.now()}`,
      type: 'service',
      amount: 0,
      status: 'unpaid',
      dueDate: '',
      createdAt: new Date().toISOString(),
    };
    onCreateManual(inv);
  };

  return (
    <div className="liquid-card space-y-4 p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm font-semibold uppercase tracking-[0.18em] opacity-80">
          Invoices ({invoices.length})
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {contracts.length > 0 && (
            <>
              <select
                id="fromContract"
                className="liquid-input h-10 w-[220px]"
                defaultValue={contracts[0]?.id}
              >
                {contracts.map((c) => (
                  <option key={c.id} value={c.id}>
                    From #{c.id} — {c.total ?? 0}$
                  </option>
                ))}
              </select>
              <button
                className="border-border/70 hover:bg-accent/15 h-9 rounded-xl border px-3 text-sm"
                onClick={() => {
                  const el = document.getElementById('fromContract') as HTMLSelectElement | null;
                  if (!el) return;
                  onCreateFromContract(el.value, 'deposit');
                }}
              >
                + Deposit
              </button>
              <button
                className="gbtn h-9 rounded-[--radius-lg] px-3 text-sm"
                onClick={() => {
                  const el = document.getElementById('fromContract') as HTMLSelectElement | null;
                  if (!el) return;
                  onCreateFromContract(el.value, 'balance');
                }}
              >
                + Balance
              </button>
            </>
          )}
          <button className="gbtn-lg" onClick={createManual}>
            + Manual
          </button>
        </div>
      </div>

      {invoices.length === 0 && (
        <div className="text-muted-foreground text-sm">No invoices yet.</div>
      )}

      {invoices.map((inv) => (
        <div key={inv.id} className="liquid-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm font-medium">#{inv.id}</div>
            <div className="flex items-center gap-2">
              <select
                className="liquid-input h-9 w-[140px]"
                value={inv.status}
                onChange={(e) =>
                  onUpdate(inv.id, { status: e.target.value as InvoiceRec['status'] })
                }
              >
                <option value="unpaid">unpaid</option>
                <option value="paid">paid</option>
              </select>
              <button
                className="gbtn h-8 rounded-[--radius-lg] px-3 text-xs"
                onClick={() => onRemove(inv.id)}
              >
                Remove
              </button>
            </div>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Field label="Type">
              <select
                className="liquid-input"
                value={inv.type}
                onChange={(e) => onUpdate(inv.id, { type: e.target.value as InvoiceRec['type'] })}
              >
                <option value="deposit">deposit</option>
                <option value="balance">balance</option>
                <option value="service">service</option>
                <option value="guide">guide</option>
              </select>
            </Field>
            <Field label="Amount ($)">
              <input
                type="number"
                className="liquid-input"
                value={inv.amount}
                onChange={(e) => onUpdate(inv.id, { amount: Number(e.target.value || 0) })}
              />
            </Field>
            <Field label="Due date">
              <input
                type="date"
                className="liquid-input"
                value={inv.dueDate || ''}
                onChange={(e) => onUpdate(inv.id, { dueDate: e.target.value })}
              />
            </Field>
            <Field label="Method">
              <select
                className="liquid-input"
                value={inv.method || ''}
                onChange={(e) => onUpdate(inv.id, { method: e.target.value as any })}
              >
                <option value="">—</option>
                <option value="cash">cash</option>
                <option value="venmo">venmo</option>
                <option value="zelle">zelle</option>
                <option value="card">card</option>
              </select>
            </Field>
            <Field label="Note" full>
              <textarea
                className="liquid-input min-h-[80px]"
                value={inv.note || ''}
                onChange={(e) => onUpdate(inv.id, { note: e.target.value })}
              />
            </Field>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------- Small field wrapper ------------------------- */
function Field({
  label,
  full,
  children,
}: {
  label: React.ReactNode;
  full?: boolean;
  children: React.ReactNode;
}) {
  const renderedLabel =
    typeof label === 'string' ? <span className="f-label">{label}</span> : label;

  return (
    <div className={full ? 'grid gap-2 sm:col-span-2' : 'grid gap-2'}>
      {renderedLabel}
      {children}
    </div>
  );
}
