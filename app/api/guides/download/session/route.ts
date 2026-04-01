import { NextResponse } from "next/server";

import { buildGuideDownloadUrl } from "@/lib/guide-delivery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    return NextResponse.redirect(buildGuideDownloadUrl(), 302);
  } catch (err: any) {
    return new NextResponse(err?.message || "Unable to download guide.", { status: 500 });
  }
}
