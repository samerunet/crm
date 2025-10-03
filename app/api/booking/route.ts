// app/api/booking/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const data = await req.json(); // { channel, service, form, summary }
  console.log("Booking request:", JSON.stringify(data, null, 2));
  // TODO: add Twilio (SMS) / Resend or SendGrid (Email) / DB write here
  return NextResponse.json({ ok: true });
}
