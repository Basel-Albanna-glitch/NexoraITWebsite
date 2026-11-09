"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { getAdminDict } from "@/lib/admin-i18n";
import { SHAPES, type ShapeName } from "@/lib/content";
import { href, type Locale } from "@/lib/i18n";

type Item = { slug: string; name: string; published?: boolean };
type Kind = "page" | "service";

/** Dashboard-managed lists: custom pages (menu tabs) or services — add, reorder, show/hide, delete. */
export function ContentList({ lang, kind, initial }: { lang: Locale; kind: Kind; initial: Item[] }) {
  const T = getAdminDict(lang);
  const t = T.content;
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);

  const keyOf = (slug: string) => `${kind}-${slug}`;
  const publicPath = (slug: string) => (kind === "page" ? `/${slug}` : `/services/${slug}`);

  async function call(url: string, method: string, body?: unknown) {
    setError("");
    const res = await fetch(url, {
      method, headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined,
    }).catch(() => null);
    if (res?.status === 401) setError(T.common.signedOut);
    return res;
  }

  async function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const prev = items, next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    setItems(next);
    const res = await call("/api/admin/content", "PATCH", { kind: kind === "page" ? "pages" : "services", order: next.map((x) => x.slug) });
    if (!res?.ok) { setItems(prev); if (res?.status !== 401) setError(t.actionError); }
  }

  async function toggle(it: Item) {
    setBusy(it.slug);
    const res = await call("/api/admin/content", "PATCH", { kind: "page", slug: it.slug, published: !it.published });
    setBusy(null);
    if (res?.ok) setItems((xs) => xs.map((x) => (x.slug === it.slug ? { ...x, published: !it.published } : x)));
    else if (res?.status !== 401) setError(t.actionError);
  }

  async function remove(it: Item) {
    if (!confirm(kind === "page" ? t.confirmDeletePage(it.name) : t.confirmDeleteService(it.name))) return;
    setBusy(it.slug);
    const res = await call(`/api/admin/content/${keyOf(it.slug)}`, "DELETE");
    setBusy(null);
    if (res?.ok) { setItems((xs) => xs.filter((x) => x.slug !== it.slug)); router.refresh(); return; }
    if (res?.status === 409) {
      const { projects } = await res.json().catch(() => ({ projects: [] }));
      setError(t.serviceInUse((projects as string[]).join(lang === "ar" ? "، " : ", ")));
    } else if (res?.status !== 401) setError(t.actionError);
  }

  return (
    <>
      {error && <p className="a-error" role="alert">{error}</p>}
      {items.length === 0 && kind === "page" && <p className="admin-sub">{t.noPages}</p>}
      {items.length > 0 && (
        <ol className="a-list ce-list">
          {items.map((it, i) => (
            <li key={it.slug} className={`a-row ce-row${kind === "page" && !it.published ? " is-draft" : ""}`}>
              <div className="a-row__order">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={T.common.moveUp}>↑</button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label={T.common.moveDown}>↓</button>
              </div>
              <div className="a-row__main">
                <Link href={`/admin/content/${keyOf(it.slug)}`} className="a-row__name">{it.name}</Link>
                <p className="a-row__meta" dir="ltr">{publicPath(it.slug)}</p>
              </div>
              {kind === "page"
                ? <span className={`a-badge${it.published ? " is-live" : ""}`}>{it.published ? t.live : t.hidden}</span>
                : <span />}
              <div className="a-row__actions">
                <Link href={`/admin/content/${keyOf(it.slug)}`}>{T.common.edit}</Link>
                {kind === "page" && (
                  <button type="button" onClick={() => toggle(it)} disabled={busy === it.slug}>{it.published ? t.hide : t.publish}</button>
                )}
                {(kind === "service" || it.published) && (
                  <a href={href(lang, publicPath(it.slug))} target="_blank" rel="noreferrer">{t.view} ↗</a>
                )}
                <button type="button" className="is-danger" onClick={() => remove(it)} disabled={busy === it.slug}>{T.common.delete}</button>
              </div>
            </li>
          ))}
        </ol>
      )}
      {adding
        ? <AddForm lang={lang} kind={kind} onCancel={() => setAdding(false)}
                   onCreated={(key) => router.push(`/admin/content/${key}`)} />
        : <button type="button" className="a-btn ce-add" onClick={() => setAdding(true)}>{kind === "page" ? t.addPage : t.addService}</button>}
    </>
  );
}

function AddForm({ lang, kind, onCancel, onCreated }: { lang: Locale; kind: Kind; onCancel: () => void; onCreated: (key: string) => void }) {
  const T = getAdminDict(lang);
  const t = T.content;
  const [en, setEn] = useState("");
  const [ar, setAr] = useState("");
  const [shape, setShape] = useState<ShapeName>(kind === "page" ? "lattice" : "globe");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!en.trim()) { setError(t.nameRequired); return; }
    setSaving(true);
    setError("");
    const res = await fetch("/api/admin/content", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind, en, ar, shape }),
    }).catch(() => null);
    if (res?.ok) { onCreated((await res.json()).key); return; }
    setSaving(false);
    setError(res?.status === 401 ? T.common.signedOut : res?.status === 422 ? t.nameRequired : t.actionError);
  }

  return (
    <form className="a-card ce-addform" onSubmit={submit}>
      <div className="ce__cols">
        <label className="a-field">
          <span>{t.nameEn}</span>
          <input value={en} onChange={(e) => setEn(e.target.value)} maxLength={kind === "page" ? 40 : 60} dir="ltr" lang="en" autoFocus />
        </label>
        <label className="a-field">
          <span>{t.nameAr}</span>
          <input value={ar} onChange={(e) => setAr(e.target.value)} maxLength={kind === "page" ? 40 : 60} dir="rtl" lang="ar" />
        </label>
      </div>
      <label className="a-field">
        <span>{t.shape}</span>
        <select className="ce__input" value={shape} onChange={(e) => setShape(e.target.value as ShapeName)}>
          {SHAPES.map((s) => <option key={s} value={s}>{t.shapes[s]}</option>)}
        </select>
      </label>
      {kind === "page" && <p className="admin-sub">{t.newPageNote}</p>}
      {error && <p className="a-error" role="alert">{error}</p>}
      <div className="a-inline">
        <button type="submit" className="btn btn--primary" disabled={saving}>{saving ? t.creating : t.create}</button>
        <button type="button" className="a-btn" onClick={onCancel} disabled={saving}>{T.common.cancel}</button>
      </div>
    </form>
  );
}
