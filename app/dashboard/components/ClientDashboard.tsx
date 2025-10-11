// FILE: app/dashboard/components/ClientDashboard.tsx
'use client';
import React, { useEffect, useMemo, useState } from 'react';
import Tabs from './Tabs';
import KPICard from './KPICard';
import ClientContracts from './ClientContracts';
import ClientInvoices from './ClientInvoices';
import ClientIntake from './ClientIntake';
import ClientSchedule from './ClientSchedule';
import ClientGuides, { Guide } from './ClientGuides';

import type { Lead, Contract, Invoice, Appointment } from "@/components/admin/types";

type ClientStore = {
  lead: Lead;
  contracts: Contract[];
  invoices: Invoice[];
  appointments: Appointment[];
  guides: Guide[];
};

function defaultStore(name: string, email: string): ClientStore {
  return {
    lead: {
      id: 'lead_' + (email || 'me'),
      name,
      email,
      stage: 'contacted',
      notesList: [],
      intake: {},
    } as any,
    contracts: [],
    invoices: [],
    appointments: [],
    guides: [],
  };
}

export default function ClientDashboard({
  name,
  email,
  role,
}: {
  name: string;
  email: string;
  role: string;
}) {
  const storageKey = useMemo(()=> `client:${email||'anon'}`, [email]);
  const [store, setStore] = useState<ClientStore>(() => {
    if (typeof window === 'undefined') return defaultStore(name, email);
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : defaultStore(name, email);
    } catch {
      return defaultStore(name, email);
    }
  });
  const [tab, setTab] = useState<'home' | 'contracts' | 'invoices' | 'intake' | 'schedule' | 'guides'>('home');

  useEffect(()=>{
    try { localStorage.setItem(storageKey, JSON.stringify(store)); } catch {}
  }, [store, storageKey]);

  const kpis = useMemo(()=>{
    const contracts = store.contracts || [];
    const invs = store.invoices || [];
    const unpaid = invs.filter(i => i.status !== 'paid').length;
    const signed = contracts.filter(c => c.status === 'signed').length;
    return { signed, unpaid, upcoming: (store.appointments||[]).length };
  }, [store]);

  const header = (
    <div className="f-container py-6">
      <div className="glass specular rounded-2xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">{name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{email}</p>

        <div className="mt-4">
          <Tabs
            tabs={[
              { key: 'home', label: 'Home' },
              { key: 'contracts', label: 'Contracts' },
              { key: 'invoices', label: 'Invoices' },
              { key: 'intake', label: 'Intake' },
              { key: 'schedule', label: 'Schedule' },
              { key: 'guides', label: 'Guides' },
            ]}
            current={tab}
            onChange={(k)=>setTab(k as any)}
          />
        </div>

        {tab === 'home' && (
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <KPICard label="Signed contracts" value={kpis.signed} />
            <KPICard label="Unpaid invoices" value={kpis.unpaid} />
            <KPICard label="Upcoming appts" value={kpis.upcoming} />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <main>
      {header}

      <div className="f-container pb-10">
        {tab === 'home' && (
          <div className="grid gap-4 sm:grid-cols-2">
            <ClientContracts
              lead={store.lead}
              contracts={store.contracts}
              onUpdateContract={(c)=> setStore(s => ({ ...s, contracts: s.contracts.map(x=>x.id===c.id?c:x) }))}
            />
            <ClientInvoices
              invoices={store.invoices}
              onMarkPaid={(id)=> setStore(s => ({ ...s, invoices: s.invoices.map(inv => inv.id===id ? { ...inv, status: 'paid' } : inv) }))}
            />
          </div>
        )}

        {tab === 'contracts' && (
          <ClientContracts
            lead={store.lead}
            contracts={store.contracts}
            onUpdateContract={(c)=> setStore(s => ({ ...s, contracts: s.contracts.map(x=>x.id===c.id?c:x) }))}
          />
        )}

        {tab === 'invoices' && (
          <ClientInvoices
            invoices={store.invoices}
            onMarkPaid={(id)=> setStore(s => ({ ...s, invoices: s.invoices.map(inv => inv.id===id ? { ...inv, status: 'paid' } : inv) }))}
          />
        )}

        {tab === 'intake' && (
          <ClientIntake
            lead={store.lead}
            onUpdate={(lead)=> setStore(s => ({ ...s, lead }))}
          />
        )}

        {tab === 'schedule' && (
          <ClientSchedule events={store.appointments} />
        )}

        {tab === 'guides' && (
          <ClientGuides guides={store.guides} onSubscribe={()=> alert('Subscription flow to be implemented.')} />
        )}
      </div>
    </main>
  );
}
