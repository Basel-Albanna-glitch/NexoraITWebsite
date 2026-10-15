import Link from "next/link";
import { ProjectList } from "@/components/admin/ProjectList";
import { requireAdmin } from "@/lib/admin-session";
import { getServices } from "@/lib/content-store";
import { getAllProjects } from "@/lib/projects-store";

export const metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const { lang, t } = await requireAdmin();
  const [projects, services] = await Promise.all([getAllProjects(), getServices(lang)]);
  return (
    <>
      <div className="page-title">
        <div>
          <h1 className="heading">{t.projects.title}</h1>
          <p className="admin-sub">{t.projects.count(projects.length)}</p>
        </div>
        <Link href="/admin/projects/new" className="btn btn--primary">{t.projects.add}</Link>
      </div>
      <ProjectList lang={lang} initial={projects} serviceTitles={Object.fromEntries(services.map((s) => [s.slug, s.title]))} />
    </>
  );
}
