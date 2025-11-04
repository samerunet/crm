import { NextRequest, NextResponse } from "next/server";
import { Prisma, LeadStage } from "@prisma/client";
import { prisma } from "@/lib/prisma-node";
import { subHours } from "date-fns";

const EMAIL_PLACEHOLDER = "no-email@placeholder.invalid";

const parseBoolean = (value: string | null) => value === "true" || value === "1";

const parseDate = (raw: unknown): Date | undefined => {
  if (!raw) return undefined;
  if (typeof raw === "string") {
    const date = new Date(raw);
    return Number.isNaN(date.getTime()) ? undefined : date;
  }
  if (raw instanceof Date) {
    return Number.isNaN(raw.getTime()) ? undefined : raw;
  }
  return undefined;
};

const normalizeStage = (value: unknown): LeadStage | undefined => {
  if (typeof value !== "string") return undefined;
  const upper = value.toUpperCase().replace(/-/g, "_");
  if (upper in LeadStage) {
    return upper as LeadStage;
  }
  return undefined;
};

const sanitizeString = (value: unknown, max = 255): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const andFilters: Prisma.LeadWhereInput[] = [];

    const stagesRaw = searchParams.getAll("stage").flatMap((chunk) =>
      chunk
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    );
    if (stagesRaw.length) {
      const stages = stagesRaw
        .map((value) => normalizeStage(value))
        .filter((value): value is LeadStage => Boolean(value));
      if (stages.length) {
        andFilters.push({ stage: { in: stages } });
      }
    }

    const createdAfter = parseDate(searchParams.get("createdAfter"));
    if (createdAfter) {
      andFilters.push({ createdAt: { gte: createdAfter } });
    }

    if (parseBoolean(searchParams.get("consultRequested"))) {
      andFilters.push({ OR: [{ consultRequested: true }, { stage: LeadStage.CONSULT_TRIAL }] });
    }

    if (parseBoolean(searchParams.get("depositPending"))) {
      andFilters.push({ depositPending: true });
    }

    if (parseBoolean(searchParams.get("contractPending"))) {
      andFilters.push({ contractPending: true });
    }

    if (parseBoolean(searchParams.get("highBudget"))) {
      andFilters.push({ OR: [{ highBudget: true }, { budgetCents: { gte: 50000 } }] });
    }

    if (parseBoolean(searchParams.get("awaitingReply"))) {
      const cutoff = subHours(new Date(), 48);
      andFilters.push({
        lastOutboundAt: { not: null },
      });
      andFilters.push({
        OR: [{ lastInboundAt: null }, { lastInboundAt: { lt: cutoff } }],
      });
      andFilters.push({ lastOutboundAt: { lt: cutoff } });
    }

    const searchTerm = searchParams.get("search");
    if (searchTerm) {
      andFilters.push({
        OR: [
          { name: { contains: searchTerm, mode: "insensitive" } },
          { email: { contains: searchTerm, mode: "insensitive" } },
          { phone: { contains: searchTerm, mode: "insensitive" } },
          { message: { contains: searchTerm, mode: "insensitive" } },
        ],
      });
    }

    const where: Prisma.LeadWhereInput | undefined = andFilters.length ? { AND: andFilters } : undefined;

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ ok: true, leads });
  } catch (error: any) {
    console.error("GET /api/leads failed", error);
    return NextResponse.json({ ok: false, error: error?.message ?? "Failed to fetch leads" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const name = sanitizeString(payload?.name);
    const emailInput = sanitizeString(payload?.email) ?? EMAIL_PLACEHOLDER;
    const phone = sanitizeString(payload?.phone, 100);
    const message = sanitizeString(payload?.message, 5000);
    const source = sanitizeString(payload?.source, 150);
    const stage = normalizeStage(payload?.stage) ?? LeadStage.NEW;
    const eventDate = parseDate(payload?.eventDate ?? payload?.date ?? payload?.dateOfService);

    const lead = await prisma.lead.create({
      data: {
        name,
        email: emailInput,
        phone,
        message,
        source,
        stage,
        eventDate,
        consultRequested: Boolean(payload?.consultRequested),
        depositPending: Boolean(payload?.depositPending),
        contractPending: Boolean(payload?.contractPending),
        highBudget:
          typeof payload?.highBudget === "boolean"
            ? payload.highBudget
            : (typeof payload?.budgetCents === "number" && payload.budgetCents >= 50000) || false,
        budgetCents: typeof payload?.budgetCents === "number" ? payload.budgetCents : null,
        lastInboundAt: parseDate(payload?.lastInboundAt),
        lastOutboundAt: parseDate(payload?.lastOutboundAt),
      },
    });

    return NextResponse.json({ ok: true, lead }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/leads failed", error);
    return NextResponse.json({ ok: false, error: error?.message ?? "Failed to create lead" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const payload = await request.json();
    const id = sanitizeString(payload?.id);
    if (!id) {
      return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
    }

    const data: Prisma.LeadUpdateInput = {};

    if (payload && Object.hasOwn(payload, "name")) data.name = sanitizeString(payload?.name);
    if (payload && Object.hasOwn(payload, "email")) {
      const email = sanitizeString(payload?.email);
      data.email = email ?? EMAIL_PLACEHOLDER;
    }
    if (payload && Object.hasOwn(payload, "phone")) data.phone = sanitizeString(payload?.phone, 100);
    if (payload && Object.hasOwn(payload, "message")) data.message = sanitizeString(payload?.message, 5000);
    if (payload && Object.hasOwn(payload, "source")) data.source = sanitizeString(payload?.source, 150);

    const stage = normalizeStage(payload?.stage);
    if (stage) data.stage = stage;

    if (payload && Object.hasOwn(payload, "consultRequested")) data.consultRequested = Boolean(payload.consultRequested);
    if (payload && Object.hasOwn(payload, "depositPending")) data.depositPending = Boolean(payload.depositPending);
    if (payload && Object.hasOwn(payload, "contractPending")) data.contractPending = Boolean(payload.contractPending);
    if (payload && Object.hasOwn(payload, "highBudget")) data.highBudget = Boolean(payload.highBudget);

    if (payload && Object.hasOwn(payload, "budgetCents")) {
      data.budgetCents = typeof payload?.budgetCents === "number" ? payload.budgetCents : null;
    }

    if (payload && Object.hasOwn(payload, "eventDate")) {
      const eventDate = parseDate(payload?.eventDate);
      data.eventDate = eventDate ?? null;
    }

    if (payload && Object.hasOwn(payload, "lastInboundAt")) {
      data.lastInboundAt = parseDate(payload?.lastInboundAt) ?? null;
    }

    if (payload && Object.hasOwn(payload, "lastOutboundAt")) {
      data.lastOutboundAt = parseDate(payload?.lastOutboundAt) ?? null;
    }

    const lead = await prisma.lead.update({
      where: { id },
      data,
    });

    return NextResponse.json({ ok: true, lead });
  } catch (error: any) {
    console.error("PATCH /api/leads failed", error);
    return NextResponse.json({ ok: false, error: error?.message ?? "Failed to update lead" }, { status: 500 });
  }
}
