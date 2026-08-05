import { useQuery } from "@tanstack/react-query";

import type { Me } from "@/shared/api";
import { authMeRetrieve } from "@/shared/api/sdk.gen";
import { getAccessToken } from "@/shared/auth/tokens";

export const meQueryKey = ["auth", "me"] as const;

export function useMe() {
  return useQuery({
    queryKey: meQueryKey,
    enabled: Boolean(getAccessToken()),
    queryFn: async (): Promise<Me> => {
      const { data, error } = await authMeRetrieve({ throwOnError: false });
      if (error || !data) {
        throw error ?? new Error("Failed to load current user");
      }
      return data;
    },
    staleTime: 60_000,
  });
}

export function useHasPermission(perm: string) {
  const { data } = useMe();
  return Boolean(data?.permissions?.includes(perm));
}
