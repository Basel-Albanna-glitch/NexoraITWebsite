"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getAdminDict } from "@/lib/admin-i18n";
import { getDictionary, type Locale } from "@/lib/i18n";

export interface DayRow {
  date: string; views: number; visitors: number;
  paths: Record<string, number>; langs: Record<string, number>; refs: Record<string, number>;
}
interface MsgLite { id: string; name: string; service: string; status: string; createdAt: string; message: string }

const RANGES = [7, 30, 90] as const;
type Range = (typeof RANGES)[number];

const sumMaps = (rows: DayRow[], key: "paths" | "langs" | "refs") => {
  const out: Record<string, number> = {};
  for (const r of rows) for (const [k, v] of Object.entries(r[key])) out[k] = (out[k] ?? 0) + v;
  return Object.entries(out).sort((a, b) => b[1] - a[1]);
};

export function Overview({ lang, days, messages, liveProjects }: { lang: Locale; days: DayRow[]; messages: MsgLite[]; liveProjects: number }) {
  const t = getAdminDict(lang);
  const o = t.overview;
  const [range, setRange] = useState<Range>(30);
  const nf = useMemo(() => new Intl.NumberFormat(lang === "ar" ? "ar-JO" : "en", { notation: "compact" }), [lang]);
  const df = useMemo(() => new Intl.DateTimeFormat(lang === "ar" ? "ar-JO" : "en-GB", { day: "numeric", month: "short", timeZone: "UTC" }), [lang]);
  const fmtDate = (d: string) => df.format(new Date(`${d}T00:00:00Z`));

  const data = useMemo(() => {
    const cur = days.slice(-range);
    const prev = days.slice(-range * 2, -range);
    const sum = (rows: DayRow[], k: "views" | "visitors") => rows.reduce((a, r) => a + r[k], 0);
    const startMs = Date.parse(`${cur[0].date}T00:00:00Z`) - 3 * 3600e3; // Amman is UTC+3
    const prevStartMs = startMs - range * 864e5;
    const inCur = messages.filter((m) => Date.parse(m.createdAt) >= startMs);
    const inPrev = messages.filter((m) => { const x = Date.parse(m.createdAt); return x >= prevStartMs && x < startMs; });
    const byService: Record<string, number> = {};
    for (const m of inCur) byService[m.service] = (byService[m.service] ?? 0) + 1;
    return {
      cur,
      views: [sum(cur, "views"), sum(prev, "views")] as const,
      visitors: [sum(cur, "visitors"), sum(prev, "visitors")] as const,
      msgs: [inCur.length, inPrev.length] as const,
      pages: sumMaps(cur, "paths").slice(0, 8),
      langs: sumMaps(cur, "langs"),
      refs: sumMaps(cur, "refs").slice(0, 6),
      services: Object.entries(byService).sort((a, b) => b[1] - a[1]),
    };
  }, [days, messages, range]);

  const newCount = messages.filter((m) => m.status === "new").length;
  const hasVisits = data.views[0] > 0;
  const pageName = (p: string) => (p === "/" ? (lang === "ar" ? "الرئيسية" : "Home") : p);
  const langName = (l: string) => (l === "ar" ? t.common.arabic : t.common.english);
  const svcNames = getDictionary(lang).form.services as Record<string, string>;
  const svcName = (s: string) => svcNames[s] ?? s;

  return (
    <div className="ov">
      <div className="page-title">
        <h1 className="heading">{o.title}</h1>
        {/* filters: one row above everything they scope */}
        <div className="seg" role="group" aria-label={o.range}>
          {RANGES.map((r) => (
            <button key={r} type="button" aria-pressed={range === r} onClick={() => setRange(r)}>
              {r === 7 ? o.last7 : r === 30 ? o.last30 : o.last90}
            </button>
          ))}
        </div>
      </div>

      <div className="tiles">
        <Tile hero label={o.visitors} value={data.visitors[0]} prev={data.visitors[1]} nf={nf} vsLabel={o.vsPrev} />
        <Tile label={o.views} value={data.views[0]} prev={data.views[1]} nf={nf} vsLabel={o.vsPrev} />
        <Tile label={o.newMessages} value={newCount} nf={nf} href="/admin/messages" />
        <Tile label={o.liveProjects} value={liveProjects} nf={nf} href="/admin/projects" />
      </div>

      <section className="panel">
        <h2 className="panel__title">{o.perDay}</h2>
        {hasVisits ? <Columns rows={data.cur} fmtDate={fmtDate} nf={nf} t={o} /> : <p className="panel__empty">{o.noData}</p>}
      </section>

      <div className="panels-2">
        <section className="panel">
          <h2 className="panel__title">{o.topPages}</h2>
          {hasVisits ? <Bars items={data.pages.map(([k, v]) => [pageName(k), v])} nf={nf} ltrLabels /> : <p className="panel__empty">{o.noData}</p>}
        </section>
        <section className="panel">
          <h2 className="panel__title">{o.languages}</h2>
          {hasVisits ? <Bars items={data.langs.map(([k, v]) => [langName(k), v])} nf={nf} /> : <p className="panel__empty">{o.noData}</p>}
          <h2 className="panel__title panel__title--gap">{o.referrers}</h2>
          {data.refs.length ? <Bars items={data.refs} nf={nf} ltrLabels /> : <p className="panel__empty">{o.direct}</p>}
        </section>
        <section className="panel">
          <h2 className="panel__title">{o.byService}</h2>
          {data.services.length ? <Bars items={data.services.map(([k, v]) => [svcName(k), v])} nf={nf} /> : <p className="panel__empty">{o.noMessages}</p>}
        </section>
        <section className="panel">
          <div className="panel__head">
            <h2 className="panel__title">{o.recent}</h2>
            <Link href="/admin/messages" className="panel__link">{o.allMessages}</Link>
          </div>
          {messages.length ? (
            <ul className="recent">
              {messages.slice(0, 5).map((m) => (
                <li key={m.id}>
                  <Link href={`/admin/messages?id=${m.id}`}>
                    {m.status === "new" && <span className="dot" aria-label={t.messages.new} />}
                    <strong dir="auto">{m.name}</strong>
                    <span className="recent__meta">{svcName(m.service)} · {fmtDate(m.createdAt.slice(0, 10))}</span>
                    <span className="recent__text" dir="auto">{m.message}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : <p className="panel__empty">{o.noMessages}</p>}
        </section>
      </div>

      <p className="ov__note">{o.privacy}</p>
    </div>
  );
}

function Tile({ label, value, prev, nf, vsLabel, href, hero }: {
  label: string; value: number; prev?: number; nf: Intl.NumberFormat; vsLabel?: string; href?: string; hero?: boolean;
}) {
  let delta: React.ReactNode = null;
  if (prev !== undefined && (prev > 0 || value > 0)) {
    const pct = prev === 0 ? null : Math.round(((value - prev) / prev) * 100);
    const up = value >= prev;
    delta = (
      <span className={`tile__delta ${up ? "is-up" : "is-down"}`}>
        <span aria-hidden="true">{up ? "▲" : "▼"}</span> {pct === null ? "—" : `${pct > 0 ? "+" : ""}${pct}%`} <small>{vsLabel}</small>
      </span>
    );
  }
  const body = (
    <>
      <span className="tile__label">{label}</span>
      <span className={`tile__value${hero ? " is-hero" : ""}`}>{nf.format(value)}</span>
      {delta}
    </>
  );
  return href ? <Link href={href} className="tile is-link">{body}</Link> : <div className="tile">{body}</div>;
}

/** Page views per day: one series, so no legend; hover/focus a column for its exact value; table view available. */
function Columns({ rows, fmtDate, nf, t }: {
  rows: DayRow[]; fmtDate: (d: string) => string; nf: Intl.NumberFormat; t: ReturnType<typeof getAdminDict>["overview"];
}) {
  const [hover, setHover] = useState<number | null>(null);
  const [table, setTable] = useState(false);
  const max = Math.max(1, ...rows.map((r) => r.views));
  // clean axis ticks: 0, ~half, top rounded up to a nice number
  const step = Math.pow(10, Math.floor(Math.log10(max)));
  const top = Math.ceil(max / step) * step;
  const ticks = [0, top / 2, top];
  const peak = rows.reduce((b, r, i) => (r.views > rows[b].views ? i : b), 0);
  const labelEvery = Math.ceil(rows.length / 6);

  return (
    <>
      <div className="cols" dir="ltr" onPointerLeave={() => setHover(null)}>
        <div className="cols__grid" aria-hidden="true">
          {ticks.slice().reverse().map((v) => <div key={v}><span>{nf.format(v)}</span></div>)}
        </div>
        <div className="cols__plot" role="list">
          {rows.map((r, i) => (
            <div key={r.date} className={`cols__slot${hover === i ? " is-hover" : ""}`} role="listitem" tabIndex={0}
                 aria-label={`${fmtDate(r.date)}: ${r.views}`}
                 onPointerEnter={() => setHover(i)} onFocus={() => setHover(i)} onBlur={() => setHover(null)}>
              <div className="cols__bar" style={{ height: `${(r.views / top) * 100}%` }} />
              {i === peak && r.views > 0 && <span className="cols__peak" style={{ bottom: `${(r.views / top) * 100}%` }}>{nf.format(r.views)}</span>}
              {hover === i && (
                <div className={`tip${i > rows.length * 0.7 ? " tip--left" : ""}`} role="tooltip">
                  <strong>{r.views.toLocaleString()}</strong>
                  <span>{t.views} · {fmtDate(r.date)}</span>
                  <span>{t.visitors}: {r.visitors.toLocaleString()}</span>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="cols__axis" aria-hidden="true">
          {rows.map((r, i) => <span key={r.date}>{i % labelEvery === 0 || i === rows.length - 1 ? fmtDate(r.date) : ""}</span>)}
        </div>
      </div>
      <button type="button" className="a-btn a-btn--sm" onClick={() => setTable((x) => !x)}>{table ? t.hideTable : t.showTable}</button>
      {table && (
        <table className="a-table">
          <thead><tr><th>{t.date}</th><th>{t.views}</th><th>{t.visitors}</th></tr></thead>
          <tbody>{rows.slice().reverse().map((r) => <tr key={r.date}><td>{fmtDate(r.date)}</td><td>{r.views}</td><td>{r.visitors}</td></tr>)}</tbody>
        </table>
      )}
    </>
  );
}

/** Horizontal bars, single hue; value at each bar's tip (so no tooltip needed). */
function Bars({ items, nf, ltrLabels }: { items: [string, number][]; nf: Intl.NumberFormat; ltrLabels?: boolean }) {
  const max = Math.max(1, ...items.map(([, v]) => v));
  return (
    <ul className="hbars">
      {items.map(([k, v]) => (
        <li key={k} title={`${k}: ${v.toLocaleString()}`}>
          <span className="hbars__label" dir={ltrLabels ? "ltr" : undefined}>{k}</span>
          <span className="hbars__track">
            <span className="hbars__bar" style={{ width: `${(v / max) * 100}%` }} />
            <span className="hbars__value">{nf.format(v)}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
