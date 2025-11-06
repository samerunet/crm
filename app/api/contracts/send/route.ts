import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma-node";
import { generateDocumentFromTemplate, getTemplate, sendDocument } from "@/lib/documenso";
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

    const templateDetails = await getTemplate(template);
    const recipientsFromTemplate = templateDetails.Recipient ?? [];

    if (!recipientsFromTemplate.length) {
      return NextResponse.json({ error: "Template has no recipients configured" }, { status: 400 });
    }

    const primaryRecipientIndex = recipientsFromTemplate.findIndex(
      (recipient) => (recipient.role ?? "").toUpperCase() === "SIGNER",
    );
    const fallbackIndex = primaryRecipientIndex >= 0 ? primaryRecipientIndex : 0;

    const recipients = recipientsFromTemplate.map((recipient, index) => {
      const isPrimary = index === fallbackIndex;
      return {
        id: Number(
          typeof recipient.id === "number" && Number.isFinite(recipient.id)
            ? recipient.id
            : index + 1,
        ),
        name: isPrimary ? lead.name ?? recipient.name ?? "Client" : recipient.name ?? `Recipient ${index + 1}`,
        email: isPrimary ? lead.email : recipient.email ?? `recipient.${index + 1}@documenso.com`,
        signingOrder: recipient.signingOrder ?? null,
      };
    });

    const title = documentDisplayName(lead);
    const redirectUrl = `${process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? ""}/contracts/thanks?lead=${lead.id}`;

    const { documentId } = await generateDocumentFromTemplate({
      templateId: template,
      recipients,
      title,
      externalId: lead.id,
      redirectUrl,
      formValues: mapLeadToTemplateFields(lead),
      metadata: {
        leadId: lead.id,
        partySize: (lead as any).partySize ?? null,
        eventDate: lead.eventDate ? lead.eventDate.toISOString() : null,
      },
      subject: templateDetails.templateMeta?.subject ?? undefined,
      message: templateDetails.templateMeta?.message ?? undefined,
      timezone: templateDetails.templateMeta?.timezone ?? undefined,
      dateFormat: templateDetails.templateMeta?.dateFormat ?? undefined,
      signingOrder: (templateDetails.templateMeta?.signingOrder as "PARALLEL" | "SEQUENTIAL" | null) ?? undefined,
    });

    await sendDocument(documentId);

    const contract = await prisma.contract.create({
      data: {
        leadId: lead.id,
        title,
        amountCents: lead.budgetCents ?? null,
        status: "SENT",
        sentAt: new Date(),
        externalRef: documentId,
      },
    });

    return NextResponse.json({ ok: true, contractId: contract.id, documentId });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? "Failed to send contract" }, { status: 500 });
  }
}
