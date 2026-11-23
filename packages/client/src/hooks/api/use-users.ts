import { useQuery } from "@tanstack/react-query";
import {
  type CompleteOnboardingRequest,
  usersApi,
  type User,
  UserResult,
  UserResults,
  GetUsersParams,
  TourProgressResult,
  ProfileStatsResult,
} from "@ivyi/client/src/api/clients/users.api";
import type { ApiClientError } from "@ivyi/client/src/api/api.errors";
import { useAppMutation } from "../../react-query/react-query.utils";
import { authKeys } from "./use-auth";

export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (filters: string) => [...userKeys.lists(), { filters }] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  current: () => [...userKeys.all, "current"] as const,
  tour: (userId?: string) => [...userKeys.all, "tour", userId] as const,
  stats: (userId: string) => [...userKeys.all, "stats", userId] as const,
};

/*
 * ========================================
 * INVALIDATIONS
 * ========================================
 */
export const invalidations = {
  detail: (id: string) => [userKeys.detail(id), userKeys.lists()],
};

/*
 * ========================================
 * QUERIES
 * ========================================
 */
export const userQueries = {
  all: (params?: GetUsersParams) => ({
    queryKey: [...userKeys.all, params] as const,
    queryFn: () => usersApi.getAllUsers(params),
  }),
  detail: (id: string, { initialData }: { initialData?: UserResult } = {}) => ({
    queryKey: userKeys.detail(id),
    queryFn: () => usersApi.getUserById(id),
    enabled: !!id,
    initialData,
  }),
  tour: (userId?: string) => ({
    queryKey: userKeys.tour(userId),
    queryFn: () => usersApi.getTourProgress(),
    enabled: !!userId,
    staleTime: 0,
  }),
  stats: (userId: string) => ({
    queryKey: userKeys.stats(userId),
    queryFn: () => usersApi.getProfileStats(),
    enabled: !!userId,
    staleTime: 0,
  }),
};

/*
 * ========================================
 * REACT HOOKS
 * ========================================
 */
export const useUsers = (params?: GetUsersParams) =>
  useQuery<UserResults, ApiClientError>({
    ...userQueries.all(params),
    placeholderData: (previousData) => previousData,
  });

export const useUser = (id: string) =>
  useQuery<UserResult, ApiClientError>({
    ...userQueries.detail(id),
  });

export const useUserTourProgress = (userId?: string) =>
  useQuery<TourProgressResult, ApiClientError>({
    ...userQueries.tour(userId),
  });

export const useProfileStats = (userId: string) =>
  useQuery<ProfileStatsResult, ApiClientError>({
    ...userQueries.stats(userId),
  });

/*
 * ========================================
 * MUTATIONS
 * ========================================
 */
export const useUserMutations = () => {
  const updateUser = useAppMutation<
    UserResult,
    ApiClientError,
    { userId: string; userData: Partial<User> }
  >({
    mutationFn: ({ userId, userData }) => usersApi.updateUser(userId, userData),
    messages: {
      success: "User updated successfully",
      error: (err) => err.errors?.[0]?.detail ?? "Failed to update user",
    },
    invalidates: (vars) => [...invalidations.detail(vars.userId), authKeys.me],
  });

  const completeOnboarding = useAppMutation<
    UserResult,
    ApiClientError,
    CompleteOnboardingRequest
  >({
    mutationFn: (onboardingData) => usersApi.completeOnboarding(onboardingData),
    messages: {
      success: "Account configured successfully! Welcome.",
      error: (err) =>
        err.errors?.[0]?.detail ?? "Failed to complete account configuration",
    },
    invalidates: () => [userKeys.current()],
  });

  const uploadProfilePicture = useAppMutation<
    UserResult,
    ApiClientError,
    { userId: string; file: File }
  >({
    mutationFn: ({ userId, file }) =>
      usersApi.uploadProfilePicture(userId, file),
    messages: {
      success: "Profile picture updated",
      error: (err) =>
        err.errors?.[0]?.detail ?? "Failed to upload profile picture",
    },
    invalidates: (vars) => [...invalidations.detail(vars.userId), authKeys.me],
  });

  return {
    updateUser,
    completeOnboarding,
    uploadProfilePicture,
  };
};
