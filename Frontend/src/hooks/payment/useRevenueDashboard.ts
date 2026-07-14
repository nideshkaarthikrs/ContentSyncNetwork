import { useQuery } from "@tanstack/react-query";

import { paymentService } from "../../api/services/payment.api";

export function useRevenueDashboard() {
  return useQuery({
    queryKey: ["payment", "revenueDashboard"],
    queryFn: () => paymentService.getRevenueDashboard(),
  });
}
