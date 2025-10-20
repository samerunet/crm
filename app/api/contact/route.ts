import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
// Force IPv4 DNS resolution in Node (fixes local fetch/cert oddities)
import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');

export const runtime = 'nodejs';

type JsonInit = Parameters<typeof NextResponse.json>[1];

function json(data: unknown, init?: number | JsonInit) {
	const initObj = typeof init === 'number' ? { status: init } : init;
	return NextResponse.json(data, initObj);
}

function isDev() {
	return process.env.NODE_ENV !== "production";
}

const DEV_FROM = "Acme <onboarding@resend.dev>";
const DEV_TO = "delivered@resend.dev";

function getFromTo() {
	if (isDev()) {
		return {
			from: DEV_FROM,
			to: DEV_TO,
		};
	}
	const from = process.env.RESEND_FROM;
	const to = process.env.SITE_CONTACT_TO;
	if (!from || !to) {
		throw new Error("Missing RESEND_FROM or SITE_CONTACT_TO in production");
	}
	return { from, to };
}

function buildHtml(payload: {
	name?: string;
	email?: string;
	phone?: string;
	topic?: string;
	message?: string;
}) {
	const { name, email, phone, topic, message } = payload;
	return `
    <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial">
      <h2 style="margin:0 0 8px">New website inquiry</h2>
      <table style="border-collapse:collapse">
        <tr><td><strong>Name:</strong></td><td>${name || ""}</td></tr>
        <tr><td><strong>Email:</strong></td><td>${email || ""}</td></tr>
        <tr><td><strong>Phone:</strong></td><td>${phone || ""}</td></tr>
        <tr><td><strong>Topic:</strong></td><td>${topic || ""}</td></tr>
      </table>
      <hr style="margin:12px 0;border:none;border-top:1px solid #e5e7eb" />
      <div style="white-space:pre-wrap">${(message || "").replace(/</g, "&lt;")}</div>
    </div>
  `;
}

function sanitize(v: unknown) {
	return typeof v === "string" ? v.trim().slice(0, 5000) : undefined;
}

export async function GET(req: NextRequest) {
	const url = new URL(req.url);
	const mode = url.searchParams.get("mode");
	const resendKey = process.env.RESEND_API_KEY || "";

	if (!isDev() && mode) {
		return json({ ok: false, error: "Not available" }, { status: 404 });
	}

	if (mode === "env") {
		return json({
			ok: true,
			env: {
				RESEND_API_KEY: resendKey
					? resendKey.slice(0, 3) + "…" + resendKey.slice(-4)
					: "(missing)",
				RESEND_FROM: process.env.RESEND_FROM || "(unset)",
				SITE_CONTACT_TO: process.env.SITE_CONTACT_TO || "(unset)",
				runtime: "nodejs",
			},
			hint: "Dev rules: FROM must be onboarding@resend.dev, TO must be your Resend account email or delivered@resend.dev.",
		});
	}

	if (mode === "test") {
		if (!resendKey)
			return json(
				{ ok: false, error: "Missing RESEND_API_KEY" },
				{ status: 400 }
			);
		const resend = new Resend(resendKey);
		try {
			const { from, to } = getFromTo();
			const res = await resend.emails.send({
				from,
				to: [to],
				subject: "Resend test from /api/contact?mode=test",
				html: "<p>It works!</p>",
			});
			if ("error" in res && res.error) {
				return json(
					{ ok: false, error: res.error?.message || "Resend error" },
					{ status: 500 }
				);
			}
			return json({ ok: true, id: (res as any).data?.id || null });
		} catch (e: any) {
			return json(
				{ ok: false, error: e?.message || "fetch failed" },
				{ status: 500 }
			);
		}
	}

	return json({ ok: true, message: "Contact API ready" });
}

export async function POST(req: NextRequest) {
	const resendKey = process.env.RESEND_API_KEY || "";
	if (!resendKey)
		return json(
			{ ok: false, error: "Missing RESEND_API_KEY" },
			{ status: 400 }
		);

	const resend = new Resend(resendKey);

	let body: any;
	try {
		body = await req.json();
	} catch {
		return json({ ok: false, error: "Invalid JSON" }, { status: 400 });
	}

	const name = sanitize(body.name);
	const email = sanitize(body.email);
	const phone = sanitize(body.phone);
	const topic = sanitize(body.topic);
	const message = sanitize(body.message);

	if (!name || !message) {
		return json(
			{ ok: false, error: "Name and message are required" },
			{ status: 400 }
		);
	}

	try {
		const { from, to } = getFromTo();
		const res = await resend.emails.send({
			from,
			to: [to],
			subject: `Website Inquiry — ${topic || "General"}`,
			reply_to: email || undefined,
			html: buildHtml({ name, email, phone, topic, message }),
		});

		if ("error" in res && res.error) {
			return json(
				{ ok: false, error: res.error?.message || "Resend send error" },
				{ status: 502 }
			);
		}

		return json({ ok: true, id: (res as any).data?.id || null });
	} catch (e: any) {
		return json(
			{ ok: false, error: e?.message || "Send failed" },
			{ status: 500 }
		);
	}
}
