import { NextRequest, NextResponse } from "next/server";
import { Prisma, TaskStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma-node";
import { endOfDay, startOfDay } from "date-fns";

const parseBool = (value: string | null) => value === "true" || value === "1";

const parseDate = (value: string | null): Date | undefined => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const normalizeStatus = (value: string): TaskStatus | undefined => {
  const upper = value.toUpperCase();
  if (upper in TaskStatus) {
    return upper as TaskStatus;
  }
  return undefined;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const and: Prisma.TaskWhereInput[] = [];

    const statuses = searchParams
      .getAll("status")
      .flatMap((chunk) => chunk.split(","))
      .map((value) => value.trim())
      .filter(Boolean)
      .map(normalizeStatus)
      .filter((value): value is TaskStatus => Boolean(value));
    if (statuses.length) {
      and.push({ status: { in: statuses } });
    }

    const query = searchParams.get("q");

    if (query) {
      and.push({
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { notes: { contains: query, mode: "insensitive" } },
          {
            lead: {
              name: { contains: query, mode: "insensitive" },
            },
          },
        ],
      });
    }

    const due = searchParams.get("due");
    if (due === "today") {
      const start = startOfDay(new Date());
      const end = endOfDay(new Date());
      and.push({ dueDate: { gte: start, lte: end } });
    } else if (due === "today-or-future") {
      const start = startOfDay(new Date());
      and.push({ OR: [{ dueDate: null }, { dueDate: { gte: start } }] });
    } else if (due === "range") {
      const rangeStart = parseDate(searchParams.get("rangeStart"));
      const rangeEnd = parseDate(searchParams.get("rangeEnd"));
      if (rangeStart && rangeEnd) {
        and.push({ dueDate: { gte: rangeStart, lte: rangeEnd } });
      } else if (rangeStart) {
        and.push({ dueDate: { gte: rangeStart } });
      } else if (rangeEnd) {
        and.push({ dueDate: { lte: rangeEnd } });
      }
    }

    if (parseBool(searchParams.get("overdue"))) {
      and.push({
        status: TaskStatus.OPEN,
        dueDate: { not: null, lt: new Date() },
      });
    }

    const where: Prisma.TaskWhereInput | undefined = and.length ? { AND: and } : undefined;

    const tasks = await prisma.task.findMany({
      where,
      orderBy: [
        { status: "asc" },
        { dueDate: "asc" },
        { createdAt: "desc" },
      ],
      include: {
        lead: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ ok: true, tasks });
  } catch (error: any) {
    console.error("GET /api/tasks failed", error);
    return NextResponse.json({ ok: false, error: error?.message ?? "Failed to load tasks" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const status = normalizeStatus(typeof payload?.status === "string" ? payload.status : "") ?? TaskStatus.OPEN;
    const dueDate = parseDate(typeof payload?.dueDate === "string" ? payload.dueDate : null);

    const task = await prisma.task.create({
      data: {
        leadId: typeof payload?.leadId === "string" ? payload.leadId : undefined,
        title: typeof payload?.title === "string" && payload.title.trim() ? payload.title.trim() : "Untitled task",
        notes: typeof payload?.notes === "string" ? payload.notes.trim() : undefined,
        status,
        dueDate,
      },
      include: {
        lead: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ ok: true, task }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/tasks failed", error);
    return NextResponse.json({ ok: false, error: error?.message ?? "Failed to create task" }, { status: 500 });
  }
}
