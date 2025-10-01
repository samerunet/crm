import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, eventDate, message, source } = body ?? {};
    if (!email) return new Response("Email required", { status: 400 });

    const lead = await prisma.lead.create({
      data: {
        name,
        email,
        phone,
        eventDate: eventDate ? new Date(eventDate) : null,
        message,
        source,
      },
    });

    return Response.json({ ok: true, lead });
  } catch (err: any) {
    console.error(err);
    return new Response("Failed to create lead", { status: 500 });
  }
}
