import { NextRequest, NextResponse } from "next/server";
import { AppointmentStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma-node";
import { endOfDay, startOfDay } from "date-fns";

const parseDate = (value: unknown): Date | undefined => {
  if (!value) return undefined;
  if (typeof value === "string") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
  }
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value;
  }
  return undefined;
};

const normalizeStatus = (value: unknown): AppointmentStatus | undefined => {
  if (typeof value !== "string") return undefined;
  const upper = value.toUpperCase();
  if (upper in AppointmentStatus) {
    return upper as AppointmentStatus;
  }
  return undefined;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const and: Prisma.AppointmentWhereInput[] = [];

    const query = searchParams.get("q");

    if (query) {
      and.push({
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { location: { contains: query, mode: "insensitive" } },
          {
            lead: {
              name: { contains: query, mode: "insensitive" },
            },
          },
        ],
      });
    }

    const date = parseDate(searchParams.get("date"));
    if (date) {
      and.push({ start: { gte: startOfDay(date), lte: endOfDay(date) } });
    }

    const rangeStart = parseDate(searchParams.get("rangeStart"));
    const rangeEnd = parseDate(searchParams.get("rangeEnd"));
    if (rangeStart && rangeEnd) {
      and.push({ start: { gte: rangeStart, lte: rangeEnd } });
    } else if (rangeStart) {
      and.push({ start: { gte: rangeStart } });
    } else if (rangeEnd) {
      and.push({ start: { lte: rangeEnd } });
    }

    const where: Prisma.AppointmentWhereInput | undefined = and.length ? { AND: and } : undefined;

    const appointments = await prisma.appointment.findMany({
      where,
      orderBy: { start: "asc" },
      include: {
        lead: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ ok: true, appointments });
  } catch (error: any) {
    console.error("GET /api/appointments failed", error);
    return NextResponse.json({ ok: false, error: error?.message ?? "Failed to load appointments" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const start = parseDate(payload?.start);
    if (!start) {
      return NextResponse.json({ ok: false, error: "Missing or invalid start" }, { status: 400 });
    }

    const end = parseDate(payload?.end ?? null);
    const status = normalizeStatus(payload?.status) ?? AppointmentStatus.TENTATIVE;

    const appointment = await prisma.appointment.create({
      data: {
        leadId: typeof payload?.leadId === "string" ? payload.leadId : undefined,
        title:
          typeof payload?.title === "string" && payload.title.trim() ? payload.title.trim() : "New appointment",
        status,
        start,
        end,
        location: typeof payload?.location === "string" ? payload.location.trim() : undefined,
        notes: typeof payload?.notes === "string" ? payload.notes.trim() : undefined,
      },
      include: {
        lead: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ ok: true, appointment }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/appointments failed", error);
    return NextResponse.json({ ok: false, error: error?.message ?? "Failed to create appointment" }, { status: 500 });
  }
}
