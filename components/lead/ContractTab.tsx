"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";

import { listContracts, type Contract } from "@/lib/api";
import type { Lead as AdminLead } from "@/components/admin/types";
import { renderHollywoodStyleContract } from "@/components/admin/contractTemplates";
import DownloadContractPDF from "@/components/DownloadContractPDF";

type ContractLead = AdminLead & Record<string, any>;

type Props = {
  leadId: string;
  lead: ContractLead;
  defaultTemplateId?: string;
};

type SendState = {
  loading: boolean;
  message: string | null;
  link: string | null;
  error: string | null;
};

const moneyPattern = /-?\d+(?:\.\d+)?/;

function parseMoneyValue(value: string): number | null {
  const match = value.replace(/,/g, "").match(moneyPattern);
  return match ? Number(match[0]) : null;
}

function normalizePriceText(raw: unknown): string {
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return `$${raw.toFixed(2)}`;
  }

  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return "$0.00";
    const suffixMatch = trimmed.match(/(\/.*)$/);
    const suffix = suffixMatch ? suffixMatch[1] ?? "" : "";
    const numeric = parseMoneyValue(trimmed);
    if (numeric !== null) {
      return `$${numeric.toFixed(2)}${suffix}`;
    }
    return trimmed.startsWith("$") ? trimmed : `$${trimmed}`;
  }

  if (raw && typeof raw === "object") {
    const candidate =
      (raw as any).priceText ??
      (raw as any).price ??
      (raw as any).amount ??
      (raw as any).value ??
      (typeof (raw as any).amountCents === "number"
        ? (raw as any).amountCents / 100
        : undefined);
    return normalizePriceText(candidate);
  }

  return "$0.00";
}

function normalizeContractItems(items: any[] | undefined | null) {
  if (!Array.isArray(items) || !items.length) return undefined;
  return items
    .map((item) => {
      if (!item) return null;
      const labelSource =
        item.label ??
        item.name ??
        item.title ??
        (typeof item === "string" ? item : null);
      const label =
        typeof labelSource === "string" && labelSource.trim()
          ? labelSource.trim()
          : "Service";
      const priceText = normalizePriceText(
        item.priceText ?? item.price ?? item.amount ?? item.value,
      );
      return { label, priceText };
    })
    .filter(Boolean) as Array<{ label: string; priceText: string }>;
}

export default function ContractTab({ leadId, lead, defaultTemplateId }: Props) {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loadingContracts, setLoadingContracts] = useState(false);
  const [sendState, setSendState] = useState<SendState>({
    loading: false,
    message: null,
    link: null,
    error: null,
  });

  const fetchContracts = useCallback(async () => {
    setLoadingContracts(true);
    try {
      const data = await listContracts({ leadId });
      setContracts(data);
    } catch (error: any) {
      console.error("Failed to load contracts", error);
      setSendState((prev) => ({ ...prev, error: "Unable to load contracts right now." }));
    } finally {
      setLoadingContracts(false);
    }
  }, [leadId]);

  useEffect(() => {
    void fetchContracts();
  }, [fetchContracts]);

  const statusStyles = useMemo(
    () =>
      new Map<Contract["status"], string>([
        ["DRAFT", "bg-[rgba(18,13,10,0.10)] text-[--color-muted-foreground]"],
        ["SENT", "bg-[rgba(108,58,34,0.18)] text-[--color-primary-foreground]"],
        ["SIGNED", "bg-[rgba(0,135,103,0.18)] text-[--sage]"],
        ["VOID", "bg-[rgba(90,55,37,0.18)] text-[--destructive]"],
      ]),
    [],
  );

  const latestLocalContract = useMemo(() => {
    const list = Array.isArray(lead.contracts) ? lead.contracts : [];
    return list.length ? list[0] : null;
  }, [lead.contracts]);

  const previewItems = useMemo(() => {
    const itemsFromContract = normalizeContractItems(latestLocalContract?.items);
    if (itemsFromContract?.length) return itemsFromContract;

    const services = Array.isArray((lead as ContractLead).services)
      ? (lead as ContractLead).services
      : null;
    if (!services || !services.length) return undefined;
    return normalizeContractItems(services);
  }, [lead, latestLocalContract]);

  const previewDeposit = useMemo(() => {
    const candidateFields = [
      latestLocalContract?.depositAmount,
      (lead as ContractLead).depositAmount,
      (lead as ContractLead).deposit,
      (lead as ContractLead).contracts?.[0]?.depositAmount,
    ];
    const candidate = candidateFields.find(
      (value): value is number => typeof value === "number" && Number.isFinite(value),
    );
    if (typeof candidate === "number") return candidate;
    if (typeof (lead as ContractLead).budgetCents === "number" && (lead as ContractLead).budgetCents > 0) {
      return Math.max(100, Math.round(((lead as ContractLead).budgetCents / 100) * 0.25));
    }
    return undefined;
  }, [lead, latestLocalContract]);

  const contractPreviewHtml = useMemo(
    () =>
      renderHollywoodStyleContract(lead as any, {
        items: previewItems,
        depositAmount: previewDeposit,
        fillable: latestLocalContract ? latestLocalContract.fillable ?? false : false,
      }),
    [lead, latestLocalContract, previewItems, previewDeposit],
  );

  const sendContract = useCallback(async () => {
    setSendState({ loading: true, message: null, link: null, error: null });
    try {
      const payload: Record<string, unknown> = { leadId };
      if (defaultTemplateId) payload.templateId = defaultTemplateId;

      const response = await fetch("/api/contracts/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to send contract");
      }
      setSendState({
        loading: false,
        message: "Contract sent to client.",
        link: null,
        error: null,
      });
      void fetchContracts();
    } catch (error: any) {
      console.error("sendContract failed", error);
      setSendState({
        loading: false,
        message: null,
        link: null,
        error: error?.message ?? "Error sending contract",
      });
    }
  }, [defaultTemplateId, fetchContracts, leadId]);

  return (
    <div className="space-y-4">
      <div className="glass rounded-[--radius-xl] border border-[--color-border]/60 p-4 shadow-[0_16px_40px_rgba(18,13,10,0.16)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-base font-semibold text-[--color-foreground]">Documenso Contract</div>
            <p className="text-sm opacity-75">
              Generate and send an e-signature agreement using the current template.
            </p>
          </div>
          <button
            type="button"
            onClick={sendContract}
            disabled={sendState.loading}
            className="gbtn rounded-[--radius-lg] px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sendState.loading ? "Sending…" : "Send Contract"}
          </button>
          <DownloadContractPDF
            lead={lead}
            options={{
              depositAmount: previewDeposit,
              items: previewItems,
              fillable: false,
            }}
          />
        </div>

        {sendState.message && <p className="text-sm text-[--color-foreground]/80">{sendState.message}</p>}
        {sendState.error && <p className="text-sm text-destructive">{sendState.error}</p>}
        {sendState.link && (
          <p className="text-sm">
            Signing link:{" "}
            <a
              href={sendState.link}
              className="underline"
              target="_blank"
              rel="noreferrer"
            >
              {sendState.link}
            </a>
          </p>
        )}
      </div>

      <div className="glass rounded-[--radius-xl] border border-[--color-border]/60 p-4 shadow-[0_16px_40px_rgba(18,13,10,0.16)] space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-[--color-foreground]">Contract History</div>
          <button
            type="button"
            onClick={() => void fetchContracts()}
            className="icon-chip rounded-[--radius-md] px-3 py-1 text-xs"
            disabled={loadingContracts}
          >
            {loadingContracts ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        {loadingContracts ? (
          <p className="text-sm text-[--color-muted-foreground]">Loading contracts…</p>
        ) : contracts.length === 0 ? (
          <p className="text-sm text-[--color-muted-foreground]">No contracts yet.</p>
        ) : (
          <ul className="space-y-3">
            {contracts.map((contract) => (
              <li
                key={contract.id}
                className="rounded-[--radius-lg] border border-[--color-border]/50 bg-[rgba(18,13,10,0.08)] p-3 shadow-[0_12px_28px_rgba(18,13,10,0.12)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold text-[--color-foreground]">
                      {contract.title || "Contract"}
                    </div>
                    <div className="text-xs text-[--color-muted-foreground]">
                      Created {format(new Date(contract.createdAt), "MMM d, yyyy")}
                    </div>
                  </div>
                  <span
                    className={[
                      "inline-flex items-center rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide",
                      statusStyles.get(contract.status) ?? "icon-chip",
                    ].join(" ")}
                  >
                    {contract.status.toLowerCase()}
                  </span>
                </div>

                <dl className="mt-2 grid gap-1 text-xs text-[--color-muted-foreground] sm:grid-cols-2">
                  {contract.sentAt && (
                    <div>
                      <span className="font-medium text-[--color-foreground]">Sent:</span>{" "}
                      {format(new Date(contract.sentAt), "MMM d, yyyy h:mma")}
                    </div>
                  )}
                  {contract.signedAt && (
                    <div>
                      <span className="font-medium text-[--color-foreground]">Signed:</span>{" "}
                      {format(new Date(contract.signedAt), "MMM d, yyyy h:mma")}
                    </div>
                  )}
                  {contract.amountCents !== null && (
                    <div>
                      <span className="font-medium text-[--color-foreground]">Amount:</span>{" "}
                      ${(contract.amountCents / 100).toFixed(2)}
                    </div>
                  )}
                  {contract.externalRef && (
                    <div>
                      <span className="font-medium text-[--color-foreground]">Doc ID:</span>{" "}
                      {contract.externalRef}
                    </div>
                  )}
                </dl>

                {contract.fileUrl && (
                  <div className="mt-2">
                    <a
                      href={contract.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs underline"
                    >
                      View signed PDF
                    </a>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="glass rounded-[--radius-xl] border border-[--color-border]/60 p-4 shadow-[0_16px_40px_rgba(18,13,10,0.16)] space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-[--color-foreground]">Contract Preview</div>
            <p className="text-xs opacity-75">
              Generated from the client profile. Update lead details or services to refresh.
            </p>
          </div>
          <span className="icon-chip rounded-[--radius-md] px-3 py-1 text-xs">Template</span>
        </div>
        <div className="rounded-[--radius-lg] border border-[--color-border]/40 bg-[rgba(18,13,10,0.04)] p-3 max-h-[460px] overflow-auto">
          <div
            className="prose prose-sm max-w-none bg-white text-black rounded-[--radius-lg] shadow-[0_12px_32px_rgba(0,0,0,0.18)]"
            style={{ padding: "1.25rem" }}
            dangerouslySetInnerHTML={{ __html: contractPreviewHtml }}
          />
        </div>
      </div>
    </div>
  );
}
