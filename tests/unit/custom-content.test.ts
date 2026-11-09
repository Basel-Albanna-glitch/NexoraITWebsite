import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { CUSTOM_PAGE_SCHEMA, RESERVED_SLUGS, sanitize, toSlug, uniqueSlug } from "@/lib/content";
import { validateDraft } from "@/lib/project-input";

vi.mock("server-only", () => ({}));

describe("slugs for added pages and services", () => {
  it("turns names into clean Latin slugs", () => {
    expect(toSlug("Our Pricing!")).toBe("our-pricing");
    expect(toSlug("  Café  Menu ")).toBe("cafe-menu");
    expect(toSlug("الأسعار")).toBe("");
  });

  it("never reuses a taken or reserved slug", () => {
    expect(uniqueSlug("About", RESERVED_SLUGS, "page")).toBe("about-2");
    expect(uniqueSlug("Pricing", ["pricing", "pricing-2"], "page")).toBe("pricing-3");
    expect(uniqueSlug("Pricing", [], "page")).toBe("pricing");
  });

  it("falls back to a generated slug for Arabic-only names", () => {
    expect(uniqueSlug("الأسعار", [], "page")).toMatch(/^page-[a-z0-9]+$/);
  });
});

describe("custom page text", () => {
  it("keeps only schema fields and caps the tab name", () => {
    const out = sanitize({ navLabel: "x".repeat(100), evil: 1, sections: [{ title: "A", text: "B" }, { title: "", text: "" }] }, CUSTOM_PAGE_SCHEMA);
    expect(out).not.toHaveProperty("evil");
    expect((out.navLabel as string).length).toBe(40);
    expect(out.sections).toEqual([{ title: "A", text: "B" }]);
    expect(out.intro).toBe("");
  });
});

describe("validateDraft with services added in the dashboard", () => {
  const base = { name: "Shop", kind: "Store", headline: "H", summary: "A summary long enough to pass.", points: [], published: true };
  it("accepts a new service slug when it is in the current list", () => {
    expect(validateDraft({ ...base, services: ["cloud"] }, ["websites", "cloud"]).ok).toBe(true);
  });
  it("still rejects slugs that aren't services", () => {
    expect(validateDraft({ ...base, services: ["cloud"] }).ok).toBe(false);
  });
});

describe("content store: pages and services", () => {
  let dir: string;
  let store: typeof import("@/lib/content-store");

  beforeAll(async () => {
    dir = await fs.mkdtemp(path.join(os.tmpdir(), "nexora-content-"));
    await fs.copyFile(path.join(__dirname, "../../data/content.json"), path.join(dir, "content.json"));
    process.env.DATA_DIR = dir;
    vi.resetModules();
    store = await import("@/lib/content-store");
  });
  afterAll(async () => { await fs.rm(dir, { recursive: true, force: true }); });

  const read = async () => JSON.parse(await fs.readFile(path.join(dir, "content.json"), "utf8"));

  it("adds a page hidden, then shows it in the menu once published", async () => {
    const p = await store.createCustomPage({ en: "Pricing", ar: "الأسعار", shape: "nope" });
    expect(p).toMatchObject({ slug: "pricing", published: false, shape: "lattice" });
    expect((await read()).customPages.map((x: { slug: string }) => x.slug)).toContain("pricing");
    expect(await store.setCustomPagePublished("pricing", true)).toBe(true);
    expect(await store.setCustomPagePublished("missing", true)).toBe(false);
  });

  it("rejects a page without an English name", async () => {
    expect(await store.createCustomPage({ en: "  ", ar: "اسم" })).toBeNull();
  });

  it("saves page text and falls back to English for empty Arabic fields", async () => {
    await store.saveCustomPage("pricing", {
      en: { navLabel: "Pricing", title: "Clear prices", intro: "Hi", sections: [{ title: "Basic", text: "100" }] },
      ar: { navLabel: "الأسعار", title: "", intro: "", sections: [] },
    });
    const c = await read();
    const ar = store.localizePage(c.customPages[0], "ar");
    expect(ar).toMatchObject({ navLabel: "الأسعار", title: "Clear prices", sections: [{ title: "Basic", text: "100" }] });
    expect(await store.saveCustomPage("missing", { en: {} })).toBeNull();
  });

  it("adds, reorders and deletes services", async () => {
    const s = await store.createService({ en: "Cloud hosting", ar: "استضافة" });
    expect(s).toMatchObject({ slug: "cloud-hosting", shape: "globe" });
    expect(s!.ar.title).toBe("استضافة");
    expect((s as unknown as Record<string, unknown>).features).toBeUndefined();
    expect(s!.en.features).toEqual([]);
    const order = await store.reorderContent("services", ["cloud-hosting"]);
    expect(order[0]).toBe("cloud-hosting");
    expect(await store.deleteService("cloud-hosting")).toBe(true);
    expect(await store.deleteService("cloud-hosting")).toBe(false);
  });

  it("deletes pages", async () => {
    expect(await store.deleteCustomPage("pricing")).toBe(true);
    expect(await store.deleteCustomPage("pricing")).toBe(false);
  });
});
