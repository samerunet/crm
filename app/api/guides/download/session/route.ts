import { readFile } from "node:fs/promises";

import { NextResponse } from "next/server";

import {
  getGuidePdfAbsolutePath,
  getSessionDownloadCutoff,
  verifyGuideSessionDownload,
} from "@/lib/guide-delivery";
import { GUIDE_PRODUCT } from "@/lib/guide-product";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId") || "";
    const expires = searchParams.get("expires");
    const sig = searchParams.get("sig");

    if (!sessionId) {
      return new NextResponse("Missing session id.", { status: 400 });
    }
    if (!verifyGuideSessionDownload({ sessionId, expires, sig })) {
      return new NextResponse("Session download link is invalid or expired.", { status: 403 });
    }

    const order = await prisma.order.findFirst({
      where: {
        externalRef: sessionId,
        status: "COMPLETED",
        createdAt: { gt: getSessionDownloadCutoff() },
        guide: { slug: GUIDE_PRODUCT.slug },
      },
    });

    if (!order) {
      return new NextResponse("Session download no longer available.", { status: 403 });
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
