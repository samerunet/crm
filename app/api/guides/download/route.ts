import { readFile } from "node:fs/promises";

import { NextResponse } from "next/server";

import {
  getGuidePdfAbsolutePath,
  hashLegacyGuideDownloadToken,
  isLegacyGuideDownloadToken,
  verifyGuideDownloadToken,
} from "@/lib/guide-delivery";
import { GUIDE_PRODUCT } from "@/lib/guide-product";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token") || "";
    const payload = verifyGuideDownloadToken(token);
    const legacyTokenHash = !payload && isLegacyGuideDownloadToken(token)
      ? hashLegacyGuideDownloadToken(token)
      : null;

    if ((!payload || payload.slug !== GUIDE_PRODUCT.slug) && !legacyTokenHash) {
      return new NextResponse("This download link is invalid or expired.", { status: 403 });
    }

    const order = await prisma.order.findFirst({
      where: {
        status: "COMPLETED",
        guide: { slug: GUIDE_PRODUCT.slug },
        ...(payload
          ? { id: payload.orderId }
          : {
              guideDownloadExpiresAt: { gt: new Date() },
              guideDownloadTokenHash: legacyTokenHash!,
            }),
      },
    });

    if (!order) {
      return new NextResponse("This download link is invalid or expired.", { status: 403 });
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
