"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAdminDict } from "@/lib/admin-i18n";
import type { Field, Pair } from "@/lib/content";
import type { Locale } from "@/lib/i18n";

type Obj = Record<string, unknown>;
type Both = { en: Obj; ar: Obj };

/** Schema-driven editor: every field shows its English and Arabic version side by side. */
export function ContentEditor({ lang, fields, initial, endpoint, viewHref }: {
  lang: Locale; fields: Field[]; initial: Both; endpoint: string; viewHref?: { en: string; ar: string };
}) {
  const T = getAdminDict(lang);
  const router = useRouter();
  const [value, setValue] = useState<Both>(initial);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

  // Warn before leaving with unsaved edits.
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  const update = (loc: Locale, path: string[], v: unknown) => {
    setValue((cur) => ({ ...cur, [loc]: setIn(cur[loc], path, v) }));
    setDirty(true);
    setStatus(null);
  };

  async function save() {
    setSaving(true);
    const res = await fetch(endpoint, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(value) }).catch(() => null);
    setSaving(false);
    if (res?.ok) {
      setValue(await res.json());
      setDirty(false);
      setStatus({ ok: true, text: T.common.saved });
      router.refresh();
    } else {
      setStatus({ ok: false, text: res?.status === 401 ? T.common.signedOut : T.common.error });
    }
  }

  return (
    <div className="ce">
      <FieldList fields={fields} path={[]} value={value} update={update} lang={lang} />
      <div className="a-savebar">
        {viewHref && (
          <span className="ce__view">
            <a href={viewHref.en} target="_blank" rel="noreferrer">{T.nav.viewSite} (EN) ↗</a>
            <a href={viewHref.ar} target="_blank" rel="noreferrer">{T.nav.viewSite} (ع) ↗</a>
          </span>
        )}
        <p className={status?.ok ? "a-ok" : "a-error"} role="status">{status?.text ?? (dirty ? getAdminDict(lang).content.unsaved : "")}</p>
        <button type="button" className="btn btn--primary" onClick={save} disabled={saving || !dirty}>
          {saving ? T.common.saving : T.common.save}
        </button>
      </div>
    </div>
  );
}

function getIn(o: unknown, path: string[]): unknown {
  return path.reduce<unknown>((x, k) => (x && typeof x === "object" ? (x as Obj)[k] : undefined), o);
}
function setIn(o: Obj, path: string[], v: unknown): Obj {
  const [k, ...rest] = path;
  return { ...o, [k]: rest.length ? setIn(((o?.[k] as Obj) ?? {}), rest, v) : v };
}

type Update = (loc: Locale, path: string[], v: unknown) => void;

function FieldList({ fields, path, value, update, lang }: { fields: Field[]; path: string[]; value: Both; update: Update; lang: Locale }) {
  return (
    <>
      {fields.map((f) => {
        const p = [...path, f.key];
        if (f.type === "group") {
          return (
            <section key={f.key} className="a-card ce__group">
              <h2>{f.label[lang]}</h2>
              <FieldList fields={f.fields} path={p} value={value} update={update} lang={lang} />
            </section>
          );
        }
        const leaf = (
          <div key={f.key} className="ce__field">
            <span className="ce__label">{f.label[lang]}</span>
            <div className="ce__cols">
              {(["en", "ar"] as const).map((loc) => (
                <div key={loc} className="ce__col" dir={loc === "ar" ? "rtl" : "ltr"} lang={loc}>
                  <small className="ce__loc">{loc === "en" ? "EN" : "ع"}</small>
                  <Input field={f} value={getIn(value[loc], p)} onChange={(v) => update(loc, p, v)} lang={lang} />
                </div>
              ))}
            </div>
          </div>
        );
        // top-level leaves get their own card; nested ones sit inside their group's card
        return path.length ? leaf : <section key={f.key} className="a-card">{leaf}</section>;
      })}
    </>
  );
}

function Input({ field: f, value, onChange, lang }: { field: Field; value: unknown; onChange: (v: unknown) => void; lang: Locale }) {
  const T = getAdminDict(lang).common;
  switch (f.type) {
    case "text":
      return <input className="ce__input" value={(value as string) ?? ""} maxLength={f.max} onChange={(e) => onChange(e.target.value)} />;
    case "textarea":
      return <textarea className="ce__input" rows={4} value={(value as string) ?? ""} maxLength={f.max} onChange={(e) => onChange(e.target.value)} />;
    case "lines":
      return <LinesInput value={(value as string[]) ?? []} onChange={onChange} />;
    case "pairs": {
      const rows = (value as Pair[]) ?? [];
      const set = (next: Pair[]) => onChange(next);
      return (
        <div className="ce__pairs">
          {rows.map((r, i) => (
            <div key={i} className="ce__pair">
              <input className="ce__input ce__input--title" value={r.title} onChange={(e) => set(rows.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} />
              <textarea className="ce__input" rows={2} value={r.text} onChange={(e) => set(rows.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)))} />
              <div className="ce__pair-tools">
                <button type="button" onClick={() => { const n = [...rows]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; set(n); }} disabled={i === 0} aria-label={T.moveUp}>↑</button>
                <button type="button" onClick={() => { const n = [...rows]; [n[i + 1], n[i]] = [n[i], n[i + 1]]; set(n); }} disabled={i === rows.length - 1} aria-label={T.moveDown}>↓</button>
                <button type="button" className="is-danger" onClick={() => set(rows.filter((_, j) => j !== i))}>{T.remove}</button>
              </div>
            </div>
          ))}
          {rows.length < (f.max ?? 12) && (
            <button type="button" className="a-btn a-btn--sm" onClick={() => set([...rows, { title: "", text: "" }])}>{T.addRow}</button>
          )}
        </div>
      );
    }
    default:
      return null;
  }
}

/** One item per line; keeps the raw text while typing so empty lines don't vanish mid-edit. */
function LinesInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [text, setText] = useState(value.join("\n"));
  return (
    <textarea className="ce__input" rows={Math.max(3, value.length + 1)} value={text}
              onChange={(e) => { setText(e.target.value); onChange(e.target.value.split("\n").map((s) => s.trim()).filter(Boolean)); }} />
  );
}
