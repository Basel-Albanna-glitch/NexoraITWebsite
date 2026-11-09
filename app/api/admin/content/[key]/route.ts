import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { PAGE_SCHEMAS, type PagesContent } from "@/lib/content";
import { deleteCustomPage, deleteService, saveCustomPage, savePage, saveService } from "@/lib/content-store";
import { getAllProjects } from "@/lib/projects-store";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ key: string }> };
const unauthorized = () => NextResponse.json({ error: "Not signed in." }, { status: 401 });

/**
 * Save text. key = home | servicesPage | work | about | contact | cta (fixed pages),
 * service-<slug> (a service) or page-<slug> (a page added from the dashboard).
 */
export async function PUT(req: Request, { params }: Ctx) {
  if (!(await isAdmin())) return unauthorized();
  const { key } = await params;
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  let saved;
  if (key.startsWith("service-")) {
    const s = await saveService(key.slice("service-".length), body);
    if (!s) return NextResponse.json({ error: "Unknown service." }, { status: 404 });
    saved = { en: s.en, ar: s.ar };
  } else if (key.startsWith("page-")) {
    const p = await saveCustomPage(key.slice("page-".length), body);
    if (!p) return NextResponse.json({ error: "Unknown page." }, { status: 404 });
    saved = { en: p.en, ar: p.ar };
  } else if (key in PAGE_SCHEMAS) {
    saved = await savePage(key as keyof PagesContent, body);
  } else {
    return NextResponse.json({ error: "Unknown section." }, { status: 404 });
  }

  revalidatePath("/[lang]", "layout"); // every public page, both languages
  return NextResponse.json(saved);
}

/** Delete a dashboard-added page, or a service no project uses any more. Fixed pages can't be deleted. */
export async function DELETE(_req: Request, { params }: Ctx) {
  if (!(await isAdmin())) return unauthorized();
  const { key } = await params;

  if (key.startsWith("page-")) {
    if (!(await deleteCustomPage(key.slice("page-".length)))) return NextResponse.json({ error: "Unknown page." }, { status: 404 });
  } else if (key.startsWith("service-")) {
    const slug = key.slice("service-".length);
    const used = (await getAllProjects()).filter((p) => p.services.includes(slug)).map((p) => p.name);
    if (used.length) return NextResponse.json({ error: "in-use", projects: used }, { status: 409 });
    if (!(await deleteService(slug))) return NextResponse.json({ error: "Unknown service." }, { status: 404 });
  } else {
    return NextResponse.json({ error: "This section can't be deleted." }, { status: 400 });
  }

  revalidatePath("/[lang]", "layout");
  return NextResponse.json({ ok: true });
}
