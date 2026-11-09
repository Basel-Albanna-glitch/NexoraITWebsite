import "server-only";
import { promises as fs } from "fs";
import path from "path";
import type { Locale } from "./i18n";
import { del } from "@vercel/blob";
import { jsonFile } from "./json-file";
import { isBlobSrc, isUploadedSrc } from "./media";
import { localizeProject, type Project } from "./work";

const store = jsonFile<Project[]>("projects.json", () => []);

// Uploaded pictures & videos. Can be moved (e.g. to a mounted disk) with UPLOAD_DIR.
export const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(/*turbopackIgnore: true*/ process.cwd(), "storage", "uploads");

/* ---------- Reads ---------- */

/** Published projects, in dashboard order, in the requested language. */
export async function getProjects(lang: Locale = "en") {
  return (await store.read()).filter((p) => p.published).map((p) => localizeProject(p, lang));
}

/** Every project including hidden ones, untranslated (dashboard). */
export async function getAllProjects() {
  return store.read();
}

export async function getProject(slug: string) {
  return (await store.read()).find((p) => p.slug === slug);
}

export async function projectsFor(serviceSlug: string, lang: Locale) {
  return (await getProjects(lang)).filter((p) => p.services.includes(serviceSlug));
}

/* ---------- Dashboard writes ---------- */

export const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);

export type ProjectInput = Omit<Project, "slug" | "createdAt" | "updatedAt">;

export function createProject(input: ProjectInput) {
  return store.mutate((all) => {
    // Arabic-only names have no Latin letters to build a link from, so fall back to a short id.
    const base = slugify(input.name) || `project-${Date.now().toString(36)}`;
    let slug = base;
    for (let i = 2; all.some((p) => p.slug === slug); i++) slug = `${base}-${i}`;
    const now = new Date().toISOString();
    const project: Project = { ...input, slug, createdAt: now, updatedAt: now };
    return { next: [project, ...all], result: project }; // newest first
  });
}

export function updateProject(slug: string, input: ProjectInput) {
  return store.mutate((all) => {
    const i = all.findIndex((p) => p.slug === slug);
    if (i < 0) return { next: all, result: null };
    const project: Project = { ...all[i], ...input, slug, updatedAt: new Date().toISOString() };
    const next = [...all];
    next[i] = project;
    return { next, result: project };
  });
}

export function deleteProject(slug: string) {
  return store.mutate((all) => {
    const target = all.find((p) => p.slug === slug) ?? null;
    return { next: all.filter((p) => p.slug !== slug), result: target };
  });
}

export function reorderProjects(order: string[]) {
  return store.mutate((all) => {
    const rank = new Map(order.map((s, i) => [s, i]));
    const next = [...all].sort((a, b) => (rank.get(a.slug) ?? 1e9) - (rank.get(b.slug) ?? 1e9));
    return { next, result: next.map((p) => p.slug) };
  });
}

/** Removes uploaded files no project references any more (bundled /work files are never touched). */
export async function removeUnusedUploads(candidates: string[]) {
  const all = await store.read();
  const used = new Set(all.flatMap((p) => [p.image?.src, ...(p.videos ?? []).flatMap((v) => [v.src, v.poster])]));
  for (const src of candidates) {
    if (!src || !isUploadedSrc(src) || used.has(src)) continue;
    if (isBlobSrc(src)) {
      await del(src).catch((err) => console.error("[uploads] couldn't delete from Blob:", err));
    } else {
      const file = path.join(/*turbopackIgnore: true*/ UPLOAD_DIR, path.basename(src));
      await fs.unlink(file).catch(() => {});
    }
  }
}
