import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Arrow } from "@/components/Arrow";
import { Constellation } from "@/components/Constellation";
import { CtaBand } from "@/components/CtaBand";
import { PageHero } from "@/components/PageHero";
import { ProjectBlock } from "@/components/ProjectBlock";
import { getContent, getService, getServices } from "@/lib/content-store";
import { getDictionary, href, isLocale, LOCALES } from "@/lib/i18n";
import { projectsFor } from "@/lib/projects-store";
import { alternates } from "@/lib/seo";

// Services added from the dashboard after the build are rendered on first visit.
export const dynamicParams = true;

export async function generateStaticParams() {
  const { services } = await getContent();
  return LOCALES.flatMap((lang) => services.map((s) => ({ lang, slug: s.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/services/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const s = await getService(slug, lang);
  return s ? { title: s.title, description: s.summary, alternates: alternates(lang, `/services/${slug}`) } : {};
}

export default async function ServicePage({ params }: PageProps<"/[lang]/services/[slug]">) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);
  const [s, all, projects] = await Promise.all([getService(slug, lang), getServices(lang), projectsFor(slug, lang)]);
  if (!s) notFound();

  const others = all.filter((x) => x.slug !== s.slug);
  const titles = Object.fromEntries(all.map((x) => [x.slug, x.title]));

  return (
    <main>
      <PageHero
        label={<><Link href={href(lang, "/services")} className="crumb">{t.service.breadcrumb}</Link> / {s.title}</>}
        title={s.headline}
        shape={s.shape}
      >
        <p className="body reveal">{s.intro}</p>
        <div className="hero__actions reveal">
          <Link href={href(lang, "/contact")} className="btn btn--primary">{t.cta.freeConsult}</Link>
          {projects.length > 0 && <a href="#work" className="ghost">{t.cta.relatedWork} <Arrow /></a>}
        </div>
      </PageHero>

      {/* FEATURES */}
      {s.features.length > 0 && (
      <section className="wrap section">
        <div className="section-head">
          <p className="label reveal">{t.service.included}</p>
          <h2 className="heading-lg reveal">{s.title}{lang === "ar" ? "، " : ", "}<span className="dim">{t.service.endToEnd}</span></h2>
        </div>
        <ul className="features">
          {s.features.map((f, i) => (
            <li key={f.title} className="feature reveal">
              <span className="svc__num">{String(i + 1).padStart(2, "0")}</span>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </li>
          ))}
        </ul>
      </section>
      )}

      {/* AUDIENCE */}
      {(s.audience.headline || s.audience.text) && (
      <section className="split wrap">
        <h2 className="heading-lg reveal">{s.audience.headline}</h2>
        <div className="split__copy">
          <p className="label reveal">{t.service.audience}</p>
          <p className="body reveal">{s.audience.text}</p>
          <ul className="tags reveal">
            {s.audience.tags.map((x) => <li key={x}>{x}</li>)}
          </ul>
        </div>
      </section>
      )}

      {/* PROCESS */}
      {s.process.length > 0 && (
      <section className="split split--reverse wrap">
        <div className="split__visual">
          <Constellation shape="globe" count={1000} mobileCount={600} scale={0.3} speed={0.0024} interactive={false} />
        </div>
        <div className="split__copy">
          <p className="label reveal">{t.service.deliver}</p>
          <h2 className="heading reveal">{t.service.deliverTitle}</h2>
          <ol className="steps">
            {s.process.map((p) => (
              <li key={p.title} className="reveal"><span>{p.title}</span>{p.text}</li>
            ))}
          </ol>
        </div>
      </section>
      )}

      {/* WORK */}
      {projects.length > 0 && (
        <section className="wrap section" id="work">
          <div className="section-head">
            <p className="label reveal">{t.service.related}</p>
            <h2 className="heading-lg reveal">{t.service.relatedTitle} <span className="dim">{t.service.relatedDim}</span></h2>
          </div>
          {projects.map((p, i) => (
            <ProjectBlock key={p.slug} project={p} lang={lang} serviceTitles={titles} flip={i % 2 === 1} headingLevel={3} />
          ))}
        </section>
      )}

      {/* FAQ */}
      {s.faqs.length > 0 && (
        <section className="split wrap">
          <h2 className="heading-lg reveal">{t.service.faq}</h2>
          <div className="faq">
            {s.faqs.map((f) => (
              <details key={f.title} className="reveal">
                <summary>{f.title}</summary>
                <p>{f.text}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* OTHER SERVICES */}
      {others.length > 0 && (
      <section className="wrap section">
        <p className="label reveal">{t.service.others}</p>
        <ul className="other-services">
          {others.map((o) => (
            <li key={o.slug} className="reveal">
              <Link href={href(lang, `/services/${o.slug}`)}>{o.title} <Arrow /></Link>
            </li>
          ))}
        </ul>
      </section>
      )}

      <CtaBand lang={lang} label={t.service.ctaLabel} text={t.service.ctaText} />
    </main>
  );
}
