import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { deleteMessage, updateMessage, type MessageStatus } from "@/lib/messages-store";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };
const STATUSES: MessageStatus[] = ["new", "read", "done"];

/** Change status: body { status: "new" | "read" | "done" }. */
export async function PATCH(req: Request, { params }: Ctx) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const { status } = await req.json().catch(() => ({}));
  if (!STATUSES.includes(status)) return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  const msg = await updateMessage((await params).id, { status });
  return msg ? NextResponse.json(msg) : NextResponse.json({ error: "Not found." }, { status: 404 });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const ok = await deleteMessage((await params).id);
  return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Not found." }, { status: 404 });
}
