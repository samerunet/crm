import { NextResponse } from "next/server";

import { buildGuideDownloadUrl } from "@/lib/guide-delivery";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId") || "";

    if (!sessionId) {
      return new NextResponse("Missing session id.", { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: {
        externalRef: sessionId,
        status: "COMPLETED",
      },
    });

    if (!order) {
      return new NextResponse("Session download not available.", { status: 403 });
    }

    return NextResponse.redirect(buildGuideDownloadUrl({ orderId: order.id }), 302);
  } catch (err: any) {
    return new NextResponse(err?.message || "Unable to download guide.", { status: 500 });
  }
}
