// components/admin/types.ts  ✦ FULL FILE (updated)
// - Adds PricingConfig and ContractItem
// - Adds contract versioning + deposit/total on Contract
// - Adds pricing to Lead

export type LeadStage =
  | 'uncontacted'
  | 'contacted'
  | 'deposit'
  | 'trial'
  | 'booked'
  | 'confirmed'
  | 'changes'
  | 'completed'
  | 'lost';

export const DEFAULT_STAGES: LeadStage[] = [
  'uncontacted',
  'contacted',
  'deposit',
  'trial',
  'booked',
  'confirmed',
  'changes',
  'completed',
];

export type PaymentMethod = 'cash' | 'venmo' | 'zelle';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'void';
export type InvoiceKind = 'deposit' | 'balance';
export type ContractStatus = 'draft' | 'sent' | 'signed' | 'void';

export type Address = {
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
};

export type Appointment = {
  id: string;
  title: string;
  start: Date | string;
  end: Date | string;
  leadId?: string;
  service?: string;
  price?: number;
  deposit?: number;
  travelFee?: number;
  location?: Address;
  status?: 'tentative' | 'booked' | 'completed' | 'canceled';
};

export type InvoiceLine = { label: string; amount: number };

export type Payment = {
  id: string;
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  createdAt: Date | string;
  note?: string;
};

export type Invoice = {
  id: string;
  leadId: string;
  bookingId?: string;
  number?: string;
  kind?: InvoiceKind;
  dueAt?: Date | string;
  lines?: InvoiceLine[];
  total?: number;
  status?: InvoiceStatus;
  sentAt?: Date | string;
  url?: string;
  payments?: Payment[];
};

export type EsignField = {
  id: string;                        // 'policies', 'signature', etc.
  type: 'initial' | 'signature';
  label?: string;
  valueText?: string;                // initials
  imageDataUrl?: string;             // signature PNG
  required?: boolean;
};

export type ContractItem = {
  label: string;
  priceText: string;                 // e.g. "$380" or "$120/hr"
};

export type Contract = {
  id: string;
  leadId: string;
  bookingId?: string;
  template?: string;                 // 'wedding_standard'
  body?: string;                     // rendered HTML
  status?: ContractStatus;
  sentAt?: Date | string;
  signedAt?: Date | string;
  digitalStamp?: string;
  url?: string;

  // versioning
  version?: number;                  // 1,2,3...
  createdAt?: Date | string;

  // pulled from Details / builder
  items?: ContractItem[];            // rows for Services table
  depositAmount?: number;            // flat deposit in USD
  totalAmount?: number;              // numeric total used for invoices
  partySize?: number;
  serviceDate?: Date | string;
  location?: Address;
  ccEmails?: string[];
  recipientEmail?: string;
  esignFields?: EsignField[];
};

export type LeadNote = {
  id: string;
  text: string;
  createdAt: Date | string;
};

export type Intake = {
  skinType?: 'dry' | 'oily' | 'combo' | 'normal' | 'sensitive';
  allergies?: string;
  preferences?: string;
  hairType?: 'straight' | 'wavy' | 'curly' | 'coily' | 'fine' | 'thick';
  concerns?: string;
  referenceLinks?: string;
  addressOnSite?: string;
  timeWindow?: string; // e.g. "arrive by 8:00 AM"
};

export type PricingConfig = {
  bridalMakeup?: number;        // $380
  bridalHairstyle?: number;     // $350
  touchupsHourly?: number;      // $120 (per hour)
  travelFee?: number;           // $50
  travelCity?: string;          // "National City"
  depositFlat?: number;         // $100
  extraItems?: { label: string; price: number }[]; // optional add-ons
};

export type Lead = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  instagram?: string;
  phoneNormalized?: string;
  portalKey?: string;
  registrationCode?: string;
  hasAccount?: boolean;

  stage: LeadStage;
  category?: 'service' | 'guide' | 'both';
  source?: string;

  // Details
  eventType?: 'wedding' | 'event' | 'tutorial' | 'trial' | 'other';
  partySize?: number;
  wantsMakeup?: boolean;
  wantsHair?: boolean;
  serviceDate?: Date | string;
  location?: Address;

  // Pricing shown in Details (drives contract)
  pricing?: PricingConfig;

  // Optional override total (kept if you want it)
  customTotal?: number;

  requestedDate?: Date | string;
  lastContactAt?: Date | string;

  notes?: string;
  notesList?: LeadNote[];

  intake?: Intake;

  invoices?: Invoice[];
  contracts?: Contract[];
};
