type RequestInit = globalThis.RequestInit;

const DEFAULT_BASE = 'https://app.documenso.com/api/v1';

function auth() {
  const base = (process.env.DOCUMENSO_BASE_URL || DEFAULT_BASE).replace(/\/$/, '');
  const token = process.env.DOCUMENSO_API_TOKEN;
  if (!token) {
    throw new Error('Documenso env not set');
  }
  return { base, token };
}

async function dfetch<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const { base, token } = auth();
  const response = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init.headers || {}),
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Documenso ${path} ${response.status}: ${text}`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function getDocument(id: string): Promise<{ id: string; file_url?: string }> {
  return dfetch(`/documents/${id}`, { method: 'GET' });
}

export async function sendDocument(id: string) {
  try {
    return await dfetch(`/documents/${id}/send`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (
      !message.includes('404') &&
      !message.includes('Not Found') &&
      !message.includes('Server Error')
    ) {
      throw error;
    }
    return dfetch('/document/distribute', {
      method: 'POST',
      body: JSON.stringify({ documentId: id }),
    });
  }
}

type DocumensoTemplateRecipient = {
  id: number;
  email: string | null;
  name: string | null;
  signingOrder: number | null;
  role: string | null;
};

type DocumensoTemplateMeta = {
  subject?: string | null;
  message?: string | null;
  timezone?: string | null;
  dateFormat?: string | null;
  redirectUrl?: string | null;
  signingOrder?: string | null;
};

type DocumensoTemplate = {
  id: number;
  title: string;
  templateMeta?: DocumensoTemplateMeta | null;
  Recipient?: DocumensoTemplateRecipient[] | null;
};

const templateCache = new Map<string, DocumensoTemplate>();

export async function getTemplate(templateId: string): Promise<DocumensoTemplate> {
  if (templateCache.has(templateId)) {
    return templateCache.get(templateId)!;
  }
  const template = await dfetch<DocumensoTemplate>(`/templates/${templateId}`);
  templateCache.set(templateId, template);
  return template;
}

export async function generateDocumentFromTemplate(options: {
  templateId: string;
  recipients: Array<{ id: number; name: string; email: string; signingOrder?: number | null }>;
  title?: string;
  externalId?: string;
  redirectUrl?: string;
  metadata?: Record<string, unknown>;
  formValues?: Record<string, string>;
  subject?: string;
  message?: string;
  timezone?: string;
  dateFormat?: string;
  signingOrder?: 'PARALLEL' | 'SEQUENTIAL';
}): Promise<{ documentId: string; recipients: Array<Record<string, unknown>> }> {
  const payload: Record<string, unknown> = {
    recipients: options.recipients.map((recipient) => ({
      id: recipient.id,
      name: recipient.name,
      email: recipient.email,
      signingOrder: recipient.signingOrder ?? null,
    })),
  };

  if (options.title) payload.title = options.title;
  if (options.externalId) payload.externalId = options.externalId;

  const meta: Record<string, unknown> = {};
  if (options.subject) meta.subject = options.subject;
  if (options.message) meta.message = options.message;
  if (options.timezone) meta.timezone = options.timezone;
  if (options.dateFormat) meta.dateFormat = options.dateFormat;
  if (options.redirectUrl) meta.redirectUrl = options.redirectUrl;
  if (options.signingOrder) meta.signingOrder = options.signingOrder;
  if (options.metadata && Object.keys(options.metadata).length) {
    Object.entries(options.metadata).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      meta[key] =
        value instanceof Date
          ? value.toISOString()
          : typeof value === 'object'
            ? JSON.stringify(value)
            : value;
    });
  }
  if (Object.keys(meta).length) payload.meta = meta;

  if (options.formValues && Object.keys(options.formValues).length) {
    payload.formValues = options.formValues;
  }

  const result = await dfetch<any>(`/templates/${options.templateId}/generate-document`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  const documentId =
    result?.documentId ??
    result?.document_id ??
    result?.id ??
    result?.data?.documentId ??
    result?.data?.id ??
    null;

  if (!documentId) {
    throw new Error('Documenso template generation did not return a documentId');
  }

  return {
    documentId: String(documentId),
    recipients: Array.isArray(result?.recipients) ? result.recipients : [],
  };
}

export async function verifyDocumensoWebhook(rawBody: string, sigHeader?: string) {
  const secret = process.env.DOCUMENSO_WEBHOOK_SECRET;
  if (!secret) throw new Error('Missing DOCUMENSO_WEBHOOK_SECRET');
  if (!sigHeader) return false;

  const parts = Object.fromEntries(
    sigHeader.split(',').map((part) => {
      const [key, value] = part.split('=');
      return [key, value];
    }),
  );

  const provided = parts['v1'];
  if (!provided) return false;

  const crypto = await import('node:crypto');
  const hmac = crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex');
  if (hmac.length !== provided.length) return false;
  return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(provided));
}
