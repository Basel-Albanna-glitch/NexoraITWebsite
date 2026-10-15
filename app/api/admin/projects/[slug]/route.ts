import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { validateDraft } from "@/lib/project-input";
import { deleteProject, getProject, removeUnusedUploads, updateProject } from "@/lib/projects-store";
import type { Project } from "@/lib/work";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ slug: string }> };
const unauthorized = () => NextResponse.json({ error: "Not signed in." }, { status: 401 });
const notFound = () => NextResponse.json({ error: "Project not found." }, { status: 404 });

const mediaOf = (p: Project | null | undefined) =>
  p ? [p.image?.src, ...(p.videos ?? []).flatMap((v) => [v.src, v.poster])].filter((x): x is string => !!x) : [];

/** Update a project (full replace of its editable fields). */
export async function PUT(req: Request, { params }: Ctx) {
  if (!(await isAdmin())) return unauthorized();
  const { slug } = await params;
  const before = await getProject(slug);
  if (!before) return notFound();

  const result = validateDraft(await req.json().catch(() => null));
  if (!result.ok) return NextResponse.json({ errors: result.errors }, { status: 422 });

  const project = await updateProject(slug, result.data);
  await removeUnusedUploads(mediaOf(before)); // files replaced in this edit
  revalidatePath("/[lang]", "layout");
  return NextResponse.json(project);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  if (!(await isAdmin())) return unauthorized();
  const removed = await deleteProject((await params).slug);
  if (!removed) return notFound();
  await removeUnusedUploads(mediaOf(removed));
  revalidatePath("/[lang]", "layout");
  return NextResponse.json({ ok: true });
}
