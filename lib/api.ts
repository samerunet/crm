type RequestInit = globalThis.RequestInit;

const DEFAULT_HEADERS: RequestInit = {
  credentials: "include",
};

const jsonHeaders = (body?: unknown): RequestInit => ({
  ...DEFAULT_HEADERS,
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(body ?? {}),
});

export const LeadStageValues = [
  "NEW",
  "CONTACTED",
  "CONSULT_TRIAL",
  "PROPOSAL_SENT",
  "DEPOSIT_RECEIVED",
  "CONTRACT_SIGNED",
  "SCHEDULED",
  "COMPLETED",
  "LOST",
] as const;
export type LeadStage = (typeof LeadStageValues)[number];
export const LeadStageEnum = LeadStageValues.reduce(
  (acc, value) => ({ ...acc, [value]: value }),
  {} as Record<LeadStage, LeadStage>,
);

export const TaskStatusValues = ["OPEN", "COMPLETED"] as const;
export type TaskStatus = (typeof TaskStatusValues)[number];
export const TaskStatusEnum = TaskStatusValues.reduce(
  (acc, value) => ({ ...acc, [value]: value }),
  {} as Record<TaskStatus, TaskStatus>,
);

export const AppointmentStatusValues = [
  "TENTATIVE",
  "CONFIRMED",
  "COMPLETED",
  "CANCELED",
] as const;
export type AppointmentStatus = (typeof AppointmentStatusValues)[number];
export const AppointmentStatusEnum = AppointmentStatusValues.reduce(
  (acc, value) => ({ ...acc, [value]: value }),
  {} as Record<AppointmentStatus, AppointmentStatus>,
);

export const ContractStatusValues = ["DRAFT", "SENT", "SIGNED", "VOID"] as const;
export type ContractStatus = (typeof ContractStatusValues)[number];
export const ContractStatusEnum = ContractStatusValues.reduce(
  (acc, value) => ({ ...acc, [value]: value }),
  {} as Record<ContractStatus, ContractStatus>,
);

const buildQuery = (params: Record<string, unknown>) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item === undefined || item === null) return;
        searchParams.append(key, String(item));
      });
      return;
    }
    if (typeof value === "boolean") {
      searchParams.set(key, value ? "true" : "false");
      return;
    }
    searchParams.set(key, String(value));
  });
  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

export type Lead = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  eventDate: string | null;
  message: string | null;
  source: string | null;
  stage: LeadStage;
  consultRequested: boolean;
  depositPending: boolean;
  contractPending: boolean;
  highBudget: boolean;
  budgetCents: number | null;
  lastInboundAt: string | null;
  lastOutboundAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Task = {
  id: string;
  leadId: string | null;
  title: string;
  notes: string | null;
  status: TaskStatus;
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  lead?: { id: string; name: string | null } | null;
};

export type Appointment = {
  id: string;
  leadId: string | null;
  title: string;
  status: AppointmentStatus;
  start: string;
  end: string | null;
  location: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  lead?: { id: string; name: string | null } | null;
};

export type Contract = {
  id: string;
  leadId: string;
  title: string | null;
  amountCents: number | null;
  status: ContractStatus;
  sentAt: string | null;
  signedAt: string | null;
  createdAt: string;
  updatedAt: string;
  lead?: { id: string; name: string | null } | null;
};

export type ListLeadParams = {
  stage?: LeadStage | LeadStage[];
  createdAfter?: Date | string;
  awaitingReply?: boolean;
  consultRequested?: boolean;
  depositPending?: boolean;
  contractPending?: boolean;
  highBudget?: boolean;
  search?: string;
};

export async function listLeads(params: ListLeadParams = {}): Promise<Lead[]> {
  const query = buildQuery({
    ...params,
    createdAfter:
      params.createdAfter instanceof Date
        ? params.createdAfter.toISOString()
        : params.createdAfter,
  });
  const res = await fetch(`/api/leads${query}`, DEFAULT_HEADERS);
  if (!res.ok) {
    throw new Error((await res.text()) || "Failed to load leads");
  }
  const data = await res.json();
  return data.leads as Lead[];
}

export type ListTaskParams = {
  status?: TaskStatus | TaskStatus[];
  due?: "today-or-future" | "today" | "range";
  rangeStart?: string;
  rangeEnd?: string;
  overdue?: boolean;
  search?: string;
};

export async function listTasks(params: ListTaskParams = {}): Promise<Task[]> {
  const query = buildQuery(params);
  const res = await fetch(`/api/tasks${query}`, DEFAULT_HEADERS);
  if (!res.ok) {
    throw new Error((await res.text()) || "Failed to load tasks");
  }
  const data = await res.json();
  return data.tasks as Task[];
}

export type ListAppointmentsParams = {
  date?: string;
  rangeStart?: string;
  rangeEnd?: string;
  search?: string;
};

export async function listAppointments(params: ListAppointmentsParams = {}): Promise<Appointment[]> {
  const query = buildQuery(params);
  const res = await fetch(`/api/appointments${query}`, DEFAULT_HEADERS);
  if (!res.ok) {
    throw new Error((await res.text()) || "Failed to load appointments");
  }
  const data = await res.json();
  return data.appointments as Appointment[];
}

export type ListContractsParams = {
  status?: ContractStatus | ContractStatus[];
};

export async function listContracts(params: ListContractsParams = {}): Promise<Contract[]> {
  const query = buildQuery(params);
  const res = await fetch(`/api/contracts${query}`, DEFAULT_HEADERS);
  if (!res.ok) {
    throw new Error((await res.text()) || "Failed to load contracts");
  }
  const data = await res.json();
  return data.contracts as Contract[];
}

export type CreateLeadPayload = {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  eventDate?: string | null;
  message?: string | null;
  source?: string | null;
  stage?: LeadStage;
  consultRequested?: boolean;
  depositPending?: boolean;
  contractPending?: boolean;
  highBudget?: boolean;
  budgetCents?: number | null;
};

export async function createLead(payload: CreateLeadPayload): Promise<Lead> {
  const res = await fetch(`/api/leads`, {
    ...jsonHeaders(payload),
    method: "POST",
  });
  if (!res.ok) {
    throw new Error((await res.text()) || "Failed to create lead");
  }
  const data = await res.json();
  return data.lead as Lead;
}

export type UpdateLeadPayload = Partial<CreateLeadPayload> & {
  eventDate?: string | null;
  lastInboundAt?: string | null;
  lastOutboundAt?: string | null;
};

export async function updateLead(id: string, payload: UpdateLeadPayload): Promise<Lead> {
  const res = await fetch(`/api/leads`, {
    ...jsonHeaders({ id, ...payload }),
    method: "PATCH",
  });
  if (!res.ok) {
    throw new Error((await res.text()) || "Failed to update lead");
  }
  const data = await res.json();
  return data.lead as Lead;
}

export type CreateAppointmentPayload = {
  title: string;
  leadId?: string | null;
  status?: AppointmentStatus;
  start: string;
  end?: string | null;
  location?: string | null;
  notes?: string | null;
};

export async function createAppointment(payload: CreateAppointmentPayload): Promise<Appointment> {
  const res = await fetch(`/api/appointments`, {
    ...jsonHeaders(payload),
    method: "POST",
  });
  if (!res.ok) {
    throw new Error((await res.text()) || "Failed to create appointment");
  }
  const data = await res.json();
  return data.appointment as Appointment;
}

export type UpdateTaskPayload = {
  title?: string;
  notes?: string | null;
  status?: TaskStatus;
  dueDate?: string | null;
  completedAt?: string | null;
};

export async function updateTask(id: string, payload: UpdateTaskPayload): Promise<Task> {
  const res = await fetch(`/api/tasks/${id}`, {
    ...jsonHeaders(payload),
    method: "PATCH",
  });
  if (!res.ok) {
    throw new Error((await res.text()) || "Failed to update task");
  }
  const data = await res.json();
  return data.task as Task;
}

export type LeadStageCounts = Record<LeadStage, number>;

export async function fetchLeadStageCounts(): Promise<LeadStageCounts> {
  const res = await fetch(`/api/leads/stats`, DEFAULT_HEADERS);
  if (!res.ok) {
    throw new Error((await res.text()) || "Failed to fetch lead stats");
  }
  const data = await res.json();
  return data.stageCounts as LeadStageCounts;
}
