import { createReadStream, promises as fs } from "fs";
import path from "path";
import { Readable } from "stream";
import { UPLOAD_DIR } from "@/lib/projects-store";

// Serves files uploaded from the dashboard. Supports Range requests so videos can seek (Safari requires it).
const TYPES: Record<string, string> = {
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".gif": "image/gif",
  ".mp4": "video/mp4", ".webm": "video/webm", ".mov": "video/quicktime",
};

export async function GET(req: Request, { params }: { params: Promise<{ file: string }> }) {
  const name = path.basename((await params).file); // basename: no ../ escapes
  const type = TYPES[path.extname(name).toLowerCase()];
  if (!type) return new Response("Not found", { status: 404 });

  const file = path.join(/*turbopackIgnore: true*/ UPLOAD_DIR, name);
  let size: number;
  try {
    size = (await fs.stat(file)).size;
  } catch {
    return new Response("Not found", { status: 404 });
  }

  // File names are random and never reused, so they can be cached forever.
  const headers: Record<string, string> = {
    "Content-Type": type,
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=31536000, immutable",
  };

  const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.get("range") ?? "");
  if (range) {
    let start = range[1] ? Number(range[1]) : NaN;
    let end = range[2] ? Number(range[2]) : size - 1;
    if (Number.isNaN(start)) { start = size - end; end = size - 1; } // suffix range: last N bytes
    end = Math.min(end, size - 1);
    if (start < 0 || start > end) {
      return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
    }
    const stream = Readable.toWeb(createReadStream(file, { start, end })) as ReadableStream;
    return new Response(stream, {
      status: 206,
      headers: { ...headers, "Content-Range": `bytes ${start}-${end}/${size}`, "Content-Length": String(end - start + 1) },
    });
  }

  const stream = Readable.toWeb(createReadStream(file)) as ReadableStream;
  return new Response(stream, { headers: { ...headers, "Content-Length": String(size) } });
}
