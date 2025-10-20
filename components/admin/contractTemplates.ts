// components/admin/contractTemplates.ts  ✦ FULL FILE (updated)
// - Accepts items[] + depositAmount
// - Renders Services table and Totals (Total / Deposit / Balance)

import type { Lead, Address, ContractItem } from './types';

export type ContractOptions = {
  businessName?: string;
  items?: ContractItem[];
  depositAmount?: number;
};

function fmtAddr(a?: Address) {
  if (!a) return '';
  const line = [a.line1, a.line2].filter(Boolean).join(' ');
  const city = [a.city, a.state, a.zip].filter(Boolean).join(', ');
  return [line, city].filter(Boolean).join(', ');
}
function esc(s?: string) {
  return (s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function parseMoney(text: string): number {
  const m = text.replaceAll(',', '').match(/(-?\d+(\.\d+)?)/);
  return m ? Number(m[1]) : 0;
}

export function renderHollywoodStyleContract(lead: Lead, opts: ContractOptions = {}) {
  const loose = lead as Lead & Record<string, any>;
  const business = esc(opts.businessName || 'HOLLYWOOD STYLE LLC');

  // Defaults if not provided
  const rows: ContractItem[] = (opts.items && opts.items.length)
    ? opts.items
    : [
        { label: 'Bridal Makeup',                    priceText: '$380' },
        { label: 'Bridal hairstyle',                 priceText: '$350' },
        { label: 'Makeup and hairstyle touch ups',   priceText: '$120/hr' },
        {
          label: `travel fee to ${loose.location?.city || lead.address?.city || 'your area'}`,
          priceText: '$50',
        },
      ];

  const deposit = Number.isFinite(opts.depositAmount as number) ? (opts.depositAmount as number) : 100;

  // Compute a display total from numeric portions (ignores /hr text)
  const total = rows.reduce((s, r) => s + parseMoney(r.priceText), 0);
  const balance = Math.max(0, total - deposit);

  const client = esc(lead.name);
  const eventType = esc(loose.eventType || '—');
  const serviceDateSrc = loose.serviceDate ?? lead.dateOfService;
  const serviceDate = serviceDateSrc
    ? new Date(serviceDateSrc as any).toLocaleDateString()
    : '—';
  const partySize = String(loose.partySize ?? 1);
  const wants = [
    loose.wantsMakeup ? 'Makeup' : '',
    loose.wantsHair ? 'Hair' : '',
  ]
    .filter(Boolean)
    .join(' & ') || '—';
  const location = fmtAddr((loose.location as Address | undefined) ?? lead.address);

  return /* html */ `
  <article style="max-width:760px;margin:0 auto;background:#fff;color:#111;line-height:1.55;font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; padding:24px;">
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
      <table style="width:100%; border-collapse:collapse; font-size:14px;">
        <thead>
          <tr>
            <th style="text-align:left;border:1px solid #000;padding:8px 10px;">Services</th>
            <th style="text-align:left;border:1px solid #000;padding:8px 10px;">Prices</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(r => `
            <tr>
              <td style="border:1px solid #000;padding:8px 10px;">${esc(r.label)}</td>
              <td style="border:1px solid #000;padding:8px 10px;">${esc(r.priceText)}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </section>

    <section style="font-size:14px; margin: 14px 0;">
      <div style="white-space:pre-line">
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
      <p>I, <span style="display:inline-block; min-width:200px; border-bottom:1px solid #000;">${client}</span>,
      understand and agree to pay the non-refundable security deposit to secure the appointment(s) for my event party and myself.
      I agree to pay the complete balance for my party on the day of the event as listed in this contract on or before my event day.
      I understand and will comply with all policies as listed in this contract. I understand that no refunds will be given for members of the party who miss their appointments on the day of the event. I also understand that I am responsible for balances from any members of my party who fail to provide payment. I understand that I will be liable for payment on any missed appointments.</p>
    </section>

    <section style="font-size:14px; margin: 14px 0;">
      <div style="margin-bottom:10px;"><strong>Event Summary</strong></div>
      <div>Client: <strong>${client}</strong></div>
      <div>Event type: <strong>${eventType}</strong></div>
      <div>Service date: <strong>${serviceDate}</strong></div>
      <div>Party size: <strong>${partySize}</strong></div>
      <div>Services: <strong>${esc(wants)}</strong></div>
      <div>Location: <strong>${esc(location || '—')}</strong></div>
    </section>

    <section style="font-size:14px; margin: 18px 0;">
      <div style="font-weight:700; margin-bottom:8px;">Totals</div>
      <div>Total Amount Due: <strong>$${total.toFixed(2)}</strong></div>
      <div>Deposit: <strong>$${deposit.toFixed(2)}</strong></div>
      <div>Remaining Balance: <strong>$${balance.toFixed(2)}</strong></div>
    </section>

    <section style="font-size:14px; margin: 18px 0;">
      <div style="margin:18px 0;">CLIENT NAME: (please print)</div>
      <div style="height:28px;border-bottom:1px solid #000;margin-bottom:18px;"></div>

      <div>CLIENT SIGNATURE:</div>
      <div style="height:28px;border-bottom:1px solid #000;margin-bottom:18px;"></div>

      <div>DATE:</div>
      <div style="height:28px;border-bottom:1px solid #000;"></div>
    </section>
  </article>
  `;
}
