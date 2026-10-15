import { NextResponse } from "next/server";
import { adminConfigured, checkPassword, createSessionToken, SESSION_COOKIE } from "@/lib/auth";

export const runtime = "nodejs";

// Slow down password guessing: 5 attempts per IP per 15 minutes.
const WINDOW_MS = 15 * 60 * 1000;
const attempts = new Map<string, number[]>();

export async function POST(req: Request) {
  if (!adminConfigured()) {
    return NextResponse.json({ error: "Set ADMIN_PASSWORD in .env.local first." }, { status: 503 });
  }
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  const now = Date.now();
  const recent = (attempts.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= 5) {
    return NextResponse.json({ error: "Too many attempts. Try again in 15 minutes." }, { status: 429 });
  }

  const { password } = await req.json().catch(() => ({ password: "" }));
  if (!checkPassword(String(password ?? ""))) {
    recent.push(now);
    attempts.set(ip, recent);
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }
  attempts.delete(ip);

  const { token, maxAge } = createSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
