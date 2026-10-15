import Link from "next/link";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { requireAdmin } from "@/lib/admin-session";
import { getServices } from "@/lib/content-store";

export const metadata = { title: "New project" };

export default async function NewProjectPage() {
  const { lang, t } = await requireAdmin();
  const services = await getServices(lang);
  return (
    <>
      <Link href="/admin/projects" className="ghost">← {t.projects.allProjects}</Link>
      <h1 className="heading admin-title">{t.projects.newTitle}</h1>
      <ProjectForm lang={lang} services={services.map((s) => ({ slug: s.slug, title: s.title }))} />
    </>
  );
}
