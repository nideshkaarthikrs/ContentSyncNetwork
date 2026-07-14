import { useQuery } from "@tanstack/react-query";

import { profileService } from "../../api/services/profile.api";

export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ["profile", "detail", userId],
    queryFn: () => profileService.getProfile(userId as string),
    enabled: !!userId,
  });
}
