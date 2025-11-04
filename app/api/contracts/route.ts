import { NextRequest, NextResponse } from "next/server";
import { ContractStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma-node";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const statuses = searchParams
      .getAll("status")
      .flatMap((chunk) => chunk.split(","))
      .map((value) => value.trim().toUpperCase())
      .filter((value): value is keyof typeof ContractStatus => value in ContractStatus)
      .map((value) => ContractStatus[value]);

    const where: Prisma.ContractWhereInput | undefined = statuses.length
      ? { status: { in: statuses } }
      : undefined;

    const contracts = await prisma.contract.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        lead: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ ok: true, contracts });
  } catch (error: any) {
    console.error("GET /api/contracts failed", error);
    return NextResponse.json({ ok: false, error: error?.message ?? "Failed to load contracts" }, { status: 500 });
  }
}
