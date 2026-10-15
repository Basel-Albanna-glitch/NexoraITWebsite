"use client";

import { useState, type FormEvent } from "react";
import { SERVICES, validateContact, type FieldErrors } from "@/lib/contact";
import type { Dictionary, Locale } from "@/lib/i18n";

type Status = { kind: "idle" | "sending" | "sent" | "error"; message?: string };
type Errors = Partial<Record<keyof FieldErrors, boolean>>;

export function ContactForm({ lang, t }: { lang: Locale; t: Dictionary["form"] }) {
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  // Field errors are shown from the dictionary, so they're always in the page's language.
  const flag = (e: FieldErrors) => Object.fromEntries(Object.keys(e).map((k) => [k, true])) as Errors;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const payload = { ...Object.fromEntries(new FormData(form)), lang };

    const check = validateContact(payload);
    if (!check.ok) {
      setErrors(flag(check.errors));
      setStatus({ kind: "error", message: t.errors.check });
      return;
    }
    setErrors({});
    setStatus({ kind: "sending" });

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.ok) {
        form.reset();
        setStatus({ kind: "sent", message: t.sent });
      } else if (json.errors) {
        setErrors(flag(json.errors));
        setStatus({ kind: "error", message: t.errors.check });
      } else {
        setStatus({ kind: "error", message: json.error === "rate" ? t.errors.rate : t.errors.server });
      }
    } catch {
      setStatus({ kind: "error", message: t.errors.network });
    }
  }

  const fieldClass = (k: keyof Errors, full = false) =>
    `field${full ? " field--full" : ""}${errors[k] ? " is-invalid" : ""}`;

  return (
    <form className="form reveal" onSubmit={onSubmit} noValidate>
      <label className={fieldClass("name")}>
        <span>{t.name}</span>
        <input type="text" name="name" autoComplete="name" required />
        {errors.name && <em>{t.errors.name}</em>}
      </label>
      <label className={fieldClass("email")}>
        <span>{t.email}</span>
        <input type="email" name="email" autoComplete="email" dir="ltr" required />
        {errors.email && <em>{t.errors.email}</em>}
      </label>
      <label className={fieldClass("company")}>
        <span>{t.company} <small>{t.optional}</small></span>
        <input type="text" name="company" autoComplete="organization" />
      </label>
      <label className={fieldClass("service")}>
        <span>{t.need}</span>
        <select name="service" defaultValue="" required>
          <option value="" disabled>{t.choose}</option>
          {SERVICES.map((s) => <option key={s} value={s}>{t.services[s]}</option>)}
        </select>
        {errors.service && <em>{t.errors.service}</em>}
      </label>
      <label className={fieldClass("message", true)}>
        <span>{t.message}</span>
        <textarea name="message" rows={3} required />
        {errors.message && <em>{t.errors.message}</em>}
      </label>
      {/* honeypot — hidden from people, tempting for bots */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hp" aria-hidden="true" />
      <div className="form__foot field--full">
        <button type="submit" className="btn btn--primary" disabled={status.kind === "sending"}>
          {status.kind === "sending" ? t.sending : t.send}
        </button>
        <p className={`form__status${status.kind === "sent" ? " is-ok" : ""}`} role="status">
          {status.message}
        </p>
      </div>
    </form>
  );
}
