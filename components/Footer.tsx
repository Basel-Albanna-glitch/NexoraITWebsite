import Link from "next/link";
import { getCustomPages, getPage, getServices, getSettings } from "@/lib/content-store";
import { getDictionary, href, type Locale } from "@/lib/i18n";
import { Logo } from "./Logo";
import { SocialIcons } from "./SocialIcons";

export async function Footer({ lang }: { lang: Locale }) {
  const t = getDictionary(lang);
  const [settings, services, home, pages] = await Promise.all([getSettings(), getServices(lang), getPage("home", lang), getCustomPages(lang)]);
  return (
    <footer className="footer wrap">
      <div className="footer__grid">
        <div className="footer__brand">
          <Logo home={href(lang, "/")} label={t.nav.home} className="logo--footer" />
          <p className="caption">{home.hero.title}</p>
        </div>
        <nav className="footer__col" aria-label={t.footer.services}>
          <p className="footer__head">{t.footer.services}</p>
          {services.map((s) => <Link key={s.slug} href={href(lang, `/services/${s.slug}`)}>{s.title}</Link>)}
        </nav>
        <nav className="footer__col" aria-label={t.footer.company}>
          <p className="footer__head">{t.footer.company}</p>
          <Link href={href(lang, "/work")}>{t.footer.ourWork}</Link>
          <Link href={href(lang, "/about")}>{t.footer.about}</Link>
          {pages.map((p) => <Link key={p.slug} href={href(lang, `/${p.slug}`)}>{p.navLabel}</Link>)}
          <Link href={href(lang, "/contact")}>{t.footer.contact}</Link>
          <Link href={href(lang, "/privacy")}>{t.footer.privacy}</Link>
        </nav>
        <div className="footer__col">
          <p className="footer__head">{t.footer.touch}</p>
          {settings.email && <a href={`mailto:${settings.email}`} dir="ltr">{settings.email}</a>}
          {settings.phone && <a href={`tel:${settings.phone.replace(/\s/g, "")}`} dir="ltr">{settings.phone}</a>}
          {settings.location[lang] && <span>{settings.location[lang]}</span>}
          <SocialIcons social={settings.social} label={t.social} className="footer__social" />
        </div>
      </div>
      <p className="caption footer__legal">© {new Date().getFullYear()} NexoraIT. {t.footer.rights}</p>
    </footer>
  );
}
