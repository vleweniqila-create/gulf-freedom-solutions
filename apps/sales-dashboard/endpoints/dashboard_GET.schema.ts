import { z } from "zod";
import superjson from "superjson";
import type { DealStage, LeadSource, LeadStatus, ServiceType } from "../helpers/schema";

export const schema = z.object({});

export type InputType = z.infer<typeof schema>;

export type DashboardDeal = {
  id: number;
  clientName: string;
  service: ServiceType;
  stage: DealStage;
  oneTimeValue: number;
  monthlyValue: number;
  expectedClose: Date | null;
  updatedAt: Date;
};

export type DashboardLead = {
  id: number;
  contactName: string;
  businessName: string;
  email: string | null;
  phone: string | null;
  source: LeadSource;
  status: LeadStatus;
  notes: string | null;
  createdAt: Date;
};

export type OutputType = {
  kpis: {
    revenueThisMonth: number;
    revenueLastMonth: number;
    revenueYearToDate: number;
    monthlyRecurring: number;
    pipelineValue: number;
    openDeals: number;
    newLeads30d: number;
  };
  monthlyRevenue: { month: string; label: string; oneTime: number; recurring: number }[];
  openDeals: DashboardDeal[];
  recentWins: DashboardDeal[];
  recentLeads: DashboardLead[];
  hasSampleData: boolean;
};

export const getDashboard = async (init?: RequestInit): Promise<OutputType> => {
  const result = await fetch(`/_api/dashboard`, { method: "GET", ...init });
  if (!result.ok) {
    const errorObject = superjson.parse<{ error: string }>(await result.text());
    throw new Error(errorObject.error);
  }
  return superjson.parse<OutputType>(await result.text());
};
