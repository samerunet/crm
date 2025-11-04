
# FILE: components/admin/AdminDashboard.tsx

```ts
// FILE: components/admin/AdminDashboard.tsx  (DROP-IN REPLACEMENT)
"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import CalendarIOS from "./CalendarIOS";
import LeadList from "./LeadList";
import NewLeadModal from "./NewLeadModal";
import HeaderAlerts from "./HeaderAlerts";
import KPIStrip from "./KPIStrip";
import CustomerModal from "./CustomerModal";
import { Lead, Appointment, Sale, STAGES, LeadStage } from "./types";

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

const EMAIL_PLACEHOLDER = "no-email@placeholder.invalid";

const parseMessageDetails = (raw?: string | null) => {
  if (!raw) {
    return { note: null, details: {} as Record<string, string> };
  }
  const parts = raw.split(/\n{2,}/);
  const note = parts.shift()?.trim() || null;
  const detailLines = parts
    .join("\n")
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const details: Record<string, string> = {};
  for (const line of detailLines) {
    const idx = line.indexOf(":");
    if (idx <= 0) continue;
    const key = line.slice(0, idx).trim().toLowerCase();
    const value = line.slice(idx + 1).trim();
    if (!value) continue;
    details[key] = value;
  }
  return { note, details };
};

const safeIso = (value?: string | Date | null) => {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

const formatDateForMessage = (value?: string | Date | null) => {
  if (!value) return "";
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
    return trimmed;
  }
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
};

const buildMessageFromLead = (lead: Lead & Record<string, any>) => {
  const primary =
    (Array.isArray(lead.notes) && lead.notes[0]?.text) ||
    (lead.intake?.initialMessage as string | undefined) ||
    (typeof lead.notes === "string" ? lead.notes : "") ||
    "";

  const serviceLabel =
    lead.eventType ||
    (typeof lead.intake?.service === "string" ? lead.intake.service : undefined) ||
    undefined;
  const preferredDate =
    lead.intake?.preferredDate || lead.dateOfService || undefined;
  const eventTime = lead.eventTime || lead.intake?.eventTime || undefined;
  const location = lead.location || lead.intake?.location || undefined;
  const partySize =
    typeof lead.partySize === "number"
      ? lead.partySize
      : typeof lead.intake?.partySize === "number"
      ? lead.intake.partySize
      : undefined;
  const addOns =
    (Array.isArray(lead.addOns) && lead.addOns.length
      ? lead.addOns
      : Array.isArray(lead.intake?.addOns)
      ? lead.intake.addOns
      : []
    )
      .map((item: any) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);

  const detailLines: string[] = [];
  if (serviceLabel) detailLines.push(`Service: ${serviceLabel}`);
  if (preferredDate) detailLines.push(`Preferred date: ${formatDateForMessage(preferredDate)}`);
  if (eventTime) detailLines.push(`Event time: ${eventTime}`);
  if (location) detailLines.push(`Location: ${location}`);
  if (typeof partySize === "number") detailLines.push(`Party size: ${partySize}`);
  if (addOns.length) detailLines.push(`Add-ons: ${addOns.join(", ")}`);
  if (lead.stage) detailLines.push(`Stage: ${lead.stage}`);
  if (lead.phone) detailLines.push(`Phone: ${lead.phone}`);
  if (lead.email && lead.email !== EMAIL_PLACEHOLDER) detailLines.push(`Email: ${lead.email}`);
  if (lead.source) detailLines.push(`Source: ${lead.source}`);
  if (lead.intake?.skinType) detailLines.push(`Skin type: ${lead.intake.skinType}`);
  if (lead.intake?.allergies) detailLines.push(`Allergies: ${lead.intake.allergies}`);
  if (lead.intake?.style) detailLines.push(`Preferred style: ${lead.intake.style}`);
  if (lead.intake?.refs) detailLines.push(`Reference links: ${lead.intake.refs}`);

  const extraNotes: string[] = [];
  if (lead.internalNotes) extraNotes.push(`Internal notes: ${lead.internalNotes}`);
  if (lead.intake?.notes) extraNotes.push(`Intake notes: ${lead.intake.notes}`);
  if (Array.isArray(lead.notes)) {
    lead.notes.slice(1).forEach((n: any) => {
      if (!n?.text) return;
      const timestamp =
        (typeof n.at === "string" && n.at) || safeIso(n.at) || formatDateForMessage(n.at) || "";
      extraNotes.push(timestamp ? `Note (${timestamp}): ${n.text}` : n.text);
    });
  }

  const sections = [
    primary.trim(),
    detailLines.join("\n").trim(),
    extraNotes.join("\n").trim(),
  ].filter(Boolean);

  return sections.length ? sections.join("\n\n") : null;
};

const buildLeadUpdatePayload = (lead: Lead & Record<string, any>) => {
  const email = lead.email?.trim() || EMAIL_PLACEHOLDER;
  const eventDateIso =
    safeIso(lead.dateOfService) ??
    safeIso(lead.intake?.preferredDate ?? undefined) ??
    null;

  const message = buildMessageFromLead(lead);

  return {
    id: lead.id,
    name: lead.name?.trim() || null,
    email,
    phone: lead.phone?.trim() || null,
    eventDate: eventDateIso,
    message,
    source: lead.source?.trim() || null,
  };
};

const leadSnapshot = (lead: Lead & Record<string, any>) =>
  JSON.stringify({
    ...buildLeadUpdatePayload(lead),
    stage: lead.stage,
  });

const mapDbLead = (row: DbLead): Lead & Record<string, any> => {
  const eventDateIso = safeIso(row.eventDate);
  const { note, details } = parseMessageDetails(row.message ?? undefined);

  const preferredDateIso = safeIso(details["preferred date"]);
  const serviceLabel = details["service"] || undefined;
  const eventTime = details["event time"] || undefined;
  const location = details["location"] || undefined;
  const partySizeText = details["party size"] || undefined;
  const partySize = partySizeText
    ? Number.parseInt(partySizeText.replace(/[^0-9]/g, ""), 10) || undefined
    : undefined;
  const addOns = details["add-ons"]
    ? details["add-ons"]
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : undefined;
  const stageRaw = details["stage"];
  const normalizedStage =
    typeof stageRaw === "string"
      ? STAGES.find((s) => s.toLowerCase() === stageRaw.trim().toLowerCase())
      : undefined;
  const skinType = details["skin type"] || undefined;
  const allergies = details["allergies"] || undefined;
  const preferredStyle = details["preferred style"] || undefined;
  const refs = details["reference links"] || undefined;
  const intakeNotes = details["intake notes"] || undefined;
  const internalNotes = details["internal notes"] || undefined;

  const primaryNote = note || (row.message?.trim()?.length ? row.message : "");
  const createdIso = safeIso(row.createdAt) ?? new Date().toISOString();
  const noteEntry = primaryNote
    ? [
        {
          id: `msg-${row.id}`,
          text: primaryNote,
          at: createdIso,
        },
      ]
    : [];

  const intake: Record<string, any> = {
    capturedAt: createdIso,
  };
  if (serviceLabel) intake.service = serviceLabel;
  if (preferredDateIso) intake.preferredDate = preferredDateIso;
  if (eventTime) intake.eventTime = eventTime;
  if (location) intake.location = location;
  if (typeof partySize === "number") intake.partySize = partySize;
  if (addOns) intake.addOns = addOns;
  if (primaryNote) intake.initialMessage = primaryNote;
  if (skinType) intake.skinType = skinType;
  if (allergies) intake.allergies = allergies;
  if (preferredStyle) intake.style = preferredStyle;
  if (refs) intake.refs = refs;
  if (intakeNotes) intake.notes = intakeNotes;

  return {
    id: row.id,
    name: row.name || "New inquiry",
    email: row.email && row.email !== EMAIL_PLACEHOLDER ? row.email : undefined,
    phone: row.phone || undefined,
    stage: (normalizedStage ?? "uncontacted") as LeadStage,
    createdAt: createdIso,
    dateOfService: eventDateIso ?? preferredDateIso,
    eventTime,
    location,
    partySize,
    eventType: serviceLabel,
    tags: row.source ? [row.source] : [],
    notes: noteEntry,
    intake,
    addOns,
    internalNotes: internalNotes || undefined,
    source: row.source ?? undefined,
  } as Lead & Record<string, any>;
};

type ViewMode = "calendar" | "leads" | "contracts" | "invoices" | "content";
type SortMode = "alpha" | "bookingType" | "contacted" | "completed" | "upcoming" | "repeat";
type TimeframeKey = "today" | "tomorrow" | "week";

const TIMEFRAME_OPTIONS: { value: TimeframeKey; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "tomorrow", label: "Tomorrow" },
  { value: "week", label: "This Week" },
];

const DAY_MS = 24 * 60 * 60 * 1000;
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

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
  const [timeframe, setTimeframe] = useState<TimeframeKey>("today");

  // Lead details modal
  const [leadOpen, setLeadOpen] = useState(false);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [leadBaseline, setLeadBaseline] = useState<(Lead & Record<string, any>) | null>(null);
  const [savingLead, setSavingLead] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const openLead = (l: Lead) => {
    setActiveLead(l);
    setLeadBaseline(JSON.parse(JSON.stringify(l)) as Lead & Record<string, any>);
    setSaveError(null);
    setLeadOpen(true);
  };
  const closeLead = () => {
    if (activeLead && leadBaseline) {
      const hasChanges =
        leadSnapshot(activeLead as Lead & Record<string, any>) !== leadSnapshot(leadBaseline);
      if (hasChanges) {
        const reverted = JSON.parse(JSON.stringify(leadBaseline)) as Lead & Record<string, any>;
        setLeads((prev) =>
          prev.map((l) =>
            l.id === activeLead.id ? reverted : l,
          ),
        );
      }
    }
    setLeadOpen(false);
    setActiveLead(null);
    setLeadBaseline(null);
    setSaveError(null);
  };

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

  useEffect(() => {
    const handler = (event: Event) => {
      const custom = event as CustomEvent<Lead>;
      if (custom?.detail) {
        setActiveLead(custom.detail);
        setLeadOpen(true);
      }
    };
    window.addEventListener("dashboard:navigateToLead", handler as EventListener);
    return () => {
      window.removeEventListener("dashboard:navigateToLead", handler as EventListener);
    };
  }, []);

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
    setSaveError(null);
  };
  const handleDeleteLead = (id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
    setLeadOpen(false);
    setActiveLead(null);
    setLeadBaseline(null);
  };

  const handleSaveLead = async (draft: Lead & Record<string, any>) => {
    setSavingLead(true);
    setSaveError(null);
    try {
      const payload = buildLeadUpdatePayload(draft);
      const res = await fetch("/api/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok || !json.lead) {
        throw new Error(json?.error || `HTTP ${res.status}`);
      }
      const updated = mapDbLead(json.lead);
      setLeads(prev => prev.map((l) => (l.id === updated.id ? updated : l)));
      setActiveLead(updated);
      setLeadBaseline(JSON.parse(JSON.stringify(updated)) as Lead & Record<string, any>);
    } catch (err: any) {
      console.error("Failed to save lead", err);
      setSaveError(err?.message || "Failed to save lead");
    } finally {
      setSavingLead(false);
    }
  };

  const isLeadDirty = useMemo(() => {
    if (!activeLead || !leadBaseline) return false;
    return (
      leadSnapshot(activeLead as Lead & Record<string, any>) !== leadSnapshot(leadBaseline)
    );
  }, [activeLead, leadBaseline]);

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

  const timeframeConfig = useMemo(() => {
    const now = new Date();
    const todayStart = startOfDay(now);
    switch (timeframe) {
      case "today": {
        const start = todayStart;
        return {
          start,
          end: new Date(start.getTime() + DAY_MS),
          label: "Today",
          focusDate: start,
          viewMode: "today" as const,
        };
      }
      case "tomorrow": {
        const start = new Date(todayStart.getTime() + DAY_MS);
        return {
          start,
          end: new Date(start.getTime() + DAY_MS),
          label: "Tomorrow",
          focusDate: start,
          viewMode: "today" as const,
        };
      }
      case "week": {
        const start = todayStart;
        return {
          start,
          end: new Date(start.getTime() + 7 * DAY_MS),
          label: "This Week",
          focusDate: start,
          viewMode: "month" as const,
        };
      }
      default: {
        const start = todayStart;
        return {
          start,
          end: new Date(start.getTime() + DAY_MS),
          label: "Today",
          focusDate: start,
          viewMode: "today" as const,
        };
      }
    }
  }, [timeframe]);

  const filteredEvents = useMemo(() => {
    const startMs = timeframeConfig.start.getTime();
    const endMs = timeframeConfig.end.getTime();
    return (events ?? []).filter((event) => {
      const value = event?.start ?? (event as any)?.dateISO ?? (event as any)?.startAt;
      if (!value) return false;
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return false;
      const ms = date.getTime();
      return ms >= startMs && ms < endMs;
    });
  }, [events, timeframeConfig]);

  const filteredSales = useMemo(() => {
    const startMs = timeframeConfig.start.getTime();
    const endMs = timeframeConfig.end.getTime();
    return (sales ?? []).filter((sale) => {
      const value = sale?.createdAt;
      if (!value) return false;
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return false;
      const ms = date.getTime();
      return ms >= startMs && ms < endMs;
    });
  }, [sales, timeframeConfig]);

  const filteredLeadsForKPI = useMemo(() => {
    const startMs = timeframeConfig.start.getTime();
    const endMs = timeframeConfig.end.getTime();
    return leads.filter((lead) => {
      const value = lead?.dateOfService ?? lead?.createdAt;
      if (!value) return false;
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return false;
      const ms = date.getTime();
      return ms >= startMs && ms < endMs;
    });
  }, [leads, timeframeConfig]);

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
            <KPIStrip
              events={filteredEvents}
              sales={filteredSales}
              leads={filteredLeadsForKPI}
              timeframeLabel={timeframeConfig.label}
            />
          </div>

          <div className="wglass panel flex flex-wrap items-center gap-2">
            <div className="mr-auto flex flex-wrap items-center gap-2">
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

              {view === "calendar" && (
                <div className="flex flex-wrap items-center gap-1">
                  {TIMEFRAME_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setTimeframe(option.value)}
                      className={[
                        "h-9 rounded-xl px-3 text-sm border transition",
                        timeframe === option.value
                          ? "bg-primary/15 border-border/70"
                          : "border-border/60 hover:bg-accent/20",
                      ].join(" ")}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
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
                events={filteredEvents}
                leads={leads}
                focusDate={timeframeConfig.focusDate}
                viewMode={timeframeConfig.viewMode}
                rangeLabel={timeframeConfig.label}
                onRequestTimeframeChange={setTimeframe}
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
        onSave={handleSaveLead}
        canSave={isLeadDirty}
        saving={savingLead}
        saveError={saveError}
      />
    </div>
  );
}

```

# FILE: components/admin/AlertsModal.tsx

```ts
// components/admin/AlertsModal.tsx
'use client';
import React, { useMemo } from 'react';
import type { Lead } from './types';

type Kind = 'overdue' | 'unsigned';

export default function AlertsModal({
  open,
  kind,
  leads,
  onClose,
  onSelectLead,
}: {
  open: boolean;
  kind: Kind;
  leads: Lead[];
  onClose: () => void;
  onSelectLead: (lead: Lead) => void;
}) {
  const rows = useMemo(() => {
    if (!open) return [];

    if (kind === 'overdue') {
      const now = Date.now();
      type Row = {
        type: 'invoice';
        lead: Lead;
        id: string;
        number?: string;
        dueAt?: Date;
        total: number;
        paid: number;
        balance: number;
        daysOverdue: number;
      };
      const out: Row[] = [];
      for (const lead of leads ?? []) {
        for (const inv of lead.invoices ?? []) {
          const dueMs = inv?.dueAt ? new Date(inv.dueAt).getTime() : NaN;
          const isPaid = inv?.status === 'paid';
          const overdue =
            inv?.status === 'overdue' ||
            (!isPaid && Number.isFinite(dueMs) && dueMs < now);
          if (!overdue) continue;

          const paid = (inv.payments ?? []).reduce(
            (a, p) => a + (Number(p.amount) || 0),
            0
          );
          const total = Number(inv.total) || (inv.lines ?? []).reduce((a, l) => a + (Number(l.amount) || 0), 0);
          const balance = Math.max(0, total - paid);
          const daysOverdue = Number.isFinite(dueMs)
            ? Math.max(1, Math.ceil((now - dueMs) / (1000 * 60 * 60 * 24)))
            : 0;

          out.push({
            type: 'invoice',
            lead,
            id: inv.id,
            number: inv.number,
            dueAt: inv.dueAt ? new Date(inv.dueAt) : undefined,
            total,
            paid,
            balance,
            daysOverdue,
          });
        }
      }
      // most overdue first
      out.sort((a, b) => b.daysOverdue - a.daysOverdue);
      return out;
    }

    // kind === 'unsigned'
    type Row = {
      type: 'contract';
      lead: Lead;
      id: string;
      template?: string;
      status: string;
      sentAt?: Date;
    };
    const out2: Row[] = [];
    for (const lead of leads ?? []) {
      for (const c of lead.contracts ?? []) {
        const isWedding = (c.template || '').startsWith('wedding_');
        if (!isWedding || c.status === 'signed') continue;
        out2.push({
          type: 'contract',
          lead,
          id: c.id,
          template: c.template,
          status: c.status,
          sentAt: c.sentAt ? new Date(c.sentAt) : undefined,
        });
      }
    }
    return out2;
  }, [open, kind, leads]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Panel */}
      <div className="relative w-[95vw] sm:w-[640px] max-h-[85vh] overflow-hidden rounded-2xl border border-border bg-card shadow-xl glass-2 specular">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="font-semibold">
            {kind === 'overdue' ? 'Overdue invoices' : 'Unsigned wedding contracts'}
          </div>
          <button
            onClick={onClose}
            className="h-8 px-3 rounded-lg border border-border bg-popover hover:bg-accent/20 text-sm"
          >
            Close
          </button>
        </div>

        {/* List */}
        <div className="overflow-auto max-h-[70vh] divide-y divide-border/60">
          {rows.length === 0 && (
            <div className="p-4 text-sm text-muted-foreground">
              No items to show.
            </div>
          )}

          {kind === 'overdue' &&
            rows.map((r: any) => (
              <button
                key={r.id}
                onClick={() => onSelectLead(r.lead)}
                className="w-full text-left p-3 hover:bg-accent/10"
                title="Open client"
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium">{r.lead.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {r.daysOverdue}d overdue
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {r.number ? `${r.number} • ` : ''}
                  Due {r.dueAt ? r.dueAt.toLocaleDateString() : '—'}
                  {' • '}
                  Total {fmtUSD(r.total)} · Paid {fmtUSD(r.paid)} · Balance{' '}
                  {fmtUSD(r.balance)}
                </div>
              </button>
            ))}

          {kind === 'unsigned' &&
            rows.map((r: any) => (
              <button
                key={r.id}
                onClick={() => onSelectLead(r.lead)}
                className="w-full text-left p-3 hover:bg-accent/10"
                title="Open client"
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium">{r.lead.name}</div>
                  <div className="text-xs text-muted-foreground capitalize">
                    {r.status}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Template: {r.template || '—'}
                  {r.sentAt ? ` • Sent ${r.sentAt.toLocaleDateString()}` : ''}
                </div>
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}

function fmtUSD(n: number) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(n) ? n : 0);
}

```

# FILE: components/admin/BigCalendar.tsx

```ts
// components/BigCalendar.tsx
// Selectable calendar + event click with event styling hook
'use client';
import React from 'react';
import { Calendar, dateFnsLocalizer, SlotInfo } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import type { Appointment } from './types';

const locales = { 'en-US': enUS } as const;
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

export default function BigCalendar({
  events,
  onCreateAt,
  onOpenEvent,
  eventStyle,
}: {
  events: Appointment[];
  onCreateAt: (slotStart: Date) => void;
  onOpenEvent: (appt: Appointment) => void;
  eventStyle?: (e: Appointment) => React.CSSProperties | undefined;
}) {
  const normalizedEvents = (Array.isArray(events) ? events : []).map((evt) => {
    const start = evt?.start ? new Date(evt.start) : undefined;
    const end = evt?.end ? new Date(evt.end) : undefined;
    return {
      ...evt,
      start: start && !Number.isNaN(start.getTime()) ? start : new Date(),
      end:
        end && !Number.isNaN(end.getTime())
          ? end
          : start && !Number.isNaN(start.getTime())
          ? new Date(start.getTime() + 60 * 60 * 1000)
          : new Date(),
    };
  });

  return (
    <div className="rounded-2xl shadow p-3 bg-white dark:bg-neutral-900">
      <Calendar
        localizer={localizer}
        events={normalizedEvents}
        startAccessor="start"
        endAccessor="end"
        defaultView="week"
        style={{ height: 680 }}
        selectable
        onSelectSlot={(slot: SlotInfo) => {
          const start =
            Array.isArray(slot.slots) && slot.slots.length > 0
              ? new Date(slot.slots[0])
              : new Date(slot.start);
          onCreateAt(start);
        }}
        onSelectEvent={(evt) => onOpenEvent(evt as Appointment)}
        popup
        step={30}
        timeslots={2}
        eventPropGetter={(event) => ({ style: eventStyle?.(event as Appointment) })}
      />
    </div>
  );
}

```

# FILE: components/admin/CalendarIOS.tsx

```ts
// FILE: components/admin/CalendarIOS.tsx  (DROP-IN REPLACEMENT)
"use client";

import React, { useMemo, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import type { Appointment, Lead } from "./types";

/** Safely pull a Date from many possible event fields */
function getEventDate(e: any): Date | null {
  const v = e?.start || e?.dateISO || e?.startAt || e?.when;
  if (!v) return null;
  const d = new Date(v);
  return isNaN(+d) ? null : d;
}
function getEventEnd(e: any, start: Date | null): Date | null {
  const v = e?.end || e?.endAt || e?.finish || e?.endTime;
  if (v) {
    const d = new Date(v);
    if (!isNaN(+d)) return d;
  }
  if (start) {
    return new Date(start.getTime() + 60 * 60 * 1000);
  }
  return null;
}
const toTime = (value: Date | string | null | undefined) => {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};
function ymd(d: Date) {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const dd = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${dd}`;
}
function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function addMonths(d: Date, delta: number) {
  return new Date(d.getFullYear(), d.getMonth() + delta, 1);
}
function monthLabel(d: Date) {
  return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

type StatusCategory = "new" | "pending" | "booked" | "other";
type RangeShortcut = "today" | "tomorrow" | "week";

const CATEGORY_COLORS: Record<StatusCategory, string> = {
  new: "#ef4444",
  pending: "#f59e0b",
  booked: "#22c55e",
  other: "#64748b",
};

function hexToRgba(hex: string, alpha: number) {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean.length === 3 ? clean.repeat(2) : clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function categorizeEvent(lead?: Lead, event?: Appointment): StatusCategory {
  const stage = lead?.stage;
  if (stage === "uncontacted") return "new";
  if (stage === "contacted" || stage === "deposit" || stage === "trial" || stage === "changes")
    return "pending";
  if (stage === "booked" || stage === "confirmed" || stage === "completed") return "booked";

  const status = event?.status;
  if (status === "tentative") return "pending";
  if (status === "booked" || status === "completed") return "booked";
  if (status === "canceled") return "other";
  return "other";
}

type RichEvent = {
  event: Appointment;
  start: Date | null;
  end: Date | null;
  lead?: Lead;
  category: StatusCategory;
  color: string;
};

type DaySlot =
  | { type: "event"; start: Date; end: Date; rich: RichEvent }
  | { type: "open"; start: Date; end: Date };

function buildDaySchedule(events: RichEvent[], day: Date): DaySlot[] {
  const sorted = events
    .filter((rich) => rich.start)
    .sort((a, b) => (a.start?.getTime() ?? 0) - (b.start?.getTime() ?? 0));
  const slots: DaySlot[] = [];
  const dayStart = new Date(day);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(day);
  dayEnd.setHours(23, 59, 0, 0);

  let cursor = dayStart;

  for (const rich of sorted) {
    const start = rich.start ?? new Date(dayStart);
    const end = rich.end ?? new Date(start.getTime() + 60 * 60 * 1000);
    if (start > cursor) {
      slots.push({ type: "open", start: new Date(cursor), end: new Date(start) });
    }
    slots.push({ type: "event", start: new Date(start), end: new Date(end), rich });
    if (end > cursor) cursor = new Date(end);
  }

  if (cursor < dayEnd) {
    slots.push({ type: "open", start: new Date(cursor), end: dayEnd });
  }

  return slots;
}

/** Props for the calendar */
type Props = {
  events: Appointment[];
  leads: Lead[];
  onEventOpen?: (e: Appointment) => void;
  /** Optional: called when user clicks “+ New” with the currently selected date */
  onDayCreate?: (date: Date) => void;
  focusDate?: Date | null;
  viewMode?: "month" | "today";
  rangeLabel?: string;
  onRequestTimeframeChange?: (key: RangeShortcut) => void;
};

export default function CalendarIOS({
  events,
  leads,
  onEventOpen,
  onDayCreate,
  focusDate,
  viewMode,
  rangeLabel,
  onRequestTimeframeChange,
}: Props) {
  const realToday = new Date();
  const initialFocus = focusDate ?? realToday;
  const [cursor, setCursor] = useState<Date>(startOfMonth(initialFocus));
  const [mode, setMode] = useState<"month" | "today">(viewMode ?? "month");
  const [selectedKey, setSelectedKey] = useState<string | null>(ymd(initialFocus));
  const [modalKey, setModalKey] = useState<string | null>(null);
  const focusKey = focusDate ? ymd(focusDate) : null;

  useEffect(() => {
    if (!focusDate) return;
    setSelectedKey(ymd(focusDate));
    setCursor(startOfMonth(focusDate));
  }, [focusKey]);

  useEffect(() => {
    if (!viewMode) return;
    setMode(viewMode);
  }, [viewMode]);

  const anchorDate = focusDate ?? realToday;
  const anchorKey = ymd(anchorDate);
  const listLabel = rangeLabel ?? "Today";

  const leadById = useMemo(() => {
    const map = new Map<string, Lead>();
    for (const lead of leads ?? []) {
      if (lead?.id) map.set(lead.id, lead);
    }
    return map;
  }, [leads]);

  const richEvents: RichEvent[] = useMemo(() => {
    return (events ?? []).map((event) => {
      const start = getEventDate(event);
      const end = getEventEnd(event, start);
      const lead = event.leadId ? leadById.get(event.leadId) : undefined;
      const category = categorizeEvent(lead, event);
      const color = CATEGORY_COLORS[category] ?? CATEGORY_COLORS.other;
      return { event, start, end, lead, category, color };
    });
  }, [events, leadById]);

  /** Map events by day key YYYY-MM-DD */
  const eventsByDay = useMemo(() => {
    const map = new Map<string, RichEvent[]>();
    for (const rich of richEvents) {
      const d = rich.start ?? getEventDate(rich.event);
      if (!d) continue;
      const key = ymd(d);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(rich);
    }
    return map;
  }, [richEvents]);

  const selectedDate: Date | null = useMemo(() => {
    return selectedKey ? new Date(`${selectedKey}T00:00:00`) : null;
  }, [selectedKey]);

  const selectedEvents = useMemo(() => {
    if (!selectedKey) return [] as RichEvent[];
    const list = eventsByDay.get(selectedKey) ?? [];
    return [...list].sort((a, b) => (a.start?.getTime() ?? 0) - (b.start?.getTime() ?? 0));
  }, [selectedKey, eventsByDay]);

  const modalEvents = useMemo(() => {
    if (!modalKey) return [] as RichEvent[];
    const list = eventsByDay.get(modalKey) ?? [];
    return [...list].sort((a, b) => (a.start?.getTime() ?? 0) - (b.start?.getTime() ?? 0));
  }, [modalKey, eventsByDay]);

  const modalDate = useMemo(() => {
    return modalKey ? new Date(`${modalKey}T00:00:00`) : null;
  }, [modalKey]);

  const closeModal = () => setModalKey(null);

  const modalSlots = useMemo(() => {
    if (!modalDate) return [] as DaySlot[];
    return buildDaySchedule(modalEvents, modalDate);
  }, [modalEvents, modalDate]);

  useEffect(() => {
    if (!modalDate) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [modalDate]);

  /** Build visible month grid (6x7 cells) starting on Sunday */
  const monthCells = useMemo(() => {
    const start = startOfMonth(cursor);
    const startDay = start.getDay(); // 0=Sun
    const firstCell = new Date(start);
    firstCell.setDate(firstCell.getDate() - startDay);
    const cells: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(firstCell);
      d.setDate(firstCell.getDate() + i);
      cells.push(d);
    }
    return cells;
  }, [cursor]);

  /** Focus-day list (filtered) */
  const focusList = useMemo(() => {
    return richEvents.filter((rich) => {
      const d = rich.start;
      return d ? sameDay(d, anchorDate) : false;
    });
  }, [richEvents, anchorKey]);

  return (
    <>
      <div className="w-full">
      {/* Toolbar */}
      <div className="crm-toolbar flex flex-wrap items-center justify-between gap-2">
        {/* Left: Month nav */}
        <div className="flex items-center gap-2">
          <button
            className="icon-chip h-9 w-9 rounded-xl inline-grid place-items-center"
            onClick={() => setCursor((c) => addMonths(c, -1))}
            aria-label="Previous month"
          >
            ‹
          </button>
          <div className="px-2 text-sm sm:text-base font-semibold">{monthLabel(cursor)}</div>
          <button
            className="icon-chip h-9 w-9 rounded-xl inline-grid place-items-center"
            onClick={() => setCursor((c) => addMonths(c, +1))}
            aria-label="Next month"
          >
            ›
          </button>

          <button
            className="ml-2 h-9 rounded-xl border border-border/70 px-3 text-sm hover:bg-accent/20"
            onClick={() => {
              const m = startOfMonth(realToday);
              setCursor(m);
              setSelectedKey(ymd(realToday));
              setMode("today");
              onRequestTimeframeChange?.("today");
            }}
          >
            Today
          </button>
        </div>

        {/* Right: view toggle */}
        <div className="flex items-center gap-1">
          <button
            className={`h-9 rounded-xl px-3 text-sm border ${
              mode === "month"
                ? "bg-primary/15 border-border/70"
                : "border-border/60 hover:bg-accent/20"
            }`}
            onClick={() => {
              setMode("month");
            }}
          >
            Month
          </button>
          <button
            className={`h-9 rounded-xl px-3 text-sm border ${
              mode === "today"
                ? "bg-primary/15 border-border/70"
                : "border-border/60 hover:bg-accent/20"
            }`}
            onClick={() => {
              setMode("today");
              onRequestTimeframeChange?.("today");
            }}
          >
            Today
          </button>
        </div>
      </div>

      {/* MAIN */}
      {mode === "today" ? (
        <div className="glass mt-3 rounded-2xl p-3">
          {focusList.length === 0 ? (
            <div className="text-sm text-muted-foreground p-3">No bookings for {listLabel.toLowerCase()}.</div>
          ) : (
            <ul className="divide-y glass-sep">
              {focusList.map((rich) => {
                const start = rich.start;
                const end = rich.end;
                const event = rich.event;
                const timeLabel = [toTime(start), toTime(end)].filter(Boolean).join(" – ");
                return (
                  <li key={event.id} className="py-2 px-2">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          <span
                            className="inline-block h-2 w-2 rounded-full"
                            style={{ backgroundColor: rich.color }}
                          />
                          {event.title || event.service || "Appointment"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {timeLabel}
                          {event.location ? ` · ${event.location}` : ""}
                        </div>
                      </div>
                      {event.price != null && (
                        <div className="text-sm font-medium">${Math.round(event.price)}</div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : (
        <>
          {/* Month grid */}
          <div className="mt-3">
            <div className="grid grid-cols-7 gap-2 text-xs text-muted-foreground">
              <div className="text-center">Sun</div>
              <div className="text-center">Mon</div>
              <div className="text-center">Tue</div>
              <div className="text-center">Wed</div>
              <div className="text-center">Thu</div>
              <div className="text-center">Fri</div>
              <div className="text-center">Sat</div>
            </div>

            <div className="mt-2 grid grid-cols-7 gap-2">
              {monthCells.map((d, idx) => {
                const inMonth = d.getMonth() === cursor.getMonth();
                const key = ymd(d);
                const items = eventsByDay.get(key) ?? [];
                const isSel = selectedKey === key;
                const isFocusCell = sameDay(d, anchorDate);
                const isTodayCell = sameDay(d, realToday);
                const categories = new Set(items.map((item) => item.category));
                let dayStyle: React.CSSProperties | undefined;
                if (items.length === 0) {
                  dayStyle = {
                    backgroundColor: hexToRgba(CATEGORY_COLORS.pending, 0.12),
                    borderColor: hexToRgba(CATEGORY_COLORS.pending, 0.5),
                  };
                } else if (categories.has("new")) {
                  dayStyle = {
                    backgroundColor: hexToRgba(CATEGORY_COLORS.new, 0.12),
                    borderColor: hexToRgba(CATEGORY_COLORS.new, 0.55),
                  };
                } else if (categories.has("pending")) {
                  dayStyle = {
                    backgroundColor: hexToRgba(CATEGORY_COLORS.pending, 0.12),
                    borderColor: hexToRgba(CATEGORY_COLORS.pending, 0.55),
                  };
                } else if (categories.has("booked")) {
                  dayStyle = {
                    backgroundColor: hexToRgba(CATEGORY_COLORS.booked, 0.12),
                    borderColor: hexToRgba(CATEGORY_COLORS.booked, 0.55),
                  };
                }
                if (!inMonth) {
                  dayStyle = undefined;
                }

                return (
                  <button
                    key={`${key}-${idx}`}
                    onClick={() => {
                      setSelectedKey(key);
                      setModalKey(key);
                    }}
                    className={[
                      "relative h-[92px] sm:h-[110px] rounded-xl border p-1.5 text-left",
                      "transition hover:bg-accent/10",
                      inMonth ? "bg-background/30" : "bg-background/10 opacity-75",
                      isSel ? "ring-2 ring-[--ring]" : "",
                      isFocusCell || isTodayCell ? "border-[var(--gold)]" : "border-border/60",
                    ].join(" ")}
                    style={dayStyle}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-medium">{d.getDate()}</span>
                      {items.length > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-card/70 px-1.5 py-0.5 text-[10px]">
                          <span
                            className="inline-block h-1.5 w-1.5 rounded-full"
                            style={{
                              backgroundColor:
                                CATEGORY_COLORS[
                                  categories.has("new")
                                    ? "new"
                                    : categories.has("pending")
                                    ? "pending"
                                    : categories.has("booked")
                                    ? "booked"
                                    : "other"
                                ],
                            }}
                          />
                          {items.length}
                        </span>
                      )}
                    </div>

                    {/* Event chips (max 2) */}
                    <div className="mt-1 space-y-1">
                      {items.slice(0, 2).map((rich) => (
                        <div
                          key={rich.event.id}
                          onClick={(ev) => {
                            ev.stopPropagation();
                            onEventOpen?.(rich.event);
                          }}
                          className="truncate rounded-lg border px-1.5 py-0.5 text-[11px] hover:bg-accent/20"
                          style={{
                            backgroundColor: hexToRgba(rich.color, 0.18),
                            borderColor: hexToRgba(rich.color, 0.5),
                            color: "#1f1a17",
                          }}
                          title={rich.event.title || rich.event.service || "Appointment"}
                        >
                          {rich.event.title || rich.event.service || "Appointment"}
                        </div>
                      ))}
                      {items.length > 2 && (
                        <div className="text-[10px] text-muted-foreground">+{items.length - 2} more</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected day panel + Create */}
          <div className="mt-3 glass rounded-2xl p-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">
                {selectedDate ? selectedDate.toLocaleDateString() : "Select a day"}
              </div>

              <button
                className="px-2 py-1 rounded border border-border bg-popover hover:bg-accent/20 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!selectedDate || !onDayCreate}
                onClick={() => {
                  if (!selectedDate || !onDayCreate) return;
                  onDayCreate(selectedDate);
                }}
              >
                + New
              </button>
            </div>

            {selectedDate && (
              <ul className="mt-2 divide-y glass-sep">
                {selectedEvents.map((rich) => {
                  const event = rich.event;
                  const start = rich.start;
                  const end = rich.end;
                  const timeLabel = [toTime(start), toTime(end)].filter(Boolean).join(" – ");
                  return (
                    <li key={event.id} className="py-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm flex items-center gap-2">
                            <span
                              className="inline-block h-2 w-2 rounded-full"
                              style={{ backgroundColor: rich.color }}
                            />
                            {event.title || event.service || "Appointment"}
                          </div>
                          <div className="text-xs text-muted-foreground">{timeLabel}</div>
                          {rich.lead?.stage && (
                            <div className="mt-1 inline-flex items-center gap-1 rounded-full border border-border/60 px-2 py-0.5 text-[10px] uppercase tracking-wide">
                              {rich.lead.stage}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {event.price != null && (
                            <span className="text-xs font-medium">${Math.round(event.price)}</span>
                          )}
                          <button
                            className="h-8 rounded-md border border-border/60 px-2 text-xs hover:bg-accent/20"
                            onClick={() => onEventOpen?.(event)}
                          >
                            Open
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
                {selectedEvents.length === 0 && (
                  <li className="py-2 text-sm text-muted-foreground flex items-center justify-between">
                    <span>No events on this day.</span>
                    {onDayCreate && selectedDate && (
                      <button
                        className="h-8 rounded-lg border border-border/60 px-2 text-xs hover:bg-accent/20"
                        onClick={() => onDayCreate(selectedDate)}
                      >
                        + Add lead
                      </button>
                    )}
                  </li>
                )}
              </ul>
            )}
          </div>
        </>
      )}
      </div>

      {modalDate &&
        createPortal(
          <div className="fixed inset-0 z-[300] flex items-center justify-center px-4 py-8">
            <div className="absolute inset-0 bg-black/50" onClick={closeModal} />
            <div className="relative z-[310] w-full max-w-xl rounded-3xl border border-border/70 bg-popover/95 p-4 shadow-2xl backdrop-blur">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold">
                    {modalDate.toLocaleDateString(undefined, {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {modalEvents.length} booking{modalEvents.length === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {onDayCreate && (
                    <button
                      className="h-8 rounded-lg border border-border/60 px-3 text-xs font-medium hover:bg-accent/20"
                      onClick={() => {
                        onDayCreate?.(modalDate);
                        closeModal();
                      }}
                    >
                      + New lead
                    </button>
                  )}
                  <button
                    aria-label="Close"
                    className="icon-chip h-8 w-8 rounded-xl inline-grid place-items-center"
                    onClick={closeModal}
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="mt-3 space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {modalSlots.map((slot, idx) => {
                  if (slot.type === "open") {
                    const label = `${toTime(slot.start)} – ${toTime(slot.end)}`;
                    return (
                      <div
                        key={`open-${idx}`}
                        className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/80 px-3 py-2 text-sm text-amber-900"
                      >
                        <div>
                          <div className="font-semibold">Available</div>
                          <div className="text-xs">{label}</div>
                        </div>
                        {onDayCreate && (
                          <button
                            className="h-7 rounded-lg border border-amber-400 px-2 text-xs font-medium hover:bg-amber-100"
                            onClick={() => {
                              const start = new Date(slot.start);
                              onDayCreate?.(start);
                              closeModal();
                            }}
                          >
                            Add lead
                          </button>
                        )}
                      </div>
                    );
                  }

                  const { rich } = slot;
                  const event = rich.event;
                  const leadName = rich.lead?.name ?? "Unnamed client";
                  const timeLabel = `${toTime(slot.start)} – ${toTime(slot.end)}`;
                  return (
                    <div
                      key={event.id}
                      className="rounded-xl border px-3 py-2 shadow-sm"
                      style={{
                        borderColor: hexToRgba(rich.color, 0.5),
                        backgroundColor: hexToRgba(rich.color, 0.12),
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold text-sm flex items-center gap-2">
                            <span
                              className="inline-block h-2 w-2 rounded-full"
                              style={{ backgroundColor: rich.color }}
                            />
                            {event.title || event.service || "Appointment"}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">{timeLabel}</div>
                          <div className="text-xs mt-1 font-medium">{leadName}</div>
                          {rich.lead?.stage && (
                            <div className="mt-1 inline-flex items-center gap-1 rounded-full border border-border/60 px-2 py-0.5 text-[10px] uppercase tracking-wide">
                              {rich.lead.stage}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {event.price != null && (
                            <span className="text-xs font-semibold">${Math.round(event.price)}</span>
                          )}
                          <button
                            className="h-7 rounded-lg border border-border/60 px-2 text-xs hover:bg-accent/20"
                            onClick={() => {
                              onEventOpen?.(event);
                              closeModal();
                            }}
                          >
                            Open
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {modalSlots.length === 0 && (
                  <div className="rounded-xl border border-border/60 bg-popover/70 px-3 py-4 text-sm text-muted-foreground">
                    No events scheduled. This day is wide open.
                    {onDayCreate && (
                      <button
                        className="mt-3 block rounded-lg border border-border/60 px-3 py-2 text-xs font-medium hover:bg-accent/20"
                        onClick={() => {
                          onDayCreate?.(modalDate);
                          closeModal();
                        }}
                      >
                        + Add lead
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

```

# FILE: components/admin/ContentDashboard.tsx

```ts
// components/admin/ContentDashboard.tsx  (NEW)
'use client';
import React, { useState } from 'react';

type Tutorial = {
  id: string;
  title: string;
  category?: string;
  price?: number;
  isSubscription?: boolean;
  files?: File[];
};

type Product = {
  id: string;
  name: string;
  sku?: string;
  price?: number;
  stock?: number;
};

export default function ContentDashboard() {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const addTutorial = () =>
    setTutorials((t) => [{ id: `t_${Date.now()}`, title: 'New Tutorial', price: 0, isSubscription: false }, ...t]);

  const addProduct = () =>
    setProducts((p) => [{ id: `p_${Date.now()}`, name: 'New Product', price: 0, stock: 0 }, ...p]);

  const saveAll = () => {
    // TODO: call backend to persist
    console.log('SAVE tutorials', tutorials);
    console.log('SAVE products', products);
    alert('Saved (demo). Wire to your DB/storage next!');
  };

  return (
    <section className="rounded-2xl shadow bg-card">
      <div className="p-3 border-b border-border text-sm font-medium">Content & Products</div>
      <div className="p-3 grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Tutorials */}
        <div className="rounded-xl border border-input p-3 bg-popover">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold">Tutorial Library</div>
            <button onClick={addTutorial} className="h-8 px-3 rounded-lg border border-border hover:bg-accent/20">Add</button>
          </div>
          <div className="grid gap-3">
            {tutorials.map((t) => (
              <div key={t.id} className="rounded-lg border border-border p-2">
                <div className="grid grid-cols-2 gap-2">
                  <input className="h-9 rounded bg-background px-2" placeholder="Title"
                    value={t.title} onChange={(e)=>setTutorials(arr=>arr.map(x=>x.id===t.id?{...x,title:e.target.value}:x))}/>
                  <input className="h-9 rounded bg-background px-2" placeholder="Category"
                    value={t.category||''} onChange={(e)=>setTutorials(arr=>arr.map(x=>x.id===t.id?{...x,category:e.target.value}:x))}/>
                  <input type="number" className="h-9 rounded bg-background px-2" placeholder="Price"
                    value={t.price||0} onChange={(e)=>setTutorials(arr=>arr.map(x=>x.id===t.id?{...x,price:Number(e.target.value)||0}:x))}/>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={!!t.isSubscription}
                      onChange={(e)=>setTutorials(arr=>arr.map(x=>x.id===t.id?{...x,isSubscription:e.target.checked}:x))}/>
                    Subscription
                  </label>
                  <input type="file" multiple className="col-span-2"
                    onChange={(e)=>setTutorials(arr=>arr.map(x=>x.id===t.id?{...x,files: e.target.files? Array.from(e.target.files): []}:x))}/>
                </div>
              </div>
            ))}
            {!tutorials.length && <div className="text-sm text-muted-foreground">No tutorials yet.</div>}
          </div>
        </div>

        {/* Products */}
        <div className="rounded-xl border border-input p-3 bg-popover">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold">Makeup Products</div>
            <button onClick={addProduct} className="h-8 px-3 rounded-lg border border-border hover:bg-accent/20">Add</button>
          </div>
          <div className="grid gap-3">
            {products.map((p) => (
              <div key={p.id} className="rounded-lg border border-border p-2">
                <div className="grid grid-cols-2 gap-2">
                  <input className="h-9 rounded bg-background px-2" placeholder="Name"
                    value={p.name} onChange={(e)=>setProducts(arr=>arr.map(x=>x.id===p.id?{...x,name:e.target.value}:x))}/>
                  <input className="h-9 rounded bg-background px-2" placeholder="SKU"
                    value={p.sku||''} onChange={(e)=>setProducts(arr=>arr.map(x=>x.id===p.id?{...x,sku:e.target.value}:x))}/>
                  <input type="number" className="h-9 rounded bg-background px-2" placeholder="Price"
                    value={p.price||0} onChange={(e)=>setProducts(arr=>arr.map(x=>x.id===p.id?{...x,price:Number(e.target.value)||0}:x))}/>
                  <input type="number" className="h-9 rounded bg-background px-2" placeholder="Stock"
                    value={p.stock||0} onChange={(e)=>setProducts(arr=>arr.map(x=>x.id===p.id?{...x,stock:Number(e.target.value)||0}:x))}/>
                </div>
              </div>
            ))}
            {!products.length && <div className="text-sm text-muted-foreground">No products yet.</div>}
          </div>
        </div>
      </div>

      <div className="p-3 flex items-center justify-end">
        <button onClick={saveAll} className="h-9 px-4 rounded-lg bg-primary text-primary-foreground">Save</button>
      </div>
    </section>
  );
}

```

# FILE: components/admin/ContractBuilderModal.tsx

```ts
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

```

# FILE: components/admin/contractTemplates.ts

```ts
// components/admin/contractTemplates.ts  ✦ FULL FILE (updated)
// - Accepts items[] + depositAmount
// - Renders Services table and Totals (Total / Deposit / Balance)

import type { Lead, Address, ContractItem } from './types';

export type ContractOptions = {
  businessName?: string;
  items?: ContractItem[];
  depositAmount?: number;
};

function fmtAddr(a?: Address) {
  if (!a) return '';
  const line = [a.line1, a.line2].filter(Boolean).join(' ');
  const city = [a.city, a.state, a.zip].filter(Boolean).join(', ');
  return [line, city].filter(Boolean).join(', ');
}
function esc(s?: string) {
  return (s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function parseMoney(text: string): number {
  const m = text.replaceAll(',', '').match(/(-?\d+(\.\d+)?)/);
  return m ? Number(m[1]) : 0;
}

export function renderHollywoodStyleContract(lead: Lead, opts: ContractOptions = {}) {
  const loose = lead as Lead & Record<string, any>;
  const business = esc(opts.businessName || 'HOLLYWOOD STYLE LLC');

  // Defaults if not provided
  const rows: ContractItem[] = (opts.items && opts.items.length)
    ? opts.items
    : [
        { label: 'Bridal Makeup',                    priceText: '$380' },
        { label: 'Bridal hairstyle',                 priceText: '$350' },
        { label: 'Makeup and hairstyle touch ups',   priceText: '$120/hr' },
        {
          label: `travel fee to ${loose.location?.city || lead.address?.city || 'your area'}`,
          priceText: '$50',
        },
      ];

  const deposit = Number.isFinite(opts.depositAmount as number) ? (opts.depositAmount as number) : 100;

  // Compute a display total from numeric portions (ignores /hr text)
  const total = rows.reduce((s, r) => s + parseMoney(r.priceText), 0);
  const balance = Math.max(0, total - deposit);

  const client = esc(lead.name);
  const eventType = esc(loose.eventType || '—');
  const serviceDateSrc = loose.serviceDate ?? lead.dateOfService;
  const serviceDate = serviceDateSrc
    ? new Date(serviceDateSrc as any).toLocaleDateString()
    : '—';
  const partySize = String(loose.partySize ?? 1);
  const wants = [
    loose.wantsMakeup ? 'Makeup' : '',
    loose.wantsHair ? 'Hair' : '',
  ]
    .filter(Boolean)
    .join(' & ') || '—';
  const location = fmtAddr((loose.location as Address | undefined) ?? lead.address);

  return /* html */ `
  <article style="max-width:760px;margin:0 auto;background:#fff;color:#111;line-height:1.55;font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; padding:24px;">
    <header style="text-align:center;margin-bottom:16px">
      <div style="font-size:18px;margin-bottom:6px;">Makeup and hairstyle Contract</div>
      <div style="font-weight:700;font-size:20px;">“${business}”</div>
    </header>

    <section style="font-size:14px; margin-bottom:14px;">
      <p>Thank you for your interest in my services. Please carefully review this contract.</p>
      <p>I require this contract to be completed and submitted with a non-refundable deposit of
        <strong>$${deposit.toFixed(2)}</strong> in order to secure your event date.</p>
      <p style="text-decoration: underline; font-weight:600; margin: 12px 0 6px;">Information for deposit :</p>
      <p style="text-decoration: underline; margin:0;">Zelle , 619-399-6160 Fariia Sipahi</p>
      <p style="text-decoration: underline; margin:0;">Venmo Fariia-Sipahi</p>
      <p style="margin-top:10px;">The complete balance for your party will be due on or before the date.
        Please feel free to contact me with any questions or concerns you may have.
        I look forward to working with you and your party. Thank you and congratulations!</p>
    </section>

    <section style="font-size:14px; margin: 14px 0;">
      <div style="font-weight:700; letter-spacing:.02em; margin-bottom:8px;">MAKEUP AND HAIRSTYLE SERVICES:</div>
      <table style="width:100%; border-collapse:collapse; font-size:14px;">
        <thead>
          <tr>
            <th style="text-align:left;border:1px solid #000;padding:8px 10px;">Services</th>
            <th style="text-align:left;border:1px solid #000;padding:8px 10px;">Prices</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(r => `
            <tr>
              <td style="border:1px solid #000;padding:8px 10px;">${esc(r.label)}</td>
              <td style="border:1px solid #000;padding:8px 10px;">${esc(r.priceText)}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </section>

    <section style="font-size:14px; margin: 14px 0;">
      <div style="white-space:pre-line">
___POLICIES BOOKINGS: To secure a date, a signed contract and $${deposit.toFixed(2)} deposit are required. This deposit is non-refundable and non-transferable. This deposit will be put toward the client’s total event day balance if the client chooses event day services. The remaining balance will be due on or before the day of the event. Accepted forms of payment include: cash, Venmo, Zelle. Gratuity is never expected but always appreciated.

___CANCELLATION POLICY: Cancellations must be made at least ninety (90) days prior to the client’s reserved date or the client will be responsible for paying the full amount of services agreed upon in this contract.

__DELAYS: A late fee of $50.00 will be charged for every 30 minutes of delay when a client is late for the scheduled time, or if the scheduled makeup application exceeds the allotted time due to client delays.

__PARKING FEES: Where parking, valet or toll fees may be incurred. This amount will be included in the final bill and will be due on the day of the event.

__TRAVEL FEES: Travel fees apply for day-of appointments.

____LIABILITY: All brushes, tools, and makeup products are sanitized between every makeup application. Makeup products used are hypoallergenic. Any allergies and/or skin conditions should be reported by the client to the makeup artist prior to application and, if need be, a sample test of makeup may be performed on the skin to test reaction. Client(s) agree to release the makeup artist from liability for any skin complications due to allergic reactions.

____PAYMENT: The final balance is due on or before the day of the event before the makeup artist/hairstylist departs — no exceptions. The person(s) responsible for the entire balance of payment is the person(s) whose name(s) appear on this contract.
      </div>
    </section>

    <section style="font-size:14px; margin: 14px 0;">
      <p>I, <span style="display:inline-block; min-width:200px; border-bottom:1px solid #000;">${client}</span>,
      understand and agree to pay the non-refundable security deposit to secure the appointment(s) for my event party and myself.
      I agree to pay the complete balance for my party on the day of the event as listed in this contract on or before my event day.
      I understand and will comply with all policies as listed in this contract. I understand that no refunds will be given for members of the party who miss their appointments on the day of the event. I also understand that I am responsible for balances from any members of my party who fail to provide payment. I understand that I will be liable for payment on any missed appointments.</p>
    </section>

    <section style="font-size:14px; margin: 14px 0;">
      <div style="margin-bottom:10px;"><strong>Event Summary</strong></div>
      <div>Client: <strong>${client}</strong></div>
      <div>Event type: <strong>${eventType}</strong></div>
      <div>Service date: <strong>${serviceDate}</strong></div>
      <div>Party size: <strong>${partySize}</strong></div>
      <div>Services: <strong>${esc(wants)}</strong></div>
      <div>Location: <strong>${esc(location || '—')}</strong></div>
    </section>

    <section style="font-size:14px; margin: 18px 0;">
      <div style="font-weight:700; margin-bottom:8px;">Totals</div>
      <div>Total Amount Due: <strong>$${total.toFixed(2)}</strong></div>
      <div>Deposit: <strong>$${deposit.toFixed(2)}</strong></div>
      <div>Remaining Balance: <strong>$${balance.toFixed(2)}</strong></div>
    </section>

    <section style="font-size:14px; margin: 18px 0;">
      <div style="margin:18px 0;">CLIENT NAME: (please print)</div>
      <div style="height:28px;border-bottom:1px solid #000;margin-bottom:18px;"></div>

      <div>CLIENT SIGNATURE:</div>
      <div style="height:28px;border-bottom:1px solid #000;margin-bottom:18px;"></div>

      <div>DATE:</div>
      <div style="height:28px;border-bottom:1px solid #000;"></div>
    </section>
  </article>
  `;
}

```

# FILE: components/admin/CustomerEditor.tsx

```ts
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

```

# FILE: components/admin/CustomerModal.tsx

```ts
// FILE: components/admin/CustomerModal.tsx  (DROP-IN REPLACEMENT)
"use client";

import React, { useMemo, useState } from "react";
import { Lead, STAGES } from "./types";

/** Local shapes stored on the Lead object (kept inline so you don't have to edit types.ts now) */
type AnyLead = Lead & Record<string, any>;
type ContractRec = {
  id: string;
  createdAt: string;
  status: "draft" | "sent" | "signed";
  eventType?: string;
  serviceDate?: string;     // ISO YYYY-MM-DD
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
  type: "deposit" | "balance" | "service" | "guide";
  amount: number;
  dueDate?: string;         // ISO YYYY-MM-DD
  status: "unpaid" | "paid";
  method?: "cash" | "venmo" | "zelle" | "card";
  createdAt: string;
  note?: string;
};

type Tab = "details" | "intake" | "notes" | "contracts" | "invoices";

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
  const [tab, setTab] = useState<Tab>("details");

  if (!open || !model) return null;

  const handleSave = () => {
    if (!onSave) return;
    Promise.resolve(onSave(model)).catch((err) => {
      console.error("Lead save handler rejected", err);
    });
  };

  const setField = (key: keyof AnyLead, val: any) => onUpdate({ ...(model as AnyLead), [key]: val });
  const pushTo = (key: keyof AnyLead, item: any) => {
    const arr = ((model as AnyLead)[key] ?? []) as any[];
    onUpdate({ ...(model as AnyLead), [key]: [item, ...arr] });
  };
  const updateIn = (key: keyof AnyLead, id: string, patch: any) => {
    const arr = [ ...(((model as AnyLead)[key] ?? []) as any[]) ].map((x) => x.id === id ? { ...x, ...patch } : x);
    onUpdate({ ...(model as AnyLead), [key]: arr });
  };
  const removeFrom = (key: keyof AnyLead, id: string) => {
    const arr = (((model as AnyLead)[key] ?? []) as any[]).filter((x) => x.id !== id);
    onUpdate({ ...(model as AnyLead), [key]: arr });
  };

  // derived helpers
  const toISODate = (d?: any) =>
    d ? new Date(d).toISOString().slice(0, 10) : "";
  const fromISODate = (s: string) => (s ? `${s}T00:00:00` : undefined);

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Lightened scrim (less dark) */}
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/30"
      />

      {/* Centered modal */}
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center p-4 sm:p-6">
        <div className="pointer-events-auto wglass-strong max-w-[980px] w-full rounded-2xl border border-border/60 shadow-[0_28px_80px_rgba(0,0,0,0.22)]">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 p-4 sm:p-5 border-b border-border/50">
            <div>
              <div className="text-lg font-semibold">
                {model.name || "Untitled client"}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {model.email || "—"} · {model.phone || "—"}
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
                  {saving ? "Saving…" : canSave ? "Save changes" : "Saved"}
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(model.id)}
                  className="h-9 rounded-xl px-3 text-sm border border-destructive/60 text-destructive hover:bg-destructive/10"
                >
                  Delete
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="icon-chip h-9 w-9 inline-grid place-items-center rounded-xl"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
          </div>

          {saveError && (
            <div className="mx-4 sm:mx-5 mt-3 rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {saveError}
            </div>
          )}

          {/* Tabs */}
          <div className="px-4 sm:px-5 pt-3">
            <div className="flex flex-wrap gap-1">
              {(["details","intake","notes","contracts","invoices"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`h-9 rounded-xl px-3 text-sm border ${
                    tab === t ? "bg-primary/15 border-border/70" : "border-border/60 hover:bg-accent/15"
                  } capitalize`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Body (scrollable) */}
          <div className="max-h-[72vh] overflow-y-auto p-4 sm:p-5">
            {tab === "details" && (
              <DetailsView model={model} setField={setField} toISODate={toISODate} fromISODate={fromISODate} />
            )}

            {tab === "intake" && (
              <IntakeView model={model} setField={setField} />
            )}

            {tab === "notes" && (
              <NotesView
                notes={(model.notes ?? []) as { id: string; text: string; at: string }[]}
                onAdd={(text) =>
                  setField("notes", [{ id: `n_${Date.now()}`, text, at: new Date().toISOString() }, ...(model.notes ?? [])])
                }
                onDelete={(id) =>
                  setField("notes", (model.notes ?? []).filter((n: any) => n.id !== id))
                }
              />
            )}

            {tab === "contracts" && (
              <ContractsView
                model={model}
                onCreate={() => {
                  // prefill from details
                  const services = [
                    ...(model.services ?? []) // if you already store a services array on the lead
                  ] as Array<{ name: string; price: number }>;
                  const subtotal = services.reduce((s, x) => s + (x.price || 0), 0);
                  const travel = Number(model.travelFee ?? 0);
                  const discount = Number(model.discount ?? 0);
                  const total = Math.max(0, subtotal + travel - discount);

                  const rec: ContractRec = {
                    id: `c_${Date.now()}`,
                    createdAt: new Date().toISOString(),
                    status: "draft",
                    eventType: model.eventType || "",
                    serviceDate: toISODate(model.dateOfService as any),
                    partySize: Number(model.partySize ?? 0) || undefined,
                    location: model.location || "",
                    services: services.length
                      ? services
                      : [
                          { name: "Bridal Makeup", price: Number(model.bridalPrice ?? 380) },
                        ],
                    subtotal: services.length ? subtotal : Number(model.bridalPrice ?? 380),
                    travelFee: travel,
                    discount,
                    total,
                    notes: model.internalNotes || "",
                  };

                  pushTo("contracts", rec);
                }}
                onUpdate={(id, patch) => updateIn("contracts", id, patch)}
                onRemove={(id) => removeFrom("contracts", id)}
              />
            )}

            {tab === "invoices" && (
              <InvoicesView
                model={model}
                onCreateFromContract={(contractId, kind) => {
                  const c: ContractRec | undefined = (model.contracts ?? []).find((x: any) => x.id === contractId);
                  if (!c) return;

                  let amount = 0;
                  if (kind === "deposit") amount = Math.round(((c.total || 0) * 0.3) * 100) / 100;
                  else if (kind === "balance") amount = Math.max(0, (c.total || 0) - ((c.total || 0) * 0.3));
                  else amount = c.total || 0;

                  const inv: InvoiceRec = {
                    id: `i_${Date.now()}`,
                    type: kind,
                    amount,
                    status: "unpaid",
                    dueDate: c.serviceDate,
                    createdAt: new Date().toISOString(),
                    note: `Auto-generated from contract ${contractId}`,
                  };
                  pushTo("invoices", inv);
                }}
                onUpdate={(id, patch) => updateIn("invoices", id, patch)}
                onRemove={(id) => removeFrom("invoices", id)}
                onCreateManual={(inv) => pushTo("invoices", inv)}
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
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      <Field label="Name">
        <input className="crm-input" value={model.name || ""} onChange={(e) => setField("name", e.target.value)} />
      </Field>
      <Field label="Stage">
        <select
          className="crm-input"
          value={model.stage}
          onChange={(e) => setField("stage", e.target.value)}
        >
          {STAGES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Email">
        <input className="crm-input" value={model.email || ""} onChange={(e) => setField("email", e.target.value)} />
      </Field>
      <Field label="Phone">
        <input className="crm-input" value={model.phone || ""} onChange={(e) => setField("phone", e.target.value)} />
      </Field>

      <Field label="Service date">
        <input
          type="date"
          className="crm-input"
          value={toISODate(model.dateOfService)}
          onChange={(e) =>
            setField(
              "dateOfService",
              e.target.value ? fromISODate(e.target.value) : undefined
            )
          }
        />
      </Field>
      <Field label="Location">
        <input className="crm-input" value={model.location || ""} onChange={(e) => setField("location", e.target.value)} />
      </Field>

      <Field label="Party size">
        <input
          type="number"
          className="crm-input"
          value={model.partySize ?? ""}
          onChange={(e) => setField("partySize", e.target.value ? Number(e.target.value) : undefined)}
        />
      </Field>
      <Field label="Event type">
        <input
          className="crm-input"
          value={model.eventType || ""}
          onChange={(e) => setField("eventType", e.target.value)}
          placeholder="wedding / studio / editorial …"
        />
      </Field>

      <Field label="Internal notes" full>
        <textarea
          className="crm-input min-h-[90px]"
          value={model.internalNotes || ""}
          onChange={(e) => setField("internalNotes", e.target.value)}
        />
      </Field>
    </div>
  );
}

/* ------------------------- Intake ------------------------- */
function IntakeView({ model, setField }: { model: AnyLead; setField: (k: keyof AnyLead, v: any) => void }) {
  const intake = (model.intake ?? {}) as Record<string, any>;

  const setIntake = (k: string, v: any) => setField("intake", { ...intake, [k]: v });

  return (
    <div className="grid sm:grid-cols-2 gap-3">
      <Field label="Skin type">
        <select className="crm-input" value={intake.skinType || ""} onChange={(e) => setIntake("skinType", e.target.value)}>
          <option value="">Select…</option>
          <option value="dry">Dry</option>
          <option value="normal">Normal</option>
          <option value="combo">Combination</option>
          <option value="oily">Oily</option>
          <option value="sensitive">Sensitive</option>
        </select>
      </Field>
      <Field label="Allergies / sensitivities">
        <input className="crm-input" value={intake.allergies || ""} onChange={(e) => setIntake("allergies", e.target.value)} />
      </Field>

      <Field label="Preferred style">
        <input className="crm-input" value={intake.style || ""} onChange={(e) => setIntake("style", e.target.value)} placeholder="soft glam / natural / full glam" />
      </Field>
      <Field label="Reference links">
        <input className="crm-input" value={intake.refs || ""} onChange={(e) => setIntake("refs", e.target.value)} placeholder="URLs, Pinterest boards, IG…" />
      </Field>

      <Field label="Notes" full>
        <textarea className="crm-input min-h-[90px]" value={intake.notes || ""} onChange={(e) => setIntake("notes", e.target.value)} />
      </Field>
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
  const [txt, setTxt] = useState("");
  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-2">
        <input
          className="crm-input flex-1"
          placeholder="Add a note…"
          value={txt}
          onChange={(e) => setTxt(e.target.value)}
        />
        <button
          onClick={() => {
            if (txt.trim()) {
              onAdd(txt.trim());
              setTxt("");
            }
          }}
          className="gbtn h-9 rounded-xl px-3 text-sm"
        >
          Add
        </button>
      </div>

      <div className="grid gap-2">
        {notes.length === 0 && <div className="text-sm text-muted-foreground">No notes yet.</div>}
        {notes.map((n) => (
          <div key={n.id} className="wglass panel rounded-2xl border-border/70">
            <div className="text-sm">{n.text}</div>
            <div className="mt-1 text-xs text-muted-foreground">{new Date(n.at).toLocaleString()}</div>
            <div className="mt-2">
              <button className="h-8 rounded-lg px-2 text-xs border border-border/70 hover:bg-accent/15" onClick={() => onDelete(n.id)}>
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
    <div className="grid gap-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">Contracts ({contracts.length})</div>
        <button className="gbtn h-9 rounded-xl px-3 text-sm" onClick={onCreate}>+ New from Details</button>
      </div>

      {contracts.length === 0 && <div className="text-sm text-muted-foreground">No contracts yet.</div>}

      {contracts.map((c) => (
        <div key={c.id} className="wglass panel rounded-2xl border-border/70">
          <div className="flex flex-wrap items-center gap-2 justify-between">
            <div className="text-sm font-medium">#{c.id}</div>
            <div className="flex items-center gap-2">
              <select
                className="crm-input h-8 w-[120px]"
                value={c.status}
                onChange={(e) => onUpdate(c.id, { status: e.target.value as ContractRec["status"] })}
              >
                <option value="draft">draft</option>
                <option value="sent">sent</option>
                <option value="signed">signed</option>
              </select>
              <button className="h-8 rounded-lg px-2 text-xs border hover:bg-accent/15" onClick={() => onRemove(c.id)}>
                Remove
              </button>
            </div>
          </div>

          <div className="mt-3 grid sm:grid-cols-2 gap-3">
            <Field label="Event type">
              <input className="crm-input" value={c.eventType || ""} onChange={(e) => onUpdate(c.id, { eventType: e.target.value })} />
            </Field>
            <Field label="Service date">
              <input type="date" className="crm-input" value={c.serviceDate || ""} onChange={(e) => onUpdate(c.id, { serviceDate: e.target.value })} />
            </Field>
            <Field label="Party size">
              <input type="number" className="crm-input" value={c.partySize ?? ""} onChange={(e) => onUpdate(c.id, { partySize: Number(e.target.value || 0) })} />
            </Field>
            <Field label="Location">
              <input className="crm-input" value={c.location || ""} onChange={(e) => onUpdate(c.id, { location: e.target.value })} />
            </Field>

            <Field label="Subtotal ($)">
              <input type="number" className="crm-input" value={c.subtotal ?? 0}
                     onChange={(e) => onUpdate(c.id, { subtotal: Number(e.target.value || 0) })} />
            </Field>
            <Field label="Travel fee ($)">
              <input type="number" className="crm-input" value={c.travelFee ?? 0}
                     onChange={(e) => onUpdate(c.id, { travelFee: Number(e.target.value || 0) })} />
            </Field>
            <Field label="Discount ($)">
              <input type="number" className="crm-input" value={c.discount ?? 0}
                     onChange={(e) => onUpdate(c.id, { discount: Number(e.target.value || 0) })} />
            </Field>
            <Field label="Total ($)">
              <input type="number" className="crm-input" value={c.total ?? 0}
                     onChange={(e) => onUpdate(c.id, { total: Number(e.target.value || 0) })} />
            </Field>

            <Field label="Notes" full>
              <textarea className="crm-input min-h-[80px]" value={c.notes || ""} onChange={(e) => onUpdate(c.id, { notes: e.target.value })} />
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
  onCreateFromContract: (contractId: string, kind: InvoiceRec["type"]) => void;
  onUpdate: (id: string, patch: Partial<InvoiceRec>) => void;
  onRemove: (id: string) => void;
  onCreateManual: (inv: InvoiceRec) => void;
}) {
  const invoices = (model.invoices ?? []) as InvoiceRec[];
  const contracts = (model.contracts ?? []) as ContractRec[];

  const createManual = () => {
    const inv: InvoiceRec = {
      id: `i_${Date.now()}`,
      type: "service",
      amount: 0,
      status: "unpaid",
      dueDate: "",
      createdAt: new Date().toISOString(),
    };
    onCreateManual(inv);
  };

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm font-medium">Invoices ({invoices.length})</div>
        <div className="flex flex-wrap items-center gap-2">
          {contracts.length > 0 && (
            <>
              <select id="fromContract" className="crm-input h-9 w-[200px]" defaultValue={contracts[0]?.id}>
                {contracts.map((c) => (
                  <option key={c.id} value={c.id}>
                    From #{c.id} — {c.total ?? 0}$
                  </option>
                ))}
              </select>
              <button
                className="h-9 rounded-xl px-3 text-sm border border-border/70 hover:bg-accent/15"
                onClick={() => {
                  const el = document.getElementById("fromContract") as HTMLSelectElement | null;
                  if (!el) return;
                  onCreateFromContract(el.value, "deposit");
                }}
              >
                + Deposit
              </button>
              <button
                className="h-9 rounded-xl px-3 text-sm border border-border/70 hover:bg-accent/15"
                onClick={() => {
                  const el = document.getElementById("fromContract") as HTMLSelectElement | null;
                  if (!el) return;
                  onCreateFromContract(el.value, "balance");
                }}
              >
                + Balance
              </button>
            </>
          )}
          <button className="gbtn h-9 rounded-xl px-3 text-sm" onClick={createManual}>
            + Manual
          </button>
        </div>
      </div>

      {invoices.length === 0 && <div className="text-sm text-muted-foreground">No invoices yet.</div>}

      {invoices.map((inv) => (
        <div key={inv.id} className="wglass panel rounded-2xl border-border/70">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm font-medium">#{inv.id}</div>
            <div className="flex items-center gap-2">
              <select
                className="crm-input h-8 w-[120px]"
                value={inv.status}
                onChange={(e) => onUpdate(inv.id, { status: e.target.value as InvoiceRec["status"] })}
              >
                <option value="unpaid">unpaid</option>
                <option value="paid">paid</option>
              </select>
              <button className="h-8 rounded-lg px-2 text-xs border hover:bg-accent/15" onClick={() => onRemove(inv.id)}>
                Remove
              </button>
            </div>
          </div>

          <div className="mt-3 grid sm:grid-cols-2 gap-3">
            <Field label="Type">
              <select className="crm-input" value={inv.type} onChange={(e) => onUpdate(inv.id, { type: e.target.value as InvoiceRec["type"] })}>
                <option value="deposit">deposit</option>
                <option value="balance">balance</option>
                <option value="service">service</option>
                <option value="guide">guide</option>
              </select>
            </Field>
            <Field label="Amount ($)">
              <input type="number" className="crm-input" value={inv.amount}
                     onChange={(e) => onUpdate(inv.id, { amount: Number(e.target.value || 0) })} />
            </Field>
            <Field label="Due date">
              <input type="date" className="crm-input" value={inv.dueDate || ""} onChange={(e) => onUpdate(inv.id, { dueDate: e.target.value })} />
            </Field>
            <Field label="Method">
              <select className="crm-input" value={inv.method || ""} onChange={(e) => onUpdate(inv.id, { method: e.target.value as any })}>
                <option value="">—</option>
                <option value="cash">cash</option>
                <option value="venmo">venmo</option>
                <option value="zelle">zelle</option>
                <option value="card">card</option>
              </select>
            </Field>
            <Field label="Note" full>
              <textarea className="crm-input min-h-[80px]" value={inv.note || ""} onChange={(e) => onUpdate(inv.id, { note: e.target.value })} />
            </Field>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------- Small field wrapper ------------------------- */
function Field({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <div className={full ? "grid gap-1.5 sm:col-span-2" : "grid gap-1.5"}>
      <label className="text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}

```

# FILE: components/admin/EsignModal.tsx

```ts
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

```

# FILE: components/admin/FiltersBar.tsx

```ts
// components/admin/FiltersBar.tsx
// Today / WTD / MTD / All tabs → emits a DateRange
'use client';
import React from 'react';
import { startOfToday, startOfWeek, startOfMonth, endOfToday } from 'date-fns';
import type { DateRange } from './types';

export default function FiltersBar({ value, onChange }: {
  value: DateRange['label'];
  onChange: (range: DateRange) => void;
}) {
  const makeRange = (label: DateRange['label']): DateRange => {
    if (label === 'All') return { label };
    if (label === 'Today') return { label, start: startOfToday(), end: endOfToday() };
    if (label === 'WTD') return { label, start: startOfWeek(new Date(), { weekStartsOn: 1 }), end: endOfToday() };
    return { label: 'MTD', start: startOfMonth(new Date()), end: endOfToday() };
  };

  const tabs: DateRange['label'][] = ['Today', 'WTD', 'MTD', 'All'];
  return (
    <div className="flex gap-2">
      {tabs.map(t => (
        <button
          key={t}
          onClick={() => onChange(makeRange(t))}
          className={`px-3 py-1.5 rounded-full border text-sm
          ${value === t ? 'bg-[color:var(--espresso,#2C1B12)] text-white' : 'bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800'}`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

```

# FILE: components/admin/HeaderAlerts.tsx

```ts
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

```

# FILE: components/admin/KPIBlock.tsx

```ts
// FILE: components/admin/KPIBlock.tsx  (DROP-IN)
// Glass KPI with inline sparkline

"use client";

type Props = {
  label: string;
  value: string | number;
  sublabel?: string;
  trendPct?: number;          // e.g. +12 or -5
  sparkline?: number[];       // e.g. last 12 weeks
};

export default function KPIBlock({ label, value, sublabel, trendPct, sparkline }: Props) {
  // mini sparkline path
  const path = (() => {
    if (!sparkline || sparkline.length < 2) return "";
    const w = 120, h = 34, pad = 4;
    const xs = sparkline.map((_, i) => (i / (sparkline.length - 1)) * (w - pad * 2) + pad);
    const min = Math.min(...sparkline), max = Math.max(...sparkline);
    const scaleY = (v: number) => {
      if (max === min) return h / 2;
      const t = (v - min) / (max - min);
      return h - pad - t * (h - pad * 2);
    };
    return xs.map((x, i) => `${i ? "L" : "M"} ${x.toFixed(2)} ${scaleY(sparkline[i]).toFixed(2)}`).join(" ");
  })();

  const trendColor =
    trendPct == null ? "" : trendPct >= 0 ? "text-[var(--sage)]" : "text-[var(--destructive)]";

  return (
    <div className="kpi-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="kpi-label">{label}</div>
          <div className="kpi-value">{typeof value === "number" ? value.toLocaleString() : value}</div>
          {sublabel && <div className="text-xs text-muted-foreground mt-0.5">{sublabel}</div>}
        </div>

        {/* Sparkline */}
        <svg width="120" height="34" viewBox="0 0 120 34" className="opacity-90">
          <defs>
            <linearGradient id="kpiGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--gold)" />
              <stop offset="100%" stopColor="var(--accent)" />
            </linearGradient>
          </defs>
          <path d={path} fill="none" stroke="url(#kpiGrad)" strokeWidth="2" />
        </svg>
      </div>

      {trendPct != null && (
        <div className={`mt-2 text-xs font-medium ${trendColor}`}>
          {trendPct >= 0 ? "▲" : "▼"} {Math.abs(trendPct)}%
        </div>
      )}
    </div>
  );
}

```

# FILE: components/admin/KPIStrip.tsx

```ts
// FILE: components/admin/KPIStrip.tsx  (DROP-IN)
// Computes key metrics and supplies sparklines

"use client";

import { useMemo } from "react";
import KPIBlock from "./KPIBlock";
import type { Appointment, Sale, Lead } from "./types";

function fmtUSD(n: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

// build a simple last-12 buckets series from events or sales
function seriesFromAmounts(amounts: number[], buckets = 12) {
  if (amounts.length === 0) return Array(buckets).fill(0);
  // naive bucket by index
  const size = Math.ceil(amounts.length / buckets);
  const out: number[] = [];
  for (let i = 0; i < buckets; i++) {
    const chunk = amounts.slice(i * size, (i + 1) * size);
    out.push(chunk.reduce((s, v) => s + v, 0));
  }
  return out;
}

export default function KPIStrip({
  events,
  sales,
  leads,
  timeframeLabel,
}: {
  events: Appointment[];
  sales: Sale[];
  leads: Lead[];
  timeframeLabel?: string;
}) {
  const eventList = Array.isArray(events) ? events : [];
  const saleList = Array.isArray(sales) ? sales : [];
  const label = timeframeLabel ?? "All time";

  const serviceRevenue = useMemo(
    () => eventList.reduce((s, e: any) => s + (e?.price ?? 0), 0),
    [eventList]
  );
  const guideRevenue = useMemo(
    () =>
      saleList
        .filter((s: any) => s?.type === "guide")
        .reduce((s, e) => s + (e?.amount ?? 0), 0),
    [saleList]
  );
  const trials = useMemo(
    () =>
      eventList.filter((e: any) =>
        (e?.service || "").toLowerCase().includes("trial")
      ).length,
    [eventList]
  );
  const booked = useMemo(
    () =>
      eventList.filter(
        (e: any) => e?.status === "booked" || e?.status === "completed"
      ).length,
    [eventList]
  );

  // Sparklines
  const svSeries = useMemo(
    () => seriesFromAmounts(eventList.map((e: any) => e?.price ?? 0)),
    [eventList]
  );
  const gdSeries = useMemo(
    () =>
      seriesFromAmounts(
        saleList
          .filter((s: any) => s?.type === "guide")
          .map((s) => s?.amount ?? 0)
      ),
    [saleList]
  );
  const bkSeries = useMemo(
    () => seriesFromAmounts(eventList.map(() => 1)),
    [eventList]
  );
  const trSeries = useMemo(
    () =>
      seriesFromAmounts(
        eventList.map((e: any) =>
          (e?.service || "").toLowerCase().includes("trial") ? 1 : 0
        )
      ),
    [eventList]
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <KPIBlock label="Bookings" value={booked} sublabel={label} sparkline={bkSeries} />
      <KPIBlock label="Trials" value={trials} sublabel={label} sparkline={trSeries} />
      <KPIBlock label="Service Revenue" value={fmtUSD(serviceRevenue)} sublabel={`${label} · Payments`} sparkline={svSeries} />
      <KPIBlock label="Guide Revenue" value={fmtUSD(guideRevenue)} sublabel={`${label} · Payments`} sparkline={gdSeries} />
    </div>
  );
}

```

# FILE: components/admin/LeadDrawer.tsx

```ts
// FILE: components/admin/LeadDrawer.tsx
import React from "react";
import type { Lead } from "./types";

export default function LeadDrawer({
  open, onClose, lead, onSaveNote,
}: {
  open: boolean; onClose: ()=>void; lead: Lead | null; onSaveNote: (id:string,note:string)=>void;
}) {
  const [val, setVal] = React.useState("");
  if (!open || !lead) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/55 z-40" onClick={onClose} />
      <aside
        className="
          fixed right-0 top-0 bottom-0 z-50 w-[92vw] max-w-[520px]
          border-l border-[var(--border)]
          bg-[color-mix(in_oklab,var(--popover)_90%,transparent)] backdrop-blur-2xl
          shadow-[0_22px_70px_rgba(0,0,0,.24)]
          p-5 sm:p-6 overflow-y-auto
        "
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold">{lead.name}</h3>
          <button
            onClick={onClose}
            className="h-9 px-3 rounded-lg border border-[var(--border)] bg-card/60 hover:bg-accent/15"
          >
            Close
          </button>
        </div>

        <div className="mt-4 grid gap-4">
          <div className="
            rounded-2xl border border-[var(--border)]
            bg-[color-mix(in_oklab,var(--card)_18%,transparent)] backdrop-blur-xl p-4
          ">
            <div className="text-sm text-foreground/70 space-y-1">
              <div>Phone: {lead.phone || "—"}</div>
              <div>Email: {lead.email || "—"}</div>
              {lead.dateOfService && (
                <div>
                  Service date:{" "}
                  {new Date(lead.dateOfService).toLocaleDateString([], {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              )}
              {lead.address && (
                <div className="text-muted-foreground">
                  {[lead.address.line1, lead.address.line2].filter(Boolean).join(" ")}
                  <br />
                  {[lead.address.city, lead.address.state, lead.address.zip].filter(Boolean).join(", ")}
                </div>
              )}
            </div>
          </div>

          <div className="
            rounded-2xl border border-[var(--border)]
            bg-[color-mix(in_oklab,var(--card)_18%,transparent)] backdrop-blur-xl p-4
          ">
            <div className="text-sm font-medium">Notes</div>
            <textarea
              value={val} onChange={e=>setVal(e.target.value)}
              placeholder="Add a quick note…"
              className="mt-2 w-full min-h-[110px] rounded-xl border border-[var(--border)] bg-background/30 px-3 py-2.5 placeholder:text-foreground/50"
            />
            <div className="mt-3 flex justify-end">
              <button
                onClick={()=>{ if(val.trim()) onSaveNote(lead.id, val.trim()); setVal(""); }}
                className="h-10 px-4 rounded-xl bg-primary text-primary-foreground hover:opacity-95"
              >
                Save note
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

```

# FILE: components/admin/LeadList.tsx

```ts
// FILE: components/admin/LeadList.tsx  (DROP-IN REPLACEMENT)
"use client";

import React from "react";
import type { Lead } from "./types";

function StageBadge({ stage }: { stage: Lead["stage"] }) {
  const cls =
    stage === "uncontacted"
      ? "badge badge-new"
      : stage === "completed"
      ? "badge badge-booked"
      : stage === "booked"
      ? "badge badge-booked"
      : stage === "trial"
      ? "badge badge-trial"
      : "badge";
  return <span className={cls}>{stage}</span>;
}
const fmtDate = (d: string | Date | undefined) =>
  d ? new Date(d).toLocaleDateString() : "";

export default function LeadList({
  leads,
  onOpen,
}: {
  leads: Lead[];
  onOpen?: (l: Lead) => void;
}) {
  if (!leads?.length) {
    return (
      <div className="wglass panel text-sm text-muted-foreground">
        No leads match your filters yet.
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      {leads.map((l) => (
        <button
          key={l.id}
          className="wglass panel-lg text-left transition hover:bg-white/14 rounded-2xl"
          onClick={() => onOpen?.(l)}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-medium">{l.name || "Untitled lead"}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                {l.email || "—"} · {l.phone || "—"}
              </div>
              <div className="mt-1 text-xs">
                {l.dateOfService ? (
                  <>Service date: <span className="font-medium">{fmtDate(l.dateOfService)}</span></>
                ) : (
                  <span className="text-muted-foreground">No service date</span>
                )}
              </div>
            </div>
            <div className="shrink-0 flex flex-col items-end gap-1">
              <StageBadge stage={l.stage} />
              {(l.tags || []).includes("repeat") && (
                <span className="badge">repeat</span>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

```

# FILE: components/admin/LeadTabs.tsx

```ts
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
  const notesValue = (() => {
    if (Array.isArray(lead.notes)) {
      return lead.notes
        .map((entry: any) =>
          typeof entry === 'string' ? entry : typeof entry?.text === 'string' ? entry.text : '',
        )
        .filter(Boolean)
        .join('\n');
    }
    if (lead.notes && typeof lead.notes === 'object' && 'text' in (lead.notes as any)) {
      return (lead.notes as any).text ?? '';
    }
    return (lead.notes as any) ?? '';
  })();

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

```

# FILE: components/admin/NewLeadModal.tsx

```ts
// FILE: components/admin/NewLeadModal.tsx  (DROP-IN REPLACEMENT)
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Lead, LeadStage, STAGES } from "./types";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (lead: Lead) => void;
  /** Optional: prefill service date when invoked from calendar */
  initialDate?: Date;
  /** Optional: override stage options */
  stages?: LeadStage[];
};

function toYMD(d?: Date | null) {
  if (!d) return "";
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const dd = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export default function NewLeadModal({
  open,
  onClose,
  onCreate,
  initialDate,
  stages,
}: Props) {
  const stageOptions = useMemo(
    () => (stages && stages.length ? stages : STAGES),
    [stages]
  );

  // form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [stage, setStage] = useState<LeadStage>(stageOptions[0] ?? "uncontacted");
  const [serviceDate, setServiceDate] = useState<string>(toYMD(initialDate));
  const [notes, setNotes] = useState("");

  // keep stage default in sync if stages prop changes
  useEffect(() => {
    setStage((prev) =>
      stageOptions.includes(prev) ? prev : stageOptions[0] ?? "uncontacted"
    );
  }, [stageOptions]);

  // prefill date when modal opens from calendar
  useEffect(() => {
    if (open) setServiceDate(toYMD(initialDate) || "");
  }, [open, initialDate]);

  const disabled = !name.trim();

  const handleSubmit = () => {
    if (disabled) return;
    const date = serviceDate ? new Date(`${serviceDate}T00:00:00`).toISOString() : undefined;

    onCreate({
      id: `l_${Date.now()}`,
      name: name.trim(),
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      stage,
      lastContactAt: null as any,
      dateOfService: date || undefined,
      tags: [],
    } as unknown as Lead);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* scrim */}
      <button
        aria-label="Close"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* modal panel */}
      <div className="absolute inset-x-4 sm:inset-x-auto sm:right-6 top-10 sm:top-16 z-[101] w-auto sm:w-[520px]">
        <div className="glass specular rounded-2xl border border-border/70 p-4 sm:p-5 shadow-2xl">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base sm:text-lg font-semibold">New lead</h3>
            <button
              onClick={onClose}
              className="icon-chip h-9 w-9 inline-grid place-items-center rounded-xl"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="mt-3 grid gap-3">
            <div className="grid gap-1.5">
              <label className="text-sm font-medium">Name *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Client full name"
                className="crm-input"
              />
            </div>

            <div className="grid gap-1.5 sm:grid-cols-2 sm:gap-3">
              <div className="grid gap-1.5">
                <label className="text-sm font-medium">Phone</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 555-5555"
                  className="crm-input"
                />
              </div>
              <div className="grid gap-1.5">
                <label className="text-sm font-medium">Email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@email.com"
                  className="crm-input"
                />
              </div>
            </div>

            <div className="grid gap-1.5 sm:grid-cols-2 sm:gap-3">
              <div className="grid gap-1.5">
                <label className="text-sm font-medium">Stage</label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value as LeadStage)}
                  className="crm-input"
                >
                  {stageOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-1.5">
                <label className="text-sm font-medium">Service date</label>
                <input
                  type="date"
                  value={serviceDate}
                  onChange={(e) => setServiceDate(e.target.value)}
                  className="crm-input"
                />
              </div>
            </div>

            <div className="grid gap-1.5">
              <label className="text-sm font-medium">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any details to remember…"
                className="crm-input min-h-[90px]"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="h-9 rounded-xl border border-border/70 px-3 text-sm hover:bg-accent/20"
            >
              Cancel
            </button>
            <button
              disabled={disabled}
              onClick={handleSubmit}
              className={`gbtn h-9 rounded-xl px-3 text-sm ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              Create lead
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

```

# FILE: components/admin/ProgressStepper.tsx

```ts
// components/admin/ProgressStepper.tsx
// Horizontal stepper with checkmarks
'use client';
import React from 'react';
import type { LeadStage } from './types';

const STEPS: LeadStage[] = ['contacted','deposit','trial','booked','confirmed','changes','completed'];

export default function ProgressStepper({ current }: { current: LeadStage }) {
  const idx = Math.max(0, STEPS.indexOf(current));
  return (
    <div className="flex items-center gap-2 overflow-x-auto">
      {STEPS.map((s, i) => {
        const done = i <= idx;
        return (
          <div key={s} className="flex items-center gap-2">
            <div className={`h-7 min-w-7 w-7 rounded-full flex items-center justify-center text-xs
              ${done ? 'bg-[color:var(--sage,#008767)] text-white' : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300'}
            `}>
              {done ? '✓' : i+1}
            </div>
            <div className="text-xs font-medium capitalize">{s}</div>
            {i < STEPS.length - 1 && <div className="w-6 h-[2px] bg-neutral-200 dark:bg-neutral-700 mx-1" />}
          </div>
        );
      })}
    </div>
  );
}

```

# FILE: components/admin/SignatureCanvas.tsx

```ts
// components/admin/SignatureCanvas.tsx
'use client';
import React, { useEffect, useRef } from 'react';

export default function SignatureCanvas({
  width = 520,
  height = 180,
  strokeWidth = 2,
  onChange,
  clearSignal,
}: {
  width?: number;
  height?: number;
  strokeWidth?: number;
  onChange?: (dataUrl: string) => void;
  clearSignal?: number; // increment to clear externally
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const c = canvasRef.current;
    const ctx = c.getContext('2d')!;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#111';

    const getPt = (e: PointerEvent) => {
      const rect = c.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onDown = (e: PointerEvent) => {
      drawing.current = true;
      last.current = getPt(e);
      c.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!drawing.current) return;
      const pt = getPt(e);
      if (!last.current) { last.current = pt; return; }
      ctx.beginPath();
      ctx.moveTo(last.current.x, last.current.y);
      ctx.lineTo(pt.x, pt.y);
      ctx.stroke();
      last.current = pt;
    };
    const onUp = (e: PointerEvent) => {
      drawing.current = false;
      last.current = null;
      if (onChange) onChange(c.toDataURL('image/png'));
      c.releasePointerCapture(e.pointerId);
    };

    c.addEventListener('pointerdown', onDown);
    c.addEventListener('pointermove', onMove);
    c.addEventListener('pointerup', onUp);
    c.addEventListener('pointerleave', onUp);
    return () => {
      c.removeEventListener('pointerdown', onDown);
      c.removeEventListener('pointermove', onMove);
      c.removeEventListener('pointerup', onUp);
      c.removeEventListener('pointerleave', onUp);
    };
  }, [strokeWidth, onChange]);

  // external clear
  useEffect(() => {
    if (!canvasRef.current) return;
    const c = canvasRef.current;
    const ctx = c.getContext('2d')!;
    ctx.clearRect(0, 0, c.width, c.height);
    if (onChange) onChange(c.toDataURL('image/png')); // blank
  }, [clearSignal, onChange]);

  return (
    <div className="rounded-xl border border-border bg-background p-2">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full h-auto rounded bg-white"
      />
    </div>
  );
}

```

# FILE: components/admin/StageFilterBar.tsx

```ts
'use client';
import React from 'react';
import type { LeadStage } from './types';

export type ServiceFilter = 'All' | 'weddings' | 'tutorial' | 'events' | 'trial';

export default function StageFilterBar({
  stages,
  selected,
  onChange,
  serviceFilter,
  onServiceChange,
  uncontactedOnly,
  uncontactedCount,
  onToggleUncontacted,
}: {
  stages: LeadStage[];
  selected: LeadStage | 'All';
  onChange: (s: LeadStage | 'All') => void;
  serviceFilter: ServiceFilter;
  onServiceChange: (s: ServiceFilter) => void;
  uncontactedOnly: boolean;
  uncontactedCount: number;
  onToggleUncontacted: () => void;
}) {
  const stageOptions = ['All', ...stages] as (LeadStage | 'All')[];
  const tabs: ServiceFilter[] = ['All', 'weddings', 'tutorial', 'events', 'trial'];

  return (
    <div className="w-full flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Stage dropdown */}
      <div className="w-full sm:w-auto">
        <select
          className="h-11 w-full sm:w-52 rounded-xl border border-input bg-popover text-foreground px-3 pr-8 appearance-none"
          style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
          value={selected}
          onChange={(e) => onChange(e.target.value as any)}
          aria-label="Filter by stage"
        >
          {stageOptions.map((s) => (
            <option key={s} value={s}>
              {String(s)}
            </option>
          ))}
        </select>
      </div>

      {/* Right side: tabs + uncontacted
          - mobile: stack (tabs row, then toggle)
          - desktop: inline */}
      <div className="w-full sm:w-auto flex flex-col gap-2 sm:flex-row sm:items-center">
        {/* Scrollable tabs strip (no negative margins) */}
        <div className="w-full sm:w-auto">
          <div
            className="flex items-center gap-1 rounded-full border border-border bg-popover p-1
                       overflow-x-auto whitespace-nowrap snap-x snap-mandatory max-w-full"
            role="tablist"
            aria-label="Filter by service type"
          >
            {tabs.map((t) => {
              const active = serviceFilter === t;
              return (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-label={t}
                  onClick={() => onServiceChange(t)}
                  className={[
                    'h-9 px-3 rounded-full text-sm capitalize snap-start transition shrink-0',
                    'focus:outline-none focus:ring-2 focus:ring-ring',
                    active
                      ? 'bg-primary text-primary-foreground shadow'
                      : 'bg-transparent text-foreground hover:bg-accent/20',
                  ].join(' ')}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        {/* Uncontacted toggle */}
        <div className="w-full sm:w-auto">
          <button
            type="button"
            onClick={onToggleUncontacted}
            className={[
              'h-9 px-3 w-full sm:w-auto rounded-full border text-sm flex items-center justify-between sm:justify-start gap-2 transition',
              'focus:outline-none focus:ring-2 focus:ring-ring',
              uncontactedOnly
                ? 'border-[color:var(--sage,#008767)] bg-[color:var(--sage,#008767)]/18 text-[color:var(--sage,#008767)]'
                : 'border-border bg-popover text-foreground hover:bg-accent/20',
            ].join(' ')}
            aria-pressed={uncontactedOnly}
            title="Show only uncontacted leads"
          >
            <span>Uncontacted</span>
            <span
              className={[
                'min-w-[1.25rem] h-5 px-2 rounded-full text-xs font-medium flex items-center justify-center',
                uncontactedOnly
                  ? 'bg-[color:var(--sage,#008767)] text-white'
                  : 'bg-muted text-muted-foreground',
              ].join(' ')}
            >
              {uncontactedCount}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

```

# FILE: components/admin/StageManagerModal.tsx

```ts
// components/admin/StageManagerModal.tsx
// Edit pipeline stages (add / rename / delete / reorder)
'use client';
import React, { useState } from 'react';
import type { LeadStage } from './types';

export default function StageManagerModal({
  open,
  stages,
  onClose,
  onSave,
}: {
  open: boolean;
  stages: LeadStage[];
  onClose: () => void;
  onSave: (stages: LeadStage[]) => void;
}) {
  const [list, setList] = useState<LeadStage[]>(stages);
  if (!open) return null;

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    setList(next);
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-xl rounded-2xl shadow-2xl bg-card">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="text-lg font-semibold">Pipeline Stages</div>
          <button onClick={onClose} className="px-2 py-1 rounded hover:bg-accent/20">✕</button>
        </div>
        <div className="p-4 space-y-3">
          {list.map((s, i) => (
            <div key={`${s}-${i}`} className="flex items-center gap-2">
              <input className="flex-1 rounded border border-border px-3 py-2 bg-popover" value={s} onChange={(e)=> {
                const next = [...list]; next[i] = e.target.value; setList(next);
              }} />
              <button className="px-2 py-1 rounded border border-border bg-card" onClick={()=> move(i, -1)}>↑</button>
              <button className="px-2 py-1 rounded border border-border bg-card" onClick={()=> move(i, +1)}>↓</button>
              <button className="px-2 py-1 rounded border border-border bg-card" onClick={()=> setList(list.filter((_,k)=>k!==i))}>🗑</button>
            </div>
          ))}
          <div className="flex gap-2">
            <button className="px-3 py-2 rounded border border-border bg-card" onClick={()=> setList([...list, 'new stage'])}>+ Add stage</button>
            <div className="flex-1" />
            <button className="px-4 py-2 rounded bg-primary text-primary-foreground" onClick={()=> { onSave(list.filter(Boolean).map((s)=>s.trim()).filter(Boolean)); onClose(); }}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}

```

# FILE: components/admin/theme.ts

```ts
// components/admin/theme.ts
// Uses your globals.css tokens; heuristics color stages by name (works with custom stages)
import type { LeadStage, LeadCategory } from './types';

export const CATEGORY_DOT: Record<LeadCategory | 'both', string> = {
  service: 'bg-[color:var(--amber,#b45309)]',
  guide:   'bg-[color:var(--teal,#0f766e)]',
  both:    'bg-[color:var(--gold,#C6A25A)]',
};

// Heuristic badge based on stage text (lowercased)
export function badgeClasses(stage: LeadStage, custom?: string) {
  if (custom) return custom;
  const s = (stage || '').toLowerCase();
  if (s.includes('book'))     return 'bg-[color:var(--sage,#008767)]/18 text-[color:var(--sage,#008767)]';
  if (s.includes('deposit'))  return 'bg-accent/25 text-foreground';
  if (s.includes('trial'))    return 'bg-card text-foreground';
  if (s.includes('confirm'))  return 'bg-accent/25 text-accent-foreground';
  if (s.includes('change'))   return 'bg-popover text-foreground';
  if (s.includes('complete')) return 'bg-card text-foreground';
  if (s.includes('no') && s.includes('show')) return 'bg-destructive/15 text-destructive';
  if (s.includes('lost'))     return 'bg-destructive/25 text-destructive-foreground';
  return 'bg-muted text-muted-foreground';
}

```

# FILE: components/admin/TopBar.tsx

```ts
// FILE: components/admin/TopBar.tsx  (DROP-IN)
// Glass left-rail + responsive top bar

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type NavItem = { href: string; label: string };

const NAV: NavItem[] = [
  { href: "/admin",       label: "Overview" },
  { href: "/admin#cal",   label: "Calendar" },
  { href: "/admin#leads", label: "Leads" },
  { href: "/admin#content", label: "Content" },
];

export default function TopBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : false;

  return (
    <>
      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-40 glass-strong border-b border-border/60">
        <div className="f-container flex items-center justify-between py-2">
          <div className="font-semibold">Admin</div>
          <button
            onClick={() => setOpen((v) => !v)}
            className="icon-chip h-10 w-10 rounded-xl inline-grid place-items-center"
            aria-label="Toggle menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
        {open && (
          <div className="px-3 pb-3">
            <nav className="glass rounded-2xl p-2">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className={`block h-10 rounded-xl px-3 leading-10 ${
                    isActive(n.href)
                      ? "bg-primary/15 border border-border/60"
                      : "hover:bg-accent/20"
                  }`}
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Desktop left rail */}
      <aside className="hidden lg:block sticky top-20 self-start w-[220px]">
        <div className="glass-strong rounded-2xl p-2">
          <div className="px-2 py-2 text-sm font-semibold opacity-80">Navigation</div>
          <nav className="grid gap-1 px-2 pb-2">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`h-10 rounded-xl px-3 flex items-center border transition ${
                  isActive(n.href)
                    ? "bg-primary/15 border-border/70"
                    : "border-transparent hover:bg-accent/20"
                }`}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}

```

# FILE: components/admin/types.ts

```ts
// components/admin/types.ts

// Stages used across UI
export type LeadStage =
  | "uncontacted"
  | "contacted"
  | "deposit"
  | "trial"
  | "booked"
  | "confirmed"
  | "changes"
  | "completed"
  | "lost";

export const STAGES: LeadStage[] = [
  "uncontacted",
  "contacted",
  "deposit",
  "trial",
  "booked",
  "confirmed",
  "changes",
  "completed",
  "lost",
];

export type LeadCategory = "service" | "guide";

export interface Address {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  zip?: string;
}

export type ContractStatus = "draft" | "sent" | "viewed" | "signed" | "void";

export interface EsignField {
  id: string;
  type: "signature" | "initial" | "text" | "date";
  label?: string;
  required?: boolean;
  page?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export interface Contract {
  id: string;
  leadId: string;
  template?: string;
  title?: string;
  body?: string;
  status?: ContractStatus;
  createdAt?: string;
  sentAt?: string | Date;
  signedAt?: string | Date;
  version?: number;
  digitalStamp?: string;
  esignFields?: EsignField[];
}

export type ContractRec = Contract;

export interface Invoice {
  id: string;
  leadId: string;
  type: "deposit" | "balance";
  amount: number;
  createdAt: string;
  dueAt?: string;
  paidAt?: string;
  method?: "cash" | "venmo" | "zelle" | "card";
}
export type InvoiceRec = Invoice;

export type AppointmentStatus = "tentative" | "booked" | "completed" | "canceled";

export interface Appointment {
  id: string;
  leadId?: string;
  title: string;
  service?: string;
  start: string | Date;
  end: string | Date;
  status?: AppointmentStatus;
  price?: number;
}

export interface Sale {
  id: string;
  type: "guide" | "service";
  amount: number;
  createdAt: string | Date;
}

export interface Lead {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  stage: LeadStage;
  category?: LeadCategory;
  createdAt?: string;
  lastContactAt?: string | Date;
  dateOfService?: string; // ISO
  notes?: string[];
  address?: Address;
  tags?: string[];
  color?: string;

  contracts?: Contract[];
  invoices?: Invoice[];
  bookings?: Appointment[];
}

export interface DateRange {
  start: string | Date;
  end: string | Date;
}

// Stage colors (used by chips)
export const STAGE_COLORS: Record<LeadStage, string> = {
  uncontacted: "#C6A25A",
  contacted: "#8B6547",
  deposit: "#9D7E60",
  trial: "#b45309",
  booked: "#008767",
  confirmed: "#0f766e",
  changes: "#8A6E4D",
  completed: "#2C1B12",
  lost: "#5A3725",
};

```

# FILE: components/admin/YearCalendar.tsx

```ts
// components/admin/YearCalendar.tsx
// Year view with green dots on booked days, plus category dot (guide/service/both)
'use client';
import React, { useMemo } from 'react';
import {
  startOfYear, endOfYear, eachMonthOfInterval, startOfMonth, endOfMonth,
  eachDayOfInterval, isSameMonth, isSameDay, format, isWithinInterval
} from 'date-fns';
import type { Appointment, Lead, Sale, DateRange } from './types';
import { CATEGORY_DOT } from './theme';

type Props = {
  year?: number;
  events: Appointment[];
  leads: Lead[];
  sales: Sale[]; // for guide dots
  range?: DateRange; // to dim outside range
  onDayClick?: (date: Date) => void;
};

export default function YearCalendar({
  year = new Date().getFullYear(),
  events,
  leads,
  sales,
  range,
  onDayClick,
}: Props) {
  const months = eachMonthOfInterval({ start: startOfYear(new Date(year, 0, 1)), end: endOfYear(new Date(year, 11, 31)) });

  // preindex: map day -> info
  const dayMap = useMemo(() => {
    const map = new Map<string, { booked: boolean; categories: Set<'guide'|'service'|'both'> }>();
    const eventList = Array.isArray(events) ? events : [];
    const leadList = Array.isArray(leads) ? leads : [];
    const saleList = Array.isArray(sales) ? sales : [];

    for (const e of eventList) {
      const startValue = e?.start ?? null;
      if (!startValue) continue;
      const startDate = new Date(startValue);
      if (Number.isNaN(startDate.getTime())) continue;
      const key = format(startDate, 'yyyy-MM-dd');
      const m = map.get(key) ?? { booked: false, categories: new Set() };
      if (e?.status === 'booked' || e?.status === 'completed') m.booked = true;
      // category from lead
      const lead = e?.leadId ? leadList.find((l) => l.id === e.leadId) : undefined;
      if (lead?.category) m.categories.add(lead.category);
      map.set(key, m);
    }
    for (const s of saleList) {
      const created = s?.createdAt ? new Date(s.createdAt) : null;
      if (!created || Number.isNaN(created.getTime())) continue;
      const key = format(created, 'yyyy-MM-dd');
      const m = map.get(key) ?? { booked: false, categories: new Set() };
      if (s?.type === 'guide') m.categories.add('guide');
      map.set(key, m);
    }
    return map;
  }, [events, leads, sales]);

  const startRaw = range?.start ? new Date(range.start) : undefined;
  const endRaw = range?.end ? new Date(range.end) : undefined;
  const startRange = startRaw && !Number.isNaN(startRaw.getTime()) ? startRaw : undefined;
  const endRange = endRaw && !Number.isNaN(endRaw.getTime()) ? endRaw : undefined;

  const inRange = (d: Date) =>
    !startRange || !endRange ? true : isWithinInterval(d, { start: startRange, end: endRange });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {months.map((m) => {
        const days = eachDayOfInterval({ start: startOfMonth(m), end: endOfMonth(m) });
        const monthName = format(m, 'MMMM');
        const firstDayIdx = Number(format(startOfMonth(m), 'i')); // 1..7 (Mon..Sun)
        // pad to Monday-first 7-col grid
        const pads = Array.from({ length: (firstDayIdx + 6) % 7 });

        return (
          <div key={monthName} className="rounded-2xl shadow bg-white dark:bg-neutral-900 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">{monthName}</div>
              <div className="text-xs text-neutral-500">{format(m, 'yyyy')}</div>
            </div>
            <div className="grid grid-cols-7 text-[11px] text-neutral-500 mb-1">
              {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => <div key={d} className="text-center py-1">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {pads.map((_,i)=><div key={`pad-${i}`} />)}
              {days.map((d) => {
                const key = format(d, 'yyyy-MM-dd');
                const info = dayMap.get(key);
                const dim = !inRange(d);
                return (
                  <button
                    key={key}
                    onClick={() => onDayClick?.(d)}
                    className={`h-10 sm:h-12 rounded-md border text-xs flex flex-col items-center justify-center
                      ${dim ? 'opacity-40' : ''}
                      ${isSameMonth(d, m) ? 'bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800' : 'opacity-60'}
                    `}
                    title={format(d, 'PPPP')}
                  >
                    <span className="text-[12px]">{format(d, 'd')}</span>
                    {/* main booked dot (green-ish) */}
                    <span className={`mt-0.5 h-1.5 w-1.5 rounded-full ${info?.booked ? 'bg-[color:var(--sage,#008767)]' : 'bg-transparent'}`} />
                    {/* category dot (guide/service/both) */}
                    {info?.categories.size ? (
                      <span className={`mt-0.5 h-1.5 w-1.5 rounded-full ${
                        CATEGORY_DOT[info.categories.has('both') ? 'both' :
                          info.categories.has('guide') && !info.categories.has('service') ? 'guide' : 'service'
                        ]
                      }`} />
                    ) : <span className="mt-0.5 h-1.5 w-1.5" />}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

```
