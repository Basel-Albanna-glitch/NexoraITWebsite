import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { requireAdmin } from "@/lib/admin-session";
import { getServices } from "@/lib/content-store";
import { getProject } from "@/lib/projects-store";

export const metadata = { title: "Edit project" };

export default async function EditProjectPage({ params }: PageProps<"/admin/projects/[slug]">) {
  const { lang, t } = await requireAdmin();
  const [project, services] = await Promise.all([getProject((await params).slug), getServices(lang)]);
  if (!project) notFound();
  return (
    <>
      <Link href="/admin/projects" className="ghost">← {t.projects.allProjects}</Link>
      <h1 className="heading admin-title">{lang === "ar" && project.ar?.name ? project.ar.name : project.name}</h1>
      <ProjectForm lang={lang} project={project} services={services.map((s) => ({ slug: s.slug, title: s.title }))} />
    </>
  );
}
