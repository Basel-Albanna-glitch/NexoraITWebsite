"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getAdminDict } from "@/lib/admin-i18n";
import { href, type Locale } from "@/lib/i18n";
import type { Project } from "@/lib/work";

export function ProjectList({ lang, initial, serviceTitles }: { lang: Locale; initial: Project[]; serviceTitles: Record<string, string> }) {
  const t = getAdminDict(lang).projects;
  const router = useRouter();
  const [projects, setProjects] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const name = (p: Project) => (lang === "ar" && p.ar?.name) || p.name;
  const kind = (p: Project) => (lang === "ar" && p.ar?.kind) || p.kind;

  async function move(index: number, dir: -1 | 1) {
    const next = [...projects];
    const j = index + dir;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j], next[index]];
    const prev = projects;
    setProjects(next);
    const res = await fetch("/api/admin/projects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: next.map((p) => p.slug) }),
    }).catch(() => null);
    if (!res?.ok) { setProjects(prev); setError(t.orderError); }
  }

  async function togglePublished(p: Project) {
    setBusy(p.slug);
    const { slug, createdAt, updatedAt, ...rest } = p;
    void createdAt; void updatedAt;
    const res = await fetch(`/api/admin/projects/${slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...rest, published: !p.published }),
    }).catch(() => null);
    setBusy(null);
    if (res?.ok) setProjects((all) => all.map((x) => (x.slug === slug ? { ...x, published: !p.published } : x)));
    else setError(t.updateError);
  }

  async function remove(p: Project) {
    if (!confirm(t.confirmDelete(name(p)))) return;
    setBusy(p.slug);
    const res = await fetch(`/api/admin/projects/${p.slug}`, { method: "DELETE" }).catch(() => null);
    setBusy(null);
    if (res?.ok) { setProjects((all) => all.filter((x) => x.slug !== p.slug)); router.refresh(); }
    else setError(t.deleteError);
  }

  if (!projects.length) {
    return (
      <div className="admin-empty">
        <p>{t.empty}</p>
        <Link href="/admin/projects/new" className="btn btn--primary">{t.addFirst}</Link>
      </div>
    );
  }

  return (
    <>
      {error && <p className="a-error" role="alert">{error}</p>}
      <ol className="a-list">
        {projects.map((p, i) => (
          <li key={p.slug} className={`a-row${p.published ? "" : " is-draft"}`}>
            <div className="a-row__order">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="↑">↑</button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === projects.length - 1} aria-label="↓">↓</button>
            </div>
            <div className="a-row__thumb">
              {p.image
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={p.image.src} alt="" />
                : <span>{t.noImage}</span>}
            </div>
            <div className="a-row__main">
              <Link href={`/admin/projects/${p.slug}`} className="a-row__name">{name(p)}</Link>
              <p className="a-row__meta">
                {kind(p)}
                {" · "}{p.services.map((s) => serviceTitles[s] ?? s).join(lang === "ar" ? "، " : ", ")}
                {p.videos?.length ? ` · ${t.videos(p.videos.length)}` : ""}
              </p>
            </div>
            <span className={`a-badge${p.published ? " is-live" : ""}`}>{p.published ? t.live : t.hidden}</span>
            <div className="a-row__actions">
              <Link href={`/admin/projects/${p.slug}`}>{getAdminDict(lang).common.edit}</Link>
              <button type="button" onClick={() => togglePublished(p)} disabled={busy === p.slug}>
                {p.published ? t.hide : t.publish}
              </button>
              {p.published && <a href={`${href(lang, "/work")}#${p.slug}`} target="_blank" rel="noreferrer">{t.view} ↗</a>}
              <button type="button" className="is-danger" onClick={() => remove(p)} disabled={busy === p.slug}>{getAdminDict(lang).common.delete}</button>
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}
