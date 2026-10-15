import { isAdmin } from "@/lib/auth";
import { stripLocale } from "@/lib/i18n";
import { recordView } from "@/lib/stats-store";

export const runtime = "nodejs";

const BOT_RE = /bot|crawl|spider|slurp|preview|facebookexternalhit|headless|lighthouse|pingdom|monitor/i;
const KNOWN_PATHS = /^\/(services(\/[a-z-]+)?|work|about|contact|privacy)?$/;

/** Page-view beacon from the public site. Always answers 204 so it never shows errors to visitors. */
export async function POST(req: Request) {
  const ua = req.headers.get("user-agent") ?? "";
  if (!ua || BOT_RE.test(ua) || (await isAdmin())) return new Response(null, { status: 204 });

  const body = await req.json().catch(() => ({}));
  const raw = typeof body.path === "string" ? body.path.split(/[?#]/)[0].slice(0, 120) : "";
  const lang = raw === "/ar" || raw.startsWith("/ar/") ? "ar" : "en";
  const path = stripLocale(raw);
  if (!KNOWN_PATHS.test(path)) return new Response(null, { status: 204 });

  let ref = "";
  try {
    const host = new URL(String(body.ref ?? "")).hostname.replace(/^www\./, "");
    const own = new URL(req.url).hostname.replace(/^www\./, "");
    if (host && host !== own) ref = host.slice(0, 80);
  } catch {}

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "local";
  recordView({ path, lang, ref, ip, ua });
  return new Response(null, { status: 204 });
}
