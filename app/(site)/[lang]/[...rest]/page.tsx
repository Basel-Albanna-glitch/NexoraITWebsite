import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CtaBand } from "@/components/CtaBand";
import { PageHero } from "@/components/PageHero";
import { getCustomPage } from "@/lib/content-store";
import { isLocale } from "@/lib/i18n";
import { alternates } from "@/lib/seo";

// Pages added from the dashboard live at /<slug> (and /ar/<slug>).
// Any other unknown address inside a language renders that language's 404 (with the site's menu and footer).

async function load(params: PageProps<"/[lang]/[...rest]">["params"]) {
  const { lang, rest } = await params;
  if (!isLocale(lang) || rest.length !== 1) return null;
  const page = await getCustomPage(rest[0], lang);
  return page ? { lang, page } : null;
}

export async function generateMetadata({ params }: PageProps<"/[lang]/[...rest]">): Promise<Metadata> {
  const found = await load(params);
  if (!found) return {};
  const { lang, page } = found;
  return { title: page.title || page.navLabel, description: page.intro || undefined, alternates: alternates(lang, `/${page.slug}`) };
}

export default async function CustomPageView({ params }: PageProps<"/[lang]/[...rest]">) {
  const found = await load(params);
  if (!found) notFound();
  const { lang, page } = found;
  const paragraphs = (s: string) => s.split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean);

  return (
    <main>
      <PageHero label={page.label || page.navLabel} title={page.title || page.navLabel} shape={page.shape}>
        {paragraphs(page.intro).map((p, i) => <p key={i} className="body reveal">{p}</p>)}
      </PageHero>

      {page.sections.map((s, i) => (
        <section key={i} className={`split wrap${i % 2 ? " split--reverse" : ""}`}>
          <h2 className="heading-lg reveal">{s.title}</h2>
          <div className="split__copy">
            {paragraphs(s.text).map((p, j) => <p key={j} className="body reveal">{p}</p>)}
          </div>
        </section>
      ))}

      <CtaBand lang={lang} />
    </main>
  );
}
