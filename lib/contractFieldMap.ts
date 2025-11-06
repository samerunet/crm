/* eslint-disable unicorn/filename-case */
import type { Lead } from "@prisma/client";

export function mapLeadToTemplateFields(lead: Lead): Record<string, string> {
  return {
    client_name: lead.name ?? "",
    client_email: lead.email ?? "",
    event_date: lead.eventDate ? new Date(lead.eventDate).toLocaleDateString("en-US") : "",
    phone: lead.phone ?? "",
    venue: (lead as unknown as { location?: string }).location ?? "",
    budget: lead.budgetCents ? `$${(lead.budgetCents / 100).toFixed(2)}` : "",
    notes: lead.message ?? "",
  };
}

export function documentDisplayName(lead: Lead) {
  const iso = lead.eventDate ? new Date(lead.eventDate).toISOString().slice(0, 10) : "";
  return `Makeup Services Agreement — ${lead.name ?? "Client"}${iso ? ` (${iso})` : ""}`;
}
