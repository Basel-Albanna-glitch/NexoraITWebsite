// Editable site content (data/content.json): types + a schema that drives both the dashboard
// editor and server-side validation. Shared by server and client code — no Node imports here.
import type { Locale } from "./i18n";

export type ShapeName = "brain" | "globe" | "wave" | "lattice" | "torus" | "phone";
export interface Pair { title: string; text: string }
export type Localized<T> = Record<Locale, T>;

export interface ServiceText {
  title: string; summary: string; headline: string; intro: string; highlights: string[];
  features: Pair[]; audience: { headline: string; text: string; tags: string[] }; process: Pair[]; faqs: Pair[];
}
export interface ServiceContent { slug: string; shape: ShapeName; en: ServiceText; ar: ServiceText }

type Hero = { label: string; title: string; body: string };
export interface PagesContent {
  home: Localized<{
    hero: Hero;
    manifesto: { title: string; label: string; body: string; body2: string };
    services: { label: string; title: string; titleDim: string };
    work: { label: string };
    approach: { label: string; title: string; steps: Pair[] };
    industries: { title: string; label: string; body: string; tags: string[] };
    contact: { label: string; title: string };
  }>;
  servicesPage: Localized<{ hero: Hero; together: { title: string; label: string; body: string } }>;
  work: Localized<{ hero: Hero; ctaLabel: string }>;
  about: Localized<{
    hero: Hero;
    story: { title: string; label: string; body: string; body2: string };
    values: { label: string; title: string; titleDim: string; items: Pair[] };
    promises: { label: string; title: string; items: Pair[] };
    cta: { label: string; title: string };
  }>;
  contact: Localized<{ label: string; title: string; nextTitle: string; steps: Pair[] }>;
  cta: Localized<{ label: string; title: string; text: string }>;
}

export interface Settings {
  email: string; phone: string; whatsapp: string;
  location: Localized<string>; hours: Localized<string>;
  social: { instagram: string; facebook: string; linkedin: string; x: string };
}

/** A page the owner adds from the dashboard. Published pages appear as a tab in the site menu at /<slug>. */
export interface CustomPageText { navLabel: string; label: string; title: string; intro: string; sections: Pair[] }
export interface CustomPage { slug: string; shape: ShapeName; published: boolean; en: CustomPageText; ar: CustomPageText }

export interface SiteContent { settings: Settings; pages: PagesContent; services: ServiceContent[]; customPages?: CustomPage[] }

export const SHAPES: ShapeName[] = ["brain", "globe", "wave", "lattice", "torus", "phone"];

/** Addresses already used by the site, so a new page can't take them over. */
export const RESERVED_SLUGS = ["services", "work", "about", "contact", "privacy", "admin", "api", "media", "en", "ar", "_next"];

/** Latin-only URL slug: "Our Pricing!" → "our-pricing". Empty for names without Latin letters/digits. */
export const toSlug = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);

/** First free slug based on `name` (falls back to `fallback-<id>` for Arabic-only names). */
export function uniqueSlug(name: string, taken: string[], fallback: string) {
  const base = toSlug(name) || `${fallback}-${Date.now().toString(36)}`;
  let slug = base;
  for (let i = 2; taken.includes(slug); i++) slug = `${base}-${i}`;
  return slug;
}

/* ---------- Schema ---------- */

type L = { en: string; ar: string };
export type Field =
  | { key: string; label: L; type: "text"; max?: number }
  | { key: string; label: L; type: "textarea"; max?: number }
  | { key: string; label: L; type: "lines"; max?: number }       // string[] — one per line
  | { key: string; label: L; type: "pairs"; max?: number }       // Pair[] — title + text rows
  | { key: string; label: L; type: "group"; fields: Field[] };

const t = (key: string, en: string, ar: string, max = 200): Field => ({ key, label: { en, ar }, type: "text", max });
const ta = (key: string, en: string, ar: string, max = 1500): Field => ({ key, label: { en, ar }, type: "textarea", max });
const lines = (key: string, en: string, ar: string, max = 20): Field => ({ key, label: { en, ar }, type: "lines", max });
const pairs = (key: string, en: string, ar: string, max = 12): Field => ({ key, label: { en, ar }, type: "pairs", max });
const group = (key: string, en: string, ar: string, fields: Field[]): Field => ({ key, label: { en, ar }, type: "group", fields });
const hero = group("hero", "Top of page", "أعلى الصفحة", [
  t("label", "Small label", "العنوان الصغير"), t("title", "Big headline", "العنوان الرئيسي"), ta("body", "Intro text", "النص التعريفي"),
]);

export const PAGE_SCHEMAS: Record<keyof PagesContent, { label: L; fields: Field[] }> = {
  home: {
    label: { en: "Home page", ar: "الصفحة الرئيسية" },
    fields: [
      hero,
      group("manifesto", "Why NexoraIT", "لماذا NexoraIT", [t("title", "Headline", "العنوان"), t("label", "Small label", "العنوان الصغير"), ta("body", "Paragraph 1", "الفقرة 1"), ta("body2", "Paragraph 2", "الفقرة 2")]),
      group("services", "Services heading", "عنوان الخدمات", [t("label", "Small label", "العنوان الصغير"), t("title", "Headline", "العنوان"), t("titleDim", "Headline (grey part)", "العنوان (الجزء الرمادي)")]),
      group("work", "Projects strip", "شريط المشاريع", [t("label", "Small label", "العنوان الصغير")]),
      group("approach", "Our approach", "منهجيتنا", [t("label", "Small label", "العنوان الصغير"), t("title", "Headline", "العنوان"), pairs("steps", "Steps", "الخطوات", 6)]),
      group("industries", "Industries", "القطاعات", [t("title", "Headline", "العنوان"), t("label", "Small label", "العنوان الصغير"), ta("body", "Text", "النص"), lines("tags", "Industries (one per line)", "القطاعات (واحد في كل سطر)")]),
      group("contact", "Contact section", "قسم التواصل", [t("label", "Small label", "العنوان الصغير"), t("title", "Headline", "العنوان")]),
    ],
  },
  servicesPage: {
    label: { en: "Services page", ar: "صفحة الخدمات" },
    fields: [hero, group("together", "Better together", "أفضل معًا", [t("title", "Headline", "العنوان"), t("label", "Small label", "العنوان الصغير"), ta("body", "Text", "النص")])],
  },
  work: {
    label: { en: "Work page", ar: "صفحة الأعمال" },
    fields: [hero, t("ctaLabel", "Label above the closing call-to-action", "عنوان دعوة الختام")],
  },
  about: {
    label: { en: "About page", ar: "صفحة من نحن" },
    fields: [
      hero,
      group("story", "Our story", "قصتنا", [t("title", "Headline", "العنوان"), t("label", "Small label", "العنوان الصغير"), ta("body", "Paragraph 1", "الفقرة 1"), ta("body2", "Paragraph 2", "الفقرة 2")]),
      group("values", "Principles", "المبادئ", [t("label", "Small label", "العنوان الصغير"), t("title", "Headline", "العنوان"), t("titleDim", "Headline (grey part)", "العنوان (الجزء الرمادي)"), pairs("items", "Principles", "المبادئ", 8)]),
      group("promises", "What you can count on", "ما يمكنك الاعتماد عليه", [t("label", "Small label", "العنوان الصغير"), t("title", "Headline", "العنوان"), pairs("items", "Points", "النقاط", 8)]),
      group("cta", "Closing call-to-action", "دعوة الختام", [t("label", "Small label", "العنوان الصغير"), t("title", "Headline", "العنوان")]),
    ],
  },
  contact: {
    label: { en: "Contact page", ar: "صفحة التواصل" },
    fields: [t("label", "Small label", "العنوان الصغير"), t("title", "Headline", "العنوان"), t("nextTitle", "“What happens next” headline", "عنوان «ماذا يحدث بعد ذلك»"), pairs("steps", "Steps", "الخطوات", 6)],
  },
  cta: {
    label: { en: "Call-to-action (all pages)", ar: "دعوة التواصل (كل الصفحات)" },
    fields: [t("label", "Small label", "العنوان الصغير"), t("title", "Headline", "العنوان"), ta("text", "Text", "النص", 400)],
  },
};

export const SERVICE_SCHEMA: Field[] = [
  t("title", "Service name", "اسم الخدمة", 60),
  ta("summary", "Short summary (lists & Google)", "ملخص قصير (القوائم وGoogle)", 300),
  t("headline", "Page headline", "عنوان الصفحة"),
  ta("intro", "Intro paragraph", "الفقرة التعريفية"),
  lines("highlights", "Highlights (one per line)", "أبرز النقاط (واحدة في كل سطر)", 8),
  pairs("features", "What's included", "ماذا يشمل", 12),
  group("audience", "Who it's for", "لمن هذه الخدمة", [t("headline", "Headline", "العنوان"), ta("text", "Text", "النص"), lines("tags", "Tags (one per line)", "الوسوم (واحد في كل سطر)", 12)]),
  pairs("process", "How we deliver", "كيف ننفّذ", 6),
  pairs("faqs", "Questions & answers", "الأسئلة والأجوبة", 12),
];

export const CUSTOM_PAGE_SCHEMA: Field[] = [
  t("navLabel", "Tab name in the menu", "اسم التبويب في القائمة", 40),
  t("label", "Small label", "العنوان الصغير"),
  t("title", "Big headline", "العنوان الرئيسي"),
  ta("intro", "Intro text", "النص التعريفي"),
  pairs("sections", "Sections (heading + text)", "الأقسام (عنوان + نص)", 12),
];

/** Coerces untrusted input into exactly the shape the schema describes (unknown keys dropped, strings capped). */
export function sanitize(value: unknown, fields: Field[]): Record<string, unknown> {
  const src = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  for (const f of fields) {
    const v = src[f.key];
    switch (f.type) {
      case "text": out[f.key] = str(v, f.max ?? 200); break;
      case "textarea": out[f.key] = str(v, f.max ?? 1500); break;
      case "lines": out[f.key] = (Array.isArray(v) ? v : []).map((x) => str(x, 200)).filter(Boolean).slice(0, f.max ?? 20); break;
      case "pairs": out[f.key] = (Array.isArray(v) ? v : [])
        .map((x) => ({ title: str((x as Pair)?.title, 200), text: str((x as Pair)?.text, 1000) }))
        .filter((p) => p.title || p.text).slice(0, f.max ?? 12); break;
      case "group": out[f.key] = sanitize(v, f.fields); break;
    }
  }
  return out;
}
