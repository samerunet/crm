// FILE: components/admin/AdminDashboard.tsx  (DROP-IN REPLACEMENT)
"use client";

import React, { useMemo, useState } from "react";
import CalendarIOS from "./CalendarIOS";
import LeadList from "./LeadList";
import NewLeadModal from "./NewLeadModal";
import HeaderAlerts from "./HeaderAlerts";
import KPIStrip from "./KPIStrip";
import CustomerModal from "./CustomerModal";
import type { Appointment, Lead, Sale } from "./types";

/* ----- demo data (replace with real data) ----- */
const DEMO_LEADS: Lead[] = [
  { id: "l1", name: "Alice Park", phone: "555-201", email: "alice@example.com", stage: "new", lastContactAt: null, dateOfService: new Date() as any, tags: [] },
  { id: "l2", name: "Brianna Chen", phone: "555-202", email: "bri@example.com", stage: "booked", lastContactAt: new Date() as any, dateOfService: new Date(Date.now()+86400000*3) as any, tags: ["repeat"] },
  { id: "l3", name: "Cami Diaz", phone: "555-203", email: "cami@example.com", stage: "completed", lastContactAt: new Date() as any, dateOfService: new Date(Date.now()-86400000*10) as any, tags: [] },
];
const DEMO_EVENTS: Appointment[] = [
  { id: "e1", title: "Bridal Trial — Alice", date: new Date() as any, price: 120, leadId: "l1", status: "booked", service: "trial" },
  { id: "e2", title: "Wedding — Brianna", date: new Date(Date.now()+86400000*3) as any, price: 380, leadId: "l2", status: "booked", service: "wedding" },
  { id: "e3", title: "Studio — Cami",   date: new Date(Date.now()-86400000*10) as any, price: 180, leadId: "l3", status: "completed", service: "studio" },
];
const DEMO_SALES: Sale[] = [
  { id: "s1", leadId: "l2", amount: 59, type: "guide", createdAt: new Date() as any },
];

type ViewMode = "calendar" | "leads" | "contracts" | "invoices" | "content";
type SortMode = "alpha" | "bookingType" | "contacted" | "completed" | "upcoming" | "repeat";

export default function AdminDashboard() {
  const [leads, setLeads] = useState<Lead[]>(DEMO_LEADS);
  const [events, setEvents] = useState<Appointment[]>(DEMO_EVENTS);
  const [sales]  = useState<Sale[]>(DEMO_SALES);

  const [view, setView] = useState<ViewMode>("calendar");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortMode>("alpha");

  // New lead modal
  const [newOpen, setNewOpen] = useState(false);
  const [newDate, setNewDate] = useState<Date | null>(null);

  // Lead details modal
  const [leadOpen, setLeadOpen] = useState(false);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);

  const openLead = (l: Lead) => { setActiveLead(l); setLeadOpen(true); };
  const closeLead = () => setLeadOpen(false);

  // Create & update helpers
  const handleDayCreate = (date: Date) => { setNewDate(date); setNewOpen(true); };
  const handleCreateLead = (lead: Lead) => { setLeads(prev => [lead, ...prev]); setNewOpen(false); };
  const handleUpdateLead = (patch: Lead) => {
    setLeads(prev => prev.map(l => (l.id === patch.id ? { ...l, ...patch } : l)));
    setActiveLead(patch);
  };
  const handleDeleteLead = (id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
    setLeadOpen(false);
  };

  // Alerts counts
  const overdueCount   = useMemo(() => leads.filter(l => l.stage !== "completed" && !l.lastContactAt).length, [leads]);
  const unsignedCount  = 0;
  const unpaidCount    = 0;

  // Filter + sort for Leads view
  const visibleLeads = useMemo(() => {
    const q = search.trim().toLowerCase();
    let arr = leads.filter(l => {
      if (!q) return true;
      const hay = `${l.name ?? ""} ${l.email ?? ""} ${l.phone ?? ""}`.toLowerCase();
      return hay.includes(q);
    });

    const dateOrNull = (d: any) => (d ? new Date(d).getTime() : Number.NaN);
    const stageRank: Record<string, number> = {
      new: 1, contacted: 2, deposit: 3, trial: 4, booked: 5, confirmed: 6, changes: 7, completed: 8
    };

    arr.sort((a, b) => {
      switch (sort) {
        case "alpha":
          return (a.name || "").localeCompare(b.name || "");
        case "bookingType":
          return (a as any).service?.localeCompare((b as any).service || "") || (a.name || "").localeCompare(b.name || "");
        case "contacted":
          return (b.lastContactAt ? 1 : 0) - (a.lastContactAt ? 1 : 0) ||
                 dateOrNull(b.lastContactAt) - dateOrNull(a.lastContactAt);
        case "completed":
          return (b.stage === "completed" ? 1 : 0) - (a.stage === "completed" ? 1 : 0) ||
                 (stageRank[a.stage] ?? 99) - (stageRank[b.stage] ?? 99);
        case "upcoming":
          return (dateOrNull(a.dateOfService) || 9e15) - (dateOrNull(b.dateOfService) || 9e15);
        case "repeat":
          const aRep = (a.tags || []).includes("repeat") ? 1 : 0;
          const bRep = (b.tags || []).includes("repeat") ? 1 : 0;
          return bRep - aRep || (a.name || "").localeCompare(b.name || "");
        default:
          return 0;
      }
    });

    return arr;
  }, [leads, search, sort]);

  return (
    <div className="crm-shell section-y">
      <div className="grid grid-cols-12 gap-3">
        {/* LEFT: Sidebar (sticky on lg+) */}
        <aside className="hidden lg:block col-span-3">
          <div className="wglass-strong panel-lg side-shadow-right sticky top-[88px]">
            <div className="text-sm font-semibold mb-2">Dashboard</div>
            <nav className="grid gap-1">
              {[
                { id: "calendar",  label: "Calendar"  },
                { id: "leads",     label: "Leads"     },
                { id: "contracts", label: "Contracts" },
                { id: "invoices",  label: "Invoices"  },
                { id: "content",   label: "Content"   },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setView(t.id as ViewMode)}
                  className={[
                    "h-10 rounded-xl px-3 text-sm text-left border transition",
                    view === (t.id as ViewMode)
                      ? "bg-primary/15 border-border/70"
                      : "border-border/60 hover:bg-accent/15"
                  ].join(" ")}
                >
                  {t.label}
                </button>
              ))}

              <div className="h-px bg-border/60 my-2" />

              <button
                onClick={() => { setNewDate(null); setNewOpen(true); }}
                className="gbtn h-10 rounded-xl px-3 text-sm"
              >
                + New lead
              </button>
            </nav>
          </div>
        </aside>

        {/* RIGHT: Main content */}
        <section className="col-span-12 lg:col-span-9 grid gap-3">
          <div className="wglass panel">
            <HeaderAlerts leads={leads} overdue={overdueCount} unsigned={unsignedCount} unpaid={unpaidCount} />
          </div>

          <div className="wglass panel">
            <KPIStrip events={events} sales={sales} leads={leads} />
          </div>

          <div className="wglass panel flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <button
                className={`h-9 rounded-xl px-3 text-sm border ${view === "calendar" ? "bg-primary/15 border-border/70" : "border-border/60 hover:bg-accent/20"}`}
                onClick={() => setView("calendar")}
              >
                Calendar
              </button>
              <button
                className={`h-9 rounded-xl px-3 text-sm border ${view === "leads" ? "bg-primary/15 border-border/70" : "border-border/60 hover:bg-accent/20"}`}
                onClick={() => setView("leads")}
              >
                Leads
              </button>
            </div>

            {view === "leads" && (
              <div className="flex flex-wrap items-center gap-2">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, email, phone…"
                  className="crm-input w-[200px] sm:w-[260px]"
                />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortMode)}
                  className="crm-input w-[180px]"
                >
                  <option value="alpha">Sort: A → Z</option>
                  <option value="bookingType">Sort: Booking type</option>
                  <option value="contacted">Sort: Contacted</option>
                  <option value="completed">Sort: Completed</option>
                  <option value="upcoming">Sort: Upcoming</option>
                  <option value="repeat">Sort: Repeat customers</option>
                </select>
              </div>
            )}

            <button
              className="gbtn h-9 rounded-xl px-3 text-sm lg:hidden"
              onClick={() => { setNewDate(null); setNewOpen(true); }}
            >
              + New lead
            </button>
          </div>

          {view === "calendar" && (
            <div className="wglass panel-lg">
              <CalendarIOS
                events={events}
                leads={leads}
                onEventOpen={(e) => {
                  if (e.leadId) {
                    const found = leads.find(l => l.id === e.leadId);
                    if (found) openLead(found);
                  }
                }}
                onDayCreate={(d) => handleDayCreate(d)}
              />
            </div>
          )}

          {view === "leads" && (
            <div className="wglass panel-lg">
              <LeadList leads={visibleLeads} onOpen={openLead} />
            </div>
          )}

          {view !== "calendar" && view !== "leads" && (
            <div className="wglass panel-lg text-sm text-muted-foreground">
              {view === "contracts" && "Contracts view — wire up your contract list here"}
              {view === "invoices"  && "Invoices view — wire up your invoice list here"}
              {view === "content"   && "Content view — add/upload your guides & products here"}
            </div>
          )}
        </section>
      </div>

      {/* New lead modal */}
      <NewLeadModal
        open={newOpen}
        onClose={() => setNewOpen(false)}
        initialDate={newDate ?? undefined}
        onCreate={handleCreateLead}
      />

      {/* Lead details modal */}
      <CustomerModal
        open={leadOpen}
        lead={activeLead}
        onClose={closeLead}
        onUpdate={handleUpdateLead}
        onDelete={handleDeleteLead}
      />
    </div>
  );
}
