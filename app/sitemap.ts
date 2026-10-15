import type { MetadataRoute } from "next";
import { getContent } from "@/lib/content-store";
import { SITE_URL } from "@/lib/site-url";
import { href, LOCALES } from "@/lib/i18n";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { services } = await getContent();
  const paths = ["/", "/services", ...services.map((s) => `/services/${s.slug}`), "/work", "/about", "/contact", "/privacy"];
  return LOCALES.flatMap((lang) =>
    paths.map((p) => ({
      url: `${SITE_URL}${href(lang, p)}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: p === "/" ? 1 : p.startsWith("/services") ? 0.9 : 0.6,
      alternates: { languages: { en: `${SITE_URL}${href("en", p)}`, ar: `${SITE_URL}${href("ar", p)}` } },
    })),
  );
}
