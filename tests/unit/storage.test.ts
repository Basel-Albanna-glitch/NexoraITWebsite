import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { isBlobSrc, isMediaSrc, isUploadedSrc } from "@/lib/media";
import { validateDraft } from "@/lib/project-input";

vi.mock("server-only", () => ({}));

/** In-memory stand-in for Upstash Redis (values round-trip through JSON like the real client). */
function fakeRedis() {
  const data = new Map<string, string>();
  return {
    data,
    async get<T>(key: string) { const v = data.get(key); return v === undefined ? null : (JSON.parse(v) as T); },
    async set(key: string, value: unknown, opts?: { nx: true; px: number }) {
      if (opts?.nx && data.has(key)) return null;
      data.set(key, JSON.stringify(value));
      return "OK";
    },
    async eval(_script: string, keys: string[], args: string[]) {
      if (data.get(keys[0]) === JSON.stringify(args[0])) { data.delete(keys[0]); return 1; }
      return 0;
    },
  };
}

describe("media addresses", () => {
  const blob = "https://abc123.public.blob.vercel-storage.com/uploads/lq2-x9AbC.mp4";
  it.each([
    ["/media/abc-1.png", true], ["/work/poster.jpg", true], [blob, true],
    ["https://evil.example.com/uploads/x.png", false], ["/media/../secret", false],
    ["https://abc.public.blob.vercel-storage.com/other/x.png", false], ["javascript:alert(1)", false],
  ])("isMediaSrc(%s) → %s", (src, ok) => expect(isMediaSrc(src)).toBe(ok));

  it("knows uploaded files from bundled ones", () => {
    expect(isUploadedSrc("/media/a.png")).toBe(true);
    expect(isUploadedSrc(blob)).toBe(true);
    expect(isUploadedSrc("/work/a.png")).toBe(false);
    expect(isBlobSrc(blob)).toBe(true);
    expect(isBlobSrc("/media/a.png")).toBe(false);
  });

  it("lets projects use Blob uploads", () => {
    const base = { name: "Shop", kind: "Store", services: ["websites"], headline: "H", summary: "A summary long enough to pass.", points: [], published: true };
    expect(validateDraft({ ...base, image: { src: blob.replace(".mp4", ".png"), width: 4, height: 5 }, videos: [{ src: blob }] }).ok).toBe(true);
    expect(validateDraft({ ...base, videos: [{ src: "https://evil.example.com/v.mp4" }] }).ok).toBe(false);
  });
});

describe("jsonFile with Redis", () => {
  let dir: string;
  let jsonFile: typeof import("@/lib/json-file").jsonFile;

  beforeAll(async () => {
    dir = await fs.mkdtemp(path.join(os.tmpdir(), "nexora-store-"));
    await fs.writeFile(path.join(dir, "doc.json"), JSON.stringify({ n: 1, from: "file" }));
    process.env.DATA_DIR = dir;
    vi.resetModules();
    ({ jsonFile } = await import("@/lib/json-file"));
  });
  afterAll(async () => { await fs.rm(dir, { recursive: true, force: true }); });

  it("starts from the bundled file, then reads and writes Redis only", async () => {
    const redis = fakeRedis();
    const doc = jsonFile<{ n: number; from: string }>("doc.json", () => ({ n: 0, from: "fallback" }), redis);
    expect(await doc.read()).toEqual({ n: 1, from: "file" });

    await doc.mutate((d) => ({ next: { n: d.n + 1, from: "redis" }, result: null }));
    expect(JSON.parse(redis.data.get("nexorait:doc")!)).toEqual({ n: 2, from: "redis" });
    expect(await doc.read()).toEqual({ n: 2, from: "redis" });
    // the file on disk is never touched in Redis mode
    expect(JSON.parse(await fs.readFile(path.join(dir, "doc.json"), "utf8"))).toEqual({ n: 1, from: "file" });
    expect(redis.data.has("nexorait:doc:lock")).toBe(false); // lock released
  });

  it("uses the fallback when there's no file and nothing in Redis", async () => {
    const doc = jsonFile("missing.json", () => ({ empty: true }), fakeRedis());
    expect(await doc.read()).toEqual({ empty: true });
  });

  it("serialises concurrent saves so none are lost", async () => {
    const redis = fakeRedis();
    const doc = jsonFile<{ n: number }>("counter.json", () => ({ n: 0 }), redis);
    await Promise.all(Array.from({ length: 20 }, () => doc.mutate((d) => ({ next: { n: d.n + 1 }, result: null }))));
    expect(await doc.read()).toEqual({ n: 20 });
  });

  it("waits for another instance's lock before writing", async () => {
    const redis = fakeRedis();
    redis.data.set("nexorait:busy:lock", JSON.stringify("other-instance"));
    const doc = jsonFile<{ n: number }>("busy.json", () => ({ n: 0 }), redis);
    setTimeout(() => redis.data.delete("nexorait:busy:lock"), 120);
    const t = Date.now();
    await doc.mutate(() => ({ next: { n: 5 }, result: null }));
    expect(Date.now() - t).toBeGreaterThanOrEqual(100);
    expect(await doc.read()).toEqual({ n: 5 });
  });

  it("releases the lock when a save fails", async () => {
    const redis = fakeRedis();
    const doc = jsonFile<{ n: number }>("fail.json", () => ({ n: 0 }), redis);
    await expect(doc.mutate(() => { throw new Error("boom"); })).rejects.toThrow("boom");
    expect(redis.data.has("nexorait:fail:lock")).toBe(false);
    await doc.mutate(() => ({ next: { n: 1 }, result: null })); // still usable afterwards
    expect(await doc.read()).toEqual({ n: 1 });
  });
});
