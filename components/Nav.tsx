"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { href, stripLocale, type Dictionary, type Locale } from "@/lib/i18n";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

interface Props {
  lang: Locale;
  t: Pick<Dictionary, "nav" | "cta" | "theme" | "switchTo" | "switchToShort">;
  services: { slug: string; title: string }[];
  /** Pages added from the dashboard, shown as extra tabs before Contact. */
  pages?: { slug: string; label: string }[];
}

export function Nav({ lang, t, services, pages = [] }: Props) {
  const pathname = usePathname();
  const path = stripLocale(pathname); // locale-free, e.g. "/services/pos"
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close the mobile menu whenever the route changes
  useEffect(() => setOpen(false), [pathname]);

  const links = [
    { path: "/services", label: t.nav.services },
    { path: "/work", label: t.nav.work },
    { path: "/about", label: t.nav.about },
    ...pages.map((p) => ({ path: `/${p.slug}`, label: p.label })),
    { path: "/contact", label: t.nav.contact },
  ];
  const isActive = (p: string) => path === p || path.startsWith(p + "/");
  const other: Locale = lang === "ar" ? "en" : "ar";

  return (
    <header className={`nav${scrolled ? " is-scrolled" : ""}`}>
      <div className="wrap nav__inner">
        <Logo home={href(lang, "/")} label={t.nav.home} withMark />
        <nav className={`nav__links${open ? " is-open" : ""}`} aria-label="Main">
          {links.map((l) =>
            l.path === "/services" ? (
              <div key={l.path} className="nav__group">
                <Link href={href(lang, l.path)} className={isActive(l.path) ? "is-active" : undefined}>
                  {l.label}<span className="nav__caret" aria-hidden="true" />
                </Link>
                <div className="nav__menu">
                  {services.map((s) => (
                    <Link key={s.slug} href={href(lang, `/services/${s.slug}`)}
                          className={path === `/services/${s.slug}` ? "is-active" : undefined}>
                      {s.title}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link key={l.path} href={href(lang, l.path)} className={isActive(l.path) ? "is-active" : undefined}>
                {l.label}
              </Link>
            ),
          )}
          <a href={href(other, path)} className="nav__lang-mobile" hrefLang={other} lang={other}>{t.switchTo}</a>
        </nav>
        <Link href={href(lang, "/contact")} className="btn btn--primary nav__cta">{t.cta.book}</Link>
        {/* full page load on purpose: the other language is a different document (dir, fonts) */}
        <a href={href(other, path)} className="lang-switch" hrefLang={other} lang={other} title={t.switchTo}>
          {t.switchToShort}
        </a>
        <ThemeToggle label={t.theme} />
        <button className="nav__toggle" aria-label={open ? t.nav.menuClose : t.nav.menuOpen}
                aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          <span /><span />
        </button>
      </div>
    </header>
  );
}
