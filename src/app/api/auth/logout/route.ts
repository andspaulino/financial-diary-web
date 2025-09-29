import { NextResponse } from "next/server";

export async function POST() {
  // Clear the session cookie by setting it with Max-Age=0
  const cookieHeader = [`session=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax`];
  if (process.env.NODE_ENV === "production") cookieHeader.push("Secure");

  return NextResponse.json(
    { ok: true },
    { status: 200, headers: { "Set-Cookie": cookieHeader.join("; ") } }
  );
}
