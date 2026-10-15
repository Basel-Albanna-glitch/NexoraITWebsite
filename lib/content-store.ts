import "server-only";
import { cache } from "react";
import { PAGE_SCHEMAS, SERVICE_SCHEMA, sanitize, type PagesContent, type ServiceText, type Settings, type SiteContent } from "./content";
import type { Locale } from "./i18n";
import { jsonFile } from "./json-file";

const store = jsonFile<SiteContent>("content.json", () => {
  throw new Error("data/content.json is missing");
});

/** One read per request, shared by every component that needs content. */
export const getContent = cache(() => store.read());

export async function getPage<K extends keyof PagesContent>(key: K, lang: Locale) {
  return (await getContent()).pages[key][lang] as PagesContent[K][Locale];
}

export async function getServices(lang: Locale) {
  return (await getContent()).services.map((s) => ({ slug: s.slug, shape: s.shape, ...s[lang] }));
}
export type LocalizedService = Awaited<ReturnType<typeof getServices>>[number];

export async function getService(slug: string, lang: Locale) {
  return (await getServices(lang)).find((s) => s.slug === slug);
}

export async function getSettings() {
  return (await getContent()).settings;
}

/* ---------- Dashboard writes ---------- */

export function savePage(key: keyof PagesContent, raw: { en?: unknown; ar?: unknown }) {
  const fields = PAGE_SCHEMAS[key].fields;
  return store.mutate((c) => {
    const page = { en: sanitize(raw.en, fields), ar: sanitize(raw.ar, fields) } as unknown as PagesContent[typeof key];
    return { next: { ...c, pages: { ...c.pages, [key]: page } }, result: page };
  });
}

export function saveService(slug: string, raw: { en?: unknown; ar?: unknown }) {
  return store.mutate((c) => {
    const i = c.services.findIndex((s) => s.slug === slug);
    if (i < 0) return { next: c, result: null };
    const services = [...c.services];
    services[i] = {
      ...services[i],
      en: sanitize(raw.en, SERVICE_SCHEMA) as unknown as ServiceText,
      ar: sanitize(raw.ar, SERVICE_SCHEMA) as unknown as ServiceText,
    };
    return { next: { ...c, services }, result: services[i] };
  });
}

const URL_RE = /^https:\/\/[^\s]+$/;
export function saveSettings(raw: Partial<Settings>) {
  const s = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const url = (v: unknown) => { const x = s(v, 300); return URL_RE.test(x) ? x : ""; };
  const settings: Settings = {
    email: s(raw.email),
    phone: s(raw.phone, 40),
    whatsapp: s(raw.whatsapp, 20).replace(/\D/g, ""),
    location: { en: s(raw.location?.en), ar: s(raw.location?.ar) },
    hours: { en: s(raw.hours?.en), ar: s(raw.hours?.ar) },
    social: { instagram: url(raw.social?.instagram), facebook: url(raw.social?.facebook), linkedin: url(raw.social?.linkedin), x: url(raw.social?.x) },
  };
  return store.mutate((c) => ({ next: { ...c, settings }, result: settings }));
}
