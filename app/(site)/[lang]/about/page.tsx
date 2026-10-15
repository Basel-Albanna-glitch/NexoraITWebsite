import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Constellation } from "@/components/Constellation";
import { CtaBand } from "@/components/CtaBand";
import { PageHero } from "@/components/PageHero";
import { WorkShowcase } from "@/components/WorkShowcase";
import { getPage } from "@/lib/content-store";
import { getDictionary, isLocale } from "@/lib/i18n";
import { alternates } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[lang]/about">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const c = await getPage("about", lang);
  return { title: getDictionary(lang).meta.about, description: c.hero.body, alternates: alternates(lang, "/about") };
}

export default async function AboutPage({ params }: PageProps<"/[lang]/about">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const c = await getPage("about", lang);

  return (
    <main>
      <PageHero label={c.hero.label} title={c.hero.title} shape="torus">
        <p className="body reveal">{c.hero.body}</p>
      </PageHero>

      <section className="split wrap">
        <h2 className="heading-lg reveal">{c.story.title}</h2>
        <div className="split__copy">
          <p className="label reveal">{c.story.label}</p>
          <p className="body reveal">{c.story.body}</p>
          <p className="body body--muted reveal">{c.story.body2}</p>
        </div>
      </section>

      <section className="wrap section">
        <div className="section-head">
          <p className="label reveal">{c.values.label}</p>
          <h2 className="heading-lg reveal">{c.values.title} <span className="dim">{c.values.titleDim}</span></h2>
        </div>
        <ul className="features">
          {c.values.items.map((v, i) => (
            <li key={v.title} className="feature reveal">
              <span className="svc__num">{String(i + 1).padStart(2, "0")}</span>
              <h3>{v.title}</h3>
              <p>{v.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="split split--reverse wrap">
        <div className="split__visual">
          <Constellation shape="lattice" count={1000} mobileCount={600} scale={0.3} interactive={false} />
        </div>
        <div className="split__copy">
          <p className="label reveal">{c.promises.label}</p>
          <h2 className="heading reveal">{c.promises.title}</h2>
          <ol className="steps">
            {c.promises.items.map((p) => (
              <li key={p.title} className="reveal"><span>{p.title}</span>{p.text}</li>
            ))}
          </ol>
        </div>
      </section>

      <WorkShowcase lang={lang} />
      <CtaBand lang={lang} label={c.cta.label} title={c.cta.title} />
    </main>
  );
}
