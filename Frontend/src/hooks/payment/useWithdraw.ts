import { useMutation, useQueryClient } from "@tanstack/react-query";

import { paymentService } from "../../api/services/payment.api";

export function useWithdraw() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ amount, bankAccountId }: { amount: number; bankAccountId: string }) =>
      paymentService.withdraw(amount, bankAccountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment", "revenueDashboard"] });
    },
  });
}
