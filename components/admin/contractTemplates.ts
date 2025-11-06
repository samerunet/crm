// components/admin/contractTemplates.ts  ✦ FILLABLE VERSION
import type { Lead, Address, ContractItem } from './types';

export type ContractOptions = {
  businessName?: string;
  items?: ContractItem[];
  depositAmount?: number;
  fillable?: boolean; // default: true
  accentHex?: string; // default: red-like
};

function fmtAddr(a?: Address) {
  if (!a) return '';
  const line = [a.line1, a.line2].filter(Boolean).join(' ');
  const city = [a.city, a.state, a.zip].filter(Boolean).join(', ');
  return [line, city].filter(Boolean).join(', ');
}
function esc(s?: string) {
  return (s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function parseMoney(text: string): number {
  const m = text.replaceAll(',', '').match(/(-?\d+(\.\d+)?)/);
  return m ? Number(m[1]) : 0;
}

// Try to extract items from common "details" shapes on the lead
function collectItemsFromLead(lead: Lead): ContractItem[] | null {
  const L = lead as any;

  // Preferred shapes we’ll try in order
  const candidates: any[] = [
    L?.details?.items,
    L?.details?.services,
    L?.quote?.items,
    L?.lineItems,
    L?.items,
  ].filter(Boolean);

  for (const arr of candidates) {
    if (!Array.isArray(arr) || !arr.length) continue;
    const rows: ContractItem[] = arr.map((it: any) => {
      // Accept versatile keys
      const label = String(it.label ?? it.name ?? it.title ?? 'Service');
      let priceCents: number | null =
        typeof it.priceCents === 'number'
          ? it.priceCents
          : typeof it.amountCents === 'number'
            ? it.amountCents
            : typeof it.cents === 'number'
              ? it.cents
              : null;

      // If no cents, try unit/qty
      if (priceCents == null) {
        const unit = Number(it.unitPriceCents ?? it.unit_cents ?? it.unitPrice ?? 0);
        const qty = Number(it.quantity ?? it.qty ?? 1);
        if (unit > 0) priceCents = Math.round(unit * qty);
      }

      // Last resort: parse from a string like "$120" or "120"
      if (priceCents == null && typeof it.price === 'string') {
        const n = Math.round(parseMoney(it.price) * 100);
        priceCents = Number.isFinite(n) ? n : 0;
      }
      if (priceCents == null && typeof it.amount === 'string') {
        const n = Math.round(parseMoney(it.amount) * 100);
        priceCents = Number.isFinite(n) ? n : 0;
      }
      if (priceCents == null && typeof it.amount === 'number') {
        // assume dollars
        priceCents = Math.round(it.amount * 100);
      }

      const dollars = (priceCents ?? 0) / 100;
      return { label, priceText: `$${dollars.toFixed(2)}` };
    });

    if (rows.length) return rows;
  }
  return null;
}

export function renderHollywoodStyleContract(lead: Lead, opts: ContractOptions = {}) {
  const fillable = opts.fillable ?? true;
  const accent = opts.accentHex ?? '#B22222'; // deep brick-red
  const loose = lead as Lead & Record<string, any>;
  const business = esc(opts.businessName || 'HOLLYWOOD STYLE LLC');

  const rows: ContractItem[] =
    opts.items && opts.items.length
      ? opts.items
      : (collectItemsFromLead(lead) ?? [
          { label: 'Bridal Makeup', priceText: '$380' },
          { label: 'Bridal hairstyle', priceText: '$350' },
          { label: 'Makeup and hairstyle touch ups', priceText: '$120.00' },
          {
            label: `Travel fee to ${loose.location?.city || lead.address?.city || 'your area'}`,
            priceText: '$50.00',
          },
        ]);

  // Deposit: prefer explicit cents on lead, else option, else 100
  const depositCentsFromLead =
    typeof loose?.details?.depositCents === 'number'
      ? loose.details.depositCents
      : typeof loose?.depositCents === 'number'
        ? loose.depositCents
        : null;

  const deposit =
    depositCentsFromLead != null
      ? depositCentsFromLead / 100
      : Number.isFinite(opts.depositAmount as number)
        ? (opts.depositAmount as number)
        : 100;

  const total = rows.reduce((s, r) => s + parseMoney(r.priceText), 0);
  const balance = Math.max(0, total - deposit);

  const today = new Date();
  const todayStr = today.toLocaleDateString(); // mm/dd/yyyy (OS locale)

  const client = esc(lead.name);
  const eventType = esc(loose.eventType || '—');
  const serviceDateSrc = loose.serviceDate ?? lead.dateOfService;
  const serviceDate = serviceDateSrc
    ? new Date(serviceDateSrc as any).toLocaleDateString()
    : todayStr;
  const partySize = String(loose.partySize ?? 1);
  const wants =
    [loose.wantsMakeup ? 'Makeup' : '', loose.wantsHair ? 'Hair' : '']
      .filter(Boolean)
      .join(' & ') || '—';
  const location = fmtAddr((loose.location as Address | undefined) ?? lead.address);

  // helper: span or plain text depending on fillable
  const F = (key: string, value: string, min = 140) => {
    if (!fillable) return `<span data-field="${key}">${esc(value)}</span>`;
    return `<span contenteditable="true" data-field="${key}" class="fill" style="min-width:${min}px">${esc(value)}</span>`;
  };
  // inline input line (e.g., signature/date lines)
  const Line = (key: string, value = '', min = 180) => {
    if (!fillable) return `<span data-field="${key}" class="line"></span>`;
    return `<span contenteditable="true" data-field="${key}" class="fill line" style="min-width:${min}px">${esc(value)}</span>`;
  };

  return /* html */ `
  <article style="max-width:760px;margin:0 auto;background:#fff;color:#111;line-height:1.55;font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; padding:24px;">
    <style>
      .fill{color:${accent}; border-bottom:1px dotted ${accent}; display:inline-block; padding:2px 4px; outline:none}
      .fill:empty::before{content:"—"; opacity:.5}
      .line{height:24px; border-bottom:1px solid #000; display:inline-block; vertical-align:bottom}
      table.contract{width:100%; border-collapse:collapse; font-size:14px}
      table.contract th, table.contract td{border:1px solid #000; padding:8px 10px; text-align:left}
      .muted{opacity:.9}
    </style>

    <header style="text-align:center;margin-bottom:16px">
      <div style="font-size:18px;margin-bottom:6px;">Makeup and hairstyle Contract</div>
      <div style="font-weight:700;font-size:20px;">“${business}”</div>
    </header>

    <section style="font-size:14px; margin-bottom:14px;">
      <p>Thank you for your interest in my services. Please carefully review this contract.</p>
      <p>I require this contract to be completed and submitted with a non-refundable deposit of
        <strong>$${deposit.toFixed(2)}</strong> in order to secure your event date.</p>
      <p style="text-decoration: underline; font-weight:600; margin: 12px 0 6px;">Information for deposit :</p>
      <p style="text-decoration: underline; margin:0;">Zelle , 619-399-6160 Fariia Sipahi</p>
      <p style="text-decoration: underline; margin:0;">Venmo Fariia-Sipahi</p>
      <p style="margin-top:10px;">The complete balance for your party will be due on or before the date.
        Please feel free to contact me with any questions or concerns you may have.
        I look forward to working with you and your party. Thank you and congratulations!</p>
    </section>

    <section style="font-size:14px; margin: 14px 0;">
      <div style="font-weight:700; letter-spacing:.02em; margin-bottom:8px;">MAKEUP AND HAIRSTYLE SERVICES:</div>
      <table class="contract">
        <thead>
          <tr>
            <th>Services</th>
            <th>Prices</th>
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (r) => `
            <tr>
              <td>${esc(r.label)}</td>
              <td>${esc(r.priceText)}</td>
            </tr>`,
            )
            .join('')}
        </tbody>
      </table>
    </section>

    <section style="font-size:14px; margin: 14px 0;">
      <div style="white-space:pre-line" class="muted">
___POLICIES BOOKINGS: To secure a date, a signed contract and $${deposit.toFixed(2)} deposit are required. This deposit is non-refundable and non-transferable. This deposit will be put toward the client’s total event day balance if the client chooses event day services. The remaining balance will be due on or before the day of the event. Accepted forms of payment include: cash, Venmo, Zelle. Gratuity is never expected but always appreciated.

___CANCELLATION POLICY: Cancellations must be made at least ninety (90) days prior to the client’s reserved date or the client will be responsible for paying the full amount of services agreed upon in this contract.

__DELAYS: A late fee of $50.00 will be charged for every 30 minutes of delay when a client is late for the scheduled time, or if the scheduled makeup application exceeds the allotted time due to client delays.

__PARKING FEES: Where parking, valet or toll fees may be incurred. This amount will be included in the final bill and will be due on the day of the event.

__TRAVEL FEES: Travel fees apply for day-of appointments.

____LIABILITY: All brushes, tools, and makeup products are sanitized between every makeup application. Makeup products used are hypoallergenic. Any allergies and/or skin conditions should be reported by the client to the makeup artist prior to application and, if need be, a sample test of makeup may be performed on the skin to test reaction. Client(s) agree to release the makeup artist from liability for any skin complications due to allergic reactions.

____PAYMENT: The final balance is due on or before the day of the event before the makeup artist/hairstylist departs — no exceptions. The person(s) responsible for the entire balance of payment is the person(s) whose name(s) appear on this contract.
      </div>
    </section>

    <section style="font-size:14px; margin: 14px 0;">
      <p>
        I, ${F('client_name', client)},
        understand and agree to pay the non-refundable security deposit to secure the appointment(s) for my event party and myself.
        I agree to pay the complete balance for my party on the day of the event as listed in this contract on or before my event day.
        I understand and will comply with all policies as listed in this contract. I understand that no refunds will be given for members of the party who miss their appointments on the day of the event. I also understand that I am responsible for balances from any members of my party who fail to provide payment. I understand that I will be liable for payment on any missed appointments.
      </p>
    </section>

    <section style="font-size:14px; margin: 14px 0;">
      <div style="margin-bottom:10px;"><strong>Event Summary</strong></div>
      <div>Client: <strong>${F('summary_client', client, 160)}</strong></div>
      <div>Event type: <strong>${F('summary_eventType', eventType, 140)}</strong></div>
      <div>Service date: <strong>${F('summary_serviceDate', serviceDate, 120)}</strong></div>
      <div>Party size: <strong>${F('summary_partySize', partySize, 60)}</strong></div>
      <div>Services: <strong>${F('summary_services', wants, 160)}</strong></div>
      <div>Location: <strong>${F('summary_location', location || '—', 220)}</strong></div>
    </section>

    <section style="font-size:14px; margin: 18px 0;">
      <div style="font-weight:700; margin-bottom:8px;">Totals</div>
      <div>Total Amount Due: <strong data-field="total_due">$${total.toFixed(2)}</strong></div>
      <div>Deposit: <strong data-field="deposit">$${deposit.toFixed(2)}</strong></div>
      <div>Remaining Balance: <strong data-field="balance">$${balance.toFixed(2)}</strong></div>
    </section>

    <section style="font-size:14px; margin: 18px 0;">
      <div style="margin:18px 0;">CLIENT NAME: (please print)</div>
      ${Line('print_name', client, 260)}

      <div style="margin:18px 0;">CLIENT SIGNATURE:</div>
      ${Line('signature', '', 260)}

      <div style="margin:18px 0;">DATE:</div>
      ${Line('signed_date', todayStr, 160)}
    </section>
  </article>
  `;
}
