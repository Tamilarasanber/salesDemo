// React Query hooks for user data
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import AuthService from "@/API/Services/AuthService";
import { User, LoginRequest, LoginResponse } from "@/Types/Auth.types";

// Query keys
export const userKeys = {
  all: ["user"] as const,
  current: () => [...userKeys.all, "current"] as const,
};

// Current user query
export const useCurrentUserQuery = (
  options?: Omit<UseQueryOptions<User, Error>, "queryKey" | "queryFn">
) => {
  return useQuery({
    queryKey: userKeys.current(),
    queryFn: () => AuthService.getCurrentUser(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: false,
    ...options,
  });
};

// Login mutation
export const useLoginMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => AuthService.login(credentials),
    onSuccess: (data: LoginResponse) => {
      queryClient.setQueryData(userKeys.current(), data.user);
    },
  });
};

// Logout mutation
export const useLogoutMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => AuthService.logout(),
    onSuccess: () => {
      queryClient.clear();
    },
  });
};

// Forgot password mutation
export const useForgotPasswordMutation = () => {
  return useMutation({
    mutationFn: (email: string) => AuthService.forgotPassword(email),
  });
};
