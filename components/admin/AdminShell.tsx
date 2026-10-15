"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ADMIN_LANG_COOKIE, getAdminDict } from "@/lib/admin-i18n";
import type { Locale } from "@/lib/i18n";
import { ThemeToggle } from "../ThemeToggle";

const ICONS = {
  overview: <path d="M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6v-9h-6v9Zm0-16v5h6V4h-6Z" />,
  messages: <path d="M4 5h16v11H8l-4 4V5Z" />,
  projects: <path d="M4 6h7l2 2h7v11H4V6Z" />,
  content: <path d="M5 5h14M5 10h14M5 15h9M5 20h6" />,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8" /></>,
};

export function AdminShell({ lang, newMessages, children }: { lang: Locale; newMessages: number; children: React.ReactNode }) {
  const t = getAdminDict(lang);
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  const items = [
    { href: "/admin", key: "overview" as const, label: t.nav.overview },
    { href: "/admin/messages", key: "messages" as const, label: t.nav.messages, badge: newMessages },
    { href: "/admin/projects", key: "projects" as const, label: t.nav.projects },
    { href: "/admin/content", key: "content" as const, label: t.nav.content },
    { href: "/admin/settings", key: "settings" as const, label: t.nav.settings },
  ];
  const active = (h: string) => (h === "/admin" ? pathname === h : pathname.startsWith(h));

  function switchLang() {
    const next = lang === "ar" ? "en" : "ar";
    document.cookie = `${ADMIN_LANG_COOKIE}=${next}; path=/admin; max-age=31536000; samesite=lax`;
    window.location.reload(); // direction and fonts change, so reload the whole document
  }

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div className="shell">
      <aside className={`shell__side${open ? " is-open" : ""}`}>
        <div className="shell__brand">
          <Link href="/admin" className="logo" dir="ltr"><span className="logo__word">Nexora<span>IT</span></span></Link>
          <span className="shell__tag">{t.dashboard}</span>
        </div>
        <nav className="shell__nav">
          {items.map((i) => (
            <Link key={i.href} href={i.href} className={active(i.href) ? "is-active" : undefined}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true">{ICONS[i.key]}</svg>
              <span>{i.label}</span>
              {i.badge ? <em className="shell__badge" aria-label={`${i.badge}`}>{i.badge}</em> : null}
            </Link>
          ))}
        </nav>
        <div className="shell__foot">
          <a href="/" target="_blank" rel="noreferrer">{t.nav.viewSite} ↗</a>
          <button type="button" onClick={logout}>{t.nav.signOut}</button>
        </div>
      </aside>
      <div className="shell__main">
        <header className="shell__top">
          <button type="button" className="shell__menu" onClick={() => setOpen((o) => !o)} aria-expanded={open}>{t.nav.menu}</button>
          <div className="shell__tools">
            <button type="button" className="lang-switch" onClick={switchLang} title={lang === "ar" ? "English" : "العربية"}>
              {lang === "ar" ? "EN" : "ع"}
            </button>
            <ThemeToggle />
          </div>
        </header>
        <main className="shell__content">{children}</main>
      </div>
    </div>
  );
}
