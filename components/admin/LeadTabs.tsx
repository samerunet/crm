// components/LeadTabs.tsx
// Panel with tabs per client (Profile | Bookings | Contracts)
'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { Appointment, Lead, STAGES } from './types';
import { badgeClasses } from './theme';

export default function LeadTabs({
  lead,
  events,
  onStage,
  onBook,
  onSendContract,
  onClose,
}: {
  lead: Lead;
  events: Appointment[];
  onStage: (stage: Lead['stage']) => void;
  onBook: () => void;
  onSendContract: (templateId: string) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<'profile' | 'bookings' | 'contracts'>('profile');
  const leadEvents = useMemo(
    () => (Array.isArray(events) ? events : []).filter((e) => e?.leadId === lead.id),
    [events, lead.id]
  );
  const contactLine =
    [lead.phone, lead.email].filter(Boolean).join(' · ') || '—';
  const notesValue = Array.isArray(lead.notes)
    ? lead.notes.join('\n')
    : lead.notes ?? '';

  const toDateTime = (value: string | Date | undefined) => {
    if (!value) return 'Unknown';
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? 'Unknown'
      : date.toLocaleString([], {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
  };
  const toTime = (value: string | Date | undefined) => {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? '—'
      : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    const handler = () => onClose();
    window.addEventListener('closeLeadPanel', handler as any);
    return () => window.removeEventListener('closeLeadPanel', handler as any);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="flex-1"
        onClick={(e) =>
          (e.target as HTMLElement).classList.contains('flex-1') && onClose()
        }
      />
      <div className="w-full max-w-2xl h-full bg-white dark:bg-neutral-900 shadow-2xl overflow-hidden">
        <div className="p-4 border-b dark:border-neutral-800 flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold">{lead.name}</div>
            <div className="text-xs text-neutral-500">{contactLine}</div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded ${badgeClasses(lead.stage, lead.color)}`}>
              {lead.stage.replace('_', ' ')}
            </span>
            <button
              onClick={onClose}
              className="px-2 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="px-4 pt-3 flex gap-3 border-b dark:border-neutral-800 text-sm">
          {(['profile', 'bookings', 'contracts'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-2 rounded-t ${tab === t ? 'bg-neutral-100 dark:bg-neutral-800' : ''}`}
            >
              {t[0].toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-120px)]">
          {tab === 'profile' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  defaultValue={lead.phone}
                  placeholder="Phone"
                  className="rounded border px-2 py-2 dark:bg-neutral-900 dark:border-neutral-700"
                />
                <input
                  defaultValue={lead.email}
                  placeholder="Email"
                  className="rounded border px-2 py-2 dark:bg-neutral-900 dark:border-neutral-700"
                />
                <input
                  defaultValue={lead.instagram}
                  placeholder="Instagram"
                  className="rounded border px-2 py-2 dark:bg-neutral-900 dark:border-neutral-700"
                />
                <select
                  defaultValue={lead.stage}
                  onChange={(e) => onStage(e.target.value as Lead['stage'])}
                  className="rounded border px-2 py-2 dark:bg-neutral-900 dark:border-neutral-700"
                >
                  {STAGES.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage}
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                defaultValue={notesValue}
                placeholder="Internal notes"
                className="w-full min-h-24 rounded border px-2 py-2 dark:bg-neutral-900 dark:border-neutral-700"
              />
            </div>
          )}

          {tab === 'bookings' && (
            <div className="space-y-3">
              <button
                onClick={onBook}
                className="px-4 py-2 rounded-lg bg-black text-white dark:bg-white dark:text-black"
              >
                New Booking
              </button>
              <ul className="divide-y dark:divide-neutral-800">
                {leadEvents.length === 0 && (
                  <li className="py-3 text-sm text-neutral-500">No bookings yet.</li>
                )}
                {leadEvents.map((e) => (
                  <li key={e.id} className="py-3">
                    <div className="font-medium">{e.title}</div>
                    <div className="text-xs text-neutral-500">
                      {toDateTime(e.start)} – {toTime(e.end)}
                    </div>
                    <div className="text-xs">Status: {e.status}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tab === 'contracts' && (
            <div className="space-y-3">
              <div className="text-sm text-neutral-600 dark:text-neutral-300">
                Send e-sign contract to this client.
              </div>
              <div className="flex gap-2">
                <select id="template" className="rounded border px-2 py-2 dark:bg-neutral-900 dark:border-neutral-700">
                  <option value="bridal_standard">Bridal — Standard</option>
                  <option value="event_soft_glam">Event — Soft Glam</option>
                  <option value="trial_policy">Trial Policy</option>
                </select>
                <button
                  onClick={() => {
                    const sel = (document.getElementById('template') as HTMLSelectElement).value;
                    onSendContract(sel);
                  }}
                  className="px-4 py-2 rounded-lg bg-black text-white dark:bg-white dark:text-black"
                >
                  Send e-sign
                </button>
              </div>
              <p className="text-xs text-neutral-500">
                Hook this to your e-sign provider API (HelloSign/Dropbox Sign, DocuSign, PandaDoc).
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
