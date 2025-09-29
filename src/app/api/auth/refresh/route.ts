import { NextResponse } from "next/server";
// route runs server-side; NextRequest not needed here
import { cookies } from "next/headers";

const BASE_API_URL = process.env.BASE_API_URL || "http://localhost:8080";

export async function POST() {
  try {
    // read the HttpOnly `session` cookie using Next's cookie helper
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;

    // forward the session cookie to the auth server so it can read the refresh token
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (sessionCookie) headers.Cookie = `session=${sessionCookie}`;

    // bodyless POST; auth server should read refresh token from cookie
    const r = await fetch(`${BASE_API_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers,
    });

    if (!r.ok) {
      // If auth server says unauthorized, surface a consistent refresh_failed error.
      if (r.status === 401 || r.status === 403) {
        return NextResponse.json({ error: "refresh_failed" }, { status: 401 });
      }
      // Other upstream errors
      return NextResponse.json({ error: "refresh_error" }, { status: 502 });
    }

    const data = await r.json();

    if (!data || !data.accessToken) {
      return NextResponse.json({ error: "refresh_failed" }, { status: 502 });
    }

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
