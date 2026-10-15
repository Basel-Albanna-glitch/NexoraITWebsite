import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CtaBand } from "@/components/CtaBand";
import { PageHero } from "@/components/PageHero";
import { ProjectBlock } from "@/components/ProjectBlock";
import { getPage, getServices } from "@/lib/content-store";
import { getDictionary, isLocale } from "@/lib/i18n";
import { getProjects } from "@/lib/projects-store";
import { alternates } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[lang]/work">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const c = await getPage("work", lang);
  return { title: getDictionary(lang).meta.work, description: c.hero.body, alternates: alternates(lang, "/work") };
}

export default async function WorkPage({ params }: PageProps<"/[lang]/work">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const [c, projects, services] = await Promise.all([getPage("work", lang), getProjects(lang), getServices(lang)]);
  const titles = Object.fromEntries(services.map((s) => [s.slug, s.title]));

  return (
    <main>
      <PageHero label={c.hero.label} title={c.hero.title} shape="brain">
        <p className="body reveal">{c.hero.body}</p>
      </PageHero>

      <section className="wrap section work-list">
        {projects.map((p, i) => (
          <ProjectBlock key={p.slug} project={p} lang={lang} serviceTitles={titles} flip={i % 2 === 1} />
        ))}
      </section>

      <CtaBand lang={lang} label={c.ctaLabel} />
    </main>
  );
}
