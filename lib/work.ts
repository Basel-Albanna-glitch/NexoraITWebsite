// Project types for the public site and the dashboard. Projects are managed at /admin
// and stored in data/projects.json — see lib/projects-store.ts.
import type { Locale } from "./i18n";

export interface ProjectImage { src: string; width: number; height: number; alt: string }
export interface ProjectVideo { src: string; poster?: string; title: string }

/** Arabic text for a project. Any empty field falls back to the English one. */
export interface ProjectText {
  name?: string; kind?: string; client?: string; headline?: string; summary?: string;
  points?: string[]; imageAlt?: string; videoTitles?: string[];
}

export interface Project {
  slug: string;
  name: string;
  client?: string;
  kind: string;
  /** service slugs this project relates to */
  services: string[];
  headline: string;
  summary: string;
  points: string[];
  image?: ProjectImage;
  videos?: ProjectVideo[];
  ar?: ProjectText;
  /** hidden from the public site while false */
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Uploaded files (local /media or Vercel Blob) — shown as-is; the bundled /work ones go through image optimisation. */
export { isUploadedSrc as isUploaded } from "./media";

/** The project as shown in a language: Arabic fields where filled in, English otherwise. */
export function localizeProject(p: Project, lang: Locale): Project {
  if (lang === "en" || !p.ar) return p;
  const a = p.ar;
  const pick = (v: string | undefined, fallback: string) => (v && v.trim() ? v : fallback);
  return {
    ...p,
    name: pick(a.name, p.name),
    kind: pick(a.kind, p.kind),
    client: p.client ? pick(a.client, p.client) : a.client,
    headline: pick(a.headline, p.headline),
    summary: pick(a.summary, p.summary),
    points: a.points?.length ? a.points : p.points,
    image: p.image && { ...p.image, alt: pick(a.imageAlt, p.image.alt) },
    videos: p.videos?.map((v, i) => ({ ...v, title: pick(a.videoTitles?.[i], v.title) })),
  };
}
