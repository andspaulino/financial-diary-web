import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_URL = process.env.AUTH_URL || "http://localhost:8080";

export async function POST(req: NextRequest) {
  try {
    // read cookies from the incoming request
    const cookieHeader = req.headers.get("cookie") || "";

    // forward cookies to auth server so it can read the refresh token (session cookie)
    const r = await fetch(`${AUTH_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      // bodyless POST; auth server should read refresh token from cookie
    });

    if (!r.ok) {
      return NextResponse.json(
        { error: "could not refresh" },
        { status: r.status }
      );
    }

    const data = await r.json();

    // If the auth server returns a set-cookie header to rotate the refresh token, propagate it.
    const setCookie = r.headers.get("set-cookie");

    const res = NextResponse.json({ accessToken: data.accessToken });
    if (setCookie) {
      // copy Set-Cookie header through. NextResponse has cookie helpers but copying raw header is simplest.
      res.headers.set("Set-Cookie", setCookie);
    }

    return res;
  } catch {
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
