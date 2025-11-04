"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Lead } from "@/lib/api";
import { listLeads } from "@/lib/api";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";

const MIN_QUERY = 2;

type LeadQuickSearchProps = {
  onSelect: (lead: Lead) => void;
  placeholder?: string;
  className?: string;
};

export default function LeadQuickSearch({ onSelect, placeholder = "Search leads…", className }: LeadQuickSearchProps) {
  const [query, setQuery] = useState("");
  const debounced = useDebouncedValue(query, 200);
  const [results, setResults] = useState<Lead[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const canSearch = debounced.trim().length >= MIN_QUERY;

  const runSearch = useCallback(async () => {
    const needle = debounced.trim();
    if (needle.length < MIN_QUERY) {
      setResults([]);
      setOpen(false);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const leads = await listLeads({ search: needle });
      setResults(leads.slice(0, 6));
      setOpen(true);
    } catch (err) {
      console.error("Lead quick search failed", err);
      setError(err instanceof Error ? err.message : "Search failed");
      setResults([]);
      setOpen(true);
    } finally {
      setLoading(false);
    }
  }, [debounced]);

  useEffect(() => {
    void runSearch();
  }, [runSearch]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className={className ? `relative ${className}` : "relative w-full"}>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-[--radius-md] border border-[--color-border]/60 bg-[--color-card] px-3 py-2 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
        aria-label="Quick lead search"
      />
      {open && (
        <div className="absolute left-0 right-0 top-full z-[130] mt-2 rounded-[--radius-lg] border border-[--color-border]/60 bg-[--color-card] shadow-[0_18px_44px_rgba(0,0,0,0.24)]">
          {loading ? (
            <div className="space-y-2 p-3 text-xs text-[--color-muted-foreground]">
              <div className="animate-pulse rounded bg-[rgba(18,13,10,0.12)] h-3 w-1/2" />
              <div className="animate-pulse rounded bg-[rgba(18,13,10,0.12)] h-3 w-2/3" />
            </div>
          ) : results.length === 0 ? (
            <div className="p-3 text-xs text-[--color-muted-foreground]">
              {error ?? (canSearch ? "No matching leads" : "Type at least 2 characters")}
            </div>
          ) : (
            <ul className="max-h-56 overflow-y-auto divide-y divide-[--color-border]/20">
              {results.map((lead) => (
                <li key={lead.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(lead);
                      setOpen(false);
                      setQuery("");
                      setResults([]);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-[rgba(18,13,10,0.08)]"
                  >
                    <div className="text-sm font-medium text-[--color-foreground]">{lead.name || lead.email}</div>
                    <div className="text-xs text-[--color-muted-foreground]">
                      {lead.email} {lead.phone ? `• ${lead.phone}` : ""}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
