import { randomBytes } from "crypto";
import { createWriteStream, promises as fs } from "fs";
import path from "path";
import { Readable, Transform } from "stream";
import { pipeline } from "stream/promises";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { UPLOAD_DIR } from "@/lib/projects-store";

export const runtime = "nodejs";

const ALLOWED: Record<string, string> = {
  "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif",
  "video/mp4": ".mp4", "video/webm": ".webm", "video/quicktime": ".mov",
};
const MAX_BYTES = 300 * 1024 * 1024; // 300 MB

/**
 * PUT the raw file as the request body (Content-Type = the file's type). Streams straight to disk,
 * so large videos never sit in memory. Responds with { url } to store on the project.
 */
export async function PUT(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const type = (req.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  const ext = ALLOWED[type];
  if (!ext) return NextResponse.json({ error: "Use JPG, PNG, WebP or GIF images, or MP4, WebM or MOV videos." }, { status: 415 });
  if (Number(req.headers.get("content-length") ?? 0) > MAX_BYTES) {
    return NextResponse.json({ error: "File is larger than 300 MB." }, { status: 413 });
  }
  if (!req.body) return NextResponse.json({ error: "Empty upload." }, { status: 400 });

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const name = `${Date.now().toString(36)}-${randomBytes(6).toString("hex")}${ext}`;
  const file = path.join(/*turbopackIgnore: true*/ UPLOAD_DIR, name);

  let bytes = 0;
  const limit = new Transform({
    transform(chunk, _enc, cb) {
      bytes += chunk.length;
      cb(bytes > MAX_BYTES ? new Error("too large") : null, chunk);
    },
  });

  try {
    await pipeline(Readable.fromWeb(req.body as import("stream/web").ReadableStream), limit, createWriteStream(file));
  } catch {
    await fs.unlink(file).catch(() => {});
    return NextResponse.json({ error: bytes > MAX_BYTES ? "File is larger than 300 MB." : "Upload failed." }, { status: 400 });
  }
  return NextResponse.json({ url: `/media/${name}` });
}
