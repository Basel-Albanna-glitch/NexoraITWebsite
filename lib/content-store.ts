import "server-only";
import { cache } from "react";
import {
  CUSTOM_PAGE_SCHEMA, PAGE_SCHEMAS, RESERVED_SLUGS, SERVICE_SCHEMA, SHAPES, sanitize, uniqueSlug,
  type CustomPage, type CustomPageText, type PagesContent, type ServiceContent, type ServiceText, type Settings, type ShapeName, type SiteContent,
} from "./content";
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

/** Arabic falls back to English field by field, so a half-translated page never shows blanks. */
export function localizePage(p: CustomPage, lang: Locale) {
  const en = p.en, loc = p[lang];
  const pick = (k: "navLabel" | "label" | "title" | "intro") => loc[k] || en[k];
  return {
    slug: p.slug, shape: p.shape,
    navLabel: pick("navLabel") || pick("title") || p.slug, label: pick("label"), title: pick("title"), intro: pick("intro"),
    sections: loc.sections.length ? loc.sections : en.sections,
  };
}

/** Published custom pages, in dashboard order (these are the extra menu tabs). */
export async function getCustomPages(lang: Locale) {
  return ((await getContent()).customPages ?? []).filter((p) => p.published).map((p) => localizePage(p, lang));
}

export async function getCustomPage(slug: string, lang: Locale) {
  return (await getCustomPages(lang)).find((p) => p.slug === slug);
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

const name = (v: unknown, max = 60) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const shapeOf = (v: unknown, dflt: ShapeName): ShapeName => (SHAPES.includes(v as ShapeName) ? (v as ShapeName) : dflt);

export type NewItem = { en?: unknown; ar?: unknown; shape?: unknown };

/** Adds a page (hidden until published) and returns it. Null when the English name is missing. */
export function createCustomPage(raw: NewItem) {
  const en = name(raw.en, 40), ar = name(raw.ar, 40);
  if (!en) return Promise.resolve(null);
  return store.mutate((c) => {
    const pages = c.customPages ?? [];
    const slug = uniqueSlug(en, [...RESERVED_SLUGS, ...pages.map((p) => p.slug)], "page");
    const text = (label: string): CustomPageText => ({ navLabel: label, label: "", title: label, intro: "", sections: [] });
    const page: CustomPage = { slug, shape: shapeOf(raw.shape, "lattice"), published: false, en: text(en), ar: text(ar) };
    return { next: { ...c, customPages: [...pages, page] }, result: page };
  });
}

export function saveCustomPage(slug: string, raw: { en?: unknown; ar?: unknown }) {
  return store.mutate((c) => {
    const pages = [...(c.customPages ?? [])];
    const i = pages.findIndex((p) => p.slug === slug);
    if (i < 0) return { next: c, result: null };
    pages[i] = {
      ...pages[i],
      en: sanitize(raw.en, CUSTOM_PAGE_SCHEMA) as unknown as CustomPageText,
      ar: sanitize(raw.ar, CUSTOM_PAGE_SCHEMA) as unknown as CustomPageText,
    };
    return { next: { ...c, customPages: pages }, result: pages[i] };
  });
}

export function setCustomPagePublished(slug: string, published: boolean) {
  return store.mutate((c) => {
    const pages = c.customPages ?? [];
    if (!pages.some((p) => p.slug === slug)) return { next: c, result: false };
    return { next: { ...c, customPages: pages.map((p) => (p.slug === slug ? { ...p, published } : p)) }, result: true };
  });
}

export function deleteCustomPage(slug: string) {
  return store.mutate((c) => {
    const pages = c.customPages ?? [];
    if (!pages.some((p) => p.slug === slug)) return { next: c, result: false };
    return { next: { ...c, customPages: pages.filter((p) => p.slug !== slug) }, result: true };
  });
}

/** Adds a service with its name filled in; the rest is written in the editor. Null when the English name is missing. */
export function createService(raw: NewItem) {
  const en = name(raw.en), ar = name(raw.ar);
  if (!en) return Promise.resolve(null);
  return store.mutate((c) => {
    const slug = uniqueSlug(en, c.services.map((s) => s.slug), "service");
    const text = (title: string) => ({ ...(sanitize({}, SERVICE_SCHEMA) as unknown as ServiceText), title, headline: title });
    const service: ServiceContent = { slug, shape: shapeOf(raw.shape, "globe"), en: text(en), ar: text(ar) };
    return { next: { ...c, services: [...c.services, service] }, result: service };
  });
}

export function deleteService(slug: string) {
  return store.mutate((c) => {
    if (!c.services.some((s) => s.slug === slug)) return { next: c, result: false };
    return { next: { ...c, services: c.services.filter((s) => s.slug !== slug) }, result: true };
  });
}

/** Puts services or custom pages in the given slug order (unknown slugs ignored, missing ones kept at the end). */
export function reorderContent(kind: "services" | "pages", order: string[]) {
  return store.mutate((c) => {
    const rank = new Map(order.map((s, i) => [s, i]));
    const sort = <T extends { slug: string }>(xs: T[]) => [...xs].sort((a, b) => (rank.get(a.slug) ?? 1e9) - (rank.get(b.slug) ?? 1e9));
    const next = kind === "services" ? { ...c, services: sort(c.services) } : { ...c, customPages: sort(c.customPages ?? []) };
    const list = kind === "services" ? next.services : next.customPages!;
    return { next, result: list.map((x) => x.slug) };
  });
}

const URL_RE =/^https:\/\/[^\s]+$/;
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
