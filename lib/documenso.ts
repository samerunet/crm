type RequestInit = globalThis.RequestInit;

const BASE = process.env.DOCUMENSO_BASE_URL ?? "";
const TOKEN = process.env.DOCUMENSO_API_TOKEN ?? "";

function auth() {
  if (!BASE || !TOKEN) {
    throw new Error("Documenso env not set");
  }
  return { base: BASE.replace(/\/$/, ""), token: TOKEN };
}

async function req(path: string, init: RequestInit = {}) {
  const { base, token } = auth();
  const response = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.headers || {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Documenso ${path} ${response.status}: ${text}`);
  }

  return response.json();
}

export async function createAndSendFromTemplate(opts: {
  templateId: string;
  name: string;
  recipients: { email: string; name?: string | null; role?: "signer"; send_email?: boolean }[];
  fields: Record<string, string>;
  redirectUrl: string;
}): Promise<{ id: string; signingLinks?: { url: string }[] }> {
  const payload = {
    template_id: opts.templateId,
    name: opts.name,
    recipients: opts.recipients.map((recipient) => ({
      email: recipient.email,
      name: recipient.name ?? undefined,
      role: recipient.role ?? "signer",
      send_email: recipient.send_email ?? true,
    })),
    fields: opts.fields,
    redirect_url: opts.redirectUrl,
  };

  return req(`/api/v1/documents`, { method: "POST", body: JSON.stringify(payload) });
}

export async function getDocument(id: string): Promise<{ id: string; file_url?: string }> {
  return req(`/api/v1/documents/${id}`, { method: "GET" });
}

export async function verifyDocumensoWebhook(rawBody: string, sigHeader?: string) {
  const secret = process.env.DOCUMENSO_WEBHOOK_SECRET;
  if (!secret) throw new Error("Missing DOCUMENSO_WEBHOOK_SECRET");
  if (!sigHeader) return false;

  const parts = Object.fromEntries(
    sigHeader.split(",").map((part) => {
      const [key, value] = part.split("=");
      return [key, value];
    }),
  );

  const provided = parts["v1"];
  if (!provided) return false;

  const crypto = await import("node:crypto");
  const hmac = crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
  if (hmac.length !== provided.length) return false;
  return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(provided));
}
type RequestInit = globalThis.RequestInit;
