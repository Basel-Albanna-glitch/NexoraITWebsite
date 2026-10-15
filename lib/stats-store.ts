import "server-only";
import { createHash, randomBytes } from "crypto";
import { jsonFile } from "./json-file";

// Privacy-friendly page-view stats: no cookies, no IPs stored. A visitor is an anonymous hash of
// (IP + browser + day + secret salt) that can't be reversed and changes every day.
export interface DayStats {
  views: number;
  paths: Record<string, number>;
  langs: Record<string, number>;
  refs: Record<string, number>;
  visitors: string[];
}
interface StatsFile { salt: string; days: Record<string, DayStats> }

const KEEP_DAYS = 400;
const MAX_VISITORS_PER_DAY = 50000;
const TZ = "Asia/Amman";

const store = jsonFile<StatsFile>("stats.json", () => ({ salt: randomBytes(16).toString("hex"), days: {} }));

/** "2026-10-15" in Amman time. */
export function dayKey(d = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

// Views are buffered in memory and written in batches, so a busy page never waits on the disk.
type Hit = { path: string; lang: string; ref: string; who: string };
let buffer: Hit[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;

export function recordView(hit: { path: string; lang: string; ref: string; ip: string; ua: string }) {
  buffer.push({ path: hit.path, lang: hit.lang, ref: hit.ref, who: `${hit.ip}|${hit.ua}` });
  if (!timer) timer = setTimeout(() => { void flush(); }, 10_000);
}

export async function flush() {
  if (timer) { clearTimeout(timer); timer = null; }
  if (!buffer.length) return;
  const hits = buffer;
  buffer = [];
  await store.mutate((s) => {
    const day = dayKey();
    const d: DayStats = s.days[day] ?? { views: 0, paths: {}, langs: {}, refs: {}, visitors: [] };
    const seen = new Set(d.visitors);
    for (const h of hits) {
      d.views++;
      d.paths[h.path] = (d.paths[h.path] ?? 0) + 1;
      d.langs[h.lang] = (d.langs[h.lang] ?? 0) + 1;
      if (h.ref) d.refs[h.ref] = (d.refs[h.ref] ?? 0) + 1;
      const id = createHash("sha256").update(`${s.salt}|${day}|${h.who}`).digest("hex").slice(0, 16);
      if (!seen.has(id) && seen.size < MAX_VISITORS_PER_DAY) seen.add(id);
    }
    d.visitors = [...seen];
    const days = { ...s.days, [day]: d };
    // drop old days
    const keys = Object.keys(days).sort();
    for (const k of keys.slice(0, Math.max(0, keys.length - KEEP_DAYS))) delete days[k];
    return { next: { ...s, days }, result: null };
  }).catch((err) => console.error("[stats] flush failed:", err));
}

export async function getStats() {
  await flush(); // include anything still buffered
  return (await store.read()).days;
}
