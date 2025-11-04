
# FILE: app/dashboard/components/ClientContracts.tsx

```ts
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

```

# FILE: app/dashboard/components/ClientDashboard.tsx

```ts
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

```

# FILE: app/dashboard/components/ClientGuides.tsx

```ts
// FILE: app/dashboard/components/ClientGuides.tsx
'use client';
import React from 'react';

export type Guide = { id: string; title: string; access: boolean };

export default function ClientGuides({
  guides,
  onSubscribe,
}: {
  guides: Guide[];
  onSubscribe: () => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="text-sm font-semibold mb-2">Your Guides & Courses</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {(guides||[]).map(g => (
          <div key={g.id} className="rounded-xl border border-border bg-popover p-3">
            <div className="font-medium">{g.title}</div>
            <div className="text-xs mt-1">{g.access ? 'Active' : 'Not purchased'}</div>
            <div className="mt-2">
              {g.access ? (
                <button className="h-8 px-3 rounded-lg bg-primary text-primary-foreground">Open</button>
              ) : (
                <button className="h-8 px-3 rounded-lg border border-border hover:bg-accent/20" onClick={onSubscribe}>Subscribe</button>
              )}
            </div>
          </div>
        ))}
        {!guides?.length && <div className="text-sm text-muted-foreground">No guides yet.</div>}
      </div>
    </div>
  );
}

```

# FILE: app/dashboard/components/ClientIntake.tsx

```ts
// FILE: app/dashboard/components/ClientIntake.tsx
'use client';
import React, { useState, useEffect } from 'react';
import type { Lead } from "@/components/admin/types";

export default function ClientIntake({
  lead,
  onUpdate,
}: {
  lead: Lead;
  onUpdate: (lead: Lead) => void;
}) {
  const [local, setLocal] = useState<Lead>(lead);

  useEffect(()=>{ setLocal(lead); }, [lead]);

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="text-sm font-semibold mb-2">Intake Form</div>
      <div className="grid gap-2">
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs">Skin type
            <select className="h-10 rounded-lg px-3 bg-background w-full"
              value={local.intake?.skinType || ''}
              onChange={(e)=>onUpdate({ ...local, intake: { ...(local.intake||{}), skinType: e.target.value as any }})}>
              <option value="">Choose…</option>
              <option value="dry">Dry</option><option value="oily">Oily</option>
              <option value="combo">Combination</option><option value="normal">Normal</option>
              <option value="sensitive">Sensitive</option>
            </select>
          </label>
          <label className="text-xs">Hair type
            <select className="h-10 rounded-lg px-3 bg-background w-full"
              value={local.intake?.hairType || ''}
              onChange={(e)=>onUpdate({ ...local, intake: { ...(local.intake||{}), hairType: e.target.value as any }})}>
              <option value="">Choose…</option>
              <option value="straight">Straight</option><option value="wavy">Wavy</option>
              <option value="curly">Curly</option><option value="coily">Coily</option>
              <option value="fine">Fine</option><option value="thick">Thick</option>
            </select>
          </label>
        </div>
        <textarea className="min-h-20 rounded-lg px-3 py-2 bg-background" placeholder="Allergies"
          value={local.intake?.allergies || ''}
          onChange={(e)=>onUpdate({ ...local, intake: { ...(local.intake||{}), allergies: e.target.value }})}/>
        <textarea className="min-h-20 rounded-lg px-3 py-2 bg-background" placeholder="Preferences"
          value={local.intake?.preferences || ''}
          onChange={(e)=>onUpdate({ ...local, intake: { ...(local.intake||{}), preferences: e.target.value }})}/>
        <textarea className="min-h-20 rounded-lg px-3 py-2 bg-background" placeholder="Concerns"
          value={local.intake?.concerns || ''}
          onChange={(e)=>onUpdate({ ...local, intake: { ...(local.intake||{}), concerns: e.target.value }})}/>
        <input className="h-10 rounded-lg px-3 bg-background" placeholder="Reference links (comma separated)"
          value={local.intake?.referenceLinks || ''}
          onChange={(e)=>onUpdate({ ...local, intake: { ...(local.intake||{}), referenceLinks: e.target.value }})}/>
        <input className="h-10 rounded-lg px-3 bg-background" placeholder="On-site address (if different)"
          value={local.intake?.addressOnSite || ''}
          onChange={(e)=>onUpdate({ ...local, intake: { ...(local.intake||{}), addressOnSite: e.target.value }})}/>
        <input className="h-10 rounded-lg px-3 bg-background" placeholder="Time window (e.g., arrive by 8:00 AM)"
          value={local.intake?.timeWindow || ''}
          onChange={(e)=>onUpdate({ ...local, intake: { ...(local.intake||{}), timeWindow: e.target.value }})}/>
      </div>
      <div className="mt-3 text-xs text-muted-foreground">
        Your artist sees updates instantly after you press Save on the page.
      </div>
    </div>
  );
}

```

# FILE: app/dashboard/components/ClientInvoices.tsx

```ts
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

```

# FILE: app/dashboard/components/ClientSchedule.tsx

```ts
// FILE: app/dashboard/components/ClientSchedule.tsx
'use client';
import React from 'react';
import type { Appointment } from "@/components/admin/types";

export default function ClientSchedule({ events }: { events: Appointment[] }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="text-sm font-semibold mb-2">Upcoming Appointments</div>
      <div className="divide-y divide-border/60">
        {(events||[]).length ? (events||[]).map(e => (
          <div key={e.id} className="py-2">
            <div className="flex items-center justify-between text-sm">
              <div className="font-medium">{e.title || 'Service'}</div>
              <div className="text-xs opacity-80">{e.status || 'booked'}</div>
            </div>
            <div className="text-xs text-muted-foreground">
              {new Date(e.start as any).toLocaleString()} — {new Date(e.end as any).toLocaleTimeString()}
            </div>
            {e.location?.city && <div className="text-xs">{e.location.city}{e.location.state?', ':''}{e.location.state||''}</div>}
          </div>
        )) : <div className="text-sm text-muted-foreground">No upcoming appointments.</div>}
      </div>
    </div>
  );
}

```

# FILE: app/dashboard/components/KPICard.tsx

```ts
// FILE: app/dashboard/components/KPICard.tsx
'use client';
import React from 'react';

export default function KPICard({
  label,
  value,
  sublabel,
}: {
  label: string;
  value: string | number;
  sublabel?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card/70 p-4 backdrop-blur">
      <div className="text-xs uppercase text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>
      {sublabel && <div className="mt-1 text-xs text-muted-foreground">{sublabel}</div>}
    </div>
  );
}

```

# FILE: app/dashboard/components/Tabs.tsx

```ts
// FILE: app/dashboard/components/Tabs.tsx
'use client';
import React from 'react';

export default function Tabs({
  tabs,
  current,
  onChange,
}: {
  tabs: { key: string; label: string; badge?: number }[];
  current: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-border bg-popover p-1 w-full sm:w-auto overflow-x-auto">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={[
            'h-9 px-3 rounded-full text-sm whitespace-nowrap flex items-center gap-2',
            current === t.key ? 'bg-primary text-primary-foreground' : 'hover:bg-accent/20',
          ].join(' ')}
        >
          <span>{t.label}</span>
          {typeof t.badge === 'number' && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-background/60 border border-border">
              {t.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

```

# FILE: app/dashboard/layout.tsx

```ts
import type { ReactNode } from 'react';

import '@/styles/admin-surfaces.css';

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session) redirect('/auth/sign-in?callbackUrl=/dashboard');
  const role = (session.user as any)?.role ?? 'USER';
  if (role === 'ADMIN') redirect('/admin');
  return <>{children}</>;
}

```

# FILE: app/dashboard/page.tsx

```ts
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ClientDashboard from "./components/ClientDashboard";

export const metadata: Metadata = {
  title: "Client Dashboard — Fari Makeup",
  description: "Access your bookings, guides, and client resources.",
  alternates: { canonical: '/dashboard' },
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session) {
    redirect("/auth/sign-in?callbackUrl=/dashboard");
  }
  const name = session.user?.name ?? "Welcome";
  const email = session.user?.email ?? "";
  const role = (session.user as any)?.role ?? "USER";

  return <ClientDashboard name={name} email={email} role={role} />;
}

```
