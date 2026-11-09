import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { createCustomPage, createService, reorderContent, setCustomPagePublished } from "@/lib/content-store";

export const runtime = "nodejs";

const unauthorized = () => NextResponse.json({ error: "Not signed in." }, { status: 401 });

/** Add a page or a service. Body: { kind: "page" | "service", en: name, ar?: name, shape? }. */
export async function POST(req: Request) {
  if (!(await isAdmin())) return unauthorized();
  const body = await req.json().catch(() => null);
  if (!body || (body.kind !== "page" && body.kind !== "service")) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const created = body.kind === "page" ? await createCustomPage(body) : await createService(body);
  if (!created) return NextResponse.json({ error: "Give it an English name." }, { status: 422 });
  revalidatePath("/[lang]", "layout");
  return NextResponse.json({ key: `${body.kind}-${created.slug}`, slug: created.slug }, { status: 201 });
}

/**
 * Body { kind: "pages" | "services", order: slug[] } reorders;
 * body { kind: "page", slug, published: boolean } shows/hides a page.
 */
export async function PATCH(req: Request) {
  if (!(await isAdmin())) return unauthorized();
  const body = await req.json().catch(() => null);
  if (body && (body.kind === "pages" || body.kind === "services")
      && Array.isArray(body.order) && body.order.every((s: unknown) => typeof s === "string")) {
    const order = await reorderContent(body.kind, body.order);
    revalidatePath("/[lang]", "layout");
    return NextResponse.json({ order });
  }
  if (body?.kind === "page" && typeof body.slug === "string" && typeof body.published === "boolean") {
    if (!(await setCustomPagePublished(body.slug, body.published))) return NextResponse.json({ error: "Unknown page." }, { status: 404 });
    revalidatePath("/[lang]", "layout");
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Invalid request." }, { status: 400 });
}
