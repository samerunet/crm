"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LeadStage, LeadStageEnum } from "@/lib/api";

export const FILTER_KEYS = [
  "new",
  "awaiting-reply",
  "consult-requested",
  "deposit-pending",
  "contract-pending",
  "high-budget",
] as const;

export type FilterKey = (typeof FILTER_KEYS)[number];

const FILTER_KEY_SET = new Set<FilterKey>(FILTER_KEYS);

const sanitizeStage = (value: string | null): LeadStage | null => {
  if (!value) return null;
  const normalized = value.toUpperCase().replace(/-/g, "_");
  if (normalized in LeadStageEnum) {
    return LeadStageEnum[normalized as LeadStage];
  }
  return null;
};

const sanitizeTab = (value: string | null): "leads" | "tasks" | "appointments" | "calendar" => {
  if (!value) return "leads";
  if (value === "tasks" || value === "appointments" || value === "calendar") return value;
  return "leads";
};

const parseFilters = (raw: string | null): FilterKey[] => {
  if (!raw) return [];
  return raw
    .split(",")
    .map((key) => key.trim())
    .filter((key): key is FilterKey => FILTER_KEY_SET.has(key as FilterKey));
};

const buildSearch = (params: URLSearchParams) => {
  const query = params.toString();
  return query ? `?${query}` : "";
};

export const useDashboardParams = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const stage = sanitizeStage(searchParams.get("stage"));
  const tab = sanitizeTab(searchParams.get("tab"));
  const rawFilters = searchParams.get("filters");
  const filters = useMemo(() => parseFilters(rawFilters), [rawFilters]);
  const searchValue = searchParams.get("q")?.trim() ?? "";

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value.length) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.replace(`${pathname}${buildSearch(params)}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const setStage = useCallback(
    (nextStage: LeadStage | null) => {
      setParam("stage", nextStage ? nextStage.toLowerCase() : null);
    },
    [setParam],
  );

  const setTab = useCallback(
    (nextTab: "leads" | "tasks" | "appointments" | "calendar") => {
      setParam("tab", nextTab);
    },
    [setParam],
  );

  const toggleFilter = useCallback(
    (filter: FilterKey) => {
      const current = new URLSearchParams(searchParams.toString());
      const active = parseFilters(current.get("filters"));
      const next = active.includes(filter)
        ? active.filter((key) => key !== filter)
        : [...active, filter];
      if (next.length) {
        current.set("filters", next.join(","));
      } else {
        current.delete("filters");
      }
      router.replace(`${pathname}${buildSearch(current)}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const params = useMemo(
    () => ({ stage, tab, filters, search: searchValue }),
    [stage, tab, filters, searchValue],
  );

  const setSearch = useCallback(
    (value: string) => {
      setParam("q", value.trim().length ? value.trim() : null);
    },
    [setParam],
  );

  return {
    ...params,
    setStage,
    setTab,
    toggleFilter,
    setSearch,
  };
};
