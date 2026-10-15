// Validates project data sent from the dashboard. Used by the API (authoritative) and the form (early feedback).
import type { ProjectImage, ProjectText, ProjectVideo } from "./work";

export interface ProjectDraft {
  name: string;
  client?: string;
  kind: string;
  services: string[];
  headline: string;
  summary: string;
  points: string[];
  image?: ProjectImage;
  videos?: ProjectVideo[];
  ar?: ProjectText;
  published: boolean;
}

export type DraftErrors = Partial<Record<keyof ProjectDraft, string>>;

// fixed service slugs (their text is editable, the set is not)
export const SERVICE_SLUGS = ["websites", "erp", "pos", "mobile-apps"];
// only our own media paths, never arbitrary URLs
const MEDIA_RE = /^\/(media|work)\/[A-Za-z0-9._-]+$/;

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export function validateDraft(raw: unknown): { ok: true; data: ProjectDraft } | { ok: false; errors: DraftErrors } {
  const r = (raw ?? {}) as Record<string, unknown>;
  const errors: DraftErrors = {};

  const name = str(r.name, 80);
  const kind = str(r.kind, 60);
  const headline = str(r.headline, 140);
  const summary = str(r.summary, 1200);
  const client = str(r.client, 160) || undefined;
  const points = (Array.isArray(r.points) ? r.points : [])
    .map((p) => str(p, 120)).filter(Boolean).slice(0, 12);
  const services = (Array.isArray(r.services) ? r.services : [])
    .filter((s): s is string => typeof s === "string" && SERVICE_SLUGS.includes(s));

  if (name.length < 2) errors.name = "Give the project a name.";
  if (!kind) errors.kind = "Say what kind of project it is, e.g. “Clinic management system”.";
  if (!headline) errors.headline = "Add a one-line headline.";
  if (summary.length < 20) errors.summary = "Write at least a sentence or two about the project.";
  if (!services.length) errors.services = "Pick at least one service.";

  let image: ProjectImage | undefined;
  if (r.image) {
    const i = r.image as Record<string, unknown>;
    const src = str(i.src, 200), width = Number(i.width), height = Number(i.height);
    if (!MEDIA_RE.test(src) || !(width > 0) || !(height > 0)) errors.image = "The image upload is invalid — try uploading it again.";
    else image = { src, width: Math.round(width), height: Math.round(height), alt: str(i.alt, 200) || name };
  }

  const videos: ProjectVideo[] = [];
  for (const v of Array.isArray(r.videos) ? r.videos.slice(0, 6) : []) {
    const o = (v ?? {}) as Record<string, unknown>;
    const src = str(o.src, 200), poster = str(o.poster, 200);
    if (!MEDIA_RE.test(src) || (poster && !MEDIA_RE.test(poster))) { errors.videos = "A video upload is invalid — remove it and upload again."; break; }
    videos.push({ src, title: str(o.title, 80) || "Video", ...(poster ? { poster } : {}) });
  }

  // Arabic version: every field optional (falls back to English on the site)
  const a = (r.ar ?? {}) as Record<string, unknown>;
  const arLines = (v: unknown, n: number, max: number) => (Array.isArray(v) ? v : []).map((x) => str(x, max)).slice(0, n);
  const ar: ProjectText = {
    name: str(a.name, 80), kind: str(a.kind, 60), client: str(a.client, 160), headline: str(a.headline, 140),
    summary: str(a.summary, 1200), imageAlt: str(a.imageAlt, 200),
    points: arLines(a.points, 12, 120).filter(Boolean), videoTitles: arLines(a.videoTitles, 6, 80),
  };

  if (Object.keys(errors).length) return { ok: false, errors };
  return {
    ok: true,
    data: { name, client, kind, services, headline, summary, points, image, videos, ar, published: r.published !== false },
  };
}
