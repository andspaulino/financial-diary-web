"use client";

import { useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";

/**
 * Hook that returns a fetch wrapper which injects the in-memory access token
 * into the Authorization header for client requests.
 *
 * Usage:
 * const authFetch = useAuthFetch();
 * const res = await authFetch('/api/protected');
 */
export function useAuthFetch() {
  const { accessToken, setAccessToken } = useAuth();
  const router = useRouter();

  // ref to hold a shared refresh promise to avoid concurrent refresh requests
  const refreshPromiseRef = useRef<Promise<string | null> | null>(null);

  const authFetch = useCallback(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const headers = new Headers(init?.headers as HeadersInit | undefined);
      if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

      const res = await fetch(input, {
        ...init,
        headers,
        credentials: init?.credentials ?? "same-origin",
      });

      if (res.status !== 401) return res;

      // If we already have a refresh in progress, wait for it. Otherwise, create one.
      if (!refreshPromiseRef.current) {
        refreshPromiseRef.current = (async () => {
          try {
            const r = await fetch("/api/auth/refresh", {
              method: "POST",
              credentials: "same-origin",
            });
            if (!r.ok) {
              // try to read standardized error
              let errBody = null;
              try {
                errBody = await r.json();
              } catch {}
              if (errBody?.error === "refresh_failed") {
                // force logout: clear in-memory token and redirect to signin
                setAccessToken(null);
                router.push("/signin");
                return null;
              }
              return null;
            }
            const d = await r.json();
            return (d.accessToken as string) || null;
          } catch {
            return null;
          }
        })();
      }

      const newToken = await refreshPromiseRef.current;
      // reset ref so future 401s can trigger a fresh refresh
      refreshPromiseRef.current = null;

      if (!newToken) return res;

      // update in-memory token and retry original request
      setAccessToken(newToken);
      const retryHeaders = new Headers(headers);
      retryHeaders.set("Authorization", `Bearer ${newToken}`);
      return fetch(input, {
        ...init,
        headers: retryHeaders,
        credentials: "same-origin",
      });
    },
    [accessToken, setAccessToken, router]
  );

  return authFetch;
}
