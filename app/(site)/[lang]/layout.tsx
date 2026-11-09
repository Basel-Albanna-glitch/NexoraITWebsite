import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { AmbientField } from "@/components/Constellation";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { RevealObserver } from "@/components/Reveal";
import { Tracker } from "@/components/Tracker";
import { getCustomPages, getServices, getSettings } from "@/lib/content-store";
import { fontVars } from "@/lib/fonts";
import { SITE_URL } from "@/lib/site-url";
import { dirOf, getDictionary, isLocale, LOCALES } from "@/lib/i18n";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import "../../globals.css";

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang);
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t.meta.siteTitle, template: "%s — NexoraIT" },
    description: t.meta.description,
    openGraph: { siteName: "NexoraIT", title: t.meta.siteTitle, description: t.meta.description, images: ["/logo.png"], locale: lang === "ar" ? "ar_JO" : "en_US" },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
    { media: "(prefers-color-scheme: light)", color: "#fafaf8" },
  ],
};

export default async function SiteLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);
  const [settings, services, pages] = await Promise.all([getSettings(), getServices(lang), getCustomPages(lang)]);

  // Tells search engines who we are and which social profiles belong to us
  const orgLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "NexoraIT",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    email: settings.email || undefined,
    address: { "@type": "PostalAddress", addressLocality: "Amman", addressCountry: "JO" },
    sameAs: Object.values(settings.social).filter(Boolean),
  };

  return (
    <html lang={lang} dir={dirOf(lang)} className={fontVars} suppressHydrationWarning>
      <head>
        {/* Lets CSS hide .reveal elements only when JS is running, so content is never lost without it */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        {/* Applies the saved / device theme before first paint — no flash of the wrong colours */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }} />
        <AmbientField />
        <RevealObserver />
        <Tracker />
        <Nav lang={lang} services={services.map((s) => ({ slug: s.slug, title: s.title }))}
             pages={pages.map((p) => ({ slug: p.slug, label: p.navLabel }))}
             t={{ nav: t.nav, cta: t.cta, theme: t.theme, switchTo: t.switchTo, switchToShort: t.switchToShort }} />
        {children}
        <Footer lang={lang} />
      </body>
    </html>
  );
}
