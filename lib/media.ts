// Where uploaded pictures/videos live. Shared by server and browser code — no Node imports here.
//  - Local disk: "/media/<file>", served by app/media/[file]/route.ts
//  - Vercel Blob: "https://<store>.public.blob.vercel-storage.com/uploads/<file>"
//  - Bundled with the site: "/work/<file>" (in public/)

const LOCAL_RE = /^\/(media|work)\/[A-Za-z0-9._-]+$/;
const BLOB_RE = /^https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\/uploads\/[A-Za-z0-9._-]+$/;

/** Only our own media addresses are accepted on projects, never arbitrary URLs. */
export const isMediaSrc = (src: string) => LOCAL_RE.test(src) || BLOB_RE.test(src);

/** Uploaded from the dashboard (so it may be deleted when no project uses it), as opposed to bundled /work files. */
export const isUploadedSrc = (src: string) => src.startsWith("/media/") || BLOB_RE.test(src);

export const isBlobSrc = (src: string) => BLOB_RE.test(src);

export const UPLOAD_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif",
  "video/mp4": ".mp4", "video/webm": ".webm", "video/quicktime": ".mov",
};
export const MAX_UPLOAD_BYTES = 300 * 1024 * 1024; // 300 MB
