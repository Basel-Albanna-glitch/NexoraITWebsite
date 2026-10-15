import type { Metadata } from "next";
import { href, type Locale } from "./i18n";

/** Canonical URL + hreflang links so Google pairs each English page with its Arabic version. */
export function alternates(lang: Locale, path: string): Metadata["alternates"] {
  return {
    canonical: href(lang, path),
    languages: { en: href("en", path), ar: href("ar", path), "x-default": href("en", path) },
  };
}
