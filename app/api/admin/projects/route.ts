import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getContent } from "@/lib/content-store";
import { validateDraft } from "@/lib/project-input";
import { createProject, getAllProjects, reorderProjects } from "@/lib/projects-store";

export const runtime = "nodejs";

const unauthorized = () => NextResponse.json({ error: "Not signed in." }, { status: 401 });

export async function GET() {
  if (!(await isAdmin())) return unauthorized();
  return NextResponse.json(await getAllProjects());
}

/** Create a project. */
export async function POST(req: Request) {
  if (!(await isAdmin())) return unauthorized();
  const result = validateDraft(await req.json().catch(() => null), (await getContent()).services.map((s) => s.slug));
  if (!result.ok) return NextResponse.json({ errors: result.errors }, { status: 422 });
  const project = await createProject(result.data);
  revalidatePath("/[lang]", "layout");
  return NextResponse.json(project, { status: 201 });
}

/** Reorder: body { order: string[] } of slugs, first = shown first. */
export async function PATCH(req: Request) {
  if (!(await isAdmin())) return unauthorized();
  const { order } = await req.json().catch(() => ({ order: null }));
  if (!Array.isArray(order) || !order.every((s) => typeof s === "string")) {
    return NextResponse.json({ error: "Invalid order." }, { status: 400 });
  }
  const slugs = await reorderProjects(order);
  revalidatePath("/[lang]", "layout");
  return NextResponse.json({ order: slugs });
}
