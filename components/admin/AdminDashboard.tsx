"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { endOfMonth, format, isSameDay, parseISO, startOfMonth } from "date-fns";

import { CalendarProvider, useCalendarContext } from "@/components/calendar/CalendarContext";
import MonthWidget from "@/components/calendar/MonthWidget";
import TodayPanel from "@/components/calendar/TodayPanel";
import CreateEventModal from "@/components/calendar/CreateEventModal";
import SearchBar from "@/components/dashboard/SearchBar";
import StatsCards from "@/components/dashboard/StatsCards";
import NewLeadsSheet from "@/components/dashboard/NewLeadsSheet";
import LeadQuickSearch from "@/components/dashboard/LeadQuickSearch";
import RevenueSummary from "@/components/dashboard/RevenueSummary";
import PipelineSidebar from "@/components/pipeline/PipelineSidebar";
import QuickFilters from "@/components/pipeline/QuickFilters";
import Kpis from "@/components/widgets/Kpis";
import UsersPanel from "@/components/admin/UsersPanel";
import TasksList from "@/components/tasks/TasksList";
import AppointmentsList from "@/components/appointments/AppointmentsList";
import CustomerModal from "./CustomerModal";
import NewLeadModal from "./NewLeadModal";
import LeadList from "./LeadList";
import { useDashboardParams } from "@/lib/hooks/use-dashboard-params";
import { usePollingQuery } from "@/lib/hooks/use-polling-query";
import {
  AppointmentStatusEnum,
  LeadStageEnum,
  listAppointments,
  listLeads,
  updateLead,
} from "@/lib/api";
import type {
  Appointment,
  AppointmentStatus,
  Lead as ApiLead,
  LeadStage,
  Task,
} from "@/lib/api";
import type { Lead as LegacyLead, LeadStage as LegacyLeadStage } from "./types";
import { STAGES as LEGACY_STAGES } from "./types";
import { DASHBOARD_DATA_EVENT, emitDashboardDataChange } from "@/lib/dashboard/events";

const EMPTY_LEADS: ApiLead[] = [];

const STAGE_BADGE_COLORS: Record<LegacyLeadStage, string> = {
  uncontacted: "var(--color-muted)",
  contacted: "var(--color-accent)",
  deposit: "var(--gold)",
  trial: "var(--color-secondary)",
  booked: "var(--color-primary)",
  confirmed: "var(--color-primary)",
  changes: "var(--color-accent)",
  completed: "var(--sage)",
  lost: "var(--destructive)",
};

const API_TO_LEGACY_STAGE = {
  [LeadStageEnum.NEW]: "uncontacted",
  [LeadStageEnum.CONTACTED]: "contacted",
  [LeadStageEnum.CONSULT_TRIAL]: "trial",
  [LeadStageEnum.PROPOSAL_SENT]: "changes",
  [LeadStageEnum.DEPOSIT_RECEIVED]: "deposit",
  [LeadStageEnum.CONTRACT_SIGNED]: "confirmed",
  [LeadStageEnum.SCHEDULED]: "booked",
  [LeadStageEnum.COMPLETED]: "completed",
  [LeadStageEnum.LOST]: "lost",
} as const satisfies Record<LeadStage, LegacyLeadStage>;

const LEGACY_TO_API_STAGE = {
  uncontacted: LeadStageEnum.NEW,
  contacted: LeadStageEnum.CONTACTED,
  deposit: LeadStageEnum.DEPOSIT_RECEIVED,
  trial: LeadStageEnum.CONSULT_TRIAL,
  booked: LeadStageEnum.SCHEDULED,
  confirmed: LeadStageEnum.CONTRACT_SIGNED,
  changes: LeadStageEnum.PROPOSAL_SENT,
  completed: LeadStageEnum.COMPLETED,
  lost: LeadStageEnum.LOST,
} as const satisfies Record<LegacyLeadStage, LeadStage>;

const STATUS_COLORS = {
  [AppointmentStatusEnum.TENTATIVE]: "rgba(180,83,9,0.22)",
  [AppointmentStatusEnum.CONFIRMED]: "rgba(108,58,34,0.22)",
  [AppointmentStatusEnum.COMPLETED]: "rgba(0,135,103,0.22)",
  [AppointmentStatusEnum.CANCELED]: "rgba(122,48,34,0.22)",
} as const satisfies Record<AppointmentStatus, string>;

const STATUS_DOTS = {
  [AppointmentStatusEnum.TENTATIVE]: "var(--amber)",
  [AppointmentStatusEnum.CONFIRMED]: "var(--color-primary)",
  [AppointmentStatusEnum.COMPLETED]: "var(--sage)",
  [AppointmentStatusEnum.CANCELED]: "var(--destructive)",
} as const satisfies Record<AppointmentStatus, string>;

type CalendarEventDensity = Record<string, Partial<Record<AppointmentStatus, number>>>;

type DashboardLead = LegacyLead & Record<string, any>;

type DashboardAppointments = {
  byDate: CalendarEventDensity;
  forSelectedDay: Appointment[];
};

export default function AdminDashboard() {
  return (
    <CalendarProvider>
      <DashboardShell />
    </CalendarProvider>
  );
}

function DashboardShell() {
  const { visibleMonth, selectedDate, setSelectedDate } = useCalendarContext();
  const { stage, filters, tab, setTab, search } = useDashboardParams();

  const [activeLead, setActiveLead] = useState<DashboardLead | null>(null);
  const [leadBaseline, setLeadBaseline] = useState<DashboardLead | null>(null);
  const [savingLead, setSavingLead] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [newLeadModalOpen, setNewLeadModalOpen] = useState(false);
  const [newLeadInitialDate, setNewLeadInitialDate] = useState<Date | undefined>();
  const [newLeadsOpen, setNewLeadsOpen] = useState(false);
  const [createEventOpen, setCreateEventOpen] = useState(false);
  const [eventLeadId, setEventLeadId] = useState<string | null>(null);
  const [daySheetOpen, setDaySheetOpen] = useState(false);
  const [daySheetData, setDaySheetData] = useState<{ date: Date; leads: DashboardLead[] }>({
    date: new Date(),
    leads: [],
  });

  const filtersKey = filters.slice().sort().join("|");
  const recentCreatedAfter = useMemo(() => {
    if (!filtersKey.split("|").includes("new")) return undefined;
    return new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  }, [filtersKey]);

  const leadParams = useMemo(
    () => {
      const parsedFilters = filtersKey ? filtersKey.split("|").filter(Boolean) : [];
      return buildLeadParams(stage, parsedFilters, search, recentCreatedAfter);
    },
    [stage, filtersKey, search, recentCreatedAfter],
  );
  const leadDeps = JSON.stringify(leadParams);

  const {
    data: leadsData,
    refresh: refreshLeads,
    isLoading: leadsLoading,
  } = usePollingQuery<ApiLead[]>(() => listLeads(leadParams), [leadDeps], { refreshInterval: 0 });
  useRefreshOnEvent(refreshLeads);

  const leadsRaw = leadsData ?? EMPTY_LEADS;
  const [leadsState, setLeadsState] = useState<DashboardLead[]>([]);

  useEffect(() => {
    setLeadsState(leadsRaw.map(mapApiLeadToLegacy));
  }, [leadsRaw]);

  const recentLeads = useMemo(() => {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    return leadsRaw.filter((lead) => new Date(lead.createdAt).getTime() >= cutoff);
  }, [leadsRaw]);

  const monthStart = useMemo(() => startOfMonth(visibleMonth), [visibleMonth]);
  const monthEnd = useMemo(() => endOfMonth(visibleMonth), [visibleMonth]);
  const monthKey = `${monthStart.toISOString()}_${monthEnd.toISOString()}`;

  const {
    data: appointmentsData,
    refresh: refreshAppointments,
  } = usePollingQuery<Appointment[]>(
    () =>
      listAppointments({
        rangeStart: monthStart.toISOString(),
        rangeEnd: monthEnd.toISOString(),
      }),
    [monthKey],
    { refreshInterval: 0 },
  );
  useRefreshOnEvent(refreshAppointments);

  const appointments = appointmentsData ?? [];
  const calendarDensity = useMemo(() => buildEventDensity(appointments), [appointments]);
  const dayAppointments = useMemo(
    () => appointments.filter((appt) => isSameDay(new Date(appt.start), selectedDate)),
    [appointments, selectedDate],
  );
  const appointmentsByDay = useMemo(() => {
    const map: Record<string, Appointment[]> = {};
    appointments.forEach((appointment) => {
      const key = toDateKey(appointment.start);
      if (!key) return;
      if (!map[key]) map[key] = [];
      map[key]!.push(appointment);
    });
    Object.values(map).forEach((list) =>
      list.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()),
    );
    return map;
  }, [appointments]);

  const leadsByCalendarDay = useMemo(() => {
    const map: Record<string, Array<{ lead: DashboardLead; stage: LegacyLeadStage }>> = {};
    leadsState.forEach((lead) => {
      const key = toDateKey(lead.dateOfService ?? lead.createdAt);
      if (!key) return;
      if (!map[key]) map[key] = [];
      map[key]!.push({ lead, stage: lead.stage as LegacyLeadStage });
    });
    return map;
  }, [leadsState]);

  const leadsByDayForGrid = useMemo(() => {
    const display: Record<string, Array<{ id: string; stage: LegacyLeadStage; label: string }>> = {};
    Object.entries(leadsByCalendarDay).forEach(([key, items]) => {
      display[key] = items.map(({ lead, stage }) => ({
        id: lead.id,
        stage,
        label: lead.name || lead.email || "Lead",
      }));
    });
    return display;
  }, [leadsByCalendarDay]);

  const handleOpenLead = useCallback((lead: DashboardLead) => {
    setActiveLead(lead);
    setLeadBaseline(lead);
    setSaveError(null);
  }, []);

  const handleSelectLeadFromApi = useCallback(
    (apiLead: ApiLead) => {
      const legacy = mapApiLeadToLegacy(apiLead);
      handleOpenLead(legacy);
    },
    [handleOpenLead],
  );

  const handleLeadUpdateLocal = useCallback((updated: DashboardLead) => {
    setActiveLead(updated);
  }, []);

  const handleLeadCreate = useCallback(
    (created: DashboardLead) => {
      setNewLeadModalOpen(false);
      emitDashboardDataChange();
        setLeadsState((prev) => [created, ...prev.filter((item) => item.id !== created.id)]);
      handleOpenLead(created);
      void refreshLeads();
    },
    [handleOpenLead, refreshLeads],
  );

  const handleQuickScheduleLead = useCallback(
    (lead: ApiLead) => {
      setEventLeadId(lead.id);
      setCreateEventOpen(true);
    },
    [],
  );

  const handleLeadSave = useCallback(
    async (draft: DashboardLead & Record<string, any>) => {
      setSavingLead(true);
      setSaveError(null);
      try {
        const payload = buildLeadUpdatePayload(draft);
        await updateLead(draft.id, payload);
        emitDashboardDataChange();
        setLeadBaseline(draft);
        setActiveLead(draft);
        setLeadsState((prev) =>
          prev.map((lead) => (lead.id === draft.id ? { ...lead, ...draft } : lead)),
        );
        void refreshLeads();
      } catch (error) {
        console.error("Failed to save lead", error);
        setSaveError(error instanceof Error ? error.message : "Failed to save lead");
      } finally {
        setSavingLead(false);
      }
    },
    [],
  );

  const handleSelectAppointment = useCallback(
    (appointment: Appointment) => {
      const start = new Date(appointment.start);
      setSelectedDate(start);
      setTab("appointments");
    },
    [setSelectedDate, setTab],
  );

  const handleSelectTask = useCallback(
    (task: Task) => {
      if (task.lead) {
        const existing = leadsRaw.find((lead) => lead.id === task.lead?.id);
        if (existing) {
          handleSelectLeadFromApi(existing);
        }
      }
      setTab("tasks");
    },
    [handleSelectLeadFromApi, leadsRaw, setTab],
  );

  const dashboardAppointments: DashboardAppointments = useMemo(
    () => ({ byDate: calendarDensity, forSelectedDay: dayAppointments }),
    [calendarDensity, dayAppointments],
  );

  const isLoadingLeads = leadsLoading && !leadsData;

  const openDayLeadsSheet = useCallback(
    (date: Date) => {
      const key = toDateKey(date);
      const bucket = key ? leadsByCalendarDay[key] ?? [] : [];
      setDaySheetData({ date, leads: bucket.map((entry) => entry.lead) });
      setDaySheetOpen(true);
    },
    [leadsByCalendarDay],
  );

  useEffect(() => {
    if (tab !== "calendar" && daySheetOpen) {
      setDaySheetOpen(false);
    }
  }, [tab, daySheetOpen]);

  const navigateDay = useCallback(
    (offset: number) => {
      const next = new Date(daySheetData.date);
      next.setDate(next.getDate() + offset);
      setSelectedDate(next);
      openDayLeadsSheet(next);
    },
    [daySheetData.date, openDayLeadsSheet, setSelectedDate],
  );

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <aside className="lg:col-span-3 space-y-4">
        <PipelineSidebar />
        <QuickFilters />
        <UsersPanel />
      </aside>

      <main className="lg:col-span-6 space-y-4">
        <DashboardHeader
          onOpenNewLead={() => {
            setNewLeadsOpen(true);
          }}
          onAddLead={() => {
            setNewLeadInitialDate(undefined);
            setNewLeadModalOpen(true);
          }}
          onCreateEvent={() => setCreateEventOpen(true)}
          onSelectLead={handleSelectLeadFromApi}
          onSelectTask={handleSelectTask}
          onSelectAppointment={handleSelectAppointment}
        />

        <StatsCards />

        <CenterTabs
          tab={tab}
          onTabChange={setTab}
          leads={leadsState}
          isLoadingLeads={isLoadingLeads}
          onOpenLead={handleOpenLead}
          appointments={dashboardAppointments.forSelectedDay}
          calendarDensity={dashboardAppointments.byDate}
          appointmentsByDay={appointmentsByDay}
          leadsByDay={leadsByDayForGrid}
          stageColors={STAGE_BADGE_COLORS}
          selectedDate={selectedDate}
          onSelectDate={(date) => {
            setSelectedDate(date);
            openDayLeadsSheet(date);
          }}
          onScheduleLead={handleQuickScheduleLead}
          onCreateLeadForDay={() => {
            setNewLeadInitialDate(selectedDate);
            setNewLeadModalOpen(true);
          }}
        />
      </main>

      <aside className="lg:col-span-3 space-y-4">
        <RevenueSummary />
        <Kpis />
        <TodayPanel appointments={dashboardAppointments.forSelectedDay} onCreate={() => setCreateEventOpen(true)} />
      </aside>

      <NewLeadModal
        open={newLeadModalOpen}
        onClose={() => setNewLeadModalOpen(false)}
        onCreate={handleLeadCreate}
        initialDate={newLeadInitialDate}
        stages={LEGACY_STAGES}
        mapApiLead={(apiLead) => mapApiLeadToLegacy(apiLead)}
      />

      <CustomerModal
        open={Boolean(activeLead)}
        lead={activeLead}
        onClose={() => setActiveLead(null)}
        onUpdate={handleLeadUpdateLocal as any}
        onSave={handleLeadSave as any}
        canSave={Boolean(leadBaseline && activeLead && leadSnapshot(activeLead) !== leadSnapshot(leadBaseline))}
        saving={savingLead}
        saveError={saveError}
      />

      <CreateEventModal
        open={createEventOpen}
        onClose={() => {
          setCreateEventOpen(false);
          setEventLeadId(null);
        }}
        defaultDate={selectedDate}
        defaultLeadId={eventLeadId}
        onCreated={() => {
          emitDashboardDataChange();
          setCreateEventOpen(false);
          setEventLeadId(null);
          void refreshAppointments();
        }}
      />

      <NewLeadsSheet
        open={newLeadsOpen}
        leads={recentLeads}
        onClose={() => setNewLeadsOpen(false)}
        onSelect={(lead) => {
          setNewLeadsOpen(false);
          handleSelectLeadFromApi(lead);
        }}
        onCreate={() => {
          setNewLeadsOpen(false);
          setNewLeadModalOpen(true);
        }}
      />

      <DayLeadsSheet
        open={daySheetOpen}
        date={daySheetData.date}
        leads={daySheetData.leads}
        onClose={() => setDaySheetOpen(false)}
        onSelect={(lead) => {
          handleOpenLead(lead);
          setDaySheetOpen(false);
        }}
        stageColors={STAGE_BADGE_COLORS}
        onNavigate={navigateDay}
      />
    </div>
  );
}

type DashboardHeaderProps = {
  onOpenNewLead: () => void;
  onAddLead: () => void;
  onCreateEvent: () => void;
  onSelectLead: (lead: ApiLead) => void;
  onSelectTask: (task: Task) => void;
  onSelectAppointment: (appointment: Appointment) => void;
};

function DashboardHeader({ onOpenNewLead, onAddLead, onCreateEvent, onSelectLead, onSelectTask, onSelectAppointment }: DashboardHeaderProps) {
  return (
    <div className="glass-strong sticky top-3 z-40 rounded-[calc(var(--radius)+16px)] border border-[--color-border]/50 px-4 py-4 shadow-[0_24px_64px_rgba(18,13,10,0.22)] overflow-visible">
      <div className="flex flex-wrap items-center gap-3">
        <SearchBar onSelectLead={onSelectLead} onSelectTask={onSelectTask} onSelectAppointment={onSelectAppointment} />
        <button
          type="button"
          onClick={onCreateEvent}
          className="icon-chip rounded-[--radius-lg] px-3 py-2 text-sm"
        >
          Create event
        </button>
        <button
          type="button"
          onClick={onOpenNewLead}
          className="gbtn rounded-[--radius-lg] px-3 py-2 text-sm"
        >
          New leads
        </button>
        <button
          type="button"
          onClick={onAddLead}
          className="gbtn rounded-[--radius-lg] px-3 py-2 text-sm"
        >
          Add lead
        </button>
      </div>
    </div>
  );
}

type DayLeadsSheetProps = {
  open: boolean;
  date: Date;
  leads: DashboardLead[];
  onClose: () => void;
  onSelect: (lead: DashboardLead) => void;
  stageColors: Record<LegacyLeadStage, string>;
  onNavigate: (offset: number) => void;
};

function DayLeadsSheet({ open, date, leads, onClose, onSelect, stageColors, onNavigate }: DayLeadsSheetProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/40 px-4 py-10">
      <div className="glass-strong pointer-events-auto w-full max-w-2xl rounded-[calc(var(--radius)+18px)] border border-[--color-border]/50 p-6 shadow-[0_36px_80px_rgba(18,13,10,0.3)]">
        <header className="flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-wide text-[--color-muted-foreground]">Leads on</div>
            <div className="text-lg font-semibold text-[--color-foreground]">{format(date, "PPP")}</div>
          </div>
          <div className="flex items-center gap-2 text-xs text-[--color-muted-foreground]">
            <button
              type="button"
              onClick={() => onNavigate(-1)}
              className="icon-chip rounded-full px-2 py-1"
              aria-label="Previous day"
            >
              ◀
            </button>
            <button
              type="button"
              onClick={() => onNavigate(1)}
              className="icon-chip rounded-full px-2 py-1"
              aria-label="Next day"
            >
              ▶
            </button>
            <button
              type="button"
              onClick={onClose}
              className="icon-chip rounded-full px-2 py-1"
            >
              Close
            </button>
          </div>
        </header>

        <div className="mt-4 max-h-[60vh] space-y-3 overflow-y-auto pr-1">
          {leads.length === 0 ? (
            <div className="rounded-[calc(var(--radius)+8px)] border border-dashed border-[--color-border]/60 bg-[rgba(18,13,10,0.08)] p-4 text-sm text-[--color-muted-foreground]">
              No leads scheduled for this day yet.
            </div>
          ) : (
            leads.map((lead) => {
              const stage = (lead.stage as LegacyLeadStage) ?? "uncontacted";
              const color = stageColors[stage] ?? "var(--color-primary)";
              return (
                <button
                  key={lead.id}
                  type="button"
                  onClick={() => onSelect(lead)}
                  className="glass-strong w-full rounded-[calc(var(--radius)+10px)] border border-[--color-border]/50 px-4 py-3 text-left shadow-[0_16px_36px_rgba(18,13,10,0.18)] transition hover:border-[--color-border]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-[--color-foreground]">{lead.name || "Untitled lead"}</div>
                      <div className="text-xs text-[--color-muted-foreground]">
                        {lead.email || "—"}
                        {lead.phone ? ` • ${lead.phone}` : ""}
                      </div>
                    </div>
                    <span
                      className="rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white"
                      style={{ background: color }}
                    >
                      {stage.replace("_", " ")}  
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

type CenterTabsProps = {
  tab: "leads" | "tasks" | "appointments" | "calendar";
  onTabChange: (tab: "leads" | "tasks" | "appointments" | "calendar") => void;
  leads: DashboardLead[];
  isLoadingLeads: boolean;
  onOpenLead: (lead: DashboardLead) => void;
  appointments: Appointment[];
  calendarDensity: CalendarEventDensity;
  appointmentsByDay: Record<string, Appointment[]>;
  leadsByDay: Record<string, Array<{ id: string; stage: LegacyLeadStage; label: string }>>;
  stageColors: Record<LegacyLeadStage, string>;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onScheduleLead: (lead: ApiLead) => void;
  onCreateLeadForDay: () => void;
};

function CenterTabs({
  tab,
  onTabChange,
  leads,
  isLoadingLeads,
  onOpenLead,
  appointments,
  calendarDensity,
  appointmentsByDay,
  leadsByDay,
  stageColors,
  selectedDate,
  onSelectDate,
  onScheduleLead,
  onCreateLeadForDay,
}: CenterTabsProps) {
  return (
    <div className="space-y-4">
      <div className="glass-strong rounded-[calc(var(--radius)+12px)] border border-[--color-border]/50 p-1 flex items-center gap-1 shadow-[0_18px_48px_rgba(18,13,10,0.18)]">
        {[{ id: "leads", label: "Leads" }, { id: "tasks", label: "Tasks" }, { id: "appointments", label: "Appointments" }, { id: "calendar", label: "Calendar" }].map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id as CenterTabsProps["tab"]) }
            className={`px-3 py-2 rounded-[calc(var(--radius)+6px)] text-sm ${tab === item.id ? "gbtn" : "icon-chip"}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "leads" && (
        <div className="glass rounded-[--radius-xl] border border-[--color-border]/60 p-3">
          <LeadList leads={leads} onOpen={onOpenLead} />
          {isLoadingLeads ? (
            <p className="mt-3 text-xs text-[--color-muted-foreground]">Loading leads…</p>
          ) : null}
        </div>
      )}

      {tab === "tasks" && <TasksList />}

      {tab === "appointments" && <AppointmentsList appointments={appointments} />}

      {tab === "calendar" && (
        <div className="space-y-3">
          <MonthWidget
            events={calendarDensity}
            appointmentsByDay={appointmentsByDay}
            leadsByDay={leadsByDay}
            stageColors={stageColors}
            onSelectDate={onSelectDate}
          />
          <div className="glass rounded-[--radius-xl] border border-[--color-border]/60 p-3 space-y-3 text-sm overflow-visible">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="font-medium text-[--color-foreground]">{format(selectedDate, "PPP")}</div>
              <button
                type="button"
                onClick={() => onSelectDate(new Date())}
                className="icon-chip rounded-[--radius-md] px-3 py-1 text-xs"
              >
                Today
              </button>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <LeadQuickSearch
                onSelect={(lead) => {
                  onScheduleLead(lead);
                }}
                className="w-full sm:w-72"
                placeholder="Schedule existing lead"
              />
              <button
                type="button"
                onClick={onCreateLeadForDay}
                className="gbtn rounded-[--radius-md] px-3 py-2 text-sm"
              >
                New lead for this day
              </button>
            </div>
            {appointments.length === 0 ? (
              <p className="text-[--color-muted-foreground]">No events scheduled yet — use the quick actions above to book this day.</p>
            ) : (
              <ul className="space-y-2">
                {appointments.map((event) => (
                  <li
                    key={event.id}
                    className="rounded-[--radius-lg] border border-[--color-border]/50 bg-[rgba(18,13,10,0.08)] px-3 py-2 shadow-[0_2px_8px_rgba(0,0,0,0.1)]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-medium text-[--color-foreground]">{event.title}</div>
                        <div className="text-xs text-[--color-muted-foreground]">
                          {new Date(event.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          {event.location ? ` • ${event.location}` : ""}
                        </div>
                      </div>
                      <span
                        className="icon-chip px-2 py-0.5 rounded-[--radius-sm] text-[10px] font-semibold"
                        style={{
                          background: event.status === AppointmentStatusEnum.CONFIRMED || event.status === AppointmentStatusEnum.COMPLETED
                            ? "color-mix(in srgb, var(--sage) 35%, transparent)"
                            : event.status === AppointmentStatusEnum.TENTATIVE
                              ? "color-mix(in srgb, var(--amber) 40%, transparent)"
                              : "color-mix(in srgb, var(--destructive) 30%, transparent)",
                        }}
                      >
                        {event.status?.toLowerCase() ?? "scheduled"}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function buildLeadParams(
  stage: LeadStage | null | undefined,
  filters: string[],
  search: string,
  createdAfter?: string,
) {
  const params: Record<string, unknown> = {};
  if (stage) params.stage = stage;
  if (createdAfter) params.createdAfter = createdAfter;
  if (filters.includes("awaiting-reply")) params.awaitingReply = true;
  if (filters.includes("consult-requested")) params.consultRequested = true;
  if (filters.includes("deposit-pending")) params.depositPending = true;
  if (filters.includes("contract-pending")) params.contractPending = true;
  if (filters.includes("high-budget")) params.highBudget = true;
  if (search.trim()) params.search = search.trim();
  return params;
}

function buildEventDensity(appointments: Appointment[]): CalendarEventDensity {
  return appointments.reduce<CalendarEventDensity>((acc, appointment) => {
    const key = toDateKey(appointment.start);
    if (!key) return acc;
    const status = appointment.status ?? AppointmentStatusEnum.TENTATIVE;
    if (!acc[key]) acc[key] = {};
    acc[key]![status] = (acc[key]![status] ?? 0) + 1;
    return acc;
  }, {});
}

function mapApiLeadToLegacy(row: ApiLead): DashboardLead {
  const stage = API_TO_LEGACY_STAGE[row.stage] ?? "uncontacted";
  const createdIso = safeIso(row.createdAt) ?? new Date().toISOString();
  const noteEntry = row.message
    ? [
        {
          id: `msg-${row.id}`,
          text: row.message,
          at: createdIso,
        },
      ]
    : [];

  return {
    id: row.id,
    name: row.name ?? "New inquiry",
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    stage,
    createdAt: createdIso,
    lastContactAt: row.lastOutboundAt ?? undefined,
    dateOfService: row.eventDate ?? undefined,
    notes: noteEntry,
    tags: [],
    contracts: [],
    invoices: [],
    bookings: [],
    source: row.source ?? undefined,
    internalNotes: null,
    intake: {},
    addOns: [],
    intakeNotes: [],
  } as DashboardLead;
}

function safeIso(value: string | Date | null | undefined) {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function buildLeadUpdatePayload(lead: DashboardLead & Record<string, any>) {
  const primaryNote =
    Array.isArray(lead.notes) &&
    lead.notes.length > 0 &&
    typeof lead.notes[0] === "object" &&
    lead.notes[0] !== null &&
    "text" in (lead.notes[0] as Record<string, unknown>)
      ? (lead.notes[0] as { text?: string })
      : null;

  return {
    name: lead.name,
    email: lead.email ?? null,
    phone: lead.phone ?? null,
    stage: LEGACY_TO_API_STAGE[lead.stage as LegacyLeadStage] ?? LeadStageEnum.NEW,
    eventDate: lead.dateOfService ?? null,
    message: primaryNote?.text ?? null,
    consultRequested: Boolean(lead.consultRequested),
    depositPending: Boolean(lead.depositPending),
    contractPending: Boolean(lead.contractPending),
    highBudget: Boolean(lead.highBudget),
    budgetCents:
      typeof lead.budgetCents === "number" ? lead.budgetCents : undefined,
    lastInboundAt: lead.lastInboundAt ?? null,
    lastOutboundAt: lead.lastOutboundAt ?? null,
  };
}

function leadSnapshot(lead: DashboardLead & Record<string, any>) {
  return JSON.stringify({
    id: lead.id,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    stage: lead.stage,
    eventDate: lead.dateOfService ?? null,
  });
}

function useRefreshOnEvent(refresh: () => Promise<void>) {
  useEffect(() => {
    const handler = () => {
      void refresh();
    };
    window.addEventListener(DASHBOARD_DATA_EVENT, handler);
    return () => window.removeEventListener(DASHBOARD_DATA_EVENT, handler);
  }, [refresh]);
}

function toDateKey(value: string | Date | null | undefined) {
  if (!value) return null;
  const date =
    typeof value === "string"
      ? parseISO(value)
      : value instanceof Date
        ? value
        : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return format(date, "yyyy-MM-dd");
}
