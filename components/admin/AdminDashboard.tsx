// FILE: components/admin/AdminDashboard.tsx  (DROP-IN REPLACEMENT)
"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import CalendarIOS from "./CalendarIOS";
import LeadList from "./LeadList";
import NewLeadModal from "./NewLeadModal";
import HeaderAlerts from "./HeaderAlerts";
import KPIStrip from "./KPIStrip";
import CustomerModal from "./CustomerModal";
import { Lead, Appointment, Sale, STAGES } from "./types";

/* ----- demo data (replace with real data) ----- */
const nowMs = Date.now();
const hourMs = 60 * 60 * 1000;
const DEMO_LEADS: Lead[] = [
  {
    id: "l1",
    name: "Alice Park",
    phone: "555-201",
    email: "alice@example.com",
    stage: "uncontacted",
    dateOfService: new Date(nowMs).toISOString(),
    tags: [],
  },
  {
    id: "l2",
    name: "Brianna Chen",
    phone: "555-202",
    email: "bri@example.com",
    stage: "booked",
    lastContactAt: new Date(nowMs).toISOString(),
    dateOfService: new Date(nowMs + 86400000 * 3).toISOString(),
    tags: ["repeat"],
  },
  {
    id: "l3",
    name: "Cami Diaz",
    phone: "555-203",
    email: "cami@example.com",
    stage: "completed",
    lastContactAt: new Date(nowMs - 86400000).toISOString(),
    dateOfService: new Date(nowMs - 86400000 * 10).toISOString(),
    tags: [],
  },
];
const DEMO_EVENTS: Appointment[] = [
  {
    id: "e1",
    title: "Bridal Trial — Alice",
    start: new Date(nowMs).toISOString(),
    end: new Date(nowMs + hourMs).toISOString(),
    price: 120,
    leadId: "l1",
    status: "booked",
    service: "trial",
  },
  {
    id: "e2",
    title: "Wedding — Brianna",
    start: new Date(nowMs + 86400000 * 3).toISOString(),
    end: new Date(nowMs + 86400000 * 3 + hourMs * 4).toISOString(),
    price: 380,
    leadId: "l2",
    status: "booked",
    service: "wedding",
  },
  {
    id: "e3",
    title: "Studio — Cami",
    start: new Date(nowMs - 86400000 * 10).toISOString(),
    end: new Date(nowMs - 86400000 * 10 + hourMs * 2).toISOString(),
    price: 180,
    leadId: "l3",
    status: "completed",
    service: "studio",
  },
];
const DEMO_SALES: Sale[] = [
  { id: "s1", amount: 59, type: "guide", createdAt: new Date(nowMs).toISOString() },
];

type DbLead = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  eventDate: Date | string | null;
  message: string | null;
  source: string | null;
  createdAt: Date | string;
};

const mapDbLead = (row: DbLead): Lead & Record<string, any> => {
  const eventDateIso =
    row.eventDate instanceof Date
      ? row.eventDate.toISOString()
      : row.eventDate
      ? new Date(row.eventDate).toISOString()
      : undefined;

  const emailPlaceholder = "no-email@placeholder.invalid";

  return {
    id: row.id,
    name: row.name || "New inquiry",
    email: row.email && row.email !== emailPlaceholder ? row.email : undefined,
    phone: row.phone || undefined,
    stage: "uncontacted",
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
    dateOfService: eventDateIso,
    tags: row.source ? [row.source] : [],
    notes: row.message
      ? [
          {
            id: `msg-${row.id}`,
            text: row.message,
            at:
              row.createdAt instanceof Date
                ? row.createdAt.toISOString()
                : (row.createdAt as string),
          },
        ]
      : [],
    source: row.source ?? undefined,
  } as Lead & Record<string, any>;
};

type ViewMode = "calendar" | "leads" | "contracts" | "invoices" | "content";
type SortMode = "alpha" | "bookingType" | "contacted" | "completed" | "upcoming" | "repeat";

export default function AdminDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [events] = useState<Appointment[]>(DEMO_EVENTS);
  const [sales]  = useState<Sale[]>(DEMO_SALES);
  const [isLoading, setIsLoading] = useState(true);
  const [latestFetchError, setLatestFetchError] = useState<string | null>(null);

  const [view, setView] = useState<ViewMode>("calendar");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortMode>("alpha");
  const [, setShowOverdue] = useState(false);
  const [, setShowUnsigned] = useState(false);

  // New lead modal
  const [newOpen, setNewOpen] = useState(false);
  const [newDate, setNewDate] = useState<Date | null>(null);

  // Lead details modal
  const [leadOpen, setLeadOpen] = useState(false);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);

  const openLead = (l: Lead) => { setActiveLead(l); setLeadOpen(true); };
  const closeLead = () => setLeadOpen(false);

  // Create & update helpers
  const loadLeads = useCallback(async () => {
    setIsLoading(true);
    setLatestFetchError(null);
    try {
      const res = await fetch("/api/leads", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json?.ok && Array.isArray(json.leads)) {
        setLeads(json.leads.map(mapDbLead));
      } else {
        throw new Error(json?.error || "Unexpected response");
      }
    } catch (err) {
      console.error("Failed to load leads", err);
      setLeads(DEMO_LEADS);
      setLatestFetchError("Live leads unavailable — showing demo data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLeads();
  }, [loadLeads]);

  const handleDayCreate = (date: Date) => { setNewDate(date); setNewOpen(true); };
  const handleCreateLead = async (lead: Lead) => {
    try {
      const payload = {
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        eventDate: lead.dateOfService,
        message: Array.isArray((lead as any).notes) && (lead as any).notes[0]?.text
          ? (lead as any).notes[0].text
          : undefined,
        source: "admin-dashboard",
      };
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json?.ok && json.lead) {
        setLeads(prev => [mapDbLead(json.lead), ...prev]);
      } else {
        throw new Error(json?.error || "Unable to save lead");
      }
    } catch (err) {
      console.error("Lead save failed, keeping local copy", err);
      setLeads(prev => [lead, ...prev]);
    } finally {
      setNewOpen(false);
    }
  };
  const handleUpdateLead = (patch: Lead) => {
    setLeads(prev => prev.map(l => (l.id === patch.id ? { ...l, ...patch } : l)));
    setActiveLead(patch);
  };
  const handleDeleteLead = (id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
    setLeadOpen(false);
  };

  // Filter + sort for Leads view
  const visibleLeads = useMemo(() => {
    const q = search.trim().toLowerCase();
    let arr = leads.filter(l => {
      if (!q) return true;
      const hay = `${l.name ?? ""} ${l.email ?? ""} ${l.phone ?? ""}`.toLowerCase();
      return hay.includes(q);
    });

    const dateOrNull = (d: any) =>
      d ? new Date(d).getTime() : Number.NaN;
    const stageRank = STAGES.reduce<Record<string, number>>((acc, stage, index) => {
      acc[stage] = index;
      return acc;
    }, {});

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
            <HeaderAlerts
              leads={leads}
              onOpenOverdue={() => setShowOverdue(true)}
              onOpenUnsigned={() => setShowUnsigned(true)}
            />
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
                <button
                  onClick={() => void loadLeads()}
                  className="h-9 rounded-xl border border-border/60 px-3 text-sm hover:bg-accent/15"
                  disabled={isLoading}
                >
                  {isLoading ? "Refreshing…" : "Refresh"}
                </button>
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

          {latestFetchError && (
            <div className="wglass panel text-sm text-amber-200 border border-amber-300/40 bg-amber-500/10">
              {latestFetchError}
            </div>
          )}

          {view === "leads" && (
            <div className="wglass panel-lg">
              <LeadList leads={visibleLeads} onOpen={openLead} />
              {isLoading && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Loading latest leads…
                </p>
              )}
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
