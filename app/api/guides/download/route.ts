import { readFile } from "node:fs/promises";

import { NextResponse } from "next/server";

import { consumeGuideDownloadToken, getGuidePdfAbsolutePath } from "@/lib/guide-delivery";
import { GUIDE_PRODUCT } from "@/lib/guide-product";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token") || "";
    const order = token ? await consumeGuideDownloadToken(token) : null;

    if (!order) {
      return new NextResponse("This download link is invalid, expired, or already used.", {
        status: 403,
      });
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
