import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { PAGE_SCHEMAS, type PagesContent } from "@/lib/content";
import { savePage, saveService } from "@/lib/content-store";

export const runtime = "nodejs";

/** Save a page's text (key = home | servicesPage | work | about | contact | cta) or a service's (key = service-<slug>). */
export async function PUT(req: Request, { params }: { params: Promise<{ key: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const { key } = await params;
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  let saved;
  if (key.startsWith("service-")) {
    saved = await saveService(key.slice("service-".length), body);
    if (!saved) return NextResponse.json({ error: "Unknown service." }, { status: 404 });
    saved = { en: saved.en, ar: saved.ar };
  } else if (key in PAGE_SCHEMAS) {
    saved = await savePage(key as keyof PagesContent, body);
  } else {
    return NextResponse.json({ error: "Unknown section." }, { status: 404 });
  }

  revalidatePath("/[lang]", "layout"); // every public page, both languages
  return NextResponse.json(saved);
}
