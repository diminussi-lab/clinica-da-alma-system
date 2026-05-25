import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useEffect, useMemo } from "react";

const LOCAL_AUTH_STORAGE_KEY = "clinica-da-alma-local-auth";

const FALLBACK_LOCAL_USER = {
  id: 1,
  openId: "clinica-da-alma-local-owner",
  name: "Clínica da Alma",
  email: null,
  loginMethod: "local",
  role: "admin",
  createdAt: new Date(0),
  updatedAt: new Date(0),
  lastSignedIn: new Date(0),
};

function hasLocalAuthIntent() {
  if (typeof window === "undefined") return false;

  return (
    localStorage.getItem(LOCAL_AUTH_STORAGE_KEY) === "true" ||
    window.location.pathname !== "/"
  );
}

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath } = options ?? {};
  const utils = trpc.useUtils();

  const shouldAuthenticate = hasLocalAuthIntent();

  const meQuery = trpc.auth.me.useQuery(undefined, {
    enabled: shouldAuthenticate,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 60_000,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.setData(undefined, null);
    },
  });

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error: unknown) {
      if (
        error instanceof TRPCClientError &&
        error.data?.code === "UNAUTHORIZED"
      ) {
        return;
      }
      throw error;
    } finally {
      localStorage.removeItem(LOCAL_AUTH_STORAGE_KEY);
      utils.auth.me.setData(undefined, null);
      await utils.auth.me.invalidate();
    }
  }, [logoutMutation, utils]);

  const state = useMemo(() => {
    const user = meQuery.data ?? (shouldAuthenticate ? FALLBACK_LOCAL_USER : null);

    localStorage.setItem(
      "manus-runtime-user-info",
      JSON.stringify(user)
    );

    return {
      user,
      loading: logoutMutation.isPending,
      error: meQuery.error ?? logoutMutation.error ?? null,
      isAuthenticated: Boolean(user),
    };
  }, [
    shouldAuthenticate,
    meQuery.data,
    meQuery.error,
    logoutMutation.error,
    logoutMutation.isPending,
  ]);

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (logoutMutation.isPending) return;
    if (state.user) return;
    if (typeof window === "undefined") return;

    const loginUrl = redirectPath ?? getLoginUrl();
    if (window.location.href === loginUrl || window.location.pathname === loginUrl) return;

    window.location.href = loginUrl;
  }, [
    redirectOnUnauthenticated,
    redirectPath,
    logoutMutation.isPending,
    state.user,
  ]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  };
}
