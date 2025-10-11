// FILE: components/admin/CustomerEditor.tsx
'use client';
import React, { useMemo, useState } from 'react';
import type {
  Lead,
  LeadStage,
  Address,
  Invoice,
  PaymentMethod,
  Contract,
  ContractItem,
} from './types';
import { renderHollywoodStyleContract } from './contractTemplates';
import EsignModal from './EsignModal';
import ContractBuilderModal from './ContractBuilderModal';

function normalizePhone(p?: string) {
  return (p || '').replace(/\D+/g, '');
}
function makePortalKeyFromPhone(p?: string) {
  const d = normalizePhone(p);
  if (!d) return '';
  const mid = Math.floor(d.length / 2);
  return 'pk_' + d.slice(mid) + d.slice(0, mid);
}
function genCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}
function fmtUSD(n?: number) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(n || 0));
}

export default function CustomerEditor({
  lead,
  stages,
  onSave,
  onClose,
}: {
  lead: Lead;
  stages: (LeadStage | 'All')[];
  onSave: (updated: Lead) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<
    'details' | 'intake' | 'contracts' | 'invoices' | 'notes'
  >('details');

  const [draft, setDraft] = useState<Lead>(() => {
    const phoneNormalized = normalizePhone(lead.phone);
    return {
      ...lead,
      phoneNormalized: phoneNormalized || lead.phoneNormalized,
      portalKey:
        lead.portalKey ||
        makePortalKeyFromPhone(lead.phone || lead.phoneNormalized),
      pricing: lead.pricing || {
        bridalMakeup: 380,
        bridalHairstyle: 350,
        touchupsHourly: 120,
        travelFee: 50,
        travelCity: lead.location?.city || '',
        depositFlat: 100,
        extraItems: [],
      },
      intake: lead.intake || {
        skinType: undefined,
        allergies: '',
        preferences: '',
        hairType: undefined,
        concerns: '',
        referenceLinks: '',
        addressOnSite: '',
        timeWindow: '',
      },
    };
  });

  const [esignOpen, setEsignOpen] = useState(false);
  const [esignTargetId, setEsignTargetId] = useState<string | null>(null);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [builderPreset, setBuilderPreset] = useState<{
    items: ContractItem[];
    deposit: number;
  } | null>(null);

  const depositFromLatest = (draft.contracts?.[0]?.depositAmount ??
    draft.pricing?.depositFlat ??
    100) as number;

  const totalFromLatest = draft.contracts?.[0]?.totalAmount ??
    (typeof draft.customTotal === 'number' ? draft.customTotal : undefined);

  const suggestedTotal =
    typeof totalFromLatest === 'number'
      ? totalFromLatest
      : (draft.pricing?.bridalMakeup ?? 0) +
        (draft.wantsHair ? draft.pricing?.bridalHairstyle ?? 0 : 0) +
        (draft.pricing?.travelFee ?? 0);

  const suggestedDeposit = depositFromLatest;

  // helpers
  const setAddress = (key: keyof Address, v: string) =>
    setDraft((d) => ({ ...d, location: { ...(d.location || {}), [key]: v } }));

  const addNote = (text: string) => {
    if (!text.trim()) return;
    const n = { id: `n_${Date.now()}`, text: text.trim(), createdAt: new Date() };
    setDraft((d) => ({ ...d, notesList: [n, ...(d.notesList ?? [])] }));
  };

  // Portal helpers
  const ensureRegistrationCode = () =>
    setDraft((d) =>
      d.registrationCode ? d : { ...d, registrationCode: genCode() },
    );
  const ensurePortalKey = () =>
    setDraft((d) => ({
      ...d,
      portalKey:
        d.portalKey ||
        makePortalKeyFromPhone(d.phone || d.phoneNormalized) ||
        genCode(),
    }));
  const portalUrl = useMemo(() => {
    const key =
      draft.portalKey ||
      makePortalKeyFromPhone(draft.phone || draft.phoneNormalized) ||
      draft.registrationCode;
    return key ? `/portal?key=${encodeURIComponent(key)}` : '';
  }, [draft.portalKey, draft.phone, draft.phoneNormalized, draft.registrationCode]);

  // Contract: open builder using Detail prices
  const openBuilderFromDetails = () => {
    const p = draft.pricing || {};
    const items: ContractItem[] = [
      {
        label: 'Bridal Makeup',
        priceText: `$${(p.bridalMakeup ?? 380).toFixed(0)}`,
      },
      ...(draft.wantsHair
        ? [
            {
              label: 'Bridal hairstyle',
              priceText: `$${(p.bridalHairstyle ?? 350).toFixed(0)}`,
            },
          ]
        : []),
      {
        label: 'Makeup and hairstyle touch ups',
        priceText: `$${(p.touchupsHourly ?? 120).toFixed(0)}/hr`,
      },
      {
        label: `travel fee to ${
          p.travelCity || draft.location?.city || 'your area'
        }`,
        priceText: `$${(p.travelFee ?? 50).toFixed(0)}`,
      },
      ...(p.extraItems ?? []).map((it) => ({
        label: it.label,
        priceText: `$${(it.price ?? 0).toFixed(0)}`,
      })),
    ];
    const deposit = p.depositFlat ?? 100;
    setBuilderPreset({ items, deposit });
    setBuilderOpen(true);
  };

  // Contract: save builder -> new versioned contract (history kept)
  const saveBuilder = ({
    items,
    deposit,
    html,
    total,
  }: {
    items: ContractItem[];
    deposit: number;
    html: string;
    total: number;
  }) => {
    const nextVersion = (draft.contracts?.[0]?.version ?? 0) + 1;
    const newContract: Contract = {
      id: `c_${Date.now()}`,
      leadId: draft.id,
      template:
        draft.eventType === 'wedding' ? 'wedding_standard' : 'event_standard',
      version: nextVersion,
      createdAt: new Date(),
      body: html,
      items,
      depositAmount: deposit,
      totalAmount: total,
      status: 'draft',
      partySize: draft.partySize,
      serviceDate: draft.serviceDate,
      location: draft.location,
      esignFields: [
        { id: 'policies', type: 'initial', label: 'Policies Bookings', required: true },
        { id: 'cancellation', type: 'initial', label: 'Cancellation Policy', required: true },
        { id: 'delays', type: 'initial', label: 'Delays', required: true },
        { id: 'parking', type: 'initial', label: 'Parking Fees', required: true },
        { id: 'travel', type: 'initial', label: 'Travel Fees', required: true },
        { id: 'liability', type: 'initial', label: 'Liability', required: true },
        { id: 'payment', type: 'initial', label: 'Payment', required: true },
        { id: 'signature', type: 'signature', label: 'Client Signature', required: true },
      ],
    };
    setDraft((d) => ({ ...d, contracts: [newContract, ...(d.contracts ?? [])] }));
    setBuilderOpen(false);
    setTab('contracts');
  };

  // E-sign actions
  const openEsign = (cid: string) => {
    setEsignTargetId(cid);
    setEsignOpen(true);
  };
  const onSigned = (updated: Contract) => {
    setDraft((d) => ({
      ...d,
      contracts: (d.contracts ?? []).map((c) =>
        c.id === updated.id ? updated : c,
      ),
    }));
    addNote(`Contract ${updated.id} signed`);
    setEsignOpen(false);
  };

  const sendContractEmail = (c: Contract) => {
    const url =
      c.url ||
      `/sign/${c.id}?key=${encodeURIComponent(
        draft.portalKey || draft.registrationCode || '',
      )}`;
    setDraft((d) => ({
      ...d,
      contracts: (d.contracts ?? []).map((x) =>
        x.id === c.id ? { ...x, status: 'sent', sentAt: new Date(), url } : x,
      ),
    }));
    addNote(`Contract ${c.id} sent to ${draft.email || 'client'} (link: ${url})`);
  };

  // Invoices
  const upsertInvoice = (
    kind: 'deposit' | 'balance',
    amount: number,
    dueDays = 7,
  ) => {
    const existing = (draft.invoices ?? []).find((i) => i.kind === kind);
    const dueAt = new Date(Date.now() + dueDays * 86400000);
    const base: Invoice = {
      id: existing?.id || `inv_${kind}_${Date.now()}`,
      leadId: draft.id,
      kind,
      number:
        existing?.number ||
        `INV-${kind === 'deposit' ? 'D' : 'B'}-${String(
          Math.floor(Math.random() * 10000),
        ).padStart(4, '0')}`,
      dueAt,
      lines: [{ label: kind === 'deposit' ? 'Deposit' : 'Remaining Balance', amount }],
      total: amount,
      status: existing?.status || 'sent',
      sentAt: existing?.sentAt || new Date(),
      payments: existing?.payments || [],
    };
    setDraft((d) => {
      const others = (d.invoices ?? []).filter((i) => i.kind !== kind);
      return { ...d, invoices: [base, ...others] };
    });
    addNote(
      `${kind === 'deposit' ? 'Deposit' : 'Balance'} invoice ${base.number} created/sent`,
    );
  };

  const addPayment = (
    invoiceId: string,
    amount: number,
    method: PaymentMethod,
  ) => {
    setDraft((d) => {
      const invoices = (d.invoices ?? []).map((inv) => {
        if (inv.id !== invoiceId) return inv;
        const payments = [
          ...(inv.payments ?? []),
          {
            id: `pay_${Date.now()}`,
            invoiceId,
            amount,
            method,
            createdAt: new Date(),
          },
        ];
        const paid = payments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
        const status = paid >= (Number(inv.total) || 0) ? 'paid' : inv.status;
        return { ...inv, payments, status };
      });
      return { ...d, invoices };
    });
    addNote(`Payment recorded on ${invoiceId} (${method})`);
  };

  const sendReminder = (kind: 'contract' | 'deposit' | 'balance') => {
    addNote(`Reminder sent for ${kind}${kind === 'contract' ? '' : ' invoice'}`);
  };

  const save = () => onSave(draft);

  const latestContract = draft.contracts?.[0];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div className="relative w-[98vw] sm:w-[980px] max-h-[90vh] overflow-hidden rounded-2xl border border-border bg-card shadow-xl glass-2">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="font-semibold">{draft.name}</div>
          <div className="flex items-center gap-2">
            <button onClick={save} className="h-9 px-3 rounded-lg bg-primary text-primary-foreground">
              Save
            </button>
            <button
              onClick={onClose}
              className="h-9 px-3 rounded-lg border border-border bg-popover hover:bg-accent/20"
            >
              Close
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-3 pt-3">
          <div className="flex items-center gap-1 rounded-full border border-border bg-popover p-1 w-full sm:w-auto mb-3">
            {(['details', 'intake', 'contracts', 'invoices', 'notes'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={[
                  'h-9 px-3 rounded-full text-sm capitalize',
                  tab === t ? 'bg-primary text-primary-foreground' : 'hover:bg-accent/20',
                ].join(' ')}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="overflow-auto max-h-[74vh] px-4 pb-6">
          {/* DETAILS */}
          {tab === 'details' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Contact */}
              <div className="rounded-xl border border-input p-3 bg-popover">
                <div className="text-xs uppercase text-muted-foreground mb-2">Contact</div>
                <div className="grid gap-2">
                  <input
                    className="h-10 rounded-lg px-3 bg-background"
                    placeholder="Name"
                    value={draft.name}
                    onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                  />
                  <input
                    className="h-10 rounded-lg px-3 bg-background"
                    placeholder="Email"
                    value={draft.email || ''}
                    onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
                  />
                  <input
                    className="h-10 rounded-lg px-3 bg-background"
                    placeholder="Phone"
                    value={draft.phone || ''}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        phone: e.target.value,
                        phoneNormalized: normalizePhone(e.target.value),
                      }))
                    }
                  />
                  <input
                    className="h-10 rounded-lg px-3 bg-background"
                    placeholder="Instagram"
                    value={draft.instagram || ''}
                    onChange={(e) => setDraft((d) => ({ ...d, instagram: e.target.value }))}
                  />
                </div>

                <div className="mt-3 rounded-lg border border-border p-2">
                  <div className="text-xs text-muted-foreground mb-1">Client Portal</div>
                  <div className="text-xs">
                    {portalUrl ? (
                      <div className="flex items-center justify-between gap-2">
                        <code className="text-[11px] break-all">{portalUrl}</code>
                        <button
                          className="text-xs underline"
                          onClick={() => navigator.clipboard.writeText(location.origin + portalUrl)}
                        >
                          Copy
                        </button>
                      </div>
                    ) : (
                      'Generate a portal key below.'
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <button
                      className="h-8 px-3 rounded-lg border border-border hover:bg-accent/20"
                      onClick={ensurePortalKey}
                    >
                      Use phone key
                    </button>
                    <button
                      className="h-8 px-3 rounded-lg border border-border hover:bg-accent/20"
                      onClick={ensureRegistrationCode}
                    >
                      Generate code
                    </button>
                    {draft.registrationCode && (
                      <span className="text-xs">
                        Code: <code>{draft.registrationCode}</code>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Event + Pricing */}
              <div className="rounded-xl border border-input p-3 bg-popover">
                <div className="text-xs uppercase text-muted-foreground mb-2">Event Details</div>
                <div className="grid gap-2">
                  <select
                    className="h-10 rounded-lg px-3 bg-background"
                    value={draft.eventType || 'wedding'}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, eventType: e.target.value as any }))
                    }
                  >
                    <option value="wedding">Wedding</option>
                    <option value="event">Event</option>
                    <option value="tutorial">Tutorial</option>
                    <option value="trial">Trial</option>
                    <option value="other">Other</option>
                  </select>

                  <input
                    type="date"
                    className="h-10 rounded-lg px-3 bg-background"
                    value={
                      draft.serviceDate
                        ? new Date(draft.serviceDate as any).toISOString().slice(0, 10)
                        : ''
                    }
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        serviceDate: e.target.value ? new Date(e.target.value) : undefined,
                      }))
                    }
                  />

                  <input
                    type="number"
                    min={1}
                    className="h-10 rounded-lg px-3 bg-background"
                    placeholder="Party size"
                    value={draft.partySize ?? 1}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, partySize: Number(e.target.value) || 1 }))
                    }
                  />

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={!!draft.wantsMakeup}
                        onChange={(e) =>
                          setDraft((d) => ({ ...d, wantsMakeup: e.target.checked }))
                        }
                      />{' '}
                      Makeup
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={!!draft.wantsHair}
                        onChange={(e) =>
                          setDraft((d) => ({ ...d, wantsHair: e.target.checked }))
                        }
                      />{' '}
                      Hair
                    </label>
                  </div>

                  <input
                    className="h-10 rounded-lg px-3 bg-background"
                    placeholder="Address"
                    value={draft.location?.address || ''}
                    onChange={(e) => setAddress('address', e.target.value)}
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      className="h-10 rounded-lg px-3 bg-background"
                      placeholder="City"
                      value={draft.location?.city || ''}
                      onChange={(e) => setAddress('city', e.target.value)}
                    />
                    <input
                      className="h-10 rounded-lg px-3 bg-background"
                      placeholder="State"
                      value={draft.location?.state || ''}
                      onChange={(e) => setAddress('state', e.target.value)}
                    />
                    <input
                      className="h-10 rounded-lg px-3 bg-background"
                      placeholder="ZIP"
                      value={draft.location?.zip || ''}
                      onChange={(e) => setAddress('zip', e.target.value)}
                    />
                  </div>
                </div>

                <div className="mt-3 rounded-lg border border-border p-2">
                  <div className="text-xs uppercase text-muted-foreground mb-2">
                    Pricing (drives contract)
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="text-xs">
                      Bridal Makeup
                      <input
                        type="number"
                        className="h-9 w-full rounded bg-background px-2"
                        value={draft.pricing?.bridalMakeup ?? 380}
                        onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            pricing: {
                              ...(d.pricing || {}),
                              bridalMakeup: Number(e.target.value) || 0,
                            },
                          }))
                        }
                      />
                    </label>
                    <label className="text-xs">
                      Bridal hairstyle
                      <input
                        type="number"
                        className="h-9 w-full rounded bg-background px-2"
                        value={draft.pricing?.bridalHairstyle ?? 350}
                        onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            pricing: {
                              ...(d.pricing || {}),
                              bridalHairstyle: Number(e.target.value) || 0,
                            },
                          }))
                        }
                      />
                    </label>
                    <label className="text-xs">
                      Touch ups (per hour)
                      <input
                        type="number"
                        className="h-9 w-full rounded bg-background px-2"
                        value={draft.pricing?.touchupsHourly ?? 120}
                        onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            pricing: {
                              ...(d.pricing || {}),
                              touchupsHourly: Number(e.target.value) || 0,
                            },
                          }))
                        }
                      />
                    </label>
                    <label className="text-xs">
                      Travel fee ($)
                      <input
                        type="number"
                        className="h-9 w-full rounded bg-background px-2"
                        value={draft.pricing?.travelFee ?? 50}
                        onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            pricing: {
                              ...(d.pricing || {}),
                              travelFee: Number(e.target.value) || 0,
                            },
                          }))
                        }
                      />
                    </label>
                    <label className="text-xs">
                      Travel city
                      <input
                        className="h-9 w-full rounded bg-background px-2"
                        value={draft.pricing?.travelCity ?? ''}
                        onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            pricing: { ...(d.pricing || {}), travelCity: e.target.value },
                          }))
                        }
                      />
                    </label>
                    <label className="text-xs">
                      Deposit ($)
                      <input
                        type="number"
                        className="h-9 w-full rounded bg-background px-2"
                        value={draft.pricing?.depositFlat ?? 100}
                        onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            pricing: {
                              ...(d.pricing || {}),
                              depositFlat: Number(e.target.value) || 0,
                            },
                          }))
                        }
                      />
                    </label>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      className="h-9 px-3 rounded-lg border border-border hover:bg-accent/20"
                      onClick={openBuilderFromDetails}
                    >
                      Generate from Details (edit before saving)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* INTAKE — restored */}
          {tab === 'intake' && (
            <div className="grid grid-cols-1 gap-3">
              <div className="rounded-xl border border-input p-3 bg-popover">
                <div className="text-xs uppercase text-muted-foreground mb-2">Intake form</div>
                <div className="grid gap-2">
                  <div className="grid grid-cols-2 gap-2">
                    <label className="text-xs">
                      Skin type
                      <select
                        className="h-10 rounded-lg px-3 bg-background w-full"
                        value={draft.intake?.skinType || ''}
                        onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            intake: { ...(d.intake || {}), skinType: e.target.value as any },
                          }))
                        }
                      >
                        <option value="">Choose…</option>
                        <option value="dry">Dry</option>
                        <option value="oily">Oily</option>
                        <option value="combo">Combination</option>
                        <option value="normal">Normal</option>
                        <option value="sensitive">Sensitive</option>
                      </select>
                    </label>

                    <label className="text-xs">
                      Hair type
                      <select
                        className="h-10 rounded-lg px-3 bg-background w-full"
                        value={draft.intake?.hairType || ''}
                        onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            intake: { ...(d.intake || {}), hairType: e.target.value as any },
                          }))
                        }
                      >
                        <option value="">Choose…</option>
                        <option value="straight">Straight</option>
                        <option value="wavy">Wavy</option>
                        <option value="curly">Curly</option>
                        <option value="coily">Coily</option>
                        <option value="fine">Fine</option>
                        <option value="thick">Thick</option>
                      </select>
                    </label>
                  </div>

                  <textarea
                    className="min-h-20 rounded-lg px-3 py-2 bg-background"
                    placeholder="Allergies"
                    value={draft.intake?.allergies || ''}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        intake: { ...(d.intake || {}), allergies: e.target.value },
                      }))
                    }
                  />

                  <textarea
                    className="min-h-20 rounded-lg px-3 py-2 bg-background"
                    placeholder="Preferences (natural glam, full glam, etc.)"
                    value={draft.intake?.preferences || ''}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        intake: { ...(d.intake || {}), preferences: e.target.value },
                      }))
                    }
                  />

                  <textarea
                    className="min-h-20 rounded-lg px-3 py-2 bg-background"
                    placeholder="Concerns"
                    value={draft.intake?.concerns || ''}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        intake: { ...(d.intake || {}), concerns: e.target.value },
                      }))
                    }
                  />

                  <input
                    className="h-10 rounded-lg px-3 bg-background"
                    placeholder="Reference links (comma separated)"
                    value={draft.intake?.referenceLinks || ''}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        intake: { ...(d.intake || {}), referenceLinks: e.target.value },
                      }))
                    }
                  />

                  <input
                    className="h-10 rounded-lg px-3 bg-background"
                    placeholder="On-site address (if different)"
                    value={draft.intake?.addressOnSite || ''}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        intake: { ...(d.intake || {}), addressOnSite: e.target.value },
                      }))
                    }
                  />

                  <input
                    className="h-10 rounded-lg px-3 bg-background"
                    placeholder="Time window (e.g., arrive by 8:00 AM)"
                    value={draft.intake?.timeWindow || ''}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        intake: { ...(d.intake || {}), timeWindow: e.target.value },
                      }))
                    }
                  />
                </div>

                <div className="mt-3 text-xs">
                  Client link:{' '}
                  {portalUrl ? (
                    <button
                      className="underline"
                      onClick={() =>
                        navigator.clipboard.writeText(location.origin + portalUrl)
                      }
                    >
                      Copy portal link
                    </button>
                  ) : (
                    'Generate portal key in Details tab.'
                  )}
                </div>
              </div>
            </div>
          )}

          {/* CONTRACTS */}
          {tab === 'contracts' && (
            <div className="grid grid-cols-1 gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {latestContract && latestContract.status !== 'signed' && (
                  <>
                    <button
                      className="h-9 px-3 rounded-lg bg-primary text-primary-foreground"
                      onClick={() => {
                        setBuilderPreset({
                          items: latestContract.items || [],
                          deposit: latestContract.depositAmount || 100,
                        });
                        setBuilderOpen(true);
                      }}
                    >
                      Revise Contract (new version)
                    </button>
                    <button
                      className="h-9 px-3 rounded-lg border border-border hover:bg-accent/20"
                      onClick={() => openEsign(latestContract.id)}
                    >
                      E-Sign (client side)
                    </button>
                    <button
                      className="h-9 px-3 rounded-lg border border-border hover:bg-accent/20"
                      onClick={() => sendContractEmail(latestContract)}
                    >
                      Send sign link (email)
                    </button>
                  </>
                )}
                {latestContract && latestContract.status !== 'signed' && (
                  <button
                    className="h-9 px-3 rounded-lg border border-border hover:bg-accent/20"
                    onClick={() => {
                      const c = latestContract;
                      const upd = {
                        ...c,
                        status: 'signed',
                        signedAt: new Date(),
                        digitalStamp: `stamp_${c.id}_${Date.now()}`,
                      };
                      setDraft((d) => ({
                        ...d,
                        contracts: (d.contracts ?? []).map((x) =>
                          x.id === c.id ? upd : x,
                        ),
                      }));
                      addNote(`Contract ${c.id} marked signed`);
                    }}
                  >
                    Mark Signed
                  </button>
                )}
              </div>

              {latestContract ? (
                <div className="rounded-xl border border-input bg-popover p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-semibold">
                      Latest Contract (v{latestContract.version || 1})
                    </div>
                    <div className="text-xs opacity-80 capitalize">
                      {latestContract.status}
                    </div>
                  </div>
                  <div className="text-xs mb-2">
                    Total: <strong>{fmtUSD(latestContract.totalAmount || 0)}</strong> • Deposit:{' '}
                    <strong>{fmtUSD(latestContract.depositAmount || 0)}</strong>
                  </div>
                  <div
                    className="prose prose-sm max-w-none bg-white text-black p-4 rounded-lg"
                    dangerouslySetInnerHTML={{
                      __html: latestContract.body || '<p>No body</p>',
                    }}
                  />
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No contracts yet. Use “Generate from Details”.
                </div>
              )}

              <div className="rounded-xl border border-input bg-popover">
                <div className="p-3 border-b border-border text-sm font-semibold">
                  Contract History
                </div>
                <div className="divide-y divide-border/60">
                  {(draft.contracts ?? []).slice(1).map((c) => (
                    <details key={c.id} className="p-3">
                      <summary className="cursor-pointer text-sm flex items-center justify-between">
                        <span>
                          v{c.version || '?'} • {new Date(c.createdAt as any).toLocaleString()} •{' '}
                          {c.status}
                        </span>
                        <span className="text-xs">
                          {fmtUSD(c.totalAmount || 0)} / dep {fmtUSD(c.depositAmount || 0)}
                        </span>
                      </summary>
                      <div className="mt-2 prose prose-sm max-w-none bg-white text-black p-3 rounded">
                        <div dangerouslySetInnerHTML={{ __html: c.body || '' }} />
                      </div>
                    </details>
                  ))}
                  {!((draft.contracts ?? []).slice(1).length) && (
                    <div className="p-3 text-sm text-muted-foreground">No older versions yet.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* INVOICES */}
          {tab === 'invoices' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Deposit */}
              <div className="rounded-xl border border-input p-3 bg-popover">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-semibold">Deposit</div>
                  <div className="text-xs opacity-70">
                    {(draft.invoices ?? []).find((i) => i.kind === 'deposit')?.number ||
                      'not created'}
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div>Suggested</div>
                  <div className="font-semibold">{fmtUSD(suggestedDeposit)}</div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    className="h-10 rounded-lg px-3 bg-background w-36"
                    defaultValue={suggestedDeposit}
                    id="dep_amt"
                  />
                  <button
                    className="h-9 px-3 rounded-lg bg-primary text-primary-foreground"
                    onClick={() => {
                      const n = Number(
                        (document.getElementById('dep_amt') as HTMLInputElement).value ||
                          suggestedDeposit,
                      );
                      upsertInvoice('deposit', n);
                    }}
                  >
                    Create/Send
                  </button>
                  <button
                    className="h-9 px-3 rounded-lg border border-border hover:bg-accent/20"
                    onClick={() => sendReminder('deposit')}
                  >
                    Reminder
                  </button>
                </div>
              </div>

              {/* Balance */}
              <div className="rounded-xl border border-input p-3 bg-popover">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-semibold">Remaining Balance</div>
                  <div className="text-xs opacity-70">
                    {(draft.invoices ?? []).find((i) => i.kind === 'balance')?.number ||
                      'not created'}
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div>Suggested</div>
                  <div className="font-semibold">
                    {fmtUSD(Math.max(0, (suggestedTotal || 0) - (suggestedDeposit || 0)))}
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    className="h-10 rounded-lg px-3 bg-background w-36"
                    defaultValue={Math.max(0, (suggestedTotal || 0) - (suggestedDeposit || 0))}
                    id="bal_amt"
                  />
                  <button
                    className="h-9 px-3 rounded-lg bg-primary text-primary-foreground"
                    onClick={() => {
                      const n = Number(
                        (document.getElementById('bal_amt') as HTMLInputElement).value || 0,
                      );
                      upsertInvoice('balance', n, 14);
                    }}
                  >
                    Create/Send
                  </button>
                  <button
                    className="h-9 px-3 rounded-lg border border-border hover:bg-accent/20"
                    onClick={() => sendReminder('balance')}
                  >
                    Reminder
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* NOTES */}
          {tab === 'notes' && (
            <div className="grid grid-cols-1 gap-3">
              <div className="rounded-xl border border-input p-3 bg-popover">
                <div className="flex items-center gap-2">
                  <input
                    id="note_input"
                    placeholder="Add note…"
                    className="flex-1 h-10 rounded-lg px-3 bg-background"
                  />
                  <button
                    className="h-9 px-3 rounded-lg border border-border hover:bg-accent/20"
                    onClick={() => {
                      const el = document.getElementById('note_input') as HTMLInputElement;
                      addNote(el.value);
                      el.value = '';
                    }}
                  >
                    Add
                  </button>
                </div>
                <div className="mt-3 divide-y divide-border/60">
                  {(draft.notesList ?? []).map((n) => (
                    <div key={n.id} className="py-2">
                      <div className="text-xs text-muted-foreground">
                        {new Date(n.createdAt as any).toLocaleString()}
                      </div>
                      <div className="text-sm">{n.text}</div>
                    </div>
                  ))}
                  {!((draft.notesList ?? []).length) && (
                    <div className="text-sm text-muted-foreground">No notes yet.</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {builderOpen && builderPreset && (
        <ContractBuilderModal
          open={builderOpen}
          lead={draft}
          initialItems={builderPreset.items}
          initialDeposit={builderPreset.deposit}
          onCancel={() => setBuilderOpen(false)}
          onSave={saveBuilder}
        />
      )}

      {latestContract && esignOpen && esignTargetId === latestContract.id && (
        <EsignModal
          open={esignOpen}
          lead={draft}
          contract={latestContract}
          onClose={() => setEsignOpen(false)}
          onSigned={onSigned}
        />
      )}
    </div>
  );
}
