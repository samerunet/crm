import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma-node";
import { getDocument, verifyDocumensoWebhook } from "@/lib/documenso";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const raw = await req.text();
  const signature =
    req.headers.get("x-documenso-signature") ?? req.headers.get("documenso-signature") ?? undefined;

  const verified = await verifyDocumensoWebhook(raw, signature).catch(() => false);
  if (!verified) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let payload: any;
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Bad JSON" }, { status: 400 });
  }

  const { type, data } = payload ?? {};
  const docId = data?.id as string | undefined;
  if (!docId) {
    return NextResponse.json({ ok: true });
  }

  const contract = await prisma.contract.findFirst({ where: { externalRef: docId } });
  if (!contract) {
    return NextResponse.json({ ok: true });
  }

  if (type === "document.completed") {
    let fileUrl = (data?.file_url ?? data?.fileUrl) as string | undefined;
    if (!fileUrl) {
      try {
        const doc = await getDocument(docId);
        fileUrl = doc.file_url;
      } catch {
        // ignore fetch failure, we'll keep existing url if any
      }
    }
    await prisma.contract.update({
      where: { id: contract.id },
      data: {
        status: "SIGNED",
        signedAt: new Date(),
        fileUrl: fileUrl ?? contract.fileUrl,
      },
    });
  } else if (type === "document.voided") {
    await prisma.contract.update({
      where: { id: contract.id },
      data: { status: "VOID" },
    });
  } else if (type === "document.sent") {
    await prisma.contract.update({
      where: { id: contract.id },
      data: { status: "SENT", sentAt: contract.sentAt ?? new Date() },
    });
  }

  return NextResponse.json({ ok: true });
}
