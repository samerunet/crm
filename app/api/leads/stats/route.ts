import { NextResponse } from "next/server";
import { LeadStage } from "@prisma/client";
import { prisma } from "@/lib/prisma-node";

export async function GET() {
  try {
    const groups = await prisma.lead.groupBy({
      by: ["stage"],
      _count: { stage: true },
    });

    const stageCounts: Record<LeadStage, number> = Object.values(LeadStage).reduce(
      (acc, stage) => ({ ...acc, [stage]: 0 }),
      {} as Record<LeadStage, number>,
    );

    for (const group of groups as Array<{ stage: LeadStage; _count: { stage: number } }>) {
      stageCounts[group.stage] = group._count.stage;
    }

    return NextResponse.json({ ok: true, stageCounts });
  } catch (error: any) {
    console.error("GET /api/leads/stats failed", error);
    return NextResponse.json({ ok: false, error: error?.message ?? "Failed to load pipeline stats" }, { status: 500 });
  }
}
