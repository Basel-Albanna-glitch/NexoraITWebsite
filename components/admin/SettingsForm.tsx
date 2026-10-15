"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getAdminDict } from "@/lib/admin-i18n";
import type { Settings } from "@/lib/content";
import type { Locale } from "@/lib/i18n";

export function SettingsForm({ lang, initial }: { lang: Locale; initial: Settings }) {
  const T = getAdminDict(lang);
  const t = T.settings;
  const router = useRouter();
  const [s, setS] = useState(initial);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

  const change = (next: Settings) => { setS(next); setDirty(true); setStatus(null); };

  async function save() {
    setSaving(true);
    const res = await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(s) }).catch(() => null);
    setSaving(false);
    if (res?.ok) { setS(await res.json()); setDirty(false); setStatus({ ok: true, text: T.common.saved }); router.refresh(); return; }
    const json = await res?.json().catch(() => ({}));
    setStatus({ ok: false, text: json?.errors?.email ? t.invalidEmail : res?.status === 401 ? T.common.signedOut : T.common.error });
  }

  const social = (["instagram", "facebook", "linkedin", "x"] as const);
  const socialLabel = { instagram: "Instagram", facebook: "Facebook", linkedin: "LinkedIn", x: "X (Twitter)" };

  return (
    <div className="a-form">
      <section className="a-card">
        <h2>{t.contact}</h2>
        <div className="a-grid">
          <label className="a-field">
            <span>{t.email}</span>
            <input type="email" dir="ltr" value={s.email} onChange={(e) => change({ ...s, email: e.target.value })} />
          </label>
          <label className="a-field">
            <span>{t.phone} <small>({t.phoneHint})</small></span>
            <input type="tel" dir="ltr" value={s.phone} onChange={(e) => change({ ...s, phone: e.target.value })} />
          </label>
          <label className="a-field a-field--full">
            <span>{t.whatsapp} <small>({t.whatsappHint})</small></span>
            <input inputMode="numeric" dir="ltr" value={s.whatsapp} onChange={(e) => change({ ...s, whatsapp: e.target.value })} />
          </label>
          {(["location", "hours"] as const).map((k) => (
            <div key={k} className="a-field a-field--full a-bi">
              <span>{t[k]}</span>
              <div className="a-bi__pair">
                <label className="a-bi__col"><small>EN</small>
                  <input dir="ltr" value={s[k].en} onChange={(e) => change({ ...s, [k]: { ...s[k], en: e.target.value } })} />
                </label>
                <label className="a-bi__col"><small>ع</small>
                  <input dir="rtl" lang="ar" value={s[k].ar} onChange={(e) => change({ ...s, [k]: { ...s[k], ar: e.target.value } })} />
                </label>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="a-card">
        <h2>{t.social}</h2>
        <p className="a-hint">{t.socialHint}</p>
        <div className="a-grid">
          {social.map((k) => (
            <label key={k} className="a-field">
              <span>{socialLabel[k]}</span>
              <input type="url" dir="ltr" placeholder="https://" value={s.social[k]} onChange={(e) => change({ ...s, social: { ...s.social, [k]: e.target.value } })} />
            </label>
          ))}
        </div>
      </section>

      <div className="a-savebar">
        <p className={status?.ok ? "a-ok" : "a-error"} role="status">{status?.text ?? (dirty ? T.content.unsaved : "")}</p>
        <button type="button" className="btn btn--primary" onClick={save} disabled={saving || !dirty}>{saving ? T.common.saving : T.common.save}</button>
      </div>
    </div>
  );
}
