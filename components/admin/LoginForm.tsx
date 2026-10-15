"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { getAdminDict } from "@/lib/admin-i18n";
import type { Locale } from "@/lib/i18n";

export function LoginForm({ lang }: { lang: Locale }) {
  const t = getAdminDict(lang).login;
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const password = new FormData(e.currentTarget).get("password");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    }).catch(() => null);
    if (res?.ok) {
      router.replace("/admin");
      router.refresh();
      return;
    }
    setError(!res ? t.noConn : res.status === 429 ? t.tooMany : t.wrong);
    setBusy(false);
  }

  return (
    <form onSubmit={onSubmit} className="admin-form">
      <label className="a-field">
        <span>{t.password}</span>
        <input type="password" name="password" autoComplete="current-password" required autoFocus dir="ltr" />
      </label>
      {error && <p className="a-error" role="alert">{error}</p>}
      <button type="submit" className="btn btn--primary" disabled={busy}>{busy ? t.signingIn : t.signIn}</button>
    </form>
  );
}
