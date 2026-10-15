import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContactForm } from "@/components/ContactForm";
import { SocialIcons } from "@/components/SocialIcons";
import { WorkShowcase } from "@/components/WorkShowcase";
import { getPage, getSettings } from "@/lib/content-store";
import { getDictionary, isLocale } from "@/lib/i18n";
import { alternates } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[lang]/contact">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang);
  return { title: t.meta.contact, description: t.service.ctaText, alternates: alternates(lang, "/contact") };
}

export default async function ContactPage({ params }: PageProps<"/[lang]/contact">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);
  const [c, s] = await Promise.all([getPage("contact", lang), getSettings()]);
  const hasSocial = Object.values(s.social).some(Boolean);

  return (
    <main>
      <section className="wrap page-head">
        <p className="label reveal">{c.label}</p>
        <h1 className="display reveal">{c.title}</h1>
      </section>

      <section className="wrap contact-grid">
        <div className="contact-info">
          <dl className="info reveal">
            {s.email && <div><dt>{t.contact.email}</dt><dd><a href={`mailto:${s.email}`} dir="ltr">{s.email}</a></dd></div>}
            {s.phone && <div><dt>{t.contact.phone}</dt><dd><a href={`tel:${s.phone.replace(/\s/g, "")}`} dir="ltr">{s.phone}</a></dd></div>}
            {s.whatsapp && <div><dt>{t.contact.whatsapp}</dt><dd><a href={`https://wa.me/${s.whatsapp}`} target="_blank" rel="noopener noreferrer">{t.contact.chat}</a></dd></div>}
            {s.location[lang] && <div><dt>{t.contact.location}</dt><dd>{s.location[lang]}</dd></div>}
            {hasSocial && <div><dt>{t.contact.follow}</dt><dd><SocialIcons social={s.social} label={t.social} className="social--lg" /></dd></div>}
            {s.hours[lang] && <div><dt>{t.contact.hours}</dt><dd>{s.hours[lang]}</dd></div>}
          </dl>
        </div>
        <ContactForm lang={lang} t={t.form} />
      </section>

      <section className="split wrap">
        <h2 className="heading-lg reveal">{c.nextTitle}</h2>
        <div className="split__copy">
          <ol className="steps">
            {c.steps.map((st) => (
              <li key={st.title} className="reveal"><span>{st.title}</span>{st.text}</li>
            ))}
          </ol>
        </div>
      </section>

      <WorkShowcase lang={lang} />
    </main>
  );
}
