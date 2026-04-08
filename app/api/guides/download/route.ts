import { readFile } from "node:fs/promises";

import { NextResponse } from "next/server";

import { getGuidePdfAbsolutePath, verifyGuideDownloadToken } from "@/lib/guide-delivery";
import { GUIDE_PRODUCT } from "@/lib/guide-product";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token") || "";
    const payload = verifyGuideDownloadToken(token);

    if (!payload || payload.slug !== GUIDE_PRODUCT.slug) {
      return new NextResponse("Invalid download link.", { status: 401 });
    }

    const order = await prisma.order.findFirst({
      where: {
        id: payload.orderId,
        status: "COMPLETED",
      },
    });

    if (!order) {
      return new NextResponse("Guide order not found for this link.", { status: 403 });
    }

    const file = await readFile(getGuidePdfAbsolutePath());
    return new NextResponse(file, {
      status: 200,
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
        "Content-Disposition": `attachment; filename="${GUIDE_PRODUCT.downloadFilename}"`,
        "Content-Type": "application/pdf",
      },
    });
  } catch (err: any) {
    return new NextResponse(err?.message || "Unable to download guide.", { status: 500 });
  }
}

