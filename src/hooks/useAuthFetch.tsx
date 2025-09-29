"use client";

import { useCallback } from "react";
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

  const authFetch = useCallback(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const headers = new Headers(init?.headers as HeadersInit | undefined);
      if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

      // ensure cookies are sent for same-origin requests (so refresh cookie is available server-side)
      const res = await fetch(input, {
        ...init,
        headers,
        credentials: init?.credentials ?? "same-origin",
      });

      // Basic convenience: if we receive 401, you probably need to try refresh.
      // A recommended flow is:
      // 1) call your refresh endpoint (/api/auth/refresh) which uses the httpOnly `session` cookie
      // 2) if refresh returns new access token, call setAccessToken(newToken) and retry the original request
      // Here we don't automatically refresh (so you can control the UX), but example code is below.

      if (res.status === 401) {
        // optional: try to refresh automatically
        try {
          const r = await fetch("/api/auth/refresh", {
            method: "POST",
            credentials: "same-origin",
          });
          if (r.ok) {
            const d = await r.json();
            if (d.accessToken) {
              setAccessToken(d.accessToken);
              // retry original request with new token
              const retryHeaders = new Headers(headers);
              retryHeaders.set("Authorization", `Bearer ${d.accessToken}`);
              return fetch(input, {
                ...init,
                headers: retryHeaders,
                credentials: "same-origin",
              });
            }
          }
        } catch {
          // ignore and fallthrough to returning original 401
        }
      }

      return res;
    },
    [accessToken, setAccessToken]
  );

  return authFetch;
}
