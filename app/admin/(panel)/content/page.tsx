import Link from "next/link";
import { ContentList } from "@/components/admin/ContentLists";
import { requireAdmin } from "@/lib/admin-session";
import { PAGE_SCHEMAS } from "@/lib/content";
import { getContent, localizePage } from "@/lib/content-store";

export const metadata = { title: "Website text" };

export default async function ContentIndex() {
  const { lang, t } = await requireAdmin();
  const { services, customPages = [] } = await getContent();
  return (
    <>
      <div className="page-title">
        <div>
          <h1 className="heading">{t.content.title}</h1>
          <p className="admin-sub">{t.content.intro}</p>
        </div>
      </div>
      <h2 className="a-subhead">{t.content.pages}</h2>
      <ul className="ce-index">
        {Object.entries(PAGE_SCHEMAS).map(([key, s]) => (
          <li key={key}><Link href={`/admin/content/${key}`}><strong>{s.label[lang]}</strong><span>{t.common.edit} →</span></Link></li>
        ))}
      </ul>

      <h2 className="a-subhead">{t.content.myPages}</h2>
      <p className="admin-sub">{t.content.myPagesHint}</p>
      <ContentList lang={lang} kind="page"
                   initial={customPages.map((p) => ({ slug: p.slug, name: localizePage(p, lang).navLabel, published: p.published }))} />

      <h2 className="a-subhead">{t.content.services}</h2>
      <ContentList lang={lang} kind="service"
                   initial={services.map((s) => ({ slug: s.slug, name: s[lang].title || s.en.title || s.slug }))} />
    </>
  );
}
