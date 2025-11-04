import { LeadStageEnum, LeadStage } from "@/lib/api";

type StageDefinition = {
  id: LeadStage;
  label: string;
  description?: string;
};

export const PIPELINE_STAGES: StageDefinition[] = [
  { id: LeadStageEnum.NEW, label: "New" },
  { id: LeadStageEnum.CONTACTED, label: "Contacted" },
  { id: LeadStageEnum.CONSULT_TRIAL, label: "Consult/Trial" },
  { id: LeadStageEnum.PROPOSAL_SENT, label: "Proposal sent" },
  { id: LeadStageEnum.DEPOSIT_RECEIVED, label: "Deposit received" },
  { id: LeadStageEnum.CONTRACT_SIGNED, label: "Contract signed" },
  { id: LeadStageEnum.SCHEDULED, label: "Scheduled" },
  { id: LeadStageEnum.COMPLETED, label: "Completed" },
  { id: LeadStageEnum.LOST, label: "Lost" },
];

export const DEFAULT_STAGE = LeadStageEnum.NEW;
