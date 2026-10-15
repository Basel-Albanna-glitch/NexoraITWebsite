import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { saveSettings } from "@/lib/content-store";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function PUT(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  if (body.email && !EMAIL_RE.test(String(body.email).trim())) {
    return NextResponse.json({ errors: { email: true } }, { status: 422 });
  }
  const settings = await saveSettings(body);
  revalidatePath("/[lang]", "layout");
  return NextResponse.json(settings);
}
