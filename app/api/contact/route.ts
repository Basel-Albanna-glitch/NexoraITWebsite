import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { validateContact, type ContactInput } from "@/lib/contact";
import { isLocale } from "@/lib/i18n";
import { addMessage, updateMessage } from "@/lib/messages-store";

export const runtime = "nodejs";

// Simple per-IP rate limit (in memory: resets on restart, per server instance).
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Emails the message to CONTACT_TO. Returns false when SMTP isn't configured (it's still in the dashboard inbox). */
async function deliver(d: ContactInput) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, CONTACT_TO } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !CONTACT_TO) return false;

  const port = Number(SMTP_PORT || 465);
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  const rows: [string, string][] = [
    ["Name", d.name], ["Email", d.email], ["Company", d.company || "—"], ["Service", d.service],
  ];
  await transporter.sendMail({
    from: SMTP_FROM || SMTP_USER,
    to: CONTACT_TO,
    replyTo: `${d.name} <${d.email}>`,
    subject: `New ${d.service} enquiry — ${d.name}`,
    text: `${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\n${d.message}`,
    html: `<table cellpadding="4">${rows
      .map(([k, v]) => `<tr><td><b>${k}</b></td><td>${escapeHtml(v)}</td></tr>`).join("")}</table>
      <p style="white-space:pre-wrap">${escapeHtml(d.message)}</p>`,
  });
  return true;
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "server" }, { status: 400 });
  }

  // Honeypot: real visitors never fill the hidden "website" field.
  if (body.website) return NextResponse.json({ ok: true });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (rateLimited(ip)) return NextResponse.json({ ok: false, error: "rate" }, { status: 429 });

  const result = validateContact(body);
  if (!result.ok) return NextResponse.json({ ok: false, errors: result.errors }, { status: 422 });

  // 1. Save to the dashboard inbox — this is what counts as "sent".
  const lang = typeof body.lang === "string" && isLocale(body.lang) ? body.lang : "en";
  let saved;
  try {
    saved = await addMessage(result.data, lang);
  } catch (err) {
    console.error("[contact] could not save message:", err);
    return NextResponse.json({ ok: false, error: "server" }, { status: 500 });
  }

  // 2. Email notification (best effort).
  try {
    if (await deliver(result.data)) await updateMessage(saved.id, { emailed: true });
  } catch (err) {
    console.error("[contact] email failed (message is in the dashboard inbox):", err);
  }
  return NextResponse.json({ ok: true });
}
