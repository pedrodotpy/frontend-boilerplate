import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { UserCreateWritable, UserUpdateWritable } from "@/shared/api";
import {
  usersCreate,
  usersDestroy,
  usersList,
  usersPartialUpdate,
  usersRetrieve,
} from "@/shared/api/sdk.gen";

export const usersQueryKey = ["users"] as const;

export function useUsersQuery(
  params: { limit?: number; offset?: number } = {},
) {
  const limit = params.limit ?? 10;
  const offset = params.offset ?? 0;
  return useQuery({
    queryKey: [...usersQueryKey, "list", { limit, offset }],
    queryFn: async () => {
      const { data, error } = await usersList({
        query: { limit, offset },
        throwOnError: false,
      });
      if (error || !data) {
        throw error ?? new Error("Failed to load users");
      }
      return data;
    },
  });
}

export function useUserQuery(id: number) {
  return useQuery({
    queryKey: [...usersQueryKey, "detail", id],
    enabled: Number.isFinite(id),
    queryFn: async () => {
      const { data, error } = await usersRetrieve({
        path: { id },
        throwOnError: false,
      });
      if (error || !data) {
        throw error ?? new Error("Failed to load user");
      }
      return data;
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: UserCreateWritable) => {
      const { data, error } = await usersCreate({ body, throwOnError: false });
      if (error || !data) {
        throw error;
      }
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: usersQueryKey });
    },
  });
}

export function useUpdateUser(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: UserUpdateWritable) => {
      const { data, error } = await usersPartialUpdate({
        path: { id },
        body,
        throwOnError: false,
      });
      if (error || !data) {
        throw error;
      }
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: usersQueryKey });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await usersDestroy({
        path: { id },
        throwOnError: false,
      });
      if (error) {
        throw error;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: usersQueryKey });
    },
  });
}

export type FieldErrors = Record<string, string[]>;

export function extractFieldErrors(error: unknown): FieldErrors {
  if (!error || typeof error !== "object") {
    return {};
  }
  const maybeAxios = error as {
    response?: { data?: unknown };
    error?: unknown;
  };
  const payload = maybeAxios.response?.data ?? maybeAxios.error;
  if (!payload || typeof payload !== "object") {
    return {};
  }
  const result: FieldErrors = {};
  for (const [key, value] of Object.entries(
    payload as Record<string, unknown>,
  )) {
    if (
      Array.isArray(value) &&
      value.every((item) => typeof item === "string")
    ) {
      result[key] = value;
    } else if (typeof value === "string") {
      result[key] = [value];
    }
  }
  return result;
}
