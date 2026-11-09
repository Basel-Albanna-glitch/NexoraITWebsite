import { randomBytes } from "crypto";
import { createWriteStream, promises as fs } from "fs";
import path from "path";
import { Readable, Transform } from "stream";
import { pipeline } from "stream/promises";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { MAX_UPLOAD_BYTES, UPLOAD_TYPES } from "@/lib/media";
import { UPLOAD_DIR } from "@/lib/projects-store";

export const runtime = "nodejs";

const TYPE_ERROR = "Use JPG, PNG, WebP or GIF images, or MP4, WebM or MOV videos.";
const usingBlob = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

/** Tells the dashboard how to upload: straight to Vercel Blob, or through this server to disk. */
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  return NextResponse.json({ mode: usingBlob() ? "blob" : "local" });
}

/**
 * Vercel Blob: the browser asks here for a short-lived upload token, then sends the file
 * directly to Blob storage (Vercel functions can't receive large request bodies).
 */
export async function POST(req: Request) {
  if (!usingBlob()) return NextResponse.json({ error: "Blob storage isn't set up." }, { status: 400 });
  const body = (await req.json().catch(() => null)) as HandleUploadBody | null;
  if (!body) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  try {
    const result = await handleUpload({
      request: req,
      body,
      onBeforeGenerateToken: async (pathname) => {
        if (!(await isAdmin())) throw new Error("Not signed in.");
        if (!/^uploads\/[A-Za-z0-9._-]+$/.test(pathname)) throw new Error("Invalid file name.");
        return {
          allowedContentTypes: Object.keys(UPLOAD_TYPES),
          maximumSizeInBytes: MAX_UPLOAD_BYTES,
          addRandomSuffix: true,
          cacheControlMaxAge: 31536000,
        };
      },
    });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: message === "Not signed in." ? 401 : 400 });
  }
}

/**
 * Local disk: PUT the raw file as the request body (Content-Type = the file's type). Streams straight
 * to disk, so large videos never sit in memory. Responds with { url } to store on the project.
 */
export async function PUT(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const type = (req.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  const ext = UPLOAD_TYPES[type];
  if (!ext) return NextResponse.json({ error: TYPE_ERROR }, { status: 415 });
  if (Number(req.headers.get("content-length") ?? 0) > MAX_UPLOAD_BYTES) {
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
      cb(bytes > MAX_UPLOAD_BYTES ? new Error("too large") : null, chunk);
    },
  });

  try {
    await pipeline(Readable.fromWeb(req.body as import("stream/web").ReadableStream), limit, createWriteStream(file));
  } catch {
    await fs.unlink(file).catch(() => {});
    return NextResponse.json({ error: bytes > MAX_UPLOAD_BYTES ? "File is larger than 300 MB." : "Upload failed." }, { status: 400 });
  }
  return NextResponse.json({ url: `/media/${name}` });
}
