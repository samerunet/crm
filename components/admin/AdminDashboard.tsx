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
