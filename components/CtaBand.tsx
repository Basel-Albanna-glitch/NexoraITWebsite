import Link from "next/link";
import { getPage } from "@/lib/content-store";
import { getDictionary, href, type Locale } from "@/lib/i18n";

/** Closing call-to-action. Defaults come from the dashboard ("Call-to-action (all pages)"); pages may override. */
export async function CtaBand({ lang, label, title, text }: { lang: Locale; label?: string; title?: string; text?: string }) {
  const c = await getPage("cta", lang);
  const t = getDictionary(lang);
  return (
    <section className="cta wrap">
      <p className="label reveal">{label || c.label}</p>
      <h2 className="display reveal">{title || c.title}</h2>
      <div className="cta__row reveal">
        <p className="body body--muted">{text || c.text}</p>
        <Link href={href(lang, "/contact")} className="btn btn--primary">{t.cta.book}</Link>
      </div>
    </section>
  );
}
