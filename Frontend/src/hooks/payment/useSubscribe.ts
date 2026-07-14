import { useMutation, useQueryClient } from "@tanstack/react-query";

import { paymentService, SubscriptionPlan } from "../../api/services/payment.api";

export function useSubscribe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (plan: SubscriptionPlan) => paymentService.subscribe(plan),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment", "revenueDashboard"] });
    },
  });
}
