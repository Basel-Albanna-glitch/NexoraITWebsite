import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Arrow } from "@/components/Arrow";
import { CtaBand } from "@/components/CtaBand";
import { PageHero } from "@/components/PageHero";
import { WorkShowcase } from "@/components/WorkShowcase";
import { getPage, getServices } from "@/lib/content-store";
import { alternates } from "@/lib/seo";
import { getDictionary, href, isLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]/services">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const c = await getPage("servicesPage", lang);
  return { title: getDictionary(lang).meta.services, description: c.hero.body, alternates: alternates(lang, "/services") };
}

export default async function ServicesPage({ params }: PageProps<"/[lang]/services">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);
  const [c, services] = await Promise.all([getPage("servicesPage", lang), getServices(lang)]);

  return (
    <main>
      <PageHero label={c.hero.label} title={c.hero.title} shape="globe">
        <p className="body reveal">{c.hero.body}</p>
      </PageHero>

      <section className="services wrap">
        <ol className="svc-list">
          {services.map((s, i) => (
            <li key={s.slug} className="svc reveal">
              <Link href={href(lang, `/services/${s.slug}`)} className="svc__link">
                <span className="svc__num">{String(i + 1).padStart(2, "0")}</span>
                <h2 className="svc__title">{s.title}</h2>
                <div>
                  <p className="svc__desc">{s.summary}</p>
                  <ul className="svc__features">
                    {s.highlights.map((f) => <li key={f}>{f}</li>)}
                  </ul>
                  <span className="ghost svc__more">{t.cta.learnMore} <Arrow /></span>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="split wrap">
        <h2 className="heading-lg reveal">{c.together.title}</h2>
        <div className="split__copy">
          <p className="label reveal">{c.together.label}</p>
          <p className="body reveal">{c.together.body}</p>
        </div>
      </section>

      <WorkShowcase lang={lang} />
      <CtaBand lang={lang} />
    </main>
  );
}
