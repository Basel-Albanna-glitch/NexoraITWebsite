import Link from "next/link";
import { notFound } from "next/navigation";
import { Arrow } from "@/components/Arrow";
import { Constellation } from "@/components/Constellation";
import { ContactForm } from "@/components/ContactForm";
import { WorkShowcase } from "@/components/WorkShowcase";
import { getPage, getServices } from "@/lib/content-store";
import { getDictionary, href, isLocale } from "@/lib/i18n";
import { alternates } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  return isLocale(lang) ? { alternates: alternates(lang, "/") } : {};
}

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);
  const [c, services] = await Promise.all([getPage("home", lang), getServices(lang)]);

  return (
    <main id="top">
      {/* HERO */}
      <section className="hero wrap">
        <div className="hero__text">
          <p className="label reveal">{c.hero.label}</p>
          <h1 className="display reveal">{c.hero.title}</h1>
          <p className="body reveal">{c.hero.body}</p>
          <div className="hero__actions reveal">
            <Link href={href(lang, "/contact")} className="btn btn--primary">{t.cta.start}</Link>
            <Link href={href(lang, "/work")} className="ghost">{t.cta.seeWork} <Arrow /></Link>
          </div>
        </div>
        <div className="hero__visual">
          <Constellation shape="brain" count={1700} mobileCount={900} label={t.work.noImageAlt} />
        </div>
      </section>

      {/* MANIFESTO */}
      <section className="split wrap" id="about">
        <h2 className="heading-lg reveal">{c.manifesto.title}</h2>
        <div className="split__copy">
          <p className="label reveal">{c.manifesto.label}</p>
          <p className="body reveal">{c.manifesto.body}</p>
          <p className="body body--muted reveal">{c.manifesto.body2}</p>
          <Link href={href(lang, "/about")} className="ghost reveal">{t.cta.moreAbout} <Arrow /></Link>
        </div>
      </section>

      {/* SERVICES */}
      <section className="services wrap" id="services">
        <div className="section-head">
          <p className="label reveal">{c.services.label}</p>
          <h2 className="heading-lg reveal">{c.services.title} <span className="dim">{c.services.titleDim}</span></h2>
        </div>
        <ol className="svc-list">
          {services.map((s, i) => (
            <li key={s.slug} className="svc reveal">
              <Link href={href(lang, `/services/${s.slug}`)} className="svc__link">
                <span className="svc__num">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="svc__title">{s.title}</h3>
                <div>
                  <p className="svc__desc">{s.summary}</p>
                  <ul className="svc__features">
                    {s.highlights.map((f) => <li key={f}>{f}</li>)}
                  </ul>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <WorkShowcase lang={lang} label={c.work.label} />

      {/* APPROACH */}
      <section className="split split--reverse wrap" id="approach">
        <div className="split__visual">
          <Constellation shape="globe" count={1000} mobileCount={600} scale={0.3} speed={0.0024} interactive={false} />
        </div>
        <div className="split__copy">
          <p className="label reveal">{c.approach.label}</p>
          <h2 className="heading reveal">{c.approach.title}</h2>
          <ol className="steps">
            {c.approach.steps.map((s) => (
              <li key={s.title} className="reveal"><span>{s.title}</span>{s.text}</li>
            ))}
          </ol>
        </div>
      </section>

      {/* INDUSTRIES */}
      <section className="split wrap" id="industries">
        <h2 className="heading-lg reveal">{c.industries.title}</h2>
        <div className="split__copy">
          <p className="label reveal">{c.industries.label}</p>
          <p className="body reveal">{c.industries.body}</p>
          <ul className="tags reveal">
            {c.industries.tags.map((x) => <li key={x}>{x}</li>)}
          </ul>
        </div>
      </section>

      {/* CONTACT */}
      <section className="contact wrap" id="contact">
        <div className="contact__head">
          <p className="label reveal">{c.contact.label}</p>
          <h2 className="display reveal">{c.contact.title}</h2>
        </div>
        <ContactForm lang={lang} t={t.form} />
      </section>
    </main>
  );
}
