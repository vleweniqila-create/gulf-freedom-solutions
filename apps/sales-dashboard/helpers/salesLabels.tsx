import type { DealStage, LeadSource, LeadStatus, PaymentKind, ServiceType } from "./schema";

// Display labels and default prices shared by the dashboard and its add dialogs.
export const salesLabels = {
  service: {
    website: "Website build",
    website_care: "Website Care",
    social_ads: "Social ads",
    bundle: "Site + ads bundle",
  } satisfies Record<ServiceType, string>,
  serviceDefaults: {
    website: { oneTime: 1500, monthly: 149 },
    website_care: { oneTime: 0, monthly: 149 },
    social_ads: { oneTime: 0, monthly: 600 },
    bundle: { oneTime: 1500, monthly: 749 },
  } satisfies Record<ServiceType, { oneTime: number; monthly: number }>,
  stage: {
    discovery: "Discovery",
    proposal: "Proposal sent",
    negotiation: "Negotiating",
    won: "Won",
    lost: "Lost",
  } satisfies Record<DealStage, string>,
  stageOrder: ["discovery", "proposal", "negotiation", "won", "lost"] as DealStage[],
  leadStatus: {
    new: "New",
    contacted: "Contacted",
    qualified: "Qualified",
    converted: "Converted",
    lost: "Lost",
  } satisfies Record<LeadStatus, string>,
  leadStatusOrder: ["new", "contacted", "qualified", "converted", "lost"] as LeadStatus[],
  source: {
    referral: "Referral",
    facebook: "Facebook",
    google: "Google",
    walk_in: "Walk-in",
    cold_outreach: "Cold outreach",
    website: "Website form",
    other: "Other",
  } satisfies Record<LeadSource, string>,
  paymentKind: {
    one_time: "One-time",
    recurring: "Recurring",
  } satisfies Record<PaymentKind, string>,
  money: (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }),
  shortDate: (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }),
};
