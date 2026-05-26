import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useCallback, useEffect, useMemo } from "react";

const LOCAL_AUTH_STORAGE_KEY = "clinica-da-alma-local-auth";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath } = options ?? {};
  const utils = trpc.useUtils();

  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 60_000,
  });

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async (user) => {
      localStorage.setItem(LOCAL_AUTH_STORAGE_KEY, "true");
      localStorage.setItem("clinica-da-alma-user-info", JSON.stringify(user));
      utils.auth.me.setData(undefined, user);
      await utils.auth.me.invalidate();
    },
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      localStorage.removeItem(LOCAL_AUTH_STORAGE_KEY);
      localStorage.removeItem("clinica-da-alma-user-info");
      utils.auth.me.setData(undefined, null);
    },
  });

  const login = useCallback(
    async (password: string) => loginMutation.mutateAsync({ password }),
    [loginMutation]
  );

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
    } finally {
      localStorage.removeItem(LOCAL_AUTH_STORAGE_KEY);
      localStorage.removeItem("clinica-da-alma-user-info");
      utils.auth.me.setData(undefined, null);
      await utils.auth.me.invalidate();
    }
  }, [logoutMutation, utils]);

  const state = useMemo(() => {
    const user = meQuery.data ?? null;

    if (user) {
      localStorage.setItem("clinica-da-alma-user-info", JSON.stringify(user));
    }

    return {
      user,
      loading: meQuery.isLoading || loginMutation.isPending || logoutMutation.isPending,
      error: meQuery.error ?? loginMutation.error ?? logoutMutation.error ?? null,
      isAuthenticated: Boolean(user),
    };
  }, [
    meQuery.data,
    meQuery.error,
    meQuery.isLoading,
    loginMutation.error,
    loginMutation.isPending,
    logoutMutation.error,
    logoutMutation.isPending,
  ]);

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (state.loading) return;
    if (state.user) return;
    if (typeof window === "undefined") return;

    const loginUrl = redirectPath ?? getLoginUrl();
    if (window.location.pathname === loginUrl) return;

    window.location.href = loginUrl;
  }, [redirectOnUnauthenticated, redirectPath, state.loading, state.user]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    login,
    logout,
  };
}
