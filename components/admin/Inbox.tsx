"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getAdminDict } from "@/lib/admin-i18n";
import { getDictionary, type Locale } from "@/lib/i18n";
import type { Message, MessageStatus } from "@/lib/messages-store";

type Filter = "all" | MessageStatus;

export function Inbox({ lang, initial, openId }: { lang: Locale; initial: Message[]; openId?: string }) {
  const t = getAdminDict(lang);
  const m = t.messages;
  const svcNames = getDictionary(lang).form.services as Record<string, string>;
  const router = useRouter();
  const [messages, setMessages] = useState(initial);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | undefined>(openId);
  const [error, setError] = useState("");

  const dtf = useMemo(() => new Intl.DateTimeFormat(lang === "ar" ? "ar-JO" : "en-GB", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Amman",
  }), [lang]);

  const counts = useMemo(() => ({
    all: messages.length,
    new: messages.filter((x) => x.status === "new").length,
    read: messages.filter((x) => x.status === "read").length,
    done: messages.filter((x) => x.status === "done").length,
  }), [messages]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return messages.filter((x) => (filter === "all" || x.status === filter)
      && (!q || `${x.name} ${x.email} ${x.company} ${x.message}`.toLowerCase().includes(q)));
  }, [messages, filter, query]);

  const current = messages.find((x) => x.id === selected);

  async function setStatus(id: string, status: MessageStatus) {
    const prev = messages;
    setMessages((all) => all.map((x) => (x.id === id ? { ...x, status } : x)));
    const res = await fetch(`/api/admin/messages/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }),
    }).catch(() => null);
    if (!res?.ok) { setMessages(prev); setError(t.common.error); return; }
    router.refresh(); // keeps the "new" badge in the sidebar in sync
  }

  // Opening a new message marks it as read.
  useEffect(() => {
    if (current?.status === "new") void setStatus(current.id, "read");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  async function remove(id: string) {
    if (!confirm(m.confirmDelete)) return;
    const res = await fetch(`/api/admin/messages/${id}`, { method: "DELETE" }).catch(() => null);
    if (!res?.ok) { setError(t.common.error); return; }
    setMessages((all) => all.filter((x) => x.id !== id));
    setSelected(undefined);
    router.refresh();
  }

  const replyHref = (x: Message) => {
    const subject = lang === "ar" || x.lang === "ar" ? `بخصوص طلبك: ${svcNames[x.service] ?? x.service}` : `Re: your ${x.service} enquiry`;
    const quoted = x.message.split("\n").map((l) => `> ${l}`).join("\n");
    return `mailto:${encodeURIComponent(x.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`\n\n${quoted}`)}`;
  };

  return (
    <div className="inbox-page">
      <div className="page-title">
        <h1 className="heading">{m.title}</h1>
      </div>
      <div className="inbox-tools">
        <div className="seg" role="group">
          {(["all", "new", "read", "done"] as Filter[]).map((f) => (
            <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)}>
              {m[f]} <span className="seg__count">{counts[f]}</span>
            </button>
          ))}
        </div>
        <input className="a-search" type="search" placeholder={m.search} value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      {error && <p className="a-error" role="alert">{error}</p>}

      <div className={`inbox${current ? " has-open" : ""}`}>
        <ul className="inbox__list">
          {shown.length === 0 && <li className="inbox__empty">{m.empty}</li>}
          {shown.map((x) => (
            <li key={x.id}>
              <button type="button" className={`inbox__item${x.id === selected ? " is-active" : ""}${x.status === "new" ? " is-new" : ""}`}
                      onClick={() => setSelected(x.id)}>
                <span className="inbox__row">
                  {x.status === "new" && <span className="dot" aria-label={m.new} />}
                  <strong dir="auto">{x.name}</strong>
                  <time>{dtf.format(new Date(x.createdAt))}</time>
                </span>
                <span className="inbox__meta">{svcNames[x.service] ?? x.service}{x.company ? ` · ${x.company}` : ""}</span>
                <span className="inbox__snippet" dir="auto">{x.message}</span>
              </button>
            </li>
          ))}
        </ul>

        <article className="inbox__read">
          {current ? (
            <>
              <button type="button" className="a-btn a-btn--sm inbox__back" onClick={() => setSelected(undefined)}>← {t.common.back}</button>
              <header className="inbox__head">
                <h2 dir="auto">{current.name}</h2>
                <a href={`mailto:${current.email}`} dir="ltr">{current.email}</a>
              </header>
              <dl className="inbox__facts">
                <div><dt>{m.service}</dt><dd>{svcNames[current.service] ?? current.service}</dd></div>
                {current.company && <div><dt>{m.company}</dt><dd>{current.company}</dd></div>}
                <div><dt>{m.received}</dt><dd>{dtf.format(new Date(current.createdAt))}</dd></div>
                <div><dt>{m.language}</dt><dd>{current.lang === "ar" ? t.common.arabic : t.common.english}</dd></div>
              </dl>
              <p className="inbox__body" dir="auto">{current.message}</p>
              <p className="inbox__mailnote">{current.emailed ? `✓ ${m.emailed}` : m.notEmailed}</p>
              <div className="a-inline">
                <a className="btn btn--primary" href={replyHref(current)}>{m.reply}</a>
                {current.status !== "done"
                  ? <button type="button" className="a-btn" onClick={() => setStatus(current.id, "done")}>{m.markDone}</button>
                  : <button type="button" className="a-btn" onClick={() => setStatus(current.id, "read")}>{m.markRead}</button>}
                <button type="button" className="a-btn" onClick={() => setStatus(current.id, "new")}>{m.markNew}</button>
                <button type="button" className="a-btn is-danger" onClick={() => remove(current.id)}>{m.delete}</button>
              </div>
            </>
          ) : (
            <p className="inbox__placeholder">{m.select}</p>
          )}
        </article>
      </div>
    </div>
  );
}
