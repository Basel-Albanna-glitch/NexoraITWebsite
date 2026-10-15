import Link from "next/link";
import { requireAdmin } from "@/lib/admin-session";
import { PAGE_SCHEMAS } from "@/lib/content";
import { getContent } from "@/lib/content-store";

export const metadata = { title: "Website text" };

export default async function ContentIndex() {
  const { lang, t } = await requireAdmin();
  const { services } = await getContent();
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
      <h2 className="a-subhead">{t.content.services}</h2>
      <ul className="ce-index">
        {services.map((s) => (
          <li key={s.slug}><Link href={`/admin/content/service-${s.slug}`}><strong>{s[lang].title}</strong><span>{t.common.edit} →</span></Link></li>
        ))}
      </ul>
    </>
  );
}
