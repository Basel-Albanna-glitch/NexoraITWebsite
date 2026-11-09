"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { getAdminDict } from "@/lib/admin-i18n";
import type { Locale } from "@/lib/i18n";
import { validateDraft, type DraftErrors, type ProjectDraft } from "@/lib/project-input";
import type { Project, ProjectImage, ProjectText, ProjectVideo } from "@/lib/work";
import { imageSize, uploadFile, videoPoster } from "./upload";

const EMPTY: ProjectDraft = {
  name: "", client: "", kind: "", services: [], headline: "", summary: "", points: [], videos: [], ar: {}, published: true,
};

type Pending = { id: number; name: string; progress: number };

export function ProjectForm({ lang, project, services }: {
  lang: Locale; project?: Project; services: { slug: string; title: string }[];
}) {
  const T = getAdminDict(lang);
  const t = T.form;
  const router = useRouter();
  const editing = Boolean(project);
  const [d, setD] = useState<ProjectDraft>(project ? { ...project, ar: project.ar ?? {} } : EMPTY);
  const [pointsText, setPointsText] = useState((project?.points ?? []).join("\n"));
  const [arPointsText, setArPointsText] = useState((project?.ar?.points ?? []).join("\n"));
  const [errors, setErrors] = useState<DraftErrors>({});
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploads, setUploads] = useState<Pending[]>([]);

  const set = <K extends keyof ProjectDraft>(k: K, v: ProjectDraft[K]) => setD((x) => ({ ...x, [k]: v }));
  const setAr = <K extends keyof ProjectText>(k: K, v: ProjectText[K]) => setD((x) => ({ ...x, ar: { ...x.ar, [k]: v } }));

  async function withUpload<R>(name: string, run: (progress: (f: number) => void) => Promise<R>) {
    const id = Date.now() + Math.random();
    setUploads((u) => [...u, { id, name, progress: 0 }]);
    const progress = (f: number) => setUploads((u) => u.map((x) => (x.id === id ? { ...x, progress: f } : x)));
    try {
      return await run(progress);
    } finally {
      setUploads((u) => u.filter((x) => x.id !== id));
    }
  }

  async function onImage(file: File | undefined) {
    if (!file) return;
    setStatus("");
    try {
      const size = await imageSize(file);
      const src = await withUpload(file.name, (p) => uploadFile(file, p));
      const image: ProjectImage = { src, ...size, alt: d.image?.alt || d.name };
      set("image", image);
    } catch (e) {
      setStatus((e as Error).message);
    }
  }

  async function onVideos(files: FileList | null) {
    for (const file of Array.from(files ?? [])) {
      setStatus("");
      try {
        const title = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
        const video: ProjectVideo = await withUpload(file.name, async (p) => {
          const posterBlob = await videoPoster(file);
          const src = await uploadFile(file, p);
          const poster = posterBlob ? await uploadFile(posterBlob) : undefined;
          return { src, title, ...(poster ? { poster } : {}) };
        });
        setD((x) => ({ ...x, videos: [...(x.videos ?? []), video] }));
      } catch (e) {
        setStatus((e as Error).message);
      }
    }
  }

  // Arabic video titles are kept in a parallel list (ar.videoTitles) — keep it aligned when videos move.
  const videos = d.videos ?? [];
  const arTitles = d.ar?.videoTitles ?? [];
  const updateVideo = (i: number, patch: Partial<ProjectVideo>) => set("videos", videos.map((v, j) => (j === i ? { ...v, ...patch } : v)));
  const updateArTitle = (i: number, v: string) => { const a = [...arTitles]; a[i] = v; setAr("videoTitles", a); };
  const moveVideo = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= videos.length) return;
    const v = [...videos]; [v[i], v[j]] = [v[j], v[i]];
    const a = [...arTitles]; [a[i], a[j]] = [a[j] ?? "", a[i] ?? ""];
    setD((x) => ({ ...x, videos: v, ar: { ...x.ar, videoTitles: a } }));
  };
  const removeVideo = (i: number) => setD((x) => ({
    ...x, videos: videos.filter((_, j) => j !== i), ar: { ...x.ar, videoTitles: arTitles.filter((_, j) => j !== i) },
  }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (uploads.length) { setStatus(t.waitUploads); return; }
    const lines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);
    const draft = { ...d, points: lines(pointsText), ar: { ...d.ar, points: lines(arPointsText) } };
    const check = validateDraft(draft, services.map((s) => s.slug));
    if (!check.ok) { setErrors(check.errors); setStatus(t.fix); return; }
    setErrors({});
    setSaving(true);
    setStatus("");
    const res = await fetch(editing ? `/api/admin/projects/${project!.slug}` : "/api/admin/projects", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(check.data),
    }).catch(() => null);
    const json = await res?.json().catch(() => ({}));
    setSaving(false);
    if (res?.ok) { router.push("/admin/projects"); router.refresh(); return; }
    if (json?.errors) setErrors(json.errors);
    setStatus(res?.status === 401 ? T.common.signedOut : json?.errors ? t.fix : T.common.error);
  }

  // Error text comes from the dashboard dictionary so it matches the dashboard language.
  const err = (k: keyof DraftErrors) => errors[k] && <em className="a-field__err">{t.errors[k as keyof typeof t.errors] ?? errors[k]}</em>;
  const ar = d.ar ?? {};

  return (
    <form className="a-form" onSubmit={onSubmit} noValidate>
      <section className="a-card">
        <h2>{t.basics}</h2>
        <div className="a-grid">
          <Bi label={`${t.name} *`}
              en={<input value={d.name} onChange={(e) => set("name", e.target.value)} placeholder={t.namePh} dir="ltr" />}
              ar={<input value={ar.name ?? ""} onChange={(e) => setAr("name", e.target.value)} dir="rtl" lang="ar" />}
              error={err("name")} />
          <Bi label={`${t.kind} *`}
              en={<input value={d.kind} onChange={(e) => set("kind", e.target.value)} placeholder={t.kindPh} dir="ltr" />}
              ar={<input value={ar.kind ?? ""} onChange={(e) => setAr("kind", e.target.value)} dir="rtl" lang="ar" />}
              error={err("kind")} />
          <Bi full label={`${t.client} (${T.common.optional})`}
              en={<input value={d.client ?? ""} onChange={(e) => set("client", e.target.value)} placeholder={t.clientPh} dir="ltr" />}
              ar={<input value={ar.client ?? ""} onChange={(e) => setAr("client", e.target.value)} dir="rtl" lang="ar" />} />
          <Bi full label={`${t.headline} *`}
              en={<input value={d.headline} onChange={(e) => set("headline", e.target.value)} placeholder={t.headlinePh} dir="ltr" />}
              ar={<input value={ar.headline ?? ""} onChange={(e) => setAr("headline", e.target.value)} dir="rtl" lang="ar" />}
              error={err("headline")} />
          <Bi full label={`${t.summary} *`}
              en={<textarea rows={4} value={d.summary} onChange={(e) => set("summary", e.target.value)} placeholder={t.summaryPh} dir="ltr" />}
              ar={<textarea rows={4} value={ar.summary ?? ""} onChange={(e) => setAr("summary", e.target.value)} dir="rtl" lang="ar" />}
              error={err("summary")} />
          <Bi full label={`${t.points} (${T.common.onePerLine})`}
              en={<textarea rows={5} value={pointsText} onChange={(e) => setPointsText(e.target.value)} placeholder={t.pointsPh} dir="ltr" />}
              ar={<textarea rows={5} value={arPointsText} onChange={(e) => setArPointsText(e.target.value)} dir="rtl" lang="ar" />} />
        </div>
        <p className="a-hint a-hint--after">{t.arabicHint}</p>
      </section>

      <section className="a-card">
        <h2>{t.services} *</h2>
        <p className="a-hint">{t.servicesHint}</p>
        <div className="a-checks">
          {services.map((s) => (
            <label key={s.slug} className="a-check">
              <input type="checkbox" checked={d.services.includes(s.slug)}
                     onChange={(e) => set("services", e.target.checked ? [...d.services, s.slug] : d.services.filter((x) => x !== s.slug))} />
              {s.title}
            </label>
          ))}
        </div>
        {err("services")}
      </section>

      <section className="a-card">
        <h2>{t.picture}</h2>
        <p className="a-hint">{t.pictureHint}</p>
        {d.image ? (
          <div className="a-media">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={d.image.src} alt="" className="a-media__img" />
            <div className="a-media__side">
              <Bi label={`${t.alt} (${t.altHint})`}
                  en={<input value={d.image.alt} onChange={(e) => set("image", { ...d.image!, alt: e.target.value })} dir="ltr" />}
                  ar={<input value={ar.imageAlt ?? ""} onChange={(e) => setAr("imageAlt", e.target.value)} dir="rtl" lang="ar" />} />
              <div className="a-inline">
                <label className="a-btn">{t.replace}<input type="file" accept="image/*" hidden onChange={(e) => onImage(e.target.files?.[0])} /></label>
                <button type="button" className="a-btn is-danger" onClick={() => set("image", undefined)}>{T.common.remove}</button>
              </div>
            </div>
          </div>
        ) : (
          <label className="a-drop">
            <input type="file" accept="image/*" hidden onChange={(e) => onImage(e.target.files?.[0])} />
            <strong>{t.choosePicture}</strong>
            <span>{t.noPicture}</span>
          </label>
        )}
        {err("image")}
      </section>

      <section className="a-card">
        <h2>{t.videos}</h2>
        <p className="a-hint">{t.videosHint}</p>
        {videos.length > 0 && (
          <ul className="a-videos">
            {videos.map((v, i) => (
              <li key={v.src}>
                <video src={v.src} poster={v.poster} controls preload="metadata" playsInline />
                <input value={v.title} onChange={(e) => updateVideo(i, { title: e.target.value })} aria-label={t.videoTitle} placeholder={t.videoTitle} dir="ltr" />
                <input value={arTitles[i] ?? ""} onChange={(e) => updateArTitle(i, e.target.value)} aria-label={t.videoTitleAr} placeholder={t.videoTitleAr} dir="rtl" lang="ar" />
                <div className="a-inline">
                  <button type="button" className="a-btn" onClick={() => moveVideo(i, -1)} disabled={i === 0} aria-label={T.common.moveUp}>{lang === "ar" ? "→" : "←"}</button>
                  <button type="button" className="a-btn" onClick={() => moveVideo(i, 1)} disabled={i === videos.length - 1} aria-label={T.common.moveDown}>{lang === "ar" ? "←" : "→"}</button>
                  <button type="button" className="a-btn is-danger" onClick={() => removeVideo(i)}>{T.common.remove}</button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <label className="a-drop">
          <input type="file" accept="video/mp4,video/webm,video/quicktime" multiple hidden
                 onChange={(e) => { onVideos(e.target.files); e.target.value = ""; }} />
          <strong>{t.addVideos}</strong>
          <span>{t.severalAtOnce}</span>
        </label>
        {err("videos")}
      </section>

      {uploads.length > 0 && (
        <ul className="a-uploads">
          {uploads.map((u) => (
            <li key={u.id}>
              <span>{t.uploading} {u.name}</span>
              <progress max={1} value={u.progress} />
              <span>{Math.round(u.progress * 100)}%</span>
            </li>
          ))}
        </ul>
      )}

      <div className="a-savebar">
        <label className="a-check">
          <input type="checkbox" checked={d.published} onChange={(e) => set("published", e.target.checked)} />
          {t.show}
        </label>
        <p className="a-error" role="status">{status}</p>
        <Link href="/admin/projects" className="a-btn">{T.common.cancel}</Link>
        <button type="submit" className="btn btn--primary" disabled={saving || uploads.length > 0}>
          {saving ? T.common.saving : editing ? T.common.save : t.addProject}
        </button>
      </div>
    </form>
  );
}

/** One field, English and Arabic side by side. */
function Bi({ label, en, ar, error, full }: { label: string; en: React.ReactNode; ar: React.ReactNode; error?: React.ReactNode; full?: boolean }) {
  return (
    <div className={`a-field a-bi${full ? " a-field--full" : ""}`}>
      <span>{label}</span>
      <div className="a-bi__pair">
        <label className="a-bi__col"><small>EN</small>{en}</label>
        <label className="a-bi__col"><small>ع</small>{ar}</label>
      </div>
      {error}
    </div>
  );
}
