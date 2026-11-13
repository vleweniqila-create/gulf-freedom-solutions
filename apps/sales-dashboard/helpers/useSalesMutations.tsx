import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postLeadsCreate, type InputType as LeadInput } from "../endpoints/leads/create_POST.schema";
import { postLeadsUpdateStatus, type InputType as LeadStatusInput } from "../endpoints/leads/update-status_POST.schema";
import { postDealsCreate, type InputType as DealInput } from "../endpoints/deals/create_POST.schema";
import { postDealsUpdateStage, type InputType as DealStageInput } from "../endpoints/deals/update-stage_POST.schema";
import { postPaymentsCreate, type InputType as PaymentInput } from "../endpoints/payments/create_POST.schema";
import { postSampleClear } from "../endpoints/sample/clear_POST.schema";

// Every sales write refreshes the single dashboard query.
export function useSalesMutations() {
  const queryClient = useQueryClient();
  const onSuccess = () => queryClient.invalidateQueries({ queryKey: ["dashboard"] });

  return {
    createLead: useMutation({ mutationFn: (v: LeadInput) => postLeadsCreate(v), onSuccess }),
    updateLeadStatus: useMutation({ mutationFn: (v: LeadStatusInput) => postLeadsUpdateStatus(v), onSuccess }),
    createDeal: useMutation({ mutationFn: (v: DealInput) => postDealsCreate(v), onSuccess }),
    updateDealStage: useMutation({ mutationFn: (v: DealStageInput) => postDealsUpdateStage(v), onSuccess }),
    createPayment: useMutation({ mutationFn: (v: PaymentInput) => postPaymentsCreate(v), onSuccess }),
    clearSample: useMutation({ mutationFn: () => postSampleClear(), onSuccess }),
  };
}
