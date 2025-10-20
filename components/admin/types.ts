// components/admin/types.ts

// Stages used across UI
export type LeadStage =
  | "uncontacted"
  | "contacted"
  | "deposit"
  | "trial"
  | "booked"
  | "confirmed"
  | "changes"
  | "completed"
  | "lost";

export const STAGES: LeadStage[] = [
  "uncontacted",
  "contacted",
  "deposit",
  "trial",
  "booked",
  "confirmed",
  "changes",
  "completed",
  "lost",
];

export type LeadCategory = "service" | "guide";

export interface Address {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  zip?: string;
}

export type ContractStatus = "draft" | "sent" | "viewed" | "signed" | "void";

export interface EsignField {
  id: string;
  type: "signature" | "initial" | "text" | "date";
  label?: string;
  required?: boolean;
  page?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export interface Contract {
  id: string;
  leadId: string;
  template?: string;
  title?: string;
  body?: string;
  status?: ContractStatus;
  createdAt?: string;
  sentAt?: string | Date;
  signedAt?: string | Date;
  version?: number;
  digitalStamp?: string;
  esignFields?: EsignField[];
}

export type ContractRec = Contract;

export interface Invoice {
  id: string;
  leadId: string;
  type: "deposit" | "balance";
  amount: number;
  createdAt: string;
  dueAt?: string;
  paidAt?: string;
  method?: "cash" | "venmo" | "zelle" | "card";
}
export type InvoiceRec = Invoice;

export type AppointmentStatus = "tentative" | "booked" | "completed" | "canceled";

export interface Appointment {
  id: string;
  leadId?: string;
  title: string;
  service?: string;
  start: string | Date;
  end: string | Date;
  status?: AppointmentStatus;
  price?: number;
}

export interface Sale {
  id: string;
  type: "guide" | "service";
  amount: number;
  createdAt: string | Date;
}

export interface Lead {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  stage: LeadStage;
  category?: LeadCategory;
  createdAt?: string;
  lastContactAt?: string | Date;
  dateOfService?: string; // ISO
  notes?: string[];
  address?: Address;
  tags?: string[];
  color?: string;

  contracts?: Contract[];
  invoices?: Invoice[];
  bookings?: Appointment[];
}

export interface DateRange {
  start: string | Date;
  end: string | Date;
}

// Stage colors (used by chips)
export const STAGE_COLORS: Record<LeadStage, string> = {
  uncontacted: "#C6A25A",
  contacted: "#8B6547",
  deposit: "#9D7E60",
  trial: "#b45309",
  booked: "#008767",
  confirmed: "#0f766e",
  changes: "#8A6E4D",
  completed: "#2C1B12",
  lost: "#5A3725",
};
