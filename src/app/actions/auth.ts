"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  const BASE_API_URL = process.env.BASE_API_URL ?? "http://localhost:8080";

  const res = await fetch(`${BASE_API_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Login failed: ${res.status}`);
  }

  const data = await res.json();
  const { accessToken, refreshToken } = data;

  const cookieStore = await cookies();
  cookieStore.set("session", refreshToken, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  // optional: fetch current user info from auth server using accessToken
  let user = null;
  try {
    const meRes = await fetch(`${BASE_API_URL}/api/v1/auth/me`, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    if (meRes.ok) {
      try {
        user = await meRes.json();
      } catch {
        user = null;
      }
    }
  } catch (e) {
    console.error("login: failed to fetch /me", e);
  }

  // optional test request to check local backend availability
  const testResult: {
    ok: boolean;
    status: number | null;
    text?: string | null;
  } = {
    ok: false,
    status: null,
    text: null,
  };

  try {
    const testRes = await fetch("http://localhost:8080/", {
      method: "GET",
      cache: "no-store",
    });
    testResult.ok = testRes.ok;
    testResult.status = testRes.status;
    // try to capture a small body if present
    try {
      testResult.text = await testRes.text();
    } catch {
      testResult.text = null;
    }
  } catch (e) {
    console.error("login: test request to http://localhost:8080/ failed:", e);
  }

  return { accessToken, user, testResult };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.set("session", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  redirect("/");
}
