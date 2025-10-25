// components/admin/HeaderAlerts.tsx
'use client';
import React, {
  useMemo,
  useState,
  useCallback,
  useLayoutEffect,
  useEffect,
  useRef,
} from 'react';
import { createPortal } from 'react-dom';
import type { Lead } from './types';

type SearchResult = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  service?: string;
  stage?: Lead["stage"];
  lead: Lead;
};

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

  const { overdue, unsigned, overdueList, unsignedList, newLeadList } = useMemo(() => {
    const overdueClients: SearchResult[] = [];
    const unsignedClients: SearchResult[] = [];
    const newClients: SearchResult[] = [];

    for (const l of leads ?? []) {
      for (const inv of l.invoices ?? []) {
        const dueMs = inv?.dueAt ? new Date(inv.dueAt).getTime() : NaN;
        const isPaid = inv?.status === 'paid';
        const isOverdue =
          inv?.status === 'overdue' ||
          (!isPaid && Number.isFinite(dueMs) && dueMs < now);
        if (isOverdue) {
          overdueClients.push({
            id: `${l.id}-inv-${inv.id}`,
            name: l.name || 'Untitled lead',
            email: l.email || undefined,
            phone: l.phone || undefined,
            service: `Invoice ${inv.id}`,
            stage: l.stage,
            lead: l,
          });
        }
      }
      for (const c of l.contracts ?? []) {
        const isWedding = (c.template || '').startsWith('wedding_');
        if (isWedding && c.status !== 'signed') {
          unsignedClients.push({
            id: `${l.id}-contract-${c.id}`,
            name: l.name || 'Untitled lead',
            email: l.email || undefined,
            phone: l.phone || undefined,
            service: c.title || c.service || 'Wedding contract',
            stage: l.stage,
            lead: l,
          });
        }
      }
      if ((l.stage ?? '') === 'uncontacted') {
        newClients.push({
          id: `${l.id}-new`,
          name: l.name || 'Untitled lead',
          email: l.email || undefined,
          phone: l.phone || undefined,
          service: 'New inquiry',
          stage: l.stage,
          lead: l,
        });
      }
    }
    return {
      overdue: overdueClients.length,
      unsigned: unsignedClients.length,
      overdueList: overdueClients,
      unsignedList: unsignedClients,
      newLeadList: newClients,
    };
  }, [leads, now]);

  const [search, setSearch] = useState('');
  const anchorRef = useRef<HTMLInputElement | null>(null);
  const [dropdownRect, setDropdownRect] = useState<{ top: number; left: number; width: number }>({
    top: 0,
    left: 0,
    width: 0,
  });

  const updateDropdownRect = useCallback(() => {
    const el = anchorRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setDropdownRect({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
    });
  }, []);

  const results = useMemo<SearchResult[]>(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    const tokens = q.split(/\s+/).filter(Boolean);
    const matches: SearchResult[] = [];
    for (const lead of leads ?? []) {
      const name = lead.name?.toLowerCase() ?? '';
      const email = lead.email?.toLowerCase() ?? '';
      const phone = lead.phone?.toLowerCase() ?? '';
      const serviceTokens = [
        ...(lead.contracts ?? []).map((c: any) => c?.service ?? ''),
        ...(lead.contracts ?? []).map((c: any) => c?.title ?? ''),
        (lead as any).service ?? '',
        (lead as any).eventType ?? '',
      ]
        .filter(Boolean)
        .join(' ');
      const services = serviceTokens.toLowerCase();

      const haystack = [name, email, phone, services].join(' ');
      const allMatch = tokens.every((token) => haystack.includes(token));
      if (allMatch) {
        matches.push({
          id: lead.id,
          name: lead.name || 'Untitled lead',
          email: lead.email || undefined,
          phone: lead.phone || undefined,
          service: serviceTokens || undefined,
          stage: lead.stage,
          lead,
        });
      }
    }
    return matches.slice(0, 50);
  }, [leads, search]);

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

  const newLeadsCount = leads?.filter((l) => l.stage === 'uncontacted').length ?? 0;
  const newBadge =
    newLeadsCount > 0
      ? 'bg-primary text-primary-foreground'
      : 'bg-muted text-muted-foreground';

  const [activePanel, setActivePanel] = useState<'search' | 'overdue' | 'unsigned' | 'new' | null>(null);
  const dropdownOpen = activePanel !== null && (activePanel !== 'search' || search.trim().length > 0);

  const renderList: SearchResult[] = useMemo(() => {
    switch (activePanel) {
      case 'overdue':
        return overdueList;
      case 'unsigned':
        return unsignedList;
      case 'new':
        return newLeadList;
      case 'search':
        return results;
      default:
        return [];
    }
  }, [activePanel, overdueList, unsignedList, newLeadList, results]);

  useLayoutEffect(() => {
    if (dropdownOpen) updateDropdownRect();
  }, [dropdownOpen, updateDropdownRect, renderList.length]);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handle = () => updateDropdownRect();
    window.addEventListener('resize', handle);
    window.addEventListener('scroll', handle, true);
    return () => {
      window.removeEventListener('resize', handle);
      window.removeEventListener('scroll', handle, true);
    };
  }, [dropdownOpen, updateDropdownRect]);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActivePanel(null);
        setSearch('');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [dropdownOpen]);

  return (
    <div className="w-full flex flex-col gap-3" aria-label="Alerts" role="status">
      <div className="w-full flex flex-col sm:flex-row gap-2">
        {/* Overdue invoices — clickable */}
        <button
          type="button"
          onClick={() => {
            const next = activePanel === 'overdue' ? null : 'overdue';
            setSearch('');
            setActivePanel(next);
            if (next === 'overdue') {
              updateDropdownRect();
              onOpenOverdue?.();
            }
          }}
          className={pillBase + ' text-left hover:bg-accent/20 transition'}
          title="View overdue invoices"
        >
          <span className={`${badgeBase} ${overdueBadge}`}>{overdue}</span>
          <span className="text-sm">Overdue invoices</span>
        </button>

        {/* Unsigned wedding contracts — clickable */}
        <button
          type="button"
          onClick={() => {
            const next = activePanel === 'unsigned' ? null : 'unsigned';
            setSearch('');
            setActivePanel(next);
            if (next === 'unsigned') {
              updateDropdownRect();
              onOpenUnsigned?.();
            }
          }}
          className={pillBase + ' text-left hover:bg-accent/20 transition'}
          title="View unsigned wedding contracts"
        >
          <span className={`${badgeBase} ${unsignedBadge}`}>{unsigned}</span>
          <span className="text-sm">Unsigned wedding contracts</span>
        </button>

        {/* New leads */}
        <button
          type="button"
          onClick={() => {
            const next = activePanel === 'new' ? null : 'new';
            setSearch('');
            setActivePanel(next);
            if (next === 'new') updateDropdownRect();
          }}
          className={pillBase + ' bg-primary/10 border-primary/40 text-left hover:bg-primary/15 transition'}
        >
          <span className={`${badgeBase} ${newBadge}`}>{newLeadsCount}</span>
          <span className="text-sm">New inquiries</span>
        </button>
      </div>

      <div className="relative">
        <input
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setActivePanel('search');
          }}
          placeholder="Search clients by name, email, phone, or service…"
          className="wglass panel w-full text-sm focus:ring-2 focus:ring-primary/40"
          ref={anchorRef}
          onFocus={() => {
            setActivePanel('search');
            updateDropdownRect();
          }}
        />

        {dropdownOpen &&
          createPortal(
            <div
              className="rounded-2xl border border-border bg-popover/95 shadow-2xl backdrop-blur-lg max-h-80 overflow-y-auto"
              style={{
                position: 'absolute',
                top: dropdownRect.top,
                left: dropdownRect.left,
                width: dropdownRect.width,
                zIndex: 5000,
              }}
            >
              {renderList.length === 0 ? (
                <div className="px-4 py-3 text-sm text-muted-foreground">
                  {activePanel === 'search'
                    ? `No clients found for '${search}'.`
                    : 'No records to show yet.'}
                </div>
              ) : (
                <ul className="divide-y divide-border/60">
                  {renderList.map((r) => (
                    <li key={r.id} className="bg-popover/80 backdrop-blur">
                      <button
                        type="button"
                        className="w-full text-left px-4 py-3 hover:bg-primary/10 transition"
                        onClick={() => {
                          setSearch('');
                          setActivePanel(null);
                          window.dispatchEvent(
                            new CustomEvent('dashboard:navigateToLead', { detail: r.lead })
                          );
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-sm">{r.name}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {[r.email, r.phone].filter(Boolean).join(' · ') || '—'}
                            </div>
                            {r.service && (
                              <div className="text-xs text-muted-foreground mt-0.5">
                                {r.service}
                              </div>
                            )}
                          </div>
                          {r.stage && <span className="badge">{r.stage}</span>}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>,
            document.body
          )}
      </div>
    </div>
  );
}
