import { readFile } from "node:fs/promises";

import { NextResponse } from "next/server";

import { getGuidePdfAbsolutePath } from "@/lib/guide-delivery";
import { GUIDE_PRODUCT } from "@/lib/guide-product";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const file = await readFile(getGuidePdfAbsolutePath());
    return new NextResponse(file, {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=0, must-revalidate",
        "Content-Disposition": `attachment; filename="${GUIDE_PRODUCT.downloadFilename}"`,
        "Content-Type": "application/pdf",
      },
    });
  } catch (err: any) {
    return new NextResponse(err?.message || "Unable to download guide.", { status: 500 });
  }
}
