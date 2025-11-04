"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import type { Appointment, Lead, Task } from "@/lib/api";
import { listAppointments, listLeads, listTasks, TaskStatusEnum } from "@/lib/api";
import { useDashboardParams } from "@/lib/hooks/use-dashboard-params";
import { DASHBOARD_DATA_EVENT } from "@/lib/dashboard/events";

const RESULT_LIMIT = 5;

/* eslint-disable no-unused-vars */
type SearchResults = {
  leads: Lead[];
  tasks: Task[];
  appointments: Appointment[];
};

type SearchBarProps = {
  onSelectLead: (_lead: Lead) => void;
  onSelectTask?: (_task: Task) => void;
  onSelectAppointment?: (_appointment: Appointment) => void;
};
/* eslint-enable no-unused-vars */

const shimmer = "animate-pulse bg-[rgba(18,13,10,0.12)]";

export default function SearchBar({ onSelectLead, onSelectTask, onSelectAppointment }: SearchBarProps) {
  const { stage, filters, search, setSearch, setTab } = useDashboardParams();
  const [query, setQuery] = useState(search);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResults>({ leads: [], tasks: [], appointments: [] });
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastQueryRef = useRef<string>("");

  useEffect(() => {
    setQuery(search);
    lastQueryRef.current = search.trim().length >= 2 ? search.trim() : "";
  }, [search]);

  const filtersKey = useMemo(() => filters.slice().sort().join("|"), [filters]);

  const filtersParams = useMemo(() => {
    const params: Record<string, unknown> = {};
    if (filters.includes("new")) {
      params.createdAfter = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    }
    if (filters.includes("awaiting-reply")) params.awaitingReply = true;
    if (filters.includes("consult-requested")) params.consultRequested = true;
    if (filters.includes("deposit-pending")) params.depositPending = true;
    if (filters.includes("contract-pending")) params.contractPending = true;
    if (filters.includes("high-budget")) params.highBudget = true;
    return params;
  }, [filtersKey]);

  const runSearchForTerm = useCallback(async (term: string) => {
    const q = term.trim();
    if (q.length < 2) {
      lastQueryRef.current = "";
      setLoading(false);
      setError(null);
      setResults({ leads: [], tasks: [], appointments: [] });
      setOpen(false);
      return;
    }
    if (q === lastQueryRef.current) {
      setOpen(true);
      return;
    }
    lastQueryRef.current = q;
    setLoading(true);
    setError(null);
    setOpen(true);
    try {
      const [leadRes, taskRes, apptRes] = await Promise.all([
        listLeads({
          stage,
          search: q,
          ...filtersParams,
        }),
        listTasks({ status: TaskStatusEnum.OPEN, search: q }),
        listAppointments({ search: q }),
      ]);
      setResults({
        leads: leadRes.slice(0, RESULT_LIMIT),
        tasks: taskRes.slice(0, RESULT_LIMIT),
        appointments: apptRes.slice(0, RESULT_LIMIT),
      });
      setOpen(true);
    } catch (err) {
      console.error("Search failed", err);
      setError(err instanceof Error ? err.message : "Search failed");
      setResults({ leads: [], tasks: [], appointments: [] });
      setOpen(true);
    } finally {
      setLoading(false);
    }
  }, [filtersParams, stage]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setLoading(false);
      setError(null);
      lastQueryRef.current = "";
      setResults({ leads: [], tasks: [], appointments: [] });
      setOpen(false);
    }
  }, [query]);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, []);

  useEffect(() => {
    const handler = () => {
      if (lastQueryRef.current.length >= 2) {
        void runSearchForTerm(lastQueryRef.current);
      }
    };
    window.addEventListener(DASHBOARD_DATA_EVENT, handler);
    return () => window.removeEventListener(DASHBOARD_DATA_EVENT, handler);
  }, [runSearchForTerm]);

  const handleSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      lastQueryRef.current = "";
      setSearch("");
      setOpen(false);
      setResults({ leads: [], tasks: [], appointments: [] });
      return;
    }
    setSearch(trimmed);
    await runSearchForTerm(trimmed);
    setQuery(trimmed);
  }, [query, runSearchForTerm, setSearch]);

  return (
    <div ref={containerRef} className="relative flex-1">
      <form onSubmit={handleSubmit}>
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
          }}
          onFocus={() => {
            if (lastQueryRef.current.length >= 2 && (results.leads.length + results.tasks.length + results.appointments.length) > 0) {
              setOpen(true);
            }
          }}
          placeholder="Search leads, tasks, appointments…"
          className="w-full glass rounded-lg px-3 py-2 border outline-none text-sm"
          aria-label="Search"
        />
        <button type="submit" className="hidden" aria-hidden="true" />
      </form>
      {open && (
        <div className="absolute left-0 right-0 top-full z-[120] mt-2 rounded-[--radius-xl] border border-[--color-border]/60 bg-[--color-card] shadow-[0_24px_60px_rgba(0,0,0,0.32)]">
          {loading ? (
            <div className="space-y-2 p-4">
              <div className={`${shimmer} h-4 w-1/2 rounded`} />
              <div className={`${shimmer} h-3 w-2/3 rounded`} />
            </div>
          ) : (
            <div className="max-h-[320px] overflow-y-auto">
              <SearchSection
                title="Leads"
                empty="No matching leads"
                items={results.leads}
                render={(lead) => (
                  <button
                    type="button"
                    onClick={() => {
                      onSelectLead(lead);
                      setTab("leads");
                      setOpen(false);
                    }}
                    className="w-full rounded-[--radius-lg] px-3 py-2 text-left hover:bg-[rgba(18,13,10,0.08)]"
                  >
                    <div className="text-sm font-medium text-[--color-foreground]">{lead.name || "Untitled lead"}</div>
                    <div className="text-xs text-[--color-muted-foreground]">
                      {lead.email} {lead.phone ? `• ${lead.phone}` : ""}
                    </div>
                  </button>
                )}
              />
              <SearchSection
                title="Tasks"
                empty="No tasks found"
                items={results.tasks}
                render={(task) => (
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTask?.(task);
                      setTab("tasks");
                      setOpen(false);
                    }}
                    className="w-full rounded-[--radius-lg] px-3 py-2 text-left hover:bg-[rgba(18,13,10,0.08)]"
                  >
                    <div className="text-sm font-medium text-[--color-foreground]">{task.title}</div>
                    <div className="text-xs text-[--color-muted-foreground]">
                      {task.lead?.name ? `Lead: ${task.lead.name}` : "Unassigned"}
                    </div>
                  </button>
                )}
              />
              <SearchSection
                title="Appointments"
                empty="No appointments found"
                items={results.appointments}
                render={(event) => (
                  <button
                    type="button"
                    onClick={() => {
                      onSelectAppointment?.(event);
                      setTab("appointments");
                      setOpen(false);
                    }}
                    className="w-full rounded-[--radius-lg] px-3 py-2 text-left hover:bg-[rgba(18,13,10,0.08)]"
                  >
                    <div className="text-sm font-medium text-[--color-foreground]">{event.title}</div>
                    <div className="text-xs text-[--color-muted-foreground]">
                      {new Date(event.start).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </button>
                )}
              />
            </div>
          )}
          {error ? (
            <div className="border-t border-amber-400/60 bg-amber-500/10 px-3 py-2 text-xs text-amber-50">{error}</div>
          ) : null}
        </div>
      )}
    </div>
  );
}

/* eslint-disable no-unused-vars */
type SearchSectionProps<T> = {
  title: string;
  empty: string;
  items: T[];
  render: (value: T) => ReactNode;
};
/* eslint-enable no-unused-vars */

function SearchSection<T>({ title, empty, items, render }: SearchSectionProps<T>) {
  return (
    <div className="border-b border-[--color-border]/30 px-3 py-2">
      <div className="px-1 py-1 text-xs font-semibold uppercase tracking-wide text-[--color-muted-foreground]">
        {title}
      </div>
      {items.length === 0 ? (
        <div className="px-1 py-2 text-xs text-[--color-muted-foreground]">{empty}</div>
      ) : (
        <div className="space-y-1 px-1">
          {items.map((item, index) => {
            const key = (item as { id?: string }).id ?? `${JSON.stringify(item)}-${index}`;
            return <div key={key}>{render(item)}</div>;
          })}
        </div>
      )}
    </div>
  );
}
