import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma-node";
import { createAndSendFromTemplate } from "@/lib/documenso";
import { documentDisplayName, mapLeadToTemplateFields } from "@/lib/contractFieldMap";

export async function POST(req: Request) {
  try {
    const { leadId, templateId } = await req.json();
    if (!leadId) {
      return NextResponse.json({ error: "leadId is required" }, { status: 400 });
    }

    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead || !lead.email) {
      return NextResponse.json({ error: "Lead not found or missing email" }, { status: 400 });
    }

    const template = templateId || process.env.DOCUMENSO_TEMPLATE_ID;
    if (!template) {
      return NextResponse.json({ error: "Documenso template not configured" }, { status: 500 });
    }

    const name = documentDisplayName(lead);
    const redirectUrl = `${process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? ""}/contracts/thanks?lead=${lead.id}`;

    const doc = await createAndSendFromTemplate({
      templateId: template,
      name,
      recipients: [
        {
          email: lead.email,
          name: lead.name ?? undefined,
          role: "signer",
          send_email: true,
        },
      ],
      fields: mapLeadToTemplateFields(lead),
      redirectUrl,
    });

    const contract = await prisma.contract.create({
      data: {
        leadId: lead.id,
        title: name,
        amountCents: lead.budgetCents ?? null,
        status: "SENT",
        sentAt: new Date(),
        externalRef: doc.id,
      },
    });

    const signingLink = doc.signingLinks?.[0]?.url ?? null;

    return NextResponse.json({ ok: true, contractId: contract.id, signingLink });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? "Failed to send contract" }, { status: 500 });
  }
}
