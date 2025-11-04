import { NextRequest, NextResponse } from "next/server";
import { Prisma, TaskStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma-node";

const normalizeStatus = (value: unknown): TaskStatus | undefined => {
  if (typeof value !== "string") return undefined;
  const upper = value.toUpperCase();
  if (upper in TaskStatus) {
    return upper as TaskStatus;
  }
  return undefined;
};

const parseDate = (value: unknown): Date | null => {
  if (value === null) return null;
  if (typeof value !== "string") return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
    }

    const body = await request.json();
    const data: Prisma.TaskUpdateInput = {};

    if (body && Object.hasOwn(body, "title")) {
      data.title = typeof body.title === "string" ? body.title.trim() : undefined;
    }

    if (body && Object.hasOwn(body, "notes")) {
      data.notes = typeof body.notes === "string" ? body.notes.trim() : null;
    }

    if (body && Object.hasOwn(body, "status")) {
      const status = normalizeStatus(body.status);
      if (status) {
        data.status = status;
        if (status === TaskStatus.COMPLETED) {
          data.completedAt = body?.completedAt ? parseDate(body.completedAt) ?? new Date() : new Date();
        }
      }
    }

    if (body && Object.hasOwn(body, "dueDate")) {
      data.dueDate = parseDate(body.dueDate);
    }

    if (body && Object.hasOwn(body, "completedAt")) {
      data.completedAt = parseDate(body.completedAt);
      if (data.completedAt) {
        data.status = TaskStatus.COMPLETED;
      }
    }

    const task = await prisma.task.update({
      where: { id },
      data,
      include: {
        lead: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ ok: true, task });
  } catch (error: any) {
    console.error("PATCH /api/tasks/[id] failed", error);
    return NextResponse.json({ ok: false, error: error?.message ?? "Failed to update task" }, { status: 500 });
  }
}
