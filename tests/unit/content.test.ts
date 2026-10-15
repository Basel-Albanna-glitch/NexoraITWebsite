import { describe, expect, it } from "vitest";
import { PAGE_SCHEMAS, SERVICE_SCHEMA, sanitize } from "@/lib/content";
import { href, stripLocale } from "@/lib/i18n";
import { localizeProject, type Project } from "@/lib/work";

describe("sanitize (dashboard text saves)", () => {
  it("keeps only schema fields, caps strings and drops empty rows", () => {
    const out = sanitize(
      { title: "x".repeat(500), evil: "<script>", features: [{ title: "A", text: "B" }, { title: "", text: "" }], highlights: [" a ", "", 5] },
      SERVICE_SCHEMA,
    );
    expect(out).not.toHaveProperty("evil");
    expect((out.title as string).length).toBe(60);
    expect(out.features).toEqual([{ title: "A", text: "B" }]);
    expect(out.highlights).toEqual(["a"]);
  });

  it("fills a missing nested group with empty values instead of crashing pages", () => {
    const out = sanitize({}, PAGE_SCHEMAS.home.fields) as { hero: { title: string }; approach: { steps: unknown[] } };
    expect(out.hero.title).toBe("");
    expect(out.approach.steps).toEqual([]);
  });
});

describe("language URLs", () => {
  it.each([
    ["en", "/", "/"], ["en", "/work", "/work"], ["ar", "/", "/ar"], ["ar", "/services/pos", "/ar/services/pos"],
  ] as const)("href(%s, %s) → %s", (lang, path, expected) => {
    expect(href(lang, path)).toBe(expected);
    expect(stripLocale(expected)).toBe(path);
  });

  it("does not strip look-alike prefixes", () => {
    expect(stripLocale("/arabic-page")).toBe("/arabic-page");
  });
});

describe("localizeProject", () => {
  const p: Project = {
    slug: "x", name: "Shop", kind: "Store", services: [], headline: "H", summary: "S", points: ["P"],
    videos: [{ src: "/media/v.mp4", title: "Demo" }], ar: { name: "متجر", kind: "", videoTitles: ["عرض"] },
    published: true, createdAt: "", updatedAt: "",
  };
  it("uses Arabic where filled and falls back to English where empty", () => {
    const a = localizeProject(p, "ar");
    expect(a.name).toBe("متجر");
    expect(a.kind).toBe("Store");
    expect(a.points).toEqual(["P"]);
    expect(a.videos?.[0].title).toBe("عرض");
  });
});
