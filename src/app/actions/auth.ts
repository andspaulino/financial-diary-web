"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  const AUTH_URL = process.env.AUTH_URL ?? "https://auth.example.com";

  const res = await fetch(`${AUTH_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });

  if (!res.ok) {
    // Throw an error so the client action state can read it (useActionState)
    throw new Error(`Login failed: ${res.status}`);
  }

  const data = await res.json();
  const accessToken = data.accessToken;
  const refreshToken = data.refreshToken;
  const expiresIn = data.expiresIn ?? 60 * 15;
  const refreshExpiresIn = data.refreshExpiresIn ?? 60 * 60 * 24 * 30;

  const cookieStore = await cookies();
  cookieStore.set("access_token", accessToken, {
    httpOnly: true,
    path: "/",
    maxAge: expiresIn,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  if (refreshToken) {
    cookieStore.set("refresh_token", refreshToken, {
      httpOnly: true,
      path: "/",
      maxAge: refreshExpiresIn,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  // Redirect to dashboard or home
  redirect("/");
}
