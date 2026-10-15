import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

// Single-admin login: the password lives in ADMIN_PASSWORD; the session is a signed, httpOnly cookie.
export const SESSION_COOKIE = "nx_admin";
const SESSION_DAYS = 14;

function secret() {
  const s = process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD;
  if (!s) throw new Error("ADMIN_PASSWORD is not set");
  return s;
}

const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("base64url");

function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a), bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export function adminConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export function checkPassword(input: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  // compare digests so the comparison is constant-time regardless of length
  const h = (s: string) => createHmac("sha256", "pw").update(s).digest("hex");
  return safeEqual(h(input), h(expected));
}

export function createSessionToken() {
  const exp = Date.now() + SESSION_DAYS * 864e5;
  const payload = `admin.${exp}`;
  return { token: `${payload}.${sign(payload)}`, maxAge: SESSION_DAYS * 86400 };
}

function validToken(token: string | undefined) {
  if (!token || !adminConfigured()) return false;
  const i = token.lastIndexOf(".");
  const payload = token.slice(0, i), sig = token.slice(i + 1);
  if (!safeEqual(sig, sign(payload))) return false;
  const exp = Number(payload.split(".")[1]);
  return Number.isFinite(exp) && exp > Date.now();
}

export async function isAdmin() {
  return validToken((await cookies()).get(SESSION_COOKIE)?.value);
}
