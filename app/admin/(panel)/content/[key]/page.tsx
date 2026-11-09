import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentEditor } from "@/components/admin/ContentEditor";
import { requireAdmin } from "@/lib/admin-session";
import { CUSTOM_PAGE_SCHEMA, PAGE_SCHEMAS, SERVICE_SCHEMA, type PagesContent } from "@/lib/content";
import { getContent, localizePage } from "@/lib/content-store";
import { href } from "@/lib/i18n";

export const metadata = { title: "Edit text" };

// Where each section can be seen on the public site.
const PAGE_PATHS: Record<keyof PagesContent, string> = {
  home: "/", servicesPage: "/services", work: "/work", about: "/about", contact: "/contact", cta: "/services",
};

export default async function EditContent({ params }: PageProps<"/admin/content/[key]">) {
  const { lang, t } = await requireAdmin();
  const { key } = await params;
  const content = await getContent();

  let title: string, fields, initial, path: string;
  if (key.startsWith("service-")) {
    const s = content.services.find((x) => `service-${x.slug}` === key);
    if (!s) notFound();
    title = s[lang].title || s.en.title; fields = SERVICE_SCHEMA; initial = { en: s.en, ar: s.ar }; path = `/services/${s.slug}`;
  } else if (key.startsWith("page-")) {
    const p = (content.customPages ?? []).find((x) => `page-${x.slug}` === key);
    if (!p) notFound();
    title = localizePage(p, lang).navLabel; fields = CUSTOM_PAGE_SCHEMA; initial = { en: p.en, ar: p.ar }; path = `/${p.slug}`;
  } else if (key in PAGE_SCHEMAS) {
    const k = key as keyof PagesContent;
    title = PAGE_SCHEMAS[k].label[lang]; fields = PAGE_SCHEMAS[k].fields; initial = content.pages[k]; path = PAGE_PATHS[k];
  } else {
    notFound();
  }

  return (
    <>
      <Link href="/admin/content" className="ghost">← {t.content.title}</Link>
      <h1 className="heading admin-title">{title}</h1>
      <ContentEditor lang={lang} fields={fields} initial={initial as never} endpoint={`/api/admin/content/${key}`}
                     viewHref={{ en: href("en", path), ar: href("ar", path) }} />
    </>
  );
}
